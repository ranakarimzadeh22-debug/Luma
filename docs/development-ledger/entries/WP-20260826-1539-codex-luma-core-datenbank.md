---
id: WP-20260826-1539-codex-luma-core-datenbank
date: 2026-08-26
time: 15:39
agent: Codex
status: completed
screens: App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-002
commits: pending
---

# Getrennte Datenbank für den neuen Luma-Kern

## Was wurde gemacht?

Für die neue aktive Luma-App wurde eine eigene leere PostgreSQL-Datenbank mit dem technischen Namen `luma_core` angelegt. Die bisherige Datenbankverbindung der App wurde nicht umgestellt.

## Warum?

Der neue Luma-Kern soll einen klar getrennten Datenraum erhalten, während die bisherige Datenbank für die Archiv-App unverändert nutzbar bleibt.

## Prüfung und Stand

Vor der Anlage wurde geprüft, dass der Zielname frei und die notwendige Berechtigung vorhanden ist. Danach wurde bestätigt, dass `luma_core` erreichbar ist und keine Benutzer-Tabellen enthält. Der Struktur-Fingerprint der bisherigen Datenbank war vor und nach der Anlage identisch. Es wurden keine Migrationen, App-Tests oder UI-Tests ausgeführt, weil weder Schema noch App-Code oder App-Verbindung geändert wurden.

## Offene Punkte

- Die App verwendet weiterhin die bisherige Datenbank. Die spätere Umstellung auf `luma_core` benötigt einen eigenen freigegebenen Auftrag.
- Anmeldung und Benutzerkonto für den neuen Kern sind weiterhin fachlich zu klären.

## Nächster Schritt

Festlegen, welche minimalen Daten der erste Kern-Screen benötigt. Erst danach das neue Prisma-Schema und die erste Migration getrennt freigeben.

## Technische Nachweise

- Betroffene Dateien: nur dieser Entwicklungsledger-Eintrag; kein App-Code und keine Umgebungsdatei geändert.
- Datenbankprüfung: Zielname vorab frei; neue Zielidentität bestätigt; null Benutzer-Tabellen; Quellstruktur vor und nachher identisch.
- Migrationen: keine ausgeführt.
- Erster lokaler Prüfversuch: vor jeder Verbindung wegen fehlerhafter Shell-Quotierung beendet; anschließend sicher korrigiert und erfolgreich wiederholt.
- Commit oder Referenz: pending.
