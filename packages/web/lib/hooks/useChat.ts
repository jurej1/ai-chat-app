import { useState } from "react";
import {
  callOpenRouterModel,
  streamTextFromResult,
  getResponseFromResult,
} from "@/lib/api";
import type { Message as MessageType } from "@ai-chat-app/core";
import type { Model } from "@openrouter/sdk/models";

export function useChat(
  selectedModel: Model | null,
  customInstructions?: string
) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentController, setCurrentController] =
    useState<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || !selectedModel) return;

    if (currentController) currentController.abort();

    const controller = new AbortController();
    setCurrentController(controller);

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
      // Get the result
      const result = callOpenRouterModel(
        [...messages, userMessage],
        selectedModel.id,
        controller.signal,
        customInstructions
      );

      // Stream response
      const iterator = streamTextFromResult(result)[Symbol.asyncIterator]();

      while (true) {
        const { value, done } = await iterator.next();
        if (done) {
          break;
        }
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === "assistant") {
            // Create new message object to avoid mutation
            updated[updated.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + value,
            };
          }
          return updated;
        });
      }

      // Get the full response
      const fullResponse = await getResponseFromResult(result);
      if (fullResponse) {
        console.log("full response", fullResponse);

        // Attach usage to the assistant message
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === "assistant" && fullResponse.usage) {
            updated[updated.length - 1] = {
              ...lastMessage,
              usage: {
                inputTokens: fullResponse.usage.inputTokens,
                outputTokens: fullResponse.usage.outputTokens,
              },
            };
          }
          return updated;
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setIsStreaming(false);
        setCurrentController(null);
      } else {
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
      }
    } finally {
      setIsStreaming(false);
      setCurrentController(null);
    }
  };

  return {
    messages,
    input,
    setInput,
    isStreaming,
    handleSubmit,
    cancelStreaming: () => currentController?.abort(),
  };
}
