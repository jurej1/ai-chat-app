import { useState, useEffect } from "react";

const SAVED_MODELS_KEY = "saved_openrouter_models";

export interface SavedModelData {
  id: string;
  name: string;
  savedAt: number;
}

export function useSavedModels() {
  const [savedModelIds, setSavedModelIdsState] = useState<Set<string>>(
    new Set()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(SAVED_MODELS_KEY);
    if (stored) {
      try {
        const parsed: SavedModelData[] = JSON.parse(stored);
        setSavedModelIdsState(new Set(parsed.map((m) => m.id)));
      } catch (error) {
        console.error("Failed to parse saved models:", error);
        localStorage.removeItem(SAVED_MODELS_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // Toggle saved model
  const toggleSavedModel = (modelId: string, modelName: string) => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(SAVED_MODELS_KEY);
    let savedModels: SavedModelData[] = [];

    if (stored) {
      try {
        savedModels = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse saved models:", error);
      }
    }

    const existingIndex = savedModels.findIndex((m) => m.id === modelId);

    if (existingIndex >= 0) {
      // Remove from saved
      savedModels.splice(existingIndex, 1);
      setSavedModelIdsState((prev) => {
        const next = new Set(prev);
        next.delete(modelId);
        return next;
      });
    } else {
      // Add to saved
      savedModels.push({ id: modelId, name: modelName, savedAt: Date.now() });
      setSavedModelIdsState((prev) => new Set(prev).add(modelId));
    }

    localStorage.setItem(SAVED_MODELS_KEY, JSON.stringify(savedModels));
  };

  // Check if model is saved
  const isSaved = (modelId: string) => savedModelIds.has(modelId);

  // Get full saved model data for the Saved tab
  const getSavedModelsData = (): SavedModelData[] => {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(SAVED_MODELS_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse saved models:", error);
      return [];
    }
  };

  return {
    toggleSavedModel,
    isSaved,
    getSavedModelsData,
    isLoaded,
  };
}
