import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calendarPhaseColors, filledSwatchClassName, legendBandSampleClassName, outlineSwatchClassName } from "../src/lib/calendar-phase-colors";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const strip = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const body = (source: string, start: string, end: string) => {
  const i = source.indexOf(start);
  const j = source.indexOf(end, i + start.length);
  return i !== -1 && j !== -1 ? source.slice(i, j) : "";
};

const owner = strip(read("src/components/NewCycleExample.tsx"));
const partner = strip(read("src/components/NewPartnerCalendar.tsx"));
const ownerLegend = body(owner, "const calendarLegendGroups", "interface CalendarLegendPopoverProps") + body(owner, "function CalendarLegendPopover(", "interface NewCycleExampleProps");
const partnerLegend = body(partner, "function PartnerCalendarLegendPopover(", "interface DayDetailModalProps");

console.log("\n== WP-029: Bandproben statt runder Punkte ==");
{
  assert(/h-\d+(\.\d+)?\s/.test(legendBandSampleClassName + " ") && /w-\d+/.test(legendBandSampleClassName) && legendBandSampleClassName.includes("rounded-full"), "die Probenform ist eine abgerundete Pille (Höhe und Breite gesetzt)");
  const h = Number(legendBandSampleClassName.match(/h-([\d.]+)/)?.[1]);
  const w = Number(legendBandSampleClassName.match(/w-([\d.]+)/)?.[1]);
  assert(w > h * 2, `die Probe ist deutlich breiter als hoch (w-${w} / h-${h}) – horizontale Bandform`);
  assert(!/size-3\b[^"`]*rounded-full|rounded-full[^"`]*size-3\b/.test(ownerLegend) && !/size-3\b[^"`]*rounded-full|rounded-full[^"`]*size-3\b/.test(partnerLegend), "keine runden size-3-Punktmuster mehr in beiden Popovern");
  assert(!/size-\d/.test(ownerLegend) && !/size-\d/.test(partnerLegend), "keine quadratischen size-*-Muster in den Popovern");
  const ownerSamples = (ownerLegend.match(/\$\{legendBandSampleClassName\}/g) ?? []).length;
  const partnerSamples = (partnerLegend.match(/\$\{legendBandSampleClassName\}/g) ?? []).length;
  assert(ownerSamples === 1 && partnerSamples === 3, "Owner rendert alle Zeilen über eine Bandprobe, Partner über seine drei Probenstellen");
}

console.log("\n== WP-029: jede Zeile nutzt die bestehende Farbquelle ==");
{
  const c = calendarPhaseColors;
  assert(ownerLegend.includes("filledSwatchClassName(calendarPhaseColors.confirmed.fill)") && ownerLegend.includes('"Periode (tatsächlich)"'), "Owner: Periode (tatsächlich) = gefüllte Periodenfarbe");
  assert(ownerLegend.includes("filledSwatchClassName(calendarPhaseColors.pmsManual.fill)") && ownerLegend.includes('"PMS von dir eingetragen"'), "Owner: PMS von dir eingetragen = kräftige PMS-Füllung");
  assert(ownerLegend.includes("outlineSwatchClassName(calendarPhaseColors.periodEstimate.outline)") && ownerLegend.includes('"Nächste Periode"'), "Owner: Nächste Periode = rosa Umriss");
  assert(ownerLegend.includes("outlineSwatchClassName(calendarPhaseColors.pmsEstimate.outline)") && ownerLegend.includes('"PMS-Phase"'), "Owner: PMS-Phase = zartrosa Umriss");
  assert(partnerLegend.includes("filledSwatchClassName(calendarPhaseColors.confirmed.fill)") && partnerLegend.includes("Periode bestätigt"), "Partner: Periode bestätigt = gefüllte Periodenfarbe");
  assert(partnerLegend.includes("filledSwatchClassName(calendarPhaseColors.pmsManual.fill)") && partnerLegend.includes("PMS eingetragen"), "Partner: PMS eingetragen = kräftige PMS-Füllung");
  assert(partnerLegend.includes("outlineSwatchClassName(calendarPhaseColors.periodEstimate.outline)") && partnerLegend.includes('"Nächste Periode"'), "Partner: Nächste Periode = rosa Umriss");
  assert(partnerLegend.includes("outlineSwatchClassName(calendarPhaseColors.pmsEstimate.outline)") && partnerLegend.includes('"PMS-Phase"'), "Partner: PMS-Phase = zartrosa Umriss");
  assert(ownerLegend.includes('label: "Eisprung", swatchClassName: outlineSwatchClassName(calendarPhaseColors.ovulation.outline)') && owner.includes("ovulation: calendarPhaseColors.ovulation.outline"), "Owner: Eisprung-Probe = violette Umrissfarbe des Eisprungbands im Kalender");
  assert(partnerLegend.includes('label: "Eisprung", swatchClassName: outlineSwatchClassName(calendarPhaseColors.ovulation.outline)') && partner.includes("ovulation: calendarPhaseColors.ovulation.outline"), "Partner: Eisprung-Probe = violette Umrissfarbe des Eisprungbands im Kalender");
  // The band in the calendar uses exactly the same strings as the legend sample.
  assert(owner.includes("confirmed: calendarPhaseColors.confirmed.fill") && owner.includes('"pms-manual": calendarPhaseColors.pmsManual.fill') && owner.includes("period: calendarPhaseColors.periodEstimate.outline") && owner.includes("pms: calendarPhaseColors.pmsEstimate.outline"), "Owner-Kalenderbänder nutzen dieselben Farbquellen wie die Proben");
  assert(partner.includes("confirmed: calendarPhaseColors.confirmed.fill") && partner.includes('"pms-manual": calendarPhaseColors.pmsManual.fill') && partner.includes("period: calendarPhaseColors.periodEstimate.outline") && partner.includes("pms: calendarPhaseColors.pmsEstimate.outline"), "Partner-Kalenderbänder nutzen dieselben Farbquellen wie die Proben");
  assert(filledSwatchClassName(c.confirmed.fill) === c.confirmed.fill && outlineSwatchClassName(c.pmsEstimate.outline) === `border-2 ${c.pmsEstimate.outline}`, "Füllung unverändert, Umriss mit derselben border-2 wie die Bänder");
}

console.log("\n== WP-029: Farbwerte, Texte, Zeilen und Verhalten unverändert ==");
{
  const c = calendarPhaseColors;
  assert(c.confirmed.fill === "bg-[#fac9d6]" && c.pmsManual.fill === "bg-[#ee8db1]", "gefüllte Farbwerte unverändert");
  assert(c.periodEstimate.outline === "bg-[#fff7f9] border-[#e58fae]" && c.pmsEstimate.outline === "bg-[#fffafc] border-[#f4cbd9]" && c.ovulation.outline === "bg-[#faf7ff] border-[#a98ae0]", "Umrissfarbwerte unverändert");
  assert((ownerLegend.match(/label: "/g) ?? []).length === 5, "Owner: vier Zeilen aus WP-025 V2 plus die Eisprung-Zeile (WP-029 Korrektur)");
  assert(partnerLegend.includes("hasManualPmsSection &&") && partnerLegend.includes("hasAnyPrediction") && partnerLegend.includes('aria-label="Eingetragen"') && partnerLegend.includes('aria-label="Geschätzt"'), "Partner: Gruppen und Sichtbarkeitsbedingungen unverändert");
  assert(ownerLegend.includes('event.key === "Escape"') && partnerLegend.includes('event.key === "Escape"') && ownerLegend.includes("mousedown") && partnerLegend.includes("mousedown"), "Escape und Außenklick unverändert");
  assert(ownerLegend.includes('aria-hidden="true"') && partnerLegend.includes('aria-hidden="true"'), "Proben bleiben dekorativ (aria-hidden), die Texte tragen die Bedeutung");
  assert(!partner.includes("fetch(") && !/method:\s*"(POST|PUT|PATCH|DELETE)"/.test(partner), "Partner bleibt rein lesend");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
