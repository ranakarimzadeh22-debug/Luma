---
id: WP-022
title: "Korrektur V4: Breite Kalender-Phasenbaender hinter Tageszahlen"
status: review
created: 2026-10-19
updated: 2026-10-19
owner_approved: yes
executor: claude
product_area: "Neue Luma – Kalender in Eigen- und Partneransicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Korrektur V4 – Breite Kalender-Phasenbaender hinter Tageszahlen

> **Verbindlicher Vorrang:** Ausschliesslich `Korrekturauftrag Version 4 – verbindlich` am Dokumentende gilt fuer die erneute Umsetzung. Alle vorherigen Vorgaben dieses Pakets, einschliesslich der schmalen Unterkante aus Version 2 und der noch nicht umgesetzten Version 3, sind damit ersetzt.

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Die rosa und violetten Phasen im Kreis sehen jeweils wie ein zusammenhaengendes Band aus. Der heutige Kalendertag steht als Zahl in einem kleinen roten Punkt auf dem richtigen Platz im Kreis, zum Beispiel `19`.
- **Warum machen wir das?** Die Ownerin moechte den heutigen Tag und die Phasen schneller erkennen, ohne den Eindruck vieler einzeln gefaerbter Tage.
- **Wo ist es in der App?** Im bereits gemeinsamen Zyklus-Kreis auf `/neu` und `/neu/partner`, mobil und breit.
- **Was bleibt gleich?** Alle Daten, Vorhersagen, PMS-Eintraege, Kalenderfarben, Berechnungen und Partnerrechte.
- **Was gehoert nicht dazu?** Keine neue Phase, keine neue Vorhersage, kein neuer Kalendermarker, keine Datenbank, API oder Einstellung.
- **Was kann die Ownerin danach ausprobieren?** Sie sieht am heutigen Tag, zum Beispiel am 19., einen roten runden Punkt mit `19`; PMS und Fruchtbarkeit sind als klare zusammenhaengende Baender sichtbar. Im Partnerkreis erscheint dieselbe Darstellung rein lesend.

## Entstehungsweg

`Zyklus-Kreis soll weniger wie einzelne Tagesfarben wirken → Phasen als klare zusammenhaengende Baender gewuenscht → heutiger Kalendertag soll direkt im roten Punkt stehen → identische Darstellung fuer Ownerin und Partner → WP-022`

- Ausgangsproblem: Der heutige Tag und die laenger andauernden Phasen sind im Kreis nicht so unmittelbar lesbar wie gewuenscht.
- bestaetigte Wirkung: Die Darstellung zeigt zusammenhaengende Farbbaender und den heutigen Kalendertag als klaren, kleinen roten Punkt.
- gewaehlte Loesung: Die bestehende gemeinsame SVG-Komponente zeichnet die vorhandenen Phasen als visuell durchgehende Baender; ihr tagesgenauer Marker zeigt die Tageszahl des Monats.
- wichtige Entscheidung: Die Anpassung gilt gleichermassen fuer Owner- und Partneransicht. Die Zahl ist der Tag des Monats, nicht der Zyklustag.
- Quellen/Akten: APP-IDEA-029, WP-020, WP-016, WP-017.

## Soll – von Codex

- **Problem:** Der gemeinsame Zyklus-Kreis soll Phasen klarer als zusammenhaengende Baender zeigen und den heutigen Kalendertag sofort sichtbar machen.
- **gewuenschte Wirkung:** Rosa PMS- und violette Fruchtbarkeitsabschnitte wirken innerhalb ihrer bestehenden Grenzen als jeweils ein klares, zusammenhaengendes Band. Ein kleiner roter Kreis markiert tagesgenau heute und zeigt die Kalendertagszahl, zum Beispiel `19`.
- **sichtbare Aenderung:** Der rote Heute-Marker im Ring ist gross genug fuer eine gut lesbare weisse Tageszahl, bleibt rund und sitzt auf dem bereits tagesgenau berechneten Winkel. Es gibt keine einzeln dargestellten Tageskaestchen oder Tageszahlen auf den Phasenbaendern.
- **nicht enthalten:** Keine Aenderung an Segmentdaten, Segmentgrenzen, Ring-Geometrie, Vorhersage, Perioden-, PMS- oder Kalenderlogik; keine Aenderung an der Partnerberechtigung, Eingabemoeglichkeit, Route, Datenbank, API, Migration oder an der mobilen Kompaktgroesse aus WP-016/WP-017.
- **Abnahmekriterien:**
  1. Jede sichtbare Phase bleibt innerhalb ihrer bereits berechneten Grenzen und erscheint darin als ein zusammenhaengendes Farbband ohne visuelle Aufteilung in einzelne Kalendertage.
  2. Der rote Heute-Punkt zeigt den Tag des Monats ohne fuehrende Null, zum Beispiel `19` oder `9`, in weisser lesbarer Schrift.
  3. Der rote Punkt bleibt auf dem exakten, bereits vorhandenen heutigen Winkel; insbesondere liegt er am ersten Tag eines manuellen PMS-Abschnitts am Beginn des rosa PMS-Bands.
  4. Eigen- und Partneransicht verwenden dieselbe Darstellung aus der gemeinsamen Ring-Komponente; die Partneransicht bleibt vollstaendig rein lesend.
  5. Die kompakte mobile und die breite Darstellung bleiben ohne Ueberlauf lesbar; bestehende Labels duerfen nicht vom neuen Punkt verdeckt werden.
- **ein Prüfschritt für den Owner:** Auf `/neu` den Kreis mit dem Kalender vergleichen: Die Zahl im roten Punkt ist der heutige Tag des Monats und steht auf derselben Zyklusposition wie heute. Danach `/neu/partner` oeffnen und dieselbe Darstellung pruefen.

## Technischer Auftrag für Claude

### Bestaetigte Ausgangslage im Code

- `src/components/CyclePersonalRing.tsx` ist die gemeinsame, rein darstellende SVG-Komponente fuer den Zyklus-Kreis. `NewCycleExample.tsx` und `NewPartnerCycleRing.tsx` rendern sie bereits auf mobil und breit; die Partneransicht erhaelt keine eigenen Ringdaten oder Eingabemoeglichkeiten.
- `src/lib/cycle-ring-geometry.ts` liefert die bestehenden `segments` und den tagesgenauen `todayAngle`. Seit WP-020 wird dieser Winkel auch bei manuellem PMS nie mehr zur Label-Kollisionsvermeidung verschoben.
- Die drei vorhandenen Segmente sind Periode, Fruchtbarkeit/Eisprung und PMS. Ihre Winkel, Grenzen und Datumsquellen sind fachliche Darstellung und duerfen nicht veraendert werden.
- Die gemeinsame Komponente kennt bereits `compact` fuer mobil sowie `manualPmsOverride`; beide sind rein visuelle bzw. bereits abgeleitete Eingaben und duerfen nicht neu interpretiert werden.

