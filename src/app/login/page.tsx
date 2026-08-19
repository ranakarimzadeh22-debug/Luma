"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import LumaLogo from "@/components/LumaLogo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-8">
          <LumaLogo size={0.7} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email" required placeholder="E-Mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
            style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
          />
          <input
            type="password" required placeholder="Passwort"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
            style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
          />

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-medium rounded-2xl py-4 text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "#b799e5" }}
          >
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#a094a8" }}>
          Noch kein Konto?{" "}
          <Link href="/register" className="font-medium" style={{ color: "#b799e5" }}>Registrieren</Link>
        </p>
        <div className="flex justify-center mt-4">
          <Link href="/" className="text-xs" style={{ color: "#b799e5" }}>← Zurück</Link>
        </div>
      </div>
    </main>
  );
}