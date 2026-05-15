"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNextPeriodDate, getOvulationDate, formatDate } from "@/lib/cycle";

interface UserData {
  lastPeriodStart?: string;
  cycleLength?: number;
  periodLength?: number;
}

const phases = [
  {
    key: "menstruation",
    label: "Menstruation",
    days: (pl: number) => `Tag 1–${pl}`,
    color: "#f4c7d7",
    textColor: "#c47a9a",
    bg: "#fff0f5",
    icon: "🌑",
    tips: [
      "Gönn dir Ruhe und Wärme",
      "Wärmflasche bei Krämpfen",
      "Leichte Dehnübungen helfen",
      "Viel Wasser und Kräutertee",
    ],
    description: "Dein Körper regeneriert sich. Sei sanft mit dir.",
  },
  {
    key: "follikel",
    label: "Follikelphase",
    days: () => "Tag 6–13",
    color: "#cfe8d5",
    textColor: "#5a9e72",
    bg: "#f0faf4",
    icon: "🌒",
    tips: [
      "Energie steigt – perfekt für Sport",
      "Neues ausprobieren & Pläne schmieden",
      "Kreativität ist auf dem Höhepunkt",
      "Proteinreiche Ernährung stärkt dich",
    ],
    description: "Du blühst auf! Nutze deine wachsende Energie.",
  },
  {
    key: "eisprung",
    label: "Eisprung",
    days: () => "Tag 14–16",
    color: "#b799e5",
    textColor: "#7a5a9e",
    bg: "#f5f0ff",
    icon: "🌕",
    tips: [
      "Höchste Fruchtbarkeit",
      "Kommunikation fällt leichter",
      "Soziale Energie ist maximal",
      "Intensiveres Training möglich",
    ],
    description: "Deine stärkste Phase – voller Energie und Ausstrahlung.",
  },
  {
    key: "luteal",
    label: "Lutealphase",
    days: (pl: number, cl: number) => `Tag 17–${cl}`,
    color: "#ffd9c7",
    textColor: "#c4845a",
    bg: "#fff8f2",
    icon: "🌘",
    tips: [
      "Ruhigere Aktivitäten bevorzugen",
      "Auf deinen Körper hören",
      "Magnesium kann PMS lindern",
      "Genug schlafen ist wichtig",
    ],
    description: "Zeit zum Innehalten, Reflektieren und Entspannen.",
  },
];

function getPhaseIndex(dayOfCycle: number, periodLength: number): number {
  if (dayOfCycle <= periodLength) return 0;
  if (dayOfCycle <= 13) return 1;
  if (dayOfCycle <= 16) return 2;
  return 3;
}

function CycleRing({ day, total, phaseIndex }: { day: number; total: number; phaseIndex: number }) {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.min(day / total, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const phaseColors = ["#f4c7d7", "#cfe8d5", "#b799e5", "#ffd9c7"];
  const color = phaseColors[phaseIndex];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={90} cy={90} r={normalizedRadius}
          fill="none" stroke="#f4e8f8" strokeWidth={stroke}
        />
        <circle
          cx={90} cy={90} r={normalizedRadius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-light" style={{ color: "#3a2d3f" }}>{day}</span>
        <span className="text-xs" style={{ color: "#a094a8" }}>von {total} Tagen</span>
      </div>
    </div>
  );
}

function CycleBar({ cycleLength, periodLength, currentDay }: { cycleLength: number; periodLength: number; currentDay: number }) {
  const segments = [
    { label: "M", days: periodLength, color: "#f4c7d7" },
    { label: "F", days: 13 - periodLength, color: "#cfe8d5" },
    { label: "E", days: 3, color: "#b799e5" },
    { label: "L", days: cycleLength - 16, color: "#ffd9c7" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden flex" style={{ height: 36, border: "1.5px solid #f4e8f8" }}>
      {segments.map((seg, i) => {
        const widthPct = (seg.days / cycleLength) * 100;
        return (
          <div
            key={i}
            className="flex items-center justify-center text-xs font-medium relative"
            style={{ width: `${widthPct}%`, background: seg.color, color: "#fff" }}
          >
            {seg.label}
            {currentDay >= (i === 0 ? 1 : segments.slice(0, i).reduce((s, x) => s + x.days, 0) + 1) &&
              currentDay <= segments.slice(0, i + 1).reduce((s, x) => s + x.days, 0) && (
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ background: "#3a2d3f" }}
                />
              )}
          </div>
        );
      })}
    </div>
  );
}

