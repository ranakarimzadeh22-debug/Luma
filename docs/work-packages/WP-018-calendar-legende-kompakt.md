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

- Ergebnis: Soll und Ist stimmen ausreichend überein. Der lange Steuerbutton unter dem Kalender ist entfernt; der kleine, zugängliche `ⓘ`-Button sitzt als separates Geschwisterelement neben dem weiterhin unveränderten Monatsnamen-Button. Er nutzt denselben bestehenden State und dasselbe Panel. Historie, Legende, P/M/E-Escape-Verhalten und Monatswechsel bleiben getrennt funktionsfähig.
- Unsicherheitshinweis: erfüllt. Er bleibt außerhalb des Panels und unabhängig von dessen Öffnungszustand sichtbar.
- Dokumentierte Abweichung: keine fachliche Abweichung. Der Info-Button misst 32 x 32px. Dieses Paket verlangte eine ausreichende Antippbarkeit, jedoch keine feste 40px-Untergrenze wie frühere Pakete für Monatsnavigation und Tagesfelder. Die Owner-Prüfung entscheidet, ob diese kompakte Größe sich auf dem eigenen Gerät angenehm anfühlt.
- Nachschärfung: keine.
- Product-Map aktualisiert: ja.

## Korrektur Version 2 – kurze Popover-Legende direkt am Info-Button

### Owner-Entscheidung

Die Ownerin hat nach der Prüfung präzisiert: Nach dem Antippen von `ⓘ` soll die Legende nicht mehr unterhalb des Kalenders erscheinen. Stattdessen öffnet sich ein kleines Fenster direkt am Info-Button. Es enthält nur kurze Farbzeilen und keine langen Erklärungen oder innere Scrollfläche.

### Soll – Korrektur Version 2

- Ersetze den bisherigen unterhalb des Kalenders gerenderten Bereich `calendar-legend-panel` durch ein kompaktes, nicht modales Popover, das optisch unmittelbar unter oder neben dem `ⓘ`-Button verankert ist.
- Das Popover zeigt ausschließlich kurze Farbzeilen. Vereinbarter Inhalt:
  1. `Periode`
  2. `PMS`
  3. eine kurze Kennzeichnung `Geschätzt` für die folgenden Vorhersagezeilen
  4. `Fruchtbare Tage`
  5. `Eisprung`
  6. `Nächste Periode`
- Die drei Vorhersagezeilen stehen sichtbar unter `Geschätzt`, damit Fruchtbarkeit, Eisprung und nächste Periode weiterhin nicht als bestätigte biologische oder tatsächliche Ereignisse gelesen werden.
- Die bisherigen langen Legendentexte und die klickbaren P/M/E-Einzelerklärungen gehören nicht mehr zur sichtbaren Owner-Home-Legende. Sie werden nicht in einen anderen dauerhaft sichtbaren Bereich verschoben.
- Das Popover ist anfangs geschlossen, öffnet und schließt über denselben `ⓘ`-Button und schließt zusätzlich bei Escape sowie bei einem Klick/Tipp außerhalb. Es bleibt über `aria-expanded`, `aria-controls`, `aria-haspopup="dialog"` und eine eindeutige Dialog-Beschriftung zugänglich.
- Die bestehende Monatsüberschrift bleibt unverändert ein separater Button für die Periodenhistorie.
- Der Hinweis `Vorhersage unsicher - Kann abweichen` bleibt außerhalb des Popovers und immer sichtbar.
- Auf schmalen Bildschirmen darf das Popover bei wenig Platz nach links unter den Button ausweichen, muss aber im sichtbaren Bereich bleiben, ohne horizontalen Überlauf oder eine innere Scrollfläche. Kein Bottom Sheet und kein erneutes Aufklappen unterhalb des Kalenders.
- Keine Änderung an Kalenderdaten, Berechnungen, Markern, Unsicherheitslogik, Monatswechsel, Historie, Tagesfenster, Partneransicht, API, Datenbank, Migration, Route oder Authentifizierung.

### Technischer Auftrag für Claude – Korrektur Version 2

