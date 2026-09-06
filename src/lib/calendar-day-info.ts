export type CalendarDayPhase = "period" | "pms" | "ovulation" | null;

interface CalendarDayInfoInput {
  date: string;
  today: string;
  hasStoredPeriod: boolean;
  hasPlannedPeriod: boolean;
  phase: CalendarDayPhase;
}

export interface CalendarDayInfo {
  isFuture: boolean;
  status: "confirmed" | "estimate" | "neutral" | "planned";
  phase: CalendarDayPhase;
}

export function getCalendarDayInfo({
  date,
  today,
  hasStoredPeriod,
  hasPlannedPeriod,
  phase,
}: CalendarDayInfoInput): CalendarDayInfo {
  if (hasStoredPeriod) {
    return { isFuture: date > today, status: "confirmed", phase: "period" };
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
