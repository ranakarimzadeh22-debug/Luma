import type { CyclePrediction } from "@/lib/new-cycle-prediction";
import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import type { ManualPmsRingOverride } from "@/lib/cycle-ring-geometry";
import { deriveCycleOverviewPresentation } from "@/lib/cycle-overview-presentation";
import CyclePersonalRing from "@/components/CyclePersonalRing";

interface Props {
  personalCycleView: PersonalCycleView;
  prediction: CyclePrediction | null;
  today: string;
  runningPeriodExpectedEndDate: string | null;
  manualPmsOverride?: ManualPmsRingOverride | null;
  partner?: boolean;
}

/**
 * Color legend for the three ring segments (same colors as the ring's
 * gradients). Shown only when the ring itself shows personal segments.
 */
const phaseLegend = [
  { label: "Periode", swatchClassName: "bg-[#7d1245]" },
  { label: "PMS", swatchClassName: "bg-[#f395b3]" },
  { label: "Eisprung", swatchClassName: "bg-[#b69bdf]" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function CycleOverviewPanel({ personalCycleView, prediction, today, runningPeriodExpectedEndDate, manualPmsOverride = null, partner = false }: Props) {
  const presentation = deriveCycleOverviewPresentation(personalCycleView, prediction, today, runningPeriodExpectedEndDate);
  return (
    <section aria-label={partner ? "Zyklusübersicht deines Partners/deiner Partnerin" : "Deine Zyklusübersicht"} className="grid min-w-0 grid-cols-[minmax(9.5rem,0.95fr)_minmax(0,1.05fr)] items-center gap-1.5 sm:grid-cols-[17rem_minmax(0,1fr)] sm:justify-center sm:gap-6">
      <div className="min-w-0">
        <CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} centerText={presentation.centerText} compact />
      </div>
      <div data-cycle-status-texts className="min-w-0 space-y-1.5 px-1 py-1 text-xs leading-5 text-[#382631] sm:space-y-2 sm:px-4 sm:text-sm sm:leading-6">
        {presentation.phaseText && <p className="font-semibold">{presentation.phaseText}</p>}
        {presentation.nextPeriodDate && <p><span className="font-semibold">Nächste Periode:</span> ca. {formatDate(presentation.nextPeriodDate)} · Kann abweichen</p>}
        {presentation.expectedEndDate && <p><span className="font-semibold">Voraussichtliches Ende:</span> ca. {formatDate(presentation.expectedEndDate)} · Kann abweichen</p>}
        {presentation.reliableCycleLengthDays && <p><span className="font-semibold">Zyklus:</span> {presentation.reliableCycleLengthDays} Tage</p>}
        {!presentation.phaseText && !presentation.nextPeriodDate && <p>Noch nicht genügend Daten für eine persönliche Zyklusansicht.</p>}
        {personalCycleView.status !== "no_data" && (
          <ul data-cycle-phase-legend aria-label="Farben im Zyklus-Kreis" className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] leading-4 sm:text-xs">
            {phaseLegend.map((entry) => (
              <li key={entry.label} className="flex items-center gap-1.5">
                <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${entry.swatchClassName}`} />
                {entry.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
