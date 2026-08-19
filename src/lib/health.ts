import { createClient } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

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

// ============================================
// Hilfsfunktion: Heutiges Datum als YYYY-MM-DD
// ============================================
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ============================================
// user_daily_health
// ============================================

export async function getDailyHealth(userId: string, date?: string): Promise<DailyHealth | null> {
  const supabase = createClient();
  const targetDate = date || getTodayKey();

  const { data, error } = await supabase
    .from("user_daily_health")
    .select("*")
    .eq("user_id", userId)
    .eq("date", targetDate)
    .maybeSingle();

  if (error) {
    console.error("getDailyHealth error:", error);
    return null;
  }
  return data;
}

export async function upsertDailyHealth(
  userId: string,
  date: string,
  waterLiters: number,
  vitaminsChecked: Record<string, boolean>
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("user_daily_health").upsert(
    {
      user_id: userId,
      date,
      water_liters: waterLiters,
      vitamins_checked: vitaminsChecked,
    },
    { onConflict: "user_id, date" }
  );

  if (error) {
    console.error("upsertDailyHealth error:", error);
    return false;
  }
  return true;
}

// ============================================
// user_supplements
// ============================================

export async function getSupplements(userId: string): Promise<UserSupplement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_supplements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getSupplements error:", error);
    return [];
  }
  return data || [];
}

export async function addSupplement(
  userId: string,
  name: string,
  dose: string,
  time: string
): Promise<UserSupplement | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_supplements")
    .insert({ user_id: userId, name, dose, time })
    .select()
    .single();

  if (error) {
    console.error("addSupplement error:", error);
    return null;
  }
  return data;
}

export async function updateSupplement(
  id: number,
  userId: string,
  name: string,
  dose: string,
  time: string
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_supplements")
    .update({ name, dose, time })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("updateSupplement error:", error);
    return false;
  }
  return true;
}

export async function deleteSupplement(id: number, userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_supplements")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("deleteSupplement error:", error);
    return false;
  }
  return true;
}

// ============================================
// user_supplement_log
// ============================================

export async function getSupplementLog(
  userId: string,
  supplementId: number,
  date?: string
): Promise<SupplementLog | null> {
  const supabase = createClient();
  const targetDate = date || getTodayKey();

  const { data, error } = await supabase
    .from("user_supplement_log")
    .select("*")
    .eq("user_id", userId)
    .eq("supplement_id", supplementId)
    .eq("date", targetDate)
    .maybeSingle();

  if (error) {
    console.error("getSupplementLog error:", error);
    return null;
  }
  return data;
}

export async function upsertSupplementLog(
  userId: string,
  supplementId: number,
  date: string,
  checked: boolean
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("user_supplement_log").upsert(
    {
      user_id: userId,
      supplement_id: supplementId,
      date,
      checked,
    },
    { onConflict: "user_id, supplement_id, date" }
  );

  if (error) {
    console.error("upsertSupplementLog error:", error);
    return false;
  }
  return true;
}

export async function getTodaySupplementLogs(
  userId: string,
  date?: string
): Promise<SupplementLog[]> {
  const supabase = createClient();
  const targetDate = date || getTodayKey();

  const { data, error } = await supabase
    .from("user_supplement_log")
    .select("*")
    .eq("user_id", userId)
    .eq("date", targetDate);

  if (error) {
    console.error("getTodaySupplementLogs error:", error);
    return [];
  }
  return data || [];
}

// ============================================
// Supplement-Verlauf für History-Chart
// ============================================

export interface SupplementHistoryItem {
  supplementName: string;
  dose: string;
  logs: Record<string, boolean>; // date string → checked
}

