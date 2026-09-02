"use client";

import { useState } from "react";
import { getCalendarMonthGrid, shiftCalendarMonth } from "@/lib/calendar-month";

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

export default function NewCycleExample() {
  const [today] = useState(() => new Date());
  const [exampleMonth] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [displayedMonth, setDisplayedMonth] = useState(exampleMonth);
  const { cells } = getCalendarMonthGrid(displayedMonth.year, displayedMonth.month);
  const monthName = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(
    new Date(displayedMonth.year, displayedMonth.month, 1),
  );
  const isExampleMonth =
    displayedMonth.year === exampleMonth.year && displayedMonth.month === exampleMonth.month;
  const isCurrentMonth =
    displayedMonth.year === today.getFullYear() && displayedMonth.month === today.getMonth();

  function changeMonth(offset: number) {
    setDisplayedMonth((current) => shiftCalendarMonth(current.year, current.month, offset));
  }

  return (
    <div className="space-y-9 sm:space-y-10">
      <section aria-label="Beispielhafte Zyklusübersicht" className="space-y-3">
        <p className="text-center text-lg text-[#28101f]">Beispiel-Zyklus</p>

        <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
          <svg viewBox="0 0 320 320" role="img" aria-labelledby="cycle-ring-title cycle-ring-description" className="h-full w-full scale-[1.08] overflow-visible sm:scale-100">
            <title id="cycle-ring-title">Zyklusübersicht – Nur Beispiel</title>
            <desc id="cycle-ring-description">Drei beispielhafte Segmente für Periode, PMS und Eisprung sowie ein Heute-Marker.</desc>
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

            <g textAnchor="middle">
              <path d="M160 110 C151 122 153 132 160 135 C167 132 169 122 160 110Z" fill="#df6b9a" />
              <text x="160" y="164" fill="#351127" fontFamily="Georgia, serif" fontSize="25" fontWeight="600">Zyklusansicht</text>
              <rect x="116" y="178" width="88" height="25" rx="12" fill="#f8e4e9" />
              <text x="160" y="195" fill="#a52b5d" fontSize="12" fontWeight="600">Nur Beispiel</text>
              <text x="160" y="226" fill="#351127" fontFamily="Georgia, serif" fontSize="18">keine Vorhersage</text>
            </g>
          </svg>
        </div>
      </section>

      <section aria-label="Beispielkalender" className="space-y-5">
        <div className="grid grid-cols-[2rem_1fr_2rem] items-center">
          <button type="button" aria-label="Vorherigen Monat anzeigen" onClick={() => changeMonth(-1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">‹</button>
          <h2 className="text-center font-serif text-3xl font-semibold capitalize text-[#28101f]">{monthName}</h2>
          <button type="button" aria-label="Nächsten Monat anzeigen" onClick={() => changeMonth(1)} className="rounded-full text-center text-3xl font-light text-[#b85f7f] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850]">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
          {weekdayLabels.map((label) => <div key={label} className="pb-1 text-sm font-medium text-[#4b3a44]">{label}</div>)}
          {cells.map((day, index) => {
            const phase = day && isExampleMonth ? examplePhase(day) : null;
            const isToday = Boolean(day && isCurrentMonth && day === today.getDate());
            return (
              <div key={`${day ?? "empty"}-${index}`} className="relative aspect-square min-w-0">
                {day && (
                  <div className={`relative grid h-full place-items-center rounded-2xl text-base ${phase ? phaseStyles[phase] : "bg-white/55 text-[#281c24]"} ${isToday ? "ring-2 ring-[#5d32ba] ring-offset-2 ring-offset-[#fff9f8]" : ""}`}>
                    <span>{day}</span>
                    {phase && <span className="absolute right-1 top-0.5 text-[9px] font-bold" aria-label={phaseLabels[phase]}>{phaseLetters[phase]}</span>}
                    {isToday && <span className="absolute bottom-0.5 text-[8px] font-semibold leading-none text-[#4c279a]">Heute</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-[#382631]" aria-label="Legende">
          <span className="inline-flex items-center gap-2"><strong className="grid size-5 place-items-center rounded-full bg-[#4a0738] text-[9px] text-white">P</strong>Periode</span>
          <span className="inline-flex items-center gap-2"><strong className="grid size-5 place-items-center rounded-full bg-[#f3a9bd] text-[9px] text-[#831341]">M</strong>PMS</span>
          <span className="inline-flex items-center gap-2"><strong className="grid size-5 place-items-center rounded-full bg-[#d2b9ef] text-[9px] text-[#4c2098]">E</strong>Eisprung</span>
        </div>

        <div className="flex justify-center pb-1">
          <p className="rounded-full bg-[#f4e4e3] px-6 py-3 text-sm font-medium text-[#382631]"><span aria-hidden="true">✦ </span>Nur Beispiel</p>
        </div>
      </section>
    </div>
  );
}
