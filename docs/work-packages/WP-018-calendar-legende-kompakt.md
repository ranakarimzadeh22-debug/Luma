---
id: WP-018
title: "Kalenderlegende kompakt an der Monatsüberschrift öffnen"
status: review
created: 2026-10-18
updated: 2026-10-18
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home /neu, Kalender"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Kalenderlegende kompakt an der Monatsüberschrift öffnen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der lange Button unter dem Kalender verschwindet. Stattdessen steht direkt neben dem Monatsnamen ein kleiner Info-Button `ⓘ`.
- **Was passiert beim Antippen?** Er öffnet und schließt dieselben vorhandenen Erklärungen zu Farben, Vorhersagen und P/M/E. Die Erklärungen werden nicht gelöscht oder neu formuliert.
- **Warum machen wir das?** Die Home-Ansicht soll ruhiger wirken und weniger Platz verbrauchen; die Hilfe bleibt trotzdem genau dort erreichbar, wo der Kalender sichtbar ist.
- **Wo ist es in der App?** Nur im eigenen Home-Kalender auf `/neu`.
- **Was bleibt sichtbar?** Der wichtige Hinweis `Vorhersage unsicher - Kann abweichen` bleibt außerhalb der einklappbaren Erklärung und immer sichtbar.
- **Was gehört nicht dazu?** Keine neue Erklärung, keine Einstellung, keine Daten-, Berechnungs- oder Partneränderung.

## Entstehungsweg

`Viele dauerhaft sichtbare Kalendererklärungen → Home-Ansicht wirkt lang und voll → vorhandene Legende hinter kleinem Info-Button neben Monatsname erreichbar machen → WP-018`

- Ausgangsproblem: Die Ownerin empfindet die Erklärungen unter dem Home-Kalender als zu umfangreich.
- bestätigte Wirkung: Die Home-Ansicht wird ruhiger; bei Bedarf bleibt die volle Erklärung leicht erreichbar.
- gewählte Lösung: Der bestehende einklappbare Bereich bleibt erhalten, sein Steuerbutton wandert als kleiner Info-Button neben die Monatsüberschrift.
- wichtige Grenze: Der Unsicherheitshinweis bleibt unabhängig vom Öffnungszustand sichtbar.
- Quellen/Akten: APP-IDEA-025, APP-IDEA-011, WP-007 Version 2, Owner-Entscheidung vom 2026-10-18.

## Soll – von Codex

- Der bestehende lange Button `Erklärungen zum Kalender anzeigen` beziehungsweise `Erklärungen ausblenden` unter dem Kalender wird entfernt.
- Neben dem angezeigten Monatsnamen (zum Beispiel `Oktober 2026`) erscheint ein kleiner sichtbarer Info-Button mit dem Zeichen `ⓘ`.
- Der Info-Button öffnet und schließt denselben vorhandenen Bereich `calendar-legend-panel`. Anfangszustand bleibt geschlossen.
- Der Button ist zugänglich: dynamisches `aria-expanded`, `aria-controls="calendar-legend-panel"` sowie ein klarer dynamischer `aria-label` für Anzeigen/Ausblenden. Das sichtbare Zeichen allein ist nicht die einzige zugängliche Beschreibung.
- Im geöffneten Zustand bleiben alle bisherigen Legendentexte und die P/M/E-Einzelerklärungen mit ihrem vorhandenen Escape-Verhalten unverändert erhalten.
- Der Unsicherheitshinweis `Vorhersage unsicher - Kann abweichen` bleibt außerhalb des Panels und jederzeit sichtbar.
- Die bestehende Monatsüberschrift bleibt weiterhin ein eigener, gut antippbarer Weg zur Periodenhistorie; der neue Info-Button darf diese Aktion nicht ersetzen oder auslösen.
- Nicht enthalten: Keine Änderung an Monatswechsel, Historie, Tagesfeldern, Tagesfenster, Kalender-Markern, Zyklus- und PMS-Logik, Textinhalten, Partneransicht, Einstellungen, API, Datenbank, Migration, Route oder Authentifizierung.
- Abnahmekriterien:
  1. Auf `/neu` ist unter dem Kalender kein separater Erklärungen-Button mehr sichtbar.
  2. Der kleine `ⓘ`-Button steht neben dem Monatsnamen und lässt die Legende ein- und ausblenden.
  3. `ⓘ` und Monatsname lösen getrennte Aktionen aus: Legende beziehungsweise Periodenhistorie.
  4. Bei unsicherer Vorhersage bleibt der Unsicherheitshinweis vor, während und nach dem Öffnen sichtbar.
  5. Mobil und breit gibt es keinen horizontalen Überlauf; Monatspfeile, Monatstitel und Info-Button kollidieren nicht.
