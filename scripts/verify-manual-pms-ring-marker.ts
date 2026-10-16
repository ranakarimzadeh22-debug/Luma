import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import { buildPersonalRingGeometry, ringPointAt } from "../src/lib/cycle-ring-geometry";
import { deriveManualPmsSection, isWithinManualPmsSection } from "../src/lib/manual-pms";
import type { NewPeriodEntryOpen } from "../src/lib/new-period-validation";

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function period(id: string, startDate: string, endDate: string | null): NewPeriodEntryOpen {
  return { id, startDate, endDate, expectedEndDate: null };
}

// Vier echte, abgeschlossene Perioden im stabilen 28-Tage-Rhythmus, damit
// computePersonalCycleView() eine echte "personal"-Ansicht liefert (WP-002
// verlangt mindestens vier bestätigte Starts für eine persönliche Aussage).
const periods: NewPeriodEntryOpen[] = [
  period("a", "2026-06-05", "2026-06-09"),
  period("b", "2026-07-03", "2026-07-07"),
  period("c", "2026-07-31", "2026-08-04"),
  period("d", "2026-08-28", "2026-09-01"),
];
const profile = { cycleLengthDays: 28 };

console.log("\n== WP-014: ohne heutigen manuellen PMS-Status bleibt die bisherige Punktposition unverändert ==");
{
  // 2026-09-23 liegt im berechneten PMS-Fenster (23.-27.09.) der Schätzung,
  // aber es existiert keine manuelle Symptommarkierung -> keine Übersteuerung.
  const today = "2026-09-23";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.status, "personal", "vier echte Perioden ergeben eine persönliche Ansicht");
  assertEqual(view.todayPhase, "pms", "der 23.09. liegt bereits laut Schätzung im PMS-Fenster");

  const section = deriveManualPmsSection(periods, [], today, null);
  const isManualPmsToday = isWithinManualPmsSection(section, today, periods, today);
  assertEqual(isManualPmsToday, false, "ohne Symptommarkierung ist heute kein manueller PMS-Status aktiv");

  const geometryWithoutOverride = buildPersonalRingGeometry(view, today, isManualPmsToday);
  const geometryDefaultParam = buildPersonalRingGeometry(view, today);
  assertEqual(
    geometryWithoutOverride?.todayAngle,
    geometryDefaultParam?.todayAngle,
    "der Marker-Winkel ist identisch, ob isManualPmsToday explizit false oder weggelassen wird",
  );

  // Rechnerische Referenzposition: ohne Übersteuerung entspricht der Winkel
  // weiterhin dem tatsächlichen Zyklustag, nicht der Segmentmitte.
  const pmsSegment = geometryWithoutOverride?.segments.find((segment) => segment.key === "pms");
  assert(Boolean(pmsSegment), "das PMS-Segment wird weiterhin gezeichnet");
}

console.log("\n== WP-014: mit einem heute aktiven manuellen PMS-Status liegt der Marker im PMS-Segment ==");
{
  // 2026-09-15 liegt NICHT im berechneten PMS-Fenster der Schätzung
  // (23.-27.09.), zeigt also ohne Markierung keine PMS-Phase.
  const today = "2026-09-15";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.todayPhase, null, "der 15.09. liegt ohne Markierung außerhalb jeder geschätzten Phase");

  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const section = deriveManualPmsSection(periods, symptomDays, today, null);
  const isManualPmsToday = isWithinManualPmsSection(section, today, periods, today);
  assertEqual(isManualPmsToday, true, "eine heutige Symptommarkierung setzt einen aktiven manuellen PMS-Status");

  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };
  const geometry = buildPersonalRingGeometry(displayedView, today, isManualPmsToday);
  assert(geometry !== null, "die Ringgeometrie wird weiterhin berechnet");

  const pmsSegment = geometry!.segments.find((segment) => segment.key === "pms")!;
  assert(Boolean(pmsSegment), "das PMS-Segment existiert");

  // Der Marker-Winkel muss exakt der (bereits für die Beschriftung
  // genutzten) PMS-Segmentmitte entsprechen.
  assertEqual(geometry!.todayAngle, pmsSegment.labelAngle, "der Marker-Winkel entspricht der Mitte des PMS-Segments");

  const markerPoint = ringPointAt(geometry!.todayAngle);
  assert(Number.isFinite(markerPoint.x) && Number.isFinite(markerPoint.y), "der Marker-Punkt lässt sich aus dem übersteuerten Winkel berechnen");

  // Ohne Übersteuerung läge der Marker rechnerisch bei Zyklustag-Winkel; mit
  // Übersteuerung muss er sich sichtbar davon unterscheiden (das ist der
  // eigentliche, vom Auftrag geforderte Effekt).
  const geometryWithoutOverride = buildPersonalRingGeometry(displayedView, today, false);
  assert(
    geometry!.todayAngle !== geometryWithoutOverride!.todayAngle,
    "der Marker-Winkel mit aktivem manuellem PMS unterscheidet sich sichtbar von der rein rechnerischen Position",
  );
}

console.log("\n== WP-014: ein echter Periodentag hat weiterhin Vorrang, kein manueller PMS-Punkt wird erzwungen ==");
{
  // Heute liegt mitten in der zuletzt gespeicherten, echten Periode.
  const today = "2026-08-30";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.todayPhase, "period", "ein echter, bestätigter Periodentag zeigt weiterhin die Periode");

  // Selbst wenn (versehentlich oder bewusst) ein Symptom an diesem Tag
  // gespeichert wäre, darf daraus niemals ein aktiver manueller PMS-Status
  // werden — isWithinManualPmsSection schließt echte Periodentage immer aus.
  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const section = deriveManualPmsSection(periods, symptomDays, today, null);
  const isManualPmsToday = isWithinManualPmsSection(section, today, periods, today);
  assertEqual(isManualPmsToday, false, "ein echter Periodentag erlaubt nie einen aktiven manuellen PMS-Status, auch mit einer Symptommarkierung an diesem Tag");

  const geometry = buildPersonalRingGeometry(view, today, isManualPmsToday);
  assertEqual(
    geometry!.todayAngle,
    buildPersonalRingGeometry(view, today, false)!.todayAngle,
    "da isManualPmsToday hier false ist, bleibt die rechnerische Periodentag-Position des Markers erhalten",
  );
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
