import React, { memo, useRef, useEffect } from "react";
import { SelectedModel } from "@/lib/types/openrouter";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";

type Props = {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  input: string;
  setInput: (val: string) => void;
  isStreaming: boolean;
  selectedModel: SelectedModel | null;
  cancelStreaming: () => void;
};

export const ChatInput = memo(function ChatInput({
  handleSubmit,
  input,
  setInput,
  isStreaming,
  selectedModel,
  cancelStreaming,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
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
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleOnChange}
            onKeyDown={handleOnKeyDown}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 resize-none overflow-hidden"
            rows={1}
          />
          {isStreaming ? <CancelButton /> : <SubmitButton />}
        </div>
      </form>
    </div>
  );
});
