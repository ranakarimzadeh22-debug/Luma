import "server-only";

import { randomUUID } from "node:crypto";
import { getLumaCorePool, withLumaCoreTransaction } from "@/lib/new-auth-db";
import type { PmsSymptom } from "@/lib/new-pms-symptom-validation";

export interface PmsSymptomDay {
  date: string;
  symptoms: PmsSymptom[];
}

interface SymptomRow {
  entry_date: string;
  symptom: PmsSymptom;
}

function toDays(rows: SymptomRow[]): PmsSymptomDay[] {
  const byDate = new Map<string, PmsSymptom[]>();
  for (const row of rows) {
    const list = byDate.get(row.entry_date) ?? [];
    list.push(row.symptom);
    byDate.set(row.entry_date, list);
  }
  return Array.from(byDate.entries())
    .map(([date, symptoms]) => ({ date, symptoms }))
    .sort((first, second) => second.date.localeCompare(first.date));
}

export async function getPmsSymptomDays(userId: string): Promise<PmsSymptomDay[]> {
  const result = await getLumaCorePool().query<SymptomRow>(
    `SELECT entry_date::text, symptom
     FROM new_pms_symptom_entries
     WHERE user_id = $1
     ORDER BY entry_date DESC`,
    [userId],
  );
  return toDays(result.rows);
}

/**
 * Replaces the full symptom selection for one day with `symptoms`. An empty
 * array removes all markers for that day. Each user may only ever read or
 * write their own rows (`user_id = $1` in every statement).
 */
export async function setPmsSymptomsForDay(
  userId: string,
  date: string,
  symptoms: PmsSymptom[],
): Promise<PmsSymptomDay> {
  return withLumaCoreTransaction(async (client) => {
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1 AND entry_date = $2", [userId, date]);
    for (const symptom of symptoms) {
      await client.query(
        `INSERT INTO new_pms_symptom_entries (id, user_id, entry_date, symptom)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), userId, date, symptom],
      );
    }
    return { date, symptoms };
  });
}
