"use server";

import { prisma } from "@/lib/db";
import type { PregnancyWeek } from "@/lib/pregnancy";

/**
 * Fetch a single pregnancy week from the database.
 * pregnancy_weeks is static reference data — no auth required.
 */
export async function getPregnancyWeekData(week: number): Promise<PregnancyWeek | undefined> {
  const row = await prisma.pregnancyWeek.findUnique({ where: { week } });
  if (!row) return undefined;

  return {
    week: row.week,
    fruit: row.fruit,
    fruitDe: row.fruitDe,
    fruitEn: row.fruitEn,
    fruitFa: row.fruitFa,
    sizeCm: Number(row.sizeCm),
    weightG: row.weightG,
    milestone: row.milestoneDe,
    milestoneDe: row.milestoneDe,
    milestoneEn: row.milestoneEn,
    milestoneFa: row.milestoneFa,
    tip: row.tipDe,
    tipDe: row.tipDe,
    tipEn: row.tipEn,
    tipFa: row.tipFa,
  };
}

export async function getAllPregnancyWeeks(): Promise<PregnancyWeek[]> {
  const rows = await prisma.pregnancyWeek.findMany({ orderBy: { week: "asc" } });

  return rows.map((row) => ({
    week: row.week,
    fruit: row.fruit,
    fruitDe: row.fruitDe,
    fruitEn: row.fruitEn,
    fruitFa: row.fruitFa,
    sizeCm: Number(row.sizeCm),
    weightG: row.weightG,
    milestone: row.milestoneDe,
    milestoneDe: row.milestoneDe,
    milestoneEn: row.milestoneEn,
    milestoneFa: row.milestoneFa,
    tip: row.tipDe,
    tipDe: row.tipDe,
    tipEn: row.tipEn,
    tipFa: row.tipFa,
  }));
}
