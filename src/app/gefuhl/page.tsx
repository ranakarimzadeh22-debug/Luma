"use client";

import { useState } from "react";
import Link from "next/link";

const moods = [
  {
    key: "happy",
    emoji: "😊",
    label: "Glücklich",
    color: "#cfe8d5",
    textColor: "#5a9e72",
    partnerMsg: "Deine Partnerin fühlt sich heute glücklich und gut! 😊 Vielleicht ist heute ein guter Tag für etwas zusammen 🌟",
  },
  {
    key: "sad",
    emoji: "😢",
    label: "Traurig",
    color: "#b799e5",
    textColor: "#7a5a9e",
    partnerMsg: "Deine Partnerin fühlt sich heute etwas traurig 😢 Vielleicht braucht sie gerade eine Umarmung oder einfach jemanden der zuhört 💜",
  },
  {
    key: "tired",
    emoji: "😴",
    label: "Müde",
    color: "#ffd9c7",
    textColor: "#c4845a",
    partnerMsg: "Deine Partnerin ist heute sehr müde 😴 Gönn ihr etwas Ruhe und verwöhn sie ein bisschen 🧡",
  },
  {
    key: "stressed",
    emoji: "😤",
    label: "Gestresst",
    color: "#f4c7d7",
    textColor: "#c47a9a",
    partnerMsg: "Deine Partnerin ist heute gestresst 😤 Ein ruhiger Abend zusammen oder einfach Verständnis kann viel helfen 💕",
  },
  {
    key: "anxious",
    emoji: "😟",
    label: "Ängstlich",
    color: "#ffd9c7",
    textColor: "#c4845a",
    partnerMsg: "Deine Partnerin fühlt sich heute etwas ängstlich 😟 Sei einfach für sie da — das gibt ihr Sicherheit 🤗",
  },
  {
    key: "calm",
    emoji: "😌",
    label: "Entspannt",
    color: "#cfe8d5",
    textColor: "#5a9e72",
    partnerMsg: "Deine Partnerin ist heute entspannt und ausgeglichen 😌 Ein schöner Tag für eine gemeinsame ruhige Zeit 🌿",
  },
  {
    key: "loving",
    emoji: "🥰",
    label: "Verliebt",
    color: "#f4c7d7",
    textColor: "#c47a9a",
    partnerMsg: "Deine Partnerin denkt heute besonders an dich 🥰 Zeig ihr auch, wie viel sie dir bedeutet 💝",
  },
  {
    key: "sick",
    emoji: "🤒",
    label: "Krank",
    color: "#b799e5",
    textColor: "#7a5a9e",
    partnerMsg: "Deine Partnerin ist heute krank 🤒 Bring ihr vielleicht Tee, Suppe oder einfach Fürsorge 💜",
  },
  {
    key: "energetic",
    emoji: "⚡",
    label: "Energievoll",
    color: "#cfe8d5",
    textColor: "#5a9e72",
    partnerMsg: "Deine Partnerin ist heute voller Energie ⚡ Perfekte Zeit für ein gemeinsames Abenteuer! 🌟",
  },
];

function sendPartnerNotification(mood: typeof moods[0]) {
  if (Notification.permission === "granted") {
    new Notification("🌸 Luma – Partnerinfo", {
      body: mood.partnerMsg,
      icon: "/favicon.ico",
    });
  }
}

export default function GefuhlPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  async function enableNotif() {
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
  }

  function selectMood(mood: typeof moods[0]) {
    setSelected(mood.key);
    setSaved(false);
  }

  function save() {
    const mood = moods.find((m) => m.key === selected);
    if (!mood) return;

    // Speichern
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem("luma-moods") ?? "{}";
    const moods_saved = JSON.parse(raw);
    moods_saved[today] = mood.key;
    localStorage.setItem("luma-moods", JSON.stringify(moods_saved));

    // Partner Benachrichtigung
    sendPartnerNotification(mood);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const activeMood = moods.find((m) => m.key === selected);

  return (
    <main className="min-h-screen pb-10" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-5 flex items-center gap-3" style={{ background: "#fff8f2", borderBottom: "1.5px solid #f4c7d7" }}>
        <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "#f4c7d7", color: "#b799e5" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>Dein Gefühl</h1>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5">

        <p className="text-sm leading-relaxed" style={{ color: "#a094a8" }}>
          Wie fühlst du dich heute? Dein Partner bekommt eine sanfte Nachricht.
        </p>

        {/* Mood Grid */}
        <div className="grid grid-cols-3 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.key}
              onClick={() => selectMood(mood)}
              className="flex flex-col items-center gap-2 rounded-3xl py-5 px-2 transition-all"
              style={
                selected === mood.key
                  ? { background: mood.color, border: `1.5px solid ${mood.color}` }
                  : { background: "#fff8f2", border: "1.5px solid #f4e8f8" }
              }
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-xs font-medium" style={{ color: selected === mood.key ? mood.textColor : "#a094a8" }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {/* Partner Nachricht Vorschau */}
        {activeMood && (
          <div className="rounded-3xl p-4" style={{ background: "#fff8f2", border: `1.5px solid ${activeMood.color}` }}>
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>💑 Nachricht an deinen Partner</p>
            <p className="text-xs leading-relaxed" style={{ color: "#3a2d3f" }}>{activeMood.partnerMsg}</p>
          </div>
        )}

        {/* Benachrichtigung aktivieren */}
        {!notifEnabled && (
          <div className="rounded-3xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>🔔 Partner-Benachrichtigungen</p>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "#a094a8" }}>
              Aktiviere Benachrichtigungen damit dein Partner sofort informiert wird.
            </p>
            <button
              onClick={enableNotif}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
              style={{ background: "#b799e5" }}
            >
              🔔 Benachrichtigungen aktivieren
            </button>
          </div>
        )}

        {/* Speichern */}
        <button
          onClick={save}
          disabled={!selected}
          className="w-full text-white font-medium rounded-2xl py-4 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          style={{ background: saved ? "#cfe8d5" : "#b799e5" }}
        >
          {saved ? "✓ Gespeichert & Partner benachrichtigt 💕" : "Heute speichern & Partner informieren"}
        </button>

      </div>
    </main>
  );
}
