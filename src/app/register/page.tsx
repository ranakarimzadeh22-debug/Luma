"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Platzhalter — hier später echte Auth
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-md mb-3">
          <span className="text-3xl">🌸</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Konto erstellen</h1>
        <p className="text-gray-500 text-sm mt-1">Starte deinen Zyklus-Begleiter</p>
      </div>

      {/* Form */}
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
      <Link href="/" className="text-gray-400 text-xs mt-4">
        ← Zurück
      </Link>
    </main>
  );
}
