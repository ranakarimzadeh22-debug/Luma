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

console.log("\n== WP-022 Korrektur V4: der Owner-Kalender zeigt ein breites, zentriertes Pillen-Band statt eines schmalen unteren Streifens oder einer vollflächig gefärbten Kachel ==");
{
  assert(ownerSource.includes('import { calendarBandPosition, type CalendarBandPosition } from "@/lib/calendar-band-position";'), "NewCycleExample.tsx verwendet die gemeinsame, rein darstellende Bandpositions-Hilfe");
  assert(ownerSource.includes('relative z-10 grid h-full w-full place-items-center rounded-2xl border bg-transparent text-sm text-[#281c24] sm:text-base'), "die Tageskachel selbst ist transparent (kein eigener Hintergrund), damit das Band dahinter sichtbar durchscheint");
  assert(!ownerSource.includes("overflow-hidden"), "die Kachel beschneidet das Band nicht mehr (overflow-hidden entfernt), damit es über den Kachelrand hinaus in den Gap reichen kann");
  assert(ownerSource.includes('top-1/2 h-[62%] -translate-y-1/2') && ownerSource.includes('${bandEdgeInsetClassName} ${dayBandStyles[bandKey]}'), "das Band ist vertikal zentriert, deutlich breiter (62% der Kachelhöhe) und reicht über die Kachelkante hinaus in den Rasterzwischenraum");
  assert(!ownerSource.includes('storedPeriod || runningPeriod\n                ? "bg-[#6d153f] text-white"'), "die alte vollflächige Hintergrundfärbung nach Status-Priorität in der Kachel selbst wurde entfernt");
  assert(ownerSource.includes("pointer-events-none"), "das Band blockiert keine Klicks auf die darüberliegende Kachel");
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

console.log("\n== WP-022 Korrektur V4: der Partner-Kalender erhält dieselbe breite Pillen-Bandregel wie der Owner-Kalender ==");
{
  assert(partnerSource.includes('import { calendarBandPosition } from "@/lib/calendar-band-position";'), "NewPartnerCalendar.tsx verwendet dieselbe gemeinsame Bandpositions-Hilfe");
  assert(!partnerSource.includes("overflow-hidden"), "die Partner-Kachel beschneidet das Band nicht mehr, damit es über den Kachelrand hinaus reichen kann");
  assert(partnerSource.includes('top-1/2 h-[62%] -translate-y-1/2') && partnerSource.includes('${bandEdgeInsetClassName} ${primaryStatusBandStyle[status]}'), "das Partner-Band ist ebenfalls vertikal zentriert, breiter (62%) und reicht in den Rasterzwischenraum");
  assert(partnerSource.includes('relative z-10 grid h-full w-full place-items-center rounded-xl border bg-transparent text-xs text-neutral-700 sm:text-sm'), "die Partner-Tageskachel ist transparent, keine Vollflächenfarbe mehr je nach Status");
  assert(!partnerSource.includes('primaryStatusStyle[status]'), "die alte vollflächige Status-Hintergrundfarbe der Kachel wurde entfernt");
}

console.log("\n== WP-022 Korrektur V3/V4: heute zeigt im Partner-Kalender ausschließlich einen kleinen roten Kreis hinter der Zahl, kein äußerer Rahmen mehr ==");
{
  assert(partnerSource.includes('size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-red-600'), "der Heute-Kreis im Partner-Kalender sitzt zentriert hinter der Tageszahl");
  // Nur der tatsächliche Tailwind-Klassenausdruck zählt hier (nicht der
  // erklärende Quelltextkommentar, der denselben Begriff zur Dokumentation
  // der Änderung nennt) — daher gezielt nach dem className-Ausdruck suchen.
  // Seit Korrektur V5 ein Template-Literal (bedingter Rand), daher auf
  // className={` statt className=" geprüft.
  const buttonClassNameMatch = partnerSource.match(/className=\{`relative z-10 grid[\s\S]*?`\}/);
  assert(Boolean(buttonClassNameMatch) && !buttonClassNameMatch![0].includes("ring-2"), "der äußere Heute-Rahmen (ring-2 ring-offset-1) um die gesamte Partner-Kachel wurde aus der tatsächlichen className entfernt (Korrektur V3, bestätigt in V4)");
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

console.log("\n== WP-022 Korrektur V4: aufeinanderfolgende gleiche Phasentage verbinden sich ohne Lücke; nur Start und Ende eines Abschnitts sind abgerundet ==");
{
  assert(ownerSource.includes('"rounded-l-full rounded-r-none"'), "Owner: ein Start-Tag ist nur links gerundet, rechts eckig (verbindet sich nahtlos mit dem Folgetag)");
  assert(ownerSource.includes('"rounded-r-full rounded-l-none"'), "Owner: ein End-Tag ist nur rechts gerundet, links eckig (verbindet sich nahtlos mit dem Vortag)");
  assert(ownerSource.includes(': "rounded-none";'), "Owner: ein Mitte-Tag ('middle') ist komplett eckig, verschmilzt also sichtbar mit beiden Nachbarn");

  assert(partnerSource.includes('"rounded-l-full rounded-r-none"'), "Partner: ein Start-Tag ist nur links gerundet, rechts eckig");
  assert(partnerSource.includes('"rounded-r-full rounded-l-none"'), "Partner: ein End-Tag ist nur rechts gerundet, links eckig");
  assert(partnerSource.includes(': "rounded-none";'), "Partner: ein Mitte-Tag ist komplett eckig");
}

console.log("\n== WP-022 Korrektur V4: die Tageszahl und die Klickfläche bleiben über dem breiten Band klar bedienbar ==");
{
  assert(ownerSource.includes('<span className="relative z-10">'), "Owner: die Tageszahl liegt in einem eigenen, höher geschichteten Element über dem Band");
  assert(partnerSource.includes("z-10"), "Partner: die Kachel (inkl. Zahl, Klickfläche) liegt über dem Band (z-10)");
}

console.log("\n== WP-022 Korrektur V5: Tage mit einem sichtbaren Phasenband erhalten keinen eigenen Kachelrand mehr (keine Trennlinie innerhalb eines mehrtägigen Bandes) ==");
{
  const ownerDayClassNameMatch = ownerSource.match(/const dayClassName = `relative z-10 grid[\s\S]*?`;/);
  const ownerDayClassNameBlock = ownerDayClassNameMatch ? ownerDayClassNameMatch[0] : "";
  assert(ownerDayClassNameBlock.length > 0, "Owner: der dayClassName-Ausdruck wurde im Quelltext gefunden");
  assert(/bandKey\s*\?\s*"border-transparent"/.test(ownerDayClassNameBlock), "Owner: ein Tag mit bandKey (sichtbares Band) erhält 'border-transparent' statt des bisherigen sichtbaren Rands");
  assert(ownerDayClassNameBlock.includes('"border-white/90 shadow-[0_3px_8px_rgba(91,31,62,0.18)]"'), "Owner: ein neutraler, nicht-zukünftiger Tag (kein Band) behält weiterhin seinen bestehenden sichtbaren Rand und Schatten");
  assert(ownerDayClassNameBlock.includes('"border-dashed border-[#d8afbd] opacity-70 shadow-none"'), "Owner: ein neutraler zukünftiger Tag behält weiterhin seinen bestehenden gestrichelten Rand");

  const partnerButtonClassNameMatch = partnerSource.match(/className=\{`relative z-10 grid[\s\S]*?`\}/);
  const partnerButtonClassNameBlock = partnerButtonClassNameMatch ? partnerButtonClassNameMatch[0] : "";
  assert(partnerButtonClassNameBlock.length > 0, "Partner: der className-Ausdruck der Tageskachel wurde im Quelltext gefunden");
  assert(/status === "none"\s*\?\s*"border-neutral-200"\s*:\s*"border-transparent"/.test(partnerButtonClassNameBlock), "Partner: ein Tag mit Status (sichtbares Band) erhält 'border-transparent', ein neutraler Tag ('none') behält 'border-neutral-200'");
}

console.log("\n== WP-022 Korrektur V5: die breite Pillenform, Rundungen, Tageszahlen, Heute-Kreis und Zyklus-Kreis bleiben unverändert ==");
{
  assert(ownerSource.includes('top-1/2 h-[62%] -translate-y-1/2'), "Owner: das Band bleibt unverändert 62% hoch und vertikal zentriert");
  assert(partnerSource.includes('top-1/2 h-[62%] -translate-y-1/2'), "Partner: das Band bleibt unverändert 62% hoch und vertikal zentriert");
  assert(ownerSource.includes('"rounded-l-full rounded-r-none"') && ownerSource.includes('"rounded-r-full rounded-l-none"'), "Owner: die Start-/End-Rundungen bleiben unverändert");
  assert(partnerSource.includes('"rounded-l-full rounded-r-none"') && partnerSource.includes('"rounded-r-full rounded-l-none"'), "Partner: die Start-/End-Rundungen bleiben unverändert");
  assert(ownerSource.includes('size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-red-600'), "Owner: der Heute-Kreis bleibt unverändert");
  assert(partnerSource.includes('size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-red-600'), "Partner: der Heute-Kreis bleibt unverändert");

  const ringPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "CyclePersonalRing.tsx");
  const ringSource = readFileSync(ringPath, "utf8");
  assert(!ringSource.includes("dayOfMonth") && ringSource.includes('r="6"'), "der Zyklus-Kreis bleibt unverändert (kein Kalendertagstext, ursprünglicher kleiner Marker)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
