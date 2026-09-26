import "server-only";

import { getNewPeriodEntries } from "@/lib/new-periods";
import { getNewCycleProfile } from "@/lib/new-cycle-profile";
import { predictCycle } from "@/lib/new-cycle-prediction";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { getLumaCorePool } from "@/lib/new-auth-db";

export interface PartnerCalendarView {
  confirmedDates: string[];
  estimatedNextPeriodDates: string[];
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
 * day-status lists the partner UI is allowed to show. Never includes IDs,
 * names, emails, profile/cycle values, or anything beyond date strings.
 * Returns null when there is no active connection for this partner
 * account, or when the owner has not (or no longer) turned the calendar
 * share on (WP-004 Version 9) — callers must never fall back to any other
 * data source in that case. The base calendar deliberately contains only
 * real confirmed days: expectedEndDate and every prediction value are
 * excluded on purpose (WP-004 Version 9 narrows the shared base calendar to
 * true confirmed days only). The estimated-next-period list (WP-004
 * Version 8) is a separate, independent grant gated by cycle_ring_shared —
 * both flags are read in this same query as the connection itself, so
 * there is no window where a stale flag could leak either kind of data.
 */
export async function getPartnerCalendarView(partnerUserId: string): Promise<PartnerCalendarView | null> {
  const connection = await resolveActiveConnection(partnerUserId);
  if (!connection || !connection.calendarShared) return null;

  const today = todayBerlinDateOnly();
  const entries = await getNewPeriodEntries(connection.ownerUserId);

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

  const estimatedNextPeriodDates = new Set<string>();
  if (connection.cycleRingShared) {
    const profile = await getNewCycleProfile(connection.ownerUserId);
    const prediction = predictCycle(entries, profile, today);
    if (prediction) {
      for (const date of datesBetweenInclusive(prediction.nextPeriodStart, prediction.nextPeriodEnd)) {
        estimatedNextPeriodDates.add(date);
      }
    }
  }

  return {
    confirmedDates: [...confirmedDates].sort(),
    estimatedNextPeriodDates: [...estimatedNextPeriodDates].sort(),
  };
}

/**
 * Single query covering "is this partner actively connected", "to which
 * owner", "is the base calendar currently shared", and "is the cycle-ring
 * share currently on" — avoids separate checks that could go stale between
 * calls (the connection ending or either share being turned off between
 * two round trips).
 */
async function resolveActiveConnection(
  partnerUserId: string,
): Promise<{ ownerUserId: string; cycleRingShared: boolean; calendarShared: boolean } | null> {
  const result = await getLumaCorePool().query<{ owner_user_id: string; cycle_ring_shared: boolean; calendar_shared: boolean }>(
    `SELECT owner_user_id, cycle_ring_shared, calendar_shared FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ownerUserId: row.owner_user_id, cycleRingShared: row.cycle_ring_shared, calendarShared: row.calendar_shared };
}
