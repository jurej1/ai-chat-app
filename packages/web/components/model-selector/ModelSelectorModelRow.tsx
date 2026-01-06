import { Model } from "@openrouter/sdk/models";
import { Star } from "lucide-react";

type Props = {
  model: Model;
  index: number;
  isActive: boolean;
  focusedIndex: number;
  selectedModelId: string | null;
  isSaved: boolean;
  handleSelectModel: () => void;
  handleToggleSave: (e: React.MouseEvent) => void;
};

export function ModelSelectorModelRow({
  model,
  index,
  isActive,
  focusedIndex,
  selectedModelId,
  isSaved,
  handleSelectModel,
  handleToggleSave,
}: Props) {
  const isFocused = focusedIndex === index && isActive;
  const isSelected = selectedModelId === model.id;

  return (
    <button
      onClick={handleSelectModel}
      className={`w-full text-left p-4 border-b border-foreground/10 hover:bg-foreground/5 transition-colors ${
        isFocused ? "bg-foreground/5" : ""
      } ${isSelected ? "bg-foreground/10" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{model.name}</h3>
          <p className="text-sm text-foreground/60 truncate mt-0.5">
            {model.id}
          </p>
          {model.description && (
            <p className="text-sm text-foreground/50 mt-1 line-clamp-2">
              {model.description}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <div className="text-right text-sm">
            {model.contextLength && (
              <p className="text-foreground/60">
                {model.contextLength.toLocaleString()} ctx
              </p>
            )}
            {isSelected && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-foreground text-background rounded text-xs">
                Selected
              </span>
            )}
          </div>
          <div
            onClick={handleToggleSave}
            className="p-1 hover:bg-foreground/10 rounded transition-colors cursor-pointer"
            role="button"
            aria-label={isSaved ? "Unsave model" : "Save model"}
            tabIndex={0}
          >
            <Star
              className={`w-5 h-5 ${
                isSaved
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-foreground/40"
              }`}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
