---
id: WP-014
title: "Manuellen PMS-Status im Zyklus-Kreis konsistent markieren"
status: review
created: 2026-10-16
updated: 2026-10-16
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home und Partneransicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Manuellen PMS-Status im Zyklus-Kreis konsistent markieren

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Wenn du heute PMS-Symptome selbst einträgst, erscheint der rote Heute-Punkt im Zyklus-Kreis sichtbar im PMS-Bereich.
- **Warum machen wir das?** Der Kalender zeigt den von dir eingetragenen PMS-Beginn bereits richtig, aber der Punkt im Kreis blieb bisher am rechnerischen Zyklustag. Das wirkt widersprüchlich.
- **Woher kam die Idee?** Owner-Feedback vom 2026-10-16 zu WP-013.
- **Wo ist es in der App?** Im Zyklus-Kreis auf `/neu` und beim verbundenen Partner auf `/neu/partner`.
- **Was gehört ausdrücklich nicht dazu?** Keine Änderung von Periodenvorhersage, Zykluslänge, Eisprung, fruchtbarem Zeitfenster, Datenbank oder Partnerrechten.
- **Was kann die Nutzerin danach ausprobieren?** Heute ein PMS-Symptom speichern und prüfen, dass Kalender, Text und roter Punkt im Kreis denselben PMS-Status zeigen.

## Entstehungsweg

`Manueller PMS-Start heute → Kalender und Text zeigen PMS, Punkt im Kreis bleibt rechnerisch → sichtbare Inkonsistenz → PMS-Punkt im Kreis passend darstellen → WP-014`

- Ausgangsidee oder Problem: Ein manuell bestätigter PMS-Start übersteuert bereits die sichtbare Tagesphase, nicht aber die geometrische Position des roten Heute-Punkts im Zyklus-Kreis.
- bestätigte Wirkung: Die Nutzerin und der aktiv verbundene Partner sehen eine widerspruchsfreie PMS-Anzeige.
- gewählte Lösung: Nur bei einem heute gültigen manuellen PMS-Abschnitt wird der rote Heute-Punkt im bestehenden PMS-Segment dargestellt.
- wichtige Entscheidung(en): DEC-131 bis DEC-134 und DEC-135; PMS-Symptome verändern keine fachliche Vorhersage.
- Quellen/Akten: `APP-IDEA-022`, `APP-PROBLEM-008`, `WP-013`.

## Soll – von Codex

- **Problem:** Nach dem Speichern eines heutigen PMS-Symptoms zeigt der Zyklus-Kreis zwar PMS-Text, sein roter Heute-Punkt bleibt aber außerhalb des PMS-Segments am berechneten Zyklustag.
- **gewünschte Wirkung:** Manuell eingetragenes PMS ist auf Kalender, Status-Text und Zyklus-Kreis derselbe sichtbare Zustand.
- **sichtbare Änderung:** Ist heute ein manueller PMS-Abschnitt aktiv, liegt der rote Heute-Punkt im bestehenden PMS-Segment. Die gleiche Anzeige erscheint rein lesend beim aktiv verbundenen Partner.
- **nicht enthalten:** Keine Änderung an Prognose-, Perioden-, Eisprung-, Fruchtbarkeits-, PMS-Berechnungs- oder Unsicherheitslogik; keine neuen Symptome, Texteingaben, Daten, APIs, Migrationen, Freigabeschalter oder Partneraktionen.
- **Abnahmekriterien:**
  1. Ohne heutigen manuellen PMS-Status bleibt die bisherige Position des Heute-Punkts unverändert.
  2. Mit einem heute gespeicherten PMS-Symptom liegt der Heute-Punkt sichtbar im PMS-Segment und der vorhandene Hinweis `Von dir eingetragen` bleibt sichtbar.
  3. Ein echter Periodentag hat weiterhin Vorrang; dort wird kein manueller PMS-Punkt erzwungen.
  4. Die Partneransicht zeigt bei aktiver Verbindung denselben PMS-Punkt rein lesend; ohne aktive Verbindung werden keine PMS-Daten angezeigt.
  5. Die Vorhersage für Periode, Eisprung und Fruchtbarkeit bleibt unverändert.
