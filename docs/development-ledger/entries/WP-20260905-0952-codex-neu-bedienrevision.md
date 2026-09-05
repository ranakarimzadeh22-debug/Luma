---
id: WP-20260905-0952-codex-neu-bedienrevision
date: 2026-09-05
time: 09:52
agent: Codex
status: completed
screens: Heute | Kalender
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-012
commits: pending
---

# Bedienrevision für den neuen Home-Screen

## Was wurde gemacht?

Vergangene und heutige Kalendertage sehen jetzt klar antippbar aus, während zukünftige Tage weiterhin gesperrt bleiben. Gespeicherte Perioden sind beim Öffnen der Seite eingeklappt und lassen sich über einen kleinen Schalter öffnen. Die kleinen Erklärungen für P, M und E öffnen und schließen sich mit normalem Antippen.

## Warum?

Der Kalender wirkte wie ein Bild, die offene Periodenhistorie machte den Home-Screen zu voll und P, M und E reagierten auf dem Handy erst nach langem Gedrückthalten.

## Prüfung und Stand

Gezielter ESLint und TypeScript sind bestanden. Der Produktions-Build erreichte die Next.js-Kompilierung, konnte aber wegen des in dieser Umgebung blockierten Abrufs der Google-Schrift Geist nicht abgeschlossen werden. Die vorhandenen Perioden- und Kalendertests konnten wegen eines Speichermangels der lokalen Node-Laufzeit vor dem eigentlichen Teststart nicht ausgeführt werden. Die mobile Browserprüfung erreichte den geschützten Bereich ohne Test-Anmeldung nicht; die Zustände und zugänglichen Schalter wurden deshalb zusätzlich gezielt im Quellcode geprüft.

## Offene Punkte

- Sichtbare Owner-Prüfung nach Anmeldung auf einem Handy steht aus.

## Nächster Schritt

Die drei Bedienänderungen nach Anmeldung unter `/neu` auf einem Handy prüfen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`
- Tests: gezielter ESLint bestanden; `npx tsc --noEmit` bestanden; Build durch blockierten Google-Fonts-Abruf begrenzt; Regressionstests durch `uv_os_get_passwd`/`ENOMEM` blockiert; mobile Ansicht durch Anmeldeschutz begrenzt
- Commit oder Referenz: pending
