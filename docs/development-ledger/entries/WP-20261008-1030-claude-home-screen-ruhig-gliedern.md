---
id: WP-20261008-1030-claude-home-screen-ruhig-gliedern
date: 2026-10-08
time: 10:30
agent: Anthropic Claude
status: completed
screens: Zyklus
why_status: confirmed
why_source: Owner-Auftrag
commits: f1584e5
---

# Home-Screen ruhig gliedern (WP-009)

## Was wurde gemacht?

Auf der eigenen Startseite `/neu` sehen die drei bestehenden Hauptbereiche (Heute-Karte, Zyklus-Kreis, Kalender) jetzt einheitlich und ruhig aus: Zyklus-Kreis und Kalender haben dieselbe ruhige Kartenrahmung (Rand, heller Hintergrund, abgerundete Ecken, Schatten) wie die bereits vorhandene Heute-Karte. Reihenfolge, Texte, Buttons, Daten und alle Bedienwege sind unverändert.

## Warum?

Der Owner-Auftrag WP-009 bestätigt: Die drei bestehenden Hauptbereiche sollen visuell als einfacher Ablauf wirken, ohne die Seite voller zu machen, als nächster Schritt nach der ruhigen Gliederung der Einstellungen und der Periodenhistorie.

## Prüfung und Stand

- `npx tsc --noEmit` — fehlerfrei.
- `npx tsx scripts/verify-home-screen-layout.ts` (neu) — gezielte Prüfung der Render-Reihenfolge, unveränderter Hauptkomponenten/Props/Handler und der rein äußeren Layout-Klassen ohne neue sichtbare Inhalte. Alle Prüfungen bestanden.
- `npm run build` — erfolgreich, Routenliste unverändert.
- Live-Prüfung mit temporär installiertem Playwright gegen einen echten lokalen Dev-Server auf 375 px und 1280 px Breite: Reihenfolge erhalten, kein horizontaler Überlauf, Monatsnavigation, Periodenhistorie (öffnen/schließen über Zeilenklick und Escape) und ein Tagesfenster funktionieren weiterhin. Testkonten und temporäre Werkzeuge wurden danach vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-009, Abschnitt „Owner-Pruefort nach Umsetzung“).

## Nächster Schritt

Owner prüft `/neu` und bestätigt Reihenfolge, Abstände, Monatsnavigation, Historie und ein Tagesfenster. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-home-screen-layout.ts` (neu), `docs/work-packages/WP-009-home-screen-ruhig-gliedern.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npx tsx scripts/verify-home-screen-layout.ts`, `npm run build`, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: f1584e5.
