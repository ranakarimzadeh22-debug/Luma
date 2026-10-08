---
id: WP-008
title: "Periodenhistorie ruhig und lesbar gliedern"
package_revision: 1
status: completed
created: 2026-10-08
updated: 2026-10-08
owner_approved: yes
executor: claude
product_area: "Neue Luma - Home-Screen /neu, Periodenhistorie"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Periodenhistorie ruhig und lesbar gliedern

## Owner-Ansicht – einfach erklärt

- Kurz gesagt: Die bestehende Periodenhistorie wird nur optisch ruhiger und schneller lesbar. Es kommt keine neue Funktion hinzu.
- Jede Zeile bleibt antippbar und springt weiterhin in den passenden Kalendermonat.
- Eine Zeile zeigt in klarer Reihenfolge: Monat und Jahr, den tatsaechlichen Zeitraum, Dauer der Periode und Zykluslaenge.
- Dauer und Zykluslaenge bleiben zwei verschiedene Angaben. Laufende Perioden zeigen keine erfundene Dauer; bei einer noch unbekannten Zykluslaenge bleibt der vorhandene Hinweis sichtbar.
- Es gibt keinen neuen Screen, keine neue Daten, keine neuen Einstellungen und keine Aenderung an Partneransicht, Kalender oder Berechnung.

## Entstehungsweg

Die Ownerin moechte die bereits vorhandene App zuerst insgesamt ruhig und klar ordnen, bevor neue Faehigkeiten dazukommen. Als erste Aufraeumprioritaet wurde die bestehende Periodenhistorie bestaetigt.

- bestaetigtes Problem: Die Historienzeilen enthalten die richtigen Informationen, wirken aber in einer einzigen Textzeile fuer Zyklus und Dauer weniger schnell erfassbar.
- gewuenschte Wirkung: Eine Nutzerin kann den Monat, Zeitraum, die Dauer und die Zykluslaenge ohne Suchen ueberblicken.
- gewaehlte Loesung: Die vorhandenen Informationen innerhalb jeder bestehenden, antippbaren Historienzeile klar hierarchisch darstellen.
- Grenzen: Keine neue Periodenverwaltung und keine Aenderung der bereits bestaetigten Berechnungen.
- Quellen/Akten: APP-PROBLEM-008, WP-003 Version 6 bis 9, bestaetigte Aufraeumprioritaet vom 2026-10-08.

## Soll – von Codex

- Die Periodenhistorie bleibt das vorhandene Fenster, das ueber die Monatsanzeige des Home-Kalenders geoeffnet wird.
- Jede vorhandene Zeile bleibt vollstaendig antippbar und springt weiterhin zum Monat ihres tatsaechlichen Periodenstarts.
- In jeder Zeile ist Monat/Jahr die deutlichste Angabe. Darunter folgt der bestehende tatsaechliche Zeitraum oder bei einer laufenden Periode der vorhandene Status.
- Die vorhandenen Werte werden klar getrennt und ruhig dargestellt: `Dauer: N Tage` nur bei einem echten Ende, `Zyklus: N Tage` nur bei bekannter Zykluslaenge.
- Fehlt die Dauer bei einer laufenden Periode, erscheint keine Schaetzung. Ist die Zykluslaenge noch nicht bekannt, bleibt die bestehende klare Information `Zyklus: Noch nicht bekannt` erhalten.
- Reihenfolge, Berechnung und Bedeutung der bestehenden Daten bleiben unveraendert: Dauer zaehlt Start- und echtes Ende inklusive; Zykluslaenge ist der Abstand bis zum naechsten echten Periodenstart.

## Nicht enthalten

- Keine Aenderung an `computePeriodHistory`, `durationDays`, `cycleLengthDays` oder Datumsformatierungslogik.
- Keine Datenbankmigration, keine API-Route, keine neue Abfrage und keine Aenderung gespeicherter Periodendaten.
- Kein Bearbeiten, Loeschen, neuer Filter, neue Suche, neue Historienseite oder neue Partneransicht.
- Keine Aenderung an Zyklusvorhersagen, Kalenderfarben, Tagesfenster, Einstellungen, Anmeldung oder alter Luma.

## Abnahmekriterien

1. Monat/Jahr, Zeitraum, Dauer und Zykluslaenge sind in jeder abgeschlossenen Historienzeile ohne Textsuche unterscheidbar.
2. Dauer und Zykluslaenge sind nicht mehr als eine unstrukturierte gemeinsame Textzeile gestaltet.
3. Eine laufende Periode zeigt keine Dauer; eine unbekannte Zykluslaenge bleibt klar als `Noch nicht bekannt` gekennzeichnet.
4. Ein Tipp auf jede Zeile schliesst die Historie und zeigt weiterhin den korrekten Kalendermonat.
5. Auf 375 px und 1280 px Breite gibt es keinen horizontalen Ueberlauf; Escape und Schliessen des Fensters funktionieren weiter.

