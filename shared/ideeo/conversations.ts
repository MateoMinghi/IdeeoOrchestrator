/** Development protocol; answer kind distinguishes scripted and constrained live evaluation. */
export const CONVERSATION_VERSION = 'ideeo-conversation-storage-2' as const;
export type SyntheticMessage = 'synthetic.hello' | 'synthetic.follow-up' | 'synthetic.draft' | 'synthetic.revise' | 'synthetic.recall';
export type ConversationView = Readonly<{
  conversation_id: string;
  created_at: string;
  expires_at: string;
}>;
export type TurnView = Readonly<{
  turn_id: string;
  conversation_id: string;
  event_id: string;
  sequence: number;
  status: 'completed';
  message: SyntheticMessage;
  answer: Readonly<{ kind: 'synthetic_storage' | 'openmaus_fixture' | 'openmaus_openai_evaluation'; text: string }>;
  created_at: string;
  expires_at: string;
}>;
/** A bounded committed snapshot; next_after is an exclusive sequence cursor, not authority. */
export type ConversationHistory = ConversationView & Readonly<{
  turns: readonly TurnView[];
  next_after: number | null;
}>;
