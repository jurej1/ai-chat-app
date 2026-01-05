# Implementation Guide: Dynamic Model Listing for ai-chat-app

## Overview

This implementation guide details how to add dynamic model listing to the ai-chat-app, replacing any hardcoded model configurations with real-time fetching from the OpenRouter SDK. The OpenRouter SDK provides a `models.list()` method that returns an array of available models with comprehensive properties including capabilities, pricing information, context lengths, and architecture details. This enables the app to always display current models without requiring code updates when new models are added or pricing changes occur.

The implementation involves creating a robust API layer for fetching models, updating the useModels hook to handle dynamic data, and enhancing the ModelSelector component to display rich model information including pricing and capabilities. Caching mechanisms will be implemented to optimize performance while ensuring data freshness.

## Benefits for the App

- **Real-Time Model Availability**: Always display the most current list of available models without requiring app updates or deployments.
- **Accurate Pricing Information**: Show users real-time pricing for prompts and completions, enabling cost-conscious model selection.
- **Enhanced User Experience**: Provide detailed model capabilities, context lengths, and descriptions to help users choose the best model for their needs.
- **Future-Proof Architecture**: Automatically support new models as they're added to OpenRouter without code changes.
- **Performance Optimization**: Implement intelligent caching to reduce API calls while maintaining data freshness.
- **Error Resilience**: Handle API failures gracefully with fallback mechanisms and user-friendly error states.
- **Search and Filtering**: Enable users to search and filter models by various criteria including free models, pricing, and capabilities.

## Step-by-Step Code Changes

### 1. Create API Function for Model Fetching (`packages/web/lib/models.ts`)

Create a new file or update existing model-related API functions to handle dynamic model fetching with caching.

```typescript
import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { OpenRouterModel } from "./types/openrouter";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

// Cache configuration
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
    // Fetch from OpenRouter API
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
```

**Key Changes:**

- Uses OpenRouter SDK's `models.list()` method to fetch dynamic model data
- Implements localStorage-based caching with 1-hour expiration
- Handles API errors gracefully without throwing exceptions
- Returns structured response with models array and optional error message

### 2. Update useModels Hook (`packages/web/lib/hooks/useModels.ts`)

Enhance the useModels hook to integrate with the new dynamic fetching function and provide better state management.

```typescript
import { useState, useEffect, useCallback } from "react";
import type { OpenRouterModel } from "../types/openrouter";
import { fetchModels } from "../models";

export function useModels() {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { models: fetchedModels, error } = await fetchModels();

      if (error) {
        setError(error);
        setModels([]); // Clear models on error
      } else {
        setModels(fetchedModels);
        setError(null);
      }
    } catch (error) {
      setError("Unexpected error loading models");
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const refreshModels = useCallback(async () => {
    // Force refresh by clearing cache
    if (typeof window !== "undefined") {
      localStorage.removeItem("openrouter_models_cache");
    }
    await loadModels();
  }, [loadModels]);

  return {
    models,
    isLoading: loading,
    error,
    loadModels,
    refreshModels,
  };
}
```

**Key Changes:**

- Added `refreshModels` function to force cache invalidation and reload
- Improved error handling and state management
- Added useCallback for better performance and dependency management

### 3. Update OpenRouter Types (`packages/web/lib/types/openrouter.ts`)

Ensure types match the OpenRouter SDK response format. Update if necessary to include all model properties.

```typescript
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  context_length: number | null;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    context_length: number | null;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  per_request_limits: {
    prompt_tokens: string | number | null;
    completion_tokens: string | number | null;
  } | null;
  capabilities?: {
    // Additional capabilities if available
    [key: string]: any;
  };
}

export interface ModelsListResponse {
  data: OpenRouterModel[];
}

export interface SelectedModel {
  id: string;
  name: string;
}
```

**Key Changes:**

- Made `description` optional as it might not always be present
- Added `capabilities` field for future extensibility
- Ensured all fields match OpenRouter API response structure

