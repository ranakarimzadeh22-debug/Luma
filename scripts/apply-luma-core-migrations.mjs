import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const migrationId = "202608261700_new_auth";
const migrationPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "database",
  "luma-core",
  "migrations",
  `${migrationId}.sql`,
);

const connectionString = process.env.LUMA_CORE_DATABASE_URL;
if (!connectionString) throw new Error("LUMA_CORE_DATABASE_URL fehlt.");

const configuredDatabase = new URL(connectionString).pathname.replace(/^\//, "");
if (configuredDatabase !== "luma_core") {
  throw new Error("Migration gestoppt: Ziel muss luma_core sein.");
}

const client = new Client({ connectionString });
await client.connect();

try {
  const identity = await client.query("SELECT current_database() AS database");
  if (identity.rows[0]?.database !== "luma_core") {
    throw new Error("Migration gestoppt: verbundene Datenbank ist nicht luma_core.");
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS _luma_core_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await client.query(
    "SELECT 1 FROM _luma_core_migrations WHERE id = $1",
    [migrationId],
  );
  if (existing.rowCount) {
    console.log(`Migration bereits angewendet: ${migrationId}`);
    process.exitCode = 0;
  } else {
    const sql = await readFile(migrationPath, "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO _luma_core_migrations (id) VALUES ($1)", [migrationId]);
      await client.query("COMMIT");
      console.log(`Migration angewendet: ${migrationId}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
