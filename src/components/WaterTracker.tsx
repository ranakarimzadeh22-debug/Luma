"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import {
  getDailyHealth,
  upsertDailyHealth,
  getBodyMetrics,
  calculateWaterGoal,
  getTodayKey,
} from "@/lib/health";

const GLASS_SIZE = 0.25; // 0.25 Liter per Glas

export default function WaterTracker() {
  const { t, isRtl, locale } = useLocale();
  const { user } = useAuth();
  const [liters, setLiters] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [isPregnant, setIsPregnant] = useState(false);

  // Base goal from body metrics
  const baseGoal = calculateWaterGoal(weightKg, heightCm);
  // Pregnancy: +25% (recommended 2.5L instead of 2.0L)
  const dailyGoal = isPregnant ? parseFloat((baseGoal * 1.25).toFixed(2)) : baseGoal;

  // Number of glasses based on goal
  const totalGlasses = Math.round(dailyGoal / GLASS_SIZE);
  const glasses = Math.min(Math.floor(liters / GLASS_SIZE), totalGlasses);
  const progress = dailyGoal > 0 ? Math.min((liters / dailyGoal) * 100, 100) : 0;

  useEffect(() => {
    async function init() {
      if (user) {
        // Load body metrics
        const metrics = await getBodyMetrics(user.id);
        if (metrics) {
          setWeightKg(metrics.weight_kg);
          setHeightCm(metrics.height_cm);
        }

        // Check if pregnant
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { data: pregData } = await supabase
          .from("pregnancies")
          .select("is_pregnant")
          .eq("user_id", user.id)
          .maybeSingle();
        if (pregData?.is_pregnant) {
          setIsPregnant(true);
        }

        // Load today's water intake from DB
        const today = getTodayKey();
        const daily = await getDailyHealth(user.id, today);
        if (daily && daily.water_liters > 0) {
          setLiters(daily.water_liters);
        }
      }

      setLoaded(true);
    }
    init();
  }, [user]);

  function saveWaterLiters(val: number) {
    if (user) {
      const today = getTodayKey();
      upsertDailyHealth(user.id, today, val, {});
    }
  }

  function toggleGlass(index: number) {
    const newGlasses = index + 1; // 1-based
    if (glasses >= newGlasses) {
      // Unfill: reduce to (newGlasses - 1) glasses
      const newVal = Math.max((newGlasses - 1) * GLASS_SIZE, 0);
      setLiters(newVal);
      saveWaterLiters(newVal);
    } else {
      // Fill: increase to newGlasses glasses
      const newVal = Math.min(newGlasses * GLASS_SIZE, dailyGoal);
      setLiters(newVal);
      saveWaterLiters(newVal);
    }
  }

  // Get smart tip based on time of day and progress
  function getTip(): string {
    const hour = new Date().getHours();
    const fullGlasses = Math.floor(liters / GLASS_SIZE);
    const remaining = totalGlasses - fullGlasses;

    if (isPregnant) {
      if (hour < 10) return locale === "de"
        ? "🌅 Guten Morgen! Denke heute an ausreichend Wasser für dich und dein Baby."
        : locale === "fa"
          ? "🌅 صبح بخیر! امروز به آب کافی برای خودت و نوزادت فکر کن."
          : "🌅 Good morning! Remember enough water for you and your baby.";
      if (hour < 15) return locale === "de"
        ? `☀️ Du hast bereits ${fullGlasses} ${fullGlasses === 1 ? "Glas" : "Gläser"} geschafft. Weiter so!`
        : locale === "fa"
          ? `☀️ قبلاً ${fullGlasses} ${fullGlasses === 1 ? "لیوان" : "لیوان"} نوشیده‌ای. ادامه بده!`
          : `☀️ You've already had ${fullGlasses} glasses. Keep it up!`;
      return locale === "de"
        ? remaining > 0
          ? `🌙 Noch ${remaining} ${remaining === 1 ? "Glas" : "Gläser"} bis zum Ziel für dich und dein Baby.`
          : "🌙 Ziel erreicht! Gut gemacht für dich und dein Baby 💕"
        : locale === "fa"
          ? remaining > 0
            ? `🌙 هنوز ${remaining} ${remaining === 1 ? "لیوان" : "لیوان"} تا هدف برای خودت و نوزادت باقی مانده.`
            : "🌙 به هدف رسیدی! آفرین برای خودت و نوزادت 💕"
          : remaining > 0
            ? `🌙 ${remaining} more ${remaining === 1 ? "glass" : "glasses"} until your goal for you and your baby.`
            : "🌙 Goal reached! Well done for you and your baby 💕";
    }

    // Non-pregnant tips
    if (hour < 10) return locale === "de"
      ? "🌅 Starte den Tag mit einem Glas Wasser."
      : locale === "fa"
        ? "🌅 روز را با یک لیوان آب شروع کن."
        : "🌅 Start the day with a glass of water.";
    if (hour < 15) return locale === "de"
      ? `☀️ Du hast bereits ${fullGlasses} ${fullGlasses === 1 ? "Glas" : "Gläser"} geschafft.`
      : locale === "fa"
        ? `☀️ قبلاً ${fullGlasses} ${fullGlasses === 1 ? "لیوان" : "لیوان"} نوشیده‌ای.`
        : `☀️ You've already had ${fullGlasses} glasses.`;
    if (progress >= 100) return locale === "de"
      ? "🌙 Ziel erreicht! Großartig! 🎉"
      : locale === "fa"
        ? "🌙 به هدف رسیدی! عالی! 🎉"
        : "🌙 Goal reached! Awesome! 🎉";
    return locale === "de"
      ? `🌙 Noch ${remaining} ${remaining === 1 ? "Glas" : "Gläser"} bis zum Tagesziel.`
      : locale === "fa"
        ? `🌙 هنوز ${remaining} ${remaining === 1 ? "لیوان" : "لیوان"} تا هدف روزانه باقی مانده.`
        : `🌙 ${remaining} more ${remaining === 1 ? "glass" : "glasses"} until your daily goal.`;
  }

  if (!loaded) return null;

  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{ background: "#e6f3fa" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">💧</span>
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#2d4a6f" }}>
            {t.water.title}
          </h2>
          <p className="text-xs opacity-70" style={{ color: "#4a6a8f" }}>
            {t.water.subtitle}
          </p>
        </div>
      </div>

      {/* Pregnancy note */}
      {isPregnant && (
        <div className="mb-3 rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.6)", color: "#b799e5" }}>
          <span>🤰</span>
          <span>
            {locale === "de"
              ? `Empfohlen: ${dailyGoal.toFixed(1)} Liter pro Tag`
              : locale === "fa"
                ? `توصیه شده: ${dailyGoal.toFixed(1)} لیتر در روز`
                : `Recommended: ${dailyGoal.toFixed(1)} liters per day`}
          </span>
        </div>
      )}

      {/* Stats row: percent, liters, glasses */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
            🎯 {Math.round(progress)}%
          </span>
          <span className="text-sm font-medium" style={{ color: "#2d4a6f" }}>
            {liters.toFixed(1)} / {dailyGoal.toFixed(1)}L
          </span>
        </div>
        <span className="text-sm font-medium" style={{ color: "#4a6a8f" }}>
          🥛 {glasses}/{totalGlasses} {locale === "de" ? "Gläser" : locale === "fa" ? "لیوان" : "glasses"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div
          className="w-full rounded-full h-3 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.5)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: progress >= 100
                ? "linear-gradient(90deg, #7bbf8e, #27ae60)"
                : "linear-gradient(90deg, #7dd3fc, #38bdf8)",
            }}
          />
        </div>
      </div>

      {/* Clickable glasses grid */}
      <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
        {Array.from({ length: totalGlasses }, (_, i) => {
          const isFilled = i < glasses;
          return (
            <button
              key={i}
              onClick={() => toggleGlass(i)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-200 active:scale-90"
              style={{
                background: isFilled
                  ? "linear-gradient(135deg, #7dd3fc, #38bdf8)"
                  : "rgba(255,255,255,0.7)",
                border: isFilled
                  ? "2px solid #38bdf8"
                  : "2px dashed #b0d4e8",
                color: isFilled ? "#fff" : "#7a9bb5",
                boxShadow: isFilled ? "0 2px 6px rgba(56,189,248,0.3)" : "none",
              }}
              title={isFilled
                ? (locale === "de" ? "Antippen zum Leeren" : locale === "fa" ? "برای خالی کردن ضربه بزن" : "Tap to empty")
                : (locale === "de" ? "Antippen zum Füllen" : locale === "fa" ? "برای پر کردن ضربه بزن" : "Tap to fill")}
            >
              {isFilled ? "🥛" : "⬜"}
            </button>
          );
        })}
      </div>

      {/* Smart tip */}
      <div
        className="rounded-xl px-3 py-2 text-xs"
        style={{ background: "rgba(255,255,255,0.5)", color: "#4a6a8f" }}
      >
        {getTip()}
      </div>
    </div>
  );
}