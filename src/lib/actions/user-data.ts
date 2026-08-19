"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePartnerCode } from "@/lib/partner";
import { getUserCycle, type CycleRecord } from "./cycle";
import { getUserPregnancy, type PregnancyRecord } from "./pregnancy";

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// ============================================
// profiles: name + partner_code
// ============================================

export async function getProfileNameAndCode(): Promise<{ name: string; partner_code: string } | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.profile.findUnique({ where: { id: userId } });
  if (!row) return null;

  let partnerCode = row.partnerCode;
  if (!partnerCode) {
    partnerCode = generatePartnerCode(row.name || "Luma");
    await prisma.profile.update({ where: { id: userId }, data: { partnerCode } });
  }

  return { name: row.name, partner_code: partnerCode };
}

// ============================================
// user_supplement_reminders: next reminder
// ============================================

export async function getNextReminder(): Promise<{ supplement_name: string; time: string } | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.userSupplementReminder.findFirst({
    where: { userId, enabled: true },
    orderBy: { time: "asc" },
  });
  if (!row) return null;
  return { supplement_name: row.supplementName, time: row.time };
}

// ============================================
// Combined dashboard/home data
// ============================================

export async function getHomeData(): Promise<{
  cycle: CycleRecord | null;
  pregnancy: PregnancyRecord | null;
  nextReminder: { supplement_name: string; time: string } | null;
}> {
  const [cycle, pregnancy, nextReminder] = await Promise.all([
    getUserCycle(),
    getUserPregnancy(),
    getNextReminder(),
  ]);
  return { cycle, pregnancy, nextReminder };
}

// ============================================
// Day detail (water + supplement logs for a specific date)
// ============================================

export interface DayDetailData {
  waterLiters: number;
  supplements: { name: string; checked: boolean }[];
}

export async function getDayDetail(dateKey: string): Promise<DayDetailData> {
  const userId = await requireUserId();
  if (!userId) return { waterLiters: 0, supplements: [] };

  const date = new Date(`${dateKey}T00:00:00.000Z`);

  const [health, supplements] = await Promise.all([
    prisma.userDailyHealth.findUnique({ where: { userId_date: { userId, date } } }),
    prisma.userSupplement.findMany({ where: { userId } }),
  ]);

  const supplementIds = supplements.map((s) => s.id);
  const logs = supplementIds.length
    ? await prisma.userSupplementLog.findMany({
        where: { userId, date, supplementId: { in: supplementIds } },
      })
    : [];

  const checkedMap = new Map<string, boolean>();
  logs.forEach((log) => checkedMap.set(log.supplementId.toString(), log.checked));

  return {
    waterLiters: health?.waterLiters ?? 0,
    supplements: supplements.map((s) => ({
      name: s.name,
      checked: checkedMap.get(s.id.toString()) ?? false,
    })),
  };
}

// ============================================
// Is the current user pregnant? (small helper for WaterTracker etc.)
// ============================================

export async function getIsPregnant(): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;
  const row = await prisma.pregnancy.findUnique({ where: { userId }, select: { isPregnant: true } });
  return row?.isPregnant ?? false;
}

// ============================================
// Period reminder: name + cycle in one call
// ============================================

export async function getPeriodReminderData(): Promise<{ name: string; cycle: CycleRecord | null } | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const [profile, cycle] = await Promise.all([
    prisma.profile.findUnique({ where: { id: userId }, select: { name: true } }),
    getUserCycle(),
  ]);

  return { name: profile?.name ?? "du", cycle };
}

// ============================================
// gefuhl page: profile name
// ============================================

export async function getProfileName(): Promise<string | null> {
  const userId = await requireUserId();
  if (!userId) return null;
  const row = await prisma.profile.findUnique({ where: { id: userId }, select: { name: true } });
  return row?.name ?? null;
}
