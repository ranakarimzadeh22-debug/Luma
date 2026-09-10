---
id: WP-20260910-1700-claude-partner-verbindungscode
date: 2026-09-10
time: 17:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004
commits: pending
---

# Sichere Partnerverbindung mit persönlichem Code

## Was wurde gemacht?

Nach der Auswahl der alten oder neuen App gibt es jetzt eine Rollenwahl: „Für mich selbst“ oder „Für meinen Partner / meine Partnerin“. Eine Person kann im eigenen Bereich einen kurzen Code erzeugen, der zehn Minuten gilt und nur einmal funktioniert. Der Partner meldet sich mit einem eigenen, neuen Konto an und gibt den Code ein – danach sind beide Konten verbunden und der Partner sieht nur die neutrale Meldung „Verbindung aktiv“, keine Zyklus- oder Gesundheitsdaten. Die Verbindung lässt sich jederzeit bewusst beenden, danach verliert der Partner sofort den Zugriff.

Das alte, unsichere Partner-Feature der alten App (ein Klartext-Code ohne Ablauf, eine Seite die Zyklusphase, nächste Periode und Stimmung offen über einen Link zeigte, ganz ohne eigenes Partnerkonto) wurde vollständig entfernt und durch diesen sicheren Weg ersetzt.

## Warum?

Owner-Auftrag WP-004: Der Partner soll nur ausdrücklich freigegebene Informationen sehen, niemals den privaten Bereich der anderen Person. Die getrennte Datenbankmigration für alte und neue Luma wurde vom Owner am 10. September 2026 ausdrücklich freigegeben.

## Prüfung und Stand

Neue `scripts/verify-partner-new.mts` und `scripts/verify-partner-old.mts` (je 20 Prüfungen, insgesamt 40): Code-Lebenszyklus, Ablehnung von abgelaufenen/falschen/eigenen Codes, Kontotrennung für mehrere Paare, eine bestehende Verbindung blockiert eine zweite, echte parallele Einlöseversuche mit zwei unabhängigen Datenbankverbindungen erzeugen nie zwei Verbindungen, gespeicherte Codes sind nie im Klartext lesbar. Zusätzlich end-to-end per `curl` gegen einen lokalen Produktions-Build geprüft (Registrierung, Code erzeugen, einlösen, Status, Beenden, sofortiger Zugriffsverlust) sowie alle Sicherheitsgrenzen (401 ohne Session, 403 bei falscher Origin, 429 nach zu vielen Versuchen). Mobile Sichtprüfung mit temporär installiertem Playwright ohne horizontalen Überlauf. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich (47 Routen). `node scripts/verify-luma-core.mjs` bestätigt weiterhin getrennte Datenbanken.

Während der Arbeit wurde ein echter Fehler in der Zeitzonen-Handhabung des Prisma-Postgres-Adapters gefunden und behoben (Details im WP dokumentiert) – ohne den Fix hätte jeder frisch erzeugte Code in der alten App fälschlich als sofort abgelaufen gegolten.

## Offene Punkte

- Owner-Prüfschritt steht aus.
- Der bereits aus WP-003 bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` besteht unverändert fort.
- Kein Deploy ausgelöst – wie beauftragt bleibt das eine gesonderte Owner-Freigabe.

## Nächster Schritt

Rollenwahl nach beiden App-Varianten öffnen, im eigenen Bereich einen Code erzeugen, mit einem zweiten, unabhängigen Konto als Partner einloggen und den Code eingeben, „Verbindung aktiv“ bestätigen, danach die Verbindung beenden und prüfen, dass der Partner sofort keinen Zugriff mehr hat.

## Technische Nachweise

- Betroffene Dateien (Auswahl): `database/luma-core/migrations/202609101200_partner_connections.sql`, `prisma/schema.prisma`, `prisma/migrations/20260910135702_partner_connections/`, `prisma/migrations/20260910135804_partner_rate_limits/`, `prisma/migrations/20260910141059_partner_timestamptz/`, `src/lib/new-partner.ts`, `src/lib/partner-connections.ts`, `src/lib/partner-rate-limit.ts`, `src/lib/request-origin.ts`, `src/app/api/neu/partner/*`, `src/app/api/partner-connections/*`, `src/app/api/partner-account/register/route.ts`, `src/app/rolle/page.tsx`, `src/app/neu/rolle/page.tsx`, `src/app/partner-bereich/page.tsx`, `src/app/neu/partner/page.tsx`, `src/app/partner-registrieren/page.tsx`, `src/app/partner-anmelden/page.tsx`, `src/app/neu/partner-registrieren/page.tsx`, `src/app/neu/partner-anmelden/page.tsx`, `src/app/neu/einstellungen/page.tsx`, `src/components/PartnerConnectionCard.tsx`, `src/components/NewPartnerCodeCard.tsx`, `src/components/NewPartnerRedeemForm.tsx`, `src/components/NewPartnerEndButton.tsx`, `src/components/PartnerAreaContent.tsx`, `src/components/PartnerLoginForm.tsx`, `src/components/PartnerRegisterForm.tsx`; entfernt: `src/app/partner/`, `src/components/PartnerCard.tsx`, `src/lib/actions/partner.ts`
- Tests: `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `node scripts/verify-luma-core.mjs`, `npx tsc --noEmit`, `npm run build`, end-to-end per `curl` gegen lokalen Produktions-Build, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt)
- Commit oder Referenz: pending
