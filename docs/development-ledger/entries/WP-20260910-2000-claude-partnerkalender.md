---
id: WP-20260910-2000-claude-partnerkalender
date: 2026-09-10
time: 20:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 3
commits: pending
---

# Partnerkalender der neuen Luma (nur lesend)

## Was wurde gemacht?

Ein aktiv verbundener Partner sieht in der neuen App jetzt einen einfachen Monatskalender statt nur „Verbindung aktiv“. Tatsächlich bestätigte Periodentage sind sichtbar, und bei einer laufenden Periode zusätzlich klar getrennt die erwarteten Tage bis zum erwarteten Ende („Erwartet – kann abweichen“). Keine PMS-, Eisprung-, Zykluslängen- oder Vorhersageinformationen, keine Historie, keine Profildaten. Der Partner kann nichts eintragen, ändern oder löschen.

## Warum?

Owner-Auftrag WP-004 Version 3: Die sichere Verbindung zeigte bisher nur die neutrale Meldung „Verbindung aktiv“ ohne Nutzen für den Partner.

## Prüfung und Stand

Neues `scripts/verify-partner-calendar.mts` (12 Prüfungen: kein Zugriff ohne Verbindung, korrekte Trennung bestätigt/erwartet bei laufender Periode, nur bestätigte Tage bei abgeschlossener Periode, keine erfundenen erwarteten Tage ohne `expectedEndDate`, sofortiger Zugriffsverlust nach Widerruf, Kontotrennung) bestanden. Bestehende Prüfungen des Verbindungskerns erneut grün. End-to-end per `curl` gegen einen lokalen Produktions-Build geprüft: gerenderte Partnerseite enthält nachweislich keine verbotenen Begriffe (PMS, Eisprung, E-Mail). Mobile Sichtprüfung mit temporär installiertem Playwright ohne horizontalen Überlauf, Tagesfenster rein lesend. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich.

## Offene Punkte

- Owner-Prüfschritt steht aus.
- Der bereits bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` besteht unverändert fort.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Mit zwei verbundenen Testkonten `/neu/partner` öffnen und prüfen, dass bestätigte und erwartete Tage korrekt getrennt angezeigt werden und keine Bearbeitung möglich ist.

## Technische Nachweise

- Betroffene Dateien: `src/lib/new-partner-calendar.ts`, `src/app/neu/partner/page.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-partner-calendar.mts`, `docs/work-packages/WP-004-partner-verbindungscode.md`
- Tests: `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsc --noEmit`, `npm run build`, end-to-end per `curl` gegen lokalen Produktions-Build, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt)
- Commit oder Referenz: pending
