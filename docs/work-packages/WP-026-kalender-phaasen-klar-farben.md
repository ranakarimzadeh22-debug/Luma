---
id: WP-026
title: "Kalenderphasen klar durch Farben unterscheiden"
status: review
created: 2026-10-22
updated: 2026-10-22
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Owner- und Partnerkalender"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Kalenderphasen klar durch Farben unterscheiden

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Im Kalender und im `ⓘ`-Fenster erkennt man sofort, ob PMS nur geschätzt oder von der Nutzerin selbst eingetragen ist.
- **Warum machen wir das?** Die bisherigen Pastelltöne im Info-Fenster wirken zu ähnlich; der Unterschied zwischen Vorhersage und tatsächlicher eigener PMS-Eingabe ist nicht deutlich genug.
- **Woher kam die Idee?** Owner-Entscheidung vom 2026-10-22 nach der Prüfung von WP-025.
- **Wo ist es in der App?** Eigenkalender `/neu` und read-only Partnerkalender `/neu/partner`.
- **Was gehört ausdrücklich nicht dazu?** Keine neue Vorhersage, keine PMS-/Periodenberechnung und keine Änderung an Eingaben oder Partnerrechten.
- **Was kann die Ownerin danach ausprobieren?** Sie vergleicht eine geschätzte PMS-Phase mit einem selbst eingetragenen PMS-Tag: die geschätzte Phase ist zart rosa, die eigene Eintragung deutlich kräftiger rosa.

## Entstehungsweg

`Ruhiger Kalender ohne Kürzel → Legende nur über ⓘ → Farben der PMS-Zustände zu ähnlich → bestätigte klare Farbsemantik → WP-026`

- Ausgangsproblem: Geschätzte PMS-Phase und manuell eingetragenes PMS unterscheiden sich optisch nicht deutlich genug.
- bestätigte Wirkung: Nutzerin und Partner erkennen im ersten Blick den Unterschied zwischen Prognose und eigener Eintragung.
- gewählte Lösung: Geschätztes PMS wird als sehr zartes rosa Band mit Rand gezeigt; manuell eingetragenes PMS als sichtbar kräftigeres, gefülltes Rosa. Periode bleibt als gefülltes Rosa, geschätzte nächste Periode als rosa Umriss und Eisprung als violetter Umriss erkennbar.
- wichtige Entscheidung: Im Kalender sind nur tatsächliche Periode, manuell eingetragenes PMS, geschätzte nächste Periode, geschätzte PMS-Phase und Eisprung sichtbar. Das mögliche fruchtbare Zeitfenster wird nicht mehr als eigenes Band dargestellt; seine bestehende Berechnung und Tagesdetail-/ARIA-Information bleiben unverändert.
- Quellen/Akten: WP-022, WP-025, Owner-Entscheidung 2026-10-22.

## Soll – von Codex

- **Problem:** Die Bedeutungen der verschiedenen Kalenderbänder und ihrer Farbpunkte wirken zu ähnlich und sind ohne langes Lesen schwer unterscheidbar.
- **gewünschte Wirkung:** Eingetragene Informationen sind gefüllt und deutlich, Schätzungen sind leicht und umrandet; PMS-Vorhersage und eigenes PMS sind klar verschieden.
- **sichtbare Änderung:** In Owner- und Partnerkalender sowie im passenden `ⓘ`-Popover gelten dieselben fünf klaren Darstellungen: tatsächliche Periode gefüllt rosa, manuelles PMS kräftig gefüllt rosa, nächste Periode nur rosa umrandet, PMS-Prognose sehr hell rosa umrandet, Eisprung violett umrandet. Das Fruchtbarkeitsfenster erscheint nicht als eigenes Kalenderband oder Popover-Zeile.
- **nicht enthalten:** Keine Änderung an Datumswerten, Statusprioritäten, Berechnung, PMS-Eingabe, Periodeneingabe, Tagesfenstern, Ring, Routen, API, Datenbank, Migration oder Partnerfreigabe.
- **Abnahmekriterien:**
  1. Ein manuell eingetragenes PMS-Band ist deutlich kräftiger rosa als ein geschätztes PMS-Band; beide bleiben lesbar und durchgehend.
  2. Tatsächliche Periode, geschätzte nächste Periode und Eisprung bleiben anhand der genannten Füllung/Umrandung/Farbe unterscheidbar.
  3. Das `ⓘ`-Popover nutzt exakt passende Farbpunkte für die dort sichtbaren vier Zeilen und macht den Unterschied zwischen Eingetragen und Geschätzt ohne zusätzliche Erklärung deutlich.
  4. In Owner- und Partnerkalender erscheint kein eigenes Fruchtbarkeitsband; bestehende vollständige Tages-ARIA-Information und das Tagesdetail bleiben erhalten.
  5. Keine Änderung an Kalenderlogik, Daten oder Partner-Read-only; mobil und breit kein horizontaler Überlauf.
