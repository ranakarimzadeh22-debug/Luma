import assert from "node:assert/strict";
import { test } from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { deriveHistoricalCalendarPhases } from "../src/lib/historical-calendar-phases.ts";

const today = "2026-10-23";
const period = (startDate: string, endDate: string | null) => ({ startDate, endDate });
const symptom = (date: string) => ({ date, symptoms: ["fatigue" as const] });

test("ein vergangener Symptomtag erzeugt einen PMS-Abschnitt bis zum Tag vor der nächsten realen Periode", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-08-01", "2026-08-05"), period("2026-08-29", "2026-09-02")],
    [symptom("2026-08-24")],
    today,
  );
  assert.deepEqual(result.pmsDates, ["2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28"]);
});

test("mehrere Zyklen werden getrennt abgeleitet und überspringen keine spätere reale Periode", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-07-01", "2026-07-05"), period("2026-07-29", "2026-08-02"), period("2026-08-26", "2026-08-30")],
    [symptom("2026-07-24"), symptom("2026-08-22")],
    today,
  );
  assert.ok(result.pmsDates.includes("2026-07-24") && result.pmsDates.includes("2026-07-28"));
  assert.ok(result.pmsDates.includes("2026-08-22") && result.pmsDates.includes("2026-08-25"));
  for (const realDay of ["2026-07-29", "2026-08-02", "2026-08-26", "2026-08-30", "2026-08-10"]) {
    assert.ok(!result.pmsDates.includes(realDay), `${realDay} ist kein PMS-Tag`);
  }
  assert.ok(!result.pmsDates.includes("2026-08-03") || false, "kein Tag aus einem nicht markierten Abschnitt");
});

test("ein Symptomtag auf einem echten Periodentag zählt nicht und ein Symptomtag vor der ersten Periode wird ignoriert", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-08-01", "2026-08-05"), period("2026-08-29", "2026-09-02")],
    [symptom("2026-08-03"), symptom("2026-07-20")],
    today,
  );
  assert.deepEqual(result.pmsDates, []);
});

test("nach der neuesten Periode wird nichts historisch abgeleitet (aktueller Zyklus bleibt bei manual-pms)", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-08-01", "2026-08-05"), period("2026-08-29", "2026-09-02")],
    [symptom("2026-09-20"), symptom("2026-10-01")],
    today,
  );
  assert.deepEqual(result.pmsDates, []);
});

test("offene (laufende) frühere Periode ordnet keine PMS-Tage zu", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-08-01", null), period("2026-08-29", "2026-09-02")],
    [symptom("2026-08-20")],
    today,
  );
  assert.deepEqual(result.pmsDates, []);
  assert.deepEqual(result.ovulationDates, []);
});

test("Symptome ohne Auswahl zählen nicht", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-08-01", "2026-08-05"), period("2026-08-29", "2026-09-02")],
    [{ date: "2026-08-24", symptoms: [] }],
    today,
  );
  assert.deepEqual(result.pmsDates, []);
});

test("zwei reale Perioden ergeben den bestehenden möglichen Eisprungtag (14 Tage vor der folgenden Periode)", () => {
  const result = deriveHistoricalCalendarPhases([period("2026-08-01", "2026-08-05"), period("2026-08-29", "2026-09-02")], [], today);
  assert.deepEqual(result.ovulationDates, ["2026-08-15"]);
});

test("ohne folgende reale Periode gibt es keinen historischen Eisprung (auch nicht aus einer Prognose)", () => {
  assert.deepEqual(deriveHistoricalCalendarPhases([period("2026-08-01", "2026-08-05")], [], today).ovulationDates, []);
  assert.deepEqual(deriveHistoricalCalendarPhases([], [], today).ovulationDates, []);
});

test("Eisprung, der auf eine echte Periode fiele (sehr kurzer Zyklus), wird nicht erzeugt", () => {
  const result = deriveHistoricalCalendarPhases([period("2026-08-01", "2026-08-08"), period("2026-08-15", "2026-08-18")], [], today);
  assert.deepEqual(result.ovulationDates, []);
});

test("manuelles PMS hat Vorrang vor dem geschätzten Eisprung desselben Tages", () => {
  const result = deriveHistoricalCalendarPhases(
    [period("2026-08-01", "2026-08-05"), period("2026-08-29", "2026-09-02")],
    [symptom("2026-08-12")],
    today,
  );
  assert.ok(result.pmsDates.includes("2026-08-15"));
  assert.deepEqual(result.ovulationDates, []);
});

test("Perioden in beliebiger Reihenfolge liefern dasselbe Ergebnis und die Eingaben werden nicht verändert", () => {
  const periods = [period("2026-08-29", "2026-09-02"), period("2026-08-01", "2026-08-05")];
  const copy = JSON.stringify(periods);
  const symptoms = [symptom("2026-08-24")];
  const a = deriveHistoricalCalendarPhases(periods, symptoms, today);
  const b = deriveHistoricalCalendarPhases([...periods].reverse(), symptoms, today);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(periods), copy);
});
