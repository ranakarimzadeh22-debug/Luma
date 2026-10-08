---
id: WP-20261008-1130-claude-home-screen-kartenrahmen-entfernt
date: 2026-10-08
time: 11:30
agent: Anthropic Claude
status: completed
screens: Zyklus
why_status: confirmed
why_source: Owner-Auftrag
commits: 4235cd0
---

# Home-Screen: hinzugefügte Kartenrahmen wieder entfernt (WP-009 Version 2)

## Was wurde gemacht?

Die in Version 1 von WP-009 neu hinzugefügte Kartenrahmung (Rand, heller Hintergrund, Rundung, Schatten) um den Zyklus-Kreis und den Kalender wurde auf `/neu` wieder entfernt. Beide Bereiche sind wieder rahmenlos wie vor WP-009, mit denselben ursprünglichen Abständen. Die Heute-Karte, Reihenfolge, Texte und alle Funktionen sind unverändert.

## Warum?

Die Ownerin hat die in Version 1 gemeldete Kartenrahmung ausdrücklich nicht akzeptiert und im Arbeitspaket WP-009 bestätigt: Zyklus-Kreis und Kalender sollen keine zusätzlichen Card-Rahmen, keine Hintergrundfläche, keine neue Rundung und keinen Schatten erhalten.

## Prüfung und Stand

- `npx tsx scripts/verify-home-screen-layout.ts` (angepasst) — prüft gezielt, dass Zyklus- und Kalender-section wieder exakt ihre ursprüngliche, rahmenlose className tragen, dass die Heute-Karte unverändert bleibt und Reihenfolge/Hauptkomponenten/Props/Handler unverändert sind. Alle Prüfungen bestanden.
- `npx tsc --noEmit` — fehlerfrei.
- Kein erneuter Build und keine erneute Browser-Live-Prüfung: laut Version-2-Auftrag für diese reine CSS-Klassen-Entfernung nicht gefordert.

## Offene Punkte

- Owner-Prüfschritt steht aus: `/neu` öffnen und bestätigen, dass Zyklus-Kreis und Kalender wieder ohne Card-Rahmen erscheinen.

## Nächster Schritt

Owner prüft `/neu` und bestätigt die rahmenlose Ansicht. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-home-screen-layout.ts`, `docs/work-packages/WP-009-home-screen-ruhig-gliedern.md`.
- Tests: `npx tsx scripts/verify-home-screen-layout.ts`, `npx tsc --noEmit`.
- Commit oder Referenz: 4235cd0.
