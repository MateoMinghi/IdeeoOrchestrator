import type { SendTurnInput } from "../contracts.ts";

export interface PromptHalves {
  stable: string | null;
  volatile: string;
}

export function promptHalves(
  turn: Pick<SendTurnInput, "system" | "systemStable" | "systemVolatile">,
): PromptHalves {
  const { systemStable, systemVolatile } = turn;
  if (typeof systemStable !== "string" || typeof systemVolatile !== "string") {
    return { stable: null, volatile: "" };
  }
  return { stable: systemStable, volatile: systemVolatile };
}

export const VOLATILE_CONTEXT_NOTE_PREFIX =
  "Context from OpenMausBot updated since this conversation started; it replaces any earlier copy:";

export const VOLATILE_CONTEXT_CLEARED_NOTE =
  "The OpenMausBot context notes from earlier in this conversation have been cleared; the standing instructions still apply.";

export function volatileContextNote(volatile: string, hadVolatile: boolean): string {
  const text = volatile.trim();
  if (text) return VOLATILE_CONTEXT_NOTE_PREFIX + "\n\n" + text;
  return hadVolatile ? VOLATILE_CONTEXT_CLEARED_NOTE : "";
}

export function withContextNote(note: string, text: string): string {
  if (!note) return text;
  return text ? note + "\n\n" + text : note;
}
