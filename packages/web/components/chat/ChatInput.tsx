import React, { memo, useRef, useEffect, useState } from "react";
import { SelectedModel } from "@/lib/types/openrouter";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  input: string;
  setInput: (val: string) => void;
  isStreaming: boolean;
  selectedModel: SelectedModel | null;
  cancelStreaming: () => void;
  customInstructions: string;
  setCustomInstructions: (val: string) => void;
};

export const ChatInput = memo(function ChatInput({
  handleSubmit,
  input,
  setInput,
  isStreaming,
  selectedModel,
  cancelStreaming,
  customInstructions,
  setCustomInstructions,
}: Props) {
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

  const CancelButton = () => (
    <Button
      type="button"
      onClick={cancelStreaming}
      className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
    >
      Cancel
    </Button>
  );

  const SubmitButton = () => (
    <Button
      type="submit"
      disabled={!input.trim() || !selectedModel}
      className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={!selectedModel ? "Please select a model first" : undefined}
    >
      Send
    </Button>
  );

  return (
    <div className="border-t border-foreground/10 p-4">
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
              className="pl-12 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 resize-none overflow-y-auto max-h-75"
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
          {isStreaming ? <CancelButton /> : <SubmitButton />}
        </div>
      </form>
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
    </div>
  );
});
