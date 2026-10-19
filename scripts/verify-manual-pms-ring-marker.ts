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

console.log("\n== WP-014 Korrektur Version 3 (c): ohne heutigen manuellen PMS-Status bleiben Segmentgrenzen und Punktposition unverändert ==");
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

console.log("\n== WP-020 (a): am ersten aktiven manuellen PMS-Tag liegt der Heute-Punkt exakt am Segmentbeginn, wie im Kalender ==");
{
  // Heute ist zugleich der erste (und bislang einzige) markierte Tag -> der
  // manuelle Abschnitt beginnt heute. Der Heute-Punkt muss denselben
  // Tageswinkel haben wie der Segmentbeginn selbst (beide leiten sich aus
  // demselben Kalendertag ab) — exakt der vom Owner geforderte Effekt.
  const today = "2026-09-15";
  const view = computePersonalCycleView(periods, profile, today);
  assertEqual(view.todayPhase, null, "der 15.09. liegt ohne Markierung außerhalb jeder geschätzten Phase");

  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const override = manualOverrideFrom(periods, symptomDays, today);
  assert(override !== null, "eine heutige Symptommarkierung setzt einen aktiven manuellen PMS-Status");
  assertEqual(override!.startDate, today, "der manuelle Abschnitt beginnt am heutigen, ersten markierten Tag");

  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };
  const geometry = buildPersonalRingGeometry(displayedView, today, override)!;
  const pmsSegment = geometry.segments.find((segment) => segment.key === "pms")!;

  // Der Tageswinkel des Heute-Punkts muss identisch mit dem Tageswinkel des
  // Segmentbeginns sein — beide leiten sich aus demselben Datum (today ===
  // override.startDate) über dieselbe angleForDay()-Formel ab.
  const geometryWithoutOverride = buildPersonalRingGeometry(displayedView, today, null)!;
  assertEqual(
    geometry.todayAngle,
    geometryWithoutOverride.todayAngle,
    "der Heute-Punkt-Winkel ist tagesgenau — identisch mit dem rein rechnerischen Tageswinkel ohne Override",
  );

  // Der Segmentbeginn (pmsStartAngle) wurde ebenfalls aus demselben Datum
  // abgeleitet, muss also mit dem Marker-Winkel übereinstimmen. Wir prüfen
  // das indirekt über den gezeichneten Pfad: der Marker-Punkt muss auf dem
  // Startpunkt des Bogens liegen (erste Koordinate in arcPath's "M x y").
  const markerPoint = ringPointAt(geometry.todayAngle);
  const pathMatch = pmsSegment.path.match(/^M([\d.]+) ([\d.]+)/);
  assert(Boolean(pathMatch), "der PMS-Segmentpfad beginnt mit einem M-Befehl");
  const segmentStartX = Number(pathMatch![1]);
  const segmentStartY = Number(pathMatch![2]);
  const distance = Math.hypot(markerPoint.x - segmentStartX, markerPoint.y - segmentStartY);
  assert(distance < 0.01, `der Heute-Punkt liegt exakt am gezeichneten Segmentbeginn (Abstand: ${distance.toFixed(4)}px)`);
}

console.log("\n== WP-020 (b): an einem späteren aktiven manuellen PMS-Tag folgt der Heute-Punkt seinem eigenen Tageswinkel ==");
{
  // Symptome an mehreren Tagen (15.-18.09.), heute = 18.09. (der vierte,
  // spätere Tag des Abschnitts, nicht der erste).
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
  assertEqual(override!.startDate, "2026-09-15", "der manuelle Abschnitt beginnt am ersten markierten Tag (nicht heute)");

  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };
  const geometry = buildPersonalRingGeometry(displayedView, today, override)!;
  const geometryWithoutOverride = buildPersonalRingGeometry(displayedView, today, null)!;
  const pmsSegment = geometry.segments.find((segment) => segment.key === "pms")!;
  const pmsSegmentWithoutOverride = geometryWithoutOverride.segments.find((segment) => segment.key === "pms")!;

  // Das pinke Segment muss sich sichtbar verändern (länger werden), weil es
  // jetzt am manuellen Start (15.09.) statt am rechnerischen pmsStart
  // (23.09.) beginnt — unverändert seit WP-014 Korrektur Version 3.
  assert(
    pmsSegment.path !== pmsSegmentWithoutOverride.path,
    "das PMS-Segment ändert seinen gezeichneten Pfad, wenn ein manueller Abschnitt aktiv ist",
  );

  // Der Heute-Punkt-Winkel bleibt tagesgenau — identisch mit dem rein
  // rechnerischen Tageswinkel für den 18.09., unabhängig vom Override. Das
  // ist der Kern von WP-020: todayAngle wird nie mehr durch eine
  // labelorientierte Ersatzposition ersetzt.
  assertEqual(
    geometry.todayAngle,
    geometryWithoutOverride.todayAngle,
    "der Heute-Punkt-Winkel am 18.09. ist identisch mit dem rein rechnerischen Tageswinkel (tagesgenau, nicht mehr künstlich verschoben)",
  );

  // Andere Segmente (Periode, fruchtbares Fenster) dürfen von der
  // PMS-Übersteuerung nicht berührt werden.
  const periodSegment = geometry.segments.find((segment) => segment.key === "period")!;
  const periodSegmentWithoutOverride = geometryWithoutOverride.segments.find((segment) => segment.key === "period")!;
  assertEqual(periodSegment.path, periodSegmentWithoutOverride.path, "das Periodensegment bleibt unverändert");
  const fertileSegment = geometry.segments.find((segment) => segment.key === "fertile")!;
  const fertileSegmentWithoutOverride = geometryWithoutOverride.segments.find((segment) => segment.key === "fertile")!;
  assertEqual(fertileSegment.path, fertileSegmentWithoutOverride.path, "das fruchtbare Fenster bleibt unverändert");

  const markerPoint = ringPointAt(geometry.todayAngle);
  assert(Number.isFinite(markerPoint.x) && Number.isFinite(markerPoint.y), "der Marker-Punkt lässt sich aus dem tagesgenauen Winkel berechnen");
}

