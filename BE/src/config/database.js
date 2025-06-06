import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../models/schema.js";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./db.sqlite",
});

export const db = drizzle(client, { schema });

export async function runMigrations() {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrations completed");
}
