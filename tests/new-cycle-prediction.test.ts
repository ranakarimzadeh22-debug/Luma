import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
import { predictCycle, phaseForDate, phasesForDate } from "../src/lib/new-cycle-prediction.ts";

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

test("WP-007: der Eisprungtag liegt genau 14 Tage vor dem erwarteten Periodenbeginn", () => {
  const periods = [entry("2026-07-01", "2026-07-05"), entry("2026-07-29", "2026-08-02")];
  const prediction = predictCycle(periods, null, "2026-08-10");
  assert.ok(prediction);
  const expectedOvulation = "2026-08-12";
  assert.equal(prediction!.ovulationDate, expectedOvulation);
  assert.equal(prediction!.nextPeriodStart, "2026-08-26");
});

test("WP-007: das fruchtbare Zeitfenster reicht von Eisprungtag minus fünf bis einschließlich Eisprungtag", () => {
  const periods = [entry("2026-07-01", "2026-07-05"), entry("2026-07-29", "2026-08-02")];
  const prediction = predictCycle(periods, null, "2026-08-10");
  assert.ok(prediction);
  assert.equal(prediction!.fertileWindowStart, "2026-08-07");
  assert.equal(prediction!.fertileWindowEnd, prediction!.ovulationDate);
  assert.equal(prediction!.fertileWindowEnd, "2026-08-12");
});

test("WP-007: endDate und expectedEndDate beeinflussen weder Zykluslänge noch Eisprung", () => {
  const withShortBleed = predictCycle(
    [entry("2026-07-01", "2026-07-02"), entry("2026-07-29", "2026-07-30")],
    null,
    "2026-08-10",
  );
  const withLongBleedAndExpected = predictCycle(
    [
      { id: "a", startDate: "2026-07-01", endDate: "2026-07-09", expectedEndDate: null },
      { id: "b", startDate: "2026-07-29", endDate: "2026-08-06", expectedEndDate: "2026-08-20" },
    ],
    null,
    "2026-08-10",
  );
  assert.ok(withShortBleed);
  assert.ok(withLongBleedAndExpected);
  assert.equal(withShortBleed!.cycleLengthDays, withLongBleedAndExpected!.cycleLengthDays);
  assert.equal(withShortBleed!.ovulationDate, withLongBleedAndExpected!.ovulationDate);
  assert.equal(withShortBleed!.nextPeriodStart, withLongBleedAndExpected!.nextPeriodStart);
  // Nur die (getrennt behandelte) Periodendauer unterscheidet sich.
  assert.notEqual(withShortBleed!.periodLengthDays, withLongBleedAndExpected!.periodLengthDays);
});

test("WP-007: eine laufende tatsächliche Periode verschiebt die bereits berechnete Fruchtbarkeits-Schätzung nicht", () => {
  const periods = [entry("2026-07-01", "2026-07-05"), entry("2026-07-29", "2026-08-02")];
  const beforeRunning = predictCycle(periods, null, "2026-08-10");
  const withRunningPeriod = predictCycle(
    [...periods, { id: "running", startDate: "2026-08-26", endDate: null, expectedEndDate: "2026-08-31" }],
    null,
    "2026-08-27",
  );
  assert.ok(beforeRunning);
  assert.ok(withRunningPeriod);
  // Dieselbe Zykluslänge/Anker-Logik liefert denselben kommenden Eisprungtag,
  // unabhängig davon, ob die aktuell laufende Periode schon ein (erwartetes)
  // Ende trägt.
  assert.equal(beforeRunning!.cycleLengthDays, withRunningPeriod!.cycleLengthDays);
});

