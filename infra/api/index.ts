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

// CHATS
api.route("POST /chats/new", {
  handler: "packages/functions/src/chats/create-chat.handler",
  link: [DATABASE_URL],
});
