"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import {
  getSupplements,
  getTodaySupplementLogs,
  upsertSupplementLog,
  updateSupplement,
  getTodayKey,
} from "@/lib/health";
import SupplementCalendar from "@/components/SupplementCalendar";
import SupplementHistory from "@/components/SupplementHistory";
import HealthNotificationManager from "@/components/HealthNotificationManager";
import { LIFE_STAGE_LABELS, type LifeStage } from "@/lib/profile";

interface SupplementItem {
  id: string; // "db-{id}"
  dbId: number;
  name: string;
  dose: string;
  time: string;
}

/* ─── Rose Design tokens ──────────────────────────────────────────────── */
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
};

export default function GesundheitPage() {
  const { t, isRtl, locale } = useLocale();
  const { user } = useAuth();

  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  // Load supplements & today's logs from DB
  useEffect(() => {
    if (!user) return;
    const currentUser = user;
    const today = getTodayKey();

    async function load() {
      // Load supplements from user_supplements (single source of truth)
      const dbSupplements = await getSupplements(currentUser.id);
      const items: SupplementItem[] = dbSupplements.map((s) => ({
        id: `db-${s.id}`,
        dbId: s.id!,
        name: s.name,
        dose: s.dose,
        time: s.time,
      }));
      setSupplements(items);

      // Load today's checkmarks from user_supplement_log
      const logs = await getTodaySupplementLogs(currentUser.id, today);
      const checkedMap: Record<string, boolean> = {};
      logs.forEach((log) => {
        checkedMap[`db-${log.supplement_id}`] = log.checked;
      });
      setChecked(checkedMap);

      setLoaded(true);
    }
    load();
  }, [user]);

  async function toggleSupplement(id: string, dbId: number) {
    if (!user) return;
    const newChecked = !checked[id];

    const nextChecked = { ...checked, [id]: newChecked };
    setChecked(nextChecked);

    // Save to user_supplement_log
    const today = getTodayKey();
    await upsertSupplementLog(user.id, dbId, today, newChecked);
  }

  const total = supplements.length;
  const done = supplements.filter((s) => checked[s.id]).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: C.bg }} dir={isRtl ? "rtl" : "ltr"}>
      {/* Hidden notification manager – runs in background */}
      <HealthNotificationManager />

      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: C.roseLight }}>💚</div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: C.dark }}>{t.vitamins.title}</h1>
              <p className="text-xs" style={{ color: C.muted }}>{t.vitamins.subtitle}</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm font-medium rounded-2xl px-4 py-2 hover:opacity-80 transition-opacity" style={{ background: C.rose, color: C.roseDark }}>
            ← Dashboard
          </Link>
        </div>

        {/* ===== TO-DO LIST – Supplements aus user_supplements ===== */}
        <div className="rounded-3xl p-5" style={{ background: C.roseLight + "55", border: `1.5px solid ${C.roseMid}` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💊</span>
            <h2 className="font-semibold text-base" style={{ color: C.dark }}>
              {locale === "de" ? "Heutige Einnahmen" : locale === "fa" ? "داروهای امروز" : "Today's intake"}
            </h2>
          </div>

          {!loaded && <p className="text-xs text-center py-4" style={{ color: C.muted }}>Lade...</p>}

          {/* Progress bar */}
          {loaded && total > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs" style={{ color: C.muted }}>
                  {done}/{total} {locale === "de" ? "erledigt" : locale === "fa" ? "تکمیل" : "done"}
                </p>
                <p className="text-xs font-medium" style={{ color: C.roseMid }}>{Math.round(progress)}%</p>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.rose }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progress === 100 ? C.roseStrong : C.roseMid }} />
              </div>
            </div>
          )}

          {loaded && total === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: C.muted }}>
              {locale === "de"
                ? "Keine Supplements hinterlegt. Bitte im Profil oder Onboarding anlegen."
                : locale === "fa"
                  ? "مکملی ثبت نشده است. لطفاً در پروفایل یا ثبت‌نام ثبت کنید."
                  : "No supplements saved. Please add them in your profile or onboarding."}
            </p>
          ) : loaded ? (
            /* Checkbox list with time picker */
            <div className="flex flex-col gap-2">
              {supplements.map((s) => {
                const isChecked = checked[s.id] || false;
                return (
                  <div key={s.id} className="rounded-2xl p-3 flex items-center gap-2 transition-all"
                    style={{ background: isChecked ? C.roseLight : "#fafafa", border: `1.5px solid ${isChecked ? C.roseStrong : C.rose}` }}>
                    {/* Checkbox */}
                    <input type="checkbox" checked={isChecked} onChange={() => toggleSupplement(s.id, s.dbId)}
                      className="w-5 h-5 rounded-md accent-pink-500 cursor-pointer shrink-0" />
                    {/* Name + Dose */}
                    <div className="flex-1 min-w-0" onClick={() => toggleSupplement(s.id, s.dbId)}>
                      <span className={`text-sm font-medium block ${isChecked ? "line-through opacity-60" : ""}`} style={{ color: C.dark }}>{s.name}</span>
                      {s.dose && (
                        <span className="text-xs" style={{ color: C.muted }}>{s.dose}</span>
                      )}
                    </div>
                    {/* Time picker */}
                    <input
                      type="time"
                      value={s.time || "08:00"}
                      onChange={async (e) => {
                        const newTime = e.target.value;
                        // Optimistic update
                        setSupplements((prev) =>
                          prev.map((item) =>
                            item.id === s.id ? { ...item, time: newTime } : item
                          )
                        );
                        // Save to DB
                        if (user) {
                          await updateSupplement(s.dbId, user.id, s.name, s.dose, newTime);
                        }
                      }}
                      disabled={isChecked}
                      className="text-xs rounded-xl px-2 py-1.5 outline-none shrink-0 cursor-pointer"
                      style={{
                        background: isChecked ? C.roseLight : "#fafafa",
                        border: `1px solid ${isChecked ? C.roseStrong : C.rose}`,
                        color: C.dark,
                        opacity: isChecked ? 0.5 : 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {/* Checkmark */}
                    {isChecked && <span className="text-xs shrink-0" style={{ color: C.roseStrong }}>✅</span>}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* ===== EINNAHME-KALENDER ===== */}
        <section>
          <SupplementCalendar />
        </section>

        {/* ===== SUPPLEMENT HISTORY ===== */}
        <section>
          <SupplementHistory />
        </section>

        {/* ===== INFO ===== */}
        <p className="text-xs text-center opacity-50 mt-2" style={{ color: C.muted }}>
          {locale === "fa"
            ? "این اطلاعات فقط برای راهنمایی است و جایگزین مشاوره پزشکی نیست."
            : "Diese Informationen dienen nur der Orientierung und ersetzen keine ärztliche Beratung."}
        </p>
      </div>
    </main>
  );
}