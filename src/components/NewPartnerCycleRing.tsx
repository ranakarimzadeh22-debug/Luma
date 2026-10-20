import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import type { ManualPmsRingOverride } from "@/lib/cycle-ring-geometry";
import CycleOverviewPanel from "@/components/CycleOverviewPanel";
import type { CyclePrediction } from "@/lib/new-cycle-prediction";

interface NewPartnerCycleRingProps {
  personalCycleView: PersonalCycleView;
  runningPeriodExpectedEndDate: string | null;
  today: string;
  /**
   * WP-014 Korrektur Version 3: dieselben, bereits serverseitig abgeleiteten
   * startDate/endDate des aktiven manuellen PMS-Abschnitts (manual-pms.ts)
   * wie in der Eigenansicht, nur zur Darstellung weitergereicht. `null`,
   * wenn heute kein manueller Abschnitt aktiv ist.
   */
  manualPmsOverride: ManualPmsRingOverride | null;
  prediction: CyclePrediction | null;
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
  manualPmsOverride,
  prediction,
}: NewPartnerCycleRingProps) {
  return <CycleOverviewPanel partner personalCycleView={personalCycleView} prediction={prediction} today={today} runningPeriodExpectedEndDate={runningPeriodExpectedEndDate} manualPmsOverride={manualPmsOverride} />;
}
