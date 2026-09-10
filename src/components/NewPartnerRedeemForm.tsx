"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPartnerRedeemForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const response = await fetch("/api/neu/partner/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => null);

    setPending(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Der Code konnte nicht eingelöst werden.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
        Verbindungscode
        <input
          name="code"
          type="text"
          autoComplete="off"
          required
          maxLength={16}
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-center text-lg tracking-widest text-neutral-950 outline-none focus:border-neutral-700"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending || !code.trim()}
        className="rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Wird geprüft …" : "Verbinden"}
      </button>
    </form>
  );
}
