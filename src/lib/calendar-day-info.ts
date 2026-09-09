export type CalendarDayPhase = "period" | "pms" | "ovulation" | null;

interface CalendarDayInfoInput {
  date: string;
  today: string;
  hasStoredPeriod: boolean;
  hasRunningPeriod: boolean;
  hasExpectedEnd: boolean;
  hasPlannedPeriod: boolean;
  phase: CalendarDayPhase;
}

export interface CalendarDayInfo {
  isFuture: boolean;
  status: "confirmed" | "running" | "expected" | "estimate" | "neutral" | "planned";
  phase: CalendarDayPhase;
}

/**
 * Inclusive day count from an actual period start, e.g. the start itself is
 * day 1. Pure string-date arithmetic (no Date object) to avoid timezone
 * shift; both dates must be well-formed "YYYY-MM-DD".
 */
export function periodDayNumber(date: string, startDate: string): number {
  const [dy, dm, dd] = date.split("-").map(Number);
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const dateMs = Date.UTC(dy, dm - 1, dd);
  const startMs = Date.UTC(sy, sm - 1, sd);
  return Math.round((dateMs - startMs) / 86400000) + 1;
}

export function getCalendarDayInfo({
  date,
  today,
  hasStoredPeriod,
  hasRunningPeriod,
  hasExpectedEnd,
  hasPlannedPeriod,
  phase,
}: CalendarDayInfoInput): CalendarDayInfo {
  if (hasStoredPeriod) {
    return { isFuture: date > today, status: "confirmed", phase: "period" };
  }
  if (hasRunningPeriod) {
    return { isFuture: date > today, status: "running", phase: "period" };
  }
  if (hasExpectedEnd) {
    return { isFuture: date > today, status: "expected", phase: "period" };
  }
  if (hasPlannedPeriod) {
    return { isFuture: date > today, status: "planned", phase: null };
  }

  return {
    isFuture: date > today,
    status: phase ? "estimate" : "neutral",
    phase,
  };
}
