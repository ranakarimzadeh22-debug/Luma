import type { NewPeriodEntryOpen } from "@/lib/new-period-validation";

export interface PeriodHistoryRow {
  id: string;
  startDate: string;
  endDate: string | null;
  cycleLengthDays: number | null;
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86400000);
}

/**
 * Chronological, read-only history of actual period starts. Each row's
 * cycleLengthDays is the gap in calendar days to the *next* actual start
 * (never derived from an estimate, plan, or profile value); the most
 * recent start has no next actual start yet, so it is null.
 */
export function computePeriodHistory(periods: NewPeriodEntryOpen[]): PeriodHistoryRow[] {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return sorted.map((entry, index) => {
    const next = sorted[index + 1];
    return {
      id: entry.id,
      startDate: entry.startDate,
      endDate: entry.endDate,
      cycleLengthDays: next ? daysBetween(entry.startDate, next.startDate) : null,
    };
  });
}
