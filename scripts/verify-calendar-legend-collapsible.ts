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
  "NewCycleExample.tsx",
);
const source = readFileSync(componentPath, "utf8");

console.log("\n== WP-007 V2 / WP-018 Korrektur V2: der Popover-Zustand ist anfangs geschlossen ==");
{
  assert(source.includes("useState(false)") && source.includes("isCalendarLegendOpen"), "isCalendarLegendOpen startet mit false (geschlossen)");
}

console.log("\n== WP-018 Korrektur V2: der Info-Button trägt aria-expanded/aria-haspopup/aria-controls und einen dynamischen aria-label ==");
{
  assert(source.includes("aria-expanded={isCalendarLegendOpen}"), "der Button trägt aria-expanded gebunden an den Öffnungszustand");
  assert(source.includes('aria-haspopup="dialog"'), "der Button trägt aria-haspopup=\"dialog\"");
  assert(source.includes('aria-controls="calendar-legend-panel"'), "der Button referenziert das Popover über aria-controls");
  assert(source.includes('id="calendar-legend-panel"'), "das Popover trägt die passende id für aria-controls");
  assert(source.includes('"Erklärungen zum Kalender ausblenden"'), "der dynamische aria-label lautet 'Erklärungen zum Kalender ausblenden', wenn geöffnet");
  assert(source.includes('"Erklärungen zum Kalender anzeigen"'), "der dynamische aria-label lautet 'Erklärungen zum Kalender anzeigen', wenn geschlossen");
}

console.log("\n== WP-018 Korrektur V2: das Popover ist ein role=dialog mit eindeutiger Beschriftung, kein Inline-Panel im Dokumentfluss mehr ==");
{
  const popoverStart = source.indexOf("function CalendarLegendPopover(");
  const popoverEnd = source.indexOf("\ninterface NewCycleExampleProps", popoverStart);
  const popoverBody = popoverStart !== -1 && popoverEnd !== -1 ? source.slice(popoverStart, popoverEnd) : "";
  assert(popoverBody.length > 0, "CalendarLegendPopover wurde im Quelltext gefunden");
  assert(popoverBody.includes('role="dialog"'), "das Popover trägt role=\"dialog\"");
  assert(popoverBody.includes('aria-label="Kalender-Erklärung"'), "das Popover trägt eine eindeutige zugängliche Beschriftung");
  assert(popoverBody.includes('className="absolute'), "das Popover ist absolut positioniert (wächst nicht im normalen Dokumentfluss unterhalb des Kalenders)");
  assert(!popoverBody.includes("overflow-y-auto") && !popoverBody.includes("overflow-y-scroll") && !popoverBody.includes("max-h-"), "das Popover hat keine innere Scrollfläche");
}

console.log("\n== WP-018 Korrektur V2: das Popover schließt bei Escape und bei Klick/Tipp außerhalb ==");
{
  const popoverStart = source.indexOf("function CalendarLegendPopover(");
  const popoverEnd = source.indexOf("\ninterface NewCycleExampleProps", popoverStart);
  const popoverBody = popoverStart !== -1 && popoverEnd !== -1 ? source.slice(popoverStart, popoverEnd) : "";
  assert(popoverBody.includes('event.key === "Escape"'), "das Popover schließt bei Escape (document-Listener)");
  assert(popoverBody.includes("mousedown") && popoverBody.includes("popoverRef.current && !popoverRef.current.contains"), "das Popover schließt bei einem Klick außerhalb seiner eigenen Fläche (Ref-basierte Außenklick-Erkennung)");
  assert(popoverBody.includes("useEffect"), "die Listener werden über useEffect registriert/entfernt, keine neue Abhängigkeit");
}

