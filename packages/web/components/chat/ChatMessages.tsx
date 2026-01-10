import { useState, useEffect } from "react";
import { Model } from "@openrouter/sdk/models";
import { Message as MessageType } from "@ai-chat-app/db";
import { ChatMessage } from "./ChatMessage";
import { NoModalSelected } from "./ChatNoModelSelected";
import { Spinner } from "../ui/spinner";

type Props = {
  onClick: () => void;
  messages: MessageType[];
  selectedModel: Model | null;
  isLoading?: boolean;
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
  isLoading = false,
}: Props) {
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * placeholderTexts.length);
    setCurrentText(placeholderTexts[randomIndex]);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-3">
          <Spinner />
          <p className="text-sm">Loading chat history...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-3">
          {!selectedModel ? (
            <NoModalSelected onClick={onClick} />
          ) : (
            <p className="text-2xl">{currentText}</p>
          )}
        </div>
      ) : (
        <div>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
