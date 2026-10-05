---
id: WP-20261005-1800-claude-feste-partneransicht
date: 2026-10-05
time: 18:00
agent: Anthropic Claude
status: completed
screens: Partner | Einstellungen | Zyklus | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 11
commits: pending
---

# Feste Partneransicht nach aktiver Verbindung – keine Einzel-Schalter mehr

## Was wurde gemacht?

Sobald der Partner den persönlichen Code erfolgreich eingelöst hat, sieht er ab sofort automatisch die vollständige, fest vereinbarte Ansicht: den Zyklus-Kreis, echte Periodentage, die geschätzte nächste Periode, das mögliche fruchtbare Zeitfenster, den möglichen Eisprung und die mögliche PMS-Phase – alles rein lesend und immer sichtbar mit „kann abweichen“. Die beiden bisherigen Einzel-Schalter „Zyklus-Kreis für Partner freigeben“ und „Periodenkalender für Partner freigeben“ sind aus den Einstellungen verschwunden; die aktive Verbindung allein ist jetzt die einzige Voraussetzung. Fallen mehrere Vorhersagen auf denselben Tag, bleiben sie gleichzeitig sichtbar, ohne sich gegenseitig zu verdecken.

## Warum?

Owner-Auftrag WP-004 Version 11: Die bisherigen einzelnen Schalter für Kalender und Zyklus-Kreis passten nicht zur gewünschten einfachen, festen Partneransicht nach einmaliger Codeverbindung.

## Prüfung und Stand

Die serverseitige Zugriffsprüfung für Kalender und Zyklus-Kreis wurde auf eine einzige Bedingung reduziert: die aktive Verbindung. Die alten Freigabe-Spalten in der Datenbank werden nirgends mehr gelesen. Nach Rückfrage beim Owner wurden die beiden jetzt wirkungslosen alten Freigabe-Routen und die zugehörigen Schalter-Komponenten vollständig entfernt (keine Migration, die Datenbankspalten selbst bleiben als Altstruktur bestehen). Der Partnerkalender wurde neu gebaut und nutzt dieselbe zentrale WP-007-Vorhersagelogik wie der eigene Kalender der Eigentümerin – keine zweite, abweichende Berechnung. Drei bestehende Prüfskripte wurden auf das neue Modell umgeschrieben und ein neues Skript deckt gezielt die Entfernung der alten Struktur sowie die Wiederverwendung der zentralen Logik ab. Bestehende Regressionen, `npx tsc --noEmit` und `npm run build` sind grün; die beiden alten API-Routen sind aus der Routenliste verschwunden. Mobile und breite Sichtprüfung mit einem konstruierten, echten Überlappungsfall bestätigt: Ein Kalendertag zeigt nachweislich gleichzeitig „Geschätzte nächste Periode“ und „mögliches fruchtbares Zeitfenster“, beide sichtbar, keine verdeckt die andere.

Ein bereits aus früheren Sitzungen bekannter, vorbestehender Testdefekt (Farbverlauf-Fundstelle seit einer früheren Komponentenauslagerung) besteht unverändert fort und wurde durch dieses Paket nicht verursacht.

## Offene Punkte

- Owner-Prüfschritt steht aus: neuen Verbindungscode erzeugen, mit einem zweiten Testkonto einlösen und sofort die vollständige Kernansicht ohne weitere Einstellung sehen; Überlappung von Vorhersagen prüfen; Einstellungen auf das Fehlen der alten Schalter prüfen; mobil auf fehlenden horizontalen Überlauf prüfen.
- Der bereits bekannte, vorbestehende Testdefekt sollte weiterhin in einem eigenen Paket behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die neue feste Partneransicht im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/lib/new-partner-calendar.ts`, `src/lib/new-partner-cycle-view.ts`, `src/lib/new-cycle-prediction.ts`, `src/lib/new-partner.ts`, `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `src/app/neu/partner/page.tsx`, `src/app/neu/einstellungen/page.tsx`; entfernt: `src/app/api/neu/partner/cycle-ring-sharing/route.ts`, `src/app/api/neu/partner/calendar-sharing/route.ts`, `src/components/NewPartnerCycleRingSharingToggle.tsx`, `src/components/NewPartnerCalendarSharingToggle.tsx`; Tests: `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-partner-fixed-view.ts` (neu).
- Tests: `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsx scripts/verify-partner-fixed-view.ts`, `npx tsx scripts/verify-partner-view-no-status-card.ts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-partner-notification-preference.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-personal-cycle-view.ts`, `npx tsx scripts/verify-cycle-today-and-estimate.mts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-period-day-actions.mts`, `node --experimental-strip-types --test tests/new-cycle-prediction.test.ts tests/cycle-fertility.test.ts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit zwei verbundenen Testkonten, mobil und breit.
- Commit oder Referenz: pending
