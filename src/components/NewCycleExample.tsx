"use client";

import { useRef, useState } from "react";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { todayDateOnly, type NewPeriodEntry } from "@/lib/new-period-validation";
import { phaseForDate, type CyclePrediction } from "@/lib/new-cycle-prediction";
import { buildRingGeometry, ringPointAt } from "@/lib/cycle-ring-geometry";

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

const predictionSourceLabels: Record<CyclePrediction["source"], string> = {
  history: "Basierend auf deinen gespeicherten Perioden",
  profile: "Basierend auf deinen Angaben beim Start",
  default: "Geschätzt mit einem durchschnittlichen Zyklus (28 Tage)",
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
  initialPeriods: NewPeriodEntry[];
  prediction: CyclePrediction | null;
}

function dateForCalendarDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatPeriodDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function PhaseLegendItem({ phase, activePhase, setActivePhase }: PhaseLegendItemProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFocus = useRef(false);
  const isActive = activePhase === phase;
  const tooltipId = `phase-explanation-${phase}`;

  function stopLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  return (
    <button
      type="button"
      aria-label={`${phaseLetters[phase]} – ${phaseLabels[phase]}: Erklärung anzeigen`}
      aria-describedby={isActive ? tooltipId : undefined}
      onMouseEnter={() => setActivePhase(phase)}
      onMouseLeave={() => {
        if (!hasFocus.current) setActivePhase(null);
      }}
      onFocus={() => {
        hasFocus.current = true;
        setActivePhase(phase);
      }}
      onBlur={() => {
        hasFocus.current = false;
        setActivePhase(null);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setActivePhase(null);
          event.currentTarget.blur();
        }
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") return;
        event.preventDefault();
        stopLongPress();
        longPressTimer.current = setTimeout(() => setActivePhase(phase), 450);
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== "touch") return;
        stopLongPress();
        setActivePhase(null);
      }}
      onPointerCancel={() => {
        stopLongPress();
        setActivePhase(null);
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

export default function NewCycleExample({ initialPeriods, prediction }: NewCycleExampleProps) {
  const [today] = useState(() => new Date());
  const [exampleMonth] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [displayedMonth, setDisplayedMonth] = useState(exampleMonth);
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [periods, setPeriods] = useState(initialPeriods);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [periodMessage, setPeriodMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { cells } = getCalendarMonthGrid(displayedMonth.year, displayedMonth.month);
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(displayedMonth.year, displayedMonth.month, 1),
  );
  const isExampleMonth =
    displayedMonth.year === exampleMonth.year && displayedMonth.month === exampleMonth.month;
  const isCurrentMonth =
    displayedMonth.year === today.getFullYear() && displayedMonth.month === today.getMonth();
  const todayKey = todayDateOnly(today);
  const ringGeometry = prediction ? buildRingGeometry(prediction, todayKey) : null;

  function changeMonth(offset: number) {
    setDisplayedMonth((current) => shiftCalendarMonth(current.year, current.month, offset));
  }

  function selectPeriodDay(date: string) {
    setPeriodMessage(null);
    setDeletingId(null);
    if (!selectedStart || selectedEnd) {
      setSelectedStart(date);
      setSelectedEnd(null);
      return;
    }
    if (date < selectedStart) {
      setPeriodMessage("Der letzte Periodentag darf nicht vor dem ersten liegen.");
      return;
    }
    setSelectedEnd(date);
  }

  function clearSelection() {
    setSelectedStart(null);
    setSelectedEnd(null);
    setEditingId(null);
    setPeriodMessage(null);
  }

  async function savePeriod() {
    if (!selectedStart || !selectedEnd) return;
    setIsSaving(true);
    setPeriodMessage(null);
    const endpoint = editingId ? `/api/neu/periods/${editingId}` : "/api/neu/periods";
    const response = await fetch(endpoint, {
      method: editingId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startDate: selectedStart, endDate: selectedEnd }),
    });
    const result = (await response.json().catch(() => null)) as
      | { entry?: NewPeriodEntry; error?: string }
      | null;
    setIsSaving(false);
    if (!response.ok || !result?.entry) {
      setPeriodMessage(result?.error || "Die Periode konnte nicht gespeichert werden.");
      return;
    }
    setPeriods((current) =>
      [...current.filter((entry) => entry.id !== result.entry?.id), result.entry as NewPeriodEntry].sort(
        (first, second) => second.startDate.localeCompare(first.startDate),
      ),
    );
    clearSelection();
    setPeriodMessage("Die Periode wurde gespeichert.");
  }

  function editPeriod(entry: NewPeriodEntry) {
    setEditingId(entry.id);
    setSelectedStart(entry.startDate);
    setSelectedEnd(entry.endDate);
    setDeletingId(null);
    setPeriodMessage(null);
    const [year, month] = entry.startDate.split("-").map(Number);
    setDisplayedMonth({ year, month: month - 1 });
  }

  async function deletePeriod(entryId: string) {
    setIsSaving(true);
    setPeriodMessage(null);
    const response = await fetch(`/api/neu/periods/${entryId}`, { method: "DELETE" });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSaving(false);
    if (!response.ok) {
      setPeriodMessage(result?.error || "Die Periode konnte nicht gelöscht werden.");
      return;
    }
    setPeriods((current) => current.filter((entry) => entry.id !== entryId));
    if (editingId === entryId) clearSelection();
    setDeletingId(null);
    setPeriodMessage("Die Periode wurde gelöscht.");
  }

  return (
    <div className="space-y-9 sm:space-y-10">
      <section aria-label={prediction ? "Deine Zyklusübersicht" : "Beispielhafte Zyklusübersicht"} className="space-y-3">
        <p className="text-center text-lg text-[#28101f]">{prediction ? "Dein Zyklus" : "Beispiel-Zyklus"}</p>

        <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
          <svg viewBox="0 0 320 320" role="img" aria-labelledby="cycle-ring-title cycle-ring-description" className="h-full w-full scale-[1.08] overflow-visible sm:scale-100">
            <title id="cycle-ring-title">{prediction ? "Zyklusübersicht – deine Vorhersage" : "Zyklusübersicht – Nur Beispiel"}</title>
            <desc id="cycle-ring-description">
              {prediction
                ? "Segmente für Periode, fruchtbare Tage und PMS basierend auf deinen Daten sowie ein Heute-Marker."
                : "Drei beispielhafte Segmente für Periode, PMS und Eisprung sowie ein Heute-Marker."}
            </desc>
            <defs>
              <filter id="ring-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#7f315d" floodOpacity="0.12" />
              </filter>
              <linearGradient id="period-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#b52762" /><stop offset="1" stopColor="#8f184f" />
              </linearGradient>
              <linearGradient id="pms-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffd7df" /><stop offset="1" stopColor="#f3afc2" />
              </linearGradient>
              <linearGradient id="ovulation-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#eee6fa" /><stop offset="1" stopColor="#d4c0ef" />
              </linearGradient>
            </defs>

            <circle cx="160" cy="160" r="125" fill="none" stroke="#fff" strokeWidth="42" opacity="0.9" />

            {ringGeometry && prediction ? (
              <>
                <g fill="none" strokeWidth="38" strokeLinecap="round" filter="url(#ring-shadow)">
                  {ringGeometry.segments.map((segment) => (
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
                {ringGeometry.segments.map((segment) => {
                  const point = ringPointAt(segment.labelAngle);
                  const label =
                    segment.key === "period" ? "Periode" : segment.key === "fertile" ? "Eisprung" : "PMS";
                  const fill = segment.key === "fertile" ? "#5420a5" : segment.key === "pms" ? "#a51752" : "white";
                  return (
                    <text
                      key={segment.key}
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      fill={fill}
                      fontSize="14"
                      fontWeight="600"
                    >
                      {label}
                    </text>
                  );
                })}
                {(() => {
                  const marker = ringPointAt(ringGeometry.todayAngle);
                  return (
                    <>
                      <circle cx={marker.x} cy={marker.y} r="14" fill="white" />
                      <circle cx={marker.x} cy={marker.y} r="9" fill="#4a0738" />
                      <circle cx={marker.x} cy={marker.y} r="4" fill="#df6b9a" />
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <g fill="none" strokeWidth="38" strokeLinecap="round" filter="url(#ring-shadow)">
                  <path d="M64 80 A125 125 0 0 1 268 223" stroke="url(#period-gradient)" />
                  <path d="M258 237 A125 125 0 0 1 80 256" stroke="url(#ovulation-gradient)" />
                  <path d="M67 244 A125 125 0 0 1 54 94" stroke="url(#pms-gradient)" />
                </g>
                <text x="160" y="56" textAnchor="middle" fill="white" fontSize="17" fontWeight="600">Periode</text>
                <text x="258" y="235" textAnchor="middle" fill="#5420a5" fontSize="15" fontWeight="600" transform="rotate(-43 258 235)">Eisprung</text>
                <text x="65" y="205" textAnchor="middle" fill="#a51752" fontSize="15" fontWeight="600" transform="rotate(66 65 205)">PMS</text>
                <circle cx="252" cy="84" r="14" fill="white" /><circle cx="252" cy="84" r="9" fill="#4a0738" /><circle cx="252" cy="84" r="4" fill="#df6b9a" />
                <path d="M264 74 L277 59" stroke="#4a0738" strokeWidth="2" strokeLinecap="round" />
                <rect x="270" y="39" width="47" height="23" rx="8" fill="#4a0738" />
                <text x="293.5" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Heute</text>
              </>
            )}

            <g textAnchor="middle">
              <path d="M160 110 C151 122 153 132 160 135 C167 132 169 122 160 110Z" fill="#df6b9a" />
              <text x="160" y="164" fill="#351127" fontFamily="Georgia, serif" fontSize="25" fontWeight="600">Zyklusansicht</text>
              {prediction ? (
                <>
                  <rect x="86" y="178" width="148" height="25" rx="12" fill="#f8e4e9" />
                  <text x="160" y="195" fill="#a52b5d" fontSize="12" fontWeight="600">
                    Nächste Periode: {formatPeriodDate(prediction.nextPeriodStart)}
                  </text>
                  <text x="160" y="226" fill="#351127" fontFamily="Georgia, serif" fontSize="13">
                    {predictionSourceLabels[prediction.source]}
                  </text>
                </>
              ) : (
                <>
                  <rect x="116" y="178" width="88" height="25" rx="12" fill="#f8e4e9" />
                  <text x="160" y="195" fill="#a52b5d" fontSize="12" fontWeight="600">Nur Beispiel</text>
                  <text x="160" y="226" fill="#351127" fontFamily="Georgia, serif" fontSize="18">keine Vorhersage</text>
                </>
              )}
            </g>
          </svg>
        </div>
        {!prediction && (
          <p className="mx-auto max-w-xs text-center text-sm text-[#6b5560]">
            Trage mindestens eine vergangene Periode ein, damit Luma deinen Zyklus vorhersagen kann.
          </p>
        )}
      </section>

      <section aria-label="Beispielkalender" className="space-y-5">
        <div className="grid grid-cols-[2rem_1fr_2rem] items-center">
          <button type="button" aria-label="Vorherigen Monat anzeigen" onClick={() => changeMonth(-1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">‹</button>
          <h2 className="text-center font-serif text-3xl font-semibold capitalize text-[#28101f]">{monthName}</h2>
          <button type="button" aria-label="Nächsten Monat anzeigen" onClick={() => changeMonth(1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">›</button>
        </div>

        <div className="rounded-2xl border border-[#efd5dc] bg-white/70 px-4 py-3 text-center text-sm text-[#382631]">
          <p className="font-semibold">Vergangene Periode eintragen</p>
          <p className="mt-1">
            {!selectedStart
              ? "Wähle zuerst den tatsächlichen ersten Periodentag."
              : selectedEnd
                ? "Prüfe den Zeitraum vor dem Speichern."
                : "Wähle jetzt den tatsächlichen letzten Periodentag."}
          </p>
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
            const isSelectable = Boolean(date && date <= todayDateOnly(today));
            const storedPeriod = date
              ? periods.find((entry) => entry.startDate <= date && entry.endDate >= date)
              : null;
            const isSelected = Boolean(
              date &&
                selectedStart &&
                (selectedEnd
                  ? selectedStart <= date && date <= selectedEnd
                  : date === selectedStart),
            );
            const isStart = date === selectedStart;
            const isEnd = date === selectedEnd;
            return (
              <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
                {day && (
                  <button
                    type="button"
                    disabled={!isSelectable}
                    aria-label={`${formatPeriodDate(date as string)}${storedPeriod ? ", gespeicherte Periode" : ""}${isStart ? ", Beginn der Auswahl" : ""}${isEnd ? ", Ende der Auswahl" : ""}`}
                    onClick={() => selectPeriodDay(date as string)}
                    className={`relative grid h-full w-full place-items-center rounded-2xl text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850] disabled:cursor-not-allowed disabled:opacity-45 ${
                      isSelected
                        ? "bg-[#b52762] text-white ring-2 ring-[#6d2850] ring-offset-1"
                        : storedPeriod
                          ? "bg-[#6d153f] text-white"
                          : phase
                            ? phaseStyles[phase]
                            : "bg-white/55 text-[#281c24]"
                    } ${isToday ? "ring-2 ring-[#5d32ba] ring-offset-2 ring-offset-[#fff9f8]" : ""}`}
                  >
                    <span>{day}</span>
                    {isStart && <span className="absolute left-1 top-0.5 text-[8px] font-bold">Start</span>}
                    {isEnd && <span className="absolute right-1 top-0.5 text-[8px] font-bold">Ende</span>}
                    {!isSelected && storedPeriod && <span className="absolute right-1 top-0.5 text-[9px] font-bold">P</span>}
                    {!isSelected && !storedPeriod && phase && <span className="absolute right-1 top-0.5 text-[9px] font-bold" aria-label={phaseLabels[phase]}>{phaseLetters[phase]}</span>}
                    {isToday && <span className="absolute bottom-0.5 text-[8px] font-semibold leading-none text-[#4c279a]">Heute</span>}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectedStart && selectedEnd && (
          <div className="space-y-3 rounded-2xl border border-[#d8afbd] bg-white/90 p-4 text-sm text-[#382631]" aria-live="polite">
            <p className="font-semibold">Zeitraum prüfen</p>
            <p>
              {formatPeriodDate(selectedStart)} bis {formatPeriodDate(selectedEnd)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={isSaving} onClick={savePeriod} className="rounded-xl bg-[#6d153f] px-4 py-2 font-semibold text-white disabled:opacity-50">
                {isSaving ? "Wird gespeichert …" : editingId ? "Änderung speichern" : "Zeitraum speichern"}
              </button>
              <button type="button" disabled={isSaving} onClick={clearSelection} className="rounded-xl border border-[#d8afbd] bg-white px-4 py-2 font-semibold">
                Auswahl verwerfen
              </button>
            </div>
          </div>
        )}

        {periodMessage && <p className="text-center text-sm font-medium text-[#6d153f]" role="status">{periodMessage}</p>}

        {periods.length > 0 && (
          <div className="space-y-3" aria-label="Gespeicherte Perioden">
            <h3 className="font-serif text-xl font-semibold text-[#28101f]">Gespeicherte Perioden</h3>
            {periods.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-[#efd5dc] bg-white/75 p-4 text-sm text-[#382631]">
                <p className="font-semibold">{formatPeriodDate(entry.startDate)} bis {formatPeriodDate(entry.endDate)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={isSaving} onClick={() => editPeriod(entry)} className="rounded-xl border border-[#b97791] bg-white px-3 py-2 font-semibold">Ändern</button>
                  {deletingId === entry.id ? (
                    <>
                      <button type="button" disabled={isSaving} onClick={() => deletePeriod(entry.id)} className="rounded-xl bg-[#6d153f] px-3 py-2 font-semibold text-white">Löschen bestätigen</button>
                      <button type="button" disabled={isSaving} onClick={() => setDeletingId(null)} className="rounded-xl border border-[#d8afbd] bg-white px-3 py-2 font-semibold">Abbrechen</button>
                    </>
                  ) : (
                    <button type="button" disabled={isSaving} onClick={() => setDeletingId(entry.id)} className="rounded-xl border border-[#b97791] bg-white px-3 py-2 font-semibold">Löschen</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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

        <div className="flex justify-center pb-1">
          <p className="rounded-full bg-[#f4e4e3] px-6 py-3 text-sm font-medium text-[#382631]"><span aria-hidden="true">✦ </span>Nur Beispiel</p>
        </div>
      </section>
    </div>
  );
}
