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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function CycleOverviewPanel({ personalCycleView, prediction, today, runningPeriodExpectedEndDate, manualPmsOverride = null, partner = false }: Props) {
  const presentation = deriveCycleOverviewPresentation(personalCycleView, prediction, today, runningPeriodExpectedEndDate);
  return (
    <section aria-label={partner ? "Zyklusübersicht deines Partners/deiner Partnerin" : "Deine Zyklusübersicht"} className="grid min-w-0 gap-3 sm:grid-cols-2 sm:items-center sm:gap-6">
      <div className="min-w-0">
        <div className="sm:hidden"><CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} centerText={presentation.centerText} compact /></div>
        <div className="hidden sm:block"><CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} centerText={presentation.centerText} /></div>
      </div>
      <div className="space-y-2 rounded-2xl border border-[#efd5dc] bg-white/90 p-4 text-sm text-[#382631] shadow-sm">
        {presentation.phaseText && <p><span className="font-semibold">Aktuelle Phase:</span> {presentation.phaseText}</p>}
        {presentation.nextPeriodDate && <p><span className="font-semibold">Nächste Periode:</span> ca. {formatDate(presentation.nextPeriodDate)} · Kann abweichen</p>}
        {presentation.expectedEndDate && <p><span className="font-semibold">Voraussichtliches Ende:</span> ca. {formatDate(presentation.expectedEndDate)} · Kann abweichen</p>}
        {presentation.reliableCycleLengthDays && <p><span className="font-semibold">Individuelle Zykluslänge:</span> {presentation.reliableCycleLengthDays} Tage</p>}
        {!presentation.phaseText && !presentation.nextPeriodDate && <p>Noch nicht genügend Daten für eine persönliche Zyklusansicht.</p>}
      </div>
    </section>
  );
}
