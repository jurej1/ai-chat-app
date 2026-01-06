import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import { Model } from "@openrouter/sdk/models";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

// Cache key and duration
const CACHE_KEY = "openrouter_models_cache";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedModels {
  models: Model[];
  timestamp: number;
}

export async function fetchModels(): Promise<{
  models: Model[];
  error?: string;
}> {
  // Check cache first
  const cached = getCachedModels();
  if (cached) return { models: cached };

  try {
    // Fetch from API
    const response = await openrouter.models.list();
    const models = response.data;

    // Cache the results
    setCachedModels(models);

    return { models };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch models";

    // Return empty array with error - don't throw
    return { models: [], error: errorMessage };
  }
}

function getCachedModels(): Model[] | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedModels = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.models;
  } catch (error) {
    console.error("Failed to read models cache:", error);
    return null;
  }
}

function setCachedModels(models: Model[]): void {
  if (typeof window === "undefined") return;

  try {
    const cached: CachedModels = {
      models,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error("Failed to cache models:", error);
  }
}
