import { useState, useEffect } from "react";
import {
  callOpenRouterModel,
  streamTextFromResult,
  getResponseFromResult,
} from "@/lib/openrouter";

import type { Model } from "@openrouter/sdk/models";
import { Message } from "@ai-chat-app/db";

export function useChat(
  selectedModel: Model | null,
  customInstructions?: string,
  initialMessages?: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentController, setCurrentController] =
    useState<AbortController | null>(null);

  // Update messages when initialMessages changes (e.g., when switching chats)
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
      setInput(""); // Clear input when loading new chat
    }
  }, [initialMessages]);

  const handleMessageUpdates = (updater: (lastMessage: Message) => Message) => {
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

    // Temporary client-side message (not yet persisted to DB)
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
      chatId: "temp", // Will be set when saving to DB
      inputTokens: null,
      outputTokens: null,
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date(),
      chatId: "temp", // Will be set when saving to DB
      inputTokens: null,
      outputTokens: null,
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
            inputTokens: fullResponse.usage!.inputTokens,
            outputTokens: fullResponse.usage!.outputTokens,
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

  const resetChat = () => {
    setMessages([]);
    setInput("");
    if (currentController) {
      currentController.abort();
    }
    setIsStreaming(false);
    setCurrentController(null);
  };

  return {
    messages,
    input,
    setInput,
    isStreaming,
    handleSubmit,
    cancelStreaming: () => currentController?.abort(),
    resetChat,
  };
}
