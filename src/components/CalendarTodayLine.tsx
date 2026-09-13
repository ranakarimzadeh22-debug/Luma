import { formatHeuteLine } from "@/lib/berlin-date";

interface CalendarTodayLineProps {
  today: string;
}

/**
 * Shared "Heute · [Wochentag], [Datum]" line for the owner and partner
 * calendars (WP-004 Version 8). A small red dot echoes the same today-marker
 * shown on the calendar grid itself, so the heading and the grid can never
 * silently disagree on which day is "today".
 */
export default function CalendarTodayLine({ today }: CalendarTodayLineProps) {
  return (
    <p className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-700">
      <span className="inline-block size-2.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
      {formatHeuteLine(today)}
    </p>
  );
}