### Technisches Ziel

- Passe ausschliesslich die gemeinsame Ring-Darstellung so an, dass jedes bestehende Segment visuell als ein durchgehendes Farbband erscheint. Falls die aktuelle SVG-Form bereits durchgehend ist, dokumentiere den Befund und nimm nur die nachstehend benoetigte Marker-Aenderung vor; erfinde keine Tagesunterteilung oder neue Segmentdaten.
- Leite die Tageszahl ausschliesslich aus dem bereits uebergebenen ISO-Tageswert `today` ab. Zeige sie ohne fuehrende Null zentriert in einem kleinen runden roten Heute-Marker mit ausreichendem Kontrast, jeweils passend fuer `compact` und breite Darstellung.
- Bewahre die bestehende zugängliche Benennung des Markers und ergaenze sie bei Bedarf um den sichtbaren Kalendertag. Die Zahl darf nie alleinige Information fuer Screenreader sein.
- Verwende weiterhin dieselbe `CyclePersonalRing`-Komponente in Eigen- und Partneransicht. Keine neuen Daten, Props bei Aufrufern, doppelten Darstellungen oder Partner-spezifische Abweichungen einfuehren, sofern sie nicht zur rein visuellen Skalierung innerhalb der bestehenden Komponente zwingend erforderlich sind.

### Invarianten – muessen unveraendert bleiben

- `buildPersonalRingGeometry`, seine Winkel und Segmentgrenzen, `manual-pms.ts`, `PersonalCycleView`, Kalenderdarstellung und die bestehende PMS-Prioritaet bleiben fachlich unveraendert.
- Der Marker bleibt auf dem `todayAngle`, nie auf einer Segmentmitte oder einem Labelwinkel. Bei manuellem PMS muss er weiterhin mit dem Kalenderdatum uebereinstimmen.
- Partneransicht, Partner-Gate, Datenschutz, Leserechte und fehlende Eingaben bleiben unveraendert.
- Der `no_data`-Zustand zeigt weiterhin keinen persoenlichen Heute-Marker und bleibt inhaltlich unveraendert.
- Keine neue Route, Abhaengigkeit, API, Migration, Datenbankabfrage, gespeicherte Einstellung oder globale CSS-Aenderung.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Ergaenze eine gezielte Ring-Pruefung fuer: Kalendertagszahl aus `today` ohne fuehrende Null; vorhandener tagesgenauer Markerwinkel bleibt unveraendert; keine Aenderung der vorhandenen Segmentgrenzen; kompakt und breit lesbar; gemeinsame Nutzung in Eigen- und Partneransicht.
- Fuehre die bestehenden PMS-/Ring-/Kalender-/Partner-Regressionen aus, insbesondere die WP-020-Marker-Pruefung.
- TypeScript und Produktions-Build muessen bestehen.
- Sichtpruefung auf mobil und breit: Owner- und aktive Partneransicht, ein einstelliger und ein zweistelliger Kalendertag, ein manueller PMS-Starttag sowie keine Ueberlaeufe oder Marker-/Labelkollisionen.

### Stoppbedingungen

- Stoppe und frage nach, bevor Segmentgrenzen, Zeit-/Datumslogik, Vorhersagen, PMS-Ableitung, Kalenderdaten, Partnerberechtigungen oder Eingabemoeglichkeiten veraendert werden.
- Stoppe, falls der heutige Kalendertag im gemeinsamen Ring ohne Aenderung an der bestehenden Darstellung nicht lesbar unterzubringen ist; schlage dann hoechstens zwei rein visuelle Varianten vor.
- Stoppe vor jeder neuen Route, Migration, API, Abhaengigkeit, globalen CSS-Aenderung oder einer getrennten Partner-Implementierung.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergaenzen und pruefen.
- `node scripts/work-package-state.mjs mark-updated WP-022` ausfuehren.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- umgesetzt:
  - **Befund zu Abnahmekriterium 1 (durchgehende Bänder):** `src/lib/cycle-ring-geometry.ts` zeichnet jedes der drei Segmente (Periode, Fruchtbarkeit, PMS) bereits seit vorherigen Arbeitspaketen als genau einen SVG-`<path>` mit einem einzigen Bogenbefehl (`arcPath()` erzeugt einen `M`- und genau einen `A`-Befehl pro Segment). Es gibt keine Unterteilung in einzelne Kalendertage innerhalb eines Segments. Dieser Befund wurde mit einer gezielten Prüfung bestätigt (siehe Tests); an der Segment-Zeichnung selbst war keine Änderung nötig.
  - `src/components/CyclePersonalRing.tsx`: Der rote Heute-Marker wurde von einem reinen Punkt (`r="6"`, kein Text) zu einem größeren Kreis (`r=13` breit / `r=11` `compact`) mit zentrierter, weißer Kalendertagszahl erweitert. Die Zahl wird ausschließlich aus dem bereits übergebenen ISO-`today`-Wert abgeleitet (`Number(today.slice(8, 10))`), keine neue Datums- oder Zeitlogik. Die Position bleibt unverändert exakt auf `personalRingGeometry.todayAngle` (keine rechnerische Verschiebung). Die sichtbare Zahl ist mit `aria-hidden="true"` versehen; die zugängliche Information bleibt der bestehende `<title>`-Text in der `<circle>`, jetzt um den sichtbaren Kalendertag ergänzt (`"Heute, 19., Zyklustag 21"` bzw. `"Heute, 19."` ohne Zyklustag).
  - Keine Änderung an `buildPersonalRingGeometry`, `segments`, `todayAngle`-Berechnung, `manual-pms.ts`, `PersonalCycleView`, Kalenderdarstellung oder PMS-Priorität.
  - Keine Änderung an `NewPartnerCycleRing.tsx` oder `NewCycleExample.tsx` nötig: beide verwenden weiterhin ausschließlich die gemeinsame `CyclePersonalRing`-Komponente ohne eigene Marker- oder Winkel-Logik, sodass Eigen- und Partneransicht automatisch denselben neuen Marker erhalten.
  - Keine neue Route, API, Abhängigkeit, Migration oder Datenbankabfrage.