- **ein Prüfschritt für den Owner:** `/neu` und danach `/neu/partner` öffnen, PMS-Vorhersage und manuell eingetragenes PMS vergleichen und `ⓘ` öffnen.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` verwaltet Owner-Bandstile in `dayBandStyles`, die passende Schrift in `dayBandTextStyles` und die Popover-Farben in `calendarLegendGroups`.
- `src/components/NewPartnerCalendar.tsx` enthält die parallelen Tabellen `primaryStatusBandStyle`, `primaryStatusBandTextStyle` und `PartnerCalendarLegendPopover`.
- Beide Ansichten leiten Status bereits über `primaryCalendarPhase`, `isWithinManualPmsSection`, `showsFertileMarker`, `calendarBandPosition` und bestehende Prioritäten ab. Diese Logik ist nicht zu ändern.

### Technisches Ziel

- Passe ausschließlich Owner- und Partner-Darstellungsdefinitionen für Bänder, Tageszahlkontrast und Popover-Swatches an die oben bestätigte Farbsemantik an.
- Das geschätzte PMS muss zart/hell rosa und umrandet bleiben; `pms-manual` muss als klar kräftigeres gefülltes Rosa sichtbar sein. Periode, nächste Periode und Eisprung bleiben durch ihre bestätigten Farben und Füllarten unterscheidbar.
- Unterdrücke nur die visuelle Ausgabe des bestehenden `fertile`-Bands im Raster. Behalte seine Berechnung, Tages-ARIA-Beschreibung und Tagesdetailinformation unverändert.
- Der Owner- und Partner-Popover bleiben auf den aus WP-025 bekannten kurzen Zeilen begrenzt; ihre Swatches entsprechen ihren sichtbaren Bändern.

### Invarianten – müssen unverändert bleiben

- `getCalendarDayInfo`, `phasesForDate`, `primaryCalendarPhase`, `showsFertileMarker`, `deriveManualPmsSection`, `isWithinManualPmsSection`, Statusprioritäten, Datums- und Zeitzonenlogik.
- Perioden- und PMS-Eingabe, Tagesfenster, Monatsnavigation, Popover-Steuerung inklusive Escape/Außenklick, Today-Marker, Bandgeometrie, Zyklus-Kreis und alle API-/Datenbankwege.
- Partneransicht bleibt rein lesend und erhält keinen zusätzlichen Datenzugriff.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Gezielte Owner-/Partner-Prüfung: alle fünf sichtbaren Phasenfarben und Füllarten stimmen überein; manuelles PMS ist deutlich kräftiger als geschätztes PMS; kein `fertile`-Band im Raster.
- Popover-Prüfung: Owner- und Partner-Swatches entsprechen den Bändern; nur WP-025-Zeilen sichtbar; `ⓘ`, Escape und Außenklick unverändert.
- Zugänglichkeitsprüfung: Tages-ARIA und Tagesdetail nennen das mögliche Fruchtbarkeitsfenster weiterhin, obwohl kein eigenes Band sichtbar ist.
- Bestehende Kalender-/PMS-/Partner-Regressionen sowie `npx tsc --noEmit` und `npm run build`.
- Sichtprüfung mit lokalen Owner- und Partner-Testkonten bei 360/390/1280 px: kein Überlauf, volle Lesbarkeit, Partner weiter read-only.

### Stoppbedingungen

- Stoppe vor einer Änderung von Berechnung, Statuspriorität, Datenzugriff, Partnerfreigabe, API, Datenbank oder Migration.
- Stoppe und frage nach, wenn eine Farbänderung den Kontrast der Tageszahl oder die Unterscheidbarkeit einer bestehenden Phase verschlechtert.
- Wenn ein genannter Darstellungsstartpunkt nicht mehr stimmt, darf der passende Ort gesucht werden; Wirkung und Invarianten bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-026` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein Deployment auslösen.

## Ist – von Claude

