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

export type PeriodDayAction = "start" | "end";

interface ApplyPeriodDayActionInput {
  action: PeriodDayAction;
  date: string;
  selectedStart: string | null;
}

export type PeriodDayActionResult =
  | { ok: true; selectedStart: string; selectedEnd: string | null }
  | { ok: false; error: string };

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

export function applyPeriodDayAction({
  action,
  date,
  selectedStart,
}: ApplyPeriodDayActionInput): PeriodDayActionResult {
  if (action === "start") {
    return { ok: true, selectedStart: date, selectedEnd: null };
  }

  if (!selectedStart) {
    return { ok: false, error: "Wähle zuerst den ersten Periodentag." };
  }

  if (date < selectedStart) {
    return { ok: false, error: "Der letzte Periodentag darf nicht vor dem ersten liegen." };
  }

  return { ok: true, selectedStart, selectedEnd: date };
}
