import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { validateNewCycleProfileInput } from "../src/lib/new-cycle-profile-validation.ts";

test("akzeptiert vier konkrete Basisangaben", () => {
  assert.deepEqual(validateNewCycleProfileInput({
    lastPeriodStart: "2026-08-20",
    bleedingDurationDays: 5,
    cycleLengthDays: 28,
    regularity: "regular",
  }), {
    ok: true,
    value: {
      lastPeriodStart: "2026-08-20",
      bleedingDurationDays: 5,
      cycleLengthDays: 28,
      regularity: "regular",
    },
  });
});

test("akzeptiert bei jeder unbekannten Angabe den Unbekannt-Zustand", () => {
  assert.equal(validateNewCycleProfileInput({
    lastPeriodStart: null,
    bleedingDurationDays: null,
    cycleLengthDays: null,
    regularity: "unknown",
  }).ok, true);
});

test("weist zukünftige Daten, ungültige Zahlen und fehlende Auswahl zurück", () => {
  assert.equal(validateNewCycleProfileInput({ lastPeriodStart: "2999-01-01", bleedingDurationDays: 5, cycleLengthDays: 28, regularity: "regular" }).ok, false);
  assert.equal(validateNewCycleProfileInput({ lastPeriodStart: null, bleedingDurationDays: 0, cycleLengthDays: 28, regularity: "regular" }).ok, false);
  assert.equal(validateNewCycleProfileInput({ lastPeriodStart: null, bleedingDurationDays: 5, cycleLengthDays: 28, regularity: "sometimes" }).ok, false);
});
