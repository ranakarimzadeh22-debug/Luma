"use client";

interface CycleRingProps {
  daysUntil: number;
  cycleLength: number;
  currentDay: number;
  phase: string;
  phaseColor: string;
  labelUntil: string;
  labelExpected: string;
}

const colorMap: Record<string, string> = {
  rose: "#f43f5e",
  pink: "#ec4899",
  purple: "#a855f7",
  indigo: "#6366f1",
};

export default function CycleRing({ daysUntil, cycleLength, currentDay, phase, phaseColor, labelUntil, labelExpected }: CycleRingProps) {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = currentDay / cycleLength;
  const strokeDashoffset = circumference * (1 - progress);
  const color = colorMap[phaseColor] ?? colorMap.rose;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke="#fecdd3"
            strokeWidth={stroke}
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="transparent"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{daysUntil > 0 ? daysUntil : "Heute"}</span>
          {daysUntil > 0 && <span className="text-xs text-gray-500">Tage</span>}
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">
        {daysUntil > 0 ? labelUntil : labelExpected}
      </p>
    </div>
  );
}
