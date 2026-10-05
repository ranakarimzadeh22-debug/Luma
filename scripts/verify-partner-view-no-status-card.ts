import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const pagePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "app",
  "neu",
  "partner",
  "page.tsx",
);
const source = readFileSync(pagePath, "utf8");

console.log("\n== WP-004 V10: verbundener Zustand und nicht verbundener Zustand sind getrennte Rückgabepfade ==");
{
  const connectedBranchStart = source.indexOf("if (status.connected) {");
  assert(connectedBranchStart !== -1, "es gibt einen eigenen frühen Rückgabepfad für den verbundenen Zustand");

  const disconnectedReturnMatch = /\r?\n {2}return \(\r?\n {4}<main/.exec(source.slice(connectedBranchStart + 1));
  const connectedBlock =
    connectedBranchStart !== -1 && disconnectedReturnMatch
      ? source.slice(connectedBranchStart, connectedBranchStart + 1 + disconnectedReturnMatch.index)
      : "";

  assert(!connectedBlock.includes("Verbindung aktiv"), "der verbundene Zustand zeigt keinen Text 'Verbindung aktiv' mehr");
  assert(!connectedBlock.includes("NewPartnerEndButton"), "der verbundene Zustand rendert keinen NewPartnerEndButton mehr");
  assert(!connectedBlock.includes("NewLogoutButton"), "der verbundene Zustand rendert keinen NewLogoutButton mehr");
  assert(connectedBlock.includes("NewPartnerCycleRing"), "der Zyklus-Kreis bleibt im verbundenen Zustand erhalten (bei Freigabe)");
  assert(connectedBlock.includes("NewPartnerCalendar"), "der Kalender bleibt im verbundenen Zustand erhalten (bei Freigabe)");
  assert(connectedBlock.includes("Keine freigegebene Information."), "die neutrale Meldung ohne Kalenderfreigabe bleibt im verbundenen Zustand erhalten");
  assert(connectedBlock.includes("NewPartnerNotificationPreference"), "die Benachrichtigungs-Auswahl bleibt im verbundenen Zustand erhalten");
}

console.log("\n== WP-004 V10: der nicht verbundene Code-Eingabeweg bleibt unverändert ==");
{
  const disconnectedBranchStart = source.lastIndexOf("return (");
  const disconnectedBlock = source.slice(disconnectedBranchStart);
  assert(disconnectedBlock.includes("Verbindungscode eingeben"), "der nicht verbundene Zustand zeigt weiterhin 'Verbindungscode eingeben'");
  assert(disconnectedBlock.includes("NewPartnerRedeemForm"), "der nicht verbundene Zustand zeigt weiterhin das Code-Eingabeformular");
  assert(disconnectedBlock.includes("NewLogoutButton"), "der nicht verbundene Zustand behält den Abmelden-Button");
}

console.log("\n== WP-004 V10: keine neue schreibende Partneraktion, keine Freigabe-/Datenableitung verändert ==");
{
  assert(!source.includes("fetch(\"/api/neu/partner/"), "die Seite selbst löst keinen schreibenden Partner-API-Aufruf aus (serverseitiges Rendering bleibt rein lesend)");
  assert(source.includes("getPartnerCalendarView(session.userId)"), "die Kalenderdaten werden unverändert über die bestehende, freigabegeprüfte Funktion geladen");
  assert(source.includes("getPartnerCycleView(session.userId)"), "die Kreisdaten werden unverändert über die bestehende, freigabegeprüfte Funktion geladen");
}

console.log("\n== WP-004 V10: keine Komponente wurde gelöscht, nur die Einbindung auf dieser Seite entfernt ==");
{
  const endButtonFileExists = (() => {
    try {
      readFileSync(
        path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerEndButton.tsx"),
        "utf8",
      );
      return true;
    } catch {
      return false;
    }
  })();
  assert(endButtonFileExists, "NewPartnerEndButton.tsx besteht als Datei weiterhin (nicht gelöscht, nur hier nicht mehr eingebunden)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
