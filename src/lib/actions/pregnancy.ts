"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface PregnancyRecord {
  is_pregnant: boolean;
  last_period_start: string | null;
  due_date: string | null;
}

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getUserPregnancy(): Promise<PregnancyRecord | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.pregnancy.findUnique({ where: { userId } });
  if (!row) return null;

  return {
    is_pregnant: row.isPregnant,
    last_period_start: row.lastPeriodStart ? row.lastPeriodStart.toISOString().split("T")[0] : null,
    due_date: row.dueDate ? row.dueDate.toISOString().split("T")[0] : null,
  };
}

export async function saveUserPregnancy(params: {
  isPregnant: boolean;
  lastPeriodStart: string | null;
  dueDate: string | null;
}): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    await prisma.pregnancy.upsert({
      where: { userId },
      create: {
        userId,
        isPregnant: params.isPregnant,
        lastPeriodStart: params.lastPeriodStart ? new Date(params.lastPeriodStart) : null,
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
      },
      update: {
        isPregnant: params.isPregnant,
        lastPeriodStart: params.lastPeriodStart ? new Date(params.lastPeriodStart) : null,
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
      },
    });
    return true;
  } catch (err) {
    console.error("saveUserPregnancy error:", err);
    return false;
  }
}
