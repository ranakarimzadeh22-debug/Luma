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

console.log("\n== WP-009: nur äußere Layout-Klassen wurden ergänzt, keine neuen sichtbaren Inhalte ==");
{
  const cycleSectionMatch = body.match(/<section\s+aria-label=\{hasPersonalCircle[\s\S]*?className="([^"]*)"/);
  const calendarSectionMatch = body.match(/<section\s+aria-label="Kalender zur Orientierung"[\s\S]*?className="([^"]*)"/);

  assert(Boolean(cycleSectionMatch?.[1].includes("rounded-2xl")), "die Zyklus-section erhält dieselbe ruhige Kartenrahmung wie die Heute-Karte");
  assert(Boolean(calendarSectionMatch?.[1].includes("rounded-2xl")), "die Kalender-section erhält dieselbe ruhige Kartenrahmung wie die Heute-Karte");
  assert(
    Boolean(cycleSectionMatch?.[1].includes("border-[#efd5dc]") && cycleSectionMatch?.[1].includes("bg-white/90")),
    "die Zyklus-section nutzt dieselben bestehenden Rahmen-/Hintergrundfarben wie die Heute-Karte",
  );
  assert(
    Boolean(calendarSectionMatch?.[1].includes("border-[#efd5dc]") && calendarSectionMatch?.[1].includes("bg-white/90")),
    "die Kalender-section nutzt dieselben bestehenden Rahmen-/Hintergrundfarben wie die Heute-Karte",
  );

  assert(body.includes("Dein Zyklus"), "kein Text in der Zyklus-section wurde entfernt oder verändert");
  assert(body.includes("Meine Periode aktualisieren"), "kein Text/Button im Kalenderbereich wurde entfernt oder verändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
