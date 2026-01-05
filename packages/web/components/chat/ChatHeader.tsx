import { SelectedModel } from "@/lib/types/openrouter";

type Props = {
  onClick: () => void;
  selectedModel: SelectedModel | null;
};

export function ChatHeader({ onClick, selectedModel }: Props) {
  return (
    <header className="border-b border-foreground/10 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <button
          onClick={onClick}
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
  );
}
