import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const componentPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "NewPartnerCalendar.tsx",
);
const source = readFileSync(componentPath, "utf8");

const ownerComponentPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "NewCycleExample.tsx",
);
const ownerSource = readFileSync(ownerComponentPath, "utf8");

console.log("\n== WP-004 V12 / WP-018 Korrektur V3: der Popover-Zustand ist anfangs geschlossen ==");
{
  assert(source.includes("const [isCalendarLegendOpen, setIsCalendarLegendOpen] = useState(false)"), "isCalendarLegendOpen startet mit false (geschlossen)");
}

console.log("\n== WP-018 Korrektur V3: der Info-Button trägt aria-expanded/aria-haspopup/aria-controls und einen dynamischen aria-label ==");
{
  assert(source.includes("aria-expanded={isCalendarLegendOpen}"), "der Button trägt aria-expanded gebunden an den Öffnungszustand");
  assert(source.includes('aria-haspopup="dialog"'), "der Button trägt aria-haspopup=\"dialog\"");
  assert(source.includes('aria-controls="partner-calendar-legend-panel"'), "der Button referenziert das Popover über aria-controls");
  assert(source.includes('id="partner-calendar-legend-panel"'), "das Popover trägt die passende id für aria-controls");
  assert(source.includes('"Erklärungen zum Kalender ausblenden"'), "der dynamische aria-label lautet 'Erklärungen zum Kalender ausblenden', wenn geöffnet");
  assert(source.includes('"Erklärungen zum Kalender anzeigen"'), "der dynamische aria-label lautet 'Erklärungen zum Kalender anzeigen', wenn geschlossen");
  assert(source.includes("onClick={() => setIsCalendarLegendOpen((current) => !current)}"), "der Button schaltet den Öffnungszustand per Klick um");
}

console.log("\n== WP-018 Korrektur V3: kein alter langer Steuerbutton unter dem Kalender mehr vorhanden ==");
{
  assert(!source.includes('>{isCalendarLegendOpen ? "Erklärungen ausblenden" : "Erklärungen zum Kalender anzeigen"}<'), "kein sichtbarer Button-Text mehr mit dem alten Umschalt-Muster");
  assert(!source.includes('className="flex justify-center">\n        <button'), "kein eigenständiger, zentrierter Pill-Button-Wrapper mehr vorhanden");
}

console.log("\n== WP-018 Korrektur V3: ein kleiner ⓘ-Info-Button steht in der Monatszeile neben dem Monatsnamen, Popover ist role=dialog ohne Dokumentfluss-Wachstum ==");
{
  const monthRowStart = source.indexOf("grid-cols-[2.5rem_1fr_2.5rem]");
  const weekdayGridStart = source.indexOf("grid-cols-7 gap-1", monthRowStart);
  const monthRow = monthRowStart !== -1 && weekdayGridStart !== -1 ? source.slice(monthRowStart, weekdayGridStart) : "";
  assert(monthRow.length > 0, "die Monatszeile wurde im Quelltext gefunden");
  assert(monthRow.includes("ⓘ"), "das sichtbare ⓘ-Zeichen steht in der Monatszeile");
  assert(monthRow.includes("Vorherigen Monat anzeigen") && monthRow.includes("Nächsten Monat anzeigen"), "beide Monatspfeile bleiben in derselben Zeile wie der Info-Button");
  assert(monthRow.includes('<div className="relative">'), "der Info-Button steht in einem eigenen relative-Wrapper, an dem das Popover positioniert wird");

  const popoverStart = source.indexOf("function PartnerCalendarLegendPopover(");
  const popoverEnd = source.indexOf("\ninterface DayDetailModalProps", popoverStart);
  const popoverBody = popoverStart !== -1 && popoverEnd !== -1 ? source.slice(popoverStart, popoverEnd) : "";
  assert(popoverBody.length > 0, "PartnerCalendarLegendPopover wurde im Quelltext gefunden");
  assert(popoverBody.includes('role="dialog"'), "das Popover trägt role=\"dialog\"");
  assert(popoverBody.includes('aria-label="Kalender-Erklärung"'), "das Popover trägt eine eindeutige zugängliche Beschriftung");
  assert(popoverBody.includes('className="absolute'), "das Popover ist absolut positioniert (wächst nicht im normalen Dokumentfluss unterhalb des Kalenders)");
  assert(!popoverBody.includes("overflow-y-auto") && !popoverBody.includes("overflow-y-scroll") && !popoverBody.includes("max-h-"), "das Popover hat keine innere Scrollfläche");
  assert(popoverBody.includes('event.key === "Escape"'), "das Popover schließt bei Escape (document-Listener)");
  assert(popoverBody.includes("mousedown") && popoverBody.includes("popoverRef.current && !popoverRef.current.contains"), "das Popover schließt bei einem Klick außerhalb seiner eigenen Fläche");
}

