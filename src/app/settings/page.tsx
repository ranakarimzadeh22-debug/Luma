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
    if (passwords.newPw !== passwords.confirm) {
      setPwError("Passwörter stimmen nicht überein");
      return;
    }
    if (passwords.newPw.length < 6) {
      setPwError("Passwort muss mindestens 6 Zeichen haben");
      return;
    }
    setPwSaved(true);
    setPasswords({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2000);
  }

  return (
    <main className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/80 hover:text-white text-xl">←</Link>
          <h1 className="text-xl font-bold text-white">Einstellungen</h1>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-5 max-w-md mx-auto">

        {/* Sprache */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">🌍 Sprache</h2>
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 border-2 transition-all text-sm ${
                  locale === lang.code
                    ? "border-rose-400 bg-rose-50 text-rose-600 font-semibold"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-rose-200"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.native}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Benutzername & E-Mail */}
        <form onSubmit={saveProfile} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700">👤 Benutzername & E-Mail</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Benutzername</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">E-Mail</label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-3 shadow-sm hover:opacity-90 transition-opacity"
          >
            {profileSaved ? "✓ Gespeichert" : "Speichern"}
          </button>
        </form>

        {/* Passwort ändern */}
        <form onSubmit={savePassword} className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="font-semibold text-gray-700">🔒 Passwort ändern</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Aktuelles Passwort</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Neues Passwort</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwords.newPw}
              onChange={(e) => setPasswords({ ...passwords, newPw: e.target.value })}
              className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Passwort bestätigen</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
            />
          </div>

          {pwError && <p className="text-rose-500 text-xs">{pwError}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-3 shadow-sm hover:opacity-90 transition-opacity"
          >
            {pwSaved ? "✓ Passwort geändert" : "Passwort ändern"}
          </button>
        </form>

        {/* Login / Logout */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <h2 className="font-semibold text-gray-700">🔑 Konto</h2>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-rose-50 border-2 border-rose-200 text-rose-500 font-semibold rounded-2xl py-3 text-sm hover:bg-rose-100 transition-colors"
          >
            Anmelden / Konto wechseln
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-400 font-semibold rounded-2xl py-3 text-sm hover:bg-gray-50 transition-colors"
          >
            Abmelden
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">Luma – Dein Zyklus-Begleiter 🌸</p>
      </div>
    </main>
  );
}
