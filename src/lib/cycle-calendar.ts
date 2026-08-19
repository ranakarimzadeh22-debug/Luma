export interface CycleData {
  lastPeriodStart: Date;
  cycleLength: number;
  periodLength: number;
}

export interface DayInfo {
  dayOfCycle: number;
  isPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  phase: "menstruation" | "follikel" | "ovulation" | "luteal";
  color: string;
}

/**
 * Get the day-of-cycle (1-based) for a given date.
 */
export function getDayOfCycle(date: Date, cycleData: CycleData): number {
  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 0) return -1; // before cycle start
  return (diffDays % cycleData.cycleLength) + 1;
}

/**
 * Get the ovulation day (1-based day of cycle).
 */
export function getOvulationDay(cycleData: CycleData): number {
  return cycleData.cycleLength - 14;
}

/**
 * Get the fertile window as a range [startDay, endDay] (1-based).
 * Typically 5 days before ovulation + 1 day after.
 */
export function getFertileWindow(cycleData: CycleData): { start: number; end: number } {
  const ovulationDay = getOvulationDay(cycleData);
  return {
    start: Math.max(1, ovulationDay - 5),
    end: Math.min(cycleData.cycleLength, ovulationDay + 1),
  };
}

/**
 * Get the color for a given day of cycle (static – shows full range).
 */
export function getDayColor(dayOfCycle: number, cycleData: CycleData): string {
  const { periodLength, cycleLength } = cycleData;
  const ovulationDay = getOvulationDay(cycleData);
  const fertile = getFertileWindow(cycleData);

  if (dayOfCycle <= 0 || dayOfCycle > cycleLength) return "#f0f0f0"; // outside cycle

  if (dayOfCycle <= periodLength) return "#f4c7d7"; // Rot = Periode
  if (dayOfCycle >= fertile.start && dayOfCycle <= fertile.end) {
    if (dayOfCycle === ovulationDay) return "#b799e5"; // Lila = Eisprung
    return "#ffd9c7"; // Rosa = fruchtbare Tage
  }
  return "#cfe8d5"; // Grün = normale Zyklustage
}

/**
 * Get the color for a given day of cycle (progressive – only colors days up to currentDayOfCycle).
 * 
 * Rules:
 * - Period days (1..periodLength): only red if dayOfCycle <= currentDayOfCycle
 * - Ovulation day: only purple if dayOfCycle <= currentDayOfCycle
 * - Fertile window (non-ovulation): only pink if dayOfCycle <= currentDayOfCycle
 * - All other days: green
 * - Future special-phase days (period/fertile/ovulation after today): green (not yet reached)
 */
export function getProgressiveDayColor(
  dayOfCycle: number,
  currentDayOfCycle: number,
  cycleData: CycleData
): string {
  const { periodLength, cycleLength } = cycleData;
  const ovulationDay = getOvulationDay(cycleData);
  const fertile = getFertileWindow(cycleData);

  if (dayOfCycle <= 0 || dayOfCycle > cycleLength) return "#f0f0f0"; // outside cycle

  // Period phase: only red up to current day
  if (dayOfCycle <= periodLength) {
    if (dayOfCycle <= currentDayOfCycle) return "#f4c7d7"; // Rot = reached period day
    return "#cfe8d5"; // Grün = future period day (not yet reached)
  }

  // Fertile window (including ovulation)
  if (dayOfCycle >= fertile.start && dayOfCycle <= fertile.end) {
    if (dayOfCycle > currentDayOfCycle) return "#cfe8d5"; // Grün = future fertile day (not yet reached)

    if (dayOfCycle === ovulationDay) return "#b799e5"; // Lila = Eisprung (reached)
    return "#ffd9c7"; // Rosa = fruchtbare Tage (reached)
  }

  return "#cfe8d5"; // Grün = normale Zyklustage
}

/**
 * Get full info about a specific day of cycle.
 */
export function getDayInfo(dayOfCycle: number, cycleData: CycleData): DayInfo | null {
  if (dayOfCycle <= 0 || dayOfCycle > cycleData.cycleLength) return null;

  const ovulationDay = getOvulationDay(cycleData);
  const fertile = getFertileWindow(cycleData);

  const isPeriod = dayOfCycle <= cycleData.periodLength;
  const isOvulation = dayOfCycle === ovulationDay;
  const isFertile = dayOfCycle >= fertile.start && dayOfCycle <= fertile.end;

  let phase: DayInfo["phase"];
  let color: string;

  if (isPeriod) {
    phase = "menstruation";
    color = "#f4c7d7";
  } else if (dayOfCycle <= 13) {
    phase = "follikel";
    color = "#cfe8d5";
  } else if (dayOfCycle <= 16) {
    phase = "ovulation";
    color = "#b799e5";
  } else {
    phase = "luteal";
    color = "#ffd9c7";
  }

  return { dayOfCycle, isPeriod, isOvulation, isFertile, phase, color };
}

/**
 * Get the current day within the period (1-based).
 * Returns null if the user is not currently on their period.
 * 
 * Example: currentDayOfCycle=3, periodLength=5 → returns 3 ("Day 3 of period")
 */
export function getCurrentPeriodDay(currentDayOfCycle: number, periodLength: number): number | null {
  if (currentDayOfCycle >= 1 && currentDayOfCycle <= periodLength) {
    return currentDayOfCycle;
  }
  return null;
}

/**
 * Get days until next period starts.
 * Returns -1 if before cycle start.
 */
export function getDaysUntilNextPeriod(cycleData: CycleData): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return -1;
  const daysUntilEnd = cycleData.cycleLength - (diffDays % cycleData.cycleLength);
  return daysUntilEnd;
}

/**
 * Get next period date.
 */
export function getNextPeriodDate(cycleData: CycleData): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return new Date(start);
  const daysSinceLastPeriod = diffDays % cycleData.cycleLength;
  const daysUntilNext = cycleData.cycleLength - daysSinceLastPeriod;
  const next = new Date(today);
  next.setDate(next.getDate() + daysUntilNext);
  return next;
}

/**
 * Get next ovulation date.
 */
export function getNextOvulationDate(cycleData: CycleData): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ovulationDay = getOvulationDay(cycleData);
  const dayOfCycle = getDayOfCycle(today, cycleData);

  if (dayOfCycle < 0) return new Date(cycleData.lastPeriodStart);

  const nextPeriod = getNextPeriodDate(cycleData);
  const ovulationDate = new Date(nextPeriod);
  ovulationDate.setDate(ovulationDate.getDate() - (cycleData.cycleLength - ovulationDay));
  return ovulationDate;
}