"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { getCurrentPhase, getDaysUntilNextPeriod, getNextPeriodDate, formatDate } from "@/lib/cycle";

const cycleData = {
  lastPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  cycleLength: 28,
  periodLength: 5,
};

const notifications = [
  {
    daysBefore: 0,
    emoji: "🌹",
    title: "Heute beginnt ihre Periode",
    body: "Deine Partnerin bekommt heute ihre Periode. Vielleicht braucht sie heute Mitgefühl und Fürsorge 💝",
    color: "bg-rose-50 border-rose-200",
    textColor: "text-rose-600",
  },
  {
    daysBefore: 1,
    emoji: "📅",
    title: "Morgen beginnt ihre Periode",
    body: "Morgen bekommt deine Partnerin ihre Periode. Plane etwas Rücksichtnahme ein 🤗",
    color: "bg-orange-50 border-orange-200",
    textColor: "text-orange-600",
  },
  {
    daysBefore: 2,
    emoji: "💛",
    title: "In 2 Tagen beginnt ihre Periode",
    body: "Ihre Periode kommt bald. Sie könnte etwas gereizter sein — sei einfach verständnisvoll 💕",
    color: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-700",
  },
];

const phaseTips: Record<string, { emoji: string; partnerTip: string; color: string; mood: string }> = {
  Menstruation: {
    emoji: "🌹",
    color: "bg-rose-50 border-rose-100",
    mood: "Braucht Wärme & Ruhe",
    partnerTip: "Eine Wärmflasche, ihre Lieblingsschokolade oder einfach eine große Umarmung — das bedeutet ihr gerade sehr viel 💝",
  },
  Follikelphase: {
    emoji: "🌱",
    color: "bg-pink-50 border-pink-100",
    mood: "Energiegeladen & offen",
    partnerTip: "Sie hat gerade viel Energie! Unternehmt etwas zusammen — sie freut sich über gemeinsame Aktivitäten 🌟",
  },
  Eisprung: {
    emoji: "✨",
    color: "bg-purple-50 border-purple-100",
    mood: "Lebendig & sozial",
    partnerTip: "Sie fühlt sich besonders lebendig. Perfekte Zeit für ein romantisches Date oder etwas Besonderes 💕",
  },
  Lutealphase: {
    emoji: "🌙",
    color: "bg-indigo-50 border-indigo-100",
    mood: "Braucht Verständnis",
    partnerTip: "Sie könnte empfindlicher sein. Sei geduldig und einfach für sie da — das ist mehr wert als du denkst 🤗",
  },
};

