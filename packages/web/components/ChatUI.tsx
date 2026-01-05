"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/components/Message";
import type { Message as MessageType, ChatRequest } from "@ai-chat-app/core";

interface ChatUIProps {
  apiUrl: string;
}

async function* streamChatResponse(
  apiUrl: string,
  messages: MessageType[]
): AsyncGenerator<string, void, unknown> {
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

export function ChatUI({ apiUrl }: ChatUIProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming) return;

    const userMessage: MessageType = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessage: MessageType = {
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Stream response
      for await (const chunk of streamChatResponse(apiUrl, [
        ...messages,
        userMessage,
      ])) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === "assistant") {
            lastMessage.content += chunk;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content = `Error: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`;
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-foreground/10 p-4">
        <h1 className="text-xl font-semibold">AI Chat</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-foreground/50">
            <p>Start a conversation...</p>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <Message
                key={`${message.timestamp}-${index}`}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-foreground/10 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
