import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calendarBandBorderClassName, calendarBandPosition } from "../src/lib/calendar-band-position";

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

console.log("\n== WP-022 Korrektur V2: calendarBandPosition erkennt Start/Mitte/Ende innerhalb einer Woche ==");
{
  // Eine Woche (7 Zellen): drei zusammenhängende "period"-Tage in der Mitte.
  const week = [null, "period", "period", "period", null, null, null];
  assertEqual(calendarBandPosition(week, 0), null, "eine leere Zelle hat keine Bandposition");
  assertEqual(calendarBandPosition(week, 1), "start", "der erste Tag eines zusammenhängenden Abschnitts ist 'start'");
  assertEqual(calendarBandPosition(week, 2), "middle", "der mittlere Tag ist 'middle'");
  assertEqual(calendarBandPosition(week, 3), "end", "der letzte Tag ist 'end'");
  assertEqual(calendarBandPosition(week, 4), null, "ein Tag ohne Bandfarbe hat keine Position");
}

console.log("\n== WP-022 Korrektur V2: ein einzelner isolierter Tag wird als 'single' erkannt ==");
{
  const week = [null, "pms", null, null, null, null, null];
  assertEqual(calendarBandPosition(week, 1), "single", "ein einzelner Tag ohne gleichfarbige Nachbarn ist 'single'");
}

console.log("\n== WP-022 Korrektur V2: unterschiedliche Bandfarben nebeneinander beenden den Abschnitt (keine fachliche Vermischung) ==");
{
  const week = ["confirmed", "confirmed", "pms", "pms", "pms", null, null];
  assertEqual(calendarBandPosition(week, 0), "start", "erster 'confirmed'-Tag ist 'start'");
  assertEqual(calendarBandPosition(week, 1), "end", "zweiter 'confirmed'-Tag ist 'end', da Nachbar eine andere Farbe hat");
  assertEqual(calendarBandPosition(week, 2), "start", "erster 'pms'-Tag nach einem Farbwechsel ist wieder 'start'");
  assertEqual(calendarBandPosition(week, 3), "middle", "mittlerer 'pms'-Tag ist 'middle'");
  assertEqual(calendarBandPosition(week, 4), "end", "letzter 'pms'-Tag vor einer leeren Zelle ist 'end'");
}

console.log("\n== WP-022 Korrektur V2: bei Wochenumbruch beginnt das Band in der nächsten Zeile neu (keine Verbindung über Wochengrenzen) ==");
{
  // Zwei Wochen hintereinander (14 Zellen): "period" endet an Index 6 (Wochenende),
  // setzt an Index 7 (neue Woche, gleiche Spalte wie Wochenanfang) fort.
  const twoWeeks = [
    "period", "period", "period", "period", "period", "period", "period", // Woche 1: komplett period
    "period", null, null, null, null, null, null, // Woche 2: nur der erste Tag ist period
  ];
  assertEqual(calendarBandPosition(twoWeeks, 6), "end", "letzter Tag der ersten Woche ist 'end' (nicht 'middle'), obwohl der Folgetag (andere Woche) denselben Wert hat");
  assertEqual(calendarBandPosition(twoWeeks, 7), "single", "erster Tag der zweiten Woche ist 'single' (kein Rückbezug auf die Vorwoche)");
}

console.log("\n== WP-022 Korrektur V2: keine fachliche Phasenlogik wird in der Hilfsfunktion dupliziert ==");
{
  const bandPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "calendar-band-position.ts");
  const bandSource = readFileSync(bandPath, "utf8");
  assert(!bandSource.includes("daysBetween") && !bandSource.includes("cycleLengthDays") && !bandSource.includes("todayKey"), "calendarBandPosition enthält keine eigene Datums-, Zyklus- oder Phasenableitung");
  assert(bandSource.split("\n").filter((line) => line.trim().length > 0).length < 70, "die Hilfsfunktion bleibt klein und rein darstellend (keine versteckte fachliche Logik)");
}

console.log("\n== WP-022 Korrektur V8: Umrandung hohler Bänder folgt der Bandposition ==");
{
  assertEqual(calendarBandBorderClassName("single"), "border-2", "einzelner Tag: vollständiger Umriss");
  assertEqual(calendarBandBorderClassName("start"), "border-y-2 border-l-2", "Start: oben, unten, links");
  assertEqual(calendarBandBorderClassName("middle"), "border-y-2", "Mitte: nur oben und unten (keine senkrechte Naht)");
  assertEqual(calendarBandBorderClassName("end"), "border-y-2 border-r-2", "Ende: oben, unten, rechts");
  assertEqual(calendarBandBorderClassName(null), "", "ohne Band keine Umrandung");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
