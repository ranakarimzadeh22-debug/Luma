---
id: WP-020
title: "Manuellen PMS-Heutemarker tagesgenau im Zyklus-Kreis zeigen"
status: review
created: 2026-10-18
updated: 2026-10-18
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home und Partneransicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Manuellen PMS-Heutemarker tagesgenau im Zyklus-Kreis zeigen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der rote Heute-Punkt im Zyklus-Kreis zeigt bei selbst eingetragenem PMS denselben Kalendertag wie der rote Punkt im Kalender.
- **Warum machen wir das?** Er wird derzeit absichtlich innerhalb des rosa PMS-Balkens verschoben. Am ersten PMS-Tag wirkt er dadurch wie ein Punkt in der Mitte statt am Beginn.
- **Woher kam die Idee?** Bestätigtes Owner-Feedback vom 2026-10-18 zu WP-014.
- **Wo ist es in der App?** Im Zyklus-Kreis auf `/neu` und rein lesend auf `/neu/partner`.
- **Was gehört ausdrücklich nicht dazu?** Keine Änderung an PMS-Start, PMS-Balken, Periodenvorhersage, Zyklusberechnung, Symptomen, Datenbank oder Partnerrechten.
- **Was kann die Nutzerin danach ausprobieren?** Heute als ersten PMS-Tag markieren und prüfen, dass Kalender und Kreis beide den Beginn des rosa Balkens anzeigen.

## Entstehungsweg

`Manueller PMS-Start → Kalender zeigt den ersten Tag korrekt → Ring verschiebt den Heute-Punkt absichtlich nach innen → sichtbare Tagesabweichung → Heute-Punkt aus dem echten heutigen Datum ableiten → WP-020`

- Ausgangsidee oder Problem: Bei einem aktiven manuellen PMS-Abschnitt berechnet `manualPmsMarkerAngle(...)` eine feste, labelfreundliche Punktposition innerhalb des PMS-Segments statt der tatsächlichen Position des heutigen Tages.
- bestätigte Wirkung: Kalender und Zyklus-Kreis zeigen für den roten Heute-Punkt denselben Tag.
- gewählte Lösung: Der rote Heute-Punkt bleibt tagesgenau. Er wird bei manuellem PMS nicht mehr in Richtung Segmentmitte verschoben.
- wichtige Entscheidung(en): Die Vorhersage und die sichtbare Länge des manuellen PMS-Balkens bleiben unverändert.
- Quellen/Akten: `APP-IDEA-022`, `APP-PROBLEM-010`, `WP-013`, `WP-014`.

## Soll – von Codex

- **Problem:** Auf dem ersten manuell eingetragenen PMS-Tag zeigt der Kalender den roten Heute-Punkt am PMS-Beginn, der Zyklus-Kreis zeigt ihn aber weiter innerhalb beziehungsweise nahe der Mitte des rosa Balkens.
- **gewünschte Wirkung:** Beide roten Heute-Punkte stehen für denselben tatsächlichen Kalendertag.
- **sichtbare Änderung:** Ist heute der erste Tag eines aktiven manuellen PMS-Abschnitts, liegt der rote Punkt im Kreis am Beginn des rosa PMS-Balkens. An späteren manuellen PMS-Tagen folgt der Punkt dem jeweiligen heutigen Tag.
- **nicht enthalten:** Keine Änderung an `manual-pms.ts`, dem PMS-Abschnitt, der sichtbaren Segmentlänge, Vorhersagen, Perioden, Eisprung, Fruchtbarkeit, Unsicherheit, Datenbank, API, Anmeldung oder Partnerrechten.
- **Abnahmekriterien:**
  1. Der rote Punkt im Kreis wird bei aktivem manuellem PMS aus dem echten heutigen Datum abgeleitet, nicht aus einer festen Ersatzposition im PMS-Segment.
  2. Am ersten manuellen PMS-Tag liegen Kalenderpunkt und Kreispunkt beide am Beginn des rosa PMS-Balkens.
  3. An einem späteren Tag des aktiven manuellen PMS-Abschnitts entspricht der Kreispunkt weiter dem jeweiligen heutigen Kalendertag.
  4. Der PMS-Schriftzug bleibt lesbar; falls die bisherige Beschriftungsposition mit dem tagesgenauen Punkt kollidiert, darf nur die Beschriftung innerhalb des vorhandenen Segments angepasst werden, nie der Heute-Punkt.
  5. Ohne aktiven manuellen PMS-Abschnitt, an echten Periodentagen sowie bei allen Vorhersagen bleibt das bisherige Verhalten unverändert.
  6. Eigen- und Partneransicht zeigen dieselbe tagesgenaue Ringdarstellung; die Partneransicht bleibt vollständig rein lesend.
