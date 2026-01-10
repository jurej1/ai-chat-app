import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Model } from "@openrouter/sdk/models";

interface ModelSelectionState {
  selectedModel: Model | null;
  isLoaded: boolean;
  setSelectedModel: (model: Model | null) => void;
  dialogOpen: boolean;
  setDialogOpen: (val: boolean) => void;
}

export const useModelSelectionStore = create<ModelSelectionState>()(
  persist(
    (set) => ({
      selectedModel: null,
      dialogOpen: false,
      isLoaded: false,
      setSelectedModel: (model) => set({ selectedModel: model }),
      setDialogOpen: (val) => set({ dialogOpen: val }),
    }),
    {
      name: "selected_openrouter_model",
      onRehydrateStorage: () => (state) => {
        // Set isLoaded to true after hydration completes
        if (state) state.isLoaded = true;
      },
    }
  )
);
