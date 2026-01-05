import { SelectedModel } from "@/lib/types/openrouter";
import { Button } from "../ui/button";
import { HiOutlineCpuChip } from "react-icons/hi2";

type Props = {
  onClick: () => void;
  selectedModel: SelectedModel | null;
};

export function ChatHeader({ onClick, selectedModel }: Props) {
  return (
    <>
      <header className="border-b border-foreground/10 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={onClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg transition-colors text-sm text-foreground"
            >
              <HiOutlineCpuChip />
              {selectedModel ? (
                <span className="max-w-50 truncate">{selectedModel.name}</span>
              ) : (
                <span className="text-foreground/60">Select Model</span>
              )}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
