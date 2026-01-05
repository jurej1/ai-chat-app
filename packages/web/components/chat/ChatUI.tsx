"use client";

import { useRef, useEffect } from "react";
import { useModelSelection } from "@/lib/hooks/useModelSelection";
import { useChat } from "@/lib/hooks/useChat";
import { ModelSelector } from "@/components/model-selector/ModelSelector";
import { useModels } from "@/lib/hooks/useModels";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export function ChatUI() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    selectedModel,
    setSelectedModel,
    setIsModelSelectorOpen,
    isModelSelectorOpen,
  } = useModelSelection();

  const {
    models,
    isLoading: isLoadingModels,
    error: modelsError,
    loadModels,
  } = useModels();

  // Chat state
  const {
    messages,
    input,
    setInput,
    isStreaming,
    handleSubmit,
    cancelStreaming,
  } = useChat(selectedModel);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <ChatHeader
        onClick={() => setIsModelSelectorOpen(true)}
        selectedModel={selectedModel}
      />

      {/* Messages */}
      <ChatMessages
        onClick={() => setIsModelSelectorOpen(true)}
        messages={messages}
        selectedModel={selectedModel}
        messagesEndRef={messagesEndRef}
      />

      {/* Input */}
      <ChatInput
        handleSubmit={handleSubmit}
        input={input}
        isStreaming={isStreaming}
        selectedModel={selectedModel}
        setInput={setInput}
        cancelStreaming={cancelStreaming}
      />

      {/* Model Selector Modal */}
      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        models={models}
        selectedModelId={selectedModel?.id ?? null}
        onSelectModel={setSelectedModel}
        isLoading={isLoadingModels}
        error={modelsError}
        onRetry={loadModels}
      />
    </div>
  );
}
