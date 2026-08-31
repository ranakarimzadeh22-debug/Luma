import pg from "pg";

const { Client } = pg;
const sourceConnection = process.env.DATABASE_URL;
const coreConnection = process.env.LUMA_CORE_DATABASE_URL;
if (!sourceConnection || !coreConnection) {
  throw new Error("DATABASE_URL und LUMA_CORE_DATABASE_URL werden für die Prüfung benötigt.");
}

async function inspect(label, connectionString) {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const identity = await client.query("SELECT current_database() AS database");
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    const summary = {
      label,
      database: identity.rows[0].database,
      tableCount: tables.rowCount,
      newAuthTables: tables.rows
        .map((row) => row.table_name)
        .filter((name) => name.startsWith("new_")),
    };
    if (label === "core" && summary.newAuthTables.length === 3) {
      const counts = await client.query(`
        SELECT
          (SELECT COUNT(*)::int FROM new_users) AS users,
          (SELECT COUNT(*)::int FROM new_sessions) AS sessions,
          (SELECT COUNT(*)::int FROM new_auth_rate_limits) AS rate_limits
      `);
      const firstNameColumn = await client.query(`
        SELECT is_nullable, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'new_users'
          AND column_name = 'first_name'
      `);
      const migrations = await client.query(
        "SELECT id FROM _luma_core_migrations ORDER BY id",
      );
      return {
        ...summary,
        rowCounts: counts.rows[0],
        firstNameColumn: firstNameColumn.rows[0] ?? null,
        migrations: migrations.rows.map((row) => row.id),
      };
    }
    return summary;
  } finally {
    await client.end();
  }
}

const result = await Promise.all([
  inspect("source", sourceConnection),
  inspect("core", coreConnection),
]);

if (result[0].database === result[1].database) {
  throw new Error("Datenbanktrennung fehlgeschlagen.");
}
if (result[0].newAuthTables.length !== 0 || result[1].newAuthTables.length !== 3) {
  throw new Error("Neue Auth-Tabellen sind nicht eindeutig von der alten Datenbank getrennt.");
}
if (!result[1].firstNameColumn || result[1].firstNameColumn.is_nullable !== "YES") {
  throw new Error("Die optionale Vornamensspalte für bestehende Konten fehlt in luma_core.");
}

console.log(JSON.stringify(result));
