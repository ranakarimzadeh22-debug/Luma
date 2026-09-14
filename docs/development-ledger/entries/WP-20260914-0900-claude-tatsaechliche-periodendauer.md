---
id: WP-20260914-0900-claude-tatsaechliche-periodendauer
date: 2026-09-14
time: 09:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003 Version 9
commits: pending
---

# Tatsächliche Periodendauer sichtbar gemacht

## Was wurde gemacht?

Nach einem echten Beginn und einem echten Ende zeigt Luma jetzt klar, wie viele Tage diese Periode tatsächlich gedauert hat. Im kleinen Tagesfenster steht bei einem abgeschlossenen Zeitraum zum Beispiel „5. Periodentag von 5 Tagen“ statt nur der Tagesnummer. In der Periodenhistorie erscheint zusätzlich zur bisherigen Zykluslänge „Dauer: N Tage“, klar getrennt mit einem Punkt. Start- und Endtag werden dabei mitgezählt. Solange eine Periode noch läuft und kein echtes Ende gespeichert ist, zeigt Luma keine erfundene Dauer.

## Warum?

Owner-Auftrag WP-003 Version 9: Beginn und Ende sind bereits speicherbar, aber die tatsächliche Länge einer einzelnen Periode war bisher nicht direkt sichtbar.

## Prüfung und Stand

Neue reine Funktion `actualPeriodDurationDays` (in `src/lib/calendar-day-info.ts`) berechnet die inklusive Tagesanzahl zeitzonenfest aus Start- und Enddatum. `PeriodHistoryRow` trägt jetzt zusätzlich `durationDays`, das ausschließlich bei einem echten `endDate` gesetzt wird; ein `expectedEndDate` oder eine laufende Periode liefern bewusst `null`. `scripts/verify-day-detail.ts` und `scripts/verify-period-history.ts` wurden um gezielte Prüfungen ergänzt (u. a. Monats- und Jahresgrenze, laufender Eintrag ohne Dauer) und bestehen vollständig. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich, keine neue Route. Regressionsskripte (`verify-period-day-actions.mts`, `verify-history-month-jump.ts`) weiterhin grün. Mobile Sichtprüfung mit temporär installiertem Playwright (375×812) gegen den lokalen Dev-Server bestätigt beide Anzeigeorte mit echten Testdaten (01.–05.08. = 5 Tage, 25.–27.08. = 3 Tage) ohne horizontalen Überlauf; Playwright und Testkonto danach vollständig entfernt.

`scripts/verify-historical-entry.ts` zeigt weiterhin denselben Fehlschlag bei 6 Quelltext-Prüfungen, der bereits seit WP-003 Version 8 besteht (der dort beschriebene zweistufige Erfassungsweg wurde ersetzt, das Skript prüft noch den alten Weg) – per `git stash` gegen den unveränderten Stand vor dieser Version bestätigt, dass Version 9 daran nichts geändert hat.

## Offene Punkte

- Owner-Prüfschritt steht aus: abgeschlossenen Zeitraum im Tagesfenster öffnen und „N. Periodentag von M Tagen“ prüfen; Periodenhistorie öffnen und „Dauer: N Tage“ zusätzlich zur Zykluslänge prüfen; laufende Periode ohne echtes Ende prüfen (keine erfundene Dauer); nach einer Endkorrektur die aktualisierte Dauer prüfen.
- Die bereits bekannten, vorbestehenden Testdefekte in `tests/calendar-day-info.test.ts`, `scripts/verify-personal-cycle-view.ts` und `scripts/verify-historical-entry.ts` bestehen unverändert fort und sollten in eigenen Paketen behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet Tagesfenster und Periodenhistorie im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/lib/calendar-day-info.ts`, `src/lib/period-history.ts`, `src/components/NewCycleExample.tsx`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`.
- Tests: `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-period-day-actions.mts`, `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-historical-entry.ts` (bekannter vorbestehender Fehlschlag, unverändert), `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server.
- Commit oder Referenz: pending
