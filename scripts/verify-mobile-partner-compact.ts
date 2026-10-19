import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const pagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "neu", "partner", "page.tsx");
const pageSource = readFileSync(pagePath, "utf8");

const partnerRingPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCycleRing.tsx");
const partnerRingSource = readFileSync(partnerRingPath, "utf8");

const partnerCalendarPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewPartnerCalendar.tsx");
const partnerCalendarSource = readFileSync(partnerCalendarPath, "utf8");

const ownerComponentPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewCycleExample.tsx");
const ownerComponentSource = readFileSync(ownerComponentPath, "utf8");

console.log("\n== WP-017: die Partner-Seitenhülle wird mobil verdichtet, ab sm unverändert ==");
{
  assert(
    pageSource.includes('className="min-h-screen bg-neutral-50 px-3 py-10 sm:px-6"'),
    "der äußere main-Container nutzt mobil ein engeres px-3 (statt px-6), damit die Kalenderzellen trotz Karten-Innenabstand genug Platz für 40px behalten",
  );
  assert(
    pageSource.includes('className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-8"'),
    "die Karten-Hülle nutzt mobil gap-4/p-4, ab sm weiterhin gap-6/p-8 wie vor WP-017",
  );
}

console.log("\n== WP-017: NewPartnerCycleRing rendert den Ring über zwei CSS-Wrapper (sm:hidden / hidden sm:block), kein JS-Breakpoint ==");
{
  assert(partnerRingSource.includes('<div className="sm:hidden">'), "ein Wrapper ist unterhalb sm sichtbar (sm:hidden)");
  assert(partnerRingSource.includes('<div className="hidden sm:block">'), "ein Wrapper ist ab sm sichtbar (hidden sm:block)");
  assert(
    partnerRingSource.includes("<CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} compact />"),
    "der mobile Partner-Ring-Aufruf setzt compact (dieselbe, bereits seit WP-016 bestehende reine Darstellungsprop)",
  );
  assert(
    partnerRingSource.includes("<CyclePersonalRing personalCycleView={personalCycleView} today={today} manualPmsOverride={manualPmsOverride} />"),
    "der breite Partner-Ring-Aufruf (ab sm) bleibt ohne compact, identisch zum vorherigen Stand",
  );
  assert(!partnerRingSource.includes("matchMedia") && !partnerRingSource.includes("useMediaQuery"), "kein JS-Media-Query-Hook wurde eingeführt, reiner CSS-Ansatz");
}

console.log("\n== WP-017: buildPersonalRingGeometry/manualPmsOverride werden durch die Partner-Verdichtung nicht berührt ==");
{
  assert(
    partnerRingSource.includes("manualPmsOverride: ManualPmsRingOverride | null;"),
    "manualPmsOverride bleibt eine Pflichtprop, unverändert aus manual-pms.ts abgeleitet (keine neue Logik)",
  );
}

console.log("\n== WP-017: der Partner-Kalender nutzt CalendarTodayLine ausschließlich über die bereits vorhandene compact-Prop ==");
{
  assert(partnerCalendarSource.includes("<CalendarTodayLine today={todayKey} compact />"), "CalendarTodayLine erhält compact, keine neue Prop wurde eingeführt");
}

console.log("\n== WP-017: Partner-Monatsüberschrift, Wochentage und Haupt-Tageszahl sind mobil kleiner, ab sm unverändert ==");
{
  assert(
    partnerCalendarSource.includes('<h2 className="text-center text-lg font-semibold capitalize text-neutral-950 sm:text-xl">{monthName}</h2>'),
    "die Monatsüberschrift nutzt mobil text-lg, ab sm weiterhin die bisherige text-xl",
  );
  assert(
    partnerCalendarSource.includes('className="pb-0.5 text-[11px] font-medium text-neutral-500 sm:pb-1 sm:text-xs"'),
    "die Wochentag-Labels sind mobil kleiner (11px statt 12px), ab sm weiterhin text-xs wie vor WP-017",
  );
  // WP-022 Korrektur V4: die Kachel ist transparent (bg-transparent, z-10,
  // ohne overflow-hidden) statt der V2-Zwischenstufe (bg-white), da das
  // Phasenband seither als breites, zentriertes Pillen-Band außerhalb der
  // Kachel liegt und über deren Rand hinausragen muss. WP-022 Korrektur V5:
  // der Rand selbst ist seither bedingt (Template-Literal statt statischem
  // String), damit Tage mit sichtbarem Band keinen eigenen Rand mehr zeigen
  // — die responsive Tageszahl-Größe selbst (text-xs unterhalb sm, text-sm
  // ab sm) bleibt davon unberührt und unverändert bestehen.
  assert(
    partnerCalendarSource.includes('relative z-10 grid h-full w-full place-items-center rounded-xl border bg-transparent text-xs text-neutral-700 sm:text-sm'),
    "die Haupt-Tageszahl ist mobil text-xs, ab sm weiterhin die bisherige text-sm",
  );
  assert(
    partnerCalendarSource.includes('className="space-y-3 sm:space-y-5"'),
    "der äußere Kalenderabstand ist mobil enger (space-y-3), ab sm weiterhin space-y-5 wie vor WP-017",
  );
}