## Technischer Auftrag für Claude

### Bestaetigte Ausgangslage im Code

- Die reine Datenableitung liegt in `src/lib/period-history.ts`: `PeriodHistoryRow` enthaelt `startDate`, echtes optionales `endDate`, `cycleLengthDays` und `durationDays`. `durationDays` wird ausschliesslich aus einem echten Ende abgeleitet; `cycleLengthDays` aus dem folgenden echten Start.
- `src/components/NewCycleExample.tsx` enthaelt `PeriodHistoryModal`. Es sortiert vorhandene Rows nur fuer die Darstellung absteigend nach `startDate`; jede Row ist ein einzelner Button mit `onSelectMonth(row.startDate)`.
- Die bestehende Darstellung hat bereits Monat/Jahr, Zeitraum und die gemeinsam formatierte Zeile `Zyklus: ... · Dauer: ...`.
- `jumpToHistoryMonth` setzt den angezeigten Monat aus `startDate` und schliesst das Modal. Diese Navigation darf nicht veraendert werden.

### Technisches Ziel und Invarianten

- Aendere nur die Darstellung der vorhandenen Historienzeile in `PeriodHistoryModal` und bei Bedarf deren gezielte Darstellungstests.
- Verwende die bereits gelieferten `PeriodHistoryRow`-Werte. Keine zweite Berechnung, keine neue Datenableitung und keine Aenderung von `period-history.ts`.
- Behalte den gesamten Button als Klickflaeche, die bestehende `aria-label`-Form und die bestehende Modal-Logik bei.
- Gestalte Dauer und Zykluslaenge als getrennte, klar lesbare Informationen. Claude darf dafuer passende semantische HTML-Struktur und bestehende Tailwind-Klassen verwenden, solange die mobile Ansicht ruhig bleibt und keine neue Interaktion entsteht.
- Die Texte fuer fehlende Werte bleiben fachlich unveraendert: keine Dauer ohne echtes Ende, keine erfundene Zykluslaenge.

### Daten und API

- Keine Datenbankmigration, keine API-Aenderung, keine neue Route, keine neue Client-zu-Server-Anfrage und keine neue Abhaengigkeit.

### Pflichtpruefungen

- Ergaenze oder aktualisiere eine gezielte Pruefung fuer die Hierarchie der Historienzeile sowie die drei Zustaende: abgeschlossen mit Dauer/Zyklus, laufend ohne Dauer, Zyklus noch nicht bekannt.
- Fuehre die bestehende Historiennavigation-Pruefung und die vorhandene Dauer-Pruefung erneut aus.
- Fuehre `npx tsc --noEmit` und `npm run build` aus.
- Pruefe die Historie gegen einen echten lokalen Dev-Server auf mobiler und breiter Ansicht. Bestaetige die Monatsnavigation, Escape/Schliessen und fehlenden horizontalen Ueberlauf. Entferne temporaere Testkonten und Werkzeuge danach.

### Stoppbedingungen

- Stoppe und frage nach, falls die Anforderung nur durch eine Aenderung der Periodenberechnung, Datenbank, API, Partneransicht oder einen neuen Screen loesbar waere.
- Kein manuelles Deployment ausloesen. Ein vorhandener automatischer Ablauf nach Push wird nicht von Claude gesteuert.

## Owner-Pruefort nach Umsetzung

`/neu` oeffnen, auf die Monatsanzeige tippen und die Periodenhistorie ansehen. Pruefe eine abgeschlossene Periode sowie - falls vorhanden - eine laufende oder neueste Periode ohne bekannte Zykluslaenge. Tippe anschliessend auf eine Zeile: Der Kalender soll in genau diesen Monat springen.


## Ist – von Claude

### Umgesetzt

- In `src/components/NewCycleExample.tsx` wurde ausschliesslich die Darstellung der Historienzeile in `PeriodHistoryModal` geaendert:
  - Monat/Jahr ist jetzt die deutlichste Angabe der Zeile (`text-base font-semibold` statt vorher `text-sm`).
  - Der bestehende tatsaechliche Zeitraum bzw. der Laufend-Status bleibt unveraendert direkt darunter.
  - Die vorher zusammengefuegte Zeile `Zyklus: ... · Dauer: ...` wurde in zwei getrennte, einzeln beschriftete Felder (`<span>`) aufgeteilt: `Dauer: N Tage` (nur wenn `row.durationDays !== null`) und `Zyklus: N Tage` bzw. `Zyklus: Noch nicht bekannt`.
  - Beide Felder stehen in einem `flex flex-wrap`-Container, damit die Darstellung auch auf schmalen Breiten ruhig bleibt.
