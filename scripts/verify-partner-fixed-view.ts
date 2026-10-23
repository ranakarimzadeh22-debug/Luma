import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath: string) => readFileSync(path.join(projectRoot, relativePath), "utf8");

function sqlSelectsColumn(source: string, column: string): boolean {
  return new RegExp(`SELECT[^;]*\\b${column}\\b[^;]*FROM`, "i").test(source);
}

console.log("\n== WP-004 V11: der Partner-Kalender-View liefert keine alte Freigabe-Spalte als Gate mehr ==");
{
  const source = read("src/lib/new-partner-calendar.ts");
  assert(!sqlSelectsColumn(source, "calendar_shared"), "new-partner-calendar.ts liest calendar_shared nicht mehr per SQL als Datenbankspalte");
  assert(!sqlSelectsColumn(source, "cycle_ring_shared"), "new-partner-calendar.ts liest cycle_ring_shared nicht mehr per SQL als Datenbankspalte");
  assert(source.includes("status = 'active'"), "die aktive Verbindung bleibt die serverseitig geprüfte Voraussetzung");
  assert(source.includes("predictCycle("), "die bestehende, zentrale WP-007-Vorhersagelogik wird wiederverwendet (keine zweite Berechnung)");
}

console.log("\n== WP-027: der Partner-Zyklus-Kreis-View nutzt nur noch die aktive Verbindung als Gate ==");
{
  const source = read("src/lib/new-partner-cycle-view.ts");
  assert(source.includes("partner_user_id = $1 AND status = 'active' LIMIT 1") && !/AND\s+cycle_ring_shared/.test(source.replace(/\/\*[\s\S]*?\*\//g, "")), "WP-027: die aktive Verbindung ist der alleinige serverseitige Gate, cycle_ring_shared wird nicht mehr in der Abfrage geprüft");
  assert(source.includes("computePersonalCycleView("), "die bestehende, zentrale Zyklus-Kreis-Logik wird wiederverwendet (keine zweite Berechnung)");
}

console.log("\n== WP-024: nur die Ringfreigabe wird reaktiviert, Kalenderfreigabe bleibt entfernt ==");
{
  const source = read("src/lib/new-partner.ts");
  assert(source.includes("export async function setPartnerCycleRingShared"), "setPartnerCycleRingShared ist eng für WP-024 reaktiviert");
  assert(!source.includes("export async function setPartnerCalendarShared"), "setPartnerCalendarShared wurde entfernt");
  assert(source.includes("cycleRingShared: row.cycle_ring_shared"), "Owner-Status liefert den gespeicherten Ringfreigabewert");
  assert(!source.includes("calendarShared: row.calendar_shared"), "getPartnerConnectionStatusForOwner liefert calendarShared nicht mehr");
}

console.log("\n== WP-024: nur die Ringfreigabe-Route ist vorhanden ==");
{
  const routeExists = (relativePath: string) => {
    try {
      readFileSync(path.join(projectRoot, relativePath), "utf8");
      return true;
    } catch {
      return false;
    }
  };
  assert(routeExists("src/app/api/neu/partner/cycle-ring-sharing/route.ts"), "die Route cycle-ring-sharing ist reaktiviert");
  assert(!routeExists("src/app/api/neu/partner/calendar-sharing/route.ts"), "die Route calendar-sharing wurde entfernt");
}

console.log("\n== WP-027: Einstellungen zeigen keinen Ringfreigabe-Schalter mehr, nur den Verbindungscode-Bereich und eine Info-Karte ==");
{
  const source = read("src/app/neu/einstellungen/page.tsx");
  assert(!source.includes("NewPartnerCycleRingSharingToggle") && source.includes("Aktive Partnerverbindung"), "WP-027: kein Zyklus-Kreis-Schalter mehr, stattdessen die Info-Karte bei aktiver Verbindung");
  assert(!source.includes("NewPartnerCalendarSharingToggle"), "der Kalender-Einzel-Schalter ist aus den Einstellungen entfernt");
  assert(source.includes("NewPartnerCodeCard"), "der Verbindungscode-Bereich bleibt erhalten");
}

console.log("\n== WP-027: auch die Ring-Toggle-Komponente ist entfernt ==");
{
  const componentExists = (relativePath: string) => {
    try {
      readFileSync(path.join(projectRoot, relativePath), "utf8");
      return true;
    } catch {
      return false;
    }
  };
  assert(!componentExists("src/components/NewPartnerCycleRingSharingToggle.tsx"), "WP-027: NewPartnerCycleRingSharingToggle.tsx wurde entfernt (kein UI-Schreibweg mehr)");
  assert(!componentExists("src/components/NewPartnerCalendarSharingToggle.tsx"), "NewPartnerCalendarSharingToggle.tsx wurde entfernt");
}

console.log("\n== WP-004 V11: der Partner-Kalender zeigt alle vereinbarten Vorhersagemarker und Überlappungen gleichzeitig ==");
{
  const source = read("src/components/NewPartnerCalendar.tsx");
  assert(source.includes("primaryCalendarPhase"), "die zentrale, geteilte Phasen-Priorität wird wiederverwendet (keine zweite Berechnung)");
  assert(source.includes("showsFertileMarker"), "das fruchtbare Zeitfenster wird über denselben geteilten Zusatzmarker-Mechanismus wie beim Owner-Kalender erkannt");
  assert(source.includes("phasesForDate"), "Überlappungen werden über die zentrale WP-007-Mehrfachphasen-Funktion erkannt");
  assert(source.includes("isUncertain"), "die Unsicherheitskennzeichnung aus der zentralen Vorhersage wird sichtbar gemacht");
  assert(source.includes("Vorhersage unsicher"), "der Text 'Vorhersage unsicher' erscheint im Partner-Kalender");
  assert(source.includes("kann abweichen") || source.includes("Kann abweichen"), "Schätzungen tragen sichtbar 'kann abweichen'");
  assert(!source.includes("fetch("), "der Partner-Kalender bleibt rein lesend, kein schreibender Aufruf");
}

console.log("\n== WP-004 V11: die Partnerseite übergibt keine Rohperioden, IDs, Namen oder Profilwerte an den Client ==");
{
  const source = read("src/app/neu/partner/page.tsx");
  assert(source.includes("calendarView.confirmedDates"), "nur abgeleitete Datumslisten werden übergeben");
  assert(source.includes("calendarView.prediction"), "die zentrale Vorhersage wird unverändert durchgereicht (keine zweite Berechnung in der Seite selbst)");
  assert(!source.includes(".email"), "keine E-Mail-Adresse wird in der Partnerseite referenziert");
  assert(!source.includes("profile"), "kein Profilwert wird in der Partnerseite referenziert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
