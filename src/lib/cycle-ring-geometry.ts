import type { CyclePrediction } from "@/lib/new-cycle-prediction";
import { currentCyclePeriodStart, type PersonalCycleView } from "@/lib/personal-cycle-view";
import { calculateOvulationDate, calculateFertileWindow } from "@/lib/cycle-fertility";

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

const PMS_LEAD_DAYS = 5;

/**
 * WP-014 (Korrektur, erweitert in Korrektur Version 3): Position für den
 * übersteuerten Heute-Punkt innerhalb des PMS-Segments. Das "PMS"-Textlabel
 * sitzt auf der Segmentmitte (labelAngle); der Punkt wird stattdessen
 * möglichst nah an den Segmentrand gesetzt, mit einem kleinen
 * Sicherheitsabstand zum Rand selbst, damit er noch sichtbar innerhalb des
 * Segments bleibt. Seit Korrektur Version 3 kann das Segment (bei einem erst
 * seit kurzem aktiven manuellen Abschnitt) deutlich kürzer sein als das
 * bisherige 5-Tage-Schätzfenster, bis hin zu einem einzelnen Tag — ein fester
 * Mindestabstand zur Mitte würde bei so kurzen Segmenten über den Rand
 * hinausragen. Der Zielabstand zur Mitte ist daher der kleinere Wert aus
 * "idealer Abstand für ausreichenden Pixelabstand zum Label" und "maximal im
 * Segment verfügbarer Abstand abzüglich Randsicherheit".
 */
function manualPmsMarkerAngle(startAngle: number, endAngle: number): number {
  const span = ((endAngle - startAngle + 360) % 360) || 360;
  const idealOffsetFromMid = 12;
  const edgeMargin = Math.min(span * 0.1, 3);
  const maxOffsetFromMid = Math.max(span / 2 - edgeMargin, 0);
  const offsetFromMid = Math.min(idealOffsetFromMid, maxOffsetFromMid);
  return startAngle + span / 2 - offsetFromMid;
}

/**
 * WP-014 Korrektur Version 3: wenn heute ein manueller PMS-Abschnitt aktiv
 * ist, bestimmen dessen bereits vorhandene startDate/endDate (aus
 * manual-pms.ts, hier unverändert übernommen) die sichtbaren Grenzen des
 * PMS-Ringsegments, statt der rein rechnerischen pmsStart/pmsEnd. Es wird
 * keine neue Vorhersage- oder Datumslogik eingeführt: nur dieselben, vom
 * Aufrufer bereits abgeleiteten Datumswerte fließen in dieselbe bestehende
 * Winkel-Geometrie ein.
 */
export interface ManualPmsRingOverride {
  startDate: string;
  endDate: string;
}

/**
 * Ring geometry for WP-002's personal cycle view: anchored on the *current*
 * cycle window (derived from the latest confirmed period), not the next
 * upcoming period — the ring never states a next-period prediction.
 *
 * WP-014 (Korrektur Version 3): `manualPmsOverride` (present only when the
 * caller's manual-pms.ts section is active today) replaces the PMS
 * segment's start/end boundaries with its own startDate/endDate so the
 * drawn pink segment visually starts where the user manually marked PMS,
 * not just the calculated lead time. The today marker is then placed inside
 * that same (possibly widened) segment, still offset from its label so it
 * never sits on top of the "PMS" text. It never changes any other segment,
 * date or cycle calculation; a real period day is excluded by the caller
 * before this override can ever be passed, so it never competes with period
 * precedence.
 */
export function buildPersonalRingGeometry(
  view: PersonalCycleView,
  today: string,
  manualPmsOverride: ManualPmsRingOverride | null = null,
): RingGeometry | null {
  if (!view.cycleLengthDays || !view.anchorPeriodStart || !view.periodLengthDays) return null;

  const { cycleLengthDays, periodLengthDays, anchorPeriodStart } = view;
  const periodStart = currentCyclePeriodStart(anchorPeriodStart, cycleLengthDays, today);
  const cycleStartDay = periodStart;
  const normalizedDayOffset = (date: string) =>
    ((daysBetween(cycleStartDay, date) % cycleLengthDays) + cycleLengthDays) % cycleLengthDays;
  const dayOffset = (date: string) => daysBetween(cycleStartDay, date);

  const ovulationDate = calculateOvulationDate(shiftDate(periodStart, cycleLengthDays));
  const fertileWindow = calculateFertileWindow(ovulationDate);
  const fertileWindowStart = fertileWindow.start;
  const fertileWindowEnd = fertileWindow.end;
  const estimatedPmsStart = shiftDate(periodStart, cycleLengthDays - PMS_LEAD_DAYS);
  const estimatedPmsEnd = shiftDate(periodStart, cycleLengthDays - 1);

  const periodStartAngle = angleForDay(dayOffset(periodStart), cycleLengthDays);
  const periodEndAngle = angleForDay(dayOffset(periodStart) + periodLengthDays, cycleLengthDays);
  const fertileStartAngle = angleForDay(dayOffset(fertileWindowStart), cycleLengthDays);
  const fertileEndAngle = angleForDay(dayOffset(fertileWindowEnd) + 1, cycleLengthDays);

  const pmsStartAngle = manualPmsOverride
    ? angleForDay(normalizedDayOffset(manualPmsOverride.startDate), cycleLengthDays)
    : angleForDay(dayOffset(estimatedPmsStart), cycleLengthDays);
  const pmsEndAngle = manualPmsOverride
    ? angleForDay(normalizedDayOffset(manualPmsOverride.endDate) + 1, cycleLengthDays)
    : angleForDay(dayOffset(estimatedPmsEnd) + 1, cycleLengthDays);

  const midAngle = (start: number, end: number) => start + (((end - start + 360) % 360) / 2);

  const todayDayOffset = normalizedDayOffset(today);
  const todayAngle = manualPmsOverride
    ? manualPmsMarkerAngle(pmsStartAngle, pmsEndAngle)
    : angleForDay(todayDayOffset, cycleLengthDays);

  const segments: RingSegment[] = [
    { key: "period", path: arcPath(periodStartAngle, periodEndAngle), labelAngle: midAngle(periodStartAngle, periodEndAngle) },
    { key: "fertile", path: arcPath(fertileStartAngle, fertileEndAngle), labelAngle: midAngle(fertileStartAngle, fertileEndAngle) },
    { key: "pms", path: arcPath(pmsStartAngle, pmsEndAngle), labelAngle: midAngle(pmsStartAngle, pmsEndAngle) },
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
