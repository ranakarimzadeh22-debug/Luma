---
id: WP-004
title: "Sichere Partnerverbindung mit persönlichem Code"
package_revision: 1
status: on_hold
created: 2026-09-10
updated: 2026-09-10
owner_approved: yes
executor: claude
product_area: "Alte und neue Luma – Partnerverbindung"
brief_version: 1
technical_brief: blocked
migration_approval: pending
---

# Aufgabe: Sichere Partnerverbindung mit persönlichem Code

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Eine Person kann im eigenen Bereich einen kurzen Verbindungscode erzeugen. Der Partner meldet sich mit einem eigenen Konto an und gibt diesen Code ein. Danach sind genau diese beiden Konten verbunden.
- **Warum machen wir das?** Der Partner soll nur die später ausdrücklich freigegebenen Informationen sehen, niemals den privaten Bereich der anderen Person.
- **Woher kam die Idee?** Aus `APP-IDEA-014` und den Entscheidungen DEC-106 bis DEC-114.
- **Wo ist es in der App?** Nach der Auswahl `Alte App` oder `Neue App` folgt die Rollenwahl `Für mich selbst` oder `Für meinen Partner / meine Partnerin`. Den Code gibt es später im privaten Profil oder in den Einstellungen.
- **Was gehört ausdrücklich nicht dazu?** Noch kein Partnerkalender, keine Anzeige von Periodendaten, keine Push-Nachricht, keine medizinische Vorhersage und keine Vermischung von alter und neuer Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie kann für ihren eigenen Bereich einen Code erzeugen. Der Partner löst ihn nach der eigenen Anmeldung ein und sieht nur die neutrale Meldung `Verbindung aktiv`.

## Entstehungsweg

`Private Zyklusdaten sollen nicht offen geteilt werden → klar begrenzte Verbindung zwischen zwei eigenen Konten → einmaliger, kurzer und sicher gespeicherter Code → WP-004`

- Ausgangsidee oder Problem: Ein früherer Link-Weg war nur eine Grundidee; eine sichere und eindeutige Partnerverbindung fehlte.
- bestätigte Wirkung: Genau ein Partnerkonto erhält nur nach ausdrücklicher Verbindung Zugriff auf einen späteren begrenzten Partnerbereich. Die Person mit den Zyklusdaten kann die Verbindung bewusst beenden.
- gewählte Lösung: Ein weltweit eindeutiger Code gilt zehn Minuten und kann genau einmal eingelöst werden. Eine aktive Verbindung gehört genau einem Paar.
- wichtige Entscheidung(en): DEC-106 bis DEC-114.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

## Soll – von Codex

- Nach `Alte App` und nach `Neue App` erscheint dieselbe einfache Rollenwahl: `Für mich selbst` oder `Für meinen Partner / meine Partnerin`.
- Die Rollenwahl ist geschlechtsneutral. Sie entscheidet nur über den folgenden Weg, nicht über persönliche Eigenschaften.
- Der Selbst-Weg führt wie bisher zum jeweiligen privaten Login und Bereich.
- Der Partner-Weg verlangt ein eigenes Konto. Erst danach kann ein Verbindungscode eingegeben werden.
- Eine Person im Selbst-Weg kann im jeweiligen eigenen Profil oder Einstellungsbereich einen Verbindungscode erzeugen und bewusst erneuern.
- Ein Code ist weltweit eindeutig, nur zehn Minuten gültig und nach der ersten erfolgreichen Einlösung dauerhaft ungültig.
- Eine erfolgreiche Einlösung verbindet genau das eigene Partnerkonto mit genau einem privaten Bereich derselben App-Variante.
- Pro privatem Bereich gibt es höchstens eine aktive Partnerverbindung. Eine neue Verbindung ist erst nach einem bewussten Beenden der bestehenden Verbindung möglich.
- Nach einer aktiven Verbindung zeigt der Partner-Weg nur eine neutrale, eingeschränkte Ansicht `Verbindung aktiv`. Sie enthält noch keine Zyklus- oder Kalenderdaten.
- Nach dem Beenden einer Verbindung ist der bisherige Partner sofort nicht mehr berechtigt und sieht keinen Partnerbereich mehr.

### Nicht enthalten

