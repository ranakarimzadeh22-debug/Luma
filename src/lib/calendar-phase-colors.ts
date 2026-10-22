/**
 * WP-026: single source of truth for the calendar phase colors. The owner
 * calendar, the partner calendar and both ⓘ popovers read these class strings,
 * so a legend swatch always matches its band exactly. Purely visual — no
 * status, date or prediction logic lives here.
 *
 * Filled = entered/actual information; outlined = estimate.
 */
export const calendarPhaseColors = {
  /** Tatsächliche (bestätigte/laufende) Periode: gefülltes Rosa. */
  confirmed: { fill: "bg-[#fac9d6]", text: "text-[#7a0f3c]" },
  /** Von der Nutzerin eingetragenes PMS: deutlich kräftigeres, gefülltes Rosa. */
  pmsManual: { fill: "bg-[#ee8db1]", text: "text-[#4d0826]" },
  /** Geschätzte nächste Periode: rosa Umrandung. */
  periodEstimate: { outline: "bg-[#fff7f9] border-[#e58fae]", text: "text-[#9f164f]" },
  /** Geschätztes PMS: sehr hellrosa, umrandet. */
  pmsEstimate: { outline: "bg-[#fffafc] border-[#f4cbd9]", text: "text-[#9f164f]" },
  /** Eisprung: violette Umrandung. */
  ovulation: { outline: "bg-[#faf7ff] border-[#a98ae0]", text: "text-[#5420a5]" },
  /** Gespeicherte Planung (Owner): rosa gestrichelter Umriss. */
  planned: { outline: "border-dashed border-[#e7a3bb]", text: "text-[#9f164f]" },
} as const;

/** Popover swatch for a filled band. */
export function filledSwatchClassName(fill: string): string {
  return fill;
}

/** Popover swatch for an outlined band (same border width as the band). */
export function outlineSwatchClassName(outline: string): string {
  return `border-2 ${outline}`;
}
