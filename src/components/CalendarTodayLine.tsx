import { formatHeuteLine } from "@/lib/berlin-date";

interface CalendarTodayLineProps {
  today: string;
  /**
   * WP-016 Korrektur Version 2: purely visual, mobile-only compacting for
   * the owner's own /neu page. Defaults to false so the partner calendar
   * (NewPartnerCalendar.tsx never passes this) stays byte-identical to
   * before, at every width.
   */
  compact?: boolean;
}

/**
 * Shared "Heute · [Wochentag], [Datum]" line for the owner and partner
 * calendars (WP-004 Version 8). A small red dot echoes the same today-marker
 * shown on the calendar grid itself, so the heading and the grid can never
 * silently disagree on which day is "today".
 */
export default function CalendarTodayLine({ today, compact = false }: CalendarTodayLineProps) {
  return (
    <p className={`flex items-center justify-center gap-2 font-medium text-neutral-700 ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
      <span className="inline-block size-2.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
      {formatHeuteLine(today)}
    </p>
  );
}
