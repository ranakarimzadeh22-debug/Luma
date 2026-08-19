"use client";

import { useEffect, useState } from "react";
import { CycleData } from "@/lib/cycle-calendar";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface DayDetailModalProps {
  date: Date;
  dayInfo: {
    dayOfCycle: number;
    isPeriod: boolean;
    isOvulation: boolean;
    isFertile: boolean;
    phase: string;
    color: string;
    date: Date;
  };
  cycleData: CycleData;
  onClose: () => void;
}

interface DailyHealthData {
  water_liters: number;
}

interface SupplementLogEntry {
  supplement_id: number;
  checked: boolean;
  supplement_name?: string;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPhaseLabel(phase: string): string {
  switch (phase) {
    case "menstruation": return "Menstruation";
    case "follikel": return "Follikelphase";
    case "ovulation": return "Eisprung";
    case "luteal": return "Lutealphase";
    default: return phase;
  }
}

export default function DayDetailModal({ date, dayInfo, cycleData, onClose }: DayDetailModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [waterLiters, setWaterLiters] = useState<number | null>(null);
  const [supplements, setSupplements] = useState<{ name: string; checked: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  const dateKey = formatDateKey(date);
  const isToday = formatDateKey(new Date()) === dateKey;

  const dateFormatted = date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.id;

    async function loadData() {
      try {
        // Load water data
        const { data: healthData } = await supabase
          .from("user_daily_health")
          .select("water_liters")
          .eq("user_id", uid)
          .eq("date", dateKey)
          .maybeSingle();

        if (healthData) {
          setWaterLiters(healthData.water_liters ?? 0);
        } else {
          setWaterLiters(0);
        }

        // Load supplements
        const { data: userSupps } = await supabase
          .from("user_supplements")
          .select("id, name")
          .eq("user_id", uid);

        if (userSupps && userSupps.length > 0) {
          const suppIds = userSupps.map(s => s.id);
          const { data: suppLogs } = await supabase
            .from("user_supplement_log")
            .select("supplement_id, checked")
            .eq("user_id", uid)
            .eq("date", dateKey)
            .in("supplement_id", suppIds);

          const checkedMap = new Map<number, boolean>();
          if (suppLogs) {
            suppLogs.forEach(log => checkedMap.set(log.supplement_id, log.checked));
          }

          const suppsWithStatus = userSupps.map(s => ({
            name: s.name,
            checked: checkedMap.get(s.id) ?? false,
          }));
          setSupplements(suppsWithStatus);
        } else {
          setSupplements([]);
        }
      } catch (err) {
        console.error("DayDetailModal load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, dateKey]);

  if (dayInfo.dayOfCycle <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="w-full max-w-sm rounded-3xl p-6 relative" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#f4e8f8", color: "#b799e5" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3.5 h-3.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <p className="text-lg font-medium mb-1" style={{ color: "#3a2d3f" }}>{dateFormatted}</p>
          <p className="text-sm" style={{ color: "#a094a8" }}>Vor Zyklusbeginn – Keine Zyklusdaten verfügbar.</p>
        </div>
      </div>
    );
  }

  const waterPercentage = cycleData ? Math.min(100, ((waterLiters ?? 0) / 2.0) * 100) : 0;
  const checkedCount = supplements.filter(s => s.checked).length;
  const totalSupps = supplements.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6 relative" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "#f4e8f8", color: "#b799e5" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3.5 h-3.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Date + Phase badge */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-lg font-medium" style={{ color: "#3a2d3f" }}>{dateFormatted}</p>
            {isToday && <p className="text-xs mt-0.5" style={{ color: "#b799e5" }}>Heute</p>}
          </div>
          <div
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: dayInfo.color, color: "#3a2d3f" }}
          >
            {getPhaseLabel(dayInfo.phase)}
          </div>
        </div>

        {/* Cycle day */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: "#f4e8f8" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#a094a8" }}>Zyklustag</span>
            <span className="text-sm font-medium" style={{ color: "#3a2d3f" }}>
              Tag {dayInfo.dayOfCycle} von {cycleData.cycleLength}
            </span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#f0faf4" }}>
            <span className="text-sm" style={{ color: "#a094a8" }}>Periode</span>
            <span className="text-sm font-medium" style={{ color: dayInfo.isPeriod ? "#c47a9a" : "#5a9e72" }}>
              {dayInfo.isPeriod ? "✅ Ja" : "— Nein"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#f5f0ff" }}>
            <span className="text-sm" style={{ color: "#a094a8" }}>Eisprung</span>
            <span className="text-sm font-medium" style={{ color: dayInfo.isOvulation ? "#7a5a9e" : "#a094a8" }}>
              {dayInfo.isOvulation ? "✅ Ja" : "— Nein"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#fff8f2" }}>
            <span className="text-sm" style={{ color: "#a094a8" }}>Fruchtbare Phase</span>
            <span className="text-sm font-medium" style={{ color: dayInfo.isFertile ? "#c4845a" : "#a094a8" }}>
              {dayInfo.isFertile ? "✅ Ja" : "— Nein"}
            </span>
          </div>
        </div>

        {/* Water status */}
        <div className="rounded-2xl p-4 mb-3" style={{ background: "#f0faf4", border: "1.5px solid #cfe8d5" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "#3a2d3f" }}>
              💧 Wasser
            </span>
            <span className="text-sm" style={{ color: "#5a9e72" }}>
              {waterLiters !== null ? `${waterLiters.toFixed(1)}L` : "—"}
            </span>
          </div>
          {waterLiters !== null && (
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#e0f0e5" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${waterPercentage}%`, background: "#5a9e72" }}
              />
            </div>
          )}
        </div>

        {/* Supplements status */}
        <div className="rounded-2xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #ffd9c7" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "#3a2d3f" }}>
              💊 Supplements
            </span>
            <span className="text-sm" style={{ color: "#c4845a" }}>
              {loading ? "..." : `${checkedCount}/${totalSupps}`}
            </span>
          </div>
          {loading ? (
            <p className="text-xs" style={{ color: "#a094a8" }}>Lade Daten...</p>
          ) : totalSupps === 0 ? (
            <p className="text-xs" style={{ color: "#a094a8" }}>Keine Supplements angelegt</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {supplements.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#3a2d3f" }}>{s.name}</span>
                  <span className="text-xs" style={{ color: s.checked ? "#5a9e72" : "#a094a8" }}>
                    {s.checked ? "✅ genommen" : "❌ nicht genommen"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}