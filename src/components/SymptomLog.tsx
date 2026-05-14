"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";

const symptomKeys = ["cramps", "headache", "mood", "bloating", "fatigue", "happy"] as const;
const symptomEmojis: Record<string, string> = {
  cramps: "😣",
  headache: "🤕",
  mood: "😤",
  bloating: "😮‍💨",
  fatigue: "😴",
  happy: "😊",
};

export default function SymptomLog() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-700 mb-3">{t.howAreYou}</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {symptomKeys.map((key) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex flex-col items-center gap-1 rounded-xl p-3 border-2 text-xs transition-all ${
              selected.has(key)
                ? "border-rose-400 bg-rose-50 text-rose-600 font-semibold"
                : "border-gray-100 bg-gray-50 text-gray-500"
            }`}
          >
            <span className="text-xl">{symptomEmojis[key]}</span>
            {t.symptoms[key]}
          </button>
        ))}
      </div>
      <button
        onClick={save}
        className="w-full bg-rose-400 hover:bg-rose-500 text-white rounded-xl py-2 text-sm font-medium transition-colors"
      >
        {saved ? t.saved : t.saveToday}
      </button>
    </div>
  );
}