- Ein Prüfschritt für den Owner: `/neu` öffnen, `ⓘ` neben dem Monat antippen, die Legende und P/M/E prüfen, schließen und danach den Monatsnamen antippen; bei unsicherer Vorhersage den sichtbaren Hinweis prüfen.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` ist die eigene Home-Kalenderansicht.
- `isCalendarLegendOpen` ist bereits vorhandener Client-State mit Default `false`.
- Die Monatszeile ist ein `grid` mit vorherigem Monatspfeil, einem `h2` mit eigenem Monatsnamen-Button für `setIsPeriodHistoryOpen(true)` und folgendem Monatspfeil.
- Der vorhandene Legenden-Button verwendet bereits `aria-expanded`, `aria-controls="calendar-legend-panel"` und schaltet den vorhandenen bedingt gerenderten Bereich `calendar-legend-panel`.
- Der Unsicherheitshinweis wird bereits außerhalb dieses Panels von `prediction?.isUncertain` gesteuert. `PhaseLegendItem` enthält die bestehende P/M/E-Interaktion inklusive Escape-Verhalten.

### Technisches Ziel

- Verwende den vorhandenen State, das Panel und alle Legendeninhalte unverändert weiter. Es darf keine zweite Legendenstruktur und keine neue Erklärung entstehen.
- Verlege ausschließlich den bestehenden Steuerbutton aus dem Bereich unterhalb des Kalenders in die Monatszeile direkt neben den Monatsnamen.
- Der sichtbare Info-Button verwendet `ⓘ`; gestalte ihn als klaren, ausreichend antippbaren Button und mit dem bestehenden Fokusverhalten. Er muss mobile und breite Layouts ohne Kollision mit Monatsname oder Pfeilen unterstützen.
- Behalte den Monatsnamen als separaten Button für die Historie. Keine verschachtelten Buttons und keine Änderung seines Handlers oder `aria-label`.
- Passe die bestehende dynamische Beschriftung für Screenreader an den kleinen Info-Button an, ohne sichtbaren Zusatztext unter dem Kalender einzuführen.

### Invarianten – müssen unverändert bleiben

- `isCalendarLegendOpen`, `calendar-legend-panel`, die enthaltenen Legendentexte, `PhaseLegendItem`, dessen Escape-Verhalten und die Tages-ARIA-Labels bleiben funktional unverändert.
- Der Unsicherheitshinweis bleibt außerhalb des Panels, an `prediction?.isUncertain` gebunden und unabhängig vom Öffnungszustand sichtbar.
- Keine Änderung an Kalenderdaten, Markern, `primaryCalendarPhase`, `showsFertileMarker`, Vorhersagen, PMS, Ring, Historie, Monatsnavigation, Tagesfenster, Datenzugriff, API, Datenbank, Partneransicht oder eigener mobiler Verdichtung aus WP-016.
- Keine neuen Abhängigkeiten, Routen, Migrationen, Speicherungen oder Netzwerkaufrufe.
- Keine Textkürzung oder versteckte medizinische Warnung.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- API-Wirkung: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Ergänze oder passe gezielte Prüfungen an: kein alter Steuerbutton unter dem Kalender; kleiner Info-Button neben Monatsname; geschlossener Start; `aria-expanded`, `aria-controls` und dynamischer `aria-label`; Öffnen/Schließen; vorhandene vollständige Legende und P/M/E-Escape-Verhalten; Unsicherheitshinweis außerhalb des Panels.
- Prüfe getrennte Aktionen: Info-Button öffnet nur die Legende, Monatsname öffnet weiterhin nur die Historie.
- Führe bestehende Kalenderlegenden-, Monatsnavigation-, Historien-, Tagesfenster-, Vorhersage- und WP-016-Mobile-Regressionen aus.
- Führe TypeScript und Produktions-Build aus.
- Prüfe 375 x 812 und 1280 x 900: kein horizontaler Überlauf, keine Kopfzeilen-Kollision, Info-Button ausreichend antippbar, Monatswechsel, Legende, P/M/E und Historie funktionieren. Bei unsicherer Vorhersage den Hinweis in geschlossenem und offenem Zustand prüfen.

### Stoppbedingungen

- Stoppe vor jeder Änderung an Berechnung, Kalenderdaten, Textinhalten der Erklärung, Unsicherheitslogik, PMS, Ring, Historie, Partneransicht, API, Datenbank, Migration, Route oder Authentifizierung.
- Stoppe, wenn der kleine Info-Button den erreichbaren Monatsnamen oder die Monatspfeile auf einem schmalen Bildschirm nicht ohne Kollision zulässt.
- Stoppe, wenn das bestehende P/M/E-Escape-Verhalten oder die dauerhafte Unsicherheitswarnung nicht sicher erhalten werden kann.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-018` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – von Claude

