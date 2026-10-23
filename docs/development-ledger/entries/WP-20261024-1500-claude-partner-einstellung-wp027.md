---
id: WP-20261024-1500-claude-partner-einstellung-wp027
date: 2026-10-24
time: 15:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Alter Freigabe-Schalter entfernt, Info-Karte statt Schalter (WP-027, Korrektur)

## Was wurde gemacht?

In den Einstellungen gibt es den Schalter „Zyklus-Kreis für Partner freigeben“ nicht mehr. Wenn eine Partnerverbindung aktiv ist, steht dort stattdessen eine reine Info-Karte: „Aktive Partnerverbindung – Dein Partner sieht Kalender und Zyklus-Kreis.“ Man kann sie nicht anklicken. Ohne aktive Verbindung erscheint die Karte nicht und es steht kein Freigabe-Text da. Auch der zugehörige Code der Schalter-Komponente wurde gelöscht. Was der Partner sieht, die Verbindung selbst, Kalender, Zyklus-Kreis, Datenbank und Schnittstellen sind unverändert.

## Warum?

Der Schalter wirkte seit WP-027 nicht mehr auf die Partneransicht und versprach deshalb etwas Falsches. Die Karte erklärt nur den schon geltenden Zustand.

## Prüfung und Stand

Ein neues Prüfskript besteht (kein Schalter und kein Schreibweg mehr, Text nur bei aktiver Verbindung, Karte ohne Aktion, Gate unverändert). Ein altes Partner-Prüfskript wurde auf den neuen Stand angepasst. TypeScript und Build bestehen. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px: Karte nur bei aktiver Verbindung, kein Schalter, kein Überlauf, nach „Verbindung beenden“ verschwindet die Karte, Partneransicht unverändert. Nicht deployed.

## Offene Punkte

- Die API-Route und die Setter-Funktion für das alte Flag sind jetzt ungenutzt, wurden aber absichtlich nicht angefasst (keine API-Änderung im Auftrag). Sie können in einem eigenen Aufräumpaket entfernt werden.

## Nächster Schritt

Owner prüft die Einstellungen nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/einstellungen/page.tsx`, `src/components/NewPartnerCycleRingSharingToggle.tsx` (gelöscht), `scripts/verify-settings-partner-info-wp027.ts` (neu), `scripts/verify-partner-fixed-view.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
