import { ApiGwRequest, ApiGwResponse, commonHttp } from "@ai-chat-app/core";
import { getAllChats } from "@ai-chat-app/db";
import middy from "@middy/core";

export const handler = middy<ApiGwRequest, ApiGwResponse>()
  .use(commonHttp())
  .handler(async (event) => {
    const response = await getAllChats();

    return {
      statusCode: 200,
      body: response,
    };
  });
