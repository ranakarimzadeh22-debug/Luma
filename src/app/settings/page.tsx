"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { type Locale } from "@/lib/i18n";
import { generatePartnerCode } from "@/lib/partner";

const languages: { code: Locale; flag: string; native: string }[] = [
  { code: "de", flag: "🇩🇪", native: "Deutsch" },
  { code: "en", flag: "🇬🇧", native: "English" },
  { code: "fa", flag: "🇮🇷", native: "فارسی" },
];

const inputStyle = {
  background: "#fff8f2",
  border: "1.5px solid #f4c7d7",
  color: "#3a2d3f",
};

export default function SettingsPage() {
  const { locale, setLocale } = useLocale();
  const [profile, setProfile] = useState({ name: "Rana", email: "rana@example.com" });
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [partnerUrl, setPartnerUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("luma-user");
    let partnerCode = "";
    const user = raw ? JSON.parse(raw) : {};
    partnerCode = user.partnerCode ?? "";
    if (!partnerCode) {
      partnerCode = generatePartnerCode("Luma");
      user.partnerCode = partnerCode;
      localStorage.setItem("luma-user", JSON.stringify(user));
    }

    // Zyklus-Daten in URL encoden damit der Partner echte Daten sieht
    const cyclePayload = {
      name: user.name ?? "Luma",
      lastPeriodStart: user.lastPeriodStart ?? "",
      cycleLength: user.cycleLength ?? 28,
      periodLength: user.periodLength ?? 5,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(cyclePayload)));
    setPartnerUrl(`${window.location.origin}/partner/${partnerCode}?d=${encoded}`);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(partnerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({ title: "Luma – Mein Zyklus", text: "Ich teile meinen Zyklus mit dir über Luma 🌸", url: partnerUrl });
    } else {
      copyLink();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (passwords.newPw !== passwords.confirm) { setPwError("Passwörter stimmen nicht überein"); return; }
    if (passwords.newPw.length < 6) { setPwError("Mindestens 6 Zeichen"); return; }
    setPwSaved(true);
    setPasswords({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  }

  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-5 border-b" style={{ background: "#fff8f2", borderColor: "#f4c7d7" }}>
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link href="/dashboard" className="text-lg" style={{ color: "#b799e5" }}>←</Link>
          <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>Einstellungen</h1>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Sprache */}
        <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
          <p className="text-xs mb-3" style={{ color: "#b799e5" }}>🌍 Sprache</p>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs transition-all"
                style={
                  locale === lang.code
                    ? { background: "#b799e5", border: "1.5px solid #b799e5", color: "#fff" }
                    : { background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#a094a8" }
                }
              >
                <span className="text-xl">{lang.flag}</span>
                {lang.native}
              </button>
            ))}
          </div>
        </div>

        {/* Benutzername */}
        <form onSubmit={saveProfile} className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs" style={{ color: "#b799e5" }}>👤 Benutzername & E-Mail</p>
          <input type="text" required value={profile.name} placeholder="Benutzername"
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          <input type="email" required value={profile.email} placeholder="E-Mail"
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          <button type="submit" className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
            style={{ background: profileSaved ? "#cfe8d5" : "#b799e5" }}>
            {profileSaved ? "✓ Gespeichert" : "Speichern"}
          </button>
        </form>

        {/* Passwort */}
        <form onSubmit={savePassword} className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7" }}>
          <p className="text-xs" style={{ color: "#b799e5" }}>🔒 Passwort ändern</p>
          {["current", "newPw", "confirm"].map((field, i) => (
            <input key={field} type="password"
              placeholder={["Aktuelles Passwort", "Neues Passwort", "Passwort bestätigen"][i]}
              value={passwords[field as keyof typeof passwords]}
              onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
              className="rounded-2xl px-4 py-3 text-sm outline-none" style={inputStyle} />
          ))}
          {pwError && <p className="text-xs" style={{ color: "#b799e5" }}>{pwError}</p>}
          <button type="submit" className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
            style={{ background: pwSaved ? "#cfe8d5" : "#b799e5" }}>
            {pwSaved ? "✓ Geändert" : "Passwort ändern"}
          </button>
        </form>

        {/* Partner Link */}
        {partnerUrl && (
          <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
            <p className="text-xs" style={{ color: "#b799e5" }}>💑 Partner Link</p>
            <p className="text-xs leading-relaxed" style={{ color: "#a094a8" }}>
              Teile diesen Link mit deinem Partner. Er sieht deine aktuelle Phase und wird benachrichtigt.
            </p>
            <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7" }}>
              <span className="text-xs font-mono truncate" style={{ color: "#a094a8" }}>{partnerUrl}</span>
              <button onClick={copyLink} className="text-xs font-medium ml-2 shrink-0" style={{ color: "#b799e5" }}>
                {copied ? "✓" : "Kopieren"}
              </button>
            </div>
            <button
              onClick={shareLink}
              className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ background: shared ? "#cfe8d5" : "#b799e5" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shared ? "✓ Geteilt" : "Link teilen"}
            </button>
          </div>
        )}

        {/* Konto */}
        <div className="rounded-3xl p-5 flex flex-col gap-2" style={{ background: "#fff8f2", border: "1.5px solid #ffd9c7" }}>
          <p className="text-xs mb-1" style={{ color: "#b799e5" }}>🔑 Konto</p>
          <Link href="/login" className="w-full text-center font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
            style={{ background: "#ffd9c7", color: "#a07060" }}>
            Konto wechseln
          </Link>
          <Link href="/" className="w-full text-center font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity"
            style={{ background: "#fafafa", border: "1.5px solid #f4c7d7", color: "#b799e5" }}>
            Abmelden
          </Link>
        </div>

        <p className="text-center text-xs pb-4" style={{ color: "#b799e5" }}>Luma 🌸</p>
      </div>
    </main>
  );
}

