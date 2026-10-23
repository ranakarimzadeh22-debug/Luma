"use client";

import { useEffect, useRef, useState } from "react";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { phasesForDate, primaryCalendarPhase, showsFertileMarker, type CyclePrediction } from "@/lib/new-cycle-prediction";
import { isWithinManualPmsSection, manualPmsSymptomsForDate, type ManualPmsSection } from "@/lib/manual-pms";
import type { PmsSymptom } from "@/lib/new-pms-symptom-validation";
import CalendarTodayLine from "@/components/CalendarTodayLine";
import type { HistoricalCalendarPhases } from "@/lib/historical-calendar-phases";
import { calendarPhaseColors, filledSwatchClassName, outlineSwatchClassName } from "@/lib/calendar-phase-colors";
import { calendarBandBorderClassName, calendarBandPosition } from "@/lib/calendar-band-position";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type PrimaryDayStatus = "confirmed" | "period" | "pms" | "pms-manual" | "ovulation" | "none";

const PMS_SYMPTOM_LABELS: Record<PmsSymptom, string> = {
  breast_tenderness: "Brustschmerzen/-spannen",
  abdominal_pain: "Unterleibsschmerzen",
  fatigue: "Müdigkeit",
  mood_swings: "Stimmungsschwankungen",
};

interface NewPartnerCalendarProps {
  confirmedDates: string[];
  prediction: CyclePrediction | null;
  manualPmsSection: ManualPmsSection | null;
  periods: { startDate: string; endDate: string | null }[];
  /** WP-028: past PMS days / possible past ovulation days (dates only), derived server-side. */
  historicalPhases: HistoricalCalendarPhases;
  today: string;
}

function dateForCalendarDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatFullGermanDate(date: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

const primaryStatusLabel: Record<PrimaryDayStatus, string> = {
  confirmed: "Bestätigt",
  period: "Geschätzte nächste Periode – kann abweichen",
  pms: "Mögliche PMS-Phase – kann abweichen",
  "pms-manual": "PMS von ihr eingetragen",
  ovulation: "Möglicher Eisprung – kann abweichen",
  none: "Keine freigegebene Information",
};

/**
 * WP-026: same color semantics as the owner calendar (calendar-phase-colors.ts).
 * Filled = confirmed period and the partner's view of manual PMS (clearly
 * stronger pink); outlined = estimate (next period pink, estimated PMS very
 * light pink, ovulation violet). The fertile window has no band of its own.
 * Same PrimaryDayStatus values as before.
 */
type PartnerBandKey = Exclude<PrimaryDayStatus, "none">;

const primaryStatusBandStyle: Record<PartnerBandKey, string> = {
  confirmed: calendarPhaseColors.confirmed.fill,
  "pms-manual": calendarPhaseColors.pmsManual.fill,
  period: calendarPhaseColors.periodEstimate.outline,
  pms: calendarPhaseColors.pmsEstimate.outline,
  ovulation: calendarPhaseColors.ovulation.outline,
};

const filledBandKeys: ReadonlyArray<PartnerBandKey> = ["confirmed", "pms-manual"];

/** Readable day-number color per band. */
const primaryStatusBandTextStyle: Record<PartnerBandKey, string> = {
  confirmed: calendarPhaseColors.confirmed.text,
  "pms-manual": calendarPhaseColors.pmsManual.text,
  period: calendarPhaseColors.periodEstimate.text,
  pms: calendarPhaseColors.pmsEstimate.text,
  ovulation: calendarPhaseColors.ovulation.text,
};

interface CalendarLegendPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  hasAnyPrediction: boolean;
  hasManualPmsSection: boolean;
  isUncertain: boolean;
}

/**
 * WP-018 Korrektur Version 3: compact, non-modal popover anchored to the ⓘ
 * trigger in the partner calendar's month row, mirroring the owner's
 * CalendarLegendPopover (WP-018 Korrektur Version 2). Reuses the component's
 * already-existing hasAnyPrediction/manualPmsSection
 * conditions — no new status derivation, no second phase calculation. Closes
 * on Escape and on an outside click/tap, same as the owner popover. The
 * partner never gains any input affordance here.
 */
