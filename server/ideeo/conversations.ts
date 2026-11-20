import type { createAdmission } from './admission.ts';
import { AdmissionError } from './authority-client.ts';
import { callerScope } from './storage/crypto.ts';
import { assertContentLive, type createConversationStore } from './storage/conversations.ts';
import type { ConversationMessage } from '../../shared/ideeo/conversations.ts';
import { isFreeFormMessage, permittedText } from './text-policy.ts';
import { ConversationError } from './storage/conversations.ts';
import type { ConversationGenerator, InferenceKind } from './inference.ts';
import type { createCapabilities } from './capabilities.ts';
import { CAPABILITY_FAMILIES } from '../../shared/ideeo/capabilities.ts';

export function createConversationService(admission: Awaited<ReturnType<typeof createAdmission>>, store: Awaited<ReturnType<typeof createConversationStore>>, generator?: ConversationGenerator, capabilities?: ReturnType<typeof createCapabilities>) {
  async function access(proof: string, write: boolean, signal: AbortSignal) {
    const current = await admission.admit(proof, signal);
    if (!current.scopes.includes('conversation:read') || write && !current.scopes.includes('conversation:write')) throw new AdmissionError(403);
    const scope = callerScope(current.principal);
    const reauthorize = async (kind?: InferenceKind, permission?: string) => {
      if(permission!==undefined&&(kind!=='tool'||!/^tool:[a-z][a-z0-9_-]{0,63}:[a-z][a-z0-9_-]{0,63}$/.test(permission))) throw new AdmissionError(403);
      signal.throwIfAborted();
      const fresh = await admission.admit(proof, signal);
      if (JSON.stringify(callerScope(fresh.principal)) !== JSON.stringify(scope) || !fresh.scopes.includes('conversation:read')
        || write && !fresh.scopes.includes('conversation:write') || kind && !fresh.scopes.includes(kind === 'model' ? 'inference:invoke' : kind === 'disclosure' ? 'inference:disclose' : kind==='images'?'inference:disclose:images':permission ?? 'tool:fixture:read')) throw new AdmissionError(403);
      signal.throwIfAborted();
    };
    return { scope, reauthorize, toolPermissions: current.scopes };
  }
  return Object.freeze({
    async capabilities(proof: string, signal: AbortSignal){
      const {scope,reauthorize,toolPermissions}=await access(proof,false,signal);
      const available=capabilities?.availability(scope,toolPermissions)??CAPABILITY_FAMILIES.map(family=>({family,available:0}));
      await reauthorize();
      return {capabilities:available};
    },
    async create(proof: string, key: string, signal: AbortSignal) {
      const { scope, reauthorize } = await access(proof, true, signal);
      const result = await store.create(scope, key, reauthorize, signal);
      await reauthorize();
      assertContentLive(result.expires_at);
      return result;
    },
    async append(proof: string, id: string, key: string, message: ConversationMessage, signal: AbortSignal) {
      const { scope, reauthorize, toolPermissions } = await access(proof, true, signal);
      if (isFreeFormMessage(message) && !permittedText(message.text,1500,[proof,proof.replace(/^Bearer /,'')])) throw new ConversationError(422,'content_not_permitted');
      const scopedGenerator: ConversationGenerator|undefined=generator?context=>generator({...context,toolPermissions}):undefined;
      const workspace = capabilities?.availability(scope,toolPermissions).some(item=>item.available>0) ?? false;
      const result = await store.append(scope, id, key, message, reauthorize, signal, scopedGenerator, reauthorize, workspace);
      await reauthorize();
      assertContentLive(result.expires_at);
      return result;
    },
    async turnStatus(proof: string, id: string, key: string, signal: AbortSignal) {
      const { scope, reauthorize } = await access(proof, false, signal);
      const result = await store.turnStatus(scope, id, key, signal);
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
