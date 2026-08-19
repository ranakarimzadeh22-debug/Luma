"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getHomeData } from "@/lib/actions/user-data";
import { useLocale } from "@/context/LocaleContext";
import { useProfile } from "@/context/ProfileContext";
import { getPersonaConfig, DASHBOARD_HERO, EDUCATION_MODULES, type PersonaId } from "@/lib/personas/persona-config";
import type { EducationModule } from "@/lib/personas/persona-config";
import LumaLogo from "@/components/LumaLogo";
import PeriodReminder from "@/components/PeriodReminder";
import CycleWheel from "@/components/CycleWheel";
import CycleEditModal from "@/components/CycleEditModal";
import PregnancyBanner from "@/components/PregnancyBanner";
import PregnancyModal from "@/components/PregnancyModal";
import { getNextPeriodDate, getOvulationDate, formatDate, getCurrentPhase } from "@/lib/cycle";
import { getCurrentWeek } from "@/lib/pregnancy";
import { getCurrentPeriodDay, getDaysUntilNextPeriod, getDayInfo } from "@/lib/cycle-calendar";
import { LIFE_STAGE_LABELS, type LifeStage } from "@/lib/profile-types";

/* ─── Rose Design tokens ──────────────────────────────────────────────── */
const C = {
  roseLight: "#fce4ed",
  rose: "#f4c7d7",
  roseMid: "#e8a0b4",
  roseDark: "#c47a9a",
  dark: "#3a2d3f",
  mid: "#6b5a7a",
  muted: "#a094a8",
  border: "#f0e0e8",
  shadow: "0 4px 20px rgba(196,122,154,0.10)",
  shadowSm: "0 2px 10px rgba(196,122,154,0.06)",
};

type ThemeColors = {
  bg: string; surface: string; primary: string; primaryLight: string;
  primaryMid: string; primaryDark: string; dark: string; mid: string;
  muted: string; border: string; gradient: string;
};

// ============================================
// Adaptive Menu Items based on Life Stage
// ============================================

function getMenuItems(lifeStage: LifeStage | null | undefined, locale: string) {
  const loc = locale as 'de' | 'en' | 'fa';
  const t = (label: { de: string; en: string; fa: string }) => label[loc] || label.en;

  const allItems = [
    {
      id: "heute",
      href: "/heute",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
      label: { de: "Heute", en: "Today", fa: "امروز" },
      showFor: ["teen", "young_adult", "adult", "trying_to_conceive", "pregnant", "postpartum", "perimenopause", "menopause"] as LifeStage[],
    },
    {
      id: "kalender",
      href: "/zyklus",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <circle cx="8" cy="14" r="0.8" fill="currentColor" />
          <circle cx="12" cy="14" r="0.8" fill="currentColor" />
          <circle cx="16" cy="14" r="0.8" fill="currentColor" />
        </svg>
      ),
      label: { de: "Zyklus", en: "Cycle", fa: "چرخه" },
      showFor: ["teen", "young_adult", "adult", "trying_to_conceive", "perimenopause"] as LifeStage[],
    },
    {
      id: "schwangerschaft",
      href: "/schwangerschaft",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="5" r="2.5" />
          <path d="M10.5 7.5 C9 11 8 14 8.5 18" />
          <path d="M13.5 7.5 C15 11 16.5 14 15.5 18" />
          <path d="M8.5 14 C9.5 17 13 17.5 15.5 14" />
        </svg>
      ),
      label: { de: "Schwangerschaft", en: "Pregnancy", fa: "بارداری" },
      showFor: ["pregnant", "postpartum", "trying_to_conceive"] as LifeStage[],
    },
    {
      id: "gesundheit",
      href: "/gesundheit",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
      label: { de: "Gesundheit", en: "Health", fa: "سلامتی" },
      showFor: ["teen", "young_adult", "adult", "trying_to_conceive", "pregnant", "postpartum", "perimenopause", "menopause"] as LifeStage[],
    },
    {
      id: "yoga",
      href: "/yoga",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="4" r="1.5" />
          <path d="M12 6 L12 13" />
          <path d="M12 13 L7 18" />
          <path d="M12 13 L17 18" />
          <path d="M9 10 L5 12" />
          <path d="M15 10 L19 12" />
        </svg>
      ),
      label: { de: "Yoga", en: "Yoga", fa: "یوگا" },
      showFor: ["teen", "young_adult", "adult", "trying_to_conceive", "pregnant", "postpartum", "perimenopause", "menopause"] as LifeStage[],
    },
    {
      id: "gefuhl",
      href: "/gefuhl",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 14s1 2 3 2 3-2 3-2" />
          <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth={2} />
          <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth={2} />
        </svg>
      ),
      label: { de: "Gefühle", en: "Feelings", fa: "احساسات" },
      showFor: ["teen", "young_adult", "adult", "trying_to_conceive", "pregnant", "postpartum", "perimenopause", "menopause"] as LifeStage[],
    },
    {
      id: "menopause",
      href: "/gesundheit",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 1 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
          <path d="M17 4a2 2 0 0 0-2 2v2" />
          <path d="M21 10a2 2 0 0 0-2-2h-2" />
        </svg>
      ),
      label: { de: "Wechseljahre", en: "Menopause", fa: "یائسگی" },
      showFor: ["perimenopause", "menopause"] as LifeStage[],
    },
    // Education module for teens
    {
      id: "education",
      href: "/heute",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      label: { de: "Lernen", en: "Learn", fa: "یادگیری" },
      showFor: ["teen"] as LifeStage[],
    },
  ];

  return allItems.filter((item) => {
    if (!lifeStage) return true; // Show all if no life stage set
    return item.showFor.includes(lifeStage);
  });
}

