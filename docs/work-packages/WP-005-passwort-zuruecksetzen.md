---
id: WP-005
title: "Passwort der neuen Luma sicher zurücksetzen"
package_revision: 2
status: review
created: 2026-09-12
updated: 2026-09-12
owner_approved: yes
executor: claude
product_area: "Neue Luma – Anmeldung"
brief_version: 1
technical_brief: complete
migration_approval: not_required_for_version_2
---

# Aufgabe: Passwort der neuen Luma sicher zurücksetzen

## Owner-Ansicht – einfach erklärt

- **Problem:** Eine Person kennt ihr Passwort nicht mehr und kann ihr bestehendes Konto nicht öffnen.
- **Ziel:** Über `Passwort vergessen?` gibt sie ihre E-Mail-Adresse ein und erhält einen einmaligen Link. Damit setzt sie ein neues Passwort und nutzt danach ihr bisheriges Konto weiter.
- **Wichtig:** Es wird kein neues Konto angelegt. Der Link ist nur kurz gültig und kann nur einmal verwendet werden.
- **Wo erscheint es?** Auf der Anmeldeseite der neuen Luma unter `/neu/anmelden`.
- **Warum ist dieses Paket pausiert?** Luma braucht zuerst einen sicheren E-Mail-Absender. Ohne ihn kann kein Reset-Link zuverlässig zugestellt werden.

## Entstehungsweg

`Passwort vergessen → Konto auf Handy und Desktop nicht mehr erreichbar → sicherer Einmal-Link per registrierter E-Mail → neues Passwort für dasselbe Konto → WP-005`

