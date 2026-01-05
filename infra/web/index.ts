import { api } from "../api";

export const webApp = new sst.aws.StaticSite("AiChatWebApp", {
  path: "packages/web",
  dev: {
    command: "npm run dev",
  },
  build: {
    output: "out",
    command: "npm run build",
  },
  environment: {
    NEXT_PUBLIC_API_URL: api.url,
  },
});
