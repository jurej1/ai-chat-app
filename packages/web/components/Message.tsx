"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message as MessageType } from "@ai-chat-app/core";
import { useState } from "react";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex gap-4 p-4 ${
        message.role === "user" ? "bg-transparent" : "bg-foreground/5"
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center font-mono text-sm">
        {message.role === "user" ? "U" : "AI"}
      </div>

      <div className="flex-1 overflow-hidden">
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
      </div>
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