test("WP-007: Periode und fruchtbares Zeitfenster können sich überlappen und bleiben beide gleichzeitig erkennbar", () => {
  // Zykluslänge 21 Tage (am unteren Rand des erlaubten Bereichs): der
  // Eisprung (14 Tage vor dem nächsten Periodenbeginn) fällt dann in eine
  // vorangehende, bereits laufende/vorhergesagte Periode hinein.
  const periods = [
    entry("2026-07-01", "2026-07-05"),
    entry("2026-07-22", "2026-07-26"),
    entry("2026-08-12", "2026-08-16"),
  ];
  const prediction = predictCycle(periods, null, "2026-08-20");
  assert.ok(prediction);
  assert.equal(prediction!.cycleLengthDays, 21);

  const overlapDay = prediction!.nextPeriodStart; // Zyklustag 1 der neuen Periode
  const phases = phasesForDate(overlapDay, prediction!);
  assert.equal(phases.period, true, "der Starttag der nächsten Periode bleibt als Periode erkennbar");

  // Der Eisprungtag selbst liegt vor dem neuen Periodenbeginn (21 - 14 = Tag 7
  // der laufenden Periode) und überlappt daher nicht mit dieser Periode,
  // bestätigt aber, dass fertile/ovulation unabhängig von period gemeldet werden.
  const fertilePhases = phasesForDate(prediction!.ovulationDate, prediction!);
  assert.equal(fertilePhases.ovulation, true);
  assert.equal(fertilePhases.fertile, true);
});

test("WP-007: phasesForDate meldet period und fertile gleichzeitig, wenn sie sich tatsächlich überlappen", () => {
  // Zykluslänge 21 Tage (am unteren Rand des erlaubten Bereichs) mit einer
  // langen, zehntägigen Periodendauer: Der Eisprung des *folgenden* Zyklus
  // liegt bei periodStart + (21 - 14) = periodStart + 7 und fällt damit in
  // die zehntägige Periode (Tag 1 bis Tag 10) hinein — ein echter Overlap.
  const periods = [
    entry("2026-06-01", "2026-06-10"),
    entry("2026-06-22", "2026-07-01"),
    entry("2026-07-13", "2026-07-22"),
  ];
  const prediction = predictCycle(periods, null, "2026-07-25");
  assert.ok(prediction);
  assert.equal(prediction!.cycleLengthDays, 21);
  assert.equal(prediction!.periodLengthDays, 10);

  const periodStart = prediction!.nextPeriodStart;
  const [y, m, d] = periodStart.split("-").map(Number);
  const overlapCandidate = new Date(Date.UTC(y, m - 1, d));
  overlapCandidate.setUTCDate(overlapCandidate.getUTCDate() + 7); // achter Periodentag
  const overlapDate = overlapCandidate.toISOString().slice(0, 10);

  const phases = phasesForDate(overlapDate, prediction!);
  assert.equal(phases.period, true, "der Tag bleibt als Periode erkennbar");
  assert.equal(phases.fertile, true, "derselbe Tag ist gleichzeitig als fruchtbares Zeitfenster erkennbar");
  // phaseForDate (Einzelwert) priorisiert weiterhin period, verliert aber
  // dadurch keine Information — phasesForDate zeigt beide Zustände.
  assert.equal(phaseForDate(overlapDate, prediction!), "period");
});

test("WP-007: stabile echte Zyklusabstände führen nicht zu 'Vorhersage unsicher'", () => {
  const periods = [
    entry("2026-05-01", "2026-05-05"),
    entry("2026-05-29", "2026-06-02"),
    entry("2026-06-26", "2026-06-30"),
  ];
  const prediction = predictCycle(periods, null, "2026-07-10");
  assert.ok(prediction);
  assert.equal(prediction!.isUncertain, false);
});

test("WP-007: stark schwankende echte Zyklusabstände führen zu 'Vorhersage unsicher'", () => {
  const periods = [
    entry("2026-01-01", "2026-01-05"),
    entry("2026-01-22", "2026-01-26"), // +21 Tage
    entry("2026-03-15", "2026-03-19"), // +52 Tage -> außerhalb 21-45, wird verworfen
    entry("2026-04-29", "2026-05-03"), // +45 Tage
  ];
  const prediction = predictCycle(periods, null, "2026-05-10");
  assert.ok(prediction);
  // Verwendbare Abstände: 21 und 45 Tage -> Spanne 24 Tage, deutlich über
  // der 10-Tage-Schwelle aus isUncertainPrediction().
  assert.equal(prediction!.isUncertain, true);
});
