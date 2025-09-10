import { defineConfig } from "drizzle-kit";
import { config } from "./app-config";

export default defineConfig({
  out: "./db/drizzle/migrations",
  schema: "./db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: config.supabase.databaseUrl,
  },
});
