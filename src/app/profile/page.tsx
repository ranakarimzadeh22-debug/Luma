"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { getFullUserData, saveProfile } from "@/lib/profile";
import {
  upsertBodyMetrics,
  getSupplements,
  addSupplement as addSupplementDb,
  deleteSupplement as deleteSupplementDb,
} from "@/lib/health";
import { getOrCreatePartnerCode } from "@/lib/actions/partner";
import { getUserCycle, saveUserCycle } from "@/lib/actions/cycle";
import { getUserPregnancy, saveUserPregnancy } from "@/lib/actions/pregnancy";
import {
  createPregnancyShare,
  getPregnancyShare,
  regeneratePregnancyShare,
} from "@/lib/pregnancy-share";
import AvatarPicker, { avatarList, AvatarSVG } from "@/components/AvatarPicker";
import { type Locale } from "@/lib/i18n";

const languages: { code: Locale; flag: string; native: string }[] = [
  { code: "de", flag: "🇩🇪", native: "Deutsch" },
  { code: "en", flag: "🇬🇧", native: "English" },
  { code: "fa", flag: "🇮🇷", native: "فارسی" },
];

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

interface SupplementItem {
  id: number;
  name: string;
  dose: string;
  time: string;
}

export default function ProfilePage() {
  const { t, isRtl, locale, setLocale } = useLocale();
  const { user, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [partnerUrl, setPartnerUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    birthYear: "",
    avatarId: "a1",
  });

  // Supplements state (from user_supplements table)
  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [newSupplementName, setNewSupplementName] = useState("");
  const [newSupplementDose, setNewSupplementDose] = useState("");

  // Body metrics
  const [bodyMetrics, setBodyMetrics] = useState({ weightKg: "", heightCm: "" });

  // Cycle
  const [cycleSettings, setCycleSettings] = useState({
    cycleLength: 28,
    periodLength: 5,
    lastPeriod: "",
  });

  // Pregnancy
  const [pregnancy, setPregnancy] = useState({
    isPregnant: false,
    lastPeriod: "",
    dueDate: "",
  });

  // Pregnancy share
  const [pregnancyShareUrl, setPregnancyShareUrl] = useState("");
  const [pregnancyShareToken, setPregnancyShareToken] = useState("");
  const [pregnancyShareLoading, setPregnancyShareLoading] = useState(false);
  const [pregnancyShareCopied, setPregnancyShareCopied] = useState(false);
  const [partnerName, setPartnerName] = useState("");

  // Password
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const userEmail = user.email || "";

    async function load() {
      const full = await getFullUserData(userId);
      const p = full.profile;
      const bm = full.bodyMetrics;
      const cd = full.cycleData;

      setProfile({
        name: p?.name ?? "",
        email: p?.email ?? userEmail,
        birthYear: p?.birth_year?.toString() ?? "",
        avatarId: p?.avatar ?? "a1",
      });

      setBodyMetrics({
        weightKg: bm?.weight_kg?.toString() ?? "",
        heightCm: bm?.height_cm?.toString() ?? "",
      });

      setCycleSettings({
        cycleLength: cd?.cycle_length ?? 28,
        periodLength: cd?.period_length ?? 5,
        lastPeriod: cd?.last_period_start ?? "",
      });

      // Load supplements from user_supplements
      const suppData = await getSupplements();
      if (suppData) {
        setSupplements(
          suppData.map((s) => ({ id: s.id!, name: s.name, dose: s.dose, time: s.time }))
        );
      }

      // Pregnancy
      const pregData = await getUserPregnancy();
      if (pregData) {
        setPregnancy({
          isPregnant: pregData.is_pregnant || false,
          lastPeriod: pregData.last_period_start || "",
          dueDate: pregData.due_date || "",
        });
      }

      // Partner
      const code = (await getOrCreatePartnerCode()) ?? "LUMA";
      const cyclePayload = {
        name: p?.name ?? "Luma",
        lastPeriodStart: cd?.last_period_start ?? "",
        cycleLength: cd?.cycle_length ?? 28,
        periodLength: cd?.period_length ?? 5,
      };
      const encoded = btoa(encodeURIComponent(JSON.stringify(cyclePayload)));
      setPartnerUrl(`${window.location.origin}/partner/${code}?d=${encoded}`);
    }
    load();
  }, [user]);

  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaveError(null);
    setSaved(false);

    const errors: string[] = [];

    // Profile
    const profileOk = await saveProfile({
      userId: user.id,
      name: profile.name,
      email: profile.email,
      birthYear: profile.birthYear ? parseInt(profile.birthYear) : null,
      avatar: profile.avatarId,
      takesSupplements: supplements.length > 0,
    });
    if (!profileOk) errors.push("Profil konnte nicht gespeichert werden");

    // Body
    const w = bodyMetrics.weightKg ? parseFloat(bodyMetrics.weightKg) : null;
    const h = bodyMetrics.heightCm ? parseFloat(bodyMetrics.heightCm) : null;
    const bodyOk = await upsertBodyMetrics(user.id, w, h);
    if (!bodyOk) errors.push("Körperdaten konnten nicht gespeichert werden");

    // Cycle
    const cycleOk = await saveUserCycle({
      lastPeriodStart: cycleSettings.lastPeriod,
      cycleLength: cycleSettings.cycleLength,
      periodLength: cycleSettings.periodLength,
    });
    if (!cycleOk) errors.push("Zyklus konnte nicht gespeichert werden");

    // Pregnancy
    const pregOk = await saveUserPregnancy({
      isPregnant: pregnancy.isPregnant,
      lastPeriodStart: pregnancy.lastPeriod || null,
      dueDate: pregnancy.dueDate || null,
    });
    if (!pregOk) errors.push("Schwangerschaft konnte nicht gespeichert werden");

    if (errors.length > 0) {
      setSaveError(errors.join(" | "));
      console.error("handleSave errors:", errors);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleAddSupplementItem(name: string, dose: string) {
    if (!user || !name.trim()) return;

    const created = await addSupplementDb(user.id, name.trim(), dose.trim(), "");
    if (created) {
      setSupplements((prev) => [...prev, { id: created.id!, name: created.name, dose: created.dose, time: created.time }]);
    }
  }

  async function removeSupplement(id: number) {
    if (!user) return;
    await deleteSupplementDb(id, user.id);
    setSupplements((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddCustomSupplement() {
    handleAddSupplementItem(newSupplementName, newSupplementDose);
    setNewSupplementName("");
    setNewSupplementDose("");
  }

  function togglePresetSupplement(name: string, dose: string) {
    const existing = supplements.find((s) => s.name === name);
    if (existing) {
      removeSupplement(existing.id);
    } else {
      handleAddSupplementItem(name, dose);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (passwords.newPw !== passwords.confirm) { setPwError("Passwörter stimmen nicht überein"); return; }
    if (passwords.newPw.length < 6) { setPwError("Mindestens 6 Zeichen"); return; }

    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: passwords.newPw }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPwError(body.error || "Passwort konnte nicht geändert werden");
      return;
    }
    setPwSaved(true);
    setPasswords({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(partnerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({ title: "Luma – Mein Zyklus", text: "Ich teile meinen Zyklus mit dir über Luma 🌸", url: partnerUrl });
    } else { copyLink(); }
  }

  // --- Pregnancy Share ---
  async function handleGeneratePregnancyShare() {
    if (!user) return;
    setPregnancyShareLoading(true);
    try {
      const result = await createPregnancyShare(user.id, partnerName);
      if (result) {
        setPregnancyShareUrl(`${window.location.origin}/schwangerschaft/partner/${result.share_token}`);
        setPregnancyShareToken(result.share_token);
      }
    } catch (err) {
      console.error("Fehler beim Generieren des Teilen-Links", err);
    }
    setPregnancyShareLoading(false);
  }

  async function handleRegeneratePregnancyShare() {
    if (!user) return;
    setPregnancyShareLoading(true);
    try {
      const result = await regeneratePregnancyShare(user.id, partnerName);
      if (result) {
        setPregnancyShareUrl(`${window.location.origin}/schwangerschaft/partner/${result.share_token}`);
        setPregnancyShareToken(result.share_token);
      }
    } catch (err) {
      console.error("Fehler beim Erneuern des Teilen-Links", err);
    }
    setPregnancyShareLoading(false);
  }

  function copyPregnancyShareLink() {
    navigator.clipboard.writeText(pregnancyShareUrl);
    setPregnancyShareCopied(true);
    setTimeout(() => setPregnancyShareCopied(false), 2000);
  }

  async function sharePregnancyLink() {
    if (navigator.share) {
      await navigator.share({
        title: "Luma – Meine Schwangerschaft",
        text: "Verfolge meine Schwangerschaft mit mir gemeinsam auf Luma 💕",
        url: pregnancyShareUrl,
      });
    } else {
      copyPregnancyShareLink();
    }
  }

  // Load existing pregnancy share on mount
  useEffect(() => {
    if (!user || !pregnancy.isPregnant) return;
    getPregnancyShare(user.id).then((share) => {
      if (share?.share_token) {
        const url = `${window.location.origin}/schwangerschaft/partner/${share.share_token}`;
        setPregnancyShareUrl(url);
        setPregnancyShareToken(share.share_token);
      }
    });
  }, [user, pregnancy.isPregnant]);

  const inputStyle = { background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#3a2d3f" };

  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header with avatar */}
      <div className="px-6 pt-12 pb-6 border-b" style={{ background: "#fff8f2", borderColor: "#b799e5" }}>
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link href="/dashboard" className="text-lg" style={{ color: "#b799e5" }}>←</Link>
          <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>Profil</h1>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-md ring-4 ring-white/60">
            {(() => { const a = avatarList.find(x => x.id === profile.avatarId) ?? avatarList[0]; return <AvatarSVG bg={a.bg} skin={a.skin} hair={a.hair} hairStyle={a.hairStyle} top={a.top} />; })()}
          </div>
          <p className="font-semibold mt-2" style={{ color: "#3a2d3f" }}>{profile.name || "Dein Name"}</p>
          <p className="text-xs" style={{ color: "#a094a8" }}>{profile.email}</p>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <AvatarPicker selected={profile.avatarId} onSelect={(id) => setProfile({ ...profile, avatarId: id })} />
          </div>

          {/* Personal */}
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>👤 Persönliche Daten</p>
            <input type="text" required value={profile.name} placeholder="Name" onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            <input type="email" required value={profile.email} placeholder="E-Mail" onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            <label className="text-xs font-medium" style={{ color: "#b799e5" }}>🎂 Alter</label>
            <select value={profile.birthYear} onChange={(e) => setProfile({ ...profile, birthYear: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle}>
              <option value="">Bitte wählen</option>
              {Array.from({ length: 50 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                if (i < 18 || i > 60) return null;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          {/* Body */}
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>📏 Körperdaten</p>
            <input type="number" value={bodyMetrics.weightKg} placeholder="Gewicht (kg)" onChange={(e) => setBodyMetrics({ ...bodyMetrics, weightKg: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            <input type="number" value={bodyMetrics.heightCm} placeholder="Größe (cm)" onChange={(e) => setBodyMetrics({ ...bodyMetrics, heightCm: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          </div>

          {/* Cycle */}
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>🔄 Zyklus</p>
            <label className="text-xs" style={{ color: "#a094a8" }}>Letzte Periode</label>
            <input type="date" value={cycleSettings.lastPeriod} onChange={(e) => setCycleSettings({ ...cycleSettings, lastPeriod: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
            <label className="text-xs" style={{ color: "#a094a8" }}>Zykluslänge: <strong style={{ color: "#b799e5" }}>{cycleSettings.cycleLength} Tage</strong></label>
            <input type="range" min={21} max={40} value={cycleSettings.cycleLength} onChange={(e) => setCycleSettings({ ...cycleSettings, cycleLength: Number(e.target.value) })} className="accent-rose-400" />
            <label className="text-xs" style={{ color: "#a094a8" }}>Periodendauer: <strong style={{ color: "#b799e5" }}>{cycleSettings.periodLength} Tage</strong></label>
            <input type="range" min={2} max={10} value={cycleSettings.periodLength} onChange={(e) => setCycleSettings({ ...cycleSettings, periodLength: Number(e.target.value) })} className="accent-rose-400" />
          </div>

          {/* Supplements (single source: user_supplements) */}
          <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs mb-3" style={{ color: "#b799e5" }}>💊 Supplements & Vitamine</p>

            {/* Preset selection grid */}
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto mb-3">
              {SUPPLEMENT_OPTIONS.map((opt) => {
                const isSelected = supplements.some((s) => s.name === opt.name);
                return (
                  <button key={opt.name} type="button" onClick={() => togglePresetSupplement(opt.name, opt.dose)}
                    className={`text-xs font-medium rounded-xl px-3 py-2.5 text-left transition-all ${isSelected ? "ring-2 ring-green-400 bg-green-50" : "bg-white border border-gray-200 hover:border-rose-300"}`}
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

            {/* Custom supplement input */}
            <div className="flex gap-2 mb-3">
              <input type="text" value={newSupplementName}
                onChange={(e) => setNewSupplementName(e.target.value)}
                placeholder="+ Eigenes Supplement" className="flex-1 rounded-xl px-3 py-2 text-xs outline-none" style={inputStyle} />
              <input type="text" value={newSupplementDose}
                onChange={(e) => setNewSupplementDose(e.target.value)}
                placeholder="Dosis" className="w-24 rounded-xl px-3 py-2 text-xs outline-none" style={inputStyle} />
              <button type="button" onClick={handleAddCustomSupplement}
                className="px-4 py-2 bg-rose-100 text-rose-500 rounded-xl text-xs font-medium">+</button>
            </div>

            {/* Current supplements list */}
            {supplements.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium" style={{ color: "#7a5a9e" }}>
                  ✅ {supplements.length} {locale === "de" ? "gespeichert" : locale === "fa" ? "ذخیره شده" : "saved"}
                </p>
                {supplements.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: "#fafafa", border: "1.5px solid #f4c7d7" }}>
                    <span className="text-xs font-medium" style={{ color: "#3a2d3f" }}>
                      {s.name}{s.dose ? ` (${s.dose})` : ""}
                    </span>
                    <button type="button" onClick={() => removeSupplement(s.id)}
                      className="text-xs" style={{ color: "#c4845a" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pregnancy */}
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>🤰 Schwangerschaft</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={pregnancy.isPregnant} onChange={(e) => setPregnancy({ ...pregnancy, isPregnant: e.target.checked })} className="w-5 h-5 rounded accent-rose-400" />
              <span className="text-sm" style={{ color: "#3a2d3f" }}>Ich bin schwanger</span>
            </label>
            {pregnancy.isPregnant && (
              <>
                <label className="text-xs" style={{ color: "#a094a8" }}>Erster Tag der letzten Periode</label>
                <input type="date" value={pregnancy.lastPeriod} onChange={(e) => setPregnancy({ ...pregnancy, lastPeriod: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                <label className="text-xs" style={{ color: "#a094a8" }}>Geburtstermin</label>
                <input type="date" value={pregnancy.dueDate} onChange={(e) => setPregnancy({ ...pregnancy, dueDate: e.target.value })} className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              </>
            )}
          </div>

          {/* Save */}
          <button type="submit" className="w-full text-white font-semibold rounded-2xl py-4 text-base hover:opacity-90 shadow-md"
            style={{ background: saved ? "#cfe8d5" : "linear-gradient(135deg, #b799e5, #f4c7d7)" }}>
            {saved ? "✓ Gespeichert" : "💾 Profil speichern"}
          </button>
          {saveError && (
            <p className="text-xs text-center mt-1" style={{ color: "#c4845a" }}>
              ⚠️ {saveError}
            </p>
          )}
        </form>

        {/* Pregnancy Share (only when pregnant) */}
        {pregnancy.isPregnant && (
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>🤰 Schwangerschaft teilen</p>
            <p className="text-xs leading-relaxed" style={{ color: "#a094a8" }}>
              {locale === "de"
                ? "Dein Partner kann deine Schwangerschaft live mitverfolgen."
                : locale === "fa"
                ? "شریک زندگی تو می‌تواند بارداری تو را به صورت زنده دنبال کند."
                : "Your partner can follow your pregnancy live."}
            </p>

            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder={locale === "de" ? "Name des Partners (optional)" : locale === "fa" ? "نام شریک (اختیاری)" : "Partner's name (optional)"}
              className="rounded-2xl px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />

            {!pregnancyShareUrl ? (
              <button
                onClick={handleGeneratePregnancyShare}
                disabled={pregnancyShareLoading}
                className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#b799e5" }}
              >
                {pregnancyShareLoading
                  ? locale === "de" ? "Wird generiert..." : locale === "fa" ? "در حال تولید..." : "Generating..."
                  : locale === "de" ? "🔗 Share-Link generieren" : locale === "fa" ? "🔗 تولید لینک اشتراک" : "🔗 Generate share link"}
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7" }}>
                  <span className="text-xs font-mono truncate" style={{ color: "#a094a8" }}>{pregnancyShareUrl}</span>
                  <button onClick={copyPregnancyShareLink} className="text-xs font-medium ml-2 shrink-0" style={{ color: "#b799e5" }}>
                    {pregnancyShareCopied ? "✓" : "📋"}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={sharePregnancyLink}
                    className="flex-1 text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
                    style={{ background: "#b799e5" }}
                  >
                    {locale === "de" ? "📱 Teilen" : locale === "fa" ? "📱 اشتراک" : "📱 Share"}
                  </button>
                  <button
                    onClick={handleRegeneratePregnancyShare}
                    disabled={pregnancyShareLoading}
                    className="px-4 font-medium rounded-2xl py-3 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
                    style={{ border: "1.5px solid #f4c7d7", color: "#b799e5", background: "#fafafa" }}
                  >
                    🔄
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Language */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
          <p className="text-xs mb-3" style={{ color: "#b799e5" }}>🌍 Sprache</p>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button key={lang.code} onClick={() => setLocale(lang.code)}
                className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 text-xs transition-all"
                style={locale === lang.code ? { background: "#b799e5", color: "#fff" } : { background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#a094a8" }}>
                <span className="text-xl">{lang.flag}</span>
                {lang.native}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <form onSubmit={savePassword} className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs" style={{ color: "#b799e5" }}>🔒 Passwort ändern</p>
          <input type="password" placeholder="Neues Passwort" value={passwords.newPw}
            onChange={(e) => setPasswords({ ...passwords, newPw: e.target.value })}
            className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          <input type="password" placeholder="Passwort bestätigen" value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          {pwError && <p className="text-xs" style={{ color: "#b799e5" }}>{pwError}</p>}
          <button type="submit" className="w-full text-white font-medium rounded-2xl py-3 text-sm"
            style={{ background: pwSaved ? "#cfe8d5" : "#b799e5" }}>
            {pwSaved ? "✓ Geändert" : "Passwort ändern"}
          </button>
        </form>

        {/* Partner Link */}
        {partnerUrl && (
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>💑 Partner Link</p>
            <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7" }}>
              <span className="text-xs font-mono truncate" style={{ color: "#a094a8" }}>{partnerUrl}</span>
              <button onClick={copyLink} className="text-xs font-medium ml-2 shrink-0" style={{ color: "#b799e5" }}>{copied ? "✓" : "Kopieren"}</button>
            </div>
            <button onClick={shareLink} className="w-full text-white font-medium rounded-2xl py-3 text-sm flex items-center justify-center gap-2" style={{ background: "#b799e5" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Link teilen
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="rounded-3xl p-5 flex flex-col gap-2" style={{ background: "#fff8f2", border: "1.5px solid #ffd9c7" }}>
          <button onClick={() => signOut()} className="w-full text-center font-medium rounded-2xl py-3 text-sm" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#b799e5" }}>Abmelden</button>
        </div>

        <p className="text-center text-xs pb-4" style={{ color: "#b799e5" }}>Luma 🌸</p>
      </div>
    </main>
  );
}