---
id: WP-20260905-1104-codex-periodenplanung
date: 2026-09-05
time: 11:04
agent: Codex
status: completed
screens: Heute | Kalender | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-016
commits: pending
---

# Getrennte Planung zukünftiger Perioden

## Was wurde gemacht?

Jeder Kalendertag zeigt die beiden Optionen `Erster Tag der Periode` und `Ende der Periode`. Reicht der gewählte Zeitraum in die Zukunft, wird er sichtbar als Planung in einer eigenen Tabelle von `luma_core` gespeichert. Planungen können geändert und gelöscht werden. Nach dem geplanten Ende können sie nur durch einen ausdrücklichen Klick als tatsächliche Periode bestätigt werden. Bestehende echte Perioden bleiben unverändert.

## Warum?

Der Kalender soll an jedem Tag gleich bedienbar sein, ohne geplante Zukunft und tatsächliche Periodendaten zu vermischen.

## Prüfung und Stand

Gezielter ESLint und TypeScript sind bestanden. 13 Unit- und Regressionstests sind bestanden. Die vollständige lokale Auth-/Datenbankintegration bestätigt Speicherung nach Login, Kontentrennung, Ablehnung einer vorzeitigen Bestätigung, ausdrückliche spätere Bestätigung und unveränderte alte Auth-Routen. Die neue Migration wurde erfolgreich und getrennt auf `luma_core` angewendet; die Datenbanktrennung wurde bestätigt. Der Produktions-Build konnte nur wegen des blockierten Abrufs der Google-Schrift Geist nicht abgeschlossen werden. Eine vollständige mobile Browserprüfung war ohne dauerhaftes Testkonto nicht möglich.

## Offene Punkte

- Sichtbare Owner-Prüfung auf einem Handy steht aus.

## Nächster Schritt

Unter `/neu` einen zukünftigen Zeitraum planen, neu anmelden und die sichtbare Planung prüfen.

## Technische Nachweise

- Betroffene Dateien: neue `period-plans`-Migration, API-Routen und Serverlogik; `src/app/neu/page.tsx`; `src/components/NewCycleExample.tsx`; Planungs-/Kalendervalidierung; Integrations- und Unit-Tests; `scripts/verify-luma-core.mjs`
- Tests: ESLint bestanden; TypeScript bestanden; 13 Unit-/Regressionstests bestanden; Auth-/DB-Integration bestanden; Migration und Datenbanktrennung bestanden; Build nur durch Google-Fonts-Netzwerksperre blockiert
- Commit oder Referenz: pending
