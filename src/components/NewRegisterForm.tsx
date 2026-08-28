"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") || "");
    if (password !== passwordConfirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      setPending(false);
      return;
    }

    const response = await fetch("/api/neu/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password,
        passwordConfirmation,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Registrierung ist gerade nicht möglich.");
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
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-neutral-700"
        />
        <span className="text-xs font-normal text-neutral-500">Mindestens 8 Zeichen</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        Passwort wiederholen
        <input
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
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
        {pending ? "Konto wird erstellt …" : "Konto erstellen"}
      </button>
    </form>
  );
}