- `src/components/NewCycleExample.tsx` bleibt der einzige erwartete UI-Startpunkt. Verwende den vorhandenen `isCalendarLegendOpen`-State weiter; er steuert jetzt ausschließlich das Popover.
- Ordne Trigger und Popover in einer positionsfähigen, semantisch klaren Hülle um den vorhandenen Info-Button an. Der Popover darf nicht im normalen vertikalen Dokumentfluss unterhalb des Kalenders wachsen.
- Nutze kurze, lokal definierte Präsentationszeilen mit den bestehenden Farbkennzeichnungen. Wiederverwende vorhandene Farbwerte und Formulierungen, soweit sie zu den vereinbarten kurzen Labels passen; führe keine zweite Vorhersage-, Phasen- oder Markerberechnung ein.
- Der Popover erhält `role="dialog"` und eine klare zugängliche Beschriftung; der Trigger erhält zusätzlich `aria-haspopup="dialog"`. Implementiere Schließen durch Escape und durch Klick/Tipp außerhalb ohne neue Abhängigkeit. Fokus, Trigger und Monatsname müssen bedienbar bleiben.
- Entferne den bisherigen langen Panel-Inhalt und die P/M/E-Detailinteraktion aus dieser Owner-Home-Legende vollständig, damit weder der alte Bereich unter dem Kalender noch lange Texte im Popover verbleiben. Falls dadurch lokaler, ungenutzter UI-State entsteht, darf er ausschließlich in derselben Komponente entfernt werden.
- Bewahre den bestehenden Unsicherheitshinweis außerhalb und unabhängig von `isCalendarLegendOpen`.

### Invarianten – Korrektur Version 2

- Der `ⓘ`-Button, Monatsname, beide Monatspfeile und Popover dürfen sich weder überlappen noch gegenseitig auslösen.
- Vorhersagen bleiben klar als `Geschätzt` gekennzeichnet. Das Popover darf keine medizinische Sicherheit oder bestätigte Fruchtbarkeit/Eisprung suggerieren.
- Keine neue Erklärung, Speicherung, Route, API, Datenbankwirkung oder Partnerinformation.
- Die eigene Home-Ansicht bleibt außerhalb der Legendenpräsentation unverändert; Partneransicht und alle Berechnungs-/Kalenderlogiken bleiben unberührt.

### Pflichtprüfungen – Korrektur Version 2

- Gezielte Prüfung: Popover anstatt Inline-Panel; geschlossen beim Start; sechs kurzen sichtbaren Begriffe einschließlich `Geschätzt`; keine alten langen Legendentexte oder P/M/E-Detailbuttons in der Owner-Home-Legende.
- Prüfe `aria-expanded`, `aria-controls`, `aria-haspopup`, Dialog-Beschriftung, Trigger-Klick, Außenklick und Escape.
- Prüfe, dass Monatsname weiterhin nur die Historie und der Info-Button nur das Popover öffnet; Monatspfeile und Tagesfenster funktionieren unverändert.
- Prüfe den Unsicherheitshinweis vor, während und nach offenem Popover.
- TypeScript, Produktions-Build und Sichtprüfung auf 375 x 812 sowie 1280 x 900: kein horizontaler Überlauf, kein abgeschnittenes Popover, keine innere Scrollfläche und keine Kollision im Monatstitelbereich.

### Stoppbedingungen – Korrektur Version 2

- Stoppe, wenn ein positioniertes Popover auf kleinen Bildschirmen nicht ohne Abschneiden, horizontales Scrollen oder Überdeckung des Info-Buttons erreichbar bleibt.
- Stoppe vor jeder Änderung an Daten, Berechnungen, Unsicherheitslogik, Markern, Historie, Partneransicht, API, Datenbank, Migration, Route oder Authentifizierung.
- Stoppe, wenn die kurze Darstellung Vorhersagen nicht mehr klar als geschätzt kennzeichnen kann.

### Abschluss durch Claude – Korrektur Version 2

