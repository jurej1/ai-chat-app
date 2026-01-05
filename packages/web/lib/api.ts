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
    const stream = await openrouter.chat.send({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to stream chat response"
    );
  }
}
