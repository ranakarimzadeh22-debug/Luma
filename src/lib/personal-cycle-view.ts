import type { NewPeriodEntryOpen } from "@/lib/new-period-validation";
import { calculateOvulationDate, calculateFertileWindow, isUncertainPrediction } from "@/lib/cycle-fertility";

export type PersonalCyclePhase = "period" | "ovulation" | "fertile" | "pms" | null;

export interface PersonalCycleView {
  status: "no_data" | "profile_estimate" | "personal";
  cycleLengthDays: number | null;
  todayPhase: PersonalCyclePhase;
  isEstimate: boolean;
  periodLengthDays: number | null;
  anchorPeriodStart: string | null;
  todayCycleDay: number | null;
  isRunning: boolean;
  /** WP-007: see isUncertainPrediction() in src/lib/cycle-fertility.ts. */
  isUncertain: boolean;
}

const MIN_REAL_PERIODS_FOR_MEDIAN = 4;
const MIN_CYCLE_LENGTH = 21;
const MAX_CYCLE_LENGTH = 45;
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

interface RealCycleLength {
  cycleLengthDays: number;
  usableGaps: number[];
}

function realCycleLengthMedian(sortedPeriods: NewPeriodEntryOpen[]): RealCycleLength | null {
  if (sortedPeriods.length < MIN_REAL_PERIODS_FOR_MEDIAN) return null;

  const gaps: number[] = [];
  for (let i = 1; i < sortedPeriods.length; i++) {
    const gap = daysBetween(sortedPeriods[i - 1].startDate, sortedPeriods[i].startDate);
    if (gap >= MIN_CYCLE_LENGTH && gap <= MAX_CYCLE_LENGTH) gaps.push(gap);
  }
  if (gaps.length < MIN_REAL_PERIODS_FOR_MEDIAN - 1) return null;

  return { cycleLengthDays: Math.round(median(gaps)), usableGaps: gaps };
}

/**
 * Computes today's position in the ring shown at the top of /neu.
 * Deliberately stricter than predictCycle (used for the calendar): a
 * personal median may only replace the profile estimate once at least
 * four real period starts confirm the pattern, per WP-002. Never derives
 * a personal phase from an unconfirmed 28-day default.
 */
export function computePersonalCycleView(
  periods: NewPeriodEntryOpen[],
  profile: ProfileFallback | null,
  today: string,
): PersonalCycleView {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const completed = sorted.filter((entry): entry is NewPeriodEntryOpen & { endDate: string } => entry.endDate !== null);
  const runningToday = sorted.some((entry) => entry.endDate === null && entry.startDate <= today);
  const confirmedToday =
    runningToday || sorted.some((entry) => entry.endDate !== null && entry.startDate <= today && entry.endDate >= today);

  const personalCycleLength = realCycleLengthMedian(sorted);
  const latestPeriodStart = sorted.length > 0 ? sorted[sorted.length - 1].startDate : null;
  const periodLengthDays =
    completed.length > 0
      ? Math.round(median(completed.map((entry) => daysBetween(entry.startDate, entry.endDate) + 1)))
      : DEFAULT_PERIOD_LENGTH;

  if (personalCycleLength && latestPeriodStart) {
    return {
      status: "personal",
      cycleLengthDays: personalCycleLength.cycleLengthDays,
      todayPhase: confirmedToday ? "period" : estimatedPhase(latestPeriodStart, personalCycleLength.cycleLengthDays, today),
      isEstimate: !confirmedToday,
      periodLengthDays,
      anchorPeriodStart: latestPeriodStart,
      todayCycleDay: todayCycleDay(latestPeriodStart, personalCycleLength.cycleLengthDays, today),
      isRunning: runningToday,
      isUncertain: isUncertainPrediction(personalCycleLength.usableGaps),
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
      todayCycleDay: todayCycleDay(latestPeriodStart, profile.cycleLengthDays, today),
      isRunning: runningToday,
      isUncertain: false,
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
      todayCycleDay: null,
      isRunning: runningToday,
      isUncertain: false,
    };
  }

  return {
    status: "no_data",
    cycleLengthDays: null,
    todayPhase: null,
    isEstimate: false,
    periodLengthDays: null,
    anchorPeriodStart: null,
    todayCycleDay: null,
    isRunning: false,
    isUncertain: false,
  };
}

function todayCycleDay(anchorStart: string, cycleLengthDays: number, today: string): number {
  const periodStart = currentCyclePeriodStart(anchorStart, cycleLengthDays, today);
  return daysBetween(periodStart, today) + 1;
}

/**
 * WP-007: the next predicted period start is `cycleLengthDays` after the
 * current cycle's start; ovulation/fertile window are derived from that
 * upcoming start, never from the current period's endDate/expectedEndDate.
 */
function estimatedPhase(anchorStart: string, cycleLengthDays: number, today: string): PersonalCyclePhase {
  const currentPeriodStart = currentCyclePeriodStart(anchorStart, cycleLengthDays, today);
  const nextPeriodStart = addDays(currentPeriodStart, cycleLengthDays);
  const ovulationDate = calculateOvulationDate(nextPeriodStart);
  const fertileWindow = calculateFertileWindow(ovulationDate);
  const pmsStart = addDays(currentPeriodStart, cycleLengthDays - PMS_LEAD_DAYS);
  const pmsEnd = addDays(currentPeriodStart, cycleLengthDays - 1);

  if (today === ovulationDate) return "ovulation";
  if (today >= fertileWindow.start && today <= fertileWindow.end) return "fertile";
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

export interface TodayCardText {
  headline: string;
  showsEstimateNotice: boolean;
}

/**
 * Pure text derivation for the WP-006 "Heute" card shown above the cycle
 * ring on /neu. Deliberately reads only the already-computed
 * PersonalCycleView — no second cycle/date/phase calculation, and no
 * fallback that could invent a phase, cycle day, or medical claim beyond
 * what the view already established.
 */
export function deriveTodayCardText(view: PersonalCycleView): TodayCardText {
  const showsEstimateNotice = view.isEstimate;

  if (view.isRunning && view.todayCycleDay !== null) {
    return { headline: `Heute: ${view.todayCycleDay}. Periodentag`, showsEstimateNotice };
  }

  if (view.todayPhase === "pms") {
    return { headline: "Heute: PMS-Phase", showsEstimateNotice };
  }

  if (view.todayPhase === "ovulation") {
    return { headline: "Heute: mögliche Ovulationsphase", showsEstimateNotice };
  }

  // A fertile-window day that is not the single ovulation day itself: kept
  // to the neutral "Zyklustag N" wording, never an ovulation/fertility
  // claim, per WP-007's rule that only the ovulation day gets its own text.
  if (view.todayCycleDay !== null) {
    return { headline: `Heute: Zyklustag ${view.todayCycleDay}`, showsEstimateNotice };
  }

  return {
    headline: "Noch keine ausreichenden Daten für eine persönliche Einordnung.",
    showsEstimateNotice: false,
  };
}
