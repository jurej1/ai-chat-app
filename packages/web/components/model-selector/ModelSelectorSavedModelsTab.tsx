import { OpenRouterModel } from "@/lib/types/openrouter";
import { TabsContent } from "../ui/tabs";
import { Star } from "lucide-react";
import { ModelSelectorModelRow } from "./ModelSelectorModelRow";

type SavedModelItem = {
  id: string;
  name: string;
  isAvailable: boolean;
  fullModel?: OpenRouterModel;
};

type Props = {
  filteredSavedModels: SavedModelItem[];
  searchQuery: string;
  activeTab: string;
  focusedIndex: number;
  selectedModelId: string | null;
  isModelSaved: (id: string) => boolean;
  handleSelectModel: (model: OpenRouterModel) => void;
  handleToggleSave: (
    e: React.MouseEvent,
    modelId: string,
    modelName: string
  ) => void;
};

export function ModelSelectorSavedModelsTab({
  filteredSavedModels,
  searchQuery,
  activeTab,
  focusedIndex,
  selectedModelId,
  isModelSaved,
  handleSelectModel,
  handleToggleSave,
}: Props) {
  // Unavailable model row component
  const UnavailableModelRow = ({
    modelId,
    modelName,
    index,
    isActive,
  }: {
    modelId: string;
    modelName: string;
    index: number;
    isActive: boolean;
  }) => {
    const isFocused = focusedIndex === index && isActive;

    return (
      <div
        className={`w-full text-left p-4 border-b border-foreground/10 opacity-50 ${
          isFocused ? "bg-foreground/5" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate text-foreground/60">
                {modelName}
              </h3>
              <span className="inline-block px-2 py-0.5 bg-foreground/10 text-foreground/60 rounded text-xs">
                Unavailable
              </span>
            </div>
            <p className="text-sm text-foreground/40 truncate mt-0.5">
              {modelId}
            </p>
          </div>
          <button
            onClick={(e) => handleToggleSave(e, modelId, modelName)}
            className="p-1 hover:bg-foreground/10 rounded transition-colors shrink-0"
            aria-label="Unsave model"
          >
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <TabsContent value="saved">
      {filteredSavedModels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <p className="text-foreground/50">
            {searchQuery ? "No saved models found" : "No saved models yet"}
          </p>
          {!searchQuery && (
            <p className="text-sm text-foreground/40">
              Star models in the Default tab to save them
            </p>
          )}
        </div>
      ) : (
        filteredSavedModels.map((savedItem, index) =>
          savedItem.isAvailable && savedItem.fullModel ? (
            <ModelSelectorModelRow
              key={savedItem.id}
              model={savedItem.fullModel}
              index={index}
              isActive={activeTab === "saved"}
              focusedIndex={focusedIndex}
              selectedModelId={selectedModelId}
              isSaved={isModelSaved(savedItem.id)}
              handleSelectModel={() => handleSelectModel(savedItem.fullModel!)}
              handleToggleSave={(e) =>
                handleToggleSave(
                  e,
                  savedItem.fullModel!.id,
                  savedItem.fullModel!.name
                )
              }
            />
          ) : (
            <UnavailableModelRow
              key={savedItem.id}
              modelId={savedItem.id}
              modelName={savedItem.name}
              index={index}
              isActive={activeTab === "saved"}
            />
          )
        )
      )}
    </TabsContent>
  );
}
