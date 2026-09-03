import type { NewPeriodEntry } from "@/lib/new-period-validation";

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
}

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;
const MIN_CYCLE_LENGTH = 21;
const MAX_CYCLE_LENGTH = 45;
const PMS_LEAD_DAYS = 5;

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

  const today = new Date().toISOString().slice(0, 10);
  let nextPeriodStart = anchorStart;
  while (nextPeriodStart <= today) {
    nextPeriodStart = addDays(nextPeriodStart, cycleLengthDays);
  }

  const nextPeriodEnd = addDays(nextPeriodStart, periodLengthDays - 1);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const pmsStart = addDays(nextPeriodStart, -PMS_LEAD_DAYS);
  const pmsEnd = addDays(nextPeriodStart, -1);

  return {
    cycleLengthDays,
    periodLengthDays,
    source,
    nextPeriodStart,
    nextPeriodEnd,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    pmsStart,
    pmsEnd,
  };
}

export function phaseForDate(
  date: string,
  prediction: CyclePrediction,
): "period" | "pms" | "ovulation" | "fertile" | null {
  if (date >= prediction.nextPeriodStart && date <= prediction.nextPeriodEnd) return "period";
  if (date === prediction.ovulationDate) return "ovulation";
  if (date >= prediction.fertileWindowStart && date <= prediction.fertileWindowEnd) return "fertile";
  if (date >= prediction.pmsStart && date <= prediction.pmsEnd) return "pms";
  return null;
}
