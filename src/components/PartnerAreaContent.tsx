"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type PartnerStatus = { connected: boolean };

export default function PartnerAreaContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<PartnerStatus | null>(null);
  const [code, setCode] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemPending, setRedeemPending] = useState(false);
  const [endPending, setEndPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/partner-connections/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body) setStatus({ connected: Boolean(body.asPartner?.connected) });
      });
  }, [user]);

  async function redeem(event: React.FormEvent) {
    event.preventDefault();
    setRedeemError("");
    setRedeemPending(true);
    const response = await fetch("/api/partner-connections/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => null);
    setRedeemPending(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setRedeemError(body?.error || "Der Code konnte nicht eingelöst werden.");
      return;
    }
    setStatus({ connected: true });
  }

  async function endConnection() {
    setEndPending(true);
    const response = await fetch("/api/partner-connections/end", { method: "POST" }).catch(() => null);
    setEndPending(false);
    if (response?.ok) setStatus({ connected: false });
  }

  if (authLoading) {
    return <p className="text-center text-sm" style={{ color: "#a094a8" }}>Wird geladen...</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm" style={{ color: "#a094a8" }}>
          Du brauchst ein eigenes Konto, bevor du einen Verbindungscode eingeben kannst.
        </p>
        <button
          onClick={() => router.push("/partner-registrieren")}
          className="w-full rounded-2xl py-3.5 text-sm font-medium text-white hover:opacity-90"
          style={{ background: "#b799e5" }}
        >
          Eigenes Konto erstellen
        </button>
        <button
          onClick={() => router.push("/partner-anmelden")}
          className="w-full rounded-2xl py-3.5 text-sm font-medium hover:bg-neutral-50"
          style={{ border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
        >
          Anmelden
        </button>
      </div>
    );
  }

  if (status === null) {
    return <p className="text-center text-sm" style={{ color: "#a094a8" }}>Wird geladen...</p>;
  }

  if (status.connected) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl p-5 text-center" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
          <p className="text-lg font-medium" style={{ color: "#3a2d3f" }}>Verbindung aktiv</p>
          <p className="mt-2 text-xs" style={{ color: "#a094a8" }}>Weitere Inhalte folgen in einem späteren Schritt.</p>
        </div>
        <button
          onClick={endConnection}
          disabled={endPending}
          className="w-full rounded-2xl py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          style={{ border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
        >
          {endPending ? "Wird beendet..." : "Verbindung beenden"}
        </button>
        <button onClick={() => signOut()} className="w-full text-center text-xs" style={{ color: "#a094a8" }}>
          Abmelden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={redeem} className="flex flex-col gap-3">
      <input
        type="text"
        required
        maxLength={16}
        placeholder="Verbindungscode"
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        className="w-full rounded-2xl px-4 py-3.5 text-center text-lg tracking-widest outline-none"
        style={{ background: "#fff8f2", border: "1.5px solid #f4c7d7", color: "#3a2d3f" }}
      />
      {redeemError && <p className="text-center text-xs text-red-400">{redeemError}</p>}
      <button
        type="submit"
        disabled={redeemPending || !code.trim()}
        className="w-full rounded-2xl py-3.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        style={{ background: "#b799e5" }}
      >
        {redeemPending ? "Wird geprüft..." : "Verbinden"}
      </button>
      <button onClick={() => signOut()} type="button" className="text-center text-xs" style={{ color: "#a094a8" }}>
        Abmelden
      </button>
    </form>
  );
}
