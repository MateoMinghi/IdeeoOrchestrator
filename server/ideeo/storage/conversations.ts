import { randomUUID } from 'node:crypto';
import type postgres from 'postgres';
import type { ConversationHistory, ConversationView, ConversationMessage, TurnView } from '../../../shared/ideeo/conversations.ts';
import { isFreeFormMessage, permittedText, permittedProjection, secretValues, TEXT_POLICY, type ModelProjection } from '../text-policy.ts';
import type { StorageConfiguration } from './config.ts';
import { createContentProtection, type CallerScope, type ContentBinding } from './crypto.ts';
import { openStorageDatabase, verifyRuntimeRole } from './database.ts';
import { fixtureAnswers, fixturePrompts } from '../inference-policy.ts';
import type { ConversationGenerator, InferenceKind } from '../inference.ts';

export class ConversationError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) { super(code); this.status = status; this.code = code; }
}
type ConversationRow = { id: string; created_at: Date; expires_at: Date; replay_expires_at: Date; next_sequence: number };
type TurnRow = { id: string; conversation_id: string; sequence: number; fingerprint: string; user_content: unknown;
  answer_content: unknown; created_at: Date; expires_at: Date; event_id: string };
type Authorize = () => Promise<void>;
const notFound = () => new ConversationError(404, 'not_found');
export function assertContentLive(expiresAt: string) {
  if (Date.parse(expiresAt) <= Date.now()) throw new ConversationError(410, 'conversation_expired');
}
const view = (row: ConversationRow): ConversationView => ({ conversation_id: row.id, created_at: row.created_at.toISOString(), expires_at: row.expires_at.toISOString() });

