---
id: WP-20260908-1200-claude-laufende-periode
date: 2026-09-08
time: 12:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003 Version 3
commits: pending
---

# Laufende Periode kann sofort erfasst werden, auch ohne bekanntes Ende

## Was wurde gemacht?

Wenn deine Periode heute oder gestern beginnt, kannst du das jetzt sofort speichern, auch wenn du das echte Ende noch nicht kennst. Du darfst optional ein erwartetes Ende angeben; es wird als „läuft noch“ bzw. „voraussichtlich … (kann abweichen)“ angezeigt und nie als bestätigte Tatsache behandelt. Sobald du später das echte Ende ergänzt, verschwindet die vorläufige Kennzeichnung.

## Warum?

Owner-Nachschärfung WP-003 Version 3: Bei einer laufenden Periode kennt man das tatsächliche Ende noch nicht, trotzdem soll Luma schon den echten Beginn kennen können.

## Prüfung und Stand

Neue Migration nur für `luma_core` lokal angewendet (`end_date` nullable, neues `expected_end_date`). `scripts/verify-personal-cycle-view.ts` und `scripts/verify-my-periods.mts` um Version-3-Fälle erweitert, insgesamt alle Prüfungen bestanden. `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich (34 Routen). `node scripts/verify-luma-core.mjs` bestätigt weiterhin getrennte Datenbanken. Mobile Sichtprüfung wurde für diese Version nicht durchgeführt (siehe Owner-Vorgabe zur schnellen Testtiefe); Owner-Prüfschritt steht aus.

## Offene Punkte

- Owner-Prüfschritt für Version 3 steht aus.
- Ein bereits vor dieser Version bestehender, unabhängiger Testdefekt (`tests/calendar-day-info.test.ts` referenziert eine nicht existierende Funktion `applyPeriodDayAction`) wurde entdeckt, aber nicht behoben, da außerhalb dieses Auftrags.

## Nächster Schritt

Eine laufende Periode ohne Ende eintragen, prüfen dass sie als „Laufend“ erscheint, optional ein erwartetes Ende ergänzen und später das echte Ende nachtragen.

## Technische Nachweise

- Betroffene Dateien: `database/luma-core/migrations/202609081200_period_running.sql`, `src/lib/new-period-validation.ts`, `src/lib/new-periods.ts`, `src/app/api/neu/periods/route.ts`, `src/app/api/neu/periods/[id]/route.ts`, `src/lib/new-cycle-prediction.ts`, `src/lib/personal-cycle-view.ts`, `src/lib/calendar-day-info.ts`, `src/components/NewCycleExample.tsx`, `scripts/verify-personal-cycle-view.ts`, `scripts/verify-my-periods.mts`, `tests/calendar-day-info.test.ts`, `docs/work-packages/WP-003-meine-perioden-bearbeiten.md`
- Tests: `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsc --noEmit`, `npm run build`, `node scripts/apply-luma-core-migrations.mjs`, `node scripts/verify-luma-core.mjs`
- Commit oder Referenz: pending
