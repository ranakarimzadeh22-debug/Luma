"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFirstNameForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/neu/profile/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: formData.get("firstName") }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Der Vorname konnte gerade nicht gespeichert werden.");
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        Vorname
        <input
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
          maxLength={50}
          autoFocus
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-neutral-700"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Vorname wird gespeichert …" : "Vorname speichern"}
      </button>
    </form>
  );
}
