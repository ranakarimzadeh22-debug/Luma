"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import {
  getSupplements,
  getTodaySupplementLogs,
  getDailyHealth,
  getBodyMetrics,
  calculateWaterGoal,
  getTodayKey,
} from "@/lib/health";

interface SupplementItem {
  id: string;
  dbId: number;
  name: string;
  dose: string;
  time: string;
}

export default function HealthNotificationManager() {
  const { locale } = useLocale();
  const { user } = useAuth();

  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [waterLiters, setWaterLiters] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2.0);
  const [isPregnant, setIsPregnant] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [lastNotified, setLastNotified] = useState<Record<string, string>>({}); // key -> time

  // Load all data
  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    const today = getTodayKey();

    async function load() {
      // Load supplements
      const dbSupplements = await getSupplements(currentUser.id);
      const items: SupplementItem[] = dbSupplements.map((s) => ({
        id: `db-${s.id}`,
        dbId: s.id!,
        name: s.name,
        dose: s.dose,
        time: s.time,
      }));
      setSupplements(items);

      // Load today's logs
      const logs = await getTodaySupplementLogs(currentUser.id, today);
      const checkedMap: Record<string, boolean> = {};
      logs.forEach((log) => {
        checkedMap[`db-${log.supplement_id}`] = log.checked;
      });
      setChecked(checkedMap);

      // Load water data
      const daily = await getDailyHealth(currentUser.id, today);
      if (daily) {
        setWaterLiters(daily.water_liters || 0);
      }

      // Load body metrics for water goal
      const metrics = await getBodyMetrics(currentUser.id);
      setWaterGoal(calculateWaterGoal(metrics?.weight_kg ?? null, metrics?.height_cm ?? null));

      // Check if pregnant
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: pregData } = await supabase
        .from("pregnancies")
        .select("is_pregnant")
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (pregData?.is_pregnant) {
        setIsPregnant(true);
      }
    }
    load();

    // Check notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, [user]);

  // Request notification permission
  const requestPermission = useCallback(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      setPermission(perm);
    });
  }, []);

  // Check every 30 seconds for reminders
  useEffect(() => {
    if (supplements.length === 0 && waterLiters === 0) return;
    if (permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // 1. Check supplement reminders based on their time field
      supplements.forEach((s) => {
        if (!s.time) return;
        if (checked[s.id]) return; // already taken today

        const notifKey = `supp-${s.id}`;
        const lastNotif = lastNotified[notifKey];

        // Only notify if the time matches and we haven't notified in the last 60 min
        if (s.time === currentTime) {
          if (lastNotif !== currentTime) {
            const body = locale === "de"
              ? `🔔 Zeit für ${s.name}${s.dose ? ` (${s.dose})` : ""}`
              : locale === "fa"
                ? `🔔 زمان ${s.name}${s.dose ? ` (${s.dose})` : ""}`
                : `🔔 Time for ${s.name}${s.dose ? ` (${s.dose})` : ""}`;

            new Notification("Luma 🌸", { body, icon: "/favicon.ico" });
            setLastNotified((prev) => ({ ...prev, [notifKey]: currentTime }));
          }
        }
      });

      // 2. Morning reminder at 09:00 for all pending supplements
      const morningNotifKey = "morning";
      const lastMorningNotif = lastNotified[morningNotifKey];
      if (currentTime === "09:00" && lastMorningNotif !== "09:00") {
        const pending = supplements.filter((s) => !checked[s.id]);
        if (pending.length > 0) {
          const names = pending.map((s) => s.name).join(", ");
          let body: string;
          if (isPregnant) {
            body = locale === "de"
              ? `🌅 Guten Morgen! Denke an deine Supplements: ${names}`
              : locale === "fa"
                ? `🌅 صبح بخیر! به مکمل‌هایت فکر کن: ${names}`
                : `🌅 Good morning! Remember your supplements: ${names}`;
          } else {
            body = locale === "de"
              ? `🌅 Guten Morgen! Heute noch offen: ${names}`
              : locale === "fa"
                ? `🌅 صبح بخیر! امروز هنوز باقی مانده: ${names}`
                : `🌅 Good morning! Still pending today: ${names}`;
          }

          new Notification("Luma 🌸", { body, icon: "/favicon.ico" });
          setLastNotified((prev) => ({ ...prev, [morningNotifKey]: "09:00" }));
        }
      }

      // 4. Evening reminder at 20:00 for still-pending supplements
      const eveningNotifKey = "evening";
      const lastEveningNotif = lastNotified[eveningNotifKey];
      if (currentTime === "20:00" && lastEveningNotif !== "20:00") {
        const pending = supplements.filter((s) => !checked[s.id]);
        if (pending.length > 0) {
          const names = pending.map((s) => s.name).join(", ");
          const body = locale === "de"
            ? `🌙 Heute noch nicht genommen: ${names}. Schnell nachholen!`
            : locale === "fa"
              ? `🌙 امروز هنوز مصرف نکرده‌ای: ${names}. سریع جبران کن!`
              : `🌙 Not taken yet today: ${names}. Catch up quickly!`;

          new Notification("Luma 🌸", { body, icon: "/favicon.ico" });
          setLastNotified((prev) => ({ ...prev, [eveningNotifKey]: "20:00" }));
        }
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [supplements, checked, waterLiters, waterGoal, isPregnant, permission, locale, lastNotified]);

  // This component doesn't render anything visible
  // It's included on the gesundheit page to manage notifications
  return null;
}