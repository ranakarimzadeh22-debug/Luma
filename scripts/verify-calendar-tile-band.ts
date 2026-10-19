import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const ownerPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewCycleExample.tsx");
const ownerSource = readFileSync(ownerPath, "utf8");

const partnerPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCalendar.tsx");
const partnerSource = readFileSync(partnerPath, "utf8");

console.log("\n== WP-022 Korrektur V2: der Owner-Kalender nutzt ein schmales Band statt einer vollflächig gefärbten Kachel ==");
{
  assert(ownerSource.includes('import { calendarBandPosition, type CalendarBandPosition } from "@/lib/calendar-band-position";'), "NewCycleExample.tsx verwendet die gemeinsame, rein darstellende Bandpositions-Hilfe");
  assert(ownerSource.includes('relative grid h-full w-full place-items-center overflow-hidden rounded-2xl border bg-white/55'), "die Tageskachel selbst bleibt neutral (bg-white/55), keine Vollflächenfarbe mehr je nach Status");
  assert(ownerSource.includes('h-[35%] ${dayBandStyles[bandKey]}'), "die Statusfarbe liegt nur noch in einem schmalen unteren Band (35% der Kachelhöhe)");
  assert(!ownerSource.includes('storedPeriod || runningPeriod\n                ? "bg-[#6d153f] text-white"'), "die alte vollflächige Hintergrundfärbung nach Status-Priorität in der Kachel selbst wurde entfernt");
}

console.log("\n== WP-022 Korrektur V2: dieselbe Status-Priorität (bestätigt/laufend > erwartet > geplant > Phase) bestimmt weiterhin die Bandfarbe, keine neue Logik ==");
{
  const bandKeyBlockMatch = ownerSource.match(/const bandKey: DayBandKey \| null =([\s\S]*?);\s*return \{ day, date, phase/);
  const bandKeyBlock = bandKeyBlockMatch ? bandKeyBlockMatch[1] : "";
  assert(/storedPeriod \|\| runningPeriod[\s\S]*?"confirmed"/.test(bandKeyBlock), "bestätigte/laufende Periode hat weiterhin oberste Priorität für die Bandfarbe");
  assert(/expectedPeriod[\s\S]*?"expected"/.test(bandKeyBlock), "voraussichtliches Ende hat weiterhin die zweite Priorität");
  assert(/plannedPeriod[\s\S]*?"planned"/.test(bandKeyBlock), "gespeicherte Planung hat weiterhin die dritte Priorität");
  assert(/isManualPmsDay && phase === "pms"[\s\S]*?"pms-manual"/.test(bandKeyBlock), "manuell eingetragenes PMS wird weiterhin unterschieden (gleiche bestehende isWithinManualPmsSection-Ableitung)");
  assert(bandKeyBlock.length > 0, "die Bandfarben-Priorität wurde als eigener, auffindbarer Codeblock umgesetzt");
}

console.log("\n== WP-022 Korrektur V2: heute zeigt nur einen kleinen roten Kreis hinter der Tageszahl, keine rot gefärbte Vollkachel mehr ==");
{
  assert(ownerSource.includes('size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-red-600'), "der Heute-Kreis sitzt zentriert hinter der Tageszahl (size-6, zentriert via top-1/2/left-1/2 + translate)");
  assert(!ownerSource.includes('ring-2 ring-[#5d32ba] ring-offset-2'), "die bisherige lila Ring-Hervorhebung der ganzen Kachel für 'heute' wurde entfernt");
  assert(!ownerSource.includes('text-[#4c279a]">Heute</span>'), "das zusätzliche sichtbare 'Heute'-Textlabel wurde entfernt (ersetzt durch den Kreis hinter der Zahl)");
  assert(ownerSource.includes('isToday ? ", heute" : ""'), "die Information 'heute' bleibt weiterhin zugänglich über das aria-label der Tageskachel");
}

console.log("\n== WP-022 Korrektur V2: der Partner-Kalender erhält dieselbe sichtbare Bandregel wie der Owner-Kalender ==");
{
  assert(partnerSource.includes('import { calendarBandPosition } from "@/lib/calendar-band-position";'), "NewPartnerCalendar.tsx verwendet dieselbe gemeinsame Bandpositions-Hilfe");
  assert(partnerSource.includes('h-[35%] ${primaryStatusBandStyle[status]}'), "die Partner-Tageskachel zeigt die Statusfarbe ebenfalls nur als schmales unteres Band");
  assert(partnerSource.includes('rounded-xl border border-neutral-200 bg-white text-xs text-neutral-700'), "die Partner-Tageskachel selbst bleibt neutral (weiß), keine Vollflächenfarbe mehr je nach Status");
  assert(!partnerSource.includes('primaryStatusStyle[status]'), "die alte vollflächige Status-Hintergrundfarbe der Kachel wurde entfernt");
}

console.log("\n== WP-022 Korrektur V2: heute zeigt im Partner-Kalender ebenfalls nur einen kleinen roten Kreis hinter der Zahl ==");
{
  assert(partnerSource.includes('size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-red-600'), "der Heute-Kreis im Partner-Kalender sitzt zentriert hinter der Tageszahl");
  assert(partnerSource.includes('isToday ? ", heute" : ""'), "die Information 'heute' bleibt im Partner-Kalender über das aria-label zugänglich");
}

console.log("\n== WP-022 Korrektur V2: Monatswechsel, Legenden-Popover, Unsicherheitshinweis und Tagesfenster-Verhalten bleiben unverändert eingebunden ==");
{
  assert(ownerSource.includes("changeMonth(-1)") && ownerSource.includes("changeMonth(1)"), "Owner-Monatswechsel bleibt unverändert");
  assert(ownerSource.includes("CalendarLegendPopover") && ownerSource.includes("isCalendarLegendOpen"), "das Legenden-Popover bleibt unverändert eingebunden");
  assert(ownerSource.includes("Vorhersage unsicher - Kann abweichen"), "der Unsicherheitshinweis bleibt unverändert");
  assert(ownerSource.includes("setSelectedDayDetail") && ownerSource.includes("getPeriodDayActions"), "die bestehende Tagesfenster-Interaktion (DayDetailModal, Periodenaktionen) bleibt unverändert eingebunden");

  assert(partnerSource.includes("changeMonth(-1)") && partnerSource.includes("changeMonth(1)"), "Partner-Monatswechsel bleibt unverändert");
  assert(partnerSource.includes("PartnerCalendarLegendPopover"), "das Partner-Legenden-Popover bleibt unverändert eingebunden");
  assert(partnerSource.includes("Vorhersage unsicher - Kann abweichen"), "der Partner-Unsicherheitshinweis bleibt unverändert");
  assert(partnerSource.includes("setSelectedDay") && !partnerSource.includes("fetch("), "die Partneransicht bleibt vollständig rein lesend (öffnet nur ein Detail-Modal, kein Schreibzugriff)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
