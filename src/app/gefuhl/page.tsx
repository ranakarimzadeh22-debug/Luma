"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { avatarList } from "@/components/AvatarPicker";

// Mini Charakter mit verschiedenen Gesichtsausdrücken
function MoodFace({ expression, bg, skin, hair, hairStyle, top, size = 56 }: {
  expression: string; bg: string; skin: string; hair: string; hairStyle: string; top: string; size?: number;
}) {
  const mouth: Record<string, React.ReactNode> = {
    happy:    <path d="M44 57 Q50 64 56 57" stroke="#d4748a" strokeWidth="2" fill="none" strokeLinecap="round" />,
    sad:      <path d="M44 60 Q50 54 56 60" stroke="#7a5a9e" strokeWidth="2" fill="none" strokeLinecap="round" />,
    tired:    <path d="M44 58 Q50 60 56 58" stroke="#c4845a" strokeWidth="1.5" fill="none" strokeLinecap="round" />,
    stressed: <><path d="M44 59 Q50 55 56 59" stroke="#c47a9a" strokeWidth="2" fill="none" strokeLinecap="round" /><line x1="44" y1="63" x2="56" y2="63" stroke="#c47a9a" strokeWidth="1.5" strokeLinecap="round" /></>,
    anxious:  <path d="M45 60 Q50 56 55 60" stroke="#c4845a" strokeWidth="1.5" fill="none" strokeLinecap="round" />,
    calm:     <path d="M44 58 Q50 62 56 58" stroke="#5a9e72" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
    loving:   <><path d="M44 57 Q50 64 56 57" stroke="#d4748a" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M47 52 C47 50 49 49 50 51 C51 49 53 50 53 52 C53 54 50 56 50 56 C50 56 47 54 47 52Z" fill="#f4c7d7" /></>,
    sick:     <path d="M44 60 Q50 57 56 60" stroke="#7a5a9e" strokeWidth="1.5" fill="none" strokeLinecap="round" />,
    energetic:<><path d="M43 57 Q50 64 57 57" stroke="#5a9e72" strokeWidth="2.5" fill="none" strokeLinecap="round" /><circle cx="43" cy="50" r="1.5" fill="#5a9e72" opacity="0.5" /><circle cx="57" cy="50" r="1.5" fill="#5a9e72" opacity="0.5" /></>,
  };

  const eyebrows: Record<string, React.ReactNode> = {
    happy:    null,
    sad:      <><path d="M38 40 Q42 38 46 40" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" /><path d="M54 40 Q58 38 62 40" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" /></>,
    tired:    <><path d="M38 41 Q42 40 46 41" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" /><path d="M54 41 Q58 40 62 41" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" /></>,
    stressed: <><path d="M38 39 Q42 41 46 39" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" /><path d="M54 39 Q58 41 62 39" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" /></>,
    anxious:  <><path d="M39 40 Q42 38 46 39" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" /><path d="M54 39 Q58 38 61 40" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" /></>,
    calm:     null,
    loving:   null,
    sick:     <><path d="M38 41 Q42 40 46 41" stroke="#1a1a2e" strokeWidth="1" fill="none" strokeLinecap="round" /><path d="M54 41 Q58 40 62 41" stroke="#1a1a2e" strokeWidth="1" fill="none" strokeLinecap="round" /></>,
    energetic:null,
  };

  // Augen je nach Stimmung
  const eyesClosed = expression === "tired";
  const eyesHeart  = expression === "loving";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill={bg} />

      {/* Haare */}
      {hairStyle === "long" && <>
        <ellipse cx="50" cy="34" rx="20" ry="22" fill={hair} />
        <rect x="30" y="44" width="7" height="32" rx="3.5" fill={hair} />
        <rect x="63" y="44" width="7" height="32" rx="3.5" fill={hair} />
      </>}
      {hairStyle === "bun" && <>
        <ellipse cx="50" cy="36" rx="20" ry="19" fill={hair} />
        <circle cx="50" cy="16" r="10" fill={hair} />
      </>}
      {hairStyle === "curly" && <>
        <ellipse cx="50" cy="34" rx="22" ry="20" fill={hair} />
        <circle cx="28" cy="38" r="8" fill={hair} />
        <circle cx="72" cy="38" r="8" fill={hair} />
        <circle cx="32" cy="52" r="6" fill={hair} />
        <circle cx="68" cy="52" r="6" fill={hair} />
      </>}
      {hairStyle === "short" && <>
        <ellipse cx="50" cy="34" rx="20" ry="18" fill={hair} />
        <rect x="30" y="42" width="7" height="10" rx="3.5" fill={hair} />
        <rect x="63" y="42" width="7" height="10" rx="3.5" fill={hair} />
      </>}
      {hairStyle === "pixie" && <>
        <ellipse cx="50" cy="32" rx="20" ry="17" fill={hair} />
        <ellipse cx="32" cy="34" rx="5" ry="9" fill={hair} />
        <ellipse cx="68" cy="34" rx="5" ry="9" fill={hair} />
        <ellipse cx="50" cy="18" rx="14" ry="8" fill={hair} />
      </>}

      {/* Hals + Body */}
      <rect x="44" y="60" width="12" height="10" rx="5" fill={skin} />
      <ellipse cx="50" cy="88" rx="20" ry="16" fill={top} />

      {/* Gesicht */}
      <ellipse cx="50" cy="46" rx="18" ry="20" fill={skin} />
      <ellipse cx="31" cy="47" rx="3.5" ry="4.5" fill={skin} />
      <ellipse cx="69" cy="47" rx="3.5" ry="4.5" fill={skin} />

      {/* Wangen */}
      <ellipse cx="37" cy="52" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.4" />
      <ellipse cx="63" cy="52" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.4" />

      {/* Augenbrauen */}
      {eyebrows[expression]}

      {/* Augen */}
      {eyesClosed ? (
        <>
          <path d="M38 45 Q42 48 46 45" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M54 45 Q58 48 62 45" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : eyesHeart ? (
        <>
          <path d="M40 44 C40 41 44 40 42 43 C44 40 46 41 46 44 C46 47 42 50 42 50 C42 50 40 47 40 44Z" fill="#f4c7d7" />
          <path d="M54 44 C54 41 58 40 56 43 C58 40 60 41 60 44 C60 47 56 50 56 50 C56 50 54 47 54 44Z" fill="#f4c7d7" />
        </>
      ) : (
        <>
          <g className="avatar-eye avatar-eye-left">
            <ellipse cx="42" cy="45" rx="4" ry="4.5" fill="#1a1a2e" />
            <circle cx="43.5" cy="43" r="1.5" fill="white" />
          </g>
          <g className="avatar-eye avatar-eye-right">
            <ellipse cx="58" cy="45" rx="4" ry="4.5" fill="#1a1a2e" />
            <circle cx="59.5" cy="43" r="1.5" fill="white" />
          </g>
        </>
      )}

      {/* Mund */}
      {mouth[expression] ?? <path d="M44 57 Q50 63 56 57" stroke="#d4748a" strokeWidth="1.8" fill="none" strokeLinecap="round" />}

      {/* Nase */}
      <circle cx="50" cy="52" r="1.2" fill={skin === "#fde8d0" ? "#e8a87c" : "#b87040"} opacity="0.5" />
    </svg>
  );
}

