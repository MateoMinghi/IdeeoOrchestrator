/** Development storage protocol; synthetic answers are not model or banking results. */
export const CONVERSATION_VERSION = 'ideeo-conversation-storage-1' as const;
export type SyntheticMessage = 'synthetic.hello' | 'synthetic.follow-up';
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
  answer: Readonly<{ kind: 'synthetic_storage'; text: string }>;
  created_at: string;
  expires_at: string;
}>;
/** A bounded committed snapshot; next_after is an exclusive sequence cursor, not authority. */
export type ConversationHistory = ConversationView & Readonly<{
  turns: readonly TurnView[];
  next_after: number | null;
}>;
