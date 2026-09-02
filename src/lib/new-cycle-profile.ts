import { getLumaCorePool } from "@/lib/new-auth-db";
import type { NewCycleProfileInput, NewCycleRegularity } from "@/lib/new-cycle-profile-validation";

export interface NewCycleProfile extends NewCycleProfileInput {
  updatedAt: Date;
}

export async function getNewCycleProfile(userId: string): Promise<NewCycleProfile | null> {
  const result = await getLumaCorePool().query<{
    last_period_start: string | null;
    bleeding_duration_days: number | null;
    cycle_length_days: number | null;
    regularity: NewCycleRegularity;
    updated_at: Date;
  }>(
    `SELECT last_period_start::text, bleeding_duration_days, cycle_length_days, regularity, updated_at
     FROM new_cycle_baseline_profiles
     WHERE user_id = $1`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    lastPeriodStart: row.last_period_start,
    bleedingDurationDays: row.bleeding_duration_days,
    cycleLengthDays: row.cycle_length_days,
    regularity: row.regularity,
    updatedAt: row.updated_at,
  };
}

export async function saveNewCycleProfile(
  userId: string,
  profile: NewCycleProfileInput,
): Promise<void> {
  await getLumaCorePool().query(
    `INSERT INTO new_cycle_baseline_profiles
       (user_id, last_period_start, bleeding_duration_days, cycle_length_days, regularity)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
     SET last_period_start = EXCLUDED.last_period_start,
         bleeding_duration_days = EXCLUDED.bleeding_duration_days,
         cycle_length_days = EXCLUDED.cycle_length_days,
         regularity = EXCLUDED.regularity,
         updated_at = NOW()`,
    [
      userId,
      profile.lastPeriodStart,
      profile.bleedingDurationDays,
      profile.cycleLengthDays,
      profile.regularity,
    ],
  );
}
