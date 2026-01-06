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

  const handleMessageUpdates = (
    updater: (lastMessage: MessageType) => MessageType
  ) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage.role === "assistant") {
        updated[updated.length - 1] = updater(lastMessage);
      }
      return updated;
    });
  };

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
      const modelResult = callOpenRouterModel(
        [...messages, userMessage],
        selectedModel.id,
        controller.signal,
        customInstructions
      );

      // Stream response
      const iterator =
        streamTextFromResult(modelResult)[Symbol.asyncIterator]();

      while (true) {
        const { value, done } = await iterator.next();
        if (done) break;

        handleMessageUpdates((lastMessage) => ({
          ...lastMessage,
          content: lastMessage.content + value,
        }));
      }

      // Get the full response
      const fullResponse = await getResponseFromResult(modelResult);
      if (fullResponse) {
        console.log("full response", fullResponse);

        // Attach usage to the assistant message
        if (fullResponse.usage) {
          handleMessageUpdates((lastMessage) => ({
            ...lastMessage,
            usage: {
              inputTokens: fullResponse.usage!.inputTokens,
              outputTokens: fullResponse.usage!.outputTokens,
            },
          }));
        }
      }
    } catch (error) {
      const isAbortError =
        error instanceof DOMException && error.name === "AbortError";

      if (isAbortError) {
        setIsStreaming(false);
        setCurrentController(null);
        return;
      }

      console.error("Error streaming response:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      handleMessageUpdates((lastMessage) => ({
        ...lastMessage,
        content: `Error: ${errorMessage}`,
      }));
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
