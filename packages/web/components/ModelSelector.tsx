"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { OpenRouterModel, SelectedModel } from "@/lib/types/openrouter";
import { Switch } from "./ui/switch";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter models based on search and free status
  const filteredModels = useMemo(() => {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-foreground/10 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="p-4 border-b border-foreground/10">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold mb-3">Select Model</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/60">Free only</span>
              <Switch
                checked={showFreeOnly}
                onCheckedChange={setShowFreeOnly}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          </div>
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
                  <div className="shrink-0 text-right text-sm">
                    {model.context_length && (
                      <p className="text-foreground/60">
                        {model.context_length.toLocaleString()} ctx
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
      </div>
    </div>
  );
}
