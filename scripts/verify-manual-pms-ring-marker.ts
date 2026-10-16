import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import { buildPersonalRingGeometry, ringPointAt, type ManualPmsRingOverride } from "../src/lib/cycle-ring-geometry";
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

function manualOverrideFrom(
  periods: NewPeriodEntryOpen[],
  symptomDays: { date: string; symptoms: ("fatigue" | "breast_tenderness" | "abdominal_pain" | "mood_swings")[] }[],
  today: string,
): ManualPmsRingOverride | null {
  const section = deriveManualPmsSection(periods, symptomDays, today, null);
  if (!isWithinManualPmsSection(section, today, periods, today)) return null;
  return { startDate: section!.startDate, endDate: section!.endDate };
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

console.log("\n== WP-014: ohne heutigen manuellen PMS-Status bleiben Segmentgrenzen und Punktposition unverändert ==");
{
  // 2026-09-23 liegt im berechneten PMS-Fenster (23.-27.09.) der Schätzung,
  // aber es existiert keine manuelle Symptommarkierung -> keine Übersteuerung.
  const today = "2026-09-23";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.status, "personal", "vier echte Perioden ergeben eine persönliche Ansicht");
  assertEqual(view.todayPhase, "pms", "der 23.09. liegt bereits laut Schätzung im PMS-Fenster");

  const override = manualOverrideFrom(periods, [], today);
  assertEqual(override, null, "ohne Symptommarkierung ist heute kein manueller PMS-Status aktiv");

  const geometryWithoutOverride = buildPersonalRingGeometry(view, today, override);
  const geometryDefaultParam = buildPersonalRingGeometry(view, today);
  assertEqual(
    geometryWithoutOverride,
    geometryDefaultParam,
    "die Ringgeometrie ist identisch, ob manualPmsOverride explizit null oder weggelassen wird",
  );

  const pmsSegment = geometryWithoutOverride?.segments.find((segment) => segment.key === "pms");
  assert(Boolean(pmsSegment), "das PMS-Segment wird weiterhin gezeichnet");
}

console.log("\n== WP-014 Korrektur Version 3: ein manueller PMS-Start erweitert das Segment bis zum manuellen Start ==");
{
  // 2026-09-15 liegt NICHT im berechneten PMS-Fenster der Schätzung
  // (23.-27.09.), zeigt also ohne Markierung keine PMS-Phase. Symptome an
  // mehreren Tagen (15.-18.09., heute = 18.09.) eröffnen einen manuellen
  // Abschnitt, der deutlich vor dem rechnerischen pmsStart (23.09.) beginnt.
  const today = "2026-09-18";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.todayPhase, null, "der 18.09. liegt ohne Markierung außerhalb jeder geschätzten Phase");

  const symptomDays = [
    { date: "2026-09-15", symptoms: ["fatigue" as const] },
    { date: "2026-09-16", symptoms: ["fatigue" as const] },
    { date: "2026-09-17", symptoms: ["fatigue" as const] },
    { date: today, symptoms: ["fatigue" as const] },
  ];
  const override = manualOverrideFrom(periods, symptomDays, today);
  assert(override !== null, "eine mehrtägige Symptommarkierung setzt einen aktiven manuellen PMS-Status");
  assertEqual(override!.startDate, "2026-09-15", "der manuelle Abschnitt beginnt am ersten markierten Tag");

  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };
  const geometry = buildPersonalRingGeometry(displayedView, today, override);
  assert(geometry !== null, "die Ringgeometrie wird weiterhin berechnet");

  const geometryWithoutOverride = buildPersonalRingGeometry(displayedView, today, null)!;
  const pmsSegment = geometry!.segments.find((segment) => segment.key === "pms")!;
  const pmsSegmentWithoutOverride = geometryWithoutOverride.segments.find((segment) => segment.key === "pms")!;

  // Das pinke Segment muss sich sichtbar verändern (länger werden), weil es
  // jetzt am manuellen Start (15.09.) statt am rechnerischen pmsStart
  // (23.09.) beginnt — der eigentliche, vom Owner geforderte Effekt dieser
  // Korrektur.
  assert(
    pmsSegment.path !== pmsSegmentWithoutOverride.path,
    "das PMS-Segment ändert seinen gezeichneten Pfad, wenn ein manueller Abschnitt aktiv ist",
  );
  assert(
    pmsSegment.labelAngle !== pmsSegmentWithoutOverride.labelAngle,
    "die Segmentmitte (und damit die Label-Position) verschiebt sich durch den früheren manuellen Start",
  );

  // Andere Segmente (Periode, fruchtbares Fenster) dürfen von der
  // PMS-Übersteuerung nicht berührt werden.
  const periodSegment = geometry!.segments.find((segment) => segment.key === "period")!;
  const periodSegmentWithoutOverride = geometryWithoutOverride.segments.find((segment) => segment.key === "period")!;
  assertEqual(periodSegment.path, periodSegmentWithoutOverride.path, "das Periodensegment bleibt unverändert");
  const fertileSegment = geometry!.segments.find((segment) => segment.key === "fertile")!;
  const fertileSegmentWithoutOverride = geometryWithoutOverride.segments.find((segment) => segment.key === "fertile")!;
  assertEqual(fertileSegment.path, fertileSegmentWithoutOverride.path, "das fruchtbare Fenster bleibt unverändert");

  // Der Marker-Winkel muss innerhalb des (jetzt erweiterten) PMS-Segments
  // liegen, darf aber nicht der Segmentmitte entsprechen, da dort das
  // "PMS"-Textlabel positioniert ist und sonst überdeckt würde.
  const markerPoint = ringPointAt(geometry!.todayAngle);
  const labelPoint = ringPointAt(pmsSegment.labelAngle);
  const pixelDistanceToLabel = Math.hypot(markerPoint.x - labelPoint.x, markerPoint.y - labelPoint.y);
  assert(
    geometry!.todayAngle !== pmsSegment.labelAngle,
    "der Marker-Winkel entspricht NICHT der Mitte des (erweiterten) PMS-Segments (dort sitzt das Textlabel)",
  );
  assert(
    pixelDistanceToLabel >= 20,
    `der Marker-Punkt hat ausreichend Abstand (>=20px) zum "PMS"-Textlabel, gemessen: ${pixelDistanceToLabel.toFixed(1)}px`,
  );
  assert(Number.isFinite(markerPoint.x) && Number.isFinite(markerPoint.y), "der Marker-Punkt lässt sich aus dem übersteuerten Winkel berechnen");
}

