"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { OpenRouterModel, SelectedModel } from "@/lib/types/openrouter";
import { Dialog, DialogContent } from "../ui/dialog";
import { Tabs } from "../ui/tabs";
import { useSavedModels } from "@/lib/hooks/useSavedModels";
import { ModelSelectorTabsList } from "./ModelSelectorTabsList";
import { ModelSelectorHeader } from "./ModelSelectorHeader";
import { ModelSelectorInput } from "./ModelSelectorInput";
import { ModelSelectorModelsTab } from "./ModelSelectorModelsTab";
import { ModelSelectorSavedModelsTab } from "./ModelSelectorSavedModelsTab";
import { ModelSelectorFooter } from "./ModelSelectorFooter";

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 w-full max-w-3xl max-h-[80vh] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <ModelSelectorHeader
          showFreeOnly={showFreeOnly}
          setShowFreeOnly={setShowFreeOnly}
        />
        <ModelSelectorInput
          ref={searchInputRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "default" | "saved")}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <ModelSelectorTabsList />

          {/* Default Tab Content */}
          <ModelSelectorModelsTab
            error={error}
            onRetry={onRetry}
            isLoading={isLoading}
            filteredDefaultModels={filteredDefaultModels}
            searchQuery={searchQuery}
            focusedIndex={focusedIndex}
            handleSelectModel={handleSelectModel}
            handleToggleSave={handleToggleSave}
            selectedModelId={selectedModelId}
            activeTab={activeTab}
            isModelSaved={isSaved}
          />

          {/* Saved Tab Content */}
          <ModelSelectorSavedModelsTab
            filteredSavedModels={filteredSavedModels}
            searchQuery={searchQuery}
            activeTab={activeTab}
            focusedIndex={focusedIndex}
            selectedModelId={selectedModelId}
            isModelSaved={isSaved}
            handleSelectModel={handleSelectModel}
            handleToggleSave={handleToggleSave}
          />
        </Tabs>

        {/* Footer */}
        <ModelSelectorFooter
          activeTab={activeTab}
          filteredDefaultModels={filteredDefaultModels}
          filteredSavedModels={filteredSavedModels}
          searchQuery={searchQuery}
          models={models}
          totalSavedModelsCount={getSavedModelsData().length}
        />
      </DialogContent>
    </Dialog>
  );
}
