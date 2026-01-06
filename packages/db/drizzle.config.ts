import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/schemas/**/*.sql.ts"],
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
