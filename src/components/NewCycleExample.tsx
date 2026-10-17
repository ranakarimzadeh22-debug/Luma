"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { type NewPeriodEntry, type NewPeriodEntryOpen } from "@/lib/new-period-validation";
import { phasesForDate, primaryCalendarPhase, showsFertileMarker, type CyclePrediction } from "@/lib/new-cycle-prediction";
import { deriveTodayCardText, type PersonalCycleView } from "@/lib/personal-cycle-view";
import { daysUntilNextPeriod } from "@/lib/next-period-countdown";
import { getCalendarDayInfo, periodDayNumber, actualPeriodDurationDays } from "@/lib/calendar-day-info";
import { getPeriodDayActions, shiftDateByOneDay, type PeriodDayActions } from "@/lib/period-day-actions";
import type { NewCycleProfileInput } from "@/lib/new-cycle-profile-validation";
import { computePeriodHistory, type PeriodHistoryRow } from "@/lib/period-history";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { deriveManualPmsSection, applyManualPmsOverride, manualPmsSymptomsForDate, isWithinManualPmsSection } from "@/lib/manual-pms";
import type { PmsSymptomDay } from "@/lib/new-pms-symptoms";
import { PMS_SYMPTOMS, type PmsSymptom } from "@/lib/new-pms-symptom-validation";
import CyclePersonalRing from "@/components/CyclePersonalRing";
import CalendarTodayLine from "@/components/CalendarTodayLine";

export const PMS_SYMPTOM_LABELS: Record<PmsSymptom, string> = {
  breast_tenderness: "Brustschmerzen/-spannen",
  abdominal_pain: "Unterleibsschmerzen",
  fatigue: "Müdigkeit",
  mood_swings: "Stimmungsschwankungen",
};

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function examplePhase(day: number): "period" | "pms" | "ovulation" | null {
  if (day >= 25 && day <= 27) return "period";
  if (day >= 15 && day <= 18) return "pms";
  if (day === 11 || day === 12) return "ovulation";
  return null;
}

const phaseStyles = {
  period: "bg-[#4a0738] text-white",
  pms: "bg-[#f8c2d0] text-[#9f164f]",
  ovulation: "bg-[#e0d0f5] text-[#5420a5]",
};

const phaseLetters = { period: "P", pms: "M", ovulation: "E" };
const phaseLabels = { period: "Periode", pms: "PMS", ovulation: "Eisprung" };
const phaseLegendStyles = {
  period: "bg-[#4a0738] text-white",
  pms: "bg-[#f3a9bd] text-[#831341]",
  ovulation: "bg-[#d2b9ef] text-[#4c2098]",
};
const phaseExplanations = {
  period: "Die Tage, an denen du deine Monatsblutung hast.",
  pms: "Beschwerden, die vor der Periode auftreten können, zum Beispiel Müdigkeit oder Stimmungsschwankungen.",
  ovulation: "Die Zeit, in der eine Eizelle freigesetzt wird.",
};

type Phase = keyof typeof phaseLabels;

interface PhaseLegendItemProps {
  phase: Phase;
  activePhase: Phase | null;
  setActivePhase: (phase: Phase | null) => void;
}

interface NewCycleExampleProps {
  initialPeriods: NewPeriodEntryOpen[];
  initialPeriodPlans: NewPeriodEntry[];
  prediction: CyclePrediction | null;
  personalCycleView: PersonalCycleView;
  cycleProfile: NewCycleProfileInput | null;
  initialPmsSymptomDays: PmsSymptomDay[];
}

function dateForCalendarDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function yearMonthFromDate(date: string): { year: number; month: number } {
  const [year, month] = date.split("-").map(Number);
  return { year, month: month - 1 };
}

function formatPeriodDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatPeriodRange(entry: NewPeriodEntryOpen): string {
  if (entry.endDate) return `${formatPeriodDate(entry.startDate)} bis ${formatPeriodDate(entry.endDate)}`;
  if (entry.expectedEndDate) {
    return `${formatPeriodDate(entry.startDate)} bis voraussichtlich ${formatPeriodDate(entry.expectedEndDate)}`;
  }
  return `${formatPeriodDate(entry.startDate)}, läuft noch`;
}

