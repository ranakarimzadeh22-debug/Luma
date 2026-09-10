"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function PartnerLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-Mail oder Passwort ist falsch.");
      setLoading(false);
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
        placeholder="Passwort"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
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
        {loading ? "Wird angemeldet..." : "Anmelden"}
      </button>
    </form>
  );
}
