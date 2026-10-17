---
id: WP-20261017-0900-claude-resttage-bis-zur-naechsten-periode
date: 2026-10-17
time: 09:00
agent: Anthropic Claude
status: completed
screens: Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: 909c282
---

# Resttage bis zur nächsten geschätzten Periode in der Heute-Karte anzeigen (WP-015)

## Was wurde gemacht?

Die bestehende Heute-Karte auf `/neu` zeigt jetzt, sofern eine Vorhersage und ausreichend persönliche Daten vorliegen, eine zweite Zeile: „Nächste Periode voraussichtlich in X Tagen.“ (bei genau einem Tag: „in 1 Tag.“). So muss die Nutzerin die Tage nicht mehr selbst im Kalender zählen. Ohne sichere Vorhersage oder ohne ausreichende persönliche Daten erscheint keine Zahl.

## Warum?

Owner-Wunsch vom 2026-10-14, zur Umsetzung bestätigt am 2026-10-17 (Akte APP-IDEA-020): Die erwartete Restzeit soll auf einen Blick sichtbar sein, statt im Kalender gezählt werden zu müssen.

## Prüfung und Stand

- Neues, eng begrenztes reines Modul `src/lib/next-period-countdown.ts`: `daysUntilNextPeriod(today, nextPeriodStart)` liefert die positive Kalendertagedifferenz oder `null`, kalenderfest über UTC, keine zweite Vorhersage.
- `TodayCard` in `NewCycleExample.tsx` erweitert um die neue Zeile, zusätzlich abgesichert gegen den Grenzfall, dass eine rechnerische Default-Vorhersage vorliegt, obwohl der persönliche Status noch „nicht genug Daten“ ist (sonst hätte die Karte widersprüchlich beides gleichzeitig gezeigt).
- Neues Testskript `scripts/verify-next-period-countdown.ts` (8 Prüfungen: Zukunft, 1 Tag, heute, Vergangenheit, null, Monats-/Jahreswechsel, Schaltjahr) sowie Erweiterung von `scripts/verify-today-card.ts` um gezielte WP-015-Fälle. Bestehende Home-Layout-, Zyklus-, Kalender-, Start-Hilfe- und Partnerregressionen erneut grün.
- Live-Prüfung mit temporär installiertem Playwright: ohne Daten keine Zeile (Start-Hilfe unverändert), bei nur einer Periode (`no_data`) korrekt keine Zeile trotz vorhandener Default-Vorhersage, bei vier echten Perioden korrekte Zeile in Eigenansicht breit und mobil, kein horizontaler Überlauf.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt, nicht durch dieses Paket verursacht.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-015, Abschnitt „ein Prüfschritt für den Owner“).

## Nächster Schritt

Owner prüft `/neu` wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/lib/next-period-countdown.ts` (neu), `src/components/NewCycleExample.tsx`, `scripts/verify-next-period-countdown.ts` (neu), `scripts/verify-today-card.ts`, `scripts/verify-home-screen-layout.ts`, `docs/work-packages/WP-015-resttage-bis-zur-naechsten-periode.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: 909c282.
