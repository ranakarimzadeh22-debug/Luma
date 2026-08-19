"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase";
import { useLocale } from "@/context/LocaleContext";
import { useProfile } from "@/context/ProfileContext";
import { getPersonaConfig, EDUCATION_MODULES } from "@/lib/personas/persona-config";
import type { EducationModule } from "@/lib/personas/persona-config";
import {
  getNextPeriodDate,
  getOvulationDate,
  formatDate,
} from "@/lib/cycle";
import {
  getDayOfCycle,
  getOvulationDay,
  getFertileWindow,
} from "@/lib/cycle-calendar";
import {
  getCurrentWeek,
  getPregnancyProgress,
  getDueDate,
  getPregnancyWeekData,
  type PregnancyWeek,
} from "@/lib/pregnancy";
import { LIFE_STAGE_LABELS, type LifeStage } from "@/lib/profile";

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
  lavenderLight: "#ede4f8",
  lavenderPrimary: "#d4c4f0",
  lavenderMid: "#b799e5",
  sageLight: "#e4f0e8",
  sagePrimary: "#cfe8d5",
  sageMid: "#a0c4a8",
  sageDark: "#6a9a7a",
  peachLight: "#ffede3",
  peachPrimary: "#f4b89a",
};

/* ─── Phase config – all rose tones ─────────────────────────────────────── */
const PHASES = [
  {
    key: "menstruation",
    label: { de: "Menstruation", en: "Menstruation", fa: "قاعدگی" },
    color: C.rose,
    textColor: C.roseDark,
    icon: "🌑",
    mood: { de: "erschöpft", en: "exhausted", fa: "خسته" },
    moodEmoji: "😴",
    energy: { de: "niedrig", en: "low", fa: "کم" },
    tip: {
      de: "Gönn dir Ruhe und Wärme – dein Körper regeneriert sich.",
      en: "Rest and warmth – your body is regenerating.",
      fa: "به خودت استراحت و گرما بده – بدنت در حال بازسازی است.",
    },
  },
  {
    key: "follikel",
    label: { de: "Follikelphase", en: "Follicular", fa: "فاز فولیکولی" },
    color: C.roseLight,
    textColor: C.roseMid,
    icon: "🌒",
    mood: { de: "aufgeregt", en: "excited", fa: "هیجان‌زده" },
    moodEmoji: "😊",
    energy: { de: "steigend", en: "rising", fa: "در حال افزایش" },
    tip: {
      de: "Nutze deine wachsende Energie für neue Projekte.",
      en: "Use your growing energy for new projects.",
      fa: "از انرژی رو به افزایشت برای پروژه‌های جدید استفاده کن.",
    },
  },
  {
    key: "eisprung",
    label: { de: "Ovulation", en: "Ovulation", fa: "تخمک‌گذاری" },
    color: C.roseMid,
    textColor: C.roseDark,
    icon: "🌕",
    mood: { de: "euphorisch", en: "euphoric", fa: "سرخوش" },
    moodEmoji: "😄",
    energy: { de: "hoch", en: "high", fa: "بالا" },
    tip: {
      de: "Höchste Energie & Ausstrahlung – ideal für soziale Kontakte.",
      en: "Peak energy and charisma – great for socializing.",
      fa: "بیشترین انرژی و جذابیت – عالی برای ارتباطات اجتماعی.",
    },
  },
  {
    key: "luteal",
    label: { de: "Lutealphase", en: "Luteal", fa: "فاز لوتئال" },
    color: C.roseStrong,
    textColor: C.roseDark,
    icon: "🌘",
    mood: { de: "neutral", en: "neutral", fa: "خنثی" },
    moodEmoji: "😐",
    energy: { de: "mittel", en: "medium", fa: "متوسط" },
    tip: {
      de: "Mehr Wasser trinken & Magnesium für PMS-Beschwerden.",
      en: "Drink more water & magnesium for PMS symptoms.",
      fa: "آب بیشتر بنوش و منیزیم برای علائم PMS.",
    },
  },
];

