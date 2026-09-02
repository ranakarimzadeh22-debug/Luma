export interface CalendarMonth {
  year: number;
  month: number;
}

export interface CalendarMonthGrid extends CalendarMonth {
  daysInMonth: number;
  leadingDays: number;
  cells: Array<number | null>;
}

export function getCalendarMonthGrid(year: number, month: number): CalendarMonthGrid {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? null : index - leadingDays + 1,
  );
  return { year, month, daysInMonth, leadingDays, cells };
}

export function shiftCalendarMonth(
  year: number,
  month: number,
  offset: number,
): CalendarMonth {
  const shifted = new Date(year, month + offset, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}
