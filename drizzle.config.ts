import { defineConfig } from "drizzle-kit";
import { getEnvVar } from "./lib/utils";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getEnvVar("DATABASE_URL"),
  },
});