console.log("\n== WP-017: Partner-Monatspfeile erhalten eine garantierte Mindest-Klickfläche von 40 CSS-Pixeln ==");
{
  assert(
    partnerCalendarSource.includes('aria-label="Vorherigen Monat anzeigen"') && partnerCalendarSource.includes("flex h-10 w-10 items-center justify-center rounded-full text-center text-2xl font-light"),
    "die Pfeile haben eine feste 40x40px-Klickfläche (h-10 w-10), unabhängig von der Textzeilenhöhe",
  );
  assert(partnerCalendarSource.includes("grid-cols-[2.5rem_1fr_2.5rem]"), "die Pfeil-Spalten sind mindestens 2.5rem (40px) breit, damit die 40x40px-Flächen vollständig sichtbar sind");
  assert(partnerCalendarSource.includes("aspect-square min-w-0"), "Tagesfelder behalten ihr bestehendes aspect-square-Layout unverändert");
  assert(
    partnerCalendarSource.includes('className="grid grid-cols-7 gap-1 text-center sm:gap-1.5"'),
    "das Tagesraster nutzt mobil ein engeres gap-1, ab sm weiterhin gap-1.5 — zusätzlicher Platz für 40px-Tagesfelder trotz Karten-Innenabstand",
  );
}

console.log("\n== WP-017 (zur Zeit von WP-017 gültig, seit WP-018 Korrektur V3 bewusst überholt): der frühere lange Erklärungen-Pill-Button existiert nicht mehr, ersetzt durch den kompakten ⓘ-Info-Button ==");
{
  // WP-017 hatte den damals noch vorhandenen langen Partner-Pill-Button mit
  // min-h-10 abgesichert. WP-018 Korrektur V3 ersetzt ihn durch denselben
  // kompakten Popover-Trigger wie in der Owner-Ansicht (siehe
  // scripts/verify-partner-calendar-legend-collapsible.ts für die
  // ausführlichen Prüfungen dieser neuen Struktur).
  assert(!partnerCalendarSource.includes('>{isCalendarLegendOpen ? "Erklärungen ausblenden" : "Erklärungen zum Kalender anzeigen"}<'), "kein sichtbarer Pill-Button-Text mit dem alten Umschalt-Muster mehr vorhanden");
  assert(partnerCalendarSource.includes("ⓘ"), "der kompakte Info-Button (ⓘ) ist an seiner Stelle vorhanden");
}

console.log("\n== WP-017: der Unsicherheitshinweis und PMS-/Perioden-Hinweise bleiben vollständig lesbar und vorhanden ==");
{
  assert(partnerCalendarSource.includes("Vorhersage unsicher - Kann abweichen"), "der Unsicherheitshinweis im Kalender bleibt unverändert vorhanden");
  assert(partnerRingSource.includes("Noch nicht genügend Daten für eine Orientierung."), "der no_data-Hinweis im Ring-Bereich bleibt unverändert vorhanden");
  assert(partnerRingSource.includes("PMS von ihr eingetragen:"), "der manuelle PMS-Hinweis bleibt unverändert vorhanden");
  assert(partnerRingSource.includes("Voraussichtliches Ende:"), "der Hinweis zum voraussichtlichen Ende bleibt unverändert vorhanden");
  assert(!partnerCalendarSource.includes("text-ellipsis") && !partnerCalendarSource.includes("truncate"), "keine CSS-Textabschneidung wurde eingeführt");
  assert(!partnerRingSource.includes("text-ellipsis") && !partnerRingSource.includes("truncate"), "keine CSS-Textabschneidung im Ring-Bereich wurde eingeführt");
}

console.log("\n== WP-017: die Partneransicht bleibt vollständig rein lesend, keine neuen Eingabeelemente ==");
{
  assert(!partnerCalendarSource.includes("<input"), "NewPartnerCalendar.tsx enthält kein <input>-Element");
  assert(!partnerCalendarSource.includes('type="checkbox"'), "NewPartnerCalendar.tsx enthält keine Checkbox");
  assert(!partnerCalendarSource.includes("fetch("), "NewPartnerCalendar.tsx löst keinen Netzwerkaufruf aus");
  assert(!partnerRingSource.includes("<input") && !partnerRingSource.includes("fetch("), "NewPartnerCycleRing.tsx bleibt ohne Eingabeelemente oder Netzwerkaufrufe");
}

console.log("\n== WP-017: die eigene Home-Ansicht /neu bleibt von der Partner-Verdichtung unberührt ==");
{
  // WP-022 Korrektur V4: siehe verify-mobile-home-compact.ts — die Kachel ist
  // jetzt transparent statt der V2-Zwischenstufe mit neutralem Hintergrund,
  // die responsive Tageszahl-Größe (text-sm/text-base) bleibt unverändert.
  assert(
    ownerComponentSource.includes('const dayClassName = `relative z-10 grid h-full w-full place-items-center rounded-2xl border bg-transparent text-sm text-[#281c24] sm:text-base ${'),
    "die eigene Home-Tageszahl-Klasse bleibt exakt beim WP-016-Korrektur-V2-Stand (nur um die WP-022-V4-Darstellung ergänzt)",
  );
  assert(!ownerComponentSource.includes("NewPartnerCalendar") && !ownerComponentSource.includes("NewPartnerCycleRing"), "NewCycleExample.tsx referenziert keine Partnerkomponenten");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
