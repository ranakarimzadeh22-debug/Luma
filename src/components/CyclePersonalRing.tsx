import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import { buildPersonalRingGeometry, ringPointAt } from "@/lib/cycle-ring-geometry";

const personalPhaseLabel: Record<Exclude<PersonalCycleView["todayPhase"], null>, string> = {
  period: "Periode",
  ovulation: "Mögliche Eisprungphase",
  pms: "Mögliche PMS-Phase",
};

interface CyclePersonalRingProps {
  personalCycleView: PersonalCycleView;
  today: string;
}

/**
 * Pure, read-only rendering of the personal cycle ring: the same SVG,
 * geometry, and phase/status text used on /neu (src/components/NewCycleExample.tsx)
 * and on the connected partner's read-only view (WP-004 Version 6). No
 * editing affordances live here — callers own any surrounding buttons/modals.
 */
export default function CyclePersonalRing({ personalCycleView, today }: CyclePersonalRingProps) {
  const personalRingGeometry = buildPersonalRingGeometry(personalCycleView, today);
  const hasPersonalCircle = personalCycleView.status !== "no_data";

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 320 320" role="img" aria-labelledby="cycle-ring-title cycle-ring-description" className="h-full w-full scale-[1.08] overflow-visible sm:scale-100">
        <title id="cycle-ring-title">
          {hasPersonalCircle ? "Zyklusübersicht – heutiger Stand" : "Zyklusübersicht – noch keine Daten"}
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
              return (
                <text
                  key={segment.key}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  fill="white"
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
  );
}
