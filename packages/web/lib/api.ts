import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { Message } from "@ai-chat-app/core";

const apiKey =
  typeof window !== "undefined" && localStorage.getItem("openrouter_api_key")
    ? localStorage.getItem("openrouter_api_key")!
    : env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const openrouter = new OpenRouter({
  apiKey: apiKey,
});

export async function* streamChatResponse(
  messages: Message[],
  model: string,
  signal?: AbortSignal,
  instructions?: string
): AsyncGenerator<string, void, unknown> {
  const result = openrouter.callModel(
    {
      model,
      input: messages[messages.length - 1].content,
      ...(instructions && { instructions }),
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
