import type { NewPeriodEntry } from "@/lib/new-period-validation";

export interface PredictedCycle {
  periodStart: string;
  periodEnd: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  pmsStart: string;
  pmsEnd: string;
}

export interface CyclePrediction {
  cycleLengthDays: number;
  periodLengthDays: number;
  source: "history" | "profile" | "default";
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  pmsStart: string;
  pmsEnd: string;
  futureCycles: PredictedCycle[];
}

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;
const MIN_CYCLE_LENGTH = 21;
const MAX_CYCLE_LENGTH = 45;
const PMS_LEAD_DAYS = 5;
const FUTURE_CYCLES_TO_PREDICT = 12;

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86400000);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

interface ProfileFallback {
  cycleLengthDays: number | null;
  bleedingDurationDays: number | null;
  lastPeriodStart: string | null;
}

export function predictCycle(
  periods: NewPeriodEntry[],
  profile: ProfileFallback | null,
): CyclePrediction | null {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));

  let cycleLengthDays: number;
  let periodLengthDays: number;
  let anchorStart: string;
  let source: CyclePrediction["source"];

  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const gap = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
      if (gap >= MIN_CYCLE_LENGTH && gap <= MAX_CYCLE_LENGTH) gaps.push(gap);
    }
    if (gaps.length === 0) return null;

    cycleLengthDays = Math.round(median(gaps));
    const latest = sorted[sorted.length - 1];
    periodLengthDays = Math.round(
      median(sorted.map((entry) => daysBetween(entry.startDate, entry.endDate) + 1)),
    );
    anchorStart = latest.startDate;
    source = "history";
  } else if (sorted.length === 1 && profile?.cycleLengthDays) {
    cycleLengthDays = profile.cycleLengthDays;
    periodLengthDays = profile.bleedingDurationDays ?? DEFAULT_PERIOD_LENGTH;
    anchorStart = sorted[0].startDate;
    source = "profile";
  } else if (sorted.length === 1) {
    cycleLengthDays = DEFAULT_CYCLE_LENGTH;
    periodLengthDays = DEFAULT_PERIOD_LENGTH;
    anchorStart = sorted[0].startDate;
    source = "default";
  } else if (profile?.lastPeriodStart && profile.cycleLengthDays) {
    cycleLengthDays = profile.cycleLengthDays;
    periodLengthDays = profile.bleedingDurationDays ?? DEFAULT_PERIOD_LENGTH;
    anchorStart = profile.lastPeriodStart;
    source = "profile";
  } else {
    return null;
  }

  function cycleForPeriodStart(periodStart: string): PredictedCycle {
    const ovulationDate = addDays(periodStart, -14);
    return {
      periodStart,
      periodEnd: addDays(periodStart, periodLengthDays - 1),
      ovulationDate,
      fertileWindowStart: addDays(ovulationDate, -5),
      fertileWindowEnd: addDays(ovulationDate, 1),
      pmsStart: addDays(periodStart, -PMS_LEAD_DAYS),
      pmsEnd: addDays(periodStart, -1),
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  let nextPeriodStart = anchorStart;
  while (nextPeriodStart <= today) {
    nextPeriodStart = addDays(nextPeriodStart, cycleLengthDays);
  }

  const futureCycles: PredictedCycle[] = [];
  let cursor = nextPeriodStart;
  for (let i = 0; i < FUTURE_CYCLES_TO_PREDICT; i++) {
    futureCycles.push(cycleForPeriodStart(cursor));
    cursor = addDays(cursor, cycleLengthDays);
  }

  const first = futureCycles[0];

  return {
    cycleLengthDays,
    periodLengthDays,
    source,
    nextPeriodStart: first.periodStart,
    nextPeriodEnd: first.periodEnd,
    ovulationDate: first.ovulationDate,
    fertileWindowStart: first.fertileWindowStart,
    fertileWindowEnd: first.fertileWindowEnd,
    pmsStart: first.pmsStart,
    pmsEnd: first.pmsEnd,
    futureCycles,
  };
}

export function phaseForDate(
  date: string,
  prediction: CyclePrediction,
): "period" | "pms" | "ovulation" | "fertile" | null {
  for (const cycle of prediction.futureCycles) {
    if (date >= cycle.periodStart && date <= cycle.periodEnd) return "period";
    if (date === cycle.ovulationDate) return "ovulation";
    if (date >= cycle.fertileWindowStart && date <= cycle.fertileWindowEnd) return "fertile";
    if (date >= cycle.pmsStart && date <= cycle.pmsEnd) return "pms";
  }
  return null;
}
