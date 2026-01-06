import { ApiGwRequest, ApiGwResponse, commonHttp } from "@ai-chat-app/core";
import { insertChat, insertMessage, InsertMessage } from "@ai-chat-app/db";
import middy from "@middy/core";

export const handler = middy<
  ApiGwRequest<{ body: Omit<InsertMessage, "chatId"> & { chatId?: string } }>,
  ApiGwResponse
>()
  .use(commonHttp())
  .handler(async (event) => {
    const data = event.body;

    if (data.chatId) {
      const response = await insertMessage(data as InsertMessage);

      return {
        statusCode: 200,
        // TODO: Doublecheck if this is typesafe
        body: response[0],
      };
    } else {
      //TODO: title chat can be null. send to SQS to generate AI title
      const results = await insertChat({});

      if (results.length !== 0) {
        const chat = results[0];

        const response = await insertMessage({
          content: data.content,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          role: data.role,
          chatId: chat.id,
        });

        return {
          statusCode: 200,
          // TODO: Doublecheck if this is typesafe
          body: response[0],
        };
      }

      throw new Error("Unable to create Chat.");
    }
  });
