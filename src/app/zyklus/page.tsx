"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { getNextPeriodDate, getOvulationDate, formatDate } from "@/lib/cycle";
import CycleWheel from "@/components/CycleWheel";
import Calendar from "@/components/Calendar";
import type { CycleData } from "@/lib/cycle-calendar";

/* ─── Rose Design tokens ──────────────────────────────────────────────── */
const C = {
  bg: "#fef6f8",
  surface: "#ffffff",
  roseLight: "#fce4ed",
  rose: "#f4c7d7",
  roseMid: "#e8a0b4",
  roseDark: "#c47a9a",
  roseStrong: "#d48a9a",
  dark: "#3a2d3f",
  mid: "#6b5a7a",
  muted: "#a094a8",
  border: "#f0e0e8",
  shadow: "0 4px 20px rgba(196,122,154,0.10)",
  shadowSm: "0 2px 10px rgba(196,122,154,0.06)",
};

/* ─── Phase config – all rose tones ─────────────────────────────────────── */
const PHASES = [
  {
    key: "menstruation",
    label: "Menstruation",
    color: C.rose,
    textColor: C.roseDark,
    icon: "🌑",
    mood: "erschöpft",
    moodEmoji: "😴",
    energy: "niedrig",
    tip: "Gönn dir Ruhe und Wärme – dein Körper regeneriert sich.",
  },
  {
    key: "follikel",
    label: "Follikelphase",
    color: C.roseLight,
    textColor: C.roseMid,
    icon: "🌒",
    mood: "aufgeregt",
    moodEmoji: "😊",
    energy: "steigend",
    tip: "Nutze deine wachsende Energie für neue Projekte.",
  },
  {
    key: "eisprung",
    label: "Ovulation",
    color: C.roseMid,
    textColor: C.roseDark,
    icon: "🌕",
    mood: "euphorisch",
    moodEmoji: "😄",
    energy: "hoch",
    tip: "Höchste Energie & Ausstrahlung – ideal für soziale Kontakte.",
  },
  {
    key: "luteal",
    label: "Lutealphase",
    color: C.roseStrong,
    textColor: C.roseDark,
    icon: "🌘",
    mood: "neutral",
    moodEmoji: "😐",
    energy: "mittel",
    tip: "Mehr Wasser trinken & Magnesium für PMS-Beschwerden.",
  },
];

/* ─── Phase helper ──────────────────────────────────────────────────────── */
function getPhaseIndex(day: number, periodLength: number): number {
  if (day <= periodLength) return 0;
  if (day <= 13) return 1;
  if (day <= 16) return 2;
  return 3;
}

