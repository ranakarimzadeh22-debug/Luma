import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import { buildPersonalRingGeometry } from "../src/lib/cycle-ring-geometry";
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

function period(id: string, startDate: string, endDate: string | null): NewPeriodEntryOpen {
  return { id, startDate, endDate, expectedEndDate: null };
}

const periods: NewPeriodEntryOpen[] = [
  period("a", "2026-06-05", "2026-06-09"),
  period("b", "2026-07-03", "2026-07-07"),
  period("c", "2026-07-31", "2026-08-04"),
  period("d", "2026-08-28", "2026-09-01"),
];
const profile = { cycleLengthDays: 28 };

const ringPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "CyclePersonalRing.tsx");
const ringSource = readFileSync(ringPath, "utf8");

console.log("\n== WP-022: jedes Phasensegment bleibt ein einzelner, durchgehender Bogenpfad (kein Tages-Unterteilung) ==");
{
  const today = "2026-09-15";
  const view = computePersonalCycleView(periods, profile, today);
  const geometry = buildPersonalRingGeometry(view, today)!;
  assertEqual(geometry.segments.length, 3, "es gibt weiterhin genau drei Segmente (Periode, Fruchtbarkeit, PMS)");
  for (const segment of geometry.segments) {
    const moveCommandCount = (segment.path.match(/M/g) ?? []).length;
    const arcCommandCount = (segment.path.match(/A/g) ?? []).length;
    assertEqual(moveCommandCount, 1, `Segment '${segment.key}' hat genau einen Start (M-Befehl) — ein zusammenhängender Pfad`);
    assertEqual(arcCommandCount, 1, `Segment '${segment.key}' hat genau einen Bogen (A-Befehl) — keine Unterteilung in Einzeltage`);
  }
  assert(
    !ringSource.includes("segment.days") && !ringSource.includes("dayCells") && !ringSource.includes("Array.from({ length:"),
    "die Komponente erzeugt keine Einzeltag-Unterteilung innerhalb eines Segments",
  );
}

console.log("\n== WP-022: der Heute-Marker zeigt die Kalendertagszahl aus 'today' ohne führende Null ==");
{
  assert(ringSource.includes("const dayOfMonth = Number(today.slice(8, 10));"), "die Tageszahl wird direkt aus dem übergebenen ISO-today abgeleitet (kein neues Datum/keine neue Berechnung)");
  assert(ringSource.includes("{dayOfMonth}"), "die abgeleitete Tageszahl wird im Marker als Text angezeigt");

  const dayOfMonth = (iso: string) => Number(iso.slice(8, 10));
  assertEqual(dayOfMonth("2026-09-05"), 5, "ein einstelliger Kalendertag (05.) wird ohne führende Null dargestellt (5)");
  assertEqual(dayOfMonth("2026-09-19"), 19, "ein zweistelliger Kalendertag (19.) wird korrekt dargestellt (19)");
  assertEqual(dayOfMonth("2026-09-28"), 28, "der letzte zweistellige Kalendertag wird korrekt dargestellt (28)");
}

console.log("\n== WP-022: der Marker bleibt auf dem bereits vorhandenen, tagesgenauen todayAngle — keine neue Winkel-Logik ==");
{
  assert(ringSource.includes("ringPointAt(personalRingGeometry.todayAngle)"), "die Marker-Position wird weiterhin direkt aus personalRingGeometry.todayAngle berechnet");
  assert(!ringSource.includes("todayAngle +") && !ringSource.includes("todayAngle -") && !ringSource.includes("todayAngle *"), "todayAngle wird für die Markerposition nicht rechnerisch verschoben");
}

console.log("\n== WP-022: die Zahl ist nicht die alleinige Screenreader-Information (aria-hidden + title bleibt bestehen) ==");
{
  assert(ringSource.includes('aria-hidden="true"'), "die sichtbare Tageszahl ist für Screenreader ausgeblendet (aria-hidden)");
  assert(ringSource.includes("<title>{markerName}</title>"), "der bestehende <title>-Text bleibt die zugängliche Beschreibung des Markers");
  assert(ringSource.includes("Heute, ${dayOfMonth}."), "der zugängliche Titel wurde um den sichtbaren Kalendertag ergänzt, bleibt aber vollständiger Text");
}

console.log("\n== WP-022: der Marker ist für compact (mobil) und breite Darstellung unterschiedlich, aber beidemal zentriert und lesbar ==");
{
  assert(ringSource.includes("const markerRadius = compact ? 11 : 13;"), "der Marker-Radius skaliert weiterhin mit compact (größer in der breiten Ansicht)");
  assert(ringSource.includes("const markerFontSize = compact ? 12 : 13;"), "die Schriftgröße der Tageszahl skaliert mit compact");
  assert(ringSource.includes('textAnchor="middle"') && ringSource.includes('dominantBaseline="central"'), "die Tageszahl ist horizontal und vertikal im Marker zentriert");
}

console.log("\n== WP-022: dieselbe Komponente bleibt unverändert die einzige Ring-Darstellung für Eigen- und Partneransicht ==");
{
  const partnerRingPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCycleRing.tsx");
  const partnerRingSource = readFileSync(partnerRingPath, "utf8");
  assert(partnerRingSource.includes("CyclePersonalRing"), "NewPartnerCycleRing.tsx verwendet weiterhin dieselbe gemeinsame Komponente");
  assert(!partnerRingSource.includes("dayOfMonth") && !partnerRingSource.includes("todayAngle"), "die Partneransicht enthält keine eigene, abweichende Marker- oder Winkel-Logik");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
