const OVULATION_DAYS_BEFORE_NEXT_PERIOD = 14;
const FERTILE_WINDOW_LEAD_DAYS = 5;

/**
 * WP-007: stable-vs-volatile threshold for the "Vorhersage unsicher - Kann
 * abweichen" notice. Deliberately simple, reproducible, and free of any
 * percentage: the spread (max - min) of the usable real cycle gaps in days.
 * A spread above this threshold means the personal cycle has varied enough
 * that a single predicted ovulation day would overstate certainty.
 */
const UNSTABLE_CYCLE_SPREAD_THRESHOLD_DAYS = 10;

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/**
 * The single possible ovulation day: exactly 14 days before the given
 * period start. Must only ever be derived from a predicted/actual period
 * *start* date — never from endDate or expectedEndDate, which describe
 * bleeding duration, not cycle timing.
 */
export function calculateOvulationDate(periodStart: string): string {
  return addDays(periodStart, -OVULATION_DAYS_BEFORE_NEXT_PERIOD);
}

export interface FertileWindow {
  start: string;
  end: string;
}

/**
 * The fertile window is five days before the ovulation day through and
 * including the ovulation day itself (inclusive end, not ovulation + 1).
 */
export function calculateFertileWindow(ovulationDate: string): FertileWindow {
  return {
    start: addDays(ovulationDate, -FERTILE_WINDOW_LEAD_DAYS),
    end: ovulationDate,
  };
}

/**
 * Reproducible, percentage-free uncertainty rule (WP-007): a personal
 * prediction is "unsicher" when the usable real cycle-length gaps span
 * more than UNSTABLE_CYCLE_SPREAD_THRESHOLD_DAYS days between their
 * shortest and longest value. Fewer than two gaps can't show a spread, so
 * they're treated as not (yet) demonstrably unstable.
 */
export function isUncertainPrediction(usableGapsDays: number[]): boolean {
  if (usableGapsDays.length < 2) return false;
  const spread = Math.max(...usableGapsDays) - Math.min(...usableGapsDays);
  return spread > UNSTABLE_CYCLE_SPREAD_THRESHOLD_DAYS;
}