- bestätigtes Problem: Eine Nutzerin verliert ohne Passwort-Reset den Zugriff auf ihr bestehendes neues Luma-Konto.
- gewünschte Wirkung: Sie erhält sicher Zugriff auf genau dieses Konto zurück, ohne Gesundheitsdaten zu verlieren oder ein zweites Konto zu erzeugen.
- gewählte Lösung: E-Mail-Eingabe, neutraler Hinweis, einmaliger 30-Minuten-Link und eigene Seite zum Setzen eines neuen Passworts.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-015.md`.

## Soll – von Codex

- `/neu/anmelden` zeigt den Einstieg `Passwort vergessen?`.
- Die Person gibt die registrierte E-Mail-Adresse ein. Die sichtbare Rückmeldung bleibt immer gleich, unabhängig davon, ob diese E-Mail ein Konto besitzt.
- Bei einem vorhandenen Konto erzeugt Luma serverseitig einen zufälligen Reset-Token, speichert nur dessen Hash und versendet einen Link an diese E-Mail-Adresse.
- Der Link läuft nach 30 Minuten ab, ist genau einmal nutzbar und führt zu einer Seite für ein neues Passwort.
- Ein erfolgreiches neues Passwort gilt für das bestehende Konto. Bestehende Sitzungen dieses Kontos werden danach beendet.

### Nicht enthalten

- Keine Passwortanzeige, keine Klartext-Tokens und keine Auskunft über vorhandene E-Mail-Konten.
- Keine Änderung an der alten Luma, Partnerkonten oder Gesundheitsdaten.
- Kein E-Mail-Anbieter, API-Schlüssel oder Produktionsversand vor separater Auswahl und Freigabe.

## Abnahmekriterien

1. Der Link `Passwort vergessen?` ist auf der neuen Anmeldeseite sichtbar.
2. Die Anfrage zeigt für bekannte und unbekannte E-Mail-Adressen denselben neutralen Hinweis.
3. Ein gültiger Link erlaubt genau einmal ein neues Passwort; danach gelingt die Anmeldung mit dem neuen Passwort.
4. Abgelaufene, verbrauchte oder veränderte Links werden sicher abgelehnt.
5. Nach dem Zurücksetzen sind alle bisherigen Sitzungen des Kontos ungültig.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage

- Die neue Luma besitzt eigene E-Mail/Passwort-Authentifizierung unter `src/app/api/neu/auth/` sowie `new_users` und `new_sessions` in `luma_core`.
- Eine Suche im Repository zeigt derzeit keinen eingerichteten E-Mail-Anbieter und keine vorhandene Reset-Logik.
- Die alte Luma ist ausdrücklich außerhalb dieses Auftrags.

### Geplantes technisches Ziel

- Ergänze eine geschützte, ratenbegrenzte Reset-Anfrage und eine Reset-Seite ausschließlich für die neue Luma.
- Tokens müssen kryptografisch zufällig sein, nur gehasht gespeichert werden und mit Benutzerkonto, Ablaufzeit sowie einmaliger Nutzung verbunden sein.
- Die finale Passwortänderung muss Token, Ablauf und Einmaligkeit atomar prüfen, Passwort sicher hashen und alle bestehenden Sitzungen des Kontos widerrufen.
- Versandfehler dürfen keine Kontoinformation offenlegen und keinen Token in Log, URL-Fehlertext oder Antwort ausgeben.

### Daten und Schnittstellen

- **Migration nötig:** ja, ausschließlich `luma_core`, für kurzlebige kontogebundene Reset-Tokens mit sicherem Ablauf und Einmaligkeit. Vor Umsetzung ist eine separate Migrationfreigabe nötig.
- **E-Mail-Absender fehlt:** Vor Umsetzung muss die Ownerin einen Anbieter und einen verifizierten Absender festlegen. Ohne diese Entscheidung darf Claude keinen Versand simulieren, keinen Schlüssel erzeugen und keinen externen Dienst einrichten.

### Invarianten

- Keine Klartextpasswörter, Tokens, E-Mail-Adressen oder Gesundheitsdaten in Logs, Tests, Fehlermeldungen oder Commit-Nachrichten.
- Gleiche öffentliche Antwort für bekannte und unbekannte E-Mail-Adressen.
- Alte Luma, Partnerzugang und Zyklusdaten bleiben unverändert.
- Kein Dokploy, keine Produktionsvariable und kein echter Versand ohne gesonderte Freigabe.

### Pflichtprüfungen nach Entsperrung

- Bekannte und unbekannte E-Mail erhalten dieselbe sichtbare Antwort.
- Gültiger, abgelaufener, verbrauchter und manipulierter Token.
- Neues Passwort erlaubt Anmeldung; alte Sitzungen sind ungültig.
- Rate-Limit, Herkunftsprüfung, Kontotrennung, TypeScript, gezielte Auth-Regressionen, Produktions-Build und Ledger-Validierung.

### Stoppbedingungen

- Stoppe ohne gewählten, verifizierten E-Mail-Absender.
- Stoppe vor echter E-Mail-Zustellung, Providerkonto, API-Schlüssel, Dokploy oder Produktionskonfiguration ohne separate Owner-Freigabe.
- Stoppe, wenn Token-Sicherheit, neutrale Antworten oder Sitzungswiderruf nicht sicher nachweisbar sind.

## Fehlende Freigabe

Dieses Paket ist absichtlich `on_hold`. Es fehlt nur die Wahl eines sicheren E-Mail-Absenders; danach kann Codex den technischen Auftrag vervollständigen und die nötige Datenbankmigration einzeln zur Freigabe vorlegen.

## Ist – von Claude

- noch nicht umgesetzt.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Das Paket beschreibt den sicheren Zielweg vollständig, bleibt aber vor der Wahl eines E-Mail-Absenders bewusst blockiert.
- Abweichung: Keine technische Umsetzung und keine Migration sind freigegeben.
- Nächste Lücke: Einen sicheren E-Mail-Absender auswählen.

## Version 2 – Einmaliger Admin-Reset ohne E-Mail

### Owner-Ansicht – einfach erklärt

- **Wofür ist das?** Nur für die aktuelle Notlage: Das Passwort eines bestehenden neuen Luma-Kontos kann einmalig im geschützten Server-Terminal neu gesetzt werden.
- **Was machst du selbst?** Du gibst im Terminal nur deine registrierte E-Mail-Adresse und dein neues Passwort ein. Das Passwort wird nicht angezeigt und nicht in den Chat geschrieben.
- **Was passiert danach?** Das neue Passwort ersetzt das alte Passwort für dasselbe Konto. Alle alten Sitzungen werden beendet; danach meldest du dich normal neu an.
- **Was ist es nicht?** Keine öffentliche Webseite, keine Selbsthilfe für normale Nutzerinnen und kein Ersatz für den späteren E-Mail-Reset aus Version 1.

### Soll – von Codex

- Es gibt ein klar benanntes, nicht öffentliches Admin-Skript für **nur die neue Luma**.
- Das Skript läuft ausschließlich in einem kontrollierten App-/Server-Terminal mit `LUMA_CORE_DATABASE_URL`.
- Es fragt interaktiv nach E-Mail-Adresse und neuem Passwort. Die Passwort-Eingabe darf nicht im Terminal sichtbar sein und darf nicht als Befehlsargument übergeben werden.
- Vor der Änderung zeigt es die Ziel-E-Mail nur gekürzt oder verlangt eine eindeutige Bestätigung der E-Mail. Erst eine ausdrückliche Bestätigung im Terminal löst die Änderung aus.
- Das Skript hasht das neue Passwort wie die bestehende neue Registrierung, aktualisiert nur das passende `new_users.password_hash` und löscht alle `new_sessions` dieses Kontos in derselben Transaktion.
- Bei unbekannter E-Mail, fehlender Datenbankverbindung oder ungültigem Passwort bricht es sicher ab. Es zeigt nie Passwort-Hash, Datenbank-URL oder weitere Kontodaten.

### Nicht enthalten

- Keine öffentliche Reset-Seite, kein E-Mail-Versand, keine E-Mail- oder Geräteberechtigung.
- Keine Änderung an alter Luma, Partnerkonten, Zyklus-/Gesundheitsdaten oder anderen Konten.
- Keine automatische Ausführung gegen die Produktion und keine Dokploy- oder Deployment-Aktion durch Claude.

### Abnahmekriterien

1. Ein lokaler Testnutzer kann über das Skript ein neues Passwort erhalten und sich danach damit anmelden.
2. Das alte Passwort funktioniert anschließend nicht mehr.
3. Alte Sitzungen des Testnutzers sind nach dem Reset ungültig.
4. Die Passwort-Eingabe wird nicht angezeigt, geloggt oder als Prozessargument gespeichert.
5. Das Skript kann nie mehrere Konten auf einmal ändern und beendet vor der Datenänderung bei einer unklaren Ziel-E-Mail.

### Technischer Auftrag für Claude – Version 2

#### Bestätigte Ausgangslage

- `src/lib/new-auth.ts` verwendet `bcryptjs` mit Kostenfaktor 12 und speichert neue Konten in `new_users`; Sitzungen liegen in `new_sessions`.
- Die vorhandenen Luma-Core-Skripte lesen die Verbindung ausschließlich aus `LUMA_CORE_DATABASE_URL`.
- Es gibt keine bestehende öffentliche Passwort-Reset-Funktion. Ein E-Mail-Anbieter ist nicht eingerichtet und wird nicht benötigt.

#### Technisches Ziel

- Ergänze genau ein nicht öffentliches Node-Skript, zum Beispiel `scripts/reset-new-luma-password.mjs`, mit einer klaren Hilfe am Anfang: nur für einen autorisierten Notfall-Reset eines bestehenden **neuen** Luma-Kontos.
- Nutze eine lokale interaktive Eingabe. Kein Passwort darf per Command-Line-Argument, Umgebungsvariable, Log, Testausgabe oder Commit-Text weitergegeben werden. Wenn die Plattform eine verlässliche maskierte Eingabe nicht zulässt, stoppe und dokumentiere das statt das Passwort sichtbar einzulesen.
- Normalisiere die E-Mail nach dem vorhandenen neuen Auth-Verhalten und finde exakt ein Konto. Fordere vor dem Transaktionsstart eine klare Terminalbestätigung für dieselbe E-Mail an.
- Prüfe eine angemessene Passwort-Mindestlänge und hashe das neue Passwort mit derselben bcrypt-Konfiguration wie `src/lib/new-auth.ts`.
- Führe Passwort-Update und Löschung aller `new_sessions` des Zielkontos in einer Datenbanktransaktion aus. Bei Fehler wird nichts teilweise geändert.
- Beende nach Erfolg mit einer neutralen Erfolgsmeldung ohne Geheimnisse. Keine Laufzeitroute, UI, Datenmigration oder Dependency ergänzen.

#### Invarianten

- Das Skript darf nur arbeiten, wenn `LUMA_CORE_DATABASE_URL` gesetzt ist und auf die erwartete neue Datenbank zeigt.
- Keine Klartextpasswörter, Hashes, Datenbankverbindungen oder vollständigen Kontodaten in Ausgaben, Tests, Logs oder Ledger.
- Keine Änderung an alter Luma, Partner- oder Zyklusdaten und keine automatische Produktionsausführung.
- Das Skript ist kein öffentliches Feature: Es wird nicht in einer Seite, API-Route oder App-Navigation verlinkt.

#### Pflichtprüfungen

- Lokales Testkonto: Reset, Anmeldung mit neuem Passwort, Ablehnung des alten Passworts und nachgewiesene Sitzungsinvalidierung.
- Unbekannte E-Mail, fehlende Datenbankvariable, abgebrochene Bestätigung und Datenbankfehler ändern nichts.
- Quelltext-Prüfung: keine Passwort-Argumente, keine Ausgaben geheimer Werte und keine öffentliche Route.
- TypeScript soweit betroffen, gezielte Auth-Regression, Produktions-Build, Work-Package-State-Validierung und Entwicklungsledger-Validierung.
- Alle Testkonten und Testsitzungen danach löschen.

#### Stoppbedingungen

- Stoppe, wenn eine maskierte interaktive Passwort-Eingabe im Zielterminal nicht sicher möglich ist.
- Stoppe vor jeder echten Produktionsausführung. Die Ownerin muss den finalen Befehl im geschützten Terminal selbst bestätigen und ihr Passwort selbst eingeben.
- Stoppe, wenn eine Änderung nicht auf genau ein neues Luma-Konto und vollständigen Sitzungswiderruf begrenzt werden kann.

#### Abschluss durch Claude

- Ergänze `Ist Version 2`, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-005` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe nur die auftragsbezogenen Dateien. Führe keinen manuellen Deploy und keinen echten Produktions-Reset aus.
