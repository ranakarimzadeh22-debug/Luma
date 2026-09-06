import type { NewPeriodEntry } from "@/lib/new-period-validation";

export type PersonalCyclePhase = "period" | "ovulation" | "pms" | null;

export interface PersonalCycleView {
  status: "no_data" | "profile_estimate" | "personal";
  cycleLengthDays: number | null;
  todayPhase: PersonalCyclePhase;
  isEstimate: boolean;
  periodLengthDays: number | null;
  anchorPeriodStart: string | null;
}

const MIN_REAL_PERIODS_FOR_MEDIAN = 4;
const MIN_CYCLE_LENGTH = 21;
const MAX_CYCLE_LENGTH = 45;
const OVULATION_WINDOW_HALF_DAYS = 1;
const PMS_LEAD_DAYS = 5;
const DEFAULT_PERIOD_LENGTH = 5;

interface ProfileFallback {
  cycleLengthDays: number | null;
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86400000);
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function realCycleLengthMedian(sortedPeriods: NewPeriodEntry[]): number | null {
  if (sortedPeriods.length < MIN_REAL_PERIODS_FOR_MEDIAN) return null;

  const gaps: number[] = [];
  for (let i = 1; i < sortedPeriods.length; i++) {
    const gap = daysBetween(sortedPeriods[i - 1].startDate, sortedPeriods[i].startDate);
    if (gap >= MIN_CYCLE_LENGTH && gap <= MAX_CYCLE_LENGTH) gaps.push(gap);
  }
  if (gaps.length < MIN_REAL_PERIODS_FOR_MEDIAN - 1) return null;

  return Math.round(median(gaps));
}

/**
 * Computes today's position in the ring shown at the top of /neu.
 * Deliberately stricter than predictCycle (used for the calendar): a
 * personal median may only replace the profile estimate once at least
 * four real period starts confirm the pattern, per WP-002. Never derives
 * a personal phase from an unconfirmed 28-day default.
 */
export function computePersonalCycleView(
  periods: NewPeriodEntry[],
  profile: ProfileFallback | null,
  today: string,
): PersonalCycleView {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const confirmedToday = sorted.some((entry) => entry.startDate <= today && entry.endDate >= today);

  const personalCycleLength = realCycleLengthMedian(sorted);
  const latestPeriodStart = sorted.length > 0 ? sorted[sorted.length - 1].startDate : null;
  const periodLengthDays =
    sorted.length > 0
      ? Math.round(median(sorted.map((entry) => daysBetween(entry.startDate, entry.endDate) + 1)))
      : DEFAULT_PERIOD_LENGTH;

  if (personalCycleLength && latestPeriodStart) {
    return {
      status: "personal",
      cycleLengthDays: personalCycleLength,
      todayPhase: confirmedToday ? "period" : estimatedPhase(latestPeriodStart, personalCycleLength, today),
      isEstimate: !confirmedToday,
      periodLengthDays,
      anchorPeriodStart: latestPeriodStart,
    };
  }

  if (profile?.cycleLengthDays && latestPeriodStart) {
    return {
      status: "profile_estimate",
      cycleLengthDays: profile.cycleLengthDays,
      todayPhase: confirmedToday ? "period" : estimatedPhase(latestPeriodStart, profile.cycleLengthDays, today),
      isEstimate: true,
      periodLengthDays,
      anchorPeriodStart: latestPeriodStart,
    };
  }

  if (confirmedToday) {
    return {
      status: "no_data",
      cycleLengthDays: null,
      todayPhase: "period",
      isEstimate: false,
      periodLengthDays,
      anchorPeriodStart: latestPeriodStart,
    };
  }

  return {
    status: "no_data",
    cycleLengthDays: null,
    todayPhase: null,
    isEstimate: false,
    periodLengthDays: null,
    anchorPeriodStart: null,
  };
}

function estimatedPhase(anchorStart: string, cycleLengthDays: number, today: string): PersonalCyclePhase {
  const currentPeriodStart = currentCyclePeriodStart(anchorStart, cycleLengthDays, today);
  const ovulationDate = addDays(currentPeriodStart, cycleLengthDays - 14);
  const pmsStart = addDays(currentPeriodStart, cycleLengthDays - PMS_LEAD_DAYS);
  const pmsEnd = addDays(currentPeriodStart, cycleLengthDays - 1);
  const ovulationWindowStart = addDays(ovulationDate, -OVULATION_WINDOW_HALF_DAYS);
  const ovulationWindowEnd = addDays(ovulationDate, OVULATION_WINDOW_HALF_DAYS);

  if (today >= ovulationWindowStart && today <= ovulationWindowEnd) return "ovulation";
  if (today >= pmsStart && today <= pmsEnd) return "pms";
  return null;
}

/**
 * The most recent period start on or before `today`, projected forward from
 * `anchorStart` in `cycleLengthDays` steps. Exported so the ring geometry can
 * derive the same cycle window without recomputing the anchor logic.
 */
export function currentCyclePeriodStart(anchorStart: string, cycleLengthDays: number, today: string): string {
  let periodStart = anchorStart;
  while (addDays(periodStart, cycleLengthDays) <= today) {
    periodStart = addDays(periodStart, cycleLengthDays);
  }
  return periodStart;
}
