import { ApiGwRequest, ApiGwResponse, commonHttp } from "@ai-chat-app/core";
import { insertChat, InsertChat } from "@ai-chat-app/db";
import middy from "@middy/core";

export const handler = middy<
  ApiGwRequest<{ body: InsertChat }>,
  ApiGwResponse
>()
  .use(commonHttp())
  .handler(async (event) => {
    const data = event.body;

    const chat = await insertChat(data);

    return {
      statusCode: 200,
      body: chat,
    };
  });
