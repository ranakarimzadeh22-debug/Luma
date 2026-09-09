---
id: WP-20260909-1200-claude-periodentag-fenster
date: 2026-09-09
time: 12:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003 Version 4
commits: pending
---

# Periodentag im Kalender antippen zeigt ein Tagesfenster

## Was wurde gemacht?

Tippst du im Kalender auf einen echten Periodentag (bestätigt oder laufend), öffnet sich ein kleines Fenster mit Wochentag, vollständigem Datum und dem Periodentag, zum Beispiel „Mittwoch, 9. September 2026 – 3. Periodentag“. Der restliche Home-Screen wird dabei abgedunkelt und ist nicht bedienbar, bis du das Fenster schließt. Geschätzte, geplante oder neutrale Tage zeigen keinen erfundenen Periodentag.

## Warum?

Owner-Nachschärfung WP-003 Version 4: Die Nutzerin konnte bei einem einzelnen Kalendertag nicht direkt erkennen, der wievielte Tag ihrer Periode er ist.

## Prüfung und Stand

Neues `scripts/verify-day-detail.ts` mit 13 Prüfungen (Periodentag-Zählung inkl. Monats-/Jahresgrenze, welche Tagesstatus das Fenster öffnen, Quelltext-Absicherung für Klickbarkeit/Dialog-Semantik/inert/Escape) – alle bestanden. Bestehende Prüfungen für Version 3 erneut grün (keine Regression). `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich (34 Routen). Mobile Sichtprüfung mit Playwright wurde für diese Version nicht durchgeführt (gemäß Owner-Vorgabe zur schnellen Testtiefe); Owner-Prüfschritt steht aus.

## Offene Punkte

- Owner-Prüfschritt für Version 4 steht aus.
- Ein bereits vor WP-003 Version 3 bestehender, unabhängiger Testdefekt (`tests/calendar-day-info.test.ts` referenziert eine nicht existierende Funktion `applyPeriodDayAction`) besteht weiterhin fort und wurde nicht behoben (außerhalb dieses Auftrags).

## Nächster Schritt

Im Kalender einen bestätigten Periodentag antippen, Wochentag/Datum/Periodentag prüfen, mit Escape und dem Schließen-Button schließen und danach prüfen, dass der Kalender wieder normal bedienbar ist.

## Technische Nachweise

- Betroffene Dateien: `src/lib/calendar-day-info.ts`, `src/components/NewCycleExample.tsx`, `scripts/verify-day-detail.ts`, `docs/work-packages/WP-003-meine-perioden-bearbeiten.md`
- Tests: `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsc --noEmit`, `npm run build`
- Commit oder Referenz: pending
