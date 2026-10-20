import type { CyclePrediction } from "@/lib/new-cycle-prediction";
import { daysUntilNextPeriod } from "@/lib/next-period-countdown";
import type { PersonalCycleView } from "@/lib/personal-cycle-view";

export interface CycleOverviewPresentation {
  centerText: string | null;
  phaseText: string | null;
  nextPeriodDate: string | null;
  expectedEndDate: string | null;
  reliableCycleLengthDays: number | null;
}

const phaseLabels: Record<Exclude<PersonalCycleView["todayPhase"], null>, string> = {
  period: "Periode",
  pms: "Mögliche PMS-Phase",
  ovulation: "Mögliche Eisprungphase",
  fertile: "Mögliches fruchtbares Zeitfenster",
};

export function deriveCycleOverviewPresentation(
  view: PersonalCycleView,
  prediction: CyclePrediction | null,
  today: string,
  runningPeriodExpectedEndDate: string | null,
): CycleOverviewPresentation {
  if (view.status === "no_data") {
    return { centerText: null, phaseText: view.isRunning ? "Periode" : null, nextPeriodDate: null, expectedEndDate: null, reliableCycleLengthDays: null };
  }

  const daysRemaining = daysUntilNextPeriod(today, prediction?.nextPeriodStart ?? null);
  return {
    centerText:
      view.isRunning && view.todayCycleDay !== null
        ? `${view.todayCycleDay}. Periodentag`
        : daysRemaining !== null
          ? `${daysRemaining} ${daysRemaining === 1 ? "Tag" : "Tage"} bis zur nächsten Periode`
          : null,
    phaseText: view.isRunning ? "Periode" : view.todayPhase ? phaseLabels[view.todayPhase] : null,
    nextPeriodDate: prediction?.nextPeriodStart ?? null,
    expectedEndDate: view.isRunning ? runningPeriodExpectedEndDate : null,
    reliableCycleLengthDays: view.status === "personal" ? view.cycleLengthDays : null,
  };
}
