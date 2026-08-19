"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useProfile } from "@/context/ProfileContext";
import { getProfile } from "@/lib/profile";
import { saveOnboarding } from "@/lib/actions/onboarding";
import {
  AVATARS,
  LIFE_STAGE_LABELS,
  GOAL_LABELS,
  INTEREST_LABELS,
  getRecommendedGoals,
  getLifeStageDescription,
  type LifeStage,
  type Goal,
  type Interest,
} from "@/lib/profile-types";
// Alle Vitamine + Supplement-Vorschläge für die Auswahl im Onboarding
const ALL_SUPPLEMENTS = [
  { name: "Folsäure (B9)", dose: "400 µg", emoji: "🧬" },
  { name: "Vitamin D", dose: "1000 IE", emoji: "☀️" },
  { name: "Vitamin B12", dose: "500 µg", emoji: "⚡" },
  { name: "Eisen", dose: "30 mg", emoji: "🩸" },
  { name: "Magnesium", dose: "300 mg", emoji: "💪" },
  { name: "Omega-3", dose: "1000 mg", emoji: "🐟" },
  { name: "Calcium", dose: "500 mg", emoji: "🦴" },
  { name: "Vitamin C", dose: "500 mg", emoji: "🍊" },
  { name: "Zink", dose: "15 mg", emoji: "🛡️" },
  { name: "Vitamin B6", dose: "25 mg", emoji: "🧠" },
  { name: "Selen", dose: "100 µg", emoji: "🌰" },
  { name: "Probiotika", dose: "1 Kapsel", emoji: "🦠" },
  { name: "Vitamin E", dose: "400 IE", emoji: "🌻" },
  { name: "Jod", dose: "150 µg", emoji: "🧂" },
  { name: "Vitamin K2", dose: "100 µg", emoji: "🩻" },
  { name: "Coenzym Q10", dose: "100 mg", emoji: "❤️" },
  { name: "Kollagen", dose: "10 g", emoji: "💎" },
  { name: "Maca", dose: "500 mg", emoji: "🌿" },
  { name: "Ashwagandha", dose: "300 mg", emoji: "🧘" },
  { name: "Mönchspfeffer", dose: "400 mg", emoji: "🌱" },
];

// ============================================
// Theme Colors (Rose Design)
// ============================================
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

