---
id: WP-20260831-1720-codex-vorname-home
date: 2026-08-31
time: 17:20
agent: Codex
status: completed
screens: Registrierung | Anmeldung | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-005
commits: pending
---

# Vorname und persönlicher Start der neuen Luma

## Was wurde gemacht?

Die Registrierung der neuen Luma fragt jetzt verpflichtend nach dem Vornamen. Bereits vorhandene Konten ohne Vornamen erhalten nach der Anmeldung einmalig eine Namensabfrage. Danach zeigt `/neu` die persönliche Begrüßung und den nächsten, noch nicht aktiven Schritt zur Zyklusansicht.

## Warum?

Der Owner hat in HANDOFF-005 die persönliche Begrüßung als nächsten Baustein der neuen Luma bestätigt.

## Prüfung und Stand

Gezieltes ESLint und TypeScript waren erfolgreich. Der Auth-/Datenbank-Integrationstest bestand Registrierung, Anmeldung, Sitzung, einmalige Namensspeicherung, Kontentrennung, Abmeldung und die alten Auth-Routen. Die Datenbankprüfung bestätigte die Trennung von `app_luma` und `luma_core`. Der Produktions-Build war nach Freigabe des Google-Fonts-Abrufs erfolgreich. Der Unit-Test bestand zunächst vollständig; eine spätere Wiederholung konnte wegen lokalem Speichermangel beim Start von `tsx` nicht ausgeführt werden.

## Offene Punkte

- Die Schaltfläche „Meine Zyklusansicht einrichten“ ist sichtbar, bleibt aber bis zu einem später freigegebenen Auftrag ohne Zyklusfragen deaktiviert.

## Nächster Schritt

Ein späterer freigegebener Auftrag kann den Einrichtungsweg für die Zyklusansicht ergänzen.

## Technische Nachweise

- Betroffene Dateien: Migration und Migrationsskript für `luma_core`, neue Auth-/Profil-Logik, Registrierungs- und Startseiten-Komponenten, gezielte Tests.
- Tests: ESLint erfolgreich; TypeScript erfolgreich; Integrationstest erfolgreich; Datenbanktrennung erfolgreich; Produktions-Build erfolgreich; Unit-Test 6/6 zunächst erfolgreich, Wiederholung durch ENOMEM blockiert.
- Commit oder Referenz: pending
