---
id: WP-015
title: "Resttage bis zur naechsten geschaetzten Periode anzeigen"
status: review
created: 2026-10-17
updated: 2026-10-17
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Resttage bis zur naechsten geschaetzten Periode anzeigen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** In der bestehenden Heute-Karte steht zusaetzlich, wie viele Tage voraussichtlich noch bis zur naechsten Periode verbleiben.
- **Warum machen wir das?** Die Nutzerin soll die Tage nicht selbst im Kalender zaehlen muessen.
- **Woher kam die Idee?** Owner-Wunsch vom 2026-10-14, jetzt zur Umsetzung bestaetigt, Akte APP-IDEA-020.
- **Wo ist es in der App?** Nur auf der eigenen Home-Seite `/neu`, als zweite kurze Zeile in der bestehenden Heute-Karte.
- **Was gehoert ausdruecklich nicht dazu?** Keine neue Prognose, keine medizinische Aussage, keine neue Einstellung, keine Partneransicht, keine Datenbank- oder API-Aenderung.
- **Was kann die Nutzerin danach ausprobieren?** Bei vorhandener Prognose sieht sie zum Beispiel: `Naechste Periode voraussichtlich in 8 Tagen.`

## Entstehungsweg

`Kalendertage selbst zaehlen muessen → schnelle Orientierung fehlt → kurze Resttage-Zeile in der Heute-Karte → WP-015`

- Ausgangsproblem: Die erwartete naechste Periode ist im Kalender markiert, die verbleibende Zahl muss aber selbst gezaehlt werden.
- bestaetigte Wirkung: Die Nutzerin erkennt die erwartete Restzeit auf einen Blick.
- gewaehlte Loesung: Eine kurze, klar als Schaetzung bezeichnete zweite Zeile in der bestehenden Heute-Karte.
- wichtige Entscheidung: Die Anzeige verwendet ausschliesslich die schon vorhandene Periodenvorhersage und zeigt ohne kommende Vorhersage keine erfundene Zahl.
- Quellen/Akten: APP-IDEA-020, WP-006, WP-007.

## Soll – von Codex

- Problem: Die Nutzerin muss bis zur naechsten geschaetzten Periode selbst Tage im Kalender zaehlen.
- gewuenschte Wirkung: Die erwartete Restzeit ist auf der eigenen Home-Seite sofort sichtbar und bleibt eindeutig als Schaetzung erkennbar.
- sichtbare Aenderung: Die bestehende Heute-Karte zeigt bei einer noch zukuenftigen bestehenden `nextPeriodStart`-Vorhersage eine zweite Zeile: `Naechste Periode voraussichtlich in X Tagen.` Bei Unsicherheit bleibt der vorhandene Hinweis `Kann abweichen` sichtbar.
- ohne Vorhersage: Gibt es keine zukuenftige Vorhersage oder ist das Datum nicht mehr zukuenftig, erscheint keine Resttage-Zeile und keine Zahl `0` oder negative Zahl.
- nicht enthalten: Keine Aenderung an Perioden-, Zyklus-, Eisprung-, Fruchtbarkeits- oder PMS-Berechnung; keine neue Datenspeicherung, Route, API, Datenbank, Migration, Einstellung, Partneransicht, Push oder medizinische Aussage.
- Abnahmekriterien:
  1. Die Resttage entsprechen der kalenderfesten Differenz zwischen dem heutigen Berliner Datum und der bereits vorhandenen `nextPeriodStart`-Vorhersage.
  2. Bei `nextPeriodStart` am folgenden Kalendertag steht `in 1 Tag`; ab zwei Tagen steht `in X Tagen`.
  3. Ohne sichere zukuenftige Vorhersage, bei fehlenden Daten oder am/ nach dem vorhergesagten Start erscheint keine Resttage-Zahl.
  4. Der Text ist klar als `voraussichtlich` formuliert; der bestehende Unsicherheitshinweis wird weder entfernt noch in eine medizinische Gewissheit umformuliert.
  5. Die bestehende Heute-Ueberschrift, Start-Hilfe, Zyklus-Kreis, Kalender und alle Aktionen bleiben funktional und visuell unveraendert, abgesehen von der neuen kurzen Zeile.
  6. Die Zeile bleibt mobil lesbar, ohne horizontalen Ueberlauf.
