import type { NewPeriodEntryOpen } from "@/lib/new-period-validation";
import type { PmsSymptomDay } from "@/lib/new-pms-symptoms";
import type { PmsSymptom } from "@/lib/new-pms-symptom-validation";

export interface ManualPmsSection {
  /** Earliest marked symptom day within the current open cycle section. */
  startDate: string;
  /** The day before the next real period start, or null while that period hasn't started yet. */
  endDate: string | null;
  /** Date → the symptoms marked for that date, restricted to this section. */
  daysBySymptom: Map<string, PmsSymptom[]>;
}

/**
 * WP-013: derives the manually-marked PMS section from the user's own
 * symptom markers and real period starts — a pure, read-only combination of
 * two already-computed inputs. Never recomputes period/ovulation/fertility;
 * never reads or writes predictCycle()/computePersonalCycleView() output.
 *
 * Rule: the earliest symptom marker dated on/after the latest real period
 * start opens a manual PMS section. It stays visible until the day before
 * the next real period start (if one exists yet) or indefinitely until then.
 * Removing every marker in the open section removes the section entirely,
 * letting the existing estimate show again.
 */
export function deriveManualPmsSection(
  periods: NewPeriodEntryOpen[],
  symptomDays: PmsSymptomDay[],
): ManualPmsSection | null {
  const sortedPeriods = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const latestPeriodStart = sortedPeriods.length > 0 ? sortedPeriods[sortedPeriods.length - 1].startDate : null;
  if (!latestPeriodStart) return null;

  const nextPeriodStart = sortedPeriods.find((entry) => entry.startDate > latestPeriodStart)?.startDate ?? null;

  const relevantDays = symptomDays
    .filter((day) => day.symptoms.length > 0)
    .filter((day) => day.date >= latestPeriodStart)
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

export function isWithinManualPmsSection(section: ManualPmsSection | null, date: string): boolean {
  if (!section) return false;
  if (date < section.startDate) return false;
  if (section.endDate !== null && date > section.endDate) return false;
  return true;
}

export function manualPmsSymptomsForDate(section: ManualPmsSection | null, date: string): PmsSymptom[] {
  if (!isWithinManualPmsSection(section, date)) return [];
  return section!.daysBySymptom.get(date) ?? [];
}

/**
 * Shared by the owner's own calendar/ring and the read-only partner views so
 * both apply the exact same "manual beats estimate" priority from one place.
 * `estimatedPhase` is whatever primaryCalendarPhase()/todayPhase already
 * computed — this never replaces that calculation, only layers the manual
 * section's priority on top of its result for a given date.
 */
export function applyManualPmsOverride<Phase extends string>(
  estimatedPhase: Phase | null,
  section: ManualPmsSection | null,
  date: string,
): Phase | "pms" | null {
  if (isWithinManualPmsSection(section, date)) return "pms";
  return estimatedPhase;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
