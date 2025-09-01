import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "@/app-config";

export const client = postgres(config.supabase.databaseUrl, { prepare: false });
export const db = drizzle(client, { schema });

export type Database = typeof db;
