---
id: WP-20261005-2000-claude-kalender-erklaerungen-einklappbar
date: 2026-10-05
time: 20:00
agent: Anthropic Claude
status: completed
screens: Startseite | Zyklus | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-007 Version 2
commits: pending
---

# Kalender-Erklärungen jetzt einklappbar, Home-Screen ruhiger

## Was wurde gemacht?

Unter dem Home-Kalender steht jetzt nur noch ein kleiner Button „Erklärungen zum Kalender anzeigen“. Die ausführliche Legende (Bestätigt/Laufend, voraussichtliches Ende, geschätzte nächste Periode, mögliches fruchtbares Zeitfenster sowie die P/M/E-Erklärungen) ist beim Laden geschlossen und öffnet sich erst nach Antippen. Der Hinweis „Vorhersage unsicher - Kann abweichen“ bleibt davon unabhängig immer sichtbar, wenn er zutrifft – er wird nie versteckt.

## Warum?

Owner-Auftrag WP-007 Version 2: Die neue, vollständige Kalenderlegende nahm auf dem Home-Screen viel Platz ein; die Erklärungen sollten erhalten bleiben, aber der erste Blick auf die Startseite sollte ruhiger wirken.

## Prüfung und Stand

Die vorhandenen Legendentexte und die bestehende P/M/E-Einzelinteraktion wurden unverändert in einen neuen, zugänglichen Ein-/Ausklappbereich verschoben (`aria-expanded`/`aria-controls`, anfangs geschlossen). Keine Berechnungs-, Marker- oder Datenlogik wurde verändert. Ein neues gezieltes Prüfskript bestätigt Anfangszustand, Button-Text- und ARIA-Wechsel, vollständigen Erhalt aller Legendentexte und der P/M/E-Escape-Interaktion sowie die unveränderte Bindung des Unsicherheitshinweises. Bestehende Kalender-, Zyklus- und Partner-Regressionen sowie die WP-007-Vorhersagetests bleiben grün; `npx tsc --noEmit` und `npm run build` fehlerfrei, keine neue Route. Mobile Sichtprüfung mit einem Testkonto mit stark schwankender Zyklushistorie bestätigt: Der Unsicherheitshinweis ist vor dem Öffnen, während des geöffneten Zustands und nach dem Schließen durchgehend sichtbar; die Erklärungen öffnen und schließen sich korrekt, kein horizontaler Überlauf.

Ein bereits aus früheren Sitzungen bekannter, vorbestehender Testdefekt (Farbverlauf-Fundstelle seit einer früheren Komponentenauslagerung) besteht unverändert fort und wurde durch dieses Paket nicht verursacht.

## Offene Punkte

- Owner-Prüfschritt steht aus: Home-Screen öffnen, geschlossenen Anfangszustand prüfen, Erklärungen öffnen und P/M/E-Einzelerklärungen prüfen, bei unsicherer Vorhersage den durchgehend sichtbaren Hinweis prüfen, mobil auf fehlenden horizontalen Überlauf prüfen.
- Der bereits bekannte, vorbestehende Testdefekt sollte weiterhin in einem eigenen Paket behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die einklappbaren Kalender-Erklärungen im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-calendar-legend-collapsible.ts` (neu).
- Tests: `npx tsx scripts/verify-calendar-legend-collapsible.ts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-partner-fixed-view.ts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-period-day-actions.mts`, `node --experimental-strip-types --test tests/new-cycle-prediction.test.ts tests/cycle-fertility.test.ts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit einem Testkonto mit unsicherer Vorhersage, mobil.
- Commit oder Referenz: pending
