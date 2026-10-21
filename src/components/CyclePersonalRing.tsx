import { useId } from "react";
import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import { buildPersonalRingGeometry, ringPointAt, type ManualPmsRingOverride } from "@/lib/cycle-ring-geometry";

interface CyclePersonalRingProps {
  personalCycleView: PersonalCycleView;
  today: string;
  /**
   * WP-014 Korrektur Version 3: present only when a manual PMS section
   * (manual-pms.ts) is active today — its startDate/endDate (unchanged,
   * already derived by the caller) then determine the drawn PMS segment's
   * boundaries instead of the usual calculated lead time, and the today
   * marker is placed inside that same segment. `null`/omitted keeps every
   * existing caller's prior calculated segment and marker position
   * unchanged.
   */
  manualPmsOverride?: ManualPmsRingOverride | null;
  /**
   * WP-016: purely visual, mobile-only compacting for the owner's own /neu
   * page — smaller container and narrower ring bands/labels within the same
   * fixed 320x320 viewBox. Defaults to false so the partner view
   * (NewPartnerCycleRing.tsx never passes this) and any sm-and-above
   * rendering stay byte-identical to before. Never changes
   * buildPersonalRingGeometry's segments, angles, or marker position.
   */
  compact?: boolean;
  centerText?: string | null;
}

/**
 * WP-022 Korrektur V7: server and browser compute sin/cos for the ring points
 * with a last-digit difference, which makes Next warn about a hydration
 * mismatch. Rounding only the rendered SVG coordinates (not the geometry)
 * keeps the serialization identical on both sides.
 */
function svgCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * WP-007: the "Vorhersage unsicher" notice only applies to today's
 * ovulation/fertile-window estimate, per the Soll text — a PMS or neutral
 * day keeps its normal cycle-length text even when isUncertain is true.
 */
/**
 * Pure, read-only rendering of the personal cycle ring: the same SVG,
 * geometry, and phase/status text used on /neu (src/components/NewCycleExample.tsx)
 * and on the connected partner's read-only view (WP-004 Version 6). No
 * editing affordances live here — callers own any surrounding buttons/modals.
 */
