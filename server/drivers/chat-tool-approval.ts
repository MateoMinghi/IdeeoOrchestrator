import { floorBlockForToolCall } from "../safety-floor-gate.ts";
import { createChatToolApprovalCore } from "./chat-tool-approval-core.ts";
export { refusal } from "./chat-tool-approval-core.ts";

export function createChatToolApproval(options: Parameters<typeof createChatToolApprovalCore>[0]) {
  return createChatToolApprovalCore(options, floorBlockForToolCall);
}
