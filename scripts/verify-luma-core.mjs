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
      return { ...summary, rowCounts: counts.rows[0] };
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

console.log(JSON.stringify(result));
