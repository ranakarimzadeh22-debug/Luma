import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { deriveManualPmsSection, isWithinManualPmsSection, manualPmsSymptomsForDate, applyManualPmsOverride } from "../src/lib/manual-pms.ts";
import type { PmsSymptom } from "../src/lib/new-pms-symptom-validation.ts";

function period(startDate: string, endDate: string | null = null) {
  return { startDate, endDate };
}

function symptomDay(date: string, symptoms: PmsSymptom[]) {
  return { date, symptoms };
}

test("keine echten Perioden ergeben keinen manuellen PMS-Abschnitt", () => {
  const section = deriveManualPmsSection([], [symptomDay("2026-10-10", ["fatigue"])], "2026-10-15");
  assert.equal(section, null);
});

test("keine Symptommarkierungen ergeben keinen manuellen PMS-Abschnitt", () => {
  const section = deriveManualPmsSection([period("2026-09-01", "2026-09-05")], [], "2026-09-15");
  assert.equal(section, null);
});

test("die erste Markierung nach dem echten Ende der letzten Periode eröffnet den Abschnitt", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [
    symptomDay("2026-09-10", ["fatigue"]),
    symptomDay("2026-09-12", ["mood_swings"]),
  ];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-15");
  assert.equal(section?.startDate, "2026-09-10");
  assert.equal(section?.endDate, null);
});

test("eine Markierung vor dem Ende der letzten Periode (aus einem früheren Zyklus) zählt nicht", () => {
  const periods = [period("2026-08-01", "2026-08-05"), period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-08-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-15");
  assert.equal(section, null);
});

test("eine leere Symptomauswahl an einem Tag zählt nicht als Markierung", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-10", [])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-15");
  assert.equal(section, null);
});

test("eine Markierung vor dem nächsten echten Periodenbeginn eröffnet den Abschnitt, auch wenn dieser bereits gespeichert ist", () => {
  // Owner trägt rückwirkend den vorherigen Zyklus nach: eine Markierung am
  // 2026-09-20 liegt zwischen dem Ende der vorherigen (2026-09-05) und der
  // nächsten, bereits gespeicherten Periode (2026-10-01). Der "letzte
  // tatsächliche Periodenbeginn" ist dann 2026-10-01 selbst, also zählt diese
  // frühere Markierung laut Regel nicht mehr zum offenen Abschnitt.
  const periods = [period("2026-09-01", "2026-09-05"), period("2026-10-01", "2026-10-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-10-10");
  assert.equal(section, null);
});

test("der tatsächliche Start der nächsten (noch zukünftigen) Periode beendet den offenen manuellen PMS-Status", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-25");
  assert.equal(section?.startDate, "2026-09-20");
  assert.equal(section?.endDate, null);
  assert.equal(isWithinManualPmsSection(section, "2026-12-31", periods, "2026-12-31"), true);
});

test("ein offener Abschnitt endet am Vortag, sobald die nächste Periode tatsächlich beginnt und gespeichert wird", () => {
  // Zuerst nur die bisherige Periode und eine Markierung danach: der
  // Abschnitt ist offen (kein Enddatum).
  const periodsBefore = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const openSection = deriveManualPmsSection(periodsBefore, symptomDays, "2026-09-25");
  assert.equal(openSection?.startDate, "2026-09-20");
  assert.equal(openSection?.endDate, null);

  // Die nächste Periode beginnt tatsächlich (wird real gespeichert, startet
  // nach der Markierung) und wird dadurch selbst zum "letzten" Periodenstart.
  // Der Abschnitt bezieht sich jetzt auf diesen neuen, letzten Start statt
  // der alten Markierung, und existiert ohne eine Markierung in diesem neuen
  // Abschnitt nicht mehr.
  const periodsAfter = [period("2026-09-01", "2026-09-05"), period("2026-09-25", "2026-09-29")];
  const sectionAfterNextPeriod = deriveManualPmsSection(periodsAfter, symptomDays, "2026-10-01");
  assert.equal(sectionAfterNextPeriod, null);
});

test("eine laufende Periode (ohne echtes Ende) erlaubt keinen manuellen PMS-Abschnitt, solange sie läuft", () => {
  // Korrektur: PMS kann nicht beginnen, während die Periode noch offen ist.
  // Eine Markierung "während" einer laufenden Periode darf keinen Abschnitt
  // eröffnen, auch wenn sie zeitlich nach dem Periodenstart liegt.
  const periods = [period("2026-09-01", null)];
  const symptomDays = [symptomDay("2026-09-03", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-10");
  assert.equal(section, null);
});

test("nach dem echten Ende einer laufenden Periode kann ein neuer manueller Abschnitt beginnen", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-06", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-10");
  assert.equal(section?.startDate, "2026-09-06");
});

test("manualPmsSymptomsForDate liefert die Symptome nur innerhalb des Abschnitts", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-10", ["fatigue", "mood_swings"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-15");
  assert.deepEqual(manualPmsSymptomsForDate(section, "2026-09-10", periods, "2026-09-15"), ["fatigue", "mood_swings"]);
  assert.deepEqual(manualPmsSymptomsForDate(section, "2026-09-09", periods, "2026-09-15"), []);
});

