import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import { buildPersonalRingGeometry, ringPointAt } from "../src/lib/cycle-ring-geometry";
import type { NewPeriodEntry } from "../src/lib/new-period-validation";

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

function period(id: string, startDate: string, endDate: string): NewPeriodEntry {
  return { id, startDate, endDate };
}

// ---------------------------------------------------------------------------
// Reine Berechnungs-Unit-Tests
// ---------------------------------------------------------------------------

console.log("\n== kein persönlicher Kreis aus dem Default ==");
{
  // Ein einzelner Periodeneintrag ohne Profil darf niemals einen 28-Tage-
  // Default als persönliche Aussage liefern.
  const view = computePersonalCycleView([period("1", "2026-08-01", "2026-08-05")], null, "2026-09-01");
  assertEqual(view.status, "no_data", "einzelne Periode ohne Profil bleibt no_data");
  assertEqual(view.cycleLengthDays, null, "keine Zykluslänge ohne Datenbasis");
}

console.log("\n== neutral ohne Daten ==");
{
  const view = computePersonalCycleView([], null, "2026-09-01");
  assertEqual(view.status, "no_data", "keine Perioden, kein Profil -> no_data");
  assertEqual(view.todayPhase, null, "keine Phase ohne Daten");
  assertEqual(view.cycleLengthDays, null, "keine Länge ohne Daten");
}

console.log("\n== Profil-Orientierung klar unsicher ==");
{
  const view = computePersonalCycleView(
    [period("1", "2026-08-01", "2026-08-05")],
    { cycleLengthDays: 30 },
    "2026-09-01",
  );
  assertEqual(view.status, "profile_estimate", "eine Periode + Profil -> profile_estimate");
  assert(view.isEstimate === true, "Profil-Orientierung ist als Schätzung markiert (isEstimate)");
}

console.log("\n== Median erst ab vier Periodenanfängen ==");
{
  const threePeriods = [
    period("1", "2026-06-01", "2026-06-05"),
    period("2", "2026-06-29", "2026-07-03"),
    period("3", "2026-07-27", "2026-07-31"),
  ];
  const withThree = computePersonalCycleView(threePeriods, null, "2026-08-20");
  assertEqual(withThree.status, "no_data", "drei echte Perioden ohne Profil -> weiterhin no_data (kein Median)");

  const fourPeriods = [...threePeriods, period("4", "2026-08-24", "2026-08-28")];
  const withFour = computePersonalCycleView(fourPeriods, null, "2026-09-01");
  assertEqual(withFour.status, "personal", "vier echte Perioden -> personal");
  assertEqual(withFour.cycleLengthDays, 28, "Median aus vier Perioden ist 28 Tage");
}

console.log("\n== Median mit variierenden echten Abständen ==");
{
  // Abstände 28, 30, 26 Tage -> Median = 28
  const periods = [
    period("1", "2026-04-01", "2026-04-05"),
    period("2", "2026-04-29", "2026-05-03"), // +28
    period("3", "2026-05-29", "2026-06-02"), // +30
    period("4", "2026-06-24", "2026-06-28"), // +26
  ];
  const view = computePersonalCycleView(periods, null, "2026-07-01");
  assertEqual(view.status, "personal", "vier Perioden mit variierenden Abständen -> personal");
  assertEqual(view.cycleLengthDays, 28, "Median aus [28, 30, 26] ist 28");
}

console.log("\n== bestätigte Periodentage haben Vorrang ==");
{
  const periods = [
    period("1", "2026-06-01", "2026-06-05"),
    period("2", "2026-06-29", "2026-07-03"),
    period("3", "2026-07-27", "2026-07-31"),
    period("4", "2026-08-24", "2026-08-30"), // reicht bis 30.08., länger als der Zyklus-Median vermuten ließe
  ];
  const view = computePersonalCycleView(periods, null, "2026-08-29");
  assertEqual(view.todayPhase, "period", "Tag innerhalb eines bestätigten Eintrags ist immer 'period'");
  assert(view.isEstimate === false, "bestätigter Periodentag ist keine Schätzung");
}

// ---------------------------------------------------------------------------
// Phasen-Unit-Tests
// ---------------------------------------------------------------------------

