import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCalendarDayInfo, periodDayNumber } from "../src/lib/calendar-day-info";

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

console.log("\n== WP-003 V4: periodDayNumber – inklusive Zählung ab dem Starttag ==");
{
  assertEqual(periodDayNumber("2026-09-07", "2026-09-07"), 1, "der Starttag selbst ist Periodentag 1");
  assertEqual(periodDayNumber("2026-09-09", "2026-09-07"), 3, "der dritte Kalendertag nach dem Start ist Periodentag 3");
  assertEqual(periodDayNumber("2026-09-05", "2026-09-01"), 5, "fünf Tage nach dem Start ist Periodentag 5");
}

console.log("\n== WP-003 V4: periodDayNumber – Monats- und Jahresgrenze ==");
{
  assertEqual(periodDayNumber("2026-10-01", "2026-09-29"), 3, "Monatsgrenze September -> Oktober wird korrekt zwei Tage später als Tag 3 gezählt");
  assertEqual(periodDayNumber("2027-01-01", "2026-12-30"), 3, "Jahresgrenze Dezember -> Januar wird korrekt als Tag 3 gezählt");
}

console.log("\n== WP-003 V4: confirmed und running öffnen das Tagesfenster (dayInfo.status) ==");
{
  const confirmed = getCalendarDayInfo({
    date: "2026-09-03",
    today: "2026-09-07",
    hasStoredPeriod: true,
    hasRunningPeriod: false,
    hasExpectedEnd: false,
    hasPlannedPeriod: false,
    phase: null,
  });
  assertEqual(confirmed.status, "confirmed", "ein abgeschlossener Periodentag hat status 'confirmed'");

  const running = getCalendarDayInfo({
    date: "2026-09-07",
    today: "2026-09-07",
    hasStoredPeriod: false,
    hasRunningPeriod: true,
    hasExpectedEnd: false,
    hasPlannedPeriod: false,
    phase: null,
  });
  assertEqual(running.status, "running", "ein laufender Periodentag bis heute hat status 'running'");
}

console.log("\n== WP-003 V4: expected/planned/estimate/neutral erhalten keinen erfundenen Periodentag ==");
{
  const expected = getCalendarDayInfo({
    date: "2026-09-10",
    today: "2026-09-07",
    hasStoredPeriod: false,
    hasRunningPeriod: false,
    hasExpectedEnd: true,
    hasPlannedPeriod: false,
    phase: null,
  });
  assertEqual(expected.status, "expected", "ein voraussichtlicher Tag hat status 'expected', nicht 'confirmed'/'running'");

  const planned = getCalendarDayInfo({
    date: "2026-09-10",
    today: "2026-09-07",
    hasStoredPeriod: false,
    hasRunningPeriod: false,
    hasExpectedEnd: false,
    hasPlannedPeriod: true,
    phase: null,
  });
  assertEqual(planned.status, "planned", "ein geplanter Tag hat status 'planned', nicht 'confirmed'/'running'");

  const estimate = getCalendarDayInfo({
    date: "2026-09-10",
    today: "2026-09-07",
    hasStoredPeriod: false,
    hasRunningPeriod: false,
    hasExpectedEnd: false,
    hasPlannedPeriod: false,
    phase: "period",
  });
  assertEqual(estimate.status, "estimate", "ein geschätzter Zukunftstag hat status 'estimate', nicht 'confirmed'/'running'");

  const neutral = getCalendarDayInfo({
    date: "2026-09-10",
    today: "2026-09-07",
    hasStoredPeriod: false,
    hasRunningPeriod: false,
    hasExpectedEnd: false,
    hasPlannedPeriod: false,
    phase: null,
  });
  assertEqual(neutral.status, "neutral", "ein neutraler Tag hat status 'neutral', nicht 'confirmed'/'running'");
}

console.log("\n== WP-003 V4: NewCycleExample.tsx öffnet das Tagesfenster nur für confirmed/running ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  const hasConfirmedPeriodEntryLine = source.includes(
    "const confirmedPeriodEntry = storedPeriod ?? runningPeriod ?? null;",
  );
  assertEqual(hasConfirmedPeriodEntryLine, true, "der klickbare Tag wird ausschließlich aus storedPeriod/runningPeriod abgeleitet (kein expected/planned/estimate)");

  const hasDialogRole = source.includes('role="dialog"') && source.includes('aria-modal="true"');
  assertEqual(hasDialogRole, true, "DayDetailModal trägt role=\"dialog\" und aria-modal=\"true\"");

  const hasInert = source.includes("inert={selectedDayDetail ? true : undefined}");
  assertEqual(hasInert, true, "der Home-Screen-Hintergrund wird bei offenem Tagesfenster über inert deaktiviert");

  const hasEscapeHandling = source.includes('event.key === "Escape"');
  assertEqual(hasEscapeHandling, true, "DayDetailModal schließt mit Escape");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
