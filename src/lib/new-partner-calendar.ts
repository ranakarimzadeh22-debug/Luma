import "server-only";

import { getNewPeriodEntries } from "@/lib/new-periods";
import { todayDateOnly } from "@/lib/new-period-validation";
import { getLumaCorePool } from "@/lib/new-auth-db";

export interface PartnerCalendarView {
  confirmedDates: string[];
  expectedDates: string[];
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
 * Read-only, minimal calendar view for a connected partner: only the two
 * day-status lists the partner UI is allowed to show. Never includes IDs,
 * names, emails, profile/cycle values, or anything beyond confirmed vs.
 * expected date strings. Returns null when there is no active connection
 * for this partner account — callers must never fall back to any other
 * data source in that case.
 */
export async function getPartnerCalendarView(partnerUserId: string): Promise<PartnerCalendarView | null> {
  const ownerUserId = await resolveActiveOwnerUserId(partnerUserId);
  if (!ownerUserId) return null;

  const today = todayDateOnly();
  const entries = await getNewPeriodEntries(ownerUserId);

  const confirmedDates = new Set<string>();
  const expectedDates = new Set<string>();

  for (const entry of entries) {
    if (entry.endDate !== null) {
      for (const date of datesBetweenInclusive(entry.startDate, entry.endDate)) {
        confirmedDates.add(date);
      }
      continue;
    }

    // Running period: confirmed from the real start through today only.
    const confirmedEnd = entry.startDate <= today ? today : entry.startDate;
    if (entry.startDate <= today) {
      for (const date of datesBetweenInclusive(entry.startDate, confirmedEnd)) {
        confirmedDates.add(date);
      }
    }

    if (entry.expectedEndDate !== null) {
      const expectedStart = addDays(today, 1);
      if (expectedStart <= entry.expectedEndDate) {
        for (const date of datesBetweenInclusive(expectedStart, entry.expectedEndDate)) {
          expectedDates.add(date);
        }
      }
    }
  }

  return {
    confirmedDates: [...confirmedDates].sort(),
    expectedDates: [...expectedDates].sort(),
  };
}

/**
 * Single query covering both "is this partner actively connected" and
 * "to which owner" — avoids a separate status check that could go stale
 * between calls (the connection ending between two round trips).
 */
async function resolveActiveOwnerUserId(partnerUserId: string): Promise<string | null> {
  const result = await getLumaCorePool().query<{ owner_user_id: string }>(
    `SELECT owner_user_id FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  return result.rows[0]?.owner_user_id ?? null;
}
