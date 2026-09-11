---
id: WP-20260911-1500-claude-partner-push
date: 2026-09-11
time: 15:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 4
commits: pending
---

# Push-Benachrichtigungen für den neuen Partnerbereich

## Was wurde gemacht?

Nach dem Einlösen eines Verbindungscodes kann der Partner jetzt freiwillig Benachrichtigungen auf seinem eigenen Gerät aktivieren. Beginnt oder endet die Periode der Eigentümerin heute wirklich, bekommt der Partner genau einen kurzen, neutralen Hinweis dazu – nie bei erwarteten Tagen, Schätzungen oder nachträglich eingetragenen vergangenen Daten, nie doppelt bei wiederholtem Speichern. Auf dem iPhone erklärt Luma zuerst, dass die App zum Home-Bildschirm hinzugefügt werden muss. Wird die Verbindung beendet, verschwindet die Benachrichtigungsberechtigung sofort mit.

## Warum?

Owner-Auftrag WP-004 Version 4: Der Partner sollte bei einem tatsächlichen Ereignis sofort aufmerksam werden, ohne den Kalender ständig selbst öffnen zu müssen.

## Prüfung und Stand

Neue `scripts/verify-partner-push.mts` (12 Prüfungen) und `verify-partner-push-triggers.ts` (13 Prüfungen) bestanden: Deduplizierung über einen Datenbank-Constraint (auch bei zwei echten parallelen Datenbankverbindungen entsteht nie ein doppelter Versand), sofortiger Widerruf der Berechtigung, korrekte Europe/Berlin-Zeitzone unabhängig von der Server-Systemzeit, „nur neu hinzugekommener heutiger Wert löst aus“-Logik. Bestehende Partner- und Periodenprüfungen erneut grün. End-to-end mit echten, ausschließlich lokalen Test-VAPID-Schlüsseln gegen einen lokalen Produktions-Build geprüft: Speichern, Validierung, Deduplizierung und sofortiger Widerruf funktionieren nachweislich. Mobile Sichtprüfung ohne horizontalen Überlauf; der Kalender bleibt in jedem Berechtigungszustand nutzbar. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich.

## Offene Punkte

- Owner-Prüfschritt steht aus, insbesondere die echte Aktivierung auf einem unterstützten Gerät und der iPhone-Home-Bildschirm-Hinweis in echter Safari-Umgebung (in der automatisierten Headless-Prüfung technisch nicht nachstellbar).
- Produktions-VAPID-Schlüssel sind noch nicht in Dokploy gesetzt – das bleibt eine getrennte Owner-Freigabe.
- Der bereits bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` besteht unverändert fort.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Mit zwei verbundenen Testkonten auf einem unterstützten Gerät Benachrichtigungen aktivieren, eine Testbenachrichtigung empfangen, danach eine echte Periode mit heutigem Start speichern und den Hinweis erhalten.

## Technische Nachweise

- Betroffene Dateien (Auswahl): `database/luma-core/migrations/202609111200_partner_push.sql`, `src/lib/new-partner-push.ts`, `src/lib/berlin-date.ts`, `src/lib/new-partner.ts`, `src/lib/new-periods.ts`, `src/app/api/neu/periods/route.ts`, `src/app/api/neu/periods/[id]/route.ts`, `src/app/api/neu/partner/push-subscription/route.ts`, `src/app/api/neu/partner/push-test/route.ts`, `src/components/NewPartnerPushActivation.tsx`, `src/app/neu/partner/page.tsx`, `public/manifest.json`, `public/sw.js`, `src/app/layout.tsx`, `.env.example`, `package.json` (neue Abhängigkeit `web-push`), `scripts/verify-luma-core.mjs`
- Tests: `npx tsx scripts/verify-partner-push.mts`, `npx tsx scripts/verify-partner-push-triggers.ts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-my-periods.mts`, `node scripts/verify-luma-core.mjs`, `npx tsc --noEmit`, `npm run build`, end-to-end mit lokalen Test-VAPID-Schlüsseln gegen lokalen Produktions-Build, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt)
- Commit oder Referenz: pending
