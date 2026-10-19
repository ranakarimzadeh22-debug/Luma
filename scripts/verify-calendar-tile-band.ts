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
  assert(ownerSource.includes('import { calendarBandBorderClassName, calendarBandPosition, type CalendarBandPosition } from "@/lib/calendar-band-position";'), "NewCycleExample.tsx verwendet die gemeinsame, rein darstellende Bandpositions-Hilfe");
  assert(ownerSource.includes('relative z-10 grid h-full w-full place-items-center rounded-2xl border bg-transparent text-sm sm:text-base'), "die Tageskachel selbst ist transparent (kein eigener Hintergrund), damit das Band dahinter sichtbar durchscheint");
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
  assert(partnerSource.includes('import { calendarBandBorderClassName, calendarBandPosition } from "@/lib/calendar-band-position";'), "NewPartnerCalendar.tsx verwendet dieselbe gemeinsame Bandpositions-Hilfe");
  assert(!partnerSource.includes("overflow-hidden"), "die Partner-Kachel beschneidet das Band nicht mehr, damit es über den Kachelrand hinaus reichen kann");
  assert(partnerSource.includes('top-1/2 h-[62%] -translate-y-1/2') && partnerSource.includes('${bandEdgeInsetClassName} ${primaryStatusBandStyle[bandKey]}'), "das Partner-Band ist ebenfalls vertikal zentriert, breiter (62%) und reicht in den Rasterzwischenraum");
  assert(partnerSource.includes('relative z-10 grid h-full w-full place-items-center rounded-xl border bg-transparent text-xs sm:text-sm'), "die Partner-Tageskachel ist transparent, keine Vollflächenfarbe mehr je nach Status");
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
  assert(/bandKey\s*\?\s*`border-transparent \$\{dayBandTextStyles\[bandKey\]\}`/.test(ownerDayClassNameBlock), "Owner: ein Tag mit bandKey (sichtbares Band) erhält 'border-transparent' statt des bisherigen sichtbaren Rands");
  assert(ownerDayClassNameBlock.includes('"border-transparent text-[#281c24]"'), "Owner: ein neutraler, nicht-zukünftiger Tag hat weder sichtbaren Rand noch Schatten (V8)");
  assert(ownerDayClassNameBlock.includes('"border-transparent text-[#281c24] opacity-70"'), "Owner: ein neutraler zukünftiger Tag hat keinen sichtbaren Rand, bleibt aber gedämpft (V8)");

  const partnerButtonClassNameMatch = partnerSource.match(/className=\{`relative z-10 grid[\s\S]*?`\}/);
  const partnerButtonClassNameBlock = partnerButtonClassNameMatch ? partnerButtonClassNameMatch[0] : "";
  assert(partnerButtonClassNameBlock.length > 0, "Partner: der className-Ausdruck der Tageskachel wurde im Quelltext gefunden");
  assert(partnerButtonClassNameBlock.includes("bandKey ? `border-transparent ${primaryStatusBandTextStyle[bandKey]}` : \"border-transparent text-neutral-700\""), "Partner: Bandtage und neutrale Tage haben keinen sichtbaren Kachelrand (V8)");
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

console.log("\n== WP-022 Korrektur V6: Tageszahl und Kurzmarker bleiben auf den Bändern lesbar ==");
{
  assert(ownerSource.includes('isToday ? "relative text-white" : "relative"') && partnerSource.includes('isToday ? "relative text-white" : "relative"'), "Owner und Partner: die Heute-Zahl im roten Kreis ist weiss und lesbar");
  assert(!ownerSource.includes("bg-transparent text-sm text-[#281c24]"),"Owner: keine feste dunkle Schriftfarbe mehr auf Bandtagen");
}

console.log("\n== WP-022 Korrektur V8: ruhige Pastellbänder (gefüllt / hohl / gestrichelt), keine Bordeaux-Bänder, keine Kachelschatten ==");
{
  const ownerStyles = ownerSource.match(/const dayBandStyles: Record<DayBandKey, string> = \{[\s\S]*?\};/)?.[0] ?? "";
  const partnerStyles = partnerSource.match(/const primaryStatusBandStyle: Record<PartnerBandKey, string> = \{[\s\S]*?\};/)?.[0] ?? "";
  const lineFor = (block: string, key: string) => block.split("\n").find((line) => line.trim().startsWith(key)) ?? "";
  assert(ownerStyles.length > 0 && partnerStyles.length > 0, "Owner und Partner haben die Band-Stiltabellen");
  for (const key of ["confirmed:", '"pms-manual":']) {
    assert(!lineFor(ownerStyles, key).includes("border-") && !lineFor(partnerStyles, key).includes("border-"), `${key} ist in beiden Kalendern ein gefülltes Pastellband ohne Umriss`);
  }
  for (const key of ["expected:", "period:", "pms:", "ovulation:", "fertile:"]) {
    assert(lineFor(ownerStyles, key).includes("border-[#") , `Owner ${key} ist ein hohles Umrissband`);
  }
  for (const key of ["period:", "pms:", "ovulation:", "fertile:"]) {
    assert(lineFor(partnerStyles, key).includes("border-[#"), `Partner ${key} ist ein hohles Umrissband`);
  }
  assert(lineFor(ownerStyles, "planned:").includes("border-dashed") && lineFor(ownerStyles, "planned:").includes("border-[#e7a3bb]"), "Owner: gespeicherte Planung ist ein rosa gestrichelter Umriss");
  assert(!/#6d153f|#4a0738|neutral-900/.test(ownerStyles + partnerStyles), "keine dunklen Bordeaux-/Schwarz-Bänder mehr im Kalender");
  assert(!/text-white/.test((ownerSource.match(/const dayBandTextStyles[\s\S]*?\};/)?.[0] ?? "") + (partnerSource.match(/const primaryStatusBandTextStyle[\s\S]*?\};/)?.[0] ?? "")), "Zahlen und Kurzmarker nutzen auf den hellen Bändern dunkle Schrift");
  assert(ownerSource.includes("filledBandKeys.includes(bandKey) ? \"\" : calendarBandBorderClassName(bandPosition)") && partnerSource.includes("filledBandKeys.includes(bandKey) ? \"\" : calendarBandBorderClassName(bandPosition)"), "nur hohle Bänder erhalten Umrandung, ihre Seitenkanten laufen über die Bandposition (nahtlos)");
  assert(!ownerSource.includes("shadow-[0_3px_8px_rgba(91,31,62,0.18)]"), "neutrale Owner-Tage haben keinen Kachelschatten mehr");
  assert(!partnerSource.includes('"border-neutral-200'), "neutrale Partner-Tage haben keinen Kachelrahmen mehr");
  assert(ownerSource.includes('{ label: "Periode", swatchClassName: "bg-[#fac9d6]" }') && ownerSource.includes("border-2 border-[#c4b0ee] bg-[#faf7ff]"), "Owner-Popover nutzt die neuen gefüllten/umrissenen Pastellpunkte");
  assert(partnerSource.includes('rounded-full bg-[#fac9d6]" aria-hidden') && partnerSource.includes("border-2 border-[#eeaabf] bg-[#fff7f9]"), "Partner-Popover nutzt die neuen gefüllten/umrissenen Pastellpunkte");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
