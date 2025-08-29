import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnvVar } from "@/lib/utils";
import * as schema from "./schema";

const connectionString = getEnvVar("DATABASE_URL");

export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export type Database = typeof db;
