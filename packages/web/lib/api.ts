import type { Message, ChatRequest } from "@ai-chat-app/core";

export async function* streamChatResponse(
  messages: Message[]
): AsyncGenerator<string, void, unknown> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages } as ChatRequest),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE messages
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || ""; // Keep incomplete message in buffer

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6));

        if (data.type === "content") {
          yield data.content;
        } else if (data.type === "error") {
          throw new Error(data.error);
        } else if (data.type === "done") {
          return;
        }
      }
    }
  }
}
