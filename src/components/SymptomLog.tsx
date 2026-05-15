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
    <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
      <p className="text-xs mb-3" style={{ color: "#b799e5" }}>{t.howAreYou}</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {symptomKeys.map((key) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="flex flex-col items-center gap-1 rounded-2xl p-3 text-xs transition-all"
            style={
              selected.has(key)
                ? { background: "#b799e5", border: "1.5px solid #b799e5", color: "#fff" }
                : { background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#a094a8" }
            }
          >
            <span className="text-lg">{symptomEmojis[key]}</span>
            {t.symptoms[key]}
          </button>
        ))}
      </div>
      <button
        onClick={save}
        className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
        style={{ background: saved ? "#cfe8d5" : "#b799e5" }}
      >
        {saved ? t.saved : t.saveToday}
      </button>
    </div>
  );
}

