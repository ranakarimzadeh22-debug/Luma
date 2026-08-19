"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import {
  getSupplements,
  addSupplement as dbAddSupplement,
  deleteSupplement as dbDeleteSupplement,
  getTodaySupplementLogs,
  upsertSupplementLog,
  getTodayKey,
} from "@/lib/health";

interface Supplement {
  id: string;
  dbId?: number; // Supabase DB ID (only when user is logged in)
  name: string;
  dose: string;
  time: string; // HH:MM format
}

function loadSupplementsLocal(): Supplement[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("luma-custom-supplements");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveSupplementsLocal(list: Supplement[]) {
  localStorage.setItem("luma-custom-supplements", JSON.stringify(list));
}

function loadCheckedLocal(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("luma-custom-supplements-checked");
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed[getTodayKey()] || {};
  } catch {
    return {};
  }
}

function saveCheckedLocal(checked: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("luma-custom-supplements-checked");
  const all: Record<string, Record<string, boolean>> = existing ? JSON.parse(existing) : {};
  all[getTodayKey()] = checked;
  localStorage.setItem("luma-custom-supplements-checked", JSON.stringify(all));
}

// Predefined supplement options for quick selection
const SUPPLEMENT_OPTIONS = [
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
];

export default function CustomSupplements() {
  const { locale, isRtl } = useLocale();
  const { user } = useAuth();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

// New supplement form
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newTime, setNewTime] = useState("");
  const [showCustomName, setShowCustomName] = useState(false);

  useEffect(() => {
    async function init() {
      if (user) {
        // Load supplements from DB
        const dbSupplements = await getSupplements(user.id);
        const mapped: Supplement[] = dbSupplements.map((s) => ({
          id: `db-${s.id}`,
          dbId: s.id,
          name: s.name,
          dose: s.dose,
          time: s.time,
        }));

        // Load today's logs from DB
        const today = getTodayKey();
        const logs = await getTodaySupplementLogs(user.id, today);
        const checkedMap: Record<string, boolean> = {};
        logs.forEach((log) => {
          checkedMap[`db-${log.supplement_id}`] = log.checked;
        });

        setSupplements(mapped);
        setChecked(checkedMap);
        setLoaded(true);
        return;
      }

      // Fallback to localStorage
      setSupplements(loadSupplementsLocal());
      setChecked(loadCheckedLocal());
      setLoaded(true);
    }
    init();
  }, [user]);

  async function addSupplement() {
    if (!newName.trim()) return;

    if (user) {
      // Save to DB
      const dbResult = await dbAddSupplement(user.id, newName.trim(), newDose.trim(), newTime);
      if (!dbResult) return;

      const newSup: Supplement = {
        id: `db-${dbResult.id}`,
        dbId: dbResult.id,
        name: dbResult.name,
        dose: dbResult.dose,
        time: dbResult.time,
      };
      const updated = [...supplements, newSup];
      setSupplements(updated);
      saveSupplementsLocal(updated);
    } else {
      // Save to localStorage only
      const newSup: Supplement = {
        id: Date.now().toString(),
        name: newName.trim(),
        dose: newDose.trim(),
        time: newTime,
      };
      const updated = [...supplements, newSup];
      setSupplements(updated);
      saveSupplementsLocal(updated);
    }

    setNewName("");
    setNewDose("");
    setNewTime("");
  }

  async function removeSupplement(id: string) {
    const item = supplements.find((s) => s.id === id);
    if (!item) return;

    if (user && item.dbId) {
      await dbDeleteSupplement(item.dbId, user.id);
    }

    const updated = supplements.filter((s) => s.id !== id);
    setSupplements(updated);
    saveSupplementsLocal(updated);

    // Also remove from checked
    const newChecked = { ...checked };
    delete newChecked[id];
    setChecked(newChecked);
    saveCheckedLocal(newChecked);
  }

  async function toggle(id: string) {
    const item = supplements.find((s) => s.id === id);
    if (!item) return;

    const newChecked = !checked[id];

    setChecked((prev) => {
      const next = { ...prev, [id]: newChecked };
      saveCheckedLocal(next);
      return next;
    });

    // Save to DB if user is logged in
    if (user && item.dbId) {
      const today = getTodayKey();
      await upsertSupplementLog(user.id, item.dbId, today, newChecked);
    }
  }

  async function resetAll() {
    setChecked({});
    saveCheckedLocal({});

    // Reset all DB logs for today
    if (user) {
      const today = getTodayKey();
      for (const s of supplements) {
        if (s.dbId) {
          await upsertSupplementLog(user.id, s.dbId, today, false);
        }
      }
    }
  }

  const total = supplements.length;
  const done = supplements.filter((s) => checked[s.id]).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">💊</span>
        <h2 className="font-semibold text-base" style={{ color: "#3a2d3f" }}>
          {locale === "de" ? "Eigene Supplements" : locale === "fa" ? "مکمل‌های شخصی" : "Custom Supplements"}
        </h2>
      </div>

      {/* Predefined supplement options */}
      <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
        {/* Selection grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPLEMENT_OPTIONS.map((opt) => {
            const isSelected = newName === opt.name;
            return (
              <button
                key={opt.name}
                onClick={() => {
                  if (isSelected) {
                    setNewName("");
                    setNewDose("");
                  } else {
                    setNewName(opt.name);
                    setNewDose(opt.dose);
                    setShowCustomName(false);
                  }
                }}
                className={`text-xs font-medium rounded-xl px-3 py-2.5 text-left transition-all ${
                  isSelected ? "ring-2 ring-green-400 opacity-90" : "hover:shadow-md"
                }`}
                style={{
                  background: isSelected ? "#e6f7e6" : "#fafafa",
                  border: `1.5px solid ${isSelected ? "#7bbf8e" : "#f4c7d7"}`,
                  color: "#3a2d3f",
                }}
              >
                <span className="block">{opt.emoji} {opt.name}</span>
                <span className="block text-[10px] opacity-60 mt-0.5">{opt.dose}</span>
              </button>
            );
          })}

          {/* Custom entry button */}
          <button
            onClick={() => {
              setShowCustomName(true);
              setNewName("");
              setNewDose("");
            }}
            className={`text-xs font-medium rounded-xl px-3 py-2.5 text-left transition-all ${
              showCustomName ? "ring-2 ring-purple-400" : "hover:shadow-md"
            }`}
            style={{
              background: showCustomName ? "#f0e6f6" : "#fafafa",
              border: `1.5px solid ${showCustomName ? "#b799e5" : "#f4c7d7"}`,
              color: "#3a2d3f",
            }}
          >
            <span className="block">✏️ {locale === "de" ? "Eigener Eintrag" : locale === "fa" ? "ورودی شخصی" : "Custom"}</span>
            <span className="block text-[10px] opacity-60 mt-0.5">
              {locale === "de" ? "selbst eingeben" : locale === "fa" ? "خودت بنویس" : "type manually"}
            </span>
          </button>
        </div>

        {/* Custom name/dose inputs (only visible when "Custom" is selected) */}
        {showCustomName && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={locale === "de" ? "Name (z.B. Vitamin C)" : locale === "fa" ? "نام (مثلاً ویتامین C)" : "Name (e.g. Vitamin C)"}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
              autoFocus
            />
            <input
              type="text"
              value={newDose}
              onChange={(e) => setNewDose(e.target.value)}
              placeholder={locale === "de" ? "Dosierung (z.B. 500mg)" : locale === "fa" ? "مقدار (مثلاً ۵۰۰ میلی‌گرم)" : "Dose (e.g. 500mg)"}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
            />
          </div>
        )}

        {/* Dose + Time inputs (shown when a preset is selected) */}
        {!showCustomName && newName && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium shrink-0" style={{ color: "#7a5a9e" }}>
                💊 {locale === "de" ? "Dosis" : locale === "fa" ? "مقدار" : "Dose"}:
              </label>
              <input
                type="text"
                value={newDose}
                onChange={(e) => setNewDose(e.target.value)}
                placeholder={locale === "de" ? "z.B. 300 mg" : locale === "fa" ? "مثلاً ۳۰۰ میلی‌گرم" : "e.g. 300 mg"}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium shrink-0" style={{ color: "#7a5a9e" }}>
                🕐 {locale === "de" ? "Uhrzeit" : locale === "fa" ? "ساعت" : "Time"}:
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
              />
              <span className="text-[10px] shrink-0" style={{ color: "#a094a8" }}>
                ({locale === "de" ? "optional" : locale === "fa" ? "اختیاری" : "optional"})
              </span>
            </div>
          </div>
        )}

        <button
          onClick={addSupplement}
          disabled={!newName.trim()}
          className="w-full text-white font-medium rounded-xl py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ background: "#b799e5" }}
        >
          {locale === "de" ? "+ Supplement hinzufügen" : locale === "fa" ? "+ افزودن مکمل" : "+ Add supplement"}
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "#f0faf4", border: "1.5px solid #cfe8d5" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: "#3a2d3f" }}>
              {done}/{total} {locale === "de" ? "erledigt" : locale === "fa" ? "تکمیل" : "done"}
            </p>
            <button
              onClick={resetAll}
              className="text-xs font-medium rounded-xl px-3 py-1 transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.7)", color: "#5a9e72" }}
            >
              {locale === "de" ? "Zurücksetzen" : locale === "fa" ? "بازنشانی" : "Reset"} ↺
            </button>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "#7bbf8e" : "#cfe8d5",
              }}
            />
          </div>
        </div>
      )}

      {/* Supplement list */}
      {supplements.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: "#a094a8" }}>
          {locale === "de"
            ? "Noch keine eigenen Supplements. Füge oben deine ersten hinzu!"
            : locale === "fa"
            ? "هنوز مکملی اضافه نکردی. اولین مکمل را بالا اضافه کن!"
            : "No custom supplements yet. Add your first one above!"}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {supplements.map((s) => {
            const isChecked = checked[s.id] || false;
            return (
              <div
                key={s.id}
                className="rounded-2xl p-3 flex items-center gap-3 transition-all"
                style={{
                  background: isChecked ? "#e6f7e6" : "#fafafa",
                  border: `1.5px solid ${isChecked ? "#7bbf8e" : "#f4c7d7"}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(s.id)}
                  className="w-5 h-5 rounded-md accent-green-500 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isChecked ? "line-through opacity-60" : ""}`} style={{ color: "#3a2d3f" }}>
                    {s.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {s.dose && (
                      <span className="text-xs" style={{ color: "#a094a8" }}>{s.dose}</span>
                    )}
                    {s.time && (
                      <span className="text-xs" style={{ color: "#b799e5" }}>🕐 {s.time}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSupplement(s.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs hover:opacity-70 transition-opacity shrink-0"
                  style={{ background: "#ffd9c7", color: "#c4845a" }}
                  title={locale === "de" ? "Entfernen" : locale === "fa" ? "حذف" : "Remove"}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}