const moods = [
  { key: "happy",    label: "Glücklich",   color: "#cfe8d5", textColor: "#5a9e72", partnerMsg: "Deine Partnerin fühlt sich heute glücklich und gut! 😊 Vielleicht ist heute ein guter Tag für etwas zusammen 🌟" },
  { key: "sad",      label: "Traurig",     color: "#b799e5", textColor: "#7a5a9e", partnerMsg: "Deine Partnerin fühlt sich heute etwas traurig 😢 Vielleicht braucht sie gerade eine Umarmung oder einfach jemanden der zuhört 💜" },
  { key: "tired",    label: "Müde",        color: "#ffd9c7", textColor: "#c4845a", partnerMsg: "Deine Partnerin ist heute sehr müde 😴 Gönn ihr etwas Ruhe und verwöhn sie ein bisschen 🧡" },
  { key: "stressed", label: "Gestresst",   color: "#f4c7d7", textColor: "#c47a9a", partnerMsg: "Deine Partnerin ist heute gestresst 😤 Ein ruhiger Abend zusammen oder einfach Verständnis kann viel helfen 💕" },
  { key: "anxious",  label: "Ängstlich",   color: "#ffd9c7", textColor: "#c4845a", partnerMsg: "Deine Partnerin fühlt sich etwas ängstlich 😟 Sei einfach für sie da — das gibt ihr Sicherheit 🤗" },
  { key: "calm",     label: "Entspannt",   color: "#cfe8d5", textColor: "#5a9e72", partnerMsg: "Deine Partnerin ist heute entspannt und ausgeglichen 😌 Eine schöne Zeit für euch zusammen 🌿" },
  { key: "loving",   label: "Verliebt",    color: "#f4c7d7", textColor: "#c47a9a", partnerMsg: "Deine Partnerin denkt heute besonders an dich 🥰 Zeig ihr auch, wie viel sie dir bedeutet 💝" },
  { key: "sick",     label: "Krank",       color: "#b799e5", textColor: "#7a5a9e", partnerMsg: "Deine Partnerin ist heute krank 🤒 Bring ihr vielleicht Tee, Suppe oder einfach Fürsorge 💜" },
  { key: "energetic",label: "Energievoll", color: "#cfe8d5", textColor: "#5a9e72", partnerMsg: "Deine Partnerin ist heute voller Energie ⚡ Perfekt für ein gemeinsames Abenteuer! 🌟" },
];

