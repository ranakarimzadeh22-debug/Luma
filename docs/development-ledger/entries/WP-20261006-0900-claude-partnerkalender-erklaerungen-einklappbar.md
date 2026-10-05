---
id: WP-20261006-0900-claude-partnerkalender-erklaerungen-einklappbar
date: 2026-10-06
time: 09:00
agent: Anthropic Claude
status: completed
screens: Partner | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 12
commits: pending
---

# Partnerkalender-Erklärungen jetzt ebenfalls einklappbar

## Was wurde gemacht?

Auch im Partnerkalender steht unter dem Kalender jetzt nur noch ein kleiner Button „Erklärungen zum Kalender anzeigen“. Die Erklärungen für bestätigte Periode, geschätzte nächste Periode, möglichen Eisprung, mögliche PMS-Phase und mögliches fruchtbares Zeitfenster sind beim Laden geschlossen und öffnen sich erst nach Antippen – genau dasselbe Muster wie bereits im eigenen Kalender der Eigentümerin. Der Hinweis „Vorhersage unsicher - Kann abweichen“ bleibt davon unabhängig immer sichtbar, wenn er zutrifft.

## Warum?

Owner-Auftrag WP-004 Version 12: Die dauerhaft sichtbare Legende machte auch die Partneransicht unruhiger; die Ownerin wollte dieselbe ruhige, einklappbare Erklärung wie im eigenen Kalender auch für den Partner.

## Prüfung und Stand

Das bereits in WP-007 Version 2 erprobte Ein-/Ausklappmuster (`aria-expanded`/`aria-controls`, anfangs geschlossen) wurde unverändert auf den Partnerkalender übertragen – keine neue Darstellungs- oder Vorhersagelogik. Die serverseitige Zugriffsprüfung (aktive Verbindung als alleinige Voraussetzung) wurde nicht angefasst. Ein neues gezieltes Prüfskript bestätigt Anfangszustand, Button-Text- und ARIA-Wechsel, vollständigen Erhalt aller fünf Legendentexte sowie die unveränderte Bindung des Unsicherheitshinweises. Bestehende Partner-, Kalender- und Zyklus-Regressionen bleiben grün; `npx tsc --noEmit` und `npm run build` fehlerfrei, keine neue Route. Mobile und breite Sichtprüfung mit zwei verbundenen Testkonten und unsicherer Vorhersage bestätigt: Der Hinweis bleibt vor, während und nach dem Öffnen durchgehend sichtbar; das Tagesfenster bleibt weiterhin rein lesend; nach Widerruf der Verbindung sind keine Partnerdaten mehr sichtbar; kein horizontaler Überlauf.

Zu Beginn dieser Version zeigte der Paketstatus noch `review` statt `approved` (Stand nach dem letzten Abschluss). Dies wurde transparent gemeldet; die ausdrückliche Anweisung war, trotzdem fortzufahren.

## Offene Punkte

- Owner-Prüfschritt steht aus: als verbundener Partner die Kalenderseite öffnen, geschlossenen Anfangszustand prüfen, öffnen und alle fünf Erklärungen prüfen, bei unsicherer Vorhersage den durchgehend sichtbaren Hinweis prüfen, mobil auf fehlenden horizontalen Überlauf prüfen.
- Zwei bereits bekannte, vorbestehende Testdefekte bestehen unverändert fort und sollten in eigenen Paketen behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die einklappbaren Partnerkalender-Erklärungen im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewPartnerCalendar.tsx`, `scripts/verify-partner-calendar-legend-collapsible.ts` (neu).
- Tests: `npx tsx scripts/verify-partner-calendar-legend-collapsible.ts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsx scripts/verify-partner-fixed-view.ts`, `npx tsx scripts/verify-partner-view-no-status-card.ts`, `npx tsx scripts/verify-calendar-legend-collapsible.ts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit zwei verbundenen Testkonten, mobil und breit.
- Commit oder Referenz: pending
