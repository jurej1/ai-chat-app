"use client";

import { useChat } from "@/lib/hooks/useChat";
import { ModelSelector } from "@/components/model-selector/ModelSelector";
import { useInitializeModels } from "@/lib/store/useModelsStore";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatUsageBox } from "./ChatUsageBox";
import { CyberpunkBackground } from "./CyberpunkBackground";
import { ErrorBanner } from "./ErrorBanner";
import { AnimatePresence } from "motion/react";

export function ChatUI() {
  useInitializeModels();

  const {
    messages,
    input,
    setInput,
    isStreaming,
    handleSubmit,
    cancelStreaming,
    setCustomInstructions,
    customInstructions,
    error,
    clearError,
    handleRetry,
  } = useChat();

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Cyberpunk Background */}
      <CyberpunkBackground />

      {/* Header */}
      <ChatHeader />

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <ErrorBanner
            error={error}
            onRetry={handleRetry}
            onDismiss={clearError}
          />
        )}
      </AnimatePresence>

      {messages.some((m) => m.inputTokens || m.outputTokens) && (
        <div className="absolute left-1/2 -translate-x-1/2 top-20 z-10">
          <ChatUsageBox messages={messages} />
        </div>
      )}

      {/* Messages */}
      <ChatMessages messages={messages} isStreaming={isStreaming} />

      {/* Input */}
      <ChatInput
        handleSubmit={handleSubmit}
        input={input}
        isStreaming={isStreaming}
        setInput={setInput}
        cancelStreaming={cancelStreaming}
        customInstructions={customInstructions}
        setCustomInstructions={setCustomInstructions}
      />

      {/* Model Selector Modal */}
      <ModelSelector />
    </div>
  );
}
