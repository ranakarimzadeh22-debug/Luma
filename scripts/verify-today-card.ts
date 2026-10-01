import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computePersonalCycleView, deriveTodayCardText, type PersonalCycleView } from "../src/lib/personal-cycle-view";
import type { NewPeriodEntryOpen } from "../src/lib/new-period-validation";

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function period(id: string, startDate: string, endDate: string | null, expectedEndDate: string | null = null): NewPeriodEntryOpen {
  return { id, startDate, endDate, expectedEndDate };
}

console.log("\n== WP-006: no_data -> neutrale Hilfe ohne erfundene Daten ==");
{
  const view = computePersonalCycleView([], null, "2026-09-01");
  assertEqual(view.status, "no_data", "Testaufbau: view ist no_data");
  const card = deriveTodayCardText(view);
  assertEqual(card.showsEstimateNotice, false, "ohne Daten keine Kann-abweichen-Kennzeichnung");
  assert(!/periodentag|pms|ovulation|zyklustag/i.test(card.headline), "ohne Daten wird keine Phase, kein Zyklustag und keine Periodentag-Zahl erfunden");
}

console.log("\n== WP-006: tatsächliche laufende Periode mit sicherem Zyklustag -> N. Periodentag ==");
{
  const fourPeriods = [
    period("1", "2026-05-01", "2026-05-05"),
    period("2", "2026-05-29", "2026-06-02"),
    period("3", "2026-06-26", "2026-06-30"),
    period("4", "2026-07-24", null, null),
  ];
  const view = computePersonalCycleView(fourPeriods, null, "2026-07-26");
  assertEqual(view.isRunning, true, "Testaufbau: eine Periode läuft tatsächlich heute");
  assert(view.todayCycleDay !== null, "Testaufbau: der Zyklus-View liefert einen sicheren Zyklustag");
  const card = deriveTodayCardText(view);
  assertEqual(card.headline, `Heute: ${view.todayCycleDay}. Periodentag`, "laufende Periode zeigt 'Heute: N. Periodentag' mit demselben Tageswert wie der View");
}

console.log("\n== WP-006: laufende Periode ohne sicheren Zyklustag -> keine erfundene Tageszahl ==");
{
  const view = computePersonalCycleView([period("1", "2026-09-09", null, null)], null, "2026-09-09");
  assertEqual(view.status, "no_data", "Testaufbau: ohne genug Historie bleibt der View no_data");
  assertEqual(view.isRunning, true, "Testaufbau: trotzdem läuft eine bestätigte Periode");
  assertEqual(view.todayCycleDay, null, "Testaufbau: der View liefert keinen sicheren Zyklustag");
  const card = deriveTodayCardText(view);
  assert(!/\d+\.\s*Periodentag/.test(card.headline), "ohne sicheren Zyklustag wird keine Periodentag-Zahl erfunden (Stoppbedingung eingehalten)");
}

console.log("\n== WP-006: PMS-Phase ==");
{
  const periods = [
    period("1", "2026-05-01", "2026-05-05"),
    period("2", "2026-05-29", "2026-06-02"),
    period("3", "2026-06-26", "2026-06-30"),
    period("4", "2026-07-24", "2026-07-28"),
  ];
  // Zykluslänge 28 Tage, aktueller Zyklusstart 24.07.; PMS-Fenster: Tag 24..27 (letzte 5 Tage vor Tag 28)
  const view = computePersonalCycleView(periods, null, "2026-08-18");
  assertEqual(view.todayPhase, "pms", "Testaufbau: todayPhase ist pms");
  assertEqual(view.isRunning, false, "Testaufbau: keine laufende Periode an diesem Tag");
  const card = deriveTodayCardText(view);
  assertEqual(card.headline, "Heute: PMS-Phase", "PMS-Phase zeigt 'Heute: PMS-Phase'");
}

console.log("\n== WP-006: mögliche Ovulationsphase ==");
{
  const periods = [
    period("1", "2026-05-01", "2026-05-05"),
    period("2", "2026-05-29", "2026-06-02"),
    period("3", "2026-06-26", "2026-06-30"),
    period("4", "2026-07-24", "2026-07-28"),
  ];
  // Zykluslänge 28 Tage, Ovulationsfenster um Tag 14 (+/-1) ab 24.07. -> 06.08.-08.08.
  const view = computePersonalCycleView(periods, null, "2026-08-07");
  assertEqual(view.todayPhase, "ovulation", "Testaufbau: todayPhase ist ovulation");
  const card = deriveTodayCardText(view);
  assertEqual(card.headline, "Heute: mögliche Ovulationsphase", "Ovulationsphase zeigt 'Heute: mögliche Ovulationsphase'");
}

