---
id: WP-20261017-1600-claude-mobile-home-verdichten-korrektur-v2
date: 2026-10-17
time: 16:00
agent: Anthropic Claude
status: completed
screens: Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: 95924ef
---

# Mobile Tageszahlen, Heute-Karte, Heute-Datumzeile und Aktionsbuttons zusätzlich verkleinern (WP-016 Korrektur Version 2)

## Was wurde gemacht?

Nach der ersten WP-016-Verdichtung hatte Codex in der Soll-Ist-Prüfung festgestellt, dass die großen Tageszahlen im Kalender mobil noch nicht kleiner geworden waren. Die Ownerin hat zusätzlich klargestellt, dass auch die Heute-Karte, die Zeile „Heute · Wochentag, Datum“ und die drei bestehenden Aktionsbuttons (`Meine Periode aktualisieren`, `Erklärungen zum Kalender anzeigen`, `Zykluslänge ergänzen`) auf dem Handy kleiner werden sollen. Alle vier Bereiche sind jetzt nur unterhalb der bestehenden `sm`-Bildschirmbreite kleiner; ab `sm` und in der Partneransicht bleibt alles wie zuvor. Die Buttons behalten dabei mindestens 40 Pixel Höhe und bleiben gut antippbar.

## Warum?

Owner-Entscheidung vom 2026-10-17, bestätigt nach Codex' Soll-Ist-Prüfung zu WP-016: Die gesamte mobile Schrift soll kleiner werden, damit Heute-Karte, Zyklus-Kreis und Kalender möglichst zusammen sichtbar sind.

## Prüfung und Stand

- `dayClassName` in `NewCycleExample.tsx`: Haupt-Tageszahl jetzt `text-sm sm:text-base` statt durchgehend `text-base`.
- `TodayCard` nochmals verdichtet (Innenabstand `px-3 py-2.5` statt `px-4 py-3` unterhalb `sm`).
- `CalendarTodayLine.tsx` erhält eine neue, rein optionale `compact`-Prop (Default `false`), die nur der Owner-Aufruf setzt; der Partner-Kalender bleibt unverändert.
- Die drei Home-Aktionsbuttons sind mobil `text-xs` statt `text-sm`, mit zusätzlichem `min-h-10`, damit die Klickfläche trotz kleinerer Schrift mindestens 40 Pixel hoch bleibt.
- Neue Testabdeckung: 22 zusätzliche Prüfungen in `scripts/verify-mobile-home-compact.ts` (jetzt 42 insgesamt) für alle vier Bereiche plus unveränderte Partneransicht. Bestehende Regressionen angepasst/erneut ausgeführt, alle grün (bis auf die bereits dokumentierten, vorbestehenden Defekte).
- Live-Prüfung mit temporär installiertem Playwright: gemessene Schriftgrößen mobil 14px (Tageszahl, vorher 16px) und 12px (Heute-Zeile, Resttage, Buttons), Buttons exakt 40px hoch; breite Ansicht und Partneransicht unverändert bei 16px/14px. Kein horizontaler Überlauf, Monatswechsel und Tagesfenster funktionieren.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich.

## Offene Punkte

- Owner-Prüfschritt steht erneut aus (siehe WP-016, Abschnitt „Ist – Korrektur Version 2“).

## Nächster Schritt

Owner prüft `/neu` auf dem Handy erneut. Danach erneute Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/CalendarTodayLine.tsx`, `scripts/verify-mobile-home-compact.ts`, `scripts/verify-home-screen-layout.ts`, `docs/work-packages/WP-016-mobile-home-verdichten.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, Eigen- und Partneransicht).
- Commit oder Referenz: 95924ef.
