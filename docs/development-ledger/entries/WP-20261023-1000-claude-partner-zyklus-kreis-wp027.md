---
id: WP-20261023-1000-claude-partner-zyklus-kreis-wp027
date: 2026-10-23
time: 10:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Partner-Zyklus-Kreis bei aktiver Verbindung sichtbar (WP-027)

## Was wurde gemacht?

Ein verbundener Partner sieht auf `/neu/partner` jetzt wieder den Zyklus-Kreis mit den kurzen Informationen oberhalb des Kalenders. Dafür wurde nur eine zusätzliche, alte Bedingung in der Serverabfrage entfernt (die Freigabe-Spalte `cycle_ring_shared`). Allein die aktive Verbindung entscheidet, ob der Partner die Ansicht bekommt. Ohne aktive Verbindung bekommt er weiterhin keine Daten. Der Partner kann nichts bearbeiten. Kalender, Owner-Seite, Datenberechnung, API und Datenbank sind unverändert.

## Warum?

Auf dem Partner-Handy erschien nur der Kalender, obwohl die Verbindung aktiv war. Die Prüfung fand das alte zusätzliche Freigabe-Kriterium, das laut Produktentscheidung nicht mehr gelten soll. Das steht im freigegebenen Arbeitspaket WP-027.

## Prüfung und Stand

Neues Skript `verify-partner-ring-gate-wp027` und der Datenbank-Test `verify-partner-cycle-ring.mts` bestehen: aktive Verbindung mit ausgeschaltetem alten Flag liefert die Ansicht, ohne oder nach beendeter Verbindung kommt nichts, die Paare bleiben getrennt. TypeScript und Build bestehen. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px: Kreis oben, Kalender darunter, keine Eingabe, kein Überlauf; ein Konto ohne Verbindung sieht nur das Code-Eingabefeld. Nicht deployed.

## Offene Punkte

- Der Schalter „Zyklus-Kreis für Partner freigeben“ in den Einstellungen wirkt jetzt nicht mehr auf die Partneransicht. Er sollte in einem eigenen Paket entfernt oder neu entschieden werden.

## Nächster Schritt

Owner entscheidet über den nun wirkungslosen Schalter und prüft `/neu/partner` nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/lib/new-partner-cycle-view.ts`, `scripts/verify-partner-ring-gate-wp027.ts` (neu), `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-cycle-overview-wp024.ts`, `scripts/verify-partner-fixed-view.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
