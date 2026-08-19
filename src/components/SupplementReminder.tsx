"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import {
  getSupplements,
  updateSupplement,
  getTodayKey,
} from "@/lib/health";

interface SupplementItem {
  id: string;
  dbId: number;
  name: string;
  dose: string;
  time: string;
}

export default function SupplementReminder() {
  const { locale } = useLocale();
  const { user } = useAuth();

  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<"default" | "granted" | "denied">("default");

  useEffect(() => {
    async function init() {
      if (user) {
        // Load supplements directly from user_supplements (single source of truth)
        const dbSupplements = await getSupplements(user.id);
        const mapped: SupplementItem[] = dbSupplements.map((s) => ({
          id: `db-${s.id}`,
          dbId: s.id!,
          name: s.name,
          dose: s.dose,
          time: s.time,
        }));
        setSupplements(mapped);
      }

      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationStatus(Notification.permission);
      }
      setLoaded(true);
    }
    init();
  }, [user]);

  // Check every minute if it's time for a reminder
  useEffect(() => {
    if (supplements.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      supplements.forEach((s) => {
        if (!s.time) return;
        if (s.time === currentTime) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🔔 Luma – Erinnerung", {
              body: locale === "de"
                ? `Zeit für ${s.name}${s.dose ? ` (${s.dose})` : ""}!`
                : locale === "fa"
                  ? `زمان ${s.name}${s.dose ? ` (${s.dose})` : ""}!`
                  : `Time for ${s.name}${s.dose ? ` (${s.dose})` : ""}!`,
              icon: "/favicon.ico",
            });
          }
        }
      });
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [supplements, locale]);

  function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      setNotificationStatus(perm);
    });
  }

  async function updateSupplementTime(id: string, dbId: number, newTime: string) {
    if (!user) return;

    // Update in DB
    const item = supplements.find((s) => s.id === id);
    if (!item) return;

    await updateSupplement(dbId, user.id, item.name, item.dose, newTime);

    // Update local state
    setSupplements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, time: newTime } : s))
    );
  }

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔔</span>
        <h2 className="font-semibold text-base" style={{ color: "#3a2d3f" }}>
          {locale === "de" ? "Erinnerungszeiten" : locale === "fa" ? "زمان‌های یادآوری" : "Reminder times"}
        </h2>
      </div>

      {/* Notification permission */}
      {"Notification" in window && notificationStatus !== "granted" && (
        <div className="rounded-2xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #ffd9c7" }}>
          <p className="text-xs mb-2" style={{ color: "#c4845a" }}>
            {locale === "de"
              ? "🔔 Aktiviere Benachrichtigungen, um Erinnerungen zu erhalten."
              : locale === "fa"
                ? "🔔 اعلان‌ها را فعال کن تا یادآوری دریافت کنی."
                : "🔔 Enable notifications to receive reminders."}
          </p>
          <button
            onClick={requestNotificationPermission}
            className="text-sm font-medium rounded-xl px-4 py-2 text-white hover:opacity-90 transition-opacity"
            style={{ background: "#b799e5" }}
          >
            {notificationStatus === "denied"
              ? locale === "de" ? "Im Browser erlauben" : locale === "fa" ? "اجازه در مرورگر" : "Allow in browser"
              : locale === "de" ? "✅ Benachrichtigungen aktivieren" : locale === "fa" ? "✅ فعال‌سازی اعلان‌ها" : "✅ Enable notifications"}
          </button>
        </div>
      )}

      {/* Supplement time list */}
      {supplements.length === 0 ? (
        <p className="text-xs text-center py-3" style={{ color: "#a094a8" }}>
          {locale === "de"
            ? "Keine Supplements hinterlegt. Füge welche im Profil hinzu."
            : locale === "fa"
              ? "مکملی ثبت نشده. در پروفایل مکمل اضافه کن."
              : "No supplements saved. Add them in your profile."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {supplements.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl p-3 flex items-center gap-3"
              style={{
                background: "#fafafa",
                border: `1.5px solid ${s.time ? "#cfe8d5" : "#f4c7d7"}`,
              }}
            >
              {/* Icon */}
              <span className="text-lg shrink-0">💊</span>

              {/* Name + Dose */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "#3a2d3f" }}>
                  {s.name}
                </p>
                {s.dose && (
                  <p className="text-xs" style={{ color: "#a094a8" }}>{s.dose}</p>
                )}
              </div>

              {/* Time input */}
              <input
                type="time"
                value={s.time || ""}
                onChange={(e) => updateSupplementTime(s.id, s.dbId, e.target.value)}
                className="text-xs rounded-xl px-2 py-1.5 outline-none"
                style={{ background: "#fff8f2", border: "1px solid #f4c7d7", color: "#3a2d3f" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-xs" style={{ color: "#a094a8" }}>
        ⏰{" "}
        {locale === "de"
          ? "Die Erinnerungszeiten werden aus deinen gespeicherten Supplements übernommen."
          : locale === "fa"
            ? "زمان‌های یادآوری از مکمل‌های ذخیره شده گرفته می‌شوند."
            : "Reminder times are taken from your saved supplements."}
      </p>
    </div>
  );
}