### 4. Enhance ModelSelector Component (`packages/web/components/ModelSelector.tsx`)

Update the ModelSelector to display dynamic model information including pricing, context length, and capabilities.

```tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { OpenRouterModel, SelectedModel } from "@/lib/types/openrouter";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  models: OpenRouterModel[];
  selectedModelId: string | null;
  onSelectModel: (model: SelectedModel) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ModelSelector({
  isOpen,
  onClose,
  models,
  selectedModelId,
  onSelectModel,
  isLoading = false,
  error = null,
  onRetry,
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "pricing" | "context">("name");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Helper function to parse pricing
  const parsePrice = (price: string) => parseFloat(price) || 0;

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let filtered = models;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query)
      );
    }

    // Filter by free models
    if (showFreeOnly) {
      filtered = filtered.filter(
        (model) =>
          parsePrice(model.pricing.prompt) === 0 &&
          parsePrice(model.pricing.completion) === 0
      );
    }

    // Sort models
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "pricing":
          const aPrice = parsePrice(a.pricing.prompt);
          const bPrice = parsePrice(b.pricing.prompt);
          return aPrice - bPrice;
        case "context":
          return (b.context_length || 0) - (a.context_length || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [models, searchQuery, showFreeOnly, sortBy]);

  // Reset focus when filtered list changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [filteredModels]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      setSearchQuery("");
      setFocusedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredModels.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredModels[focusedIndex]) {
      e.preventDefault();
      handleSelectModel(filteredModels[focusedIndex]);
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const focusedElement = listRef.current.children[
        focusedIndex
      ] as HTMLElement;
      focusedElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedIndex, isOpen]);

  const handleSelectModel = (model: OpenRouterModel) => {
    onSelectModel({ id: model.id, name: model.name });
    onClose();
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? "Free" : `$${numPrice.toFixed(6)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 w-full max-w-4xl max-h-[85vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="flex justify-between items-center p-4 border-b border-foreground/10">
          <DialogTitle className="text-xl font-semibold">
            Select Model
          </DialogTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/60">Free only</span>
              <Switch
                checked={showFreeOnly}
                onCheckedChange={setShowFreeOnly}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 text-sm bg-foreground/5 border border-foreground/10 rounded"
            >
              <option value="name">Sort by Name</option>
              <option value="pricing">Sort by Price</option>
              <option value="context">Sort by Context</option>
            </select>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b border-foreground/10">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models by name, ID, or description..."
            className="w-full px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        {/* Model List */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <p className="text-red-500">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-foreground/50">Loading models...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-foreground/50">
                {searchQuery ? "No models found" : "No models available"}
              </p>
            </div>
          ) : (
            filteredModels.map((model, index) => (
              <button
                key={model.id}
                onClick={() => handleSelectModel(model)}
                className={`w-full text-left p-4 border-b border-foreground/10 hover:bg-foreground/5 transition-colors ${
                  focusedIndex === index ? "bg-foreground/5" : ""
                } ${selectedModelId === model.id ? "bg-foreground/10" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{model.name}</h3>
                    <p className="text-sm text-foreground/60 truncate mt-0.5">
                      {model.id}
                    </p>
                    {model.description && (
                      <p className="text-sm text-foreground/50 mt-1 line-clamp-2">
                        {model.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-sm space-y-1">
                    <div className="flex gap-2">
                      <span className="text-foreground/60">
                        Prompt: {formatPrice(model.pricing.prompt)}
                      </span>
                      <span className="text-foreground/60">
                        Completion: {formatPrice(model.pricing.completion)}
                      </span>
                    </div>
                    {model.context_length && (
                      <p className="text-foreground/60">
                        Context: {model.context_length.toLocaleString()} tokens
                      </p>
                    )}
                    {selectedModelId === model.id && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-foreground text-background rounded text-xs">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-foreground/10 text-sm text-foreground/60">
          <p>
            {filteredModels.length} model
            {filteredModels.length !== 1 ? "s" : ""} available
            {searchQuery && ` (filtered from ${models.length})`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Key Changes:**

- Added sorting options (name, pricing, context length)
- Enhanced pricing display with formatted prices
- Improved layout to show more model information
- Added context length display
- Better responsive design

## Sample Code Snippets

### Basic Model Fetching Usage

```typescript
import { fetchModels } from "@/lib/models";
import { useModels } from "@/lib/hooks/useModels";

// Using the hook
const { models, isLoading, error, refreshModels } = useModels();

// Manual fetching
const { models, error } = await fetchModels();
if (error) {
  console.error("Failed to load models:", error);
} else {
  console.log("Loaded", models.length, "models");
}
```

### Model Selection Integration

```tsx
import { useModels } from "@/lib/hooks/useModels";
import { ModelSelector } from "@/components/ModelSelector";

function ChatInterface() {
  const { models, isLoading, error, loadModels } = useModels();
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(
    null
  );
  const [showModelSelector, setShowModelSelector] = useState(false);

  return (
    <>
      <button onClick={() => setShowModelSelector(true)}>
        Select Model: {selectedModel?.name || "None"}
      </button>

      <ModelSelector
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        models={models}
        selectedModelId={selectedModel?.id || null}
        onSelectModel={setSelectedModel}
        isLoading={isLoading}
        error={error}
        onRetry={loadModels}
      />
    </>
  );
}
```

### Cache Management

```typescript
import { useModels } from "@/lib/hooks/useModels";

function ModelManager() {
  const { refreshModels } = useModels();

  const handleForceRefresh = async () => {
    await refreshModels(); // Clears cache and fetches fresh data
  };

  return <button onClick={handleForceRefresh}>Refresh Models</button>;
}
```

## UI Enhancements

### Model Cards with Rich Information

```tsx
// Enhanced model display in ModelSelector
<div className="bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-md transition-shadow">
  <div className="flex justify-between items-start mb-2">
    <h3 className="font-semibold text-lg">{model.name}</h3>
    <div className="flex gap-2">
      {parseFloat(model.pricing.prompt) === 0 && (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
          Free
        </span>
      )}
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
        {model.architecture.modality}
      </span>
    </div>
  </div>

  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
    {model.description}
  </p>

  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <span className="font-medium">Context:</span>{" "}
      {model.context_length?.toLocaleString()} tokens
    </div>
    <div>
      <span className="font-medium">Pricing:</span> $
      {parseFloat(model.pricing.prompt).toFixed(6)} / prompt token
    </div>
  </div>
</div>
```

### Advanced Filtering

```tsx
// Additional filters in ModelSelector
const [filters, setFilters] = useState({
  modality: "all", // text, image, etc.
  minContext: 0,
  maxPrice: Infinity,
});

const advancedFilteredModels = useMemo(() => {
  return models.filter((model) => {
    if (
      filters.modality !== "all" &&
      model.architecture.modality !== filters.modality
    ) {
      return false;
    }
    if (model.context_length && model.context_length < filters.minContext) {
      return false;
    }
    const promptPrice = parseFloat(model.pricing.prompt);
    if (promptPrice > filters.maxPrice) {
      return false;
    }
    return true;
  });
}, [models, filters]);
```

## Caching Considerations

### Cache Strategy

- **Duration**: 1 hour cache to balance freshness with API limits
- **Storage**: localStorage for client-side persistence
- **Invalidation**: Manual refresh button for immediate updates
- **Fallback**: Graceful degradation when cache/API fails

### Cache Implementation Details

```typescript
// Advanced caching with versioning
const CACHE_VERSION = "1.0";
const CACHE_KEY = `openrouter_models_cache_v${CACHE_VERSION}`;

interface CachedModels {
  models: OpenRouterModel[];
  timestamp: number;
  version: string;
}

// On API changes, increment CACHE_VERSION to invalidate old cache
```

### Performance Optimizations

```typescript
// Background refresh
const backgroundRefresh = async () => {
  const cached = getCachedModels();
  if (cached && Date.now() - cached.timestamp > CACHE_DURATION * 0.8) {
    // Refresh in background if cache is getting stale
    fetchModels();
  }
};

// Compression for large model lists
const compressModels = (models: OpenRouterModel[]): string => {
  return LZString.compress(JSON.stringify(models));
};

const decompressModels = (compressed: string): OpenRouterModel[] => {
  return JSON.parse(LZString.decompress(compressed));
};
```

## Testing Notes

### Unit Tests

```typescript
// models.test.ts
describe("fetchModels", () => {
  it("should return cached models when available and fresh", async () => {
    // Mock localStorage
    const mockModels = [{ id: "test", name: "Test Model" }];
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        models: mockModels,
        timestamp: Date.now(),
      })
    );

    const result = await fetchModels();
    expect(result.models).toEqual(mockModels);
  });

  it("should fetch from API when cache is expired", async () => {
    // Mock expired cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        models: [],
        timestamp: Date.now() - CACHE_DURATION - 1,
      })
    );

    const result = await fetchModels();
    expect(mockOpenRouter.models.list).toHaveBeenCalled();
  });
});

