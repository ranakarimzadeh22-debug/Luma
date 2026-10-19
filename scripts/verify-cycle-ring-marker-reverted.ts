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

const ringPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "CyclePersonalRing.tsx");
const ringSource = readFileSync(ringPath, "utf8");

console.log("\n== WP-022 Korrektur V2: der Kalendertagstext im Ringmarker wurde vollständig zurückgenommen (Stand vor Commit 40b2e25) ==");
{
  assert(!ringSource.includes("dayOfMonth"), "die Komponente leitet keine Kalendertagszahl mehr aus 'today' ab");
  assert(!ringSource.includes("markerRadius"), "der vergrößerte, variable Marker-Radius wurde entfernt");
  assert(!ringSource.includes("markerFontSize"), "die Marker-Schriftgröße für eine Zahl wurde entfernt");
  assert(!ringSource.includes("aria-hidden=\"true\">\n                    {dayOfMonth}"), "keine sichtbare Tageszahl mehr im Marker");
  assert(ringSource.includes('<circle cx={svgCoord(marker.x)} cy={svgCoord(marker.y)} r="6" fill="#e11d3f" stroke="white" strokeWidth="2">'), "der Heute-Marker ist wieder der ursprüngliche kleine Kreis mit festem Radius 6 (Stand vor WP-022)");
  assert(ringSource.includes('`Heute, Zyklustag ${personalCycleView.todayCycleDay}`') && !ringSource.includes("Heute, ${dayOfMonth}"), "der zugängliche Titel ist wieder der ursprüngliche Text ohne Kalendertagszahl");
}

console.log("\n== WP-022 Korrektur V2: die Ring-Geometrie (todayAngle, Segmentgrenzen) bleibt tagesgenau und unverändert ==");
{
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
  const today = "2026-09-19";
  const view = computePersonalCycleView(periods, profile, today);
  const geometry = buildPersonalRingGeometry(view, today)!;
  assert(Number.isFinite(geometry.todayAngle), "todayAngle wird weiterhin tagesgenau berechnet");
  assertEqual(geometry.segments.length, 3, "weiterhin genau drei Segmente (Periode, Fruchtbarkeit, PMS)");
}

console.log("\n== WP-022 Korrektur V2: der Ringmarker wird weiterhin identisch in Eigen- und Partneransicht über dieselbe Komponente gerendert ==");
{
  const partnerRingPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCycleRing.tsx");
  const partnerRingSource = readFileSync(partnerRingPath, "utf8");
  assert(partnerRingSource.includes("CyclePersonalRing"), "NewPartnerCycleRing.tsx verwendet weiterhin dieselbe gemeinsame Ring-Komponente");
  assert(!partnerRingSource.includes("dayOfMonth"), "die Partneransicht hat keine eigene Kalendertag-Logik für den Ring");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
