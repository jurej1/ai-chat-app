import { useState, useEffect, useCallback } from "react";
import {
  callOpenRouterModel,
  streamTextFromResult,
  getResponseFromResult,
} from "@/lib/openrouter";

import type { Model } from "@openrouter/sdk/models";
import { Message } from "@ai-chat-app/db";
import { useSelectedChatStore } from "../store/selectedChatStore";
import { useChatMessages } from "./useChatMessages";

export function useChat(
  selectedModel: Model | null,
  customInstructions?: string
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentController, setCurrentController] =
    useState<AbortController | null>(null);

  const { selectedChat } = useSelectedChatStore();
  const { data: chatMessages, isLoading: isLoadingMessages } = useChatMessages(
    selectedChat?.id
  );

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

  const abortOldControllerAndSetNew = () => {
    if (currentController) currentController.abort();
    const controller = new AbortController();
    setCurrentController(controller);

    return controller;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || !selectedModel) return;

    const controller = abortOldControllerAndSetNew();

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

  // Reset Chat
  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    if (currentController) {
      currentController.abort();
    }
    setIsStreaming(false);
    setCurrentController(null);
  }, [
    setMessages,
    setInput,
    currentController,
    setIsStreaming,
    setCurrentController,
  ]);

  const cancelStreaming = useCallback(
    () => currentController?.abort(),
    [currentController]
  );

  // If Chat changes during streaming cancel the stream for now
  useEffect(() => {
    if (isStreaming) cancelStreaming();
  }, [selectedChat?.id]);

  // if selected chat ID changes and chat messages history is available
  // then set the messages
  useEffect(() => {
    if (selectedChat && chatMessages) {
      setMessages(chatMessages);
      setInput("");
    }
  }, [selectedChat?.id, chatMessages]);

  return {
    messages,
    input,
    setInput,
    isStreaming,
    handleSubmit,
    cancelStreaming,
    resetChat,
  };
}
