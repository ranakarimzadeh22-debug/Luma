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

const modalStart = source.indexOf("function PeriodHistoryModal(");
const modalEnd = source.indexOf("function TodayCard(");
const modalBody = modalStart !== -1 && modalEnd !== -1 ? source.slice(modalStart, modalEnd) : "";

console.log("\n== WP-008: PeriodHistoryModal wurde gefunden ==");
{
  assert(modalBody.length > 0, "der Quelltextbereich von PeriodHistoryModal wurde isoliert");
}

console.log("\n== WP-008: Monat/Jahr ist die deutlichste Angabe, Zeitraum folgt direkt darunter ==");
{
  const monthLineIndex = modalBody.indexOf("{formatHistoryMonth(row.startDate)}</p>");
  const rangeLineIndex = modalBody.indexOf("läuft noch");
  assert(monthLineIndex !== -1, "die Monat/Jahr-Zeile ist vorhanden");
  assert(rangeLineIndex !== -1 && monthLineIndex < rangeLineIndex, "die Zeitraum-/Status-Zeile folgt im Quelltext direkt nach Monat/Jahr");
  assert(modalBody.includes("text-base font-semibold capitalize"), "Monat/Jahr nutzt die größte/deutlichste Textauszeichnung der Zeile");
}

console.log("\n== WP-008: Dauer und Zyklus sind getrennte, einzeln beschriftete Felder (keine verkettete Textzeile) ==");
{
  assert(modalBody.includes("Dauer:</span>"), "Dauer trägt eine eigene, fett hervorgehobene Beschriftung");
  assert(modalBody.includes("Zyklus:</span>"), "Zyklus trägt eine eigene, fett hervorgehobene Beschriftung");
  assert(!modalBody.includes("· Dauer:"), "es gibt keine mit '·' verkettete gemeinsame Dauer/Zyklus-Textzeile mehr");
}

console.log("\n== WP-008: fachliche Bedeutung unverändert – Dauer nur bei echtem Ende, keine erfundene Zykluslänge ==");
{
  assert(modalBody.includes("row.durationDays !== null && ("), "Dauer wird weiterhin ausschließlich bei vorhandenem durationDays (echtes Ende) gerendert");
  assert(modalBody.includes('"Noch nicht bekannt"'), "eine unbekannte Zykluslänge zeigt weiterhin den bestehenden Text 'Noch nicht bekannt'");
}

console.log("\n== WP-008: Klickfläche, aria-label und Navigation sind unverändert ==");
{
  assert(modalBody.includes("onClick={() => onSelectMonth(row.startDate)}"), "der gesamte Button bleibt die Klickfläche für onSelectMonth");
  assert(modalBody.includes("aria-label={`Kalender für ${formatHistoryMonth(row.startDate)} öffnen`}"), "das bestehende aria-label ist unverändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
