"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AvatarPicker, { avatarList } from "@/components/AvatarPicker";
import { type Locale } from "@/lib/i18n";

// Supplement options for quick selection
const SUPPLEMENT_OPTIONS = [
  { name: "Folsäure (B9)", dose: "400 µg", emoji: "🧬" },
  { name: "Vitamin D", dose: "1000 IE", emoji: "☀️" },
  { name: "Vitamin B12", dose: "500 µg", emoji: "⚡" },
  { name: "Eisen", dose: "30 mg", emoji: "🩸" },
  { name: "Magnesium", dose: "300 mg", emoji: "💪" },
  { name: "Omega-3", dose: "1000 mg", emoji: "🐟" },
  { name: "Calcium", dose: "500 mg", emoji: "🦴" },
  { name: "Vitamin C", dose: "500 mg", emoji: "🍊" },
  { name: "Zink", dose: "15 mg", emoji: "🛡️" },
  { name: "Vitamin B6", dose: "25 mg", emoji: "🧠" },
  { name: "Selen", dose: "100 µg", emoji: "🌰" },
  { name: "Probiotika", dose: "1 Kapsel", emoji: "🦠" },
];

type Step =
  | "account" | "language" | "avatar"
  | "personal" | "cycle" | "supplements" | "pregnancy" | "done";

const steps: Step[] = [
  "account", "language", "avatar",
  "personal", "cycle", "supplements", "pregnancy", "done"
];

const languages: { code: Locale; flag: string; native: string }[] = [
  { code: "de", flag: "🇩🇪", native: "Deutsch" },
  { code: "en", flag: "🇬🇧", native: "English" },
  { code: "fa", flag: "🇮🇷", native: "فارسی" },
];