// ============================================
// Life Stage Emojis
// ============================================
const LIFE_STAGE_EMOJIS: Record<LifeStage, string> = {
  teen: "🌸",
  young_adult: "🌙",
  adult: "🌺",
  trying_to_conceive: "💕",
  pregnant: "🤰",
  postpartum: "👶",
  perimenopause: "🦋",
  menopause: "🌿",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { locale, t } = useLocale();
  const { refreshProfile } = useProfile();

  // --- Steps ---
  // 0: Welcome / Name
  // 1: Life Stage
  // 2: Goals (based on life stage)
  // 3: Interests
  // 4: Body (weight, height, age)
  // 5: Avatar
  // 6: Last Period
  // 7: Cycle Length
  // 8: Period Length
  // 9: Supplements
  // 10: Done
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    email: "",
    birthYear: "",
    avatar: "🌸",
    weightKg: "",
    heightCm: "",
    lifeStage: "" as LifeStage | "",
    goals: [] as Goal[],
    interests: [] as Interest[],
    takesSupplements: false,
    selectedSupplements: {} as Record<string, string>,
    lastPeriod: new Date().toISOString().split("T")[0],
    cycleLength: 28,
    periodLength: 5,
  });
  const [saving, setSaving] = useState(false);

  const totalSteps = 10;
  const progress = (step / totalSteps) * 100;

  // Get recommended goals based on selected life stage
  const recommendedGoals = data.lifeStage ? getRecommendedGoals(data.lifeStage as LifeStage) : [];

  // Auto-select recommended goals when life stage changes
  useEffect(() => {
    if (data.lifeStage && data.goals.length === 0) {
      setData((prev) => ({ ...prev, goals: recommendedGoals }));
    }
  }, [data.lifeStage]);

  // Load existing profile data
  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    const userEmail = currentUser.email || "";
    async function load() {
      const profile = await getProfile(currentUser.id);
      if (profile) {
        setData((prev) => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || userEmail,
          birthYear: profile.birth_year?.toString() || "",
          avatar: profile.avatar || "🌸",
          lifeStage: (profile.life_stage as LifeStage) || "",
          goals: (profile.goals as Goal[]) || [],
          interests: (profile.interests as Interest[]) || [],
          takesSupplements: profile.takes_supplements || false,
        }));
      }
    }
    load();
  }, [user]);

  const tLabel = (label: { de: string; en: string; fa: string }) => label[locale];

  async function next() {
    if (step === totalSteps) {
      setSaving(true);
      if (user) {
        const ok = await saveOnboarding({
          name: data.name,
          email: data.email,
          birthYear: data.birthYear,
          avatar: data.avatar,
          lifeStage: data.lifeStage,
          goals: data.goals,
          interests: data.interests,
          takesSupplements: data.takesSupplements,
          selectedSupplements: data.selectedSupplements,
          lastPeriod: data.lastPeriod,
          cycleLength: data.cycleLength,
          periodLength: data.periodLength,
          weightKg: data.weightKg,
          heightCm: data.heightCm,
        });
        if (!ok) console.error("saveOnboarding failed");
      }
      setSaving(false);
      await refreshProfile();
      router.push("/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return data.name.trim().length > 0;
      case 1: return data.lifeStage !== "";
      case 2: return data.goals.length > 0;
      default: return true;
    }
  }

  function toggleGoal(goal: Goal) {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  }

  function toggleInterest(interest: Interest) {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  }

  return (
    <main className="min-h-screen" style={{ background: C.bg }}>
      {/* Progress Bar */}
      <div className="w-full h-1.5" style={{ background: C.roseLight }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${C.rose}, ${C.roseMid})` }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-1.5 pt-4 px-6">
        {Array.from({ length: totalSteps + 1 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? "20px" : "6px",
              height: "6px",
              background: i <= step ? C.roseMid : C.border,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-md mx-auto w-full min-h-[70vh]">
        {/* ===== STEP 0: Welcome / Name ===== */}
        {step === 0 && (
          <div className="w-full flex flex-col items-center gap-5">
            <div className="text-6xl">🌸</div>
            <h1 className="text-2xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Willkommen bei Luma!" : locale === "fa" ? "به لوما خوش آمدی!" : "Welcome to Luma!"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Luma hilft dir, deinen Körper zu verstehen und dich rundum wohlzufühlen. Schön, dass du da bist!"
                : locale === "fa"
                ? "لوما به تو کمک می‌کند بدنت را بشناسی و احساس خوبی داشته باشی. خوشحالیم که هستی!"
                : "Luma helps you understand your body and feel your best. So glad you're here!"}
            </p>
            <div className="w-full">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: C.muted }}>
                {locale === "de" ? "Wie heißt du?" : locale === "fa" ? "اسمت چیه؟" : "What's your name?"}
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder={locale === "de" ? "Dein Name" : locale === "fa" ? "اسمت" : "Your name"}
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.dark }}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* ===== STEP 1: Life Stage ===== */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">🌱</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "In welcher Phase bist du?" : locale === "fa" ? "در چه مرحله‌ای هستی؟" : "What phase are you in?"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Wähle die Option, die am besten zu dir passt. Luma wird sich daran anpassen."
                : locale === "fa"
                ? "گزینه‌ای که بیشتر به تو می‌خورد را انتخاب کن. لوما خودش را با تو تطبیق می‌دهد."
                : "Choose the option that fits you best. Luma will adapt to you."}
            </p>

            <div className="w-full flex flex-col gap-2 mt-2">
              {(Object.entries(LIFE_STAGE_LABELS) as [LifeStage, { de: string; en: string; fa: string }][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setData({ ...data, lifeStage: key })}
                  className="w-full text-left rounded-2xl p-4 transition-all hover:scale-[1.02]"
                  style={{
                    background: data.lifeStage === key ? C.roseLight : C.surface,
                    border: `1.5px solid ${data.lifeStage === key ? C.roseMid : C.border}`,
                    boxShadow: data.lifeStage === key ? C.shadowSm : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{LIFE_STAGE_EMOJIS[key]}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: C.dark }}>
                        {tLabel(label)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                        {getLifeStageDescription(key, locale)}
                      </p>
                    </div>
                    {data.lifeStage === key && (
                      <span className="ml-auto text-lg" style={{ color: C.roseMid }}>✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 2: Goals ===== */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">🎯</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Was ist dein Ziel?" : locale === "fa" ? "هدف تو چیست؟" : "What's your goal?"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Wähle aus, was dir wichtig ist. Du kannst mehrere Ziele auswählen."
                : locale === "fa"
                ? "انتخاب کن چه چیزی برایت مهم است. می‌توانی چند هدف انتخاب کنی."
                : "Choose what matters to you. You can select multiple goals."}
            </p>

            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              {(Object.entries(GOAL_LABELS) as [Goal, { de: string; en: string; fa: string }][]).map(([key, label]) => {
                const isSelected = data.goals.includes(key);
                const isRecommended = recommendedGoals.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleGoal(key)}
                    className="rounded-2xl p-3.5 text-left transition-all"
                    style={{
                      background: isSelected ? C.roseLight : C.surface,
                      border: `1.5px solid ${isSelected ? C.roseMid : C.border}`,
                      boxShadow: isSelected ? C.shadowSm : "none",
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: C.dark }}>
                      {tLabel(label)}
                    </p>
                    {isRecommended && !isSelected && (
                      <p className="text-[10px] mt-1" style={{ color: C.roseMid }}>
                        {locale === "de" ? "Empfohlen für dich" : locale === "fa" ? "توصیه شده برای تو" : "Recommended for you"}
                      </p>
                    )}
                    {isSelected && (
                      <p className="text-xs mt-1" style={{ color: C.roseDark }}>✓</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== STEP 3: Interests ===== */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">💫</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Was interessiert dich?" : locale === "fa" ? "به چه چیزی علاقه داری؟" : "What interests you?"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Luma kann dir passende Inhalte zeigen. Wähle deine Interessen."
                : locale === "fa"
                ? "لوما می‌تواند محتوای مناسب به تو نشان دهد. علاقه‌مندی‌هایت را انتخاب کن."
                : "Luma can show you relevant content. Pick your interests."}
            </p>

            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              {(Object.entries(INTEREST_LABELS) as [Interest, { de: string; en: string; fa: string; emoji: string }][]).map(([key, label]) => {
                const isSelected = data.interests.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleInterest(key)}
                    className="rounded-2xl p-3.5 text-left transition-all"
                    style={{
                      background: isSelected ? C.roseLight : C.surface,
                      border: `1.5px solid ${isSelected ? C.roseMid : C.border}`,
                      boxShadow: isSelected ? C.shadowSm : "none",
                    }}
                  >
                    <span className="text-lg">{label.emoji}</span>
                    <p className="text-sm font-medium mt-1" style={{ color: C.dark }}>
                      {tLabel({ de: label.de, en: label.en, fa: label.fa })}
                    </p>
                    {isSelected && (
                      <span className="text-xs" style={{ color: C.roseDark }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== STEP 4: Body ===== */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">📏</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Dein Körper" : locale === "fa" ? "بدن تو" : "Your Body"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Damit Luma deinen Wasserbedarf und Gesundheitsziele berechnen kann. Deine Daten bleiben privat."
                : locale === "fa"
                ? "تا لوما بتواند نیاز آبی و اهداف سلامتی تو را محاسبه کند. اطلاعاتت خصوصی می‌ماند."
                : "So Luma can calculate your water needs and health goals. Your data stays private."}
            </p>
            <div className="w-full flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: C.muted }}>
                  {locale === "de" ? "Gewicht (kg)" : locale === "fa" ? "وزن (کیلوگرم)" : "Weight (kg)"}
                </label>
                <input
                  type="number" value={data.weightKg}
                  onChange={(e) => setData({ ...data, weightKg: e.target.value })}
                  placeholder="z.B. 65"
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.dark }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: C.muted }}>
                  {locale === "de" ? "Größe (cm)" : locale === "fa" ? "قد (سانتی‌متر)" : "Height (cm)"}
                </label>
                <input
                  type="number" value={data.heightCm}
                  onChange={(e) => setData({ ...data, heightCm: e.target.value })}
                  placeholder="z.B. 170"
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.dark }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: C.muted }}>
                  {locale === "de" ? "Dein Alter" : locale === "fa" ? "سن تو" : "Your Age"}
                </label>
                <select
                  value={data.birthYear}
                  onChange={(e) => setData({ ...data, birthYear: e.target.value })}
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.dark }}
                >
                  <option value="">{locale === "de" ? "Bitte wählen" : locale === "fa" ? "لطفاً انتخاب کن" : "Please select"}</option>
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    const age = i;
                    if (age < 13 || age > 60) return null;
                    return <option key={year} value={year}>{year} ({age} {locale === "de" ? "Jahre" : locale === "fa" ? "ساله" : "years"})</option>;
                  })}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 5: Avatar ===== */}
        {step === 5 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">🎨</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Wähl deinen Charakter" : locale === "fa" ? "شخصیتت را انتخاب کن" : "Choose your character"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Welcher Charakter passt zu dir? Du kannst ihn später jederzeit ändern."
                : locale === "fa"
                ? "کدام شخصیت به تو می‌خورد؟ می‌توانی بعداً هم تغییرش بدهی."
                : "Which character fits you? You can change it later anytime."}
            </p>
            <div className="w-full flex flex-wrap gap-3 justify-center">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setData({ ...data, avatar: a.id })}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all"
                  style={{
                    background: data.avatar === a.id ? C.roseLight : C.surface,
                    border: `2px solid ${data.avatar === a.id ? C.roseMid : C.border}`,
                    boxShadow: data.avatar === a.id ? C.shadowSm : "none",
                    transform: data.avatar === a.id ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {a.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 6: Last Period ===== */}
        {step === 6 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">📅</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Wann war deine letzte Periode?" : locale === "fa" ? "آخرین پریودت کی بود؟" : "When was your last period?"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Das ist der erste Tag, an dem du geblutet hast. Du kannst es später ändern."
                : locale === "fa"
                ? "اولین روزی که خونریزی داشتی. می‌توانی بعداً تغییرش بدهی."
                : "The first day you bled. You can change it later."}
            </p>
            <input
              type="date"
              value={data.lastPeriod}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setData({ ...data, lastPeriod: e.target.value })}
              className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
              style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.dark }}
            />
          </div>
        )}

        {/* ===== STEP 7: Cycle Length ===== */}
        {step === 7 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">📏</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Wie lang ist dein Zyklus?" : locale === "fa" ? "چرخه تو چقدر است؟" : "How long is your cycle?"}
            </h1>

            <div className="w-full rounded-2xl p-4" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
              <p className="text-xs mb-2" style={{ color: C.muted }}>
                {locale === "de" ? "Zyklus von" : locale === "fa" ? "چرخه" : "Cycle of"} {data.cycleLength} {locale === "de" ? "Tagen" : locale === "fa" ? "روز" : "days"}
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: data.cycleLength }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium"
                    style={{
                      background: i < data.periodLength ? C.rose : i === data.cycleLength - 14 ? C.roseMid : C.roseLight,
                      color: i < data.periodLength || i === data.cycleLength - 14 ? "#fff" : C.muted,
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <label className="text-xs font-medium mb-2 block" style={{ color: C.muted }}>
                {data.cycleLength} {locale === "de" ? "Tage" : locale === "fa" ? "روز" : "days"}
              </label>
              <input
                type="range" min={21} max={40} value={data.cycleLength}
                onChange={(e) => setData({ ...data, cycleLength: Number(e.target.value) })}
                className="w-full accent-rose-400"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: C.muted }}>
                <span>21</span>
                <span>40</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              {[21, 28, 30, 35].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setData({ ...data, cycleLength: d })}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: data.cycleLength === d ? C.roseMid : C.surface,
                    border: `1.5px solid ${data.cycleLength === d ? C.roseMid : C.border}`,
                    color: data.cycleLength === d ? "#fff" : C.dark,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 8: Period Length ===== */}
        {step === 8 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">🩸</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Wie lang ist deine Periode?" : locale === "fa" ? "پریودت چقدر طول می‌کشد؟" : "How long is your period?"}
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? "Die meisten Frauen haben ihre Periode 3 bis 7 Tage."
                : locale === "fa"
                ? "بیشتر زنان ۳ تا ۷ روز پریود هستند."
                : "Most women have their period for 3 to 7 days."}
            </p>

            <div className="w-full">
              <label className="text-xs font-medium mb-2 block" style={{ color: C.muted }}>
                {data.periodLength} {locale === "de" ? "Tage" : locale === "fa" ? "روز" : "days"}
              </label>
              <input
                type="range" min={2} max={10} value={data.periodLength}
                onChange={(e) => setData({ ...data, periodLength: Number(e.target.value) })}
                className="w-full accent-rose-400"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: C.muted }}>
                <span>2</span>
                <span>10</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              {[3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setData({ ...data, periodLength: d })}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: data.periodLength === d ? C.roseMid : C.surface,
                    border: `1.5px solid ${data.periodLength === d ? C.roseMid : C.border}`,
                    color: data.periodLength === d ? "#fff" : C.dark,
                  }}
                >
                  {d} {locale === "de" ? "Tage" : locale === "fa" ? "روز" : "d"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 9: Supplements ===== */}
        {step === 9 && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-5xl">💊</div>
            <h1 className="text-xl font-bold text-center" style={{ color: C.dark }}>
              {locale === "de" ? "Nimmst du Supplements?" : locale === "fa" ? "مکمل مصرف می‌کنی؟" : "Do you take supplements?"}
            </h1>

            <div className="w-full rounded-2xl p-4" style={{ background: C.surface, border: `1.5px solid ${C.border}` }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.takesSupplements}
                  onChange={(e) => setData({ ...data, takesSupplements: e.target.checked, selectedSupplements: e.target.checked ? data.selectedSupplements : {} })}
                  className="w-5 h-5 rounded accent-pink-500"
                />
                <span className="text-sm" style={{ color: C.dark }}>
                  {locale === "de" ? "Ja, ich nehme Supplements" : locale === "fa" ? "بله، مکمل مصرف می‌کنم" : "Yes, I take supplements"}
                </span>
              </label>
            </div>

            {data.takesSupplements && (
              <>
                <p className="text-xs text-center" style={{ color: C.muted }}>
                  👇 {locale === "de" ? "Wähle aus, was du nimmst:" : locale === "fa" ? "انتخاب کن چه چیزی مصرف می‌کنی:" : "Select what you take:"}
                </p>
                <div className="w-full grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {ALL_SUPPLEMENTS.map((s) => {
                    const isSelected = !!data.selectedSupplements[s.name];
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => {
                          setData((prev) => {
                            const next = { ...prev.selectedSupplements };
                            if (isSelected) delete next[s.name];
                            else next[s.name] = s.dose;
                            return { ...prev, selectedSupplements: next };
                          });
                        }}
                        className="text-xs font-medium rounded-xl px-3 py-2.5 text-left transition-all"
                        style={{
                          background: isSelected ? C.roseLight : C.surface,
                          border: `1.5px solid ${isSelected ? C.roseMid : C.border}`,
                          color: C.dark,
                        }}
                      >
                        <span className="block">{s.emoji} {s.name}</span>
                        <span className="block text-[10px] opacity-60 mt-0.5">{s.dose}</span>
                      </button>
                    );
                  })}
                </div>
                {Object.keys(data.selectedSupplements).length > 0 && (
                  <p className="text-xs font-medium" style={{ color: C.roseMid }}>
                    ✅ {Object.keys(data.selectedSupplements).length} {locale === "de" ? "ausgewählt" : locale === "fa" ? "انتخاب شده" : "selected"}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== STEP 10: Done ===== */}
        {step === 10 && (
          <div className="w-full flex flex-col items-center gap-5 text-center">
            <div className="text-6xl">✨</div>
            <h1 className="text-2xl font-bold" style={{ color: C.dark }}>
              {locale === "de" ? "Super gemacht!" : locale === "fa" ? "آفرین!" : "Well done!"}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: C.mid }}>
              {locale === "de"
                ? `Luma ist bereit für dich, ${data.name}! Wir haben alles für dich eingerichtet.`
                : locale === "fa"
                ? `لوما برای تو آماده است، ${data.name}! ما همه چیز را برایت تنظیم کردیم.`
                : `Luma is ready for you, ${data.name}! We've set everything up.`}
            </p>
            <div className="w-full rounded-2xl p-5" style={{ background: C.roseLight, border: `1.5px solid ${C.rose}` }}>
              <p className="text-lg mb-2">{data.avatar}</p>
              <p className="text-sm font-semibold" style={{ color: C.dark }}>{data.name}</p>
              {data.lifeStage && (
                <p className="text-xs mt-1" style={{ color: C.roseMid }}>
                  {tLabel(LIFE_STAGE_LABELS[data.lifeStage as LifeStage])}
                </p>
              )}
              {data.goals.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {data.goals.slice(0, 3).map((g) => (
                    <span key={g} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.surface, color: C.roseDark }}>
                      {tLabel(GOAL_LABELS[g])}
                    </span>
                  ))}
                  {data.goals.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: C.surface, color: C.muted }}>
                      +{data.goals.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="px-6 pb-10 flex flex-col gap-3 max-w-md mx-auto w-full">
        <button
          onClick={next}
          disabled={saving || !canProceed()}
          className="w-full text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${C.roseMid}, ${C.roseDark})` }}
        >
          {saving
            ? (locale === "de" ? "Wird gespeichert..." : locale === "fa" ? "در حال ذخیره..." : "Saving...")
            : step === 10
            ? (locale === "de" ? "✨ Los geht's!" : locale === "fa" ? "✨ بریم!" : "✨ Let's go!")
            : (locale === "de" ? "Weiter →" : locale === "fa" ? "بعدی →" : "Next →")}
        </button>

        {step > 0 && step < 10 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-full text-sm py-2 transition-opacity hover:opacity-70"
            style={{ color: C.muted }}
          >
            ← {locale === "de" ? "Zurück" : locale === "fa" ? "برگشت" : "Back"}
          </button>
        )}

        {step < 10 && step > 0 && (
          <button
            onClick={() => setStep(10)}
            className="w-full text-xs py-1 transition-opacity hover:opacity-70"
            style={{ color: C.muted }}
          >
            {locale === "de" ? "Überspringen" : locale === "fa" ? "رد کردن" : "Skip"}
          </button>
        )}
      </div>
    </main>
  );
}