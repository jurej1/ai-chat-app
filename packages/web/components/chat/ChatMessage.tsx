"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { MessageRole } from "@ai-chat-app/core";
import type { Message as MessageType } from "@ai-chat-app/db";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { MdOutlineContentCopy } from "react-icons/md";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: MessageProps) {
  const isUser = message.role === "user";
  const isError = message.content?.startsWith("Error:");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn("flex gap-4 p-4 items-start pr-12 relative border-l-2", {
        "bg-transparent border-transparent": isUser,
        "bg-foreground/5 border-transparent": !isUser && !isError,
        "bg-destructive/10 border-destructive": isError,
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        borderColor: isUser
          ? "transparent"
          : isError
          ? "oklch(0.704 0.191 22.216)"
          : "var(--cyber-cyan)",
        boxShadow: isUser
          ? "none"
          : isError
          ? "0 0 15px rgba(239, 68, 68, 0.3)"
          : "0 0 15px rgba(0, 230, 255, 0.15)",
      }}
      transition={{ duration: 0.2 }}
    >
      <EnhancedAvatar role={message.role} isError={isError} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {isStreaming && !isUser && (
          <motion.div
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--cyber-cyan)] to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        <Markdown message={message} />

        <div className="flex items-center gap-2 mt-2">
          {!isUser && (message.inputTokens || message.outputTokens) && (
            <MessageUsage
              inputTokens={message.inputTokens}
              outputTokens={message.outputTokens}
            />
          )}
          {!isUser && !isError && (
            <EnhancedCopyButton
              isHover={isHovered}
              content={message.content || ""}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Markdown({ message }: { message: MessageType }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");

            return match ? (
              <CodeBlock language={match[1]} code={codeContent} />
            ) : (
              <code
                className="bg-foreground/10 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 px-3 py-1 bg-foreground/10 hover:bg-foreground/20 rounded text-xs transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function EnhancedAvatar({
  role,
  isError,
}: {
  role: MessageRole;
  isError?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm border-2",
        {
          "bg-foreground/10 border-[var(--cyber-cyan)]": role === "user",
          "bg-[var(--cyber-purple)]/20 border-[var(--cyber-magenta)]":
            role === "assistant" && !isError,
          "bg-destructive/20 border-destructive": isError,
        }
      )}
      whileHover={{
        scale: 1.1,
        boxShadow: role === "user" ? "var(--glow-cyan)" : "var(--glow-magenta)",
      }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {role === "user" ? "U" : isError ? "!" : "AI"}
    </motion.div>
  );
}

function EnhancedCopyButton({
  isHover,
  content,
}: {
  isHover: boolean;
  content: string;
}) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }, [content]);

  return (
    <AnimatePresence>
      {isHover && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button size="icon-sm" variant="ghost" onClick={handleCopy} asChild>
            <motion.button
              whileHover={{
                scale: 1.15,
                boxShadow: "0 0 10px oklch(0.75 0.18 195 / 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <MdOutlineContentCopy />
            </motion.button>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MessageUsage({
  inputTokens,
  outputTokens,
}: {
  inputTokens: number | null;
  outputTokens: number | null;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex items-center gap-1">
        <span className="text-gray-400">In:</span>
        <span className="font-mono tabular-nums">
          {inputTokens?.toLocaleString() || 0}
        </span>
      </div>
      <span className="text-gray-400">•</span>
      <div className="flex items-center gap-1">
        <span className="text-gray-400">Out:</span>
        <span className="font-mono tabular-nums">
          {outputTokens?.toLocaleString() || 0}
        </span>
      </div>
    </div>
  );
}
