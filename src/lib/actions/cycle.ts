"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface CycleRecord {
  last_period_start: string;
  cycle_length: number;
  period_length: number;
}

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getUserCycle(): Promise<CycleRecord | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.userCycle.findUnique({ where: { userId } });
  if (!row) return null;

  return {
    last_period_start: row.lastPeriodStart.toISOString().split("T")[0],
    cycle_length: row.cycleLength,
    period_length: row.periodLength,
  };
}

export async function saveUserCycle(params: {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
}): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    await prisma.userCycle.upsert({
      where: { userId },
      create: {
        userId,
        lastPeriodStart: new Date(params.lastPeriodStart),
        cycleLength: params.cycleLength,
        periodLength: params.periodLength,
      },
      update: {
        lastPeriodStart: new Date(params.lastPeriodStart),
        cycleLength: params.cycleLength,
        periodLength: params.periodLength,
      },
    });
    return true;
  } catch (err) {
    console.error("saveUserCycle error:", err);
    return false;
  }
}
