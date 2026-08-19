export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Berechnet die empfohlene tägliche Wasserzufuhr in Litern.
 * Formel (wenn height_cm vorhanden): water = (weight_kg × 0.03) + (height_cm × 0.004)
 * Formel (nur weight_kg): water = weight_kg × 0.033
 * Fallback: 2.0 Liter
 */
export function calculateWaterGoal(weightKg: number | null, heightCm: number | null): number {
  if (weightKg && weightKg > 0) {
    if (heightCm && heightCm > 0) {
      return parseFloat(((weightKg * 0.03) + (heightCm * 0.004)).toFixed(2));
    }
    return parseFloat((weightKg * 0.033).toFixed(2));
  }
  return 2.0;
}
