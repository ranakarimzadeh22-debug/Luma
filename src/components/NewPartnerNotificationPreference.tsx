"use client";

import { useState } from "react";

interface NewPartnerNotificationPreferenceProps {
  initialPreference: "yes" | "no" | null;
}

export default function NewPartnerNotificationPreference({ initialPreference }: NewPartnerNotificationPreferenceProps) {
  const [preference, setPreference] = useState(initialPreference);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(wantsNotifications: boolean) {
    setPending(true);
    setError("");
    const response = await fetch("/api/neu/partner/notification-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wantsNotifications }),
    }).catch(() => null);
    setPending(false);
    if (!response?.ok) {
      setError("Die Auswahl konnte nicht gespeichert werden.");
      return;
    }
    setPreference(wantsNotifications ? "yes" : "no");
  }

  if (preference !== null) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Deine Auswahl wurde gespeichert.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
      <p className="font-medium text-neutral-900">Möchtest du Benachrichtigungen erhalten?</p>
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => save(true)}
          disabled={pending}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          Ja, Benachrichtigungen aktivieren
        </button>
        <button
          type="button"
          onClick={() => save(false)}
          disabled={pending}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50"
        >
          Nein, später
        </button>
      </div>
    </div>
  );
}