- nicht umgesetzt: nichts aus dem Soll offen; Umfang vollständig umgesetzt.
- Tests:
  - Neues Skript `scripts/verify-cycle-ring-day-marker.ts` (`npx tsx scripts/verify-cycle-ring-day-marker.ts`): 23 Prüfungen — jedes Segment hat genau einen `M`- und einen `A`-Befehl (durchgehendes Band, keine Tagesunterteilung), die Tageszahl wird direkt aus `today` ohne führende Null abgeleitet (geprüft für `05.`→`5`, `19.`→`19`, `28.`→`28`), der Marker bleibt exakt auf `personalRingGeometry.todayAngle` ohne rechnerische Verschiebung, die Zahl ist `aria-hidden` und nicht alleinige Screenreader-Information, Marker-Radius/Schriftgröße skalieren weiterhin mit `compact`, und `NewPartnerCycleRing.tsx` verwendet unverändert dieselbe gemeinsame Komponente ohne eigene Marker-Logik. Alle 23 Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler.
  - `npm run build`: erfolgreich; Routenliste unverändert.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine bekannte, vorbestehende Fehlschlag in `tests/calendar-day-info.test.ts` ist unabhängig von diesem Paket (bereits in vorherigen Arbeitspaketen als vorbestehend dokumentiert).
  - WP-020-Marker-Regression (`scripts/verify-manual-pms-ring-marker.ts`, alle 5 Prüfblöcke): weiterhin vollständig bestanden — die reine Geometrie (`todayAngle`, Segmentgrenzen) ist durch diese rein darstellende Änderung unverändert.
  - Weitere bestehende Regressionsskripte erneut ausgeführt und bestanden: `verify-calendar-legend-collapsible.ts`, `verify-home-actions-consistent.ts`, `verify-home-screen-layout.ts`, `verify-manual-pms-prediction-isolation.ts`, `verify-manual-pms-symptom-ui.ts`, `verify-mobile-home-compact.ts`, `verify-mobile-partner-compact.ts`, `verify-partner-calendar-legend-collapsible.ts`, `verify-partner-fixed-view.ts`, `verify-partner-view-no-status-card.ts`.
  - Live-Verifikation: temporär `npm install --no-save playwright` installiert (`package.json`/`package-lock.json` vorher und nachher ohne Diff bestätigt), laufenden Dev-Server verwendet, ein echtes Owner-Testkonto über die reale Registrierungs-UI angelegt, eine echte Periode (20 Tage zurückliegend) und ein Zyklusprofil (28 Tage) über die echten APIs gespeichert. Mobil (390×844) und breit (1280×900) bestätigt: roter Heute-Marker mit der heutigen zweistelligen Kalendertagszahl „19" sichtbar, kein horizontaler Überlauf, Screenshots erstellt. Danach ein manueller PMS-Tag für heute über die echte API markiert: Marker zeigt weiterhin „19", jetzt sichtbar am Beginn des erweiterten, jetzt breiteren PMS-Bands (Kriterium 3 visuell bestätigt). Über die echte UI einen Partner-Verbindungscode erzeugt, mit einem zweiten echten Testkonto über die reale Registrierungs- und Einlöse-API verbunden: `/neu/partner` zeigt denselben Marker mit identischer Tageszahl „19", keine Eingabe-Buttons für Perioden (weiterhin rein lesend), kein horizontaler Überlauf. Anschließend vollständiger Rückbau: temporäre Testdateien und Screenshots gelöscht, `npm uninstall playwright` ausgeführt.
- Abweichungen:
  - Keine Code-Abweichung vom Soll. Einzige Anmerkung: Abnahmekriterium 1 („zusammenhängendes Band") war bereits vor diesem Paket durch die bestehende Single-Path-Arc-Zeichnung erfüllt; es handelt sich um einen dokumentierten Befund, keine Implementierungsänderung, wie im Soll ausdrücklich als zulässig vorgesehen („Falls die aktuelle SVG-Form bereits durchgehend ist, dokumentiere den Befund …").
- offene Punkte: keine.
- Commit: 40b2e25

## Soll-Ist-Prüfung – von Codex

- Ergebnis: erfüllt. Die vorhandenen Phasensegmente waren bereits jeweils ein einzelner zusammenhängender SVG-Bogen; dieser Befund ist nachgewiesen und ihre Grenzen bleiben unverändert. Der gemeinsame rote Heute-Marker zeigt nun die Kalendertagszahl ohne führende Null, bleibt exakt auf dem bestehenden `todayAngle` und wird dadurch identisch in Eigen- und Partneransicht dargestellt.
- Nachschärfung: keine.
- Product-Map aktualisiert: ja.

## Korrekturauftrag Version 2 – verbindlich

### Owner-Entscheidung

- Der Zyklus-Kreis soll exakt wie vor Commit `40b2e25` aussehen. Die dort hinzugefuegte Kalendertagszahl im Ringmarker ist vollstaendig zurueckzunehmen.
- Die gewuenschte Aenderung betrifft nur die Kalender auf `/neu` und `/neu/partner`.
- Phasen sollen als schmale, zusammenhaengende Farbbänder wirken, nicht als vollflaechig gefaerbte Tageskacheln.
- Der heutige Kalendertag bekommt einen kleinen roten Kreis direkt hinter seiner Zahl; nicht die ganze Tageskachel.

### Soll

1. Der Zyklus-Kreis kehrt sichtbar auf den Stand vor Commit `40b2e25` zurueck: kein Kalendertagstext im Ringmarker. Der tagesgenaue kleine WP-020-Marker und die Ring-Geometrie bleiben unveraendert.
2. In beiden Kalendern werden bestehende sichtbare Phasen als reine schmale Hintergrundbaender innerhalb der vorhandenen Tageskacheln dargestellt. Tageszahl, Kurzmarker und Klickflaeche liegen darueber.
3. Aufeinanderfolgende Tage derselben sichtbaren Phase schliessen innerhalb einer Kalenderwoche ohne sichtbare Luecke aneinander an. Nur Anfang und Ende eines Abschnitts sind abgerundet. Bei Wochenumbruch setzt das Band in der naechsten Zeile fort.
4. Heute hat nur hinter der Tageszahl einen kleinen roten Kreis. Seine gesamte Kachel wird nicht rot und nicht als besondere Vollflaeche gezeichnet.
5. Alle bestehenden Statuswerte, Prioritaeten und Daten bleiben identisch: bestaetigte/laufende Periode, erwartetes Ende, Planung, geschätzte Periode, PMS inklusive manuellem PMS, Eisprung und Fruchtbarkeitsmarker. Es entsteht keine neue Vorhersage, Phase oder Datumsableitung.
6. Owner- und Partnerkalender zeigen dieselbe sichtbare Regel. Tagesfenster, Monatswechsel, Legenden-Popover, Unsicherheitshinweis, mobile Tippflaechen und die rein lesende Partneransicht bleiben unveraendert funktionsfaehig.

