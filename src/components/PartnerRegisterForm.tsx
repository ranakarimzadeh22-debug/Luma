"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function PartnerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", passwordConfirmation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (form.password !== form.passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/partner-account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Registrierung ist gerade nicht möglich.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Konto erstellt, aber Anmeldung ist fehlgeschlagen. Bitte melde dich manuell an.");
      return;
    }

    router.push("/partner-bereich");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder="E-Mail"
        value={form.email}
        onChange={(event) => setForm({ ...form, email: event.target.value })}
        className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
        style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="Passwort (mind. 8 Zeichen)"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
        style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
      />
      <input
        type="password"
        required
        minLength={8}
        placeholder="Passwort wiederholen"
        value={form.passwordConfirmation}
        onChange={(event) => setForm({ ...form, passwordConfirmation: event.target.value })}
        className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors"
        style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
      />
      {error && <p className="text-center text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-2xl py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: "#b799e5" }}
      >
        {loading ? "Konto wird erstellt..." : "Konto erstellen"}
      </button>
    </form>
  );
}
