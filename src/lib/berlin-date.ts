/**
 * "Today" for partner push events is explicitly Europe/Berlin, independent
 * of the server process's own timezone (which may be UTC in production —
 * see the Prisma/pg timezone issue found in WP-004 v1). Uses Intl with an
 * explicit IANA zone rather than relying on TZ env vars or Date's local
 * timezone.
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
