import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const source = await readFile("scripts/reset-new-luma-password.mjs", "utf8");

console.log("== Kein Passwort als Kommandozeilen-Argument oder Umgebungsvariable ==");
{
  const argvUsages = [...source.matchAll(/process\.argv\[(\d+)\]/g)];
  const onlyUsedForMainModuleCheck =
    argvUsages.length > 0 && argvUsages.every((match) => match[1] === "1") && /isMainModule/.test(source);
  assert(
    argvUsages.length === 0 || onlyUsedForMainModuleCheck,
    "process.argv wird höchstens zur Erkennung des Direktaufrufs genutzt, nie zum Einlesen eines Passworts",
  );
  assert(!/process\.env\.[A-Z_]*PASSWORD/i.test(source), "das Skript liest kein Passwort aus einer Umgebungsvariable");
}

console.log("\n== Keine Geheimnisse werden ausgegeben oder geloggt ==");
{
  assert(!/console\.(log|error|warn)\([^)]*newPassword/i.test(source), "newPassword wird nirgends direkt geloggt");
  assert(!/console\.(log|error|warn)\([^)]*passwordHash/i.test(source), "passwordHash wird nirgends geloggt");
  assert(!/console\.(log|error|warn)\([^)]*connectionString/i.test(source), "die Datenbankverbindung wird nirgends geloggt");
}

console.log("\n== Maskierte Eingabe stoppt sicher ohne TTY, statt sichtbar einzulesen ==");
{
  assert(/isTTY/.test(source), "das Skript prüft auf ein interaktives TTY");
  assert(/setRawMode/.test(source), "das Skript nutzt Raw-Mode für die maskierte Eingabe");
  assert(/reject\(new Error/.test(source), "ohne TTY wird die maskierte Eingabe mit einem Fehler abgelehnt statt sichtbar zu lesen");
}

console.log("\n== Bestätigung vor der Datenbankänderung ==");
{
  assert(/confirmationEmail/.test(source), "die Kernfunktion verlangt eine Bestätigungs-E-Mail vor der Änderung");
  assert(/normalizedConfirmation !== normalizedEmail/.test(source), "abweichende Bestätigung wird geprüft, bevor irgendetwas geschrieben wird");
}

console.log("\n== Datenbankänderung ist transaktional und auf genau ein Konto begrenzt ==");
{
  assert(/BEGIN/.test(source) && /COMMIT/.test(source) && /ROLLBACK/.test(source), "Update und Sitzungslöschung laufen in einer Transaktion mit Rollback bei Fehler");
  assert(/rowCount !== 1/.test(source), "die Änderung bricht ab, wenn nicht genau ein Konto gefunden wird");
}

console.log("\n== Ziel-Datenbank wird gegen luma_core geprüft ==");
{
  assert(/luma_core/.test(source), "das Skript prüft die Ziel-Datenbank auf luma_core");
}

console.log("\n== Kein Bezug zur alten Luma, zu Partnerdaten oder Zyklus-/Gesundheitsdaten ==");
{
  assert(!/app_luma|prisma|NextAuth|partner|period|cycle|zyklus/i.test(source), "das Skript berührt ausschließlich new_users/new_sessions, keine anderen Domänen");
}

console.log("\n== Das Skript ist nicht öffentlich verlinkt (keine Route, Seite oder Navigation referenziert es) ==");
{
  async function listTsFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await listTsFiles(fullPath)));
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const appFiles = await listTsFiles("src");
  let referenced = false;
  for (const file of appFiles) {
    const content = await readFile(file, "utf8");
    if (content.includes("reset-new-luma-password") || content.includes("resetNewLumaPassword")) {
      referenced = true;
      console.log(`   gefunden in: ${file}`);
    }
  }
  assert(!referenced, "kein Datei unter src/ referenziert das Skript oder seine Funktion");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
