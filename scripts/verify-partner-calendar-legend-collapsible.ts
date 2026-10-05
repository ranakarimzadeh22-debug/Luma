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

console.log("\n== WP-004 V12: der Einklappbereich ist anfangs geschlossen ==");
{
  assert(source.includes("const [isCalendarLegendOpen, setIsCalendarLegendOpen] = useState(false)"), "isCalendarLegendOpen startet mit false (geschlossen)");
}

console.log("\n== WP-004 V12: der Steuerbutton trägt aria-expanded/aria-controls und wechselt seinen Text ==");
{
  assert(source.includes("aria-expanded={isCalendarLegendOpen}"), "der Button trägt aria-expanded gebunden an den Öffnungszustand");
  assert(source.includes('aria-controls="partner-calendar-legend-panel"'), "der Button referenziert das Panel über aria-controls");
  assert(source.includes('id="partner-calendar-legend-panel"'), "das Panel trägt die passende id für aria-controls");
  assert(source.includes('"Erklärungen ausblenden"'), "der Button zeigt 'Erklärungen ausblenden', wenn geöffnet");
  assert(source.includes('"Erklärungen zum Kalender anzeigen"'), "der Button zeigt 'Erklärungen zum Kalender anzeigen', wenn geschlossen");
  assert(source.includes("onClick={() => setIsCalendarLegendOpen((current) => !current)}"), "der Button schaltet den Öffnungszustand per Klick um");
}

console.log("\n== WP-004 V12: 'Vorhersage unsicher' steht außerhalb des Einklappbereichs ==");
{
  const uncertainIndex = source.indexOf("Vorhersage unsicher - Kann abweichen");
  const panelOpenIndex = source.indexOf('id="partner-calendar-legend-panel"');
  assert(uncertainIndex !== -1 && panelOpenIndex !== -1 && uncertainIndex < panelOpenIndex, "der Unsicherheitshinweis steht im Quelltext vor dem Einklappbereich (unabhängig von dessen Zustand sichtbar)");
  assert(source.includes("prediction?.isUncertain &&"), "der Unsicherheitshinweis bleibt an prediction.isUncertain gebunden, nicht an den Einklappzustand");
}

console.log("\n== WP-004 V12: alle vereinbarten Partner-Erklärungen bleiben im geöffneten Bereich vollständig erhalten ==");
{
  const panelStart = source.indexOf('id="partner-calendar-legend-panel"');
  const panelEnd = source.indexOf("selectedDay && (", panelStart);
  const panelBody = panelStart !== -1 && panelEnd !== -1 ? source.slice(panelStart, panelEnd) : "";
  assert(panelBody.includes("Bestätigt"), "Legendentext 'Bestätigt' ist im Panel enthalten");
  assert(panelBody.includes("Geschätzte nächste Periode"), "Legendentext 'Geschätzte nächste Periode' ist im Panel enthalten");
  assert(panelBody.includes("Möglicher Eisprung"), "Legendentext 'Möglicher Eisprung' ist im Panel enthalten");
  assert(panelBody.includes("Mögliche PMS-Phase"), "Legendentext 'Mögliche PMS-Phase' ist im Panel enthalten");
  assert(panelBody.includes("Mögliches fruchtbares Zeitfenster"), "Legendentext 'Mögliches fruchtbares Zeitfenster' ist im Panel enthalten");
}

console.log("\n== WP-004 V12: keine Marker-, Berechnungs-, Freigabe- oder Datenlogik wurde verändert ==");
{
  assert(source.includes("primaryCalendarPhase"), "die zentrale Phasen-Priorität bleibt unverändert eingebunden");
  assert(source.includes("showsFertileMarker"), "der fruchtbare-Fenster-Zusatzmarker bleibt unverändert eingebunden");
  assert(source.includes("phasesForDate"), "Überlappungserkennung bleibt unverändert eingebunden");
  assert(!source.includes("fetch("), "der Partner-Kalender bleibt rein lesend, kein schreibender Aufruf");
  assert(!source.includes("cycle_ring_shared") && !source.includes("calendar_shared"), "kein neuer/alter Freigabe-Schalter wird referenziert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
