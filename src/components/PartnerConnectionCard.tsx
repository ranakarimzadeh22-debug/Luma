"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PartnerConnectionCard() {
  const { user } = useAuth();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [endPending, setEndPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/partner-connections/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (body) setConnected(Boolean(body.asOwner?.connected));
      });
  }, [user]);

  async function generateCode() {
    setPending(true);
    setError("");
    const response = await fetch("/api/partner-connections/code", { method: "POST" }).catch(() => null);
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
    const response = await fetch("/api/partner-connections/end", { method: "POST" }).catch(() => null);
    setEndPending(false);
    if (!response?.ok) return;
    setCode(null);
    setConnected(false);
  }

  if (!user || connected === null) return null;

  return (
    <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}>
      <p className="text-xs mb-1" style={{ color: "#b799e5" }}>💑 Partnerverbindung</p>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "#a094a8" }}>
        {connected
          ? "Eine Partnerverbindung ist aktiv."
          : "Erzeuge einen Code. Dein Partner meldet sich mit einem eigenen Konto an und gibt ihn ein. Der Code gilt zehn Minuten und funktioniert nur einmal."}
      </p>

      {connected ? (
        <button
          onClick={endConnection}
          disabled={endPending}
          className="w-full text-sm font-medium rounded-2xl py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
          style={{ border: "1.5px solid #f4c7d7", color: "#b799e5", background: "#fafafa" }}
        >
          {endPending ? "Wird beendet..." : "Verbindung beenden"}
        </button>
      ) : (
        <>
          {code && (
            <div className="flex items-center justify-center rounded-2xl px-4 py-3 mb-3" style={{ background: "#fafafa", border: "1.5px solid #f4c7d7" }}>
              <span className="text-xl font-semibold tracking-widest" style={{ color: "#3a2d3f" }}>{code}</span>
            </div>
          )}
          {error && <p className="text-xs mb-2" style={{ color: "#c4845a" }}>{error}</p>}
          <button
            onClick={generateCode}
            disabled={pending}
            className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "#b799e5" }}
          >
            {pending ? "Wird erzeugt..." : code ? "Neuen Code erzeugen" : "Code erzeugen"}
          </button>
        </>
      )}
    </div>
  );
}
