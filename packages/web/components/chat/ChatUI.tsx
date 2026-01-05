"use client";

import { useState } from "react";
import { useModelSelection } from "@/lib/hooks/useModelSelection";
import { useChat } from "@/lib/hooks/useChat";
import { ModelSelector } from "@/components/model-selector/ModelSelector";
import { useModels } from "@/lib/hooks/useModels";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatUsageBox } from "./ChatUsageBox";

export function ChatUI() {
  const [customInstructions, setCustomInstructions] = useState<string>("");

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
    usage,
  } = useChat(selectedModel, customInstructions);

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <ChatHeader
        onClick={() => setIsModelSelectorOpen(true)}
        selectedModel={selectedModel}
      />

      {usage && (
        <div className="absolute left-1/2 -translate-x-1/2 top-20">
          <ChatUsageBox usage={usage!} />
        </div>
      )}

      {/* Messages */}
      <ChatMessages
        onClick={() => setIsModelSelectorOpen(true)}
        messages={messages}
        selectedModel={selectedModel}
      />

      {/* Input */}
      <ChatInput
        handleSubmit={handleSubmit}
        input={input}
        isStreaming={isStreaming}
        selectedModel={selectedModel}
        setInput={setInput}
        cancelStreaming={cancelStreaming}
        customInstructions={customInstructions}
        setCustomInstructions={setCustomInstructions}
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
