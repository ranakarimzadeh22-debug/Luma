"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import {
  getSupplements,
  getSupplementCalendar,
  setSupplementStatus,
  getSupplementStreak,
  updateSupplementStreak,
} from "@/lib/health";
import { getTodayKey } from "@/lib/health-utils";

const DAYS_SHOWN = 14;

/* ─── Rose Design tokens ──────────────────────────────────────────────── */
const C = {
  roseLight: "#fce4ed",
  rose: "#f4c7d7",
  roseMid: "#e8a0b4",
  roseDark: "#c47a9a",
  roseStrong: "#d48a9a",
  dark: "#3a2d3f",
  mid: "#6b5a7a",
  muted: "#a094a8",
  surface: "#ffffff",
  border: "#f0e0e8",
};

/* ─── Status-Icons ──────────────────────────────────────────────────────── */
const STATUS_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  taken: { icon: "✅", color: "#7bbf8e", label: "Eingenommen" },
  missed: { icon: "❌", color: "#e88a8a", label: "Vergessen" },
  open: { icon: "⏰", color: "#f0c27a", label: "Noch offen" },
  late: { icon: "⚠️", color: "#e88a8a", label: "Verspätet" },
};

/* ─── SupplementRow ─────────────────────────────────────────────────────── */
function SupplementRow({
  name,
  dose,
  time,
  entries,
  supplementId,
  userId,
  onToggle,
}: {
  name: string;
  dose: string;
  time: string;
  entries: Map<string, string>;
  supplementId: number;
  userId: string;
  onToggle: (id: number, date: string) => void;
}) {
  const today = getTodayKey();
  const todayStatus = entries.get(today) || "open";
  const streak = Object.values(entries).filter((s) => s === "taken").length;

  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3"
      style={{
        background: todayStatus === "taken" ? C.roseLight : "#fafafa",
        border: `1.5px solid ${
          todayStatus === "taken" ? C.roseStrong : todayStatus === "missed" ? "#e88a8a" : C.border
        }`,
      }}
    >
      {/* Supplement info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: C.dark }}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {dose && (
            <span className="text-xs" style={{ color: C.muted }}>
              {dose}
            </span>
          )}
          {time && (
            <span className="text-xs" style={{ color: C.muted }}>
              ⏰ {time}
            </span>
          )}
        </div>
      </div>

      {/* Streak badge */}
      {streak > 0 && (
        <div
          className="rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1"
          style={{
            background: streak >= 3 ? C.rose : C.roseLight,
            color: streak >= 3 ? C.roseDark : C.muted,
          }}
        >
          🔥 {streak}
        </div>
      )}

      {/* Today status */}
      <button
        onClick={() => onToggle(supplementId, today)}
        className="text-sm rounded-xl px-3 py-1.5 font-medium transition-all hover:opacity-80"
        style={{
          background:
            todayStatus === "taken"
              ? C.roseStrong
              : todayStatus === "missed"
              ? "#e88a8a"
              : todayStatus === "late"
              ? "#f0c27a"
              : C.roseLight,
          color: "#fff",
        }}
      >
        {todayStatus === "taken" ? "✅" : todayStatus === "missed" ? "❌" : "⏰"}
      </button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function SupplementCalendar() {
  const { t, isRtl, locale } = useLocale();
  const { user } = useAuth();

  const [supplements, setSupplements] = useState<
    { id: number; name: string; dose: string; time: string }[]
  >([]);
  const [calendarData, setCalendarData] = useState<
    Map<number, Map<string, string>>
  >(new Map());
  const [loaded, setLoaded] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState<number | null>(
    null
  );
  const [detailDays, setDetailDays] = useState<string[]>([]);
  const [detailEntries, setDetailEntries] = useState<Map<string, string>>(
    new Map()
  );

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    async function load() {
      // Load supplements
      const dbSupplements = await getSupplements(uid);
      setSupplements(
        dbSupplements.map((s) => ({
          id: s.id!,
          name: s.name,
          dose: s.dose,
          time: s.time,
        }))
      );

      // Load calendar data for all supplements
      const allData = new Map<number, Map<string, string>>();
      await Promise.all(
        dbSupplements.map(async (s) => {
          const entries = await getSupplementCalendar(uid, s.id!, DAYS_SHOWN);
          const entryMap = new Map<string, string>();
          entries.forEach((e) => {
            entryMap.set(e.date, e.status);
          });
          allData.set(s.id!, entryMap);
        })
      );
      setCalendarData(allData);
      setLoaded(true);
    }
    load();
  }, [user]);

  async function handleToggle(supplementId: number, date: string) {
    if (!user) return;

    const currentStatus = calendarData.get(supplementId)?.get(date) || "open";
    const newStatus =
      currentStatus === "open"
        ? "taken"
        : currentStatus === "taken"
        ? "missed"
        : "taken";

    await setSupplementStatus(user.id, supplementId, date, newStatus);

    // Update streak
    if (newStatus === "taken") {
      await updateSupplementStreak(user.id, supplementId, date);
    }

    // Refresh local data
    const entries = await getSupplementCalendar(
      user.id,
      supplementId,
      DAYS_SHOWN
    );
    const entryMap = new Map<string, string>();
    entries.forEach((e) => entryMap.set(e.date, e.status));
    const newData = new Map(calendarData);
    newData.set(supplementId, entryMap);
    setCalendarData(newData);
  }

  function showDetail(supplementId: number) {
    setSelectedSupplement(supplementId);
    const entries = calendarData.get(supplementId) || new Map();
    const days = Array.from(entries.keys()).sort();
    setDetailDays(days);
    setDetailEntries(entries);
  }

  // Generate last 14 days for the calendar header
  const today = new Date();
  const last14Days: string[] = [];
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last14Days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  // Day of week abbreviation
  function dayAbbr(dateStr: string): string {
    const days =
      locale === "de"
        ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
        : locale === "fa"
        ? ["ی", "د", "س", "چ", "پ", "ج", "ش"]
        : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const d = new Date(dateStr + "T00:00:00");
    return days[d.getDay()];
  }

  function shortDate(dateStr: string): string {
    const parts = dateStr.split("-");
    return `${parseInt(parts[2], 10)}.${parseInt(parts[1], 10)}`;
  }

  if (!loaded) return null;

  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{ background: C.roseLight + "55", border: `1.5px solid ${C.rose}` }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📅</span>
        <div>
          <h2 className="font-semibold text-base" style={{ color: C.dark }}>
            {locale === "de"
              ? "Einnahme-Kalender"
              : locale === "fa"
              ? "تقویم مصرف"
              : "Supplement Calendar"}
          </h2>
          <p className="text-xs" style={{ color: C.muted }}>
            {locale === "de"
              ? `Letzte ${DAYS_SHOWN} Tage – Übersicht`
              : locale === "fa"
              ? `${DAYS_SHOWN} روز گذشته – overview`
              : `Last ${DAYS_SHOWN} days – overview`}
          </p>
        </div>
      </div>

      {/* Supplements list */}
      {supplements.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: C.muted }}>
          {locale === "de"
            ? "Keine Supplements hinterlegt."
            : locale === "fa"
            ? "مکملی ثبت نشده است."
            : "No supplements saved."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {supplements.map((s) => {
            const entries = calendarData.get(s.id) || new Map();
            return (
              <SupplementRow
                key={s.id}
                name={s.name}
                dose={s.dose}
                time={s.time}
                entries={entries}
                supplementId={s.id}
                userId={user?.id || ""}
                onToggle={(id, date) => handleToggle(id, date)}
              />
            );
          })}
        </div>
      )}

      {/* Detail view for a selected supplement */}
      {selectedSupplement && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: C.dark }}>
              {locale === "de" ? "Detailansicht" : locale === "fa" ? "جزئیات" : "Details"}
            </h3>
            <button
              onClick={() => setSelectedSupplement(null)}
              className="text-xs rounded-xl px-2 py-1"
              style={{ background: C.roseLight, color: C.muted }}
            >
              ✕
            </button>
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              {/* Header row */}
              <div className="flex items-center gap-1 mb-1">
                <div className="w-20 shrink-0" />
                {detailDays.map((dateStr) => (
                  <div
                    key={dateStr}
                    className="w-8 shrink-0 flex flex-col items-center"
                  >
                    <span className="text-[9px] font-medium" style={{ color: C.muted }}>
                      {dayAbbr(dateStr)}
                    </span>
                    <span className="text-[9px]" style={{ color: C.muted }}>
                      {shortDate(dateStr)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status row */}
              <div className="flex items-center gap-1">
                <div className="w-20 shrink-0 flex items-center gap-1">
                  <span className="text-xs font-medium" style={{ color: C.dark }}>
                    {supplements.find((s) => s.id === selectedSupplement)?.name}
                  </span>
                </div>
                {detailDays.map((dateStr) => {
                  const status = detailEntries.get(dateStr) || "open";
                  const icon = STATUS_ICONS[status] || STATUS_ICONS.open;
                  return (
                    <div
                      key={dateStr}
                      className="w-8 shrink-0 flex justify-center"
                    >
                      <span className="text-sm">{icon.icon}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-3 text-[10px]" style={{ color: C.muted }}>
            {Object.entries(STATUS_ICONS).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1">
                <span>{val.icon}</span>
                <span>
                  {locale === "de"
                    ? val.label
                    : locale === "fa"
                    ? key === "taken"
                      ? "مصرف شده"
                      : key === "missed"
                      ? "فراموش شده"
                      : key === "open"
                      ? "باز"
                      : "تأخیر"
                    : val.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      {supplements.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div
            className="rounded-xl p-3"
            style={{ background: C.rose }}
          >
            <p className="text-xs" style={{ color: C.roseDark }}>
              {locale === "de"
                ? "Heute eingenommen"
                : locale === "fa"
                ? "امروز مصرف شده"
                : "Today's intake"}
            </p>
            <p className="text-lg font-bold" style={{ color: C.dark }}>
              {
                supplements.filter((s) => {
                  const entries = calendarData.get(s.id);
                  return entries?.get(getTodayKey()) === "taken";
                }).length
              }
              /{supplements.length}
            </p>
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: C.roseLight }}
          >
            <p className="text-xs" style={{ color: C.muted }}>
              {locale === "de"
                ? "Bester Streak"
                : locale === "fa"
                ? "بهترین رکورد"
                : "Best streak"}
            </p>
            <p className="text-lg font-bold" style={{ color: C.dark }}>
              {Math.max(
                ...supplements.map((s) => {
                  const entries = calendarData.get(s.id);
                  if (!entries) return 0;
                  return Array.from(entries.values()).filter(
                    (v) => v === "taken"
                  ).length;
                }),
                0
              )}
              🔥
            </p>
          </div>
        </div>
      )}
    </div>
  );
}