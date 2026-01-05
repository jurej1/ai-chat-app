import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { Message } from "@ai-chat-app/core";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

export async function* streamChatResponse(
  messages: Message[],
  model: string
): AsyncGenerator<string, void, unknown> {
  try {
    const result = openrouter.callModel({
      model,
      input: messages[messages.length - 1].content,
    });

    for await (const delta of result.getTextStream()) {
      yield delta;
    }
  } catch (error) {
    console.error("Stream error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to stream chat response"
    );
  }
}
