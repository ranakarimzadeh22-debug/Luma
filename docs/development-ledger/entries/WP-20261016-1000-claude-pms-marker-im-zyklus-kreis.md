---
id: WP-20261016-1000-claude-pms-marker-im-zyklus-kreis
date: 2026-10-16
time: 10:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: 0585a2b
---

# Manuellen PMS-Status im Zyklus-Kreis konsistent markieren (WP-014)

## Was wurde gemacht?

Wenn die Nutzerin heute ein PMS-Symptom selbst einträgt, liegt der rote Heute-Punkt im Zyklus-Kreis jetzt sichtbar im PMS-Segment – zuvor blieb er an seiner rein rechnerischen Position, auch wenn Kalender und Status-Text bereits den manuellen PMS-Status zeigten. Betrifft gleichermaßen die eigene Ansicht auf `/neu` und die rein lesende Partneransicht auf `/neu/partner` bei aktiver Verbindung. Ein echter bestätigter oder laufender Periodentag hat weiterhin Vorrang; dort wird der Punkt nie ins PMS-Segment gezwungen.

## Warum?

Owner-Feedback vom 2026-10-16 zu WP-013: Der Kalender zeigte den manuellen PMS-Beginn bereits korrekt, der Punkt im Zyklus-Kreis blieb aber am rechnerischen Zyklustag – das wirkte widersprüchlich.

## Prüfung und Stand

- `src/lib/cycle-ring-geometry.ts`: `buildPersonalRingGeometry` erhält einen neuen, optionalen Parameter `isManualPmsToday`, der nur den bereits berechneten Marker-Winkel auf die Mitte des bereits berechneten PMS-Segments verschiebt – keine neue Berechnung, keine Änderung an Segmenten oder Datumslogik.
- `src/components/CyclePersonalRing.tsx`, `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCycleRing.tsx`: die bestehende, aus `manual-pms.ts` abgeleitete Information wird nur durchgereicht, keine zweite Quelle der Wahrheit.
- Neues `scripts/verify-manual-pms-ring-marker.ts` (13 Prüfungen) deckt genau die drei geforderten Fälle ab: ohne manuelles PMS unverändert, mit manuellem PMS im Segment, echter Periodentag hat Vorrang. Alle bestanden.
- Bestehende PMS-, Ring-, Kalender-, Perioden- und Partnerregressionen erneut ausgeführt und grün (eine Ausnahme: bereits mehrfach dokumentierter, vorbestehender Defekt in `tests/calendar-day-info.test.ts`, nicht durch dieses Paket verursacht).
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich.
- Live-Prüfung mit temporär installiertem Playwright auf 375 px und 1280 px: Nach einer heutigen Symptommarkierung lag der Marker exakt auf der Position des „PMS“-Textlabels (gemessene Distanz 0,0) in Eigen- und Partneransicht, kein horizontaler Überlauf, Partneransicht weiterhin ohne jede Eingabemöglichkeit. Testkonten vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-014, Abschnitt „ein Prüfschritt für den Owner").

## Nächster Schritt

Owner prüft `/neu` und `/neu/partner` wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/lib/cycle-ring-geometry.ts`, `src/components/CyclePersonalRing.tsx`, `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCycleRing.tsx`, `scripts/verify-manual-pms-ring-marker.ts` (neu), `scripts/verify-home-screen-layout.ts`, `docs/work-packages/WP-014-pms-marker-im-zyklus-kreis.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: 0585a2b.