console.log("\n== dreitägige mögliche Eisprungphase ==");
{
  // Zyklusstart 2026-08-01, Länge 28 (Median-Abstände 28/28/31) -> geschätzter Eisprung
  // = addDays(periodStart, cycleLengthDays - 14) = addDays(2026-08-01, 14) = 2026-08-15
  // Fenster (Tag -1 bis +1 = 3 Tage): 2026-08-14 bis 2026-08-16
  const periods = [
    period("1", "2026-05-06", "2026-05-10"),
    period("2", "2026-06-03", "2026-06-07"),
    period("3", "2026-07-01", "2026-07-05"),
    period("4", "2026-08-01", "2026-08-05"),
  ];
  const dayBefore = computePersonalCycleView(periods, null, "2026-08-13");
  const start = computePersonalCycleView(periods, null, "2026-08-14");
  const mid = computePersonalCycleView(periods, null, "2026-08-15");
  const end = computePersonalCycleView(periods, null, "2026-08-16");
  const dayAfter = computePersonalCycleView(periods, null, "2026-08-17");

  assertEqual(dayBefore.todayPhase, null, "Tag vor dem Eisprungfenster ist keine Eisprungphase");
  assertEqual(start.todayPhase, "ovulation", "erster Tag des dreitägigen Eisprungfensters");
  assertEqual(mid.todayPhase, "ovulation", "mittlerer Tag des Eisprungfensters (geschätzter Eisprung)");
  assertEqual(end.todayPhase, "ovulation", "letzter Tag des dreitägigen Eisprungfensters");
  assertEqual(dayAfter.todayPhase, null, "Tag nach dem Eisprungfenster ist keine Eisprungphase");
}

console.log("\n== fünf PMS-Tage ==");
{
  // Nächster Periodenstart (aus Sicht des laufenden Zyklus) = 2026-08-29 (Zyklus 28 Tage ab 2026-08-01)
  // PMS = letzte 5 Tage davor: 2026-08-24 bis 2026-08-28
  const periods = [
    period("1", "2026-05-06", "2026-05-10"),
    period("2", "2026-06-03", "2026-06-07"),
    period("3", "2026-07-01", "2026-07-05"),
    period("4", "2026-08-01", "2026-08-05"),
  ];
  const dayBefore = computePersonalCycleView(periods, null, "2026-08-23");
  const pmsDays = ["2026-08-24", "2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28"].map((date) =>
    computePersonalCycleView(periods, null, date),
  );

  assertEqual(dayBefore.todayPhase, null, "Tag vor dem PMS-Fenster ist keine PMS-Phase");
  assert(
    pmsDays.every((view) => view.todayPhase === "pms"),
    "alle fünf PMS-Tage werden korrekt als PMS erkannt",
  );
}

console.log("\n== 'Kann abweichen' für geschätzte Phasen ==");
{
  const view = computePersonalCycleView(
    [period("1", "2026-08-01", "2026-08-05")],
    { cycleLengthDays: 28 },
    "2026-08-14",
  );
  assertEqual(view.status, "profile_estimate", "Profil-basierte Vorhersage bleibt als Schätzung markiert");
  assert(view.isEstimate === true, "isEstimate ist true, wenn nur eine grobe Zykluslänge vorliegt (UI zeigt 'Kann abweichen')");
}

// ---------------------------------------------------------------------------
// Markerprüfung: roter Punkt auf passender Ringposition
// ---------------------------------------------------------------------------

