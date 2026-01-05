import { RefObject } from "react";
import { SelectedModel } from "@/lib/types/openrouter";
import { Message as MessageType } from "@ai-chat-app/core";
import { Message } from "../Message";

type Props = {
  onClick: () => void;
  messages: MessageType[];
  selectedModel: SelectedModel | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export function ChatMessages({
  onClick,
  messages,
  selectedModel,
  messagesEndRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-foreground/50 gap-3">
          {!selectedModel ? (
            <>
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <p>Please select a model to start chatting</p>
              <button
                onClick={onClick}
                className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
              >
                Select Model
              </button>
            </>
          ) : (
            <p>Start a conversation...</p>
          )}
        </div>
      ) : (
        <div>
          {messages.map((message, index) => (
            <Message key={`${message.timestamp}-${index}`} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