// ============================================
// Life Stage Welcome Messages
// ============================================

function getWelcomeMessage(lifeStage: LifeStage | null | undefined, name: string, locale: string): string {
  const loc = locale as 'de' | 'en' | 'fa';
  const messages: Record<LifeStage, { de: string; en: string; fa: string }> = {
    teen: {
      de: `Hey ${name}! Schön, dass du da bist. Entdecke deinen Körper in deinem eigenen Tempo.`,
      en: `Hey ${name}! So glad you're here. Discover your body at your own pace.`,
      fa: `${name} جان! خوشحالم که هستی. بدن خودت را با سرعت خودت کشف کن.`,
    },
    young_adult: {
      de: `Hey ${name}! Bereit, deinen Körper besser zu verstehen?`,
      en: `Hey ${name}! Ready to understand your body better?`,
      fa: `${name} جان! آماده‌ای بدنت را بهتر بشناسی؟`,
    },
    adult: {
      de: `Willkommen zurück, ${name}! Dein Zyklus, deine Superkraft.`,
      en: `Welcome back, ${name}! Your cycle, your superpower.`,
      fa: `${name} خوش آمدی! چرخه تو، ابرقدرت تو.`,
    },
    trying_to_conceive: {
      de: `Hey ${name}! Wir begleiten dich auf deinem Weg.`,
      en: `Hey ${name}! We're with you on your journey.`,
      fa: `${name} جان! ما در این مسیر همراه تو هستیم.`,
    },
    pregnant: {
      de: `Hey ${name}! Eine aufregende Zeit beginnt.`,
      en: `Hey ${name}! An exciting time begins.`,
      fa: `${name} جان! یک زمان هیجان‌انگیز شروع می‌شود.`,
    },
    postpartum: {
      de: `Hey ${name}! Du machst das großartig.`,
      en: `Hey ${name}! You're doing amazing.`,
      fa: `${name} جان! عالی کار می‌کنی.`,
    },
    perimenopause: {
      de: `Hey ${name}! Dein Körper verändert sich – wir sind für dich da.`,
      en: `Hey ${name}! Your body is changing – we're here for you.`,
      fa: `${name} جان! بدنت در حال تغییر است – ما برای تو اینجا هستیم.`,
    },
    menopause: {
      de: `Hey ${name}! Ein neues Kapitel – wir begleiten dich.`,
      en: `Hey ${name}! A new chapter – we're with you.`,
      fa: `${name} جان! یک فصل جدید – ما همراه تو هستیم.`,
    },
  };

  if (!lifeStage || !messages[lifeStage]) {
    return `${locale === "de" ? "Hey" : locale === "fa" ? "سلام" : "Hey"} ${name}! 🌸`;
  }

  const msg = messages[lifeStage];
  return msg[loc] || msg.en;
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  PERSONALIZED CYCLE STATUS CARD – Herz der Seite                        */
/* ════════════════════════════════════════════════════════════════════════ */

interface CycleStatusCardProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  personaId: PersonaId;
  locale: string;
  theme: ThemeColors;
  pregnancyActive: boolean;
  nextPeriodDays: number;
}