- Es wurden ausschliesslich bereits von `computePeriodHistory` gelieferte Werte (`startDate`, `endDate`, `durationDays`, `cycleLengthDays`) verwendet. `src/lib/period-history.ts` wurde nicht angefasst.
- Klickflaeche (gesamter Button), `aria-label`, `onSelectMonth`/`jumpToHistoryMonth`-Navigation, Escape-Handling und `inert`-Hintergrundsperre wurden nicht veraendert.

### Nicht umgesetzt

- Keine Abweichung vom Soll. Alle in "Nicht enthalten" gelisteten Bereiche (Berechnung, Datenbank, API, Partneransicht, neue Screens, Vorhersagen, Kalenderfarben, Tagesfenster, Einstellungen, Anmeldung, alte Luma) wurden nicht beruehrt.

### Tests

- `npx tsc --noEmit` — fehlerfrei.
- `npx tsx scripts/verify-period-history.ts` — alle bestehenden Berechnungs-/Navigationstests bestehen weiterhin; die eine Darstellungs-Assertion wurde an die neue, getrennte Dauer/Zyklus-Markup angepasst (inhaltlich unveraendertes Verhalten, nur neue Struktur).
- `npx tsx scripts/verify-period-history-layout.ts` (neu angelegt) — gezielte Pruefung der Zeilenhierarchie (Monat/Jahr deutlichste Angabe, Zeitraum direkt darunter), der getrennten Dauer-/Zyklus-Felder, der fachlich unveraenderten Texte ("Noch nicht bekannt", keine Dauer ohne echtes Ende) sowie unveraenderter Klickflaeche/aria-label. Alle Pruefungen bestanden.
- `npx tsx scripts/verify-history-month-jump.ts` (bestehende Historiennavigation-Pruefung erneut ausgefuehrt) — alle Pruefungen bestanden.
- `npm run build` — erfolgreich, Routenliste unveraendert (keine neue/entfernte Route).
- Live-Pruefung gegen echten lokalen Dev-Server (`npm run dev`) mit temporaer installiertem Playwright (`npm install --no-save playwright`, danach `npm uninstall playwright`): ein Testkonto mit drei Perioden (abgeschlossen mit Dauer+Zyklus, abgeschlossen mit Dauer+Zyklus, laufend ohne Ende) wurde angelegt. Auf 375 px und 1280 px Breite wurde bestaetigt: Historie oeffnet sich ueber die Monatsanzeige, alle drei Zustaende erscheinen korrekt (Dauer nur bei echtem Ende, "Zyklus: Noch nicht bekannt" bei der neuesten Periode), kein horizontaler Ueberlauf (`scrollWidth` <= `clientWidth` + 1), Escape schliesst den Dialog, ein Zeilenklick schliesst den Dialog und (gemaess bestehender `jumpToHistoryMonth`-Logik, unveraendert) springt zum passenden Kalendermonat. Testkonto, Perioden und Sitzungen wurden anschliessend vollstaendig aus der lokalen `luma_core`-Datenbank geloescht; alle temporaeren Skripte/Screenshots und Playwright wurden entfernt.

### Abweichungen

- Keine Abweichung vom Soll.

### Offene Punkte

- Keine. Owner hat die Umsetzung am 2026-10-08 geprueft und akzeptiert.

### Commit

- 1ebd621

## Soll-Ist-Prüfung – von Codex

- **Soll:** Die bestehende Periodenhistorie soll ohne neue Daten oder Funktion ruhiger gegliedert werden. Monat/Jahr, Zeitraum, Dauer und Zykluslaenge bleiben klar getrennt; Navigation und Berechnung bleiben unveraendert.
- **Ist:** Die bestehende Historienzeile zeigt Monat/Jahr hervorgehoben, den Zeitraum darunter sowie getrennte, beschriftete Felder fuer Dauer und Zyklus. Dauer erscheint nur bei echtem Ende; eine unbekannte Zykluslaenge bleibt sichtbar. Klickflaeche, Monatsnavigation, Escape und Datenableitung sind laut dokumentierter Umsetzung unveraendert.
- **Nachweis:** Commit `1ebd621` und Nachbesserungs-Commit `97d0df2`; gezielte Layout-, Historien-, Navigations-, TypeScript-, Build- und mobile Sichtpruefungen sind im Ist dokumentiert.
- **Ergebnis:** Soll erfuellt. Owner hat die Umsetzung am 2026-10-08 geprueft und akzeptiert.
