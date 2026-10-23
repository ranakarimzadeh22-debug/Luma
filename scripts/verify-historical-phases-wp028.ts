import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deriveHistoricalCalendarPhases } from "../src/lib/historical-calendar-phases";
import { deriveManualPmsSection } from "../src/lib/manual-pms";
import { predictCycle } from "../src/lib/new-cycle-prediction";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const strip = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const today = "2026-10-23";
const periods = [
  { id: "a", startDate: "2026-08-01", endDate: "2026-08-05", expectedEndDate: null },
  { id: "b", startDate: "2026-08-29", endDate: "2026-09-02", expectedEndDate: null },
  { id: "c", startDate: "2026-09-26", endDate: "2026-09-30", expectedEndDate: null },
];
const symptoms = [
  { date: "2026-08-24", symptoms: ["fatigue" as const] },
  { date: "2026-10-12", symptoms: ["mood_swings" as const] },
];

console.log("\n== WP-028: Zukunftsvorhersage und aktueller manueller Abschnitt bleiben unverändert ==");
{
  const prediction = predictCycle(periods, null, today);
  const before = JSON.stringify({ prediction, manual: deriveManualPmsSection(periods, symptoms, today, prediction?.nextPeriodStart ?? null) });
  const historical = deriveHistoricalCalendarPhases(periods, symptoms, today);
  const after = JSON.stringify({ prediction: predictCycle(periods, null, today), manual: deriveManualPmsSection(periods, symptoms, today, prediction?.nextPeriodStart ?? null) });
  assert(before === after, "predictCycle und deriveManualPmsSection liefern vor und nach der historischen Ableitung dasselbe");
  assert(!historical.pmsDates.includes("2026-10-12") && historical.pmsDates.every((date) => date < "2026-09-26"), "der Symptomtag im aktuellen Zyklus (nach der neuesten Periode) wird nicht historisch behandelt");
  assert(historical.pmsDates[0] === "2026-08-24" && historical.pmsDates.at(-1) === "2026-08-28", "vergangener PMS-Abschnitt 24.–28.08. (bis zum Tag vor der nächsten realen Periode)");
  assert(historical.ovulationDates.join() === "2026-08-15,2026-09-12", "zwei vergangene Zyklen ergeben zwei mögliche Eisprungtage (14 Tage vor der folgenden realen Periode)");
  assert(historical.ovulationDates.every((date) => date < today), "kein historischer Eisprung in Gegenwart oder Zukunft");
}

console.log("\n== WP-028: Owner und Partner nutzen dieselbe Ableitung ==");
{
  const owner = strip(read("src/components/NewCycleExample.tsx"));
  const partnerLib = strip(read("src/lib/new-partner-calendar.ts"));
  const partnerUi = strip(read("src/components/NewPartnerCalendar.tsx"));
  assert(owner.includes("deriveHistoricalCalendarPhases(periods, pmsSymptomDays, todayKey)"), "Owner-Kalender leitet aus Perioden und Symptomtagen ab");
  assert(partnerLib.includes("deriveHistoricalCalendarPhases(entries, pmsSymptomDays, today)"), "Partner-View leitet serverseitig mit derselben Funktion und denselben Quellen ab");
  const a = deriveHistoricalCalendarPhases(periods, symptoms, today);
  const b = deriveHistoricalCalendarPhases(periods.map(({ startDate, endDate }) => ({ startDate, endDate })), symptoms, today);
  assert(JSON.stringify(a) === JSON.stringify(b), "gleiche Eingaben (Owner-Perioden bzw. datensparsame Partner-Perioden) ergeben identische Ergebnisse");
  assert(partnerUi.includes("historicalPmsSet.has(date)") && partnerUi.includes("historicalOvulationSet.has(date)"), "Partnerkalender rendert die historischen Bänder");
  const confirmedIndex = partnerUi.indexOf('if (confirmedSet.has(date)) return "confirmed"');
  const manualIndex = partnerUi.indexOf('return "pms-manual"');
  const historicalPmsIndex = partnerUi.indexOf("historicalPmsSet.has(date)");
  const predictedIndex = partnerUi.indexOf("primaryCalendarPhase(date, prediction)");
  const ovulationIndex = partnerUi.indexOf("historicalOvulationSet.has(date)");
  assert(confirmedIndex !== -1 && confirmedIndex < manualIndex && manualIndex < historicalPmsIndex && historicalPmsIndex < predictedIndex && predictedIndex < ovulationIndex, "Partner-Priorität: reale Periode > aktuelles PMS > vergangenes PMS > Vorhersage > vergangener Eisprung");
  assert(owner.includes("!currentOrEstimatedPhase && historicalPmsDates.has(date)") && owner.includes("!currentOrEstimatedPhase && date && historicalOvulationDates.has(date)"), "Owner: vergangene Phasen füllen nur Tage, die keine aktuelle/geschätzte Phase haben");
}

console.log("\n== WP-028: Partner-Gate und Datensparsamkeit ==");
{
  const partnerLib = strip(read("src/lib/new-partner-calendar.ts"));
  assert(partnerLib.indexOf("resolveActiveConnectionOwner(partnerUserId)") < partnerLib.indexOf("deriveHistoricalCalendarPhases(") && partnerLib.includes("if (!ownerUserId) return null;"), "ohne aktive Verbindung wird vor jeder Ableitung null geliefert");
  assert(!partnerLib.includes("cycle_ring_shared") && partnerLib.includes("status = 'active'"), "die aktive Verbindung bleibt der Gate");
  const lib = read("src/lib/historical-calendar-phases.ts");
  assert(/pmsDates: string\[\]/.test(lib) && /ovulationDates: string\[\]/.test(lib), "der Partner erhält nur Datumslisten (keine Symptome, IDs oder Rohdaten)");
  assert(!/predictCycle|futureCycles|nextPeriodStart/.test(strip(lib)), "keine historische Phase aus einer Zukunftsprognose");
  assert(strip(lib).includes('from "./cycle-fertility.ts"') && strip(lib).includes("calculateOvulationDate("), "der Eisprung nutzt die zentrale Regel aus cycle-fertility.ts (keine zweite Formel)");
  const partnerUi = strip(read("src/components/NewPartnerCalendar.tsx"));
  assert(!partnerUi.includes("fetch(") && !/method:\s*"(POST|PUT|PATCH|DELETE)"/.test(partnerUi), "Partnerkalender bleibt ohne Schreibzugriff");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
