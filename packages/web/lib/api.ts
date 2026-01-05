import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { Message } from "@ai-chat-app/core";
import { OpenResponsesNonStreamingResponse } from "@openrouter/sdk/models";

const apiKey =
  typeof window !== "undefined" && localStorage.getItem("openrouter_api_key")
    ? localStorage.getItem("openrouter_api_key")!
    : env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const openrouter = new OpenRouter({
  apiKey: apiKey,
});

export function callOpenRouterModel(
  messages: Message[],
  model: string,
  signal?: AbortSignal,
  instructions?: string
) {
  return openrouter.callModel(
    {
      model,
      input: messages[messages.length - 1].content,
      ...(instructions && { instructions }),
    },
    { signal }
  );
}

export async function* streamTextFromResult(
  result: any
): AsyncGenerator<string, void, unknown> {
  for await (const delta of result.getTextStream()) {
    yield delta;
  }
}

export async function getResponseFromResult(
  result: any
): Promise<OpenResponsesNonStreamingResponse | undefined> {
  return await result.getResponse();
}

export async function* streamChatResponse(
  messages: Message[],
  model: string,
  signal?: AbortSignal,
  instructions?: string
): AsyncGenerator<
  string,
  OpenResponsesNonStreamingResponse | undefined,
  unknown
> {
  const result = callOpenRouterModel(messages, model, signal, instructions);

  try {
    for await (const delta of streamTextFromResult(result)) {
      yield delta;
    }

    return await getResponseFromResult(result);
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
