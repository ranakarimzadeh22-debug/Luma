"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { getCurrentPhase, getDaysUntilNextPeriod, getNextPeriodDate, formatDate } from "@/lib/cycle";

const phaseTips: Record<string, { emoji: string; partnerTip: string; mood: string }> = {
  Menstruation: {
    emoji: "🌹",
    mood: "Braucht Wärme & Ruhe",
    partnerTip: "Eine Wärmflasche, ihre Lieblingsschokolade oder einfach eine große Umarmung — das bedeutet ihr gerade sehr viel 💝",
  },
  Follikelphase: {
    emoji: "🌱",
    mood: "Energiegeladen & offen",
    partnerTip: "Sie hat gerade viel Energie! Unternehmt etwas zusammen — sie freut sich über gemeinsame Aktivitäten 🌟",
  },
  Eisprung: {
    emoji: "✨",
    mood: "Lebendig & sozial",
    partnerTip: "Sie fühlt sich besonders lebendig. Perfekte Zeit für ein romantisches Date oder etwas Besonderes 💕",
  },
  Lutealphase: {
    emoji: "🌙",
    mood: "Braucht Verständnis",
    partnerTip: "Sie könnte empfindlicher sein. Sei geduldig und einfach für sie da — das ist mehr wert als du denkst 🤗",
  },
};

const moodMessages: Record<string, { emoji: string; label: string; msg: string }> = {
  happy:    { emoji: "😊", label: "Glücklich",   msg: "fühlt sich heute glücklich 😊 Ein toller Tag für etwas zusammen!" },
  sad:      { emoji: "😢", label: "Traurig",     msg: "fühlt sich heute etwas traurig 😢 Vielleicht braucht sie eine Umarmung 💜" },
  tired:    { emoji: "😴", label: "Müde",        msg: "ist heute sehr müde 😴 Gönn ihr Ruhe und Fürsorge 🧡" },
  stressed: { emoji: "😤", label: "Gestresst",   msg: "ist heute gestresst 😤 Verständnis und ein ruhiger Abend helfen 💕" },
  anxious:  { emoji: "😟", label: "Ängstlich",   msg: "fühlt sich etwas ängstlich 😟 Einfach für sie da sein gibt Sicherheit 🤗" },
  calm:     { emoji: "😌", label: "Entspannt",   msg: "ist heute entspannt 😌 Eine schöne Zeit für euch zusammen 🌿" },
  loving:   { emoji: "🥰", label: "Verliebt",    msg: "denkt heute besonders an dich 🥰 Zeig ihr auch wie viel sie dir bedeutet 💝" },
  sick:     { emoji: "🤒", label: "Krank",       msg: "ist heute krank 🤒 Bring ihr Tee, Suppe oder einfach Fürsorge 💜" },
  energetic:{ emoji: "⚡", label: "Energievoll", msg: "ist heute voller Energie ⚡ Perfekt für ein gemeinsames Abenteuer! 🌟" },
};

