"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getUserPregnancy } from "@/lib/actions/pregnancy";
import { useLocale } from "@/context/LocaleContext";
import {
  getCurrentWeek,
  getPregnancyProgress,
  getDueDate,
  type PregnancyWeek,
} from "@/lib/pregnancy";
import { getPregnancyWeekData } from "@/lib/pregnancy-data";

const fruitEmojiMap: Record<string, string> = {
  "Mohnsamen": "🌱", "Stecknadelkopf": "📌", "Apfelsamen": "🌱",
  "Erbse": "🟢", "Blaubeere": "🫐", "Himbeere": "🍇", "Kirsche": "🍒",
  "Pflaume": "🫐", "Feige": "🫐", "Limette": "🍈", "Pfirsich": "🍑",
  "Zitrone": "🍋", "Apfel": "🍎", "Avocado": "🥑", "Birne": "🍐",
  "Paprika": "🫑", "Mango": "🥭", "Banane": "🍌", "Karotte": "🥕",
  "Kokosnuss": "🥥", "Grapefruit": "🍊", "Maiskolben": "🌽",
  "Rutabaga": "🥬", "Kohlrabi": "🥬", "Zucchini": "🥒",
  "Blumenkohl": "🥦", "Aubergine": "🍆", "Butternut-Kürbis": "🎃",
  "Kohl": "🥬", "Honigmelone": "🍈", "Ananas": "🍍", "Melone": "🍈",
  "Wassermelone (mini)": "🍉", "Wassermelone": "🍉",
  "Rhabarber": "🥬", "Kopfsalat": "🥬",
};

function getFruitEmoji(fruitName: string | undefined): string {
  if (!fruitName) return "🍎";
  if (fruitEmojiMap[fruitName]) return fruitEmojiMap[fruitName];
  for (const [key, emoji] of Object.entries(fruitEmojiMap)) {
    if (fruitName.includes(key) || key.includes(fruitName)) return emoji;
  }
  return "🍎";
}

// ── Rose Design tokens ──────────────────────────────────────────────────────
const C = {
  bg: "#fef6f8",
  card: "#ffffff",
  roseLight: "#fce4ed",
  rose: "#f4c7d7",
  roseMid: "#e8a0b4",
  roseDark: "#c47a9a",
  roseStrong: "#d48a9a",
  dark: "#2d1f35",
  mid: "#6b5a7a",
  muted: "#a094a8",
  white: "#ffffff",
  shadow: "0 4px 24px rgba(196,122,154,0.10)",
  shadowSm: "0 2px 12px rgba(196,122,154,0.06)",
};

