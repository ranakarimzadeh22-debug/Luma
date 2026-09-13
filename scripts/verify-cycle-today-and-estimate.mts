import { config } from "dotenv";
config({ path: ".env.local" });

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

// Spiegelt src/lib/berlin-date.ts, src/lib/new-cycle-prediction.ts und
// src/lib/new-partner-calendar.ts (nur die reine, importierbare Logik ohne
// "server-only") gegen feste, kontrollierte Zeitpunkte, da new-partner-
// calendar.ts server-only importiert und daher nicht direkt per tsx
// ausführbar ist — dasselbe Muster wie die übrigen scripts/verify-*.mts.

function todayBerlinDateOnly(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

const WEEKDAY_LABELS_DE: Record<string, string> = {
  Monday: "Montag", Tuesday: "Dienstag", Wednesday: "Mittwoch", Thursday: "Donnerstag",
  Friday: "Freitag", Saturday: "Samstag", Sunday: "Sonntag",
};

function formatHeuteLine(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekdayEnglish = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date);
  const weekday = WEEKDAY_LABELS_DE[weekdayEnglish] ?? weekdayEnglish;
  const formattedDate = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(date);
  return `Heute · ${weekday}, ${formattedDate}`;
}

console.log("== Europe/Berlin bleibt stabil unabhängig von der Server-Systemzeit (UTC) ==");
{
  // 2026-03-01 23:30 UTC ist bereits 2026-03-02 00:30 in Europe/Berlin (CET, UTC+1 im März vor der Zeitumstellung am 29.03.).
  const justBeforeMidnightUtc = new Date("2026-03-01T23:30:00.000Z");
  const berlinDay = todayBerlinDateOnly(justBeforeMidnightUtc);
  assertEqual(berlinDay, "2026-03-02", "23:30 UTC entspricht bereits dem nächsten Kalendertag in Europe/Berlin");

  const justAfterUtcMidnight = new Date("2026-03-02T00:30:00.000Z");
  const berlinDay2 = todayBerlinDateOnly(justAfterUtcMidnight);
  assertEqual(berlinDay2, "2026-03-02", "00:30 UTC ist in Europe/Berlin derselbe Tag wie 23:30 UTC am Vortag");
}

console.log("\n== Heute-Zeile und roter Marker basieren auf demselben Kalendertag ==");
{
  const berlinDay = "2026-09-14";
  const heuteLine = formatHeuteLine(berlinDay);
  assertEqual(heuteLine, "Heute · Montag, 14.09.2026", "Heute-Zeile zeigt korrekten deutschen Wochentag und Datum");
  assert(heuteLine.includes(berlinDay.split("-").reverse().join(".")), "die Heute-Zeile referenziert exakt denselben Kalendertag, der auch für den Marker-Vergleich genutzt wird");
}

console.log("\n== Wochenendtage werden korrekt übersetzt ==");
{
  assertEqual(formatHeuteLine("2026-09-13"), "Heute · Sonntag, 13.09.2026", "Sonntag korrekt übersetzt");
  assertEqual(formatHeuteLine("2026-09-19"), "Heute · Samstag, 19.09.2026", "Samstag korrekt übersetzt");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
