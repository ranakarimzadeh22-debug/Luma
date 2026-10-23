---
id: WP-030
title: "Periodenuebersicht ruhig und warm gestalten"
status: review
created: 2026-10-23
updated: 2026-10-23
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Home /neu, Periodenuebersicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Periodenuebersicht ruhig und warm gestalten

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Die vorhandene `Periodenuebersicht` wird schöner und leichter lesbar; sie bleibt dieselbe Übersicht mit denselben Daten.
- **Wo ist sie?** Auf `/neu` den Monatsnamen im Kalender antippen.
- **Sichtbare Änderung:** Jede vergangene Periode erscheint als ruhige, abgerundete Karte. Monat/Jahr, Zeitraum, Dauer und Zyklus stehen klar getrennt in der Karte.
- **Stil:** Heller Hintergrund, weiße Karten, sehr zarter Rosé-Akzent und gut lesbare dunkle Schrift – passend zum ruhigen Kalenderdesign.
- **Was bleibt gleich?** `Meine Periode aktualisieren`, Monats-Sprung, Schließen, Escape sowie Eintragen, Ändern und Löschen bleiben unverändert.
- **Nicht enthalten:** Keine neue Seite, kein Diagramm, keine neue Zahl oder Berechnung, keine Änderungen an Kalender, PMS, Vorhersage, Partneransicht, Datenbank oder API.

## Entstehungsweg

`Owner sieht bestehende Periodenuebersicht → Inhalt mit Daten ist vorhanden, wirkt aber wie eine einfache Liste → gleiche Daten sollen ruhiger und schöner lesbar sein → Karten-Design innerhalb desselben Dialogs → WP-030`

- bestätigtes Problem: Die bestehende Übersicht zeigt die benötigten Daten, wirkt aber nicht so ruhig und schön wie der restliche Kalender.
- bestätigte Wirkung: Vergangene Perioden lassen sich auf dem Handy schneller überblicken, ohne die Home-Ansicht zu füllen.
- gewählte Lösung: Nur das Layout der vorhandenen Übersicht wird in ein warmes, kartenbasiertes Design überführt.
- wichtige Grenze: Die Übersicht bleibt ein Dialog; sie wird weder eine neue Navigation noch eine Analyse- oder Diagrammseite.
- Quellen/Akten: Owner-Entscheidung 2026-10-23, APP-IDEA-028, WP-019, Design-Mockup vom 2026-10-23.

## Soll – von Codex

- Die bestehende `Periodenuebersicht` behält Titel, den vorhandenen Button `Meine Periode aktualisieren` und alle bestehenden Historieneinträge.
- Jeder vorhandene Historieneintrag wird als klar getrennte, abgerundete Karte dargestellt: Monat/Jahr als deutlicher Titel, darunter der bereits vorhandene Zeitraum sowie Dauer und Zyklus als gut lesbare Angaben.
- Die Karten erhalten einen sehr zurückhaltenden warmen Rosé-Akzent. Die Darstellung bleibt hell, ruhig und in der Farbwelt des aktuellen Kalender-Redesigns; Tages- und Kalenderphasenfarben werden nicht verändert.
- Ein Tipp auf eine Karte springt weiterhin in den entsprechenden Kalendermonat und schließt den Dialog wie bisher.
- Mobil ist jede Karte vollständig lesbar und ohne seitliches Scrollen bedienbar; die breite Ansicht bleibt ebenso ruhig und nicht übermäßig groß.

## Abnahmekriterien

1. Monatsname im Kalender öffnet weiterhin die bestehende `Periodenuebersicht`.
2. Bestehende Perioden erscheinen als einzelne ruhige Karten, nicht als unstrukturierte Textzeilen.
3. Karten zeigen nur bereits vorhandene Informationen: Monat/Jahr, Zeitraum, Dauer und Zyklus.
4. `Meine Periode aktualisieren`, Karten-Tipp zum Monatssprung, Escape und Schließen funktionieren unverändert.
5. Eintragen, Ändern und bestätigtes Löschen funktionieren über die bisherigen Dialoge unverändert.
6. Keine neue Route, kein Diagramm, keine neue Berechnung und kein horizontaler Überlauf auf Mobil oder Desktop.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage

- `src/components/NewCycleExample.tsx` enthält den bestehenden Dialog `PeriodHistoryModal`, der über den Monatsnamen im Kalender geöffnet wird.
- Seit WP-019 trägt der Dialog sichtbar den Titel `Periodenuebersicht`, zeigt oben den bestehenden Button `Meine Periode aktualisieren` und darunter die vorhandenen Historienzeilen.
- Jede Historienzeile enthält bereits Monat/Jahr, Zeitraum, Dauer und Zyklus. Der bestehende Callback `onSelectMonth` führt den Monatssprung aus.
- Der bestehende Callback `onOpenMyPeriods` schließt zuerst die Übersicht und öffnet danach unverändert `Meine Perioden`.

### Technisches Ziel

- Gestalte ausschließlich die Darstellung der vorhandenen Historienzeilen im bestehenden `PeriodHistoryModal` um: aus der aktuellen Zeile wird eine per Tastatur und Klick vollständig bedienbare, abgerundete Karte.
- Verwende ausschließlich die bereits in jeder Zeile vorliegenden Anzeigewerte. Keine neue Ableitung, Datenabfrage oder Berechnung.
- Verwende helle Karten, dezente Rosé-Akzente, klare Typografie, ausreichende Kontraste und sichtbaren Fokuszustand.
- Behalte Reihenfolge, Monats-Sprung und Dialogzustände unverändert.

