"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTodayKey } from "@/lib/health-utils";

// ============================================
// Typen
// ============================================

export interface DailyHealth {
  id?: number;
  user_id: string;
  date: string; // YYYY-MM-DD
  water_liters: number;
  vitamins_checked: Record<string, boolean>;
}

export interface UserSupplement {
  id?: number;
  user_id: string;
  name: string;
  dose: string;
  time: string; // HH:MM
}

export interface SupplementLog {
  id?: number;
  user_id: string;
  supplement_id: number;
  date: string; // YYYY-MM-DD
  checked: boolean;
}

export interface SupplementReminder {
  id?: number;
  user_id: string;
  supplement_name: string;
  time: string; // HH:MM
  enabled: boolean;
}

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function dateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ============================================
// user_daily_health
// ============================================

export async function getDailyHealth(_userId?: string, date?: string): Promise<DailyHealth | null> {
  const userId = await requireUserId();
  if (!userId) return null;
  const targetDate = date || (await getTodayKey());

  const row = await prisma.userDailyHealth.findUnique({
    where: { userId_date: { userId, date: dateOnly(targetDate) } },
  });
  if (!row) return null;

  return {
    id: Number(row.id),
    user_id: row.userId,
    date: toDateKey(row.date),
    water_liters: row.waterLiters,
    vitamins_checked: row.vitaminsChecked as Record<string, boolean>,
  };
}

export async function upsertDailyHealth(
  _userId: string | undefined,
  date: string,
  waterLiters: number,
  vitaminsChecked: Record<string, boolean>
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    await prisma.userDailyHealth.upsert({
      where: { userId_date: { userId, date: dateOnly(date) } },
      create: { userId, date: dateOnly(date), waterLiters, vitaminsChecked },
      update: { waterLiters, vitaminsChecked },
    });
    return true;
  } catch (err) {
    console.error("upsertDailyHealth error:", err);
    return false;
  }
}

// ============================================
// user_supplements
// ============================================

export async function getSupplements(_userId?: string): Promise<UserSupplement[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const rows = await prisma.userSupplement.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: Number(r.id),
    user_id: r.userId,
    name: r.name,
    dose: r.dose,
    time: r.time,
  }));
}

export async function addSupplement(
  _userId: string | undefined,
  name: string,
  dose: string,
  time: string
): Promise<UserSupplement | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  try {
    const row = await prisma.userSupplement.create({
      data: { userId, name, dose, time },
    });
    return { id: Number(row.id), user_id: row.userId, name: row.name, dose: row.dose, time: row.time };
  } catch (err) {
    console.error("addSupplement error:", err);
    return null;
  }
}

export async function updateSupplement(
  id: number,
  _userId: string | undefined,
  name: string,
  dose: string,
  time: string
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    const result = await prisma.userSupplement.updateMany({
      where: { id: BigInt(id), userId },
      data: { name, dose, time },
    });
    return result.count > 0;
  } catch (err) {
    console.error("updateSupplement error:", err);
    return false;
  }
}

export async function deleteSupplement(id: number, _userId?: string): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    const result = await prisma.userSupplement.deleteMany({
      where: { id: BigInt(id), userId },
    });
    return result.count > 0;
  } catch (err) {
    console.error("deleteSupplement error:", err);
    return false;
  }
}

// ============================================
// user_supplement_log
// ============================================

export async function getSupplementLog(
  _userId: string | undefined,
  supplementId: number,
  date?: string
): Promise<SupplementLog | null> {
  const userId = await requireUserId();
  if (!userId) return null;
  const targetDate = date || (await getTodayKey());

  const row = await prisma.userSupplementLog.findUnique({
    where: {
      userId_supplementId_date: { userId, supplementId: BigInt(supplementId), date: dateOnly(targetDate) },
    },
  });
  if (!row) return null;

  return {
    id: Number(row.id),
    user_id: row.userId,
    supplement_id: Number(row.supplementId),
    date: toDateKey(row.date),
    checked: row.checked,
  };
}

export async function upsertSupplementLog(
  _userId: string | undefined,
  supplementId: number,
  date: string,
  checked: boolean
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    await prisma.userSupplementLog.upsert({
      where: {
        userId_supplementId_date: { userId, supplementId: BigInt(supplementId), date: dateOnly(date) },
      },
      create: { userId, supplementId: BigInt(supplementId), date: dateOnly(date), checked },
      update: { checked },
    });
    return true;
  } catch (err) {
    console.error("upsertSupplementLog error:", err);
    return false;
  }
}

