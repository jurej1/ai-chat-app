import { DATABASE_URL } from "../secrets";

export const api = new sst.aws.ApiGatewayV2("AiChatAPI", {
  cors: {
    allowOrigins: ["*"],
  },
});

// MESSAGES
api.route("POST /messages/new", {
  handler: "packages/functions/src/messages/create-message.handler",
  link: [DATABASE_URL],
});

api.route("GET /messages/{chatId}", {
  handler: "packages/functions/src/messages/get-messages-by-chat-id.handler",
  link: [DATABASE_URL],
});

// CHATS
api.route("POST /chats/new", {
  handler: "packages/functions/src/chats/create-chat.handler",
  link: [DATABASE_URL],
});

api.route("GET /chats", {
  handler: "packages/functions/src/chats/get-chats.handler",
  link: [DATABASE_URL],
});
