import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_OPENROUTER_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_OPENROUTER_API_KEY is required"),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_OPENROUTER_API_KEY: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = validateEnv();
