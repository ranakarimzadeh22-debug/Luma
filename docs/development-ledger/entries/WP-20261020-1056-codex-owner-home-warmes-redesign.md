---
id: WP-20261020-1056-codex-owner-home-warmes-redesign
date: 2026-10-20
time: 10:56
agent: Codex
status: completed
screens: Owner-Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Owner-Home warm und übersichtlich gestaltet (WP-023)

## Was wurde gemacht?

Die fertige Owner-Startseite `/neu` hat jetzt einen warmen Rosé-/Creme-Hintergrund. Der vorhandene Zyklus-Kreis und die heutige Information stehen gemeinsam oben – Kreis links, Information rechts. Der vertraute Kalender bleibt groß und bedienbar darunter. Es wurden keine neuen Inhalte oder Funktionen ergänzt.

## Warum?

Der Owner-Auftrag WP-023 bestätigt Entwurf A als gewünschte Gestaltung: Die vorhandenen Informationen sollen wärmer, ruhiger und als zusammengehörige Startseite erscheinen.

## Prüfung und Stand

- Neues gezieltes Struktur-/Layoutskript bestanden.
- Bestehende Home-, TodayCard-, Ring-, Kalender-, Popover-, Tagesfenster-, Periodenübersichts- und Mobilnavigationsregressionen bestanden.
- `npx tsc --noEmit` und `npm run build` bestanden.
- Lokale Sichtprüfung mit temporärem Owner-Testkonto bei 360, 390 und 1280 Pixeln bestanden: kein horizontaler Überlauf; Kreis links, TodayCard rechts, Kalender darunter; Monatswechsel, Info-Popover und Tagesfenster funktionieren.
- Partnerdateien sind im Git-Diff unverändert. Die Codex-Browsersteuerung startete wegen eines lokalen Sandboxfehlers nicht; die Sichtprüfung lief deshalb gleichwertig über lokalen Headless Chrome.
- Ein gezielter ESLint-Lauf blieb länger als 60 Sekunden ohne Ausgabe und wurde kontrolliert beendet.

## Offene Punkte

- Owner-Sichtprüfung steht aus.

## Nächster Schritt

Owner öffnet `/neu` auf dem Handy und breit und prüft die neue warme Gruppierung sowie einen Monatswechsel und einen Kalendertag.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/page.tsx`, `src/components/NewCycleExample.tsx`, `scripts/verify-home-screen-layout.ts`, `scripts/verify-owner-home-warm-redesign.ts`, `docs/work-packages/WP-023-owner-home-warmes-redesign.md`, dieser Ledger-Eintrag und die durch `mark-updated` aktualisierte `docs/work-packages/STATE.json`.
- Tests: gezielte Skripte laut WP-023, TypeScript, Produktions-Build, lokale Browser-Sicht- und Interaktionsprüfung.
- Commit oder Referenz: pending.
