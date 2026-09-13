---
id: WP-20260913-2000-claude-tatsaechliche-tage-korrigieren-schaetzung
date: 2026-09-13
time: 20:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003 Version 8
commits: pending
---

# Tatsächliche Periodentage korrigieren jetzt eine Schätzung

## Was wurde gemacht?

Ein Tipp auf einen Kalendertag öffnet jetzt immer ein kleines Fenster mit passenden Aktionen: `Periode begonnen` für einen neuen tatsächlichen Beginn, `Periode beendet` für das echte Ende einer laufenden Periode, und – nur am ersten oder letzten gespeicherten Tag – `Periodentag löschen`. Eine Schätzung von Luma blockiert diese echten Angaben nie mehr. Wird ein echtes Ende gespeichert, verschwindet ein zuvor gezeigtes erwartetes Ende sofort. Ein Tag mitten in einer Periode lässt sich nicht einzeln löschen; Luma erklärt das kurz. Besteht eine Periode nur aus einem einzigen Tag, fragt Luma vor dem Löschen ausdrücklich noch einmal nach, weil damit der ganze Eintrag verschwindet.

## Warum?

Owner-Auftrag WP-003 Version 8: Eine vorhergesagte Periode kann früher oder später enden als geschätzt; die Nutzerin muss ihren tatsächlichen Verlauf direkt im Kalender korrigieren können, ohne dass die Schätzung sie daran hindert.

## Prüfung und Stand

Der bisherige zweistufige Weg zum Nachtragen einer ganzen vergangenen Periode (erst Starttag, dann Endtag antippen) wurde durch den neuen, einheitlichen Tagesfenster-Weg ersetzt – nach Rücksprache, da beide Wege sonst nebeneinander verwirrend gewesen wären. Ein vollständiger vergangener Zeitraum bleibt weiterhin erfassbar, jetzt in zwei getrennten Tagesfenster-Schritten. Neue `tests/period-day-actions.test.ts` (11 Prüfungen) und `scripts/verify-period-day-actions.mts` (17 Prüfungen gegen die echte Datenbank) bestätigen: welche Aktion an welchem Tag erscheint, wird ausschließlich aus den eigenen gespeicherten Daten abgeleitet, nie geraten; ein fremdes Konto kann nichts ändern oder löschen; das exakte Beispiel aus dem Auftrag (laufende Periode mit erwartetem Ende heute, dann echtes Ende gestern) wurde zusätzlich über einen echten lokalen Server nachgestellt und funktioniert wie beschrieben. Mobile Sichtprüfung (Playwright temporär installiert, danach entfernt) bestätigt alle drei Tagesfenster-Zustände ohne horizontalen Überlauf. Bestehende Regressionen erneut grün, `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich.

Ein bereits bestehender, unabhängiger Prüfdefekt wurde dabei entdeckt, aber nicht durch dieses Paket verursacht: `scripts/verify-personal-cycle-view.ts` sucht Farbverlauf-Quelltext noch in der alten Datei, obwohl dieser Teil im vorherigen Paket WP-004 Version 6 in eine eigene Komponente ausgelagert wurde. Die eigentlichen Berechnungsprüfungen in diesem Skript bestehen weiterhin.

## Offene Punkte

- Owner-Prüfschritt steht aus: neutralen Tag antippen und Beginn speichern, laufenden Tag antippen und Ende speichern, Rand-Tag löschen mit Bestätigung, mittleren Tag antippen und Erklärung sehen.
- Der bereits bekannte Testdefekt in `tests/calendar-day-info.test.ts` besteht unverändert fort.
- Der neu entdeckte, aber vorbestehende Quelltext-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` (Gradient-Suche zeigt auf die falsche Datei) sollte in einem eigenen Paket behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die drei neuen Tagesfenster-Zustände im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/lib/period-day-actions.ts` (neu), `src/components/NewCycleExample.tsx`, `scripts/verify-day-detail.ts` (aktualisierte Quelltextprüfung).
- Tests: `node --experimental-strip-types tests/period-day-actions.test.ts`, `npx tsx scripts/verify-period-day-actions.mts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `node --experimental-strip-types tests/new-cycle-prediction.test.ts`, `npx tsc --noEmit`, `npm run build`, end-to-end mit echtem lokalem Dev-Server und echten HTTP-Anfragen, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt).
- Commit oder Referenz: pending