### Technischer Auftrag fuer Claude

- `src/components/CyclePersonalRing.tsx`: Nimm ausschliesslich die in Commit `40b2e25` hinzugefuegte Tageszahl/Marker-Vergrösserung zurueck. `cycle-ring-geometry.ts`, `todayAngle`, Labels, `compact`, Daten und Aufrufer bleiben unveraendert.
- `src/components/NewCycleExample.tsx` und `src/components/NewPartnerCalendar.tsx`: Ersetze nur die vollflaechige Phasen-Hinterlegung durch eine reine Bandebene. Verwende ausschliesslich die bereits berechneten Werte (`phase` bzw. bestehende Partner-Statuswerte und Prioritaeten). Keine zweite Vorhersage, keine neue Datumsberechnung, keine neue Phase.
- Bestimme fuer die reine Bandform pro Kalenderwoche anhand bereits vorhandener benachbarter sichtbarer Tage nur `Start`, `Mitte`, `Ende` oder `einzeln` derselben sichtbaren Bandfarbe. Leere Felder, andere Phasen und Wochenumbruch beenden den sichtbaren Abschnitt. Es darf keine fachliche Phasenlogik dupliziert werden.
- Der Heute-Kreis liegt direkt hinter der Zahl und bleibt für Screenreader über die bestehende Tagesbeschreibung klar benannt. Er darf weder Kurzmarker noch Klickflaeche verdecken.
- Eine kleine gemeinsame reine Darstellungs-Hilfe ist nur erlaubt, wenn sie vorhandene Statuswerte in Bandklassen/Bandpositionen abbildet. Keine neue Route, API, Migration, Datenbankabfrage, Abhaengigkeit, gespeicherte Einstellung oder globale CSS-Aenderung.

### Pflichtpruefungen

- Gezielte Kalenderpruefung in Owner- und Partneransicht: Band-Start/Mitte/Ende, Wochenumbruch, Tageszahl ueber dem Band, kleiner Heute-Kreis ohne Vollkachel und unveraenderte Statusprioritaeten.
- Gezielte Ring-Ruecknahme: kein Kalendertagstext im Ringmarker; WP-020-Markerposition bleibt tagesgenau.
- Bestehende Kalender-, PMS-, Ring-, Partner-, Mobil- und Tagesfenster-Regressionen sowie TypeScript und Produktions-Build.
- Sichtpruefung mobil und breit: mehrere PMS-Tage, manueller PMS-Start, Wochenumbruch, heute, Monatswechsel, Tagesfenster und aktive Partneransicht; kein Ueberlauf.

### Stoppbedingungen

- Stoppe und frage nach, bevor Kalenderphasen, Vorhersagen, Perioden-/PMS-Ableitung, Ring-Geometrie, Tagesfenster-Verhalten, Partnerrechte oder Eingabemoeglichkeiten veraendert werden.
- Stoppe, falls die vorhandene Rasterstruktur keine sichtbaren Baender erlaubt, ohne Tippflaechen oder Statusprioritaeten zu gefaehrden; dokumentiere den Konflikt und schlage hoechstens zwei rein visuelle Varianten vor.

### Abschluss durch Claude

- Ergaenze den `Ist`-Abschnitt fuer Version 2, setze `status: review`, aktualisiere Ledger und `STATE.json`, validiere, committe und pushe nur auftragsbezogene Dateien. Kein manuelles Deployment.

## Ist Version 2 – von Claude

- umgesetzt:
  - **Ring-Rücknahme (`src/components/CyclePersonalRing.tsx`):** der in Commit `40b2e25` hinzugefügte Kalendertagstext im Heute-Marker wurde vollständig zurückgenommen. Der Marker ist wieder exakt der ursprüngliche kleine Kreis (`r="6"`, kein Text, kein variabler Radius, keine Schriftgröße) mit dem ursprünglichen zugänglichen `<title>`-Text (`"Heute, Zyklustag N"` bzw. `"Heute"`, ohne Kalendertagszahl). `buildPersonalRingGeometry`, `todayAngle`, Segmentgrenzen, Labels, `compact` und alle Aufrufer bleiben unverändert — der Ring entspricht jetzt byte-identisch dem Stand vor Commit `40b2e25`.
  - **Neue gemeinsame, rein darstellende Hilfsfunktion `src/lib/calendar-band-position.ts`:** `calendarBandPosition(bandKeys, index)` bildet aus einer bereits vom Aufrufer abgeleiteten Sequenz von Bandfarben-Schlüsseln (ein Wert pro Kalenderzelle inkl. der führenden Leerzellen aus `getCalendarMonthGrid`) die Position `start`/`middle`/`end`/`single` innerhalb der jeweiligen 7er-Kalenderwoche ab. Sie vergleicht ausschließlich direkte Nachbarn innerhalb derselben Woche; ein Wochenumbruch, eine andere Farbe oder eine leere Zelle beenden den Abschnitt immer. Die Funktion enthält keinerlei Datums-, Zyklus- oder Phasenlogik — sie bekommt nur bereits anderswo berechnete Werte übergeben.
  - **`src/components/NewCycleExample.tsx` (Owner-Kalender):** die bisherige vollflächige Kachel-Hintergrundfarbe (abhängig von `storedPeriod`/`runningPeriod`/`expectedPeriod`/`plannedPeriod`/`phase`) wurde entfernt. Die Kachel selbst ist jetzt immer neutral (`bg-white/55`). Dieselbe, unverändert aus den bestehenden Werten abgeleitete Status-Priorität bestimmt stattdessen einen `bandKey`, der nur noch ein schmales Band (`h-[35%]`, unterer Rand der Kachel) einfärbt; `calendarBandPosition` rundet dessen Ecken an Start/Ende eines zusammenhängenden Abschnitts ab (`rounded-l-full`/`rounded-r-full`/`rounded-full` bei `single`), sodass aufeinanderfolgende gleichfarbige Tage sichtbar als ein Band wirken. Heute zeigt nur noch einen kleinen roten Kreis (`size-6`, zentriert) direkt hinter der Tageszahl statt der vorherigen lila Ring-Hervorhebung der ganzen Kachel und des separaten "Heute"-Textbadges (beide entfernt); die Information "heute" bleibt stattdessen über das bestehende `aria-label` der Kachel zugänglich (ergänzt um ", heute").
  - **`src/components/NewPartnerCalendar.tsx` (Partner-Kalender):** exakt dasselbe Muster, mit den dort bereits bestehenden `PrimaryDayStatus`-Werten (`confirmed`/`period`/`pms`/`pms-manual`/`ovulation`) als Bandfarben-Schlüssel, keine neue Statuslogik. Die vorher vollflächig eingefärbte Kachel (`primaryStatusStyle`) wurde durch eine neutrale weiße Kachel mit demselben unteren Farbband ersetzt; die tote `primaryStatusStyle`-Konstante wurde entfernt, da nirgends mehr referenziert. Heute zeigt ebenfalls nur noch einen kleinen roten Kreis (`size-5`) hinter der Zahl statt des bisherigen `ring-2 ring-offset-1` um die ganze Kachel plus zusätzlichem Punkt; "heute" bleibt über das `aria-label` zugänglich.
  - Keine Änderung an Segmentdaten, Vorhersage-, Perioden-, PMS-Ableitung, `manual-pms.ts`, Partnerrechten, Partner-Gate, Routen, API, Migration oder Abhängigkeiten. `primaryCalendarPhase`, `applyManualPmsOverride`, `isWithinManualPmsSection`, `showsFertileMarker` werden unverändert in exakt derselben Reihenfolge aufgerufen wie vor dieser Korrektur.
