import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { isValidPeriodId, periodsOverlap, validateNewPeriodInput } from "../src/lib/new-period-validation.ts";

test("akzeptiert einen gültigen vergangenen Zeitraum", () => {
  assert.deepEqual(
    validateNewPeriodInput({ startDate: "2026-08-03", endDate: "2026-08-07" }, "2026-09-03"),
    { ok: true, value: { startDate: "2026-08-03", endDate: "2026-08-07" } },
  );
});

test("weist ungültige und umgekehrte Daten ab", () => {
  assert.equal(validateNewPeriodInput({ startDate: "2026-02-30", endDate: "2026-03-02" }, "2026-09-03").ok, false);
  assert.equal(validateNewPeriodInput({ startDate: "2026-08-08", endDate: "2026-08-03" }, "2026-09-03").ok, false);
});

test("weist zukünftige Zeiträume ab", () => {
  assert.equal(validateNewPeriodInput({ startDate: "2026-09-03", endDate: "2026-09-04" }, "2026-09-03").ok, false);
});

test("erkennt jede echte Überschneidung, aber nicht benachbarte Zeiträume", () => {
  const stored = { startDate: "2026-08-03", endDate: "2026-08-07" };
  assert.equal(periodsOverlap(stored, { startDate: "2026-08-07", endDate: "2026-08-10" }), true);
  assert.equal(periodsOverlap(stored, { startDate: "2026-08-08", endDate: "2026-08-10" }), false);
});

test("akzeptiert ausschließlich gültige UUIDs für gespeicherte Einträge", () => {
  assert.equal(isValidPeriodId("123e4567-e89b-42d3-a456-426614174000"), true);
  assert.equal(isValidPeriodId("kein-gueltiger-eintrag"), false);
});
