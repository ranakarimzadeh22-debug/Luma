export interface NewPeriodInput {
  startDate: string;
  endDate: string;
}

export interface NewPeriodEntry extends NewPeriodInput {
  id: string;
}

export type NewPeriodValidationResult =
  | { ok: true; value: NewPeriodInput }
  | { ok: false; message: string };

export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidPeriodId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function todayDateOnly(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateNewPeriodInput(
  body: unknown,
  today = todayDateOnly(),
): NewPeriodValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Bitte wähle Beginn und Ende der Periode." };
  }

  const input = body as Record<string, unknown>;
  if (!isValidDateOnly(input.startDate) || !isValidDateOnly(input.endDate)) {
    return { ok: false, message: "Bitte wähle zwei gültige Kalendertage." };
  }
  if (input.startDate > input.endDate) {
    return { ok: false, message: "Der letzte Periodentag darf nicht vor dem ersten liegen." };
  }
  if (input.startDate > today || input.endDate > today) {
    return { ok: false, message: "Zukünftige Periodentage können nicht gespeichert werden." };
  }

  return { ok: true, value: { startDate: input.startDate, endDate: input.endDate } };
}

export function periodsOverlap(first: NewPeriodInput, second: NewPeriodInput): boolean {
  return first.startDate <= second.endDate && first.endDate >= second.startDate;
}
