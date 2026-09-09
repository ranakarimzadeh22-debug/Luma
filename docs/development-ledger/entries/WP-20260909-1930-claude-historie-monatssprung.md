---
id: WP-20260909-1930-claude-historie-monatssprung
date: 2026-09-09
time: 19:30
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003 Version 7
commits: pending
---

# Aus der Periodenhistorie direkt zum passenden Monat springen

## Was wurde gemacht?

In der Periodenhistorie ist jede Monatszeile jetzt ein Button. Ein Tipp darauf schließt die Historie und zeigt sofort genau diesen Monat im Kalender – ohne dass mehrere Monate einzeln zurückgeblättert werden müssen. Es werden dabei keine Periodendaten verändert.

## Warum?

Owner-Nachschärfung WP-003 Version 7: Aus der Historie musste bisher weiterhin mühsam Monat für Monat zurückgeblättert werden.

## Prüfung und Stand

Neues `scripts/verify-history-month-jump.ts` (8 Prüfungen: Jahres-/Monatsgrenze korrekt aufgelöst, Startmonat bei über Monatsgrenzen laufenden Perioden als Ziel, Historie schließt nach Auswahl, kein Netzwerkaufruf, Button-Semantik, bestehende Pfeil-Navigation unverändert) bestanden. Bestehende Prüfungen für Version 3–6 erneut grün. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich.

## Offene Punkte

- Owner-Prüfschritt für Version 7 steht aus.
- Der bereits aus Version 3–6 bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort.

## Nächster Schritt

Die Periodenhistorie öffnen, auf einen vergangenen Monat tippen und prüfen, dass genau dieser Monat im Kalender erscheint und die Historie geschlossen ist.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-history-month-jump.ts`, `scripts/verify-period-history.ts`, `docs/work-packages/WP-003-meine-perioden-bearbeiten.md`
- Tests: `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-historical-entry.ts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsc --noEmit`, `npm run build`
- Commit oder Referenz: pending
