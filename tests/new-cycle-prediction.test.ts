import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { predictCycle, phaseForDate } from "../src/lib/new-cycle-prediction.ts";

function entry(startDate: string, endDate: string | null, expectedEndDate: string | null = null) {
  return { id: "test", startDate, endDate, expectedEndDate };
}

test("predictCycle nutzt den übergebenen today-Parameter statt einer eigenen new Date()-Berechnung", () => {
  // Zwei echte, abgeschlossene Perioden mit 28-Tage-Abstand.
  const periods = [entry("2026-07-01", "2026-07-05"), entry("2026-07-29", "2026-08-02")];

  const predictionEarly = predictCycle(periods, null, "2026-08-10");
  assert.ok(predictionEarly);
  assert.equal(predictionEarly!.nextPeriodStart, "2026-08-26");

  // Derselbe Datensatz, aber ein anderes "heute" verschiebt die nächste
  // Periode konsequent weiter — ohne today-Parameter würde predictCycle
  // sonst intern new Date() (Servertag, potenziell UTC statt Europe/Berlin)
  // heranziehen und stünde in Widerspruch zur Kalenderanzeige.
  const predictionLater = predictCycle(periods, null, "2026-09-01");
  assert.ok(predictionLater);
  assert.equal(predictionLater!.nextPeriodStart, "2026-09-23");
});

test("predictCycle liefert an der Europe/Berlin-Mitternachtsgrenze denselben Tag wie die Kalenderanzeige", () => {
  const periods = [entry("2026-07-01", "2026-07-05"), entry("2026-07-29", "2026-08-02")];

  // Wäre "heute" (aus Europe/Berlin) bereits der 26.08., zählt der 26.08.
  // selbst nicht mehr als "vor" der nächsten Periode (Schleifenbedingung
  // "solange <= today") — die nächste Periode verschiebt sich einen
  // vollen Zyklus weiter. Das prüft genau die Kante, an der ein falsch
  // berechnetes "heute" (z. B. aus einer UTC-Serverzeit statt Europe/Berlin)
  // eine andere nextPeriodStart liefern würde als die Kalenderanzeige.
  const prediction = predictCycle(periods, null, "2026-08-26");
  assert.ok(prediction);
  assert.equal(prediction!.nextPeriodStart, "2026-09-23");
});

test("phaseForDate markiert die berechnete nächste Periode korrekt und unterscheidet sie von anderen Phasen", () => {
  const periods = [entry("2026-07-01", "2026-07-05"), entry("2026-07-29", "2026-08-02")];
  const prediction = predictCycle(periods, null, "2026-08-10");
  assert.ok(prediction);

  assert.equal(phaseForDate(prediction!.nextPeriodStart, prediction!), "period");
  assert.equal(phaseForDate(prediction!.nextPeriodEnd, prediction!), "period");
  // Ein Tag weit außerhalb aller berechneten future Cycles (weit vor dem
  // ersten periodStart und außerhalb jeder pms-/fertile-Spanne) bleibt neutral.
  assert.equal(phaseForDate("2026-08-15", prediction!), null);
});

test("mit nur einer echten Periode und ohne Profil greift der dokumentierte 28-Tage-Standardfall (kein Absturz, keine leere Antwort)", () => {
  // Bestehendes, von WP-004 v8 unverändertes Verhalten: eine Periode allein
  // reicht für einen vorsichtigen 28-Tage-Default-Zyklus (source: "default").
  const prediction = predictCycle([entry("2026-07-01", "2026-07-05")], null, "2026-08-10");
  assert.ok(prediction);
  assert.equal(prediction!.source, "default");
  assert.equal(prediction!.cycleLengthDays, 28);
});

test("ganz ohne Perioden und ohne Profil liefert predictCycle keine erfundene Vorhersage", () => {
  assert.equal(predictCycle([], null, "2026-08-10"), null);
});
