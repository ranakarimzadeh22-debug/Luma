---
id: WP-20261112-1000-claude-einstellungen-mein-zyklus-wp031
date: 2026-11-12
time: 10:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Einstellungen: Bereich „Mein Zyklus“ (WP-031)

## Was wurde gemacht?

In den Einstellungen steht jetzt vor „Partnerverbindung“ eine helle Karte „Mein Zyklus“ mit dem Satz „Diese Angaben helfen bei der Schätzung.“ und dem Button „Zyklusprofil bearbeiten“. Der Button öffnet die schon vorhandene Zyklusprofil-Seite. Bearbeitet wird weiter nur dort.

## Warum?

Die Nutzerin soll auf einen Blick finden, wo sie ihre Zyklusangaben prüfen oder ändern kann. Das steht im freigegebenen Arbeitspaket WP-031.

## Prüfung und Stand

Neues Prüfskript, ein älteres Einstellungs-Prüfskript, TypeScript und Build bestehen. Keine Browser-Sichtprüfung. Nicht deployed.

## Offene Punkte

- Die übliche Zykluslänge wird nicht angezeigt, weil die Einstellungsseite sie ohne neue Datenabfrage nicht hat und das Paket keine neue Abfrage erlaubt. Zeigt die Karte die Länge, braucht es ein Folgepaket.

## Nächster Schritt

Owner prüft die Einstellungen nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/einstellungen/page.tsx`, `scripts/verify-settings-my-cycle-wp031.ts` (neu)
- Tests: siehe oben
- Commit oder Referenz: pending
