# Implementation Guide: Adding Text Completions to ai-chat-app

## Overview

This implementation guide details how to add text completions (non-chat) to the ai-chat-app, leveraging the OpenRouter SDK's `completions.generate()` method. The current app is chat-focused with `chat.send()` for conversational interactions, but text completions provide single-prompt text generation capabilities for non-conversational use cases. This feature enables users to generate text for writing tasks, code snippets, summaries, and other creative or productive activities without the conversational context of chat models.

The implementation introduces a new asynchronous function `generateCompletion` that accepts a prompt string and returns generated text, suitable for standalone text generation scenarios. The feature integrates seamlessly with the existing model selection and maintains consistency with the app's architecture.

## Benefits for the App

- **Expanded Use Cases**: Enables creative writing, code generation, content creation, and other non-conversational AI tasks beyond chat interactions.
- **Complementary to Chat**: Provides a dedicated interface for text generation while preserving the chat experience for conversations.
- **Flexible Text Generation**: Supports various parameters like temperature, maxTokens, and stop sequences for fine-tuned output control.
- **Improved User Productivity**: Users can generate blog posts, emails, code snippets, or summaries in a focused, non-chat environment.
- **Cost Efficiency**: Completions models may offer different pricing structures optimized for text generation tasks.
- **Model Diversity**: Access to completion-specific models like GPT-3.5-turbo-instruct alongside chat models.
- **Standalone Functionality**: Can operate independently of chat history, making it suitable for isolated text generation tasks.

## Step-by-Step Code Changes

### 1. Update `packages/web/lib/api.ts`

Add a new function `generateCompletion` alongside the existing chat functions. This function will use `openrouter.completions.generate()` with appropriate parameters.

```typescript
import { OpenRouter } from "@openrouter/sdk";
import { env } from "./env";

const openrouter = new OpenRouter({
  apiKey: env.NEXT_PUBLIC_OPENROUTER_API_KEY,
});

// Existing chat functions remain unchanged
export async function* streamChatResponse(
  messages: Message[],
  model: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  // ... existing implementation
}

// New text completion function
export async function generateCompletion(
  prompt: string,
  model: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    signal?: AbortSignal;
  }
): Promise<string> {
  try {
    const result = await openrouter.completions.generate(
      {
        model,
        prompt,
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
        topP: options?.topP,
        frequencyPenalty: options?.frequencyPenalty,
        presencePenalty: options?.presencePenalty,
        stop: options?.stop,
      },
      {
        signal: options?.signal,
      }
    );

    return result.choices[0].text;
  } catch (error) {
    console.error("Text completion error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate completion"
    );
  }
}
```

**Key Changes:**

- Added `generateCompletion` function that uses `openrouter.completions.generate()`
- Accepts standard completion parameters: maxTokens, temperature, topP, penalties, stop sequences
- Supports AbortSignal for request cancellation
- Error handling matches existing patterns for consistency
- Returns the generated text directly as a string

### 2. Create Completion UI Component (`packages/web/components/CompletionUI.tsx`)

Create a new component for the text completions interface, separate from the chat UI.

```tsx
"use client";

import { useState } from "react";
import { generateCompletion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelSelector } from "@/components/ModelSelector";
import { useModels } from "@/lib/hooks/useModels";

interface CompletionUIProps {
  onSwitchToChat?: () => void;
}

export function CompletionUI({ onSwitchToChat }: CompletionUIProps) {
  const {
    models,
    selectedModel,
    setSelectedModel,
    isLoading: modelsLoading,
  } = useModels();
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxTokens, setMaxTokens] = useState(500);
  const [temperature, setTemperature] = useState(0.7);

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsGenerating(true);
    try {
      const result = await generateCompletion(prompt, selectedModel.id, {
        maxTokens,
        temperature,
      });
      setCompletion(result);
    } catch (error) {
      console.error("Generation failed:", error);
      setCompletion("Error generating completion. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Text Completions</h1>
        {onSwitchToChat && (
          <Button variant="outline" onClick={onSwitchToChat}>
            Switch to Chat
          </Button>
        )}
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <ModelSelector
            models={models}
            selectedModelId={selectedModel?.id || null}
            onSelectModel={(model) => setSelectedModel(model)}
            isLoading={modelsLoading}
          />
        </CardContent>
      </Card>

      {/* Generation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Tokens: {maxTokens}
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your prompt for text completion..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || !selectedModel || isGenerating}
          size="lg"
          className="px-8"
        >
          {isGenerating ? "Generating..." : "Generate Completion"}
        </Button>
      </div>

      {/* Result */}
      {completion && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg min-h-[200px]">
              {completion}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Key Changes:**

- Separate component for completions interface
- Model selection integration with existing ModelSelector
- Parameter controls for maxTokens and temperature
- Prompt input textarea
- Generation button with loading states
- Result display with formatted text
- Option to switch back to chat mode

### 3. Update App Layout for Mode Switching

Modify the main page or layout to allow switching between chat and completion modes.

```tsx
// In packages/web/app/page.tsx
"use client";

