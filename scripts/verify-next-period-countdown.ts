import { daysUntilNextPeriod } from "../src/lib/next-period-countdown";

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

console.log("\n== WP-015: mehrere Tage in der Zukunft ==");
{
  assertEqual(daysUntilNextPeriod("2026-09-01", "2026-09-09"), 8, "8 Tage Differenz werden kalenderfest gezählt");
}

console.log("\n== WP-015: genau ein Tag in der Zukunft ==");
{
  assertEqual(daysUntilNextPeriod("2026-09-01", "2026-09-02"), 1, "ein Tag Differenz liefert 1");
}

console.log("\n== WP-015: heutiges Datum liefert keine Zahl ==");
{
  assertEqual(daysUntilNextPeriod("2026-09-01", "2026-09-01"), null, "dasselbe Datum liefert null, nie 0");
}

console.log("\n== WP-015: vergangenes Datum liefert keine Zahl ==");
{
  assertEqual(daysUntilNextPeriod("2026-09-05", "2026-09-01"), null, "ein vergangenes Datum liefert null, nie eine negative Zahl");
}

console.log("\n== WP-015: kein nextPeriodStart liefert keine Zahl ==");
{
  assertEqual(daysUntilNextPeriod("2026-09-01", null), null, "null als nextPeriodStart liefert null");
}

console.log("\n== WP-015: Monatswechsel bleibt kalenderfest ==");
{
  assertEqual(daysUntilNextPeriod("2026-09-28", "2026-10-03"), 5, "28.09. bis 03.10. sind 5 Tage, über den Monatswechsel hinweg");
}

console.log("\n== WP-015: Jahreswechsel bleibt kalenderfest ==");
{
  assertEqual(daysUntilNextPeriod("2026-12-29", "2027-01-03"), 5, "29.12. bis 03.01. des Folgejahres sind 5 Tage, über den Jahreswechsel hinweg");
}

console.log("\n== WP-015: Schaltjahr-Februar bleibt kalenderfest ==");
{
  // 2028 ist ein Schaltjahr -> 29.02.2028 existiert.
  assertEqual(daysUntilNextPeriod("2028-02-27", "2028-03-02"), 4, "27.02. bis 02.03. im Schaltjahr sind 4 Tage (inkl. 29.02.)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
