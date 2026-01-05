import { GEMINI_API_KEY } from "../secrets";

export const api = new sst.aws.ApiGatewayV2("AiChatAPI", {
  cors: {
    allowOrigins: ["*"],
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "OPTIONS"],
  },
});

api.route("POST /chat", {
  handler: "packages/functions/src/chat.handler",
  link: [GEMINI_API_KEY],
});
