import { ApiGwRequest, ApiGwResponse, commonHttp } from "@ai-chat-app/core";
import { getMessagesByChatId } from "@ai-chat-app/db";
import middy from "@middy/core";

export const handler = middy<
  ApiGwRequest<{
    pathParameters: { chatId: string };
  }>,
  ApiGwResponse
>()
  .use(commonHttp())
  .handler(async (event) => {
    const id = event.pathParameters.chatId;

    const response = await getMessagesByChatId(id);

    return {
      statusCode: 200,
      body: response,
    };
  });
