"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getProfileName } from "@/lib/actions/user-data";
import { avatarList } from "@/components/AvatarPicker";
import { useLocale } from "@/context/LocaleContext";
import {
  MOODS, loadMoods, saveMood, getTodayEntry, calcStreak,
  getCalendarDays, analyzePatterns, getBuddyResponse,
  type MoodKey, type CalendarDay, type PatternResult, type BuddyResponse,
} from "@/lib/emotions";

/* ========== MoodFace (Avatar mit Gesichtsausdruck) ========== */

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

  const eyesClosed = expression === "tired";
  const eyesHeart  = expression === "loving";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill={bg} />
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
      <rect x="44" y="60" width="12" height="10" rx="5" fill={skin} />
      <ellipse cx="50" cy="88" rx="20" ry="16" fill={top} />
      <ellipse cx="50" cy="46" rx="18" ry="20" fill={skin} />
      <ellipse cx="31" cy="47" rx="3.5" ry="4.5" fill={skin} />
      <ellipse cx="69" cy="47" rx="3.5" ry="4.5" fill={skin} />
      <ellipse cx="37" cy="52" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.4" />
      <ellipse cx="63" cy="52" rx="6" ry="3.5" fill="#ffb3c6" opacity="0.4" />
      {eyebrows[expression]}
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
          <ellipse cx="42" cy="45" rx="4" ry="4.5" fill="#1a1a2e" />
          <circle cx="43.5" cy="43" r="1.5" fill="white" />
          <ellipse cx="58" cy="45" rx="4" ry="4.5" fill="#1a1a2e" />
          <circle cx="59.5" cy="43" r="1.5" fill="white" />
        </>
      )}
      {mouth[expression] ?? <path d="M44 57 Q50 63 56 57" stroke="#d4748a" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      <circle cx="50" cy="52" r="1.2" fill={skin === "#fde8d0" ? "#e8a87c" : "#b87040"} opacity="0.5" />
    </svg>
  );
}

/* ========== Emotion Calendar Component ========== */