- `Ist – Korrektur Version 2` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-018` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – Korrektur Version 2 – von Claude

- **umgesetzt:**
  - `src/components/NewCycleExample.tsx`: Das bisherige, im normalen Dokumentfluss unterhalb des Kalenders gerenderte `calendar-legend-panel` (lange Legende + klickbare P/M/E-Detailinteraktion) ist vollständig entfernt. An seiner Stelle rendert eine neue, lokal definierte `CalendarLegendPopover`-Komponente ein `role="dialog"`-Element mit `aria-label="Kalender-Erklärung"` und `id="calendar-legend-panel"` (dieselbe `id`, damit `aria-controls` am Trigger unverändert gültig bleibt). Das Popover ist `absolute right-0 top-full mt-2` innerhalb eines neuen `<div className="relative">`-Wrappers positioniert, der ausschließlich den `ⓘ`-Button umschließt — es wächst nicht im Dokumentfluss, sondern legt sich als Overlay über nachfolgende Inhalte.
  - Inhalt des Popovers: genau sechs kurze, lokal definierte Zeilen (`calendarLegendRows`) mit wiederverwendeten Farbwerten aus der vorherigen Legende/`phaseStyles` — `Periode` (`#6d153f`), `PMS` (`#f8c2d0`), `Geschätzt` (reine Textkennzeichnung, kein Farbpunkt), `Fruchtbare Tage` (`#a988da`), `Eisprung` (`#d2b9ef`), `Nächste Periode` (`#c9b3ea`). Die drei Vorhersagezeilen stehen im Quelltext (und damit visuell) unter der `Geschätzt`-Kennzeichnung. Keine neue Vorhersage-, Phasen- oder Markerberechnung — alle Werte sind reine, hartcodierte Textpräsentation, unabhängig von `prediction`/`personalCycleView`.
  - Der Info-Button erhielt zusätzlich `aria-haspopup="dialog"`; `aria-expanded`, `aria-controls="calendar-legend-panel"` und der dynamische `aria-label` blieben unverändert.
  - Schließen des Popovers: `useEffect` mit `document`-Listenern für `mousedown` (schließt, wenn der Klick außerhalb der per `useRef` referenzierten Popover-Fläche liegt) und `keydown`/Escape — beide Listener werden nur registriert, während das Popover offen ist, und beim Unmount/Schließen wieder entfernt. Keine neue npm-Abhängigkeit, reines React/DOM.
  - Vollständig entfernt als ungenutzter Code (da nur noch von der gelöschten langen Legende gebraucht): `PhaseLegendItem`-Komponente samt Props-Interface, `phaseLegendStyles`, `phaseExplanations`, der `activePhase`/`setActivePhase`-State und der zuvor nur dafür genutzte `Phase`-Typ. `phaseStyles`, `phaseLetters`, `phaseLabels` blieben unverändert, da sie weiterhin für die Tagesfeld-Badges im Kalendergrid gebraucht werden.
  - Der Unsicherheitshinweis `Vorhersage unsicher - Kann abweichen` blieb an seiner bestehenden, von `isCalendarLegendOpen` komplett unabhängigen Position (gebunden ausschließlich an `prediction?.isUncertain`) unverändert erhalten.
  - Die Monatsüberschrift bleibt unverändert ein separater Button für die Periodenhistorie; Monatspfeile, Tagesraster, Tagesfenster, Monatswechsel und alle Marker/Badges wurden nicht angefasst.
  - Keine Änderung an `primaryCalendarPhase`, `showsFertileMarker`, `predictCycle`, `computePersonalCycleView`, Datenzugriff, API, Datenbank, Partneransicht, Migrationen, Routen oder Authentifizierung.
