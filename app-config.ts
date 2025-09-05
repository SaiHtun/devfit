import z from "zod";
import { loadEnvConfig } from "@next/env";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

loadEnvConfig(process.cwd(), isDevelopment);

const envSchema = z.object({
  SB_API_URL: z.url().optional(),
  SB_GRAPHQL_URL: z.url().optional(),
  SB_S3_STORAGE_URL: z.url().optional(),
  SB_STUDIO_URL: z.url().optional(),
  SB_INBUCKET_URL: z.url().optional(),
  SB_REGION: z.string().default("local"),
  SB_S3_SECRET_KEY: z.string().optional(),
  SB_ANON_KEY: z.string().optional(),
  SB_DATABASE_URL: z.url(),

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
    databaseUrl: env.SB_DATABASE_URL,
    anonKey: env.SB_ANON_KEY,
  },
  nodeEnv: { isDevelopment, isProduction },
  cron_secret: env.CRON_SECRET,
};
