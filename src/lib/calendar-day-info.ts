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

export type PeriodDayAction = "start" | "end";

interface ApplyPeriodDayActionInput {
  action: PeriodDayAction;
  date: string;
  today: string;
  selectedStart: string | null;
}

export type PeriodDayActionResult =
  | { ok: true; selectedStart: string; selectedEnd: string | null }
  | { ok: false; error: string };

export function canUsePeriodActions(date: string, today: string): boolean {
  return date <= today;
}

export function getCalendarDayInfo({
  date,
  today,
  hasStoredPeriod,
  phase,
}: CalendarDayInfoInput): CalendarDayInfo {
  if (hasStoredPeriod) {
    return { canSelectPeriod: canUsePeriodActions(date, today), status: "confirmed", phase: "period" };
  }

  return {
    canSelectPeriod: canUsePeriodActions(date, today),
    status: phase ? "estimate" : "neutral",
    phase,
  };
}

export function applyPeriodDayAction({
  action,
  date,
  today,
  selectedStart,
}: ApplyPeriodDayActionInput): PeriodDayActionResult {
  if (!canUsePeriodActions(date, today)) {
    return { ok: false, error: "Zukünftige Tage können nicht als tatsächliche Periode gespeichert werden." };
  }

  if (action === "start") {
    return { ok: true, selectedStart: date, selectedEnd: null };
  }

  if (!selectedStart) {
    return { ok: false, error: "Wähle zuerst den tatsächlichen ersten Periodentag." };
  }

  if (date < selectedStart) {
    return { ok: false, error: "Der letzte Periodentag darf nicht vor dem ersten liegen." };
  }

  return { ok: true, selectedStart, selectedEnd: date };
}
