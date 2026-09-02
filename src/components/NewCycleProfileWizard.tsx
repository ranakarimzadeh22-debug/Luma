"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NewCycleProfileInput, NewCycleRegularity } from "@/lib/new-cycle-profile-validation";

type Draft = {
  lastPeriodStart: string;
  lastPeriodUnknown: boolean;
  bleedingDurationDays: string;
  bleedingDurationUnknown: boolean;
  cycleLengthDays: string;
  cycleLengthUnknown: boolean;
  regularity: NewCycleRegularity | "";
};

const questions = [
  "Erster Tag der letzten Periode",
  "Übliche Blutungsdauer",
  "Übliche Zykluslänge",
  "Regelmäßigkeit",
];

function initialDraft(profile: NewCycleProfileInput | null): Draft {
  return {
    lastPeriodStart: profile?.lastPeriodStart ?? "",
    lastPeriodUnknown: profile ? profile.lastPeriodStart === null : false,
    bleedingDurationDays: profile?.bleedingDurationDays?.toString() ?? "",
    bleedingDurationUnknown: profile ? profile.bleedingDurationDays === null : false,
    cycleLengthDays: profile?.cycleLengthDays?.toString() ?? "",
    cycleLengthUnknown: profile ? profile.cycleLengthDays === null : false,
    regularity: profile?.regularity ?? "",
  };
}

function display(value: string, suffix = ""): string {
  return value ? `${value}${suffix}` : "Ich weiß es nicht";
}

export default function NewCycleProfileWizard({
  initialProfile,
}: {
  initialProfile: NewCycleProfileInput | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(() => initialDraft(initialProfile));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  function canContinue(): boolean {
    if (step === 0) return draft.lastPeriodUnknown || Boolean(draft.lastPeriodStart);
    if (step === 1) return draft.bleedingDurationUnknown || Boolean(draft.bleedingDurationDays);
    if (step === 2) return draft.cycleLengthUnknown || Boolean(draft.cycleLengthDays);
    if (step === 3) return Boolean(draft.regularity);
    return true;
  }

  function next() {
    if (!canContinue()) {
      setError("Bitte beantworte die Frage oder wähle „Ich weiß es nicht“.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 4));
  }

  const payload: NewCycleProfileInput = {
    lastPeriodStart: draft.lastPeriodUnknown ? null : draft.lastPeriodStart || null,
    bleedingDurationDays: draft.bleedingDurationUnknown
      ? null
      : Number(draft.bleedingDurationDays) || null,
    cycleLengthDays: draft.cycleLengthUnknown ? null : Number(draft.cycleLengthDays) || null,
    regularity: draft.regularity || "unknown",
  };

  async function save() {
    setPending(true);
    setError("");
    const response = await fetch("/api/neu/cycle-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Die Angaben konnten gerade nicht gespeichert werden.");
      setPending(false);
      return;
    }

    router.push("/neu?zyklusprofil=gespeichert");
    router.refresh();
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      {step < 4 ? (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Frage {step + 1} von 4</p>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100" aria-hidden="true">
              <div className="h-full bg-neutral-900" style={{ width: `${(step + 1) * 25}%` }} />
            </div>
            <h1 className="pt-2 text-2xl font-semibold tracking-tight text-neutral-950">
              {questions[step]}
            </h1>
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-neutral-700">
                Datum
                <input
                  type="date"
                  max={today}
                  disabled={draft.lastPeriodUnknown}
                  value={draft.lastPeriodStart}
                  onChange={(event) => setDraft({ ...draft, lastPeriodStart: event.target.value, lastPeriodUnknown: false })}
                  className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3 disabled:bg-neutral-100"
                />
              </label>
              <button type="button" onClick={() => setDraft({ ...draft, lastPeriodStart: "", lastPeriodUnknown: true })} className={`rounded-xl border px-4 py-3 text-sm ${draft.lastPeriodUnknown ? "border-neutral-900 bg-neutral-100" : "border-neutral-300"}`}>
                Ich weiß es nicht
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-neutral-700">
                Anzahl der Tage
                <input type="number" min="1" max="366" inputMode="numeric" disabled={draft.bleedingDurationUnknown} value={draft.bleedingDurationDays} onChange={(event) => setDraft({ ...draft, bleedingDurationDays: event.target.value, bleedingDurationUnknown: false })} className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3 disabled:bg-neutral-100" />
              </label>
              <button type="button" onClick={() => setDraft({ ...draft, bleedingDurationDays: "", bleedingDurationUnknown: true })} className={`rounded-xl border px-4 py-3 text-sm ${draft.bleedingDurationUnknown ? "border-neutral-900 bg-neutral-100" : "border-neutral-300"}`}>
                Ich weiß es nicht
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-neutral-700">
                Anzahl der Tage
                <input type="number" min="1" max="730" inputMode="numeric" disabled={draft.cycleLengthUnknown} value={draft.cycleLengthDays} onChange={(event) => setDraft({ ...draft, cycleLengthDays: event.target.value, cycleLengthUnknown: false })} className="mt-1.5 w-full rounded-xl border border-neutral-300 px-4 py-3 disabled:bg-neutral-100" />
              </label>
              <button type="button" onClick={() => setDraft({ ...draft, cycleLengthDays: "", cycleLengthUnknown: true })} className={`rounded-xl border px-4 py-3 text-sm ${draft.cycleLengthUnknown ? "border-neutral-900 bg-neutral-100" : "border-neutral-300"}`}>
                Ich weiß es nicht
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              {(["regular", "irregular", "unknown"] as const).map((value) => {
                const label = value === "regular" ? "Regelmäßig" : value === "irregular" ? "Unregelmäßig" : "Ich weiß es nicht";
                return <button key={value} type="button" onClick={() => setDraft({ ...draft, regularity: value })} className={`rounded-xl border px-4 py-3 text-sm ${draft.regularity === value ? "border-neutral-900 bg-neutral-100" : "border-neutral-300"}`}>{label}</button>;
              })}
            </div>
          )}

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-3">
            {step > 0 ? <button type="button" onClick={() => { setError(""); setStep(step - 1); }} className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm">Zurück</button> : <Link href="/neu" className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm">Abbrechen</Link>}
            <button type="button" onClick={next} className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white">Weiter</button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Zusammenfassung</p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">Sind deine Angaben richtig?</h1>
            <p className="text-sm text-neutral-600">Erst mit „Speichern“ werden sie dauerhaft übernommen.</p>
          </div>
          <dl className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
            {[
              [questions[0], draft.lastPeriodUnknown ? "Ich weiß es nicht" : display(draft.lastPeriodStart)],
              [questions[1], draft.bleedingDurationUnknown ? "Ich weiß es nicht" : display(draft.bleedingDurationDays, " Tage")],
              [questions[2], draft.cycleLengthUnknown ? "Ich weiß es nicht" : display(draft.cycleLengthDays, " Tage")],
              [questions[3], draft.regularity === "regular" ? "Regelmäßig" : draft.regularity === "irregular" ? "Unregelmäßig" : "Ich weiß es nicht"],
            ].map(([label, value], index) => (
              <div key={label} className="flex items-center justify-between gap-4 p-4">
                <div><dt className="text-xs text-neutral-500">{label}</dt><dd className="text-sm text-neutral-900">{value}</dd></div>
                <button type="button" onClick={() => setStep(index)} className="text-sm font-medium underline">Ändern</button>
              </div>
            ))}
          </dl>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-sm">Zurück</button>
            <button type="button" onClick={save} disabled={pending} className="flex-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{pending ? "Speichert …" : "Speichern"}</button>
          </div>
        </>
      )}
    </section>
  );
}
