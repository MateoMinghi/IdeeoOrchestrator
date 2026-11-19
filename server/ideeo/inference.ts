import type { SyntheticMessage, TurnView } from '../../shared/ideeo/conversations.ts';

export type InferenceKind = 'model' | 'tool';
export type InferenceContext = {
  message: SyntheticMessage; history: readonly TurnView[]; signal: AbortSignal;
  authorize(kind: InferenceKind): Promise<void>;
  checkpoint(): Promise<void>;
  reserve(kind: InferenceKind): Promise<{ id: string; deadline: Date }>;
  finish(id: string, usage?: { input: number; output: number }): Promise<void>;
};
export type ConversationGenerator = (context: InferenceContext) => Promise<TurnView['answer']>;
