"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { type Locale } from "@/lib/i18n";

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

