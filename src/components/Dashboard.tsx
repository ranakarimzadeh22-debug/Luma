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

const phaseColorMap: Record<string, string> = {
  rose: "bg-rose-100",
  pink: "bg-pink-100",
  purple: "bg-purple-100",
  indigo: "bg-indigo-100",
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

export default function Dashboard() {
  const { t } = useLocale();

  const { key: phaseKey, color: phaseColor } = getCurrentPhaseKey(
    cycleData.lastPeriodStart,
    cycleData.cycleLength,
    cycleData.periodLength
  );
  const phase = t.phases[phaseKey];

  const daysUntil = getDaysUntilNextPeriod(cycleData);
  const nextPeriod = getNextPeriodDate(cycleData);
  const ovulation = getOvulationDate(cycleData);

  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay =
    (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleData.cycleLength) + 1;

  return (
    <main className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-rose-100 text-sm">{t.greeting}</p>
            <h1 className="text-2xl font-bold">{t.appName} 🌸</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur">
              {t.dayOf} {currentDay} / {cycleData.cycleLength}
            </div>
            <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden shadow transition-transform hover:scale-110">
              <AvatarSVG bg="#ffd6e0" skin="#FDDBB4" hair="#3b1f0e" hairStyle="long" />
            </Link>
            <Link href="/settings" className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-lg transition-colors">
              ⚙️
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
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
      </div>

      <div className="px-5 py-6 flex flex-col gap-5 max-w-md mx-auto">
        {/* Phase Card */}
        <div className={`rounded-2xl p-5 ${phaseColorMap[phaseColor] ?? "bg-rose-100"} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-lg">🌺</div>
            <div>
              <p className="text-xs text-gray-500">{t.currentPhase}</p>
              <p className="font-bold text-gray-800">{phase.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label={t.nextPeriod}
            value={formatDate(nextPeriod)}
            sub={t.inDays(daysUntil)}
            emoji="📅"
            bg="bg-white shadow-sm"
          />
          <StatCard
            label={t.ovulation}
            value={formatDate(ovulation)}
            sub={t.estimated}
            emoji="🥚"
            bg="bg-white shadow-sm"
          />
          <StatCard
            label={t.cycleLength}
            value={`${cycleData.cycleLength} ${t.days}`}
            emoji="🔄"
            bg="bg-white shadow-sm"
          />
          <StatCard
            label={t.periodLength}
            value={`${cycleData.periodLength} ${t.days}`}
            emoji="🩸"
            bg="bg-white shadow-sm"
          />
        </div>

        {/* Symptom Log */}
        <SymptomLog />

        {/* Tip */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">{t.tipTitle}</h2>
          <div className="bg-rose-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">{t.tip(phase.name, phase.description)}</p>
          </div>
        </div>

        {/* Partner Link */}
        <PartnerCard />

        <p className="text-center text-xs text-gray-400 pb-4">{t.tagline}</p>
      </div>
    </main>
  );
}
