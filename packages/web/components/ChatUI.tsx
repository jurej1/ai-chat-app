"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/components/Message";
import { useModelSelection } from "@/lib/hooks/useModelSelection";
import { useChat } from "@/lib/hooks/useChat";
import { ModelSelector } from "@/components/ModelSelector";
import { useModels } from "@/lib/hooks/useModels";

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
  const { messages, input, setInput, isStreaming, handleSubmit } =
    useChat(selectedModel);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-foreground/10 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <button
            onClick={() => setIsModelSelectorOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            {selectedModel ? (
              <span className="max-w-50 truncate">{selectedModel.name}</span>
            ) : (
              <span className="text-foreground/60">Select Model</span>
            )}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-3">
            {!selectedModel ? (
              <>
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                <p>Please select a model to start chatting</p>
                <button
                  onClick={() => setIsModelSelectorOpen(true)}
                  className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
                >
                  Select Model
                </button>
              </>
            ) : (
              <p>Start a conversation...</p>
            )}
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <Message
                key={`${message.timestamp}-${index}`}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-foreground/10 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming || !selectedModel}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!selectedModel ? "Please select a model first" : undefined}
            >
              {isStreaming ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>

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