- **umgesetzt:**
  - `src/components/NewCycleExample.tsx`, Monatszeile: Der vorherige dreispaltige Grid (`Pfeil / Monatsname / Pfeil`) blieb unverändert als äußeres Grid bestehen; die mittlere Spalte enthält jetzt zusätzlich einen `<div className="flex items-center justify-center gap-1">`-Wrapper mit dem unveränderten Monatsname-`h2`/`button` (gleicher Handler `setIsPeriodHistoryOpen(true)`, gleicher `aria-label`, gleiche className) als Geschwister-Element neben dem neuen Info-Button — keine Verschachtelung, zwei getrennte, gleichrangige `<button>`-Elemente.
  - Neuer Info-Button: `<button aria-expanded={isCalendarLegendOpen} aria-controls="calendar-legend-panel" aria-label={isCalendarLegendOpen ? "Erklärungen zum Kalender ausblenden" : "Erklärungen zum Kalender anzeigen"} onClick={() => setIsCalendarLegendOpen((current) => !current)}>` mit sichtbarem `<span aria-hidden="true">ⓘ</span>` — exakt derselbe, unveränderte `isCalendarLegendOpen`-State und Handler wie zuvor am langen Button, nur an einen neuen, kleinen, runden `h-8 w-8`-Button verlegt. Das sichtbare `ⓘ`-Zeichen ist `aria-hidden`, die vollständige zugängliche Beschreibung liegt im dynamischen `aria-label` (nicht nur im Symbol selbst).
  - Der vorherige lange Button (`<div className="flex justify-center"><button ...>Erklärungen zum Kalender anzeigen/ausblenden</button></div>`) unterhalb des Kalenders wurde vollständig entfernt.
  - `isCalendarLegendOpen`, `calendar-legend-panel` (inkl. `id`), dessen bedingtes Rendering, alle Legendentexte, `PhaseLegendItem` und dessen Escape-/Fokus-Verhalten wurden nicht verändert — nur ihr Steuerbutton wurde verschoben.
  - Der Unsicherheitshinweis `Vorhersage unsicher - Kann abweichen` (gebunden an `prediction?.isUncertain`) blieb an seiner bestehenden Position vor dem Panel unverändert — er stand bereits vorher außerhalb des Panels und unabhängig vom Button; diese Platzierung musste für das Soll nicht angefasst werden.
  - Keine Änderung an `primaryCalendarPhase`, `showsFertileMarker`, Vorhersagen, PMS, Ring, Historie, Monatsnavigation (`changeMonth`), Tagesfenster, Datenzugriff, API, Datenbank, Partneransicht oder der WP-016/017-Mobilverdichtung.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-calendar-legend-collapsible.ts` erweitert: 10 neue/angepasste Prüfungen für den dynamischen `aria-label` (statt sichtbarem Button-Text), das Entfernen des alten Button-Musters, die Position des Info-Buttons in der Monatszeile (inklusive `aria-controls`/`aria-expanded`), die Anwesenheit beider Monatspfeile und des Monatsname-Buttons in derselben Zeile, sowie getrennte, nicht verschachtelte Handler für Info-Button und Monatsname. Alle bestehenden Prüfungen zu Panel-Inhalt, Legendentexten und Unsicherheitshinweis-Position bestehen unverändert. Die beiden bereits vor WP-018 vorbestehenden Fehlschläge zum `PhaseLegendItem`-Quelltext-Pattern-Matching (per `git stash` auf dem unveränderten Stand reproduziert) bleiben unverändert bestehen — betreffen nur das Testskript-Muster, nicht die tatsächliche, live verifizierte Funktionalität.
  - `scripts/verify-home-actions-consistent.ts`: zwei Assertions, die zur Zeit von WP-010 noch korrekt „Zykluslänge ergänzen“ und „Erklärungen...“ als visuell gleichartige Pill-Buttons prüften, wurden an die durch WP-018 bewusst geänderte Realität angepasst (der Erklärungen-Umschalter ist jetzt ein kleiner `h-8 w-8`-Info-Button, kein Pill-Button mehr) — keine stille Abschwächung, sondern eine durch den neuen Auftrag notwendige Korrektur einer zuvor gültigen, jetzt überholten Annahme.
  - `scripts/verify-mobile-home-compact.ts`: eine Prüfung von „drei Aktionsbuttons mit `min-h-10`“ auf „zwei verbliebene Pill-Buttons mit `min-h-10`“ angepasst (der dritte, der Erklärungen-Umschalter, ist seit WP-018 kein Pill-Button mehr). Alle übrigen 41 Prüfungen dieses Skripts bestehen unverändert.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-mobile-partner-compact.ts`, `scripts/verify-partner-calendar-legend-collapsible.ts`, `scripts/verify-home-screen-layout.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-period-history.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-next-period-countdown.ts`, `scripts/verify-manual-pms-ring-marker.ts`. `scripts/verify-today-card.ts` zeigt weiterhin ausschließlich die bereits mehrfach dokumentierten, vorbestehenden 2 Fehlschläge (nicht durch WP-018 verursacht).
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, nicht durch WP-018 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten: Mobil (375×812): kein alter sichtbarer Button-Text mehr vorhanden; Info-Button sichtbar neben „Oktober 2026“ (Zeilenposition: Pfeil 20–60px, Monatsname 77–262px, Info-Button 266–298px, Pfeil 315–355px — alle vier Elemente klar getrennt, keine Überlappung); `aria-expanded`/`aria-label` wechseln korrekt `false`/„anzeigen“ → `true`/„ausblenden“ → `false`/„anzeigen“ bei wiederholtem Antippen; Legende öffnet mit allen bestehenden Texten und den drei P/M/E-Buttons; ein echter (nicht nur per `evaluate` simulierter) Klick auf „Periode“ öffnet die Erklärung (`role="tooltip"` sichtbar, `aria-expanded=true`), ein anschließendes Escape auf dem fokussierten Button schließt sie zuverlässig (`tooltip` verschwindet, `aria-expanded=false`) — das Escape-Verhalten ist vollständig intakt; Antippen des Monatsnamens öffnet separat die Periodenhistorie, ohne die Legende zu beeinflussen; Monatswechsel (→ November 2026) funktioniert unverändert; kein horizontaler Überlauf. Breit (1280×900): identisches Verhalten, Info-Button weiterhin 32×32px, kein horizontaler Überlauf, rechnerisch verifizierte Bounding-Box-Prüfung bestätigt keine Überlappung zwischen Ring-Labels (y≈303–552) und Info-Button (y≈708–740) — eine anfänglich im Screenshot vermutete Nähe zwischen Ringtext „Periode“ und dem `ⓘ`-Symbol erwies sich bei exakter Koordinatenmessung als keine tatsächliche Kollision, da beide Elemente in der normalen Dokumentreihenfolge weit auseinander liegen. Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** Der Info-Button misst 32×32 CSS-Pixel (`h-8 w-8`), nicht die in WP-016/017 für Tagesfelder und Monatspfeile explizit geforderten ~40 CSS-Pixel. Das Soll dieses Pakets verlangt für den Info-Button ausdrücklich nur „einen klaren, ausreichend antippbaren Button“, ohne eine konkrete Mindestgröße zu nennen (anders als bei Tagesfeldern/Monatspfeilen in früheren Paketen) — 32×32px liegt über der allgemein anerkannten Mindestgröße für sekundäre, seltener genutzte Icon-Buttons und kollidiert nachweislich nicht mit den benachbarten Elementen. Keine fachliche Abweichung vom übrigen Soll-Umfang.
- **offene Punkte:** Owner-Prüfschritt steht aus: `/neu` öffnen, `ⓘ` neben dem Monat antippen, die Legende und P/M/E prüfen, schließen und danach den Monatsnamen antippen; bei unsicherer Vorhersage den sichtbaren Hinweis prüfen.
- **Commit:** 556c841.

## Soll-Ist-Prüfung – von Codex

_Noch nicht geprüft. Diese Prüfung erfolgt erst nach der Claude-Umsetzung._
