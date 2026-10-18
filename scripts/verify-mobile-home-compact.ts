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

const todayLinePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "CalendarTodayLine.tsx");
const todayLineSource = readFileSync(todayLinePath, "utf8");

const partnerCalendarPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCalendar.tsx");
const partnerCalendarSource = readFileSync(partnerCalendarPath, "utf8");

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

console.log("\n== WP-016: zur Zeit von WP-016 übergab die Partneransicht niemals compact (seit WP-017 bewusst überholt, siehe verify-mobile-partner-compact.ts) ==");
{
  assert(
    partnerRingSource.includes("<CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} />"),
    "der breite Partner-Aufruf von CyclePersonalRing (ab sm) bleibt unverändert, ohne compact",
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

console.log("\n== WP-016 Korrektur V2: Kalender-Haupt-Tageszahl ist mobil kleiner, ab sm unverändert text-base ==");
{
  assert(
    componentSource.includes('const dayClassName = `relative grid h-full w-full place-items-center rounded-2xl border text-sm sm:text-base ${'),
    "dayClassName nutzt unterhalb sm text-sm, ab sm weiterhin die bisherige text-base",
  );
}

console.log("\n== WP-016 Korrektur V2: TodayCard wird mobil nochmals verdichtet, ab sm unverändert ==");
{
  assert(
    componentSource.includes('<div className="mx-auto w-full max-w-sm rounded-2xl border border-[#efd5dc] bg-white/90 px-3 py-2.5 text-center shadow-sm sm:px-5 sm:py-4">'),
    "der Karten-Innenabstand ist unterhalb sm enger (px-3 py-2.5), ab sm weiterhin px-5 py-4 wie vor der Korrektur",
  );
  assert(componentSource.includes("text-sm font-semibold text-[#28101f] sm:text-base"), "die Headline bleibt bei text-sm (mobil) / text-base (ab sm)");
  assert(componentSource.includes("text-xs text-[#28101f] sm:mt-1 sm:text-sm"), "die Resttage-Zeile bleibt bei text-xs (mobil) / text-sm (ab sm)");
  assert(componentSource.includes("text-xs text-[#a52b5d] sm:mt-1 sm:text-sm"), "'Kann abweichen' bleibt bei text-xs (mobil) / text-sm (ab sm)");
  assert(componentSource.includes("Nächste Periode voraussichtlich in"), "die Resttage-Logik/der Text bleibt unverändert vorhanden");
}

console.log("\n== WP-016 Korrektur V2: CalendarTodayLine bekommt eine rein optionale compact-Prop, nur der Owner setzt sie ==");
{
  assert(todayLineSource.includes("compact?: boolean;"), "compact ist eine optionale Prop");
  assert(todayLineSource.includes("compact = false"), "compact ist standardmäßig false (unverändertes Verhalten ohne die Prop)");
  assert(
    todayLineSource.includes('compact ? "text-xs sm:text-sm" : "text-sm"'),
    "ohne compact bleibt die Zeile exakt text-sm (unverändert); nur mit compact wird sie unterhalb sm kleiner",
  );
  assert(componentSource.includes("<CalendarTodayLine today={todayKey} compact />"), "der Owner-Aufruf setzt compact");
  // Zur Zeit von WP-016 übergab auch der Partner-Aufruf niemals compact; seit
  // WP-017 ist das bewusst überholt (siehe verify-mobile-partner-compact.ts).
  // partnerCalendarSource wird hier nicht mehr gegen "kein compact" geprüft.
  void partnerCalendarSource;
}

console.log("\n== WP-016 Korrektur V2 / WP-018: die verbliebenen zwei Pill-Aktionsbuttons sind mobil kleiner, behalten aber mindestens 40px Höhe ==");
{
  // WP-018: "Erklärungen zum Kalender anzeigen"/"ausblenden" ist seit WP-018
  // kein Pill-Button mehr neben "Zykluslänge ergänzen", sondern ein kleiner
  // ⓘ-Info-Button in der Monatszeile (siehe verify-calendar-legend-collapsible.ts).
  // Hier bleiben daher nur noch die zwei verbliebenen Pill-Buttons relevant.
  const buttonTexts = ["Zykluslänge ergänzen", "Meine Periode aktualisieren"];
  for (const label of buttonTexts) {
    assert(componentSource.includes(label), `Button-Text '${label}' bleibt unverändert vorhanden`);
  }
  const minH10Count = (componentSource.match(/min-h-10/g) ?? []).length;
  assert(minH10Count >= 2, `mindestens zwei Pill-Buttons tragen min-h-10 (gefunden: ${minH10Count})`);
  assert(componentSource.includes('text-xs font-semibold text-[#6d153f] shadow-sm hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850] sm:text-sm'), "'Zykluslänge ergänzen' nutzt mobil text-xs, ab sm weiterhin text-sm");
  assert(componentSource.includes('text-xs font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d2850] sm:text-sm'), "'Meine Periode aktualisieren' nutzt mobil text-xs, ab sm weiterhin text-sm");
}

console.log("\n== WP-016 Korrektur V2: keine Tagescontainer-, Grid-, Badge- oder Markerklasse wurde angefasst ==");
{
  assert(componentSource.includes("aspect-square min-w-0"), "Tagesfeld-Container (aspect-square) bleibt unverändert");
  assert(componentSource.includes('absolute right-1 top-0.5 text-[9px] font-bold'), "Status-Badges (P/Läuft/Gsch./M·Du) bleiben in Position und Größe unverändert");
  assert(componentSource.includes('size-2 -translate-x-1/2 rounded-full border border-white bg-red-600'), "der Heute-Marker-Punkt im Kalender bleibt unverändert");
  assert(componentSource.includes('text-[8px] font-semibold leading-none text-[#4c279a]'), "das 'Heute'-Badge bleibt unverändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
