import { useCallback } from "react";
import type { Message } from "@ai-chat-app/db";

import { Progress } from "../ui/progress";
import { useChatUsage } from "@/lib/hooks/useChatUsage";
import { useModelSelectionStore } from "@/lib/store/useModelSelectionStore";

interface ChatUsageBoxProps {
  messages: Message[];
}

export function ChatUsageBox({ messages }: ChatUsageBoxProps) {
  const { inputTokens, totalTokens, contextUsagePercentage, totalUsage } =
    useChatUsage({ messages });

  const contextLength = useModelSelectionStore(
    (s) => s.selectedModel?.contextLength
  );

  const getContextColor = useCallback((percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  }, []);

  return (
    <div className="flex flex-col gap-2 p-2.5 bg-linear-to-r from-gray-50 to-gray-100 shadow-sm rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 text-xs">
        <span className="font-medium text-gray-600">Total Token Usage:</span>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Input</span>
          <span className="font-semibold text-blue-600 tabular-nums">
            {inputTokens.toLocaleString()}
          </span>
        </div>

        <span className="text-gray-400">{"\u2192"}</span>

        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Output</span>
          <span className="font-semibold text-green-600 tabular-nums">
            {totalUsage.outputTokens.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto pl-3 border-l border-gray-300">
          <span className="text-gray-500">Total</span>
          <span className="font-semibold text-gray-700 tabular-nums">
            {totalTokens.toLocaleString()}
          </span>
        </div>
      </div>

      {contextLength && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 whitespace-nowrap">Context:</span>
          <Progress
            value={contextUsagePercentage}
            className="flex-1 bg-gray-200"
            indicatorClassName={getContextColor(contextUsagePercentage)}
          />
          <span className="text-gray-600 tabular-nums whitespace-nowrap">
            {inputTokens.toLocaleString()} / {contextLength.toLocaleString()}
            <span className="text-gray-400 ml-1">
              ({contextUsagePercentage.toFixed(1)}%)
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
