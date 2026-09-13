---
id: WP-20260913-1600-claude-partner-reihenfolge-kreis-kalender
date: 2026-09-13
time: 16:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 7
commits: pending
---

# Zyklus-Kreis steht jetzt vor dem Partnerkalender

## Was wurde gemacht?

Wenn die Zyklus-Kreis-Freigabe aktiv ist, sieht der Partner jetzt zuerst den Kreis mit der aktuellen Orientierung und direkt danach den Kalender. Vorher stand der Kalender oben. Ohne Freigabe ändert sich nichts: Nur der Kalender ist sichtbar, wie bisher.

## Warum?

Owner-Auftrag WP-004 Version 7: Der Partner soll zuerst die aktuelle Orientierung sehen und danach die einzelnen Kalendertage.

## Prüfung und Stand

Reine Reihenfolgenänderung in `src/app/neu/partner/page.tsx`, keine neue Logik. Gezielt über einen echten lokalen Server geprüft: Ohne Freigabe erscheint kein Zyklus-Kreis-Text, nur der Kalender; mit Freigabe erscheint der Zyklus-Kreis im HTML nachweislich vor der Kalender-Legende. Mobile und normale Breite per Screenshot geprüft (Playwright temporär installiert, danach entfernt) – in beiden Fällen Kreis oben, Kalender darunter, kein horizontaler Überlauf. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich. Testkonten danach gelöscht.

## Offene Punkte

- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Keiner; Paket bleibt zur Owner-Sichtprüfung offen.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/partner/page.tsx`.
- Tests: `npx tsc --noEmit`, gezielte HTTP-Prüfung gegen echten lokalen Dev-Server, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt), `npm run build`.
- Commit oder Referenz: pending
