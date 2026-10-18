---
id: WP-019
title: "Periodenaktion aus Home in Periodenuebersicht verlegen"
package_revision: 1
status: review
created: 2026-10-18
updated: 2026-10-18
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home /neu, Periodenuebersicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Periodenaktion aus Home in Periodenuebersicht verlegen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der grosse Button `Meine Periode aktualisieren` verschwindet nur von der Home-Ansicht.
- **Wo finde ich ihn danach?** Tippe wie bisher auf den Monatsnamen im Kalender. Dort oeffnet sich die bestehende `Periodenuebersicht`; dort liegt der Button.
- **Was kann ich dort tun?** Genau wie bisher Perioden eintragen, bestehende Eintraege aendern oder bewusst loeschen.
- **Was bleibt gleich?** Kalender, Tagesfenster, Vorhersagen, PMS, Historienzeilen und Partneransicht bleiben unveraendert.
- **Nicht enthalten:** Keine neue untere Navigation, keine neue Route, kein Diagramm und keine Einstellung.

## Entstehungsweg

`Grosser Button unter dem Home-Kalender wirkt zu praesent → Home soll ruhiger bleiben → vorhandene Periodenhistorie ist der passende Verwaltungsort → Aktion dorthin verlegen → WP-019`

- bestaetigtes Problem: Die Ownerin moechte den grossen Aktualisieren-Button nicht dauerhaft unter dem Kalender sehen.
- bestaetigte Wirkung: Die Home-Ansicht wirkt ruhiger; die Periodenverwaltung bleibt in einem passenden, bereits erreichbaren Bereich.
- gewaehlte Loesung: Der vorhandene, ueber den Monatsnamen erreichbare Dialog heisst sichtbar `Periodenuebersicht` und enthaelt den bestehenden Einstieg zur Periodenverwaltung.
- wichtige Grenze: Eine spaetere Diagrammansicht gehoert nicht zu diesem Paket.
- Quelle: APP-IDEA-028, Owner-Entscheidung vom 2026-10-18.

## Soll – von Codex

- Entferne ausschliesslich den grossen sichtbaren Button `Meine Periode aktualisieren` unter dem Kalender auf `/neu`.
- Die bestehende, vom Monatsnamen geoeffnete `Periodenhistorie` bleibt derselbe Dialog, heisst sichtbar jedoch `Periodenuebersicht`.
- In dieser `Periodenuebersicht` erscheint ein klarer Button `Meine Periode aktualisieren`. Er oeffnet exakt den bereits vorhandenen Verwaltungsdialog `Meine Perioden` ueber den bestehenden lokalen Weg.
- Vor dem Oeffnen der Verwaltung schliesst die `Periodenuebersicht`, damit niemals zwei Dialoge gleichzeitig geoeffnet sind. Escape, Schliessen und eine Historienzeile zum Monatssprung funktionieren wie bisher.
- Die vorhandenen Historienzeilen bleiben unveraendert: Monat/Jahr, Zeitraum, Dauer und Zyklus; ein Zeilentipp springt weiterhin in den passenden Kalendermonat.
- Nicht enthalten: Neue Navigation, neue Route, Diagramm, API, Datenbank, Migration, Datenzugriff, Eingabearten, Vorhersage, PMS, Zyklus-Kreis, Partneransicht oder Aenderung der bestehenden Speicher-, Aenderungs- und Loeschlogik.

## Abnahmekriterien

1. Unter dem Home-Kalender ist kein grosser `Meine Periode aktualisieren`-Button mehr sichtbar.
2. Der Monatsname oeffnet weiterhin die `Periodenuebersicht`.
3. Dort oeffnet `Meine Periode aktualisieren` den bisherigen Dialog `Meine Perioden`; keine zwei Dialoge liegen gleichzeitig uebereinander.
4. Perioden eintragen, aendern und bestaetigt loeschen funktionieren ueber die vorhandenen Wege unveraendert.
5. Eine Historienzeile springt weiterhin zum betreffenden Monat; Escape und Schliessen bleiben funktionsfaehig.
6. Mobil und breit: kein horizontaler Ueberlauf, keine verdeckte Aktion oder unbedienbare Dialogfolge.

## Technischer Auftrag für Claude

### Bestaetigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` enthaelt den einzigen grossen Home-Button `Meine Periode aktualisieren` mit `onClick={openMyPeriods}` direkt unter dem Kalender.
- Dieselbe Komponente verwaltet `isPeriodHistoryOpen` und rendert `PeriodHistoryModal` mit `rows`, `onClose` und `onSelectMonth`.
- `PeriodHistoryModal` ist der vorhandene Dialog mit `role="dialog"`, Escape-Handler, Historienzeilen und Schliessen-Button.
- `openMyPeriods()` setzt ausschliesslich den vorhandenen lokalen State `isMyPeriodsModalOpen(true)` fuer den bestehenden Verwaltungsdialog. `MyPeriodsModal`, `PeriodFormModal`, Tagesfenster und bestaetigte Loeschwege bestehen bereits.

