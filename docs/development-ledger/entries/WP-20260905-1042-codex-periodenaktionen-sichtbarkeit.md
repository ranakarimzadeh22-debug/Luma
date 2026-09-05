---
id: WP-20260905-1042-codex-periodenaktionen-sichtbarkeit
date: 2026-09-05
time: 10:42
agent: Codex
status: completed
screens: Heute | Kalender
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-015
commits: pending
---

# Periodenaktionen zuverlässig anzeigen

## Was wurde gemacht?

Die Sichtbarkeit der beiden Aktionen `Periode hat begonnen` und `Periode ist beendet` hängt jetzt ausschließlich davon ab, ob das gewählte Datum heute oder früher ist. Vorhergesagte P-, M- und E-Phasen, neutrale Tage und gespeicherte Markierungen beeinflussen die Sichtbarkeit nicht. Zukunftstage bleiben ohne diese Aktionen.

## Warum?

Bei manchen heutigen oder vergangenen Kalendertagen fehlten die Aktionen für Periodenbeginn und Periodenende.

## Prüfung und Stand

Gezielter ESLint und TypeScript sind bestanden. Sechs Tagesinteraktionstests prüfen unter anderem alle Phasenzustände, heute, Vergangenheit und Zukunft. Fünf bestehende Periodenvalidierungstests bestätigen weiterhin die technische Zukunftssperre.

## Offene Punkte

- Keine.

## Nächster Schritt

Die beiden Aktionen unter `/neu` bei unterschiedlich markierten Tagen bis heute sichtbar prüfen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/lib/calendar-day-info.ts`, `tests/calendar-day-info.test.ts`
- Tests: gezielter ESLint bestanden; `npx tsc --noEmit` bestanden; 6 Tagesinteraktionstests bestanden; 5 Periodenvalidierungstests bestanden
- Commit oder Referenz: pending
