"use client";

import { useState } from "react";

/* ==================== Types ==================== */

export interface PhaseSegment {
  key: string;
  label: string;
  color: string;
  textColor: string;
  bodyInfo: string;
  icon: string;
  daysLabel: string;
}

/* ==================== Phase Data ==================== */

export function getCyclePhases(periodLength: number, cycleLength: number): PhaseSegment[] {
  return [
    {
      key: "menstruation",
      label: "Menstruation",
      color: "#f4c7d7",
      textColor: "#c47a9a",
      icon: "🌑",
      daysLabel: `Tag 1–${periodLength}`,
      bodyInfo:
        "Die Gebärmutterschleimhaut wird abgebaut und ausgeschieden. Dein Körper regeneriert sich – Ruhe und Wärme sind jetzt besonders wohltuend.",
    },
    {
      key: "follikel",
      label: "Follikelphase",
      color: "#cfe8d5",
      textColor: "#5a9e72",
      icon: "🌒",
      daysLabel: `Tag ${periodLength + 1}–13`,
      bodyInfo:
        "Das follikelstimulierende Hormon (FSH) steigt an. Eibläschen in den Eierstöcken beginnen zu reifen. Der Östrogenspiegel nimmt zu – du fühlst dich energiegeladener und optimistischer.",
    },
    {
      key: "eisprung",
      label: "Eisprung (Ovulation)",
      color: "#b799e5",
      textColor: "#7a5a9e",
      icon: "🌕",
      daysLabel: "Tag 14–16",
      bodyInfo:
        "Der LH-Spiegel erreicht seinen Höhepunkt. Ein reifes Ei wird aus dem Eierstock freigesetzt – die fruchtbarste Phase deines Zyklus. Kommunikation und soziale Energie sind auf ihrem Höhepunkt.",
    },
    {
      key: "luteal",
      label: "Lutealphase",
      color: "#ffd9c7",
      textColor: "#c4845a",
      icon: "🌘",
      daysLabel: `Tag 17–${cycleLength}`,
      bodyInfo:
        "Der Gelbkörper produziert Progesteron. Die Gebärmutterschleimhaut wird auf eine mögliche Einnistung vorbereitet. In dieser Phase können PMS-Symptome auftreten – Zeit für Entspannung und Achtsamkeit.",
    },
  ];
}

/* ==================== SVG Arc Helpers ==================== */

