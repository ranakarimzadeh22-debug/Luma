import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { getCalendarDayInfo } from "../src/lib/calendar-day-info.ts";

test("ein Zukunftstag zeigt nur eine Schätzung und bleibt für Perioden gesperrt", () => {
  assert.deepEqual(
    getCalendarDayInfo({
      date: "2026-09-12",
      today: "2026-09-05",
      hasStoredPeriod: false,
      phase: "pms",
    }),
    { canSelectPeriod: false, status: "estimate", phase: "pms" },
  );
});

test("ein gespeicherter vergangener Periodentag ist bestätigt und auswählbar", () => {
  assert.deepEqual(
    getCalendarDayInfo({
      date: "2026-09-02",
      today: "2026-09-05",
      hasStoredPeriod: true,
      phase: null,
    }),
    { canSelectPeriod: true, status: "confirmed", phase: "period" },
  );
});

test("ein neutraler Tag erhält keine erfundene Phase", () => {
  assert.deepEqual(
    getCalendarDayInfo({
      date: "2026-09-08",
      today: "2026-09-05",
      hasStoredPeriod: false,
      phase: null,
    }),
    { canSelectPeriod: false, status: "neutral", phase: null },
  );
});