export async function getSupplementHistory(
  userId: string,
  days: number = 14
): Promise<{ dates: string[]; items: SupplementHistoryItem[] }> {
  const supabase = createClient();

  // Generate date range
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  // Get all supplements
  const { data: supplements, error: supErr } = await supabase
    .from("user_supplements")
    .select("*")
    .eq("user_id", userId);

  if (supErr || !supplements) return { dates, items: [] };

  // Get all logs in date range
  const { data: logs, error: logErr } = await supabase
    .from("user_supplement_log")
    .select("*")
    .eq("user_id", userId)
    .in("date", dates);

  if (logErr) return { dates, items: [] };

  // Build lookup: supplement_id + date → checked
  const logMap = new Map<string, boolean>();
  (logs || []).forEach((log: { supplement_id: number; date: string; checked: boolean }) => {
    logMap.set(`${log.supplement_id}_${log.date}`, log.checked);
  });

  // Build items with logs for each supplement
  const items: SupplementHistoryItem[] = supplements.map((s) => {
    const logs: Record<string, boolean> = {};
    dates.forEach((date) => {
      const key = `${s.id}_${date}`;
      logs[date] = logMap.has(key) ? logMap.get(key)! : false;
    });
    return {
      supplementName: s.name,
      dose: s.dose,
      logs,
    };
  });

  return { dates, items };
}

// ============================================
// user_supplement_reminders
// ============================================

export async function getReminders(userId: string): Promise<SupplementReminder[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_supplement_reminders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getReminders error:", error);
    return [];
  }
  return data || [];
}

export async function addReminder(
  userId: string,
  supplementName: string,
  time: string,
  enabled: boolean
): Promise<SupplementReminder | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_supplement_reminders")
    .insert({ user_id: userId, supplement_name: supplementName, time, enabled })
    .select()
    .single();

  if (error) {
    console.error("addReminder error:", error);
    return null;
  }
  return data;
}

export async function updateReminder(
  id: number,
  userId: string,
  supplementName: string,
  time: string,
  enabled: boolean
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_supplement_reminders")
    .update({ supplement_name: supplementName, time, enabled })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("updateReminder error:", error);
    return false;
  }
  return true;
}

export async function deleteReminder(id: number, userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("user_supplement_reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("deleteReminder error:", error);
    return false;
  }
  return true;
}

// ============================================
// Wasser-Verlauf (letzten 7 Tage für Diagramm)
// ============================================

export interface WaterHistoryEntry {
  date: string; // YYYY-MM-DD
  water_liters: number;
}

export async function getWaterHistory(userId: string): Promise<WaterHistoryEntry[]> {
  const supabase = createClient();

  // Generate last 7 dates
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  const { data, error } = await supabase
    .from("user_daily_health")
    .select("date, water_liters")
    .eq("user_id", userId)
    .in("date", dates)
    .order("date", { ascending: true });

  if (error) {
    console.error("getWaterHistory error:", error);
    return dates.map((date) => ({ date, water_liters: 0 }));
  }

  // Merge with all dates (fill missing with 0)
  const dataMap = new Map<string, number>();
  (data || []).forEach((row: { date: string; water_liters: number }) => {
    dataMap.set(row.date, row.water_liters || 0);
  });

  return dates.map((date) => ({
    date,
    water_liters: dataMap.get(date) || 0,
  }));
}

// ============================================
// Supplement Calendar – Einnahme-Kalender
// ============================================

export interface SupplementCalendarEntry {
  id?: number;
  user_id: string;
  supplement_id: number;
  date: string; // YYYY-MM-DD
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

/**
 * Holt den Kalender-Status für ein Supplement für die letzten N Tage.
 */
export async function getSupplementCalendar(
  userId: string,
  supplementId: number,
  days: number = 30
): Promise<SupplementCalendarEntry[]> {
  const supabase = createClient();

  // Generate date range
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  const { data, error } = await supabase
    .from("user_supplement_calendar")
    .select("*")
    .eq("user_id", userId)
    .eq("supplement_id", supplementId)
    .in("date", dates)
    .order("date", { ascending: true });

  if (error) {
    console.error("getSupplementCalendar error:", JSON.stringify(error, null, 2));
    console.error("getSupplementCalendar - userId:", userId, "supplementId:", supplementId);
    // If the table doesn't exist (PGRST205), return empty array gracefully
    if (error.code === "PGRST205") {
      console.warn("getSupplementCalendar - Table 'user_supplement_calendar' does not exist. Run migration 011.");
    }
    return [];
  }
  return data || [];
}

/**
 * Setzt den Status für ein Supplement an einem bestimmten Tag.
 */
export async function setSupplementStatus(
  userId: string,
  supplementId: number,
  date: string,
  status: "taken" | "missed" | "open" | "late"
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("user_supplement_calendar").upsert(
    {
      user_id: userId,
      supplement_id: supplementId,
      date,
      status,
      taken_at: status === "taken" ? new Date().toISOString() : null,
    },
    { onConflict: "user_id, supplement_id, date" }
  );

  if (error) {
    console.error("setSupplementStatus error:", error);
    return false;
  }
  return true;
}

/**
 * Holt den Streak für ein Supplement.
 */
export async function getSupplementStreak(
  userId: string,
  supplementId: number
): Promise<SupplementStreak | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_supplement_streaks")
    .select("*")
    .eq("user_id", userId)
    .eq("supplement_id", supplementId)
    .maybeSingle();

