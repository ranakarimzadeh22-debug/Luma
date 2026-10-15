---
id: WP-011
title: "Anmeldung und Registrierung ruhig vereinheitlichen"
status: completed
created: 2026-10-14
updated: 2026-10-15
owner_approved: yes
executor: claude
product_area: "Neue Luma – Anmeldung und Registrierung"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Anmeldung und Registrierung ruhig vereinheitlichen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Die vorhandenen Seiten zum Anmelden und Konto-Erstellen sollen klar, ruhig und passend zueinander aussehen.
- **Warum machen wir das?** Du möchtest die bestehende App zuerst sauber und einheitlich gestalten, bevor neue Funktionen dazukommen.
- **Woher kam die Idee?** Owner-Entscheidung vom 2026-10-14, Akte APP-IDEA-018.
- **Wo ist es in der App?** Nur auf `/neu/anmelden` und `/neu/registrieren`.
- **Was gehört ausdrücklich nicht dazu?** Kein neues Login, kein Passwort-Reset, keine E-Mail, keine Sicherheits- oder Datenänderung und keine Partnerseiten.
- **Was kannst du danach ausprobieren?** Du siehst auf beiden Seiten denselben klaren Aufbau und kannst dich weiterhin anmelden oder ein Konto erstellen.

## Entstehungsweg

`Wunsch nach einheitlicher bestehender App → Zugangseiten sollen zum ruhigen Home-Screen passen → vorhandene Anmeldung und Registrierung behutsam vereinheitlichen → WP-011`

- Ausgangsidee oder Problem: Die vorhandenen Zugangseiten sollen vor weiteren Funktionen klar und nicht ueberladen wirken.
- bestaetigte Wirkung: Nutzerinnen erkennen auf beiden Seiten leicht, ob sie sich anmelden oder ein neues Konto erstellen wollen.
- gewaehlte Loesung: Ausschliesslich vorhandene Texte, Abstaende und visuelle Hierarchie auf den beiden Owner-Zugangseiten pruefen und nur bei echter Uneinheitlichkeit anpassen.
- wichtige Entscheidung(en): Keine neue Zugangsfaehigkeit und keine Beruehrung des offenen Passwort-Reset-Themas WP-005.
- Quellen/Akten: APP-IDEA-018, WP-005, WP-010.

## Soll – von Codex

- Problem: Anmeldung und Registrierung der neuen Luma sollen als einfacher, zusammenpassender Zugang wirken.
- gewuenschte Wirkung: Die passende Handlung ist auf beiden Seiten sofort erkennbar; die Seiten bleiben ruhig und leicht lesbar.
- sichtbare Aenderung: Bestehende Ueberschrift, Erklaerung, Formularbereich, Wechsel-Link und Zurueck-Link sind in Sprache, Reihenfolge, Abstaenden und visueller Hierarchie konsistent, soweit sie dieselbe Rolle haben.
- nicht enthalten: Keine neue Seite, Route, Schaltflaeche oder Kontoart; keine Passwort-zuruecksetzen-Funktion; keine Aenderung an Passwortregeln, Validierung, Fehlertextbedeutung, Authentifizierung, Sitzungen, API, Datenbank, E-Mail oder Partner-Anmeldung/-Registrierung.
- Abnahmekriterien:
  1. `/neu/anmelden` zeigt weiterhin deutlich Anmeldung, Formular, Link zur Registrierung und Rueckweg.
  2. `/neu/registrieren` zeigt weiterhin deutlich Konto erstellen, Formular, Link zur Anmeldung und Rueckweg.
  3. Gleichartige Elemente auf beiden Seiten wirken sichtbar einheitlich; die beiden unterschiedlichen Hauptaktionen bleiben klar unterscheidbar.
  4. Bestehende Eingaben, Fehlermeldungen, Weiterleitungen und `autoComplete`-Angaben bleiben unveraendert funktional.
  5. Mobile und breite Ansicht sind ohne horizontalen Ueberlauf; keine neue Card, Information oder Bedienung wird hinzugefuegt.
- ein Pruefschritt fuer den Owner: Beide Seiten nacheinander oeffnen, die Links zwischen Anmeldung und Registrierung pruefen und jeweils eine harmlose Fehleingabe ausprobieren, ohne ein neues Konto erzeugen zu muessen.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnoetige Schritt-fuer-Schritt-Loesung.

### Bestaetigte Ausgangslage im Code

- `src/app/neu/anmelden/page.tsx` und `src/app/neu/registrieren/page.tsx` sind die bestehenden Owner-Seiten der neuen Luma. Beide verwenden bereits denselben aeusseren Seiten- und Section-Aufbau.
- `src/components/NewLoginForm.tsx` enthaelt die bestehende E-Mail-/Passwort-Anmeldung mit `POST /api/neu/auth/login` und Weiterleitung nach `/neu`.
- `src/components/NewRegisterForm.tsx` enthaelt die bestehende Registrierung mit Vorname, E-Mail, Passwort, Passwortwiederholung und `POST /api/neu/auth/register`.
- WP-005 ist das getrennte, weiterhin offene Passwort-Reset-Thema. Es darf durch dieses Paket weder sichtbar noch technisch erweitert werden.

### Technisches Ziel

- Pruefe die sichtbare Sprache und visuelle Hierarchie der vorhandenen Owner-Anmeldung und -Registrierung auf echte Uneinheitlichkeiten.
- Passe ausschliesslich statische Texte und Darstellungsklassen in den genannten Seiten/Formularen an, soweit dies fuer ruhige Gleichartigkeit bei unveraenderter Bedeutung notwendig ist.
- Gleichartige Elemente sollen denselben Aufbau und dieselbe Gewichtung haben; die Hauptaktionen `Anmelden` und `Konto erstellen` bleiben getrennte, klar benoetigte Handlungen.

