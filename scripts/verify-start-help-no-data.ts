import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentPath = path.join(projectRoot, "src", "components", "NewCycleExample.tsx");
const source = readFileSync(componentPath, "utf8");

const HELP_TEXT = "Noch keine Periodendaten. Wähle im Kalender den ersten Tag deiner Periode, um zu beginnen.";

console.log("\n== WP-007 V3: die Start-Hilfe erscheint ausschließlich ohne echte Periodeneinträge ==");
{
  assert(source.includes(HELP_TEXT), "der vereinbarte Hilfetext ist exakt im Quelltext vorhanden");
  assert(source.includes("{periods.length === 0 && ("), "die Karte ist an periods.length === 0 gebunden (kein echter Periodenbeginn)");
  assert(!source.includes('personalCycleView.status === "no_data" &&\n        <div className="mx-auto'), "die Karte nutzt nicht den weiter gefassten no_data-Status (der auch bei bereits vorhandenen, aber unzureichenden Perioden zutrifft)");
}

console.log("\n== WP-007 V3: die Karte steht oberhalb des bestehenden Kalenders und verdeckt ihn nicht ==");
{
  const helpIndex = source.indexOf(HELP_TEXT);
  const calendarSectionIndex = source.indexOf('aria-label="Kalender zur Orientierung"');
  assert(helpIndex !== -1 && calendarSectionIndex !== -1 && helpIndex < calendarSectionIndex, "die Start-Hilfe steht im Quelltext vor dem Kalenderbereich");
  assert(!source.includes(`${HELP_TEXT}</p>\n        </div>\n      </section>`), "die Karte ist kein Teil der Kalender-Section selbst, sondern ein eigenständiges, nicht überlappendes Element");
}

console.log("\n== WP-007 V3: die Karte ist rein informativ (keine Schaltfläche, kein Klick-Handler) ==");
{
  const helpBlockStart = source.indexOf("{periods.length === 0 && (");
  const helpBlockEnd = source.indexOf(")}", helpBlockStart) + 2;
  const helpBlock = helpBlockStart !== -1 ? source.slice(helpBlockStart, helpBlockEnd) : "";
  assert(helpBlock.length > 0, "der Karten-Block wurde im Quelltext gefunden");
  assert(!helpBlock.includes("<button"), "die Karte enthält keine Schaltfläche");
  assert(!helpBlock.includes("onClick"), "die Karte enthält keinen Klick-Handler");
  assert(!helpBlock.includes("fetch("), "die Karte löst keinen Netzwerkaufruf aus");
}

console.log("\n== WP-007 V3: keine neue Abfrage oder Berechnung wurde eingeführt (periods ist bereits vorhandener State) ==");
{
  assert(source.includes("const [periods, setPeriods] = useState(initialPeriods)"), "periods bleibt der bereits vorhandene, serverseitig geladene State (initialPeriods aus getNewPeriodEntries)");
}

console.log("\n== WP-007 V3: die Start-Hilfe existiert ausschließlich in der Owner-Ansicht, nicht in Partneransicht oder alter Luma ==");
{
  const partnerCalendarPath = path.join(projectRoot, "src", "components", "NewPartnerCalendar.tsx");
  const partnerPagePath = path.join(projectRoot, "src", "app", "neu", "partner", "page.tsx");
  const partnerCalendarSource = readFileSync(partnerCalendarPath, "utf8");
  const partnerPageSource = readFileSync(partnerPagePath, "utf8");
  assert(!partnerCalendarSource.includes("Noch keine Periodendaten"), "NewPartnerCalendar.tsx enthält die Start-Hilfe nicht");
  assert(!partnerPageSource.includes("Noch keine Periodendaten"), "die Partnerseite enthält die Start-Hilfe nicht");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
