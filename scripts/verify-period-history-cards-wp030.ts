import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "src/components/NewCycleExample.tsx"), "utf8");
const start = source.indexOf("function PeriodHistoryModal(");
const end = source.indexOf("\nexport default function NewCycleExample(", start);
const modal = start !== -1 && end !== -1 ? source.slice(start, end) : "";
const card = modal.slice(modal.indexOf("sortedNewestFirst.map((row)"), modal.indexOf("Schließen"));

console.log("\n== WP-030: jede Historienzeile ist eine abgerundete, helle Karte mit Rosé-Akzent ==");
{
  assert(modal.length > 0 && card.length > 0, "PeriodHistoryModal und Kartenbereich gefunden");
  assert(card.includes("<button") && card.includes("type=\"button\"") && card.includes("onClick={() => onSelectMonth(row.startDate)}"), "die Karte ist ein echter Button (Klick und Tastatur) und ruft weiter onSelectMonth(row.startDate) auf");
  assert(card.includes("rounded-2xl") && card.includes("bg-white") && card.includes("border-[#f1dfe5]"), "Karte: abgerundet, hell/weiß, zarter Rosé-Rand");
  assert(card.includes('aria-hidden="true"') && card.includes("bg-[#f3b4c8]"), "Karte: dezenter Rosé-Akzentstreifen (dekorativ)");
  assert(card.includes("focus-visible:outline-2") && card.includes("focus-visible:outline-[#6d2850]"), "sichtbarer Fokuszustand bleibt");
  assert(card.includes("aria-label={`Kalender für ${formatHistoryMonth(row.startDate)} öffnen`}"), "bestehender zugänglicher Name der Karte unverändert");
  assert(card.includes("{formatHistoryMonth(row.startDate)}</p>") && card.includes("text-base font-semibold capitalize"), "Monat/Jahr bleibt der deutliche Titel");
}

console.log("\n== WP-030: nur vorhandene Angaben – Monat/Jahr, Zeitraum, Dauer, Zyklus ==");
{
  assert(card.includes("formatPeriodDate(row.startDate)} bis ${formatPeriodDate(row.endDate)}") && card.includes("läuft noch"), "Zeitraum (inkl. 'läuft noch') unverändert");
  assert(card.includes("row.durationDays !== null") && card.includes("Dauer:") && card.includes("{row.durationDays} Tage"), "Dauer nur bei vorhandenem Wert, unverändert");
  assert(card.includes("Zyklus:") && card.includes("row.cycleLengthDays !== null") && card.includes("Noch nicht bekannt"), "Zyklus samt 'Noch nicht bekannt' unverändert");
  assert(!/<svg|<canvas|chart|Chart|Statistik|average|Durchschnitt/.test(modal), "kein Diagramm, keine Statistik, keine Durchschnittswerte");
  assert(!/fetch\(|useEffect\([^)]*fetch|new Date\(|Math\./.test(card), "die Karten rechnen und laden nichts (keine neue Abfrage oder Berechnung)");
  const rows = (card.match(/row\.[a-zA-Z]+/g) ?? []).map((value) => value.replace("row.", ""));
  assert(rows.every((name) => ["id", "startDate", "endDate", "durationDays", "cycleLengthDays"].includes(name)), "die Karten nutzen nur die bereits vorhandenen Felder der Zeile");
}

console.log("\n== WP-030: Dialogverhalten unverändert ==");
{
  assert(modal.includes('id="period-history-title"') && modal.includes("Periodenübersicht"), "Titel 'Periodenübersicht'");
  assert(modal.includes("Meine Periode aktualisieren") && modal.includes("onClick={onOpenMyPeriods}"), "'Meine Periode aktualisieren' ruft onOpenMyPeriods");
  assert(modal.indexOf("Meine Periode aktualisieren") < modal.indexOf("overflow-y-auto"), "der Button steht weiter oberhalb der scrollbaren Liste");
  assert(modal.includes('event.key === "Escape"') && modal.includes("onClick={onClose}"), "Escape und Schließen unverändert");
  assert(modal.includes('role="dialog"') && modal.includes('aria-modal="true"') && modal.includes('aria-labelledby="period-history-title"'), "Dialog-Semantik unverändert");
  assert(modal.includes("sortedNewestFirst") && modal.includes("b.startDate.localeCompare(a.startDate)"), "Reihenfolge (neueste zuerst) unverändert");
  assert(modal.includes("Noch keine Historie vorhanden. Trage deine erste Periode ein, um sie hier später zu sehen."), "Leerzustand-Text unverändert");
  assert(!/overflow-x|w-\[\d+px\]|min-w-\[\d+/.test(modal), "keine starre Breite oder horizontaler Scroll im Dialog");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
