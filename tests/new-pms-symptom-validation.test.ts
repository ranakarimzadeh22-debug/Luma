import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { validatePmsSymptomDayInput, isValidPmsSymptom, PMS_SYMPTOMS } from "../src/lib/new-pms-symptom-validation.ts";

test("akzeptiert eine gültige Mehrfachauswahl an einem vergangenen Tag", () => {
  const result = validatePmsSymptomDayInput(
    { date: "2026-10-10", symptoms: ["breast_tenderness", "fatigue"] },
    "2026-10-15",
  );
  assert.deepEqual(result, { ok: true, value: { date: "2026-10-10", symptoms: ["breast_tenderness", "fatigue"] } });
});

test("akzeptiert eine leere Auswahl (vollständiges Entfernen)", () => {
  const result = validatePmsSymptomDayInput({ date: "2026-10-10", symptoms: [] }, "2026-10-15");
  assert.deepEqual(result, { ok: true, value: { date: "2026-10-10", symptoms: [] } });
});

test("akzeptiert einen heutigen Tag", () => {
  assert.equal(validatePmsSymptomDayInput({ date: "2026-10-15", symptoms: [] }, "2026-10-15").ok, true);
});

test("weist einen zukünftigen Tag ab", () => {
  const result = validatePmsSymptomDayInput({ date: "2026-10-16", symptoms: [] }, "2026-10-15");
  assert.equal(result.ok, false);
});

test("weist einen ungültigen Symptomwert ab", () => {
  const result = validatePmsSymptomDayInput({ date: "2026-10-10", symptoms: ["headache"] }, "2026-10-15");
  assert.equal(result.ok, false);
});

test("weist Freitext/falschen Typ ab", () => {
  assert.equal(validatePmsSymptomDayInput({ date: "2026-10-10", symptoms: "fatigue" }, "2026-10-15").ok, false);
  assert.equal(validatePmsSymptomDayInput({ date: "2026-10-10", symptoms: [123] }, "2026-10-15").ok, false);
});

test("entfernt doppelte Werte in derselben Auswahl", () => {
  const result = validatePmsSymptomDayInput(
    { date: "2026-10-10", symptoms: ["fatigue", "fatigue", "mood_swings"] },
    "2026-10-15",
  );
  assert.deepEqual(result, { ok: true, value: { date: "2026-10-10", symptoms: ["fatigue", "mood_swings"] } });
});

test("isValidPmsSymptom erkennt genau die vier bestätigten Werte", () => {
  for (const symptom of PMS_SYMPTOMS) assert.equal(isValidPmsSymptom(symptom), true);
  assert.equal(isValidPmsSymptom("cramps"), false);
  assert.equal(isValidPmsSymptom(42), false);
});