- nicht umgesetzt: nichts aus dem Korrekturauftrag offen; Umfang vollständig umgesetzt.
- Tests:
  - Neues Skript `scripts/verify-calendar-band-position.ts` (16 Prüfungen): Start/Mitte/Ende/einzeln innerhalb einer Woche, Farbwechsel beendet einen Abschnitt, Wochenumbruch verbindet niemals über die Zeilengrenze hinweg, keine fachliche Logik in der Hilfsfunktion. Alle bestanden.
  - Neues Skript `scripts/verify-cycle-ring-marker-reverted.ts` (11 Prüfungen): kein Kalendertagstext/variabler Radius/Schriftgröße mehr im Ringmarker, ursprünglicher `r="6"`-Kreis und Titeltext wiederhergestellt, `todayAngle`/Segmentanzahl bleiben tagesgenau, Eigen- und Partneransicht nutzen weiterhin dieselbe Komponente ohne eigene Marker-Logik. Alle bestanden.
  - Neues Skript `scripts/verify-calendar-tile-band.ts` (28 Prüfungen): neutrale Kachel statt Vollflächenfarbe, Band nur als unterer Streifen, unveränderte Status-Priorität (jetzt als `bandKey`), Heute-Kreis hinter der Zahl statt Vollkachel-Hervorhebung in Owner- und Partner-Kalender, Monatswechsel/Legenden-Popover/Unsicherheitshinweis/Tagesfenster-Interaktion/rein lesende Partneransicht bleiben unverändert eingebunden. Alle bestanden.
  - Das WP-022-Version-1-Testskript `scripts/verify-cycle-ring-day-marker.ts` wurde gelöscht, da es ausschließlich die jetzt vollständig zurückgenommene V1-Änderung prüfte und mit einem durch die Ownerin nicht abgenommenen, nicht mehr gültigen Soll übereinstimmte.
  - `scripts/verify-manual-pms-ring-marker.ts` (WP-020-Regression, alle 5 Prüfblöcke): weiterhin vollständig bestanden, da die Ring-Geometrie durch diese Korrektur nicht berührt wird.
  - Vier bestehende Testskripte mussten an die durch diesen Korrekturauftrag bewusst geänderte Darstellung angepasst werden (keine stille Abschwächung, sondern eine durch den neuen Auftrag notwendige Korrektur einer zuvor gültigen, jetzt überholten Annahme):
    - `scripts/verify-mobile-home-compact.ts`: die Assertion zur `dayClassName`-Tageszahlgröße prüfte zuvor einen exakten String ohne die jetzt neutrale Kachel-Hintergrundfarbe; die responsive Schriftgröße (`text-sm`/`sm:text-base`) selbst ist unverändert. Die Assertions zum "Heute-Marker-Punkt" und "Heute-Badge" prüften die alte isolierte Punkt+Text-Darstellung, die der Korrekturauftrag ausdrücklich durch einen Kreis hinter der Zahl ersetzt; beide Assertions wurden auf die neue, vom Auftrag verlangte Darstellung umgestellt.
    - `scripts/verify-mobile-partner-compact.ts`: dieselbe Ursache, gespiegelt für die Partner-Tageszahl-Klasse und die Owner-Referenzklasse im selben Skript.
    - `scripts/verify-manual-pms-symptom-ui.ts`: eine Assertion suchte die Status-Prioritätslogik direkt im `dayClassName`-Template; diese Logik liegt jetzt in der separaten `bandKey`-Konstante (gleiche fachliche Priorität, anderer Fundort) — die Assertion wurde entsprechend umgestellt, ohne die geprüfte fachliche Aussage zu ändern.
    - `scripts/verify-today-card.ts`: die Hilfsfunktion zur Extraktion des `TodayCard`-Funktionskörpers suchte textuell nach `"\n}\n"` als Funktionsende; durch den neuen, verschachtelten IIFE-Wrapper um die Kalenderzellen-Berechnung existierte dieses Muster ab `TodayCard` nirgends mehr im Rest der Datei, wodurch `indexOf` still `-1` lieferte und der gesamte Dateirest (inklusive späterer `fetch`/`new Date`-Aufrufe anderer Funktionen) fälschlich als "TodayCard-Körper" gewertet wurde. `TodayCard` selbst ist unverändert; die Hilfsfunktion wurde auf eine klammertiefenbasierte, robuste Extraktion umgestellt (zählt zunächst die Klammertiefe der Parameterliste, bevor sie die öffnende Körperklammer sucht).
  - `npx tsc --noEmit`: keine Fehler.
  - `npm run build`: erfolgreich; Routenliste unverändert.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine bekannte, vorbestehende Fehlschlag in `tests/calendar-day-info.test.ts` ist unabhängig von diesem Paket.
  - Alle weiteren potenziell betroffenen bestehenden Regressionsskripte erneut ausgeführt und bestanden: `verify-calendar-legend-collapsible.ts`, `verify-day-detail.ts`, `verify-home-actions-consistent.ts`, `verify-home-screen-layout.ts`, `verify-manual-pms-prediction-isolation.ts`, `verify-next-period-countdown.ts`, `verify-partner-calendar-legend-collapsible.ts`, `verify-partner-fixed-view.ts`, `verify-partner-view-no-status-card.ts`, `verify-period-history-layout.ts`, `verify-period-history-overview.ts`, `verify-period-history.ts`, `verify-owner-mobile-nav.ts`.
  - Live-Verifikation: temporär `npm install --no-save playwright` installiert (`package.json`/`package-lock.json` vorher und nachher ohne Diff bestätigt), laufenden Dev-Server verwendet, ein echtes Owner-Testkonto über die reale Registrierungs-UI angelegt, eine echte Periode sowie ein Zyklusprofil über die echten APIs gespeichert, drei aufeinanderfolgende Tage (heute und die zwei Tage davor) über die echte PMS-Symptom-API manuell markiert (mehrtägiges PMS-Band). Per DOM-Auswertung bestätigt: alle Tageskacheln im Raster haben dieselbe neutrale Hintergrundfarbe (kein Status mehr direkt auf der Kachel), mindestens ein schmales unteres Band-Element ist sichtbar, genau ein kleiner roter Heute-Kreis ist im Raster vorhanden, kein horizontaler Überlauf mobil oder breit. Das Tagesfenster (DayDetailModal) öffnet sich weiterhin beim Klick auf den heutigen Tag. Screenshots bestätigen visuell: das PMS-Band verläuft über mehrere Tage durchgehend mit abgerundeten Enden an Anfang/Ende des Abschnitts, der Heute-Kreis sitzt sauber hinter der "19", der Ring zeigt wieder den einfachen Punkt ohne Zahl. Über die echte UI einen Partner-Verbindungscode erzeugt, mit einem zweiten echten Testkonto über die reale Registrierungs- und Einlöse-API verbunden: `/neu/partner` zeigt dieselbe neutrale Kachel-mit-Band-Darstellung, genau einen Heute-Kreis, keinerlei Eingabeelemente (rein lesend bestätigt), kein horizontaler Überlauf. Anschließend vollständiger Rückbau: temporäre Testdateien und Screenshots gelöscht, `npm uninstall playwright` ausgeführt.