console.log("\n== Markerprüfung: Ringposition für Periode, PMS, mögliche Eisprungphase ==");
{
  const periods = [
    period("1", "2026-05-06", "2026-05-10"),
    period("2", "2026-06-03", "2026-06-07"),
    period("3", "2026-07-01", "2026-07-05"),
    period("4", "2026-08-01", "2026-08-05"),
  ];

  // Dritter Periodentag (2026-08-03) -> Marker muss auf dem Periode-Segment liegen
  const periodDayView = computePersonalCycleView(periods, null, "2026-08-03");
  const periodGeometry = buildPersonalRingGeometry(periodDayView, "2026-08-03");
  assert(periodGeometry !== null, "Ringgeometrie wird für die persönliche Ansicht berechnet");
  if (periodGeometry) {
    const marker = ringPointAt(periodGeometry.todayAngle);
    const segmentMid = ringPointAt(periodGeometry.segments[0].labelAngle); // "period" ist das erste Segment
    const distance = Math.hypot(marker.x - segmentMid.x, marker.y - segmentMid.y);
    // Tag 3 von 5 Periodentagen liegt nahe der Segmentmitte auf dem Ring (Radius 125, kleiner Abstand erwartet)
    assert(distance < 40, `Marker am dritten Periodentag liegt nahe am Periode-Segment (Abstand ${distance.toFixed(1)}px)`);
  }

  // PMS-Tag (2026-08-26, Mitte des PMS-Fensters)
  const pmsDayView = computePersonalCycleView(periods, null, "2026-08-26");
  const pmsGeometry = buildPersonalRingGeometry(pmsDayView, "2026-08-26");
  assertEqual(pmsDayView.todayPhase, "pms", "2026-08-26 wird als PMS erkannt (Voraussetzung für Markertest)");
  if (pmsGeometry) {
    const marker = ringPointAt(pmsGeometry.todayAngle);
    const pmsSegment = pmsGeometry.segments.find((segment) => segment.key === "pms");
    assert(Boolean(pmsSegment), "PMS-Segment ist in der Ringgeometrie vorhanden");
    if (pmsSegment) {
      const segmentMid = ringPointAt(pmsSegment.labelAngle);
      const distance = Math.hypot(marker.x - segmentMid.x, marker.y - segmentMid.y);
      assert(distance < 40, `Marker am PMS-Tag liegt nahe am PMS-Segment (Abstand ${distance.toFixed(1)}px)`);
    }
  }

  // Eisprungtag (2026-08-15, Mitte des Eisprungfensters)
  const ovulationDayView = computePersonalCycleView(periods, null, "2026-08-15");
  const ovulationGeometry = buildPersonalRingGeometry(ovulationDayView, "2026-08-15");
  assertEqual(ovulationDayView.todayPhase, "ovulation", "2026-08-15 wird als Eisprungphase erkannt (Voraussetzung für Markertest)");
  if (ovulationGeometry) {
    const marker = ringPointAt(ovulationGeometry.todayAngle);
    const fertileSegment = ovulationGeometry.segments.find((segment) => segment.key === "fertile");
    assert(Boolean(fertileSegment), "Fertile/Eisprung-Segment ist in der Ringgeometrie vorhanden");
    if (fertileSegment) {
      const segmentMid = ringPointAt(fertileSegment.labelAngle);
      const distance = Math.hypot(marker.x - segmentMid.x, marker.y - segmentMid.y);
      assert(distance < 40, `Marker am Eisprungtag liegt nahe am Eisprung-Segment (Abstand ${distance.toFixed(1)}px)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Sichtprüfung der Farben: die drei Ring-Gradienten müssen sich klar
// unterscheiden (nicht nur syntaktisch verschieden, sondern farblich weit
// genug auseinanderliegen, um verwechslungsfrei zu sein).
// ---------------------------------------------------------------------------

console.log("\n== Sichtprüfung der Farben: drei Phasen klar unterscheidbar ==");
{
  const componentPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "NewCycleExample.tsx",
  );
  const source = readFileSync(componentPath, "utf8");

  function extractGradientColor(gradientId: string): string {
    const gradientBlock = source.match(new RegExp(`id="${gradientId}"[\\s\\S]*?</linearGradient>`));
    assert(Boolean(gradientBlock), `Gradient ${gradientId} ist in NewCycleExample.tsx auffindbar`);
    const firstStop = gradientBlock?.[0].match(/stopColor="(#[0-9a-fA-F]{6})"/);
    assert(Boolean(firstStop), `Gradient ${gradientId} hat eine gültige erste stopColor`);
    return firstStop?.[1] ?? "#000000";
  }

  function hexToRgb(hex: string): [number, number, number] {
    const value = hex.replace("#", "");
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }

  function colorDistance(a: string, b: string): number {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg, bb] = hexToRgb(b);
    return Math.hypot(ar - br, ag - bg, ab - bb);
  }

  const periodColor = extractGradientColor("period-gradient");
  const pmsColor = extractGradientColor("pms-gradient");
  const ovulationColor = extractGradientColor("ovulation-gradient");

  // Mindestabstand im RGB-Raum (0–441.7 max.), grob kalibriert: deutlich
  // wahrnehmbare Farbunterschiede liegen typischerweise über ~60.
  const MIN_DISTINCT_DISTANCE = 60;
  const periodVsPms = colorDistance(periodColor, pmsColor);
  const periodVsOvulation = colorDistance(periodColor, ovulationColor);
  const pmsVsOvulation = colorDistance(pmsColor, ovulationColor);

  assert(
    periodVsPms >= MIN_DISTINCT_DISTANCE,
    `Periode (${periodColor}) und PMS (${pmsColor}) unterscheiden sich klar (Distanz ${periodVsPms.toFixed(1)})`,
  );
  assert(
    periodVsOvulation >= MIN_DISTINCT_DISTANCE,
    `Periode (${periodColor}) und Eisprung (${ovulationColor}) unterscheiden sich klar (Distanz ${periodVsOvulation.toFixed(1)})`,
  );
  assert(
    pmsVsOvulation >= MIN_DISTINCT_DISTANCE,
    `PMS (${pmsColor}) und Eisprung (${ovulationColor}) unterscheiden sich klar (Distanz ${pmsVsOvulation.toFixed(1)})`,
  );
}

// ---------------------------------------------------------------------------
// Zusammenfassung
// ---------------------------------------------------------------------------

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
