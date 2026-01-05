import React, { memo } from "react";
import { SelectedModel } from "@/lib/types/openrouter";
import { Input } from "@/components/ui/input";

type Props = {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  input: string;
  setInput: (val: string) => void;
  isStreaming: boolean;
  selectedModel: SelectedModel | null;
  cancelStreaming: () => void;
};

export const ChatInput = memo(function ChatInput({
  handleSubmit,
  input,
  setInput,
  isStreaming,
  selectedModel,
  cancelStreaming,
}: Props) {
  return (
    <div className="border-t border-foreground/10 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={cancelStreaming}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || !selectedModel}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!selectedModel ? "Please select a model first" : undefined}
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
});
