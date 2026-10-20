import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pageSource = readFileSync(path.join(root, "src/app/neu/page.tsx"), "utf8");
const homeSource = readFileSync(path.join(root, "src/components/NewCycleExample.tsx"), "utf8");
const partnerRingSource = readFileSync(path.join(root, "src/components/NewPartnerCycleRing.tsx"), "utf8");
const partnerCalendarSource = readFileSync(path.join(root, "src/components/NewPartnerCalendar.tsx"), "utf8");

console.log("\n== WP-023: Owner-exklusiver warmer Rahmen ==");
assert(pageSource.includes("linear-gradient(180deg,#fffaf6_0%,#fff4f2_48%,#fff9f7_100%)"), "nur die fertige Owner-Home trägt den warmen Rosé-/Creme-Hintergrund");
assert(pageSource.includes('max-w-5xl'), "die fertige Owner-Home bietet genug Breite für die gemeinsame Übersicht");
assert(!partnerRingSource.includes("data-owner-home-overview") && !partnerCalendarSource.includes("data-owner-home-overview"), "die Partnerkomponenten verwenden die Owner-Gruppe nicht");

console.log("\n== WP-023: gemeinsame obere Übersicht und fachliche Reihenfolge ==");
const overviewIndex = homeSource.indexOf("data-owner-home-overview");
const todayIndex = homeSource.indexOf("<TodayCard ", overviewIndex);
const cycleIndex = homeSource.indexOf('aria-label={hasPersonalCircle', overviewIndex);
const calendarIndex = homeSource.indexOf('aria-label="Kalender zur Orientierung"', overviewIndex);
assert(overviewIndex !== -1, "die gemeinsame obere Übersichtsgruppe ist vorhanden");
assert(todayIndex > overviewIndex && cycleIndex > todayIndex && calendarIndex > cycleIndex, "Heute-Information, Zyklusübersicht und Kalender bleiben fachlich in ihrer bisherigen Reihenfolge");
assert(homeSource.includes('className="col-start-2 row-start-1 min-w-0"'), "die bestehende Heute-Information steht sichtbar rechts");
assert(homeSource.includes('className="col-start-1 row-start-1 min-w-0 space-y-2 sm:space-y-3"'), "der bestehende Zyklus-Kreis steht sichtbar links");
assert(homeSource.includes("grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"), "die Gruppe bleibt auch schmal ohne starre Pixelbreite responsiv");

console.log("\n== WP-023: bestehende Inhalte und Bedienung bleiben erhalten ==");
assert(homeSource.includes("Nächste Periode voraussichtlich in"), "die Resttage-Information bleibt vorhanden");
assert(homeSource.includes("Kann abweichen"), "der Unsicherheitshinweis bleibt vorhanden");
assert(homeSource.includes("onClick={() => changeMonth(-1)}") && homeSource.includes("onClick={() => changeMonth(1)}"), "beide Monatswechsel-Handler bleiben vorhanden");
assert(homeSource.includes("setIsCalendarLegendOpen((current) => !current)"), "das Kalender-Info-Popover bleibt bedienbar");
assert(homeSource.includes("setSelectedDayDetail({"), "das Tagesfenster bleibt erreichbar");
assert(homeSource.includes("setIsPeriodHistoryOpen(true)"), "der Einstieg in die Periodenübersicht bleibt erreichbar");
assert(homeSource.includes("sm:hidden") && homeSource.includes("hidden sm:block"), "die vorhandene responsive Ringdarstellung bleibt erhalten");

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
