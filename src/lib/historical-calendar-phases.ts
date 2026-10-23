// Relative .ts import so node:test can load this module (same pattern as
// new-cycle-prediction.ts); @/ path aliases do not resolve there.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { calculateOvulationDate } from "./cycle-fertility.ts";
import type { PmsSymptomDay } from "@/lib/new-pms-symptoms";
import type { PeriodDateRange } from "@/lib/manual-pms";

/**
 * WP-028: calendar phases for PAST cycles, derived only from real data — the
 * user's own saved PMS symptom days and real, already stored period
 * boundaries. Pure and read-only: it never touches predictCycle() or any
 * future prediction, never reads the manual current-cycle section
 * (deriveManualPmsSection keeps that job unchanged), and returns plain date
 * lists so owner and partner calendars render exactly the same result.
 *
 * A "past cycle" is the stretch between two consecutive real periods. The
 * newest period has no following real period, so nothing is derived after it
 * (the current open cycle stays with deriveManualPmsSection/predictCycle).
 */
export interface HistoricalCalendarPhases {
  /** Days of past, self-entered PMS sections (sorted, no real period day). */
  pmsDates: string[];
  /** Possible (estimated) ovulation days of past cycles, never on a real period or PMS day. */
  ovulationDates: string[];
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function isRealPeriodDay(periods: PeriodDateRange[], date: string, today: string): boolean {
  return periods.some((entry) => date >= entry.startDate && date <= (entry.endDate ?? today));
}

export function deriveHistoricalCalendarPhases(
  periods: PeriodDateRange[],
  symptomDays: PmsSymptomDay[],
  today: string,
): HistoricalCalendarPhases {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const pms = new Set<string>();
  const ovulation = new Set<string>();

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index];
    const next = sorted[index + 1];
    // Without a real end the period is still open: its PMS/cycle boundary is
    // not certain, so nothing is assigned (never stretch into an undetermined span).
    if (current.endDate === null || next.startDate > today) continue;

    const firstCandidate = addDays(current.endDate, 1);
    const lastCandidate = addDays(next.startDate, -1);
    if (firstCandidate > lastCandidate) continue;

    // PMS: from the first saved symptom day after this period through, at the
    // latest, the day before the next real period. Real period days never count.
    const cycleSymptomDates = symptomDays
      .filter((day) => day.symptoms.length > 0 && day.date >= firstCandidate && day.date <= lastCandidate && !isRealPeriodDay(sorted, day.date, today))
      .map((day) => day.date)
      .sort();
    if (cycleSymptomDates.length > 0) {
      for (let date = cycleSymptomDates[0]; date <= lastCandidate; date = addDays(date, 1)) {
        if (!isRealPeriodDay(sorted, date, today)) pms.add(date);
      }
    }

    // Possible ovulation: the existing central rule (14 days before the
    // following REAL period start). Skipped when it would fall on or before
    // the previous real period — real periods always win.
    const ovulationDate = calculateOvulationDate(next.startDate);
    if (ovulationDate >= firstCandidate && !isRealPeriodDay(sorted, ovulationDate, today)) {
      ovulation.add(ovulationDate);
    }
  }

  // Priority real period > manual PMS > estimated ovulation: an ovulation day
  // inside a self-entered PMS section is not shown separately.
  for (const date of pms) ovulation.delete(date);

  return { pmsDates: [...pms].sort(), ovulationDates: [...ovulation].sort() };
}