function CycleStatusCard({ currentDay, cycleLength, periodLength, personaId, locale, theme, pregnancyActive, nextPeriodDays }: CycleStatusCardProps) {
  const loc = locale as 'de' | 'en' | 'fa';
  const t = (obj: { de: string; en: string; fa: string }) => obj[loc] || obj.en;

  const isPeriodTime = currentDay <= periodLength;
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay;
  const isFertileWindow = currentDay >= fertileStart && currentDay <= fertileEnd;
  const isLuteal = currentDay > 16;
  const isFollicular = currentDay > periodLength && currentDay <= 13;

  // ── Determine status message based on persona + cycle day ──────────────
  let statusEmoji: string;
  let statusTitle: { de: string; en: string; fa: string };
  let statusMessage: { de: string; en: string; fa: string };

  // Pregnancy override
  if (pregnancyActive) {
    statusEmoji = "🤰";
    statusTitle = { de: "Herzlichen Glückwunsch!", en: "Congratulations!", fa: "تبریک!" };
    statusMessage = {
      de: "Du bist schwanger! Dein Körper bereitet sich auf eine aufregende Reise vor. 🎀",
      en: "You're pregnant! Your body is preparing for an amazing journey. 🎀",
      fa: "تو باردار هستی! بدنت برای یک سفر شگفت‌انگیز آماده می‌شود. 🎀",
    };
  }
  // Perimenopause
  else if (personaId === 'perimenopause') {
    statusEmoji = "🦋";
    statusTitle = { de: "Eine neue Phase", en: "A New Phase", fa: "یک مرحله جدید" };
    statusMessage = {
      de: "Dein Körper verändert sich – achte heute auf deine Symptome. Ruhe und Achtsamkeit helfen dir durch den Tag.",
      en: "Your body is changing – pay attention to your symptoms today. Rest and mindfulness help you through the day.",
      fa: "بدنت در حال تغییر است – امروز به علائم خود توجه کن. استراحت و ذهن‌آگاهی به تو در طول روز کمک می‌کند.",
    };
  }
  // Teen
  else if (personaId === 'teen') {
    if (isPeriodTime) {
      statusEmoji = "🩸";
      statusTitle = { de: "Deine Periode ist da", en: "Your Period is Here", fa: "پریود تو شروع شده" };
      statusMessage = {
        de: "Das ist ganz normal! Dein Körper zeigt dir, dass alles gut funktioniert. Wärme, Ruhe und etwas Schokolade helfen jetzt besonders.",
        en: "This is totally normal! Your body is showing you everything works well. Warmth, rest, and some chocolate help right now.",
        fa: "این کاملاً طبیعی است! بدنت به تو نشان می‌دهد که همه چیز خوب کار می‌کند. گرما، استراحت و کمی شکلات الان خیلی کمک می‌کند.",
      };
    } else if (isFertileWindow) {
      statusEmoji = "🌕";
      statusTitle = { de: "Energiegeladene Tage", en: "Energetic Days", fa: "روزهای پرانرژی" };
      statusMessage = {
        de: "Dein Körper hat viel Energie – perfekt für Sport, Lernen oder Zeit mit Freund:innen!",
        en: "Your body has lots of energy – perfect for sports, learning, or time with friends!",
        fa: "بدنت انرژی زیادی دارد – عالی برای ورزش، یادگیری یا وقت با دوستان!",
      };
    } else {
      statusEmoji = "🌱";
      statusTitle = { de: "Lerne deinen Körper kennen", en: "Get to Know Your Body", fa: "بدنت را بشناس" };
      statusMessage = {
        de: "Jeder Tag ist eine neue Entdeckung. Dein Zyklus ist ganz natürlich und einzigartig – genau wie du!",
        en: "Every day is a new discovery. Your cycle is natural and unique – just like you!",
        fa: "هر روز یک کشف جدید است. چرخه تو طبیعی و منحصربه‌فرد است – درست مثل خودت!",
      };
    }
  }
  // Trying to conceive
  else if (personaId === 'trying_to_conceive') {
    if (isPeriodTime) {
      statusEmoji = "🌸";
      statusTitle = { de: "Ein neuer Zyklus beginnt", en: "A New Cycle Begins", fa: "یک چرخه جدید شروع می‌شود" };
      statusMessage = {
        de: "Jeder Zyklus ist eine neue Chance. Sei sanft zu dir selbst – dein Körper arbeitet mit dir.",
        en: "Every cycle is a new chance. Be gentle with yourself – your body is working with you.",
        fa: "هر چرخه یک فرصت جدید است. با خودت مهربان باش – بدنت با تو کار می‌کند.",
      };
    } else if (isFertileWindow) {
      statusEmoji = "❤️";
      statusTitle = { de: "Fruchtbarkeitsfenster", en: "Fertile Window", fa: "پنجره باروری" };
      statusMessage = {
        de: "Du bist in deinem fruchtbaren Fenster! Die nächsten Tage sind optimal für eine Empfängnis. 🌟",
        en: "You're in your fertile window! The next days are optimal for conception. 🌟",
        fa: "تو در پنجره باروری هستی! روزهای آینده برای بارداری بهینه هستند. 🌟",
      };
    } else if (isLuteal) {
      statusEmoji = "💕";
      statusTitle = { de: "Abwarten & Hoffen", en: "Wait & Hope", fa: "انتظار و امید" };
      statusMessage = {
        de: "Die Zwei-Wochen-Wartezeit kann herausfordernd sein. Lenk dich ab – gönn dir Dinge, die dir Freude machen.",
        en: "The two-week wait can be challenging. Distract yourself with things that bring you joy.",
        fa: "دوره انتظار دو هفته‌ای می‌تواند چالش‌برانگیز باشد. خودت را سرگرم کن – کارهایی که بهت لذت می‌دهد انجام بده.",
      };
    } else {
      statusEmoji = "🌱";
      statusTitle = { de: "Vorbereitungszeit", en: "Preparation Time", fa: "زمان آماده‌سازی" };
      statusMessage = {
        de: "Dein Körper bereitet sich auf den Eisprung vor. Achte auf eine gesunde Ernährung und genug Folsäure.",
        en: "Your body is preparing for ovulation. Focus on healthy nutrition and enough folic acid.",
        fa: "بدنت برای تخمک‌گذاری آماده می‌شود. روی تغذیه سالم و اسید فولیک کافی تمرکز کن.",
      };
    }
  }
  // Adult (default)
  else {
    if (isPeriodTime) {
      statusEmoji = "🩸";
      statusTitle = { de: "Deine Periode", en: "Your Period", fa: "پریود تو" };
      if (currentDay === 1) {
        statusMessage = {
          de: "Dein Körper beginnt einen neuen Zyklus. Zeit für Ruhe, Wärme und Self-Care. 🌸",
          en: "Your body is starting a new cycle. Time for rest, warmth, and self-care. 🌸",
          fa: "بدنت یک چرخه جدید را شروع می‌کند. وقت استراحت، گرما و مراقبت از خود. 🌸",
        };
      } else {
        statusMessage = {
          de: `Tag ${currentDay} deiner Periode. Dein Körper regeneriert sich – gönn dir Entspannung.`,
          en: `Day ${currentDay} of your period. Your body is regenerating – give yourself rest.`,
          fa: `روز ${currentDay} پریود تو. بدنت در حال بازسازی است – به خودت استراحت بده.`,
        };
      }
    } else if (isFertileWindow) {
      statusEmoji = "🌕";
      statusTitle = { de: "Fruchtbare Tage", en: "Fertile Days", fa: "روزهای بارور" };
      statusMessage = {
        de: "Deine fruchtbaren Tage – höchste Energie und Ausstrahlung. Nutze diese Vitalität! ✨",
        en: "Your fertile days – peak energy and radiance. Harness this vitality! ✨",
        fa: "روزهای بارور تو – بیشترین انرژی و جذابیت. از این نشاط استفاده کن! ✨",
      };
    } else if (isLuteal) {
      statusEmoji = "🌘";
      if (nextPeriodDays <= 5) {
        statusTitle = { de: "Bald: Periode", en: "Period Soon", fa: "به زودی: پریود" };
        statusMessage = {
          de: `${nextPeriodDays} Tage bis zur nächsten Periode. Jetzt können PMS-Symptome auftreten – nimm dir Zeit für dich.`,
          en: `${nextPeriodDays} days until your next period. PMS symptoms may appear – take time for yourself.`,
          fa: `${nextPeriodDays} روز تا پریود بعدی. ممکن است علائم PMS ظاهر شوند – برای خودت وقت بگذار.`,
        };
      } else {
        statusTitle = { de: "Lutealphase", en: "Luteal Phase", fa: "فاز لوتئال" };
        statusMessage = {
          de: "Dein Körper bereitet sich vor. Gut hydriert bleiben und auf Magnesium achten. 💧",
          en: "Your body is preparing. Stay hydrated and watch your magnesium intake. 💧",
          fa: "بدنت در حال آماده‌سازی است. هیدراته بمان و به منیزیم توجه کن. 💧",
        };
      }
    } else {
      statusEmoji = "🌒";
      statusTitle = { de: "Follikelphase", en: "Follicular Phase", fa: "فاز فولیکولی" };
      statusMessage = {
        de: "Deine Energie steigt – perfekt für neue Projekte, Sport und soziale Aktivitäten! 💪",
        en: "Your energy is rising – perfect for new projects, sports, and social activities! 💪",
        fa: "انرژی تو در حال افزایش است – عالی برای پروژه‌های جدید، ورزش و فعالیت‌های اجتماعی! 💪",
      };
    }
  }

  // Determine background color based on persona
  let bgColor: string;
  let borderColor: string;
  let accentColor: string;
  if (personaId === 'teen') {
    bgColor = "#ede4f8";
    borderColor = "#d4c4f0";
    accentColor = "#8b6fc7";
  } else if (personaId === 'trying_to_conceive') {
    bgColor = "#ffede3";
    borderColor = "#f4b89a";
    accentColor = "#d48a6a";
  } else if (personaId === 'perimenopause') {
    bgColor = "#e4f0e8";
    borderColor = "#cfe8d5";
    accentColor = "#6a9a7a";
  } else {
    bgColor = theme.primaryLight + "55";
    borderColor = theme.primary;
    accentColor = theme.primaryDark;
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        boxShadow: C.shadow,
      }}
    >
      {/* Top accent bar */}
      <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${borderColor}, ${accentColor}55)` }} />

      <div className="p-5">
        {/* Emoji + Title row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            {statusEmoji}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold" style={{ color: theme.dark }}>
              {t(statusTitle)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: theme.mid }}>
              {locale === "de" ? `Zyklustag ${currentDay} von ${cycleLength}` : locale === "fa" ? `روز ${currentDay} از ${cycleLength}` : `Cycle day ${currentDay} of ${cycleLength}`}
            </p>
          </div>
        </div>

        {/* Status message */}
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: "rgba(255,255,255,0.6)" }}
        >
          <p className="text-sm leading-relaxed" style={{ color: theme.dark }}>
            {t(statusMessage)}
          </p>
        </div>

        {/* Quick stats row */}
        {!pregnancyActive && personaId !== 'perimenopause' && (
          <div className="flex gap-3 flex-wrap">
            {/* Next period */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.7)" }}>
              <span>🩸</span>
              <span style={{ color: theme.mid }}>
                {nextPeriodDays > 0
                  ? (locale === "de" ? `Nächste Periode in ${nextPeriodDays} Tagen` : locale === "fa" ? `پریود بعدی در ${nextPeriodDays} روز` : `Next period in ${nextPeriodDays} days`)
                  : (locale === "de" ? "Periode heute?" : locale === "fa" ? "پریود امروز؟" : "Period today?")}
              </span>
            </div>

            {/* Fertile window - only for adult/TTC */}
            {personaId !== 'teen' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: isFertileWindow ? `${accentColor}22` : "rgba(255,255,255,0.7)" }}>
                <span>❤️</span>
                <span style={{ color: isFertileWindow ? accentColor : theme.muted }}>
                  {isFertileWindow
                    ? (locale === "de" ? "Fruchtbar ✓" : locale === "fa" ? "بارور ✓" : "Fertile ✓")
                    : (locale === "de" ? "Nicht fruchtbar" : locale === "fa" ? "غیر بارور" : "Not fertile")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Perimenopause: symptom prompt */}
        {personaId === 'perimenopause' && (
          <Link
            href="/gesundheit"
            className="block w-full text-center text-sm font-medium py-2.5 rounded-2xl transition-opacity hover:opacity-80 mt-1"
            style={{ background: "rgba(255,255,255,0.7)", color: accentColor, border: `1px solid ${borderColor}` }}
          >
            {locale === "de" ? "📋 Symptome heute erfassen →" : locale === "fa" ? "📋 ثبت علائم امروز ←" : "📋 Log today's symptoms →"}
          </Link>
        )}

        {/* Teen: education link */}
        {personaId === 'teen' && (
          <Link
            href="/heute"
            className="block w-full text-center text-sm font-medium py-2.5 rounded-2xl transition-opacity hover:opacity-80 mt-1"
            style={{ background: "rgba(255,255,255,0.7)", color: accentColor, border: `1px solid ${borderColor}` }}
          >
            {locale === "de" ? "📚 Heutige Lektion entdecken →" : locale === "fa" ? "📚 کشف درس امروز ←" : "📚 Discover today's lesson →"}
          </Link>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  TEEN: Simplified Cycle Summary (compact)                               */
/* ════════════════════════════════════════════════════════════════════════ */

function TeenCycleSummary({ currentDay, cycleLength, periodLength }: { currentDay: number; cycleLength: number; periodLength: number }) {
  const { locale } = useLocale();
  const isPeriodTime = currentDay <= periodLength;
  const daysUntilNext = cycleLength - currentDay + 1;

  return (
    <div className="rounded-3xl p-4 max-w-md mx-auto" style={{ background: C.roseLight + "55", border: `1.5px solid ${C.rose}` }}>
      <p className="text-xs tracking-widest mb-3" style={{ color: C.roseMid }}>
        {locale === "de" ? "MEIN ZYKLUS" : locale === "fa" ? "چرخه من" : "MY CYCLE"}
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: C.roseLight }}>
          {isPeriodTime ? "🩸" : "🌙"}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: C.dark }}>
            {locale === "de" ? `Tag ${currentDay} von ${cycleLength}` : locale === "fa" ? `روز ${currentDay} از ${cycleLength}` : `Day ${currentDay} of ${cycleLength}`}
          </p>
          <p className="text-xs mt-1" style={{ color: C.mid }}>
            {isPeriodTime
              ? (locale === "de" ? `Das ist deine Periode (Tag ${currentDay})` : locale === "fa" ? `این پریود توست (روز ${currentDay})` : `This is your period (Day ${currentDay})`)
              : (locale === "de" ? `Nächste Periode in ~${daysUntilNext} Tagen` : locale === "fa" ? `پریود بعدی در ~${daysUntilNext} روز` : `Next period in ~${daysUntilNext} days`)}
          </p>
        </div>
      </div>

      {/* Simple visual bar */}
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "#f0e0e8" }}>
        <div className="h-full rounded-full" style={{
          width: `${(currentDay / cycleLength) * 100}%`,
          background: isPeriodTime
            ? "linear-gradient(90deg, #f4c7d7, #c47a9a)"
            : "linear-gradient(90deg, #fce4ed, #e8a0b4)",
        }} />
      </div>
      <p className="text-xs mt-1 text-center" style={{ color: C.muted }}>
        {locale === "de" ? "Dein Zyklus-Fortschritt" : locale === "fa" ? "پیشرفت چرخه تو" : "Your cycle progress"}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  MENOPAUSE SYMPTOM SUMMARY                                              */
/* ════════════════════════════════════════════════════════════════════════ */

function MenopauseSymptomSummary() {
  const { locale } = useLocale();
  const symptoms = [
    { emoji: "🔥", de: "Hitzewallungen", en: "Hot flashes", fa: "گرگرفتگی", count: 3 },
    { emoji: "😴", de: "Schlafprobleme", en: "Sleep issues", fa: "مشکلات خواب", count: 1 },
    { emoji: "😰", de: "Stimmungsschwankungen", en: "Mood swings", fa: "نوسانات خلقی", count: 2 },
  ];

  return (
    <div className="rounded-3xl p-4 max-w-md mx-auto" style={{ background: "#f4f8f4", border: `1.5px solid #cfe8d5` }}>
      <p className="text-xs tracking-widest mb-3" style={{ color: "#a0c4a8" }}>
        {locale === "de" ? "SYMPTOME HEUTE" : locale === "fa" ? "علائم امروز" : "TODAY'S SYMPTOMS"}
      </p>
      <div className="flex flex-col gap-2">
        {symptoms.map(s => (
          <div key={s.de} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span>{s.emoji}</span>
              <span className="text-sm" style={{ color: C.mid }}>
                {locale === "de" ? s.de : locale === "fa" ? s.fa : s.en}
              </span>
            </div>
            <span className="text-sm font-medium" style={{ color: C.dark }}>
              {s.count}x {locale === "de" ? "heute" : locale === "fa" ? "امروز" : "today"}
            </span>
          </div>
        ))}
      </div>
      <Link href="/gesundheit" className="block text-center text-xs mt-3 py-2 rounded-2xl" style={{ background: "#cfe8d555", color: "#6a9a7a" }}>
        {locale === "de" ? "Alle Symptome erfassen →" : locale === "fa" ? "ثبت همه علائم ←" : "Log all symptoms →"}
      </Link>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  EDUCATION CARDS (Shown for teens primarily)                            */