export async function getTodaySupplementLogs(
  _userId?: string,
  date?: string
): Promise<SupplementLog[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  const targetDate = date || (await getTodayKey());

  const rows = await prisma.userSupplementLog.findMany({
    where: { userId, date: dateOnly(targetDate) },
  });
  return rows.map((r) => ({
    id: Number(r.id),
    user_id: r.userId,
    supplement_id: Number(r.supplementId),
    date: toDateKey(r.date),
    checked: r.checked,
  }));
}

// ============================================
// Supplement-Verlauf für History-Chart
// ============================================

export interface SupplementHistoryItem {
  supplementName: string;
  dose: string;
  logs: Record<string, boolean>;
}

export async function getSupplementHistory(
  _userId?: string,
  days: number = 14
): Promise<{ dates: string[]; items: SupplementHistoryItem[] }> {
  const userId = await requireUserId();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  if (!userId) return { dates, items: [] };

  const supplements = await prisma.userSupplement.findMany({ where: { userId } });
  const logs = await prisma.userSupplementLog.findMany({
    where: { userId, date: { gte: dateOnly(dates[0]), lte: dateOnly(dates[dates.length - 1]) } },
  });

  const logMap = new Map<string, boolean>();
  logs.forEach((log) => {
    logMap.set(`${log.supplementId}_${toDateKey(log.date)}`, log.checked);
  });

  const items: SupplementHistoryItem[] = supplements.map((s) => {
    const dayLogs: Record<string, boolean> = {};
    dates.forEach((date) => {
      const key = `${s.id}_${date}`;
      dayLogs[date] = logMap.has(key) ? logMap.get(key)! : false;
    });
    return { supplementName: s.name, dose: s.dose, logs: dayLogs };
  });

  return { dates, items };
}

// ============================================
// user_supplement_reminders
// ============================================

export async function getReminders(_userId?: string): Promise<SupplementReminder[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const rows = await prisma.userSupplementReminder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: Number(r.id),
    user_id: r.userId,
    supplement_name: r.supplementName,
    time: r.time,
    enabled: r.enabled,
  }));
}

export async function addReminder(
  _userId: string | undefined,
  supplementName: string,
  time: string,
  enabled: boolean
): Promise<SupplementReminder | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  try {
    const row = await prisma.userSupplementReminder.create({
      data: { userId, supplementName, time, enabled },
    });
    return { id: Number(row.id), user_id: row.userId, supplement_name: row.supplementName, time: row.time, enabled: row.enabled };
  } catch (err) {
    console.error("addReminder error:", err);
    return null;
  }
}

export async function updateReminder(
  id: number,
  _userId: string | undefined,
  supplementName: string,
  time: string,
  enabled: boolean
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    const result = await prisma.userSupplementReminder.updateMany({
      where: { id: BigInt(id), userId },
      data: { supplementName, time, enabled },
    });
    return result.count > 0;
  } catch (err) {
    console.error("updateReminder error:", err);
    return false;
  }
}

export async function deleteReminder(id: number, _userId?: string): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    const result = await prisma.userSupplementReminder.deleteMany({
      where: { id: BigInt(id), userId },
    });
    return result.count > 0;
  } catch (err) {
    console.error("deleteReminder error:", err);
    return false;
  }
}

// ============================================
// Wasser-Verlauf (letzten 7 Tage für Diagramm)
// ============================================

export interface WaterHistoryEntry {
  date: string;
  water_liters: number;
}

export async function getWaterHistory(_userId?: string): Promise<WaterHistoryEntry[]> {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  const userId = await requireUserId();
  if (!userId) return dates.map((date) => ({ date, water_liters: 0 }));

  const rows = await prisma.userDailyHealth.findMany({
    where: { userId, date: { gte: dateOnly(dates[0]), lte: dateOnly(dates[dates.length - 1]) } },
    orderBy: { date: "asc" },
  });

  const dataMap = new Map<string, number>();
  rows.forEach((row) => dataMap.set(toDateKey(row.date), row.waterLiters || 0));

  return dates.map((date) => ({ date, water_liters: dataMap.get(date) || 0 }));
}

// ============================================
// Supplement Calendar – Einnahme-Kalender
// ============================================

export interface SupplementCalendarEntry {
  id?: number;
  user_id: string;
  supplement_id: number;
  date: string;
  status: "taken" | "missed" | "open" | "late";
  taken_at?: string | null;
}

export interface SupplementStreak {
  id?: number;
  user_id: string;
  supplement_id: number;
  current_streak: number;
  longest_streak: number;
  last_taken_date: string | null;
}

