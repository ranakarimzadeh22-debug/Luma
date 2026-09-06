"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayDateOnly } from "@/lib/new-period-validation";

interface EarlierPeriodDraft {
  key: number;
  startDate: string;
  endDate: string;
}

const MAX_EARLIER_PERIODS = 3;

let nextKey = 0;
function emptyEarlierPeriod(): EarlierPeriodDraft {
  nextKey += 1;
  return { key: nextKey, startDate: "", endDate: "" };
}

type Step = "last_period" | "earlier_periods" | "cycle_length";

export default function NewPeriodHistoryOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("last_period");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [earlierPeriods, setEarlierPeriods] = useState<EarlierPeriodDraft[]>([]);
  const [cycleLengthDays, setCycleLengthDays] = useState("");
  const [cycleLengthUnknown, setCycleLengthUnknown] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const today = todayDateOnly();

  function validLastPeriod(): boolean {
    if (!startDate || !endDate) {
      setError("Trage Beginn und Ende deiner letzten Periode ein oder überspringe diesen Schritt.");
      return false;
    }
    if (startDate > endDate) {
      setError("Der letzte Periodentag darf nicht vor dem ersten liegen.");
      return false;
    }
    if (startDate > today || endDate > today) {
      setError("Zukünftige Periodentage können nicht eingetragen werden.");
      return false;
    }
    return true;
  }

  function continueFromLastPeriod() {
    if (!validLastPeriod()) return;
    setError("");
    setStep("earlier_periods");
  }

  function addEarlierPeriod() {
    if (earlierPeriods.length >= MAX_EARLIER_PERIODS) return;
    setEarlierPeriods((current) => [...current, emptyEarlierPeriod()]);
  }

  function updateEarlierPeriod(key: number, field: "startDate" | "endDate", value: string) {
    setEarlierPeriods((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function removeEarlierPeriod(key: number) {
    setEarlierPeriods((current) => current.filter((row) => row.key !== key));
  }

  function continueFromEarlierPeriods() {
    const filled = earlierPeriods.filter((row) => row.startDate && row.endDate);
    for (const row of filled) {
      if (row.startDate > row.endDate) {
        setError("Der letzte Periodentag darf nicht vor dem ersten liegen.");
        return;
      }
      if (row.startDate > today || row.endDate > today) {
        setError("Zukünftige Periodentage können nicht eingetragen werden.");
        return;
      }
    }
    setError("");
    setStep("cycle_length");
  }

  async function finish() {
    setPending(true);
    setError("");

    const periodsToSave = [
      { startDate, endDate },
      ...earlierPeriods.filter((row) => row.startDate && row.endDate),
    ];

    for (const period of periodsToSave) {
      const response = await fetch("/api/neu/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(period),
      }).catch(() => null);

      if (!response?.ok) {
        const body = await response?.json().catch(() => null);
        setError(body?.error || "Eine Periode konnte nicht gespeichert werden.");
        setPending(false);
        return;
      }
    }

    if (!cycleLengthUnknown && cycleLengthDays) {
      const response = await fetch("/api/neu/cycle-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastPeriodStart: startDate,
          bleedingDurationDays: null,
          cycleLengthDays: Number(cycleLengthDays),
          regularity: "unknown",
        }),
      }).catch(() => null);

      if (!response?.ok) {
        const body = await response?.json().catch(() => null);
        setError(body?.error || "Die Zykluslänge konnte nicht gespeichert werden.");
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

  if (step === "last_period") {
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
            onClick={continueFromLastPeriod}
            disabled={pending}
            className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            Weiter
          </button>
        </div>
      </section>
    );
  }

  if (step === "earlier_periods") {
    return (
      <section className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Freiwillig</p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Frühere Perioden ergänzen
          </h1>
          <p className="text-sm leading-6 text-neutral-600">
            Je mehr frühere Perioden du ergänzt, desto genauer wird deine persönliche Zyklusansicht.
            Das ist freiwillig – du kannst auch ohne weitere Angaben fortfahren.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {earlierPeriods.map((row, index) => (
            <div key={row.key} className="flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-700">Frühere Periode {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeEarlierPeriod(row.key)}
                  className="text-xs font-medium text-neutral-500 underline underline-offset-4"
                >
                  Entfernen
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                  Erster Tag
                  <input
                    type="date"
                    max={today}
                    value={row.startDate}
                    onChange={(event) => updateEarlierPeriod(row.key, "startDate", event.target.value)}
                    className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
                  Letzter Tag
                  <input
                    type="date"
                    max={today}
                    value={row.endDate}
                    onChange={(event) => updateEarlierPeriod(row.key, "endDate", event.target.value)}
                    className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950"
                  />
                </label>
              </div>
            </div>
          ))}

          {earlierPeriods.length < MAX_EARLIER_PERIODS && (
            <button
              type="button"
              onClick={addEarlierPeriod}
              className="rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              + Frühere Periode ergänzen
            </button>
          )}
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setError(""); setStep("last_period"); }}
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium"
          >
            Zurück
          </button>
          <button
            type="button"
            onClick={continueFromEarlierPeriods}
            className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white"
          >
            Weiter
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-500">Freiwillig</p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Mein Zyklus dauert ungefähr … Tage
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          Damit Luma dir schon vor genügend echten Perioden eine erste, als unsicher markierte
          Orientierung zeigen kann.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-neutral-700">
          Anzahl der Tage
          <input
            type="number"
            min="21"
            max="45"
            inputMode="numeric"
            disabled={cycleLengthUnknown}
            value={cycleLengthDays}
            onChange={(event) => { setCycleLengthDays(event.target.value); setCycleLengthUnknown(false); }}
            className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3 disabled:bg-neutral-100"
          />
        </label>
        <button
          type="button"
          onClick={() => { setCycleLengthDays(""); setCycleLengthUnknown(true); }}
          className={`rounded-xl border px-4 py-3 text-sm ${cycleLengthUnknown ? "border-neutral-900 bg-neutral-100" : "border-neutral-300"}`}
        >
          Ich weiß es nicht
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { setError(""); setStep("earlier_periods"); }}
          disabled={pending}
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium disabled:opacity-50"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={pending}
          className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Wird gespeichert …" : "Speichern und weiter"}
        </button>
      </div>
    </section>
  );
}