/* ════════════════════════════════════════════════════════════════════════ */

function EducationCard({ module, locale }: { module: EducationModule; locale: string }) {
  const loc = locale as 'de' | 'en' | 'fa';
  const tLabel = (obj: { de: string; en: string; fa: string }) => obj[loc] || obj.en;

  return (
    <div className="rounded-3xl p-4 max-w-md mx-auto" style={{ background: "#ede4f8", border: `1.5px solid #d4c4f0` }}>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.7)" }}>
          {module.emoji}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "#2d1f35" }}>
            {tLabel(module.title)}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6b5a7a" }}>
            {tLabel(module.summary)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.7)", color: "#8b6fc7" }}>
          {module.difficulty === 'beginner' 
            ? (locale === "de" ? "Einfach" : locale === "fa" ? "مبتدی" : "Beginner")
            : module.difficulty === 'intermediate'
            ? (locale === "de" ? "Mittel" : locale === "fa" ? "متوسط" : "Intermediate")
            : (locale === "de" ? "Fortgeschritten" : locale === "fa" ? "پیشرفته" : "Advanced")}
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  SUPPLEMENT REMINDER STRIP                                              */
/* ════════════════════════════════════════════════════════════════════════ */

interface ReminderStripProps {
  supplementName: string;
  time: string;
  locale: string;
  theme: ThemeColors;
}