function EmotionCalendar({ days }: { days: CalendarDay[] }) {
  // group by week
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex gap-1.5 justify-center">
          {week.map((day) => {
            const moodDef = day.entry ? MOODS.find((m) => m.key === day.entry!.key) : undefined;
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div
                key={day.date}
                title={day.entry ? `${day.day}.${day.month + 1} – ${moodDef?.labelDe ?? day.entry.key}` : `${day.day}.${day.month + 1}`}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium transition-all"
                style={{
                  background: moodDef ? moodDef.color : "#f4e8f8",
                  color: moodDef ? moodDef.textColor : "#a094a8",
                  border: isToday ? `2px solid ${moodDef?.textColor ?? "#b799e5"}` : "2px solid transparent",
                  transform: isToday ? "scale(1.15)" : "scale(1)",
                }}
              >
                {day.day}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ========== Main Page ========== */

export default function GefuhlPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  // User / Avatar
  const [avatarData, setAvatarData] = useState(avatarList[0]);
  const [userName, setUserName] = useState("Deine Partnerin");

  // Mood selection
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  // Computed data
  const [streak, setStreak] = useState(0);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [buddyMsg, setBuddyMsg] = useState<BuddyResponse | null>(null);

  useEffect(() => {
    if (user) {
      getProfileName().then((name) => {
        if (name) setUserName(name);
      });
    }
    // Load today's entry
    const today = getTodayEntry();
    if (today) {
      setSelected(today.key);
      setIntensity(today.intensity);
      setNote(today.note ?? "");
    }
    // Computed
    setStreak(calcStreak());
    setCalendarDays(getCalendarDays(28));
    setPatterns(analyzePatterns());
    setBuddyMsg(getBuddyResponse(today?.key));
  }, []);

  const activeMood = MOODS.find((m) => m.key === selected);

  async function enableNotif() {
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
  }

  function sendPartnerNotification(mood: typeof MOODS[0]) {
    if (Notification.permission === "granted") {
      new Notification("🌸 Luma – Partnerinfo", {
        body: mood.partnerMsgDe.replace("Deine Partnerin", userName),
        icon: "/favicon.ico",
      });
    }
  }

  function handleSave() {
    if (!selected) return;
    const entry = {
      date: new Date().toISOString().split("T")[0],
      key: selected,
      intensity,
      note: note.trim() || undefined,
      timestamp: Date.now(),
    };
    saveMood(entry);
    sendPartnerNotification(MOODS.find((m) => m.key === selected)!);

    // Refresh computed
    setStreak(calcStreak());
    setCalendarDays(getCalendarDays(28));
    setPatterns(analyzePatterns());
    setBuddyMsg(getBuddyResponse(selected));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleMoodSelect(key: MoodKey) {
    setSelected(key);
    setSaved(false);
    // update buddy response for this mood
    setBuddyMsg(getBuddyResponse(key));
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
        <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>{t.emotions.title}</h1>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5">

        {/* === Buddy === */}
        {buddyMsg && (
          <div className="rounded-3xl p-5 transition-all duration-500" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>{t.emotions.buddy}</p>
            <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>{buddyMsg.emoji} {buddyMsg.textDe}</p>
          </div>
        )}

        {/* === Großer Avatar oben === */}
        <div
          className="flex flex-col items-center py-8 rounded-3xl transition-all duration-700"
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
            {activeMood ? activeMood.labelDe : t.emotions.howAreYou}
          </p>

          {/* Streak + Intensität */}
          <div className="flex items-center gap-4 mt-3">
            {streak > 0 && (
              <span className="text-xs rounded-full px-3 py-1" style={{ background: "#fff", color: "#c4845a" }}>
                {t.emotions.streak}: {streak}
              </span>
            )}
            {activeMood && (
              <span className="text-xs rounded-full px-3 py-1" style={{ background: "#fff", color: activeMood.textColor }}>
                {t.emotions.intensity}: {intensity}/5
              </span>
            )}
          </div>
        </div>

        {/* === Mood Grid === */}
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              onClick={() => handleMoodSelect(mood.key)}
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
                {mood.labelDe}
              </span>
            </button>
          ))}
        </div>

        {/* === Intensity Slider === */}
        {activeMood && (
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: `1.5px solid ${activeMood.color}` }}>
            <p className="text-xs mb-3" style={{ color: "#b799e5" }}>{t.emotions.intensity}</p>
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-[#b799e5]"
              style={{ accentColor: activeMood.textColor }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: "#a094a8" }}>
              <span>1 – leicht</span>
              <span>5 – sehr stark</span>
            </div>
          </div>
        )}

        {/* === Note === */}
        {activeMood && (
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: `1.5px solid ${activeMood.color}` }}>
            <p className="text-xs mb-3" style={{ color: "#b799e5" }}>{t.emotions.note}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.emotions.notePlaceholder}
              rows={3}
              className="w-full text-sm rounded-2xl p-3 resize-none outline-none"
              style={{ background: "#fafafa", color: "#3a2d3f", border: "1px solid #f4e8f8" }}
            />
          </div>
        )}

        {/* === Tipps === */}
        {activeMood && (
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: `1.5px solid ${activeMood.color}` }}>
            <p className="text-xs mb-3" style={{ color: "#b799e5" }}>{t.emotions.tips}</p>
            <div className="flex flex-col gap-2.5">
              {activeMood.tips.map((tip, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: activeMood.color + "55" }}>
                  <span className="text-xl">{tip.icon}</span>
                  <p className="text-xs leading-snug" style={{ color: "#3a2d3f" }}>{tip.textDe}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === Partner Message === */}
        {activeMood && (
          <div className="rounded-3xl p-4" style={{ background: "#fff8f2", border: `1.5px solid ${activeMood.color}` }}>
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>{t.emotions.partnerMsg}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#3a2d3f" }}>{activeMood.partnerMsgDe}</p>
          </div>
        )}

        {/* === Notifications === */}
        {!notifEnabled && (
          <div className="rounded-3xl p-4" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>{t.emotions.notifyEnable}</p>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: "#a094a8" }}>
              {t.emotions.notifyText}
            </p>
            <button onClick={enableNotif}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
              style={{ background: "#b799e5" }}>
              {t.emotions.notifyEnable}
            </button>
          </div>
        )}

        {/* === Save Button === */}
        <button
          onClick={handleSave}
          disabled={!selected}
          className="w-full text-white font-medium rounded-2xl py-4 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          style={{ background: saved ? "#cfe8d5" : "#b799e5" }}
        >
          {saved ? t.emotions.saved : t.emotions.saveToday}
        </button>

        {/* === Emotion Calendar === */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs mb-3" style={{ color: "#b799e5" }}>{t.emotions.calendar} (28 Tage)</p>
          {calendarDays.length > 0 ? (
            <EmotionCalendar days={calendarDays} />
          ) : (
            <p className="text-xs text-center" style={{ color: "#a094a8" }}>{t.emotions.noData}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {MOODS.map((m) => (
              <span key={m.key} className="text-[10px] rounded-full px-2 py-0.5" style={{ background: m.color + "55", color: m.textColor }}>
                ● {m.labelDe}
              </span>
            ))}
          </div>
        </div>

        {/* === Patterns === */}
        {patterns.length > 0 && (
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs mb-3" style={{ color: "#b799e5" }}>{t.emotions.patterns}</p>
            <div className="flex flex-col gap-3">
              {patterns.map((p, i) => (
                <div key={i} className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>
                  <span>{p.emoji} <strong>{p.titleDe}</strong></span>
                  <p className="text-xs mt-1" style={{ color: "#a094a8" }}>{p.descDe}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs pb-4" style={{ color: "#b799e5" }}>glow with care 🌸</p>
      </div>
    </main>
  );
}