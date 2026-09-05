import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { validateNewPeriodPlanInput } from "../src/lib/new-period-plan-validation.ts";

test("akzeptiert vollständig und teilweise zukünftige Planungen", () => {
  assert.equal(
    validateNewPeriodPlanInput({ startDate: "2026-09-06", endDate: "2026-09-10" }, "2026-09-05").ok,
    true,
  );
  assert.equal(
    validateNewPeriodPlanInput({ startDate: "2026-09-04", endDate: "2026-09-07" }, "2026-09-05").ok,
    true,
  );
});

test("weist ungültige Reihenfolge und reine Vergangenheit als Planung ab", () => {
  assert.equal(
    validateNewPeriodPlanInput({ startDate: "2026-09-10", endDate: "2026-09-06" }, "2026-09-05").ok,
    false,
  );
  assert.equal(
    validateNewPeriodPlanInput({ startDate: "2026-09-01", endDate: "2026-09-05" }, "2026-09-05").ok,
    false,
  );
});
