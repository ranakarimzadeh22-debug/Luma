"use client";

import { useState } from "react";

interface NewPartnerCycleRingSharingToggleProps {
  initialShared: boolean;
}

export default function NewPartnerCycleRingSharingToggle({ initialShared }: NewPartnerCycleRingSharingToggleProps) {
  const [shared, setShared] = useState(initialShared);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    const next = !shared;
    setPending(true);
    setError("");
    const response = await fetch("/api/neu/partner/cycle-ring-sharing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shared: next }),
    }).catch(() => null);
    setPending(false);
    if (!response?.ok) {
      setError("Die Änderung konnte nicht gespeichert werden.");
      return;
    }
    setShared(next);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-950">Zyklus-Kreis für Partner freigeben</h2>
        <p className="text-sm text-neutral-600">
          {shared
            ? "Dein Partner/deine Partnerin sieht den lesenden Zyklus-Kreis mit der aktuellen Phase."
            : "Dein Partner/deine Partnerin sieht keinen Zyklus-Kreis, bis du die Freigabe einschaltest."}
        </p>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={shared}
        className={`rounded-xl px-5 py-3 text-sm font-medium disabled:opacity-50 ${
          shared
            ? "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
            : "bg-neutral-900 text-white hover:bg-neutral-700"
        }`}
      >
        {pending ? "Wird gespeichert …" : shared ? "Freigabe ausschalten" : "Freigabe einschalten"}
      </button>
    </div>
  );
}
