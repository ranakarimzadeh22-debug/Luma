"use client";

import { useState, useEffect } from "react";
import { getUserPregnancy, saveUserPregnancy } from "@/lib/actions/pregnancy";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

interface PregnancyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function PregnancyModal({ open, onClose, onSaved }: PregnancyModalProps) {
  const { user } = useAuth();
  const { locale } = useLocale();
  const [isPregnant, setIsPregnant] = useState(false);
  const [lastPeriod, setLastPeriod] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    getUserPregnancy().then((data) => {
      if (data) {
        setIsPregnant(data.is_pregnant ?? false);
        setLastPeriod(data.last_period_start ?? "");
      }
      setLoading(false);
    });
  }, [open, user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const dueDate = lastPeriod
      ? new Date(new Date(lastPeriod).getTime() + 280 * 86400000).toISOString().split("T")[0]
      : null;

    const ok = await saveUserPregnancy({
      isPregnant,
      lastPeriodStart: isPregnant ? lastPeriod : null,
      dueDate: isPregnant ? dueDate : null,
    });

    setSaving(false);

    if (!ok) {
      console.error("Fehler beim Speichern der Schwangerschaftsdaten");
      alert(
        locale === "de"
          ? "Fehler beim Speichern der Schwangerschaftsdaten."
          : locale === "fa"
          ? "خطا در ذخیره اطلاعات بارداری."
          : "Error saving pregnancy data."
      );
      return;
    }

    onSaved();
    onClose();
  }

  const dueDateLocale = locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(58, 45, 63, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-xl"
        style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤰</span>
            <h2 className="text-base font-medium" style={{ color: "#3a2d3f" }}>
              {locale === "de" ? "Schwangerschaft" : locale === "fa" ? "بارداری" : "Pregnancy"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: "#f4c7d7", color: "#b799e5" }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-center py-6" style={{ color: "#a094a8" }}>
            {locale === "de" ? "Lade..." : locale === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Toggle */}
            <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7" }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{isPregnant ? "🤰" : "🌸"}</span>
                <span className="text-sm font-medium" style={{ color: "#3a2d3f" }}>
                  {isPregnant
                    ? locale === "de" ? "Schwangerschaft aktiv" : locale === "fa" ? "بارداری فعال" : "Pregnancy active"
                    : locale === "de" ? "Nicht schwanger" : locale === "fa" ? "باردار نیستم" : "Not pregnant"}
                </span>
              </div>
              <button
                onClick={() => setIsPregnant(!isPregnant)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ background: isPregnant ? "#cfe8d5" : "#f4c7d7" }}
              >
                <div
                  className="w-5 h-5 rounded-full absolute top-0.5 transition-transform shadow-sm"
                  style={{
                    background: "#fff",
                    transform: isPregnant ? "translateX(26px)" : "translateX(2px)",
                  }}
                />
              </button>
            </div>

            {isPregnant && (
              <>
                {/* Last Period */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#b799e5" }}>
                    📅{" "}
                    {locale === "de"
                      ? "Erster Tag der letzten Periode"
                      : locale === "fa"
                      ? "اولین روز آخرین قاعدگی"
                      : "First day of last period"}
                  </label>
                  <input
                    type="date"
                    value={lastPeriod}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setLastPeriod(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
                    required={isPregnant}
                  />
                  {lastPeriod && (
                    <p className="text-xs mt-1.5" style={{ color: "#a094a8" }}>
                      🍼{" "}
                      {locale === "de"
                        ? "Voraussichtlicher Geburtstermin:"
                        : locale === "fa"
                        ? "تاریخ تخمینی زایمان:"
                        : "Estimated due date:"}{" "}
                      {new Date(new Date(lastPeriod).getTime() + 280 * 86400000).toLocaleDateString(dueDateLocale, {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || (isPregnant && !lastPeriod)}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "#b799e5" }}
            >
              {saving
                ? locale === "de" ? "Wird gespeichert..." : locale === "fa" ? "در حال ذخیره..." : "Saving..."
                : locale === "de" ? "Speichern" : locale === "fa" ? "ذخیره" : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}