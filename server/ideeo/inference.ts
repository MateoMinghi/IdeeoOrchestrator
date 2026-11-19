import type { ConversationMessage, TurnView } from '../../shared/ideeo/conversations.ts';
import type { ModelProjection } from './text-policy.ts';

export type InferenceKind = 'model' | 'tool' | 'disclosure';
export type InferenceContext = {
  message: ConversationMessage; history: readonly (TurnView & { projection?: ModelProjection })[]; signal: AbortSignal;
  forbidden?: readonly string[];
  authorize(kind: InferenceKind): Promise<void>;
  checkpoint(): Promise<void>;
  reserve(kind: Exclude<InferenceKind, 'disclosure'>): Promise<{ id: string; deadline: Date }>;
  finish(id: string, usage?: { input: number; output: number }): Promise<void>;
};
export type ConversationGenerator = (context: InferenceContext) => Promise<TurnView['answer']>;
