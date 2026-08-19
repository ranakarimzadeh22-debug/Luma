"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import CycleWheel from "./CycleWheel";
import StatCard from "./StatCard";
import SymptomLog from "./SymptomLog";
import PartnerCard from "./PartnerCard";
import CycleEditModal from "./CycleEditModal";
import { useAuth } from "@/context/AuthContext";
import { getUserCycle } from "@/lib/actions/cycle";
import { getDaysUntilNextPeriod, getNextPeriodDate, getOvulationDate, formatDate } from "@/lib/cycle";
import { getProfile } from "@/lib/profile";
import { avatarList, AvatarSVG } from "./AvatarPicker";

function getCurrentPhaseKey(lastPeriodStart: Date, cycleLength: number, periodLength: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const day = (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleLength) + 1;
  if (day <= periodLength) return { key: "menstruation" as const, accent: "#f4c7d7", dot: "#b799e5" };
  if (day <= 13)           return { key: "follicular"   as const, accent: "#ffd9c7", dot: "#e8a87c" };
  if (day <= 16)           return { key: "ovulation"    as const, accent: "#b799e5", dot: "#b799e5" };
  return                          { key: "luteal"       as const, accent: "#cfe8d5", dot: "#7bbf8e" };
}

const fallbackCycleData = {
  lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  cycleLength: 28,
  periodLength: 5,
};

export default function Dashboard() {
  const { t } = useLocale();
  const { user } = useAuth();

  const [cycleData, setCycleData] = useState(fallbackCycleData);
  const [cycleLoaded, setCycleLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("a1");

  function loadCycleData() {
    if (!user) {
      setCycleLoaded(true);
      return;
    }
    getUserCycle().then((data) => {
      if (data?.last_period_start) {
        setCycleData({
          lastPeriodStart: new Date(data.last_period_start),
          cycleLength: data.cycle_length ?? 28,
          periodLength: data.period_length ?? 5,
        });
      }
      setCycleLoaded(true);
    });
  }

  useEffect(() => {
    loadCycleData();
    if (user) {
      getProfile(user.id).then((p) => {
        if (p) {
          setUserName(p.name || "");
          setUserAvatar(p.avatar || "a1");
        }
      });
    }
  }, [user]);

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
      <div className="px-6 pt-12 pb-5 border-b" style={{ background: "#fff8f2", borderColor: "#f4c7d7" }}>
        <div className="flex justify-between items-center max-w-md mx-auto">
            <div>
              <p className="text-xs tracking-wide" style={{ color: "#b799e5" }}>
                {userName ? `${t.greeting}, ${userName}` : t.greeting}
              </p>
              <h1 className="text-xl font-medium" style={{ color: "#3a2d3f" }}>{t.appName} 🌸</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs rounded-full px-3 py-1" style={{ background: "#f4c7d7", color: "#b799e5" }}>
                {t.dayOf} {currentDay}
              </span>
              <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden" style={{ border: "2px solid #b799e5" }}>
                {(() => { const a = avatarList.find(x => x.id === userAvatar) ?? avatarList[0]; return <AvatarSVG bg={a.bg} skin={a.skin} hair={a.hair} hairStyle={a.hairStyle} top={a.top} />; })()}
              </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
              style={{ background: "#f4c7d7", color: "#b799e5" }}
              title="Zyklus bearbeiten"
            >
              🔄
            </button>
            <Link href="/profile" className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: "#f4c7d7", color: "#b799e5" }}>
              ⚙️
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Cycle Wheel */}
        <div className="rounded-3xl p-6 flex flex-col items-center" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <CycleWheel currentDay={currentDay} cycleLength={cycleData.cycleLength} periodLength={cycleData.periodLength} />
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
          <StatCard label={t.nextPeriod} value={formatDate(nextPeriod)} sub={t.inDays(daysUntil)} emoji="📅" bg="#fff8f2" border="#f4c7d7" />
          <StatCard label={t.ovulation}  value={formatDate(ovulation)}  sub={t.estimated}          emoji="🥚" bg="#fff8f2" border="#b799e5" />
          <StatCard label={t.cycleLength}  value={`${cycleData.cycleLength} ${t.days}`}  emoji="🔄" bg="#fff8f2" border="#cfe8d5" />
          <StatCard label={t.periodLength} value={`${cycleData.periodLength} ${t.days}`} emoji="🩸" bg="#fff8f2" border="#ffd9c7" />
        </div>

        {/* Symptom Log */}
        <SymptomLog />

        {/* Tip */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
          <p className="text-xs mb-2" style={{ color: "#b799e5" }}>{t.tipTitle}</p>
          <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>{t.tip(phase.name, phase.description)}</p>
        </div>

        {/* Partner */}
        <PartnerCard />

        <p className="text-center text-xs pb-4" style={{ color: "#b799e5" }}>{t.tagline}</p>
      </div>

      {/* Cycle Edit Modal */}
      <CycleEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => loadCycleData()}
      />
    </main>
  );
}