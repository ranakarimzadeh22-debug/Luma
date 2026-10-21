import { createElement } from "react";
import { renderToString } from "react-dom/server";
import CyclePersonalRing from "../src/components/CyclePersonalRing";
import CycleOverviewPanel from "../src/components/CycleOverviewPanel";
import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import { predictCycle } from "../src/lib/new-cycle-prediction";
import type { NewPeriodEntryOpen } from "../src/lib/new-period-validation";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const periods: NewPeriodEntryOpen[] = [
  { id: "a", startDate: "2026-08-05", endDate: "2026-08-09", expectedEndDate: null },
  { id: "b", startDate: "2026-09-02", endDate: "2026-09-06", expectedEndDate: null },
  { id: "c", startDate: "2026-09-30", endDate: "2026-10-04", expectedEndDate: null },
];
const ringLabels = (html: string) => ["Periode", "PMS", "Eisprung"].filter((label) => new RegExp(`<text[^>]*>${label}</text>`).test(html));

console.log("\n== WP-024 Ring: nur die aktuelle Phase trägt eine Beschriftung ==");
{
  const base = computePersonalCycleView(periods, { cycleLengthDays: 28 }, "2026-10-19");
  const render = (view: typeof base, manual = null as never) =>
    renderToString(createElement(CyclePersonalRing, { personalCycleView: view, today: "2026-10-19", manualPmsOverride: manual, compact: true }));

  const pms = render({ ...base, isRunning: false, todayPhase: "pms" });
  assert(ringLabels(pms).join() === "PMS", "aktuelle PMS-Phase: nur 'PMS' am Ring");
  const period = render({ ...base, isRunning: true, todayPhase: "period" });
  assert(ringLabels(period).join() === "Periode", "laufende Periode: nur 'Periode' am Ring");
  const ovulation = render({ ...base, isRunning: false, todayPhase: "ovulation" });
  assert(ringLabels(ovulation).join() === "Eisprung", "Eisprungphase: nur 'Eisprung' am Ring");
  const fertile = render({ ...base, isRunning: false, todayPhase: "fertile" });
  assert(ringLabels(fertile).join() === "Eisprung", "fruchtbares Zeitfenster nutzt das Eisprung-Segment als Hervorhebung");
  const none = render({ ...base, isRunning: false, todayPhase: null });
  assert(ringLabels(none).length === 0, "ohne aktuelle Phase steht keine Beschriftung am Ring");
  assert((pms.match(/<path /g) ?? []).length === (none.match(/<path /g) ?? []).length, "Segmente selbst bleiben unverändert (gleiche Anzahl Pfade)");
}

console.log("\n== WP-024 Textspalte: kleine Farb-Legende ==");
{
  const view = computePersonalCycleView(periods, { cycleLengthDays: 28 }, "2026-10-19");
  const prediction = predictCycle(periods, null, "2026-10-19");
  const html = renderToString(createElement(CycleOverviewPanel, { personalCycleView: view, prediction, today: "2026-10-19", runningPeriodExpectedEndDate: null }));
  const legend = html.match(/<ul data-cycle-phase-legend[\s\S]*?<\/ul>/)?.[0] ?? "";
  assert(legend.length > 0, "die Legende erscheint in der rechten Textspalte");
  assert(/#7d1245/.test(legend) && /Periode/.test(legend), "dunkelrot: Periode");
  assert(/#f395b3/.test(legend) && /PMS/.test(legend), "rosa: PMS");
  assert(/#b69bdf/.test(legend) && /Eisprung/.test(legend), "lila: Eisprung");
  assert(legend.indexOf("Periode") < legend.indexOf("PMS") && legend.indexOf("PMS") < legend.indexOf("Eisprung"), "Reihenfolge Periode, PMS, Eisprung");
  const noData = renderToString(createElement(CycleOverviewPanel, { personalCycleView: { ...view, status: "no_data" }, prediction: null, today: "2026-10-19", runningPeriodExpectedEndDate: null }));
  assert(!noData.includes("data-cycle-phase-legend"), "ohne ausreichende Daten keine Legende");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
