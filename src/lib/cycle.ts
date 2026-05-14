export interface CycleData {
  lastPeriodStart: Date;
  cycleLength: number; // days
  periodLength: number; // days
}

export function getNextPeriodDate(data: CycleData): Date {
  const next = new Date(data.lastPeriodStart);
  next.setDate(next.getDate() + data.cycleLength);
  return next;
}

export function getDaysUntilNextPeriod(data: CycleData): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = getNextPeriodDate(data);
  next.setHours(0, 0, 0, 0);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getOvulationDate(data: CycleData): Date {
  const ovulation = new Date(data.lastPeriodStart);
  ovulation.setDate(ovulation.getDate() + data.cycleLength - 14);
  return ovulation;
}

export function getCurrentPhase(data: CycleData): {
  name: string;
  color: string;
  description: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(data.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const dayOfCycle = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) % data.cycleLength + 1;

  if (dayOfCycle <= data.periodLength) {
    return { name: "Menstruation", color: "rose", description: "Ruhige Zeit für dich selbst" };
  } else if (dayOfCycle <= 13) {
    return { name: "Follikelphase", color: "pink", description: "Energie steigt, du blühst auf" };
  } else if (dayOfCycle <= 16) {
    return { name: "Eisprung", color: "purple", description: "Höchste Fruchtbarkeit" };
  } else {
    return { name: "Lutealphase", color: "indigo", description: "Zeit zum Entspannen & Reflektieren" };
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
}