export async function getSupplementCalendar(
  _userId: string | undefined,
  supplementId: number,
  days: number = 30
): Promise<SupplementCalendarEntry[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  const rows = await prisma.userSupplementCalendar.findMany({
    where: {
      userId,
      supplementId: BigInt(supplementId),
      date: { gte: dateOnly(dates[0]), lte: dateOnly(dates[dates.length - 1]) },
    },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => ({
    id: Number(r.id),
    user_id: r.userId,
    supplement_id: Number(r.supplementId),
    date: toDateKey(r.date),
    status: r.status as SupplementCalendarEntry["status"],
    taken_at: r.takenAt ? r.takenAt.toISOString() : null,
  }));
}

export async function setSupplementStatus(
  _userId: string | undefined,
  supplementId: number,
  date: string,
  status: "taken" | "missed" | "open" | "late"
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    await prisma.userSupplementCalendar.upsert({
      where: {
        userId_supplementId_date: { userId, supplementId: BigInt(supplementId), date: dateOnly(date) },
      },
      create: {
        userId,
        supplementId: BigInt(supplementId),
        date: dateOnly(date),
        status,
        takenAt: status === "taken" ? new Date() : null,
      },
      update: { status, takenAt: status === "taken" ? new Date() : null },
    });
    return true;
  } catch (err) {
    console.error("setSupplementStatus error:", err);
    return false;
  }
}

export async function getSupplementStreak(
  _userId: string | undefined,
  supplementId: number
): Promise<SupplementStreak | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.userSupplementStreak.findUnique({
    where: { userId_supplementId: { userId, supplementId: BigInt(supplementId) } },
  });
  if (!row) return null;

  return {
    id: Number(row.id),
    user_id: row.userId,
    supplement_id: Number(row.supplementId),
    current_streak: row.currentStreak,
    longest_streak: row.longestStreak,
    last_taken_date: row.lastTakenDate ? toDateKey(row.lastTakenDate) : null,
  };
}

export async function updateSupplementStreak(
  _userId: string | undefined,
  supplementId: number,
  date: string
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  const streak = await prisma.userSupplementStreak.findUnique({
    where: { userId_supplementId: { userId, supplementId: BigInt(supplementId) } },
  });

  const today = new Date(date + "T00:00:00");
  const lastTaken = streak?.lastTakenDate ? new Date(toDateKey(streak.lastTakenDate) + "T00:00:00") : null;

  let newStreak = 1;
  if (lastTaken) {
    const diffDays = Math.floor((today.getTime() - lastTaken.getTime()) / (1000 * 60 * 60 * 24));
    newStreak = diffDays === 1 ? (streak?.currentStreak || 0) + 1 : 1;
  }

  const longest = Math.max(newStreak, streak?.longestStreak || 0);

  try {
    await prisma.userSupplementStreak.upsert({
      where: { userId_supplementId: { userId, supplementId: BigInt(supplementId) } },
      create: {
        userId,
        supplementId: BigInt(supplementId),
        currentStreak: newStreak,
        longestStreak: longest,
        lastTakenDate: dateOnly(date),
      },
      update: { currentStreak: newStreak, longestStreak: longest, lastTakenDate: dateOnly(date) },
    });
    return true;
  } catch (err) {
    console.error("updateSupplementStreak error:", err);
    return false;
  }
}

export async function getAllSupplementCalendar(
  _userId?: string,
  days: number = 30
): Promise<{ supplementId: number; supplementName: string; dose: string; entries: SupplementCalendarEntry[] }[]> {
  const supplements = await getSupplements();

  const result = await Promise.all(
    supplements.map(async (s) => {
      const entries = await getSupplementCalendar(undefined, s.id!, days);
      return { supplementId: s.id!, supplementName: s.name, dose: s.dose, entries };
    })
  );

  return result;
}

// ============================================
// user_body_metrics (Gewicht & Größe)
// ============================================

export interface BodyMetrics {
  id?: number;
  user_id: string;
  weight_kg: number | null;
  height_cm: number | null;
}

export async function getBodyMetrics(_userId?: string): Promise<BodyMetrics | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.userBodyMetrics.findUnique({ where: { userId } });
  if (!row) return null;
  return { id: Number(row.id), user_id: row.userId, weight_kg: row.weightKg, height_cm: row.heightCm };
}

export async function upsertBodyMetrics(
  _userId: string | undefined,
  weightKg: number | null,
  heightCm: number | null
): Promise<boolean> {
  const userId = await requireUserId();
  if (!userId) return false;

  try {
    await prisma.userBodyMetrics.upsert({
      where: { userId },
      create: { userId, weightKg, heightCm },
      update: { weightKg, heightCm },
    });
    return true;
  } catch (err) {
    console.error("upsertBodyMetrics error:", err);
    return false;
  }
}

