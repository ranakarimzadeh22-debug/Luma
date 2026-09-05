export type CalendarDayPhase = "period" | "pms" | "ovulation" | null;

interface CalendarDayInfoInput {
  date: string;
  today: string;
  hasStoredPeriod: boolean;
  phase: CalendarDayPhase;
}

export interface CalendarDayInfo {
  canSelectPeriod: boolean;
  status: "confirmed" | "estimate" | "neutral";
  phase: CalendarDayPhase;
}

export function getCalendarDayInfo({
  date,
  today,
  hasStoredPeriod,
  phase,
}: CalendarDayInfoInput): CalendarDayInfo {
  if (hasStoredPeriod) {
    return { canSelectPeriod: date <= today, status: "confirmed", phase: "period" };
  }

  return {
    canSelectPeriod: date <= today,
    status: phase ? "estimate" : "neutral",
    phase,
  };
}
