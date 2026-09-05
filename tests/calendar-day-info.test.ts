import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { applyPeriodDayAction, canUsePeriodActions, getCalendarDayInfo } from "../src/lib/calendar-day-info.ts";

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

test("Beginn und Ende bilden einen Zeitraum für den bestehenden Prüfweg", () => {
  const start = applyPeriodDayAction({
    action: "start",
    date: "2026-09-02",
    today: "2026-09-05",
    selectedStart: null,
  });
  assert.deepEqual(start, { ok: true, selectedStart: "2026-09-02", selectedEnd: null });

  const end = applyPeriodDayAction({
    action: "end",
    date: "2026-09-05",
    today: "2026-09-05",
    selectedStart: start.ok ? start.selectedStart : null,
  });
  assert.deepEqual(end, {
    ok: true,
    selectedStart: "2026-09-02",
    selectedEnd: "2026-09-05",
  });
});

test("eine Periodenaktion für einen Zukunftstag wird technisch abgewiesen", () => {
  assert.deepEqual(
    applyPeriodDayAction({
      action: "start",
      date: "2026-09-06",
      today: "2026-09-05",
      selectedStart: null,
    }),
    {
      ok: false,
      error: "Zukünftige Tage können nicht als tatsächliche Periode gespeichert werden.",
    },
  );
});

test("Periodenaktionen hängen nur vom Datum und nicht vom Tagesstatus ab", () => {
  const today = "2026-09-05";
  for (const phase of ["period", "pms", "ovulation", null] as const) {
    const info = getCalendarDayInfo({
      date: "2026-09-04",
      today,
      hasStoredPeriod: false,
      phase,
    });
    assert.equal(canUsePeriodActions("2026-09-04", today), true);
    assert.equal(info.canSelectPeriod, true);
  }

  assert.equal(canUsePeriodActions(today, today), true);
  assert.equal(canUsePeriodActions("2026-09-06", today), false);
});