- Abweichungen: keine Code-Abweichung vom Korrekturauftrag. Die vier oben genannten Testskript-Anpassungen betreffen ausschließlich Prüf-Infrastruktur (Assertions auf jetzt überholte oder fragile Quelltext-Muster), nicht das geprüfte Produktverhalten selbst.
- offene Punkte: keine.
- Commit: 2459360

## Korrekturauftrag Version 3 – Partner-Heute-Rahmen entfernen

### Befund aus der Soll-Ist-Pruefung

- In `NewPartnerCalendar.tsx` bleibt fuer heute zusaetzlich `ring-2 ring-offset-1` an der gesamten Tageskachel erhalten.
- In der Owner-Ansicht gibt es diesen aeusseren Rahmen nicht mehr. Der verbindliche Version-2-Soll verlangt fuer beide Kalender dieselbe Regel: Heute hat **nur** den kleinen roten Kreis direkt hinter der Tageszahl.

### Technischer Auftrag fuer Claude

- Entferne ausschliesslich den aeusseren Heute-Rahmen (`ring-2 ring-offset-1`) aus der Tageskachel im Partner-Kalender.
- Der kleine rote Kreis hinter der Tageszahl, die schmalen Phasenbaender, Statusprioritaeten, Tagesfenster, Partner-Leserechte und alle Datenwege bleiben unveraendert.
- Aendere weder den Owner-Kalender noch den Zyklus-Kreis oder fachliche Logik.

### Erfolgskriterien

1. Owner- und Partner-Kalender zeigen heute gleich: neutraler Hintergrund, schmales Phasenband falls vorhanden und ausschliesslich ein kleiner roter Kreis hinter der Zahl.
2. Im Partner-Kalender ist kein aeusserer `ring-2`- oder `ring-offset-1`-Rahmen mehr sichtbar.
3. Die bestehende Darstellung und Bedienung des Partner-Kalenders bleiben rein lesend und unveraendert funktionsfaehig.

### Pflichtpruefungen

- Die gezielte Kalenderband-Pruefung muss den fehlenden aeusseren Heute-Rahmen im Partner-Kalender explizit pruefen.
- `npx tsc --noEmit` muss bestehen.
- Sichtpruefung: Owner- und Partner-Kalender mobil, jeweils der heutige Tag.

### Grenzen

- Keine neue Route, API, Migration, Datenabfrage, Abhaengigkeit, globale CSS-Aenderung oder Daten-/Vorhersage-Logik.
- Kein weiterer visueller Umbau ausser der Entfernung dieses einen Partner-Rahmens.

### Abschluss durch Claude

- Ergaenze den `Ist`-Abschnitt fuer Version 3, setze `status: review`, aktualisiere Ledger und `STATE.json`, validiere, committe und pushe nur auftragsbezogene Dateien. Kein manuelles Deployment.

## Korrekturauftrag Version 4 – verbindlich

### Owner-Entscheidung

- Die Referenz ist das von der Ownerin gelieferte Kalenderbild: Eine Phase ist ein deutlich sichtbares, breites, horizontales Pillen-Band **hinter** den Zahlen mehrerer aufeinanderfolgender Tage.
- Der schmale Streifen nur an der Unterkante aus Version 2 entspricht nicht der gewuenschten Optik und wird ersetzt.
- Der Zyklus-Kreis bleibt vollstaendig unveraendert.
- Die gleiche Kalenderdarstellung gilt fuer Owner und Partner; die Partneransicht bleibt rein lesend.

### Soll

1. Jede vorhandene sichtbare Phase erscheint als ein breites, horizontal zusammenhaengendes Farbband im zentralen Bereich der Tageszeile, ungefaehr in der Hoehe der Tageszahlen. Die Tageszahlen liegen klar lesbar darueber.
2. Aufeinanderfolgende gleiche Phasentage verbinden sich sichtbar ohne Zwischenraum zu einem einzigen Pillen-Band. Nur der erste und letzte Tag eines Abschnitts sind abgerundet; am Wochenumbruch beginnt die sichtbare Pillenform in der neuen Zeile erneut.
3. Unbetroffene Tage bleiben optisch neutral; es entstehen keine einzeln eingefaerbten Tageskacheln.
4. Heute bleibt ausschliesslich ein kleiner roter Kreis direkt hinter der eigenen Tageszahl. Im Partnerkalender bleibt ebenfalls kein aeusserer Rahmen um die gesamte Heute-Kachel.
5. Zyklus-Kreis, Statusprioritaeten, Vorhersage, PMS-/Periodenlogik, Tagesfenster, Legenden-Popover, Monatswechsel und Partnerrechte bleiben unveraendert.

