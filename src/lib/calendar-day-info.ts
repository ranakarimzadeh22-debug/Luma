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
