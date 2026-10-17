import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const ringPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "CyclePersonalRing.tsx");
const ringSource = readFileSync(ringPath, "utf8");

const componentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewCycleExample.tsx");
const componentSource = readFileSync(componentPath, "utf8");

const partnerRingPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCycleRing.tsx");
const partnerRingSource = readFileSync(partnerRingPath, "utf8");

console.log("\n== WP-016: CyclePersonalRing bekommt eine rein optionale, standardmäßig aus geschaltete compact-Prop ==");
{
  assert(ringSource.includes("compact?: boolean;"), "compact ist eine optionale Prop");
  assert(ringSource.includes("compact = false"), "compact ist standardmäßig false (unverändertes Verhalten ohne die Prop)");
  assert(
    ringSource.includes('const ringStrokeWidth = compact ? "30" : "38";'),
    "die Ringbandbreite bleibt bei compact=false exakt 38 (unverändert), wird nur bei compact=true schmaler",
  );
  assert(
    ringSource.includes('const labelFontSize = compact ? "12" : "14";'),
    "die Label-Schriftgröße bleibt bei compact=false exakt 14 (unverändert), wird nur bei compact=true kleiner",
  );
  assert(
    ringSource.includes('compact ? "max-w-[17rem]" : "max-w-[22rem]"'),
    "der Ring-Container bleibt bei compact=false exakt max-w-[22rem] (unverändert)",
  );
}

console.log("\n== WP-016: buildPersonalRingGeometry wird durch compact nicht berührt ==");
{
  assert(
    ringSource.includes("buildPersonalRingGeometry(personalCycleView, today, manualPmsOverride)"),
    "buildPersonalRingGeometry erhält weiterhin ausschließlich personalCycleView, today und manualPmsOverride — compact fließt nie in die Geometrieberechnung ein",
  );
}

console.log("\n== WP-016: die Partneransicht übergibt niemals compact, bleibt also byte-identisch zum vorherigen Stand ==");
{
  assert(!partnerRingSource.includes("compact"), "NewPartnerCycleRing.tsx enthält keinerlei Referenz auf compact");
  assert(
    partnerRingSource.includes("<CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} />"),
    "der Partner-Aufruf von CyclePersonalRing ist unverändert, ohne compact",
  );
}

console.log("\n== WP-016: die eigene Ansicht rendert den Ring zweimal rein per CSS (sm:hidden / hidden sm:block), kein JS-Breakpoint ==");
{
  assert(componentSource.includes('<div className="sm:hidden">'), "ein Wrapper ist unterhalb sm sichtbar (sm:hidden)");
  assert(componentSource.includes('<div className="hidden sm:block">'), "ein Wrapper ist ab sm sichtbar (hidden sm:block)");
  assert(
    componentSource.includes("<CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} manualPmsOverride={manualPmsRingOverride} compact />"),
    "der mobile Ring-Aufruf setzt compact",
  );
  assert(
    componentSource.includes("<CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} manualPmsOverride={manualPmsRingOverride} />"),
    "der breite Ring-Aufruf bleibt ohne compact (identisch zum bisherigen Stand)",
  );
  assert(!componentSource.includes("matchMedia") && !componentSource.includes("useMediaQuery"), "kein JS-Media-Query-Hook wurde eingeführt, reiner CSS-Ansatz");
}

console.log("\n== WP-016: Reihenfolge Heute-Karte, Zyklus, Kalender bleibt erhalten ==");
{
  const todayCardIndex = componentSource.indexOf("<TodayCard ");
  const cycleSectionIndex = componentSource.indexOf('aria-label={hasPersonalCircle');
  const calendarSectionIndex = componentSource.indexOf('aria-label="Kalender zur Orientierung"');
  assert(
    todayCardIndex !== -1 && cycleSectionIndex !== -1 && calendarSectionIndex !== -1 && todayCardIndex < cycleSectionIndex && cycleSectionIndex < calendarSectionIndex,
    "Heute-Karte steht weiterhin vor der Zyklus-section, die vor der Kalender-section steht",
  );
}

console.log("\n== WP-016: Monatspfeile erhalten eine garantierte Mindest-Klickfläche von 40 CSS-Pixeln, Tagesfelder bleiben unverändert ==");
{
  assert(
    componentSource.includes('aria-label="Vorherigen Monat anzeigen" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-full text-center text-3xl font-light'),
    "der Pfeil 'Vorherigen Monat anzeigen' hat eine feste 40x40px-Klickfläche (h-10 w-10), unabhängig von der Textzeilenhöhe",
  );
  assert(
    componentSource.includes('aria-label="Nächsten Monat anzeigen" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-full text-center text-3xl font-light'),
    "der Pfeil 'Nächsten Monat anzeigen' hat eine feste 40x40px-Klickfläche (h-10 w-10), unabhängig von der Textzeilenhöhe",
  );
  assert(componentSource.includes("grid-cols-[2.5rem_1fr_2.5rem]"), "die Pfeil-Spalten sind mindestens 2.5rem (40px) breit, damit die 40x40px-Flächen vollständig sichtbar sind");
  assert(componentSource.includes("aspect-square min-w-0"), "Tagesfelder behalten ihr bestehendes aspect-square-Layout unverändert");
}

console.log("\n== WP-016: keine Textkürzung, kein Entfernen bestehender Hinweise ==");
{
  assert(componentSource.includes("Nächste Periode voraussichtlich in"), "die WP-015-Resttage-Zeile bleibt vollständig vorhanden");
  assert(componentSource.includes("Kann abweichen"), "der Unsicherheitshinweis bleibt vollständig vorhanden");
  assert(componentSource.includes("Von dir eingetragen:"), "der manuelle PMS-Hinweis bleibt vollständig vorhanden");
  assert(!componentSource.includes("text-ellipsis") && !componentSource.includes("truncate"), "keine CSS-Textabschneidung (truncate/text-ellipsis) wurde eingeführt");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