console.log("\n== WP-014 Korrektur Version 3: auch ein sehr kurzer (eintägiger) manueller Abschnitt bleibt lesbar ==");
{
  // Grenzfall: Symptom erst heute markiert -> der Abschnitt ist nur ein
  // einziger Tag lang (resolveSectionEndDate ohne Vorhersage = today). Ein
  // so schmales Segment kann physikalisch keinen 20px-Abstand zur Mitte
  // erreichen, ohne über den Segmentrand hinauszuragen — der Marker muss
  // trotzdem innerhalb des Segments bleiben und darf nie exakt auf dem Label
  // landen.
  const today = "2026-09-15";
  const view = computePersonalCycleView(periods, profile, today);
  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const override = manualOverrideFrom(periods, symptomDays, today);
  assert(override !== null, "eine einzelne heutige Symptommarkierung setzt einen aktiven manuellen PMS-Status");
  assertEqual(override, { startDate: today, endDate: today }, "der manuelle Abschnitt umfasst nur den heutigen Tag");

  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };
  const geometry = buildPersonalRingGeometry(displayedView, today, override)!;
  const pmsSegment = geometry.segments.find((segment) => segment.key === "pms")!;

  assert(
    geometry.todayAngle !== pmsSegment.labelAngle,
    "der Marker-Winkel entspricht auch bei einem eintägigen Segment NICHT der Mitte (dort sitzt das Textlabel)",
  );
  const markerPoint = ringPointAt(geometry.todayAngle);
  const labelPoint = ringPointAt(pmsSegment.labelAngle);
  const pixelDistanceToLabel = Math.hypot(markerPoint.x - labelPoint.x, markerPoint.y - labelPoint.y);
  assert(
    pixelDistanceToLabel > 0,
    `der Marker-Punkt hat einen messbaren Abstand zum Label, auch im eintägigen Grenzfall, gemessen: ${pixelDistanceToLabel.toFixed(1)}px`,
  );
}

console.log("\n== WP-014: ein echter Periodentag hat weiterhin Vorrang, kein manueller PMS-Abschnitt wird erzwungen ==");
{
  // Heute liegt mitten in der zuletzt gespeicherten, echten Periode.
  const today = "2026-08-30";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.todayPhase, "period", "ein echter, bestätigter Periodentag zeigt weiterhin die Periode");

  // Selbst wenn (versehentlich oder bewusst) ein Symptom an diesem Tag
  // gespeichert wäre, darf daraus niemals ein aktiver manueller PMS-Status
  // werden — isWithinManualPmsSection schließt echte Periodentage immer aus.
  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const override = manualOverrideFrom(periods, symptomDays, today);
  assertEqual(override, null, "ein echter Periodentag erlaubt nie einen aktiven manuellen PMS-Status, auch mit einer Symptommarkierung an diesem Tag");

  const geometry = buildPersonalRingGeometry(view, today, override);
  assertEqual(
    geometry,
    buildPersonalRingGeometry(view, today, null),
    "da kein manueller Abschnitt aktiv ist, bleibt die Ringgeometrie (inkl. Periodentag-Marker) unverändert",
  );
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
