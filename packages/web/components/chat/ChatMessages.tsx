import { useState, useEffect } from "react";
import { Model } from "@openrouter/sdk/models";
import { Message as MessageType } from "@ai-chat-app/db";
import { ChatMessage } from "./ChatMessage";
import { NoModalSelected } from "./ChatNoModelSelected";
import { Spinner } from "../ui/spinner";
import { useSelectedChatStore } from "@/lib/store/selectedChatStore";
import { useChatMessages } from "@/lib/hooks/useChatMessages";
import { useModelSelectionStore } from "@/lib/store/useModelSelectionStore";
import { motion, AnimatePresence } from "motion/react";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";

type Props = {
  messages: MessageType[];
  isStreaming: boolean;
};

export function ChatMessages({ messages, isStreaming }: Props) {
  const selectedModel = useModelSelectionStore((s) => s.selectedModel);
  const { selectedChat } = useSelectedChatStore();
  const { isLoading } = useChatMessages(selectedChat?.id);

  const showTyping =
    isStreaming && messages[messages.length - 1]?.content === "";

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Spinner className="w-8 h-8 text-[var(--cyber-cyan)]" />
          <motion.p
            className="text-sm text-foreground/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading chat history...
          </motion.p>
        </div>
      ) : messages.length === 0 ? (
        !selectedModel ? (
          <NoModalSelected />
        ) : (
          <EmptyState />
        )
      ) : (
        <div>
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                }}
              >
                <ChatMessage
                  message={message}
                  isStreaming={isStreaming && index === messages.length - 1}
                />
              </motion.div>
            ))}

            {showTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