function ReminderStrip({ supplementName, time, locale, theme }: ReminderStripProps) {
  return (
    <div className="rounded-2xl px-4 py-2.5 flex items-center gap-2" style={{ background: theme.surface, border: `1px solid ${theme.primary}` }}>
      <span className="text-lg">⏰</span>
      <p className="text-xs" style={{ color: theme.mid }}>
        {locale === "de" ? "Nächste Erinnerung:" : locale === "fa" ? "یادآوری بعدی:" : "Next reminder:"}
        <strong style={{ color: theme.dark }}> {supplementName}</strong>
        {time ? ` (${time.substring(0, 5)})` : ""}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD PAGE                                                    */
/* ════════════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const { profile, preferences, personalizedTip, theme } = useProfile();
  const [cycleData, setCycleData] = useState<{
    lastPeriodStart: Date;
    cycleLength: number;
    periodLength: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [pregnancyModalOpen, setPregnancyModalOpen] = useState(false);

  // Pregnancy state
  const [pregnancy, setPregnancy] = useState<{
    is_pregnant: boolean;
    last_period_start: string | null;
    due_date: string | null;
  } | null>(null);
  const [pregnancyLoaded, setPregnancyLoaded] = useState(false);
  const [nextReminder, setNextReminder] = useState<{ supplement_name: string; time: string } | null>(null);

  // Persona-aware config
  const lifeStage = profile?.life_stage as LifeStage | null | undefined;
  const personaConfig = getPersonaConfig(lifeStage);
  const heroConfig = DASHBOARD_HERO[personaConfig.id];
  const educationModules = EDUCATION_MODULES[personaConfig.id];
  const dashSections = personaConfig.dashboardSections;

  function loadCycleData() {
    if (!user) {
      setLoading(false);
      return;
    }

    getHomeData().then(({ cycle, pregnancy: preg, nextReminder: reminder }) => {
      if (cycle) {
        setCycleData({
          lastPeriodStart: new Date(cycle.last_period_start),
          cycleLength: cycle.cycle_length,
          periodLength: cycle.period_length,
        });
      }
      setLoading(false);

      if (preg) setPregnancy(preg);
      setPregnancyLoaded(true);

      if (reminder) setNextReminder(reminder);
    });
  }

  useEffect(() => {
    loadCycleData();
  }, [user]);

  function tLabel(label: { de: string; en: string; fa: string }) {
    return label[locale as keyof typeof label] || label.en;
  }

  const menuItems = getMenuItems(lifeStage, locale);
  const firstName = profile?.name || user?.email?.split("@")[0] || "";

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: theme.bg }}>
        <p className="text-sm" style={{ color: theme.muted }}>
          {locale === "de" ? "Lade..." : locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
        </p>
      </main>
    );
  }

  const data = cycleData ?? {
    lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    cycleLength: 28,
    periodLength: 5,
  };

  const start = new Date(data.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = (Math.floor((today.getTime() - start.getTime()) / 86400000) % data.cycleLength) + 1;

  const cycleTitle = locale === "de" ? "DEIN ZYKLUS" : locale === "fa" ? "چرخه تو" : "YOUR CYCLE";
  const menuTitle = locale === "de" ? "MENÜ" : locale === "fa" ? "منو" : "MENU";
  const editCycleTitle = locale === "de" ? "Zyklus bearbeiten" : locale === "fa" ? "ویرایش چرخه" : "Edit cycle";

  // Days until next period
  const daysUntilNextPeriod = (() => {
    if (!cycleData) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(cycleData.lastPeriodStart);
    start.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
    if (diffDays < 0) return -1;
    const daysUntilEnd = cycleData.cycleLength - (diffDays % cycleData.cycleLength);
    return daysUntilEnd;
  })();

  return (
    <main className="min-h-screen" style={{ background: theme.bg }}>
      {/* ═══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className="px-6 pt-10 pb-6 flex flex-col items-center relative" style={{ background: theme.primaryLight + "55", borderBottom: `1.5px solid ${theme.primary}` }}>
        {/* Profil oben links */}
        <Link href="/profile" className="absolute top-10 left-6 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70" style={{ background: theme.primaryMid }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 3 A9 9 0 1 0 13 21 A6 6 0 1 1 13 3 Z" fill="white" />
          </svg>
        </Link>

        {/* Zyklus bearbeiten oben rechts */}
        {dashSections.cycleWheel && (
          <button
            onClick={() => setCycleModalOpen(true)}
            className="absolute top-10 right-20 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ background: theme.primary, color: theme.primaryMid }}
            title={editCycleTitle}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}

        {/* Einstellungen oben rechts */}
        <Link href="/settings" className="absolute top-10 right-6 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70" style={{ background: theme.primary, color: theme.primaryMid }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>

        <LumaLogo size={0.65} />
      </div>

      {/* ═══ CONTENT AREA ═══════════════════════════════════════════════ */}
      <div className="px-5 pt-4 max-w-md mx-auto flex flex-col gap-4">

        {/* ============================================= */}
        {/* 1. CYCLE WHEEL – VISUAL CENTERPIECE           */}
        {/* ============================================= */}
        {dashSections.cycleWheel && (!pregnancy?.is_pregnant) && (
          <div className="rounded-3xl p-5 flex flex-col items-center" style={{ background: theme.primaryLight + "55", border: `1.5px solid ${theme.primary}` }}>
            <p className="text-xs tracking-widest mb-2" style={{ color: theme.primaryMid }}>{cycleTitle}</p>
            <CycleWheel currentDay={currentDay} cycleLength={data.cycleLength} periodLength={data.periodLength} />
          </div>
        )}

        {/* ============================================= */}
        {/* 1b. PREGNANCY BANNER (replaces wheel)         */}
        {/* ============================================= */}
        {dashSections.cycleWheel && pregnancy?.is_pregnant && pregnancy.last_period_start && pregnancy.due_date && (
          <button
            onClick={() => setPregnancyModalOpen(true)}
            className="w-full text-left"
          >
            <PregnancyBanner
              lastPeriodStart={pregnancy.last_period_start}
              dueDate={pregnancy.due_date}
            />
          </button>
        )}

        {/* ============================================= */}
        {/* 2. CYCLE STATUS CARD – Personalized Message   */}
        {/* ============================================= */}
        {dashSections.cycleWheel && (
          <CycleStatusCard
            currentDay={currentDay}
            cycleLength={data.cycleLength}
            periodLength={data.periodLength}
            personaId={personaConfig.id}
            locale={locale}
            theme={theme}
            pregnancyActive={pregnancy?.is_pregnant ?? false}
            nextPeriodDays={daysUntilNextPeriod}
          />
        )}

        {/* ============================================= */}
        {/* 3. WELCOME CARD                                */}
        {/* ============================================= */}
        {dashSections.welcomeCard && (
          <div className="rounded-3xl p-4" style={{ background: theme.primaryLight + "55", border: `1.5px solid ${theme.primary}` }}>
            <p className="text-sm font-medium" style={{ color: theme.dark }}>
              {getWelcomeMessage(lifeStage, firstName, locale)}
            </p>
            {lifeStage && (
              <p className="text-xs mt-1" style={{ color: theme.primaryMid }}>
                {tLabel(LIFE_STAGE_LABELS[lifeStage])}
              </p>
            )}
          </div>
        )}

        {/* ============================================= */}
        {/* 4. PERSONALIZED TIP                            */}
        {/* ============================================= */}
        {dashSections.personalizedTip && personalizedTip.tip && (
          <div className="rounded-2xl p-3 flex items-start gap-2" style={{ background: theme.surface, border: `1.5px solid ${theme.primary}` }}>
            <span className="text-lg shrink-0 mt-0.5">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: theme.mid }}>
              {personalizedTip.tip}
            </p>
          </div>
        )}

        {/* ============================================= */}
        {/* 5. REMINDER STRIP                              */}
        {/* ============================================= */}
        {nextReminder && dashSections.supplements && (
          <ReminderStrip
            supplementName={nextReminder.supplement_name}
            time={nextReminder.time}
            locale={locale}
            theme={theme}
          />
        )}

        {/* ============================================= */}
        {/* 6. TEEN: EDUCATION CARDS                       */}
        {/* ============================================= */}
        {personaConfig.id === 'teen' && educationModules.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-widest" style={{ color: theme.primaryMid }}>
              {locale === "de" ? "📚 LERNE DEINEN KÖRPER KENNEN" : locale === "fa" ? "📚 بدن خودت را بشناس" : "📚 GET TO KNOW YOUR BODY"}
            </p>
            {educationModules.slice(0, 2).map(mod => (
              <EducationCard key={mod.id} module={mod} locale={locale} />
            ))}
          </div>
        )}

        {/* ============================================= */}
        {/* 7. PERIMENOPAUSE: Symptom Summary              */}
        {/* ============================================= */}
        {personaConfig.id === 'perimenopause' && dashSections.menopauseSymptoms && (
          <MenopauseSymptomSummary />
        )}

        {/* ============================================= */}
        {/* 8. PERIOD REMINDER                             */}
        {/* ============================================= */}
        {dashSections.periodReminder && <PeriodReminder />}
      </div>

      {/* ============================================= */}
      {/* 9. ADAPTIVE MENU (always at bottom)            */}
      {/* ============================================= */}
      <div className="px-5 py-6 max-w-md mx-auto">
        <p className="text-xs tracking-widest mb-4" style={{ color: theme.primaryMid }}>
          {personaConfig.id === 'teen'
            ? (locale === "de" ? "WAS MÖCHTEST DU TUN?" : locale === "fa" ? "چی کار می‌خوای بکنی؟" : "WHAT WOULD YOU LIKE TO DO?")
            : menuTitle}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-3xl py-5 px-2 transition-opacity hover:opacity-80"
              style={{ background: theme.primaryLight, border: `1.5px solid ${theme.primary}` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: theme.primaryLight + "55", color: theme.primaryMid }}
              >
                {item.icon}
              </div>
              <p className="text-xs font-medium text-center leading-tight" style={{ color: theme.dark }}>
                {tLabel(item.label)}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs pt-5 pb-4" style={{ color: theme.primaryMid }}>
          {locale === "de" ? "glow with care 🌸" : locale === "fa" ? "درخشش با مراقبت 🌸" : "glow with care 🌸"}
        </p>
      </div>

      {/* Cycle Edit Modal */}
      <CycleEditModal
        open={cycleModalOpen}
        onClose={() => setCycleModalOpen(false)}
        onSaved={() => loadCycleData()}
      />

      {/* Pregnancy Modal */}
      <PregnancyModal
        open={pregnancyModalOpen}
        onClose={() => setPregnancyModalOpen(false)}
        onSaved={() => loadCycleData()}
      />
    </main>
  );
}