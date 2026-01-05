export const api = new sst.aws.ApiGatewayV2("AiChatAPI", {
  cors: {
    allowOrigins: ["*"],
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "OPTIONS"],
  },
});

// Chat route removed - now handled client-side
// Future server-side routes can be added here
