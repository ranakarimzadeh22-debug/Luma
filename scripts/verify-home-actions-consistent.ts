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

console.log("\n== WP-010: die drei bestehenden Home-Aktionen wurden gefunden ==");
{
  assert(body.length > 0, "der Quelltextbereich von NewCycleExample wurde isoliert");
}

console.log("\n== WP-010: Hauptaktion bleibt klar erkennbar und unverändert in Funktion und Text ==");
{
  const mainActionMatch = body.match(/<button\s+type="button"\s+onClick=\{openMyPeriods\}\s+className="([^"]*)"\s*>\s*Meine Periode aktualisieren\s*<\/button>/);
  assert(Boolean(mainActionMatch), "die Hauptaktion 'Meine Periode aktualisieren' ruft weiterhin openMyPeriods auf, unveränderter Text");
  assert(Boolean(mainActionMatch?.[1].includes("bg-[#6d153f]") && mainActionMatch?.[1].includes("text-white")), "die Hauptaktion bleibt visuell als gefüllter, primärer Button von den Hilfsaktionen unterscheidbar");
}

console.log("\n== WP-010: Hilfsaktion 'Zykluslänge ergänzen' bleibt an ihre bestehende Sichtbarkeitsbedingung und Funktion gebunden ==");
{
  assert(
    body.includes('{personalCycleView.status === "no_data" && periods.length > 0 && (') &&
      body.includes("onClick={() => setIsAddCycleLengthModalOpen(true)}") &&
      body.includes("Zykluslänge ergänzen"),
    "Sichtbarkeitsbedingung, Klick-Handler und Text von 'Zykluslänge ergänzen' sind unverändert",
  );
}

console.log("\n== WP-010: Hilfsaktion 'Erklärungen zum Kalender' bleibt an ihre bestehende Logik gebunden ==");
{
  assert(
    body.includes("aria-expanded={isCalendarLegendOpen}") &&
      body.includes('aria-controls="calendar-legend-panel"') &&
      body.includes("onClick={() => setIsCalendarLegendOpen((current) => !current)}") &&
      body.includes('{isCalendarLegendOpen ? "Erklärungen ausblenden" : "Erklärungen zum Kalender anzeigen"}'),
    "aria-Verhalten, Klick-Handler und beide Texte des Erklärungs-Toggles sind unverändert",
  );
}

console.log("\n== WP-010: beide Hilfsaktionen sind jetzt visuell konsistent (gleiche Rolle, gleiche Darstellung) ==");
{
  const cycleLengthButtonMatch = body.match(/onClick=\{\(\) => setIsAddCycleLengthModalOpen\(true\)\}\s*\n\s*className="([^"]*)"/);
  const legendButtonMatch = body.match(/onClick=\{\(\) => setIsCalendarLegendOpen\(\(current\) => !current\)\}\s*\n\s*className="([^"]*)"/);

  assert(Boolean(cycleLengthButtonMatch), "die className von 'Zykluslänge ergänzen' wurde gefunden");
  assert(Boolean(legendButtonMatch), "die className des Erklärungs-Toggles wurde gefunden");
  assert(
    cycleLengthButtonMatch?.[1] === legendButtonMatch?.[1],
    "beide Hilfsaktionen teilen jetzt dieselbe Darstellungsklasse (Rahmen, Hintergrund, Schrift, Abstand, Schatten)",
  );
}

console.log("\n== WP-010: keine neuen Card-Rahmen, Hintergrundflächen oder Schatten um Zyklus-Kreis oder Kalender ==");
{
  const cycleSectionMatch = body.match(/<section\s+aria-label=\{hasPersonalCircle[\s\S]*?className="([^"]*)"/);
  const calendarSectionMatch = body.match(/<section\s+aria-label="Kalender zur Orientierung"\s+className="([^"]*)"/);

  assert(cycleSectionMatch?.[1] === "space-y-3", "die Zyklus-section bleibt rahmenlos (nur 'space-y-3')");
  assert(calendarSectionMatch?.[1] === "space-y-5", "die Kalender-section bleibt rahmenlos (nur 'space-y-5')");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
