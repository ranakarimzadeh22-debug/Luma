"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { getSupplementHistory } from "@/lib/health";

const DAYS_BACK = 14;

export default function SupplementHistory() {
  const { locale, isRtl } = useLocale();
  const { user } = useAuth();
  const [dates, setDates] = useState<string[]>([]);
  const [items, setItems] = useState<{ supplementName: string; dose: string; logs: Record<string, boolean> }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function load() {
      const history = await getSupplementHistory(uid, DAYS_BACK);
      setDates(history.dates);
      setItems(history.items);
      setLoaded(true);
    }
    load();
  }, [user]);

  if (!loaded) return null;
  if (items.length === 0) return null;

  // Format date to short day/month
  function shortDate(dateStr: string): string {
    const parts = dateStr.split("-");
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${day}.${month}`;
  }

  // Check if date is today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Day of week abbreviation
  function dayAbbr(dateStr: string): string {
    const days = locale === "de"
      ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
      : locale === "fa"
        ? ["ی", "د", "س", "چ", "پ", "ج", "ش"]
        : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const d = new Date(dateStr + "T00:00:00");
    return days[d.getDay()];
  }

  // Consistency percentage for a supplement
  function consistency(logs: Record<string, boolean>): number {
    const entries = Object.values(logs);
    if (entries.length === 0) return 0;
    const taken = entries.filter(Boolean).length;
    return Math.round((taken / entries.length) * 100);
  }

  return (
    <div
      className="rounded-2xl p-5 shadow-sm overflow-x-auto"
      style={{ background: "#faf5ff", border: "1.5px solid #d5b8f0" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📅</span>
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#3a2d3f" }}>
            {locale === "de"
              ? "Einnahmen-Verlauf"
              : locale === "fa"
                ? "تاریخچه مصرف"
                : "Supplement History"}
          </h2>
          <p className="text-xs" style={{ color: "#a094a8" }}>
            {locale === "de"
              ? `Letzte ${DAYS_BACK} Tage`
              : locale === "fa"
                ? `${DAYS_BACK} روز گذشته`
                : `Last ${DAYS_BACK} days`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="min-w-fit">
        {/* Header row: dates */}
        <div className="flex items-center gap-0.5 mb-1">
          {/* Supplement name column */}
          <div className="w-28 shrink-0 flex items-center gap-1 pr-2">
            <span className="text-xs font-medium" style={{ color: "#a094a8" }}>
              {locale === "de" ? "Supplement" : locale === "fa" ? "مکمل" : "Supplement"}
            </span>
          </div>
          {/* Date columns */}
          {dates.map((dateStr) => {
            const isToday = dateStr === todayStr;
            return (
              <div
                key={dateStr}
                className="w-8 shrink-0 flex flex-col items-center"
              >
                <span className="text-[9px] font-medium" style={{ color: isToday ? "#3a2d3f" : "#a094a8" }}>
                  {dayAbbr(dateStr)}
                </span>
                <span className="text-[9px]" style={{ color: isToday ? "#b799e5" : "#a094a8", fontWeight: isToday ? 700 : 400 }}>
                  {shortDate(dateStr)}
                </span>
              </div>
            );
          })}
          {/* Consistency column */}
          <div className="w-14 shrink-0 flex justify-center pl-2">
            <span className="text-[9px] font-medium" style={{ color: "#a094a8" }}>
              {locale === "de" ? "%" : locale === "fa" ? "درصد" : "%"}
            </span>
          </div>
        </div>

        {/* Supplement rows */}
        {items.map((item) => {
          const pct = consistency(item.logs);
          return (
            <div key={item.supplementName} className="flex items-center gap-0.5 py-1.5 border-t" style={{ borderColor: "#f0e5f8" }}>
              {/* Supplement name */}
              <div className="w-28 shrink-0 flex items-center gap-1 pr-2">
                <span className="text-xs font-medium truncate" style={{ color: "#3a2d3f" }}>{item.supplementName}</span>
              </div>
              {/* Day cells */}
              {dates.map((dateStr) => {
                const isChecked = item.logs[dateStr] || false;
                return (
                  <div
                    key={dateStr}
                    className="w-8 shrink-0 flex justify-center items-center"
                  >
                    <span className="text-sm">{isChecked ? "✅" : "❌"}</span>
                  </div>
                );
              })}
              {/* Consistency bar */}
              <div className="w-14 shrink-0 flex items-center gap-1 pl-2">
                <div className="w-8 h-2 rounded-full overflow-hidden" style={{ background: "#f0e5f8" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80 ? "#7bbf8e" : pct >= 50 ? "#f0c27a" : "#e88a8a",
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium" style={{ color: "#a094a8" }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[10px]" style={{ color: "#a094a8" }}>
        <span>✅ {locale === "de" ? "Genommen" : locale === "fa" ? "مصرف شده" : "Taken"}</span>
        <span>❌ {locale === "de" ? "Nicht genommen" : locale === "fa" ? "مصرف نشده" : "Missed"}</span>
        <span>📊 {locale === "de" ? "Regelmäßigkeit" : locale === "fa" ? "منظمی" : "Consistency"}</span>
      </div>
    </div>
  );
}