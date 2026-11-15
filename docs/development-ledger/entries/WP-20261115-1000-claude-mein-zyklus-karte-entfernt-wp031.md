---
id: WP-20261115-1000-claude-mein-zyklus-karte-entfernt-wp031
date: 2026-11-15
time: 10:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: unclear
why_source: none
commits: pending
---

# Karte „Mein Zyklus“ aus den Einstellungen entfernt (Schnellweg, Bezug WP-031)

## Was wurde gemacht?

Die Karte „Mein Zyklus“ mit dem Button „Zyklusprofil bearbeiten“ ist aus den Einstellungen entfernt. Partnerverbindung und Konto sind unverändert. Das Zyklusprofil selbst, Home, Kalender, Partnerbereich und alle Daten sind nicht angefasst.

## Warum?

Unklar – nicht dokumentiert.

## Prüfung und Stand

Die angepasste WP-031-Prüfung und die WP-027-Einstellungsprüfung bestehen, TypeScript besteht. Kein vollständiger Build und kein Browserlauf (Schnellweg). Nicht deployed.

## Offene Punkte

- Das Soll von WP-031 (Karte vor „Partnerverbindung“) gilt damit nicht mehr; Codex sollte das im Paket vermerken.

## Nächster Schritt

Owner prüft die Einstellungen nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/einstellungen/page.tsx`, `scripts/verify-settings-my-cycle-wp031.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
