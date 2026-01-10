import { Model } from "@openrouter/sdk/models";
import { TabsContent } from "../ui/tabs";
import { ModelSelectorModelRow } from "./ModelSelectorModelRow";
import { useModelsStore } from "@/lib/store/useModelsStore";

type Props = {
  filteredDefaultModels: Model[];
  searchQuery: string;
  isModelSaved: (id: string) => boolean;
  focusedIndex: number;
  handleSelectModel: (model: Model) => void;
  handleToggleSave: (
    e: React.MouseEvent,
    modelId: string,
    modelName: string
  ) => void;
  activeTab: string;
};

export function ModelSelectorModelsTab({
  filteredDefaultModels,
  searchQuery,
  focusedIndex,
  handleSelectModel,
  handleToggleSave,
  activeTab,
  isModelSaved,
}: Props) {
  const { isLoading, loadModels: onRetry, error } = useModelsStore();

  return (
    <TabsContent value="default">
      {error ? (
        <div className="flex flex-col items-center justify-center h-32 gap-3">
          <p className="text-red-500">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-foreground/50">Loading models...</p>
        </div>
      ) : filteredDefaultModels.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-foreground/50">
            {searchQuery ? "No models found" : "No models available"}
          </p>
        </div>
      ) : (
        filteredDefaultModels.map((model, index) => (
          <ModelSelectorModelRow
            key={model.id}
            focusedIndex={focusedIndex}
            handleSelectModel={() => handleSelectModel(model)}
            handleToggleSave={(e) => handleToggleSave(e, model.id, model.name)}
            model={model}
            isSaved={isModelSaved(model.id)}
            index={index}
            isActive={activeTab === "default"}
          />
        ))
      )}
    </TabsContent>
  );
}