export default function ZyklusPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("luma-user");
    if (raw) setUserData(JSON.parse(raw));
  }, []);

  if (!userData?.lastPeriodStart) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="text-5xl">🌙</div>
          <h1 className="text-xl font-medium" style={{ color: "#3a2d3f" }}>Mein Zyklus</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#a094a8" }}>
            Trage deine Zyklusdaten ein, um deine persönliche Übersicht zu sehen.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 text-sm font-medium rounded-2xl px-6 py-3 hover:opacity-80 transition-opacity text-white"
            style={{ background: "#b799e5" }}
          >
            Zyklus einrichten
          </Link>
          <Link href="/dashboard" className="text-sm" style={{ color: "#b799e5" }}>← Zurück</Link>
        </div>
      </main>
    );
  }

  const cycleLength = userData.cycleLength ?? 28;
  const periodLength = userData.periodLength ?? 5;
  const lastPeriod = new Date(userData.lastPeriodStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastPeriod.setHours(0, 0, 0, 0);
  const rawDay = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = (rawDay % cycleLength) + 1;
  const phaseIndex = getPhaseIndex(currentDay, periodLength);
  const activePhase = selectedPhase !== null ? selectedPhase : phaseIndex;

  const cycleData = { lastPeriodStart: lastPeriod, cycleLength, periodLength };
  const nextPeriod = getNextPeriodDate(cycleData);
  const ovulation = getOvulationDate(cycleData);
  const daysUntilPeriod = Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const phase = phases[activePhase];

  return (
    <main className="min-h-screen pb-10" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-5 flex items-center gap-3" style={{ background: "#fff8f2", borderBottom: "1.5px solid #f4c7d7" }}>
        <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "#f4c7d7", color: "#b799e5" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>Mein Zyklus</h1>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5">

        {/* Cycle Ring + Day */}
        <div className="rounded-3xl p-6 flex flex-col items-center gap-3" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs tracking-widest" style={{ color: "#b799e5" }}>ZYKLUSTAG</p>
          <CycleRing day={currentDay} total={cycleLength} phaseIndex={phaseIndex} />
          <div className="flex items-center gap-2">
            <span className="text-lg">{phases[phaseIndex].icon}</span>
            <span className="text-sm font-medium" style={{ color: "#3a2d3f" }}>{phases[phaseIndex].label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: phases[phaseIndex].color, color: phases[phaseIndex].textColor }}>
              Jetzt
            </span>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
            <p className="text-xs mb-1" style={{ color: "#a094a8" }}>Nächste Periode</p>
            <p className="text-sm font-medium" style={{ color: "#3a2d3f" }}>{formatDate(nextPeriod)}</p>
            <p className="text-xs mt-0.5" style={{ color: "#b799e5" }}>
              {daysUntilPeriod > 0 ? `in ${daysUntilPeriod} Tagen` : "heute"}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs mb-1" style={{ color: "#a094a8" }}>Eisprung</p>
            <p className="text-sm font-medium" style={{ color: "#3a2d3f" }}>{formatDate(ovulation)}</p>
            <p className="text-xs mt-0.5" style={{ color: "#b799e5" }}>fruchtbare Phase</p>
          </div>
        </div>

        {/* Phase selector */}
        <div>
          <p className="text-xs tracking-widest mb-3" style={{ color: "#b799e5" }}>PHASEN</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {phases.map((p, i) => (
              <button
                key={p.key}
                onClick={() => setSelectedPhase(i === activePhase && selectedPhase !== null ? null : i)}
                className="flex flex-col items-center gap-1 rounded-2xl py-3 px-1 text-xs font-medium transition-all"
                style={
                  activePhase === i
                    ? { background: p.color, color: p.textColor, border: `1.5px solid ${p.color}` }
                    : { background: "#fff8f2", color: "#a094a8", border: "1.5px solid #f4e8f8" }
                }
              >
                <span className="text-base">{p.icon}</span>
                <span className="text-center leading-tight" style={{ fontSize: 10 }}>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Phase detail */}
          <div className="rounded-3xl p-5" style={{ background: phase.bg, border: `1.5px solid ${phase.color}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{phase.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#3a2d3f" }}>{phase.label}</p>
                <p className="text-xs" style={{ color: phase.textColor }}>{phase.days(periodLength, cycleLength)}</p>
              </div>
            </div>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "#a094a8" }}>{phase.description}</p>
            <div className="flex flex-col gap-2">
              {phase.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white text-xs" style={{ background: phase.color }}>✓</span>
                  <p className="text-xs leading-relaxed" style={{ color: "#3a2d3f" }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cycle bar */}
        <div>
          <p className="text-xs tracking-widest mb-3" style={{ color: "#b799e5" }}>ZYKLUS-ÜBERSICHT</p>
          <CycleBar cycleLength={cycleLength} periodLength={periodLength} currentDay={currentDay} />
          <div className="flex justify-between mt-2">
            {["M = Menstruation", "F = Follikel", "E = Eisprung", "L = Luteal"].map((l, i) => (
              <span key={i} className="text-xs" style={{ color: "#a094a8", fontSize: 9 }}>{l}</span>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
