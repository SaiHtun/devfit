import z from "zod";
import { loadEnvConfig } from "@next/env";

const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
const isProduction = process.env.NODE_ENV === "production";

loadEnvConfig(process.cwd(), isDevelopment);

const envSchema = z.object({
  SUPABASE_DATABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

  CRON_SECRET: z.string().optional(),
});

function validateEnv() {
  try {
    const parsedEnv = envSchema.parse(process.env);
    return parsedEnv;
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error("❌ Invalid environment variables: \n", e);
      process.exit(1);
    }
    throw e;
  }
}

const env = validateEnv();

export const config = {
  supabase: {
    databaseUrl: env.SUPABASE_DATABASE_URL,
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  nodeEnv: { isDevelopment, isProduction },
  cron_secret: env.CRON_SECRET,
};
console.log(process.env.NODE_ENV)
console.log(config)