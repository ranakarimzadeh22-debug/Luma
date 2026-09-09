---
id: WP-20260909-1600-claude-vergangene-periode-kalender
date: 2026-09-09
time: 16:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003 Version 5
commits: pending
---

# Vergangene Periode kann direkt im Kalender erfasst werden

## Was wurde gemacht?

Im sichtbaren Kalender kann jetzt ein vergangener, noch nicht belegter Tag angetippt werden. Ein kleines Fenster fragt zuerst nach dem Start der Periode, danach nach dem Ende – ohne dass ein zweiter Kalender geöffnet werden muss. Am Ende zeigt Luma eine Zusammenfassung; erst „Prüfen und speichern“ übernimmt den Zeitraum dauerhaft. „Abbrechen“ ändert an jeder Stelle keine Daten.

## Warum?

Owner-Nachschärfung WP-003 Version 5: Der bisherige getrennte Eingabeweg verlangte zusätzliche Schritte, obwohl der passende Monat im Home-Kalender bereits sichtbar war.

## Prüfung und Stand

Neues `scripts/verify-historical-entry.ts` (10 Prüfungen) sowie angepasstes `scripts/verify-day-detail.ts`, beide bestanden. Bestehende Prüfungen für Version 3/4 erneut grün (keine Regression). `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich. Zusätzlich end-to-end mit temporär installiertem Playwright gegen einen lokalen Produktions-Build geprüft: Start wählen, Ende wählen, Review, Speichern (per Datenbankprüfung bestätigt) sowie Abbrechen an zwei Stellen (keine Datenänderung). Playwright und das Testkonto wurden danach vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt für Version 5 steht aus.
- Der bereits aus Version 3/4 bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort.

## Nächster Schritt

In einem vergangenen Monat einen neutralen Tag als Start wählen, einen späteren Tag als Ende wählen, die Zusammenfassung prüfen und speichern; danach Neuladen und erneutes Anmelden prüfen. Zusätzlich Abbrechen an beiden Stellen ausprobieren.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-historical-entry.ts`, `scripts/verify-day-detail.ts`, `docs/work-packages/WP-003-meine-perioden-bearbeiten.md`
- Tests: `npx tsx scripts/verify-historical-entry.ts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-End-to-End-Prüfung (installiert und danach vollständig entfernt)
- Commit oder Referenz: pending
