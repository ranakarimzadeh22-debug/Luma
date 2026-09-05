interface NewPeriodInput {
  startDate: string;
  endDate: string;
}

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function currentDateOnly(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type NewPeriodPlanValidationResult =
  | { ok: true; value: NewPeriodInput }
  | { ok: false; message: string };

export function validateNewPeriodPlanInput(
  body: unknown,
  today = currentDateOnly(),
): NewPeriodPlanValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Bitte wähle Beginn und Ende der Planung." };
  }

  const input = body as Record<string, unknown>;
  if (!isValidDateOnly(input.startDate) || !isValidDateOnly(input.endDate)) {
    return { ok: false, message: "Bitte wähle zwei gültige Kalendertage." };
  }
  if (input.startDate > input.endDate) {
    return { ok: false, message: "Das geplante Ende darf nicht vor dem Beginn liegen." };
  }
  if (input.endDate <= today) {
    return { ok: false, message: "Vergangene Zeiträume müssen als tatsächliche Periode gespeichert werden." };
  }

  return { ok: true, value: { startDate: input.startDate, endDate: input.endDate } };
}
