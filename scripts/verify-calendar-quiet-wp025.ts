import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const owner = readFileSync(path.join(root, "src/components/NewCycleExample.tsx"), "utf8");
const partner = readFileSync(path.join(root, "src/components/NewPartnerCalendar.tsx"), "utf8");

function body(source: string, start: string, end: string): string {
  const i = source.indexOf(start);
  const j = source.indexOf(end, i + start.length);
  return i !== -1 && j !== -1 ? source.slice(i, j) : "";
}

// Day cells: from the day-cell data to the end of the calendar grid.
const ownerCells = body(owner, "const dayChildren = (", "const isDayActionAvailable");
const partnerCells = body(partner, "onClick={() => setSelectedDay(", "</button>");

console.log("\n== WP-025: Tageszellen zeigen nur Zahl, Band und roten Heute-Punkt ==");
{
  assert(ownerCells.length > 0 && partnerCells.length > 0, "Tageszellen-Quelltext beider Kalender gefunden");
  for (const letter of ['>P<', '>Läuft<', '>Ca.<', '>Plan<', '"M·Du"', '"Gsch."', "phaseLetters"]) {
    assert(!ownerCells.includes(letter) && !owner.includes("const phaseLetters"), `Owner: kein sichtbares Kürzel ${letter}`);
  }
  assert(!ownerCells.includes("text-[9px]") && !ownerCells.includes("absolute right-1 top-0.5"), "Owner: keine Kürzel-Spans mehr in der Tageszelle");
  assert(!ownerCells.includes("bottom-1 left-1") && !ownerCells.includes("bg-[#a988da]"), "Owner: kein zusätzlicher Fruchtbarkeits-Punkt");
  assert(!partnerCells.includes("text-[8px]") && !partner.includes("primaryStatusLetter"), "Partner: keine Kürzel (B, Gsch., M, M·Sie, E) mehr");
  assert(!partnerCells.includes("bottom-1 left-1") && !partnerCells.includes("bg-[#a988da]"), "Partner: kein zusätzlicher Fruchtbarkeits-Punkt");
  assert(ownerCells.includes("bg-red-600") && partnerCells.includes("bg-red-600"), "roter Heute-Punkt bleibt in beiden Kalendern");
  assert(ownerCells.includes("{day}") && partnerCells.includes("{day}"), "Tageszahl bleibt in beiden Kalendern");
  assert(owner.includes("dayBandStyles[bandKey]") && partner.includes("primaryStatusBandStyle[bandKey]"), "Farbbänder bleiben in beiden Kalendern");
}

console.log("\n== WP-025: kein dauerhafter Unsicherheitstext unter dem Kalender ==");
{
  assert(!owner.includes("Vorhersage unsicher - Kann abweichen"), "Owner: dauerhafter Unsicherheitsabsatz entfernt");
  assert(!partner.slice(partner.indexOf("export default function")).includes("text-center text-xs font-semibold text-pink-700"), "Partner: dauerhafter Unsicherheitsabsatz entfernt");
}

console.log("\n== WP-025: Tages-ARIA-Labels behalten alle Statusinformationen ==");
{
  const ownerAria = body(owner, "const dayAriaLabel = date", "const dayChildren");
  for (const part of ["bestätigte Periode", "laufende Periode", "voraussichtliches Ende, kann abweichen", "gespeicherte Planung", "PMS von dir eingetragen", "geschätzte nächste Periode, kann abweichen", "PMS-Phase geschätzt, kann abweichen", "Eisprung geschätzt, kann abweichen", "mögliches fruchtbares Zeitfenster, kann abweichen", ", heute"]) {
    assert(ownerAria.includes(part), `Owner-ARIA enthält '${part}'`);
  }
  assert(partner.includes("primaryStatusLabel[status]") && partner.includes("mögliches fruchtbares Zeitfenster, kann abweichen") && partner.includes(", heute"), "Partner-ARIA nutzt weiter primaryStatusLabel, Fruchtbarkeit und heute");
}

console.log("\n== WP-025: Popover erklärt alles, Eingetragen und Geschätzt getrennt, jede Schätzung mit 'Kann abweichen' ==");
{
  const ownerPopover = body(owner, "function CalendarLegendPopover(", "interface NewCycleExampleProps");
  const partnerPopover = body(partner, "function PartnerCalendarLegendPopover(", "interface DayDetailModalProps");
  assert(ownerPopover.includes("calendarLegendGroups.map") && owner.includes('heading: "Eingetragen"') && owner.includes('heading: "Geschätzt"'), "Owner: Gruppen Eingetragen und Geschätzt");
  assert(partnerPopover.includes('aria-label="Eingetragen"') && partnerPopover.includes('aria-label="Geschätzt"'), "Partner: Gruppen Eingetragen und Geschätzt");
  assert(ownerPopover.includes("Kann abweichen") && partnerPopover.includes("Kann abweichen"), "beide Popover nennen 'Kann abweichen' pro Schätzung");
  assert(ownerPopover.includes("{isUncertain && <p") && partnerPopover.includes("{isUncertain && <p"), "beide Popover zeigen den Unsicherheitshinweis nur bei isUncertain");
  for (const label of ["Periode bestätigt", "PMS eingetragen", "Nächste Periode", "PMS-Phase"]) {
    assert(partnerPopover.includes(label), `Partner-Popover enthält '${label}'`);
  }
  assert(partnerPopover.includes("hasManualPmsSection &&") && partnerPopover.includes("hasAnyPrediction &&") && !partnerPopover.includes("hasFertileWindowSomewhere"), "Partner-Popover zeigt nur vorhandene Informationen (bestehende Bedingungen)");
  for (const removed of ["Gespeicherte Planung", "Voraussichtliches Ende", "Eisprung", "Mögliches fruchtbares Zeitfenster", "PMS vor Periode"]) {
    assert(!ownerPopover.includes(removed) && !owner.slice(owner.indexOf("const calendarLegendGroups"), owner.indexOf("interface CalendarLegendPopoverProps")).includes(removed) && !partnerPopover.includes(removed), `V2: '${removed}' kommt in keinem Popover mehr vor`);
  }
  assert(!partnerPopover.includes("<h3") || (partnerPopover.match(/<h3/g) ?? []).length === 2, "V2: keine leere Überschrift oder Platzhalter, genau die zwei Gruppenüberschriften");
  assert(ownerPopover.includes('role="dialog"') && partnerPopover.includes('role="dialog"') && ownerPopover.includes('event.key === "Escape"') && partnerPopover.includes('event.key === "Escape"'), "Dialog, Escape und Außenklick bleiben");
  assert(!ownerPopover.includes("overflow-y") && !partnerPopover.includes("overflow-y") && !ownerPopover.includes("max-h-"), "keine innere Scrollfläche im Popover");
}

console.log("\n== WP-025: keine Logik-, Daten- oder Rechteänderung ==");
{
  for (const needle of ["primaryCalendarPhase", "showsFertileMarker", "calendarBandPosition", "getCalendarDayInfo"]) {
    assert(owner.includes(needle) || partner.includes(needle), `${needle} bleibt eingebunden`);
  }
  assert(!partner.includes("fetch(") && !partner.includes('method: "POST"') && !partner.includes('method: "PUT"'), "Partnerkalender bleibt rein lesend (kein Schreibzugriff)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