function PhaseLegendItem({ phase, activePhase, setActivePhase }: PhaseLegendItemProps) {
  const isActive = activePhase === phase;
  const tooltipId = `phase-explanation-${phase}`;

  return (
    <button
      type="button"
      aria-label={`${phaseLetters[phase]} – ${phaseLabels[phase]}: Erklärung ${isActive ? "ausblenden" : "anzeigen"}`}
      aria-expanded={isActive}
      aria-controls={tooltipId}
      aria-describedby={isActive ? tooltipId : undefined}
      onClick={() => setActivePhase(isActive ? null : phase)}
      onBlur={() => setActivePhase(null)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setActivePhase(null);
          event.currentTarget.blur();
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      className="inline-flex select-none items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850] [-webkit-touch-callout:none]"
    >
      <strong className={`grid size-5 place-items-center rounded-full text-[9px] ${phaseLegendStyles[phase]}`}>
        {phaseLetters[phase]}
      </strong>
      {phaseLabels[phase]}
    </button>
  );
}

interface PeriodFormModalProps {
  onClose: () => void;
  onBack?: () => void;
  onSaved: (entry: NewPeriodEntryOpen) => void;
  today: string;
  editingEntry: NewPeriodEntryOpen | null;
}

function PeriodFormModal({ onClose, onBack, onSaved, today, editingEntry }: PeriodFormModalProps) {
  const [startDate, setStartDate] = useState(editingEntry?.startDate ?? "");
  const [isRunning, setIsRunning] = useState(Boolean(editingEntry && editingEntry.endDate === null));
  const [endDate, setEndDate] = useState(editingEntry?.endDate ?? "");
  const [expectedEndDate, setExpectedEndDate] = useState(editingEntry?.expectedEndDate ?? "");
  const [step, setStep] = useState<"form" | "review">("form");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(editingEntry);

  function continueToReview() {
    if (!startDate) {
      setError("Bitte wähle mindestens den ersten Tag deiner Periode.");
      return;
    }
    if (startDate > today) {
      setError("Ein zukünftiger Periodenstart kann nicht gespeichert werden.");
      return;
    }
    if (!isRunning) {
      if (!endDate) {
        setError("Bitte wähle den letzten Tag oder markiere die Periode als laufend.");
        return;
      }
      if (startDate > endDate) {
        setError("Der letzte Periodentag darf nicht vor dem ersten liegen.");
        return;
      }
      if (endDate > today) {
        setError("Zukünftige Periodentage können nicht gespeichert werden.");
        return;
      }
    }
    if (isRunning && expectedEndDate && expectedEndDate < startDate) {
      setError("Das erwartete Ende darf nicht vor dem Beginn liegen.");
      return;
    }
    setError("");
    setStep("review");
  }

  async function save() {
    setIsSaving(true);
    setError("");
    const endpoint = editingEntry ? `/api/neu/periods/${editingEntry.id}` : "/api/neu/periods";
    const response = await fetch(endpoint, {
      method: editingEntry ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        startDate,
        endDate: isRunning ? null : endDate,
        expectedEndDate: isRunning && expectedEndDate ? expectedEndDate : null,
      }),
    });
    const result = (await response.json().catch(() => null)) as
      | { entry?: NewPeriodEntryOpen; error?: string }
      | null;
    setIsSaving(false);
    if (!response.ok || !result?.entry) {
      setError(result?.error || "Die Periode konnte nicht gespeichert werden.");
      return;
    }
    onSaved(result.entry);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="update-period-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 id="update-period-title" className="text-lg font-semibold text-[#28101f]">
          {isEditing ? "Periode ändern" : "Neue Periode eintragen"}
        </h2>

        {step === "form" && (
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-[#382631]">
              Erster Tag
              <input
                type="date"
                max={today}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-[#d8afbd] px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-[#382631]">
              <input
                type="checkbox"
                checked={isRunning}
                onChange={(event) => { setIsRunning(event.target.checked); setError(""); }}
                className="size-4 rounded border-[#d8afbd]"
              />
              Das echte Ende kenne ich noch nicht
            </label>
            {!isRunning && (
              <label className="flex flex-col gap-1 text-sm font-medium text-[#382631]">
                Letzter Tag
                <input
                  type="date"
                  max={today}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="rounded-xl border border-[#d8afbd] px-3 py-2.5 text-sm"
                />
              </label>
            )}
            {isRunning && (
              <label className="flex flex-col gap-1 text-sm font-medium text-[#382631]">
                Erwartetes Ende (optional)
                <input
                  type="date"
                  min={startDate || undefined}
                  value={expectedEndDate}
                  onChange={(event) => setExpectedEndDate(event.target.value)}
                  className="rounded-xl border border-[#d8afbd] px-3 py-2.5 text-sm"
                />
              </label>
            )}
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={onBack ?? onClose} className="flex-1 rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#382631]">
                {onBack ? "Zurück" : "Abbrechen"}
              </button>
              <button type="button" onClick={continueToReview} className="flex-1 rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white">
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-[#382631]">
              {isRunning
                ? expectedEndDate
                  ? `${formatPeriodDate(startDate)} bis voraussichtlich ${formatPeriodDate(expectedEndDate)} (kann abweichen)`
                  : `${formatPeriodDate(startDate)}, läuft noch`
                : `${formatPeriodDate(startDate)} bis ${formatPeriodDate(endDate)}`}
            </p>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex gap-3">
              <button type="button" disabled={isSaving} onClick={() => setStep("form")} className="flex-1 rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#382631] disabled:opacity-50">
                Zurück
              </button>
              <button type="button" disabled={isSaving} onClick={save} className="flex-1 rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {isSaving ? "Wird gespeichert …" : "Speichern"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MyPeriodsModalProps {
  periods: NewPeriodEntryOpen[];
  onClose: () => void;
  onEdit: (entry: NewPeriodEntryOpen) => void;
  onAddNew: () => void;
  onDeleted: (entryId: string) => void;
}

function MyPeriodsModal({ periods, onClose, onEdit, onAddNew, onDeleted }: MyPeriodsModalProps) {
  const [pendingDelete, setPendingDelete] = useState<NewPeriodEntryOpen | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setError("");
    const response = await fetch(`/api/neu/periods/${pendingDelete.id}`, { method: "DELETE" }).catch(() => null);
    setIsDeleting(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Die Periode konnte nicht gelöscht werden.");
      return;
    }
    onDeleted(pendingDelete.id);
    setPendingDelete(null);
  }

  if (pendingDelete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="delete-period-title">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
          <h2 id="delete-period-title" className="text-lg font-semibold text-[#28101f]">
            Periode endgültig löschen?
          </h2>
          <p className="mt-4 text-sm text-[#382631]">
            {formatPeriodRange(pendingDelete)}
          </p>
          {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => { setPendingDelete(null); setError(""); }}
              className="flex-1 rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#382631] disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="flex-1 rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isDeleting ? "Wird gelöscht …" : "Endgültig löschen"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="my-periods-title">
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-lg">
        <h2 id="my-periods-title" className="text-lg font-semibold text-[#28101f]">
          Meine Perioden
        </h2>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {periods.length === 0 && (
            <p className="text-sm text-[#6b5560]">Noch keine Periode gespeichert.</p>
          )}
          {periods.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#efd5dc] bg-[#fff9f8] px-4 py-3">
              <p className="text-sm text-[#382631]">
                {formatPeriodRange(entry)}
                {entry.endDate === null && (
                  <span className="ml-2 rounded-full bg-[#f8e4e9] px-2 py-0.5 text-xs font-semibold text-[#a52b5d]">
                    Laufend
                  </span>
                )}
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  className="rounded-xl border border-[#b97791] bg-white px-3 py-1.5 text-sm font-semibold text-[#6d153f]"
                >
                  Ändern
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(entry)}
                  className="rounded-xl border border-[#b97791] bg-white px-3 py-1.5 text-sm font-semibold text-[#6d153f]"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <button type="button" onClick={onAddNew} className="rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#6d153f]">
            Neue Periode eintragen
          </button>
          <button type="button" onClick={onClose} className="rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddCycleLengthModalProps {
  onClose: () => void;
  onSaved: () => void;
  existingProfile: NewCycleProfileInput | null;
}

function AddCycleLengthModal({ onClose, onSaved, existingProfile }: AddCycleLengthModalProps) {
  const [cycleLengthDays, setCycleLengthDays] = useState("");
  const [isUnknown, setIsUnknown] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!isUnknown && !cycleLengthDays) {
      setError("Bitte gib eine ungefähre Zykluslänge an oder wähle „Ich weiß es nicht“.");
      return;
    }
    setIsSaving(true);
    setError("");
    const response = await fetch("/api/neu/cycle-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastPeriodStart: existingProfile?.lastPeriodStart ?? null,
        bleedingDurationDays: existingProfile?.bleedingDurationDays ?? null,
        cycleLengthDays: isUnknown ? null : Number(cycleLengthDays),
        regularity: existingProfile?.regularity ?? "unknown",
      }),
    }).catch(() => null);

    setIsSaving(false);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error || "Die Zykluslänge konnte nicht gespeichert werden.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="add-cycle-length-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 id="add-cycle-length-title" className="text-lg font-semibold text-[#28101f]">
          Zykluslänge ergänzen
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-[#382631]">
            Mein Zyklus dauert ungefähr … Tage
            <input
              type="number"
              min="21"
              max="45"
              inputMode="numeric"
              disabled={isUnknown}
              value={cycleLengthDays}
              onChange={(event) => { setCycleLengthDays(event.target.value); setIsUnknown(false); }}
              className="rounded-xl border border-[#d8afbd] px-3 py-2.5 text-sm disabled:bg-neutral-100"
            />
          </label>
          <button
            type="button"
            onClick={() => { setCycleLengthDays(""); setIsUnknown(true); }}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${isUnknown ? "border-[#6d153f] bg-[#f8e4e9]" : "border-[#d8afbd]"}`}
          >
            Ich weiß es nicht
          </button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#382631] disabled:opacity-50">
              Abbrechen
            </button>
            <button type="button" onClick={save} disabled={isSaving} className="flex-1 rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {isSaving ? "Wird gespeichert …" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const NO_DATA_TOAST_MESSAGE =
  "Trage deine letzte Periode ein oder gib eine ungefähre Zykluslänge an, damit Luma dir eine erste Orientierung zeigen kann.";
const NO_DATA_TOAST_DURATION_MS = 6000;

function NoDataToast({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, NO_DATA_TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 top-[max(1.5rem,env(safe-area-inset-top))] z-40 mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-[#d8afbd] bg-white p-4 text-sm text-[#382631] shadow-lg"
    >
      <p className="flex-1">{NO_DATA_TOAST_MESSAGE}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Hinweis schließen"
        className="rounded-full px-2 py-1 text-lg leading-none text-[#6b5560] hover:bg-[#f4e4e3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
      >
        ×
      </button>
    </div>
  );
}

const ACTION_TOAST_DURATION_MS = 3000;

function ActionToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, ACTION_TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 top-[max(1.5rem,env(safe-area-inset-top))] z-40 mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-[#d8afbd] bg-white p-4 text-sm text-[#382631] shadow-lg"
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Hinweis schließen"
        className="rounded-full px-2 py-1 text-lg leading-none text-[#6b5560] hover:bg-[#f4e4e3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
      >
        ×
      </button>
    </div>
  );
}

interface DayDetailModalProps {
  date: string;
  periodDay: number | null;
  totalDays: number | null;
  actions: PeriodDayActions;
  isMiddleConfirmedDay: boolean;
  isSaving: boolean;
  error: string;
  onBegin: () => void;
  onEnd: () => void;
  onRequestDeleteEdge: () => void;
  onClose: () => void;
  selectedSymptoms: PmsSymptom[];
  onSaveSymptoms: (symptoms: PmsSymptom[]) => void;
}

function formatFullGermanDate(date: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function DayDetailModal({
  date,
  periodDay,
  totalDays,
  actions,
  isMiddleConfirmedDay,
  isSaving,
  error,
  onBegin,
  onEnd,
  onRequestDeleteEdge,
  onClose,
  selectedSymptoms,
  onSaveSymptoms,
}: DayDetailModalProps) {
  const [draftSymptoms, setDraftSymptoms] = useState<PmsSymptom[]>(selectedSymptoms);

  useEffect(() => {
    setDraftSymptoms(selectedSymptoms);
  }, [date, selectedSymptoms]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggleSymptom(symptom: PmsSymptom) {
    setDraftSymptoms((current) =>
      current.includes(symptom) ? current.filter((value) => value !== symptom) : [...current, symptom],
    );
  }

  const symptomsChanged =
    draftSymptoms.length !== selectedSymptoms.length || draftSymptoms.some((value) => !selectedSymptoms.includes(value));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <h2 id="day-detail-title" className="text-lg font-semibold capitalize text-[#28101f]">
          {formatFullGermanDate(date)}
        </h2>
        <p className="mt-3 text-base text-[#382631]">
          {periodDay !== null
            ? totalDays !== null
              ? `${periodDay}. Periodentag von ${totalDays} Tagen`
              : `${periodDay}. Periodentag`
            : "Keine bestätigte Periode an diesem Tag."}
        </p>
        {isMiddleConfirmedDay && (
          <p className="mt-2 text-sm text-[#6b5560]">Du kannst nur den ersten oder letzten Periodentag löschen.</p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 text-left">
          <p className="text-sm font-semibold text-[#28101f]">PMS-Symptome an diesem Tag</p>
          <p className="mt-1 text-xs text-[#6b5560]">Deine eigene Angabe, keine medizinische Diagnose.</p>
          <div className="mt-2.5 flex flex-col gap-2">
            {PMS_SYMPTOMS.map((symptom) => (
              <label key={symptom} className="flex items-center gap-2.5 text-sm text-[#382631]">
                <input
                  type="checkbox"
                  checked={draftSymptoms.includes(symptom)}
                  onChange={() => toggleSymptom(symptom)}
                  className="size-4 rounded border-[#d8afbd] text-[#6d153f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
                />
                {PMS_SYMPTOM_LABELS[symptom]}
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={isSaving || !symptomsChanged}
            onClick={() => onSaveSymptoms(draftSymptoms)}
            className="mt-3 w-full rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? "Wird gespeichert …" : "Symptome speichern"}
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {actions.canBegin && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onBegin}
              className="rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Wird gespeichert …" : "Periode begonnen"}
            </button>
          )}
          {actions.runningEntryToEnd && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onEnd}
              className="rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isSaving ? "Wird gespeichert …" : "Periode beendet"}
            </button>
          )}
          {actions.deletableEdge && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onRequestDeleteEdge}
              className="rounded-xl border border-[#b97791] bg-white px-4 py-2.5 text-sm font-semibold text-[#6d153f] disabled:opacity-50"
            >
              Periodentag löschen
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#382631]"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

interface DeleteEdgeConfirmModalProps {
  entry: NewPeriodEntryOpen;
  isSingleDay: boolean;
  isSaving: boolean;
  error: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteEdgeConfirmModal({ entry, isSingleDay, isSaving, error, onConfirm, onCancel }: DeleteEdgeConfirmModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-edge-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <h2 id="delete-edge-title" className="text-lg font-semibold text-[#28101f]">
          Periodentag löschen?
        </h2>
        <p className="mt-3 text-sm text-[#382631]">
          {entry.endDate ? `${formatPeriodDate(entry.startDate)} bis ${formatPeriodDate(entry.endDate)}` : `${formatPeriodDate(entry.startDate)}, läuft noch`}
        </p>
        {isSingleDay && (
          <p className="mt-2 text-sm font-medium text-[#831341]">
            Das ist der einzige Tag dieser Periode. Damit wird der gesamte Eintrag gelöscht.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#d8afbd] px-4 py-2.5 text-sm font-semibold text-[#382631] disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? "Wird gelöscht …" : "Endgültig löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatHistoryMonth(date: string): string {
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

interface PeriodHistoryModalProps {
  rows: PeriodHistoryRow[];
  onClose: () => void;
  onSelectMonth: (startDate: string) => void;
}

function PeriodHistoryModal({ rows, onClose, onSelectMonth }: PeriodHistoryModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sortedNewestFirst = [...rows].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="period-history-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-lg">
        <h2 id="period-history-title" className="text-lg font-semibold text-[#28101f]">
          Periodenhistorie
        </h2>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {sortedNewestFirst.length === 0 && (
            <p className="text-sm text-[#6b5560]">
              Noch keine Historie vorhanden. Trage deine erste Periode ein, um sie hier später zu sehen.
            </p>
          )}
          {sortedNewestFirst.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelectMonth(row.startDate)}
              aria-label={`Kalender für ${formatHistoryMonth(row.startDate)} öffnen`}
              className="w-full rounded-xl border border-[#efd5dc] bg-[#fff9f8] px-4 py-3 text-left hover:bg-[#f8e4e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
            >
              <p className="text-base font-semibold capitalize text-[#28101f]">{formatHistoryMonth(row.startDate)}</p>
              <p className="mt-1 text-sm text-[#382631]">
                {row.endDate ? `${formatPeriodDate(row.startDate)} bis ${formatPeriodDate(row.endDate)}` : `${formatPeriodDate(row.startDate)}, läuft noch`}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b5560]">
                {row.durationDays !== null && (
                  <span>
                    <span className="font-semibold text-[#382631]">Dauer:</span> {row.durationDays} Tage
                  </span>
                )}
                <span>
                  <span className="font-semibold text-[#382631]">Zyklus:</span>{" "}
                  {row.cycleLengthDays !== null ? `${row.cycleLengthDays} Tage` : "Noch nicht bekannt"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

/**
 * Read-only "Heute" card shown above the cycle ring (WP-006). Pure
 * presentation over the already-derived PersonalCycleView — no own
 * calculation, no button, no API call, no stored state.
 *
 * WP-015: the optional second "Resttage" line reads only the already-computed
 * `nextPeriodStart` (CyclePrediction) and `today` — daysUntilNextPeriod() is
 * a pure day-count derivation, not a second prediction. It renders only on a
 * positive day count; null (no prediction, today, or past) renders nothing.
 * It additionally requires `personalCycleView.status !== "no_data"` (an
 * already-existing field, read only, no new calculation): predictCycle() can
 * still return a default-based nextPeriodStart while the personal view has
 * "not enough data yet" — showing a countdown next to that headline would be
 * self-contradictory, which the Soll's "bei fehlenden Daten" exclusion rules
 * out.
 */
function TodayCard({
  personalCycleView,
  nextPeriodStart,
  today,
}: {
  personalCycleView: PersonalCycleView;
  nextPeriodStart: string | null;
  today: string;
}) {
  const { headline, showsEstimateNotice } = deriveTodayCardText(personalCycleView);
  const daysRemaining =
    personalCycleView.status === "no_data" ? null : daysUntilNextPeriod(today, nextPeriodStart);
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-[#efd5dc] bg-white/90 px-4 py-3 text-center shadow-sm sm:px-5 sm:py-4">
      <p className="text-sm font-semibold text-[#28101f] sm:text-base">{headline}</p>
      {daysRemaining !== null && (
        <p className="mt-0.5 text-xs text-[#28101f] sm:mt-1 sm:text-sm">
          Nächste Periode voraussichtlich in {daysRemaining === 1 ? "1 Tag" : `${daysRemaining} Tagen`}.
        </p>
      )}
      {showsEstimateNotice && <p className="mt-0.5 text-xs text-[#a52b5d] sm:mt-1 sm:text-sm">Kann abweichen</p>}
    </div>
  );
}

export default function NewCycleExample({ initialPeriods, initialPeriodPlans, prediction, personalCycleView, cycleProfile, initialPmsSymptomDays }: NewCycleExampleProps) {
  const router = useRouter();
  const [todayKey] = useState(() => todayBerlinDateOnly());
  const [todayYear, todayMonthIndex, todayDay] = todayKey.split("-").map(Number);
  const exampleMonth = { year: todayYear, month: todayMonthIndex - 1 };
  const [displayedMonth, setDisplayedMonth] = useState(exampleMonth);
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [isCalendarLegendOpen, setIsCalendarLegendOpen] = useState(false);
  const [periods, setPeriods] = useState(initialPeriods);
  const [periodPlans] = useState(initialPeriodPlans);
  const [pmsSymptomDays, setPmsSymptomDays] = useState(initialPmsSymptomDays);
  const manualPmsSection = deriveManualPmsSection(periods, pmsSymptomDays, todayKey, prediction?.nextPeriodStart ?? null);
  const [isMyPeriodsModalOpen, setIsMyPeriodsModalOpen] = useState(false);
  const [periodFormMode, setPeriodFormMode] = useState<"closed" | "new" | NewPeriodEntryOpen>("closed");
  const [isAddCycleLengthModalOpen, setIsAddCycleLengthModalOpen] = useState(false);
  const [isNoDataToastVisible, setIsNoDataToastVisible] = useState(personalCycleView.status === "no_data");
  const [actionToastMessage, setActionToastMessage] = useState<string | null>(null);

  function showActionToast(message: string) {
    setIsNoDataToastVisible(false);
    setActionToastMessage(message);
  }
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ date: string; periodDay: number | null; totalDays: number | null } | null>(null);
  const [isSavingDayAction, setIsSavingDayAction] = useState(false);
  const [dayActionError, setDayActionError] = useState("");
  const [pendingDeleteEdge, setPendingDeleteEdge] = useState<{
    entry: NewPeriodEntryOpen;
    edge: "start" | "end";
    isSingleDay: boolean;
  } | null>(null);
  const [isPeriodHistoryOpen, setIsPeriodHistoryOpen] = useState(false);
  const { cells } = getCalendarMonthGrid(displayedMonth.year, displayedMonth.month);
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(displayedMonth.year, displayedMonth.month, 1),
  );
  const isExampleMonth =
    displayedMonth.year === exampleMonth.year && displayedMonth.month === exampleMonth.month;
  const isCurrentMonth = displayedMonth.year === todayYear && displayedMonth.month === todayMonthIndex - 1;
  const hasPersonalCircle = personalCycleView.status !== "no_data";

  function changeMonth(offset: number) {
    setDisplayedMonth((current) => shiftCalendarMonth(current.year, current.month, offset));
  }

  function jumpToHistoryMonth(startDate: string) {
    setDisplayedMonth(yearMonthFromDate(startDate));
    setIsPeriodHistoryOpen(false);
  }

  function handlePeriodSaved(entry: NewPeriodEntryOpen) {
    setPeriods((current) =>
      [...current.filter((existing) => existing.id !== entry.id), entry].sort((first, second) =>
        second.startDate.localeCompare(first.startDate),
      ),
    );
    setPeriodFormMode("closed");
    setIsMyPeriodsModalOpen(false);
    showActionToast("Gespeichert.");
    router.refresh();
  }

  function handlePeriodDeleted(entryId: string) {
    setPeriods((current) => current.filter((entry) => entry.id !== entryId));
    showActionToast("Gelöscht.");
    router.refresh();
  }

  function openMyPeriods() {
    setIsMyPeriodsModalOpen(true);
  }

  function startEditingPeriod(entry: NewPeriodEntryOpen) {
    setIsMyPeriodsModalOpen(false);
    setPeriodFormMode(entry);
  }

  function startNewPeriod() {
    setIsMyPeriodsModalOpen(false);
    setPeriodFormMode("new");
  }

  function backToMyPeriods() {
    setPeriodFormMode("closed");
    setIsMyPeriodsModalOpen(true);
  }

  function handleCycleLengthSaved() {
    setIsAddCycleLengthModalOpen(false);
    showActionToast("Gespeichert.");
    router.refresh();
  }


  function closeDayDetail() {
    setSelectedDayDetail(null);
    setDayActionError("");
    setPendingDeleteEdge(null);
  }

  async function saveManualPmsSymptoms(date: string, symptoms: PmsSymptom[]) {
    setIsSavingDayAction(true);
    setDayActionError("");
    const response = await fetch("/api/neu/pms-symptoms", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date, symptoms }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { day?: PmsSymptomDay; error?: string } | null;
    setIsSavingDayAction(false);
    if (!response?.ok || !result?.day) {
      setDayActionError(result?.error || "Die Symptome konnten nicht gespeichert werden.");
      return;
    }
    setPmsSymptomDays((current) => [...current.filter((day) => day.date !== date), result.day as PmsSymptomDay].filter((day) => day.symptoms.length > 0));
    showActionToast(symptoms.length > 0 ? "Gespeichert." : "Gelöscht.");
    router.refresh();
  }

  async function beginPeriodAtSelectedDay() {
    if (!selectedDayDetail) return;
    setIsSavingDayAction(true);
    setDayActionError("");
    const response = await fetch("/api/neu/periods", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startDate: selectedDayDetail.date, endDate: null, expectedEndDate: null }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { entry?: NewPeriodEntryOpen; error?: string } | null;
    setIsSavingDayAction(false);
    if (!response?.ok || !result?.entry) {
      setDayActionError(result?.error || "Der Beginn konnte nicht gespeichert werden.");
      return;
    }
    setPeriods((current) =>
      [...current, result.entry as NewPeriodEntryOpen].sort((first, second) => second.startDate.localeCompare(first.startDate)),
    );
    closeDayDetail();
    showActionToast("Gespeichert.");
    router.refresh();
  }

  async function endPeriodAtSelectedDay(entry: NewPeriodEntryOpen) {
    if (!selectedDayDetail) return;
    setIsSavingDayAction(true);
    setDayActionError("");
    const response = await fetch(`/api/neu/periods/${entry.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startDate: entry.startDate, endDate: selectedDayDetail.date, expectedEndDate: null }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { entry?: NewPeriodEntryOpen; error?: string } | null;
    setIsSavingDayAction(false);
    if (!response?.ok || !result?.entry) {
      setDayActionError(result?.error || "Das Ende konnte nicht gespeichert werden.");
      return;
    }
    setPeriods((current) =>
      [...current.filter((existing) => existing.id !== entry.id), result.entry as NewPeriodEntryOpen].sort((first, second) =>
        second.startDate.localeCompare(first.startDate),
      ),
    );
    closeDayDetail();
    showActionToast("Gespeichert.");
    router.refresh();
  }

  function requestDeleteEdge(edge: { entry: NewPeriodEntryOpen; edge: "start" | "end"; isSingleDay: boolean }) {
    setDayActionError("");
    setPendingDeleteEdge(edge);
  }

  async function confirmDeleteEdge() {
    if (!pendingDeleteEdge) return;
    const { entry, edge, isSingleDay } = pendingDeleteEdge;
    setIsSavingDayAction(true);
    setDayActionError("");

    if (isSingleDay) {
      const response = await fetch(`/api/neu/periods/${entry.id}`, { method: "DELETE" }).catch(() => null);
      setIsSavingDayAction(false);
      if (!response?.ok) {
        const body = await response?.json().catch(() => null);
        setDayActionError(body?.error || "Der Periodentag konnte nicht gelöscht werden.");
        return;
      }
      setPeriods((current) => current.filter((existing) => existing.id !== entry.id));
      setPendingDeleteEdge(null);
      closeDayDetail();
      showActionToast("Gelöscht.");
      router.refresh();
      return;
    }

    const nextStartDate = edge === "start" ? shiftDateByOneDay(entry.startDate, 1) : entry.startDate;
    const nextEndDate = edge === "end" && entry.endDate ? shiftDateByOneDay(entry.endDate, -1) : entry.endDate;
    const response = await fetch(`/api/neu/periods/${entry.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startDate: nextStartDate, endDate: nextEndDate, expectedEndDate: entry.expectedEndDate }),
    }).catch(() => null);
    const result = (await response?.json().catch(() => null)) as { entry?: NewPeriodEntryOpen; error?: string } | null;
    setIsSavingDayAction(false);
    if (!response?.ok || !result?.entry) {
      setDayActionError(result?.error || "Der Periodentag konnte nicht gelöscht werden.");
      return;
    }
    setPeriods((current) =>
      [...current.filter((existing) => existing.id !== entry.id), result.entry as NewPeriodEntryOpen].sort((first, second) =>
        second.startDate.localeCompare(first.startDate),
      ),
    );
    setPendingDeleteEdge(null);
    closeDayDetail();
    showActionToast("Gelöscht.");
    router.refresh();
  }

  const isManualPmsToday = isWithinManualPmsSection(manualPmsSection, todayKey, periods, todayKey);
  const displayedPersonalCycleView: PersonalCycleView = isManualPmsToday
    ? { ...personalCycleView, todayPhase: "pms", isEstimate: false }
    : personalCycleView;
  const manualPmsRingOverride =
    isManualPmsToday && manualPmsSection ? { startDate: manualPmsSection.startDate, endDate: manualPmsSection.endDate } : null;

  return (
    <>
    <div
      className="space-y-6 sm:space-y-10"
      inert={selectedDayDetail || pendingDeleteEdge || isPeriodHistoryOpen ? true : undefined}
    >
      <TodayCard personalCycleView={displayedPersonalCycleView} nextPeriodStart={prediction?.nextPeriodStart ?? null} today={todayKey} />

      <section
        aria-label={hasPersonalCircle ? "Deine Zyklusübersicht" : "Zyklusübersicht ohne ausreichende Daten"}
        className="space-y-2 sm:space-y-3"
      >
        <p className="text-center text-base text-[#28101f] sm:text-lg">Dein Zyklus</p>

        <div className="sm:hidden">
          <CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} manualPmsOverride={manualPmsRingOverride} compact />
        </div>
        <div className="hidden sm:block">
          <CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} manualPmsOverride={manualPmsRingOverride} />
        </div>
        {isManualPmsToday && (
          <p className="text-center text-xs font-medium text-[#6d153f]">
            Von dir eingetragen: {manualPmsSymptomsForDate(manualPmsSection, todayKey, periods, todayKey).map((symptom) => PMS_SYMPTOM_LABELS[symptom]).join(", ")}
          </p>
        )}
        {personalCycleView.status === "no_data" && periods.length > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsAddCycleLengthModalOpen(true)}
              className="rounded-full border border-[#d8afbd] bg-white/75 px-4 py-2 text-sm font-semibold text-[#6d153f] shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
            >
              Zykluslänge ergänzen
            </button>
          </div>
        )}
      </section>

      {periods.length === 0 && (
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-[#efd5dc] bg-white/90 px-5 py-4 text-center shadow-sm">
          <p className="text-sm text-[#382631]">
            Noch keine Periodendaten. Wähle im Kalender den ersten Tag deiner Periode, um zu beginnen.
          </p>
        </div>
      )}

      <section aria-label="Kalender zur Orientierung" className="space-y-3 sm:space-y-5">
        <CalendarTodayLine today={todayKey} />
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button type="button" aria-label="Vorherigen Monat anzeigen" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">‹</button>
          <h2 className="text-center font-serif text-2xl font-semibold capitalize text-[#28101f] sm:text-3xl">
            <button
              type="button"
              onClick={() => setIsPeriodHistoryOpen(true)}
              aria-label={`Periodenhistorie öffnen, aktuell angezeigter Monat: ${monthName}`}
              className="rounded-xl px-2 py-1 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
            >
              {monthName}
            </button>
          </h2>
          <button type="button" aria-label="Nächsten Monat anzeigen" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
          {weekdayLabels.map((label) => <div key={label} className="pb-0.5 text-xs font-medium text-[#4b3a44] sm:pb-1 sm:text-sm">{label}</div>)}
          {cells.map((day, index) => {
            const date = day
              ? dateForCalendarDay(displayedMonth.year, displayedMonth.month, day)
              : null;
            const estimatedPhase = day
              ? prediction
                ? primaryCalendarPhase(date as string, prediction)
                : isExampleMonth
                  ? examplePhase(day)
                  : null
              : null;
            const phase = date ? applyManualPmsOverride(estimatedPhase, manualPmsSection, date, periods, todayKey) : estimatedPhase;
            const isManualPmsDay = Boolean(date && isWithinManualPmsSection(manualPmsSection, date, periods, todayKey));
            const isFertileDay = Boolean(day && date && prediction && showsFertileMarker(phasesForDate(date, prediction), estimatedPhase));
            const isToday = Boolean(day && isCurrentMonth && day === todayDay);
            const storedPeriod = date
              ? periods.find((entry) => entry.endDate !== null && entry.startDate <= date && entry.endDate >= date)
              : null;
            const runningPeriod = date
              ? periods.find((entry) => entry.endDate === null && entry.startDate <= date && date <= todayKey)
              : null;
            const expectedPeriod = date
              ? periods.find(
                  (entry) =>
                    entry.endDate === null &&
                    entry.expectedEndDate !== null &&
                    date > todayKey &&
                    date <= entry.expectedEndDate,
                )
              : null;
            const plannedPeriod = date
              ? periodPlans.find((entry) => entry.startDate <= date && entry.endDate >= date)
              : null;
            const dayInfo = date
              ? getCalendarDayInfo({
                  date,
                  today: todayKey,
                  hasStoredPeriod: Boolean(storedPeriod),
                  hasRunningPeriod: Boolean(runningPeriod),
                  hasExpectedEnd: Boolean(expectedPeriod),
                  hasPlannedPeriod: Boolean(plannedPeriod),
                  phase,
                })
              : null;
            const confirmedPeriodEntry = storedPeriod ?? runningPeriod ?? null;
            const dayClassName = `relative grid h-full w-full place-items-center rounded-2xl border text-base ${
              storedPeriod || runningPeriod
                ? "bg-[#6d153f] text-white"
                : expectedPeriod
                  ? "bg-[#f3a9bd] text-[#831341]"
                  : plannedPeriod
                    ? "bg-[#fff3c9] text-[#6d4c00]"
                    : phase
                      ? phaseStyles[phase]
                      : "bg-white/55 text-[#281c24]"
            } ${
              !dayInfo?.isFuture
                ? "border-white/90 shadow-[0_3px_8px_rgba(91,31,62,0.18)]"
                : "border-dashed border-[#d8afbd] opacity-70 shadow-none"
            } ${isToday ? "ring-2 ring-[#5d32ba] ring-offset-2 ring-offset-[#fff9f8]" : ""}`;
            const dayAriaLabel = date
              ? `${formatPeriodDate(date)}${storedPeriod ? ", bestätigte Periode" : ""}${runningPeriod ? ", laufende Periode" : ""}${expectedPeriod ? ", voraussichtliches Ende, kann abweichen" : ""}${plannedPeriod ? ", gespeicherte Planung" : ""}${isManualPmsDay ? ", PMS von dir eingetragen" : ""}${isFertileDay ? ", mögliches fruchtbares Zeitfenster, kann abweichen" : ""}`
              : "";
            const dayChildren = (
              <>
                <span>{day}</span>
                {storedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">P</span>}
                {runningPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">Läuft</span>}
                {!storedPeriod && !runningPeriod && expectedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">Ca.</span>}
                {!storedPeriod && !runningPeriod && !expectedPeriod && plannedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">Plan</span>}
                {!storedPeriod && !runningPeriod && !expectedPeriod && !plannedPeriod && phase && (
                  <span
                    className="absolute right-1 top-0.5 text-[9px] font-bold"
                    aria-label={
                      isManualPmsDay
                        ? "PMS von dir eingetragen"
                        : phase === "period"
                          ? "Geschätzte nächste Periode, kann abweichen"
                          : phaseLabels[phase]
                    }
                  >
                    {isManualPmsDay ? "M·Du" : phase === "period" ? "Gsch." : phaseLetters[phase]}
                  </span>
                )}
                {isToday && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1 size-2 -translate-x-1/2 rounded-full border border-white bg-red-600 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                  />
                )}
                {isToday && <span className="absolute bottom-0.5 text-[8px] font-semibold leading-none text-[#4c279a]">Heute</span>}
                {isFertileDay && (
                  <span
                    aria-label="Mögliches fruchtbares Zeitfenster, kann abweichen"
                    className="absolute bottom-1 left-1 size-2.5 rounded-full border border-white bg-[#a988da] shadow-[0_0_0_1px_rgba(84,32,165,0.35)]"
                  />
                )}
              </>
            );
            const isDayActionAvailable = Boolean(date && !dayInfo?.isFuture);
            return (
              <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
                {day && isDayActionAvailable && (
                  <button
                    type="button"
                    aria-label={dayAriaLabel}
                    onClick={() =>
                      setSelectedDayDetail({
                        date: date as string,
                        periodDay: confirmedPeriodEntry ? periodDayNumber(date as string, confirmedPeriodEntry.startDate) : null,
                        totalDays:
                          storedPeriod && storedPeriod.endDate
                            ? actualPeriodDurationDays(storedPeriod.startDate, storedPeriod.endDate)
                            : null,
                      })
                    }
                    className={dayClassName}
                  >
                    {dayChildren}
                  </button>
                )}
                {day && !isDayActionAvailable && (
                  <div aria-label={dayAriaLabel} className={dayClassName}>
                    {dayChildren}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={openMyPeriods}
            className="rounded-full bg-[#6d153f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
          >
            Meine Periode aktualisieren
          </button>
        </div>

        {prediction?.isUncertain && (
          <p className="text-center text-xs font-semibold text-[#a52b5d]">
            Vorhersage unsicher - Kann abweichen
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            aria-expanded={isCalendarLegendOpen}
            aria-controls="calendar-legend-panel"
            onClick={() => setIsCalendarLegendOpen((current) => !current)}
            className="rounded-full border border-[#d8afbd] bg-white/75 px-4 py-2 text-sm font-semibold text-[#6d153f] shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
          >
            {isCalendarLegendOpen ? "Erklärungen ausblenden" : "Erklärungen zum Kalender anzeigen"}
          </button>
        </div>

        {isCalendarLegendOpen && (
          <div id="calendar-legend-panel" className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#382631]" aria-label="Kalender-Kennzeichnung">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-[#6d153f]" aria-hidden="true" />
                Bestätigt / Laufend
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-[#f3a9bd]" aria-hidden="true" />
                Voraussichtliches Ende – kann abweichen
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-[#c9b3ea]" aria-hidden="true" />
                Geschätzte nächste Periode – kann abweichen
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full border border-white bg-[#a988da] shadow-[0_0_0_1px_rgba(84,32,165,0.35)]" aria-hidden="true" />
                Mögliches fruchtbares Zeitfenster – kann abweichen
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="grid size-3 place-items-center rounded-full bg-[#f8c2d0] text-[6px] font-bold text-[#9f164f]" aria-hidden="true">M</span>
                PMS von dir eingetragen (M·Du) – deine eigene Angabe
              </span>
            </div>

            <div className="space-y-3 text-sm text-[#382631]" aria-label="Legende">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                {(["period", "pms", "ovulation"] as const).map((phase) => (
                  <PhaseLegendItem
                    key={phase}
                    phase={phase}
                    activePhase={activePhase}
                    setActivePhase={setActivePhase}
                  />
                ))}
              </div>
              {activePhase && (
                <p
                  id={`phase-explanation-${activePhase}`}
                  role="tooltip"
                  className="mx-auto max-w-sm rounded-2xl border border-[#efd5dc] bg-white/95 px-4 py-3 text-center leading-relaxed shadow-[0_8px_24px_rgba(91,31,62,0.12)]"
                >
                  {phaseExplanations[activePhase]}
                </p>
              )}
            </div>
          </div>
        )}

        {!prediction && (
          <div className="flex justify-center pb-1">
            <p className="rounded-full bg-[#f4e4e3] px-6 py-3 text-sm font-medium text-[#382631]"><span aria-hidden="true">✦ </span>Nur Beispiel</p>
          </div>
        )}
      </section>

      {isMyPeriodsModalOpen && (
        <MyPeriodsModal
          periods={periods}
          onClose={() => setIsMyPeriodsModalOpen(false)}
          onEdit={startEditingPeriod}
          onAddNew={startNewPeriod}
          onDeleted={handlePeriodDeleted}
        />
      )}

      {periodFormMode !== "closed" && (
        <PeriodFormModal
          today={todayKey}
          editingEntry={periodFormMode === "new" ? null : periodFormMode}
          onClose={() => setPeriodFormMode("closed")}
          onBack={backToMyPeriods}
          onSaved={handlePeriodSaved}
        />
      )}

      {isAddCycleLengthModalOpen && (
        <AddCycleLengthModal
          existingProfile={cycleProfile}
          onClose={() => setIsAddCycleLengthModalOpen(false)}
          onSaved={handleCycleLengthSaved}
        />
      )}

      {actionToastMessage ? (
        <ActionToast message={actionToastMessage} onDismiss={() => setActionToastMessage(null)} />
      ) : (
        isNoDataToastVisible && <NoDataToast onDismiss={() => setIsNoDataToastVisible(false)} />
      )}
    </div>
    {selectedDayDetail && !pendingDeleteEdge && (() => {
      const actions = getPeriodDayActions(selectedDayDetail.date, todayKey, periods);
      const isMiddleConfirmedDay = selectedDayDetail.periodDay !== null && !actions.deletableEdge && !actions.runningEntryToEnd;
      const currentSymptoms = pmsSymptomDays.find((day) => day.date === selectedDayDetail.date)?.symptoms ?? [];
      return (
        <DayDetailModal
          date={selectedDayDetail.date}
          periodDay={selectedDayDetail.periodDay}
          totalDays={selectedDayDetail.totalDays}
          actions={actions}
          isMiddleConfirmedDay={isMiddleConfirmedDay}
          isSaving={isSavingDayAction}
          error={dayActionError}
          onBegin={beginPeriodAtSelectedDay}
          onEnd={() => actions.runningEntryToEnd && endPeriodAtSelectedDay(actions.runningEntryToEnd)}
          onRequestDeleteEdge={() => actions.deletableEdge && requestDeleteEdge(actions.deletableEdge)}
          onClose={closeDayDetail}
          selectedSymptoms={currentSymptoms}
          onSaveSymptoms={(symptoms) => saveManualPmsSymptoms(selectedDayDetail.date, symptoms)}
        />
      );
    })()}
    {pendingDeleteEdge && (
      <DeleteEdgeConfirmModal
        entry={pendingDeleteEdge.entry}
        isSingleDay={pendingDeleteEdge.isSingleDay}
        isSaving={isSavingDayAction}
        error={dayActionError}
        onConfirm={confirmDeleteEdge}
        onCancel={() => setPendingDeleteEdge(null)}
      />
    )}
    {isPeriodHistoryOpen && (
      <PeriodHistoryModal
        rows={computePeriodHistory(periods)}
        onClose={() => setIsPeriodHistoryOpen(false)}
        onSelectMonth={jumpToHistoryMonth}
      />
    )}
    </>
  );
}
