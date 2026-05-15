"use client";

import Link from "next/link";
import { AvatarSVG } from "./AvatarPicker";
import { useLocale } from "@/context/LocaleContext";
import CycleRing from "./CycleRing";
import StatCard from "./StatCard";
import SymptomLog from "./SymptomLog";
import PartnerCard from "./PartnerCard";
import { getDaysUntilNextPeriod, getNextPeriodDate, getOvulationDate, formatDate } from "@/lib/cycle";

const cycleData = {
  lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  cycleLength: 28,
  periodLength: 5,
};

function getCurrentPhaseKey(lastPeriodStart: Date, cycleLength: number, periodLength: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const day = (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleLength) + 1;
  if (day <= periodLength) return { key: "menstruation" as const, accent: "#f8d7e6", dot: "#b79bcf" };
  if (day <= 13)           return { key: "follicular"   as const, accent: "#ffd9c7", dot: "#e8a87c" };
  if (day <= 16)           return { key: "ovulation"    as const, accent: "#cdb4db", dot: "#b79bcf" };
  return                          { key: "luteal"       as const, accent: "#cfe8d5", dot: "#7bbf8e" };
}

export default function Dashboard() {
  const { t } = useLocale();
  const { key: phaseKey, accent, dot } = getCurrentPhaseKey(
    cycleData.lastPeriodStart, cycleData.cycleLength, cycleData.periodLength
  );
  const phase = t.phases[phaseKey];
  const daysUntil = getDaysUntilNextPeriod(cycleData);
  const nextPeriod = getNextPeriodDate(cycleData);
  const ovulation = getOvulationDate(cycleData);

  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleData.cycleLength) + 1;

  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-5 border-b" style={{ background: "#fff8f2", borderColor: "#f8d7e6" }}>
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <p className="text-xs tracking-wide" style={{ color: "#b79bcf" }}>{t.greeting}</p>
            <h1 className="text-xl font-medium" style={{ color: "#3a2d3f" }}>{t.appName} 🌸</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs rounded-full px-3 py-1" style={{ background: "#f8d7e6", color: "#b79bcf" }}>
              {t.dayOf} {currentDay}
            </span>
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden" style={{ border: "2px solid #cdb4db" }}>
              <AvatarSVG bg="#cdb4db" skin="#FDDBB4" hair="#3b1f0e" hairStyle="long" />
            </Link>
            <Link href="/settings" className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: "#f8d7e6", color: "#b79bcf" }}>
              ⚙️
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Cycle Ring */}
        <div className="rounded-3xl p-6 flex flex-col items-center" style={{ background: "#fff8f2", border: "1.5px solid #f8d7e6" }}>
          <CycleRing
            daysUntil={daysUntil}
            cycleLength={cycleData.cycleLength}
            currentDay={currentDay}
            phase={phase.name}
            phaseColor="rose"
            labelUntil={t.daysUntil}
            labelExpected={t.periodExpected}
          />
        </div>

        {/* Phase */}
        <div className="rounded-3xl p-5" style={{ background: accent, border: `1.5px solid ${dot}22` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: dot + "33" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: dot }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: dot }}>Aktuelle Phase</p>
              <p className="font-medium text-sm" style={{ color: "#3a2d3f" }}>{phase.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#a094a8" }}>{phase.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t.nextPeriod} value={formatDate(nextPeriod)} sub={t.inDays(daysUntil)} emoji="📅" bg="#fff8f2" border="#f8d7e6" />
          <StatCard label={t.ovulation}  value={formatDate(ovulation)}  sub={t.estimated}          emoji="🥚" bg="#fff8f2" border="#cdb4db" />
          <StatCard label={t.cycleLength}  value={`${cycleData.cycleLength} ${t.days}`}  emoji="🔄" bg="#fff8f2" border="#cfe8d5" />
          <StatCard label={t.periodLength} value={`${cycleData.periodLength} ${t.days}`} emoji="🩸" bg="#fff8f2" border="#ffd9c7" />
        </div>

        {/* Symptom Log */}
        <SymptomLog />

        {/* Tip */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #cdb4db" }}>
          <p className="text-xs mb-2" style={{ color: "#b79bcf" }}>{t.tipTitle}</p>
          <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>{t.tip(phase.name, phase.description)}</p>
        </div>

        {/* Partner */}
        <PartnerCard />

        <p className="text-center text-xs pb-4" style={{ color: "#cdb4db" }}>{t.tagline}</p>
      </div>
    </main>
  );
}
