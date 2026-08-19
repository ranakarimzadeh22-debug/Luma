"use client";

import { useState, useMemo } from "react";
import { CycleData, getDayOfCycle, getProgressiveDayColor, getDayInfo } from "@/lib/cycle-calendar";
import DayDetailModal from "./DayDetailModal";

interface CalendarProps {
  cycleData: CycleData;
  currentDay: number;
  isPregnant?: boolean;
  pregnancyWeek?: number;
  pregnancyFruit?: string;
  dueDate?: string;
  colors?: {
    bg?: string;
    surface?: string;
    roseLight?: string;
    rose?: string;
    roseMid?: string;
    roseDark?: string;
    roseStrong?: string;
    dark?: string;
    mid?: string;
    muted?: string;
    border?: string;
    shadow?: string;
    shadowSm?: string;
  };
}

const DEFAULT_COLORS = {
  bg: "#fef6f8",
  surface: "#ffffff",
  roseLight: "#fce4ed",
  rose: "#f4c7d7",
  roseMid: "#e8a0b4",
  roseDark: "#c47a9a",
  roseStrong: "#d48a9a",
  dark: "#3a2d3f",
  mid: "#6b5a7a",
  muted: "#a094a8",
  border: "#f0e0e8",
  shadow: "0 4px 20px rgba(196,122,154,0.10)",
  shadowSm: "0 2px 10px rgba(196,122,154,0.06)",
};

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getMonthDays(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < startOffset; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

const MONTH_NAMES_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export default function Calendar({
  cycleData,
  currentDay,
  isPregnant,
  pregnancyWeek,
  pregnancyFruit,
  dueDate,
  colors: customColors,
}: CalendarProps) {
  const C = { ...DEFAULT_COLORS, ...customColors };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dayOfCycle: number;
    isPeriod: boolean;
    isOvulation: boolean;
    isFertile: boolean;
    phase: string;
    color: string;
    date: Date;
  } | null>(null);

  const weeks = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const cycleStart = new Date(cycleData.lastPeriodStart);
  cycleStart.setHours(0, 0, 0, 0);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDayClick(day: number | null) {
    if (day === null) return;

    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    const dayOfCycle = getDayOfCycle(date, cycleData);
    if (dayOfCycle <= 0) {
      setSelectedDayInfo({
        dayOfCycle: -1,
        isPeriod: false,
        isOvulation: false,
        isFertile: false,
        phase: "Vor Zyklusbeginn",
        color: "#f0f0f0",
        date,
      });
      setSelectedDate(date);
      return;
    }
    const info = getDayInfo(dayOfCycle, cycleData);
    if (info) {
      setSelectedDayInfo({
        dayOfCycle: info.dayOfCycle,
        isPeriod: info.isPeriod,
        isOvulation: info.isOvulation,
        isFertile: info.isFertile,
        phase: info.phase,
        color: info.color,
        date,
      });
      setSelectedDate(date);
    }
  }

  function closeModal() {
    setSelectedDate(null);
    setSelectedDayInfo(null);
  }

  const isToday = (day: number) => {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  return (
    <div>
      {/* Pregnancy Header */}
      {isPregnant && (
        <div
          className="rounded-3xl p-5 mb-5"
          style={{ background: C.roseLight, border: `1.5px solid ${C.rose}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: C.roseMid }}>SCHWANGERSCHAFT</p>
              <p className="text-lg font-medium" style={{ color: C.dark }}>
                Woche {pregnancyWeek}
              </p>
              {pregnancyFruit && (
                <p className="text-sm" style={{ color: C.roseMid }}>
                  So groß wie {pregnancyFruit}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: C.muted }}>Geburtstermin</p>
              <p className="text-sm font-medium" style={{ color: C.dark }}>
                {dueDate ? new Date(dueDate).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </p>
              {dueDate && (() => {
                const due = new Date(dueDate);
                due.setHours(0, 0, 0, 0);
                const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                return (
                  <p className="text-xs mt-1" style={{ color: C.roseDark }}>
                    {diff > 0 ? `noch ${diff} Tage` : diff === 0 ? "heute" : "überfällig"}
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-70 hover:scale-105 active:scale-95"
          style={{ background: C.roseLight, color: C.roseMid }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h2 className="text-base font-semibold" style={{ color: C.dark }}>
          {MONTH_NAMES_DE[viewMonth]} {viewYear}
        </h2>

        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-70 hover:scale-105 active:scale-95"
          style={{ background: C.roseLight, color: C.roseMid }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-xs font-medium py-1" style={{ color: C.muted }}>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: C.roseLight + "55", border: `1.5px solid ${C.rose}` }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day, di) => {
              if (day === null) {
                return <div key={di} className="aspect-square" />;
              }

              const date = new Date(viewYear, viewMonth, day);
              date.setHours(0, 0, 0, 0);
              const dayOfCycle = getDayOfCycle(date, cycleData);
              const color = dayOfCycle > 0 ? getProgressiveDayColor(dayOfCycle, currentDay, cycleData) : "#f0f0f0";
              const isTodayFlag = isToday(day);

              return (
                <button
                  key={di}
                  onClick={() => handleDayClick(day)}
                  className="aspect-square flex flex-col items-center justify-center relative transition-all hover:opacity-80"
                  style={{
                    background: dayOfCycle > 0 ? color + "55" : "transparent",
                    borderRadius: 0,
                  }}
                >
                  <span
                    className={`text-sm font-medium ${isTodayFlag ? "text-base" : ""}`}
                    style={{
                      color: isTodayFlag ? C.dark : dayOfCycle > 0 ? C.dark : "#d0d0d0",
                      fontWeight: isTodayFlag ? 700 : 400,
                    }}
                  >
                    {day}
                  </span>
                  {isTodayFlag && (
                    <span
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: C.roseMid }}
                    />
                  )}
                  {dayOfCycle > 0 && (
                    <span className="text-[9px] mt-0.5" style={{ color: C.muted }}>
                      T{dayOfCycle}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.rose }} />
          <span className="text-xs" style={{ color: C.muted }}>Periode</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.roseStrong }} />
          <span className="text-xs" style={{ color: C.muted }}>Fruchtbar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.roseMid }} />
          <span className="text-xs" style={{ color: C.muted }}>Eisprung</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: C.roseLight }} />
          <span className="text-xs" style={{ color: C.muted }}>Normal</span>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && selectedDayInfo && (
        <DayDetailModal
          date={selectedDate}
          dayInfo={selectedDayInfo}
          cycleData={cycleData}
          onClose={closeModal}
        />
      )}
    </div>
  );
}