### Invarianten – muessen unveraendert bleiben

- `getNewAuthSession`-Weiterleitungen, `NewLoginForm`-/`NewRegisterForm`-Submit-Handler, API-Routen, Request-Payloads, Passwortvalidierung, Fehlermeldungsbedingungen, Weiterleitungen und `autoComplete`-Werte bleiben unveraendert.
- Keine neue Authentifizierungs-, Passwort- oder Kontofunktion. Insbesondere kein Link, Screen, Versand oder Datenmodell fuer `Passwort vergessen`.
- Partner-Anmeldung und Partner-Registrierung, alte Luma, Rolle, Home-Screen, Einstellungen und alle Gesundheits- und Partnerdaten bleiben unveraendert.
- Keine neue Card, Box, Information, Interaktion, Abhaengigkeit, Route oder Datenbankwirkung.
- Zuganglichkeit der bestehenden Eingaben, Labels, Fokusdarstellung und Fehlerausgaben muss erhalten bleiben.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Pruefe auf beiden Seiten die sichtbare Reihenfolge, Links, Eingabefelder, Submit-Aktion und Rueckweg.
- Pruefe mit harmloser ungueltiger Eingabe, dass bestehende Fehlerwege und Validierung unveraendert funktionieren, ohne Testkonto anzulegen.
- Pruefe, dass die Login- und Register-Requests weiterhin unveraendert an ihre bestehenden Routen gehen und keine Passwort-Reset-Funktion hinzugekommen ist.
- Fuehre TypeScript und eine mobile sowie breite Sichtpruefung inklusive fehlendem horizontalen Ueberlauf aus.

### Stoppbedingungen

- Stoppe und dokumentiere eine offene Frage vor jeder Aenderung an Anmeldung, Passwort, E-Mail, Sicherheitslogik, API, Datenbank oder Sitzung.
- Stoppe, wenn eine vorgeschlagene Textaenderung die Bedeutung einer bestehenden Fehler- oder Sicherheitsmeldung veraendern wuerde.
- Stoppe vor einer Ausweitung auf Partnerseiten, die alte Luma oder weitere Screens.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger fuer diese sichtbare Aenderung ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-011` ausfuehren.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - Vollständige Prüfung von `src/app/neu/anmelden/page.tsx`, `src/app/neu/registrieren/page.tsx`, `src/components/NewLoginForm.tsx` und `src/components/NewRegisterForm.tsx` auf echte Uneinheitlichkeiten in Sprache, Reihenfolge, Abständen und visueller Hierarchie.
  - Ergebnis der Prüfung: Beide Seiten nutzen bereits identisch denselben äußeren Aufbau (gleicher `main`/`section`-Rahmen, gleiche Klassen) und dieselbe Reihenfolge (Eyebrow „Neue App“ → Überschrift → Erklärung → Formular → Wechsel-Link → Zurück-Link). Beide Formulare nutzen bereits identische Klassen für Labels, Eingabefelder, Fehlerausgabe (`role="alert"`, `text-sm text-red-700`) und Submit-Button (`rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50`).
  - Es wurde keine echte Uneinheitlichkeit bei gleichartigen Elementen gefunden. Alle verbleibenden Unterschiede (Überschriftentext, Erklärungstext, Feldanzahl, Button-Text, Link-Ziel, Routen) sind fachlich notwendig unterschiedlich, da Anmeldung und Registrierung unterschiedliche Informationen und Handlungen abbilden – eine Angleichung dieser Unterschiede wäre eine Bedeutungsänderung und laut Auftrag ausdrücklich nicht vorgesehen.
  - Da laut Soll nur „bei echter Uneinheitlichkeit“ angepasst werden soll, wurde **keine Code-Änderung vorgenommen**. Der Auftrag ist damit durch die Prüfung selbst erfüllt: Die Seiten sind bereits ruhig, klar und konsistent zueinander.
- **nicht umgesetzt:** keine Code-Änderung, da kein echter Änderungsbedarf gefunden wurde (siehe oben). Nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `npx tsc --noEmit`: keine Fehler.
  - Mobile (375×800) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server, ohne ein Testkonto anzulegen: Beide Seiten zeigen weiterhin alle bestehenden Elemente (Überschrift, Felder, Submit-Button, Wechsel-Link, Zurück-Link); der Link von Anmelden zu Registrieren und zurück funktioniert; eine harmlose Fehleingabe auf `/neu/anmelden` (zu kurzes Passwort) wird weiterhin durch die bestehende `minLength`-Validierung ohne Submit abgefangen; eine harmlose Fehleingabe auf `/neu/registrieren` (unterschiedliche Passwörter) zeigt weiterhin unverändert die bestehende Meldung „Die Passwörter stimmen nicht überein.“ ohne dass ein Konto angelegt wird. Kein horizontaler Überlauf auf beiden Seiten und Breiten. Screenshots geprüft: beide Seiten erscheinen bereits einheitlich gestaltet. Playwright danach vollständig entfernt.
  - Kein neues Testkonto wurde angelegt; die Datenbank wurde durch diese Prüfung nicht verändert.
- **Abweichungen:** keine fachliche Abweichung. Keine Code-Änderung war nötig, da beide Seiten bereits vollständig konsistent sind – das ist das erwartete Ergebnis bei einem „nur bei echter Uneinheitlichkeit anpassen“-Auftrag, keine unvollständige Umsetzung.
- **offene Punkte:**
  - Keine. Owner hat die Prüfung am 2026-10-15 bestätigt und akzeptiert.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** b27c695 (Dokumentation; keine Quelltextänderung).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschaerfung:
- Product-Map aktualisiert: nein.
