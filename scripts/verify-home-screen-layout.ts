import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const componentPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "NewCycleExample.tsx",
);
const source = readFileSync(componentPath, "utf8");

const exportStart = source.indexOf("export default function NewCycleExample");
const body = exportStart !== -1 ? source.slice(exportStart) : "";

console.log("\n== WP-009: Home-Screen-Hauptbereiche wurden gefunden ==");
{
  assert(body.length > 0, "der Quelltextbereich von NewCycleExample wurde isoliert");
}

console.log("\n== WP-009: Reihenfolge Heute-Karte vor Zyklus-Kreis vor Kalender bleibt erhalten ==");
{
  const todayCardIndex = body.indexOf("<TodayCard personalCycleView={displayedPersonalCycleView} nextPeriodStart={prediction?.nextPeriodStart ?? null} today={todayKey} />");
  const cycleRingIndex = body.indexOf("<CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} manualPmsOverride={manualPmsRingOverride} />");
  const calendarIndex = body.indexOf("<CalendarTodayLine today={todayKey} compact />");

  assert(todayCardIndex !== -1, "TodayCard wird gerendert");
  assert(cycleRingIndex !== -1, "CyclePersonalRing wird gerendert");
  assert(calendarIndex !== -1, "CalendarTodayLine wird gerendert");
  assert(
    todayCardIndex < cycleRingIndex && cycleRingIndex < calendarIndex,
    "die Render-Reihenfolge ist weiterhin Heute-Karte, dann Zyklus-Kreis, dann Kalender",
  );
}

console.log("\n== WP-009: Hauptkomponenten, Props und Handler sind unverändert ==");
{
  assert(
    body.includes('<TodayCard personalCycleView={displayedPersonalCycleView} nextPeriodStart={prediction?.nextPeriodStart ?? null} today={todayKey} />'),
    "TodayCard erhält weiterhin die aufbereitete personalCycleView (WP-013: inklusive manueller PMS-Übersteuerung) sowie (WP-015) die vorhandene nextPeriodStart-Vorhersage und today",
  );
  assert(
    body.includes('<CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} manualPmsOverride={manualPmsRingOverride} />'),
    "CyclePersonalRing erhält weiterhin die aufbereitete personalCycleView und today sowie (WP-014 Korrektur V3) manualPmsRingOverride für Segment- und Marker-Position",
  );
  assert(body.includes('<CalendarTodayLine today={todayKey} compact />'), "CalendarTodayLine erhält unverändert today sowie (seit WP-016 Korrektur V2) compact für die mobile Verdichtung");
  assert(body.includes("onClick={() => changeMonth(-1)}") && body.includes("onClick={() => changeMonth(1)}"), "die Monatsnavigation ruft weiterhin changeMonth auf");
  assert(body.includes("onClick={() => setIsPeriodHistoryOpen(true)}"), "die Monatsanzeige öffnet weiterhin die Periodenhistorie");
}

console.log("\n== WP-009 Version 2 / WP-016: Zyklus- und Kalender-section bleiben rahmenlos; Abstände dürfen seit WP-016 unterhalb sm enger sein ==");
{
  const cycleSectionMatch = body.match(/<section\s+aria-label=\{hasPersonalCircle[\s\S]*?className="([^"]*)"/);
  const calendarSectionMatch = body.match(/<section\s+aria-label="Kalender zur Orientierung"\s+className="([^"]*)"/);

  assert(cycleSectionMatch?.[1] === "space-y-2 sm:space-y-3", "die Zyklus-section nutzt seit WP-016 einen engeren mobilen Abstand (space-y-2), ab sm weiterhin space-y-3, ohne Kartenklassen");
  assert(calendarSectionMatch?.[1] === "space-y-3 sm:space-y-5", "die Kalender-section nutzt seit WP-016 einen engeren mobilen Abstand (space-y-3), ab sm weiterhin space-y-5, ohne Kartenklassen");

  for (const forbidden of ["rounded-2xl", "border-[#efd5dc]", "bg-white/90", "shadow-sm"]) {
    assert(
      !(cycleSectionMatch?.[1].includes(forbidden) ?? false),
      `die Zyklus-section enthält keine Kartenklasse '${forbidden}' mehr`,
    );
    assert(
      !(calendarSectionMatch?.[1].includes(forbidden) ?? false),
      `die Kalender-section enthält keine Kartenklasse '${forbidden}' mehr`,
    );
  }

  assert(
    source.includes('<div className="mx-auto w-full max-w-sm rounded-2xl border border-[#efd5dc] bg-white/90 px-3 py-2.5 text-center shadow-sm sm:px-5 sm:py-4">'),
    "die Heute-Karte (TodayCard) behält ihre Kartenrahmung; seit WP-016 Korrektur V2 mit engerem mobilem Innenabstand (px-3 py-2.5), ab sm weiterhin px-5 py-4",
  );

  assert(body.includes("Dein Zyklus"), "kein Text in der Zyklus-section wurde entfernt oder verändert");
  assert(body.includes("Meine Periode aktualisieren"), "kein Text/Button im Kalenderbereich wurde entfernt oder verändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