/* ─── Symptom heatmap bar ───────────────────────────────────────────────── */
function HeatmapBar({
  label,
  values,
  color,
  currentDay,
}: {
  label: string;
  values: number[];
  color: string;
  currentDay: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-20 shrink-0" style={{ color: C.muted }}>
        {label}
      </span>
      <div className="flex-1 flex gap-0.5 items-end h-6">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${Math.max(20, v * 100)}%`,
              background:
                i + 1 === currentDay
                  ? C.dark
                  : v > 0.5
                  ? color
                  : color + "55",
              opacity: i + 1 > currentDay ? 0.3 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  PAGE                                                                     */
/* ======================================================================== */

export default function ZyklusPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [userData, setUserData] = useState<{
    lastPeriodStart?: string;
    cycleLength?: number;
    periodLength?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFabMenu, setShowFabMenu] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("user_cycles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setUserData({
            lastPeriodStart: data.last_period_start,
            cycleLength: data.cycle_length,
            periodLength: data.period_length,
          });
        }
        setLoading(false);
      });
  }, [user]);

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: C.roseMid }} />
          <p className="text-sm" style={{ color: C.muted }}>Lade Zyklusdaten …</p>
        </div>
      </main>
    );
  }

  /* ── No data ── */
  if (!userData?.lastPeriodStart) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="text-5xl">🌙</div>
          <h1 className="text-xl font-medium" style={{ color: C.dark }}>Zyklus-Übersicht</h1>
          <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
            Trage deine Zyklusdaten ein, um deine persönliche Übersicht zu sehen.
          </p>
          <Link
            href="/onboarding"
            className="text-sm font-medium rounded-2xl px-6 py-3 text-white hover:opacity-80 transition-opacity"
            style={{ background: C.roseMid }}
          >
            Zyklus einrichten
          </Link>
          <Link href="/dashboard" className="text-sm" style={{ color: C.roseMid }}>
            ← Zurück
          </Link>
        </div>
      </main>
    );
  }

  /* ── Computed values ── */
  const cycleLength = userData.cycleLength ?? 28;
  const periodLength = userData.periodLength ?? 5;
  const lastPeriod = new Date(userData.lastPeriodStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriod.setHours(0, 0, 0, 0);

  const rawDay = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = (rawDay % cycleLength) + 1;
  const phaseIndex = getPhaseIndex(currentDay, periodLength);
  const phase = PHASES[phaseIndex];

  const cycleData = { lastPeriodStart: lastPeriod, cycleLength, periodLength };
  const nextPeriod = getNextPeriodDate(cycleData);
  const ovulation = getOvulationDate(cycleData);
  const daysUntilPeriod = Math.ceil(
    (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const ovulationDay = cycleLength - 14;

  const isFertileWindow = currentDay >= ovulationDay - 2 && currentDay <= ovulationDay + 2;
  const isOvulationDay = currentDay === ovulationDay;
  const fertilityStatus = isOvulationDay
    ? "Sehr hohe Chance heute ★"
    : isFertileWindow
    ? "Mittlere Chance heute"
    : currentDay < ovulationDay - 2
    ? "Niedrige Chance heute"
    : "Niedrige Chance heute";

  const makeSymptomValues = (peakPhase: number[], baseline: number) =>
    Array.from({ length: cycleLength }, (_, i) => {
      const day = i + 1;
      if (peakPhase.includes(day)) return 0.85 + Math.random() * 0.15;
      if (Math.abs(day - peakPhase[0]) <= 2) return 0.5 + Math.random() * 0.2;
      return baseline + Math.random() * 0.15;
    });

  const crampsValues = makeSymptomValues(
    [1, 2, 3, 4].slice(0, periodLength),
    0.05
  );
  const moodValues = makeSymptomValues([23, 24, 25, 26, 27], 0.3);
  const energyValues = makeSymptomValues([12, 13, 14, 15], 0.35);

  return (
    <main
      className="min-h-screen pb-28 relative"
      style={{ background: C.bg }}
    >
      {/* Background gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{
          background:
            "linear-gradient(160deg, #fce4f0 0%, #fdf0f4 55%, #fef6f8 100%)",
          zIndex: 0,
        }}
      />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header
        className="relative z-10 px-5 pt-12 pb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", boxShadow: C.shadowSm }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.roseMid} strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: C.dark }}>
              Cycle Tracker
            </h1>
            <p className="text-xs" style={{ color: C.muted }}>
              Tag {currentDay} von {cycleLength}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-2xl relative"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", boxShadow: C.shadowSm }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.roseMid} strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "#e87a7a", border: "1.5px solid #fff" }}
            />
          </button>

          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", boxShadow: C.shadowSm }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.roseMid} strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col gap-4">

        {/* ── 1. MONATS-KALENDER ───────────────────────────────────────── */}
        <Calendar
          cycleData={cycleData}
          currentDay={currentDay}
        />

        {/* ── 2. CYCLE WHEEL ───────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-5 flex flex-col items-center"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            boxShadow: C.shadow,
          }}
        >
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: C.roseMid }}>
            ZYKLUS-RAD
          </p>
          <CycleWheel
            currentDay={currentDay}
            cycleLength={cycleLength}
            periodLength={periodLength}
          />

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: C.roseLight, color: C.roseMid }}
            >
              ★ Fruchtbarkeitsfenster: Tag {ovulationDay - 2}–{ovulationDay + 2}
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: C.rose + "55", color: C.roseDark }}
            >
              ★ Eisprung: Tag {ovulationDay}
            </div>
          </div>
        </div>

        {/* ── 3. DAILY INSIGHT CARD ────────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ boxShadow: C.shadow }}
        >
          <div
            className="px-5 pt-4 pb-3 flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${phase.color}cc, ${phase.color}66)`,
            }}
          >
            <span className="text-2xl">{phase.icon}</span>
            <div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: phase.textColor }}>
                HEUTE · TAG {currentDay}
              </p>
              <p className="text-base font-bold" style={{ color: C.dark }}>
                {phase.label}
              </p>
            </div>
          </div>

          <div
            className="px-5 py-4 grid grid-cols-2 gap-3"
            style={{ background: C.surface, borderTop: `1px solid ${phase.color}55` }}
          >
            <div
              className="rounded-2xl p-3"
              style={{ background: phase.color + "22", border: `1px solid ${phase.color}55` }}
            >
              <p className="text-xs mb-1" style={{ color: C.muted }}>Stimmung</p>
              <p className="text-lg">{phase.moodEmoji}</p>
              <p className="text-xs font-medium" style={{ color: C.dark }}>{phase.mood}</p>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{ background: phase.color + "22", border: `1px solid ${phase.color}55` }}
            >
              <p className="text-xs mb-1" style={{ color: C.muted }}>Energie</p>
              <p className="text-lg">⚡</p>
              <p className="text-xs font-medium" style={{ color: C.dark }}>{phase.energy}</p>
            </div>
          </div>

          <div
            className="px-5 py-3 flex items-start gap-2"
            style={{ background: C.roseLight + "55", borderTop: `1px solid ${C.rose}55` }}
          >
            <span className="text-base shrink-0 mt-0.5">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: C.mid }}>
              <span className="font-semibold" style={{ color: C.dark }}>Tipp: </span>
              {phase.tip}
            </p>
          </div>
        </div>

        {/* ── QUICK STATS ROW ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: C.surface, border: `1.5px solid ${C.rose}`, boxShadow: C.shadowSm }}
          >
            <p className="text-xs mb-1" style={{ color: C.muted }}>Nächste Periode</p>
            <p className="text-sm font-bold" style={{ color: C.dark }}>{formatDate(nextPeriod)}</p>
            <p className="text-xs mt-0.5" style={{ color: C.roseDark }}>
              {daysUntilPeriod > 0 ? `in ${daysUntilPeriod} Tagen` : "heute"}
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: C.surface, border: `1.5px solid ${C.roseMid}`, boxShadow: C.shadowSm }}
          >
            <p className="text-xs mb-1" style={{ color: C.muted }}>Eisprung</p>
            <p className="text-sm font-bold" style={{ color: C.dark }}>{formatDate(ovulation)}</p>
            <p className="text-xs mt-0.5" style={{ color: C.roseMid }}>Tag {ovulationDay}</p>
          </div>
        </div>

        {/* ── 4. SYMPTOM HEATMAP ───────────────────────────────────────── */}
        <div
          className="rounded-3xl p-5"
          style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}
        >
          <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: C.roseMid }}>
            📊 SYMPTOM-HEATMAP
          </p>

          <div className="flex flex-col gap-4">
            <HeatmapBar
              label="Krämpfe"
              values={crampsValues}
              color={C.rose}
              currentDay={currentDay}
            />
            <HeatmapBar
              label="Stimmung"
              values={moodValues}
              color={C.roseMid}
              currentDay={currentDay}
            />
            <HeatmapBar
              label="Energie"
              values={energyValues}
              color={C.roseLight}
              currentDay={currentDay}
            />
          </div>

          <div className="flex justify-between mt-3">
            <span className="text-xs" style={{ color: C.muted, fontSize: 9 }}>Tag 1</span>
            <span className="text-xs" style={{ color: C.muted, fontSize: 9 }}>
              Tag {Math.round(cycleLength / 2)}
            </span>
            <span className="text-xs" style={{ color: C.muted, fontSize: 9 }}>
              Tag {cycleLength}
            </span>
          </div>

          <div className="flex gap-4 mt-3 justify-center flex-wrap">
            {[
              { color: C.rose, label: "Krämpfe" },
              { color: C.roseMid, label: "Stimmung" },
              { color: C.roseLight, label: "Energie" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs" style={{ color: C.muted }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. FERTILITY SECTION ─────────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ boxShadow: C.shadow }}
        >
          <div
            className="px-5 py-4"
            style={{
              background: "linear-gradient(135deg, #fce4f0, #fdf0f4)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">❤️</span>
              <p className="text-sm font-bold" style={{ color: C.dark }}>
                Fruchtbarkeitsbereich
              </p>
            </div>
          </div>

          <div
            className="px-5 py-4 flex flex-col gap-3"
            style={{ background: C.surface }}
          >
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: C.muted }}>
                  Fruchtbarkeitsfenster
                </span>
                <span className="text-xs font-semibold" style={{ color: C.roseMid }}>
                  Tag {ovulationDay - 2}–{ovulationDay + 2}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "#f0e0e8" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    marginLeft: `${((ovulationDay - 3) / cycleLength) * 100}%`,
                    width: `${(5 / cycleLength) * 100}%`,
                    background: `linear-gradient(90deg, ${C.rose}88, ${C.roseMid})`,
                  }}
                />
              </div>
              <div className="relative mt-0.5">
                <div
                  className="absolute"
                  style={{
                    left: `calc(${((currentDay - 0.5) / cycleLength) * 100}% - 4px)`,
                    top: 0,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: C.dark }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-1">
              <div
                className="rounded-2xl p-3 text-center"
                style={{ background: C.roseLight + "55" }}
              >
                <p className="text-xs mb-1" style={{ color: C.muted }}>Hohe Fruchtbarkeit</p>
                <p className="text-sm font-bold" style={{ color: C.roseDark }}>
                  Tag {ovulationDay - 2}–{ovulationDay + 2}
                </p>
              </div>
              <div
                className="rounded-2xl p-3 text-center"
                style={{ background: C.rose + "55" }}
              >
                <p className="text-xs mb-1" style={{ color: C.muted }}>Eisprung</p>
                <p className="text-sm font-bold" style={{ color: C.roseDark }}>
                  Tag {ovulationDay} ★
                </p>
              </div>
              <div
                className="rounded-2xl p-3 text-center"
                style={{
                  background: isOvulationDay
                    ? C.roseLight
                    : isFertileWindow
                    ? C.rose + "55"
                    : "#f5f0f2",
                }}
              >
                <p className="text-xs mb-1" style={{ color: C.muted }}>Status</p>
                <p
                  className="text-xs font-bold leading-tight"
                  style={{
                    color: isOvulationDay
                      ? C.roseDark
                      : isFertileWindow
                      ? C.roseDark
                      : C.muted,
                  }}
                >
                  {fertilityStatus}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── EDIT CYCLE LINK ──────────────────────────────────────────── */}
        <Link
          href="/onboarding"
          className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-opacity hover:opacity-75"
          style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.muted }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Zyklus bearbeiten
        </Link>

      </div>{/* end content */}

      {/* ── FLOATING ACTION BUTTON ───────────────────────────────────────── */}
      <div className="fixed bottom-8 right-5 z-50 flex flex-col items-end gap-3">
        {showFabMenu && (
          <div className="flex flex-col gap-2 mb-1">
            {[
              { icon: "🩸", label: "Periode eintragen" },
              { icon: "😊", label: "Stimmung loggen" },
              { icon: "💊", label: "Symptom hinzufügen" },
              { icon: "📝", label: "Notiz hinzufügen" },
            ].map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg transition-all hover:scale-105"
                style={{
                  background: C.surface,
                  color: C.dark,
                  boxShadow: C.shadow,
                  border: `1px solid ${C.border}`,
                }}
                onClick={() => setShowFabMenu(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowFabMenu((v) => !v)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${C.roseMid}, ${C.roseDark})`,
            boxShadow: `0 6px 24px rgba(196,122,154,0.45)`,
            transform: showFabMenu ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          +
        </button>
      </div>

      {showFabMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFabMenu(false)}
        />
      )}
    </main>
  );
}