- **ein Prüfschritt für den Owner:** Auf `/neu` heute erstmals ein PMS-Symptom speichern und vergleichen: roter Punkt im Kalender und im Ring stehen beide am Beginn des rosa PMS-Balkens. Danach denselben Ring auf `/neu/partner` prüfen.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/lib/cycle-ring-geometry.ts` leitet bei `buildPersonalRingGeometry(view, today, manualPmsOverride)` die Grenzen des sichtbaren manuellen PMS-Segments bereits korrekt aus dem vorhandenen `ManualPmsRingOverride` ab.
- Im gleichen Modul ersetzt `manualPmsMarkerAngle(pmsStartAngle, pmsEndAngle)` bei einem manuellen Override aktuell die tagesgenaue `todayAngle`-Position durch eine absichtlich versetzte Position innerhalb des Segments.
- Ohne Override verwendet `buildPersonalRingGeometry(...)` bereits `angleForDay(normalizedDayOffset(today), cycleLengthDays)` und ist damit tagesgenau.
- `NewCycleExample.tsx` und `src/app/neu/partner/page.tsx` reichen nur den bereits aus `manual-pms.ts` abgeleiteten aktiven manuellen Abschnitt an den gemeinsamen `CyclePersonalRing` weiter. `NewPartnerCycleRing.tsx` verwendet denselben Ring.

### Technisches Ziel

- Ändere ausschließlich die gemeinsame Ringdarstellung so, dass `todayAngle` auch bei `manualPmsOverride` aus dem tatsächlichen Parameter `today` abgeleitet wird.
- Der Marker darf nicht länger durch eine feste oder labelorientierte Ersatzposition verschoben werden.
- Bewahre eine lesbare PMS-Beschriftung. Sollte ein tagesgenauer Marker mit ihr kollidieren, löse ausschließlich die Beschriftung innerhalb des bestehenden PMS-Segments; weder Segmentgrenzen noch Marker-Datum dürfen dafür verändert werden.
- Nutze weiterhin die gemeinsame Geometrie für Eigen- und Partneransicht. Keine neue Datums- oder PMS-Ableitungslogik einführen.

### Invarianten – müssen unverändert bleiben

- `manual-pms.ts` bleibt die einzige fachliche Quelle für den aktiven manuellen PMS-Abschnitt.
- Die sichtbaren Start- und Endgrenzen des manuellen rosa PMS-Segments bleiben unverändert.
- `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, erwartete Periode, Eisprung, fruchtbares Zeitfenster und Unsicherheit bleiben fachlich und technisch unverändert.
- Echte Periodentage behalten Vorrang; dort wird kein manueller PMS-Override erzwungen.
- Authentifizierung, Kontentrennung, aktiver Partner-Gate, Partnerrechte und sämtliche Bearbeitungswege bleiben unverändert. Der Partner erhält keine Eingabemöglichkeit.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Ergänze gezielte Geometrie-Tests für: (a) erster aktiver manueller PMS-Tag ergibt denselben Tageswinkel wie die tagesgenaue Kalenderdarstellung und liegt am Segmentbeginn; (b) ein späterer aktiver manueller PMS-Tag folgt seinem Tageswinkel; (c) ohne Override bleibt die bisherige Geometrie unverändert; (d) echte Periodentage erhalten keinen manuellen Override.
- Prüfe, dass ein möglicher Schutz der PMS-Beschriftung niemals den Heute-Punkt vom tatsächlichen Tageswinkel wegbewegt.
- Prüfe Eigen- und Partneransicht mit demselben aktiven manuellen Abschnitt sowie den bestehenden aktiven-Verbindungs-Gate.
- Führe betroffene PMS-, Ring-, Kalender-, Perioden- und Partnerregressionen sowie TypeScript und Produktions-Build aus.
- Sichtprüfung mobil und breit mit temporären Testdaten: erster manueller PMS-Tag, späterer PMS-Tag, lesbare Beschriftung, kein horizontaler Überlauf und keine Partner-Eingabe. Testdaten danach entfernen.

