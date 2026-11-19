import type { createAdmission } from './admission.ts';
import { AdmissionError } from './authority-client.ts';
import { callerScope } from './storage/crypto.ts';
import { assertContentLive, type createConversationStore } from './storage/conversations.ts';
import type { SyntheticMessage } from '../../shared/ideeo/conversations.ts';
import type { ConversationGenerator, InferenceKind } from './inference.ts';

export function createConversationService(admission: Awaited<ReturnType<typeof createAdmission>>, store: Awaited<ReturnType<typeof createConversationStore>>, generator?: ConversationGenerator) {
  async function access(proof: string, write: boolean, signal: AbortSignal) {
    const current = await admission.admit(proof, signal);
    if (!current.scopes.includes('conversation:read') || write && !current.scopes.includes('conversation:write')) throw new AdmissionError(403);
    const scope = callerScope(current.principal);
    const reauthorize = async (kind?: InferenceKind) => {
      signal.throwIfAborted();
      const fresh = await admission.admit(proof, signal);
      if (JSON.stringify(callerScope(fresh.principal)) !== JSON.stringify(scope) || !fresh.scopes.includes('conversation:read')
        || write && !fresh.scopes.includes('conversation:write') || kind && !fresh.scopes.includes(kind === 'model' ? 'inference:invoke' : 'tool:fixture:read')) throw new AdmissionError(403);
      signal.throwIfAborted();
    };
    return { scope, reauthorize };
  }
  return Object.freeze({
    async create(proof: string, key: string, signal: AbortSignal) {
      const { scope, reauthorize } = await access(proof, true, signal);
      const result = await store.create(scope, key, reauthorize, signal);
      await reauthorize();
      assertContentLive(result.expires_at);
      return result;
    },
    async append(proof: string, id: string, key: string, message: SyntheticMessage, signal: AbortSignal) {
      const { scope, reauthorize } = await access(proof, true, signal);
      const result = await store.append(scope, id, key, message, reauthorize, signal, generator, reauthorize);
      await reauthorize();
      assertContentLive(result.expires_at);
      return result;
    },
    async history(proof: string, id: string, after: number, limit: number, signal: AbortSignal) {
      const { scope, reauthorize } = await access(proof, false, signal);
      const result = await store.history(scope, id, after, limit, signal);
      await reauthorize();
      assertContentLive(result.expires_at);
      return result;
    },
  });
}
