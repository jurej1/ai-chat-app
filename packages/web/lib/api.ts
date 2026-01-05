import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { Message } from "@ai-chat-app/core";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

export async function* streamChatResponse(
  messages: Message[],
  model: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const result = openrouter.callModel(
    {
      model,
      input: messages[messages.length - 1].content,
    },
    { signal }
  );

  try {
    for await (const delta of result.getTextStream()) {
      yield delta;
    }
  } catch (error) {
    const isDomException = error instanceof DOMException;

    if (!(isDomException && error.name === "AbortError")) {
      result.cancel();
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      // Gracefully handle abort without throwing
      return;
    }
    console.error("Stream error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to stream chat response"
    );
  }
}
