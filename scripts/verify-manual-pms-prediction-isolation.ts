import { predictCycle } from "../src/lib/new-cycle-prediction";
import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import { deriveManualPmsSection } from "../src/lib/manual-pms";

let failures = 0;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}`);
  if (!pass) failures += 1;
}

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const periods = [
  { id: "a", startDate: "2026-07-01", endDate: "2026-07-05", expectedEndDate: null },
  { id: "b", startDate: "2026-07-29", endDate: "2026-08-02", expectedEndDate: null },
  { id: "c", startDate: "2026-08-26", endDate: "2026-08-30", expectedEndDate: null },
  { id: "d", startDate: "2026-09-23", endDate: "2026-09-27", expectedEndDate: null },
];
const profile = { cycleLengthDays: 28, bleedingDurationDays: 5, lastPeriodStart: "2026-09-23" };
const today = "2026-10-10";

console.log("\n== WP-013: predictCycle bleibt bytegleich, unabhaengig von PMS-Symptommarkierungen ==");
{
  const before = predictCycle(periods, profile, today);
  const section = deriveManualPmsSection(periods, [{ date: "2026-10-05", symptoms: ["fatigue", "mood_swings"] }]);
  assert(section !== null, "ein manueller PMS-Abschnitt wurde aus Symptommarkierungen abgeleitet");
  const after = predictCycle(periods, profile, today);
  assertDeepEqual(before, after, "predictCycle() liefert vor und nach dem Ableiten des manuellen Abschnitts identische Werte");
}

console.log("\n== WP-013: computePersonalCycleView bleibt bytegleich, unabhaengig von PMS-Symptommarkierungen ==");
{
  const before = computePersonalCycleView(periods, { cycleLengthDays: 28 }, today);
  const section = deriveManualPmsSection(periods, [{ date: "2026-10-05", symptoms: ["fatigue"] }]);
  assert(section !== null, "ein manueller PMS-Abschnitt wurde aus Symptommarkierungen abgeleitet");
  const after = computePersonalCycleView(periods, { cycleLengthDays: 28 }, today);
  assertDeepEqual(before, after, "computePersonalCycleView() liefert vor und nach dem Ableiten des manuellen Abschnitts identische Werte");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
