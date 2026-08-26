---
id: WP-20260826-1555-codex-app-auswahl
date: 2026-08-26
time: 15:55
agent: Codex App-Coder
status: completed
screens: Startseite | Neue App
why_status: confirmed
why_source: Owner-Auftrag und HANDOFF-003 vom 2026-08-26
commits: pending
---

# Auswahl zwischen alter und neuer App

## Was wurde gemacht?

Die Startseite zeigt jetzt nur zwei klare Auswahlmöglichkeiten. `Alte App` öffnet die bestehende Anmeldung. `Neue App` öffnet eine neue Seite, die zunächst nur `Hello World` zeigt.

## Warum?

Der Owner möchte beim Öffnen der Domain sofort bewusst zwischen dem bisherigen App-Weg und dem neuen Entwicklungsweg wählen können.

## Prüfung und Stand

Die Linkziele wurden im Quellcode geprüft. Die relevanten Next.js-16-Hinweise zu Seiten, verschachtelten Routen und `Link` wurden vor der Änderung gelesen. Lint und der Next.js-Build wurden für den geänderten Stand ausgeführt.

## Offene Punkte

- Die neue Anmeldung, Registrierung und Verbindung zur neuen Datenbank gehören nicht zu diesem Arbeitspaket.

## Nächster Schritt

Die Auswahl auf der Domain öffnen und beide Wege sichtbar prüfen.

## Technische Nachweise

- Betroffene Dateien: `src/app/page.tsx`, `src/app/neu/page.tsx`
- Tests: Linkziele, ESLint, Next.js-Build und Ledger-Validierung
- Commit oder Referenz: pending