  if (error) {
    console.error("getSupplementStreak error:", error);
    return null;
  }
  return data;
}

/**
 * Aktualisiert den Streak nachdem ein Supplement eingenommen wurde.
 * Berechnet: current_streak = aufeinanderfolgende Tage seit last_taken_date
 */
export async function updateSupplementStreak(
  userId: string,
  supplementId: number,
  date: string
): Promise<boolean> {
  const supabase = createClient();

  // Hole aktuellen Streak
  const { data: streak } = await supabase
    .from("user_supplement_streaks")
    .select("*")
    .eq("user_id", userId)
    .eq("supplement_id", supplementId)
    .maybeSingle();

  const today = new Date(date + "T00:00:00");
  const lastTaken = streak?.last_taken_date
    ? new Date(streak.last_taken_date + "T00:00:00")
    : null;

  let newStreak = 1;
  if (lastTaken) {
    const diffDays = Math.floor(
      (today.getTime() - lastTaken.getTime()) / (1000 * 60 * 60 * 24)
    );
    newStreak = diffDays === 1 ? (streak?.current_streak || 0) + 1 : 1;
  }

  const longest = Math.max(newStreak, streak?.longest_streak || 0);

  const { error } = await supabase.from("user_supplement_streaks").upsert(
    {
      user_id: userId,
      supplement_id: supplementId,
      current_streak: newStreak,
      longest_streak: longest,
      last_taken_date: date,
    },
    { onConflict: "user_id, supplement_id" }
  );

  if (error) {
    console.error("updateSupplementStreak error:", error);
    return false;
  }
  return true;
}

/**
 * Holt alle Kalender-Einträge für alle Supplements eines Users für einen Zeitraum.
 * Wird für die Übersichts-Heatmap verwendet.
 */
export async function getAllSupplementCalendar(
  userId: string,
  days: number = 30
): Promise<{ supplementId: number; supplementName: string; dose: string; entries: SupplementCalendarEntry[] }[]> {
  const supabase = createClient();

  // Alle Supplements laden
  const supplements = await getSupplements(userId);

  // Für jedes Supplement die Kalender-Daten holen
  const result = await Promise.all(
    supplements.map(async (s) => {
      const entries = await getSupplementCalendar(userId, s.id!, days);
      return {
        supplementId: s.id!,
        supplementName: s.name,
        dose: s.dose,
        entries,
      };
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

export async function getBodyMetrics(userId: string): Promise<BodyMetrics | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_body_metrics")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data;
}

export async function upsertBodyMetrics(
  userId: string,
  weightKg: number | null,
  heightCm: number | null
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("user_body_metrics").upsert(
    {
      user_id: userId,
      weight_kg: weightKg,
      height_cm: heightCm,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("upsertBodyMetrics error:", error);
    return false;
  }
  return true;
}

/**
 * Berechnet die empfohlene tägliche Wasserzufuhr in Litern.
 * Formel (wenn height_cm vorhanden):
 *   water = (weight_kg × 0.03) + (height_cm × 0.004)
 * Formel (nur weight_kg):
 *   water = weight_kg × 0.033
 * Fallback: 2.0 Liter
 */
export function calculateWaterGoal(weightKg: number | null, heightCm: number | null): number {
  if (weightKg && weightKg > 0) {
    if (heightCm && heightCm > 0) {
      return parseFloat(((weightKg * 0.03) + (heightCm * 0.004)).toFixed(2));
    }
    return parseFloat((weightKg * 0.033).toFixed(2));
  }
  return 2.0; // Default fallback
}
