import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagePath = path.join(projectRoot, "src", "app", "neu", "einstellungen", "page.tsx");
const source = readFileSync(pagePath, "utf8");

console.log("\n== WP-004 V13: beide Überschriften sind sichtbar und in der vereinbarten Reihenfolge ==");
{
  const partnerIndex = source.indexOf(">Partnerverbindung<");
  const accountIndex = source.indexOf(">Konto<");
  assert(partnerIndex !== -1, "die Überschrift 'Partnerverbindung' ist im Quelltext vorhanden");
  assert(accountIndex !== -1, "die Überschrift 'Konto' ist im Quelltext vorhanden");
  assert(partnerIndex !== -1 && accountIndex !== -1 && partnerIndex < accountIndex, "'Partnerverbindung' steht im Quelltext vor 'Konto'");
}

console.log("\n== WP-004 V13: Partnerverbindung steht über NewPartnerCodeCard, Konto über NewLogoutButton ==");
{
  const partnerIndex = source.indexOf(">Partnerverbindung<");
  const codeCardIndex = source.indexOf("<NewPartnerCodeCard");
  const accountIndex = source.indexOf(">Konto<");
  const logoutIndex = source.indexOf("<NewLogoutButton");
  assert(partnerIndex !== -1 && codeCardIndex !== -1 && partnerIndex < codeCardIndex, "'Partnerverbindung' steht im Quelltext vor NewPartnerCodeCard");
  assert(accountIndex !== -1 && logoutIndex !== -1 && accountIndex < logoutIndex, "'Konto' steht im Quelltext vor NewLogoutButton");
  assert(codeCardIndex < accountIndex, "NewPartnerCodeCard steht vollständig vor dem 'Konto'-Abschnitt (keine Vermischung)");
}

console.log("\n== WP-004 V13: keine leere dritte Kategorie 'App' ==");
{
  assert(!source.includes(">App<"), "es gibt keine Überschrift 'App'");
}

console.log("\n== WP-004 V13: keine neue Interaktion, kein neuer Datenabruf, keine neue Route ==");
{
  assert(!source.includes("fetch("), "die Seite selbst löst keinen eigenen Netzwerkaufruf aus");
  assert(source.includes("getPartnerConnectionStatusForOwner(session.userId)"), "der bestehende Verbindungsstatus-Abruf bleibt unverändert");
  assert(source.includes("isConnected={status.connected}"), "NewPartnerCodeCard erhält weiterhin denselben Prop wie zuvor");
}

console.log("\n== WP-004 V13: NewPartnerCodeCard und NewLogoutButton selbst bleiben unverändert (nicht Teil dieser Version) ==");
{
  const codeCardPath = path.join(projectRoot, "src", "components", "NewPartnerCodeCard.tsx");
  const logoutButtonPath = path.join(projectRoot, "src", "components", "NewLogoutButton.tsx");
  const codeCardSource = readFileSync(codeCardPath, "utf8");
  const logoutButtonSource = readFileSync(logoutButtonPath, "utf8");
  assert(codeCardSource.includes("/api/neu/partner/code"), "NewPartnerCodeCard ruft weiterhin dieselbe bestehende Route auf");
  assert(codeCardSource.includes("/api/neu/partner/end"), "NewPartnerCodeCard ruft weiterhin dieselbe bestehende Widerrufsroute auf");
  assert(logoutButtonSource.includes("/api/neu/auth/logout"), "NewLogoutButton ruft weiterhin dieselbe bestehende Route auf");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
