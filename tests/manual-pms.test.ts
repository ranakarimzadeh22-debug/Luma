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

test("die erste Markierung nach dem echten Ende der letzten Periode eröffnet den Abschnitt und reicht ohne Vorhersage nur bis heute", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [
    symptomDay("2026-09-10", ["fatigue"]),
    symptomDay("2026-09-12", ["mood_swings"]),
  ];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-09-15");
  assert.equal(section?.startDate, "2026-09-10");
  assert.equal(section?.endDate, "2026-09-15");
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

test("eine real gespeicherte spätere Periode wird selbst zur letzten Periode und eröffnet den Abschnitt erst nach deren eigenem Ende neu", () => {
  // Eine frühere Markierung (20.09.) liegt vor der inzwischen real
  // gespeicherten späteren Periode (20.10.-24.10.) und zählt daher nicht
  // mehr zum aktuellen, auf die letzte Periode bezogenen Abschnitt.
  const periods = [period("2026-09-01", "2026-09-05"), period("2026-10-20", "2026-10-24")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays, "2026-10-30");
  assert.equal(section, null);

  // Eine neue Markierung NACH dem echten Ende der nun letzten Periode
  // eröffnet dagegen korrekt einen neuen Abschnitt.
  const symptomDaysAfter = [symptomDay("2026-10-26", ["fatigue"])];
  const sectionAfter = deriveManualPmsSection(periods, symptomDaysAfter, "2026-10-30");
  assert.equal(sectionAfter?.startDate, "2026-10-26");
  assert.equal(sectionAfter?.endDate, "2026-10-30");
});

test("ohne eine real gespeicherte nächste Periode reicht der Abschnitt ohne Vorhersage nur bis heute, nie in die Zukunft", () => {
  const periodsBefore = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const openSection = deriveManualPmsSection(periodsBefore, symptomDays, "2026-09-25");
  assert.equal(openSection?.startDate, "2026-09-20");
  assert.equal(openSection?.endDate, "2026-09-25");
  assert.equal(isWithinManualPmsSection(openSection, "2026-09-26", periodsBefore, "2026-09-25"), false);

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
  const hypotheticalSection = { startDate: "2026-09-01", endDate: "2026-09-04", daysBySymptom: new Map([["2026-09-03", ["fatigue"] as PmsSymptom[]]]) };
  assert.equal(isWithinManualPmsSection(hypotheticalSection, "2026-09-03", runningPeriod, "2026-09-04"), false);
  assert.equal(applyManualPmsOverride("period", hypotheticalSection, "2026-09-03", runningPeriod, "2026-09-04"), "period");
});

console.log("\n== Korrektur Version 2: manuelles PMS begrenzt darstellen (nie unbegrenzt in die Zukunft) ==");

test("mit einer heutigen Markierung und einer in einer Woche erwarteten Periode endet PMS am Tag vor dem erwarteten Beginn", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-10-08", ["fatigue"])];
  const predictedNextPeriodStart = "2026-10-15";
  const section = deriveManualPmsSection(periods, symptomDays, "2026-10-08", predictedNextPeriodStart);
  assert.equal(section?.startDate, "2026-10-08");
  assert.equal(section?.endDate, "2026-10-14");
  assert.equal(isWithinManualPmsSection(section, "2026-10-14", periods, "2026-10-14"), true);
  assert.equal(isWithinManualPmsSection(section, "2026-10-15", periods, "2026-10-15"), false);
});

test("mit einem bereits überschrittenen erwarteten Beginn ohne tatsächliche neue Periode reicht manuelles PMS höchstens bis heute", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-10-08", ["fatigue"])];
  // Die Vorhersage (10.10.) liegt bereits in der Vergangenheit relativ zu "heute" (20.10.).
  const predictedNextPeriodStart = "2026-10-10";
  const section = deriveManualPmsSection(periods, symptomDays, "2026-10-20", predictedNextPeriodStart);
  assert.equal(section?.startDate, "2026-10-08");
  assert.equal(section?.endDate, "2026-10-20");
  assert.equal(isWithinManualPmsSection(section, "2026-10-20", periods, "2026-10-20"), true);
  assert.equal(isWithinManualPmsSection(section, "2026-10-21", periods, "2026-10-21"), false);
});

test("eine tatsächliche neue Periode beendet manuelles PMS sofort, auch wenn die Vorhersage einen späteren Termin nannte", () => {
  const periodsBefore = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-10-08", ["fatigue"])];
  // Zunächst, ohne die neue Periode, ist der Abschnitt offen und reicht laut
  // Vorhersage (veraltete Annahme: nächste Periode erst am 15.10.) bis zum 14.10.
  const predictedNextPeriodStart = "2026-10-15";
  const sectionBefore = deriveManualPmsSection(periodsBefore, symptomDays, "2026-10-10", predictedNextPeriodStart);
  assert.equal(sectionBefore?.endDate, "2026-10-14");
  assert.equal(isWithinManualPmsSection(sectionBefore, "2026-10-10", periodsBefore, "2026-10-10"), true);

  // Die tatsächliche Periode beginnt dann schon früher, am 12.10. (vor der
  // Vorhersage) und wird real gespeichert. Ab sofort ist der 12.10. ein
  // echter Periodentag und hat Vorrang; der alte, auf die Vorhersage
  // gestützte Abschnitt existiert mangels einer Markierung nach dem echten
  // Periodenende nicht mehr.
  const periodsAfter = [period("2026-09-01", "2026-09-05"), period("2026-10-12", "2026-10-16")];
  const sectionAfter = deriveManualPmsSection(periodsAfter, symptomDays, "2026-10-20", predictedNextPeriodStart);
  assert.equal(sectionAfter, null);
  assert.equal(isWithinManualPmsSection(sectionBefore, "2026-10-12", periodsAfter, "2026-10-20"), false, "der jetzt echte Periodentag wird nie als manuelles PMS gezeigt, selbst mit dem alten Abschnittsobjekt");
});

test("Eigen- und Partneransicht nutzen dieselben Datumsgrenzen (gleiche Eingaben ergeben einen identischen Abschnitt)", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-10-08", ["mood_swings"])];
  const ownView = deriveManualPmsSection(periods, symptomDays, "2026-10-08", "2026-10-15");
  const partnerView = deriveManualPmsSection(periods, symptomDays, "2026-10-08", "2026-10-15");
  assert.deepEqual(ownView, partnerView);
});
