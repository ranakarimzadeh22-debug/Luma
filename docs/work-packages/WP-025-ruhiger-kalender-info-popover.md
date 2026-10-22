---
id: WP-025
title: "Ruhiger Kalender mit vollständiger Erklärung im Info-Popover"
status: review
created: 2026-10-21
updated: 2026-10-21
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Owner- und Partnerkalender"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Ruhiger Kalender mit vollständiger Erklärung im Info-Popover

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Im Kalender sind nur Tageszahl, bestehende Farbbänder und der rote Heute-Punkt sichtbar. Die kleinen Buchstaben und Zeichen in einzelnen Tagen verschwinden.
- **Warum machen wir das?** Der Kalender wirkt durch Buchstaben, Punkte und Farbbänder gleichzeitig überladen. Die Ownerin möchte alle Erklärungen nur bei Bedarf hinter dem bestehenden `ⓘ`-Button sehen.
- **Wo ist es in der App?** Im eigenen Kalender auf `/neu` sowie im bereits verbundenen, read-only Partnerkalender auf `/neu/partner`.
- **Was passiert beim Antippen von `ⓘ`?** Ein kompaktes Popover erklärt alle sichtbaren Farben und unterscheidet klar zwischen eingetragenen/tatsächlichen und geschätzten Tagen. Auch der Unsicherheitshinweis steht dort.
- **Was gehört ausdrücklich nicht dazu?** Keine neue Zyklus- oder Vorhersagelogik, keine Änderung von Farben oder Bändern, keine Änderung an Periodeneingabe, Tagesfenster, Historie, Partnerfreigaben, Datenbank, API oder Benachrichtigungen.
- **Was kann die Ownerin danach ausprobieren?** Sie sieht einen ruhigen Kalender ohne Kürzel, öffnet `ⓘ` für die Erklärung und prüft dieselbe Darstellung beim freigegebenen Partner.

## Entstehungsweg

`Tageszahlen zeigen gleichzeitig Farbbänder, Buchstaben und Marker → Kalender wirkt schwer lesbar → nur Farbzustände in den Tagesfeldern, alle Erklärungen im vorhandenen Info-Popover → WP-025`

- bestätigtes Problem: Sichtbare Kürzel wie `B`, `Gsch.`, `M`, `M·Du` beziehungsweise `M·Sie`, `E` und der zusätzliche Fruchtbarkeits-Punkt konkurrieren mit Tageszahlen und Farbbändern.
- bestätigte Wirkung: Der Kalender ist beim ersten Blick ruhig und lesbar; die Bedeutung jeder Farbe bleibt über den vertrauten `ⓘ`-Button vollständig erreichbar.
- gewählte Lösung: Tagesfelder zeigen nur Datum, vorhandenes Farbband und gegebenenfalls den bestehenden roten Heute-Punkt. Das bestehende Popover wird zur einzigen sichtbaren Kalendererklärung und gruppiert tatsächliche/eingetragene Daten klar getrennt von Schätzungen.
- wichtige Entscheidung: Es gibt keine dauerhafte Legende oder Unsicherheitszeile unter dem Kalender. Jede Prognose bleibt im Popover und im Tagesfenster ausdrücklich als unsicher beziehungsweise `Kann abweichen` formuliert.
- Quellen: Owner-Entscheidung vom 2026-10-21, WP-018, WP-022, bestehende Owner- und Partnerkalender.

## Soll – von Codex

