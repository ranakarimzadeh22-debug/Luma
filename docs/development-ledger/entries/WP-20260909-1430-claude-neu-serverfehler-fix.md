---
id: WP-20260909-1430-claude-neu-serverfehler-fix
date: 2026-09-09
time: 14:30
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag (Fehlermeldung zu Commit d8de4b8)
commits: pending
---

# Serverfehler auf /neu nach WP-003 Version 4 behoben

## Was wurde gemacht?

Die Online-Seite `/neu` zeigte nach dem letzten Update für angemeldete Konten mit gespeicherten Perioden einen Serverfehler. Die Ursache war ein Programmierfehler beim neuen Tagesfenster: für die leeren, unsichtbaren Kalenderfelder am Monatsanfang wurde versehentlich versucht, ein Datum zu formatieren, das es dort gar nicht gibt. Das ließ die Seite abstürzen, sobald mindestens eine Periode gespeichert war. Der Fehler ist jetzt behoben.

## Warum?

Owner-Meldung: „Die Online-Seite /neu zeigt nach WP-003 Version 4 einen Serverfehler.“

## Prüfung und Stand

Fehler lokal mit einem Produktions-Build (`npm run build` + `next start`) und einem Testkonto mit vier Perioden reproduziert: `RangeError: Invalid time value`. Nach der Korrektur zeigt derselbe lokale Aufbau `/neu` wieder mit `STATUS 200` und korrektem Inhalt. Alle bestehenden gezielten Prüfungen (`verify-day-detail.ts`, `verify-personal-cycle-view.ts`, `verify-my-periods.mts`) erneut ausgeführt und bestanden. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich. Die Datenbankmigration aus Version 3 wurde als Ursache ausgeschlossen (bereits beim vorherigen Deployment erfolgreich angewendet, zusätzlich durch einen gezielten lokalen Test bestätigt).

## Offene Punkte

- Owner sollte nach dem Deployment dieser Korrektur bestätigen, dass `/neu` online wieder fehlerfrei lädt.

## Nächster Schritt

Nach dem Deployment die Seite `/neu` mit einem angemeldeten Konto mit gespeicherten Perioden aufrufen und prüfen, dass sie normal lädt.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `docs/work-packages/WP-003-meine-perioden-bearbeiten.md`
- Tests: lokaler Produktions-Build/-Server mit Testkonto (vorher `RangeError`/500, nachher 200), `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsc --noEmit`, `npm run build`
- Commit oder Referenz: pending