- umgesetzt:
  - Neue reine Darstellungsdatei `src/lib/calendar-phase-colors.ts`: eine gemeinsame Farbquelle für Owner-Kalender, Partner-Kalender und beide ⓘ-Popover (Band- und Schriftklassen plus zwei kleine Swatch-Helfer). Dadurch passen Legende und Kalender per Konstruktion exakt zusammen. Keine Logik, keine Daten.
  - Farbsemantik in beiden Kalendern: tatsächliche Periode gefülltes Rosa (`#fac9d6`); eigenes (manuelles) PMS deutlich kräftigeres, gefülltes Rosa (`#ee8db1`, Kontrast zur Periodenfüllung 1,58, Zahl dunkel `#4d0826`); geschätzte nächste Periode rosa Umrandung (`#e58fae`); geschätztes PMS sehr hellrosa mit hellem Rand (`#f4cbd9`, fast weißer Innenraum); Eisprung violette Umrandung (`#a98ae0`). Die gespeicherte Planung (Owner) bleibt der bisherige rosa gestrichelte Umriss.
  - Geschätzte nächste Periode: In beiden Kalendern war sie zuletzt nur noch ein lila Zahlenhintergrund ohne Band. Sie erhält jetzt wieder ihr Umrissband (rosa) und der lila Zahlenhintergrund (`isEstimatedPeriod` bzw. `status === "period"` im Partnerkalender) entfällt, damit Violett ausschließlich den Eisprung bedeutet.
  - Das mögliche fruchtbare Zeitfenster hat kein eigenes Band mehr (Band-Schlüssel `fertile` entfernt). Berechnung (`showsFertileMarker`, `isFertileDay`/`isFertileFor`), Tages-ARIA und Tagesdetail sind unverändert.
  - ⓘ-Popover (Owner und Partner): bleibt bei den vier WP-025-Zeilen; die vier Farbpunkte kommen aus derselben Farbquelle wie die Bänder.
  - Unverändert: `getCalendarDayInfo`, `phasesForDate`, `primaryCalendarPhase`, `deriveManualPmsSection`, `isWithinManualPmsSection`, Statusprioritäten, Bandgeometrie, Tagesfenster, Monatsnavigation, Popover-Steuerung, Zyklus-Kreis, API, Datenbank, Partnerrechte (rein lesend).
- nicht umgesetzt: nichts offen.
- Tests:
  - `scripts/verify-calendar-tile-band.ts`: der V8-Block wurde durch einen WP-026-Block ersetzt (Palette importiert und geprüft: Periode und eigenes PMS gefüllt, drei umrandete Schätzungen, eigenes PMS deutlich kräftiger als Periodenfüllung und klar verschieden vom geschätzten PMS, geschätztes PMS sehr hell, Periodenrand kräftiger als PMS-Rand, Eisprung violett, Tageszahl-Kontrast je Band mindestens 4,5, beide Kalender und beide Popover nutzen dieselbe Quelle, kein `fertile`-Band, Fruchtbarkeits-Berechnung und ARIA bleiben, keine Periodenzahl-Kreise mehr). Eine Partner-Kachelrand-Assertion wurde an die verbleibende Zweigzahl angepasst. Alle bestehen.
  - `verify-calendar-quiet-wp025`, `verify-calendar-legend-collapsible`, `verify-calendar-band-position`, `verify-manual-pms-symptom-ui`, `verify-day-detail` bestehen; `verify-partner-calendar-legend-collapsible` bis auf die bereits vorher fehlerhafte TodayCard-Prüfung.
  - `npx tsc --noEmit` und `npm run build` bestehen. ESLint: nur die bereits vorher vorhandenen Meldungen in `NewCycleExample.tsx`; neue Dateien und Partnerkalender ohne Meldung.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; Owner und Partner bei 360, 390 und 1280 px; aktuelle und nächste Monatsansicht, ⓘ offen): im Raster erscheinen genau die fünf Stile (berechnete Farben aus dem Browser gelesen), kein Fruchtbarkeitsband; die vier Popover-Farbpunkte entsprechen in Füllung bzw. Umrandung exakt den jeweiligen Bändern; kein horizontaler Überlauf. Playwright wieder entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: Der lila Hintergrundkreis hinter der Zahl der geschätzten Periode (früherer Codex-Commit) wurde entfernt und durch das rosa Umrissband ersetzt, weil der Auftrag „geschätzte nächste Periode: rosa Umrandung“ und „Farben im ⓘ-Fenster passen exakt zum Kalender“ verlangt. Außerdem wurde die gemeinsame Farbdatei als kleine Darstellungshilfe ergänzt (kein neuer Fachcode).
- offene Punkte: Das Info-Fenster nennt wie in WP-025 Version 2 vorgegeben keine Eisprung-Zeile, obwohl der Eisprung im Kalender violett umrandet erscheint; falls gewünscht, wäre das eine eigene Freigabe. Vorbestehende Prüfskript-Fehler aus WP-023/WP-024 bleiben bestehen. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`feat(wp-026)`).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschärfung: ausstehend.
- Product-Map aktualisiert: nein.
