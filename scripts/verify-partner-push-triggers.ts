import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { todayBerlinDateOnly } from "../src/lib/berlin-date";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

console.log("\n== WP-004 V4: todayBerlinDateOnly liefert ein YYYY-MM-DD-Datum ==");
{
  const today = todayBerlinDateOnly();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(today), "das Ergebnis hat das Format YYYY-MM-DD");

  // Ein fester Zeitpunkt kurz nach Mitternacht UTC, an dem Europe/Berlin
  // (UTC+1 im Winter, UTC+2 im Sommer) bereits den nächsten Kalendertag hat.
  const summerMidnightUtc = new Date("2026-06-01T22:30:00Z");
  assertEqual(todayBerlinDateOnly(summerMidnightUtc), "2026-06-02", "22:30 UTC im Sommer ist in Europe/Berlin (UTC+2) bereits der nächste Tag");

  const beforeMidnightUtc = new Date("2026-06-01T20:00:00Z");
  assertEqual(todayBerlinDateOnly(beforeMidnightUtc), "2026-06-01", "20:00 UTC im Sommer ist in Europe/Berlin (22:00 Ortszeit) noch derselbe Tag");
}

console.log("\n== WP-004 V4: POST /api/neu/periods löst Ereignisse nur bei einem echten heutigen Start/Ende aus ==");
{
  const routePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "app",
    "api",
    "neu",
    "periods",
    "route.ts",
  );
  const source = readFileSync(routePath, "utf8");

  const usesBerlinToday = source.includes("todayBerlinDateOnly()");
  assert(usesBerlinToday, "die POST-Route nutzt todayBerlinDateOnly statt der Server-Systemzeitzone");

  const dispatchesStart =
    source.includes('result.entry.startDate === today') && source.includes('"period_started"');
  assert(dispatchesStart, "ein heutiger Start löst dispatchPartnerPeriodEvent mit 'period_started' aus");

  const dispatchesEnd = source.includes('result.entry.endDate === today') && source.includes('"period_ended"');
  assert(dispatchesEnd, "ein heutiges Ende löst dispatchPartnerPeriodEvent mit 'period_ended' aus");

  const isFireAndForget = /void dispatchPartnerPeriodEvent/.test(source);
  assert(isFireAndForget, "der Versand ist fire-and-forget (void) und blockiert die Antwort nicht");
}

console.log("\n== WP-004 V4: PUT .../periods/[id] löst nur bei einem NEU hinzugekommenen heutigen Start/Ende aus ==");
{
  const routePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "app",
    "api",
    "neu",
    "periods",
    "[id]",
    "route.ts",
  );
  const source = readFileSync(routePath, "utf8");

  const comparesPrevious =
    source.includes("result.previousEntry?.startDate !== today") &&
    source.includes("result.previousEntry?.endDate !== today");
  assert(comparesPrevious, "die PUT-Route vergleicht den vorherigen Zustand, damit ein bereits heute bestätigter Wert kein zweites Ereignis auslöst (Wiederholtes Speichern desselben Zustands)");

  const usesBerlinToday = source.includes("todayBerlinDateOnly()");
  assert(usesBerlinToday, "die PUT-Route nutzt ebenfalls todayBerlinDateOnly");
}

console.log("\n== WP-004 V4: new-periods.ts liefert den vorherigen Zustand für den Vergleich ==");
{
  const libPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "lib",
    "new-periods.ts",
  );
  const source = readFileSync(libPath, "utf8");
  assert(source.includes("previousEntry"), "updateNewPeriodEntry gibt den Zustand vor dem Update zurück, damit die Route ihn mit dem neuen Zustand vergleichen kann");
}

console.log("\n== WP-004 V4: Push-Endpunkte/Schlüssel erscheinen nicht in Fehlermeldungen der Subscription-Route ==");
{
  const routePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "app",
    "api",
    "neu",
    "partner",
    "push-subscription",
    "route.ts",
  );
  const source = readFileSync(routePath, "utf8");
  const errorMessages = [...source.matchAll(/error:\s*"([^"]*)"/g)].map((m) => m[1]);
  const anyErrorLeaksSecret = errorMessages.some((message) => /endpoint|p256dh|auth[^a-z]/i.test(message));
  assert(errorMessages.length > 0 && !anyErrorLeaksSecret, "keine Fehlermeldung enthält den Endpunkt oder Push-Schlüssel im Text");

  const requiresActiveConnection = source.includes("getPartnerConnectionStatusForPartner") && source.includes("status.connected");
  assert(requiresActiveConnection, "das Speichern einer Subscription erfordert eine aktive Partnerverbindung");

  const checksOrigin = source.includes("requestHasAllowedOrigin");
  assert(checksOrigin, "die Route prüft die Herkunft der Anfrage");

  const rateLimited = source.includes("consumeNewAuthRateLimit");
  assert(rateLimited, "die Route ist rate-limitiert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
