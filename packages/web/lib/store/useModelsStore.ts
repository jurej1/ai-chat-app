import { create } from "zustand";
import { useEffect } from "react";
import { Model } from "@openrouter/sdk/models";
import { fetchModels } from "../models";

interface ModelsState {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  loadModels: () => Promise<void>;
}

export const useModelsStore = create<ModelsState>((set, get) => ({
  models: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  loadModels: async () => {
    const { isLoading } = get();

    if (isLoading) return;

    try {
      set({ isLoading: true, error: null });
      const { models: fetchedModels, error } = await fetchModels();

      if (error) {
        set({ error, isLoading: false, isInitialized: true });
      } else {
        set({ models: fetchedModels, isLoading: false, isInitialized: true });
      }
    } catch (error) {
      set({
        error: "Unexpected error loading models",
        isLoading: false,
        isInitialized: true,
      });
    }
  },
}));

// Hook to auto-initialize models on mount
export function useInitializeModels() {
  const { loadModels, isInitialized, isLoading } = useModelsStore();

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      loadModels();
    }
  }, [loadModels, isInitialized, isLoading]);
}
