---
id: WP-025
title: "Ruhiger Kalender mit vollständiger Erklärung im Info-Popover"
status: approved
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

- umgesetzt: ausstehend.
- nicht umgesetzt: ausstehend.
- Tests: ausstehend.
- Abweichungen: ausstehend.
- offene Punkte: ausstehend.
- Commit: ausstehend.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschärfung: ausstehend.
- Product-Map aktualisiert: nein.
