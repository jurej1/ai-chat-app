export const webApp = new sst.aws.StaticSite("AiChatWebApp", {
  path: "packages/web",
  dev: {
    command: "npm run dev",
  },
  build: {
    output: "out",
    command: "npm run build",
  },
});