export default function SchwangerschaftPage() {
  const { user } = useAuth();
  const { locale } = useLocale();

  const [pregnancy, setPregnancy] = useState<{
    is_pregnant: boolean;
    last_period_start: string | null;
    due_date: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<PregnancyWeek | undefined>(undefined);
  const [weekDataLoading, setWeekDataLoading] = useState(false);

  function loadPregnancy() {
    if (!user) { setLoading(false); return; }
    getUserPregnancy().then((data) => {
      if (data) setPregnancy(data);
      setLoading(false);
    });
  }

  useEffect(() => { loadPregnancy(); }, [user]);

  const week = pregnancy?.last_period_start
    ? getCurrentWeek(pregnancy.last_period_start)
    : 1;

  useEffect(() => {
    if (!pregnancy?.is_pregnant || !pregnancy.last_period_start) return;
    setWeekDataLoading(true);
    getPregnancyWeekData(week).then((data) => {
      setWeekData(data);
      setWeekDataLoading(false);
    });
  }, [week, pregnancy?.is_pregnant, pregnancy?.last_period_start]);

  // ── First name from user email ─────────────────────────────────
  const firstName = user?.email?.split("@")[0] ?? "";

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full animate-pulse"
            style={{ background: C.roseLight }}
          />
          <p className="text-sm" style={{ color: C.muted }}>
            {locale === "de" ? "Einen Moment …" : locale === "fa" ? "لطفاً صبر کن …" : "One moment …"}
          </p>
        </div>
      </main>
    );
  }

  // ── Empty / not pregnant ───────────────────────────────────────────────────
  if (!pregnancy?.is_pregnant || !pregnancy.last_period_start) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: C.bg }}
      >
        <div className="flex flex-col items-center gap-5 text-center max-w-xs">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: C.roseLight, boxShadow: C.shadowSm }}
          >
            🤰
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-2" style={{ color: C.dark }}>
              {locale === "de" ? "Schwangerschaft" : locale === "fa" ? "بارداری" : "Pregnancy"}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
              {locale === "de"
                ? "Trage deine Schwangerschaftsdaten im Profil ein, um wöchentliche Infos zu deinem Baby zu erhalten."
                : locale === "fa"
                ? "اطلاعات بارداری را در پروفایل وارد کن."
                : "Enter your pregnancy data in your profile to get weekly updates."}
            </p>
          </div>
          <Link
            href="/profile"
            className="text-sm font-semibold rounded-2xl px-8 py-3.5 text-white transition-opacity hover:opacity-85"
            style={{ background: `linear-gradient(135deg, ${C.roseMid}, ${C.roseDark})` }}
          >
            {locale === "de" ? "Zum Profil" : locale === "fa" ? "به پروفایل" : "Go to Profile"}
          </Link>
          <Link href="/dashboard" className="text-sm" style={{ color: C.roseMid }}>
            {locale === "de" ? "← Zurück" : locale === "fa" ? "← برگشت" : "← Back"}
          </Link>
        </div>
      </main>
    );
  }

  // ── Computed values ────────────────────────────────────────────────────────
  const progress = getPregnancyProgress(week);
  const weeksLeft = Math.max(0, 40 - week);

  const dueDate = pregnancy.due_date
    ? new Date(pregnancy.due_date)
    : getDueDate(pregnancy.last_period_start);

  const dueDateStr = dueDate.toLocaleDateString(
    locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dueDay = new Date(dueDate); dueDay.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.max(0, Math.round((dueDay.getTime() - today.getTime()) / 86400000));

  const t = locale === "de" ? "de" : locale === "fa" ? "fa" : "en";
  const fruitName = t === "de" ? weekData?.fruitDe : t === "fa" ? weekData?.fruitFa : weekData?.fruitEn;
  const fruitEmoji = getFruitEmoji(weekData?.fruit);
  const milestoneText = t === "de" ? weekData?.milestoneDe : t === "fa" ? weekData?.milestoneFa : weekData?.milestoneEn;
  const tipText = t === "de" ? weekData?.tipDe : t === "fa" ? weekData?.tipFa : weekData?.tipEn;

  // ── Trimester label ────────────────────────────────────────────────────────
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const trimesterLabel =
    locale === "de"
      ? `${trimester}. Trimester`
      : locale === "fa"
      ? `سه‌ماهه ${trimester}`
      : `${trimester}${trimester === 1 ? "st" : trimester === 2 ? "nd" : "rd"} Trimester`;

  return (
    <main className="min-h-screen pb-24" style={{ background: C.bg }}>

      {/* ── TOP GRADIENT BACKGROUND ─────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-[420px] pointer-events-none"
        style={{
          background: "linear-gradient(160deg, #fce4f0 0%, #fdf0f4 50%, #fef6f8 100%)",
          zIndex: 0,
        }}
      />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 pt-12 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-wide font-medium mb-0.5" style={{ color: C.roseMid }}>
            {locale === "de" ? "Guten Tag" : locale === "fa" ? "سلام" : "Hello"}
            {firstName ? `, ${firstName}` : ""} 👋
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.dark }}>
            {locale === "de" ? "Meine Schwangerschaft" : locale === "fa" ? "بارداری من" : "My Pregnancy"}
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-2xl"
          style={{ background: C.white, boxShadow: C.shadowSm }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={C.roseMid} strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-5 pt-4 max-w-md mx-auto flex flex-col gap-4">

        {/* ── HERO CARD: Image + Week Info ────────────────────────────── */}
        <div
          className="rounded-[28px] overflow-hidden relative"
          style={{ boxShadow: C.shadow }}
        >
          {/* Image */}
          <div className="relative w-full" style={{ height: "340px" }}>
            <Image
              src="/images/bild-frau.jpeg"
              alt="Schwangere Frau"
              fill
              className="object-cover object-top"
              priority
            />
            {/* Gradient overlay bottom */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(254,246,248,0) 30%, rgba(254,246,248,0.12) 55%, rgba(45,31,53,0.55) 100%)",
              }}
            />

            {/* Trimester badge top-left */}
            <div
              className="absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="text-xs font-semibold" style={{ color: C.roseMid }}>
                {trimesterLabel}
              </span>
            </div>

            {/* Week badge top-right */}
            <div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${C.roseMid}, ${C.roseDark})`,
              }}
            >
              <span className="text-xs font-bold text-white">
                {locale === "de" ? `SSW ${week}` : locale === "fa" ? `هفته ${week}` : `Week ${week}`}
              </span>
            </div>

            {/* Bottom text overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <p className="text-white font-semibold text-base leading-snug" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                {locale === "de"
                  ? `Du bist in Woche ${week} deiner Schwangerschaft ✨`
                  : locale === "fa"
                  ? `تو در هفته ${week} بارداری هستی ✨`
                  : `You are in week ${week} of your pregnancy ✨`}
              </p>

              {/* Progress bar */}
              <div className="mt-2.5 w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,1))",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-white opacity-70">
                  {locale === "de" ? "Woche 1" : locale === "fa" ? "هفته ۱" : "Week 1"}
                </span>
                <span className="text-xs text-white opacity-70">
                  {locale === "de" ? "Woche 40" : locale === "fa" ? "هفته ۴۰" : "Week 40"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── DUE DATE CARD ──────────────────────────────────────────── */}
        <div
          className="rounded-[24px] p-5 flex items-center gap-4"
          style={{ background: C.white, boxShadow: C.shadow }}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: C.roseLight }}
          >
            🗓️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium tracking-wide mb-0.5" style={{ color: C.muted }}>
              {locale === "de"
                ? "VORAUSSICHTLICHER GEBURTSTERMIN"
                : locale === "fa"
                ? "تاریخ تخمینی زایمان"
                : "ESTIMATED DUE DATE"}
            </p>
            <p className="text-lg font-bold truncate" style={{ color: C.dark }}>
              {dueDateStr}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.roseDark }}>
              {daysUntilDue === 0
                ? (locale === "de" ? "Heute ist es so weit! 💕" : locale === "fa" ? "امروزه! 💕" : "It's today! 💕")
                : locale === "de"
                ? `Noch ${daysUntilDue} Tage`
                : locale === "fa"
                ? `${daysUntilDue} روز دیگر`
                : `${daysUntilDue} days to go`}
            </p>
          </div>
        </div>

        {/* ── BABY ENTWICKLUNG CARD ─────────────────────────────────── */}
        {weekDataLoading && (
          <div
            className="rounded-[24px] p-5"
            style={{ background: C.white, boxShadow: C.shadow }}
          >
            <div className="flex gap-3 items-center">
              <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ background: C.roseLight }} />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 rounded-full animate-pulse w-3/4" style={{ background: C.roseLight }} />
                <div className="h-3 rounded-full animate-pulse w-1/2" style={{ background: C.roseLight }} />
              </div>
            </div>
          </div>
        )}

        {weekData && !weekDataLoading && (
          <div
            className="rounded-[24px] overflow-hidden"
            style={{ background: C.white, boxShadow: C.shadow }}
          >
            {/* Card header */}
            <div
              className="px-5 pt-5 pb-4"
              style={{
                background: `linear-gradient(135deg, ${C.roseLight} 0%, #fef0f4 100%)`,
              }}
            >
              <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: C.roseMid }}>
                {locale === "de" ? "🌱 BABY ENTWICKLUNG" : locale === "fa" ? "🌱 رشد نوزاد" : "🌱 BABY DEVELOPMENT"}
              </p>
              <div className="flex items-center gap-4">
                {/* Fruit visual */}
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shrink-0"
                  style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}
                >
                  {fruitEmoji}
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: C.mid }}>
                    {locale === "de"
                      ? "Dein Baby ist aktuell so groß wie"
                      : locale === "fa"
                      ? "نوزادت الان به اندازه"
                      : "Your baby is currently the size of"}
                  </p>
                  {fruitName && (
                    <p className="text-xl font-bold" style={{ color: C.dark }}>
                      {locale === "de" ? `eine${fruitName.match(/^(A|Ä|E|I|O|U)/i) ? "" : "r"} ${fruitName}` : `${fruitEmoji} ${fruitName}`}
                    </p>
                  )}
                  {milestoneText && (
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: C.mid }}>
                      {milestoneText}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Size + Weight */}
            <div className="grid grid-cols-2 divide-x" style={{ borderColor: "#f0e0e8" }}>
              <div className="px-5 py-4 text-center">
                <p className="text-xs font-medium mb-1" style={{ color: C.muted }}>
                  {locale === "de" ? "Größe" : locale === "fa" ? "اندازه" : "Length"}
                </p>
                <p className="text-2xl font-bold" style={{ color: C.dark }}>
                  {weekData.sizeCm}
                  <span className="text-sm font-normal ml-0.5" style={{ color: C.muted }}>cm</span>
                </p>
                <div className="mt-2 w-full h-1 rounded-full" style={{ background: C.roseLight }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, (weekData.sizeCm / 50) * 100)}%`, background: C.rose }}
                  />
                </div>
              </div>
              <div className="px-5 py-4 text-center">
                <p className="text-xs font-medium mb-1" style={{ color: C.muted }}>
                  {locale === "de" ? "Gewicht" : locale === "fa" ? "وزن" : "Weight"}
                </p>
                <p className="text-2xl font-bold" style={{ color: C.dark }}>
                  {weekData.weightG > 0 ? weekData.weightG : "—"}
                  {weekData.weightG > 0 && (
                    <span className="text-sm font-normal ml-0.5" style={{ color: C.muted }}>g</span>
                  )}
                </p>
                {weekData.weightG > 0 && (
                  <div className="mt-2 w-full h-1 rounded-full" style={{ background: C.roseLight }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, (weekData.weightG / 3500) * 100)}%`, background: C.roseStrong }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── INFO GRID (4 Karten) ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Schwangerschaftswoche */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: C.white, boxShadow: C.shadowSm }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: C.roseLight }}
            >
              📅
            </div>
            <p className="text-xs font-medium mb-0.5" style={{ color: C.muted }}>
              {locale === "de" ? "Schwangerschaftswoche" : locale === "fa" ? "هفته بارداری" : "Pregnancy Week"}
            </p>
            <p className="text-2xl font-bold" style={{ color: C.dark }}>
              {week}
              <span className="text-sm font-normal ml-1" style={{ color: C.muted }}>/ 40</span>
            </p>
          </div>

          {/* Verbleibende Wochen */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: C.white, boxShadow: C.shadowSm }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: C.rose }}
            >
              ⏳
            </div>
            <p className="text-xs font-medium mb-0.5" style={{ color: C.muted }}>
              {locale === "de" ? "Noch bis zur Geburt" : locale === "fa" ? "تا زایمان" : "Weeks Remaining"}
            </p>
            <p className="text-2xl font-bold" style={{ color: C.dark }}>
              {weeksLeft}
              <span className="text-sm font-normal ml-1" style={{ color: C.muted }}>
                {locale === "de" ? "Wo." : locale === "fa" ? "هفته" : "wks"}
              </span>
            </p>
          </div>

          {/* Fortschritt */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: C.white, boxShadow: C.shadowSm }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: C.roseLight }}
            >
              📈
            </div>
            <p className="text-xs font-medium mb-1.5" style={{ color: C.muted }}>
              {locale === "de" ? "Fortschritt" : locale === "fa" ? "پیشرفت" : "Progress"}
            </p>
            <p className="text-2xl font-bold" style={{ color: C.dark }}>
              {Math.round(progress)}
              <span className="text-sm font-normal ml-0.5" style={{ color: C.muted }}>%</span>
            </p>
            <div className="mt-2 w-full h-1 rounded-full" style={{ background: C.roseLight }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${C.rose}, ${C.roseDark})`,
                }}
              />
            </div>
          </div>

          {/* Trimester */}
          <div
            className="rounded-[20px] p-4"
            style={{ background: `linear-gradient(135deg, ${C.roseMid}, ${C.roseDark})` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              🤰
            </div>
            <p className="text-xs font-medium mb-0.5 text-white opacity-80">
              {locale === "de" ? "Aktuell" : locale === "fa" ? "مرحله" : "Currently"}
            </p>
            <p className="text-base font-bold text-white leading-snug">
              {trimesterLabel}
            </p>
          </div>
        </div>

        {/* ── TIP CARD ─────────────────────────────────────────────── */}
        {tipText && !weekDataLoading && (
          <div
            className="rounded-[24px] p-5"
            style={{ background: C.white, boxShadow: C.shadowSm }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: C.roseLight }}
              >
                💡
              </div>
              <p className="text-xs font-semibold tracking-wide" style={{ color: C.roseDark }}>
                {locale === "de" ? "TIPP DER WOCHE" : locale === "fa" ? "نکته هفته" : "TIP OF THE WEEK"}
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.mid }}>
              {tipText}
            </p>
          </div>
        )}

        {/* ── WEEK NAVIGATOR ───────────────────────────────────────── */}
        <div
          className="rounded-[24px] p-5"
          style={{ background: C.white, boxShadow: C.shadowSm }}
        >
          <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: C.muted }}>
            {locale === "de" ? "ALLE SCHWANGERSCHAFTSWOCHEN" : locale === "fa" ? "همه هفته‌ها" : "ALL WEEKS"}
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
              <div
                key={w}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={
                  w === week
                    ? {
                        background: `linear-gradient(135deg, ${C.roseMid}, ${C.roseDark})`,
                        color: C.white,
                        boxShadow: `0 2px 8px rgba(196,122,154,0.5)`,
                      }
                    : w < week
                    ? { background: C.roseLight, color: C.roseMid }
                    : { background: "#f5f0f2", color: C.muted }
                }
              >
                {w}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}