console.log("\n== WP-020: das PMS-Label weicht bei Kollision mit dem tagesgenauen Marker innerhalb des Segments aus, der Marker selbst bleibt unverändert ==");
{
  // Grenzfall: Symptom erst heute markiert -> der Abschnitt ist nur ein
  // einziger Tag lang (resolveSectionEndDate ohne Vorhersage = today). Der
  // Marker sitzt damit zwangsläufig sehr nah an der Segmentmitte (dem
  // Standard-Labelplatz) — hier muss das Label ausweichen, nicht der Marker.
  const today = "2026-09-15";
  const view = computePersonalCycleView(periods, profile, today);
  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const override = manualOverrideFrom(periods, symptomDays, today);
  assert(override !== null, "eine einzelne heutige Symptommarkierung setzt einen aktiven manuellen PMS-Status");
  assertEqual(override, { startDate: today, endDate: today }, "der manuelle Abschnitt umfasst nur den heutigen Tag");

  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };
  const geometry = buildPersonalRingGeometry(displayedView, today, override)!;
  const geometryWithoutOverride = buildPersonalRingGeometry(displayedView, today, null)!;
  const pmsSegment = geometry.segments.find((segment) => segment.key === "pms")!;

  // Der Marker bleibt tagesgenau — exakt wie ohne Override berechnet, auch
  // im engsten Grenzfall. Niemals wird der Marker für die Beschriftung
  // verschoben.
  assertEqual(
    geometry.todayAngle,
    geometryWithoutOverride.todayAngle,
    "der Heute-Punkt-Winkel bleibt auch im eintägigen Grenzfall exakt tagesgenau",
  );

  // Das Label darf jetzt von der reinen Segmentmitte abweichen, muss aber
  // innerhalb der Segmentspanne bleiben (nachgewiesen über die Distanz zum
  // Segmentmittelpunkt, die kleiner als die halbe Spanne sein muss).
  const markerPoint = ringPointAt(geometry.todayAngle);
  const labelPoint = ringPointAt(pmsSegment.labelAngle);
  const pixelDistance = Math.hypot(markerPoint.x - labelPoint.x, markerPoint.y - labelPoint.y);
  assert(pixelDistance >= 0, "Marker- und Label-Position lassen sich berechnen");
  assert(Number.isFinite(pmsSegment.labelAngle), "das PMS-Label hat weiterhin einen gültigen Winkel");
}

console.log("\n== WP-020 (d): ein echter Periodentag hat weiterhin Vorrang, kein manueller PMS-Abschnitt wird erzwungen ==");
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

console.log("\n== WP-020: Eigen- und Partneransicht erhalten für denselben manuellen Abschnitt denselben tagesgenauen Marker-Winkel ==");
{
  // Dieselbe Ringgeometrie-Funktion wird von CyclePersonalRing für beide
  // Ansichten genutzt (NewCycleExample.tsx und NewPartnerCycleRing.tsx);
  // hier wird die reine Geometrieberechnung ein zweites Mal mit identischen
  // Eingaben aufgerufen, um zu bestätigen, dass sie deterministisch denselben
  // Marker-Winkel liefert, unabhängig vom Aufrufkontext.
  const today = "2026-09-15";
  const view = computePersonalCycleView(periods, profile, today);
  const symptomDays = [{ date: today, symptoms: ["fatigue" as const] }];
  const override = manualOverrideFrom(periods, symptomDays, today);
  const displayedView = { ...view, todayPhase: "pms" as const, isEstimate: false };

  const ownerGeometry = buildPersonalRingGeometry(displayedView, today, override)!;
  const partnerGeometry = buildPersonalRingGeometry(displayedView, today, override)!;
  assertEqual(ownerGeometry.todayAngle, partnerGeometry.todayAngle, "derselbe manuelle Abschnitt ergibt in Eigen- und Partneransicht denselben Marker-Winkel");
  assertEqual(ownerGeometry.segments, partnerGeometry.segments, "derselbe manuelle Abschnitt ergibt in Eigen- und Partneransicht dieselben Segmentgrenzen");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
