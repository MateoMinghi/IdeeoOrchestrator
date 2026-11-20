import type { ConversationMessage, TurnView } from '../../shared/ideeo/conversations.ts';
import type { ModelProjection } from './text-policy.ts';
import type { CallerScope } from './storage/crypto.ts';

export type InferenceKind = 'model' | 'tool' | 'disclosure' | 'images';
export type InferenceContext = {
  message: ConversationMessage; history: readonly (TurnView & { projection?: ModelProjection })[]; signal: AbortSignal;
  forbidden?: readonly string[];
  toolPermissions?: readonly string[];
  execution?: Readonly<{scope: CallerScope; conversationId: string}>;
  claimTools?(bookingAttemptId?: string): Promise<void>;
  authorize(kind: InferenceKind, permission?: string): Promise<void>;
  checkpoint(): Promise<void>;
  reserve(kind: 'model'|'tool'): Promise<{ id: string; deadline: Date }>;
  finish(id: string, usage?: { input: number; output: number }): Promise<void>;
};
export type ConversationGenerator = (context: InferenceContext) => Promise<TurnView['answer']>;
