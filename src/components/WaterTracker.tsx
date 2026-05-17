"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import FlowerBloom from "./FlowerBloom";

const GLASS_SIZE = 0.25; // 0.25 Liter per Glas
const DAILY_GOAL = 2.0; // 2 Liter Ziel

export default function WaterTracker() {
  const { t, isRtl } = useLocale();
  const [liters, setLiters] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luma-water");
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  function addGlass() {
    const newVal = Math.min(liters + GLASS_SIZE, DAILY_GOAL);
    setLiters(newVal);
    localStorage.setItem("luma-water", newVal.toString());
  }

  function resetWater() {
    setLiters(0);
    localStorage.setItem("luma-water", "0");
  }

  const progress = Math.min((liters / DAILY_GOAL) * 100, 100);
  const remaining = Math.max(DAILY_GOAL - liters, 0);
  const glasses = Math.floor(liters / GLASS_SIZE);
  const totalGlasses = Math.floor(DAILY_GOAL / GLASS_SIZE);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{ background: "#e6f3fa" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Flower Bloom */}
      <FlowerBloom glasses={glasses} totalGlasses={totalGlasses} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">💧</span>
        <div>
          <h2 className="font-semibold text-lg" style={{ color: "#2d4a6f" }}>
            {t.water.title}
          </h2>
          <p className="text-xs opacity-70" style={{ color: "#4a6a8f" }}>
            {t.water.subtitle}
          </p>
        </div>
      </div>

      {/* Progress Ring / Bar */}
      <div className="mb-4">
        <div
          className="w-full rounded-full h-5 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.5)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7dd3fc, #38bdf8)",
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>
            {liters.toFixed(2)}
          </p>
          <p className="text-xs opacity-70" style={{ color: "#4a6a8f" }}>
            {t.water.liter}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>
            {glasses}/{totalGlasses}
          </p>
          <p className="text-xs opacity-70" style={{ color: "#4a6a8f" }}>
            {t.water.glass}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: remaining > 0 ? "#e67e22" : "#27ae60" }}>
            {remaining.toFixed(2)}
          </p>
          <p className="text-xs opacity-70" style={{ color: "#4a6a8f" }}>
            {t.water.goal}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={addGlass}
          disabled={liters >= DAILY_GOAL}
          className="flex-1 font-medium rounded-2xl py-3 text-sm tracking-wide transition-all disabled:opacity-40"
          style={{
            background: liters >= DAILY_GOAL ? "#ccc" : "#b799e5",
            color: "#fff",
          }}
        >
          {t.water.refill} ({GLASS_SIZE}l)
        </button>
        <button
          onClick={resetWater}
          className="rounded-2xl py-3 px-5 text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "#f4c7d7", color: "#b799e5" }}
        >
          ↺
        </button>
      </div>

      {/* Tip */}
      <p className="text-xs mt-4 opacity-60" style={{ color: "#4a6a8f" }}>
        {t.water.tip}
      </p>

      {/* Completion message */}
      {liters >= DAILY_GOAL && (
        <p className="text-sm font-medium mt-3 text-center animate-pulse" style={{ color: "#27ae60" }}>
          🎉 Ziel erreicht!
        </p>
      )}
    </div>
  );
}