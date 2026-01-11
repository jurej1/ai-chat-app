"use client";

import { useChat } from "@/lib/hooks/useChat";
import { ModelSelector } from "@/components/model-selector/ModelSelector";
import { useInitializeModels } from "@/lib/store/useModelsStore";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatUsageBox } from "./ChatUsageBox";

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
  } = useChat();

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <ChatHeader />

      {messages.some((m) => m.inputTokens || m.outputTokens) && (
        <div className="absolute left-1/2 -translate-x-1/2 top-20">
          <ChatUsageBox messages={messages} />
        </div>
      )}

      {/* Messages */}
      <ChatMessages messages={messages} />

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