import { useState } from "react";
import { ChatUI } from "@/components/chat/ChatUI";
import { CompletionUI } from "@/components/CompletionUI";

export default function Home() {
  const [mode, setMode] = useState<"chat" | "completion">("chat");

  return (
    <div className="h-screen">
      {mode === "chat" ? (
        <ChatUI onSwitchToCompletion={() => setMode("completion")} />
      ) : (
        <CompletionUI onSwitchToChat={() => setMode("chat")} />
      )}
    </div>
  );
}
```

## Sample Code Snippets

### Basic Completion Usage

```typescript
import { generateCompletion } from "@/lib/api";

const prompt = "Write a haiku about artificial intelligence";
const completion = await generateCompletion(
  prompt,
  "openai/gpt-3.5-turbo-instruct",
  {
    maxTokens: 100,
    temperature: 0.7,
  }
);

console.log(completion); // "Digital mind awakens\nCircuits dream in silicon\nWisdom blossoms forth"
```

### Advanced Parameters

```typescript
const creativeWriting = await generateCompletion(
  "Once upon a time in a futuristic city,",
  "openai/gpt-4",
  {
    maxTokens: 500,
    temperature: 0.8,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.3,
    stop: ["\n\n", "The End"],
  }
);
```

### With AbortController

```typescript
const controller = new AbortController();

const promise = generateCompletion(prompt, model, {
  signal: controller.signal,
  maxTokens: 200,
});

// To cancel the request
controller.abort();
```

## UI Integration Suggestions

### Tab-Based Navigation

Add tabs to switch between chat and completions.

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="chat">
  <TabsList>
    <TabsTrigger value="chat">Chat</TabsTrigger>
    <TabsTrigger value="completions">Completions</TabsTrigger>
  </TabsList>
  <TabsContent value="chat">
    <ChatUI />
  </TabsContent>
  <TabsContent value="completions">
    <CompletionUI />
  </TabsContent>
</Tabs>;
```

### Side Panel for Quick Completions

Add a collapsible side panel for quick completion tasks during chat sessions.

```tsx
const [showCompletions, setShowCompletions] = useState(false);

// In ChatUI layout
<div className="flex h-full">
  <div className="flex-1">
    <ChatInterface />
  </div>
  {showCompletions && (
    <div className="w-96 border-l">
      <CompletionUI />
    </div>
  )}
</div>;
```

### Completion Templates

Provide predefined prompt templates for common tasks.

```tsx
const templates = [
  { name: "Code Snippet", prompt: "Write a JavaScript function to " },
  {
    name: "Blog Post",
    prompt: "Write an introduction paragraph for a blog post about ",
  },
  { name: "Email Draft", prompt: "Write a professional email regarding " },
];

const applyTemplate = (template: (typeof templates)[0]) => {
  setPrompt(template.prompt);
};
```

## Error Handling

### Network Errors

```typescript
try {
  const result = await generateCompletion(prompt, model, options);
  setCompletion(result);
} catch (error) {
  if (error.name === "AbortError") {
    // Handle user cancellation
    return;
  }
  if (error.message.includes("rate limit")) {
    setError("Rate limit exceeded. Please try again later.");
  } else if (error.message.includes("model not found")) {
    setError("Selected model is not available for completions.");
  } else {
    setError(
      "Failed to generate completion. Please check your connection and try again."
    );
  }
}
```