function PartnerContent() {
  const { code } = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const [notifStatus, setNotifStatus] = useState<"idle" | "granted" | "denied" | "loading">("idle");
  const [testSent, setTestSent] = useState(false);

  // Zyklus-Daten aus URL laden
  const cycleData = useMemo(() => {
    const d = searchParams.get("d");
    if (d) {
      try {
        const parsed = JSON.parse(decodeURIComponent(atob(d)));
        return {
          name: parsed.name ?? "deine Partnerin",
          lastPeriodStart: parsed.lastPeriodStart ? new Date(parsed.lastPeriodStart) : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          cycleLength: parsed.cycleLength ?? 28,
          periodLength: parsed.periodLength ?? 5,
        };
      } catch {}
    }
    return {
      name: "deine Partnerin",
      lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      cycleLength: 28,
      periodLength: 5,
    };
  }, [searchParams]);

  // Heutiges Gefühl aus localStorage (wird durch Gefühl-Seite gesetzt)
  const todayMoodKey = typeof window !== "undefined"
    ? (() => {
        const today = new Date().toISOString().split("T")[0];
        const raw = localStorage.getItem("luma-moods") ?? "{}";
        return JSON.parse(raw)[today] ?? null;
      })()
    : null;
  const todayMood = todayMoodKey ? moodMessages[todayMoodKey] : null;

  const phase = getCurrentPhase(cycleData);
  const daysUntil = getDaysUntilNextPeriod(cycleData);
  const nextPeriod = getNextPeriodDate(cycleData);
  const tip = phaseTips[phase.name] ?? phaseTips["Lutealphase"];

  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleData.cycleLength) + 1;

  const phaseColors: Record<string, string> = {
    Menstruation: "#f4c7d7",
    Follikelphase: "#cfe8d5",
    Eisprung: "#b799e5",
    Lutealphase: "#ffd9c7",
  };
  const phaseColor = phaseColors[phase.name] ?? "#f4c7d7";

  async function enableNotifications() {
    setNotifStatus("loading");
    const permission = await Notification.requestPermission();
    setNotifStatus(permission === "granted" ? "granted" : "denied");
    if (permission === "granted") {
      localStorage.setItem(`luma-partner-notif-${code}`, "true");
    }
  }

  function sendTestNotification() {
    if (Notification.permission === "granted") {
      new Notification("🌸 Luma – Partnerinfo", {
        body: `${cycleData.name} bekommt ihre Periode in ${daysUntil} Tagen. Sei einfach für sie da 💕`,
        icon: "/favicon.ico",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  }

  return (
    <main className="min-h-screen pb-10" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-5 text-center" style={{ background: "#fff8f2", borderBottom: "1.5px solid #f4c7d7" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#f4c7d7" }}>
          <span className="text-2xl">💑</span>
        </div>
        <h1 className="text-xl font-medium" style={{ color: "#3a2d3f" }}>Partner-Ansicht</h1>
        <p className="text-xs mt-1" style={{ color: "#a094a8" }}>{cycleData.name}</p>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Heutiges Gefühl */}
        {todayMood && (
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>💌 Heutiges Gefühl</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{todayMood.emoji}</span>
              <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>
                <strong>{cycleData.name}</strong> {todayMood.msg}
              </p>
            </div>
          </div>
        )}

        {/* Aktuelle Phase */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: `1.5px solid ${phaseColor}` }}>
          <p className="text-xs mb-1" style={{ color: "#a094a8" }}>{tip.emoji} Aktuelle Phase</p>
          <p className="font-medium text-sm" style={{ color: "#3a2d3f" }}>{phase.name}</p>
          <span className="inline-block mt-2 text-xs px-3 py-0.5 rounded-full" style={{ background: phaseColor, color: "#fff" }}>
            {tip.mood}
          </span>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
            <p className="text-xl mb-1">📅</p>
            <p className="text-xs" style={{ color: "#a094a8" }}>Nächste Periode</p>
            <p className="font-medium text-sm" style={{ color: "#3a2d3f" }}>{formatDate(nextPeriod)}</p>
            <p className="text-xs mt-0.5" style={{ color: "#b799e5" }}>in {daysUntil} Tagen</p>
          </div>
          <div className="rounded-3xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xl mb-1">🔄</p>
            <p className="text-xs" style={{ color: "#a094a8" }}>Zyklustag</p>
            <p className="font-medium text-sm" style={{ color: "#3a2d3f" }}>Tag {currentDay}</p>
            <p className="text-xs mt-0.5" style={{ color: "#b799e5" }}>von {cycleData.cycleLength} Tagen</p>
          </div>
        </div>

        {/* Partner Tipp */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs mb-3" style={{ color: "#b799e5" }}>💡 Was du tun kannst</p>
          <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>{tip.partnerTip}</p>
        </div>

        {/* Benachrichtigungen */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs mb-1" style={{ color: "#b799e5" }}>🔔 Benachrichtigungen</p>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "#a094a8" }}>
            Erhalte eine Nachricht wenn ihre Periode beginnt oder sie ihr Gefühl teilt.
          </p>

          {notifStatus === "idle" && (
            <button onClick={enableNotifications}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
              style={{ background: "#b799e5" }}>
              🔔 Benachrichtigungen aktivieren
            </button>
          )}
          {notifStatus === "loading" && (
            <div className="w-full rounded-2xl py-3 text-sm text-center" style={{ color: "#a094a8", border: "1.5px solid #f4c7d7" }}>
              Wird aktiviert...
            </div>
          )}
          {notifStatus === "granted" && (
            <div className="flex flex-col gap-2">
              <div className="w-full rounded-2xl py-3 text-sm text-center font-medium" style={{ background: "#cfe8d5", color: "#5a9e72" }}>
                ✓ Benachrichtigungen aktiv
              </div>
              <button onClick={sendTestNotification}
                className="w-full font-medium rounded-2xl py-3 text-sm hover:opacity-80 transition-opacity"
                style={{ border: "1.5px solid #f4c7d7", color: "#b799e5" }}>
                {testSent ? "✓ Gesendet!" : "Test-Benachrichtigung senden"}
              </button>
            </div>
          )}
          {notifStatus === "denied" && (
            <div className="w-full rounded-2xl py-3 text-sm text-center" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#a094a8" }}>
              Bitte in den Browser-Einstellungen erlauben.
            </div>
          )}
        </div>

        <p className="text-center text-xs pb-4" style={{ color: "#b799e5" }}>Luma – Gemeinsam füreinander da 💕</p>
      </div>
    </main>
  );
}

export default function PartnerPage() {
  return (
    <Suspense>
      <PartnerContent />
    </Suspense>
  );
}