export default function PartnerPage() {
  const { code } = useParams<{ code: string }>();
  const [notifStatus, setNotifStatus] = useState<"idle" | "granted" | "denied" | "loading">("idle");
  const [testSent, setTestSent] = useState(false);

  const phase = getCurrentPhase(cycleData);
  const daysUntil = getDaysUntilNextPeriod(cycleData);
  const nextPeriod = getNextPeriodDate(cycleData);
  const tip = phaseTips[phase.name] ?? phaseTips["Lutealphase"];

  const start = new Date(cycleData.lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = (Math.floor((today.getTime() - start.getTime()) / 86400000) % cycleData.cycleLength) + 1;

  // Welche Benachrichtigung ist aktuell relevant?
  const activeNotif = notifications.find((n) => n.daysBefore === daysUntil) ?? null;

  async function enableNotifications() {
    setNotifStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifStatus("granted");
        // Speichere dass dieser Partner Benachrichtigungen aktiviert hat
        localStorage.setItem(`luma-partner-notif-${code}`, "true");
      } else {
        setNotifStatus("denied");
      }
    } catch {
      setNotifStatus("denied");
    }
  }

  function sendTestNotification() {
    if (Notification.permission === "granted") {
      new Notification("🌹 Luma – Partnerinfo", {
        body: "Deine Partnerin bekommt heute ihre Periode. Vielleicht braucht sie heute etwas Mitgefühl und Fürsorge 💝",
        icon: "/favicon.ico",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-5 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">💑</span>
        </div>
        <h1 className="text-xl font-medium text-gray-800">Partner-Ansicht</h1>
        <p className="text-xs text-gray-300 mt-1">Code: {code}</p>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Aktuelle Benachrichtigung falls relevant */}
        {activeNotif && (
          <div className={`rounded-3xl p-5 border ${activeNotif.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{activeNotif.emoji}</span>
              <div>
                <p className={`font-medium text-sm ${activeNotif.textColor}`}>{activeNotif.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{activeNotif.body}</p>
              </div>
            </div>
          </div>
        )}

        {/* Aktuelle Phase */}
        <div className={`rounded-3xl p-5 border ${tip.color}`}>
          <p className="text-xs text-gray-400 mb-1">{tip.emoji} Aktuelle Phase</p>
          <p className="font-medium text-gray-800">{phase.name}</p>
          <div className="inline-block bg-white border border-gray-100 rounded-full px-3 py-0.5 text-xs text-gray-500 mt-2">
            {tip.mood}
          </div>
        </div>

        {/* Infos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            <p className="text-xl mb-1">📅</p>
            <p className="text-xs text-gray-400">Nächste Periode</p>
            <p className="font-medium text-gray-800 text-sm">{formatDate(nextPeriod)}</p>
            <p className="text-xs text-gray-300">in {daysUntil} Tagen</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
            <p className="text-xl mb-1">🔄</p>
            <p className="text-xs text-gray-400">Zyklustag</p>
            <p className="font-medium text-gray-800 text-sm">Tag {currentDay}</p>
            <p className="text-xs text-gray-300">von {cycleData.cycleLength} Tagen</p>
          </div>
        </div>

        {/* Partner Tipp */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-3">💡 Was du tun kannst</p>
          <p className="text-sm text-gray-600 leading-relaxed">{tip.partnerTip}</p>
        </div>

        {/* Benachrichtigungen */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">🔔 Benachrichtigungen</p>
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Erhalte automatisch eine Nachricht wenn ihre Periode beginnt oder kurz bevorsteht.
          </p>

          {/* Vorschau der Benachrichtigungen */}
          <div className="flex flex-col gap-2 mb-4">
            {notifications.map((n) => (
              <div key={n.daysBefore} className="flex items-start gap-3 bg-gray-50 rounded-2xl p-3">
                <span className="text-base">{n.emoji}</span>
                <div>
                  <p className="text-xs font-medium text-gray-600">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                </div>
              </div>
            ))}
          </div>

          {notifStatus === "idle" && (
            <button
              onClick={enableNotifications}
              className="w-full bg-rose-400 text-white font-medium rounded-2xl py-3 text-sm hover:bg-rose-500 transition-colors"
            >
              🔔 Benachrichtigungen aktivieren
            </button>
          )}

          {notifStatus === "loading" && (
            <div className="w-full border border-gray-100 rounded-2xl py-3 text-sm text-gray-400 text-center">
              Wird aktiviert...
            </div>
          )}

          {notifStatus === "granted" && (
            <div className="flex flex-col gap-2">
              <div className="w-full bg-green-50 border border-green-100 rounded-2xl py-3 text-sm text-green-600 text-center font-medium">
                ✓ Benachrichtigungen aktiv
              </div>
              <button
                onClick={sendTestNotification}
                className="w-full border border-rose-100 text-rose-400 font-medium rounded-2xl py-3 text-sm hover:bg-rose-50 transition-colors"
              >
                {testSent ? "✓ Gesendet!" : "Test-Benachrichtigung senden"}
              </button>
            </div>
          )}

          {notifStatus === "denied" && (
            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 text-sm text-gray-400 text-center">
              Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen erlauben.
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 pb-4">Luma – Gemeinsam füreinander da 💕</p>
      </div>
    </main>
  );
}
