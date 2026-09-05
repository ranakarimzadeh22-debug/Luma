import "server-only";

import { randomUUID } from "node:crypto";
import { getLumaCorePool, withLumaCoreTransaction } from "@/lib/new-auth-db";
import { todayDateOnly, type NewPeriodEntry, type NewPeriodInput } from "@/lib/new-period-validation";

type SavePlanResult =
  | { ok: true; entry: NewPeriodEntry }
  | { ok: false; reason: "not_found" };

type ConfirmPlanResult =
  | { ok: true; entry: NewPeriodEntry }
  | { ok: false; reason: "not_found" | "not_due" | "overlap" };

interface PeriodPlanRow {
  id: string;
  start_date: string;
  end_date: string;
}

function toEntry(row: PeriodPlanRow): NewPeriodEntry {
  return { id: row.id, startDate: row.start_date, endDate: row.end_date };
}

export async function getNewPeriodPlans(userId: string): Promise<NewPeriodEntry[]> {
  const result = await getLumaCorePool().query<PeriodPlanRow>(
    `SELECT id, start_date::text, end_date::text
     FROM new_period_plans
     WHERE user_id = $1
     ORDER BY start_date DESC`,
    [userId],
  );
  return result.rows.map(toEntry);
}

export async function createNewPeriodPlan(userId: string, input: NewPeriodInput): Promise<SavePlanResult> {
  const result = await getLumaCorePool().query<PeriodPlanRow>(
    `INSERT INTO new_period_plans (id, user_id, start_date, end_date)
     VALUES ($1, $2, $3, $4)
     RETURNING id, start_date::text, end_date::text`,
    [randomUUID(), userId, input.startDate, input.endDate],
  );
  return { ok: true, entry: toEntry(result.rows[0]) };
}

export async function updateNewPeriodPlan(
  userId: string,
  entryId: string,
  input: NewPeriodInput,
): Promise<SavePlanResult> {
  const result = await getLumaCorePool().query<PeriodPlanRow>(
    `UPDATE new_period_plans
     SET start_date = $1, end_date = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING id, start_date::text, end_date::text`,
    [input.startDate, input.endDate, entryId, userId],
  );
  if (!result.rowCount) return { ok: false, reason: "not_found" };
  return { ok: true, entry: toEntry(result.rows[0]) };
}

export async function deleteNewPeriodPlan(userId: string, entryId: string): Promise<boolean> {
  const result = await getLumaCorePool().query(
    "DELETE FROM new_period_plans WHERE id = $1 AND user_id = $2",
    [entryId, userId],
  );
  return result.rowCount === 1;
}

export async function confirmNewPeriodPlan(userId: string, entryId: string): Promise<ConfirmPlanResult> {
  return withLumaCoreTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [userId]);
    const plan = await client.query<PeriodPlanRow>(
      `SELECT id, start_date::text, end_date::text
       FROM new_period_plans
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [entryId, userId],
    );
    if (!plan.rowCount) return { ok: false, reason: "not_found" };

    const planned = toEntry(plan.rows[0]);
    if (planned.endDate > todayDateOnly()) return { ok: false, reason: "not_due" };

    const overlap = await client.query(
      `SELECT 1 FROM new_period_entries
       WHERE user_id = $1 AND start_date <= $3 AND end_date >= $2
       LIMIT 1`,
      [userId, planned.startDate, planned.endDate],
    );
    if (overlap.rowCount) return { ok: false, reason: "overlap" };

    const actualId = randomUUID();
    const actual = await client.query<PeriodPlanRow>(
      `INSERT INTO new_period_entries (id, user_id, start_date, end_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, start_date::text, end_date::text`,
      [actualId, userId, planned.startDate, planned.endDate],
    );
    await client.query("DELETE FROM new_period_plans WHERE id = $1 AND user_id = $2", [entryId, userId]);
    return { ok: true, entry: toEntry(actual.rows[0]) };
  });
}
