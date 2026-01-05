import { RefObject, useState, useEffect } from "react";
import { SelectedModel } from "@/lib/types/openrouter";
import { Message as MessageType } from "@ai-chat-app/core";
import { ChatMessage } from "./ChatMessage";
import { HiOutlineCpuChip } from "react-icons/hi2";
import { Button } from "../ui/button";

type Props = {
  onClick: () => void;
  messages: MessageType[];
  selectedModel: SelectedModel | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

const placeholderTexts = [
  "Start a conversation...",
  "Ready when you are.",
  "Where should we begin?",
  "What's on your mind today?",
  "Let's chat!",
  "How can I help you?",
  "Tell me something interesting.",
  "What's your question?",
];

export function ChatMessages({
  onClick,
  messages,
  selectedModel,
  messagesEndRef,
}: Props) {
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * placeholderTexts.length);
    setCurrentText(placeholderTexts[randomIndex]);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-3">
          {!selectedModel ? (
            <NoModalSelected onClick={onClick} />
          ) : (
            <p className="text-2xl">{currentText}</p>
          )}
        </div>
      ) : (
        <div>
          {messages.map((message, index) => (
            <ChatMessage
              key={`${message.timestamp}-${index}`}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

function NoModalSelected({ onClick }: { onClick: () => void }) {
  return (
    <>
      <HiOutlineCpuChip className="object-fill w-14 h-14" />
      <p>Please select a model to start chatting</p>
      <Button
        onClick={onClick}
        className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
      >
        Select Model
      </Button>
    </>
  );
}
