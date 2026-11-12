import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "src/components/NewCycleProfileWizard.tsx"), "utf8");
const start = source.indexOf("{step === 0 && (");
const end = source.indexOf("{step === 1 && (");
const block = start !== -1 && end !== -1 ? source.slice(start, end) : "";
const input = block.slice(block.indexOf("<input"), block.indexOf("/>", block.indexOf("<input")));

console.log("\n== WP-032: das Datumsfeld ist immer bedienbar ==");
{
  assert(input.includes('type="date"') && input.includes("max={today}"), "natives Datumsfeld mit Maximum 'heute' bleibt");
  assert(!/disabled/.test(input), "das Datumsfeld ist nie deaktiviert (auch nicht nach 'Ich weiß es nicht' oder bei gespeichertem 'unbekannt')");
  assert(!/readOnly|readonly|pointer-events-none/.test(input), "das Datumsfeld ist nicht schreibgeschützt");
  assert(input.includes("onChange={(event) => setDraft({ ...draft, lastPeriodStart: event.target.value, lastPeriodUnknown: false })}"), "eine Eingabe setzt 'unbekannt' zurück und speichert das Datum");
}

console.log("\n== WP-032: übrige Bedienung unverändert ==");
{
  assert(block.includes("aria-pressed={draft.lastPeriodUnknown}") && block.includes("✓ Ich weiß es nicht"), "Unbekannt-Status ist sichtbar (gedrückter Zustand, Haken, Hinweis)");
  assert(block.includes("lastPeriodStart: \"\", lastPeriodUnknown: !draft.lastPeriodUnknown"), "Klick leert das Datum neutral und schaltet den Unbekannt-Status um");
  assert(block.includes("key={dateResetKey}") && block.includes("setDateResetKey((current) => current + 1)"), "Klick setzt das native Feld zurück (auch halb getippte Eingaben)");
  assert(block.includes("Du kannst direkt mit „Weiter“ fortfahren"), "Hinweis: Weiter ohne Datum möglich");
  assert(source.includes("draft.lastPeriodUnknown || Boolean(draft.lastPeriodStart)"), "Weiter-Bedingung für Frage 1 unverändert");
  assert(source.includes("Bitte beantworte die Frage oder wähle „Ich weiß es nicht“."), "Hinweis bei fehlender Eingabe unverändert");
  assert(source.includes('lastPeriodStart: draft.lastPeriodUnknown ? null : draft.lastPeriodStart || null'), "Speicher-Payload unverändert");
  assert((source.match(/disabled=\{draft\./g) ?? []).length === 1, "das Zahlenfeld der Zykluslänge (Frage 3) bleibt unverändert (Frage 2: siehe V2-Skript)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
