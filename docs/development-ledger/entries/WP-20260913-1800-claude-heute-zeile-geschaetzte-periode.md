---
id: WP-20260913-1800-claude-heute-zeile-geschaetzte-periode
date: 2026-09-13
time: 18:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 8
commits: pending
---

# Heute-Zeile, roter Marker und geschätzte nächste Periode im Kalender

## Was wurde gemacht?

Über dem eigenen Kalender und dem Partnerkalender steht jetzt „Heute · [Wochentag], [Datum]“, und der heutige Tag ist im Kalender zusätzlich mit einem deutlichen roten Punkt markiert – auch wenn er gleichzeitig ein bestätigter Periodentag ist. Im eigenen Kalender sind bestätigte/laufende Tage, das voraussichtliche Ende einer laufenden Periode und die nächste geschätzte Periode jetzt durch Text und Farbe klar unterscheidbar. Der Partner sieht ebenfalls Heute und die bestätigten Tage; die nächste geschätzte Periode sieht er nur, wenn die Zyklus-Kreis-Freigabe eingeschaltet ist – schaltet die Nutzerin sie aus, verschwindet die Schätzung beim nächsten Laden sofort wieder.

## Warum?

Owner-Auftrag WP-004 Version 8: Die aktuelle Periode, der heutige Tag und die nächste geschätzte Periode waren in beiden Ansichten noch nicht gleich klar erkennbar.

## Prüfung und Stand

Ein wichtiger technischer Fund dabei: Die bisherige „heute“-Berechnung nutzte an mehreren Stellen die Server-Systemzeit statt ausdrücklich Europe/Berlin – im Produktions-Container (ohne gesetzte Zeitzone) läuft das auf UTC, was rund um Mitternacht in Berlin zu einem falschen Kalendertag hätte führen können. Ein neuer, zeitzonenfester Helfer wird jetzt überall einheitlich verwendet. Neue `tests/new-cycle-prediction.test.ts` (5 Prüfungen) und `scripts/verify-cycle-today-and-estimate.mts` (6 Prüfungen) bestätigen die korrekte Berlin-Tagesgrenze. Neue `scripts/verify-partner-estimated-period.mts` (9 Prüfungen) bestätigt: ohne Freigabe erscheint die Schätzung nachweislich nie, mit Freigabe stimmt sie exakt mit der bestehenden Berechnung überein, verschwindet sofort beim Ausschalten, bleibt zwischen zwei Paaren getrennt und wird durch einen Widerruf ebenfalls gesperrt. End-to-end über einen echten lokalen Server und mobile Sichtprüfung (Playwright temporär installiert, danach entfernt) bestätigen das sichtbare Verhalten in beiden Ansichten ohne horizontalen Überlauf. Bestehende Partner-, Perioden- und Zyklus-Regressionen erneut grün, `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich. Alle Testkonten danach gelöscht.

## Offene Punkte

- Owner-Prüfschritt im Browser steht aus.
- Der bereits bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` besteht unverändert fort (nicht durch diese Version verursacht).
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner prüft im Browser Heute-Zeile, roten Punkt und die drei unterscheidbaren Kalenderzustände in beiden Ansichten.

## Technische Nachweise

- Betroffene Dateien: `src/lib/berlin-date.ts` (neu), `src/components/CalendarTodayLine.tsx` (neu), `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `src/lib/new-cycle-prediction.ts`, `src/lib/new-partner-calendar.ts`, `src/lib/new-partner-cycle-view.ts`, `src/app/neu/page.tsx`, `src/app/neu/partner/page.tsx`.
- Tests: `node --experimental-strip-types tests/new-cycle-prediction.test.ts`, `npx tsx scripts/verify-cycle-today-and-estimate.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-partner-notification-preference.mts`, `node scripts/verify-luma-core.mjs`, `npx tsc --noEmit`, `npm run build`, end-to-end mit echtem lokalem Dev-Server, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt).
- Commit oder Referenz: pending
