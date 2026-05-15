"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";

const symptomKeys = ["cramps", "headache", "mood", "bloating", "fatigue", "happy"] as const;
const symptomEmojis: Record<string, string> = {
  cramps: "😣", headache: "🤕", mood: "😤", bloating: "😮‍💨", fatigue: "😴", happy: "😊",
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
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
      <p className="text-xs text-gray-400 mb-3">{t.howAreYou}</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {symptomKeys.map((key) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex flex-col items-center gap-1 rounded-2xl p-3 border text-xs transition-all ${
              selected.has(key)
                ? "border-rose-300 bg-rose-50 text-rose-500 font-medium"
                : "border-gray-100 bg-gray-50 text-gray-400"
            }`}
          >
            <span className="text-lg">{symptomEmojis[key]}</span>
            {t.symptoms[key]}
          </button>
        ))}
      </div>
      <button
        onClick={save}
        className="w-full bg-rose-400 text-white font-medium rounded-2xl py-3 text-sm hover:bg-rose-500 transition-colors"
      >
        {saved ? t.saved : t.saveToday}
      </button>
    </div>
  );
}
