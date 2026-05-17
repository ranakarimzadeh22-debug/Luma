"use client";

import { useLocale } from "@/context/LocaleContext";

interface NutrientData {
  name: string;
  benefit: string;
  dose: string;
  category: string;
}

const nutrientEmojis: Record<string, string> = {
  "Folsäure (B9)": "🧬",
  "Folic Acid (B9)": "🧬",
  "اسید فولیک (B9)": "🧬",
  "Vitamin D": "☀️",
  "Vitamin B12": "⚡",
  Eisen: "🩸",
  Iron: "🩸",
  آهن: "🩸",
  "Omega-3": "🐟",
  Magnesium: "💪",
  منیزیم: "💪",
  Kalzium: "🦴",
  Calcium: "🦴",
  کلسیم: "🦴",
  "Vitamin C": "🍊",
};

const categoryColors: Record<string, string> = {
  "Für deinen Zyklus": "#e8d5f5",
  "For your cycle": "#e8d5f5",
  "برای چرخه شما": "#e8d5f5",
  "Für deine Knochen": "#d5e8f5",
  "For your bones": "#d5e8f5",
  "برای استخوان‌های شما": "#d5e8f5",
  "Für deine Energie": "#f5e8d5",
  "For your energy": "#f5e8d5",
  "برای انرژی شما": "#f5e8d5",
  "Für deine Abwehr": "#d5f5e8",
  "For your immunity": "#d5f5e8",
  "برای سیستم ایمنی شما": "#d5f5e8",
};

export default function NutrientCard({ nutrient }: { nutrient: NutrientData }) {
  const { isRtl } = useLocale();
  const emoji = nutrientEmojis[nutrient.name] || "💊";
  const bgColor = categoryColors[nutrient.category] || "#f0e6f6";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: bgColor }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-base" style={{ color: "#3a2d3f" }}>
            {nutrient.name}
          </h3>
          <p className="text-xs font-medium opacity-70" style={{ color: "#7a5a9e" }}>
            {nutrient.category}
          </p>
        </div>
        <span
          className="text-sm font-bold rounded-xl px-3 py-1"
          style={{ background: "rgba(255,255,255,0.6)", color: "#5a3d6f" }}
        >
          {nutrient.dose}
        </span>
      </div>
      <p className="text-sm" style={{ color: "#4a3d4f" }}>
        {nutrient.benefit}
      </p>
    </div>
  );
}