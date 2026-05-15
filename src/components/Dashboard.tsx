"use client";

import Link from "next/link";
import { AvatarSVG } from "./AvatarPicker";
import { useLocale } from "@/context/LocaleContext";
import CycleRing from "./CycleRing";
import StatCard from "./StatCard";
import SymptomLog from "./SymptomLog";
import PartnerCard from "./PartnerCard";
import {
  getDaysUntilNextPeriod,
  getNextPeriodDate,
  getOvulationDate,
  formatDate,
} from "@/lib/cycle";

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
  if (day <= periodLength) return { key: "menstruation" as const, color: "rose" };
  if (day <= 13) return { key: "follicular" as const, color: "pink" };
  if (day <= 16) return { key: "ovulation" as const, color: "purple" };
  return { key: "luteal" as const, color: "indigo" };
}

const phaseAccent: Record<string, string> = {
  rose: "bg-rose-50 border-rose-100",
  pink: "bg-pink-50 border-pink-100",
  purple: "bg-purple-50 border-purple-100",
  indigo: "bg-indigo-50 border-indigo-100",
};

export default function Dashboard() {
  const { t } = useLocale();
  const { key: phaseKey, color: phaseColor } = getCurrentPhaseKey(
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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <p className="text-gray-400 text-xs tracking-wide">{t.greeting}</p>
            <h1 className="text-xl font-medium text-gray-900">{t.appName} 🌸</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 border border-gray-100 rounded-full px-3 py-1">
              {t.dayOf} {currentDay}
            </span>
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-rose-100">
              <AvatarSVG bg="#ffd6e0" skin="#FDDBB4" hair="#3b1f0e" hairStyle="long" />
            </Link>
            <Link href="/settings" className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-sm hover:bg-rose-50 transition-colors">
              ⚙️
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Cycle Ring */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-sm">
          <CycleRing
            daysUntil={daysUntil}
            cycleLength={cycleData.cycleLength}
            currentDay={currentDay}
            phase={phase.name}
            phaseColor={phaseColor}
            labelUntil={t.daysUntil}
            labelExpected={t.periodExpected}
          />
        </div>

        {/* Phase */}
        <div className={`rounded-3xl p-5 border ${phaseAccent[phaseColor] ?? "bg-rose-50 border-rose-100"}`}>
          <p className="text-xs text-gray-400 mb-1">{t.currentPhase}</p>
          <p className="font-medium text-gray-800">{phase.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{phase.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t.nextPeriod} value={formatDate(nextPeriod)} sub={t.inDays(daysUntil)} emoji="📅" bg="bg-white border border-gray-100 shadow-sm" />
          <StatCard label={t.ovulation} value={formatDate(ovulation)} sub={t.estimated} emoji="🥚" bg="bg-white border border-gray-100 shadow-sm" />
          <StatCard label={t.cycleLength} value={`${cycleData.cycleLength} ${t.days}`} emoji="🔄" bg="bg-white border border-gray-100 shadow-sm" />
          <StatCard label={t.periodLength} value={`${cycleData.periodLength} ${t.days}`} emoji="🩸" bg="bg-white border border-gray-100 shadow-sm" />
        </div>

        {/* Symptom Log */}
        <SymptomLog />

        {/* Tip */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-2">{t.tipTitle}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{t.tip(phase.name, phase.description)}</p>
        </div>

        {/* Partner */}
        <PartnerCard />

        <p className="text-center text-xs text-gray-300 pb-4">{t.tagline}</p>
      </div>
    </main>
  );
}
