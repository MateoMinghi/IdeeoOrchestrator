import type { SyntheticMessage } from '../../shared/ideeo/conversations.ts';

export type InferenceConfiguration = Readonly<({ mode: 'synthetic'; url: string; credentialEnv: string; model: 'ideeo-fixture' }
  | { mode: 'openai-evaluation'; url: 'https://api.openai.com/v1'; credentialEnv: string; model: 'gpt-6-luna' }) & { textMode?: 'free-form' }>;
export const fixturePrompts: Record<SyntheticMessage,string> = {
  'synthetic.hello': 'Say hello for this synthetic conversation.',
  'synthetic.follow-up': 'Look up the synthetic color using fixture_catalog, then say the color.',
  'synthetic.draft': 'Draft a synthetic invitation to a picnic.',
  'synthetic.revise': 'Revise the synthetic invitation to be shorter.',
  'synthetic.recall': 'Recall the last approved synthetic invitation.',
};
export const fixtureAnswers = new Set(['Hello from the synthetic conversation.', 'The synthetic color is blue.',
  'You are invited to our synthetic picnic on Saturday.', 'Join our synthetic picnic on Saturday.',
  'The last invitation was: Join our synthetic picnic on Saturday.']);
export function parseInferenceConfiguration(value: unknown): InferenceConfiguration {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid inference configuration');
  const v = value as Record<string,unknown>;
  if (!['credentialEnv,mode,model,url','credentialEnv,mode,model,textMode,url'].includes(Object.keys(v).sort().join(','))
    || Object.hasOwn(v,'textMode') && v.textMode !== 'free-form'
    || typeof v.credentialEnv !== 'string' || !/^[A-Z][A-Z0-9_]{0,99}$/.test(v.credentialEnv) || typeof v.url !== 'string') throw new Error('Invalid inference configuration');
  if (v.mode === 'openai-evaluation' && v.url === 'https://api.openai.com/v1' && v.model === 'gpt-6-luna') return Object.freeze(v as InferenceConfiguration);
  if (v.mode !== 'synthetic' || v.model !== 'ideeo-fixture') throw new Error('Unqualified model profile');
  const url = new URL(v.url);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.pathname !== '/v1' || url.username || url.password || url.search || url.hash) throw new Error('Unqualified model destination');
  return Object.freeze(v as InferenceConfiguration);
}
