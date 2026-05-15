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
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#cdb4db" }}>
            <span className="text-2xl">🌸</span>
          </div>
          <h1 className="text-2xl font-light" style={{ color: "#3a2d3f" }}>Anmelden</h1>
          <p className="text-xs mt-1" style={{ color: "#b79bcf" }}>Willkommen zurück</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email" required placeholder="E-Mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
            style={{ background: "#fff8f2", border: "1.5px solid #f8d7e6", color: "#3a2d3f" }}
          />
          <input
            type="password" required placeholder="Passwort"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
            style={{ background: "#fff8f2", border: "1.5px solid #f8d7e6", color: "#3a2d3f" }}
          />
          <button
            type="submit"
            className="w-full text-white font-medium rounded-2xl py-4 text-sm mt-2 hover:opacity-90 transition-opacity"
            style={{ background: "#b79bcf" }}
          >
            Anmelden
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#a094a8" }}>
          Noch kein Konto?{" "}
          <Link href="/register" className="font-medium" style={{ color: "#b79bcf" }}>Registrieren</Link>
        </p>
        <div className="flex justify-center mt-4">
          <Link href="/" className="text-xs" style={{ color: "#cdb4db" }}>← Zurück</Link>
        </div>
      </div>
    </main>
  );
}
