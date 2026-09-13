import type { NewPeriodEntryOpen } from "@/lib/new-period-validation";

/** Pure date-string arithmetic (Date.UTC) to avoid timezone shift, matching the pattern used across src/lib/*-prediction.ts and calendar-day-info.ts. */
export function shiftDateByOneDay(date: string, direction: 1 | -1): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + direction);
  return result.toISOString().slice(0, 10);
}

export interface PeriodDayActions {
  /** Neuer tatsächlicher Beginn an diesem Tag ist möglich (kein bestehender Eintrag deckt diesen Tag bereits als bestätigt/laufend ab). */
  canBegin: boolean;
  /** Der Tag liegt in einer laufenden Periode (ohne echtes Ende); "Periode beendet" darf hier das echte Ende setzen. */
  runningEntryToEnd: NewPeriodEntryOpen | null;
  /**
   * "Periodentag löschen" ist nur am ersten oder letzten bestätigten Tag
   * eines Eintrags möglich (Randkürzung); bei genau einem einzelnen Tag
   * bedeutet das Kürzen die vollständige Löschung des Eintrags.
   */
  deletableEdge: { entry: NewPeriodEntryOpen; edge: "start" | "end"; isSingleDay: boolean } | null;
}

/**
 * Derives which actual-day actions are safe to offer for a tapped date,
 * strictly from the account's own already-loaded period entries — never a
 * guess. Ambiguous cases (a date matched by more than one entry as a
 * deletable edge, which should be structurally impossible given the
 * overlap guard in src/lib/new-periods.ts) resolve to no deletable edge at
 * all rather than picking one arbitrarily, per WP-003 Version 8's stop
 * condition against guessing a foreign/ambiguous entry.
 */
export function getPeriodDayActions(
  date: string,
  today: string,
  periods: NewPeriodEntryOpen[],
): PeriodDayActions {
  if (date > today) {
    return { canBegin: false, runningEntryToEnd: null, deletableEdge: null };
  }

  const coveringEntry = periods.find(
    (entry) =>
      entry.startDate <= date &&
      ((entry.endDate !== null && date <= entry.endDate) || (entry.endDate === null && date <= today)),
  );

  const runningEntryToEnd =
    coveringEntry && coveringEntry.endDate === null && coveringEntry.startDate <= date ? coveringEntry : null;

  const edgeMatches = periods.filter(
    (entry) =>
      (entry.endDate !== null && (date === entry.startDate || date === entry.endDate)) ||
      (entry.endDate === null && date === entry.startDate),
  );

  let deletableEdge: PeriodDayActions["deletableEdge"] = null;
  if (edgeMatches.length === 1) {
    const entry = edgeMatches[0];
    const isSingleDay = entry.endDate !== null ? entry.startDate === entry.endDate : entry.startDate === today;
    const edge: "start" | "end" = date === entry.startDate ? "start" : "end";
    deletableEdge = { entry, edge, isSingleDay };
  }

  return {
    canBegin: !coveringEntry,
    runningEntryToEnd,
    deletableEdge,
  };
}
