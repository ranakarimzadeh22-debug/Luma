"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface CycleEditModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function CycleEditModal({ open, onClose, onSaved }: CycleEditModalProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [lastPeriod, setLastPeriod] = useState(new Date().toISOString().split("T")[0]);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    setLoading(true);
    supabase
      .from("user_cycles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setLastPeriod(data.last_period_start ?? new Date().toISOString().split("T")[0]);
          setCycleLength(data.cycle_length ?? 28);
          setPeriodLength(data.period_length ?? 5);
        }
        setLoading(false);
      });
  }, [open, user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from("user_cycles").upsert(
      {
        user_id: user.id,
        last_period_start: lastPeriod,
        cycle_length: cycleLength,
        period_length: periodLength,
      },
      { onConflict: "user_id" }
    );

    setSaving(false);

    if (error) {
      console.error("Fehler beim Speichern der Zyklusdaten:", error);
      alert("Fehler beim Speichern: " + error.message + "\n\nBitte stelle sicher, dass die RLS-Policies in Supabase eingerichtet sind.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
    onClose();
  }

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
            <span className="text-xl">🔄</span>
            <h2 className="text-base font-medium" style={{ color: "#3a2d3f" }}>
              Zyklus bearbeiten
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
            Lade Zyklusdaten...
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Last Period */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#b799e5" }}>
                📅 Erster Tag der letzten Periode
              </label>
              <input
                type="date"
                value={lastPeriod}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
              />
            </div>

            {/* Cycle Length */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#b799e5" }}>
                📏 Zykluslänge: <strong>{cycleLength} Tage</strong>
              </label>
              <input
                type="range"
                min={21}
                max={40}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "#a094a8" }}>
                <span>21 Tage</span>
                <span>40 Tage</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[21, 25, 28, 30, 35].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCycleLength(d)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                    style={
                      cycleLength === d
                        ? { background: "#b799e5", color: "#fff", border: "1px solid #b799e5" }
                        : { background: "#fafafa", color: "#a094a8", border: "1.5px solid #f4c7d7" }
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Length */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#b799e5" }}>
                🩸 Periodendauer: <strong>{periodLength} Tage</strong>
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className="w-full accent-rose-400"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "#a094a8" }}>
                <span>2 Tage</span>
                <span>10 Tage</span>
              </div>
              <div className="flex gap-2 mt-2">
                {[3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPeriodLength(d)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                    style={
                      periodLength === d
                        ? { background: "#b799e5", color: "#fff", border: "1px solid #b799e5" }
                        : { background: "#fafafa", color: "#a094a8", border: "1.5px solid #f4c7d7" }
                    }
                  >
                    {d} Tage
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
              style={{ background: saved ? "#cfe8d5" : "#b799e5" }}
            >
              {saving ? "Wird gespeichert..." : saved ? "✓ Gespeichert" : "Speichern"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}