### Stoppbedingungen

- Stoppe und frage nach, bevor sich PMS-Segmentgrenzen, Vorhersagen, Symptomdaten oder ihre fachliche Ableitung ändern.
- Stoppe vor jeder Migration, API-Änderung, Änderung am Partner-Gate oder neuen Partner-Schreibfunktion.
- Wenn die vorhandene PMS-Beschriftung nicht lesbar gehalten werden kann, ohne den tagesgenauen Marker zu verändern, dokumentiere den konkreten Fall und frage nach. Den Marker nicht wieder künstlich verschieben.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen und prüfen.
- `node scripts/work-package-state.mjs mark-updated WP-020` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – von Claude

- **umgesetzt:**
  - `src/lib/cycle-ring-geometry.ts`, `buildPersonalRingGeometry(view, today, manualPmsOverride)`: `todayAngle` wird jetzt in jedem Fall — mit oder ohne `manualPmsOverride` — ausschließlich über `angleForDay(normalizedDayOffset(today), cycleLengthDays)` berechnet. Die bisherige Fallunterscheidung `manualPmsOverride ? manualPmsMarkerAngle(...) : angleForDay(...)` wurde entfernt; es gibt nur noch den einen, tagesgenauen Berechnungsweg. `pmsStartAngle`/`pmsEndAngle` (die sichtbaren Segmentgrenzen) bleiben unverändert aus `manualPmsOverride.startDate`/`endDate` abgeleitet — nur die Marker-Position wurde geändert, nicht die Segmentberechnung.
  - Die bisherige Funktion `manualPmsMarkerAngle(startAngle, endAngle)` (die den Marker künstlich von der Segmentmitte wegschob) wurde entfernt und durch eine neue Funktion `pmsLabelAngleAvoidingMarker(startAngle, endAngle, markerAngle)` ersetzt. Sie berechnet nicht mehr die Marker-Position, sondern ausschließlich die **Label**-Position (`labelAngle`) des PMS-Segments: Standardmäßig bleibt das Label an der Segmentmitte (`midAngle`), wie bei allen anderen Segmenten (Periode, fruchtbares Fenster) auch. Nur wenn der tagesgenaue Marker-Winkel näher als ein kleiner Sicherheitsabstand (min. 12° oder die halbe Segmentspanne, je nachdem was kleiner ist) an der Segmentmitte liegt, weicht das Label zum weiter vom Marker entfernten Segmentende aus (mit einem kleinen Rand-Sicherheitsabstand, damit das Label selbst nicht über den Bogen hinausragt). Diese Funktion wird ausschließlich für das `labelAngle` des PMS-Segments aufgerufen, niemals für `todayAngle`.
  - `src/components/NewCycleExample.tsx`, `src/app/neu/partner/page.tsx`, `NewPartnerCycleRing.tsx`, `CyclePersonalRing.tsx`: keine Änderung — alle reichen weiterhin nur den bereits aus `manual-pms.ts` abgeleiteten `ManualPmsRingOverride` unverändert an dieselbe gemeinsame `buildPersonalRingGeometry`-Funktion weiter.
  - Keine Änderung an `manual-pms.ts`, den sichtbaren Start-/Endgrenzen des manuellen PMS-Segments, `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, Eisprung, fruchtbarem Fenster, Unsicherheitslogik, Datenbank, API-Routen, Authentifizierung oder Partner-Gate.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-manual-pms-ring-marker.ts` grundlegend überarbeitet (25 Prüfungen, alle bestanden): (a) am ersten aktiven manuellen PMS-Tag (heute = einziger markierter Tag = Segmentbeginn) ist `todayAngle` exakt identisch mit dem rein rechnerischen Tageswinkel ohne Override, und der aus diesem Winkel berechnete Marker-Punkt liegt (per direktem Pfad-Koordinatenvergleich, Abstand < 0,01px) exakt auf dem gezeichneten Segmentbeginn; (b) an einem späteren Tag eines mehrtägigen manuellen Abschnitts (Start vor heute) ist `todayAngle` weiterhin exakt identisch mit dem rein rechnerischen Tageswinkel, während sich das PMS-Segment selbst sichtbar verlängert (unveränderter Effekt aus WP-014 Korrektur Version 3), Perioden- und Fruchtbarkeits-Segmente bleiben unberührt; (c) ohne aktiven Override bleibt die gesamte Ringgeometrie bytegleich zum vorherigen Stand; (d) ein echter Periodentag erhält nie einen manuellen Override, Ringgeometrie bleibt unverändert; zusätzlich ein Grenzfalltest für einen eintägigen manuellen Abschnitt (Marker bleibt exakt tagesgenau, auch wenn er dadurch nahe der Segmentmitte liegt) sowie ein Konsistenztest, dass identische Eingaben (gleicher manueller Abschnitt, gleiches Datum) in Eigen- und Partneransicht denselben Marker-Winkel und dieselben Segmentgrenzen liefern.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-manual-pms-prediction-isolation.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-partner-pms-symptoms.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-period-day-actions.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-mobile-home-compact.ts`, `scripts/verify-mobile-partner-compact.ts`.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, nicht durch WP-020 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten (vier echte Perioden im 28-Tage-Rhythmus, letzte Periode 20.–24.09.2026): **Fall A — erster manueller PMS-Tag** (heute 19.10.2026, nur heute markiert): gemessener Abstand zwischen Marker und gezeichnetem PMS-Segmentbeginn 0,006px — praktisch deckungsgleich, visuell am Übergang von „Periode“ zu „PMS“ sichtbar bestätigt. **Fall B — späterer manueller PMS-Tag** (Abschnitt beginnt 17.10., heute weiterhin 19.10., dritter Tag): Marker bleibt exakt an derselben absoluten Position wie in Fall A (tagesgenau für den 19.10.), während sich der PMS-Segmentbeginn sichtbar auf den 17.10. verschiebt (Abstand Marker–Segmentbeginn jetzt 55,6px, da der Marker nicht mehr am Rand, sondern weiter im inzwischen verlängerten Segment liegt); Abstand Marker–Label 41,9px, keine Kollision mit dem „PMS“-Schriftzug, Kalender zeigt denselben Zeitraum (17.–19.10.) korrekt als „M·Du“ markiert. Mobil (375×812) und breit (1280×900): kein horizontaler Überlauf in beiden Fällen. Partneransicht (375×812) mit aktiver Verbindung: identische Marker- und Segmentkoordinaten wie in der Eigenansicht, 0 Eingabeelemente im DOM (weiterhin vollständig rein lesend). Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** keine fachliche Abweichung vom Soll. Die konkrete Ausweich-Formel für das PMS-Label (Mindestabstand 12° oder halbe Segmentspanne, Randsicherheitsabstand 15% der Spanne oder max. 6°) wurde von Claude frei gewählt, da das Soll dafür keine exakten Werte vorgibt, sondern nur „lesbare Beschriftung“ und „Beschriftung innerhalb des bestehenden Segments“ verlangt — beide Kriterien wurden live gemessen und erfüllt (41,9px Abstand im geprüften Kollisionsfall).
- **offene Punkte:** Owner-Prüfschritt steht aus: Auf `/neu` heute erstmals ein PMS-Symptom speichern und vergleichen, dass roter Punkt im Kalender und im Ring beide am Beginn des rosa PMS-Balkens stehen; danach denselben Ring auf `/neu/partner` prüfen.
- **Commit:** 47ccb0c.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend
- Nachschärfung:
- Product-Map aktualisiert: nein