export async function createConversationStore(config: StorageConfiguration, tenants: readonly string[], secrets: Readonly<Record<string, string | undefined>>) {
  const protection = createContentProtection(config, tenants, secrets);
  const forbidden = secretValues(secrets);
  const sql = openStorageDatabase(secrets[config.databaseEnv], 'ideeo_runtime');
  try { await verifyRuntimeRole(sql); } catch (error) { await sql.end({ timeout: 2 }); throw error; }
  const accounting = openStorageDatabase(secrets[config.databaseEnv], 'ideeo_runtime');

  async function scoped<T>(scope: CallerScope, signal: AbortSignal, work: (tx: postgres.TransactionSql) => Promise<T>, snapshot = false, client = sql): Promise<T> {
    signal.throwIfAborted();
    return await client.begin(snapshot ? 'isolation level repeatable read' : 'isolation level read committed', async tx => {
      await tx`select set_config('ideeo.caller', ${JSON.stringify(scope)}, true)`;
      signal.throwIfAborted();
      const result = await work(tx);
      signal.throwIfAborted();
      return result;
    }) as T;
  }
  async function lock(tx: postgres.TransactionSql, key: string) {
    const [row] = await tx`select pg_try_advisory_xact_lock(hashtextextended(${key}, 0)) as acquired`;
    if (!row.acquired) throw new ConversationError(409, 'request_in_progress');
  }
  async function conversation(tx: postgres.TransactionSql, id: string): Promise<ConversationRow> {
    const [row] = await tx<ConversationRow[]>`select id, created_at, expires_at, replay_expires_at, next_sequence from ideeo.conversations where id = ${id}`;
    if (!row) throw notFound();
    assertContentLive(row.expires_at.toISOString());
    return row;
  }
  function decodedTurn(scope: CallerScope, row: TurnRow): { turn: TurnView; projection?: ModelProjection } {
    assertContentLive(row.expires_at.toISOString());
    if (!row.user_content || !row.answer_content) throw new ConversationError(410, 'conversation_expired');
    const binding: ContentBinding = { scope, conversationId: row.conversation_id, turnId: row.id, sequence: row.sequence, expiresAt: row.expires_at.toISOString() };
    const stored = protection.decrypt(binding, 'user', row.user_content);
    const projected = stored && typeof stored === 'object' && 'message' in stored && 'projection' in stored ? stored : undefined;
    const user = projected ? projected.message : stored;
    const answer = protection.decrypt(binding, 'answer', row.answer_content);
    if (!(typeof user === 'string' && Object.hasOwn(fixturePrompts,user)) && !isFreeFormMessage(user) || !answer || typeof answer !== 'object'
      || !('kind' in answer) || !['synthetic_storage','openmaus_fixture','openmaus_openai_evaluation','free_form_fixture','free_form_openai_evaluation','free_form_gemini_evaluation'].includes(String(answer.kind)) || !('text' in answer) || typeof answer.text !== 'string'
      || Object.keys(answer).length !== 2 || answer.text.length > 2000) throw new Error('Invalid stored turn');
    if (isFreeFormMessage(user)) {
      if (!String(answer.kind).startsWith('free_form_') || !projected || !permittedProjection(projected.projection)
        || projected.projection.user !== user.text || projected.projection.assistant !== answer.text) throw new Error('Invalid inference projection');
    } else if (String(answer.kind).startsWith('free_form_') || answer.kind !== 'synthetic_storage' && !fixtureAnswers.has(answer.text)) throw new Error('Invalid inference projection');
    return { turn: { turn_id: row.id, conversation_id: row.conversation_id, event_id: row.event_id, sequence: row.sequence,
      status: 'completed', message: user as ConversationMessage, answer: { kind: answer.kind as TurnView['answer']['kind'], text: answer.text }, created_at: row.created_at.toISOString(), expires_at: row.expires_at.toISOString() },
      ...(projected && permittedProjection(projected.projection) ? {projection:projected.projection} : {}) };
  }
  const turnView = (scope: CallerScope, row: TurnRow) => decodedTurn(scope,row).turn;
  return Object.freeze({
    async create(scope: CallerScope, key: string, authorize: Authorize, signal: AbortSignal): Promise<ConversationView> {
      const keyHash = protection.fingerprint(scope, 'create-key', key);
      return scoped(scope, signal, async tx => {
        await lock(tx, keyHash);
        const [prior] = await tx<ConversationRow[]>`select * from ideeo.conversations where creation_key = ${keyHash}`;
        if (prior) { assertContentLive(prior.expires_at.toISOString()); await authorize(); return view(prior); }
        const [clock] = await tx`select clock_timestamp() as now`;
        const now: Date = clock.now, expires = new Date(now.getTime() + config.contentTtlSeconds * 1000), replay = new Date(now.getTime() + config.replayTtlSeconds * 1000);
        const [row] = await tx<ConversationRow[]>`insert into ideeo.conversations (scope,id,creation_key,created_at,expires_at,replay_expires_at)
          values (${tx.json(scope)},${randomUUID()},${keyHash},${now},${expires},${replay}) returning *`;
        await authorize();
        return view(row);
      });
    },
    async append(scope: CallerScope, id: string, key: string, message: ConversationMessage, authorize: Authorize, signal: AbortSignal,
      generator?: ConversationGenerator, authorizeInference?: (kind: InferenceKind, permission?: string) => Promise<void>, workspace = false): Promise<TurnView> {
      const freeForm = isFreeFormMessage(message);
      const excluded = [...forbidden,...Object.values(scope),id];
      if (freeForm) {
        if (!generator || !permittedText(message.text,1500,excluded)) throw new ConversationError(422,'content_not_permitted');
      } else if (typeof message !== 'string' || !Object.hasOwn(fixturePrompts,message) || !generator && message !== 'synthetic.hello' && message !== 'synthetic.follow-up') throw new ConversationError(422, 'synthetic_input_required');
      const keyHash = protection.fingerprint(scope, 'turn-key', key);
      const fingerprint = protection.fingerprint(scope, 'turn-input', { conversation_id: id, message });
      const row = await scoped(scope, signal, async tx => {
        await lock(tx, keyHash);
        const [prior] = await tx<TurnRow[]>`select t.*, o.id as event_id from ideeo.turns t join ideeo.outbox o on o.scope=t.scope and o.turn_id=t.id where t.idempotency_key=${keyHash}`;
        if (prior) {
          if (prior.fingerprint !== fingerprint) throw new ConversationError(409, 'idempotency_conflict');
          assertContentLive(prior.expires_at.toISOString());
          await authorize(); return prior;
        }
        await lock(tx, protection.fingerprint(scope, 'conversation-lock', id));
        const parent = await conversation(tx, id);
        if (parent.next_sequence > 1000) throw new ConversationError(409, 'conversation_limit');
        let generated: TurnView['answer'] = { kind: 'synthetic_storage', text: message === 'synthetic.hello' ? 'Synthetic greeting recorded.' : 'Synthetic follow-up recorded.' };
        if (generator) {
          if (!authorizeInference) throw new Error('Missing inference authority');
          const previous = await tx<TurnRow[]>`select t.*,o.id as event_id from ideeo.turns t join ideeo.outbox o on o.scope=t.scope and o.turn_id=t.id
            where t.conversation_id=${id} order by t.sequence desc limit 20`;
          const executionId=randomUUID();
          generated = await generator({ message, signal, forbidden: excluded, execution:{scope,conversationId:id}, history: previous.reverse().map(p => {const decoded=decodedTurn(scope,p);return {...decoded.turn,projection:decoded.projection};}), authorize: authorizeInference,
            claimTools:()=>scoped(scope,signal,async ledger=>{
              const [claim]=await ledger`select ideeo.claim_tool_execution(${ledger.json(scope)},${keyHash},${id},${fingerprint},${executionId}) as claimed`;
              if(!claim.claimed) throw new ConversationError(409,'capability_reconciliation_required');
            },false,accounting),
            checkpoint: async () => { signal.throwIfAborted(); await tx`select 1`; assertContentLive(parent.expires_at.toISOString()); },
            reserve: kind => scoped(scope,signal,async ledger => {
              const [reserved] = workspace
                ? await ledger`select * from ideeo.reserve_workspace_inference(${ledger.json(scope)},${keyHash},${id},${fingerprint},${kind})`
                : await ledger`select * from ideeo.reserve_inference(${ledger.json(scope)},${keyHash},${id},${fingerprint},${kind})`;
              if (reserved.code !== 'reserved') throw new ConversationError(reserved.code === 'conversation_expired' ? 410 : 409, reserved.code);
              return {id: String(reserved.attempt_id), deadline: reserved.deadline as Date};
            },false,accounting),
            finish: (attemptId,usage) => scoped(scope,signal,async ledger => {
              const [finished] = await ledger`select ideeo.finish_inference(${ledger.json(scope)},${attemptId},${usage?.input ?? null},${usage?.output ?? null}) as ok`;
              if (!finished.ok) throw new Error('Inference settlement failed');
            },false,accounting),
          });
          if (freeForm ? !['free_form_fixture','free_form_openai_evaluation','free_form_gemini_evaluation'].includes(generated.kind) || !permittedText(generated.text,2000,excluded)
            : !['openmaus_fixture','openmaus_openai_evaluation'].includes(generated.kind) || !fixtureAnswers.has(generated.text)) throw new Error('Unqualified model answer');
        }
        const turnId = randomUUID(), eventId = randomUUID();
        const binding = { scope, conversationId: id, turnId, sequence: parent.next_sequence, expiresAt: parent.expires_at.toISOString() };
        const user = protection.encrypt(binding, 'user', freeForm ? {message,projection:{policy:TEXT_POLICY,user:message.text,assistant:generated.text}} : message);
        const answer = protection.encrypt(binding, 'answer', generated);
        const [saved] = await tx<TurnRow[]>`insert into ideeo.turns (scope,id,conversation_id,idempotency_key,fingerprint,sequence,status,user_content,answer_content,created_at,expires_at)
          values (${tx.json(scope)},${turnId},${id},${keyHash},${fingerprint},${parent.next_sequence},'completed',${tx.json(user)},${tx.json(answer)},clock_timestamp(),${parent.expires_at}) returning *`;
        await tx`insert into ideeo.outbox(scope,id,turn_id,conversation_id,sequence,kind,created_at)
          values (${tx.json(scope)},${eventId},${turnId},${id},${parent.next_sequence},'answer.committed',${saved.created_at})`;
        await tx`update ideeo.conversations set next_sequence = next_sequence + 1 where id = ${id}`;
        await authorize();
        assertContentLive(parent.expires_at.toISOString());
        return { ...saved, event_id: eventId };
      });
      return turnView(scope, row);
    },
    async history(scope: CallerScope, id: string, after: number, limit: number, signal: AbortSignal): Promise<ConversationHistory> {
      const result = await scoped(scope, signal, async tx => {
        const parent = await conversation(tx, id);
        const rows = await tx<TurnRow[]>`select t.*, o.id as event_id from ideeo.turns t join ideeo.outbox o on o.scope=t.scope and o.turn_id=t.id
          where t.conversation_id=${id} and t.sequence>${after} order by t.sequence limit ${limit + 1}`;
        return { parent, rows };
      }, true);
      const turns = result.rows.slice(0, limit).map(row => turnView(scope, row));
      return { ...view(result.parent), turns, next_after: result.rows.length > limit ? turns.at(-1)!.sequence : null };
    },
    close: async () => { await Promise.all([sql.end({ timeout: 2 }),accounting.end({ timeout: 2 })]); },
  });
}