console.log("\n== WP-025: das Popover erklärt alle sichtbaren Farben, getrennt in 'Eingetragen' und 'Geschätzt' ==");
{
  const groupsStart = source.indexOf("const calendarLegendGroups");
  const groupsEnd = source.indexOf("interface CalendarLegendPopoverProps", groupsStart);
  const groupsBody = groupsStart !== -1 && groupsEnd !== -1 ? source.slice(groupsStart, groupsEnd) : "";
  assert(groupsBody.includes('heading: "Eingetragen"') && groupsBody.includes('heading: "Geschätzt"'), "zwei klar getrennte Gruppen 'Eingetragen' und 'Geschätzt'");
  assert(groupsBody.indexOf('heading: "Eingetragen"') < groupsBody.indexOf('heading: "Geschätzt"'), "'Eingetragen' steht vor 'Geschätzt'");
  for (const label of ["Periode (tatsächlich)", "PMS von dir eingetragen", "Gespeicherte Planung"]) {
    assert(groupsBody.includes(`"${label}"`), `'${label}' steht unter Eingetragen`);
  }
  for (const label of ["Nächste Periode", "Voraussichtliches Ende", "PMS-Phase", "Eisprung", "Mögliches fruchtbares Zeitfenster"]) {
    assert(groupsBody.includes(`label: "${label}"`) && groupsBody.split(`label: "${label}"`)[1].split("}")[0].includes("estimate: true"), `'${label}' ist als Schätzung markiert`);
  }
  assert(source.includes('{row.estimate && <span className="block text-[11px] text-[#7a5a6b]">Kann abweichen</span>}'), "jede geschätzte Zeile nennt sichtbar 'Kann abweichen'");
}

console.log("\n== WP-018 Korrektur V2: der alte lange Panel-Inhalt und die P/M/E-Detailinteraktion sind vollständig entfernt ==");
{
  assert(!source.includes("PhaseLegendItem"), "PhaseLegendItem existiert nicht mehr im Quelltext");
  assert(!source.includes("phaseExplanations"), "phaseExplanations existiert nicht mehr im Quelltext");
  assert(!source.includes("phaseLegendStyles"), "phaseLegendStyles existiert nicht mehr im Quelltext");
  assert(!source.includes("activePhase"), "der activePhase-State existiert nicht mehr (kein ungenutzter State)");
  assert(!source.includes("Bestätigt / Laufend"), "der alte lange Legendentext 'Bestätigt / Laufend' ist entfernt");
  assert(!source.includes("Voraussichtliches Ende – kann abweichen"), "der alte lange Legendentext 'Voraussichtliches Ende' ist entfernt");
  assert(!source.includes("PMS von dir eingetragen (M·Du) – deine eigene Angabe"), "der alte lange Legendentext zu M·Du ist aus der Owner-Home-Legende entfernt");
}

console.log("\n== WP-025: 'Vorhersage unsicher' steht nur noch im Popover, nicht mehr dauerhaft unter dem Kalender ==");
{
  const popoverStart = source.indexOf("function CalendarLegendPopover(");
  const popoverEnd = source.indexOf("\ninterface NewCycleExampleProps", popoverStart);
  const popoverBody = source.slice(popoverStart, popoverEnd);
  assert(popoverBody.includes("{isUncertain && <p") && popoverBody.includes("Vorhersage unsicher – Kann abweichen"), "der Unsicherheitshinweis steht im Popover und hängt an isUncertain");
  assert(source.includes("isUncertain={Boolean(prediction?.isUncertain)}"), "isUncertain kommt weiterhin aus prediction.isUncertain");
  assert(!source.includes("Vorhersage unsicher - Kann abweichen"), "kein dauerhafter Unsicherheitsabsatz mehr unter dem Kalender");
  assert(!source.includes("isCalendarLegendOpen &&"), "isCalendarLegendOpen steuert nirgends den Unsicherheitshinweis");
}

console.log("\n== WP-007 V2: keine Marker-, Berechnungs- oder Datenlogik wurde verändert ==");
{
  assert(source.includes("primaryCalendarPhase"), "die zentrale Phasen-Priorität bleibt unverändert eingebunden");
  assert(source.includes("showsFertileMarker"), "der fruchtbare-Fenster-Zusatzmarker bleibt unverändert eingebunden");
  assert(!source.includes("fetch(\"/api/neu/calendar"), "keine neue API-Route für die Legende");
}

