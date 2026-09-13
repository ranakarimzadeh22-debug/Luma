"use client";

import { useEffect, useState } from "react";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";
import { todayBerlinDateOnly } from "@/lib/berlin-date";
import CalendarTodayLine from "@/components/CalendarTodayLine";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type DayStatus = "confirmed" | "expected" | "estimated" | "none";

interface NewPartnerCalendarProps {
  confirmedDates: string[];
  expectedDates: string[];
  estimatedNextPeriodDates: string[];
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

const statusLabel: Record<DayStatus, string> = {
  confirmed: "Bestätigt",
  expected: "Erwartet – kann abweichen",
  estimated: "Geschätzte nächste Periode – kann abweichen",
  none: "Keine freigegebene Information",
};

interface DayDetailModalProps {
  date: string;
  status: DayStatus;
  onClose: () => void;
}

function DayDetailModal({ date, status, onClose }: DayDetailModalProps) {
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
        <p className="mt-3 text-base text-neutral-700">{statusLabel[status]}</p>
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

export default function NewPartnerCalendar({ confirmedDates, expectedDates, estimatedNextPeriodDates }: NewPartnerCalendarProps) {
  const [todayKey] = useState(() => todayBerlinDateOnly());
  const [todayYear, todayMonthIndex, todayDay] = todayKey.split("-").map(Number);
  const [displayedMonth, setDisplayedMonth] = useState({ year: todayYear, month: todayMonthIndex - 1 });
  const [selectedDay, setSelectedDay] = useState<{ date: string; status: DayStatus } | null>(null);

  const confirmedSet = new Set(confirmedDates);
  const expectedSet = new Set(expectedDates);
  const estimatedSet = new Set(estimatedNextPeriodDates);
  const { cells } = getCalendarMonthGrid(displayedMonth.year, displayedMonth.month);
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(displayedMonth.year, displayedMonth.month, 1),
  );
  const isCurrentMonth = displayedMonth.year === todayYear && displayedMonth.month === todayMonthIndex - 1;

  function changeMonth(offset: number) {
    setDisplayedMonth((current) => shiftCalendarMonth(current.year, current.month, offset));
  }

  function statusFor(date: string): DayStatus {
    if (confirmedSet.has(date)) return "confirmed";
    if (expectedSet.has(date)) return "expected";
    if (estimatedSet.has(date)) return "estimated";
    return "none";
  }

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
          const status = date ? statusFor(date) : "none";
          const isToday = Boolean(day && isCurrentMonth && day === todayDay);
          return (
            <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
              {day && (
                <button
                  type="button"
                  aria-label={`${formatFullGermanDate(date as string)}, ${statusLabel[status]}`}
                  onClick={() => setSelectedDay({ date: date as string, status })}
                  className={`relative grid h-full w-full place-items-center rounded-xl border text-sm ${
                    status === "confirmed"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : status === "expected"
                        ? "border-neutral-300 bg-neutral-200 text-neutral-900"
                        : status === "estimated"
                          ? "border-purple-300 bg-purple-100 text-purple-900"
                          : "border-neutral-200 bg-white text-neutral-700"
                  } ${isToday ? "ring-2 ring-offset-1" : ""}`}
                >
                  <span>{day}</span>
                  {status === "confirmed" && <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">B</span>}
                  {status === "expected" && <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">E</span>}
                  {status === "estimated" && <span className="absolute right-0.5 top-0.5 text-[8px] font-bold">Gsch.</span>}
                  {isToday && (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-1 size-2 -translate-x-1/2 rounded-full border border-white bg-red-600 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
                    />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-600" aria-label="Legende">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-neutral-900" aria-hidden="true" />
          Bestätigt
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-neutral-200" aria-hidden="true" />
          Erwartet – kann abweichen
        </span>
        {estimatedNextPeriodDates.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-purple-200" aria-hidden="true" />
            Geschätzte nächste Periode – kann abweichen
          </span>
        )}
      </div>

    </div>
    {selectedDay && (
      <DayDetailModal date={selectedDay.date} status={selectedDay.status} onClose={() => setSelectedDay(null)} />
    )}
    </>
  );
}
