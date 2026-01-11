import { useState, useEffect, useCallback, useRef } from "react";
import {
  callOpenRouterModel,
  streamTextFromResult,
  getResponseFromResult,
} from "@/lib/openrouter";

import { Message } from "@ai-chat-app/db";
import { useSelectedChatStore } from "../store/selectedChatStore";
import { useChatMessages } from "./useChatMessages";
import { useModelSelectionStore } from "../store/useModelSelectionStore";
import { useCreateMessage } from "./useCreateMessage";
import { toast } from "sonner";
import { ChatErrorFactory, type ChatError } from "@/lib/errors/chat-errors";

export function useChat() {
  const selectedModel = useModelSelectionStore((s) => s.selectedModel);

  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [isStreaming, setIsStreaming] = useState(false);
  const [currentController, setCurrentController] =
    useState<AbortController | null>(null);

  const [error, setError] = useState<ChatError | null>(null);

  const { selectedChat } = useSelectedChatStore();
  const { data: chatMessages } = useChatMessages(selectedChat?.id);

  const { mutateAsync: createMessage } = useCreateMessage();

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

  const saveMessagesToDb = async (
    userMsg: Message,
    assistantMsg: Message,
    chatId: string
  ) => {
    try {
      await Promise.all([
        createMessage({
          role: userMsg.role,
          content: userMsg.content,
          chatId,
          inputTokens: userMsg.inputTokens,
          outputTokens: userMsg.outputTokens,
        }),
        createMessage({
          role: assistantMsg.role,
          content: assistantMsg.content,
          chatId,
          inputTokens: assistantMsg.inputTokens,
          outputTokens: assistantMsg.outputTokens,
        }),
      ]);
    } catch (error) {
      console.error("Failed to persist messages:", error);
      toast.error("Failed to save messages to database", {
        description:
          "Your messages are temporarily stored in memory. Please try again later.",
      });
    }
  };

  const clearError = useCallback(() => setError(null), []);

  const handleRetry = useCallback(async () => {
    if (!error || !error.retryable) return;
    clearError();

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!lastUserMessage) return;

    setInput(lastUserMessage.content);
    setMessages((prev) => prev.filter((m) => !m.content?.startsWith("Error:")));

    setTimeout(() => {
      const form = document.querySelector("form");
      form?.dispatchEvent(new Event("submit", { bubbles: true }));
    }, 0);
  }, [error, messages, clearError, setInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || !selectedModel) return;

    const controller = abortOldControllerAndSetNew();
    let messagesSaved = false;

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

      // Get the full response and update assistant message with usage
      const fullResponse = await getResponseFromResult(modelResult);
      if (fullResponse?.usage) {
        handleMessageUpdates((lastMessage) => ({
          ...lastMessage,
          inputTokens: fullResponse.usage!.inputTokens,
          outputTokens: fullResponse.usage!.outputTokens,
        }));
      }

      // Save messages to DB if chat is selected
      if (selectedChat?.id && !messagesSaved) {
        messagesSaved = true;
        // Extract final messages from current state and save to DB
        setMessages((prev) => {
          const userMsg = prev[prev.length - 2];
          const assistantMsg = prev[prev.length - 1];

          // Fire-and-forget DB save with error handling
          saveMessagesToDb(userMsg, assistantMsg, selectedChat.id);

          return prev;
        });
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

      const chatError = ChatErrorFactory.fromException(error);
      setError(chatError);

      handleMessageUpdates((lastMessage) => ({
        ...lastMessage,
        content: `Error: ${chatError.message}`,
      }));

      toast.error(chatError.message, {
        description: chatError.details,
        action: chatError.retryable
          ? {
              label: "Retry",
              onClick: handleRetry,
            }
          : undefined,
      });
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
    customInstructions,
    setCustomInstructions,
    error,
    clearError,
    handleRetry,
  };
}
