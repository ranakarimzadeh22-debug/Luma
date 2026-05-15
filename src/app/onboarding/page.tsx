"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePartnerCode } from "@/lib/partner";

const steps = [
  {
    id: "welcome",
    emoji: "🌸",
    title: "Willkommen bei Luma!",
    text: "Luma hilft dir, deinen Zyklus zu verstehen. Lass uns gemeinsam herausfinden, wie dein Zyklus aussieht.",
    bg: "from-rose-400 to-pink-500",
  },
  {
    id: "what-is-cycle",
    emoji: "🔄",
    title: "Was ist ein Zyklus?",
    text: "Dein Zyklus beginnt am ersten Tag deiner Periode und endet einen Tag vor der nächsten. Die meisten Frauen haben einen Zyklus von 21 bis 35 Tagen.",
    bg: "from-pink-400 to-purple-400",
    tip: "💡 Der Durchschnitt liegt bei 28 Tagen — aber jede Frau ist anders!",
  },
  {
    id: "last-period",
    emoji: "📅",
    title: "Wann war deine letzte Periode?",
    text: "Weißt du noch, wann deine letzte Periode begonnen hat? Das ist der erste Tag, an dem du geblutet hast.",
    bg: "from-purple-400 to-indigo-400",
    tip: "💡 Schau in deinen Kalender oder schätze einfach — du kannst es später ändern.",
    input: "lastPeriod",
  },
  {
    id: "cycle-length",
    emoji: "📏",
    title: "Wie lange ist dein Zyklus?",
    text: "Zähle die Tage vom ersten Tag deiner letzten Periode bis zum ersten Tag der übernächsten Periode.",
    bg: "from-indigo-400 to-blue-400",
    tip: "💡 Nicht sicher? Wähle einfach 28 Tage — das ist der häufigste Wert.",
    input: "cycleLength",
    visual: true,
  },
  {
    id: "period-length",
    emoji: "🩸",
    title: "Wie lange dauert deine Periode?",
    text: "Die meisten Frauen haben ihre Periode 3 bis 7 Tage lang. Wie viele Tage blutest du ungefähr?",
    bg: "from-rose-400 to-pink-400",
    tip: "💡 Nicht genau? 5 Tage ist ein guter Startwert.",
    input: "periodLength",
  },
  {
    id: "done",
    emoji: "✨",
    title: "Super gemacht!",
    text: "Luma hat jetzt alle Infos um deinen Zyklus zu berechnen. Du kannst alles jederzeit im Profil anpassen.",
    bg: "from-rose-400 to-pink-500",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    lastPeriod: new Date().toISOString().split("T")[0],
    cycleLength: 28,
    periodLength: 5,
  });
  const [partnerCode, setPartnerCode] = useState("");
  const [copied, setCopied] = useState(false);

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step) / (steps.length - 1)) * 100;

  function next() {
    if (isLast) {
      const raw = localStorage.getItem("luma-user");
      const user = raw ? JSON.parse(raw) : {};
      const code = user.partnerCode ?? generatePartnerCode(user.name ?? "Luma");
      const updated = { ...user, ...data, partnerCode: code };
      localStorage.setItem("luma-user", JSON.stringify(updated));
      setPartnerCode(code);
      router.push("/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  }

  function copy() {
    const url = `${window.location.origin}/partner/${partnerCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-rose-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-rose-100">
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 pt-4 px-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step ? "w-6 h-2 bg-rose-400" : i < step ? "w-2 h-2 bg-rose-300" : "w-2 h-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">

        {/* Emoji Bubble */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${current.bg} flex items-center justify-center text-5xl shadow-lg mb-6`}>
          {current.emoji}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">{current.title}</h1>
        <p className="text-gray-500 text-sm text-center leading-relaxed mb-4">{current.text}</p>

        {/* Tip */}
        {"tip" in current && (
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm w-full mb-4">
            <p className="text-sm text-gray-600">{current.tip}</p>
          </div>
        )}

        {/* Inputs */}
        {current.input === "lastPeriod" && (
          <div className="w-full flex flex-col gap-2 mb-4">
            <label className="text-xs font-medium text-gray-500">Erster Tag der letzten Periode</label>
            <input
              type="date"
              value={data.lastPeriod}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setData({ ...data, lastPeriod: e.target.value })}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
            />
          </div>
        )}

        {current.input === "cycleLength" && (
          <div className="w-full flex flex-col gap-3 mb-4">
            {/* Visual calendar example */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Beispiel: Zyklus von {data.cycleLength} Tagen</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: data.cycleLength }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      i < data.periodLength
                        ? "bg-rose-400 text-white"
                        : i === data.cycleLength - 14
                        ? "bg-purple-400 text-white"
                        : "bg-rose-100 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-3">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-400" /><span className="text-xs text-gray-500">Periode</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-400" /><span className="text-xs text-gray-500">Eisprung</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-100" /><span className="text-xs text-gray-500">Zyklus</span></div>
              </div>
            </div>

            <label className="text-xs font-medium text-gray-500">
              Zykluslänge: <span className="text-rose-500 font-bold">{data.cycleLength} Tage</span>
            </label>
            <input
              type="range" min={21} max={40} value={data.cycleLength}
              onChange={(e) => setData({ ...data, cycleLength: Number(e.target.value) })}
              className="accent-rose-400"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>21 Tage (kurz)</span>
              <span>40 Tage (lang)</span>
            </div>

            <div className="flex gap-3">
              {[21, 28, 30, 35].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setData({ ...data, cycleLength: d })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    data.cycleLength === d
                      ? "bg-rose-400 text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-rose-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {current.input === "periodLength" && (
          <div className="w-full flex flex-col gap-3 mb-4">
            <label className="text-xs font-medium text-gray-500">
              Periodendauer: <span className="text-rose-500 font-bold">{data.periodLength} Tage</span>
            </label>
            <input
              type="range" min={2} max={10} value={data.periodLength}
              onChange={(e) => setData({ ...data, periodLength: Number(e.target.value) })}
              className="accent-rose-400"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>2 Tage</span>
              <span>10 Tage</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setData({ ...data, periodLength: d })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    data.periodLength === d
                      ? "bg-rose-400 text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-rose-300"
                  }`}
                >
                  {d} Tage
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="px-6 pb-10 flex flex-col gap-3 max-w-md mx-auto w-full">
        <button
          onClick={next}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity"
        >
          {isLast ? "Zum Dashboard →" : "Weiter →"}
        </button>
        {step > 0 && !isLast && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-full text-gray-400 text-sm py-2"
          >
            ← Zurück
          </button>
        )}
        {!isLast && (
          <button
            onClick={() => setStep(steps.length - 1)}
            className="w-full text-gray-300 text-xs py-1"
          >
            Überspringen
          </button>
        )}
      </div>
    </main>
  );
}