interface SelectedSupplement {
  name: string;
  dose: string;
  time: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    heightCm: "",
    weightKg: "",
    cycleLength: 28,
    periodLength: 5,
    selectedSupplements: [] as SelectedSupplement[],
    customSupplementName: "",
    customSupplementDose: "",
    avatarId: "a1",
    isPregnant: false,
    locale: "de" as Locale,
  });

  const step = steps[stepIndex];
  const currentStepNum = stepIndex + 1;
  const totalSteps = steps.length;
  const progress = (stepIndex / (totalSteps - 1)) * 100;

  function canProceed(): boolean {
    switch (step) {
      case "account": return form.name.trim().length > 0 && form.email.includes("@") && form.password.length >= 6;
      case "personal": return form.birthYear !== "" && form.heightCm !== "" && parseFloat(form.heightCm) > 0 && form.weightKg !== "" && parseFloat(form.weightKg) > 0;
      default: return true;
    }
  }

  function toggleSupplement(opt: { name: string; dose: string }) {
    setForm((prev) => {
      const existing = prev.selectedSupplements.find((s) => s.name === opt.name);
      if (existing) {
        return {
          ...prev,
          selectedSupplements: prev.selectedSupplements.filter((s) => s.name !== opt.name),
        };
      } else {
        return {
          ...prev,
          selectedSupplements: [
            ...prev.selectedSupplements,
            { name: opt.name, dose: opt.dose, time: "08:00" },
          ],
        };
      }
    });
  }

  function addCustomSupplement() {
    const name = form.customSupplementName.trim();
    if (name && !form.selectedSupplements.some((s) => s.name === name)) {
      setForm((prev) => ({
        ...prev,
        selectedSupplements: [
          ...prev.selectedSupplements,
          { name, dose: prev.customSupplementDose.trim(), time: "08:00" },
        ],
        customSupplementName: "",
        customSupplementDose: "",
      }));
    }
  }

  function updateSupplementTime(name: string, time: string) {
    setForm((prev) => ({
      ...prev,
      selectedSupplements: prev.selectedSupplements.map((s) =>
        s.name === name ? { ...s, time } : s
      ),
    }));
  }

  async function handleFinish() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        name: form.name,
        birthYear: form.birthYear ? parseInt(form.birthYear) : null,
        avatar: form.avatarId,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
        lastPeriodStart: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
        cycleLength: form.cycleLength,
        periodLength: form.periodLength,
        isPregnant: form.isPregnant,
        supplements: form.selectedSupplements,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Konto wurde erstellt, Anmeldung ist aber fehlgeschlagen. Bitte logge dich manuell ein.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStepIndex(steps.indexOf("done"));
  }

  // ==================== RENDER ====================

  if (step === "done") {
    return (
      <main className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs flex flex-col items-center gap-5 animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
            🎉
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center">Profil erfolgreich erstellt</h1>
          <p className="text-gray-500 text-sm text-center">
            Willkommen, {form.name}! Luma ist bereit für dich.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity"
          >
            Zum Dashboard →
          </button>
        </div>
      </main>
    );
  }

  const inputStyle = { background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" };

  return (
    <main className="min-h-screen bg-rose-50 flex flex-col">
      {/* Progress */}
      <div className="w-full h-1.5 bg-rose-100">
        <div
          className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="text-center pt-6 pb-2">
        <span className="text-xs font-medium text-rose-300">
          {currentStepNum} / {totalSteps - 1}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 max-w-sm mx-auto w-full">
        <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
          {/* === STEP 1: ACCOUNT === */}
          {step === "account" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-md mb-2">👤</div>
              <h2 className="text-2xl font-bold text-gray-800">Dein Konto</h2>
              <p className="text-sm text-gray-500">Erstelle dein Luma-Konto.</p>
              <div className="w-full mt-2 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Dein Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="z.B. Rana"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors" autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">E-Mail</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="deine@email.de"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Passwort</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="•••••••• (mind. 6 Zeichen)"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors" />
                </div>
              </div>
            </>
          )}

          {/* === STEP 2: LANGUAGE === */}
          {step === "language" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-3xl shadow-md mb-2">🌍</div>
              <h2 className="text-2xl font-bold text-gray-800">Wähle deine Sprache</h2>
              <p className="text-sm text-gray-500">Du kannst sie später ändern.</p>
              <div className="w-full mt-4 flex flex-col gap-3">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => setForm({ ...form, locale: lang.code })}
                    className={`w-full flex items-center gap-4 rounded-2xl py-4 px-5 text-base transition-all ${
                      form.locale === lang.code ? "ring-2 ring-rose-400 bg-rose-50" : "bg-white border border-gray-200 hover:border-rose-300"
                    }`}>
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="font-medium" style={{ color: "#3a2d3f" }}>{lang.native}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* === STEP 3: AVATAR === */}
          {step === "avatar" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-3xl shadow-md mb-2">🎨</div>
              <h2 className="text-2xl font-bold text-gray-800">Wähle deinen Avatar</h2>
              <p className="text-sm text-gray-500">Dein persönlicher Begleiter in Luma.</p>
              <div className="w-full mt-2">
                <AvatarPicker selected={form.avatarId} onSelect={(id) => setForm({ ...form, avatarId: id })} />
              </div>
            </>
          )}

          {/* === STEP 4: PERSONAL (Geburtsdatum + Größe + Gewicht) === */}
          {step === "personal" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center text-3xl shadow-md mb-2">📋</div>
              <h2 className="text-2xl font-bold text-gray-800">Deine Daten</h2>
              <p className="text-sm text-gray-500">Geburtsdatum, Größe & Gewicht.</p>
              <div className="w-full mt-2 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-2 block">🎂 Geburtsdatum</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={form.birthDay} onChange={(e) => setForm({ ...form, birthDay: e.target.value })}
                      className="rounded-xl px-3 py-3 text-sm outline-none" style={inputStyle}>
                      <option value="">Tag</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}.</option>
                      ))}
                    </select>
                    <select value={form.birthMonth} onChange={(e) => setForm({ ...form, birthMonth: e.target.value })}
                      className="rounded-xl px-3 py-3 text-sm outline-none" style={inputStyle}>
                      <option value="">Monat</option>
                      {["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"].map((m, i) => (
                        <option key={i + 1} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <select value={form.birthYear} onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                      className="rounded-xl px-3 py-3 text-sm outline-none" style={inputStyle}>
                      <option value="">Jahr</option>
                      {Array.from({ length: 50 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={String(year)}>{year}</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">📏 Größe (cm)</label>
                    <input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                      placeholder="z.B. 170"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">⚖️ Gewicht (kg)</label>
                    <input type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                      placeholder="z.B. 65"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === STEP 5: CYCLE === */}
          {step === "cycle" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-rose-400 flex items-center justify-center text-3xl shadow-md mb-2">🔄</div>
              <h2 className="text-2xl font-bold text-gray-800">Dein Zyklus</h2>
              <p className="text-sm text-gray-500">Damit Luma deine Phasen berechnen kann.</p>
              <div className="w-full mt-4 flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Zykluslänge: <strong className="text-rose-500">{form.cycleLength} Tage</strong></p>
                  <input type="range" min={21} max={40} value={form.cycleLength}
                    onChange={(e) => setForm({ ...form, cycleLength: Number(e.target.value) })}
                    className="w-full accent-rose-400" />
                  <div className="flex justify-between text-xs text-gray-400"><span>21</span><span>28</span><span>40</span></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Periodendauer: <strong className="text-rose-500">{form.periodLength} Tage</strong></p>
                  <input type="range" min={2} max={10} value={form.periodLength}
                    onChange={(e) => setForm({ ...form, periodLength: Number(e.target.value) })}
                    className="w-full accent-rose-400" />
                  <div className="flex justify-between text-xs text-gray-400"><span>2</span><span>5</span><span>10</span></div>
                </div>
              </div>
            </>
          )}

          {/* === STEP 6: SUPPLEMENTS === */}
          {step === "supplements" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-3xl shadow-md mb-2">💊</div>
              <h2 className="text-2xl font-bold text-gray-800">Supplements & Vitamine</h2>
              <p className="text-sm text-gray-500">Wähle aus, welche du nimmst.</p>
              <div className="w-full mt-2 max-h-52 overflow-y-auto grid grid-cols-2 gap-2">
                {SUPPLEMENT_OPTIONS.map((opt) => {
                  const isSelected = form.selectedSupplements.some((s) => s.name === opt.name);
                  return (
                    <button key={opt.name} type="button" onClick={() => toggleSupplement(opt)}
                      className={`text-xs font-medium rounded-xl px-3 py-2.5 text-left transition-all ${
                        isSelected ? "ring-2 ring-green-400 bg-green-50" : "bg-white border border-gray-200 hover:border-rose-300"
                      }`}
                      style={{
                        background: isSelected ? "#e6f7e6" : "#fafafa",
                        border: `1.5px solid ${isSelected ? "#7bbf8e" : "#f4c7d7"}`,
                        color: "#3a2d3f",
                      }}>
                      <span className="block">{opt.emoji} {opt.name}</span>
                      <span className="block text-[10px] opacity-60 mt-0.5">{opt.dose}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time per supplement */}
              {form.selectedSupplements.length > 0 && (
                <div className="w-full mt-2 flex flex-col gap-2">
                  <p className="text-xs text-gray-500 font-medium">Uhrzeiten für Erinnerung:</p>
                  {form.selectedSupplements.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2" style={{ border: "1.5px solid #f4c7d7" }}>
                      <span className="text-xs flex-1" style={{ color: "#3a2d3f" }}>{s.name}</span>
                      <input type="time" value={s.time || "08:00"}
                        onChange={(e) => updateSupplementTime(s.name, e.target.value)}
                        className="text-xs rounded-lg px-2 py-1 outline-none" style={{ background: "#fff8f2", border: "1px solid #f4c7d7", color: "#3a2d3f" }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Custom supplement */}
              <div className="w-full flex gap-2 mt-2">
                <input type="text" value={form.customSupplementName}
                  onChange={(e) => setForm({ ...form, customSupplementName: e.target.value })}
                  placeholder="+ Eigenes Supplement"
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400" />
                <input type="text" value={form.customSupplementDose}
                  onChange={(e) => setForm({ ...form, customSupplementDose: e.target.value })}
                  placeholder="Dosis"
                  className="w-20 bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs outline-none" />
                <button type="button" onClick={addCustomSupplement}
                  className="px-4 py-2 bg-rose-100 text-rose-500 rounded-xl text-xs font-medium hover:bg-rose-200">+</button>
              </div>
              {form.selectedSupplements.length > 0 && (
                <p className="text-xs text-green-600 font-medium">✅ {form.selectedSupplements.length} ausgewählt</p>
              )}
            </>
          )}

          {/* === STEP 7: PREGNANCY === */}
          {step === "pregnancy" && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-md mb-2">🤰</div>
              <h2 className="text-2xl font-bold text-gray-800">Bist du schwanger?</h2>
              <p className="text-sm text-gray-500">Luma kann dich dann begleiten.</p>
              <div className="w-full mt-4 flex flex-col gap-3">
                <button type="button" onClick={() => setForm({ ...form, isPregnant: true })}
                  className={`w-full flex items-center gap-4 rounded-2xl py-5 px-5 text-base transition-all ${
                    form.isPregnant === true ? "ring-2 ring-rose-400 bg-rose-50" : "bg-white border border-gray-200 hover:border-rose-300"
                  }`}>
                  <span className="text-3xl">🤰</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium" style={{ color: "#3a2d3f" }}>Ich bin schwanger</p>
                    <p className="text-xs" style={{ color: "#a094a8" }}>Luma passt sich an</p>
                  </div>
                </button>
                <button type="button" onClick={() => setForm({ ...form, isPregnant: false })}
                  className={`w-full flex items-center gap-4 rounded-2xl py-5 px-5 text-base transition-all ${
                    form.isPregnant === false ? "ring-2 ring-rose-400 bg-rose-50" : "bg-white border border-gray-200 hover:border-rose-300"
                  }`}>
                  <span className="text-3xl">🙋</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium" style={{ color: "#3a2d3f" }}>Nicht schwanger</p>
                    <p className="text-xs" style={{ color: "#a094a8" }}>Normaler Modus</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-red-400 text-center px-6 -mt-4">{error}</p>}

      {/* Navigation */}
      <div className="px-6 pb-10 flex flex-col gap-3 max-w-sm mx-auto w-full">
        {step === "pregnancy" ? (
          <button onClick={handleFinish} disabled={loading}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Wird gespeichert..." : "Fertig →"}
          </button>
        ) : (
          <button onClick={() => setStepIndex((s) => s + 1)} disabled={!canProceed()}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
            Weiter →
          </button>
        )}

        {stepIndex > 0 && (
          <button onClick={() => setStepIndex((s) => s - 1)}
            className="w-full text-gray-400 text-sm py-2">
            ← Zurück
          </button>
        )}
      </div>
    </main>
  );
}