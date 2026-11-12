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
const start = source.indexOf("{step === 1 && (");
const end = source.indexOf("{step === 2 && (");
const block = start !== -1 && end !== -1 ? source.slice(start, end) : "";
const input = block.slice(block.indexOf("<input"), block.indexOf("/>", block.indexOf("<input")));

console.log("\n== WP-032 V2: Zahlenfeld 'Anzahl der Tage' in Frage 2 ist bedienbar ==");
{
  assert(input.includes('type="number"') && input.includes('min="1"') && input.includes('max="366"') && input.includes('inputMode="numeric"'), "Zahlenfeld mit bestehenden Grenzen 1 bis 366");
  assert(!/disabled/.test(input), "das Zahlenfeld ist nie deaktiviert (auch nicht bei 'Ich weiß es nicht' oder gespeichertem 'unbekannt')");
  assert(!/readOnly|readonly|pointer-events-none/.test(input), "das Zahlenfeld ist nicht schreibgeschützt");
  assert(input.includes("onChange={(event) => setDraft({ ...draft, bleedingDurationDays: event.target.value, bleedingDurationUnknown: false })}"), "eine Eingabe setzt 'unbekannt' zurück und speichert die Zahl");
}

console.log("\n== WP-032 V2: übriges Verhalten unverändert ==");
{
  assert(block.includes('setDraft({ ...draft, bleedingDurationDays: "", bleedingDurationUnknown: true })'), "'Ich weiß es nicht' in Frage 2 unverändert");
  assert(source.includes("draft.bleedingDurationUnknown || Boolean(draft.bleedingDurationDays)"), "Weiter-Bedingung für Frage 2 unverändert");
  assert(source.includes("Number(draft.bleedingDurationDays) || null"), "Payload unverändert");
  assert(source.includes("key={dateResetKey}") && !/<input[^>]*type="date"[^>]*disabled/.test(source), "Datumsfeld aus Version 1 unverändert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
