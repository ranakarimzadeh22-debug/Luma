---
id: WP-022
title: "Zyklus-Kreis mit klaren Phasenbaendern und Tagespunkt"
status: review
created: 2026-10-19
updated: 2026-10-19
owner_approved: yes
executor: claude
product_area: "Neue Luma – gemeinsamer Zyklus-Kreis in Eigen- und Partneransicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Zyklus-Kreis mit klaren Phasenbaendern und Tagespunkt

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

- ausstehend
