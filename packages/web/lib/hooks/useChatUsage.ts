import { Message } from "@ai-chat-app/db";
import { useMemo } from "react";

type Props = {
  messages: Message[];
  contextLength?: number | null;
};

export const useChatUsage = ({ messages, contextLength }: Props) => {
  const totalUsage = useMemo(
    () =>
      messages.reduce(
        (acc, message) => {
          acc.inputTokens += message.inputTokens || 0;
          acc.outputTokens += message.outputTokens || 0;
          return acc;
        },
        { inputTokens: 0, outputTokens: 0 }
      ),
    [messages]
  );

  const totalTokens = useMemo(
    () => totalUsage.inputTokens + totalUsage.outputTokens,
    [totalUsage]
  );
  const inputTokens = useMemo(() => totalUsage.inputTokens, [totalUsage]);

  const contextUsagePercentage = useMemo(
    () =>
      contextLength
        ? Math.min((inputTokens / contextLength) * 100, 100)
        : 0,
    [contextLength, inputTokens]
  );

  return { totalUsage, totalTokens, inputTokens, contextUsagePercentage };
};
