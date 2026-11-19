import { cn } from "@/lib/cn";

export const SIMPLE_BUBBLE_TEXT = "text-[15px] leading-[22px]";

const SIMPLE_BUBBLE_SHAPE = `min-w-9 rounded-[18px] px-3 py-[7px] ${SIMPLE_BUBBLE_TEXT}`;

export const SIMPLE_BOT_BUBBLE = `${SIMPLE_BUBBLE_SHAPE} bg-card text-ink`;

export const SIMPLE_USER_BUBBLE = `${SIMPLE_BUBBLE_SHAPE} bg-bubble-user font-normal`;

export const SIMPLE_BUBBLE_MAX = "max-w-[min(var(--chat-bubble-max),var(--chat-bubble-pct),calc(100%-82px))]";

export function plainBotBubble(simple: boolean): string {
  return simple
    ? cn("chat-text w-fit whitespace-pre-wrap", SIMPLE_BUBBLE_MAX, SIMPLE_BOT_BUBBLE)
    : "chat-text w-fit max-w-[min(var(--chat-bubble-max),var(--chat-bubble-pct))] rounded-2xl bg-card px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-ink";
}