- **nicht umgesetzt:** nichts aus dem Korrektur-Umfang offen.
- **Tests:**
  - `scripts/verify-calendar-legend-collapsible.ts` grundlegend überarbeitet (37 Prüfungen, alle bestanden): Popover-Start geschlossen; `aria-expanded`/`aria-haspopup="dialog"`/`aria-controls`/dynamischer `aria-label` am Trigger; Popover selbst mit `role="dialog"`, eindeutiger Beschriftung, absoluter Positionierung außerhalb des normalen Dokumentflusses, ohne innere Scrollfläche; Escape- und Außenklick-Schließlogik im Quelltext nachgewiesen; genau sechs definierte Zeilen inklusive `Geschätzt`-Kennzeichnung, die im Quelltext vor allen drei Vorhersagezeilen steht; vollständige Entfernung von `PhaseLegendItem`, `phaseExplanations`, `phaseLegendStyles`, `activePhase` und der alten langen Legendentexte; Unsicherheitshinweis bleibt unabhängig vom Popover-Zustand; keine Marker-/Berechnungs-/Datenlogik verändert; alter langer Steuerbutton entfernt; Info-Button-Position und getrennte, nicht verschachtelte Handler für Info-Button/Monatsname unverändert nachgewiesen.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-home-actions-consistent.ts`, `scripts/verify-mobile-home-compact.ts`, `scripts/verify-mobile-partner-compact.ts`, `scripts/verify-partner-calendar-legend-collapsible.ts`, `scripts/verify-home-screen-layout.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-period-history.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-next-period-countdown.ts`, `scripts/verify-manual-pms-ring-marker.ts`. `scripts/verify-today-card.ts` zeigt weiterhin ausschließlich die bereits mehrfach dokumentierten, vorbestehenden 2 Fehlschläge (nicht durch diese Korrektur verursacht).
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, nicht durch diese Korrektur verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten: Mobil (375×812): Popover öffnet mit exakt dem Text „Periode / PMS / GESCHÄTZT / Fruchtbare Tage / Eisprung / Nächste Periode“; `role="dialog"`, `aria-label="Kalender-Erklärung"`, `aria-expanded`/`aria-haspopup="dialog"` korrekt; kein horizontaler Überlauf (geschlossen und geöffnet); Popover bleibt vollständig innerhalb des 375px-Viewports (gemessen: 74–298px), keine innere Scrollfläche; Escape schließt zuverlässig; ein Klick außerhalb (Bildschirmecke) schließt ebenfalls zuverlässig; Antippen des Monatsnamens öffnet separat die Periodenhistorie, das Popover bleibt dabei geschlossen; Monatswechsel (→ November 2026) funktioniert unverändert; mit einem gezielt unregelmäßigen Perioden-Set (Zyklus-Gap-Spanne 22 Tage, über der 10-Tage-Unsicherheitsschwelle) blieb der Unsicherheitshinweis „Vorhersage unsicher - Kann abweichen“ nachweislich vor, während und nach dem Öffnen des Popovers sichtbar; das Tagesfenster (Antippen eines Tages) öffnet weiterhin unverändert mit allen bestehenden Aktionen. Breit (1280×900): identisches Verhalten, Popover bleibt vollständig innerhalb des Viewports (548–772px), kein horizontaler Überlauf, keine Kollision mit Monatspfeilen oder Monatsname. Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** keine fachliche Abweichung vom Soll. Die Popover-Breite (`w-56`, 224px) und das Schließverhalten bei Außenklick wurden technisch frei gewählt, da das Soll hierzu keine exakten Werte vorgibt, sondern nur "kompakt", "ohne horizontalen Überlauf" und "ohne innere Scrollfläche" verlangt — alle drei Kriterien wurden live gemessen und erfüllt.
- **offene Punkte:** Owner-Prüfschritt steht erneut aus: `/neu` öffnen, `ⓘ` antippen und prüfen, dass ein kleines Fenster mit den sechs kurzen Zeilen direkt am Button erscheint (keine lange Legende mehr unterhalb des Kalenders), außerhalb antippen oder Escape drücken zum Schließen, danach den Monatsnamen separat prüfen; bei unsicherer Vorhersage den Hinweis in beiden Zuständen prüfen.
- **Commit:** folgt.

## Korrektur Version 3 – kurze erklärende Popover-Legende für Partner

### Owner-Entscheidung

Die Ownerin möchte dieselbe kompakte Hilfe auch im verbundenen Partner-Kalender. Dort sollen die vorhandenen Farben etwas verständlicher erklärt werden, weil der Partner oft weniger Vorwissen hat. Die Partneransicht bleibt vollständig rein lesend und zeigt keine neue Information.

### Soll – Korrektur Version 3

- Ergänze in `NewPartnerCalendar.tsx` einen kleinen zugänglichen `ⓘ`-Button neben dem Monatsnamen. Er ersetzt den langen Button unter dem Partner-Kalender.
- Beim Antippen öffnet sich ein kompaktes nicht modales Popover direkt am Info-Button. Es erscheint nicht unterhalb des Kalenders, erzeugt keinen horizontalen Überlauf und braucht keine innere Scrollfläche.
- Der Partner-Popover zeigt ausschließlich schon vorhandene, freigegebene Kalenderinformationen als kurze Farbzeilen. Verwende diese kurzen sichtbaren Texte, jeweils nur wenn die zugrunde liegende bestehende Information auch vorhanden ist:
  1. `Periode bestätigt`
  2. `Nächste Periode geschätzt`
  3. `Eisprung geschätzt`
  4. `Fruchtbare Tage geschätzt`
  5. `PMS vor Periode`
  6. `PMS eingetragen`
- Die Vorhersagezeilen müssen bei fehlender Vorhersage weiterhin nicht erscheinen. `PMS eingetragen` erscheint nur für den bereits vorhandenen manuellen PMS-Abschnitt. Es werden keine neuen Symptome oder Daten an den Partner übertragen.
- Die Zeilen `Nächste Periode geschätzt`, `Eisprung geschätzt` und `Fruchtbare Tage geschätzt` sind kurz, bleiben aber ausdrücklich als Schätzung gekennzeichnet. `PMS vor Periode` bleibt eine mögliche Phase und ist keine Diagnose.
- Anfangszustand geschlossen. Schließen über denselben Info-Button, Escape und Klick/Tipp außerhalb. Trigger und Popover verwenden zugängliche Dialogattribute analog zur Owner-Korrektur Version 2.
- Der bestehende Unsicherheitshinweis bleibt außerhalb des Popovers, bei unsicherer Vorhersage sichtbar und unverändert.
- Nicht enthalten: Keine Änderung an aktiver Verbindungsprüfung, Freigaben, Daten, Berechnungen, PMS-Ableitung, Tagesfenster, Monatswechsel, Benachrichtigungen, API, Datenbank, Migration, Route oder Authentifizierung. Keine Eingabemöglichkeit für Partner.

### Technischer Auftrag für Claude – Korrektur Version 3

- `src/components/NewPartnerCalendar.tsx` ist der erwartete Startpunkt. Verwende den bereits vorhandenen `isCalendarLegendOpen`-State und die bereits an dieser Komponente vorhandenen Bedingungen `hasAnyPrediction`, `manualPmsSection` und `hasFertileWindowSomewhere`; keine neue Abfrage und keine zweite Phasenberechnung.
- Verlege den Trigger in die Monatszeile als Geschwisterelement des Monatsnamens. Der Monatsname im Partner-Kalender bleibt weiterhin reine Anzeige; Monatspfeile bleiben unverändert funktional.
- Ersetze den aktuellen Inline-Legendenbutton und dessen lange Texte durch ein positioniertes, zugängliches Popover mit den vereinbarten kurzen Zeilen. Verwende die bestehenden Farbwerte und bedingten Sichtbarkeiten, statt neue Statuswerte abzuleiten.
- Trigger: `aria-expanded`, `aria-controls`, `aria-haspopup="dialog"` und dynamischer `aria-label`. Popover: `role="dialog"` und klare Beschriftung. Außenklick und Escape schließen ohne neue Abhängigkeit.
- Prüfe strukturell, dass kein Bearbeitungs-, Speichern-, Löschen- oder sonstiges Eingabeelement hinzugefügt wird und die Owner-Komponente nicht durch die Partneränderung verändert wird.

### Invarianten – Korrektur Version 3

- Der Partner sieht ausschließlich Daten, die `NewPartnerCalendar` schon vor dieser Korrektur erhielt; insbesondere keine neuen Rohperioden, Profilwerte, IDs oder zusätzliche Symptome.
- `new-partner-calendar.ts`, `new-partner-cycle-view.ts`, `manual-pms.ts`, `cycle-ring-geometry.ts`, Vorhersagefunktionen, Server-Gates und API-Routen bleiben unverändert.
- Vorhersagen werden weder als bestätigte biologische Ereignisse noch als medizinischer Rat dargestellt.
- Mobile und breite Partneransicht bleiben ohne Kollision, Überlauf oder überdeckte Tagesfelder; die Ansicht bleibt rein lesend.

### Pflichtprüfungen – Korrektur Version 3

- Gezielte Partner-Prüfung: kleiner Info-Button in Monatszeile, kein alter langer Button, geschlossen beim Start, Popover-Attribute, Außenklick und Escape.
- Prüfe die sechs kurzen Zeilen und ihre bestehenden Bedingungen: Vorhersagezeilen nur bei Vorhersage, `PMS eingetragen` nur beim manuellen PMS, keine neue Partnerinformation.
- Prüfe Unsicherheitshinweis, Monatswechsel, Tagesfenster, Partner-Gate und dass keine Eingabeelemente hinzukommen.
- Führe Partner-, Kalender-, Ring-, manuelles-PMS- und Owner-Legendenregressionen aus sowie TypeScript und Produktions-Build.
- Live-Prüfung auf 375 x 812 und 1280 x 900 mit aktiver Verbindung: Popover vollständig sichtbar, kein horizontaler Überlauf, Partner weiterhin rein lesend; teste mindestens einen Vorhersage- und einen manuellen-PMS-Fall.

### Stoppbedingungen – Korrektur Version 3

- Stoppe vor einer Erweiterung von Partnerfreigaben, Datenzugriff, Berechnung, PMS-Logik, API, Datenbank, Migration, Route oder Authentifizierung.
- Stoppe, wenn die kurzen Texte ohne die Kennzeichnung `geschätzt` für Vorhersagen nicht sicher verständlich bleiben oder das Popover auf Mobilgeräten abgeschnitten wird.

### Abschluss durch Claude – Korrektur Version 3

- `Ist – Korrektur Version 3` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-018` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.
