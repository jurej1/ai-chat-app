import { OpenRouterModel } from "@/lib/types/openrouter";

type SavedModelItem = {
  id: string;
  name: string;
  isAvailable: boolean;
  fullModel?: OpenRouterModel;
};

type Props = {
  activeTab: string;
  filteredDefaultModels: OpenRouterModel[];
  filteredSavedModels: SavedModelItem[];
  searchQuery: string;
  models: OpenRouterModel[];
  totalSavedModelsCount: number;
};

export function ModelSelectorFooter({
  activeTab,
  filteredDefaultModels,
  filteredSavedModels,
  searchQuery,
  models,
  totalSavedModelsCount,
}: Props) {
  return (
    <div className="p-4 border-t border-foreground/10 text-sm text-foreground/60">
      <p>
        {activeTab === "default" ? (
          <>
            {filteredDefaultModels.length} model
            {filteredDefaultModels.length !== 1 ? "s" : ""} available
            {searchQuery && ` (filtered from ${models.length})`}
          </>
        ) : (
          <>
            {filteredSavedModels.length} saved model
            {filteredSavedModels.length !== 1 ? "s" : ""}
            {searchQuery && ` (filtered from ${totalSavedModelsCount})`}
          </>
        )}
      </p>
    </div>
  );
}