- **Problem:** Die bereits vorhandenen Farbbänder werden durch zusätzliche Kürzel und Markierungspunkte in derselben Tageszelle schwerer lesbar.
- **gewünschte Wirkung:** Jede Tageszelle bleibt auf Zahl und Farbstatus reduziert; die volle Bedeutung ist an einer vorhersehbaren Stelle über `ⓘ` erreichbar.
- **sichtbare Änderung:** In beiden Kalendern entfallen alle sichtbaren Statuskürzel und Zusatzpunkte in Tageszellen. Bestehende Farbbandflächen und der rote Heute-Punkt bleiben. Unter dem Kalender steht keine Legende und kein dauerhafter Unsicherheitstext.
- **nicht enthalten:** Keine Änderung der bisherigen Berechnungen, Prioritäten, Bandfarben, Bänder, Monate, Tagesaktionen, Detailfenster, Vorhersagewerte, Ringdarstellung, Partnerrechte, API, Datenbank, Migration oder Authentifizierung.
- **Abnahmekriterien:**
  1. Owner- und Partnerkalender zeigen in Tageszellen keine sichtbaren Buchstaben, Abkürzungen oder zusätzlichen Statuspunkte mehr; Tageszahl, bestehende Bänder und roter Heute-Punkt bleiben erhalten.
  2. Das vorhandene `ⓘ`-Popover ist die einzige visuelle Kalenderlegende und unterscheidet klar zwischen `Eingetragen` und `Geschätzt`.
  3. Das Popover erklärt, soweit für den jeweiligen Kalender vorhanden: tatsächliche Periode, manuell eingetragenes PMS, geschätzte nächste Periode, geschätzte PMS-Phase, geschätzten Eisprung und mögliches fruchtbares Zeitfenster.
  4. Jede geschätzte Information enthält sichtbar `Kann abweichen`; der frühere dauerhafte Unsicherheitshinweis unter dem Kalender erscheint nicht mehr.
  5. Tages-ARIA-Labels und Tagesfenster bewahren die vollständigen Statusinformationen für Screenreader beziehungsweise beim Antippen; Owner-Aktionen und Partner-Read-only bleiben unverändert.
  6. Die Partneransicht zeigt nur bereits bestehende, freigegebene Kalenderinformationen und erhält keine Bearbeitungsmöglichkeit oder neuen Datenzugriff.
  7. Mobil und breit gibt es keinen horizontalen Überlauf; `ⓘ`, Monatstitel und Monatspfeile bleiben getrennt bedienbar.
