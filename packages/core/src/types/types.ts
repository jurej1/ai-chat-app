export type MessageRole = "user" | "assistant" | "system";

export interface ChatStreamChunk {
  type: "content" | "done" | "error";
  content?: string;
  error?: string;
}