function getPhaseIndex(day: number, periodLength: number): number {
  if (day <= periodLength) return 0;
  if (day <= 13) return 1;
  if (day <= 16) return 2;
  return 3;
}

/* ─── Fruit emoji map ──────────────────────────────────────────────────── */
const fruitEmojiMap: Record<string, string> = {
  "Mohnsamen": "🌱", "Stecknadelkopf": "📌", "Apfelsamen": "🌱",
  "Erbse": "🟢", "Blaubeere": "🫐", "Himbeere": "🍇",
  "Kirsche": "🍒", "Pflaume": "🫐", "Feige": "🫐",
  "Limette": "🍈", "Pfirsich": "🍑", "Zitrone": "🍋",
  "Apfel": "🍎", "Avocado": "🥑", "Birne": "🍐",
  "Paprika": "🫑", "Mango": "🥭", "Banane": "🍌",
  "Karotte": "🥕", "Kokosnuss": "🥥", "Grapefruit": "🍊",
  "Maiskolben": "🌽", "Rutabaga": "🥬", "Kohlrabi": "🥬",
  "Zucchini": "🥒", "Blumenkohl": "🥦", "Aubergine": "🍆",
  "Butternut-Kürbis": "🎃", "Kohl": "🥬", "Honigmelone": "🍈",
  "Ananas": "🍍", "Melone": "🍈", "Wassermelone (mini)": "🍉",
  "Wassermelone": "🍉", "Rhabarber": "🥬", "Kopfsalat": "🥬",
};

function getFruitEmoji(fruitName: string | undefined): string {
  if (!fruitName) return "🍎";
  const match = Object.entries(fruitEmojiMap).find(([k]) =>
    fruitName.includes(k) || k.includes(fruitName)
  );
  return match?.[1] ?? "🍎";
}

/* ─── Type helpers ──────────────────────────────────────────────────────── */
type CycleDataRow = {
  lastPeriodStart: Date;
  cycleLength: number;
  periodLength: number;
};

type PregnancyDataRow = {
  is_pregnant: boolean;
  last_period_start: string | null;
  due_date: string | null;
};

/* ─── Education Module Display ─────────────────────────────────────────── */
function EducationModuleCard({ module, locale }: { module: EducationModule; locale: string }) {
  const tLabel = (obj: { de: string; en: string; fa: string }) => obj[locale as keyof typeof obj] || obj.en;
  return (
    <div className="rounded-3xl p-4" style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: C.roseLight }}>
          {module.emoji}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: C.dark }}>{tLabel(module.title)}</p>
          <p className="text-xs mt-1" style={{ color: C.mid }}>{tLabel(module.summary)}</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                     */
/* ════════════════════════════════════════════════════════════════════════ */

