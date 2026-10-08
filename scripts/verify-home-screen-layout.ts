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
  const todayCardIndex = body.indexOf("<TodayCard personalCycleView={personalCycleView} />");
  const cycleRingIndex = body.indexOf("<CyclePersonalRing personalCycleView={personalCycleView} today={todayKey} />");
  const calendarIndex = body.indexOf("<CalendarTodayLine today={todayKey} />");

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
  assert(body.includes('<TodayCard personalCycleView={personalCycleView} />'), "TodayCard erhält unverändert personalCycleView");
  assert(
    body.includes('<CyclePersonalRing personalCycleView={personalCycleView} today={todayKey} />'),
    "CyclePersonalRing erhält unverändert personalCycleView und today",
  );
  assert(body.includes('<CalendarTodayLine today={todayKey} />'), "CalendarTodayLine erhält unverändert today");
  assert(body.includes("onClick={() => changeMonth(-1)}") && body.includes("onClick={() => changeMonth(1)}"), "die Monatsnavigation ruft weiterhin changeMonth auf");
  assert(body.includes("onClick={() => setIsPeriodHistoryOpen(true)}"), "die Monatsanzeige öffnet weiterhin die Periodenhistorie");
}

console.log("\n== WP-009 Version 2: Zyklus- und Kalender-section bleiben rahmenlos, nur die ursprünglichen Abstände bleiben ==");
{
  const cycleSectionMatch = body.match(/<section\s+aria-label=\{hasPersonalCircle[\s\S]*?className="([^"]*)"/);
  const calendarSectionMatch = body.match(/<section\s+aria-label="Kalender zur Orientierung"\s+className="([^"]*)"/);

  assert(cycleSectionMatch?.[1] === "space-y-3", "die Zyklus-section hat wieder nur die ursprüngliche className 'space-y-3' ohne Kartenklassen");
  assert(calendarSectionMatch?.[1] === "space-y-5", "die Kalender-section hat wieder nur die ursprüngliche className 'space-y-5' ohne Kartenklassen");

  for (const forbidden of ["rounded-2xl", "border-[#efd5dc]", "bg-white/90", "shadow-sm", "px-5", "py-4"]) {
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
    source.includes('<div className="mx-auto w-full max-w-sm rounded-2xl border border-[#efd5dc] bg-white/90 px-5 py-4 text-center shadow-sm">'),
    "die Heute-Karte (TodayCard) behält ihre Kartenrahmung unverändert",
  );

  assert(body.includes("Dein Zyklus"), "kein Text in der Zyklus-section wurde entfernt oder verändert");
  assert(body.includes("Meine Periode aktualisieren"), "kein Text/Button im Kalenderbereich wurde entfernt oder verändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
