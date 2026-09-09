"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { todayDateOnly, type NewPeriodEntry, type NewPeriodEntryOpen } from "@/lib/new-period-validation";
import { phaseForDate, type CyclePrediction } from "@/lib/new-cycle-prediction";
import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import { buildPersonalRingGeometry, ringPointAt } from "@/lib/cycle-ring-geometry";
import { getCalendarDayInfo, periodDayNumber } from "@/lib/calendar-day-info";
import type { NewCycleProfileInput } from "@/lib/new-cycle-profile-validation";

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

const personalPhaseLabel: Record<Exclude<PersonalCycleView["todayPhase"], null>, string> = {
  period: "Periode",
  ovulation: "Mögliche Eisprungphase",
  pms: "Mögliche PMS-Phase",
};

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

function DayDetailModal({ date, periodDay, onClose }: DayDetailModalProps) {
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
          {periodDay !== null ? `${periodDay}. Periodentag` : "Keine bestätigte Periode an diesem Tag."}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#6d153f] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

export default function NewCycleExample({ initialPeriods, initialPeriodPlans, prediction, personalCycleView, cycleProfile }: NewCycleExampleProps) {
  const router = useRouter();
  const [today] = useState(() => new Date());
  const [exampleMonth] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [displayedMonth, setDisplayedMonth] = useState(exampleMonth);
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [periods, setPeriods] = useState(initialPeriods);
  const [periodPlans] = useState(initialPeriodPlans);
  const [isMyPeriodsModalOpen, setIsMyPeriodsModalOpen] = useState(false);
  const [periodFormMode, setPeriodFormMode] = useState<"closed" | "new" | NewPeriodEntryOpen>("closed");
  const [isAddCycleLengthModalOpen, setIsAddCycleLengthModalOpen] = useState(false);
  const [isNoDataToastVisible, setIsNoDataToastVisible] = useState(personalCycleView.status === "no_data");
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ date: string; periodDay: number | null } | null>(null);
  const { cells } = getCalendarMonthGrid(displayedMonth.year, displayedMonth.month);
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(displayedMonth.year, displayedMonth.month, 1),
  );
  const isExampleMonth =
    displayedMonth.year === exampleMonth.year && displayedMonth.month === exampleMonth.month;
  const isCurrentMonth =
    displayedMonth.year === today.getFullYear() && displayedMonth.month === today.getMonth();
  const todayKey = todayDateOnly(today);
  const personalRingGeometry = buildPersonalRingGeometry(personalCycleView, todayKey);
  const hasPersonalCircle = personalCycleView.status !== "no_data";

  function changeMonth(offset: number) {
    setDisplayedMonth((current) => shiftCalendarMonth(current.year, current.month, offset));
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

  return (
    <>
    <div className="space-y-9 sm:space-y-10" inert={selectedDayDetail ? true : undefined}>
      <section aria-label={hasPersonalCircle ? "Deine Zyklusübersicht" : "Zyklusübersicht ohne ausreichende Daten"} className="space-y-3">
        <p className="text-center text-lg text-[#28101f]">Dein Zyklus</p>

        <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
          <svg viewBox="0 0 320 320" role="img" aria-labelledby="cycle-ring-title cycle-ring-description" className="h-full w-full scale-[1.08] overflow-visible sm:scale-100">
            <title id="cycle-ring-title">
              {hasPersonalCircle ? "Zyklusübersicht – dein heutiger Stand" : "Zyklusübersicht – noch keine Daten"}
            </title>
            <desc id="cycle-ring-description">
              {hasPersonalCircle
                ? "Segmente für Periode, mögliche Eisprungphase und mögliche PMS-Phase sowie ein Heute-Marker."
                : "Neutraler Kreis ohne persönliche Phase, solange keine ausreichenden Daten vorliegen."}
            </desc>
            <defs>
              <filter id="ring-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#7f315d" floodOpacity="0.12" />
              </filter>
              <linearGradient id="period-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#9c1550" /><stop offset="1" stopColor="#6d0f3a" />
              </linearGradient>
              <linearGradient id="pms-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f8a8c1" /><stop offset="1" stopColor="#ef82a5" />
              </linearGradient>
              <linearGradient id="ovulation-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c9b3ea" /><stop offset="1" stopColor="#a988da" />
              </linearGradient>
            </defs>

            <circle cx="160" cy="160" r="125" fill="none" stroke="#f1dfe6" strokeWidth="38" />

            {personalRingGeometry ? (
              <>
                <g fill="none" strokeWidth="38" strokeLinecap="round" filter="url(#ring-shadow)">
                  {personalRingGeometry.segments.map((segment) => (
                    <path
                      key={segment.key}
                      d={segment.path}
                      stroke={
                        segment.key === "period"
                          ? "url(#period-gradient)"
                          : segment.key === "fertile"
                            ? "url(#ovulation-gradient)"
                            : "url(#pms-gradient)"
                      }
                    />
                  ))}
                </g>
                {personalRingGeometry.segments.map((segment) => {
                  const point = ringPointAt(segment.labelAngle);
                  const label =
                    segment.key === "period" ? "Periode" : segment.key === "fertile" ? "Eisprung" : "PMS";
                  const fill = "white";
                  return (
                    <text
                      key={segment.key}
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      fill={fill}
                      fontSize="14"
                      fontWeight="700"
                      stroke="rgba(40,16,31,0.35)"
                      strokeWidth="2.5"
                      paintOrder="stroke"
                    >
                      {label}
                    </text>
                  );
                })}
                {(() => {
                  const marker = ringPointAt(personalRingGeometry.todayAngle);
                  const markerName = personalCycleView.todayCycleDay
                    ? `Heute, Zyklustag ${personalCycleView.todayCycleDay}`
                    : "Heute";
                  return (
                    <circle cx={marker.x} cy={marker.y} r="6" fill="#e11d3f" stroke="white" strokeWidth="2">
                      <title>{markerName}</title>
                    </circle>
                  );
                })()}
              </>
            ) : (
              <circle cx="160" cy="160" r="125" fill="none" stroke="#e7d3da" strokeWidth="38" strokeDasharray="2 14" strokeLinecap="round" />
            )}

            <g textAnchor="middle">
              <path d="M160 110 C151 122 153 132 160 135 C167 132 169 122 160 110Z" fill="#df6b9a" />
              <text x="160" y="164" fill="#351127" fontFamily="Georgia, serif" fontSize="25" fontWeight="600">Zyklusansicht</text>
              {personalCycleView.status === "personal" && (
                <>
                  <rect x="86" y="178" width="148" height="25" rx="12" fill="#f8e4e9" />
                  <text x="160" y="195" fill="#a52b5d" fontSize="12" fontWeight="600">
                    {personalCycleView.isRunning
                      ? "Heute: Laufend"
                      : personalCycleView.todayPhase
                        ? `Heute: ${personalPhaseLabel[personalCycleView.todayPhase]}`
                        : "Heute: neutrale Phase"}
                  </text>
                  <text x="160" y="226" fill="#351127" fontFamily="Georgia, serif" fontSize="13">
                    Zyklus: {personalCycleView.cycleLengthDays} Tage
                  </text>
                </>
              )}
              {personalCycleView.status === "profile_estimate" && (
                <>
                  <rect x="86" y="178" width="148" height="25" rx="12" fill="#f8e4e9" />
                  <text x="160" y="195" fill="#a52b5d" fontSize="12" fontWeight="600">
                    {personalCycleView.isRunning
                      ? "Heute: Laufend"
                      : personalCycleView.todayPhase
                        ? `Heute vielleicht: ${personalPhaseLabel[personalCycleView.todayPhase]}`
                        : "Erste Orientierung"}
                  </text>
                  <text x="160" y="226" fill="#351127" fontFamily="Georgia, serif" fontSize="13">Kann abweichen</text>
                </>
              )}
              {personalCycleView.status === "no_data" && (
                <>
                  <rect x="66" y="178" width="188" height="40" rx="14" fill="#f8e4e9" />
                  <text x="160" y="194" fill="#a52b5d" fontSize="11" fontWeight="600">Noch nicht genügend Daten</text>
                  <text x="160" y="209" fill="#a52b5d" fontSize="11" fontWeight="600">für deine persönliche Zyklusansicht</text>
                </>
              )}
            </g>
          </svg>
        </div>
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
        <div className="grid grid-cols-[2rem_1fr_2rem] items-center">
          <button type="button" aria-label="Vorherigen Monat anzeigen" onClick={() => changeMonth(-1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">‹</button>
          <h2 className="text-center font-serif text-3xl font-semibold capitalize text-[#28101f]">{monthName}</h2>
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
            const isToday = Boolean(day && isCurrentMonth && day === today.getDate());
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
            const isDayDetailAvailable = Boolean(date && confirmedPeriodEntry);
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
            const dayAriaLabel = `${formatPeriodDate(date as string)}${storedPeriod ? ", bestätigte Periode" : ""}${runningPeriod ? ", laufende Periode" : ""}${expectedPeriod ? ", voraussichtliches Ende, kann abweichen" : ""}${plannedPeriod ? ", gespeicherte Planung" : ""}`;
            const dayChildren = (
              <>
                <span>{day}</span>
                {storedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">P</span>}
                {runningPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">Läuft</span>}
                {!storedPeriod && !runningPeriod && expectedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">Ca.</span>}
                {!storedPeriod && !runningPeriod && !expectedPeriod && plannedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">Plan</span>}
                {!storedPeriod && !runningPeriod && !expectedPeriod && !plannedPeriod && phase && <span className="absolute right-1 top-0.5 text-[9px] font-bold" aria-label={phaseLabels[phase]}>{phaseLetters[phase]}</span>}
                {isToday && <span className="absolute bottom-0.5 text-[8px] font-semibold leading-none text-[#4c279a]">Heute</span>}
              </>
            );
            return (
              <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
                {day && isDayDetailAvailable && (
                  <button
                    type="button"
                    aria-label={dayAriaLabel}
                    onClick={() =>
                      setSelectedDayDetail({
                        date: date as string,
                        periodDay: periodDayNumber(date as string, confirmedPeriodEntry!.startDate),
                      })
                    }
                    className={dayClassName}
                  >
                    {dayChildren}
                  </button>
                )}
                {day && !isDayDetailAvailable && (
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
    {selectedDayDetail && (
      <DayDetailModal
        date={selectedDayDetail.date}
        periodDay={selectedDayDetail.periodDay}
        onClose={() => setSelectedDayDetail(null)}
      />
    )}
    </>
  );
}
