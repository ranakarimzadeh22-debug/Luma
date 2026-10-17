/**
 * WP-015: pure day-count derivation for the "Heute" card's second line —
 * reads only an already-computed `nextPeriodStart` (CyclePrediction,
 * src/lib/new-cycle-prediction.ts) and `today` (todayBerlinDateOnly()).
 * No second prediction, no profile/default fallback, no local time or
 * timezone `Date` comparison — calendar-fixed UTC day difference only, same
 * approach as the existing daysBetween() helpers in personal-cycle-view.ts
 * and new-cycle-prediction.ts.
 */
export function daysUntilNextPeriod(today: string, nextPeriodStart: string | null): number | null {
  if (!nextPeriodStart) return null;
  const days = daysBetween(today, nextPeriodStart);
  return days > 0 ? days : null;
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86400000);
}