function sendPartnerNotification(mood: typeof moods[0], name: string) {
  if (Notification.permission === "granted") {
    new Notification("🌸 Luma – Partnerinfo", {
      body: mood.partnerMsg.replace("Deine Partnerin", name),
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
  const [avatarData, setAvatarData] = useState(avatarList[0]);
  const [userName, setUserName] = useState("Deine Partnerin");

  useEffect(() => {
    const raw = localStorage.getItem("luma-user");
    if (raw) {
      const user = JSON.parse(raw);
      const found = avatarList.find((a) => a.id === user.avatar);
      if (found) setAvatarData(found);
      if (user.name) setUserName(user.name);
    }
  }, []);

  const activeMood = moods.find((m) => m.key === selected);

  async function enableNotif() {
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
  }

  function save() {
    const mood = moods.find((m) => m.key === selected);
    if (!mood) return;
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem("luma-moods") ?? "{}";
    const moods_saved = JSON.parse(raw);
    moods_saved[today] = mood.key;
    localStorage.setItem("luma-moods", JSON.stringify(moods_saved));
    sendPartnerNotification(mood, userName);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

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

      {/* Großer Avatar oben mit Stimmungsfarbe */}
      <div
        className="flex flex-col items-center py-8 transition-all duration-700"
        style={{ background: activeMood ? activeMood.color : "#fff8f2" }}
      >
        <div className="w-32 h-32 rounded-full overflow-hidden" style={{ border: "3px solid #fff", boxShadow: "0 4px 20px #b799e530" }}>
          <MoodFace
            expression={selected ?? "happy"}
            bg={activeMood ? activeMood.color : avatarData.bg}
            skin={avatarData.skin}
            hair={avatarData.hair}
            hairStyle={avatarData.hairStyle}
            top={avatarData.top}
            size={128}
          />
        </div>
        <p className="mt-3 text-sm font-medium" style={{ color: activeMood ? activeMood.textColor : "#a094a8" }}>
          {activeMood ? activeMood.label : "Wie fühlst du dich heute?"}
        </p>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5">

        {/* Mood Grid — Charakter statt Emoji */}
        <div className="grid grid-cols-3 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.key}
              onClick={() => { setSelected(mood.key); setSaved(false); }}
              className="flex flex-col items-center gap-1 rounded-3xl pt-3 pb-3 px-1 transition-all"
              style={
                selected === mood.key
                  ? { background: mood.color, border: `2px solid ${mood.textColor}` }
                  : { background: "#fff8f2", border: "1.5px solid #f4e8f8" }
              }
            >
              <MoodFace
                expression={mood.key}
                bg={mood.color}
                skin={avatarData.skin}
                hair={avatarData.hair}
                hairStyle={avatarData.hairStyle}
                top={avatarData.top}
                size={56}
              />
              <span className="text-xs font-medium mt-1" style={{ color: selected === mood.key ? mood.textColor : "#a094a8" }}>
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
            <button onClick={enableNotif}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
              style={{ background: "#b799e5" }}>
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