- ein Pruefschritt fuer den Owner: `/neu` mit vorhandener Vorhersage oeffnen und die zweite Zeile der Heute-Karte mit dem erwarteten Datum im Kalender vergleichen.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnoetige Schritt-fuer-Schritt-Loesung.

### Bestaetigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` erhaelt bereits `prediction: CyclePrediction | null`, speichert mit `todayBerlinDateOnly()` das heutige Berliner Datum als `todayKey` und rendert die bestehende `TodayCard` direkt oberhalb des Zyklus-Kreises.
- `CyclePrediction` in `src/lib/new-cycle-prediction.ts` besitzt bereits `nextPeriodStart`. Die Vorhersage wird ausserhalb der Komponente erzeugt und darf hier nicht neu berechnet werden.
- `src/lib/personal-cycle-view.ts` besitzt bereits `deriveTodayCardText(view)` als reine Ableitung fuer die Inhalte der Heute-Karte; sie darf nicht zu einer zweiten Zyklus- oder Phasenberechnung erweitert werden.
- Bestehende Datumslogik arbeitet mit Datumsschluesseln im Format `YYYY-MM-DD` und UTC-kalenderfesten Tagesdifferenzen. Eine neue Resttage-Hilfsfunktion muss denselben kalenderfesten Umgang verwenden, nicht lokale Uhrzeiten oder Zeitzonen-`Date`-Vergleiche.

### Technisches Ziel

- Ergaenze eine kleine reine Hilfsfunktion in einem passenden bestehenden `src/lib`-Modul oder einem eng begrenzten neuen reinen Modul. Sie erhaelt ausschliesslich `today` und den vorhandenen `nextPeriodStart` und liefert die positive Zahl verbleibender Kalendertage oder `null`.
- Erweitere `TodayCard` minimal, damit sie die bereits vorhandene `prediction?.nextPeriodStart` und das bestehende `todayKey` lesen kann. Sie soll die Resttage-Zeile nur bei einem positiven Ergebnis rendern.
- Nutze Singular und Plural korrekt: `in 1 Tag` beziehungsweise `in X Tagen`.
- Die neue Zeile bleibt eine reine Anzeige; keine Buttons, Requests, lokalen Speicherungen oder Seiteneffekte.

### Invarianten – muessen unveraendert bleiben

- `predictCycle`, `computePersonalCycleView`, `deriveTodayCardText`, vorhandene Vorhersagewerte und deren Unsicherheitslogik bleiben fachlich unveraendert. Es darf keine zweite Berechnung der naechsten Periode entstehen.
- Die bestehende Heute-Ueberschrift und `Kann abweichen` bleiben erhalten. Die neue Zeile bezeichnet die Angabe immer als `voraussichtlich`.
- Bei `null`, heutigem oder vergangenem Vorhersagedatum keine Resttage-Zeile, keine `0`, keine negative Zahl und kein Fallback auf Profil- oder Standardwerte.
- Keine Aenderung an Start-Hilfe, PMS-Logik, Ring, Kalender, Historie, Tagesfenster, Fehler-/Erfolgshinweisen, Partneransicht, API, Datenbank, Authentifizierung, Routen oder Migrationen.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Gezielte Unit- oder Skripttests fuer: zukuenftiges Datum mit mehreren Tagen, genau einen Tag, heutiges Datum, vergangenes Datum und `null`.
- Pruefe die Kalenderfestigkeit an einem Monats- und Jahreswechsel.
- Pruefe, dass `nextPeriodStart`, alle Vorhersagewerte und die bestehende Heute-Ueberschrift vor/nach der neuen Anzeige unveraendert bleiben.
- Pruefe sichtbare Einbindung bei vorhandener Vorhersage sowie ohne ausreichende Daten; die Start-Hilfe darf nicht beeintraechtigt werden.
- Bestehende Heute-Karten-, Zyklus-, Kalender-, Start-Hilfe- und Home-Layout-Regressionen, TypeScript und Produktions-Build ausfuehren.
- Mobile und breite Sichtpruefung: zweite Zeile lesbar, kein horizontaler Ueberlauf, Kalendernavigation und Tagesfenster funktionieren weiter.

