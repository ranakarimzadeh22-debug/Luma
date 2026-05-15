"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generatePartnerCode } from "@/lib/partner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [done, setDone] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = generatePartnerCode(form.name);
    setPartnerCode(code);
    localStorage.setItem("luma-user", JSON.stringify({ name: form.name, email: form.email, partnerCode: code }));
    setDone(true);
  }

  function copyLink() {
    const url = `${window.location.origin}/partner/${partnerCode}`;
    navigator.clipboard.writeText(url);
  }

  if (done) {
    return (
      <main className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs flex flex-col items-center gap-5">
          {/* Success */}
          <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
            🌸
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center">Willkommen, {form.name}!</h1>
          <p className="text-gray-500 text-sm text-center">Dein Konto wurde erstellt. Teile diesen Link mit deinem Partner:</p>

          {/* Partner Link Card */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💑</span>
              <p className="font-semibold text-gray-700">Partner-Link</p>
            </div>
            <div className="bg-rose-50 rounded-xl px-4 py-3 text-xs text-gray-500 break-all font-mono">
              {typeof window !== "undefined" ? `${window.location.origin}/partner/${partnerCode}` : `/partner/${partnerCode}`}
            </div>
            <button
              onClick={copyLink}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition-opacity"
            >
              🔗 Link kopieren
            </button>
          </div>

          <p className="text-gray-400 text-xs text-center">
            Dein Partner kann mit diesem Link deine Zyklusinfos sehen — ohne sich zu registrieren.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-white border-2 border-rose-200 text-rose-500 font-semibold rounded-2xl py-3 text-sm hover:bg-rose-50 transition-colors"
          >
            Zum Dashboard →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-md mb-3">
          <span className="text-3xl">🌸</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Konto erstellen</h1>
        <p className="text-gray-500 text-sm mt-1">Starte deinen Zyklus-Begleiter</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Benutzername</label>
          <input
            type="text"
            required
            placeholder="Dein Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">E-Mail</label>
          <input
            type="email"
            required
            placeholder="deine@email.de"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Passwort</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity mt-2"
        >
          Konto erstellen
        </button>
      </form>

      <p className="text-gray-500 text-sm mt-6">
        Schon ein Konto?{" "}
        <Link href="/login" className="text-rose-500 font-semibold">
          Anmelden
        </Link>
      </p>
      <Link href="/" className="text-gray-400 text-xs mt-4">← Zurück</Link>
    </main>
  );
}
