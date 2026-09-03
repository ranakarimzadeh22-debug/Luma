import "server-only";

import { randomUUID } from "node:crypto";
import { getLumaCorePool, withLumaCoreTransaction } from "@/lib/new-auth-db";
import type { NewPeriodEntry, NewPeriodInput } from "@/lib/new-period-validation";

type SaveResult =
  | { ok: true; entry: NewPeriodEntry }
  | { ok: false; reason: "overlap" | "not_found" };

interface PeriodRow {
  id: string;
  start_date: string;
  end_date: string;
}

function toEntry(row: PeriodRow): NewPeriodEntry {
  return { id: row.id, startDate: row.start_date, endDate: row.end_date };
}

export async function getNewPeriodEntries(userId: string): Promise<NewPeriodEntry[]> {
  const result = await getLumaCorePool().query<PeriodRow>(
    `SELECT id, start_date::text, end_date::text
     FROM new_period_entries
     WHERE user_id = $1
     ORDER BY start_date DESC`,
    [userId],
  );
  return result.rows.map(toEntry);
}

export async function createNewPeriodEntry(
  userId: string,
  input: NewPeriodInput,
): Promise<SaveResult> {
  return withLumaCoreTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [userId]);
    const overlap = await client.query(
      `SELECT 1 FROM new_period_entries
       WHERE user_id = $1 AND start_date <= $3 AND end_date >= $2
       LIMIT 1`,
      [userId, input.startDate, input.endDate],
    );
    if (overlap.rowCount) return { ok: false, reason: "overlap" };

    const result = await client.query<PeriodRow>(
      `INSERT INTO new_period_entries (id, user_id, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, start_date::text, end_date::text`,
      [randomUUID(), userId, input.startDate, input.endDate],
    );
    return { ok: true, entry: toEntry(result.rows[0]) };
  });
}

export async function updateNewPeriodEntry(
  userId: string,
  entryId: string,
  input: NewPeriodInput,
): Promise<SaveResult> {
  return withLumaCoreTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [userId]);
    const existing = await client.query(
      "SELECT 1 FROM new_period_entries WHERE id = $1 AND user_id = $2",
      [entryId, userId],
    );
    if (!existing.rowCount) return { ok: false, reason: "not_found" };

    const overlap = await client.query(
      `SELECT 1 FROM new_period_entries
       WHERE user_id = $1 AND id <> $2 AND start_date <= $4 AND end_date >= $3
       LIMIT 1`,
      [userId, entryId, input.startDate, input.endDate],
    );
    if (overlap.rowCount) return { ok: false, reason: "overlap" };

    const result = await client.query<PeriodRow>(
      `UPDATE new_period_entries
       SET start_date = $1, end_date = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, start_date::text, end_date::text`,
      [input.startDate, input.endDate, entryId, userId],
    );
    return { ok: true, entry: toEntry(result.rows[0]) };
  });
}

export async function deleteNewPeriodEntry(userId: string, entryId: string): Promise<boolean> {
  const result = await getLumaCorePool().query(
    "DELETE FROM new_period_entries WHERE id = $1 AND user_id = $2",
    [entryId, userId],
  );
  return result.rowCount === 1;
}