### Stoppbedingungen

- Stoppe vor jeder Aenderung an einer Vorhersageformel, Zyklusdaten, PMS, API, Datenbank, Partneransicht oder Berechtigungen.
- Stoppe, wenn die bestehende Vorhersage kein eindeutig zukunftiges Datum bereitstellt; zeige dann keine Zahl, statt einen Ersatzwert zu erfinden.
- Stoppe, wenn die Resttage nur durch lokale Uhrzeit oder unklare Zeitzonenumrechnung bestimmt werden koennen.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger fuer diese sichtbare Aenderung ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-015` und `node scripts/work-package-state.mjs validate` ausfuehren.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - `src/lib/next-period-countdown.ts` (neu, eng begrenztes reines Modul): `daysUntilNextPeriod(today, nextPeriodStart)` erhält ausschließlich die beiden Datumsstrings und liefert die positive Kalendertagedifferenz oder `null` (kein `nextPeriodStart`, heutiges oder vergangenes Datum). Nutzt dieselbe kalenderfeste UTC-`daysBetween`-Logik wie die bestehenden Hilfsfunktionen in `personal-cycle-view.ts`/`new-cycle-prediction.ts` (eigene, lokale Kopie, keine Änderung an diesen Modulen). Keine zweite Vorhersage, kein Profil-/Standardwert-Fallback.
  - `src/components/NewCycleExample.tsx`: `TodayCard` erhält zwei neue Props `nextPeriodStart: string | null` und `today: string` (aus dem bereits vorhandenen `prediction?.nextPeriodStart` und `todayKey`, keine neue Datenquelle). Rendert bei `daysRemaining !== null` eine zweite Zeile `Nächste Periode voraussichtlich in 1 Tag.` beziehungsweise `in X Tagen.` zwischen der bestehenden Headline und dem bestehenden `Kann abweichen`-Hinweis. `deriveTodayCardText` selbst wurde nicht verändert.
  - Zusätzliche, über das wörtliche Soll hinausgehende aber zur Erfüllung des Abnahmekriteriums „bei fehlenden Daten keine Zahl“ notwendige Bedingung: `daysRemaining` wird zusätzlich auf `null` erzwungen, wenn `personalCycleView.status === "no_data"` ist (ein bereits vorhandenes Feld, nur gelesen, keine neue Berechnung). Grund: `predictCycle()` kann bei nur einer gespeicherten Periode bereits einen Default-basierten `nextPeriodStart` liefern, obwohl `computePersonalCycleView()` noch „nicht genug Daten“ meldet — ohne diese zusätzliche Bedingung hätte die Karte gleichzeitig „Noch keine ausreichenden Daten für eine persönliche Einordnung.“ und eine konkrete Tageszahl gezeigt, was dem Soll-Satz „bei fehlenden Daten erscheint keine Resttage-Zeile“ widersprochen hätte.
  - Keine Änderung an `predictCycle`, `computePersonalCycleView`, `deriveTodayCardText`, Zyklus-, Eisprung-, Fruchtbarkeits- oder PMS-Berechnung, Datenbank, API-Routen, Partneransicht, Authentifizierung oder Routen.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-next-period-countdown.ts` (neu, 8 Prüfungen, alle bestanden): mehrere Tage in der Zukunft, genau 1 Tag, heutiges Datum (→ `null`, nie `0`), vergangenes Datum (→ `null`, nie negativ), `null`-Vorhersage, Monatswechsel, Jahreswechsel, Schaltjahr-Februar — alle kalenderfest über UTC geprüft.
  - `scripts/verify-today-card.ts` erweitert: neue Prüfungen, dass `TodayCard` die reine `daysUntilNextPeriod()`-Funktion nutzt, die Zeile nur bei einem Ergebnis ungleich `null` rendert, Singular/Plural und „voraussichtlich“ im Quelltext vorhanden sind, keine eigene Datums-/Netzwerklogik existiert, sowie ein dedizierter Test für den `no_data`-Grenzfall (eine einzelne Periode ergibt weiterhin `no_data`, die simulierte Resttage-Bedingung liefert dort `null`, obwohl rechnerisch eine Vorhersage vorläge). Der bestehende, nun veraltete Quelltext-Vergleich auf die alte `<TodayCard personalCycleView={personalCycleView} />`-Aufrufsignatur wurde auf die neue, korrekte Übergabe aktualisiert (bewusste Verhaltensänderung, keine stille Fehlerreparatur). Alle Prüfungen (bestehende WP-006-Fälle plus neue WP-015-Fälle) bestehen.
  - `scripts/verify-home-screen-layout.ts`: zwei Assertions auf die neue JSX-Übergabe `<TodayCard personalCycleView={displayedPersonalCycleView} nextPeriodStart={prediction?.nextPeriodStart ?? null} today={todayKey} />` aktualisiert. Alle Prüfungen bestehen weiterhin.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-home-actions-consistent.ts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-manual-pms-ring-marker.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-action-success-toast.ts`.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`), nicht durch WP-015 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten: (1) brandneues Konto ohne Perioden zeigt die bestehende Start-Hilfe („Nur noch ein Schritt“), `TodayCard` erscheint dort erst gar nicht — unverändertes bestehendes Verhalten. (2) Konto mit genau einer gespeicherten Periode (`no_data`-Status): Karte zeigt ausschließlich „Noch keine ausreichenden Daten für eine persönliche Einordnung.“, keine Resttage-Zeile — vor der Korrektur erschien hier fälschlich zusätzlich „Nächste Periode voraussichtlich in 21 Tagen.“, nach der Korrektur korrekt unterdrückt. (3) Konto mit vier echten Perioden im 28-Tage-Rhythmus (persönlicher Status): Karte zeigt in Eigenansicht breit (1280px) und mobil (375px) identisch „Heute: Zyklustag 5“, „Nächste Periode voraussichtlich in 24 Tagen.“, „Kann abweichen“ — korrekte Reihenfolge, Pluralform, Unsicherheitshinweis bleibt erhalten. Kein horizontaler Überlauf mobil. Kalendernavigation und Tagesfenster weiterhin erreichbar. Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** Die zusätzliche `status !== "no_data"`-Bedingung ist im Soll nicht wörtlich benannt (dort wird nur „kein `nextPeriodStart`, heutiges oder vergangenes Datum“ als Ausschlussgrund genannt), aber zur Erfüllung des ausdrücklich geforderten Verhaltens „bei fehlenden Daten erscheint keine Resttage-Zeile“ technisch notwendig, da `predictCycle()` unabhängig von `computePersonalCycleView()`s Status bereits eine Default-Vorhersage liefern kann. Keine neue Berechnung, nur eine zusätzliche Lesebedingung auf einem bereits vorhandenen Feld.
- **offene Punkte:** Owner-Prüfschritt steht aus: `/neu` mit vorhandener Vorhersage öffnen und die zweite Zeile der Heute-Karte mit dem erwarteten Datum im Kalender vergleichen.
- **Commit:** 909c282.

## Soll-Ist-Prüfung – von Codex

Ausstehend.
