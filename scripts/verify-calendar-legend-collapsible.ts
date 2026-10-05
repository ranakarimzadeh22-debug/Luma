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

console.log("\n== WP-007 V2: der Steuerbutton trägt aria-expanded/aria-controls und wechselt seinen Text ==");
{
  assert(source.includes("aria-expanded={isCalendarLegendOpen}"), "der Button trägt aria-expanded gebunden an den Öffnungszustand");
  assert(source.includes('aria-controls="calendar-legend-panel"'), "der Button referenziert das Panel über aria-controls");
  assert(source.includes('id="calendar-legend-panel"'), "das Panel trägt die passende id für aria-controls");
  assert(source.includes('"Erklärungen ausblenden"'), "der Button zeigt 'Erklärungen ausblenden', wenn geöffnet");
  assert(source.includes('"Erklärungen zum Kalender anzeigen"'), "der Button zeigt 'Erklärungen zum Kalender anzeigen', wenn geschlossen");
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

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
