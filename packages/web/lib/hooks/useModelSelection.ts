import { Model } from "@openrouter/sdk/models";
import { useState, useEffect } from "react";

const SELECTED_MODEL_KEY = "selected_openrouter_model";

export function useModelSelection() {
  const [selectedModel, setSelectedModelState] = useState<Model | null>(null);
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
  const setSelectedModel = (model: Model | null) => {
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