- Partnerkalender und jede Anzeige echter Periodenstarts oder -enden.
- Push-Benachrichtigungen, Geräteberechtigung oder E-Mail-Erinnerungen.
- Vorhersagen, PMS, Eisprung, Zykluslänge, Historie, Profilangaben oder Bearbeitungsrechte für Partner.
- Verbindung zwischen alter und neuer App, Kopieren von Daten oder gemeinsamer Datenbankzugriff.

### Abnahmekriterien

1. Die Rollenwahl ist nach beiden App-Varianten sichtbar und verständlich.
2. Ein Partner kann ohne eigenes Konto und ohne gültigen Code keinen Partnerbereich öffnen.
3. Ein Code funktioniert genau einmal innerhalb von zehn Minuten; abgelaufene, verbrauchte, falsche oder eigene Codes verbinden nichts.
4. Ein Paar bleibt strikt von allen anderen Paaren getrennt.
5. Eine bestehende Verbindung muss bewusst beendet werden, bevor ein neuer Partner verbunden werden kann.
6. Nach dem Beenden verliert das alte Partnerkonto beim nächsten Zugriff sofort den Zugriff.
7. Die Partneransicht zeigt in diesem Paket keine Gesundheits- oder Zyklusdaten.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt die benötigten Sicherheitsgrenzen und Startpunkte. Er schreibt keine unnötige interne Umsetzungsschrittfolge vor.

### Bestätigte Ausgangslage im Code

- `src/app/page.tsx` zeigt derzeit die Auswahl `Alte App` (`/login`) und `Neue App` (`/neu`).
- Der neue Weg besitzt eigene E-Mail/Passwort-Authentifizierung unter `src/app/api/neu/auth/` und serverseitige Sitzungen in `src/lib/new-auth.ts`.
- `database/luma-core/migrations/202608261700_new_auth.sql` sowie spätere Migrationen definieren die getrennten neuen Tabellen, insbesondere `new_users` und `new_sessions`.
- `src/components/AppProviders.tsx` trennt `/neu` bereits von den alten Auth-Providern. Alte Luma nutzt ihren bestehenden, getrennten Auth- und Datenweg.
- Für die neue App existiert noch kein eigener Profil-/Einstellungsweg und keine Partnerverbindungslogik. Claude muss für die alte Luma den passenden bestehenden Auth- und Datenstartpunkt vor einer Änderung lesend bestimmen.

### Technisches Ziel

- Ergänze nach der App-Auswahl in beiden Varianten eine klare Rollenroute oder gleichwertige Navigation. Sie darf nicht die bestehende Anmeldung umgehen.
- Baue den sicheren Verbindungskern für alte und neue Luma **getrennt**: Ein Code und eine Verbindung gelten nur für dieselbe App-Variante und deren eigene Datenbasis.
- Codes werden kryptografisch zufällig erzeugt, nur gehasht gespeichert und niemals im Klartext geloggt oder später aus der Datenbank abgelesen.
- Das Erzeugen, Einlösen, Erneuern und Beenden erfolgt ausschließlich serverseitig, sitzungsgebunden, mit Herkunftsprüfung sowie Rate-Limit gegen wiederholtes Raten.
- Das Einlösen muss atomar sein: Ablauf, Einmaligkeit, Eigentümer, App-Variante und bereits vorhandene aktive Verbindungen sind gemeinsam zu prüfen. Zwei parallele Einlösungen dürfen nie denselben Code oder Bereich doppelt verbinden.
- Ein Partner darf den eigenen Code nicht einlösen. Eine aktive Verbindung darf nur die dafür bestimmte eingeschränkte Partnerroute öffnen.
- Die anfängliche Partnerroute ist ein geschützter Platzhalter ohne Gesundheitsdaten. Sie muss bei fehlender, widerrufener oder fremder Verbindung schließen oder zu einem neutralen, nicht verräterischen Hinweis führen.
- Der Code wird im klar bezeichneten eigenen Profil-/Einstellungsbereich gezeigt. Falls ein solcher Weg fehlt, darf Claude eine minimale geschützte Einstellung nur für Code erzeugen; keine allgemeine Profilfunktion erweitern.

### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, getrennt für die Datenbasis der neuen und der alten Luma. Diese Migration ist noch **nicht freigegeben**; bis zur ausdrücklichen Owner-Freigabe bleibt die Arbeit gestoppt.
- **Neue Luma (`luma_core`):** Ergänze getrennte, kontogebundene Daten für kurzlebige Code-Ausgaben und aktive Partnerverbindungen. Die Verbindung braucht mindestens Eigentümerkonto, Partnerkonto, App-Variante, aktiven/beendeten Zustand sowie sichere Zeitstempel. Datenbank-Constraints und eindeutige Indizes müssen eine doppelte aktive Zuordnung verhindern.
- **Alte Luma:** Erst den vorhandenen Auth- und Migrationsweg lesend feststellen. Dann ein gleichwertiges, aber von `luma_core` getrenntes Modell ergänzen. Niemals neue Luma-Konten oder Daten in die alte Datenbasis schreiben oder umgekehrt.
- **API-Wirkung:** geschützte Endpunkte für Code erzeugen/erneuern, einlösen, Verbindungsstatus lesen und Verbindung beenden. Keine Perioden-, Zyklus- oder Profil-API darf in diesem Paket für Partner geöffnet werden.

### Invarianten – müssen unverändert bleiben

- Bestehende Nutzerkonten, Sitzungen, Passwörter, Perioden und Zyklusdaten werden nicht umgeschrieben oder kopiert.
- Alte und neue Luma bleiben auth-, routen- und datengetrennt.
- Ohne aktive Verbindung gibt es keinen Partnerzugriff. Eine Verbindung gibt nie Zugang zum privaten Owner-Bereich.
- Ein Partner kann keine Daten bearbeiten und sieht in WP-004 keine Gesundheitsdaten.
- Keine Klartextcodes in Datenbank, Logs, Entwicklungsledger, Tests, Screenshots oder Fehlermeldungen.
- Kein Push und keine Benachrichtigung in diesem Paket.

### Pflichtprüfungen

- Code-Lebenszyklus: erzeugen, innerhalb von zehn Minuten genau einmal einlösen; danach erneuter Versuch ablehnen.
- Abgelaufenen, falschen, fremden und eigenen Code ablehnen, ohne Details über fremde Konten preiszugeben.
- Parallele Einlöseversuche testen: höchstens eine Verbindung entsteht.
- Eindeutigkeit und Kontotrennung für mindestens zwei verschiedene Paare prüfen.
- Bestehende aktive Verbindung blockiert eine zweite Verbindung, bis die Owner-Person sie bewusst beendet.
- Nach dem Beenden blockiert die Partnerroute sofort; ein neuer Code kann erst danach eine neue Verbindung herstellen.
- Rollenwahl, Registrierung/Anmeldung, Partner-Placeholder und Widerruf auf Mobile prüfen; kein horizontaler Überlauf.
- Bestehende alte und neue Auth-Regressionen, TypeScript, gezielte Sicherheitsprüfung, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- **Harter Stopp bis zur neuen ausdrücklichen Owner-Freigabe:** keine Datenbankmigration, kein Schema, keine Produktionsänderung ausführen.
- Stoppe, wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt. Dokumentiere den Befund, statt Daten zwischen den Wegen zu vermischen.
- Stoppe vor Kalenderfreigabe, Periodendaten, Push, Prognosen, Berechtigungs-Ausweitung oder einer zweiten aktiven Partnerverbindung.
- Stoppe, wenn klare Abmeldung, Widerruf oder atomare Einlösung nicht sicher nachweisbar sind.

### Abschluss durch Claude

- Nach der Migrationsfreigabe: `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-004` sowie `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und pushen. Ein Deploy bleibt eine getrennte Freigabe.

## Ist – von Claude

- umgesetzt: noch nicht gestartet.
- nicht umgesetzt: gesamter Umfang; die Datenmigration ist nicht freigegeben.
- Tests: noch keine.
- Abweichungen: keine.
- offene Punkte: ausdrückliche Owner-Freigabe der getrennten Datenbankmigrationen für alte und neue Luma.
- Commit: keiner.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: WP-004 ist als ausführbares Konzept mit klaren Grenzen vorbereitet, aber wegen der notwendigen Datenmigration bewusst `on_hold`.
- Nachschärfung: keine offene Produktfrage für den Verbindungskern. Partnerkalender und Push sind ausdrücklich spätere, getrennte Arbeitspakete.
- Product-Map aktualisiert: ja.
