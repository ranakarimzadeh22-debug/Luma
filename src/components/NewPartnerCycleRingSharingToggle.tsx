"use client";
import { useState } from "react";

export default function NewPartnerCycleRingSharingToggle({ initialShared }: { initialShared: boolean }) {
  const [shared, setShared] = useState(initialShared);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    const next = !shared; setPending(true); setError("");
    const response = await fetch("/api/neu/partner/cycle-ring-sharing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shared: next }) }).catch(() => null);
    setPending(false);
    if (!response?.ok) { setError("Die Änderung konnte nicht gespeichert werden."); return; }
    setShared(next);
  }
  return <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6">
    <div className="space-y-1"><h2 className="text-lg font-semibold text-neutral-950">Zyklus-Kreis für Partner freigeben</h2><p className="text-sm text-neutral-600">{shared ? "Dein Partner/deine Partnerin sieht Ring und Zyklusinformationen nur lesend." : "Ring und Zyklusinformationen sind für deinen Partner/deine Partnerin verborgen."}</p></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="button" onClick={toggle} disabled={pending} aria-pressed={shared} className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{pending ? "Wird gespeichert …" : shared ? "Freigabe ausschalten" : "Freigabe einschalten"}</button>
  </div>;
}
