import "server-only";

import { randomUUID } from "node:crypto";
import { getLumaCorePool, withLumaCoreTransaction } from "@/lib/new-auth-db";
import type { NewPeriodEntryOpen, NewRunningPeriodInput } from "@/lib/new-period-validation";

type SaveResult =
  | { ok: true; entry: NewPeriodEntryOpen }
  | { ok: false; reason: "overlap" | "not_found" };

interface PeriodRow {
  id: string;
  start_date: string;
  end_date: string | null;
  expected_end_date: string | null;
}

function toEntry(row: PeriodRow): NewPeriodEntryOpen {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    expectedEndDate: row.expected_end_date,
  };
}

/**
 * Two entries "occupy" overlapping days for the purposes of the overlap
 * guard. An entry without a real end (a running period) is treated as
 * occupying its expected end when set, otherwise as extending indefinitely
 * from its start — it cannot silently coexist with another entry that
 * starts inside its still-open range.
 */
const OVERLAP_END = "COALESCE(end_date, expected_end_date, DATE '9999-12-31')";

export async function getNewPeriodEntries(userId: string): Promise<NewPeriodEntryOpen[]> {
  const result = await getLumaCorePool().query<PeriodRow>(
    `SELECT id, start_date::text, end_date::text, expected_end_date::text
     FROM new_period_entries
     WHERE user_id = $1
     ORDER BY start_date DESC`,
    [userId],
  );
  return result.rows.map(toEntry);
}

export async function createNewPeriodEntry(
  userId: string,
  input: NewRunningPeriodInput,
): Promise<SaveResult> {
  return withLumaCoreTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [userId]);
    const overlap = await client.query(
      `SELECT 1 FROM new_period_entries
       WHERE user_id = $1 AND start_date <= $3 AND ${OVERLAP_END} >= $2
       LIMIT 1`,
      [userId, input.startDate, input.endDate ?? input.expectedEndDate ?? input.startDate],
    );
    if (overlap.rowCount) return { ok: false, reason: "overlap" };

    const result = await client.query<PeriodRow>(
      `INSERT INTO new_period_entries (id, user_id, start_date, end_date, expected_end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, start_date::text, end_date::text, expected_end_date::text`,
      [randomUUID(), userId, input.startDate, input.endDate, input.expectedEndDate],
    );
    return { ok: true, entry: toEntry(result.rows[0]) };
  });
}

export async function updateNewPeriodEntry(
  userId: string,
  entryId: string,
  input: NewRunningPeriodInput,
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
       WHERE user_id = $1 AND id <> $2 AND start_date <= $4 AND ${OVERLAP_END} >= $3
       LIMIT 1`,
      [userId, entryId, input.startDate, input.endDate ?? input.expectedEndDate ?? input.startDate],
    );
    if (overlap.rowCount) return { ok: false, reason: "overlap" };

    const result = await client.query<PeriodRow>(
      `UPDATE new_period_entries
       SET start_date = $1, end_date = $2, expected_end_date = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, start_date::text, end_date::text, expected_end_date::text`,
      [input.startDate, input.endDate, input.expectedEndDate, entryId, userId],
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
