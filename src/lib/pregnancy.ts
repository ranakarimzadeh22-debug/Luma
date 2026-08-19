export interface PregnancyWeek {
  week: number;
  fruit: string;
  fruitDe: string;
  fruitEn: string;
  fruitFa: string;
  sizeCm: number;
  weightG: number;
  milestone: string;
  milestoneDe: string;
  milestoneEn: string;
  milestoneFa: string;
  tip: string;
  tipDe: string;
  tipEn: string;
  tipFa: string;
}

export function getDueDate(lastPeriodStart: string): Date {
  const date = new Date(lastPeriodStart);
  date.setDate(date.getDate() + 280); // 40 weeks
  return date;
}

export function getCurrentWeek(lastPeriodStart: string): number {
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(40, week));
}

export function getPregnancyProgress(week: number): number {
  return (week / 40) * 100;
}

export function formatDateDE(date: Date): string {
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}
