"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { type NewPeriodEntry, type NewPeriodEntryOpen } from "@/lib/new-period-validation";
import { phaseForDate, type CyclePrediction } from "@/lib/new-cycle-prediction";
import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import { getCalendarDayInfo, periodDayNumber, actualPeriodDurationDays } from "@/lib/calendar-day-info";
import { getPeriodDayActions, shiftDateByOneDay, type PeriodDayActions } from "@/lib/period-day-actions";
import type { NewCycleProfileInput } from "@/lib/new-cycle-profile-validation";
import { computePeriodHistory, type PeriodHistoryRow } from "@/lib/period-history";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import CyclePersonalRing from "@/components/CyclePersonalRing";
import CalendarTodayLine from "@/components/CalendarTodayLine";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function examplePhase(day: number): "period" | "pms" | "ovulation" | null {
  if (day >= 25 && day <= 27) return "period";
  if (day >= 15 && day <= 18) return "pms";
  if (day === 11 || day === 12) return "ovulation";
  return null;
}

function predictedPhaseForCalendarDay(
  date: string,
  prediction: CyclePrediction,
): "period" | "pms" | "ovulation" | null {
  const phase = phaseForDate(date, prediction);
  if (phase === "fertile") return null;
  return phase;
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
}: DayDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
              <p className="text-sm font-semibold capitalize text-[#28101f]">{formatHistoryMonth(row.startDate)}</p>
              <p className="mt-1 text-sm text-[#382631]">
                {row.endDate ? `${formatPeriodDate(row.startDate)} bis ${formatPeriodDate(row.endDate)}` : `${formatPeriodDate(row.startDate)}, läuft noch`}
              </p>
              <p className="mt-1 text-sm text-[#6b5560]">
                Zyklus: {row.cycleLengthDays !== null ? `${row.cycleLengthDays} Tage` : "Noch nicht bekannt"}
                {row.durationDays !== null && ` · Dauer: ${row.durationDays} Tage`}
              </p>
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

export default function NewCycleExample({ initialPeriods, initialPeriodPlans, prediction, personalCycleView, cycleProfile }: NewCycleExampleProps) {
  const router = useRouter();
  const [todayKey] = useState(() => todayBerlinDateOnly());
  const [todayYear, todayMonthIndex, todayDay] = todayKey.split("-").map(Number);
  const exampleMonth = { year: todayYear, month: todayMonthIndex - 1 };
  const [displayedMonth, setDisplayedMonth] = useState(exampleMonth);
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [periods, setPeriods] = useState(initialPeriods);
  const [periodPlans] = useState(initialPeriodPlans);
  const [isMyPeriodsModalOpen, setIsMyPeriodsModalOpen] = useState(false);
  const [periodFormMode, setPeriodFormMode] = useState<"closed" | "new" | NewPeriodEntryOpen>("closed");
  const [isAddCycleLengthModalOpen, setIsAddCycleLengthModalOpen] = useState(false);
  const [isNoDataToastVisible, setIsNoDataToastVisible] = useState(personalCycleView.status === "no_data");
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
    router.refresh();
  }

  function handlePeriodDeleted(entryId: string) {
    setPeriods((current) => current.filter((entry) => entry.id !== entryId));
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
    router.refresh();
  }


  function closeDayDetail() {
    setSelectedDayDetail(null);
    setDayActionError("");
    setPendingDeleteEdge(null);
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
    router.refresh();
  }

  return (
    <>
    <div
      className="space-y-9 sm:space-y-10"
      inert={selectedDayDetail || pendingDeleteEdge || isPeriodHistoryOpen ? true : undefined}
    >
      <section aria-label={hasPersonalCircle ? "Deine Zyklusübersicht" : "Zyklusübersicht ohne ausreichende Daten"} className="space-y-3">
        <p className="text-center text-lg text-[#28101f]">Dein Zyklus</p>

        <CyclePersonalRing personalCycleView={personalCycleView} today={todayKey} />
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

      <section aria-label="Kalender zur Orientierung" className="space-y-5">
        <CalendarTodayLine today={todayKey} />
        <div className="grid grid-cols-[2rem_1fr_2rem] items-center">
          <button type="button" aria-label="Vorherigen Monat anzeigen" onClick={() => changeMonth(-1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">‹</button>
          <h2 className="text-center font-serif text-3xl font-semibold capitalize text-[#28101f]">
            <button
              type="button"
              onClick={() => setIsPeriodHistoryOpen(true)}
              aria-label={`Periodenhistorie öffnen, aktuell angezeigter Monat: ${monthName}`}
              className="rounded-xl px-2 py-1 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]"
            >
              {monthName}
            </button>
          </h2>
          <button type="button" aria-label="Nächsten Monat anzeigen" onClick={() => changeMonth(1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
          {weekdayLabels.map((label) => <div key={label} className="pb-1 text-sm font-medium text-[#4b3a44]">{label}</div>)}
          {cells.map((day, index) => {
            const date = day
              ? dateForCalendarDay(displayedMonth.year, displayedMonth.month, day)
              : null;
            const phase = day
              ? prediction
                ? predictedPhaseForCalendarDay(date as string, prediction)
                : isExampleMonth
                  ? examplePhase(day)
                  : null
              : null;
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
                  phase: prediction ? predictedPhaseForCalendarDay(date, prediction) : null,
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
              ? `${formatPeriodDate(date)}${storedPeriod ? ", bestätigte Periode" : ""}${runningPeriod ? ", laufende Periode" : ""}${expectedPeriod ? ", voraussichtliches Ende, kann abweichen" : ""}${plannedPeriod ? ", gespeicherte Planung" : ""}`
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
                    aria-label={phase === "period" ? "Geschätzte nächste Periode, kann abweichen" : phaseLabels[phase]}
                  >
                    {phase === "period" ? "Gsch." : phaseLetters[phase]}
                  </span>
                )}
                {isToday && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-1 size-2 -translate-x-1/2 rounded-full border border-white bg-red-600 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                  />
                )}
                {isToday && <span className="absolute bottom-0.5 text-[8px] font-semibold leading-none text-[#4c279a]">Heute</span>}
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

      {isNoDataToastVisible && <NoDataToast onDismiss={() => setIsNoDataToastVisible(false)} />}
    </div>
    {selectedDayDetail && !pendingDeleteEdge && (() => {
      const actions = getPeriodDayActions(selectedDayDetail.date, todayKey, periods);
      const isMiddleConfirmedDay = selectedDayDetail.periodDay !== null && !actions.deletableEdge && !actions.runningEntryToEnd;
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