export default function HeutePage() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const supabase = createClient();

  // Persona-aware config
  const { profile, preferences } = useProfile();
  const lifeStage = profile?.life_stage as LifeStage | null | undefined;
  const personaConfig = getPersonaConfig(lifeStage);
  const heuteSections = personaConfig.heuteSections;
  const educationModules = EDUCATION_MODULES[personaConfig.id];

  // ── State ──────────────────────────────────────────────────────────────
  const [cycleData, setCycleData] = useState<CycleDataRow | null>(null);
  const [pregnancy, setPregnancy] = useState<PregnancyDataRow | null>(null);
  const [weekData, setWeekData] = useState<PregnancyWeek | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // ── Load cycle + pregnancy ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function load() {
      const currentUser = user!;
      
      // Load cycle data
      const { data: cycle } = await supabase
        .from("user_cycles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (cycle) {
        setCycleData({
          lastPeriodStart: new Date(cycle.last_period_start),
          cycleLength: cycle.cycle_length,
          periodLength: cycle.period_length,
        });
      }

      // Load pregnancy
      const { data: preg } = await supabase
        .from("pregnancies")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (preg) {
        setPregnancy(preg);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  // ── Load week data (if pregnant) ────────────────────────────────────────
  useEffect(() => {
    if (!pregnancy?.is_pregnant || !pregnancy.last_period_start) return;
    const week = getCurrentWeek(pregnancy.last_period_start);
    getPregnancyWeekData(week).then(setWeekData);
  }, [pregnancy]);

  // ── Computed values ────────────────────────────────────────────────────
  const defaultCycle: CycleDataRow = {
    lastPeriodStart: new Date(Date.now() - 14 * 86400000),
    cycleLength: 28,
    periodLength: 5,
  };
  const data = cycleData ?? defaultCycle;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(data.lastPeriodStart);
  start.setHours(0, 0, 0, 0);

  const currentDay = getDayOfCycle(today, data);
  const phaseIndex = getPhaseIndex(currentDay, data.periodLength);
  const phase = PHASES[phaseIndex];

  const nextPeriod = getNextPeriodDate(data);
  const ovulation = getOvulationDate(data);
  const daysUntilPeriod = Math.max(0, Math.ceil(
    (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  ));

  const ovulationDay = data.cycleLength - 14;
  const isFertileWindow = currentDay >= ovulationDay - 2 && currentDay <= ovulationDay + 2;
  const isOvulationDay = currentDay === ovulationDay;

  // Trimester
  const week = pregnancy?.is_pregnant && pregnancy.last_period_start
    ? getCurrentWeek(pregnancy.last_period_start)
    : 0;
  const weeksLeft = 40 - week;
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const trimesterLabel =
    locale === "de" ? `${trimester}. Trimester` :
    locale === "fa" ? `سه‌ماهه ${trimester}` :
    `${trimester}${trimester === 1 ? "st" : trimester === 2 ? "nd" : "rd"} Trimester`;

  const dueDate = pregnancy?.due_date
    ? new Date(pregnancy.due_date)
    : pregnancy?.last_period_start
    ? getDueDate(pregnancy.last_period_start)
    : null;

  const tLabel = (obj: { de: string; en: string; fa: string }) => obj[locale as keyof typeof obj] || obj.en;

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: C.roseMid }} />
          <p className="text-sm" style={{ color: C.muted }}>
            {locale === "de" ? "Lade …" : locale === "fa" ? "در حال بارگذاری …" : "Loading …"}
          </p>
        </div>
      </main>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                                  */
  /* ════════════════════════════════════════════════════════════════════════ */

  return (
    <main className="min-h-screen pb-28 relative" style={{ background: C.bg }}>
      {/* ── Background gradient ───────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{
          background: `linear-gradient(160deg, ${personaConfig.id === 'teen' ? C.lavenderLight : personaConfig.id === 'perimenopause' ? C.sageLight : personaConfig.id === 'trying_to_conceive' ? C.peachLight : "#fce4f0"} 0%, #fdf0f4 55%, #fef6f8 100%)`,
          zIndex: 0,
        }}
      />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 px-5 pt-12 pb-4 flex items-center justify-between">
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
              {locale === "de" ? "Heute" : locale === "fa" ? "امروز" : "Today"}
            </h1>
            <p className="text-xs" style={{ color: C.muted }}>
              {personaConfig.id === 'teen'
                ? (locale === "de" ? "Dein Tages-Überblick" : locale === "fa" ? "خلاصه روزانه" : "Your daily overview")
                : personaConfig.id === 'trying_to_conceive'
                ? (locale === "de" ? "Deine Fruchtbarkeit heute" : locale === "fa" ? "باروری امروز تو" : "Your fertility today")
                : personaConfig.id === 'perimenopause'
                ? (locale === "de" ? "Deine Symptome heute" : locale === "fa" ? "علائم امروز تو" : "Your symptoms today")
                : (locale === "de" ? "Dein Tages-Dashboard" : locale === "fa" ? "داشبورد روزانه" : "Your daily dashboard")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", boxShadow: C.shadowSm }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={C.roseMid} strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col gap-4">

        {/* ════════ 1. HERO – MAIN STATUS ═══════════════════════════════════ */}
        {heuteSections.heroMainStatus && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: C.shadow }}
          >
            {/* Gradient header */}
            <div
              className="px-5 pt-5 pb-4"
              style={{
                background: `linear-gradient(135deg, ${phase.color}cc, ${phase.color}55)`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{phase.icon}</span>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.8)", color: C.roseDark }}
                >
                  {locale === "de" ? `Tag ${currentDay}` : locale === "fa" ? `روز ${currentDay}` : `Day ${currentDay}`}
                </div>
              </div>
              <p className="text-lg font-bold" style={{ color: C.dark }}>
                {tLabel(phase.label)}
              </p>
              <p className="text-xs mt-1" style={{ color: C.mid }}>
                {locale === "de"
                  ? `Tag ${currentDay} von ${data.cycleLength}`
                  : locale === "fa"
                  ? `روز ${currentDay} از ${data.cycleLength}`
                  : `Day ${currentDay} of ${data.cycleLength}`}
              </p>
            </div>

            {/* Quick stats row – persona-specific */}
            <div
              className="px-5 py-4 grid grid-cols-${personaConfig.id === 'teen' ? '2' : personaConfig.id === 'trying_to_conceive' ? '3' : '4'} gap-3"
              style={{ background: C.surface }}
            >
              {/* Zyklustag – always show */}
              <div className="text-center">
                <p className="text-xs" style={{ color: C.muted }}>
                  {locale === "de" ? "Zyklustag" : locale === "fa" ? "روز چرخه" : "Cycle day"}
                </p>
                <p className="text-lg font-bold" style={{ color: C.dark }}>{currentDay}</p>
              </div>

              {/* Woche (SSW) – only if pregnant */}
              {pregnancy?.is_pregnant && week > 0 && (
                <div className="text-center">
                  <p className="text-xs" style={{ color: C.muted }}>
                    {locale === "de" ? "SSW" : locale === "fa" ? "هفته بار." : "Week"}
                  </p>
                  <p className="text-lg font-bold" style={{ color: C.roseDark }}>{week}</p>
                </div>
              )}

              {/* Next period – for adult / TTC */}
              {(personaConfig.id === 'adult' || personaConfig.id === 'trying_to_conceive') && (
                <div className="text-center">
                  <p className="text-xs" style={{ color: C.muted }}>
                    {locale === "de" ? "Nächste" : locale === "fa" ? "بعدی" : "Next"}
                  </p>
                  <p className="text-lg font-bold" style={{ color: C.roseDark }}>
                    {daysUntilPeriod > 0 ? `${daysUntilPeriod}d` : locale === "de" ? "heute" : "today"}
                  </p>
                </div>
              )}

              {/* Fertility – TTC focus / adult */}
              {personaConfig.id !== 'teen' && personaConfig.id !== 'perimenopause' && preferences?.show_fertility !== false && (
                <div className="text-center">
                  <p className="text-xs" style={{ color: C.muted }}>
                    {locale === "de" ? "Fruchtbar" : locale === "fa" ? "باروری" : "Fertile"}
                  </p>
                  <p className="text-lg font-bold" style={{ color: isFertileWindow ? C.roseStrong : C.muted }}>
                    {isFertileWindow ? "✓" : "—"}
                  </p>
                </div>
              )}

              {/* For perimenopause: hot flashes count */}
              {personaConfig.id === 'perimenopause' && (
                <div className="text-center">
                  <p className="text-xs" style={{ color: C.muted }}>
                    {locale === "de" ? "Hitzewall." : locale === "fa" ? "گرگرفتگی" : "Hot flash"}
                  </p>
                  <p className="text-lg font-bold" style={{ color: "#6a9a7a" }}>—</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ 2. PHASE CARD ═══════════════════════════════════════════ */}
        {heuteSections.phaseCard && (
          <div
            className="rounded-3xl p-5"
            style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: phase.color + "22" }}
              >
                {phase.icon}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: C.muted }}>
                  {locale === "de" ? "AKTUELLE PHASE" : locale === "fa" ? "فاز فعلی" : "CURRENT PHASE"}
                </p>
                <p className="text-base font-bold" style={{ color: C.dark }}>
                  {tLabel(phase.label)}
                </p>
              </div>
            </div>

            {/* Phase meter – visual bar */}
            {heuteSections.phaseProgressBar && (
              <>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#f0e0e8" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(currentDay / data.cycleLength) * 100}%`,
                      background: `linear-gradient(90deg, ${phase.color}88, ${phase.color})`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs" style={{ color: C.muted }}>
                    {locale === "de" ? "Tag 1" : "Day 1"}
                  </span>
                  <span className="text-xs" style={{ color: phase.textColor }}>
                    {tLabel(phase.label)}
                  </span>
                  <span className="text-xs" style={{ color: C.muted }}>
                    {locale === "de" ? "Tag" : "Day"} {data.cycleLength}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════ 3. EDUCATION CARDS (TEEN PRIORITY) ════════════════════ */}
        {heuteSections.educationCard && educationModules.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-widest" style={{ color: C.roseMid }}>
              {personaConfig.id === 'teen'
                ? (locale === "de" ? "📚 LERNE DEINEN KÖRPER KENNEN" : locale === "fa" ? "📚 بدنت را بشناس" : "📚 GET TO KNOW YOUR BODY")
                : personaConfig.id === 'trying_to_conceive'
                ? (locale === "de" ? "📚 FRUCHTBARKEIT & EMPFÄNGNIS" : locale === "fa" ? "📚 باروری و بارداری" : "📚 FERTILITY & CONCEPTION")
                : (locale === "de" ? "📚 WISSENSWERTES" : locale === "fa" ? "📚 دانستنی‌ها" : "📚 KNOWLEDGE")}
            </p>
            {educationModules.slice(0, 2).map(mod => (
              <EducationModuleCard key={mod.id} module={mod} locale={locale} />
            ))}
          </div>
        )}

        {/* ════════ 4. BABY ENTWICKLUNG (if pregnant) ════════════════════ */}
        {heuteSections.babyDevelopment && pregnancy?.is_pregnant && weekData && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{ boxShadow: C.shadow }}
          >
            <div
              className="px-5 pt-5 pb-4"
              style={{
                background: "linear-gradient(135deg, #fce4f0 0%, #fef0f4 100%)",
              }}
            >
              <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: C.roseMid }}>
                {locale === "de" ? "🌱 BABY ENTWICKLUNG" : locale === "fa" ? "🌱 رشد نوزاد" : "🌱 BABY DEVELOPMENT"}
              </p>

              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl"
                  style={{ background: "rgba(255,255,255,0.7)" }}
                >
                  {getFruitEmoji(weekData?.fruit)}
                </div>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: C.mid }}>
                    {locale === "de"
                      ? "Dein Baby ist so groß wie"
                      : locale === "fa"
                      ? "نوزادت به اندازه"
                      : "Your baby is the size of"}
                  </p>
                  <p className="text-xl font-bold" style={{ color: C.dark }}>
                    {locale === "de" ? weekData?.fruitDe : locale === "fa" ? weekData?.fruitFa : weekData?.fruitEn}
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.mid }}>
                    {weekData?.milestoneDe}
                  </p>
                </div>
              </div>
            </div>

            {/* Size + Weight */}
            <div
              className="grid grid-cols-2 gap-4 px-5 py-4"
              style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
            >
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: C.muted }}>
                  {locale === "de" ? "Größe" : "Size"}
                </p>
                <p className="text-2xl font-bold" style={{ color: C.dark }}>
                  {weekData?.sizeCm ?? "—"}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>cm</p>
              </div>
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: C.muted }}>
                  {locale === "de" ? "Gewicht" : "Weight"}
                </p>
                <p className="text-2xl font-bold" style={{ color: C.dark }}>
                  {weekData?.weightG ?? 0}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>g</p>
              </div>
            </div>

            {/* 3D Model Placeholder */}
            <div
              className="px-5 py-6 flex flex-col items-center"
              style={{ background: "#fdf6f8", borderTop: `1px solid ${C.border}` }}
            >
              <div
                className="relative w-full h-48 rounded-2xl flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                style={{
                  background: "linear-gradient(135deg, #fce4f0, #fdf0f4)",
                  perspective: "800px",
                }}
              >
                <div
                  className="text-7xl select-none"
                  style={{
                    animation: "spinFruit 6s linear infinite",
                    transformStyle: "preserve-3d",
                    display: "inline-block",
                  }}
                >
                  {getFruitEmoji(weekData?.fruit)}
                </div>
              </div>
              <style>{`
                @keyframes spinFruit {
                  from { transform: rotateY(0deg); }
                  to { transform: rotateY(360deg); }
                }
              `}</style>
              <p className="text-xs mt-2" style={{ color: C.muted }}>
                {locale === "de" ? "🔄 3D-Modell – dreh zum Vergrößern" : "🔄 3D model – rotate to explore"}
              </p>
            </div>

            {/* Trimester badge */}
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${C.roseLight}55, ${C.roseLight}22)`,
              }}
            >
              <span className="text-lg">🤰</span>
              <p className="text-sm font-medium" style={{ color: C.roseDark }}>
                {trimesterLabel}
              </p>
              <div className="flex-1" />
              <span className="text-xs" style={{ color: C.muted }}>
                {locale === "de" ? `${weeksLeft} Wo. übrig` : `${weeksLeft} weeks left`}
              </span>
            </div>
          </div>
        )}

        {/* ════════ 5. TO-DO LIST ═══════════════════════════════════════════ */}
        {heuteSections.todoList && (
          <div
            className="rounded-3xl p-5"
            style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📋</span>
              <p className="text-sm font-semibold" style={{ color: C.dark }}>
                {locale === "de" ? "Heutige To-Dos" : locale === "fa" ? "کارهای امروز" : "Today's Tasks"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: "💧", label: { de: "2L Wasser trinken", en: "Drink 2L water", fa: "۲ لیتر آب بخور" } },
                { icon: "🧘‍♀️", label: { de: "15 Min. Bewegung / Yoga", en: "15 min exercise/yoga", fa: "۱۵ دقیقه ورزش/یوگا" } },
                ...(personaConfig.id !== 'teen' ? [{ icon: "💊", label: { de: "Vitamine / Supplement", en: "Vitamins / Supplement", fa: "ویتامین / مکمل" } }] : []),
                { icon: "🥗", label: { de: "Gesunde Mahlzeit", en: "Healthy meal", fa: "غذای سالم" } },
                { icon: "😴", label: { de: "Ausreichend Schlaf", en: "Enough sleep", fa: "خواب کافی" } },
              ].map((item) => (
                <label
                  key={item.label.de}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all"
                  style={{ background: C.roseLight + "55", border: `1px solid ${C.rose}` }}
                >
                  <input type="checkbox" className="w-5 h-5 rounded accent-pink-500" />
                  <span className="text-sm" style={{ color: C.dark }}>
                    {item.icon} {tLabel(item.label)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ════════ 6. SYMPTOMS ════════════════════════════════════════════ */}
        {heuteSections.symptomGrid && (
          <div
            className="rounded-3xl p-5"
            style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🤕</span>
              <p className="text-sm font-semibold" style={{ color: C.dark }}>
                {locale === "de" ? "Heutige Symptome" : locale === "fa" ? "علائم امروز" : "Today's Symptoms"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(personaConfig.id === 'perimenopause'
                ? [
                    { emoji: "🔥", de: "Hitzewallung", en: "Hot flash", fa: "گرگرفتگی" },
                    { emoji: "😴", de: "Schlafstörung", en: "Sleep issue", fa: "مشکل خواب" },
                    { emoji: "😰", de: "Stimmung", en: "Mood swing", fa: "نوسان خلقی" },
                    { emoji: "🩸", de: "unregelm. Blutung", en: "Irreg. bleeding", fa: "خونریزی نامنظم" },
                    { emoji: "💧", de: "Trockenheit", en: "Dryness", fa: "خشکی" },
                    { emoji: "🤕", de: "Kopfschmerzen", en: "Headache", fa: "سردرد" },
                  ]
                : personaConfig.id === 'teen'
                ? [
                    { emoji: "🩸", de: "Krämpfe", en: "Cramps", fa: "گرفتگی" },
                    { emoji: "😴", de: "Müdigkeit", en: "Fatigue", fa: "خستگی" },
                    { emoji: "😰", de: "Angst", en: "Anxiety", fa: "اضطراب" },
                    { emoji: "🤕", de: "Kopfweh", en: "Headache", fa: "سردرد" },
                  ]
                : [
                    { emoji: "🤕", de: "Kopfschmerzen", en: "Headache", fa: "سردرد" },
                    { emoji: "🩸", de: "Krämpfe", en: "Cramps", fa: "گرفتگی" },
                    { emoji: "😴", de: "Müdigkeit", en: "Fatigue", fa: "خستگی" },
                    { emoji: "🤢", de: "Übelkeit", en: "Nausea", fa: "حالت تهوع" },
                    { emoji: "💧", de: "Wassereinlagerung", en: "Water retention", fa: "احتباس آب" },
                    { emoji: "🔥", de: "Hitzewallung", en: "Hot flash", fa: "گرگرفتگی" },
                  ]
              ).map((s) => (
                <button
                  key={s.de}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm transition-all hover:scale-102"
                  style={{
                    background: "#fdf6f8",
                    border: `1px solid ${C.border}`,
                    color: C.dark,
                  }}
                >
                  <span>{s.emoji}</span>
                  <span>{tLabel(s)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════ 7. BODY TEMPERATURE ════════════════════════════════════ */}
        {heuteSections.bodyTemperature && (
          <div
            className="rounded-3xl p-5"
            style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🌡️</span>
              <p className="text-sm font-semibold" style={{ color: C.dark }}>
                {locale === "de" ? "Basaltemperatur" : locale === "fa" ? "دمای پایه" : "Basal Temperature"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: C.roseLight + "55" }}
              >
                🌡️
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: C.dark }}>
                  36.5 °C
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  {locale === "de"
                    ? "—0.2 °C im Vgl. zu gestern"
                    : locale === "fa"
                    ? "—0.2 °C نسبت به دیروز"
                    : "—0.2 °C vs yesterday"}
                </p>
              </div>
            </div>

            {/* Mini temperature chart */}
            <div className="mt-4 flex items-end gap-1 h-16">
              {[5, 6, 7, 6, 8, 7, 9].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${v * 10}%`,
                    background: i === 6 ? C.roseLight : C.rose + "55",
                    opacity: i === 6 ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ════════ 8. FERTILITY TODAY ══════════════════════════════════════ */}
        {heuteSections.fertilityToday && preferences?.show_fertility !== false && (
          <div
            className="rounded-3xl p-5"
            style={{ boxShadow: C.shadow }}
          >
            <div
              className="px-5 py-4"
              style={{
                background: `linear-gradient(135deg, ${
                  isFertileWindow ? C.roseLight : "#fdf6f8"
                }, #fff)`,
                borderRadius: "24px",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: isFertileWindow ? C.roseLight + "77" : "#f0e0e8",
                  }}
                >
                  {isFertileWindow ? "❤️" : "💙"}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.dark }}>
                    {locale === "de" ? "Fruchtbarkeit heute" : locale === "fa" ? "باروری امروز" : "Fertility today"}
                  </p>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: isFertileWindow ? C.roseDark : C.muted,
                    }}
                  >
                    {isFertileWindow
                      ? (locale === "de" ? "✓ Fruchtbares Fenster" : locale === "fa" ? "✓ پنجره بارور" : "✓ Fertile window")
                      : (locale === "de" ? "— Nicht fruchtbar" : locale === "fa" ? "— غیر بارور" : "— Not fertile")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ 9. MOOD ════════════════════════════════════════════════ */}
        {heuteSections.moodCard && (
          <div
            className="rounded-3xl p-5"
            style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{phase.moodEmoji}</span>
              <div>
                <p className="text-xs font-medium" style={{ color: C.muted }}>
                  {locale === "de" ? "HEUTIGE STIMMUNG" : locale === "fa" ? "حال امروز" : "TODAY'S MOOD"}
                </p>
                <p className="text-base font-bold" style={{ color: C.dark }}>
                  {tLabel(phase.mood)}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? `Deine Energie ist ${phase.energy.de} – perfekt für heute.`
                : locale === "fa"
                ? `انرژی تو ${phase.energy.fa} است – عالی برای امروز.`
                : `Your energy is ${phase.energy.en} – perfect for today.`}
            </p>
          </div>
        )}

        {/* ════════ 10. REMINDERS ═══════════════════════════════════════════ */}
        {heuteSections.reminders && (
          <div
            className="rounded-3xl p-5"
            style={{ background: C.surface, border: `1.5px solid ${C.rose}88`, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⏰</span>
              <p className="text-sm font-semibold" style={{ color: C.dark }}>
                {locale === "de" ? "Heutige Erinnerungen" : locale === "fa" ? "یادآوری‌های امروز" : "Today's Reminders"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {[
                ...(personaConfig.id !== 'teen' ? [{ icon: "💊", de: "Supplement einnehmen", en: "Take supplement", fa: "مکمل بخور" }] : []),
                { icon: "💧", de: "Wasser trinken (2L)", en: "Drink water (2L)", fa: "آب بخور (۲ لیتر)" },
                { icon: "🧘‍♀️", de: "Yoga / Bewegung", en: "Yoga / Movement", fa: "یوگا / حرکت" },
                { icon: "🥗", de: "Gesund essen", en: "Eat healthy", fa: "غذای سالم" },
              ].map((r) => (
                <div
                  key={r.de}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                  style={{ background: "#fdf6f8", border: "1px solid #f4c7d7" }}
                >
                  <span className="text-lg">{r.icon}</span>
                  <span className="text-sm font-medium" style={{ color: C.dark }}>
                    {locale === "de" ? r.de : locale === "fa" ? r.fa : r.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════ 11. SMART SUGGESTION ════════════════════════════════════ */}
        {heuteSections.smartSuggestion && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: `linear-gradient(135deg, ${C.roseLight}55, ${C.rose}55)`,
              border: `1.5px solid ${C.roseMid}`,
              boxShadow: C.shadow,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                💡
              </div>
              <p className="text-sm font-semibold" style={{ color: C.roseMid }}>
                {locale === "de" ? "SMARTE EMPFEHLUNG" : locale === "fa" ? "پیشنهاد هوشمند" : "SMART SUGGESTION"}
              </p>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? `Basierend auf deiner ${tLabel(phase.label)}-Phase: ${phase.tip.de}`
                : locale === "fa"
                ? `بر اساس فاز ${tLabel(phase.label)}: ${phase.tip.fa}`
                : `Based on your ${tLabel(phase.label)} phase: ${phase.tip.en}`}
            </p>

            {/* Phase-specific tip */}
            <div
              className="mt-3 px-4 py-3 rounded-2xl"
              style={{
                background: phase.color + "22",
                border: `1px solid ${phase.color}55`,
              }}
            >
              <p className="text-xs font-medium" style={{ color: phase.textColor }}>
                {phase.icon} {tLabel(phase.label)}
              </p>
              <p className="text-xs mt-1" style={{ color: C.mid }}>{tLabel(phase.tip)}</p>
            </div>
          </div>
        )}

        {/* ── Footer nav link ─────────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="text-center text-sm py-4 rounded-2xl"
          style={{ color: C.roseMid, background: C.surface, border: `1px solid ${C.border}` }}
        >
          {locale === "de" ? "← Zum Dashboard" : locale === "fa" ? "← به داشبورد" : "← Back to Dashboard"}
        </Link>

      </div>{/* end content */}
    </main>
  );
}