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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-12 pb-5">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link href="/dashboard" className="text-gray-300 hover:text-gray-500 text-lg">←</Link>
          <h1 className="text-lg font-medium text-gray-800">Einstellungen</h1>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Sprache */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 mb-3">🌍 Sprache</p>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 border text-xs transition-all ${
                  locale === lang.code
                    ? "border-rose-300 bg-rose-50 text-rose-500 font-medium"
                    : "border-gray-100 bg-gray-50 text-gray-400 hover:border-rose-200"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                {lang.native}
              </button>
            ))}
          </div>
        </div>

        {/* Benutzername & E-Mail */}
        <form onSubmit={saveProfile} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <p className="text-xs text-gray-400">👤 Benutzername & E-Mail</p>
          <input
            type="text"
            required
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Benutzername"
            className="border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-300 transition-colors bg-gray-50 placeholder:text-gray-300"
          />
          <input
            type="email"
            required
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="E-Mail"
            className="border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-300 transition-colors bg-gray-50 placeholder:text-gray-300"
          />
          <button type="submit" className="w-full bg-rose-400 text-white font-medium rounded-2xl py-3 text-sm hover:bg-rose-500 transition-colors">
            {profileSaved ? "✓ Gespeichert" : "Speichern"}
          </button>
        </form>

        {/* Passwort */}
        <form onSubmit={savePassword} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <p className="text-xs text-gray-400">🔒 Passwort ändern</p>
          <input type="password" required placeholder="Aktuelles Passwort" value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            className="border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-300 bg-gray-50 placeholder:text-gray-300 transition-colors" />
          <input type="password" required placeholder="Neues Passwort" value={passwords.newPw}
            onChange={(e) => setPasswords({ ...passwords, newPw: e.target.value })}
            className="border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-300 bg-gray-50 placeholder:text-gray-300 transition-colors" />
          <input type="password" required placeholder="Passwort bestätigen" value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            className="border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-rose-300 bg-gray-50 placeholder:text-gray-300 transition-colors" />
          {pwError && <p className="text-rose-400 text-xs">{pwError}</p>}
          <button type="submit" className="w-full bg-rose-400 text-white font-medium rounded-2xl py-3 text-sm hover:bg-rose-500 transition-colors">
            {pwSaved ? "✓ Geändert" : "Passwort ändern"}
          </button>
        </form>

        {/* Konto */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-2">
          <p className="text-xs text-gray-400 mb-1">🔑 Konto</p>
          <Link href="/login" className="w-full text-center border border-rose-100 text-rose-400 font-medium rounded-2xl py-3 text-sm hover:bg-rose-50 transition-colors">
            Konto wechseln
          </Link>
          <Link href="/" className="w-full text-center border border-gray-100 text-gray-300 font-medium rounded-2xl py-3 text-sm hover:bg-gray-50 transition-colors">
            Abmelden
          </Link>
        </div>

        <p className="text-center text-xs text-gray-300 pb-4">Luma 🌸</p>
      </div>
    </main>
  );
}
