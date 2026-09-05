import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { applyPeriodDayAction, getCalendarDayInfo } from "../src/lib/calendar-day-info.ts";

test("ein Zukunftstag zeigt nur eine Schätzung und bleibt für Perioden gesperrt", () => {
  assert.deepEqual(
    getCalendarDayInfo({
      date: "2026-09-12",
      today: "2026-09-05",
      hasStoredPeriod: false,
      hasPlannedPeriod: false,
      phase: "pms",
    }),
    { isFuture: true, status: "estimate", phase: "pms" },
  );
});

test("ein gespeicherter vergangener Periodentag ist bestätigt und auswählbar", () => {
  assert.deepEqual(
    getCalendarDayInfo({
      date: "2026-09-02",
      today: "2026-09-05",
      hasStoredPeriod: true,
      hasPlannedPeriod: false,
      phase: null,
    }),
    { isFuture: false, status: "confirmed", phase: "period" },
  );
});

test("ein neutraler Tag erhält keine erfundene Phase", () => {
  assert.deepEqual(
    getCalendarDayInfo({
      date: "2026-09-08",
      today: "2026-09-05",
      hasStoredPeriod: false,
      hasPlannedPeriod: false,
      phase: null,
    }),
    { isFuture: true, status: "neutral", phase: null },
  );
});

test("Beginn und Ende bilden einen Zeitraum für den bestehenden Prüfweg", () => {
  const start = applyPeriodDayAction({
    action: "start",
    date: "2026-09-02",
    selectedStart: null,
  });
  assert.deepEqual(start, { ok: true, selectedStart: "2026-09-02", selectedEnd: null });

  const end = applyPeriodDayAction({
    action: "end",
    date: "2026-09-05",
    selectedStart: start.ok ? start.selectedStart : null,
  });
  assert.deepEqual(end, {
    ok: true,
    selectedStart: "2026-09-02",
    selectedEnd: "2026-09-05",
  });
});

test("eine Periodenaktion kann einen Zukunftstag für die getrennte Planung auswählen", () => {
  assert.deepEqual(
    applyPeriodDayAction({
      action: "start",
      date: "2026-09-06",
      selectedStart: null,
    }),
    { ok: true, selectedStart: "2026-09-06", selectedEnd: null },
  );
});

test("Tagesstatus verändert die Datumsinformation nicht", () => {
  const today = "2026-09-05";
  for (const phase of ["period", "pms", "ovulation", null] as const) {
    const info = getCalendarDayInfo({
      date: "2026-09-04",
      today,
      hasStoredPeriod: false,
      hasPlannedPeriod: false,
      phase,
    });
    assert.equal(info.isFuture, false);
  }
});
