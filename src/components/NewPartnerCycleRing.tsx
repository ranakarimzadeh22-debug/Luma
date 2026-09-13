import type { PersonalCycleView } from "@/lib/personal-cycle-view";
import CyclePersonalRing from "@/components/CyclePersonalRing";

interface NewPartnerCycleRingProps {
  personalCycleView: PersonalCycleView;
  runningPeriodExpectedEndDate: string | null;
  today: string;
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
}: NewPartnerCycleRingProps) {
  return (
    <section aria-label="Zyklusübersicht deines Partners/deiner Partnerin" className="space-y-3">
      <p className="text-center text-lg text-[#28101f]">Zyklus-Kreis</p>
      <CyclePersonalRing personalCycleView={personalCycleView} today={today} />
      {personalCycleView.status === "no_data" && (
        <p className="text-center text-sm text-neutral-600">Noch nicht genügend Daten für eine Orientierung.</p>
      )}
      {personalCycleView.isRunning && runningPeriodExpectedEndDate && (
        <p className="text-center text-sm text-neutral-600">
          Voraussichtliches Ende: {formatGermanDate(runningPeriodExpectedEndDate)} · Kann abweichen
        </p>
      )}
    </section>
  );
}
