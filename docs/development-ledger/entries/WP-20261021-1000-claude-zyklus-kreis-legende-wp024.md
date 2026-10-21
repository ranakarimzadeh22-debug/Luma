---
id: WP-20261021-1000-claude-zyklus-kreis-legende-wp024
date: 2026-10-21
time: 10:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Zyklus-Kreis: nur aktuelle Phase beschriftet, Farb-Legende in der Textspalte (WP-024)

## Was wurde gemacht?

Am Zyklus-Kreis stehen nicht mehr alle drei Wörter „Periode“, „PMS“ und „Eisprung“ verteilt auf dem Ring. Es steht nur noch das Wort der aktuellen Phase, größer und gut lesbar. In der rechten Textspalte erklärt eine kleine Legende die Farben: dunkelrot für Periode, rosa für PMS, lila für Eisprung. Das gilt für die Nutzerin und für den freigegebenen Partner. Berechnung, Daten, Freigabe und Datenschutz sind unverändert.

## Warum?

Der Owner fand den Ring mit drei verteilten Beschriftungen zu voll und wollte nur die aktuelle Phase hervorgehoben haben.

## Prüfung und Stand

Neues Skript `verify-cycle-ring-phase-legend` besteht (nur das passende Label je Phase, keines ohne Phase, Legende mit drei Farben, keine Legende ohne Daten). TypeScript und Build bestehen, die vorhandenen Ring- und Partner-Prüfungen bestehen. Zwei andere Prüfskripte (`verify-mobile-home-compact`, `verify-calendar-tile-band`) waren schon vor dieser Änderung fehlerhaft. Sichtprüfung mit Testkonten bei 390 und 1280 px für Nutzerin und Partner: ein Label am Ring, Legende sichtbar, kein Überlauf. Nicht deployed.

## Offene Punkte

- Zwei bereits vorher fehlerhafte Prüfskripte sollten bei Gelegenheit an den neuen Aufbau angepasst werden.

## Nächster Schritt

Owner prüft `/neu` und `/neu/partner` nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/components/CyclePersonalRing.tsx`, `src/components/CycleOverviewPanel.tsx`, `scripts/verify-cycle-ring-phase-legend.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