console.log("\n== WP-006: sonstiger berechenbarer Tag -> Heute: Zyklustag N ==");
{
  const periods = [
    period("1", "2026-05-01", "2026-05-05"),
    period("2", "2026-05-29", "2026-06-02"),
    period("3", "2026-06-26", "2026-06-30"),
    period("4", "2026-07-24", "2026-07-28"),
  ];
  const view = computePersonalCycleView(periods, null, "2026-07-30");
  assertEqual(view.todayPhase, null, "Testaufbau: kein pms/ovulation an diesem Tag");
  assertEqual(view.isRunning, false, "Testaufbau: keine laufende Periode");
  assert(view.todayCycleDay !== null, "Testaufbau: ein berechenbarer Zyklustag liegt vor");
  const card = deriveTodayCardText(view);
  assertEqual(card.headline, `Heute: Zyklustag ${view.todayCycleDay}`, "sonstiger Tag zeigt 'Heute: Zyklustag N' mit demselben Tageswert wie der View");
}

console.log("\n== WP-006: Schätzung (profile_estimate) zeigt 'Kann abweichen' ==");
{
  const view = computePersonalCycleView(
    [period("1", "2026-08-01", "2026-08-05")],
    { cycleLengthDays: 28 },
    "2026-08-20",
  );
  assertEqual(view.status, "profile_estimate", "Testaufbau: view beruht auf einer Profil-Schätzung");
  assertEqual(view.isEstimate, true, "Testaufbau: isEstimate ist true");
  const card = deriveTodayCardText(view);
  assertEqual(card.showsEstimateNotice, true, "eine Schätzung zeigt sichtbar 'Kann abweichen'");
}

console.log("\n== WP-006: eine bestätigte, nicht geschätzte persönliche Einordnung zeigt kein 'Kann abweichen' ==");
{
  const periods = [
    period("1", "2026-04-03", "2026-04-07"),
    period("2", "2026-05-01", "2026-05-05"),
    period("3", "2026-05-29", "2026-06-02"),
    period("4", "2026-06-26", "2026-06-30"),
  ];
  // 26.06.-30.06. ist eine echte, bereits abgeschlossene Periode: confirmedToday wird für
  // einen Tag darin wahr, ohne dass die Periode heute noch "läuft".
  const view = computePersonalCycleView(periods, null, "2026-06-28");
  assertEqual(view.status, "personal", "Testaufbau: ausreichend echte Starts für einen persönlichen Median");
  assertEqual(view.isRunning, false, "Testaufbau: die Periode ist bereits abgeschlossen, läuft nicht mehr");
  assertEqual(view.isEstimate, false, "Testaufbau: ein tatsächlich bestätigter Tag ist keine Schätzung");
  const card = deriveTodayCardText(view);
  assertEqual(card.showsEstimateNotice, false, "ohne Schätzung erscheint kein 'Kann abweichen'");
}

console.log("\n== Quelltext: Karte verwendet ausschließlich die vorhandene personalCycleView, keine eigene Berechnung ==");
{
  const libPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "personal-cycle-view.ts");
  const libSource = readFileSync(libPath, "utf8");
  const fnStart = libSource.indexOf("export function deriveTodayCardText");
  const fnBody = fnStart !== -1 ? libSource.slice(fnStart) : "";
  assert(fnBody.length > 0, "deriveTodayCardText ist in personal-cycle-view.ts vorhanden");
  assert(!fnBody.includes("new Date("), "deriveTodayCardText führt keine eigene Datumsberechnung aus");
  assert(!fnBody.includes("fetch("), "deriveTodayCardText löst keinen Netzwerkaufruf aus (rein abgeleitet)");

  const componentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewCycleExample.tsx");
  const componentSource = readFileSync(componentPath, "utf8");
  assert(componentSource.includes("<TodayCard personalCycleView={personalCycleView} />"), "die Heute-Karte erhält dieselbe personalCycleView-Instanz wie der Ring");
  const ringIndex = componentSource.indexOf("<CyclePersonalRing");
  const cardIndex = componentSource.indexOf("<TodayCard personalCycleView={personalCycleView} />");
  assert(cardIndex !== -1 && ringIndex !== -1 && cardIndex < ringIndex, "die Heute-Karte steht im Quelltext vor dem Zyklus-Kreis");
}

function checkRemainsNoData(view: PersonalCycleView): boolean {
  return deriveTodayCardText(view).headline === "Noch keine ausreichenden Daten für eine persönliche Einordnung.";
}

console.log("\n== WP-006: no_data liefert in jedem Fall denselben neutralen Satz, nie Daten ==");
{
  assert(checkRemainsNoData(computePersonalCycleView([], null, "2026-09-01")), "leere Perioden -> neutraler Satz");
  assert(
    checkRemainsNoData(computePersonalCycleView([period("1", "2026-09-09", null, null)], null, "2026-09-09")),
    "laufende Periode ohne Median/Profil -> weiterhin neutraler Satz, kein erfundener Tag",
  );
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
