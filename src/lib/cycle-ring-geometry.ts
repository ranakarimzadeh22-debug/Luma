import type { CyclePrediction } from "@/lib/new-cycle-prediction";

export interface RingSegment {
  key: "period" | "fertile" | "pms" | "rest";
  path: string;
  labelAngle: number;
}

export interface RingGeometry {
  segments: RingSegment[];
  todayAngle: number;
}

const CENTER = 160;
const RADIUS = 125;

function angleForDay(dayOfCycle: number, cycleLengthDays: number): number {
  return (dayOfCycle / cycleLengthDays) * 360 - 90;
}

function pointOnCircle(angleDeg: number): { x: number; y: number } {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  };
}

function arcPath(startAngle: number, endAngle: number): string {
  const start = pointOnCircle(startAngle);
  const end = pointOnCircle(endAngle);
  const largeArc = ((endAngle - startAngle + 360) % 360) > 180 ? 1 : 0;
  return `M${start.x.toFixed(2)} ${start.y.toFixed(2)} A${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/**
 * Builds a proportional ring: cycle day 1 starts at the top (-90deg) and
 * moves clockwise. Segment boundaries are derived from the prediction's
 * actual day offsets relative to cycle start, so ring proportions match
 * the person's real cycle/period length instead of fixed illustration values.
 */
export function buildRingGeometry(prediction: CyclePrediction, today: string): RingGeometry {
  const { cycleLengthDays, periodLengthDays, nextPeriodStart } = prediction;
  const cycleStartDay = shiftDate(nextPeriodStart, -cycleLengthDays);

  const dayOffset = (date: string) => daysBetween(cycleStartDay, date);

  const periodStartAngle = angleForDay(dayOffset(nextPeriodStart), cycleLengthDays);
  const periodEndAngle = angleForDay(dayOffset(nextPeriodStart) + periodLengthDays, cycleLengthDays);

  const fertileStartAngle = angleForDay(dayOffset(prediction.fertileWindowStart), cycleLengthDays);
  const fertileEndAngle = angleForDay(dayOffset(prediction.fertileWindowEnd) + 1, cycleLengthDays);

  const pmsStartAngle = angleForDay(dayOffset(prediction.pmsStart), cycleLengthDays);
  const pmsEndAngle = angleForDay(dayOffset(prediction.pmsEnd) + 1, cycleLengthDays);

  const todayDayOffset = ((daysBetween(cycleStartDay, today) % cycleLengthDays) + cycleLengthDays) % cycleLengthDays;
  const todayAngle = angleForDay(todayDayOffset, cycleLengthDays);

  const midAngle = (start: number, end: number) => start + (((end - start + 360) % 360) / 2);

  const segments: RingSegment[] = [
    {
      key: "period",
      path: arcPath(periodStartAngle, periodEndAngle),
      labelAngle: midAngle(periodStartAngle, periodEndAngle),
    },
    {
      key: "fertile",
      path: arcPath(fertileStartAngle, fertileEndAngle),
      labelAngle: midAngle(fertileStartAngle, fertileEndAngle),
    },
    {
      key: "pms",
      path: arcPath(pmsStartAngle, pmsEndAngle),
      labelAngle: midAngle(pmsStartAngle, pmsEndAngle),
    },
  ];

  return { segments, todayAngle };
}

export function ringPointAt(angleDeg: number, radius = RADIUS): { x: number; y: number } {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86400000);
}

function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
