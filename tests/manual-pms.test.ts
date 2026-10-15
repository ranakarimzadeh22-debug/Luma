import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { deriveManualPmsSection, isWithinManualPmsSection, manualPmsSymptomsForDate, applyManualPmsOverride } from "../src/lib/manual-pms.ts";
import type { PmsSymptom } from "../src/lib/new-pms-symptom-validation.ts";

function period(startDate: string, endDate: string | null = null) {
  return { id: "x", startDate, endDate, expectedEndDate: null };
}

function symptomDay(date: string, symptoms: PmsSymptom[]) {
  return { date, symptoms };
}

test("keine echten Perioden ergeben keinen manuellen PMS-Abschnitt", () => {
  const section = deriveManualPmsSection([], [symptomDay("2026-10-10", ["fatigue"])]);
  assert.equal(section, null);
});

test("keine Symptommarkierungen ergeben keinen manuellen PMS-Abschnitt", () => {
  const section = deriveManualPmsSection([period("2026-09-01", "2026-09-05")], []);
  assert.equal(section, null);
});

test("die erste Markierung nach dem letzten echten Periodenbeginn eröffnet den Abschnitt", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [
    symptomDay("2026-09-10", ["fatigue"]),
    symptomDay("2026-09-12", ["mood_swings"]),
  ];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(section?.startDate, "2026-09-10");
  assert.equal(section?.endDate, null);
});

test("eine Markierung vor dem letzten echten Periodenbeginn zählt nicht", () => {
  const periods = [period("2026-08-01", "2026-08-05"), period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-08-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(section, null);
});

test("eine leere Symptomauswahl an einem Tag zählt nicht als Markierung", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-10", [])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(section, null);
});

test("eine Markierung vor dem nächsten echten Periodenbeginn eröffnet den Abschnitt, auch wenn dieser bereits gespeichert ist", () => {
  // Owner trägt rückwirkend den vorherigen Zyklus nach: eine Markierung am
  // 2026-09-20 liegt zwischen dem Start der vorherigen (2026-09-01) und der
  // nächsten, bereits gespeicherten Periode (2026-10-01). Der "letzte
  // tatsächliche Periodenbeginn" ist dann 2026-10-01 selbst, also zählt diese
  // frühere Markierung laut Regel nicht mehr zum offenen Abschnitt.
  const periods = [period("2026-09-01", "2026-09-05"), period("2026-10-01", "2026-10-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(section, null);
});

test("der tatsächliche Start der nächsten (noch zukünftigen) Periode beendet den offenen manuellen PMS-Status", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(section?.startDate, "2026-09-20");
  assert.equal(section?.endDate, null);
  assert.equal(isWithinManualPmsSection(section, "2026-12-31"), true);
});

test("ein offener Abschnitt endet am Vortag, sobald die nächste Periode tatsächlich beginnt und gespeichert wird", () => {
  // Zuerst nur die bisherige Periode und eine Markierung danach: der
  // Abschnitt ist offen (kein Enddatum).
  const periodsBefore = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-20", ["fatigue"])];
  const openSection = deriveManualPmsSection(periodsBefore, symptomDays);
  assert.equal(openSection?.startDate, "2026-09-20");
  assert.equal(openSection?.endDate, null);

  // Die nächste Periode beginnt tatsächlich (wird real gespeichert, startet
  // nach der Markierung) und wird dadurch selbst zum "letzten" Periodenstart.
  // Der Abschnitt bezieht sich jetzt auf diesen neuen, letzten Start statt
  // der alten Markierung, und existiert ohne eine Markierung in diesem neuen
  // Abschnitt nicht mehr.
  const periodsAfter = [period("2026-09-01", "2026-09-05"), period("2026-09-25", "2026-09-29")];
  const sectionAfterNextPeriod = deriveManualPmsSection(periodsAfter, symptomDays);
  assert.equal(sectionAfterNextPeriod, null);
});

test("eine laufende Periode (ohne echtes Ende) gilt weiterhin als letzter Periodenbeginn", () => {
  const periods = [period("2026-09-01", null)];
  const symptomDays = [symptomDay("2026-09-10", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(section?.startDate, "2026-09-10");
});

test("manualPmsSymptomsForDate liefert die Symptome nur innerhalb des Abschnitts", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-10", ["fatigue", "mood_swings"])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.deepEqual(manualPmsSymptomsForDate(section, "2026-09-10"), ["fatigue", "mood_swings"]);
  assert.deepEqual(manualPmsSymptomsForDate(section, "2026-09-09"), []);
});

test("applyManualPmsOverride gibt 'pms' innerhalb des Abschnitts zurück, sonst die Schätzung unverändert", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const symptomDays = [symptomDay("2026-09-10", ["fatigue"])];
  const section = deriveManualPmsSection(periods, symptomDays);
  assert.equal(applyManualPmsOverride("ovulation", section, "2026-09-10"), "pms");
  assert.equal(applyManualPmsOverride("ovulation", section, "2026-09-09"), "ovulation");
  assert.equal(applyManualPmsOverride(null, section, "2026-09-10"), "pms");
  assert.equal(applyManualPmsOverride(null, section, "2026-09-09"), null);
});

test("werden alle Markierungen im Abschnitt entfernt, verschwindet der Abschnitt vollständig", () => {
  const periods = [period("2026-09-01", "2026-09-05")];
  const beforeRemoval = deriveManualPmsSection(periods, [symptomDay("2026-09-10", ["fatigue"])]);
  assert.notEqual(beforeRemoval, null);
  const afterRemoval = deriveManualPmsSection(periods, [symptomDay("2026-09-10", [])]);
  assert.equal(afterRemoval, null);
});
