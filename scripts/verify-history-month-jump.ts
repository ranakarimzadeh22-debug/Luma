import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// Spiegelt bewusst die reine Funktion yearMonthFromDate aus
// NewCycleExample.tsx wider (Client-Komponente, nicht direkt importierbar
// ohne React-Rendering-Kontext), um die datumssichere String-Zerlegung
// unabhängig zu prüfen.
function yearMonthFromDate(date: string): { year: number; month: number } {
  const [year, month] = date.split("-").map(Number);
  return { year, month: month - 1 };
}

console.log("\n== WP-003 V7: Zielmonat wird datumssicher aus startDate abgeleitet ==");
{
  assertEqual(yearMonthFromDate("2025-01-15"), { year: 2025, month: 0 }, "Januar 2025 (Jahresgrenze aus Sicht eines späteren aktuellen Monats) wird korrekt als Monat 0 aufgelöst");
  assertEqual(yearMonthFromDate("2025-12-31"), { year: 2025, month: 11 }, "Dezember wird korrekt als Monat 11 aufgelöst");
  assertEqual(yearMonthFromDate("2026-07-30"), { year: 2026, month: 6 }, "Juli wird korrekt als Monat 6 aufgelöst");
}

console.log("\n== WP-003 V7: eine über die Monatsgrenze laufende Periode nutzt den Startmonat als Ziel ==");
{
  // Periode 30.07.–03.08.: Ziel ist Juli (der Monat des tatsächlichen Starts), nicht August.
  const runningAcrossMonthBoundary = yearMonthFromDate("2026-07-30");
  assertEqual(runningAcrossMonthBoundary, { year: 2026, month: 6 }, "Start am 30.07. zeigt auf Juli, unabhängig vom Ende am 03.08.");
}

console.log("\n== WP-003 V7: NewCycleExample.tsx verdrahtet die Historie mit der Monatsnavigation ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  const jumpFunctionMatch = source.match(/function jumpToHistoryMonth\(startDate: string\) \{([\s\S]*?)\}/);
  const jumpBody = jumpFunctionMatch?.[1] ?? "";
  assert(jumpBody.includes("setDisplayedMonth(yearMonthFromDate(startDate))"), "jumpToHistoryMonth setzt den angezeigten Monat aus dem tatsächlichen Start");
  assert(jumpBody.includes("setIsPeriodHistoryOpen(false)"), "jumpToHistoryMonth schließt die Historie nach der Auswahl");
  assert(!jumpBody.includes("fetch("), "jumpToHistoryMonth löst keinen Netzwerkaufruf aus (keine Speicherung)");

  const rowIsButton = source.includes("onClick={() => onSelectMonth(row.startDate)}") && source.includes("Kalender für ${formatHistoryMonth(row.startDate)} öffnen");
  assert(rowIsButton, "jede Historienzeile ist ein Button mit zugänglichem Namen 'Kalender für <Monat> öffnen'");

  const navigationUntouched =
    source.includes("function changeMonth(offset: number) {") &&
    source.includes("shiftCalendarMonth(current.year, current.month, offset)");
  assert(navigationUntouched, "die bestehende Pfeil-Monatsnavigation bleibt unverändert bestehen");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
