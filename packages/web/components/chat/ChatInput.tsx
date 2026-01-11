import React, { memo, useRef, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModelSelectionStore } from "@/lib/store/useModelSelectionStore";
import { Model } from "@openrouter/sdk/models";
import { motion } from "motion/react";
import { StreamingProgress } from "./StreamingProgress";
import { cn } from "@/lib/utils";

type Props = {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  input: string;
  setInput: (val: string) => void;
  isStreaming: boolean;
  cancelStreaming: () => void;
  customInstructions: string;
  setCustomInstructions: (val: string) => void;
};

export const ChatInput = memo(function ChatInput({
  handleSubmit,
  input,
  setInput,
  isStreaming,
  cancelStreaming,
  customInstructions,
  setCustomInstructions,
}: Props) {
  const selectedModel = useModelSelectionStore((s) => s.selectedModel);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [input]);

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      formRef.current?.dispatchEvent(new Event("submit", { bubbles: true }));
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setInput(e.target.value);

  return (
    <div className="border-t border-[var(--cyber-cyan)]/20 p-4 glass-panel relative">
      <StreamingProgress isStreaming={isStreaming} />

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleOnChange}
              onKeyDown={handleOnKeyDown}
              placeholder="Type your message..."
              disabled={isStreaming}
              className={cn(
                "pl-12 pr-4 py-3 bg-background/80 border rounded-lg resize-none",
                "text-foreground placeholder:text-foreground/50",
                "focus:outline-none focus:ring-2 focus:border-[var(--cyber-cyan)]",
                "focus:shadow-[0_0_15px_rgba(0,230,255,0.3)]",
                "disabled:opacity-50 transition-all duration-200",
                isStreaming
                  ? "border-foreground/10"
                  : "border-[var(--cyber-cyan)]/30"
              )}
              rows={1}
            />
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-foreground/10 transition-colors"
              title="Set custom instructions"
            >
              <Plus size={16} />
            </button>
          </div>
          {isStreaming ? (
            <CancelButtonEnhanced cancelStreaming={cancelStreaming} />
          ) : (
            <SubmitButtonEnhanced input={input} selectedModel={selectedModel} />
          )}
        </div>
      </form>
      <CustomInstructionsDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        customInstructions={customInstructions}
        setCustomInstructions={setCustomInstructions}
      />
    </div>
  );
});

const CustomInstructionsDialog = memo(
  ({
    isDialogOpen,
    setIsDialogOpen,
    customInstructions,
    setCustomInstructions,
  }: {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    customInstructions: string;
    setCustomInstructions: (val: string) => void;
  }) => {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Instructions</DialogTitle>
          </DialogHeader>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Enter custom instructions for the AI..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

const CancelButtonEnhanced = memo(
  ({ cancelStreaming }: { cancelStreaming: () => void }) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        type="button"
        onClick={cancelStreaming}
        className="px-6 py-3 bg-destructive/80 rounded-lg font-medium hover:bg-destructive hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
      >
        Cancel
      </Button>
    </motion.div>
  )
);

const SubmitButtonEnhanced = memo(
  ({
    input,
    selectedModel,
  }: {
    input: string;
    selectedModel: Model | null;
  }) => {
    const isDisabled = !input.trim() || !selectedModel;

    return (
      <motion.div
        whileHover={{ scale: isDisabled ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          type="submit"
          disabled={isDisabled}
          className={cn(
            "px-6 py-3 rounded-lg font-medium transition-all duration-200",
            !isDisabled &&
              "bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-magenta)]",
            !isDisabled && "hover:shadow-[0_0_20px_rgba(0,230,255,0.5)]",
            isDisabled && "bg-foreground/20 cursor-not-allowed"
          )}
          title={!selectedModel ? "Please select a model first" : undefined}
        >
          Send
        </Button>
      </motion.div>
    );
  }
);
