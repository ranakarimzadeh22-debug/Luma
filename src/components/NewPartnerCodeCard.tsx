"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewPartnerCodeCardProps {
  isConnected: boolean;
}

export default function NewPartnerCodeCard({ isConnected }: NewPartnerCodeCardProps) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [endPending, setEndPending] = useState(false);

  async function generateCode() {
    setPending(true);
    setError("");
    const response = await fetch("/api/neu/partner/code", { method: "POST" }).catch(() => null);
    setPending(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Der Code konnte nicht erzeugt werden.");
      return;
    }
    const body = (await response.json()) as { code: string };
    setCode(body.code);
  }

  async function endConnection() {
    setEndPending(true);
    setError("");
    const response = await fetch("/api/neu/partner/end", { method: "POST" }).catch(() => null);
    setEndPending(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Die Verbindung konnte nicht beendet werden.");
      return;
    }
    setCode(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-950">Partnerverbindung</h2>
        <p className="text-sm text-neutral-600">
          {isConnected
            ? "Eine Partnerverbindung ist aktiv."
            : "Erzeuge einen Code, damit dein Partner sich verbinden kann. Der Code gilt zehn Minuten und funktioniert nur einmal."}
        </p>
      </div>

      {isConnected ? (
        <button
          type="button"
          onClick={endConnection}
          disabled={endPending}
          className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50"
        >
          {endPending ? "Wird beendet …" : "Verbindung beenden"}
        </button>
      ) : (
        <>
          {code && (
            <p className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-2xl font-semibold tracking-widest text-neutral-950">
              {code}
            </p>
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button
            type="button"
            onClick={generateCode}
            disabled={pending}
            className="rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "Wird erzeugt …" : code ? "Neuen Code erzeugen" : "Code erzeugen"}
          </button>
        </>
      )}
    </div>
  );
}
