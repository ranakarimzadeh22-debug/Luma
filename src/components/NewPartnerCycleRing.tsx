import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import type { PmsSymptom } from "@/lib/new-pms-symptom-validation";
import type { ManualPmsRingOverride } from "@/lib/cycle-ring-geometry";
import CyclePersonalRing from "@/components/CyclePersonalRing";

const PMS_SYMPTOM_LABELS: Record<PmsSymptom, string> = {
  breast_tenderness: "Brustschmerzen/-spannen",
  abdominal_pain: "Unterleibsschmerzen",
  fatigue: "Müdigkeit",
  mood_swings: "Stimmungsschwankungen",
};

interface NewPartnerCycleRingProps {
  personalCycleView: PersonalCycleView;
  runningPeriodExpectedEndDate: string | null;
  today: string;
  manualPmsSymptoms: PmsSymptom[];
  /**
   * WP-014 Korrektur Version 3: dieselben, bereits serverseitig abgeleiteten
   * startDate/endDate des aktiven manuellen PMS-Abschnitts (manual-pms.ts)
   * wie in der Eigenansicht, nur zur Darstellung weitergereicht. `null`,
   * wenn heute kein manueller Abschnitt aktiv ist.
   */
  manualPmsOverride: ManualPmsRingOverride | null;
}

function formatGermanDate(value: string): string {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

/**
 * WP-004 Version 6: strictly read-only wrapper around the shared ring
 * renderer for the connected partner. No edit buttons, no modals, no
 * write actions — only the ring, phase text, and (for a running period)
 * the existing, already-vorsichtig expected end date, always marked
 * "Kann abweichen" and never shown as a real end.
 */
export default function NewPartnerCycleRing({
  personalCycleView,
  runningPeriodExpectedEndDate,
  today,
  manualPmsSymptoms,
  manualPmsOverride,
}: NewPartnerCycleRingProps) {
  return (
    <section aria-label="Zyklusübersicht deines Partners/deiner Partnerin" className="space-y-3">
      <p className="text-center text-lg text-[#28101f]">Zyklus-Kreis</p>
      <CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} />
      {personalCycleView.status === "no_data" && (
        <p className="text-center text-sm text-neutral-600">Noch nicht genügend Daten für eine Orientierung.</p>
      )}
      {manualPmsSymptoms.length > 0 && (
        <p className="text-center text-sm font-medium text-pink-800">
          PMS von ihr eingetragen: {manualPmsSymptoms.map((symptom) => PMS_SYMPTOM_LABELS[symptom]).join(", ")}
        </p>
      )}
      {personalCycleView.isRunning && runningPeriodExpectedEndDate && (
        <p className="text-center text-sm text-neutral-600">
          Voraussichtliches Ende: {formatGermanDate(runningPeriodExpectedEndDate)} · Kann abweichen
        </p>
      )}
    </section>
  );
}