// useModels.test.ts
describe("useModels", () => {
  it("should load models on mount", async () => {
    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.models).toBeDefined();
    });
  });
});
```

### Integration Tests

```typescript
// ModelSelector integration test
describe("ModelSelector", () => {
  it("should display models with pricing", () => {
    const models = [
      {
        id: "gpt-4",
        name: "GPT-4",
        pricing: { prompt: "0.00003", completion: "0.00006" },
        context_length: 8192,
      },
    ];

    render(<ModelSelector models={models} {...props} />);

    expect(screen.getByText("GPT-4")).toBeInTheDocument();
    expect(screen.getByText("$0.000030")).toBeInTheDocument();
    expect(screen.getByText("8,192 tokens")).toBeInTheDocument();
  });

  it("should filter free models correctly", () => {
    const models = [
      {
        id: "free",
        name: "Free Model",
        pricing: { prompt: "0", completion: "0" },
      },
      {
        id: "paid",
        name: "Paid Model",
        pricing: { prompt: "0.001", completion: "0.002" },
      },
    ];

    render(<ModelSelector models={models} {...props} />);

    const freeSwitch = screen.getByRole("switch");
    fireEvent.click(freeSwitch);

    expect(screen.getByText("Free Model")).toBeInTheDocument();
    expect(screen.queryByText("Paid Model")).not.toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Models load on app startup
- [ ] Cache works correctly (check localStorage)
- [ ] Refresh button clears cache and reloads
- [ ] Search functionality filters models
- [ ] Free models filter works
- [ ] Sorting by name, price, context works
- [ ] Model selection updates UI correctly
- [ ] Error states display properly
- [ ] Keyboard navigation works
- [ ] Responsive design on mobile
- [ ] API failures are handled gracefully
- [ ] Cache expiration works (wait or manipulate timestamps)

### E2E Tests

```typescript
// cypress/integration/model-selection.spec.js
describe("Model Selection", () => {
  it("should allow user to select a model", () => {
    cy.visit("/");
    cy.contains("Select Model").click();
    cy.contains("GPT-4").click();
    cy.contains("Selected").should("be.visible");
  });

  it("should filter models by search", () => {
    cy.visit("/");
    cy.contains("Select Model").click();
    cy.get("input[placeholder*='Search models']").type("GPT");
    cy.contains("GPT-3.5").should("be.visible");
    cy.contains("Claude").should("not.exist");
  });
});
```

This implementation provides a comprehensive dynamic model listing system that enhances the user experience while maintaining performance and reliability.
