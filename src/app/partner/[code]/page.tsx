"use client";

import { useParams } from "next/navigation";
import { getCurrentPhase, getDaysUntilNextPeriod, getNextPeriodDate, formatDate } from "@/lib/cycle";

const cycleData = {
  lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  cycleLength: 28,
  periodLength: 5,
};

const phaseTips: Record<string, { emoji: string; partnerTip: string; color: string }> = {
  Menstruation: {
    emoji: "🌹",
    color: "bg-rose-100",
    partnerTip: "Sie braucht jetzt Wärme und Ruhe. Eine Wärmflasche oder ihre Lieblingsschokolade wäre perfekt! 💝",
  },
  Follikelphase: {
    emoji: "🌱",
    color: "bg-pink-100",
    partnerTip: "Sie hat gerade viel Energie! Unternehmt etwas zusammen — sie freut sich über Aktivitäten. 🌟",
  },
  Eisprung: {
    emoji: "✨",
    color: "bg-purple-100",
    partnerTip: "Sie fühlt sich besonders lebendig und sozial. Perfekte Zeit für ein romantisches Date! 💕",
  },
  Lutealphase: {
    emoji: "🌙",
    color: "bg-indigo-100",
    partnerTip: "Sie braucht vielleicht etwas mehr Geduld und Verständnis. Sei einfach für sie da. 🤗",
  },
};

export default function PartnerPage() {
  const { code } = useParams<{ code: string }>();
  const phase = getCurrentPhase(cycleData);
  const daysUntil = getDaysUntilNextPeriod(cycleData);
  const nextPeriod = getNextPeriodDate(cycleData);
  const tip = phaseTips[phase.name] ?? phaseTips["Lutealphase"];

  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleData.cycleLength) + 1;

  return (
    <main className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 px-6 pt-12 pb-10 rounded-b-3xl shadow-md text-center">
        <p className="text-rose-100 text-sm mb-1">Partner-Ansicht</p>
        <h1 className="text-2xl font-bold text-white">Luma 💑</h1>
        <p className="text-rose-100 text-xs mt-2">Code: {code}</p>
      </div>

      <div className="px-5 py-6 flex flex-col gap-5 max-w-md mx-auto">

        {/* Aktuelle Phase */}
        <div className={`rounded-2xl p-5 ${tip.color} shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{tip.emoji}</span>
            <div>
              <p className="text-xs text-gray-500">Aktuelle Phase</p>
              <p className="font-bold text-gray-800 text-lg">{phase.name}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{phase.description}</p>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-2xl mb-1">📅</p>
            <p className="text-xs text-gray-500">Nächste Periode</p>
            <p className="font-bold text-gray-800">{formatDate(nextPeriod)}</p>
            <p className="text-xs text-gray-400">in {daysUntil} Tagen</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-2xl mb-1">🔄</p>
            <p className="text-xs text-gray-500">Zyklustag</p>
            <p className="font-bold text-gray-800">Tag {currentDay}</p>
            <p className="text-xs text-gray-400">von {cycleData.cycleLength} Tagen</p>
          </div>
        </div>

        {/* Partner Tipp */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">💡 Tipp für dich als Partner</h2>
          <div className="bg-rose-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 leading-relaxed">{tip.partnerTip}</p>
          </div>
        </div>

        {/* Mood Skala */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">😊 Wie könnte sie sich fühlen?</h2>
          <div className="flex gap-2 justify-between">
            {[
              { emoji: "😴", label: "Müde" },
              { emoji: "😣", label: "Krämpfe" },
              { emoji: "😊", label: "Gut" },
              { emoji: "⚡", label: "Energisch" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  (phase.name === "Menstruation" && (m.label === "Müde" || m.label === "Krämpfe")) ||
                  (phase.name === "Follikelphase" && m.label === "Gut") ||
                  (phase.name === "Eisprung" && m.label === "Energisch") ||
                  (phase.name === "Lutealphase" && m.label === "Müde")
                    ? "bg-rose-100 ring-2 ring-rose-300"
                    : "bg-gray-50"
                }`}>
                  {m.emoji}
                </div>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">Luma – Gemeinsam füreinander da 💕</p>
      </div>
    </main>
  );
}
