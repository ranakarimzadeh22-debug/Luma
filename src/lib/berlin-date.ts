/**
 * "Heute" for the cycle calendars is explicitly Europe/Berlin, independent
 * of the server process's own timezone (the production container has no TZ
 * set and defaults to UTC). Uses Intl with an explicit IANA zone rather than
 * relying on TZ env vars or Date's local timezone, so the calendar's
 * "Heute"-Zeile, the red today-marker, and any date-string comparison agree
 * on the same calendar day even right around midnight.
 *
 * No "server-only" import here on purpose: the same day boundary must also
 * be used by client components (NewCycleExample.tsx) so a user's own device
 * clock never disagrees with the server-derived partner view.
 */
export function todayBerlinDateOnly(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

const WEEKDAY_LABELS_DE: Record<string, string> = {
  Monday: "Montag",
  Tuesday: "Dienstag",
  Wednesday: "Mittwoch",
  Thursday: "Donnerstag",
  Friday: "Freitag",
  Saturday: "Samstag",
  Sunday: "Sonntag",
};

/**
 * "Heute · [Wochentag], [Datum]" in German, for the given date-only string
 * ("YYYY-MM-DD"). Formats the calendar day itself, not "now" — so it stays
 * correct even if called slightly after the Berlin day boundary already
 * moved on.
 */
export function formatHeuteLine(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekdayEnglish = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date);
  const weekday = WEEKDAY_LABELS_DE[weekdayEnglish] ?? weekdayEnglish;
  const formattedDate = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return `Heute · ${weekday}, ${formattedDate}`;
}
