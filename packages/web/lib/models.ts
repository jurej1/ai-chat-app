import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { OpenRouterModel } from "./types/openrouter";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

// Cache key and duration
const CACHE_KEY = "openrouter_models_cache";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedModels {
  models: OpenRouterModel[];
  timestamp: number;
}

export async function fetchModels(): Promise<{
  models: OpenRouterModel[];
  error?: string;
}> {
  // Check cache first
  const cached = getCachedModels();
  if (cached) return { models: cached };

  try {
    // Fetch from API
    const response = await openrouter.models.list();
    const models = (response as any).data as OpenRouterModel[];

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

function getCachedModels(): OpenRouterModel[] | null {
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

function setCachedModels(models: OpenRouterModel[]): void {
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