console.log("\n== WP-018 Korrektur V3: die sechs vereinbarten kurzen Partner-Texte sind vorhanden, 'Bestätigt' und die drei neuen Begriffe nutzen bestehende Bedingungen ==");
{
  const popoverStart = source.indexOf("function PartnerCalendarLegendPopover(");
  const popoverEnd = source.indexOf("\ninterface DayDetailModalProps", popoverStart);
  const popoverBody = popoverStart !== -1 && popoverEnd !== -1 ? source.slice(popoverStart, popoverEnd) : "";
  assert(popoverBody.includes("Periode bestätigt"), "'Periode bestätigt' ist vorhanden");
  assert(popoverBody.includes("Nächste Periode geschätzt"), "'Nächste Periode geschätzt' ist vorhanden");
  assert(popoverBody.includes("Eisprung geschätzt"), "'Eisprung geschätzt' ist vorhanden");
  assert(popoverBody.includes("Fruchtbare Tage geschätzt"), "'Fruchtbare Tage geschätzt' ist vorhanden");
  assert(popoverBody.includes("PMS vor Periode"), "'PMS vor Periode' ist vorhanden");
  assert(popoverBody.includes("PMS eingetragen"), "'PMS eingetragen' ist vorhanden");
  assert(popoverBody.includes(">Geschätzt<"), "eine 'Geschätzt'-Kennzeichnung steht sichtbar vor den Vorhersagezeilen");

  // Bedingte Sichtbarkeit: dieselben, bereits vorhandenen Flags, keine neue Ableitung.
  assert(popoverBody.includes("{hasAnyPrediction && ("), "die Vorhersagezeilen (Nächste Periode/Eisprung/PMS vor Periode) hängen weiterhin an hasAnyPrediction");
  assert(popoverBody.includes("{hasFertileWindowSomewhere && ("), "'Fruchtbare Tage geschätzt' hängt weiterhin an hasFertileWindowSomewhere");
  assert(popoverBody.includes("{hasManualPmsSection && ("), "'PMS eingetragen' hängt weiterhin am bereits vorhandenen manuellen PMS-Abschnitt (als Prop durchgereicht)");
  assert(
    source.includes("hasManualPmsSection={Boolean(manualPmsSection)}"),
    "hasManualPmsSection wird direkt aus dem bereits vorhandenen manualPmsSection abgeleitet, keine neue Datenquelle",
  );
}

console.log("\n== WP-018 Korrektur V3: der alte lange Inline-Panel-Inhalt (nicht die unveränderten Tagesfeld-ARIA-Labels) ist entfernt ==");
{
  // primaryStatusLabel (Tagesfeld-aria-label/Tagesfenster) behält bewusst
  // seine bisherigen, ausführlichen Formulierungen — nur das frühere, separat
  // gerenderte Inline-Panel mit denselben Texten als eigene <span>-Zeilen
  // muss verschwunden sein.
  assert(!source.includes('"inline-flex items-center gap-1.5"'), "das alte Inline-Panel-Markup (inline-flex-Zeilen mit Farbpunkt + Text) ist entfernt");
  assert(!source.includes('aria-label="Legende"'), "das alte, separat beschriftete Inline-Legende-Element ist entfernt");
  assert(source.includes("primaryStatusLabel"), "primaryStatusLabel (Tagesfeld-ARIA-Labels, Tagesfenster) bleibt unverändert bestehen");
}

console.log("\n== WP-004 V12: 'Vorhersage unsicher' bleibt außerhalb des Popovers und unabhängig von dessen Zustand sichtbar ==");
{
  const uncertainIndex = source.lastIndexOf("Vorhersage unsicher - Kann abweichen");
  const popoverCallIndex = source.indexOf("<PartnerCalendarLegendPopover");
  assert(uncertainIndex !== -1 && popoverCallIndex !== -1 && popoverCallIndex < uncertainIndex, "der Unsicherheitshinweis steht im Quelltext nach der Popover-Einbindung, als eigener, unbedingt gerenderter Absatz");
  assert(source.includes("prediction?.isUncertain &&"), "der Unsicherheitshinweis bleibt an prediction.isUncertain gebunden, nicht an isCalendarLegendOpen");
}

console.log("\n== WP-004 V12: keine Marker-, Berechnungs-, Freigabe- oder Datenlogik wurde verändert ==");
{
  assert(source.includes("primaryCalendarPhase"), "die zentrale Phasen-Priorität bleibt unverändert eingebunden");
  assert(source.includes("showsFertileMarker"), "der fruchtbare-Fenster-Zusatzmarker bleibt unverändert eingebunden");
  assert(source.includes("phasesForDate"), "Überlappungserkennung bleibt unverändert eingebunden");
  assert(!source.includes("fetch("), "der Partner-Kalender bleibt rein lesend, kein schreibender Aufruf");
  assert(!source.includes("cycle_ring_shared") && !source.includes("calendar_shared"), "kein neuer/alter Freigabe-Schalter wird referenziert");
}

console.log("\n== WP-018 Korrektur V3: keine neuen Eingabeelemente, Partner bleibt rein lesend ==");
{
  assert(!source.includes("<input"), "NewPartnerCalendar.tsx enthält kein <input>-Element");
  assert(!source.includes('type="checkbox"'), "NewPartnerCalendar.tsx enthält keine Checkbox");
}

console.log("\n== WP-018 Korrektur V3: die Owner-Komponente (NewCycleExample.tsx) wurde durch diese Partner-Korrektur nicht verändert ==");
{
  assert(
    ownerSource.includes('<div className="mx-auto w-full max-w-sm rounded-2xl border border-[#efd5dc] bg-white/90 px-3 py-2.5 text-center shadow-sm sm:px-5 sm:py-4">'),
    "die Owner-TodayCard-Kartenrahmung bleibt exakt beim WP-016-Korrektur-V2-Stand",
  );
  assert(ownerSource.includes("function CalendarLegendPopover("), "die Owner-eigene CalendarLegendPopover-Komponente (WP-018 Korrektur V2) bleibt unverändert vorhanden");
  assert(!ownerSource.includes("PartnerCalendarLegendPopover"), "NewCycleExample.tsx referenziert keine Partner-Popover-Komponente");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
