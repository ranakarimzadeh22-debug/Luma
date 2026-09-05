"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayDateOnly } from "@/lib/new-period-validation";

interface DraftRow {
  key: number;
  startDate: string;
  endDate: string;
}

const MAX_ROWS = 6;

let nextKey = 0;
function emptyRow(): DraftRow {
  nextKey += 1;
  return { key: nextKey, startDate: "", endDate: "" };
}

export default function NewPeriodHistoryOnboarding() {
  const router = useRouter();
  const [rows, setRows] = useState<DraftRow[]>([emptyRow()]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const today = todayDateOnly();

  const filledRows = rows.filter((row) => row.startDate && row.endDate);

  function updateRow(key: number, field: "startDate" | "endDate", value: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(key: number) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  async function submit() {
    if (filledRows.length === 0) {
      setError("Trage mindestens eine Periode ein oder überspringe diesen Schritt.");
      return;
    }
    for (const row of filledRows) {
      if (row.startDate > row.endDate) {
        setError("Der letzte Periodentag darf nicht vor dem ersten liegen.");
        return;
      }
      if (row.startDate > today || row.endDate > today) {
        setError("Zukünftige Periodentage können nicht eingetragen werden.");
        return;
      }
    }

    setPending(true);
    setError("");

    for (const row of filledRows) {
      const response = await fetch("/api/neu/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: row.startDate, endDate: row.endDate }),
      }).catch(() => null);

      if (!response?.ok) {
        const body = await response?.json().catch(() => null);
        setError(body?.error || "Eine Periode konnte nicht gespeichert werden.");
        setPending(false);
        return;
      }
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
          Deine letzten Perioden
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          Trage Beginn und Ende deiner letzten drei bis sechs Perioden ein, damit Luma deinen Zyklus
          von Anfang an möglichst genau vorhersagen kann.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div key={row.key} className="flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700">Periode {index + 1}</p>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="text-xs font-medium text-neutral-500 underline underline-offset-4"
                >
                  Entfernen
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                Erster Tag
                <input
                  type="date"
                  max={today}
                  value={row.startDate}
                  onChange={(event) => updateRow(row.key, "startDate", event.target.value)}
                  className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                Letzter Tag
                <input
                  type="date"
                  max={today}
                  value={row.endDate}
                  onChange={(event) => updateRow(row.key, "endDate", event.target.value)}
                  className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950"
                />
              </label>
            </div>
          </div>
        ))}

        {rows.length < MAX_ROWS && (
          <button
            type="button"
            onClick={addRow}
            className="rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            + Weitere Periode hinzufügen
          </button>
        )}
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
