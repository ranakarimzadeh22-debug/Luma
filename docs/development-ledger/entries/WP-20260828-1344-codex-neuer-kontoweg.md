---
id: WP-20260828-1344-codex-neuer-kontoweg
date: 2026-08-28
time: 13:44
agent: Codex
status: completed
screens: Anmeldung | Registrierung | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-004
commits: pending
---

# Getrennter Kontoweg für die neue Luma

## Was wurde gemacht?

Die neue Luma besitzt jetzt eine eigene Registrierung und Anmeldung mit E-Mail und Passwort. Nach Registrierung oder Anmeldung wird eine geschützte Sitzung gesetzt. Auf `/neu` sieht die Nutzerin dann den geschützten neuen Bereich und kann sich wieder abmelden.

Der neue Weg verwendet ausschließlich eigene Routen, eigene Sitzungstabellen und die getrennte Datenbank `luma_core`. Die alten Login- und Registrierungsseiten, alten Konten und die alte Datenbank wurden nicht umgestellt. Die alten App-Provider werden auf dem Weg `/neu` nicht mehr geladen.

## Warum?

Die neue Luma benötigt ein getrenntes Benutzerkonto, damit eine Nutzerin sicher zurückkehren kann und spätere persönliche Daten eindeutig ihrem neuen Konto zugeordnet werden können, ohne die alte Luma zu verändern.

## Prüfung und Stand

- Die Migration wurde auf `luma_core` angewendet. Dort bestehen genau die drei neuen Auth-Tabellen sowie die Migrationstabelle. Die alte Datenbank `app_luma` enthält keine dieser neuen Tabellen.
- Vier gezielte Validierungstests für E-Mail, Passwort und Passwortbestätigung sind bestanden.
- Der echte lokale Ablauf für Registrierung, geschützte Sitzung, Abmeldung, erneute Anmeldung, doppelte E-Mail, falsches Passwort, ungleiche Passwörter, Cookie-Schutz, Herkunftsprüfung und Schutz vor vielen Anmeldeversuchen ist bestanden.
- Die alten Routen `/login` und `/register` wurden im Integrationstest weiterhin erfolgreich geöffnet.
- Die sichtbare lokale Prüfung der neuen Start-, Registrierungs- und Anmeldeseiten ist bestanden.
- ESLint für alle auftragsbezogenen Dateien ist bestanden. TypeScript ist bestanden. Der Produktions-Build ist nach erlaubtem Zugriff auf Google Fonts bestanden.
- Der projektweite ESLint-Lauf bleibt wegen 27 bereits vorhandener Fehler und 83 Warnungen in alten beziehungsweise fremden Dateien rot. Diese Dateien wurden nicht für diesen Auftrag verändert.
- Die zuerst ohne Netzwerkfreigabe gestartete Build-Prüfung scheiterte nur am blockierten Abruf von Google Fonts. Die Wiederholung außerhalb dieser Netzwerksperre war erfolgreich.
- Alle erzeugten Testkonten, Testsitzungen und Test-Zähler wurden aus `luma_core` entfernt.

## Offene Punkte

- Für eine spätere sichtbare Bereitstellung muss `LUMA_CORE_DATABASE_URL` getrennt und sicher in der Zielumgebung gesetzt werden. Dieses Arbeitspaket verändert keine externen Produktionsvariablen und veröffentlicht die App nicht.
- E-Mail-Bestätigung, Passwort-Reset, Social Logins, Zwei-Faktor-Anmeldung, Zyklusdaten und endgültiges Design bleiben ausdrücklich spätere Arbeitspakete.

## Nächster Schritt

Der Owner kann den neuen Kontoweg lokal prüfen. Eine Veröffentlichung benötigt danach eine getrennte Produktionsfreigabe und sichere Zielkonfiguration.

## Technische Nachweise

- Betroffene Dateien: neue Auth-Routen unter `src/app/api/neu/auth/`; neue Seiten unter `src/app/neu/`; neue Auth-Komponenten und Bibliotheken; `src/app/layout.tsx`; `database/luma-core/`; zwei gezielte Tests; Migrations- und Prüfscripts.
- Tests: gezieltes ESLint bestanden; TypeScript bestanden; 4 Unit-Tests bestanden; Auth-Integration und Regression bestanden; sichtbare Browserprüfung bestanden; Build bestanden; projektweiter Lint unabhängig rot.
- Datenbankprüfung: `app_luma` 17 Tabellen und keine neuen Auth-Tabellen; `luma_core` 4 Tabellen, davon drei neue Auth-Tabellen; nach Testbereinigung 0 Nutzer, 0 Sitzungen und 0 Rate-Limit-Einträge.
- Commit oder Referenz: pending.
