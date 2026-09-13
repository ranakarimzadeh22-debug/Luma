---
id: WP-20260913-1400-claude-partner-zyklus-kreis
date: 2026-09-13
time: 14:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 6
commits: pending
---

# Lesender Zyklus-Kreis für den verbundenen Partner

## Was wurde gemacht?

In den eigenen Einstellungen kann die Nutzerin jetzt bewusst `Zyklus-Kreis für Partner freigeben` einschalten. Standardmäßig ist das aus. Schaltet sie es ein, sieht der verbundene Partner ab dem nächsten Laden denselben Zyklus-Kreis wie sie selbst: Periode, mögliche PMS- und Eisprungphase, ein roter Heute-Punkt und – bei einer laufenden Periode – ein vorsichtig gekennzeichnetes voraussichtliches Ende. Der Partner kann dabei nichts ändern, nichts eintragen und sieht keine Historie oder sonstigen privaten Details. Schaltet sie die Freigabe wieder aus, verschwindet der Kreis beim nächsten Laden sofort wieder, ohne dass die Verbindung selbst beendet wird.

## Warum?

Owner-Auftrag WP-004 Version 6: Der Partnerbereich zeigte bisher nur den Kalender; die aktuelle Zyklusphase war für den Partner nicht als einfache Übersicht sichtbar.

## Prüfung und Stand

Neue `scripts/verify-partner-cycle-ring.mts` (20 Prüfungen) gegen die lokale Testdatenbank: ohne Verbindung oder ohne Freigabe liefert die Partneransicht nachweislich keinerlei Kreiswerte; mit Freigabe und vier echten Perioden stimmen Phase, laufende Periode und voraussichtliches Ende exakt mit der Owner-Berechnung überein; Ausschalten der Freigabe sperrt den Kreis sofort, ohne die Verbindung zu beenden; zwei unabhängige Paare beeinflussen sich nie; ein Widerruf der Verbindung sperrt die Kreisansicht zusätzlich; ohne Daten bleibt die Anzeige ehrlich neutral statt eine Phase zu erfinden. Zusätzlich end-to-end über einen echten lokalen Server mit echten HTTP-Anfragen geprüft: Kreis erscheint/verschwindet exakt beim Freigabe-Umschalten, fehlende Sitzung und falsche Herkunft werden abgelehnt. Mobile Sichtprüfung (temporär installiertes Playwright, iPhone-Breite) zeigt den Kreis korrekt ohne horizontalen Überlauf und ohne Bearbeitungsknöpfe. Bestehende Partner-, Perioden- und Auth-Regressionen erneut grün, `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich. Alle Testkonten nach der Prüfung gelöscht.

## Offene Punkte

- Owner-Prüfschritt im Browser steht aus: Schalter in den eigenen Einstellungen bedienen und die Partneransicht auf einem zweiten Konto prüfen.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet den Schalter im eigenen Browser mit einem zweiten, verbundenen Testkonto.

## Technische Nachweise

- Betroffene Dateien: `database/luma-core/migrations/202609131000_partner_cycle_ring_sharing.sql` (neu), `src/lib/new-partner.ts`, `src/lib/new-partner-cycle-view.ts` (neu), `src/components/CyclePersonalRing.tsx` (neu, aus NewCycleExample.tsx extrahiert), `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCycleRing.tsx` (neu), `src/components/NewPartnerCycleRingSharingToggle.tsx` (neu), `src/app/api/neu/partner/cycle-ring-sharing/route.ts` (neu), `src/app/neu/einstellungen/page.tsx`, `src/app/neu/partner/page.tsx`.
- Tests: `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-partner-notification-preference.mts`, `npx tsx scripts/verify-no-real-push.mts`, `node scripts/verify-luma-core.mjs`, `npx tsc --noEmit`, `npm run build`, end-to-end mit echtem lokalem Dev-Server und echten HTTP-Anfragen, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt).
- Commit oder Referenz: pending
