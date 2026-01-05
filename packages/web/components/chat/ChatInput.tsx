import { SelectedModel } from "@/lib/types/openrouter";

type Props = {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  input: string;
  setInput: (val: string) => void;
  isStreaming: boolean;
  selectedModel: SelectedModel | null;
};

export function ChatInput({
  handleSubmit,
  input,
  setInput,
  isStreaming,
  selectedModel,
}: Props) {
  return (
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
  );
}
