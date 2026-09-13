import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { getPeriodDayActions } from "../src/lib/period-day-actions.ts";

function entry(id: string, startDate: string, endDate: string | null, expectedEndDate: string | null = null) {
  return { id, startDate, endDate, expectedEndDate };
}

test("ein zukünftiger Tag erlaubt keine Aktion", () => {
  const result = getPeriodDayActions("2026-09-20", "2026-09-13", []);
  assert.equal(result.canBegin, false);
  assert.equal(result.runningEntryToEnd, null);
  assert.equal(result.deletableEdge, null);
});

test("ein neutraler vergangener Tag ohne Eintrag erlaubt 'Periode begonnen'", () => {
  const result = getPeriodDayActions("2026-09-10", "2026-09-13", []);
  assert.equal(result.canBegin, true);
  assert.equal(result.runningEntryToEnd, null);
  assert.equal(result.deletableEdge, null);
});

test("ein Tag mitten in einer abgeschlossenen Periode kann nicht erneut begonnen werden und ist kein löschbarer Rand", () => {
  const e = entry("a", "2026-09-01", "2026-09-05");
  const result = getPeriodDayActions("2026-09-03", "2026-09-13", [e]);
  assert.equal(result.canBegin, false);
  assert.equal(result.runningEntryToEnd, null);
  assert.equal(result.deletableEdge, null);
});

test("der erste Tag einer mehrtägigen abgeschlossenen Periode ist ein löschbarer Start-Rand, kein Einzeltag", () => {
  const e = entry("a", "2026-09-01", "2026-09-05");
  const result = getPeriodDayActions("2026-09-01", "2026-09-13", [e]);
  assert.deepEqual(result.deletableEdge, { entry: e, edge: "start", isSingleDay: false });
});

test("der letzte Tag einer mehrtägigen abgeschlossenen Periode ist ein löschbarer End-Rand, kein Einzeltag", () => {
  const e = entry("a", "2026-09-01", "2026-09-05");
  const result = getPeriodDayActions("2026-09-05", "2026-09-13", [e]);
  assert.deepEqual(result.deletableEdge, { entry: e, edge: "end", isSingleDay: false });
});

test("eine abgeschlossene Periode mit genau einem Tag ist als Einzeltag löschbar", () => {
  const e = entry("a", "2026-09-05", "2026-09-05");
  const result = getPeriodDayActions("2026-09-05", "2026-09-13", [e]);
  assert.deepEqual(result.deletableEdge, { entry: e, edge: "start", isSingleDay: true });
});

test("eine laufende Periode: der Starttag bis heute ist bestätigt und erlaubt 'Periode beendet'", () => {
  const e = entry("a", "2026-09-10", null, null);
  const result = getPeriodDayActions("2026-09-12", "2026-09-13", [e]);
  assert.deepEqual(result.runningEntryToEnd, e);
  assert.equal(result.canBegin, false);
});

test("eine laufende Periode, die heute begonnen hat, ist am Starttag ein löschbarer Einzeltag", () => {
  const e = entry("a", "2026-09-13", null, null);
  const result = getPeriodDayActions("2026-09-13", "2026-09-13", [e]);
  assert.deepEqual(result.deletableEdge, { entry: e, edge: "start", isSingleDay: true });
});

test("eine laufende Periode, die vor mehreren Tagen begonnen hat, ist am Starttag KEIN Einzeltag mehr", () => {
  const e = entry("a", "2026-09-10", null, null);
  const result = getPeriodDayActions("2026-09-10", "2026-09-13", [e]);
  assert.deepEqual(result.deletableEdge, { entry: e, edge: "start", isSingleDay: false });
});

test("ein erwarteter (noch nicht bestätigter) Tag einer laufenden Periode ist weder löschbar noch beginnbar noch beendbar", () => {
  const e = entry("a", "2026-09-10", null, "2026-09-16");
  // 2026-09-14 liegt nach today (2026-09-13) und ist nur eine Schätzung, kein bestätigter Tag.
  const result = getPeriodDayActions("2026-09-14", "2026-09-13", [e]);
  assert.equal(result.canBegin, false);
  assert.equal(result.runningEntryToEnd, null);
  assert.equal(result.deletableEdge, null);
});

test("zwei unabhängige Einträge beeinflussen sich nicht gegenseitig", () => {
  const first = entry("a", "2026-08-01", "2026-08-05");
  const second = entry("b", "2026-09-01", "2026-09-05");
  const result = getPeriodDayActions("2026-09-01", "2026-09-13", [first, second]);
  assert.deepEqual(result.deletableEdge, { entry: second, edge: "start", isSingleDay: false });
});
