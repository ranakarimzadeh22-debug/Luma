"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/neu/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Anmeldung ist gerade nicht möglich.");
      setPending(false);
      return;
    }

    router.push("/neu");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        E-Mail-Adresse
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-neutral-700"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        Passwort
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={128}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-neutral-700"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Anmeldung läuft …" : "Anmelden"}
      </button>
    </form>
  );
}
