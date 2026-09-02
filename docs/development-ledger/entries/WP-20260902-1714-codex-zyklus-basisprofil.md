---
id: WP-20260902-1714-codex-zyklus-basisprofil
date: 2026-09-02
time: 17:14
agent: Codex
status: completed
screens: Zyklus-Basisprofil | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-006
commits: pending
---

# Zyklus-Basisprofil für die neue Luma

## Was wurde gemacht?

Der Einrichtungsbutton auf dem neuen Home-Screen ist jetzt aktiv. Er führt durch vier einzelne Fragen mit Fortschrittsanzeige. Jede unbekannte Angabe kann mit „Ich weiß es nicht“ beantwortet werden. Vor dem Speichern erscheint eine Zusammenfassung; jede Antwort kann dort geändert werden. Gespeicherte Angaben lassen sich später über denselben Weg erneut bearbeiten.

## Warum?

Der Owner möchte mit wenigen persönlichen Zyklusangaben eine nachvollziehbare Ausgangsbasis schaffen, ohne unbekannte Werte zu erfinden.

## Prüfung und Stand

Die sichtbare lokale Prüfung bestätigte Einstieg, Einzelschritte, Unbekannt-Auswahl und Zusammenfassung. Unit-, TypeScript-, ESLint-, Auth-, Datenbank- und Integrationstests bestanden. Kontentrennung, erneutes Speichern und die automatische Löschung des Profils mit dem Konto wurden geprüft. Die alte Datenbank blieb frei von den neuen Tabellen. Der Produktions-Build war erfolgreich.

## Offene Punkte

- Persönliche Schätzungen, Kalender, Kreis, Muster und weitere Zykluslogik sind ausdrücklich noch nicht umgesetzt.

## Nächster Schritt

Der Owner kann den Fragenweg lokal prüfen. Eine spätere persönliche Vorschau benötigt einen eigenen freigegebenen Auftrag.

## Technische Nachweise

- Betroffene Dateien: `luma_core`-Migration, Profilvalidierung und -speicherung, geschützte API- und UI-Route, neuer Fragenassistent, Home-Screen sowie gezielte Tests.
- Tests: ESLint bestanden; TypeScript bestanden; 9 Unit-Tests bestanden; Integration bestanden; Datenbanktrennung und Löschkaskade bestanden; sichtbare Browserprüfung bestanden; Build bestanden; Ledger-Validierung bestanden.
- Commit oder Referenz: pending
