"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { getDailyHealth, upsertDailyHealth, getTodayKey } from "@/lib/health";

interface Vitamin {
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


function loadCheckedLocal(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("luma-vitamins");
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    const today = getTodayKey();
    return parsed[today] || {};
  } catch {
    return {};
  }
}

function saveCheckedLocal(checked: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  const today = getTodayKey();
  const existing = localStorage.getItem("luma-vitamins");
  const all: Record<string, Record<string, boolean>> = existing ? JSON.parse(existing) : {};
  all[today] = checked;
  localStorage.setItem("luma-vitamins", JSON.stringify(all));
}

export default function VitaminChecklist({ vitamins }: { vitamins: Vitamin[] }) {
  const { t, isRtl } = useLocale();
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      // Load from DB if user is logged in
      if (user) {
        const today = getTodayKey();
        const daily = await getDailyHealth(user.id, today);
        if (daily && daily.vitamins_checked && Object.keys(daily.vitamins_checked).length > 0) {
          setChecked(daily.vitamins_checked as Record<string, boolean>);
          setLoaded(true);
          return;
        }
      }
      // Fallback to localStorage
      setChecked(loadCheckedLocal());
      setLoaded(true);
    }
    init();
  }, [user]);

  function toggle(name: string) {
    setChecked((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      saveCheckedLocal(next);
      // Save to DB if user is logged in
      if (user) {
        const today = getTodayKey();
        upsertDailyHealth(user.id, today, -1, next); // -1 = don't change water
      }
      return next;
    });
  }

  function resetAll() {
    setChecked({});
    saveCheckedLocal({});
    if (user) {
      const today = getTodayKey();
      upsertDailyHealth(user.id, today, -1, {});
    }
  }

  const total = vitamins.length;
  const done = vitamins.filter((v) => checked[v.name]).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const categories = [...new Set(vitamins.map((n) => n.category))];

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress header */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: "linear-gradient(135deg, #e8d5f5, #d5f5e8)" }}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <h2 className="font-semibold text-base" style={{ color: "#3a2d3f" }}>
              {t.vitamins.title} – To-do
            </h2>
          </div>
          {user && (
            <span className="text-xs" style={{ color: "#7a5a9e" }}>☁️</span>
          )}
          <button
            onClick={resetAll}
            className="text-xs font-medium rounded-xl px-3 py-1.5 transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.7)", color: "#7a5a9e" }}
          >
            {isRtl ? "بازنشانی" : "Zurücksetzen"} ↺
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? "linear-gradient(90deg, #7bbf8e, #27ae60)"
                : "linear-gradient(90deg, #b799e5, #7bbf8e)",
            }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <p className="text-xs font-medium" style={{ color: "#3a2d3f" }}>
            {done}/{total} {isRtl ? "تکمیل" : "erledigt"}
          </p>
          {progress === 100 && (
            <p className="text-xs font-bold animate-pulse" style={{ color: "#27ae60" }}>
              🎉 {isRtl ? "همه تکمیل!" : "Alle erledigt!"}
            </p>
          )}
        </div>
      </div>

      {/* Grouped vitamin checklist */}
      {categories.map((category) => (
        <section key={category}>
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#7a5a9e" }}
          >
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vitamins
              .filter((n) => n.category === category)
              .map((vitamin) => {
                const isChecked = checked[vitamin.name] || false;
                const emoji = nutrientEmojis[vitamin.name] || "💊";
                const bgColor = categoryColors[vitamin.category] || "#f0e6f6";

                return (
                  <label
                    key={vitamin.name}
                    className={`rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all duration-300 ${
                      isChecked ? "ring-2 ring-green-400" : "hover:shadow-md"
                    }`}
                    style={{
                      background: isChecked ? "#e6f7e6" : bgColor,
                      opacity: isChecked ? 0.85 : 1,
                    }}
                  >
                    {/* Checkbox */}
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(vitamin.name)}
                        className="w-5 h-5 rounded-md accent-green-500 cursor-pointer"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        <div>
                          <h4
                            className={`font-semibold text-sm ${
                              isChecked ? "line-through" : ""
                            }`}
                            style={{ color: "#3a2d3f" }}
                          >
                            {vitamin.name}
                          </h4>
                          <p className="text-xs font-medium opacity-70" style={{ color: "#7a5a9e" }}>
                            {vitamin.category}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          isChecked ? "line-through opacity-50" : ""
                        }`}
                        style={{ color: "#4a3d4f" }}
                      >
                        {vitamin.benefit}
                      </p>
                    </div>

                    {/* Dose badge */}
                    <span
                      className={`text-xs font-bold rounded-xl px-2.5 py-1 shrink-0 ${
                        isChecked ? "line-through opacity-50" : ""
                      }`}
                      style={{ background: "rgba(255,255,255,0.6)", color: "#5a3d6f" }}
                    >
                      {vitamin.dose}
                    </span>
                  </label>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}