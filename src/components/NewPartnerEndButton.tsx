"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPartnerEndButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function end() {
    setPending(true);
    setError("");
    const response = await fetch("/api/neu/partner/end", { method: "POST" }).catch(() => null);
    setPending(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Die Verbindung konnte nicht beendet werden.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={end}
        disabled={pending}
        className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50"
      >
        {pending ? "Wird beendet …" : "Verbindung beenden"}
      </button>
    </div>
  );
}