### Model Compatibility

```typescript
// Check if model supports completions before generating
const supportsCompletions = (modelId: string) => {
  // Completion models typically don't have "turbo" in name for older models
  // or check model capabilities if available
  return !modelId.includes("gpt-4-turbo") || modelId.includes("instruct");
};

if (!supportsCompletions(selectedModel.id)) {
  setError(
    "Selected model may not support text completions. Try a completion-optimized model."
  );
}
```

### Parameter Validation

```typescript
const validateParams = (options: CompletionOptions) => {
  if (
    options.maxTokens &&
    (options.maxTokens < 1 || options.maxTokens > 4096)
  ) {
    throw new Error("maxTokens must be between 1 and 4096");
  }
  if (
    options.temperature &&
    (options.temperature < 0 || options.temperature > 2)
  ) {
    throw new Error("temperature must be between 0 and 2");
  }
};
```

## Testing Notes

### Unit Tests for API Function

```typescript
// In api.test.ts
describe("generateCompletion", () => {
  it("should generate completion for valid prompt", async () => {
    const result = await generateCompletion(
      "Hello world",
      "openai/gpt-3.5-turbo-instruct"
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle temperature parameter", async () => {
    const result1 = await generateCompletion("Test", "model", {
      temperature: 0,
    });
    const result2 = await generateCompletion("Test", "model", {
      temperature: 1,
    });
    // Results should be deterministic vs random
  });

  it("should throw on invalid model", async () => {
    await expect(generateCompletion("test", "invalid-model")).rejects.toThrow();
  });

  it("should respect abort signal", async () => {
    const controller = new AbortController();
    const promise = generateCompletion("test", "model", {
      signal: controller.signal,
    });
    controller.abort();
    await expect(promise).rejects.toThrow("Aborted");
  });
});
```

### Integration Tests

- Test with various prompt lengths (short, long, empty)
- Verify parameter effects on output (temperature, maxTokens)
- Test stop sequences functionality
- Check compatibility with different completion models
- Validate error handling for network failures

### UI Tests

```typescript
// CompletionUI.test.tsx
describe("CompletionUI", () => {
  it("should display generated text after completion", async () => {
    render(<CompletionUI />);

    const textarea = screen.getByPlaceholderText(/Enter your prompt/);
    const button = screen.getByText("Generate Completion");

    fireEvent.change(textarea, { target: { value: "Test prompt" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Generated Text/)).toBeInTheDocument();
    });
  });

  it("should disable generate button when no prompt", () => {
    render(<CompletionUI />);
    const button = screen.getByText("Generate Completion");
    expect(button).toBeDisabled();
  });

  it("should show loading state during generation", async () => {
    // Mock slow API call
    render(<CompletionUI />);
    // ... test loading indicator
  });
});
```

### Manual Testing Checklist

- [ ] Generate completions with different models
- [ ] Test parameter variations (temperature, maxTokens)
- [ ] Verify stop sequences work correctly
- [ ] Test cancellation with abort controller
- [ ] Check error handling for invalid models
- [ ] Validate UI responsiveness on mobile
- [ ] Test switching between chat and completion modes
- [ ] Verify completion results preserve formatting
- [ ] Test with long prompts and responses
- [ ] Check accessibility (keyboard navigation, screen readers)

### E2E Tests

```typescript
// cypress/integration/completions.spec.js
describe("Text Completions", () => {
  it("should generate completion from prompt", () => {
    cy.visit("/");
    cy.contains("Completions").click();
    cy.get("textarea").type("Write a short poem about coding");
    cy.contains("Generate Completion").click();
    cy.get("[data-testid='completion-result']").should("be.visible");
  });

  it("should handle parameter changes", () => {
    cy.visit("/completions");
    cy.get("input[type='range']").first().invoke("val", 100).trigger("change");
    // Verify parameter display updates
  });
});
```

This implementation provides a comprehensive text completions feature that complements the existing chat functionality while maintaining architectural consistency and user experience standards.
