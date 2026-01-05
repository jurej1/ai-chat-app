export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatStreamChunk {
  type: "content" | "done" | "error";
  content?: string;
  error?: string;
}
