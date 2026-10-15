// @ts-expect-error TS5097: noEmit is used; Node's native test runner requires
// the .ts suffix on this relative import, since @/ path aliases don't
// resolve there.
import { isValidDateOnly, todayDateOnly } from "./new-period-validation.ts";

export const PMS_SYMPTOMS = ["breast_tenderness", "abdominal_pain", "fatigue", "mood_swings"] as const;

export type PmsSymptom = (typeof PMS_SYMPTOMS)[number];

export function isValidPmsSymptom(value: unknown): value is PmsSymptom {
  return typeof value === "string" && (PMS_SYMPTOMS as readonly string[]).includes(value);
}

export interface PmsSymptomDayInput {
  date: string;
  symptoms: PmsSymptom[];
}

export type PmsSymptomDayValidationResult =
  | { ok: true; value: PmsSymptomDayInput }
  | { ok: false; message: string };

/**
 * Validates a day's full PMS symptom selection. `symptoms` may be an empty
 * array, meaning "remove all markers for this day" — that is a valid,
 * meaningful request, not an error.
 */
export function validatePmsSymptomDayInput(
  body: unknown,
  today = todayDateOnly(),
): PmsSymptomDayValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Bitte wähle einen Tag und deine Symptome." };
  }

  const input = body as Record<string, unknown>;
  if (!isValidDateOnly(input.date)) {
    return { ok: false, message: "Bitte wähle einen gültigen Kalendertag." };
  }
  if (input.date > today) {
    return { ok: false, message: "Für einen zukünftigen Tag können keine Symptome gespeichert werden." };
  }

  if (!Array.isArray(input.symptoms)) {
    return { ok: false, message: "Bitte wähle eine gültige Auswahl an Symptomen." };
  }
  const symptoms = input.symptoms;
  if (!symptoms.every(isValidPmsSymptom)) {
    return { ok: false, message: "Mindestens ein ausgewähltes Symptom ist nicht gültig." };
  }
  const unique = Array.from(new Set(symptoms));

  return { ok: true, value: { date: input.date, symptoms: unique } };
}
