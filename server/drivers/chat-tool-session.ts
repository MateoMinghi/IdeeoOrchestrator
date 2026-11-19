import type { ChatImagePart } from "./chat-images.ts";
import type { ToolBudget } from "../../shared/tool-budget.ts";

export interface ChatToolDefinition {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
}
export interface ChatToolResult { text: string; ok: boolean; images?: ChatImagePart[] }
/** How a call is shown and granted. A grant names the exact tool on the server as launched; the
 * person's own computer never gets a session-wide one. */
export interface ChatToolCallView { title: string; input: Record<string, unknown>; ask: boolean; grant?: string }
/** A dispatched operation may already have taken effect: never retry it through a new round. */
export class ChatToolSessionError extends Error {}
export interface SkippedChatMcpServer { server: string; reason: string }
/** Configured servers at the same address with the same sign-in as `server`, mounted once under its name. */
export interface MergedChatMcpServers { server: string; same: string[] }
/** A built-in server that listed only its first `listed` of `of` tools, so the turn fits the model's tool limit. */
export interface TrimmedChatMcpServer { server: string; listed: number; of: number }
export interface ChatToolSession {
  definitions: ChatToolDefinition[];
  skipped: SkippedChatMcpServer[];
  trimmed: TrimmedChatMcpServer[];
  merged: MergedChatMcpServers[];
  budget: ToolBudget;
  /** Lists the turn's tools again within `limit`, after a provider refused that many; started servers keep running. */
  refit(limit: number): Promise<void>;
  /** With `background`: lists the tools of servers that finished starting since the last call. The lines say which were
   * skipped and what the tool limit did; undefined when none finished. */
  join(): Promise<string[] | undefined>;
  validate(name: string, args: unknown): void;
  /** Directory reads and OpenMausBot's own agents server need no card; call_tool shows the tool it runs. */
  view(name: string, args: Record<string, unknown>): ChatToolCallView;
  execute(name: string, args: Record<string, unknown>, signal: AbortSignal): Promise<ChatToolResult>;
  close(): Promise<void>;
}