console.log("\n== WP-018: der alte lange Steuerbutton unter dem Kalender ist entfernt ==");
{
  assert(!source.includes('>{isCalendarLegendOpen ? "Erklärungen ausblenden" : "Erklärungen zum Kalender anzeigen"}<'), "kein sichtbarer Button-Text mehr mit dem alten Umschalt-Muster");
  // WP-019 verlegte "Meine Periode aktualisieren" aus der Home-Ansicht in die
  // Periodenübersicht (PeriodHistoryModal); der Info-Button-Lagenachweis wird
  // daher gegen das Kalendergrid statt gegen diesen Button geführt.
  const monthRowIndex = source.indexOf("grid-cols-[2.5rem_1fr_2.5rem]");
  const infoButtonIndex = source.indexOf('aria-expanded={isCalendarLegendOpen}');
  const calendarGridIndex = source.indexOf("grid-cols-7 gap-1.5", monthRowIndex);
  assert(
    monthRowIndex !== -1 && infoButtonIndex !== -1 && calendarGridIndex !== -1 && infoButtonIndex < calendarGridIndex,
    "der Info-Button-Aufruf steht im Quelltext in der Monatszeile, vor dem Kalendergrid",
  );
}

console.log("\n== WP-018: ein kleiner ⓘ-Info-Button steht in der Monatszeile neben dem Monatsnamen ==");
{
  const monthRowStart = source.indexOf("grid-cols-[2.5rem_1fr_2.5rem]");
  const weekdayGridStart = source.indexOf("grid-cols-7 gap-1.5", monthRowStart);
  const monthRow = monthRowStart !== -1 && weekdayGridStart !== -1 ? source.slice(monthRowStart, weekdayGridStart) : "";
  assert(monthRow.length > 0, "die Monatszeile wurde im Quelltext gefunden");
  assert(monthRow.includes("ⓘ"), "das sichtbare ⓘ-Zeichen steht in der Monatszeile");
  assert(monthRow.includes('aria-controls="calendar-legend-panel"'), "der Info-Button in der Monatszeile steuert weiterhin dasselbe calendar-legend-panel");
  assert(monthRow.includes("aria-expanded={isCalendarLegendOpen}"), "der Info-Button trägt dasselbe aria-expanded wie zuvor der lange Button");
  assert(monthRow.includes("Periodenhistorie öffnen"), "der Monatsname-Button mit seinem unveränderten aria-label bleibt in derselben Zeile");
  assert(monthRow.includes("Vorherigen Monat anzeigen") && monthRow.includes("Nächsten Monat anzeigen"), "beide Monatspfeile bleiben in derselben Zeile wie der Info-Button");
  assert(monthRow.includes('<div className="relative">'), "der Info-Button steht in einem eigenen relative-Wrapper, an dem das Popover positioniert wird");
}

console.log("\n== WP-018: Info-Button und Monatsname lösen getrennte, nicht verschachtelte Aktionen aus ==");
{
  const monthButtonIndex = source.indexOf('onClick={() => setIsPeriodHistoryOpen(true)}');
  const infoButtonIndex = source.indexOf('onClick={() => setIsCalendarLegendOpen((current) => !current)}');
  assert(monthButtonIndex !== -1 && infoButtonIndex !== -1, "beide Handler sind im Quelltext vorhanden");
  assert(monthButtonIndex !== infoButtonIndex, "Monatsname-Button und Info-Button rufen unterschiedliche Handler auf");
  // Keine Verschachtelung: zwischen dem öffnenden <button ...onClick={() => setIsPeriodHistoryOpen
  // und dem zugehörigen schließenden </button> darf kein zweites <button stehen.
  const monthButtonClose = source.indexOf("</button>", monthButtonIndex);
  const nestedButtonBetween = source.slice(monthButtonIndex, monthButtonClose).includes("<button");
  assert(!nestedButtonBetween, "der Info-Button ist nicht in den Monatsname-Button verschachtelt (kein <button> innerhalb eines anderen <button>)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