- **ein Prüfschritt für den Owner:** `/neu` öffnen, eine farbige Tageszelle und `ⓘ` prüfen; anschließend `/neu/partner` bei aktiver Verbindung öffnen und dieselbe ruhige Darstellung ohne Bearbeitungsmöglichkeit prüfen.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` enthält den Ownerkalender, `CalendarLegendPopover`, die vorhandene `isCalendarLegendOpen`-Steuerung, `dayAriaLabel`, die Banddaten sowie die sichtbaren Tageskürzel `M·Du`, `Gsch.` und Phasenbuchstaben.
- `src/components/NewPartnerCalendar.tsx` enthält den read-only Partnerkalender, `PartnerCalendarLegendPopover`, `primaryStatusLetter`, den zusätzlichen Fruchtbarkeits-Punkt und die dauerhafte Unsicherheitszeile.
- Beide Komponenten haben bereits einen zugänglichen, separat bedienbaren `ⓘ`-Button in der Monatszeile und bestehende Tages-ARIA-Labels. Diese Strukturen sind wiederzuverwenden, nicht zu duplizieren.
- `getCalendarDayInfo`, `primaryCalendarPhase`, `phasesForDate`, `showsFertileMarker`, `calendarBandPosition`, `todayBerlinDateOnly` und die bestehenden Band-/Prioritätsentscheidungen sind die fachlichen Quellen und dürfen nicht verändert werden.

### Technisches Ziel

- Entferne ausschließlich die visuelle Ausgabe der vorhandenen Tagesstatus-Kürzel und Zusatzpunkte aus Owner- und Partner-Tagesfeldern. Tageszahl, bestehende Bandflächen, deren bestehende Prioritäten sowie der rote Heute-Punkt bleiben unverändert.
- Baue die beiden vorhandenen Info-Popover mit kurzen, leicht verständlichen Farbzeilen aus beziehungsweise passe sie an: eingetragene/tatsächliche Zustände und geschätzte Zustände sind klar gruppiert; jede geschätzte Zeile benennt `Kann abweichen`.
- Entferne die dauerhaft sichtbare Unsicherheitszeile unter beiden Kalendern. Ihre Information bleibt im passenden Popover sowie in bestehenden Tagesdetails zugänglich.
- Bewahre die bestehenden vollständigen ARIA-Beschreibungen der Tagesfelder. Das Entfernen sichtbarer Kürzel darf keine Information für Screenreader entfernen.
- Verwende vorhandene Zustände und Ableitungen; keine zweite Status-, Vorhersage- oder Freigabelogik.

### Invarianten – müssen unverändert bleiben

- Kalenderdaten, Periodenstatus-Prioritäten, Bandfarben, Bandgeometrie, Fruchtbarkeitsberechnung, PMS-Berechnung, Eisprung, heutiges Datum und alle Zeitzonenregeln.
- Owner-Tagesfenster samt Eingabe-/Korrekturmöglichkeiten und Partner-Tagesfenster als reine Ansicht.
- Die serverseitigen Partner-Gates und der Umfang bereits freigegebener Daten. Keine Rohdaten, IDs, Symptome oder privaten Profile zusätzlich an den Partner ausliefern.
- Monatsnavigation, antippbarer Monatsname/Periodenhistorie, Info-Button-Zugänglichkeit, Escape- und Outside-Click-Verhalten des Popovers.
- Keine Änderung an Zyklus-Kreis, Einstellungen, Verbindung, Benachrichtigungen, Authentifizierung, alter Luma oder `app_luma`.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- API-Wirkung: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Gezielte Owner- und Partnerprüfung: sichtbare `B`/`Gsch.`/`M`/`M·Du`/`M·Sie`/`E`-Kürzel und der zusätzliche Fruchtbarkeits-Punkt fehlen aus Tageszellen; Farbband, Tageszahl und Heute-Punkt bleiben korrekt.
- Popoverprüfung in beiden Ansichten: geschlossen beim Start, `ⓘ` öffnet/schließt; klare Gruppen für eingetragen und geschätzt; jede sichtbare Prognose mit `Kann abweichen`; kein permanenter Legenden- oder Unsicherheitstext unter dem Kalender.
- Zugänglichkeitsprüfung: `aria-expanded`, `aria-controls`, dynamischer Info-Button-Name und vollständige Tages-ARIA-Labels bleiben korrekt; Escape und Klick außerhalb schließen weiterhin.
- Owner-Regression: Monatswechsel, Monatstitel/Periodenhistorie, Tagesfenster und tatsächliche Periodenaktionen unverändert nutzbar.
- Partner-Sicherheits-/Read-only-Regression: keine Owner-Mutation oder neue Datenfreigabe; Tagesdetail bleibt reine Ansicht.
- Sichtprüfung mit lokalen Testkonten bei 360/390 px und 1280 px: keine Kollision oder horizontaler Überlauf; Besitzerin und berechtigter Partner sehen die jeweils passende ruhige Kalenderansicht.
- `npx tsc --noEmit` und `npm run build`; vorhandene relevante Kalender-/Popover-Regressionsprüfungen. Bereits dokumentierte, unabhängige Testdefekte nur nennen, nicht still ändern.

### Stoppbedingungen

- Stoppe vor jeder Änderung an Berechnung, Vorhersage, Bandfarbe, Bandgeometrie, Datenzugriff, Partnerfreigabe, API, Datenbank oder Migration.
- Stoppe, wenn eine Information nur durch Ausblenden aus ARIA oder Tagesdetail verloren ginge.
- Stoppe, wenn die vollständige Erklärung nicht im bestehenden `ⓘ`-Popover untergebracht werden kann, ohne Touch-, Fokus- oder mobile Layoutprobleme zu erzeugen.
- Wenn ein genannter Startpunkt nicht mehr stimmt, darf Claude nur den passenden Darstellungsort suchen; Wirkung und Invarianten bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger für die Änderung ergänzen und validieren.
- `node scripts/work-package-state.mjs mark-updated WP-025` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – von Claude

- umgesetzt:
  - `src/components/NewCycleExample.tsx` (Ownerkalender): Tageszellen zeigen nur noch Tageszahl, Farbband und den roten Heute-Punkt. Entfernt: die Kürzel `P`, `Läuft`, `Ca.`, `Plan`, `Gsch.`, `M`, `M·Du`, `E` samt der ungenutzten Konstanten `phaseLetters`/`phaseLabels` sowie der zusätzliche Fruchtbarkeits-Punkt. Die dauerhafte Zeile „Vorhersage unsicher - Kann abweichen“ unter dem Kalender ist entfernt.
  - `src/components/NewPartnerCalendar.tsx` (Partnerkalender, rein lesend): Kürzel `B`, `Gsch.`, `M`, `M·Sie`, `E` (`primaryStatusLetter`), der Fruchtbarkeits-Punkt und die dauerhafte Unsicherheitszeile entfernt.
  - Info-Popover (beide): einzige sichtbare Kalendererklärung, gruppiert in „Eingetragen“ und „Geschätzt“. Owner: Periode (tatsächlich), PMS von dir eingetragen, Gespeicherte Planung; geschätzt: Nächste Periode, Voraussichtliches Ende, PMS-Phase, Eisprung, Mögliches fruchtbares Zeitfenster, jeweils mit sichtbarem „Kann abweichen“. Partner: Periode bestätigt, PMS eingetragen (nur bei vorhandenem manuellem PMS); geschätzt (nur bei vorhandener Vorhersage): Nächste Periode, PMS vor Periode, Eisprung, Mögliches fruchtbares Zeitfenster (nur bei vorhandenem Fenster), jeweils mit „Kann abweichen“. Der Unsicherheitshinweis „Vorhersage unsicher – Kann abweichen“ steht jetzt im Popover und nur bei `prediction.isUncertain`. Zugänglichkeit (`aria-expanded`, `aria-controls`, dynamischer Button-Name, `role=dialog`, Escape, Außenklick) unverändert.
  - Popover-Layout: Breite `w-64` (statt `w-56`), deckender Hintergrund und `z-30` (statt `bg-white/95`/`z-10`), weil die höheren Tageskacheln (`z-10`) bei der längeren Erklärung sonst durch das Popover schienen. Das Popover hat weiterhin keine innere Scrollfläche.
  - Zugänglichkeit: Im Ownerkalender stand die Bedeutung geschätzter Phasen nur im `aria-label` der entfernten Kürzel-Spans. Damit keine Information verloren geht (Stoppbedingung), wurde das Tages-`aria-label` um „geschätzte nächste Periode, kann abweichen“, „PMS-Phase geschätzt, kann abweichen“ und „Eisprung geschätzt, kann abweichen“ ergänzt (nur wenn kein anderer Status greift). Der Partnerkalender nutzt weiter `primaryStatusLabel` im Tages-`aria-label`.
  - Unverändert: Bänder, Bandfarben, Prioritäten, `getCalendarDayInfo`, `primaryCalendarPhase`, `showsFertileMarker`, `calendarBandPosition`, Tagesfenster, Monatsnavigation, Daten, API, Partnerrechte, Zyklus-Kreis. Der lila Hintergrundkreis hinter der Zahl bei geschätzter Periode (`#f3edff`, aus einem früheren Codex-Commit) bleibt als Farbfläche bestehen, weil er Teil der Bandfarbe „geschätzte Periode“ ist und in der Legende erklärt wird.
