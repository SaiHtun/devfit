import { defineConfig } from "drizzle-kit";
import { config } from "./app-config";

export default defineConfig({
  out: "./db/drizzle",
  schema: "./db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: config.supabase.databaseUrl,
  },
});
