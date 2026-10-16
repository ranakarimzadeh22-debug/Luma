---
id: WP-20261016-1100-claude-pms-marker-im-zyklus-kreis-korrektur
date: 2026-10-16
time: 11:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: 6bfe934
---

# Manuellen PMS-Marker im Zyklus-Kreis neben statt auf der Beschriftung platzieren (WP-014 Korrektur)

## Was wurde gemacht?

Der rote Heute-Punkt lag bei manuellem PMS zwar schon im richtigen PMS-Bereich des Zyklus-Kreises, aber exakt auf dem Wort „PMS“ und überdeckte es. Jetzt liegt der Punkt weiterhin sichtbar innerhalb des PMS-Bereichs, aber deutlich daneben, sodass der Text vollständig lesbar bleibt. Betrifft gleichermaßen die eigene Ansicht auf `/neu` und die rein lesende Partneransicht auf `/neu/partner`.

## Warum?

Owner-Auftrag vom 2026-10-16, der sich mit der Nachschärfung aus Codex' Soll-Ist-Prüfung zu WP-014 deckt: Der Marker darf das „PMS“-Textlabel nicht überdecken.

## Prüfung und Stand

- `src/lib/cycle-ring-geometry.ts`: neue Funktion `manualPmsMarkerAngle` platziert den übersteuerten Marker-Winkel innerhalb der PMS-Segmentspanne, aber mit Mindestabstand zur Segmentmitte (dort sitzt das Textlabel). Keine Änderung an Segmenten, Daten- oder Zyklusberechnung.
- `scripts/verify-manual-pms-ring-marker.ts` angepasst: prüft jetzt, dass der Marker innerhalb des Segments bleibt, nicht mehr exakt der Label-Mitte entspricht, und mindestens 20px Pixelabstand zum Label hat (gemessen: 26,1px). Alle 15 Prüfungen bestanden.
- Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten: Eigenansicht breit (1280px), Eigenansicht mobil (375px) und Partneransicht breit zeigen jeweils denselben, konsistenten Abstand von 26,1px zwischen Punkt und „PMS“-Text. Kein horizontaler Überlauf. Partneransicht weiterhin ohne jede Eingabemöglichkeit. Testkonten, Playwright und temporäre Skripte vollständig entfernt.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. Alle bestehenden PMS-, Ring-, Kalender-, Perioden- und Partnerregressionen erneut grün (eine Ausnahme: bereits mehrfach dokumentierter, vorbestehender Defekt in `tests/calendar-day-info.test.ts`, nicht durch dieses Paket verursacht).

## Offene Punkte

- Owner-Prüfschritt steht erneut aus (siehe WP-014, Abschnitt „Korrektur Version 2“).

## Nächster Schritt

Owner prüft `/neu` und `/neu/partner` erneut wie im Prüfschritt beschrieben. Danach erneute Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/lib/cycle-ring-geometry.ts`, `scripts/verify-manual-pms-ring-marker.ts`, `docs/work-packages/WP-014-pms-marker-im-zyklus-kreis.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle `scripts/verify-*`-Regressionen für PMS/Ring/Kalender/Perioden/Partner, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: 6bfe934.
