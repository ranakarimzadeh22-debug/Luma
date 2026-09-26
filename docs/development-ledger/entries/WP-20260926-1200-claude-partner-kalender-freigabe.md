---
id: WP-20260926-1200-claude-partner-kalender-freigabe
date: 2026-09-26
time: 12:00
agent: Anthropic Claude
status: completed
screens: Partner | Einstellungen | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 9
commits: pending
---

# Periodenkalender für Partner nur nach ausdrücklicher Freigabe

## Was wurde gemacht?

In den Einstellungen gibt es jetzt einen eigenen, standardmäßig ausgeschalteten Schalter „Periodenkalender für Partner freigeben“. Erst wenn er eingeschaltet ist, sieht der verbundene Partner den einfachen Grundkalender mit tatsächlich bestätigten Periodentagen (bei einer laufenden Periode vom echten Beginn bis heute). Erwartete Enden, geschätzte Perioden und alle anderen Zyklusdaten gehören nicht mehr zu diesem Grundkalender. Der Zyklus-Kreis bleibt eine vollständig getrennte, eigene Freigabe. Schaltet die Eigentümerin den Kalender aus oder beendet sie die Verbindung, verschwinden die Kalenderdaten beim Partner beim nächsten Laden sofort.

## Warum?

Owner-Auftrag WP-004 Version 9: Der Partnerkalender zeigte bisher automatisch bestätigte und erwartete Tage nach jeder aktiven Verbindung; die Eigentümerin soll selbst entscheiden, ob überhaupt Kalenderdaten geteilt werden.

## Prüfung und Stand

Neue Migration (nur `luma_core`) ergänzt eine eigene Spalte `calendar_shared` auf der Partnerverbindung, Standard aus, getrennt von der bestehenden `cycle_ring_shared`-Spalte. Die serverseitige Kalenderansicht prüft Verbindung und Freigabe in derselben Abfrage, sodass kein zeitliches Fenster für einen veralteten Zustand entsteht. `scripts/verify-partner-calendar.mts` wurde grundlegend überarbeitet und deckt Standardwert, sofortigen Entzug bei Ausschalten und Widerruf sowie alle vier Kombinationen aus Kalender- und Kreisfreigabe ab; alle Prüfungen bestehen. Bestehende Partner-/Perioden-Regressionsskripte, `npx tsc --noEmit` und `npm run build` sind grün. Mobile Sichtprüfung mit temporär installiertem Playwright gegen zwei echte, verbundene Testkonten bestätigt den vollständigen Ablauf (keine Daten vor Freigabe, nur bestätigte Tage nach Freigabe, sofortiger Entzug nach Ausschalten) ohne horizontalen Überlauf; Playwright und Testkonten danach vollständig entfernt.

Der Auftrag verengt den freigegebenen Grundkalender bewusst gegenüber dem vorherigen Stand: die bisherige Anzeige des voraussichtlichen Endes einer laufenden Periode im Partnerkalender wurde vollständig entfernt, da der Soll-Text und ein Abnahmekriterium das ausdrücklich verlangen. Das separate, kreisfreigabe-gesteuerte voraussichtliche Ende im Zyklus-Kreis ist davon nicht betroffen.

## Offene Punkte

- Owner-Prüfschritt steht aus: neuen Schalter in den Einstellungen prüfen (Standard aus), einschalten und den Grundkalender beim Partner sehen, ausschalten und den sofortigen Entzug prüfen, Unabhängigkeit von der Kreisfreigabe prüfen.
- Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` besteht unverändert fort.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet den neuen Kalender-Schalter und die Partneransicht im Browser.

## Technische Nachweise

- Betroffene Dateien: `database/luma-core/migrations/202609261200_partner_calendar_sharing.sql` (neu), `src/lib/new-partner.ts`, `src/app/api/neu/partner/calendar-sharing/route.ts` (neu), `src/components/NewPartnerCalendarSharingToggle.tsx` (neu), `src/app/neu/einstellungen/page.tsx`, `src/lib/new-partner-calendar.ts`, `src/components/NewPartnerCalendar.tsx`, `src/app/neu/partner/page.tsx`, `src/lib/new-partner-cycle-view.ts` (Kommentar), `scripts/verify-partner-calendar.mts`.
- Tests: `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-partner-notification-preference.mts`, `npx tsx scripts/verify-cycle-today-and-estimate.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsc --noEmit`, `npm run build`, `node scripts/apply-luma-core-migrations.mjs`, `node scripts/verify-luma-core.mjs`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit zwei verbundenen Testkonten.
- Commit oder Referenz: pending
