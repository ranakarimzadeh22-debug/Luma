"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayDateOnly } from "@/lib/new-period-validation";

export default function NewPeriodHistoryOnboarding() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const today = todayDateOnly();

  async function submit() {
    if (!startDate || !endDate) {
      setError("Trage Beginn und Ende deiner letzten Periode ein oder überspringe diesen Schritt.");
      return;
    }
    if (startDate > endDate) {
      setError("Der letzte Periodentag darf nicht vor dem ersten liegen.");
      return;
    }
    if (startDate > today || endDate > today) {
      setError("Zukünftige Periodentage können nicht eingetragen werden.");
      return;
    }

    setPending(true);
    setError("");

    const response = await fetch("/api/neu/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Die Periode konnte nicht gespeichert werden.");
      setPending(false);
      return;
    }

    router.push("/neu");
    router.refresh();
  }

  async function skip() {
    setPending(true);
    setError("");
    const response = await fetch("/api/neu/onboarding/period-history/skip", {
      method: "POST",
    }).catch(() => null);

    if (!response?.ok) {
      setError("Das Überspringen hat gerade nicht funktioniert. Bitte versuche es erneut.");
      setPending(false);
      return;
    }

    router.push("/neu");
    router.refresh();
  }

  return (
    <section className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-500">Nur noch ein Schritt</p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Deine letzte Periode
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          Trage Beginn und Ende deiner letzten Periode ein, damit Luma deinen Zyklus von Anfang an
          vorhersagen kann.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
          Erster Tag
          <input
            type="date"
            max={today}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
          Letzter Tag
          <input
            type="date"
            max={today}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950"
          />
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={skip}
          disabled={pending}
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium disabled:opacity-50"
        >
          Überspringen
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Wird gespeichert …" : "Speichern und weiter"}
        </button>
      </div>
    </section>
  );
}
