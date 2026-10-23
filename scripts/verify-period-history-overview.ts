import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const componentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewCycleExample.tsx");
const source = readFileSync(componentPath, "utf8");

console.log("\n== WP-019: kein großer 'Meine Periode aktualisieren'-Button mehr unter dem Home-Kalender ==");
{
  const calendarGridStart = source.indexOf("grid-cols-7 gap-1.5");
  const uncertainHintIndex = source.indexOf("{!prediction && (", calendarGridStart);
  const betweenCalendarAndHint = calendarGridStart !== -1 && uncertainHintIndex !== -1 ? source.slice(calendarGridStart, uncertainHintIndex) : "";
  assert(calendarGridStart !== -1 && uncertainHintIndex !== -1, "Kalendergrid und der Bereich darunter (WP-025: ohne dauerhaften Unsicherheitshinweis) wurden im Quelltext gefunden");
  assert(!betweenCalendarAndHint.includes("Meine Periode aktualisieren"), "zwischen Kalendergrid und Beispiel-Hinweis steht kein 'Meine Periode aktualisieren'-Button mehr");
  assert(!betweenCalendarAndHint.includes("openMyPeriods"), "openMyPeriods wird in diesem Bereich nicht mehr direkt aufgerufen");
}

console.log("\n== WP-019: PeriodHistoryModal heißt sichtbar 'Periodenübersicht' und enthält den Button 'Meine Periode aktualisieren' ohne Scrollen auffindbar ==");
{
  const modalStart = source.indexOf("function PeriodHistoryModal(");
  const modalEnd = source.indexOf("\nexport default function NewCycleExample(", modalStart);
  const modalBody = modalStart !== -1 && modalEnd !== -1 ? source.slice(modalStart, modalEnd) : "";
  assert(modalBody.length > 0, "PeriodHistoryModal wurde im Quelltext gefunden");
  assert(modalBody.includes('id="period-history-title"') && modalBody.includes("Periodenübersicht"), "der sichtbare Dialogtitel lautet 'Periodenübersicht'");
  assert(!modalBody.includes("Periodenhistorie\r\n") && !modalBody.includes("Periodenhistorie\n"), "der alte sichtbare Titel 'Periodenhistorie' ist nicht mehr vorhanden");

  const titleIndex = modalBody.indexOf("Periodenübersicht");
  const actionButtonIndex = modalBody.indexOf("Meine Periode aktualisieren");
  const scrollAreaIndex = modalBody.indexOf("overflow-y-auto");
  assert(
    titleIndex !== -1 && actionButtonIndex !== -1 && scrollAreaIndex !== -1 && titleIndex < actionButtonIndex && actionButtonIndex < scrollAreaIndex,
    "der Button 'Meine Periode aktualisieren' steht zwischen Titel und scrollbarer Historienliste — ohne Scrollen auffindbar",
  );
}

console.log("\n== WP-019: der neue Callback schließt zuerst die Periodenübersicht, bevor der vorhandene openMyPeriods()-Weg aufgerufen wird ==");
{
  assert(source.includes("onOpenMyPeriods: () => void;"), "PeriodHistoryModalProps hat einen neuen onOpenMyPeriods-Callback");
  assert(source.includes("onClick={onOpenMyPeriods}"), "der neue Button im Dialog ruft onOpenMyPeriods auf");

  const callSiteStart = source.indexOf("onOpenMyPeriods={() => {");
  const callSiteEnd = source.indexOf("}}", callSiteStart);
  const callSiteBody = callSiteStart !== -1 && callSiteEnd !== -1 ? source.slice(callSiteStart, callSiteEnd) : "";
  assert(callSiteBody.length > 0, "die onOpenMyPeriods-Implementierung an der PeriodHistoryModal-Aufrufstelle wurde gefunden");
  const closeIndex = callSiteBody.indexOf("setIsPeriodHistoryOpen(false)");
  const openIndex = callSiteBody.indexOf("openMyPeriods()");
  assert(closeIndex !== -1 && openIndex !== -1 && closeIndex < openIndex, "die Periodenübersicht wird zuerst geschlossen (setIsPeriodHistoryOpen(false)), erst danach wird der bestehende openMyPeriods()-Weg aufgerufen — niemals zwei Dialoge gleichzeitig");
  assert(!callSiteBody.includes("setIsMyPeriodsModalOpen"), "kein neuer, direkter Modal-State-Zugriff — nur der bereits vorhandene openMyPeriods()-Weg wird genutzt");
}

console.log("\n== WP-019: keine neue Modal- oder Formularlogik, openMyPeriods bleibt unverändert ==");
{
  const openMyPeriodsStart = source.indexOf("function openMyPeriods()");
  const openMyPeriodsEnd = source.indexOf("\n  }", openMyPeriodsStart);
  const openMyPeriodsBody = openMyPeriodsStart !== -1 && openMyPeriodsEnd !== -1 ? source.slice(openMyPeriodsStart, openMyPeriodsEnd) : "";
  assert(openMyPeriodsBody.includes("setIsMyPeriodsModalOpen(true)"), "openMyPeriods() bleibt unverändert: setzt ausschließlich den bereits vorhandenen isMyPeriodsModalOpen-State");
}

console.log("\n== WP-019: bestehende Historienzeilen, Monatssprung, Escape und Schließen bleiben unverändert ==");
{
  assert(source.includes("onSelectMonth: (startDate: string) => void;"), "onSelectMonth bleibt unverändert in PeriodHistoryModalProps vorhanden");
  assert(source.includes("onSelectMonth={jumpToHistoryMonth}"), "die Aufrufstelle reicht weiterhin jumpToHistoryMonth unverändert durch");
  assert(source.includes('event.key === "Escape"') && source.includes("onClose();"), "der Escape-Handler bleibt im Dialog unverändert");
  assert(source.includes("Schließen") && source.includes("onClick={onClose}"), "der Schließen-Button (onClick={onClose}) bleibt vorhanden");
}

console.log("\n== WP-019: keine Änderung an Daten, API, Berechnung oder Partneransicht ==");
{
  assert(!source.includes('fetch("/api/neu/periods-history'), "keine neue API-Route für die Periodenübersicht");
  assert(source.includes("computePeriodHistory(periods)"), "die bestehende, bereits vorhandene Historienberechnung bleibt unverändert eingebunden");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