- **ein Prüfschritt für den Owner:** Auf `/neu` heute ein PMS-Symptom speichern und Kreis sowie Kalender vergleichen; danach `/neu/partner` mit einer aktiven Verbindung öffnen und den Kreis vergleichen.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` leitet den heutigen manuellen PMS-Status bereits mit `isWithinManualPmsSection(...)` ab und übergibt für den Text ein lokales `displayedPersonalCycleView` mit `todayPhase: "pms"` an `CyclePersonalRing`.
- `src/lib/cycle-ring-geometry.ts` berechnet `buildPersonalRingGeometry(...)` mit PMS-Segmenten und einer getrennten, rein rechnerischen `todayAngle`-Position.
- `src/components/CyclePersonalRing.tsx` zeichnet den roten Heute-Punkt ausschließlich anhand von `personalRingGeometry.todayAngle`; deshalb bleibt er bei manuellem PMS am berechneten Zyklustag.
- `src/lib/new-partner-cycle-view.ts` leitet denselben manuellen PMS-Status für den aktiv verbundenen Partner ab; `src/components/NewPartnerCycleRing.tsx` verwendet denselben gemeinsamen `CyclePersonalRing`.
- `src/lib/manual-pms.ts` begrenzt den manuellen PMS-Abschnitt bereits korrekt: echte Periodentage haben Vorrang, eine Prognose wird nicht verändert und der Abschnitt ist nicht unbegrenzt zukünftig.

### Technisches Ziel

- Erweitere ausschließlich die Darstellungsübergabe oder Ringgeometrie so, dass der rote Heute-Punkt bei heute aktivem manuellem PMS sichtbar innerhalb des bereits gezeichneten PMS-Segments liegt.
- Nutze dieselbe wiederverwendbare Darstellung für Eigen- und Partneransicht. Der Partner bleibt vollständig rein lesend.
- Behalte die bisherige rechnerische Punktposition für alle Fälle ohne heute aktives manuelles PMS bei.
- Die genaue Punktposition innerhalb des PMS-Segments ist Claude freigestellt, sofern sie sichtbar im Segment liegt, die Beschriftung nicht verdeckt und keine zweite Zyklusberechnung entsteht.

### Invarianten – müssen unverändert bleiben

- `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, erwartete Periode, Eisprung, fruchtbares Zeitfenster und Unsicherheit bleiben fachlich und technisch unverändert.
- Bestehende echte Periodentage haben immer Vorrang vor manuellem PMS; in diesen Fällen bleibt die bestehende Periodendarstellung maßgeblich.
- `manual-pms.ts` bleibt die einzige Quelle dafür, ob ein manueller PMS-Abschnitt aktuell gilt. Keine zweite, abweichende Symptom- oder Datumslogik einführen.
- Authentifizierung, Sitzungen, Kontotrennung, aktiver Partner-Gate, Partnerrechte und alle Kalenderaktionen bleiben unverändert.
- Keine neue Datenhaltung, keine API-Route, keine Migration und keine medizinische Aussage hinzufügen.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Ergänze gezielte Tests für: manueller PMS-Status heute verschiebt nur die Punktdarstellung ins PMS-Segment; ohne manuellen PMS-Status bleibt die bisherige Position bestehen; echter Periodentag hat Vorrang.
- Prüfe Eigen- und Partneransicht gegen denselben manuell gesetzten PMS-Tag sowie den bestehenden aktiven-Verbindungs-Gate.
- Bestehende PMS-, Ring-, Kalender-, Perioden- und Partner-Regressionen ausführen; TypeScript und Produktions-Build müssen bestehen.
- Mobile und breite Sichtprüfung mit temporären Testdaten: Punkt sichtbar im PMS-Segment, Beschriftung lesbar, kein horizontaler Überlauf; Partneransicht weiterhin ohne Bearbeitungsaktion.

### Stoppbedingungen

- Stoppe und frage nach, bevor die Änderung eine Vorhersage oder ihre Berechnungsdaten verändert, PMS über den bestehenden begrenzten Abschnitt hinaus ausdehnt oder neue Symptomdaten speichert.
- Stoppe vor jeder Migration, API-Änderung, Änderung am Partner-Gate oder einer Partner-Schreibfunktion.
- Wenn ein genannter Startpunkt nicht mehr passt, darf Claude den passenden Ort suchen; Wirkung und Invarianten bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen und prüfen.
- `node scripts/work-package-state.mjs mark-updated WP-014` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – von Claude

