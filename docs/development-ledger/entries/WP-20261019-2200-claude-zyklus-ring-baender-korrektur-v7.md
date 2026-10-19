---
id: WP-20261019-2200-claude-zyklus-ring-baender-korrektur-v7
date: 2026-10-19
time: 22:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Fehlernachweis
commits: pending
---

# Korrektur V7: Farbige Ringsegmente und stabile SVG-Ausgabe (WP-022)

## Was wurde gemacht?

Der Zyklus-Kreis zeigt seine Abschnitte jetzt auch auf breiten Bildschirmen klar farbig, in der eigenen Ansicht und in der Partneransicht. Der rote Heute-Punkt bleibt an derselben Stelle. Die Entwicklungs-Warnung beim Laden der Seite ist weg.

## Warum?

Die Ring-Zeichnung steckt zweimal auf der Seite (mobil und breit) und benutzte dieselben internen Namen für Farbverläufe und Schatten. Auf breiten Bildschirmen griff der Kreis auf die versteckte mobile Kopie zu und blieb blass. Die Warnung kam von einer winzigen Rechenabweichung in der letzten Nachkommastelle des Heute-Punkts.

## Prüfung und Stand

Neues Skript `verify-cycle-ring-svg-ids` (eindeutige IDs, richtige Verweise, gerundete Koordinaten) besteht. TypeScript und Build bestehen, die vorhandenen Ring-, Kalender- und Partner-Prüfungen bestehen. `verify-personal-cycle-view` war schon vorher fehlerhaft. Sichtprüfung mit Testkonten bei 390 und 1280 px: Segmente farbig, keine doppelten IDs, keine Hydration-Warnung, kein Überlauf.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/CyclePersonalRing.tsx`, `scripts/verify-cycle-ring-svg-ids.ts`, `scripts/verify-cycle-ring-marker-reverted.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