- nicht umgesetzt: nichts offen.
- Tests:
  - Neues Skript `scripts/verify-calendar-quiet-wp025.ts` (alle Prüfungen bestanden): keine Kürzel und keine Zusatzpunkte in Tageszellen, Zahl/Band/Heute-Punkt bleiben, keine dauerhafte Unsicherheitszeile, vollständige Tages-ARIA-Labels, Popover-Gruppen und „Kann abweichen“, Partner nur lesend.
  - Angepasste, fachlich überholte Assertions (neue Popover-Struktur und fehlende Dauerzeile): `verify-calendar-legend-collapsible.ts`, `verify-partner-calendar-legend-collapsible.ts`, `verify-calendar-tile-band.ts` (zusätzlich eine bereits vor WP-025 veraltete Partner-Kachelrand-Assertion an den aktuellen Code angepasst), `verify-period-history-overview.ts` (Anker für den Bereich unter dem Kalendergrid). Alle angepassten Skripte bestehen bis auf die unten genannten vorbestehenden Fehler.
  - Vorbestehend, per `git stash` belegt und nicht verändert: Fehlschläge in `verify-home-screen-layout`, `verify-owner-home-warm-redesign`, `verify-today-card`, `verify-mobile-home-compact`, `verify-mobile-partner-compact`, `verify-home-actions-consistent`, `verify-period-history-layout`, `verify-period-history-overview` (3 Prüfungen zu PeriodHistoryModal), `verify-historical-entry`, `verify-personal-cycle-view` sowie eine TodayCard-Prüfung in `verify-partner-calendar-legend-collapsible` (Ursache: frühere Umbauten WP-023/WP-024). Vorbestehende ESLint-Meldungen in `NewCycleExample.tsx` (1 Fehler `set-state-in-effect`, 2 Warnungen unbenutzte Imports) unverändert.
  - `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; Owner und Partner bei 360, 390 und 1280 px; bestätigte Periode, manuelles PMS, Schätzungen, gespeicherte Planung): in allen Tageszellen nur Zahlen, 0 Fruchtbarkeitspunkte, kein „Vorhersage unsicher“ außerhalb des Popovers, kein horizontaler Überlauf, Popover beim Start geschlossen, öffnet über ⓘ, liegt vollständig im Viewport, schließt mit Escape. Playwright wieder entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: Zusätzlich zum Brief wurde das Tages-`aria-label` ergänzt und das Popover (Breite, Deckkraft, z-Index) angepasst, jeweils zwingend, um die Stoppbedingung bzw. die Lesbarkeit einzuhalten. Keine Änderung an Logik, Daten oder Rechten.
- offene Punkte: Vorbestehende Testfehler (siehe oben) sollten separat an den WP-023/024-Aufbau angepasst werden. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`feat(wp-025)`).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschärfung: ausstehend.
- Product-Map aktualisiert: nein.

## Korrekturauftrag Version 2 – von Codex

### Owner-Entscheidung

Die Ownerin möchte das `ⓘ`-Popover weiter vereinfachen. Es bleiben nur die für den täglichen Überblick notwendigen Zeilen sichtbar:

- **Eingetragen:** `Periode (tatsächlich)` und `PMS von dir eingetragen`.
- **Geschätzt:** `Nächste Periode` und `PMS-Phase`, jeweils mit `Kann abweichen`.
- Der einzelne Hinweis `Vorhersage unsicher – Kann abweichen` bleibt nur, wenn die Vorhersage tatsächlich unsicher ist.

Entferne als derzeit überflüssige Informationen aus dem Owner- und Partner-Popover vollständig: `Gespeicherte Planung`, `Voraussichtliches Ende`, `Eisprung` und `Mögliches fruchtbares Zeitfenster`. Die Zeilen dürfen weder sichtbar noch als leere Überschrift/Platzhalter erscheinen.

### Bindender Umfang

- Ändere ausschließlich die sichtbaren Zeilen der beiden bestehenden Info-Popover auf `/neu` und `/neu/partner`.
- Tageszellen bleiben unverändert ruhig: nur Tageszahl, bestehendes Band und roter Heute-Punkt.
- Keine Änderung an Berechnung, Bandfarben, Fruchtbarkeitsdaten, Tages-ARIA-Labels, Tagesfenstern, Partnerrechten, APIs, Datenbank oder Zyklus-Kreis.
- Partneransicht bleibt vollständig read-only; fehlen dort Daten für eine verbleibende Zeile, bleibt die bestehende bedingte Anzeige zulässig.

### Pflichtprüfung für Version 2

- Beide Popover enthalten nur die verbleibenden vier fachlichen Zeilentypen plus den bedingten Unsicherheitshinweis.
- Die vier entfernten Begriffe kommen in keinem sichtbaren Popover-Zeilentext mehr vor.
- `ⓘ`, Escape, Außenklick, Kalender-Tageszellen, Monatsnavigation und Partner-Read-only funktionieren unverändert.
- Gezielte Prüfung, `npx tsc --noEmit`, `npm run build` und Sichtprüfung Owner/Partner mobil sowie breit.

## Ist Version 2 – von Claude

- umgesetzt:
  - `src/components/NewCycleExample.tsx` (Owner-Popover): Es bleiben genau vier Zeilen. Eingetragen: „Periode (tatsächlich)“, „PMS von dir eingetragen“. Geschätzt: „Nächste Periode“ und „PMS-Phase“, jeweils mit sichtbarem „Kann abweichen“. Entfernt: „Gespeicherte Planung“, „Voraussichtliches Ende“, „Eisprung“, „Mögliches fruchtbares Zeitfenster“ (Zeilen vollständig aus der Gruppentabelle gelöscht, keine leere Überschrift oder Platzhalter).
  - `src/components/NewPartnerCalendar.tsx` (Partner-Popover): „Eisprung“ und „Mögliches fruchtbares Zeitfenster“ entfernt. Die Zeile „PMS vor Periode“ heißt jetzt „PMS-Phase“ (einheitlich mit dem Owner-Popover). Die bestehenden Bedingungen bleiben (Gruppe „Geschätzt“ nur bei vorhandener Vorhersage, „PMS eingetragen“ nur bei manuellem PMS). Die Variable `hasFertileWindowSomewhere` samt Prop diente ausschließlich der entfernten Zeile und wurde mit ihr entfernt (sonst unbenutzter Code); sie hatte keine andere Verwendung.
  - Der bedingte Unsicherheitshinweis „Vorhersage unsicher – Kann abweichen“ im Popover bleibt unverändert.
  - Unverändert: Tageszellen (nur Zahl, Band, roter Heute-Punkt), Tages-ARIA-Labels, Bänder und Bandfarben, Berechnung, Fruchtbarkeitsdaten, Tagesfenster, Monatsnavigation, ⓘ-Button, Escape/Außenklick, Partnerrechte (rein lesend), Zyklus-Kreis, API, Datenbank.
- nicht umgesetzt: nichts offen.
- Tests:
  - `scripts/verify-calendar-quiet-wp025.ts` und `scripts/verify-calendar-legend-collapsible.ts` und `scripts/verify-partner-calendar-legend-collapsible.ts` und `scripts/verify-calendar-tile-band.ts` an die vier verbleibenden Zeilentypen angepasst und um Prüfungen ergänzt: die vier entfernten Begriffe (und „PMS vor Periode“) kommen in keinem Popover mehr vor, genau vier Owner-Zeilen, genau zwei Gruppenüberschriften im Partner-Popover, keine Fruchtbarkeits-Bedingung mehr. Alle bestehen bis auf die bereits vor WP-025 vorhandene, unabhängige TodayCard-Prüfung in `verify-partner-calendar-legend-collapsible.ts`.
  - `npx tsc --noEmit`, ESLint für `NewPartnerCalendar.tsx` (ohne Meldung) und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; Owner und Partner bei 360, 390 und 1280 px): Owner-Popover „Eingetragen | Periode (tatsächlich) | PMS von dir eingetragen | Geschätzt | Nächste Periode | Kann abweichen | PMS-Phase | Kann abweichen“, Partner-Popover entsprechend mit „Periode bestätigt“, „PMS eingetragen“. Tageszellen zeigen nur Zahlen, kein Überlauf, Popover beim Start geschlossen, öffnet über ⓘ, liegt im Viewport, schließt mit Escape. Playwright wieder entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine. Die Partner-Zeilen „Periode bestätigt“ und „PMS eingetragen“ behalten ihre Partner-Formulierung (nicht „von dir“), weil der Partner die Angaben der Nutzerin sieht.
- offene Punkte: keine neuen. Vorbestehende Prüfskript-Fehler aus WP-023/WP-024 bleiben wie unter „Ist“ genannt. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`fix(wp-025)` Version 2).
