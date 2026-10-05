---
id: WP-20261005-1500-claude-sichere-zyklusvorhersagen
date: 2026-10-05
time: 15:00
agent: Anthropic Claude
status: completed
screens: Startseite | Zyklus | Partner | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-007
commits: pending
---

# Sichere, persönliche Zyklusvorhersagen mit Eisprung, fruchtbarem Zeitfenster und Unsicherheitshinweis

## Was wurde gemacht?

Der mögliche Eisprung ist jetzt immer genau ein vorhergesagter Tag (ungefähr 14 Tage vor der erwarteten nächsten Periode), nicht mehr ein unklares Mehrtage-Fenster. Das fruchtbare Zeitfenster (fünf Tage davor bis einschließlich diesem Tag) ist im Kalender jetzt als kleine, zusätzliche Kennzeichnung sichtbar – auch wenn es sich mit einer tatsächlichen oder vorhergesagten Periode überschneidet: Die Periode bleibt dabei immer die Hauptfarbe, das fruchtbare Fenster erscheint zusätzlich als kleiner Punkt, ohne etwas zu verdecken. Bei stark schwankenden echten Zyklusabständen zeigt Luma jetzt zusätzlich „Vorhersage unsicher - Kann abweichen“ statt einer scheinbar sicheren Angabe. PMS bleibt ohne eigene Symptomdaten weiterhin vorsichtig als „Mögliche PMS-Phase“ gekennzeichnet.

## Warum?

Owner-Auftrag WP-007: Die bestehende Vorhersage sollte mit echten Periodendaten persönlicher werden, ohne biologische Sicherheit vorzutäuschen – mit bestätigten Regeln für Eisprung, fruchtbares Zeitfenster, Überlappungen und Unsicherheit vom 2026-10-05.

## Prüfung und Stand

Drei bisher unabhängige, teils fehlerhafte Berechnungen (Kalender-Vorhersage, Heute-Karte/Zyklus-Kreis-Text, Ring-Geometrie) wurden auf ein neues gemeinsames, reines Modul zusammengeführt. Dabei wurde ein bestehender Rechenfehler behoben: Das fruchtbare Zeitfenster endete bisher fälschlich einen Tag nach dem Eisprungtag statt an ihm selbst, und der Eisprung wurde an zwei Stellen als Drei-Tage-Fenster statt als einzelner Tag behandelt. 22 neue bzw. erweiterte automatisierte Tests decken Eisprungberechnung, fruchtbares Fenster, Trennung von Zykluslänge und Periodendauer, echte Überlappungsfälle und die neue, reproduzierbare Unsicherheitsregel (Spanne der echten Zyklusabstände über 10 Tage) ab. Bestehende Zyklus-, Kalender-, Perioden- und Partner-Regressionen bleiben grün; `npx tsc --noEmit` und `npm run build` fehlerfrei, keine neue Route.

Beim Bau der Browser-Sichtprüfung wurde noch während der Umsetzung ein eigener Darstellungsfehler entdeckt und korrigiert: Die erste Fassung hätte den zusätzlichen Fruchtbarkeits-Punkt ausgerechnet am wichtigsten Überlappungstag (Periode und Eisprung gleichzeitig) nicht gezeigt. Nach der Korrektur bestätigt eine mobile und eine breite Sichtprüfung mit konstruierten, echten Testdaten einen tatsächlichen Überlappungstag, an dem Periode und fruchtbares Zeitfenster gleichzeitig sichtbar sind, ohne dass eine Kennzeichnung die andere verdeckt.

Zwei bereits aus früheren Sitzungen bekannte, vorbestehende Testdefekte (ein fehlender Testfunktionsname, eine veraltete Quelltext-Fundstelle für Farbverläufe) bestehen unverändert fort und wurden nicht durch dieses Paket verursacht.

## Offene Punkte

- Owner-Prüfschritt steht aus: Kalendermonat mit vorhergesagter Periode und fruchtbarem Zeitfenster ansehen, Überlappungsfall und Legende prüfen, bei stark schwankender Zyklushistorie den Unsicherheitshinweis prüfen, mobil auf fehlenden horizontalen Überlauf prüfen.
- Die beiden bereits bekannten, vorbestehenden Testdefekte sollten weiterhin in eigenen Paketen behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die neue Kalenderdarstellung und den Unsicherheitshinweis im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/lib/cycle-fertility.ts` (neu), `src/lib/new-cycle-prediction.ts`, `src/lib/personal-cycle-view.ts`, `src/lib/cycle-ring-geometry.ts`, `src/components/CyclePersonalRing.tsx`, `src/components/NewCycleExample.tsx`, `tests/cycle-fertility.test.ts` (neu), `tests/new-cycle-prediction.test.ts`, `scripts/verify-personal-cycle-view.ts`.
- Tests: `node --experimental-strip-types --test tests/cycle-fertility.test.ts tests/new-cycle-prediction.test.ts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-cycle-today-and-estimate.mts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-partner-view-no-status-card.ts`, `npx tsx scripts/verify-period-day-actions.mts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit einem Testkonto, mobil und breit.
- Commit oder Referenz: pending
