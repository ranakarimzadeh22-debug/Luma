import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCalendarDayInfo, periodDayNumber, actualPeriodDurationDays } from "../src/lib/calendar-day-info";

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

console.log("\n== WP-003 V9: actualPeriodDurationDays – inklusive tatsächliche Dauer ==");
{
  assertEqual(actualPeriodDurationDays("2026-09-07", "2026-09-09"), 3, "7.-9. September ergibt 3 Tage");
  assertEqual(actualPeriodDurationDays("2026-09-07", "2026-09-11"), 5, "7.-11. September ergibt 5 Tage");
  assertEqual(actualPeriodDurationDays("2026-09-07", "2026-09-07"), 1, "ein Einzeltag ergibt 1 Tag");
  assertEqual(actualPeriodDurationDays("2026-12-30", "2027-01-02"), 4, "30. Dezember bis 2. Januar ergibt 4 Tage (Jahresgrenze)");
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

console.log("\n== WP-003 V4/V8: NewCycleExample.tsx öffnet das Tagesfenster für jeden nicht-zukünftigen Tag ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  // Seit WP-003 Version 8 ist nicht mehr nur ein confirmed/running-Tag
  // klickbar: jeder nicht-zukünftige Tag öffnet das Tagesfenster, damit
  // dort "Periode begonnen"/"Periode beendet"/"Periodentag löschen" für
  // neutrale, erwartete oder geschätzte Tage angeboten werden kann. Der
  // Periodentag-Zähler selbst bleibt weiterhin ausschließlich aus
  // storedPeriod/runningPeriod abgeleitet (confirmedPeriodEntry), nur die
  // Klickbarkeits-Bedingung wurde erweitert.
  const hasConfirmedPeriodEntryLine = source.includes(
    "const confirmedPeriodEntry = storedPeriod ?? runningPeriod ?? null;",
  );
  assertEqual(hasConfirmedPeriodEntryLine, true, "der Periodentag-Zähler wird weiterhin ausschließlich aus storedPeriod/runningPeriod abgeleitet");

  const hasFutureGate = source.includes("const isDayActionAvailable = Boolean(date && !dayInfo?.isFuture);");
  assertEqual(hasFutureGate, true, "die Klickbarkeit ist auf nicht-zukünftige Tage begrenzt (isDayActionAvailable)");

  const hasDialogRole = source.includes('role="dialog"') && source.includes('aria-modal="true"');
  assertEqual(hasDialogRole, true, "DayDetailModal trägt role=\"dialog\" und aria-modal=\"true\"");

  const inertBlockMatch = source.match(/inert=\{([\s\S]*?)\}\s*\n\s*>/);
  const hasInert = Boolean(inertBlockMatch?.[1].includes("selectedDayDetail"));
  assertEqual(hasInert, true, "der Home-Screen-Hintergrund wird bei offenem Tagesfenster (selectedDayDetail) weiterhin über inert deaktiviert");

  const hasEscapeHandling = source.includes('event.key === "Escape"');
  assertEqual(hasEscapeHandling, true, "DayDetailModal schließt mit Escape");
}

console.log("\n== WP-003 V9: Tagesfenster zeigt die Gesamtdauer nur bei echtem Ende ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  const totalDaysIndex = source.indexOf("totalDays:", source.indexOf("setSelectedDayDetail({"));
  const totalDaysBlock = totalDaysIndex !== -1 ? source.slice(totalDaysIndex, totalDaysIndex + 200) : "";
  const totalDaysOnlyFromRealEnd =
    totalDaysBlock.includes("storedPeriod && storedPeriod.endDate") &&
    totalDaysBlock.includes("actualPeriodDurationDays(storedPeriod.startDate, storedPeriod.endDate)") &&
    !totalDaysBlock.includes("runningPeriod");
  assertEqual(totalDaysOnlyFromRealEnd, true, "totalDays wird ausschließlich aus einem echten endDate (storedPeriod) abgeleitet, nie aus einer laufenden Periode");

  const showsDurationText = source.includes("`${periodDay}. Periodentag von ${totalDays} Tagen`");
  assertEqual(showsDurationText, true, "DayDetailModal zeigt bei bekannter Dauer 'N. Periodentag von M Tagen'");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
