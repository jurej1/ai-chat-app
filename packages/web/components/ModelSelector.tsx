"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { OpenRouterModel, SelectedModel } from "@/lib/types/openrouter";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Star } from "lucide-react";
import { useSavedModels } from "@/lib/hooks/useSavedModels";

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
  const [activeTab, setActiveTab] = useState<"default" | "saved">("default");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    toggleSavedModel,
    isSaved,
    getSavedModelsData,
    isLoaded: savedModelsLoaded,
  } = useSavedModels();

  // Filter models based on search and free status (Default tab)
  const filteredDefaultModels = useMemo(() => {
    let filtered = models;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query) ||
          model.description?.toLowerCase().includes(query)
      );
    }

    if (showFreeOnly) {
      filtered = filtered.filter(
        (model) =>
          model.pricing.prompt === "0" && model.pricing.completion === "0"
      );
    }

    return filtered;
  }, [models, searchQuery, showFreeOnly]);

  // Filter saved models (Saved tab)
  const filteredSavedModels = useMemo(() => {
    const savedData = getSavedModelsData();

    // Create a map of available models for quick lookup
    const availableModelsMap = new Map(models.map((m) => [m.id, m]));

    // Build list with availability status
    let savedModels = savedData.map((saved) => {
      const availableModel = availableModelsMap.get(saved.id);
      return {
        ...saved,
        isAvailable: !!availableModel,
        fullModel: availableModel,
      };
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      savedModels = savedModels.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.fullModel?.description?.toLowerCase().includes(query)
      );
    }

    // Apply free-only filter (only for available models)
    if (showFreeOnly) {
      savedModels = savedModels.filter(
        (item) =>
          item.fullModel &&
          item.fullModel.pricing.prompt === "0" &&
          item.fullModel.pricing.completion === "0"
      );
    }

    return savedModels;
  }, [models, searchQuery, showFreeOnly, getSavedModelsData]);

  // Reset focus when filtered list changes or tab changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [activeTab, filteredDefaultModels, filteredSavedModels]);

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
      const maxIndex =
        activeTab === "default"
          ? filteredDefaultModels.length - 1
          : filteredSavedModels.length - 1;
      setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeTab === "default" && filteredDefaultModels[focusedIndex]) {
        handleSelectModel(filteredDefaultModels[focusedIndex]);
      } else if (activeTab === "saved" && filteredSavedModels[focusedIndex]) {
        const savedItem = filteredSavedModels[focusedIndex];
        if (savedItem.isAvailable && savedItem.fullModel) {
          handleSelectModel(savedItem.fullModel);
        }
      }
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

  const handleToggleSave = (
    e: React.MouseEvent,
    modelId: string,
    modelName: string
  ) => {
    e.stopPropagation(); // Prevent model selection
    toggleSavedModel(modelId, modelName);
  };

  // Model row component
  const ModelRow = ({
    model,
    index,
    isActive,
  }: {
    model: OpenRouterModel;
    index: number;
    isActive: boolean;
  }) => {
    const isFocused = focusedIndex === index && isActive;
    const isSelected = selectedModelId === model.id;
    const modelIsSaved = isSaved(model.id);

    return (
      <button
        onClick={() => handleSelectModel(model)}
        className={`w-full text-left p-4 border-b border-foreground/10 hover:bg-foreground/5 transition-colors ${
          isFocused ? "bg-foreground/5" : ""
        } ${isSelected ? "bg-foreground/10" : ""}`}
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
          <div className="shrink-0 flex items-center gap-2">
            <div className="text-right text-sm">
              {model.context_length && (
                <p className="text-foreground/60">
                  {model.context_length.toLocaleString()} ctx
                </p>
              )}
              {isSelected && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-foreground text-background rounded text-xs">
                  Selected
                </span>
              )}
            </div>
            <div
              onClick={(e) => handleToggleSave(e, model.id, model.name)}
              className="p-1 hover:bg-foreground/10 rounded transition-colors cursor-pointer"
              role="button"
              aria-label={modelIsSaved ? "Unsave model" : "Save model"}
              tabIndex={0}
            >
              <Star
                className={`w-5 h-5 ${
                  modelIsSaved
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-foreground/40"
                }`}
              />
            </div>
          </div>
        </div>
      </button>
    );
  };

  // Unavailable model row component
  const UnavailableModelRow = ({
    modelId,
    modelName,
    index,
    isActive,
  }: {
    modelId: string;
    modelName: string;
    index: number;
    isActive: boolean;
  }) => {
    const isFocused = focusedIndex === index && isActive;

    return (
      <div
        className={`w-full text-left p-4 border-b border-foreground/10 opacity-50 ${
          isFocused ? "bg-foreground/5" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate text-foreground/60">
                {modelName}
              </h3>
              <span className="inline-block px-2 py-0.5 bg-foreground/10 text-foreground/60 rounded text-xs">
                Unavailable
              </span>
            </div>
            <p className="text-sm text-foreground/40 truncate mt-0.5">
              {modelId}
            </p>
          </div>
          <button
            onClick={(e) => handleToggleSave(e, modelId, modelName)}
            className="p-1 hover:bg-foreground/10 rounded transition-colors shrink-0"
            aria-label="Unsave model"
          >
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 w-full max-w-3xl max-h-[80vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="flex justify-between items-center p-4 border-b border-foreground/10">
          <DialogTitle className="text-xl font-semibold flex w-full justify-between">
            Select Model
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/60">Free only</span>
              <Switch
                checked={showFreeOnly}
                onCheckedChange={setShowFreeOnly}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </DialogTitle>
        </DialogHeader>
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

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "default" | "saved")}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-4 border-b border-foreground/10">
            <TabsList className="w-full">
              <TabsTrigger value="default" className="flex-1">
                Default
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex-1">
                Saved
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Default Tab Content */}
          <TabsContent value="default">
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
            ) : filteredDefaultModels.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-foreground/50">
                  {searchQuery ? "No models found" : "No models available"}
                </p>
              </div>
            ) : (
              filteredDefaultModels.map((model, index) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  index={index}
                  isActive={activeTab === "default"}
                />
              ))
            )}
          </TabsContent>

          {/* Saved Tab Content */}
          <TabsContent value="saved">
            {filteredSavedModels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-foreground/50">
                  {searchQuery
                    ? "No saved models found"
                    : "No saved models yet"}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-foreground/40">
                    Star models in the Default tab to save them
                  </p>
                )}
              </div>
            ) : (
              filteredSavedModels.map((savedItem, index) =>
                savedItem.isAvailable && savedItem.fullModel ? (
                  <ModelRow
                    key={savedItem.id}
                    model={savedItem.fullModel}
                    index={index}
                    isActive={activeTab === "saved"}
                  />
                ) : (
                  <UnavailableModelRow
                    key={savedItem.id}
                    modelId={savedItem.id}
                    modelName={savedItem.name}
                    index={index}
                    isActive={activeTab === "saved"}
                  />
                )
              )
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
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
                {searchQuery &&
                  ` (filtered from ${getSavedModelsData().length})`}
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
