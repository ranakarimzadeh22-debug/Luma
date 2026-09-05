---
id: WP-20260905-1014-codex-kalender-tagesinfo
date: 2026-09-05
time: 10:14
agent: Codex
status: completed
screens: Heute | Kalender
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-013
commits: pending
---

# Tagesinformation für alle Kalendertage

## Was wurde gemacht?

Jeder Kalendertag reagiert jetzt auf Antippen und öffnet eine kleine Tagesinformation. Gespeicherte Periodentage werden als `Von dir bestätigt` bezeichnet. Persönlich geschätzte Phasen werden vorsichtig als möglicherweise Periode, PMS oder Eisprung beschrieben. Neutrale Tage erhalten keine erfundene Phase. Zukunftstage zeigen ausschließlich Informationen und bleiben technisch von der Eingabe tatsächlicher Perioden getrennt.

## Warum?

Zukünftige Kalendertage waren gesperrt. Dadurch wirkte ein großer Teil des Kalenders wie ein Bild.

## Prüfung und Stand

Gezielter ESLint und TypeScript sind bestanden. Drei neue Interaktionstests für Zukunft, bestätigte Periode und neutralen Tag sind bestanden. Die bestehende Regression für Periodenzeiträume ist bestanden und bestätigt erneut, dass zukünftige Zeiträume serverseitig abgewiesen werden. Der Produktions-Build konnte wegen des in dieser Umgebung blockierten Abrufs der Google-Schrift Geist nicht abgeschlossen werden. Die mobile Browserprüfung erreichte ohne Test-Anmeldung nur den Anmeldebildschirm des geschützten Bereichs.

## Offene Punkte

- Sichtbare Owner-Prüfung nach Anmeldung auf einem Handy steht aus.

## Nächster Schritt

Einen vergangenen, einen zukünftigen und einen neutralen Tag nach Anmeldung unter `/neu` antippen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/lib/calendar-day-info.ts`, `tests/calendar-day-info.test.ts`
- Tests: gezielter ESLint bestanden; `npx tsc --noEmit` bestanden; 3 Tagesinformationstests bestanden; 5 Periodenvalidierungstests bestanden; Build nur durch Google-Fonts-Netzwerksperre blockiert
- Commit oder Referenz: pending
