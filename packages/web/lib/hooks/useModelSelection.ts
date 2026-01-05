import { useState, useEffect } from "react";
import type { SelectedModel } from "../types/openrouter";

const SELECTED_MODEL_KEY = "selected_openrouter_model";

export function useModelSelection() {
  const [selectedModel, setSelectedModelState] = useState<SelectedModel | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SELECTED_MODEL_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedModelState(parsed);
      } catch (error) {
        console.error("Failed to parse stored model:", error);
        localStorage.removeItem(SELECTED_MODEL_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage when changed
  const setSelectedModel = (model: SelectedModel | null) => {
    setSelectedModelState(model);
    if (model) {
      localStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(model));
    } else {
      localStorage.removeItem(SELECTED_MODEL_KEY);
    }
  };

  return {
    selectedModel,
    setSelectedModel,
    isLoaded,
    isModelSelectorOpen,
    setIsModelSelectorOpen,
  };
}
