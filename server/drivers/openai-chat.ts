import { createOpenAIChatRuntime as createRuntime, type RuntimeOptions } from "./openai-chat-runtime.ts";
import { chatToolNotices, joinLateChatTools, mountChatTools, refitChatTools, withHostFileTools } from "./chat-mcp-tools.ts";
import { chatToolLimitFor, chatToolLimitKey } from "../tool-count-limit.ts";
import { toolSchemaProfileFor } from "../tool-schema-profile.ts";
import { floorBlockForToolCall } from "../safety-floor-gate.ts";
import { appendNative } from "./native.ts";
import { writeTurnHandoff } from "../turn-continuation.ts";
import { FETCH_LIMIT_MS, fetchPastLimit } from "./openai-chat-fetch.ts";
export type { OpenAIChatMessage, Completion } from "./openai-chat-runtime.ts";

export function createOpenAIChatRuntime<Config>(options: Omit<RuntimeOptions<Config>, "ports">) {
  return createRuntime({ ...options, ports: {
    send: (url, init) => (options.timeoutMs > FETCH_LIMIT_MS ? fetchPastLimit : fetch)(url, init),
    mount: (turn, signal, model, parsed, safeText, notice, toolsOff) => mountChatTools(toolsOff ? undefined : withHostFileTools(turn.integrations), signal, options.computerUse, parsed.scope, turn.mcpCallTimeoutMs,
      toolSchemaProfileFor({url: options.apiUrl, model}), turn.cwd ?? turn.toolResultFolder, safeText, chatToolLimitFor(options.apiUrl, model), { background: true, conversation: turn.threadId, notice }),
    join: joinLateChatTools,
    refit: (tools, error, model, reserved) => refitChatTools(tools, error, chatToolLimitKey(options.apiUrl, model), reserved),
    notices: chatToolNotices, native: appendNative, handoff: writeTurnHandoff, warning: message => console.warn(message),
    floor: floorBlockForToolCall, allowAskUser: true,
  } });
}
