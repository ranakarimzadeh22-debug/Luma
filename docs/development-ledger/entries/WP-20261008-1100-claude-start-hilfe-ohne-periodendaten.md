---
id: WP-20261008-1100-claude-start-hilfe-ohne-periodendaten
date: 2026-10-08
time: 11:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-007 Version 3
commits: pending
---

# Start-Hilfe für neue Nutzerinnen ohne Periodendaten

## Was wurde gemacht?

Wenn für ein Konto noch kein echter Periodenbeginn gespeichert ist, zeigt der Home-Screen jetzt oberhalb des Kalenders eine kurze, ruhige Hilfe: „Noch keine Periodendaten. Wähle im Kalender den ersten Tag deiner Periode, um zu beginnen.“ Sobald ein erster echter Periodenbeginn gespeichert ist, verschwindet die Karte von selbst, ohne dass die Nutzerin etwas einstellen muss. Die Hilfe ist reine Erklärung, kein Button, keine neue Funktion.

## Warum?

Owner-Auftrag WP-007 Version 3: Neue Nutzerinnen brauchen beim ersten Öffnen einen klaren nächsten Schritt, ohne dass die App durch leere Vorhersagen oder viele Erklärungen verwirrt.

## Prüfung und Stand

Die Karte nutzt ausschließlich den bereits vorhandenen, serverseitig geladenen Perioden-Zustand (keine neue Abfrage) und erscheint gezielt nur, wenn wirklich kein einziger echter Periodeneintrag existiert – nicht bei dem weiter gefassten „noch nicht genug Daten für eine Vorhersage“-Zustand, der auch bei bereits vorhandenen Perioden zutreffen kann. Ein neues gezieltes Prüfskript bestätigt den exakten Text, die korrekte Bindung, die Platzierung vor dem Kalender und das Fehlen der Hilfe in Partneransicht und alter Luma. Bestehende Kalender-, Zyklus- und Partner-Regressionen bleiben grün; `npx tsc --noEmit` und `npm run build` fehlerfrei, keine neue Route. Mobile und breite Sichtprüfung mit drei echten Testkonten bestätigt: Die Hilfe erscheint bei einem Konto ohne Perioden, verschwindet sofort nach der ersten gespeicherten Periode, erscheint nie bei einer laufenden Periode und nie in der Partneransicht – selbst wenn das verbundene Konto der Eigentümerin ebenfalls keine Perioden hat. Der Kalender bleibt währenddessen vollständig bedienbar, kein horizontaler Überlauf.

Zwei bereits aus früheren Sitzungen bekannte, vorbestehende Testdefekte bestehen unverändert fort und wurden durch dieses Paket nicht verursacht.

## Offene Punkte

- Owner-Prüfschritt steht aus: Home-Screen mit einem frischen Konto ohne Periodendaten öffnen, Start-Hilfe prüfen, ersten Periodenbeginn speichern und das Verschwinden der Hilfe bestätigen; mobil auf fehlenden horizontalen Überlauf prüfen.
- Die beiden bereits bekannten, vorbestehenden Testdefekte sollten weiterhin in eigenen Paketen behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die Start-Hilfe mit einem neuen Konto im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-start-help-no-data.ts` (neu).
- Tests: `npx tsx scripts/verify-start-help-no-data.ts`, `npx tsx scripts/verify-calendar-legend-collapsible.ts`, `npx tsx scripts/verify-partner-calendar-legend-collapsible.ts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-partner-fixed-view.ts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-period-day-actions.mts`, `node --experimental-strip-types --test tests/new-cycle-prediction.test.ts tests/cycle-fertility.test.ts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit drei Testkonten, mobil und breit.
- Commit oder Referenz: pending
