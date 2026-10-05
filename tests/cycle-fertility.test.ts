import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { calculateOvulationDate, calculateFertileWindow, isUncertainPrediction } from "../src/lib/cycle-fertility.ts";

test("calculateOvulationDate liegt genau 14 Tage vor dem Periodenbeginn", () => {
  assert.equal(calculateOvulationDate("2026-09-15"), "2026-09-01");
});

test("calculateOvulationDate ist zeitzonenfest über eine Monats- und Jahresgrenze", () => {
  assert.equal(calculateOvulationDate("2026-10-05"), "2026-09-21");
  assert.equal(calculateOvulationDate("2027-01-05"), "2026-12-22");
});

test("calculateFertileWindow beginnt fünf Tage vor dem Eisprungtag und endet einschließlich an diesem Tag", () => {
  const window = calculateFertileWindow("2026-09-01");
  assert.equal(window.start, "2026-08-27");
  assert.equal(window.end, "2026-09-01");
});

test("calculateFertileWindow umfasst genau sechs Kalendertage (inklusive Start und Ende)", () => {
  const window = calculateFertileWindow("2026-09-01");
  const days: string[] = [];
  let cursor = window.start;
  while (cursor <= window.end) {
    days.push(cursor);
    const [y, m, d] = cursor.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d));
    next.setUTCDate(next.getUTCDate() + 1);
    cursor = next.toISOString().slice(0, 10);
  }
  assert.equal(days.length, 6);
  assert.deepEqual(days, ["2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01"]);
});

test("isUncertainPrediction: stabile echte Zyklusabstände gelten nicht als unsicher", () => {
  assert.equal(isUncertainPrediction([28, 27, 29, 28]), false);
});

test("isUncertainPrediction: stark schwankende echte Zyklusabstände gelten als unsicher", () => {
  // Spanne 45 - 21 = 24 Tage, deutlich über der 10-Tage-Schwelle.
  assert.equal(isUncertainPrediction([21, 30, 45, 25]), true);
});

test("isUncertainPrediction: eine Spanne genau an der Schwelle (10 Tage) gilt noch nicht als unsicher", () => {
  assert.equal(isUncertainPrediction([25, 35]), false);
});

test("isUncertainPrediction: eine Spanne knapp über der Schwelle (11 Tage) gilt als unsicher", () => {
  assert.equal(isUncertainPrediction([25, 36]), true);
});

test("isUncertainPrediction: weniger als zwei Abstände können keine nachweisbare Schwankung zeigen", () => {
  assert.equal(isUncertainPrediction([]), false);
  assert.equal(isUncertainPrediction([28]), false);
});
