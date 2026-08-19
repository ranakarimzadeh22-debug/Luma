import { createClient } from "./supabase";

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

/**
 * Fetch a single pregnancy week from the database.
 * Falls back to a minimal object if the DB query fails.
 */
export async function getPregnancyWeekData(week: number): Promise<PregnancyWeek | undefined> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pregnancy_weeks")
    .select("*")
    .eq("week", week)
    .maybeSingle();

  if (error || !data) {
    console.warn("getPregnancyWeekData: DB query failed, returning undefined", error);
    return undefined;
  }

  return {
    week: data.week,
    fruit: data.fruit,
    fruitDe: data.fruit_de,
    fruitEn: data.fruit_en,
    fruitFa: data.fruit_fa,
    sizeCm: data.size_cm,
    weightG: data.weight_g,
    milestone: data.milestone_de,
    milestoneDe: data.milestone_de,
    milestoneEn: data.milestone_en,
    milestoneFa: data.milestone_fa,
    tip: data.tip_de,
    tipDe: data.tip_de,
    tipEn: data.tip_en,
    tipFa: data.tip_fa,
  };
}

/**
 * Fetch all pregnancy weeks from the database.
 */
export async function getAllPregnancyWeeks(): Promise<PregnancyWeek[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pregnancy_weeks")
    .select("*")
    .order("week", { ascending: true });

  if (error || !data) {
    console.warn("getAllPregnancyWeeks: DB query failed", error);
    return [];
  }

  return data.map((row) => ({
    week: row.week,
    fruit: row.fruit,
    fruitDe: row.fruit_de,
    fruitEn: row.fruit_en,
    fruitFa: row.fruit_fa,
    sizeCm: row.size_cm,
    weightG: row.weight_g,
    milestone: row.milestone_de,
    milestoneDe: row.milestone_de,
    milestoneEn: row.milestone_en,
    milestoneFa: row.milestone_fa,
    tip: row.tip_de,
    tipDe: row.tip_de,
    tipEn: row.tip_en,
    tipFa: row.tip_fa,
  }));
}