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

console.log("\n== WP-007 V2: der Einklappbereich ist anfangs geschlossen ==");
{
  assert(source.includes("useState(false)") && source.includes("isCalendarLegendOpen"), "isCalendarLegendOpen startet mit false (geschlossen)");
}

console.log("\n== WP-007 V2 / WP-018: der Steuerbutton trägt aria-expanded/aria-controls und einen dynamischen aria-label ==");
{
  assert(source.includes("aria-expanded={isCalendarLegendOpen}"), "der Button trägt aria-expanded gebunden an den Öffnungszustand");
  assert(source.includes('aria-controls="calendar-legend-panel"'), "der Button referenziert das Panel über aria-controls");
  assert(source.includes('id="calendar-legend-panel"'), "das Panel trägt die passende id für aria-controls");
  // WP-018: der frühere sichtbare Lauftext-Button unter dem Kalender wurde
  // durch einen kleinen ⓘ-Info-Button neben dem Monatsnamen ersetzt; dieselben
  // beiden Formulierungen stehen jetzt im dynamischen aria-label statt im
  // sichtbaren Button-Text.
  assert(source.includes('"Erklärungen zum Kalender ausblenden"'), "der dynamische aria-label lautet 'Erklärungen zum Kalender ausblenden', wenn geöffnet");
  assert(source.includes('"Erklärungen zum Kalender anzeigen"'), "der dynamische aria-label lautet 'Erklärungen zum Kalender anzeigen', wenn geschlossen");
}

console.log("\n== WP-007 V2: 'Vorhersage unsicher' steht außerhalb des Einklappbereichs ==");
{
  const uncertainIndex = source.indexOf("Vorhersage unsicher - Kann abweichen");
  const panelOpenIndex = source.indexOf('id="calendar-legend-panel"');
  assert(uncertainIndex !== -1 && panelOpenIndex !== -1 && uncertainIndex < panelOpenIndex, "der Unsicherheitshinweis steht im Quelltext vor dem Einklappbereich (unabhängig von dessen Zustand sichtbar)");
  assert(source.includes("prediction?.isUncertain &&"), "der Unsicherheitshinweis bleibt an prediction.isUncertain gebunden, nicht an den Einklappzustand");
}

console.log("\n== WP-007 V2: alle bisherigen Legendentexte und P/M/E-Erklärungen bleiben im geöffneten Bereich vollständig erhalten ==");
{
  const panelStart = source.indexOf('id="calendar-legend-panel"');
  const panelEnd = source.indexOf("{!prediction && (", panelStart);
  const panelBody = panelStart !== -1 && panelEnd !== -1 ? source.slice(panelStart, panelEnd) : "";
  assert(panelBody.includes("Bestätigt / Laufend"), "Legendentext 'Bestätigt / Laufend' ist im Panel enthalten");
  assert(panelBody.includes("Voraussichtliches Ende"), "Legendentext 'Voraussichtliches Ende' ist im Panel enthalten");
  assert(panelBody.includes("Geschätzte nächste Periode"), "Legendentext 'Geschätzte nächste Periode' ist im Panel enthalten");
  assert(panelBody.includes("Mögliches fruchtbares Zeitfenster"), "Legendentext 'Mögliches fruchtbares Zeitfenster' ist im Panel enthalten");
  assert(panelBody.includes("PhaseLegendItem"), "die bestehende P/M/E-Legende (PhaseLegendItem) bleibt im Panel eingebunden");
  assert(panelBody.includes('(["period", "pms", "ovulation"] as const)'), "alle drei P/M/E-Phasen werden weiterhin gerendert");
}

console.log("\n== WP-007 V2: die bestehende P/M/E-Einzel-Interaktion (Escape, aria-expanded je Phase) bleibt unverändert ==");
{
  const legendItemStart = source.indexOf("function PhaseLegendItem(");
  const legendItemEnd = source.indexOf("\n}\n", legendItemStart);
  const legendItemBody = legendItemStart !== -1 && legendItemEnd !== -1 ? source.slice(legendItemStart, legendItemEnd) : "";
  assert(legendItemBody.includes('event.key === "Escape"'), "PhaseLegendItem schließt weiterhin per Escape");
  assert(legendItemBody.includes("aria-expanded={isActive}"), "PhaseLegendItem trägt weiterhin ein eigenes aria-expanded je Phase");
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
  const monthRowIndex = source.indexOf("grid-cols-[2.5rem_1fr_2.5rem]");
  const infoButtonIndex = source.indexOf('aria-expanded={isCalendarLegendOpen}');
  const updatePeriodIndex = source.indexOf("Meine Periode aktualisieren");
  assert(
    monthRowIndex !== -1 && infoButtonIndex !== -1 && updatePeriodIndex !== -1 && infoButtonIndex < updatePeriodIndex,
    "der Info-Button-Aufruf steht im Quelltext jetzt vor (nicht mehr unterhalb) dem 'Meine Periode aktualisieren'-Button — er wurde in die Monatszeile verschoben",
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
