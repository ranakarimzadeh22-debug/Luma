export type NewCycleRegularity = "regular" | "irregular" | "unknown";

export interface NewCycleProfileInput {
  lastPeriodStart: string | null;
  bleedingDurationDays: number | null;
  cycleLengthDays: number | null;
  regularity: NewCycleRegularity;
}

type ValidationResult =
  | { ok: true; value: NewCycleProfileInput }
  | { ok: false; message: string };

function nullableInteger(value: unknown, maximum: number): number | null | undefined {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > maximum) {
    return undefined;
  }
  return value;
}

function validDate(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return undefined;
  if (value > new Date().toISOString().slice(0, 10)) return undefined;
  return value;
}

export function validateNewCycleProfileInput(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Bitte beantworte alle vier Fragen." };
  }

  const input = body as Record<string, unknown>;
  const lastPeriodStart = validDate(input.lastPeriodStart);
  const bleedingDurationDays = nullableInteger(input.bleedingDurationDays, 366);
  const cycleLengthDays = nullableInteger(input.cycleLengthDays, 730);
  const regularity = input.regularity;

  if (lastPeriodStart === undefined) {
    return { ok: false, message: "Bitte wähle ein gültiges Datum oder „Ich weiß es nicht“." };
  }
  if (bleedingDurationDays === undefined) {
    return { ok: false, message: "Bitte gib gültige Blutungstage an oder wähle „Ich weiß es nicht“." };
  }
  if (cycleLengthDays === undefined) {
    return { ok: false, message: "Bitte gib gültige Zyklustage an oder wähle „Ich weiß es nicht“." };
  }
  if (regularity !== "regular" && regularity !== "irregular" && regularity !== "unknown") {
    return { ok: false, message: "Bitte wähle eine Antwort zur Regelmäßigkeit." };
  }

  return {
    ok: true,
    value: { lastPeriodStart, bleedingDurationDays, cycleLengthDays, regularity },
  };
}
