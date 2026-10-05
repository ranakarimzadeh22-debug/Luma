import "server-only";

import { getNewPeriodEntries } from "@/lib/new-periods";
import { getNewCycleProfile } from "@/lib/new-cycle-profile";
import { predictCycle, type CyclePrediction } from "@/lib/new-cycle-prediction";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { getLumaCorePool } from "@/lib/new-auth-db";

export interface PartnerCalendarView {
  confirmedDates: string[];
  /**
   * WP-004 Version 11: the same CyclePrediction the owner's own calendar
   * uses — only date boundaries and the uncertainty flag, never raw
   * periods, profile values, IDs, names, or emails. The partner UI derives
   * its markers from this with the shared primaryCalendarPhase/
   * showsFertileMarker/phasesForDate helpers (src/lib/new-cycle-prediction.ts),
   * so there is no second, divergent prediction calculation.
   */
  prediction: CyclePrediction | null;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function datesBetweenInclusive(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * Read-only, minimal calendar view for a connected partner: only the
 * day-status data the partner UI is allowed to show. Never includes IDs,
 * names, emails, or raw profile values. Returns null when there is no
 * active connection for this partner account — callers must never fall
 * back to any other data source in that case.
 *
 * WP-004 Version 11: the active connection alone is now the sole gate.
 * The old per-feature cycle_ring_shared / calendar_shared columns are no
 * longer read here — they're retired, unused legacy structure (left in
 * place, not migrated away, per the brief).
 */
export async function getPartnerCalendarView(partnerUserId: string): Promise<PartnerCalendarView | null> {
  const ownerUserId = await resolveActiveConnectionOwner(partnerUserId);
  if (!ownerUserId) return null;

  const today = todayBerlinDateOnly();
  const [entries, profile] = await Promise.all([
    getNewPeriodEntries(ownerUserId),
    getNewCycleProfile(ownerUserId),
  ]);

  const confirmedDates = new Set<string>();
  for (const entry of entries) {
    if (entry.endDate !== null) {
      for (const date of datesBetweenInclusive(entry.startDate, entry.endDate)) {
        confirmedDates.add(date);
      }
      continue;
    }

    // Running period: confirmed from the real start through today only.
    if (entry.startDate <= today) {
      for (const date of datesBetweenInclusive(entry.startDate, today)) {
        confirmedDates.add(date);
      }
    }
  }

  const prediction = predictCycle(entries, profile, today);

  return {
    confirmedDates: [...confirmedDates].sort(),
    prediction,
  };
}

/**
 * The sole data gate for the partner view (WP-004 Version 11): is this
 * partner account actively connected, and to which owner. No per-feature
 * flag is consulted anymore.
 */
async function resolveActiveConnectionOwner(partnerUserId: string): Promise<string | null> {
  const result = await getLumaCorePool().query<{ owner_user_id: string }>(
    `SELECT owner_user_id FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  return result.rows[0]?.owner_user_id ?? null;
}
