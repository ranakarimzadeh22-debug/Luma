"use client";

import { useEffect, useState } from "react";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import { phasesForDate, primaryCalendarPhase, showsFertileMarker, type CyclePrediction } from "@/lib/new-cycle-prediction";
import CalendarTodayLine from "@/components/CalendarTodayLine";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type PrimaryDayStatus = "confirmed" | "period" | "pms" | "ovulation" | "none";

interface NewPartnerCalendarProps {
  confirmedDates: string[];
  prediction: CyclePrediction | null;
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
  ovulation: "Möglicher Eisprung – kann abweichen",
  none: "Keine freigegebene Information",
};

const primaryStatusStyle: Record<PrimaryDayStatus, string> = {
  confirmed: "border-neutral-900 bg-neutral-900 text-white",
  period: "border-purple-300 bg-purple-100 text-purple-900",
  pms: "border-pink-300 bg-pink-100 text-pink-900",
  ovulation: "border-violet-300 bg-violet-100 text-violet-900",
  none: "border-neutral-200 bg-white text-neutral-700",
};

const primaryStatusLetter: Record<Exclude<PrimaryDayStatus, "confirmed" | "none">, string> = {
  period: "Gsch.",
  pms: "M",
  ovulation: "E",
};

interface DayDetailModalProps {
  date: string;
  status: PrimaryDayStatus;
  isFertile: boolean;
  isUncertain: boolean;
  onClose: () => void;
}

function DayDetailModal({ date, status, isFertile, isUncertain, onClose }: DayDetailModalProps) {
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

export default function NewPartnerCalendar({ confirmedDates, prediction }: NewPartnerCalendarProps) {
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
    <div className="space-y-5" inert={selectedDay ? true : undefined}>
      <CalendarTodayLine today={todayKey} />
      <div className="grid grid-cols-[2rem_1fr_2rem] items-center">
        <button
          type="button"
          aria-label="Vorherigen Monat anzeigen"
          onClick={() => changeMonth(-1)}
          className="rounded-full text-center text-2xl font-light text-neutral-500 hover:bg-neutral-100"
        >
          ‹
        </button>
        <h2 className="text-center text-xl font-semibold capitalize text-neutral-950">{monthName}</h2>
        <button
          type="button"
          aria-label="Nächsten Monat anzeigen"
          onClick={() => changeMonth(1)}
          className="rounded-full text-center text-2xl font-light text-neutral-500 hover:bg-neutral-100"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {weekdayLabels.map((label) => (
          <div key={label} className="pb-1 text-xs font-medium text-neutral-500">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          const date = day ? dateForCalendarDay(displayedMonth.year, displayedMonth.month, day) : null;
          const status = date ? primaryStatusFor(date) : "none";
          const isFertile = date ? isFertileFor(date, status) : false;
          const isToday = Boolean(day && isCurrentMonth && day === todayDay);
          const ariaLabel = date
            ? `${formatFullGermanDate(date)}, ${primaryStatusLabel[status]}${isFertile && status !== "ovulation" ? ", mögliches fruchtbares Zeitfenster, kann abweichen" : ""}`
            : "";
          return (
            <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
              {day && (
                <button
                  type="button"
                  aria-label={ariaLabel}
                  onClick={() => setSelectedDay({ date: date as string, status, isFertile })}
                  className={`relative grid h-full w-full place-items-center rounded-xl border text-sm ${primaryStatusStyle[status]} ${isToday ? "ring-2 ring-offset-1" : ""}`}
                >
                  <span>{day}</span>
                  {status === "confirmed" && <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">B</span>}
                  {status !== "confirmed" && status !== "none" && (
                    <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">{primaryStatusLetter[status]}</span>
                  )}
                  {isToday && (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-1 size-2 -translate-x-1/2 rounded-full border border-white bg-red-600 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                    />
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

      {prediction?.isUncertain && (
        <p className="text-center text-xs font-semibold text-pink-700">Vorhersage unsicher - Kann abweichen</p>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          aria-expanded={isCalendarLegendOpen}
          aria-controls="partner-calendar-legend-panel"
          onClick={() => setIsCalendarLegendOpen((current) => !current)}
          className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          {isCalendarLegendOpen ? "Erklärungen ausblenden" : "Erklärungen zum Kalender anzeigen"}
        </button>
      </div>

      {isCalendarLegendOpen && (
        <div
          id="partner-calendar-legend-panel"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-600"
          aria-label="Legende"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-neutral-900" aria-hidden="true" />
            Bestätigt
          </span>
          {hasAnyPrediction && (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-purple-200" aria-hidden="true" />
                Geschätzte nächste Periode – kann abweichen
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-violet-200" aria-hidden="true" />
                Möglicher Eisprung – kann abweichen
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-pink-200" aria-hidden="true" />
                Mögliche PMS-Phase – kann abweichen
              </span>
            </>
          )}
          {hasFertileWindowSomewhere && (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-white bg-[#a988da] shadow-[0_0_0_1px_rgba(84,32,165,0.35)]" aria-hidden="true" />
              Mögliches fruchtbares Zeitfenster – kann abweichen
            </span>
          )}
        </div>
      )}
    </div>
    {selectedDay && (
      <DayDetailModal
        date={selectedDay.date}
        status={selectedDay.status}
        isFertile={selectedDay.isFertile}
        isUncertain={Boolean(prediction?.isUncertain)}
        onClose={() => setSelectedDay(null)}
      />
    )}
    </>
  );
}
