"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
            <span className="text-2xl">🌸</span>
          </div>
          <h1 className="text-2xl font-light text-gray-900">Anmelden</h1>
          <p className="text-gray-400 text-xs mt-1">Willkommen zurück</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="E-Mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-rose-300 transition-colors placeholder:text-gray-300"
          />
          <input
            type="password"
            required
            placeholder="Passwort"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-rose-300 transition-colors placeholder:text-gray-300"
          />
          <button
            type="submit"
            className="w-full bg-rose-400 text-white font-medium rounded-2xl py-4 text-sm hover:bg-rose-500 transition-colors mt-2"
          >
            Anmelden
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-rose-400 font-medium">
            Registrieren
          </Link>
        </p>
        <div className="flex justify-center mt-4">
          <Link href="/" className="text-gray-300 text-xs">← Zurück</Link>
        </div>
      </div>
    </main>
  );
}
