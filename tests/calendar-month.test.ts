import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { getCalendarMonthGrid, shiftCalendarMonth } from "../src/lib/calendar-month.ts";

test("berechnet Februar im Schaltjahr korrekt", () => {
  const february = getCalendarMonthGrid(2028, 1);
  assert.equal(february.daysInMonth, 29);
  assert.equal(february.leadingDays, 1);
  assert.equal(february.cells[1], 1);
  assert.equal(february.cells.at(-1), 29);
});

test("berechnet einen normalen Februar korrekt", () => {
  assert.equal(getCalendarMonthGrid(2027, 1).daysInMonth, 28);
});

test("wechselt über beide Jahresgrenzen", () => {
  assert.deepEqual(shiftCalendarMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepEqual(shiftCalendarMonth(2026, 0, -1), { year: 2025, month: 11 });
});

test("unterstützt mehrfaches Vor- und Zurückschalten", () => {
  assert.deepEqual(shiftCalendarMonth(2026, 8, 5), { year: 2027, month: 1 });
  assert.deepEqual(shiftCalendarMonth(2026, 8, -10), { year: 2025, month: 10 });
});