### Invarianten

- Keine Änderung an Periodendaten, API, Datenbank, Migration, Anmeldung, Berechnung, Vorhersage, PMS, Zyklus-Kreis, Kalender oder Partneransicht.
- Keine neue Route, Navigation, Diagramm-, Statistik- oder Profilfunktion.
- Keine neuen Texte oder Fakten in den Karten; ausschließlich vorhandene Monat/Jahr-, Zeitraum-, Dauer- und Zykluswerte.
- `Meine Periode aktualisieren`, Escape, Schließen, Tagesfenster und alle bestehenden Speicher-, Änderungs- und Löschwege bleiben unverändert.

### Pflichtprüfungen

- Gezielte Prüfung: Dialog und alle vier vorhandenen Angaben pro Historieneintrag bleiben vorhanden; Karten sind klickbar und lösen weiter den bestehenden Monats-Sprung aus.
- Bestehende Prüfungen für Periodenhistorie, Monatssprung, `Meine Periode aktualisieren`, Ändern, bestätigtes Löschen und Tagesfenster.
- TypeScript und Produktions-Build.
- Sichtprüfung auf 360–390px und 1280px: Karten lesbar, kein horizontaler Überlauf; Dialog öffnen/schließen, Karten-Tipp und Periodenverwaltung funktionieren.

### Stoppbedingungen

- Stoppe vor jeder Änderung an Daten, Berechnungen, API, Datenbank, Migration, Kalenderphasen, Partneransicht oder bestehenden Verwaltungsabläufen.
- Stoppe, wenn das Karten-Design nicht ohne neue Daten oder Berechnungen umsetzbar ist.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-030` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein Deployment auslösen.

## Ist – von Claude

- umgesetzt:
  - `src/components/NewCycleExample.tsx`, `PeriodHistoryModal` (nur Darstellung/Klassen):
    - Dialog: warmer heller Hintergrund (`#fffaf8`) mit zartem Rosé-Rand, größere Rundung, weicher Schatten, Titel etwas größer; ab `sm` etwas breiter (`sm:max-w-md`), mobil unverändert `max-w-sm`.
    - Jede Historienzeile ist eine helle, abgerundete Karte (weiß, zarter Rosé-Rand, leichter Schatten) mit dezentem Rosé-Akzentstreifen links (dekorativ, `aria-hidden`); Monat/Jahr bleibt der deutliche Titel, darunter der Zeitraum, „Dauer“ und „Zyklus“ stehen als zwei klar getrennte, zart rosé hinterlegte Angaben nebeneinander (umbrechen mobil). Fokuszustand (`focus-visible`) und Hover bleiben sichtbar.
  - Unverändert: Texte und Werte der Karten (Monat/Jahr, Zeitraum inkl. „läuft noch“, Dauer, Zyklus inkl. „Noch nicht bekannt“), Reihenfolge, `aria-label`, Callbacks (`onSelectMonth`, `onOpenMyPeriods`, `onClose`), Escape, Leerzustand, „Meine Periode aktualisieren“, Schließen-Button, Verwaltungsdialoge (Ändern, Löschen, Eintragen), Daten, Berechnung, API, Datenbank, Kalender, PMS, Vorhersage, Zyklus-Kreis, Partneransicht. Keine neue Route, Abfrage, Berechnung, Statistik oder Diagramm.
- nicht umgesetzt: nichts offen.
- Tests:
  - Neues Skript `scripts/verify-period-history-cards-wp030.ts` (bestanden): Karte ist ein Button mit unverändertem Callback und `aria-label`, abgerundet/hell/Rosé-Akzent, Fokuszustand, alle vier Angaben unverändert, nur vorhandene Felder, kein Diagramm/keine Statistik/Berechnung/Abfrage, Dialogverhalten (Titel, Button oberhalb der Liste, Escape, Schließen, Reihenfolge, Leerzustand, keine starre Breite).
  - Bestehende Prüfungen: `verify-period-history`, `verify-history-month-jump`, `verify-day-detail` bestehen. `verify-period-history-layout` und `verify-period-history-overview` waren vorher fehlerhaft, weil sie das Ende des Dialog-Quelltexts über die seit WP-023 entfernte Funktion `TodayCard` suchten; der Endanker wurde auf `export default function NewCycleExample(` umgestellt (reine Prüf-Infrastruktur), danach bestehen beide. `verify-historical-entry.ts` schlägt wie schon vor WP-030 fehl (unabhängig, nicht verändert). `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; 360, 390 und 1280 px; fünf Perioden, davon eine laufende): Dialog vollständig im Viewport, fünf Karten ohne seitlichen Überlauf, „Meine Periode aktualisieren“ vorhanden; Escape schließt, Tipp auf eine Karte springt in den Monat (Oktober → August) und schließt den Dialog, Enter auf fokussierter Karte funktioniert, „Meine Periode aktualisieren“ schließt die Übersicht und öffnet „Meine Perioden“, „Ändern“ öffnet das Formular „Periode ändern“. Das bestätigte Löschen wurde nicht ausgelöst (Code unverändert, vorhandene Prüfskripte bestehen). Testkonten entfernt, Playwright entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine.
- offene Punkte: `verify-historical-entry.ts` bleibt vorbestehend fehlerhaft. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`feat(wp-030)`).

## Soll-Ist-Prüfung – von Codex

_Ausstehend._