export default function CyclePersonalRing({
  personalCycleView,
  today,
  manualPmsOverride = null,
  compact = false,
  centerText = null,
}: CyclePersonalRingProps) {
  const personalRingGeometry = buildPersonalRingGeometry(personalCycleView, today, manualPmsOverride);
  const hasPersonalCircle = personalCycleView.status !== "no_data";
  const ringStrokeWidth = compact ? "30" : "38";
  // WP-024 visual correction: only the segment of the current phase carries a
  // label (the legend in the text column names all three). Purely derived from
  // the already computed view / manual PMS override — no new phase logic.
  const currentSegmentKey: "period" | "fertile" | "pms" | null =
    personalCycleView.isRunning || personalCycleView.todayPhase === "period"
      ? "period"
      : manualPmsOverride || personalCycleView.todayPhase === "pms"
        ? "pms"
        : personalCycleView.todayPhase === "ovulation" || personalCycleView.todayPhase === "fertile"
          ? "fertile"
          : null;
  // WP-022 Korrektur V7: the mobile (sm:hidden) and wide (hidden sm:block)
  // ring instances are both in the DOM, so every id must be unique per
  // instance; useId() is SSR-stable. Non-word characters are stripped so the
  // value is safe inside url(#...) and aria-labelledby.
  const idPrefix = `cycle-ring-${useId().replace(/\W/g, "")}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;
  const shadowId = `${idPrefix}-shadow`;
  const periodGradientId = `${idPrefix}-period-gradient`;
  const pmsGradientId = `${idPrefix}-pms-gradient`;
  const ovulationGradientId = `${idPrefix}-ovulation-gradient`;

  return (
    <div className={`relative mx-auto aspect-square w-full ${compact ? "max-w-[17rem]" : "max-w-[22rem]"}`}>
      <svg viewBox="0 0 320 320" role="img" aria-labelledby={`${titleId} ${descriptionId}`} className="h-full w-full scale-[1.08] overflow-visible sm:scale-100">
        <title id={titleId}>
          {hasPersonalCircle ? "Zyklusübersicht – heutiger Stand" : "Zyklusübersicht – noch keine Daten"}
        </title>
        <desc id={descriptionId}>
          {hasPersonalCircle
            ? "Segmente für Periode, mögliches fruchtbares Zeitfenster mit Eisprungtag und mögliche PMS-Phase sowie ein Heute-Marker."
            : "Neutraler Kreis ohne persönliche Phase, solange keine ausreichenden Daten vorliegen."}
        </desc>
        <defs>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#7f315d" floodOpacity="0.12" />
          </filter>
          <linearGradient id={periodGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9c1550" /><stop offset="1" stopColor="#6d0f3a" />
          </linearGradient>
          <linearGradient id={pmsGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f8a8c1" /><stop offset="1" stopColor="#ef82a5" />
          </linearGradient>
          <linearGradient id={ovulationGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9b3ea" /><stop offset="1" stopColor="#a988da" />
          </linearGradient>
        </defs>

        <circle cx="160" cy="160" r="125" fill="none" stroke="#f1dfe6" strokeWidth={ringStrokeWidth} />

        {personalRingGeometry ? (
          <>
            <g fill="none" strokeWidth={ringStrokeWidth} strokeLinecap="round" filter={`url(#${shadowId})`}>
              {personalRingGeometry.segments.map((segment) => (
                <path
                  key={segment.key}
                  d={segment.path}
                  stroke={
                    segment.key === "period"
                      ? `url(#${periodGradientId})`
                      : segment.key === "fertile"
                        ? `url(#${ovulationGradientId})`
                        : `url(#${pmsGradientId})`
                  }
                />
              ))}
            </g>
            {personalRingGeometry.segments.filter((segment) => segment.key === currentSegmentKey).map((segment) => {
              const point = ringPointAt(segment.labelAngle);
              const label =
                segment.key === "period" ? "Periode" : segment.key === "fertile" ? "Eisprung" : "PMS";
              // Keep every phase name inside its colored arc: longer words
              // get a smaller font, and the text follows the local tangent
              // of the ring instead of extending horizontally across it.
              const labelFontSize = Math.max(9, Math.min(compact ? 12 : 13, Math.floor(80 / label.length)));
              const tangentAngle = ((segment.labelAngle + 90) % 360 + 360) % 360;
              const labelRotation = tangentAngle > 90 && tangentAngle < 270 ? tangentAngle + 180 : tangentAngle;
              return (
                <text
                  key={segment.key}
                  x={svgCoord(point.x)}
                  y={svgCoord(point.y)}
                  textAnchor="middle"
                  fill="white"
                  fontSize={labelFontSize}
                  fontWeight="700"
                  transform={`rotate(${svgCoord(labelRotation)} ${svgCoord(point.x)} ${svgCoord(point.y)})`}
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
                <circle cx={svgCoord(marker.x)} cy={svgCoord(marker.y)} r="6" fill="#e11d3f" stroke="white" strokeWidth="2">
                  <title>{markerName}</title>
                </circle>
              );
            })()}
          </>
        ) : (
          <circle cx="160" cy="160" r="125" fill="none" stroke="#e7d3da" strokeWidth={ringStrokeWidth} strokeDasharray="2 14" strokeLinecap="round" />
        )}

        <g textAnchor="middle">
          {centerText && centerText.includes(" bis zur nächsten Periode") ? (
            <text x="160" y="154" fill="#351127" fontFamily="Georgia, serif" fontSize="18" fontWeight="600">
              <tspan x="160">{centerText.replace(" nächsten Periode", "")}</tspan>
              <tspan x="160" dy="22">nächsten Periode</tspan>
            </text>
          ) : centerText ? (
            <text x="160" y="166" fill="#351127" fontFamily="Georgia, serif" fontSize="22" fontWeight="600">{centerText}</text>
          ) : null}
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
