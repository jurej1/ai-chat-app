import { OpenResponsesUsage } from "@openrouter/sdk/models";

export function ChatUsageBox({ usage }: { usage: OpenResponsesUsage }) {
  return (
    <div className="flex p-2 bg-gray-100 shadow rounded-md border text-sm">
      Usage: {usage?.inputTokens} {"\u2192"} {usage.outputTokens}
    </div>
  );
}
