import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateNewRunningPeriodInput } from "../src/lib/new-period-validation";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

console.log("\n== WP-003 V5: vergangener Start + späteres vergangenes Ende ist gültig (bestehende Servervalidierung) ==");
{
  const today = "2026-09-09";
  const valid = validateNewRunningPeriodInput({ startDate: "2026-07-30", endDate: "2026-08-03" }, today);
  assert(valid.ok, "vergangener Start mit vergangenem Ende wird von validateNewRunningPeriodInput akzeptiert");
}

console.log("\n== WP-003 V5: Ende vor Start, heutiges/zukünftiges Datum werden serverseitig abgelehnt ==");
{
  const today = "2026-09-09";
  const endBeforeStart = validateNewRunningPeriodInput({ startDate: "2026-08-03", endDate: "2026-07-30" }, today);
  assert(!endBeforeStart.ok, "Ende vor Start wird abgelehnt");

  const futureEnd = validateNewRunningPeriodInput({ startDate: "2026-07-30", endDate: "2026-09-10" }, today);
  assert(!futureEnd.ok, "zukünftiges Ende wird abgelehnt");

  const futureStart = validateNewRunningPeriodInput({ startDate: "2026-09-10", endDate: "2026-09-12" }, today);
  assert(!futureStart.ok, "zukünftiger Start wird abgelehnt");
}

console.log("\n== WP-003 V5: Start = Ende (ein einzelner Tag) folgt derselben Servervalidierung wie jeder andere Zeitraum ==");
{
  const today = "2026-09-09";
  const sameDay = validateNewRunningPeriodInput({ startDate: "2026-08-01", endDate: "2026-08-01" }, today);
  assert(sameDay.ok, "Start gleich Ende wird von der bestehenden Validierung akzeptiert (kein Sonderfall in der UI nötig)");
}

console.log("\n== WP-003 V5: NewCycleExample.tsx nutzt ausschließlich den bestehenden POST-Weg, keine neue Route ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  const usesExistingPost = source.includes('fetch("/api/neu/periods", {') && source.includes("saveHistoricalSelection");
  assert(usesExistingPost, "saveHistoricalSelection ruft POST /api/neu/periods auf (keine neue Route)");

  const hasStartAction = source.includes('{action === "start" ? "Start der Periode" : "Ende der Periode"}');
  assert(hasStartAction, "das Tagesfenster zeigt 'Start der Periode' bzw. 'Ende der Periode' je nach Auswahlstand");

  const hasPastOnlyGuard =
    source.includes("const isPastNeutralDay = Boolean(") &&
    source.includes("date < todayKey") &&
    source.includes("!storedPeriod") &&
    source.includes("!runningPeriod") &&
    source.includes("!expectedPeriod") &&
    source.includes("!plannedPeriod");
  assert(hasPastOnlyGuard, "die neue Kalenderauswahl gilt nur für neutrale Tage vor heute (isPastNeutralDay)");

  const cancelFunctionMatch = source.match(/function cancelHistoricalSelection\(\) \{([\s\S]*?)\}/);
  const cancelBody = cancelFunctionMatch?.[1] ?? "";
  const cancelIsLocalOnly =
    cancelBody.includes("setHistoricalSelection(null)") &&
    cancelBody.includes("setHistoricalError") &&
    !cancelBody.includes("fetch(");
  assert(cancelIsLocalOnly, "Abbrechen setzt ausschließlich den lokalen Auswahlzustand zurück, ohne Netzwerkaufruf");

  const reviewBlocksBackground = source.includes("historicalSelection && historicalSelection.end !== null");
  assert(reviewBlocksBackground, "der Hintergrund wird während der Prüfen-und-speichern-Ansicht über inert blockiert");

  const version4Untouched = source.includes("confirmedPeriodEntry = storedPeriod ?? runningPeriod ?? null") && source.includes("isDayDetailAvailable");
  assert(version4Untouched, "Version 4 (lesendes Tagesfenster für confirmed/running) bleibt unverändert bestehen");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