function PartnerCalendarLegendPopover({
  isOpen,
  onClose,
  hasAnyPrediction,
  hasManualPmsSection,
  isUncertain,
}: CalendarLegendPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      id="partner-calendar-legend-panel"
      role="dialog"
      aria-label="Kalender-Erklärung"
      className="absolute right-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
    >
      {/* WP-025: the only visible calendar explanation. Day cells show just
          the number, the band and the red today dot. Entered data and estimates
          are separate groups; every estimate says "Kann abweichen". */}
      <div className="space-y-2 text-xs text-neutral-700">
        <section aria-label="Eingetragen">
          <h3 className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Eingetragen</h3>
          <ul className="space-y-1.5">
            <li className="flex items-start gap-2">
              <span className={`mt-0.5 size-3 shrink-0 rounded-full ${filledSwatchClassName(calendarPhaseColors.confirmed.fill)}`} aria-hidden="true" />
              Periode bestätigt
            </li>
            {hasManualPmsSection && (
              <li className="flex items-start gap-2">
                <span className={`mt-0.5 size-3 shrink-0 rounded-full ${filledSwatchClassName(calendarPhaseColors.pmsManual.fill)}`} aria-hidden="true" />
                PMS eingetragen
              </li>
            )}
          </ul>
        </section>
        {hasAnyPrediction && (
          <section aria-label="Geschätzt">
            <h3 className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Geschätzt</h3>
            <ul className="space-y-1.5">
              {[
                { label: "Nächste Periode", swatchClassName: outlineSwatchClassName(calendarPhaseColors.periodEstimate.outline), visible: true },
                { label: "PMS-Phase", swatchClassName: outlineSwatchClassName(calendarPhaseColors.pmsEstimate.outline), visible: true },
              ]
                .filter((row) => row.visible)
                .map((row) => (
                  <li key={row.label} className="flex items-start gap-2">
                    <span className={`mt-0.5 size-3 shrink-0 rounded-full ${row.swatchClassName}`} aria-hidden="true" />
                    <span>
                      {row.label}
                      <span className="block text-[11px] text-neutral-500">Kann abweichen</span>
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}
        {isUncertain && <p className="text-[11px] font-semibold text-pink-700">Vorhersage unsicher – Kann abweichen</p>}
      </div>
    </div>
  );
}

interface DayDetailModalProps {
  date: string;
  status: PrimaryDayStatus;
  isFertile: boolean;
  isUncertain: boolean;
  manualSymptoms: PmsSymptom[];
  onClose: () => void;
}

function DayDetailModal({ date, status, isFertile, isUncertain, manualSymptoms, onClose }: DayDetailModalProps) {
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
      aria-labelledby="partner-day-detail-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
        <h2 id="partner-day-detail-title" className="text-lg font-semibold capitalize text-neutral-950">
          {formatFullGermanDate(date)}
        </h2>
        <p className="mt-3 text-base text-neutral-700">{primaryStatusLabel[status]}</p>
        {status === "pms-manual" && manualSymptoms.length > 0 && (
          <p className="mt-1 text-sm text-pink-800">{manualSymptoms.map((symptom) => PMS_SYMPTOM_LABELS[symptom]).join(", ")}</p>
        )}
        {isFertile && status !== "ovulation" && (
          <p className="mt-1 text-sm text-violet-700">Mögliches fruchtbares Zeitfenster – kann abweichen</p>
        )}
        {isUncertain && (status === "ovulation" || status === "period") && (
          <p className="mt-2 text-sm font-semibold text-pink-700">Vorhersage unsicher - Kann abweichen</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

export default function NewPartnerCalendar({ confirmedDates, prediction, manualPmsSection, periods, historicalPhases, today }: NewPartnerCalendarProps) {
  const [todayKey] = useState(() => todayBerlinDateOnly());
  const [todayYear, todayMonthIndex, todayDay] = todayKey.split("-").map(Number);
  const [displayedMonth, setDisplayedMonth] = useState({ year: todayYear, month: todayMonthIndex - 1 });
  const [selectedDay, setSelectedDay] = useState<{ date: string; status: PrimaryDayStatus; isFertile: boolean } | null>(null);
  const [isCalendarLegendOpen, setIsCalendarLegendOpen] = useState(false);

  const confirmedSet = new Set(confirmedDates);
  const historicalPmsSet = new Set(historicalPhases.pmsDates);
  const historicalOvulationSet = new Set(historicalPhases.ovulationDates);
  const { cells } = getCalendarMonthGrid(displayedMonth.year, displayedMonth.month);
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(displayedMonth.year, displayedMonth.month, 1),
  );
  const isCurrentMonth = displayedMonth.year === todayYear && displayedMonth.month === todayMonthIndex - 1;

  function changeMonth(offset: number) {
    setDisplayedMonth((current) => shiftCalendarMonth(current.year, current.month, offset));
  }

  function primaryStatusFor(date: string): PrimaryDayStatus {
    if (confirmedSet.has(date)) return "confirmed";
    if (isWithinManualPmsSection(manualPmsSection, date, periods, today)) return "pms-manual";
    // WP-028: same priority as the owner calendar — real period > manual PMS
    // (current, then past) > estimates; a past ovulation only where nothing else applies.
    if (historicalPmsSet.has(date)) return "pms-manual";
    const phase = prediction ? primaryCalendarPhase(date, prediction) : null;
    if (phase) return phase;
    return historicalOvulationSet.has(date) ? "ovulation" : "none";
  }

  function isFertileFor(date: string, status: PrimaryDayStatus): boolean {
    if (!prediction) return false;
    const primaryPhase = status === "period" || status === "pms" || status === "ovulation" ? status : null;
    return showsFertileMarker(phasesForDate(date, prediction), primaryPhase);
  }

  const hasAnyPrediction = Boolean(prediction);

  return (
    <>
    <div className="space-y-3 sm:space-y-5" inert={selectedDay ? true : undefined}>
      <CalendarTodayLine today={todayKey} compact />
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
        <button
          type="button"
          aria-label="Vorherigen Monat anzeigen"
          onClick={() => changeMonth(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-center text-2xl font-light text-neutral-500 hover:bg-neutral-100"
        >
          ‹
        </button>
        <div className="flex items-center justify-center gap-1">
          <h2 className="text-center text-lg font-semibold capitalize text-neutral-950 sm:text-xl">{monthName}</h2>
          <div className="relative">
            <button
              type="button"
              aria-expanded={isCalendarLegendOpen}
              aria-haspopup="dialog"
              aria-controls="partner-calendar-legend-panel"
              aria-label={isCalendarLegendOpen ? "Erklärungen zum Kalender ausblenden" : "Erklärungen zum Kalender anzeigen"}
              onClick={() => setIsCalendarLegendOpen((current) => !current)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-neutral-500 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
            >
              <span aria-hidden="true">ⓘ</span>
            </button>
            <PartnerCalendarLegendPopover
              isOpen={isCalendarLegendOpen}
              onClose={() => setIsCalendarLegendOpen(false)}
              hasAnyPrediction={hasAnyPrediction}
              hasManualPmsSection={Boolean(manualPmsSection)}
              isUncertain={Boolean(prediction?.isUncertain)}
            />
          </div>
        </div>
        <button
          type="button"
          aria-label="Nächsten Monat anzeigen"
          onClick={() => changeMonth(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-center text-2xl font-light text-neutral-500 hover:bg-neutral-100"
        >
          ›
        </button>
      </div>

      {(() => {
        const dayStatuses = cells.map((day) => {
          const date = day ? dateForCalendarDay(displayedMonth.year, displayedMonth.month, day) : null;
          const status = date ? primaryStatusFor(date) : "none";
          const bandKey: PartnerBandKey | null = status !== "none" ? status : null;
          return { day, date, status, bandKey };
        });
        const bandKeys = dayStatuses.map((entry) => entry.bandKey);

        return (
      <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
        {weekdayLabels.map((label) => (
          <div key={label} className="pb-0.5 text-[11px] font-medium text-neutral-500 sm:pb-1 sm:text-xs">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          const { date, status, bandKey } = dayStatuses[index];
          const isFertile = date ? isFertileFor(date, status) : false;
          const isToday = Boolean(day && isCurrentMonth && day === todayDay);
          const ariaLabel = date
            ? `${formatFullGermanDate(date)}${isToday ? ", heute" : ""}, ${primaryStatusLabel[status]}${isFertile && status !== "ovulation" ? ", mögliches fruchtbares Zeitfenster, kann abweichen" : ""}`
            : "";
          const bandPosition = calendarBandPosition(bandKeys, index);
          // WP-022 Korrektur V4: wide centered pill band reaching past the
          // tile edge into the grid gap (gap-1/sm:gap-1.5 here), mirroring
          // NewCycleExample.tsx's owner calendar — see the detailed comment
          // there. Also drops the outer ring-2 ring-offset-1 "today" frame
          // (Korrektur V3's requirement, folded into V4): today is now only
          // the small red circle behind the number, same as the owner view.
          const bandEdgeInsetClassName = "-left-[0.125rem] -right-[0.125rem] sm:-left-[0.1875rem] sm:-right-[0.1875rem]";
          const bandRoundingClassName =
            bandPosition === "single"
              ? "rounded-full"
              : bandPosition === "start"
                ? "rounded-l-full rounded-r-none"
                : bandPosition === "end"
                  ? "rounded-r-full rounded-l-none"
                  : "rounded-none";
          return (
            <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
              {bandKey && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-1/2 h-[62%] -translate-y-1/2 ${bandEdgeInsetClassName} ${primaryStatusBandStyle[bandKey]} ${filledBandKeys.includes(bandKey) ? "" : calendarBandBorderClassName(bandPosition)} ${bandRoundingClassName}`}
                />
              )}
              {/* WP-022 Korrektur V5: a day carrying a visible band loses its
                  own tile border (same reasoning as NewCycleExample.tsx's
                  owner calendar) so a multi-day band shows no seam between
                  tiles; neutral days (status "none") keep their border. */}
              {day && (
                <button
                  type="button"
                  aria-label={ariaLabel}
                  onClick={() => setSelectedDay({ date: date as string, status, isFertile })}
                  className={`relative z-10 grid h-full w-full place-items-center rounded-xl border bg-transparent text-xs sm:text-sm ${
                    bandKey
                      ? `border-transparent ${primaryStatusBandTextStyle[bandKey]}`
                      : "border-transparent text-neutral-700"
                  }`}
                >
                  <span className="relative">
                    {isToday && (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-red-600 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                      />
                    )}
                    <span className={isToday ? "relative text-white" : "relative"}>{day}</span>
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
        );
      })()}

    </div>
    {selectedDay && (
      <DayDetailModal
        date={selectedDay.date}
        status={selectedDay.status}
        isFertile={selectedDay.isFertile}
        isUncertain={Boolean(prediction?.isUncertain)}
        manualSymptoms={manualPmsSymptomsForDate(manualPmsSection, selectedDay.date, periods, today)}
        onClose={() => setSelectedDay(null)}
      />
    )}
    </>
  );
}
