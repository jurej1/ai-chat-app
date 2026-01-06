import { useState, useEffect } from "react";
import { Model } from "@openrouter/sdk/models";
import { fetchModels } from "../models";

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch models on mount
  async function loadModels() {
    try {
      setLoading(true);
      const { models: fetchedModels, error } = await fetchModels();
      if (error) {
        setError(error);
      } else {
        setModels(fetchedModels);
      }
    } catch (error) {
      setError("Unexpected error loading models");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModels();
  }, []);

  return {
    models,
    isLoading: loading,
    error,
    loadModels,
  };
}
