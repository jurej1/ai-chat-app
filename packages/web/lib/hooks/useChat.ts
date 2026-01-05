import { useState } from "react";
import { streamChatResponse } from "@/lib/api";
import type { Message as MessageType } from "@ai-chat-app/core";
import type { SelectedModel } from "@/lib/types/openrouter";

export function useChat(selectedModel: SelectedModel | null) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || !selectedModel) return;

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
      for await (const chunk of streamChatResponse(
        [...messages, userMessage],
        selectedModel.id
      )) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === "assistant") {
            // Create new message object to avoid mutation
            updated[updated.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            };
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

  return { messages, input, setInput, isStreaming, handleSubmit };
}
