import { readFileSync } from "node:fs";
import { calendarPhaseColors, filledSwatchClassName, outlineSwatchClassName } from "../src/lib/calendar-phase-colors";
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
  assert(ownerSource.includes("Vorhersage unsicher – Kann abweichen") && !ownerSource.includes("Vorhersage unsicher - Kann abweichen"), "der Unsicherheitshinweis steht seit WP-025 nur noch im Popover");
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
  assert(!/border-neutral-200|border-dashed|shadow-/.test(partnerButtonClassNameBlock) && (partnerButtonClassNameBlock.match(/border-transparent/g) ?? []).length >= 2, "Partner: Bandtage, Schätzungstage und neutrale Tage haben keinen sichtbaren Kachelrand (V8)");
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

console.log("\n== WP-026: klare Farbsemantik, Legende exakt passend, kein Fruchtbarkeitsband ==");
{
  const hexOf = (classes: string, prefix: string) => classes.match(new RegExp(`${prefix}-\\[(#[0-9a-fA-F]{6})\\]`))?.[1] ?? "";
  const lum = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
  const c = calendarPhaseColors;

  assert(!c.confirmed.fill.includes("border-") && !c.pmsManual.fill.includes("border-"), "tatsächliche Periode und eigenes PMS sind gefüllt (ohne Umrandung)");
  for (const [name, outline] of [["geschätzte Periode", c.periodEstimate.outline], ["geschätztes PMS", c.pmsEstimate.outline], ["Eisprung", c.ovulation.outline]] as const) {
    assert(outline.includes("border-[#") && outline.includes("bg-[#"), `${name} ist ein umrandetes, hell gefülltes Band`);
  }
  const confirmedFill = hexOf(c.confirmed.fill, "bg");
  const manualFill = hexOf(c.pmsManual.fill, "bg");
  assert(lum(manualFill) < lum(confirmedFill) && ratio(manualFill, confirmedFill) >= 1.4, `eigenes PMS ist deutlich kräftiger als die Periodenfüllung (Kontrast ${ratio(manualFill, confirmedFill).toFixed(2)})`);
  const pmsEstBorder = hexOf(c.pmsEstimate.outline, "border");
  const pmsEstBg = hexOf(c.pmsEstimate.outline, "bg");
  assert(lum(pmsEstBorder) > 0.55 && lum(pmsEstBg) > 0.9, "geschätztes PMS ist sehr hellrosa (heller Rand, fast weißer Innenraum)");
  assert(ratio(manualFill, pmsEstBg) > 2.2, `eigenes PMS und geschätztes PMS sind klar unterscheidbar (Kontrast ${ratio(manualFill, pmsEstBg).toFixed(2)})`);
  const periodBorder = hexOf(c.periodEstimate.outline, "border");
  assert(lum(periodBorder) < lum(pmsEstBorder), "die Periodenumrandung ist kräftiger als die PMS-Prognose-Umrandung");
  const ovulationBorder = hexOf(c.ovulation.outline, "border");
  const [or, , ob] = [1, 3, 5].map((i) => parseInt(ovulationBorder.slice(i, i + 2), 16));
  assert(ob > or && ob > 200, "Eisprung-Umrandung ist violett");
  for (const [name, bg, text] of [
    ["tatsächliche Periode", confirmedFill, hexOf(c.confirmed.text, "text")],
    ["eigenes PMS", manualFill, hexOf(c.pmsManual.text, "text")],
    ["geschätzte Periode", hexOf(c.periodEstimate.outline, "bg"), hexOf(c.periodEstimate.text, "text")],
    ["geschätztes PMS", pmsEstBg, hexOf(c.pmsEstimate.text, "text")],
    ["Eisprung", hexOf(c.ovulation.outline, "bg"), hexOf(c.ovulation.text, "text")],
  ] as const) {
    assert(ratio(bg, text) >= 4.5, `Tageszahl auf ${name} ist lesbar (Kontrast ${ratio(bg, text).toFixed(2)})`);
  }

  assert(ownerSource.includes("calendarPhaseColors") && partnerSource.includes("calendarPhaseColors"), "Owner- und Partnerkalender lesen dieselbe Farbquelle");
  assert(!/fertile/.test(ownerSource.match(/type DayBandKey[^\n]*/)?.[0] ?? "") && !/"fertile"/.test(partnerSource.match(/type PartnerBandKey[^\n]*/)?.[0] ?? ""), "kein eigener Band-Schlüssel für das Fruchtbarkeitsfenster mehr");
  assert(!ownerSource.includes('? "fertile"') && !partnerSource.includes('"fertile"'), "kein Fruchtbarkeitsband im Raster (Owner und Partner)");
  assert(ownerSource.includes("isFertileDay") && ownerSource.includes("mögliches fruchtbares Zeitfenster, kann abweichen") && partnerSource.includes("isFertile") && partnerSource.includes("mögliches fruchtbares Zeitfenster, kann abweichen"), "Fruchtbarkeits-Berechnung und Tages-ARIA bleiben erhalten");
  assert(!ownerSource.includes("isEstimatedPeriod") && !partnerSource.includes('status === "period" && !isToday'), "geschätzte Periode nutzt nur noch die rosa Umrandung (kein lila Zahlenhintergrund)");
  assert(ownerSource.includes("period: calendarPhaseColors.periodEstimate.outline") && partnerSource.includes("period: calendarPhaseColors.periodEstimate.outline"), "geschätzte nächste Periode hat in beiden Kalendern wieder ihr rosa Umrissband");

  const band = (src: string, key: string) => src.match(new RegExp(`${key}: calendarPhaseColors\\.(\\w+)\\.`))?.[1] ?? "";
  assert(band(ownerSource, '"pms-manual"') === "pmsManual" && band(partnerSource, '"pms-manual"') === "pmsManual", "Band und Legende für eigenes PMS nutzen dieselbe Farbe 'pmsManual'");
  assert(band(ownerSource, "pms") === "pmsEstimate" && band(partnerSource, "pms") === "pmsEstimate", "Band für geschätztes PMS nutzt 'pmsEstimate'");
  assert(ownerSource.includes("filledSwatchClassName(calendarPhaseColors.confirmed.fill)") && ownerSource.includes("filledSwatchClassName(calendarPhaseColors.pmsManual.fill)") && ownerSource.includes("outlineSwatchClassName(calendarPhaseColors.periodEstimate.outline)") && ownerSource.includes("outlineSwatchClassName(calendarPhaseColors.pmsEstimate.outline)"), "Owner-Popover: alle vier Farbpunkte stammen aus derselben Farbquelle wie die Bänder");
  assert(partnerSource.includes("filledSwatchClassName(calendarPhaseColors.confirmed.fill)") && partnerSource.includes("filledSwatchClassName(calendarPhaseColors.pmsManual.fill)") && partnerSource.includes("outlineSwatchClassName(calendarPhaseColors.periodEstimate.outline)") && partnerSource.includes("outlineSwatchClassName(calendarPhaseColors.pmsEstimate.outline)"), "Partner-Popover: alle vier Farbpunkte stammen aus derselben Farbquelle wie die Bänder");
  assert(filledSwatchClassName(c.confirmed.fill) === c.confirmed.fill && outlineSwatchClassName(c.ovulation.outline) === `border-2 ${c.ovulation.outline}`, "Swatch-Helfer geben Füllung bzw. Umriss unverändert (gleiche Randbreite wie das Band) weiter");
  assert(ownerSource.includes("filledBandKeys.includes(bandKey)") && partnerSource.includes("filledBandKeys.includes(bandKey)"), "nur hohle Bänder erhalten die Umrandung (nahtlos über calendarBandBorderClassName)");
  assert(!/#6d153f|#4a0738|neutral-900|text-white/.test(c.confirmed.fill + c.pmsManual.fill), "keine dunklen Bordeaux-/Schwarz-Füllungen");
  assert(!ownerSource.includes("shadow-[0_3px_8px_rgba(91,31,62,0.18)]") && !partnerSource.includes('"border-neutral-200'), "neutrale Tage bleiben ohne Kachelschatten und -rahmen");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
