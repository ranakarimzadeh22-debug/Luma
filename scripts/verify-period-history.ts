import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computePeriodHistory } from "../src/lib/period-history";
import type { NewPeriodEntryOpen } from "../src/lib/new-period-validation";

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function entry(id: string, startDate: string, endDate: string | null, expectedEndDate: string | null = null): NewPeriodEntryOpen {
  return { id, startDate, endDate, expectedEndDate };
}

console.log("\n== WP-003 V6: Zykluslänge über Monats- und Jahresgrenze ==");
{
  const rows = computePeriodHistory([
    entry("1", "2026-07-30", "2026-08-03"),
    entry("2", "2026-08-27", "2026-08-31"),
  ]);
  const first = rows.find((r) => r.id === "1");
  assertEqual(first?.cycleLengthDays, 28, "30.07. bis 27.08. ergibt 28 Kalendertage (Monatsgrenze)");

  const yearRows = computePeriodHistory([
    entry("3", "2026-12-05", "2026-12-09"),
    entry("4", "2027-01-02", "2027-01-06"),
  ]);
  const yearFirst = yearRows.find((r) => r.id === "3");
  assertEqual(yearFirst?.cycleLengthDays, 28, "05.12. bis 02.01. ergibt 28 Kalendertage (Jahresgrenze)");
}

console.log("\n== WP-003 V6: unterschiedliche Abstände erscheinen getrennt, werden nicht gemittelt ==");
{
  const rows = computePeriodHistory([
    entry("1", "2026-06-01", "2026-06-05"),
    entry("2", "2026-06-24", "2026-06-28"), // +23
    entry("3", "2026-07-18", "2026-07-22"), // +24
    entry("4", "2026-08-12", "2026-08-16"), // +25
  ]);
  assertEqual(rows.find((r) => r.id === "1")?.cycleLengthDays, 23, "erster Abstand 23 Tage bleibt eigenständig");
  assertEqual(rows.find((r) => r.id === "2")?.cycleLengthDays, 24, "zweiter Abstand 24 Tage bleibt eigenständig");
  assertEqual(rows.find((r) => r.id === "3")?.cycleLengthDays, 25, "dritter Abstand 25 Tage bleibt eigenständig");
}

console.log("\n== WP-003 V6: neuester Start hat keine berechnete Zykluslänge (Noch nicht bekannt) ==");
{
  const rows = computePeriodHistory([
    entry("1", "2026-06-01", "2026-06-05"),
    entry("2", "2026-07-01", "2026-07-05"),
  ]);
  assertEqual(rows.find((r) => r.id === "2")?.cycleLengthDays, null, "der zeitlich neueste tatsächliche Start bleibt ohne Zykluslänge");
}

console.log("\n== WP-003 V6: laufender Eintrag ohne echtes Ende zeigt kein erfundenes Ende ==");
{
  const rows = computePeriodHistory([entry("1", "2026-09-07", null, "2026-09-12")]);
  assertEqual(rows[0].endDate, null, "endDate bleibt null für einen laufenden Eintrag, auch mit gesetztem expectedEndDate");
  assertEqual(rows[0].cycleLengthDays, null, "einziger/neuester Eintrag hat keine Zykluslänge");
}

console.log("\n== WP-003 V6: leere Historie liefert eine leere Liste ohne Fehler ==");
{
  const rows = computePeriodHistory([]);
  assertEqual(rows, [], "keine gespeicherten Perioden ergeben eine leere Historie");
}

console.log("\n== WP-003 V6: NewCycleExample.tsx bindet die Historie rein lesend über die Monatsanzeige ein ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  const monthTriggerIsButton =
    source.includes("onClick={() => setIsPeriodHistoryOpen(true)}") &&
    source.includes("Periodenhistorie öffnen");
  assert(monthTriggerIsButton, "die Monatsanzeige ist ein zugänglicher Button, der die Historie öffnet");

  const navigationUntouched =
    source.includes('aria-label="Vorherigen Monat anzeigen"') &&
    source.includes('aria-label="Nächsten Monat anzeigen"') &&
    source.includes("changeMonth(-1)") &&
    source.includes("changeMonth(1)");
  assert(navigationUntouched, "die Monatsnavigation über die Pfeile bleibt unverändert bestehen");

  const modalStart = source.indexOf("function PeriodHistoryModal(");
  const modalEnd = source.indexOf("export default function NewCycleExample");
  const modalBody = modalStart !== -1 && modalEnd !== -1 ? source.slice(modalStart, modalEnd) : "";
  const historyIsReadOnly = modalBody.length > 0 && !modalBody.includes("fetch(");
  assert(historyIsReadOnly, "PeriodHistoryModal löst keinen Netzwerkaufruf aus (rein lesend)");

  const hasDialogRole = source.includes('aria-labelledby="period-history-title"');
  assert(hasDialogRole, "PeriodHistoryModal trägt eine zugängliche Dialog-Kennzeichnung");

  const inertBlockMatch = source.match(/inert=\{([\s\S]*?)\}\s*\n\s*>/);
  const backgroundBlocked = Boolean(inertBlockMatch?.[1].includes("isPeriodHistoryOpen"));
  assert(backgroundBlocked, "der Hintergrund wird bei offener Historie über inert deaktiviert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
