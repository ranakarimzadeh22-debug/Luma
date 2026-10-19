/**
 * WP-022 Korrektur Version 2: pure visual helper that maps an already-computed
 * sequence of band keys (one per calendar grid cell, already including the
 * leading `null` cells from getCalendarMonthGrid) to a within-week band
 * position. It duplicates no phase/status logic — callers pass in whatever
 * key they already derived per day (confirmed/running/expected/planned/phase
 * for the owner, the existing PrimaryDayStatus for the partner); this module
 * only looks at neighbors within the same 7-cell week row to decide whether a
 * day's band segment is the start, middle, end, or a single isolated day of a
 * run of equal keys. A week boundary or a different/missing key on either
 * side always ends the visible band, matching the Soll's "bei Wochenumbruch
 * setzt das Band in der naechsten Zeile fort" rule.
 */
export type CalendarBandPosition = "start" | "middle" | "end" | "single";

export function calendarBandPosition<T>(
  bandKeys: ReadonlyArray<T | null>,
  index: number,
): CalendarBandPosition | null {
  const key = bandKeys[index];
  if (key === null || key === undefined) return null;

  const weekStart = index - (index % 7);
  const weekEnd = weekStart + 6;

  const previousKey = index > weekStart ? bandKeys[index - 1] : undefined;
  const nextKey = index < weekEnd ? bandKeys[index + 1] : undefined;

  const continuesFromPrevious = previousKey !== undefined && previousKey !== null && previousKey === key;
  const continuesToNext = nextKey !== undefined && nextKey !== null && nextKey === key;

  if (continuesFromPrevious && continuesToNext) return "middle";
  if (continuesFromPrevious) return "end";
  if (continuesToNext) return "start";
  return "single";
}