### Technisches Ziel

- Entferne den Home-Button samt nur dafuer bestehendem umgebenden Layout unter dem Kalender.
- Erweitere `PeriodHistoryModal` minimal um einen Callback fuer die vorhandene Periodenverwaltung. Zeige den sichtbaren Titel `Periodenuebersicht` und den bestehenden Aktionsnamen `Meine Periode aktualisieren` an einer ohne Scrollen auffindbaren Stelle im Dialog.
- Der neue Callback schliesst zuerst `isPeriodHistoryOpen` und ruft danach ausschliesslich den vorhandenen `openMyPeriods()`-Weg auf. Keine neue Modal- oder Formularlogik.
- Behalte die bestehende Historienliste, ihren Monats-Sprung und ihre Tastaturbedienung unveraendert.

### Invarianten – muessen unveraendert bleiben

- Bestehende Schreibwege, API-Routen, Datenbanktabellen, Sitzung, Kontotrennung, Validierung, Ueberschneidungspruefung, Pruefen-vor-Speichern und Loeschbestaetigung bleiben unveraendert.
- Keine neue Route, keine Migration, keine neue Datenabfrage und keine neue Berechnung.
- Kalender, Tagesfenster, Monatswechsel, Vorhersage, Unsicherheit, PMS, Zyklus-Kreis, Partneransicht und mobile Partneransicht bleiben unveraendert.
- Die Periodenuebersicht enthaelt keine neue Datenart und zeigt weiterhin nur das eigene Konto.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- API-Wirkung: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Gezielte Pruefung: kein Home-Button; `Periodenuebersicht` oeffnet ueber Monatsnamen; ihre Aktion oeffnet den vorhandenen `Meine Perioden`-Dialog; kein doppelter Dialogzustand.
- Bestehende Historienzeilen, Monatssprung, Escape, Schliessen, neue Periode, Aendern und bestaetigtes Loeschen pruefen.
- TypeScript, Produktions-Build sowie bestehende Perioden-, Historien-, Tagesfenster- und Home-Regressionen ausfuehren.
- Sichtpruefung auf 375 x 812 und 1280 x 900: Home ruhig ohne grossen Button; Verwaltungsaktion im Uebersichts-Dialog auffindbar; kein horizontaler Ueberlauf.

### Stoppbedingungen

