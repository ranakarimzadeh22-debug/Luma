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

console.log("\n== WP-010 / WP-018: der Erklärungen-Umschalter bleibt an seine bestehende Logik gebunden, jetzt als kleiner Info-Button in der Monatszeile ==");
{
  // WP-018: der frühere lange Pill-Button unter dem Kalender wurde durch einen
  // kleinen ⓘ-Info-Button neben dem Monatsnamen ersetzt — derselbe State,
  // dasselbe Panel, derselbe Handler, aber dynamischer aria-label statt
  // sichtbarem Button-Text. Siehe scripts/verify-calendar-legend-collapsible.ts
  // für die ausführlichen WP-018-Prüfungen dieser Umstellung.
  assert(
    body.includes("aria-expanded={isCalendarLegendOpen}") &&
      body.includes('aria-controls="calendar-legend-panel"') &&
      body.includes("onClick={() => setIsCalendarLegendOpen((current) => !current)}") &&
      body.includes('aria-label={isCalendarLegendOpen ? "Erklärungen zum Kalender ausblenden" : "Erklärungen zum Kalender anzeigen"}'),
    "aria-Verhalten, Klick-Handler und der dynamische aria-label des Erklärungs-Umschalters sind unverändert erhalten",
  );
}

console.log("\n== WP-018: 'Zykluslänge ergänzen' bleibt ein eigenständiger Pill-Button; der Erklärungen-Umschalter ist seit WP-018 bewusst kein gleichartiger Pill-Button mehr ==");
{
  const cycleLengthButtonMatch = body.match(/onClick=\{\(\) => setIsAddCycleLengthModalOpen\(true\)\}\s*\n\s*className="([^"]*)"/);
  assert(Boolean(cycleLengthButtonMatch), "die className von 'Zykluslänge ergänzen' wurde gefunden und bleibt unverändert");
  assert(
    body.includes('className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-[#b85f7f]'),
    "der Erklärungen-Umschalter ist jetzt ein kleiner runder Info-Button (h-8 w-8) statt des früheren Pill-Buttons — bewusste WP-018-Design-Änderung",
  );
}

console.log("\n== WP-010 / WP-016: keine neuen Card-Rahmen, Hintergrundflächen oder Schatten um Zyklus-Kreis oder Kalender ==");
{
  const cycleSectionMatch = body.match(/<section\s+aria-label=\{hasPersonalCircle[\s\S]*?className="([^"]*)"/);
  const calendarSectionMatch = body.match(/<section\s+aria-label="Kalender zur Orientierung"\s+className="([^"]*)"/);

  assert(cycleSectionMatch?.[1] === "space-y-2 sm:space-y-3", "die Zyklus-section bleibt rahmenlos (seit WP-016 'space-y-2 sm:space-y-3')");
  assert(calendarSectionMatch?.[1] === "space-y-3 sm:space-y-5", "die Kalender-section bleibt rahmenlos (seit WP-016 'space-y-3 sm:space-y-5')");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
