"use client";

import { useEffect, useRef, useState } from "react";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { phasesForDate, primaryCalendarPhase, showsFertileMarker, type CyclePrediction } from "@/lib/new-cycle-prediction";
import { isWithinManualPmsSection, manualPmsSymptomsForDate, type ManualPmsSection } from "@/lib/manual-pms";
import type { PmsSymptom } from "@/lib/new-pms-symptom-validation";
import CalendarTodayLine from "@/components/CalendarTodayLine";
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
 * WP-022 Korrektur V8: calm pastel bands, same look as the owner calendar
 * (dayBandStyles in NewCycleExample.tsx). Confirmed period and manual PMS are
 * soft filled pills; automatic estimates (estimated period, PMS, ovulation,
 * fertile window) are hollow outlined pills. Same PrimaryDayStatus values as
 * before; `fertile` is the existing fertile-window marker day without another
 * band.
 */
type PartnerBandKey = Exclude<PrimaryDayStatus, "none"> | "fertile";

const primaryStatusBandStyle: Record<PartnerBandKey, string> = {
  confirmed: "bg-[#fac9d6]",
  "pms-manual": "bg-[#fddbe6]",
  period: "bg-[#fff7f9] border-[#eeaabf]",
  pms: "bg-[#fff7f9] border-[#f4bfd0]",
  ovulation: "bg-[#faf7ff] border-[#c4b0ee]",
  fertile: "bg-[#faf7ff] border-[#dccff5]",
};

const filledBandKeys: ReadonlyArray<PartnerBandKey> = ["confirmed", "pms-manual"];

/** WP-022 Korrektur V6/V8: readable text color per (light) band. */
const primaryStatusBandTextStyle: Record<PartnerBandKey, string> = {
  confirmed: "text-[#7a0f3c]",
  "pms-manual": "text-[#7a0f3c]",
  period: "text-[#9f164f]",
  pms: "text-[#9f164f]",
  ovulation: "text-[#5420a5]",
  fertile: "text-[#5420a5]",
};

const primaryStatusLetter: Record<Exclude<PrimaryDayStatus, "confirmed" | "none">, string> = {
  period: "Gsch.",
  pms: "M",
  "pms-manual": "M·Sie",
  ovulation: "E",
};

interface CalendarLegendPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  hasAnyPrediction: boolean;
  hasManualPmsSection: boolean;
  hasFertileWindowSomewhere: boolean;
}

/**
 * WP-018 Korrektur Version 3: compact, non-modal popover anchored to the ⓘ
 * trigger in the partner calendar's month row, mirroring the owner's
 * CalendarLegendPopover (WP-018 Korrektur Version 2). Reuses the component's
 * already-existing hasAnyPrediction/manualPmsSection/hasFertileWindowSomewhere
 * conditions — no new status derivation, no second phase calculation. Closes
 * on Escape and on an outside click/tap, same as the owner popover. The
 * partner never gains any input affordance here.
 */
function PartnerCalendarLegendPopover({
  isOpen,
  onClose,
  hasAnyPrediction,
  hasManualPmsSection,
  hasFertileWindowSomewhere,
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
      className="absolute right-0 top-full z-10 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white/95 p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
    >
      <ul className="space-y-1.5 text-xs text-neutral-700">
        <li className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-[#fac9d6]" aria-hidden="true" />
          Periode bestätigt
        </li>
        {hasAnyPrediction && (
          <>
            <li className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Geschätzt</li>
            <li className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full border-2 border-[#eeaabf] bg-[#fff7f9]" aria-hidden="true" />
              Nächste Periode geschätzt
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full border-2 border-[#c4b0ee] bg-[#faf7ff]" aria-hidden="true" />
              Eisprung geschätzt
            </li>
            {hasFertileWindowSomewhere && (
              <li className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full border-2 border-[#dccff5] bg-[#faf7ff]" aria-hidden="true" />
                Fruchtbare Tage geschätzt
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full border-2 border-[#f4bfd0] bg-[#fff7f9]" aria-hidden="true" />
              PMS vor Periode
            </li>
          </>
        )}
        {hasManualPmsSection && (
          <li className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full bg-[#fddbe6]" aria-hidden="true" />
            PMS eingetragen
          </li>
        )}
      </ul>
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

export default function NewPartnerCalendar({ confirmedDates, prediction, manualPmsSection, periods, today }: NewPartnerCalendarProps) {
  const [todayKey] = useState(() => todayBerlinDateOnly());
  const [todayYear, todayMonthIndex, todayDay] = todayKey.split("-").map(Number);
  const [displayedMonth, setDisplayedMonth] = useState({ year: todayYear, month: todayMonthIndex - 1 });
  const [selectedDay, setSelectedDay] = useState<{ date: string; status: PrimaryDayStatus; isFertile: boolean } | null>(null);
  const [isCalendarLegendOpen, setIsCalendarLegendOpen] = useState(false);

  const confirmedSet = new Set(confirmedDates);
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
    if (!prediction) return "none";
    const phase = primaryCalendarPhase(date, prediction);
    return phase ?? "none";
  }

  function isFertileFor(date: string, status: PrimaryDayStatus): boolean {
    if (!prediction) return false;
    const primaryPhase = status === "period" || status === "pms" || status === "ovulation" ? status : null;
    return showsFertileMarker(phasesForDate(date, prediction), primaryPhase);
  }

  const hasAnyPrediction = Boolean(prediction);
  const hasFertileWindowSomewhere = cells.some((day) => {
    if (!day || !prediction) return false;
    const date = dateForCalendarDay(displayedMonth.year, displayedMonth.month, day);
    const status = primaryStatusFor(date);
    return isFertileFor(date, status);
  });

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
              hasFertileWindowSomewhere={hasFertileWindowSomewhere}
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
          const bandKey: PartnerBandKey | null =
            status !== "none" ? status : date && isFertileFor(date, status) ? "fertile" : null;
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
                    bandKey ? `border-transparent ${primaryStatusBandTextStyle[bandKey]}` : "border-transparent text-neutral-700"
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
                  {status === "confirmed" && <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">B</span>}
                  {status !== "confirmed" && status !== "none" && (
                    <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">{primaryStatusLetter[status]}</span>
                  )}
                  {isFertile && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-1 size-2.5 rounded-full border border-white bg-[#a988da] shadow-[0_0_0_1px_rgba(84,32,165,0.35)]"
                    />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
        );
      })()}

      {prediction?.isUncertain && (
        <p className="text-center text-xs font-semibold text-pink-700">Vorhersage unsicher - Kann abweichen</p>
      )}
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
