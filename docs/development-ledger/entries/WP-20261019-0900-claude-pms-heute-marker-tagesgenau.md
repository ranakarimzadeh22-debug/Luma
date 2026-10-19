---
id: WP-20261019-0900-claude-pms-heute-marker-tagesgenau
date: 2026-10-19
time: 09:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: 47ccb0c
---

# Manuellen PMS-Heutemarker tagesgenau im Zyklus-Kreis zeigen (WP-020)

## Was wurde gemacht?

Der rote Heute-Punkt im Zyklus-Kreis zeigt bei selbst eingetragenem PMS jetzt wieder denselben Kalendertag wie der rote Punkt im Kalender. Bisher wurde er absichtlich in Richtung Mitte des rosa PMS-Balkens verschoben, damit er nicht auf dem „PMS“-Schriftzug landet — das führte aber dazu, dass er am ersten PMS-Tag wie ein Punkt mitten im Balken statt an dessen Anfang wirkte. Jetzt bleibt der Punkt immer tagesgenau; falls er dadurch zu nah an die Beschriftung rückt, weicht stattdessen die Beschriftung innerhalb desselben Balkens aus. Betrifft gleichermaßen die eigene Ansicht und die rein lesende Partneransicht.

## Warum?

Bestätigtes Owner-Feedback vom 2026-10-18 zu WP-014: Kalender und Zyklus-Kreis sollen für den roten Heute-Punkt immer denselben Tag zeigen.

## Prüfung und Stand

- `buildPersonalRingGeometry` in `cycle-ring-geometry.ts` berechnet `todayAngle` jetzt in jedem Fall tagesgenau aus dem echten `today`-Parameter — die bisherige Ersatzberechnung bei aktivem manuellem PMS-Override wurde entfernt.
- Eine neue Funktion `pmsLabelAngleAvoidingMarker` verschiebt bei Kollisionsgefahr ausschließlich die Position des „PMS“-Textlabels innerhalb des bestehenden Segments, niemals den Marker selbst.
- `scripts/verify-manual-pms-ring-marker.ts` grundlegend überarbeitet (25 Prüfungen): erster PMS-Tag liegt exakt am Segmentbeginn, ein späterer PMS-Tag bleibt tagesgenau unabhängig vom Segmentbeginn, kein Override bleibt unverändert, echte Periodentage haben weiterhin Vorrang, Eigen- und Partneransicht liefern identische Ergebnisse.
- Live-Prüfung mit temporär installiertem Playwright: am ersten PMS-Tag liegt der Marker praktisch deckungsgleich (0,006px Abstand) mit dem Segmentbeginn; an einem späteren PMS-Tag bleibt der Marker an derselben absoluten Position wie zuvor, während sich nur der (bereits unveränderte) Segmentbeginn verschiebt; keine Kollision mit dem Label; kein horizontaler Überlauf mobil/breit; Partneransicht zeigt identische Koordinaten, weiterhin ohne Eingabemöglichkeit.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-020, Abschnitt „ein Prüfschritt für den Owner“).

## Nächster Schritt

Owner prüft `/neu` und `/neu/partner` wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/lib/cycle-ring-geometry.ts`, `scripts/verify-manual-pms-ring-marker.ts`, `docs/work-packages/WP-020-pms-heute-marker-tagesgenau.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, Eigen- und Partneransicht, erster und späterer PMS-Tag).
- Commit oder Referenz: 47ccb0c.