- **umgesetzt:**
  - `src/lib/cycle-ring-geometry.ts`: `buildPersonalRingGeometry(view, today, isManualPmsToday = false)` erhält einen neuen, optionalen dritten Parameter. Nur wenn `isManualPmsToday === true`, wird `todayAngle` auf die Mitte des bereits berechneten PMS-Segments gesetzt (`midAngle(pmsStartAngle, pmsEndAngle)` – exakt dieselbe Formel, die auch das „PMS“-Textlabel positioniert), statt auf die rechnerische Zyklustag-Position. Die Segmente selbst (`period`/`fertile`/`pms`), ihre Winkel und jede Datums-/Zyklusberechnung bleiben vollständig unverändert; es wird keine zweite Berechnung eingeführt, nur eine zusätzliche Fallunterscheidung für den bereits vorhandenen `todayAngle`-Wert.
  - `src/components/CyclePersonalRing.tsx`: neue, optionale Prop `isManualPmsToday?: boolean` (Default `false`), wird unverändert an `buildPersonalRingGeometry` durchgereicht. Kein bestehender Aufrufer, der die Prop nicht setzt, ändert sein Verhalten.
  - `src/components/NewCycleExample.tsx`: `<CyclePersonalRing ... isManualPmsToday={isManualPmsToday} />` – nutzt das bereits vorhandene, aus `isWithinManualPmsSection(...)` abgeleitete `isManualPmsToday` (WP-013), keine neue Datumslogik.
  - `src/components/NewPartnerCycleRing.tsx`: neue Prop `isManualPmsToday?: boolean` (Default über `manualPmsSymptoms.length > 0` abgeleitet, keine neue Datenquelle), an `CyclePersonalRing` durchgereicht. `manualPmsSymptoms` wird bereits serverseitig in `getPartnerCycleView`/`src/app/neu/partner/page.tsx` über `manual-pms.ts` ermittelt (WP-013) – `manual-pms.ts` bleibt dadurch die alleinige Quelle dafür, ob heute ein manueller PMS-Abschnitt gilt, sowohl in der Eigen- als auch in der Partneransicht.
  - Da `isWithinManualPmsSection` (und damit `isManualPmsToday`) bereits strukturell `false` liefert, sobald der betrachtete Tag ein echter (laufender oder bestätigter) Periodentag ist (siehe `isRealPeriodDay` in `manual-pms.ts`), kann der übersteuerte Marker nie gleichzeitig mit einem echten Periodentag auftreten – echte Periodentage haben dadurch strukturell Vorrang, nicht nur zufällig.
  - Keine Änderung an `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, Eisprung, fruchtbarem Fenster, Unsicherheitslogik, Datenbank, API-Routen, Authentifizierung oder Partner-Gate.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-manual-pms-ring-marker.ts` (neu): drei gezielte Prüfblöcke genau wie im Auftrag gefordert – (1) ohne heutigen manuellen PMS-Status bleibt der Marker-Winkel identisch zur rein rechnerischen Position, egal ob `isManualPmsToday` explizit `false` oder weggelassen wird; (2) mit einer heutigen Symptommarkierung liegt der Marker-Winkel exakt auf der Mitte des PMS-Segments (`labelAngle`) und unterscheidet sich sichtbar von der unübersteuerten Position; (3) an einem echten, bestätigten Periodentag bleibt `isWithinManualPmsSection` auch mit einer (hypothetischen) Symptommarkierung an diesem Tag `false`, der Marker bleibt an der rechnerischen Periodentag-Position. 13 Prüfungen, alle bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-manual-pms-prediction-isolation.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-partner-pms-symptoms.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-period-day-actions.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-home-actions-consistent.ts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-action-success-toast.ts`.
  - `scripts/verify-home-screen-layout.ts` musste gezielt angepasst werden: zwei Assertions erwarteten wörtlich `<CyclePersonalRing personalCycleView={displayedPersonalCycleView} today={todayKey} />` ohne die neue, bewusste WP-014-Prop. Auf die neue, korrekte Übergabe `<CyclePersonalRing ... isManualPmsToday={isManualPmsToday} />` aktualisiert (keine stille Reparatur eines Fehlers, sondern die erwartete Anpassung an eine bewusste Verhaltensänderung). Danach bestehen alle 20 Prüfungen dieses Skripts weiterhin.
  - `scripts/verify-personal-cycle-view.ts` zeigt weiterhin dieselben, bereits seit WP-004 Version 6 dokumentierten 9 Fehlschläge bei den Farbverlauf-Quelltextprüfungen (Gradient-Fundstelle sucht fälschlich in `NewCycleExample.tsx` statt `CyclePersonalRing.tsx`) – unverändert vorbestehend, nicht durch WP-014 verursacht, hier nicht repariert (außerhalb des Auftragsumfangs).
  - `tests/*.test.ts` (Node-Testrunner): 83/84 bestanden – der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`), nicht durch WP-014 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert.
  - Mobile (375×800) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit echten Testkonten: Vier echte, abgeschlossene Perioden im stabilen 28-Tage-Rhythmus angelegt, sodass eine persönliche Zyklusansicht mit sichtbaren Segmenten entsteht; der heutige Tag lag dabei außerhalb jeder geschätzten Phase. Nach dem Speichern eines heutigen PMS-Symptoms lag der rote Heute-Punkt exakt auf derselben Position wie das „PMS“-Textlabel (gemessene Distanz 0.0 in allen drei geprüften Ansichten: Eigenansicht breit, Eigenansicht mobil, Partneransicht breit) – sichtbar und eindeutig innerhalb des PMS-Segments, die Beschriftung „PMS“ blieb daneben lesbar, der Hinweis „Von dir eingetragen“ bzw. „PMS von ihr eingetragen“ blieb sichtbar. Ein Verbindungscode wurde erzeugt, ein zweites Testkonto registriert und verbunden: Die Partneransicht zeigte denselben Marker-Zustand rein lesend, ohne jede Checkbox/Eingabemöglichkeit im DOM. Kein horizontaler Überlauf in beiden Breiten. Screenshots geprüft. Playwright, der Dev-Server und alle fünf Testkonten (inkl. Verbindung, Code, Perioden und Symptomeinträgen) wurden danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung vom Soll-Umfang.
  - Die genaue Punktposition innerhalb des PMS-Segments (dem Auftrag zufolge Claude freigestellt) wurde auf die Segmentmitte gelegt – dieselbe Position, die bereits für das „PMS“-Textlabel verwendet wird. Das stellt sicher, dass der Punkt sichtbar im Segment liegt, ohne eine neue geometrische Berechnung einzuführen. **Korrektur (siehe unten):** Diese erste Umsetzung überdeckte den Schriftzug tatsächlich, statt daneben zu liegen – von Codex in der Soll-Ist-Prüfung korrekt erkannt und vom Owner bestätigt.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: Auf `/neu` heute ein PMS-Symptom speichern und Kreis sowie Kalender vergleichen; danach `/neu/partner` mit einer aktiven Verbindung öffnen und den Kreis vergleichen.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** 0585a2b.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Teilweise erfüllt. Die fachliche Begrenzung ist korrekt: Der Marker wird nur bei heute aktivem manuellem PMS verschoben; Daten und Vorhersagen bleiben unverändert, echte Periodentage behalten Vorrang und beide Ansichten nutzen denselben Weg.
- Nachschärfung: erforderlich. Der aktuelle Marker-Winkel ist exakt gleich der `labelAngle`-Position des sichtbaren PMS-Schriftzugs. Da der rote SVG-Kreis nach dem Text gezeichnet wird, kann er den Schriftzug überdecken. Der Marker muss weiterhin sichtbar innerhalb des PMS-Segments liegen, aber eine eigene, nicht mit dem PMS-Text kollidierende Position erhalten. Danach sind Eigen- und Partneransicht erneut sichtbar zu prüfen.
- Product-Map aktualisiert: nein, bis die Nachschärfung bestätigt ist.

## Korrektur Version 2 – von Claude

- **Owner-Auftrag:** „Der rote Heute-Punkt muss bei manuellem PMS weiterhin innerhalb des PMS-Segments liegen, aber neben dem sichtbaren „PMS“-Text und darf ihn nicht überdecken. Prüfe es in Eigen- und Partneransicht. Vorhersagen und Datenlogik dürfen unverändert bleiben.“ – deckt sich mit der Nachschärfung aus der Soll-Ist-Prüfung von Codex.
- **Ursache:** `buildPersonalRingGeometry` setzte den übersteuerten `todayAngle` bei aktivem manuellem PMS exakt auf `midAngle(pmsStartAngle, pmsEndAngle)` – dieselbe Formel, mit der auch `labelAngle` des PMS-Segments (und damit die Position des „PMS“-Textlabels) berechnet wird. Der rote Punkt lag dadurch exakt auf dem Text statt daneben.
- **Fix:** Neue Funktion `manualPmsMarkerAngle(startAngle, endAngle)` in `src/lib/cycle-ring-geometry.ts` platziert den Marker bei einem Viertel der Segmentbreite ab Segmentanfang, mit einem Mindestabstand von 12° zur Segmentmitte (`labelAngle`). Der Punkt bleibt dadurch immer innerhalb der PMS-Segmentspanne, hat aber bei allen plausiblen Zykluslängen (21–40 Tage, 5 Tage PMS-Fenster) einen Pixelabstand von ca. 24–26 px zum Labelzentrum. Keine Änderung an Segmentgrenzen, Datums- oder Zyklusberechnung; nur die bereits bestehende Fallunterscheidung für `todayAngle` wurde angepasst.
- **Tests:** `scripts/verify-manual-pms-ring-marker.ts` angepasst – die Assertion „Marker-Winkel entspricht der PMS-Segmentmitte“ wurde ersetzt durch: (1) Marker-Winkel liegt innerhalb der PMS-Segmentspanne um die Mitte, (2) Marker-Winkel ist NICHT mehr gleich `labelAngle`, (3) Pixelabstand zwischen Marker- und Label-Punkt ist ≥20 px (gemessen: 26,1 px). Alle 15 Prüfungen bestanden (12 unverändert, 3 für die Korrektur ersetzt/ergänzt).
- **Live-Prüfung:** Lokaler Dev-Server, temporär installiertes Playwright, echte Testkonten (vier echte, abgeschlossene Perioden im 28-Tage-Rhythmus, letzte Periode 20.–24.09.2026, sodass der 16.10.2026 im berechneten PMS-Fenster, aber außerhalb jeder echten Periode liegt). Nach einer heutigen PMS-Symptommarkierung lag der Marker in Eigenansicht breit (1280px), Eigenansicht mobil (375px) und Partneransicht breit jeweils bei identisch 26,1 px Abstand zum „PMS“-Label – sichtbar innerhalb des Segments, deutlich neben statt auf dem Text. Kein horizontaler Überlauf mobil. Partneransicht weiterhin ohne jede Eingabemöglichkeit im DOM (0 Checkbox-/Submit-Elemente), Verbindungscode/Redeem-Flow erfolgreich. Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Regressionen:** `npx tsc --noEmit` fehlerfrei; `npm run build` erfolgreich, Routenliste unverändert; alle 17 bestehenden `scripts/verify-*`-Regressionen für PMS/Ring/Kalender/Perioden/Partner grün (inkl. `verify-home-screen-layout.ts`, das keine Änderung mehr benötigte); `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`; `scripts/verify-personal-cycle-view.ts` weiterhin mit den seit WP-004 Version 6 bekannten 9 vorbestehenden Fehlschlägen, unverändert durch diese Korrektur.
- **Abweichungen:** keine. Reine Geometriekorrektur innerhalb des bereits freigestellten Spielraums („Die genaue Punktposition innerhalb des PMS-Segments ist Claude freigestellt, sofern sie sichtbar im Segment liegt, die Beschriftung nicht verdeckt“). Keine Änderung an `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, Eisprung, fruchtbarem Fenster, Unsicherheitslogik, Datenbank, API-Routen, Authentifizierung oder Partner-Gate.
- **offene Punkte:** Owner-Prüfschritt (erneut): Auf `/neu` heute ein PMS-Symptom speichern und prüfen, dass der rote Punkt sichtbar im PMS-Segment, aber klar neben dem „PMS“-Text liegt; danach `/neu/partner` mit aktiver Verbindung öffnen und denselben Zustand rein lesend prüfen.
- **Commit:** 6bfe934.

## Soll-Ist-Prüfung – Codex, Korrektur Version 2

- Ergebnis: Soll und Ist stimmen ausreichend überein. Der manuelle PMS-Marker liegt innerhalb des bestehenden PMS-Segments, aber nicht mehr auf dem PMS-Text. Die gezielte Prüfung belegt mindestens 20 px Abstand; die gemeldete Live-Prüfung bestätigt dies für eigene breite/mobile Ansicht und aktive Partneransicht.
- Nachschärfung: keine.
- Product-Map aktualisiert: ja.

## Korrektur Version 3 – manuellen PMS-Abschnitt als Ringsegment darstellen

### Owner-Entscheidung

Die Ownerin präzisiert am 2026-10-16: Es genügt nicht, nur den roten Heute-Punkt in den bestehenden, automatisch geschätzten PMS-Balken zu verschieben. Wenn sie PMS früher selbst einträgt, muss auch der pinke PMS-Balken im Zyklus-Kreis an diesem selbst eingetragenen Starttag beginnen und bis zum bereits bestehenden Ende des manuellen PMS-Abschnitts reichen. Die Periodenvorhersage bleibt dabei unverändert.

### Soll – Korrektur Version 3

- Ist heute ein manueller PMS-Abschnitt aktiv, ersetzt dessen bestehendes `startDate`/`endDate` ausschließlich die sichtbaren Start- und Endgrenzen des pinken PMS-Ringsegments.
- Der rote Heute-Punkt liegt innerhalb dieses manuellen pinken Segments und neben seinem lesbaren `PMS`-Text.
- Die eigene Ansicht und die aktiv verbundene Partneransicht zeigen dieselbe Segmentlänge. Der Partner bleibt rein lesend.
- Ohne aktiven manuellen PMS-Abschnitt bleibt das bisherige automatisch geschätzte PMS-Segment unverändert.
- Ein tatsächlicher Periodentag beendet beziehungsweise übersteuert den manuellen Abschnitt weiterhin vollständig.
- Nicht enthalten: keine neue Vorhersage, keine Änderung von `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, Eisprung, Fruchtbarkeitsfenster, Datenbank, API oder Partnerrechten.

### Technischer Auftrag für Claude – Korrektur Version 3

- `src/lib/manual-pms.ts` liefert bereits die einzige fachliche Quelle: `ManualPmsSection.startDate` und `endDate`. Diese Logik darf nicht dupliziert oder verändert werden.
- Erweitere die gemeinsame Ringgeometrie beziehungsweise ihre Darstellungsübergabe so, dass ein vorhandener heute aktiver `ManualPmsSection` das gezeichnete PMS-Segment nur visuell von `startDate` bis `endDate` bestimmt. Die Winkel müssen aus derselben bestehenden Zyklus-Kreis-Geometrie abgeleitet werden; keine zweite Vorhersage oder Datumslogik einführen.
- Das `PMS`-Label wird innerhalb des dadurch dargestellten manuellen Segments lesbar positioniert. Der rote Marker bleibt im selben Segment und hält ausreichend Abstand zum Label.
- `NewCycleExample.tsx` nutzt den bereits abgeleiteten `manualPmsSection`. Die Partnerseite besitzt denselben Abschnitt bereits über `calendarView.manualPmsSection`; reiche nur die minimal nötigen vorhandenen Datumswerte an den gemeinsamen Ring weiter. Keine zusätzlichen Partnerdaten laden oder zurückgeben.
- Für den Fall ohne manuellen Abschnitt bleibt die bestehende Ringgeometrie bytegleich. Echte Periodentage dürfen niemals durch einen manuellen PMS-Balken übermalt werden.

### Pflichtprüfungen – Korrektur Version 3

- Gezielte Tests: ein früher manuell gesetzter PMS-Start erweitert das pinke Segment bis zum bestehenden manuellen Ende; ohne manuellen Abschnitt bleiben Segmentgrenzen unverändert; echte Periodentage haben Vorrang.
- Vergleichstest: Vorhersagewerte für Periode, Eisprung und Fruchtbarkeit sind vor und nach der reinen Ringdarstellung identisch.
- Eigen- und Partneransicht erhalten für denselben manuellen Abschnitt gleiche Segmentgrenzen, lesbares Label und einen Marker innerhalb des Segments.
- Bestehende PMS-, Ring-, Kalender-, Perioden- und Partnerregressionen, TypeScript und Produktions-Build ausführen.
- Mobile und breite Sichtprüfung mit temporären Testdaten: früher PMS-Start macht den pinken Balken sichtbar länger; kein Überlauf und keine Partner-Eingabe. Testdaten wieder entfernen.

### Abschluss durch Claude – Korrektur Version 3

- `Ist` zu dieser Korrektur ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen, Ledger ergänzen, `mark-updated WP-014` und `validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein Deployment auslösen.

## Ist – Korrektur Version 3 – von Claude

- **umgesetzt:**
  - `src/lib/cycle-ring-geometry.ts`: `buildPersonalRingGeometry(view, today, manualPmsOverride = null)` ersetzt den bisherigen dritten Parameter (`isManualPmsToday: boolean`) durch ein optionales `ManualPmsRingOverride`-Objekt (`{ startDate, endDate }`). Nur wenn gesetzt, werden `pmsStartAngle`/`pmsEndAngle` aus diesen Datumswerten abgeleitet (statt aus dem rechnerischen `pmsStart`/`pmsEnd` = Zyklusende minus 5 Tage) – mit derselben bestehenden `angleForDay`-Geometrie, jetzt über eine neue `normalizedDayOffset`-Hilfsfunktion, die den Tagesoffset korrekt in den aktuellen Zykluswindow faltet (nötig, weil ein manueller Start auch deutlich vor dem bisherigen 5-Tage-Fenster liegen kann). Segmente `period` und `fertile` sowie jede Datums-/Zyklusberechnung bleiben vollständig unverändert.
  - `manualPmsMarkerAngle` (Korrektur Version 2) wurde robuster gemacht: statt eines festen 12°-Mindestabstands zur Segmentmitte wird jetzt der größtmögliche Abstand gewählt, der innerhalb eines kleinen Randsicherheitsabstands bleibt (`min(span*0.1, 3)`), gedeckelt auf maximal 12°. Grund: Seit dieser Korrektur kann das PMS-Segment durch einen gerade erst begonnenen manuellen Abschnitt auch nur einen einzigen Tag lang sein – der bisherige feste Abstand hätte dort über den Segmentrand hinausgeragt.
  - `src/components/CyclePersonalRing.tsx`: Prop `isManualPmsToday?: boolean` wurde durch `manualPmsOverride?: ManualPmsRingOverride | null` ersetzt und unverändert an `buildPersonalRingGeometry` durchgereicht. Ohne die Prop (oder mit `null`) bleibt die Ringgeometrie bytegleich zur bisherigen Berechnung.
  - `src/components/NewCycleExample.tsx`: leitet `manualPmsRingOverride` aus dem bereits vorhandenen `manualPmsSection` (WP-013/`manual-pms.ts`) ab, wenn `isManualPmsToday` zutrifft – keine neue Datums- oder Symptomlogik, nur Weiterreichen bereits abgeleiteter Werte.
  - `src/components/NewPartnerCycleRing.tsx`: neue Pflicht-Prop `manualPmsOverride: ManualPmsRingOverride | null`, unverändert an `CyclePersonalRing` durchgereicht.
  - `src/app/neu/partner/page.tsx`: leitet `manualPmsOverride` aus dem bereits serverseitig geladenen `calendarView.manualPmsSection` ab (`getPartnerCalendarView`, WP-013), geprüft über das bestehende `isWithinManualPmsSection`. Keine zusätzlichen Partnerdaten geladen oder zurückgegeben – derselbe Abschnitt, der bereits für `NewPartnerCalendar` und die Symptomanzeige genutzt wird.
  - Echte Periodentage bleiben strukturell vorrangig: `isWithinManualPmsSection` liefert an einem echten Periodentag weiterhin `false` (unverändert in `manual-pms.ts`), sodass `manualPmsOverride` dort nie gesetzt wird und die PMS-Segmentgrenzen rein rechnerisch bleiben.
  - Keine Änderung an `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, Eisprung, fruchtbarem Fenster, Unsicherheitslogik, Datenbank, API-Routen, Authentifizierung oder Partner-Gate.
- **nicht umgesetzt:** nichts aus dem Korrektur-Umfang offen.
- **Tests:**
  - `scripts/verify-manual-pms-ring-marker.ts` vollständig überarbeitet (24 Prüfungen, alle bestanden): (1) ohne manuellen Abschnitt bleibt die gesamte Ringgeometrie bytegleich; (2) ein mehrtägiger manueller Abschnitt (15.–18.09., Start 4 Tage vor dem rechnerischen Fenster) verändert sichtbar den gezeichneten PMS-Pfad und die Label-Mitte, lässt Perioden- und Fruchtbarkeitssegment aber unverändert, und der Marker hält weiterhin ≥20px Abstand zum Label (gemessen: 26,1px); (3) neuer Grenzfalltest für einen eintägigen manuellen Abschnitt (nur heute markiert) – das Segment ist dann nur ca. 12,9° breit, der Marker kann physikalisch keine 20px erreichen, bleibt aber nachweislich innerhalb des Segments und niemals exakt auf der Labelmitte (gemessen: 11,2px, > 0); (4) ein echter Periodentag erzwingt weiterhin keinen manuellen PMS-Abschnitt, Ringgeometrie bleibt identisch zum Fall ohne Override.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-manual-pms-prediction-isolation.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-partner-pms-symptoms.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-period-day-actions.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-home-actions-consistent.ts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-action-success-toast.ts`.
  - `scripts/verify-home-screen-layout.ts`: zwei Assertions auf die neue, korrekte JSX-Übergabe `<CyclePersonalRing ... manualPmsOverride={manualPmsRingOverride} />` aktualisiert (bewusste Verhaltensänderung, keine stille Fehlerreparatur). Alle 27 Prüfungen bestehen weiterhin.
  - `scripts/verify-personal-cycle-view.ts`: weiterhin dieselben, seit WP-004 Version 6 bekannten 9 vorbestehenden Fehlschläge (Gradient-Quelltextsuche in falscher Datei) – unverändert, nicht durch diese Korrektur verursacht.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten: Vier echte, abgeschlossene Perioden im 28-Tage-Rhythmus (letzte 20.–24.09.2026), heute = 16.10.2026 liegt im rechnerischen PMS-Fenster (13.–17.10.). Zustand ohne manuelles PMS: gezeichneter PMS-Pfad beginnt bei den rechnerischen Winkeln. Nach Markierung von Symptomen ab dem 12.10. (4 Tage vor dem rechnerischen Fenster) in Eigenansicht breit (1280px), mobil (375px) und Partneransicht breit: identischer, sichtbar veränderter (früher beginnender) PMS-Pfad in allen drei Ansichten, Marker-Label-Abstand konstant 26,1px, kein horizontaler Überlauf mobil, Kalender markiert den manuellen Bereich korrekt ab dem 12.10., Partneransicht weiterhin ohne jede Eingabemöglichkeit im DOM (0 Checkbox-/Submit-Elemente). Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** keine. Die Implementierung hält sich an den freigestellten Spielraum der Korrektur Version 3 (exakte Platzierung innerhalb des Segments weiterhin Claude überlassen, solange sichtbar im Segment und ohne Labelüberdeckung). Der robustere `manualPmsMarkerAngle`-Algorithmus war technisch nötig, weil ein einzelner manuell markierter Tag ein deutlich schmaleres Segment als das bisherige 5-Tage-Fenster erzeugen kann – im Soll nicht explizit benannt, aber zur Erfüllung von „Marker bleibt innerhalb des Segments, kein Überdecken des Labels" für alle zulässigen Abschnittslängen erforderlich.
- **offene Punkte:** Owner-Prüfschritt: Auf `/neu` ein PMS-Symptom einige Tage vor dem bisherigen automatischen PMS-Beginn eintragen und prüfen, dass der pinke Balken sichtbar früher beginnt (nicht nur der Punkt sich verschiebt); danach `/neu/partner` mit aktiver Verbindung öffnen und denselben, verlängerten Balken rein lesend prüfen.
- **Commit:** folgt.
