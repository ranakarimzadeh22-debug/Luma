import "server-only";

import { getLumaCorePool } from "@/lib/new-auth-db";
import { getNewPeriodEntries } from "@/lib/new-periods";
import { getNewCycleProfile } from "@/lib/new-cycle-profile";
import { computePersonalCycleView, type PersonalCycleView } from "@/lib/personal-cycle-view";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { getPmsSymptomDays } from "@/lib/new-pms-symptoms";
import { deriveManualPmsSection, isWithinManualPmsSection } from "@/lib/manual-pms";

export interface PartnerCycleView {
  personalCycleView: PersonalCycleView;
  runningPeriodExpectedEndDate: string | null;
}

/**
 * Read-only cycle ring view for a connected partner. Reuses the exact same
 * computePersonalCycleView() logic as the owner's own /neu page — no
 * second, divergent phase/ring calculation. The expected-end date is read
 * directly from the already-loaded period entries, the same source
 * getPartnerCalendarView() derives its prediction from. Returns null when
 * there is no active connection for this partner account; callers must
 * never fall back to any other data source in that case.
 *
 * WP-004 Version 11: the active connection alone is now the sole gate —
 * the old cycle_ring_shared column is no longer read here. It is retired,
 * unused legacy structure (left in place, not migrated away).
 */
export async function getPartnerCycleView(partnerUserId: string): Promise<PartnerCycleView | null> {
  const ownerUserId = await resolveActiveConnectionOwner(partnerUserId);
  if (!ownerUserId) return null;

  const [periods, profile, pmsSymptomDays] = await Promise.all([
    getNewPeriodEntries(ownerUserId),
    getNewCycleProfile(ownerUserId),
    getPmsSymptomDays(ownerUserId),
  ]);

  const today = todayBerlinDateOnly();
  const computedView = computePersonalCycleView(periods, profile, today);
  const manualPmsSection = deriveManualPmsSection(periods, pmsSymptomDays, today);
  const personalCycleView: PersonalCycleView = isWithinManualPmsSection(manualPmsSection, today, periods, today)
    ? { ...computedView, todayPhase: "pms", isEstimate: false }
    : computedView;
  const runningEntry = periods.find((entry) => entry.endDate === null && entry.startDate <= today);

  return {
    personalCycleView,
    runningPeriodExpectedEndDate: runningEntry?.expectedEndDate ?? null,
  };
}

async function resolveActiveConnectionOwner(partnerUserId: string): Promise<string | null> {
  const result = await getLumaCorePool().query<{ owner_user_id: string }>(
    `SELECT owner_user_id FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  return result.rows[0]?.owner_user_id ?? null;
}
