import { api } from "../api";
import { OPENROUTER_API_KEY } from "../secrets";

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
    NEXT_PUBLIC_OPENROUTER_API_KEY: OPENROUTER_API_KEY.value,
  },
});
