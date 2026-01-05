import { ApiGwRequest, ChatRequest } from "@ai-chat-app/core";
import { genai } from "@ai-chat-app/core";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpJsonBodyParser from "@middy/http-json-body-parser";

const lambdaHandler = async (
  event: ApiGwRequest<{
    body: ChatRequest;
  }>
) => {
  try {
    const { messages } = event.body;

    if (!messages || messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Messages array is required" }),
      };
    }

    // Convert messages to Gemini format
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    console.log(`Using model: gemini-2.5-flash`);
    console.log(`Number of messages: ${messages.length}`);
    console.log(
      `Estimated input tokens: ${contents.reduce(
        (sum, c) => sum + c.parts[0].text.length / 4,
        0
      )}`
    );

    // Stream response in SSE format
    const response = await genai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
    });

    let streamBody = "";

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        streamBody += `data: ${JSON.stringify({ type: "content", content: text })}\n\n`;
      }
    }

    // Send done event
    streamBody += `data: ${JSON.stringify({ type: "done" })}\n\n`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
      body: streamBody,
    };
  } catch (error) {
    console.error("Error in chat handler:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

export const handler = middy(lambdaHandler)
  .use(httpJsonBodyParser())
  .use(httpCors());
