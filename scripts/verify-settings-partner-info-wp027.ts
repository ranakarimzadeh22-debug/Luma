import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const page = read("src/app/neu/einstellungen/page.tsx");

console.log("\n== WP-027: der alte Schalter und sein UI-Schreibweg sind von /neu/einstellungen entfernt ==");
{
  assert(!existsSync(path.join(root, "src/components/NewPartnerCycleRingSharingToggle.tsx")), "die Schalter-Komponente existiert nicht mehr");
  assert(!/NewPartnerCycleRingSharingToggle|Zyklus-Kreis für Partner freigeben|Freigabe ausschalten|Freigabe einschalten|aria-pressed|cycleRingShared/.test(page), "die Einstellungsseite enthält weder Schalter noch Schalter-Texte noch den Freigabewert");
  const uiFiles = ["src/app/neu/einstellungen/page.tsx", "src/components/NewPartnerCodeCard.tsx", "src/components/NewOwnerMobileNav.tsx"];
  assert(uiFiles.every((file) => !read(file).includes("cycle-ring-sharing")), "kein UI-Code ruft die Route cycle-ring-sharing mehr auf");
}

console.log("\n== WP-027: reine Info-Karte nur bei aktiver Partnerverbindung ==");
{
  assert(page.includes("Aktive Partnerverbindung") && page.includes("Dein Partner sieht Kalender und Zyklus-Kreis."), "Titel und Text der Info-Karte exakt wie vorgegeben");
  const guardIndex = page.indexOf('status.connected && status.role === "owner" && (');
  const titleIndex = page.indexOf("Aktive Partnerverbindung");
  const textIndex = page.indexOf("Dein Partner sieht Kalender und Zyklus-Kreis.");
  assert(guardIndex !== -1 && guardIndex < titleIndex && guardIndex < textIndex, "beide Texte stehen nur hinter der Bedingung 'aktive Verbindung'");
  assert((page.match(/Dein Partner sieht/g) ?? []).length === 1 && (page.match(/Aktive Partnerverbindung/g) ?? []).length === 1, "der positive Text kommt genau einmal vor (kein zweiter, unbedingter Text)");
  const card = page.slice(guardIndex, page.indexOf(")}", guardIndex));
  assert(!/<button|<a |<Link|onClick|<form|<input|"use client"|fetch\(/.test(card), "die Karte ist nicht anklickbar und enthält keine Aktion");
  assert(page.includes("getPartnerConnectionStatusForOwner(session.userId)") && !/await [a-zA-Z]+\(/.test(page.slice(page.indexOf("const status")).replace(/const status = await getPartnerConnectionStatusForOwner\(session.userId\);/, "").split("return (")[0]), "die Karte nutzt nur den bereits vorhandenen Verbindungsstatus, keine neue Abfrage");
  assert(page.includes("NewPartnerCodeCard isConnected={status.connected}"), "der bestehende Verbindungsbereich bleibt unverändert");
}

console.log("\n== WP-027: Gate, Partnerdaten und API unverändert ==");
{
  const view = read("src/lib/new-partner-cycle-view.ts");
  assert(view.includes("partner_user_id = $1 AND status = 'active' LIMIT 1") && !/AND\s+cycle_ring_shared/.test(view), "das serverseitige aktive Verbindungs-Gate bleibt (WP-027)");
  assert(existsSync(path.join(root, "src/app/api/neu/partner/cycle-ring-sharing/route.ts")) && read("src/lib/new-partner.ts").includes("export async function setPartnerCycleRingShared"), "Route und Setter bleiben unverändert bestehen (kein API-Eingriff)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
