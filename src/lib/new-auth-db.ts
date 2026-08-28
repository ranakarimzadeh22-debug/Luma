import { Pool, type PoolClient } from "pg";

declare global {
  var lumaCorePool: Pool | undefined;
}

function getLumaCoreConnectionString(): string {
  const connectionString = process.env.LUMA_CORE_DATABASE_URL;
  if (!connectionString) {
    throw new Error("LUMA_CORE_DATABASE_URL ist nicht konfiguriert.");
  }

  let databaseName: string;
  try {
    databaseName = new URL(connectionString).pathname.replace(/^\//, "");
  } catch {
    throw new Error("LUMA_CORE_DATABASE_URL ist ungültig.");
  }

  if (databaseName !== "luma_core") {
    throw new Error("LUMA_CORE_DATABASE_URL muss auf die Datenbank luma_core zeigen.");
  }

  return connectionString;
}

export function getLumaCorePool(): Pool {
  if (!globalThis.lumaCorePool) {
    globalThis.lumaCorePool = new Pool({
      connectionString: getLumaCoreConnectionString(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalThis.lumaCorePool;
}

export async function withLumaCoreTransaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getLumaCorePool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