- Stoppe vor jeder Aenderung an Daten, API, Datenbank, Migration, Berechnung, Tagesfenster-Aktionen, Loeschbestaetigung, Partneransicht oder Navigation.
- Stoppe, wenn der bestehende Verwaltungsdialog nicht ohne zwei gleichzeitig offene Dialoge erreichbar gemacht werden kann.
- Stoppe, wenn die Historienzeilen oder der Monats-Sprung dadurch ihre vorhandene Funktion verlieren.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-019` und `node scripts/work-package-state.mjs validate` ausfuehren.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - `src/components/NewCycleExample.tsx`: Der große Button `Meine Periode aktualisieren` (`onClick={openMyPeriods}`) samt seines nur dafür bestehenden `<div className="flex justify-center">`-Wrappers unter dem Kalendergrid wurde vollständig entfernt. Danach folgt direkt wieder der unveränderte Unsicherheitshinweis (`prediction?.isUncertain`).
  - `PeriodHistoryModal`: sichtbarer Titel `<h2 id="period-history-title">` geändert von `Periodenhistorie` auf `Periodenübersicht` (die `id` und damit `aria-labelledby` am Dialog-Wrapper blieben unverändert). Neue Pflicht-Prop `onOpenMyPeriods: () => void`. Direkt nach dem Titel, **vor** der scrollbaren Historienliste (`overflow-y-auto`), steht ein neuer Button `Meine Periode aktualisieren` mit `onClick={onOpenMyPeriods}` — dieselbe visuelle Gestaltung (gefüllter `#6d153f`-Button) wie zuvor der Home-Button, jetzt an einer ohne Scrollen auffindbaren Stelle im Dialog.
  - Aufrufstelle von `PeriodHistoryModal`: `onOpenMyPeriods={() => { setIsPeriodHistoryOpen(false); openMyPeriods(); }}` — schließt zuerst explizit die Periodenübersicht, ruft erst danach den bereits vorhandenen, unveränderten `openMyPeriods()`-Weg auf (der ausschließlich `setIsMyPeriodsModalOpen(true)` setzt). Dadurch ist niemals mehr als ein Dialog gleichzeitig geöffnet — live mit Playwright verifiziert (`dialogCount: 1` nach dem Klick).
  - Historienliste, Monatssprung (`onSelectMonth`/`jumpToHistoryMonth`), Escape-Handler und Schließen-Button in `PeriodHistoryModal` wurden nicht verändert.
  - `openMyPeriods()`, `MyPeriodsModal`, `PeriodFormModal`, Tagesfenster, Löschbestätigung, API-Routen, Datenbank, Berechnung, Vorhersage, PMS, Zyklus-Kreis, Partneransicht und mobile Partneransicht wurden nicht angefasst.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-period-history-overview.ts` (neu, 20 Prüfungen, alle bestanden): kein `Meine Periode aktualisieren`-Button mehr zwischen Kalendergrid und Unsicherheitshinweis; `openMyPeriods` wird dort nicht mehr direkt aufgerufen; `PeriodHistoryModal` zeigt sichtbar `Periodenübersicht` (alter Titel `Periodenhistorie` nicht mehr vorhanden); der neue Button steht im Quelltext zwischen Titel und scrollbarer Liste; `onOpenMyPeriods` ist als Prop vorhanden und wird vom neuen Button aufgerufen; die Aufrufstelle schließt nachweislich zuerst `isPeriodHistoryOpen`, bevor `openMyPeriods()` aufgerufen wird, ohne neuen direkten Modal-State-Zugriff; `openMyPeriods()` selbst bleibt unverändert; Historienzeilen, Monatssprung, Escape und Schließen-Button bleiben vorhanden; keine neue API-Route, `computePeriodHistory` bleibt unverändert eingebunden.
  - Bestehende Regressionen angepasst, wo sie bewusst überholte Annahmen prüften (jeweils die Entfernung des Home-Buttons korrekt nachvollzogen, keine stille Abschwächung): `scripts/verify-calendar-legend-collapsible.ts` (ein WP-018-Lagenachweis, der sich auf den jetzt verlegten Button bezog, wird jetzt gegen das Kalendergrid geführt), `scripts/verify-home-actions-consistent.ts` (die frühere "drei Home-Aktionen"-Prüfung wurde durch eine WP-019-Prüfung ersetzt, dass der Button zwischen Kalendergrid und Unsicherheitshinweis nicht mehr vorkommt), `scripts/verify-home-screen-layout.ts` (der generische Textverlust-Check prüft jetzt den weiterhin vorhandenen Info-Button-`aria-label` statt des verlegten Buttons), `scripts/verify-mobile-home-compact.ts` (die Mindesthöhen-/Schriftgrößenprüfung bezieht sich jetzt nur noch auf den einen verbliebenen Home-Pill-Button `Zykluslänge ergänzen`). Alle vier Skripte bestehen vollständig.
  - Weitere ausgeführte Regressionen, alle bestanden: `scripts/verify-period-history.ts`, `scripts/verify-period-history-layout.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-mobile-partner-compact.ts`, `scripts/verify-partner-calendar-legend-collapsible.ts`, `scripts/verify-next-period-countdown.ts`, `scripts/verify-manual-pms-ring-marker.ts`. `scripts/verify-today-card.ts` (2 Fehlschläge) und `scripts/verify-action-success-toast.ts` (14 Fehlschläge) zeigen ausschließlich die bereits mehrfach dokumentierten, vorbestehenden Testskript-Defekte — per `git stash` auf dem unveränderten `main`-Stand (vor jeder WP-019-Änderung) erneut bestätigt, nicht durch WP-019 verursacht.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, nicht durch WP-019 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten: Mobil (375×812): kein horizontaler Überlauf; kein `Meine Periode aktualisieren`-Button mehr sichtbar auf `/neu`; Antippen des Monatsnamens öffnet die „Periodenübersicht“ mit vollständigen, unveränderten Historienzeilen und dem neuen Aktionsbutton direkt unter dem Titel; Antippen von „Meine Periode aktualisieren“ öffnet „Meine Perioden“ und schließt dabei die Periodenübersicht — gemessen genau 1 offener Dialog (`role="dialog"`) im DOM nach dem Klick, nie zwei gleichzeitig. Zusätzlicher Workflow-Test (1280×900): „Ändern“ einer bestehenden Periode öffnet das vorhandene Bearbeitungsformular unverändert; eine Historienzeile („Juni 2026“) springt aus der Periodenübersicht heraus weiterhin korrekt in den passenden Kalendermonat. Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** keine fachliche Abweichung vom Soll. Für den neuen Button in der Periodenübersicht wurde dieselbe, bereits bestehende primäre Button-Gestaltung (`bg-[#6d153f]`, `text-white`) wie zuvor beim Home-Button übernommen, mit fester `text-sm`-Schrift statt der mobilen `text-xs sm:text-sm`-Verdichtung aus WP-016 — da dieser Dialog (wie `MyPeriodsModal`, `PeriodFormModal` und die anderen bestehenden Modals) nicht Teil der WP-016/017-Mobilverdichtung der Home-Ansicht ist und auch vorher keine eigene mobile Schriftverdichtung besaß.
- **offene Punkte:** Owner-Prüfschritt steht aus: `/neu` öffnen und prüfen, dass unter dem Kalender kein großer Button mehr sichtbar ist; den Monatsnamen antippen, die „Periodenübersicht“ und ihren Button prüfen; eine Periode eintragen, ändern und bestätigt löschen; eine Historienzeile antippen und den Monatssprung prüfen.
- **Commit:** 6f7982c.

## Soll-Ist-Prüfung – von Codex

Ausstehend.