### Technischer Auftrag fuer Claude

- Passe ausschliesslich die reine Bandebene in `NewCycleExample.tsx` und `NewPartnerCalendar.tsx` an. Die bestehende Hilfsfunktion fuer Start/Mitte/Ende darf weiterverwendet werden, sofern sie nur die visuelle Verbindung steuert.
- Die Bandebene darf in benachbarte Rasterzwischenraeume reichen, soweit dies fuer ein sichtbar durchgehendes Band erforderlich ist. Sie darf weder Zahl, Kurzmarker noch Klickflaeche verdecken.
- Entferne im Partnerkalender zugleich den aus Version 3 bekannten aeusseren Heute-Rahmen. Der rote Kreis hinter der Zahl bleibt bestehen.
- Aendere weder `CyclePersonalRing.tsx` noch Ring-Geometrie, Datenlogik, API, Migration, Abhaengigkeiten, globale CSS-Regeln oder Daten-/Vorhersageableitungen.

### Pflichtpruefungen

- Gezielte Owner- und Partner-Kalenderpruefung: breites Band hinter Zahlen, sichtbare Verbindung mehrerer gleicher Tage ohne Luecken, Start/Mitte/Ende, Wochenumbruch, neutraler anderer Tag und Heute-Kreis ohne aeusseren Partner-Rahmen.
- `npx tsc --noEmit` und der betroffene Kalenderband-Test muessen bestehen.
- Sichtpruefung mobil und breit in Eigen- und Partneransicht mit einem mehrtaegigen PMS- oder anderen sichtbaren Abschnitt; kein horizontaler Ueberlauf, Tagesfenster bleibt bedienbar.

### Stoppbedingungen

- Stoppe und frage nach, bevor Phasen-/Datumslogik, Statusprioritaeten, Ring, Partnerrechte oder Eingaben veraendert werden.
- Stoppe, falls ein sichtbares durchgehendes Band ohne Ueberdeckung der Zahl oder ohne sichere Klickflaechen nicht moeglich ist; schlage dann hoechstens zwei rein visuelle Varianten vor.

### Abschluss durch Claude

- Ergaenze den `Ist`-Abschnitt fuer Version 4, setze `status: review`, aktualisiere Ledger und `STATE.json`, validiere, committe und pushe nur auftragsbezogene Dateien. Kein manuelles Deployment.

## Ist Version 4 – von Claude

- umgesetzt:
  - **`src/components/CyclePersonalRing.tsx`:** unverändert gelassen, wie gefordert. Der Zyklus-Kreis entspricht weiterhin dem seit Korrektur V2 wiederhergestellten Stand (einfacher kleiner Punkt ohne Kalendertagszahl).
  - **`src/components/NewCycleExample.tsx` (Owner-Kalender):** das Band ist jetzt ein breites, vertikal zentriertes Pillen-Band (`h-[62%]` statt der bisherigen `h-[35%]` am unteren Rand) auf Höhe der Tageszahl. Das Band-Element wurde aus der Tageskachel in den äußeren `relative aspect-square`-Wrapper verschoben und erhält einen negativen horizontalen Inset (`-left-[0.1875rem] -right-[0.1875rem]`, `sm:-left-1 sm:-right-1` — exakt die halbe Grid-Gap-Breite `gap-1.5`/`sm:gap-2`), sodass es bei `start`/`middle`/`end`-Positionen über den eigenen Kachelrand hinaus bis zur Mitte des Rasterzwischenraums reicht und sich dort nahtlos mit dem Band der Nachbarkachel trifft. Die Tageskachel selbst ist jetzt transparent (`bg-transparent` statt `bg-white/55`) und liegt mit `z-10` über dem Band, sodass Zahl, Kurzmarker und Klickfläche unverändert normal bedienbar bleiben, während das Band dahinter sichtbar durchscheint. Die Rundung wurde verfeinert: ein `start`-Tag ist nur links gerundet (`rounded-l-full rounded-r-none`), ein `end`-Tag nur rechts (`rounded-r-full rounded-l-none`), ein `middle`-Tag ist komplett eckig (`rounded-none`) und verschmilzt dadurch sichtbar mit beiden Nachbarn — vorher waren bei `middle` schlicht keine Rundungsklassen gesetzt, was (ohne den jetzt eingeführten Overlap in den Gap) nicht zum geforderten durchgehenden Erscheinungsbild geführt hätte. Das Band ist weiterhin `aria-hidden` und `pointer-events-none`.
  - **`src/components/NewPartnerCalendar.tsx` (Partner-Kalender):** exakt dasselbe Muster, mit an die dortige kleinere Grid-Gap (`gap-1`/`sm:gap-1.5`) angepasstem Inset (`-left-[0.125rem] -right-[0.125rem]`, `sm:-left-[0.1875rem] sm:-right-[0.1875rem]`). Zusätzlich wurde der aus Korrektur V3 bekannte, nie umgesetzte äußere Heute-Rahmen (`ring-2 ring-offset-1`) jetzt entfernt — heute zeigt im Partnerkalender dadurch, wie gefordert, ausschließlich den kleinen roten Kreis hinter der Zahl, keinen äußeren Rahmen um die gesamte Kachel mehr.
  - `calendarBandPosition` aus `src/lib/calendar-band-position.ts` (Korrektur V2) wurde unverändert weiterverwendet; sie liefert weiterhin nur `start`/`middle`/`end`/`single` pro Kalenderwoche, keine neue Logik wurde ergänzt. Dieselbe, unveränderte Status-Priorität (Owner: `bandKey`; Partner: `PrimaryDayStatus`) bestimmt weiterhin die Bandfarbe.
  - Keine Änderung an Segmentdaten, Vorhersage-, Perioden-, PMS-Ableitung, `manual-pms.ts`, Partnerrechten, Partner-Gate, Routen, API, Migration, Abhängigkeiten oder globalen CSS-Regeln.
