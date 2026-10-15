import type { PmsSymptomDay } from "@/lib/new-pms-symptoms";
import type { PmsSymptom } from "@/lib/new-pms-symptom-validation";

/**
 * The minimal real-period shape this module needs: start/end date
 * boundaries only. Both the owner's own NewPeriodEntryOpen[] and the
 * partner view's data-minimized { startDate, endDate }[] satisfy this.
 */
export interface PeriodDateRange {
  startDate: string;
  endDate: string | null;
}

export interface ManualPmsSection {
  /** Earliest marked symptom day within the current open cycle section. */
  startDate: string;
  /** The day before the next real period start, or null while that period hasn't started yet. */
  endDate: string | null;
  /** Date → the symptoms marked for that date, restricted to this section. */
  daysBySymptom: Map<string, PmsSymptom[]>;
}

function isRealPeriodDay(periods: PeriodDateRange[], date: string, today: string): boolean {
  return periods.some((entry) => {
    if (date < entry.startDate) return false;
    const end = entry.endDate ?? today;
    return date <= end;
  });
}

/**
 * The day after the real end of the latest period (a running period without
 * a real endDate is treated as occupying through `today`, since it hasn't
 * ended yet — PMS can never be said to have started while the period is
 * still open). Returns null when there is no period at all.
 */
function firstDayAfterLatestPeriod(sortedPeriods: PeriodDateRange[], today: string): string | null {
  if (sortedPeriods.length === 0) return null;
  const latest = sortedPeriods[sortedPeriods.length - 1];
  const latestEnd = latest.endDate ?? today;
  return addDays(latestEnd, 1);
}

/**
 * WP-013: derives the manually-marked PMS section from the user's own
 * symptom markers and real period starts — a pure, read-only combination of
 * two already-computed inputs. Never recomputes period/ovulation/fertility;
 * never reads or writes predictCycle()/computePersonalCycleView() output.
 *
 * Rule: the earliest symptom marker dated strictly after the real end of the
 * latest period opens a manual PMS section — never a marker that falls on an
 * actual (running or confirmed) period day, and never while the latest
 * period is still running (no real end yet). It stays visible until the day
 * before the next real period start (if one exists yet) or indefinitely
 * until then. Removing every marker in the open section removes the section
 * entirely, letting the existing estimate show again. Real period data
 * always wins: a date that is an actual period day is never reported as
 * being inside the manual PMS section, regardless of markers.
 */
export function deriveManualPmsSection(
  periods: PeriodDateRange[],
  symptomDays: PmsSymptomDay[],
  today: string,
): ManualPmsSection | null {
  const sortedPeriods = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const sectionEarliestStart = firstDayAfterLatestPeriod(sortedPeriods, today);
  if (!sectionEarliestStart) return null;

  const latestPeriodStart = sortedPeriods[sortedPeriods.length - 1].startDate;
  const nextPeriodStart = sortedPeriods.find((entry) => entry.startDate > latestPeriodStart)?.startDate ?? null;

  const relevantDays = symptomDays
    .filter((day) => day.symptoms.length > 0)
    .filter((day) => day.date >= sectionEarliestStart)
    .filter((day) => !isRealPeriodDay(periods, day.date, today))
    .filter((day) => nextPeriodStart === null || day.date < nextPeriodStart)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (relevantDays.length === 0) return null;

  const daysBySymptom = new Map<string, PmsSymptom[]>();
  for (const day of relevantDays) daysBySymptom.set(day.date, day.symptoms);

  return {
    startDate: relevantDays[0].date,
    endDate: nextPeriodStart ? addDays(nextPeriodStart, -1) : null,
    daysBySymptom,
  };
}

/**
 * True only when `date` falls inside the derived section AND is not itself
 * an actual period day — real period data always wins, independent of the
 * call site, so callers never need a separate period check of their own.
 */
export function isWithinManualPmsSection(
  section: ManualPmsSection | null,
  date: string,
  periods: PeriodDateRange[],
  today: string,
): boolean {
  if (!section) return false;
  if (date < section.startDate) return false;
  if (section.endDate !== null && date > section.endDate) return false;
  if (isRealPeriodDay(periods, date, today)) return false;
  return true;
}

export function manualPmsSymptomsForDate(
  section: ManualPmsSection | null,
  date: string,
  periods: PeriodDateRange[],
  today: string,
): PmsSymptom[] {
  if (!isWithinManualPmsSection(section, date, periods, today)) return [];
  return section!.daysBySymptom.get(date) ?? [];
}

/**
 * Shared by the owner's own calendar/ring and the read-only partner views so
 * both apply the exact same "manual beats estimate, real period always
 * wins" priority from one place. `estimatedPhase` is whatever
 * primaryCalendarPhase()/todayPhase already computed — this never replaces
 * that calculation, only layers the manual section's priority on top of its
 * result for a given date, and never overrides an actual period day.
 */
export function applyManualPmsOverride<Phase extends string>(
  estimatedPhase: Phase | null,
  section: ManualPmsSection | null,
  date: string,
  periods: PeriodDateRange[],
  today: string,
): Phase | "pms" | null {
  if (isWithinManualPmsSection(section, date, periods, today)) return "pms";
  return estimatedPhase;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
