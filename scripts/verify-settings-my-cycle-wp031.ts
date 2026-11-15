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

console.log("\n== WP-031 (zurückgenommen): die Karte Mein Zyklus ist aus den Einstellungen entfernt ==");
{
  assert(!/Mein Zyklus|Zyklusprofil bearbeiten|Diese Angaben helfen bei der Schätzung|zyklusprofil/.test(page), "kein Titel, Text oder Link zum Zyklusprofil mehr auf der Einstellungsseite");
  const partner = page.indexOf(">Partnerverbindung</h2>");
  const account = page.indexOf(">Konto</h2>");
  assert(partner !== -1 && account !== -1 && partner < account, "Reihenfolge: Partnerverbindung, Konto");
}

console.log("\n== Partnerbereich, Konto und Zugriff unverändert ==");
{
  assert(!/getNewCycleProfile|fetch\(|<input|<form|"use client"/.test(page), "keine Abfrage, kein Formular, keine Eingabe");
  assert((page.match(/await /g) ?? []).length === 2, "weiterhin nur Session und Partnerstatus werden geladen");
  assert(page.includes("if (!session) redirect(\"/neu/rolle\")"), "bestehende Zugriffsprüfung unverändert");
  assert(page.includes("<NewPartnerCodeCard isConnected={status.connected} />") && page.includes("Aktive Partnerverbindung") && page.includes("<NewLogoutButton />") && page.includes("<NewOwnerMobileNav />"), "Partner-, Info-, Konto-Bereich und Navigation unverändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
