import { Model } from "@openrouter/sdk/models";

type SavedModelItem = {
  id: string;
  name: string;
  isAvailable: boolean;
  fullModel?: Model;
};

type Props = {
  activeTab: string;
  filteredDefaultModels: Model[];
  filteredSavedModels: SavedModelItem[];
  searchQuery: string;
  models: Model[];
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
