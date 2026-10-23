import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const view = stripComments(read("src/lib/new-partner-cycle-view.ts"));
const page = read("src/app/neu/partner/page.tsx");
const ring = read("src/components/NewPartnerCycleRing.tsx");
const panel = read("src/components/CycleOverviewPanel.tsx");

console.log("\n== WP-027: die aktive Verbindung ist der alleinige serverseitige Gate ==");
{
  const resolver = view.slice(view.indexOf("async function resolveActiveConnectionOwner"));
  assert(resolver.includes("partner_user_id = $1") && resolver.includes("status = 'active'") && resolver.includes("LIMIT 1"), "die Abfrage prüft Partner-Konto und aktive Verbindung");
  assert(!view.includes("cycle_ring_shared"), "cycle_ring_shared kommt im Partner-Zyklus-View nicht mehr vor");
  assert(view.indexOf("resolveActiveConnectionOwner(partnerUserId)") < view.indexOf("getNewPeriodEntries(ownerUserId)") && view.includes("if (!ownerUserId) return null;"), "ohne aktive Verbindung wird null geliefert, bevor Owner-Daten geladen werden");
  assert(view.includes("computePersonalCycleView(") && view.includes("predictCycle(") && view.includes("deriveManualPmsSection("), "dieselbe bestehende Datenableitung wird weiter genutzt (keine neue Quelle)");
  assert(!/INSERT|UPDATE|DELETE/i.test(view), "der View führt keine Schreiboperation aus");
}

console.log("\n== WP-027: /neu/partner zeigt den Kreis bei aktiver Verbindung oberhalb des Kalenders ==");
{
  assert(page.includes("status.connected ? await getPartnerCycleView(session.userId) : null"), "der Zyklus-View wird nur bei aktiver Verbindung geladen");
  const ringIndex = page.indexOf("<NewPartnerCycleRing");
  const calendarIndex = page.indexOf("<NewPartnerCalendar");
  assert(ringIndex !== -1 && calendarIndex !== -1 && ringIndex < calendarIndex, "der Kreis steht im Quelltext vor dem Kalender");
  assert(page.includes("{cycleView && (") && !/cycleRingShared|cycle_ring_shared/.test(page), "die Seite koppelt den Kreis nur an den vorhandenen View, nicht an ein altes Flag");
}

console.log("\n== WP-027: die Partner-Darstellung bleibt vollständig read-only ==");
{
  for (const [name, source] of [["NewPartnerCycleRing", ring], ["CycleOverviewPanel", panel]] as const) {
    assert(!/<button|<form|<input|<textarea|onClick|onChange|onSubmit|fetch\(|"use client"/.test(source), `${name} enthält keine Eingabe, keine Aktion und keinen Netzwerkaufruf`);
  }
  assert(!page.includes("setPartnerCycleRingShared") && !page.includes("cycle-ring-sharing"), "die Partnerseite kann das Flag nicht ändern");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
