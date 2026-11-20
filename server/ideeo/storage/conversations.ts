import { randomUUID } from 'node:crypto';
import type postgres from 'postgres';
import type { BookingCheck, ConversationHistory, ConversationView, ConversationMessage, TurnStatus, TurnView } from '../../../shared/ideeo/conversations.ts';
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
  async function operation(tx: postgres.TransactionSql, keyHash: string) {
    const [op] = await tx`select conversation_id, fingerprint, execution_id from ideeo.inference_operations where request_key=${keyHash}`;
    return op;
  }
  type CheckRow = {attempt_id:string;request_key:string;receipt:unknown};
  async function bookingRows(tx:postgres.TransactionSql, id:string, attemptId?:string) {
    return tx<CheckRow[]>`select b.attempt_id,a.request_key,b.receipt from ideeo.booking_checks b
      join ideeo.inference_attempts a on (a.scope,a.id)=(b.scope,b.attempt_id)
      join ideeo.inference_operations o on (o.scope,o.request_key)=(a.scope,a.request_key)
      where o.conversation_id=${id} and not exists(select 1 from ideeo.turns t where t.scope=o.scope and t.idempotency_key=o.request_key)
      ${attemptId ? tx`and b.attempt_id=${attemptId}` : tx``} order by a.created_at,b.attempt_id`;
  }
  function bookingView(scope:CallerScope,parent:ConversationRow,row:CheckRow):BookingCheck {
    if(!row.receipt) return {attempt_id:row.attempt_id,status:'pending'};
    const binding={scope,conversationId:parent.id,turnId:row.attempt_id,sequence:0,expiresAt:parent.expires_at.toISOString()};
    const confirmation=protection.decrypt(binding,'booking-receipt',row.receipt);
    if(confirmation===null) return {attempt_id:row.attempt_id,status:'unable_to_verify'};
    if(typeof confirmation!=='string' || !/^WILLOW-[A-Z]{8}$/.test(confirmation)) throw new Error('Invalid booking receipt');
    return {attempt_id:row.attempt_id,status:'verified',confirmation};
  }
  return Object.freeze({
    async checkBooking(scope:CallerScope,id:string,attemptId:string,signal:AbortSignal,authorize:Authorize,
      lookup:(id:string,original:string,attempt:{id:string;deadline:Date},signal:AbortSignal)=>Promise<string|null>) {
      return scoped(scope,signal,async tx=>{
        const parent=await conversation(tx,id);
        const [marker]=await bookingRows(tx,id,attemptId);
        if(!marker) throw notFound();
        await lock(tx,marker.request_key);
        const [current]=await bookingRows(tx,id,attemptId);
        if(!current) throw notFound();
        await authorize();
        if(current.receipt) return {...view(parent),booking_check:bookingView(scope,parent,current)};
        const key=protection.fingerprint(scope,'booking-check',attemptId);
        const fingerprint=protection.fingerprint(scope,'booking-check-input',[id,attemptId]);
        const attempt=await scoped(scope,signal,async ledger=>{
          const [reserved]=await ledger`select * from ideeo.reserve_workspace_inference(${ledger.json(scope)},${key},${id},${fingerprint},'tool')`;
          if(reserved.code!=='reserved') throw new ConversationError(reserved.code==='conversation_expired'?410:409,reserved.code);
          return {id:String(reserved.attempt_id),deadline:reserved.deadline as Date};
        },false,accounting);
        await authorize();
        const confirmation=await lookup(id,attemptId,attempt,signal);
        await authorize();
        assertContentLive(parent.expires_at.toISOString());
        if(attempt.deadline.getTime()<=Date.now()) throw new ConversationError(409,'inference_expired');
        const binding={scope,conversationId:id,turnId:attemptId,sequence:0,expiresAt:parent.expires_at.toISOString()};
        const receipt=protection.encrypt(binding,'booking-receipt',confirmation);
        await tx`update ideeo.booking_checks set receipt=${tx.json(receipt)} where attempt_id=${attemptId}`;
        const [settled]=await tx`select ideeo.finish_inference(${tx.json(scope)},${attempt.id},null,null) as ok`;
        if(!settled.ok) throw new Error('Booking check settlement failed');
        return {...view(parent),booking_check:bookingView(scope,parent,{...current,receipt})};
      });
    },
    async turnStatus(scope: CallerScope, id: string, key: string, signal: AbortSignal): Promise<TurnStatus> {
      const keyHash = protection.fingerprint(scope, 'turn-key', key);
      return scoped(scope, signal, async (tx): Promise<TurnStatus> => {
        const parent = await conversation(tx, id);
        await lock(tx, keyHash);
        const [turn] = await tx`select id from ideeo.turns where conversation_id=${id} and idempotency_key=${keyHash}`;
        if (turn) return { ...view(parent), status: 'committed', turn_id: String(turn.id) };
        const op = await operation(tx, keyHash);
        const claimed = op?.conversation_id === id && op.execution_id != null;
        return { ...view(parent), status: claimed ? 'reconciliation_required' : 'uncommitted' };
      });
    },
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
        const op = await operation(tx, keyHash);
        if (op && (op.conversation_id !== id || op.fingerprint !== fingerprint)) throw new ConversationError(409, 'idempotency_conflict');
        if (op?.execution_id) throw new ConversationError(409, 'capability_reconciliation_required');
        let generated: TurnView['answer'] = { kind: 'synthetic_storage', text: message === 'synthetic.hello' ? 'Synthetic greeting recorded.' : 'Synthetic follow-up recorded.' };
        if (generator) {
          if (!authorizeInference) throw new Error('Missing inference authority');
          const previous = await tx<TurnRow[]>`select t.*,o.id as event_id from ideeo.turns t join ideeo.outbox o on o.scope=t.scope and o.turn_id=t.id
            where t.conversation_id=${id} order by t.sequence desc limit 20`;
          const executionId=randomUUID();
          generated = await generator({ message, signal, forbidden: excluded, execution:{scope,conversationId:id}, history: previous.reverse().map(p => {const decoded=decodedTurn(scope,p);return {...decoded.turn,projection:decoded.projection};}), authorize: authorizeInference,
            claimTools:bookingAttemptId=>scoped(scope,signal,async ledger=>{
              const [claim]=await ledger`select ideeo.claim_tool_execution(${ledger.json(scope)},${keyHash},${id},${fingerprint},${executionId}) as claimed`;
              if(!claim.claimed) throw new ConversationError(409,'capability_reconciliation_required');
              if(bookingAttemptId) await ledger`insert into ideeo.booking_checks(scope,attempt_id) values (${ledger.json(scope)},${bookingAttemptId})`;
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
        if (generator) {
          const [op] = await tx`select deadline_at > clock_timestamp() as live from ideeo.inference_operations where request_key=${keyHash} and conversation_id=${id}`;
          if (!op?.live) throw new ConversationError(409, 'inference_expired');
        }
        assertContentLive(parent.expires_at.toISOString());
        return { ...saved, event_id: eventId };
      });
      return turnView(scope, row);
    },
    async history(scope: CallerScope, id: string, after: number, limit: number, signal: AbortSignal, includeBookings=false): Promise<ConversationHistory> {
      const result = await scoped(scope, signal, async tx => {
        const parent = await conversation(tx, id);
        const rows = await tx<TurnRow[]>`select t.*, o.id as event_id from ideeo.turns t join ideeo.outbox o on o.scope=t.scope and o.turn_id=t.id
          where t.conversation_id=${id} and t.sequence>${after} order by t.sequence limit ${limit + 1}`;
        const checks=includeBookings && after===0 ? (await bookingRows(tx,id)).map(row=>bookingView(scope,parent,row)) : undefined;
        return { parent, rows, checks };
      }, true);
      const turns = result.rows.slice(0, limit).map(row => turnView(scope, row));
      return { ...view(result.parent), ...(result.checks?.length ? {booking_checks:result.checks}:{}), turns, next_after: result.rows.length > limit ? turns.at(-1)!.sequence : null };
    },
    close: async () => { await Promise.all([sql.end({ timeout: 2 }),accounting.end({ timeout: 2 })]); },
  });
}
