export type MessageRole = "user" | "assistant" | "system";

export interface MessageUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
  usage?: MessageUsage;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatStreamChunk {
  type: "content" | "done" | "error";
  content?: string;
  error?: string;
}