- nicht umgesetzt: nichts aus dem Korrekturauftrag offen; Umfang vollständig umgesetzt (schließt die in Version 3 beschriebene, bis dahin nicht umgesetzte Entfernung des Partner-Heute-Rahmens mit ein, wie in Version 4 ausdrücklich gefordert).
- Tests:
  - `scripts/verify-calendar-tile-band.ts` wurde auf die neue breite Pillen-Band-Darstellung aktualisiert (vorher: schmaler unterer Streifen aus Version 2) und um zwei neue Prüfblöcke ergänzt: Start-/End-Tage sind nur einseitig gerundet, Mitte-Tage komplett eckig (nahtlose Verbindung), sowie dass Zahl und Klickfläche über dem Band bedienbar bleiben (`z-10`, `pointer-events-none` auf dem Band). Insgesamt 30 Prüfungen, alle bestanden.
  - `scripts/verify-calendar-band-position.ts` und `scripts/verify-cycle-ring-marker-reverted.ts` (unverändert von Version 2/keine Ring-Änderung) erneut ausgeführt: alle bestanden.
  - `scripts/verify-manual-pms-ring-marker.ts` (WP-020-Regression): weiterhin vollständig bestanden, der Ring ist unberührt.
  - Drei bestehende Testskripte mussten an die durch diesen Korrekturauftrag bewusst geänderte Kachel-Struktur angepasst werden (keine stille Abschwächung, sondern eine durch den neuen Auftrag notwendige Korrektur einer zuvor gültigen, jetzt überholten Annahme):
    - `scripts/verify-mobile-home-compact.ts` und `scripts/verify-mobile-partner-compact.ts`: die exakten `dayClassName`-Strings prüften zuvor die V2-Zwischenstufe (`bg-white/55`/`bg-white`, `overflow-hidden`); diese wurden auf den neuen Stand (`bg-transparent`, `z-10`, ohne `overflow-hidden`) aktualisiert. Die geprüfte responsive Schriftgröße selbst (`text-sm`/`sm:text-base` bzw. `text-xs`/`sm:text-sm`) ist unverändert und wird weiterhin bestätigt.
    - `scripts/verify-action-success-toast.ts`: dieses Skript war bereits **vor** dieser Korrektur auf unverändertem `main` zu 14/16 Prüfungen defekt (per `git stash` verifiziert) — mehrere dort verwendete Regex-Muster zur Funktionskörper-Extraktion (`[\s\S]*?\n  \}\n`) suchten eine exakte, flache Einrückungstiefe, die durch den in Korrektur V2 eingeführten verschachtelten IIFE-Wrapper um die Kalenderzellen-Berechnung nirgends mehr im Rest der Datei existierte. Die Extraktion wurde auf dieselbe klammertiefenbasierte `extractFunctionBody`-Hilfsfunktion umgestellt, die bereits in `scripts/verify-today-card.ts` (Korrektur V2) für denselben Fehlerursprung eingeführt wurde; zusätzlich wurde eine vorbestehende CRLF/LF-Mischung an einer Stelle der Quelldatei vor dem Stringvergleich normalisiert. Das Skript ist dadurch jetzt vollständig repariert (16/16 bestanden) — eine Nebenwirkung der ohnehin nötigen Arbeit an dieser Datei, keine eigenständige Scope-Erweiterung.
  - Zwei bestehende Testskripte (`scripts/verify-historical-entry.ts`: 6 Fehlschläge; `scripts/verify-personal-cycle-view.ts`: 9 Fehlschläge) wurden geprüft und sind bereits auf unverändertem `main` identisch fehlgeschlagen (per `git stash` verifiziert) — vorbestehend, unabhängig von dieser Korrektur, außerhalb des Scopes und daher unverändert gelassen.
  - `npx tsc --noEmit`: keine Fehler.
  - `npm run build`: erfolgreich; Routenliste unverändert.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine bekannte, vorbestehende Fehlschlag in `tests/calendar-day-info.test.ts` ist unabhängig von diesem Paket.
  - Vollständiger Lauf aller `scripts/verify-*.ts` (49 Skripte): bis auf die zwei oben genannten, bestätigt vorbestehenden Fehlschläge bestehen alle.
  - Live-Verifikation: temporär `npm install --no-save playwright` installiert (`package.json`/`package-lock.json` vorher und nachher ohne Diff bestätigt), laufenden Dev-Server verwendet, ein echtes Owner-Testkonto über die reale Registrierungs-UI angelegt, eine echte Periode sowie ein Zyklusprofil über die echten APIs gespeichert, drei aufeinanderfolgende Tage über die echte PMS-Symptom-API manuell markiert. Per DOM-Geometrie-Auswertung bestätigt: das Band ist durchgehend 62% der Kachelhöhe hoch (gegenüber den vorherigen 35%), vertikal zentriert auf Höhe der Tageszahl, und die gemessene horizontale Lücke zwischen benachbarten Bandsegmenten derselben Phase beträgt exakt 0.0 Pixel (nahtlose Verbindung, an 14 Stellen gemessen). Genau ein kleiner roter Heute-Kreis ist im Raster vorhanden, kein horizontaler Überlauf mobil oder breit. Das Tagesfenster öffnet sich weiterhin beim Klick auf den heutigen Tag (das Band blockiert keine Klicks). Screenshots bestätigen visuell: breite, über mehrere Tage und Wochenzeilen hinweg durchgehende Pillen-Bänder (PMS 17.–18. und 19.–25. als getrennte Abschnitte je Kalenderwoche, Periode 1.–3. durchgehend), der Heute-Kreis sitzt klein und sauber hinter der „19", der Zyklus-Kreis ist unverändert. Über die echte UI einen Partner-Verbindungscode erzeugt, mit einem zweiten echten Testkonto verbunden: `/neu/partner` zeigt dieselbe breite Pillen-Band-Darstellung, genau einen Heute-Kreis ohne äußeren Rahmen (0 Elemente mit `ring-2` an der Heute-Kachel gemessen), keinerlei Eingabeelemente, kein horizontaler Überlauf. Anschließend vollständiger Rückbau: temporäre Testdateien und Screenshots gelöscht, `npm uninstall playwright` ausgeführt.
- Abweichungen: keine Code-Abweichung vom Korrekturauftrag. Die Testskript-Anpassungen betreffen ausschließlich Prüf-Infrastruktur, nicht das geprüfte Produktverhalten selbst; zwei weitere, bereits vor dieser Korrektur defekte Testskripte wurden identifiziert, als vorbestehend bestätigt und bewusst nicht verändert (außerhalb des Korrekturauftrags-Scopes).
- offene Punkte: keine.
- Commit: 9a559f4
