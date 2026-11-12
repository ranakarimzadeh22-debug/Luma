import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = readFileSync(path.join(root, "src/app/neu/einstellungen/page.tsx"), "utf8");

console.log("\n== WP-031: Bereich Mein Zyklus vor Partnerverbindung ==");
{
  const mine = page.indexOf(">Mein Zyklus</h2>");
  const partner = page.indexOf(">Partnerverbindung</h2>");
  const account = page.indexOf(">Konto</h2>");
  assert(mine !== -1 && partner !== -1 && account !== -1 && mine < partner && partner < account, "Reihenfolge: Mein Zyklus, Partnerverbindung, Konto");
  assert(page.includes("Diese Angaben helfen bei der Schätzung."), "Kurztext exakt");
  assert(page.includes('href="/neu/zyklusprofil"') && page.includes("Zyklusprofil bearbeiten"), "Link zu /neu/zyklusprofil mit Text 'Zyklusprofil bearbeiten'");
}

console.log("\n== WP-031: keine neue Datenabfrage, Speicherung oder Eingabe ==");
{
  assert(!/getNewCycleProfile|fetch\(|<input|<form|<select|<textarea|"use client"/.test(page), "keine neue Abfrage, kein Formular, keine Eingabe");
  assert((page.match(/await /g) ?? []).length === 2, "weiterhin nur Session und Partnerstatus werden geladen");
  assert(page.includes("if (!session) redirect(\"/neu/rolle\")"), "bestehende Zugriffsprüfung unverändert");
  assert(page.includes("<NewPartnerCodeCard isConnected={status.connected} />") && page.includes("Aktive Partnerverbindung") && page.includes("<NewLogoutButton />"), "Partner-, Info- und Konto-Bereich unverändert");
  assert(!/overflow-x|w-\[\d+px\]|min-w-\[\d+/.test(page), "keine starre Breite");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
