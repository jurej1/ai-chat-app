# Implementation Guide: Adding Non-Streaming Chat Completions to ai-chat-app

## Overview

This implementation guide details how to add non-streaming chat completions to the ai-chat-app, leveraging the OpenRouter SDK's `chat.send` method. The current implementation in `packages/web/lib/api.ts` only supports streaming responses via `streamChatResponse`, which processes the conversation history incompletely by only passing the last message's content. The new non-streaming feature will support the full messages array for proper conversation context, along with advanced parameters like temperature and maxTokens.

The feature introduces a new asynchronous function `getChatCompletion` that returns the complete response as a string, suitable for scenarios where instant full responses are preferred over real-time streaming.

## Benefits for the App

- **Improved Conversation Context**: By passing the full messages array, the AI can maintain better context across the conversation history, leading to more coherent and relevant responses.
- **Flexibility in Response Handling**: Non-streaming allows for different UI patterns, such as displaying responses after full generation or integrating with caching mechanisms.
- **Advanced Parameter Control**: Support for temperature (randomness) and maxTokens (response length) enables fine-tuning of response style and cost.
- **Error Handling**: Simplified error management compared to streaming, with full response available for logging or retry logic.
- **Performance Optimization**: Potential for caching full responses or batch processing in future enhancements.

## Step-by-Step Code Changes

### 1. Update `packages/web/lib/api.ts`

Add a new function `getChatCompletion` alongside the existing `streamChatResponse`. This function will use `openrouter.chat.send` with `stream: false`.

```typescript
import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";
import type { Message } from "@ai-chat-app/core";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

// Existing streaming function remains unchanged
export async function* streamChatResponse(
  messages: Message[],
  model: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  // ... existing implementation
}

// New non-streaming function
export async function getChatCompletion(
  messages: Message[],
  model: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
  }
): Promise<string> {
  try {
    const result = await openrouter.chat.send(
      {
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
      },
      {
        signal: options?.signal,
      }
    );

    return result.choices[0].message.content;
  } catch (error) {
    console.error("Chat completion error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get chat completion"
    );
  }
}
```

**Key Changes:**

- Import remains the same.
- New function accepts the full `messages` array, mapping to the required format (role, content).
- Uses `chat.send` with `stream: false`.
- Includes optional parameters for temperature and maxTokens.
- Error handling mirrors the streaming function for consistency.

### 2. Update Chat Hook (`packages/web/lib/hooks/useChat.ts`)

Assuming `useChat` exists and handles chat logic, add support for non-streaming mode.

```typescript
// Assuming existing useChat hook structure
export function useChat() {
  // ... existing state and streaming logic

  const sendNonStreamingMessage = useCallback(
    async (
      messages: Message[],
      model: string,
      options?: { temperature?: number; maxTokens?: number }
    ) => {
      // ... logic to call getChatCompletion and update chat state
    },
    []
  );

  return {
    // ... existing returns
    sendNonStreamingMessage,
  };
}
```

**Integration:**

- Add a new method to handle non-streaming responses.
- Update chat state with the full response once received.
- Ensure compatibility with existing message history management.

### 3. Update Types if Needed

No changes required to core types (`packages/core/src/types/types.ts`), as `Message` interface is compatible with OpenRouter's expected format.

## Sample Code Snippets

### Basic Usage

```typescript
import { getChatCompletion } from "@/lib/api";
import type { Message } from "@ai-chat-app/core";

const messages: Message[] = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Explain quantum computing in simple terms." },
];

const response = await getChatCompletion(messages, "openai/gpt-4", {
  temperature: 0.7,
  maxTokens: 500,
});

console.log(response); // Full response string
```

### With AbortController

```typescript
const controller = new AbortController();
const signal = controller.signal;

// Start request
const promise = getChatCompletion(messages, model, { signal });

// Abort if needed
controller.abort();
```

### Hook Integration Example

```typescript
const { messages, addMessage, sendNonStreamingMessage } = useChat();

const handleSend = async () => {
  const newMessage: Message = { role: "user", content: inputValue };
  addMessage(newMessage);

  const response = await sendNonStreamingMessage(
    [...messages, newMessage],
    selectedModel,
    {
      temperature: 0.7,
      maxTokens: 300,
    }
  );

  addMessage({ role: "assistant", content: response });
};
```

## UI Integration Suggestions

### Toggle in ChatUI Component

Add a toggle switch in `packages/web/components/chat/ChatUI.tsx` to choose between streaming and non-streaming modes.

```tsx
import { Switch } from "@/components/ui/switch";

// In ChatUI component
const [useStreaming, setUseStreaming] = useState(true);

// In render
<div className="flex items-center space-x-2">
  <Switch checked={useStreaming} onCheckedChange={setUseStreaming} />
  <label>Use Streaming</label>
</div>;
```

### Update ChatInput or Send Logic

Modify the send message handler to conditionally use streaming or non-streaming based on the toggle.

```tsx
const handleSendMessage = async () => {
  if (useStreaming) {
    // Use existing streaming logic
    await sendStreamingMessage();
  } else {
    // Use new non-streaming logic
    await sendNonStreamingMessage();
  }
};
```

### Loading States

For non-streaming, show a loading indicator while awaiting the full response.

```tsx
const [isLoading, setIsLoading] = useState(false);

const sendNonStreamingMessage = async () => {
  setIsLoading(true);
  try {
    const response = await getChatCompletion(messages, model);
    // Update UI
  } finally {
    setIsLoading(false);
  }
};
```

## Potential Challenges

- **Rate Limiting**: Non-streaming requests may be subject to different rate limits than streaming. Monitor API usage.
- **Timeout Handling**: Full responses might take longer for complex queries, potentially requiring timeout adjustments.
- **Cost Implications**: Higher maxTokens can increase costs; implement sensible defaults and user controls.
- **Error Consistency**: Ensure error handling aligns with existing streaming error patterns for UI consistency.
- **Type Compatibility**: Verify that Message.timestamp (optional) doesn't conflict with OpenRouter API expectations.
- **Concurrency**: If multiple requests are sent, manage state properly to avoid race conditions.
- **Model Compatibility**: Not all models may support all parameters equally; add validation or fallbacks.

## Testing Notes

### Unit Tests for API Function

```typescript
// In api.test.ts or similar
describe("getChatCompletion", () => {
  it("should return a complete response for valid input", async () => {
    const messages: Message[] = [{ role: "user", content: "Hello" }];
    const response = await getChatCompletion(messages, "openai/gpt-3.5-turbo");
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  });

  it("should handle temperature parameter", async () => {
    // Test with different temperatures
  });

  it("should throw on invalid model", async () => {
    // Test error handling
  });
});
```

### Integration Tests

- Test with various message histories (system, user, assistant combinations).
- Verify conversation context is maintained correctly.
- Test abort signal functionality.
- Performance test with large message arrays.

### UI Tests

- Toggle functionality between streaming and non-streaming.
- Loading states during non-streaming requests.
- Error display and retry mechanisms.
- Compatibility with existing chat features (model selection, etc.).

### Manual Testing Checklist

- [ ] Send simple messages in non-streaming mode.
- [ ] Test with multi-turn conversations.
- [ ] Adjust temperature and maxTokens, observe response changes.
- [ ] Trigger errors (invalid model, network issues) and verify handling.
- [ ] Use abort functionality during long responses.
- [ ] Switch between streaming and non-streaming modes seamlessly.
