# Tool/Function Calling Implementation Guide for AI Chat App

## Overview

Tool calling (also known as function calling) is a feature supported by the OpenRouter SDK that allows the AI model to invoke external functions during a conversation. This enables the AI to access real-time data, perform calculations, or interact with external APIs without leaving the chat interface. When the AI decides to call a tool, the response includes a `tool_calls` array, which the application must process by executing the corresponding functions and sending the results back to the model in a follow-up message.

This feature enhances the chat app by enabling integrations such as weather APIs, calculators, database queries, or any custom logic defined as functions. It ensures compatibility with the existing `Message` type from the OpenRouter SDK, where messages can now include tool call responses.

## Benefits

- **Integrations**: Seamlessly connect to external services like weather APIs, search engines, or custom business logic.
- **Dynamic Responses**: Provide real-time, context-aware answers based on function outputs.
- **Enhanced User Experience**: Users can request actions (e.g., "What's the weather in New York?") and receive direct results without manual intervention.
- **Modularity**: Tools can be added or removed dynamically, allowing for scalable and maintainable code.
- **Security**: Functions are executed on the server-side, reducing risks associated with client-side scripting.

## Step-by-Step Code Changes

The implementation involves modifying the chat logic in `packages/web/lib/api.ts` (or equivalent) to support tools in `chat.send`, handling tool calls in responses, executing functions, and sending results back. Ensure all changes maintain compatibility with the existing `Message` interface.

### 1. Define Tools

Create an array of tool definitions. Each tool is an object with `name`, `description`, and `parameters` (a JSON schema).

Example in `packages/web/lib/api.ts`:

```typescript
const tools = [
  {
    name: "get_weather",
    description: "Get the current weather for a specified city",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The name of the city",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "calculate_sum",
    description: "Calculate the sum of two numbers",
    parameters: {
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" },
      },
      required: ["a", "b"],
    },
  },
];
```

### 2. Modify `chat.send` to Include Tools

Pass the `tools` array to the `chat.send` method. This informs the model about available functions.

Updated `sendChatMessage` function in `packages/web/lib/api.ts`:

```typescript
export async function sendChatMessage(
  messages: Message[],
  model: string
): Promise<Message> {
  const response = await chat.send({
    messages,
    model,
    tools, // Add this line
  });

  return response;
}
```

### 3. Handle Tool Calls in Responses

After receiving a response from `chat.send`, check if it contains `tool_calls`. If so, execute the functions and prepare a new message with the results.

Extend the chat logic in `packages/web/lib/hooks/useChat.ts` or wherever messages are processed:

```typescript
// In your chat hook or API wrapper
const response = await sendChatMessage(messages, model);

if (response.tool_calls) {
  const toolResults = await Promise.all(
    response.tool_calls.map(async (toolCall) => {
      const { name, arguments: args } = toolCall.function;
      const result = await executeTool(name, JSON.parse(args));
      return {
        tool_call_id: toolCall.id,
        role: "tool",
        name,
        content: JSON.stringify(result),
      };
    })
  );

  // Send follow-up message with tool results
  const followUpMessage = {
    role: "tool",
    content: "", // Empty for tool results
    tool_calls: response.tool_calls,
    // Include toolResults as part of the message if needed
  };

  // Append toolResults to messages array
  messages.push(followUpMessage);
  messages.push(...toolResults);

  // Recurse or send another request
  return await sendChatMessage(messages, model);
}

return response;
```

### 4. Implement Tool Execution

Create a function to execute tools based on name and arguments.

Add to `packages/web/lib/api.ts`:

```typescript
async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "get_weather":
      return await fetchWeather(args.city);
    case "calculate_sum":
      return args.a + args.b;
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Example implementation
async function fetchWeather(city: string): Promise<any> {
  const apiKey = process.env.WEATHER_API_KEY;
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`
  );
  const data = await response.json();
  return {
    temperature: data.current.temp_c,
    condition: data.current.condition.text,
  };
}
```

### 5. Send Results Back

As shown in step 3, tool results are sent in follow-up messages with `role: "tool"`. Ensure the `Message` type supports this.

### 6. UI Suggestions

- **Tool Configuration Panel**: Add a settings panel in `packages/web/components/chat/ChatUI.tsx` where users can enable/disable tools.
- **Display Tool Calls**: In `ChatMessages.tsx`, show when a tool is being called (e.g., "Getting weather...") and display results inline.
- **Tool Selector**: A dropdown or checkboxes in the chat input area to specify which tools are active for the conversation.

Example UI snippet (pseudo-code for `ChatUI.tsx`):

```tsx
import { Switch } from "@/components/ui/switch";

const [toolsEnabled, setToolsEnabled] = useState(true);

return (
  <div>
    <Switch
      checked={toolsEnabled}
      onCheckedChange={setToolsEnabled}
      label="Enable Tools"
    />
    {/* Pass toolsEnabled to chat logic */}
  </div>
);
```

## Error Handling

- **Invalid Tool Calls**: If `tool_calls` contains unknown tools, log an error and return a user-friendly message like "Sorry, that tool is not available."
- **Execution Errors**: Wrap `executeTool` in try-catch. If a tool fails (e.g., API error), send an error message back to the model.
- **Rate Limiting**: Implement throttling for tool executions to prevent abuse.
- **Logging**: Log all tool calls and results for debugging.

Example:

```typescript
async function executeTool(name: string, args: any): Promise<any> {
  try {
    // ... execution logic
  } catch (error) {
    console.error(`Tool execution failed: ${name}`, error);
    return { error: "Tool execution failed" };
  }
}
```

## Testing

- **Unit Tests**: Test `executeTool` for each function with mock inputs/outputs.
- **Integration Tests**: Simulate full conversations with tool calls using a test harness for OpenRouter SDK.
- **UI Tests**: Verify tool configuration panel updates state correctly.
- **Edge Cases**: Test with no tools, multiple tool calls, and error scenarios.

Example test in `packages/web/__tests__/api.test.ts`:

```typescript
test("executeTool calculates sum correctly", async () => {
  const result = await executeTool("calculate_sum", { a: 5, b: 10 });
  expect(result).toBe(15);
});
```

This guide provides a complete roadmap for implementing tool calling while maintaining the app's existing architecture.