/** Convert degrees to radians */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Get (x, y) point on a circle */
function pointOnCircle(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = degToRad(angleDeg);
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

/**
 * Build an SVG arc path string.
 * Starts from startAngle (degrees, 0 = top), sweeps clockwise by sweepAngle.
 */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepAngle: number
): string {
  const endAngle = startAngle + sweepAngle;
  const start = pointOnCircle(cx, cy, r, startAngle);
  const end = pointOnCircle(cx, cy, r, endAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Build a closed SVG path for a donut segment */
function donutSegmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  sweepAngle: number
): string {
  const endAngle = startAngle + sweepAngle;
  const outerStart = pointOnCircle(cx, cy, outerR, startAngle);
  const outerEnd = pointOnCircle(cx, cy, outerR, endAngle);
  const innerStart = pointOnCircle(cx, cy, innerR, startAngle);
  const innerEnd = pointOnCircle(cx, cy, innerR, endAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/* ==================== CycleWheel Component ==================== */

interface CycleWheelProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
}

export default function CycleWheel({ currentDay, cycleLength, periodLength }: CycleWheelProps) {
  const phases = getCyclePhases(periodLength, cycleLength);

  // Calculate phase boundaries in days (0-indexed day of cycle)
  const phaseEnds = [
    periodLength,           // Menstruation ends
    13,                     // Follikel ends
    16,                     // Eisprung ends
    cycleLength,            // Luteal ends
  ];

  // Map day-of-cycle to phase index (1-indexed day)
  function getPhaseIndex(day: number): number {
    if (day <= periodLength) return 0;
    if (day <= 13) return 1;
    if (day <= 16) return 2;
    return 3;
  }

  const currentPhaseIndex = getPhaseIndex(currentDay);

  // Hover state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const displayIndex = hoveredIndex !== null ? hoveredIndex : currentPhaseIndex;

  // SVG dimensions
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 100;
  const innerR = 60;
  const totalDegrees = 360;

  // Calculate sweep angles for each phase
  const sweepAngles = phases.map((_, i) => {
    const prevEnd = i === 0 ? 0 : phaseEnds[i - 1];
    const daysInPhase = phaseEnds[i] - prevEnd;
    return (daysInPhase / cycleLength) * totalDegrees;
  });

  // Build donut segments
  let currentAngle = 0; // start from top
  const segments = phases.map((phase, i) => {
    const sweep = sweepAngles[i];
    const path = donutSegmentPath(cx, cy, outerR, innerR, currentAngle, sweep);
    // Calculate the mid-angle of this segment for label placement
    const midAngle = currentAngle + sweep / 2;
    const labelPoint = pointOnCircle(cx, cy, (outerR + innerR) / 2, midAngle);
    const iconPoint = pointOnCircle(cx, cy, innerR + 20, midAngle);

    const startAngle = currentAngle;
    currentAngle += sweep;
    return { path, midAngle, labelPoint, iconPoint, startAngle, sweep, ...phase };
  });

  // Determine where the current-day dot goes on the outer edge
  const dayAngle = ((currentDay - 0.5) / cycleLength) * totalDegrees; // center of day's segment
  const dotPos = pointOnCircle(cx, cy, outerR + 4, dayAngle);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* SVG Circle */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => (
            <path
              key={seg.key}
              d={seg.path}
              fill={seg.color}
              stroke={hoveredIndex === i ? seg.textColor : "white"}
              strokeWidth={hoveredIndex === i ? 2.5 : 1.5}
              className="cursor-pointer transition-all duration-200"
              style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() =>
                setHoveredIndex(hoveredIndex === i ? null : i)
              }
            />
          ))}

          {/* Day numbers around the outer edge (like a clock) */}
          {Array.from({ length: cycleLength }, (_, i) => {
            const dayNum = i + 1;
            // Each day spans 360/cycleLength degrees; place number at center of its segment
            const angle = ((dayNum - 0.5) / cycleLength) * totalDegrees;
            const pos = pointOnCircle(cx, cy, outerR + 16, angle);
            const isCurrent = dayNum === currentDay;
            // Day-specific angle offset for text alignment
            return (
              <text
                key={`day-${dayNum}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isCurrent ? 9 : 7}
                fontWeight={isCurrent ? "bold" : "normal"}
                fill={isCurrent ? "#3a2d3f" : "#a094a8"}
                className="pointer-events-none select-none"
              >
                {dayNum}
              </text>
            );
          })}

          {/* Phase icons inside the donut */}
          {segments.map((seg) => (
            <text
              key={`icon-${seg.key}`}
              x={seg.iconPoint.x}
              y={seg.iconPoint.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              className="pointer-events-none select-none"
            >
              {seg.icon}
            </text>
          ))}

          {/* Current day dot on outer edge */}
          <circle
            cx={dotPos.x}
            cy={dotPos.y}
            r={6}
            fill="#3a2d3f"
            stroke="white"
            strokeWidth={2}
            className="pointer-events-none"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold" style={{ color: "#3a2d3f" }}>
              {currentDay}
            </span>
            <span className="text-xs" style={{ color: "#a094a8" }}>
              von {cycleLength} Tagen
            </span>
          </div>
        </div>
      </div>

      {/* Phase legend dots row */}
      <div className="flex gap-3 flex-wrap justify-center">
        {phases.map((p, i) => (
          <button
            key={p.key}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() =>
              setHoveredIndex(hoveredIndex === i ? null : i)
            }
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-all cursor-pointer"
            style={{
              background:
                displayIndex === i ? p.color : "#f4e8f8",
              color: displayIndex === i ? p.textColor : "#a094a8",
              border: `1.5px solid ${
                displayIndex === i ? p.textColor : "transparent"
              }`,
              opacity:
                hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1,
            }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Info card for the selected/hovered phase */}
      <div
        className="w-full rounded-3xl p-5 transition-all duration-300"
        style={{
          background: phases[displayIndex].color + "88",
          border: `1.5px solid ${phases[displayIndex].color}`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{phases[displayIndex].icon}</span>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "#3a2d3f" }}
            >
              {phases[displayIndex].label}
            </p>
            <p
              className="text-xs"
              style={{ color: phases[displayIndex].textColor }}
            >
              {phases[displayIndex].daysLabel}
            </p>
          </div>
        </div>
        <p
          className="text-xs leading-relaxed"
          style={{ color: "#3a2d3f" }}
        >
          {phases[displayIndex].bodyInfo}
        </p>
      </div>
    </div>
  );
}