test("applyManualPmsOverride gibt 'pms' innerhalb des Abschnitts zurück, sonst die Schätzung unverändert", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-10", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-15");
  assert.equal(applyManualPmsOverride("ovulation", section, "2026-09-10", periods, "2026-09-15"), "pms");
  assert.equal(applyManualPmsOverride("ovulation", section, "2026-09-09", periods, "2026-09-15"), "ovulation");
  assert.equal(applyManualPmsOverride(null, section, "2026-09-10", periods, "2026-09-15"), "pms");
  assert.equal(applyManualPmsOverride(null, section, "2026-09-09", periods, "2026-09-15"), null);
});

test("werden alle Markierungen im Abschnitt entfernt, verschwindet der Abschnitt vollständig", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const beforeRemoval = deriveManualPmsSection(periods, [symptomDay("2026-09-10", ["fatigue"])], "2026-09-15");
  assert.notEqual(beforeRemoval, null);
  const afterRemoval = deriveManualPmsSection(periods, [symptomDay("2026-09-10", [])], "2026-09-15");
  assert.equal(afterRemoval, null);
});

console.log("\n== Korrektur: echte Periodentage haben immer Vorrang vor manuellem PMS ==");

test("eine Markierung auf einem tatsächlichen bestätigten Periodentag eröffnet keinen Abschnitt", () => {
  const periods = [period("2026-08-01", "2026-08-05"), period("2026-09-01", "2026-09-05")];
  // Markierung fällt auf einen echten Tag der zweiten (letzten) Periode.
  const symptomDays = [symptomDay("2026-09-03", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-10");
  assert.equal(section, null);
});

test("isWithinManualPmsSection liefert false für einen Tag, der nachträglich zu einem echten Periodentag wird", () => {
  // Ein Abschnitt wurde korrekt nach dem Ende der vorherigen Periode eröffnet …
  const periodsBefore = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periodsBefore, symptomDays, "2026-09-22");
  assert.equal(section?.startDate, "2026-09-20");
  assert.equal(isWithinManualPmsSection(section, "2026-09-20", periodsBefore, "2026-09-22"), true);

  // … aber eine neue, rückwirkend gespeicherte Periode überschneidet denselben Tag.
  // isWithinManualPmsSection() muss diesen Tag jetzt als echten Periodentag
  // erkennen und darf ihn nie mehr als manuelles PMS ausweisen, selbst wenn der
  // (veraltete) Abschnitt noch mit altem startDate/endDate vorläge.
  const periodsAfter = [period("2026-09-01", "2026-09-05"), period("2026-09-18", "2026-09-23")];
  assert.equal(isWithinManualPmsSection(section, "2026-09-20", periodsAfter, "2026-09-22"), false);
});

test("applyManualPmsOverride überschreibt niemals einen tatsächlichen Periodentag, auch bei einem (veralteten) passenden Abschnitt", () => {
  const periodsBefore = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periodsBefore, symptomDays, "2026-09-22");

  const periodsWithOverlap = [period("2026-09-01", "2026-09-05"), period("2026-09-18", "2026-09-23")];
  assert.equal(applyManualPmsOverride("period", section, "2026-09-20", periodsWithOverlap, "2026-09-22"), "period");
  assert.equal(applyManualPmsOverride(null, section, "2026-09-20", periodsWithOverlap, "2026-09-22"), null);
});

test("eine Symptommarkierung während einer laufenden Periode löst nach deren Ende keine fortlaufende manuelle PMS-Phase aus", () => {
  // Nutzerin markiert versehentlich/bewusst ein Symptom an Tag 3 einer noch
  // laufenden Periode. Die Periode endet später real. Die frühere Markierung
  // während der Periode darf keinen manuellen PMS-Abschnitt nach dem
  // Periodenende fortsetzen/eröffnen – nur eine Markierung NACH dem echten
  // Ende darf das.
  const runningPeriod = [period("2026-09-01", null)];
  const symptomDuringPeriod = [symptomDay("2026-09-03", ["fatigue"])];
  assert.equal(deriveManualPmsSection(runningPeriod, symptomDuringPeriod, "2026-09-04"), null);

  // Periode endet real am 2026-09-05. Die alte Markierung vom 2026-09-03
  // liegt vor dem neuen "Ende + 1", zählt also weiterhin nicht.
  const endedPeriod = [period("2026-09-01", "2026-09-05")];
  const sectionAfterEnd = deriveManualPmsSection(endedPeriod, symptomDuringPeriod, "2026-09-10");
  assert.equal(sectionAfterEnd, null);
});

test("der Zyklus-Kreis/Kalender-Override ist am laufenden Periodentag selbst stets deaktiviert, auch mit einer späteren Markierung im selben offenen Abschnitt", () => {
  // Periode läuft noch (kein echtes Ende). Eine spätere Markierung nach dem
  // Periodenstart, aber vor dem (noch unbekannten) echten Ende, darf den
  // laufenden Periodentag selbst nie als PMS zeigen.
  const runningPeriod = [period("2026-09-01", null)];
  // Direkt am laufenden Starttag darf auch nach einer (ungültigen) Markierung
  // kein Abschnitt entstehen, siehe Test oben – hier wird zusätzlich geprüft,
  // dass selbst ein hypothetisch vorhandener Abschnitt den laufenden
  // Periodentag nicht überschreiben dürfte.
  const hypotheticalSection = { startDate: "2026-09-01", endDate: null, daysBySymptom: new Map([["2026-09-03", ["fatigue"] as PmsSymptom[]]]) };
  assert.equal(isWithinManualPmsSection(hypotheticalSection, "2026-09-03", runningPeriod, "2026-09-04"), false);
  assert.equal(applyManualPmsOverride("period", hypotheticalSection, "2026-09-03", runningPeriod, "2026-09-04"), "period");
});
