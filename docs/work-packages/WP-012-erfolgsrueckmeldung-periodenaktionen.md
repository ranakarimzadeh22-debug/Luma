---
id: WP-012
title: "Kurze Erfolgsrueckmeldung nach Periodenaenderungen"
status: review
created: 2026-10-14
updated: 2026-10-14
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Kurze Erfolgsrueckmeldung nach Periodenaenderungen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach einer erfolgreichen Aenderung zeigt Luma kurz, dass sie gespeichert wurde.
- **Warum machen wir das?** Die App soll leichter zu bedienen sein. Du sollst nicht raten muessen, ob eine Aenderung angekommen ist.
- **Woher kam die Idee?** Owner-Entscheidung vom 2026-10-14, Akte APP-IDEA-021.
- **Wo ist es in der App?** Nur auf deiner eigenen Home-Seite `/neu`.
- **Was gehoert ausdruecklich nicht dazu?** Kein neuer Speicherweg, keine Daten- oder API-Aenderung, keine Partneransicht und keine Benachrichtigung ausserhalb der geoeffneten App.
- **Was kannst du danach ausprobieren?** Du traegst einen Beginn oder ein Ende ein, aenderst eine Periode oder loeschst einen Randtag. Danach erscheint kurz `Gespeichert.` oder `Geloescht.`

## Entstehungsweg

`Wunsch nach leichterer Bedienung → nach erfolgreicher Aktion fehlt eine unmittelbare Bestaetigung → kurzer selbstschliessender Hinweis → WP-012`

- Ausgangsidee oder Problem: Nach einer Periodenaenderung soll direkt klar sein, ob sie erfolgreich war.
- bestaetigte Wirkung: Die Nutzerin bekommt eine einfache positive Rueckmeldung ohne Suche im Kalender.
- gewaehlte Loesung: Ein kleiner Hinweis ausschliesslich nach bereits erfolgreichen bestehenden Aktionen.
- wichtige Entscheidung(en): Fehler bleiben Fehler und erhalten keine Erfolgsmeldung; der Hinweis ist keine Push-Benachrichtigung.
- Quellen/Akten: APP-IDEA-021, WP-003, WP-006.

## Soll – von Codex

- Problem: Der Erfolg bestehender Periodenaktionen soll sofort sichtbar sein.
- gewuenschte Wirkung: Nach einer erfolgreichen Aenderung erscheint genau eine kurze, unaufdringliche Rueckmeldung.
- sichtbare Aenderung: Auf `/neu` erscheint nach erfolgreichem Speichern oder Aendern `Gespeichert.` und nach erfolgreichem Loeschen `Geloescht.`; der Hinweis schliesst sich nach kurzer Zeit selbst und ist auf Wunsch schliessbar.
- nicht enthalten: Keine Aenderung an Periodendaten, Validierung, Vorhersage, Zyklus-Kreis, Historie, Partneransicht, API, Datenbank, Authentifizierung, Push oder System-Benachrichtigungen.
- Abnahmekriterien:
  1. Erfolgreiches Anlegen oder Bearbeiten einer Periode, Setzen von Beginn/Ende und Speichern der Zykluslaenge zeigt genau einen Hinweis `Gespeichert.`
  2. Erfolgreiches Loeschen eines Randtags oder einer einzelnen Periode zeigt genau einen Hinweis `Geloescht.`
  3. Bei einem bestehenden Fehlerpfad erscheint keine Erfolgsmeldung; die bisherige Fehlermeldung bleibt erhalten.
  4. Der Hinweis verschwindet automatisch, kann geschlossen werden und ist fuer Screenreader als Status erkennbar.
  5. Der vorhandene Start-Hinweis ohne Daten wird nicht doppelt ueberlagert; gleichzeitig ist hoechstens ein Hinweis sichtbar.
  6. Mobil und breit bleibt alles ohne horizontalen Ueberlauf und ohne verdeckte Kalenderbedienung.
- ein Pruefschritt fuer den Owner: Auf `/neu` einen vergangenen neutralen Tag als Periodenbeginn speichern und danach einen Randtag loeschen. Nach beiden Aktionen erscheint der passende kurze Hinweis.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnoetige Schritt-fuer-Schritt-Loesung.

### Bestaetigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` enthaelt die bestehende Owner-Home-Ansicht und alle betroffenen lokalen Erfolgswege: `handlePeriodSaved`, `handlePeriodDeleted`, `handleCycleLengthSaved`, `beginPeriodAtSelectedDay`, `endPeriodAtSelectedDay` und `confirmDeleteEdge`.
- In derselben Komponente existiert bereits `NoDataToast`: ein sichtbarer, selbstschliessender Hinweis mit `role="status"`, `aria-live="polite"` und eigenem Schliessen-Button. Er ist ein vorhandenes Muster, keine Perioden-Erfolgsmeldung.
- Fehler der direkten Tagesaktionen laufen ueber `dayActionError`; die Formularfehler verbleiben in ihren vorhandenen Formularen. Diese Fehlerwege duerfen nicht veraendert werden.

### Technisches Ziel

- Fuege ausschliesslich in `NewCycleExample.tsx` einen kleinen, erreichbaren Erfolgshinweis fuer erfolgreiche bestehende Aktionen hinzu. Vorhandenes Hinweis-Muster darf sicher wiederverwendet oder passend verallgemeinert werden.
- Setze die Erfolgsmeldung erst nach einer erfolgreichen Antwort beziehungsweise nach dem bereits bestehenden erfolgreichen Callback. Nutze `Gespeichert.` fuer erfolgreiche Speicher-/Aenderungswege und `Geloescht.` fuer erfolgreiche Loeschwege.
- Sorge dafuer, dass der neue Hinweis automatisch verschwindet, manuell geschlossen werden kann und niemals parallel zum bestehenden `NoDataToast` angezeigt wird.

### Invarianten – muessen unveraendert bleiben

- Alle bestehenden Requests, Payloads, Validierungen, Fehlertexte, `router.refresh()`-Aufrufe, Zustandsaktualisierungen und Modal-Schliesswege bleiben unveraendert.
- Kein Erfolgshinweis bei abgebrochener, fehlgeschlagener oder ungueltiger Aktion.
- Keine neue Route, API, Datenbankwirkung, Migration, Abhaengigkeit, Benachrichtigung ausserhalb der aktuell geoeffneten App oder Partnerfunktion.
- Start-Hilfe, Heute-Karte, Zyklus-Kreis, Kalender, Historie, Vorhersagen und Partneransicht bleiben unveraendert.
- Der Hinweis verdeckt weder offene Modals noch dauerhaft die Kalenderbedienung und behaelt eine zugaengliche Statusankuendigung.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Pruefe jeden vorhandenen erfolgreichen Pfad: Formular-Speichern, Tagesbeginn, Tagesende, Randtag-/Einzeltag-Loeschen und Zykluslaengen-Speichern.
- Pruefe einen fehlgeschlagenen direkten Tagesweg und einen bestehenden Formularfehler: keine Erfolgsmeldung, bisheriger Fehler bleibt sichtbar.
- Pruefe automatische Schliessung, manuellen Schliessen-Button, `role="status"`/`aria-live`, und dass Start-Hinweis und Erfolgshinweis nicht gleichzeitig sichtbar sind.
- Fuehre bestehende Perioden-, Tagesfenster-, Start-Hilfe- und Kalenderregressionen, TypeScript sowie mobile/breite Sichtpruefung ohne horizontalen Ueberlauf aus.

### Stoppbedingungen

- Stoppe vor jeder Aenderung an Periodenlogik, API, Datenbank, Partneransicht, Push oder sonstigen System-Benachrichtigungen.
- Stoppe, wenn der Erfolg einer bestehenden Aktion nicht sicher vom Fehler unterscheidbar ist.
- Stoppe, wenn ein gemeinsames Hinweis-Muster den bestehenden Ohne-Daten-Hinweis oder die Bedienung eines Modals nicht sicher ohne Ueberlagerung behandeln kann.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger fuer diese sichtbare Aenderung ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-012` ausfuehren.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - In `src/components/NewCycleExample.tsx` wurde eine neue, eigenständige `ActionToast`-Komponente ergänzt: dasselbe visuelle und zugängliche Muster wie das bestehende `NoDataToast` (`role="status"`, `aria-live="polite"`, fixierte Position, automatisches Schließen nach einer festen Dauer, manueller Schließen-Button), aber mit einer frei übergebenen Nachricht statt der festen Ohne-Daten-Nachricht. `NoDataToast` selbst wurde nicht verändert, um dessen bestehendes Verhalten sicher zu erhalten.
  - Neuer lokaler Zustand `actionToastMessage` sowie eine kleine Hilfsfunktion `showActionToast(message)`, die den Start-Hinweis (`isNoDataToastVisible`) ausblendet, bevor die Erfolgsmeldung gesetzt wird. Beim Rendern wird bei vorhandener `actionToastMessage` ausschließlich `ActionToast` gezeigt, sonst ggf. `NoDataToast` – beide erscheinen dadurch nie gleichzeitig.
  - `showActionToast("Gespeichert.")` wurde in allen vier bestehenden Erfolgswegen für Speichern/Ändern ergänzt: `handlePeriodSaved` (Formular-Speichern/-Ändern), `handleCycleLengthSaved` (Zykluslänge speichern), `beginPeriodAtSelectedDay` (Tagesbeginn setzen), `endPeriodAtSelectedDay` (Tagesende setzen) – jeweils unmittelbar nach der bestehenden erfolgreichen Antwort, vor dem bereits vorhandenen `router.refresh()`.
  - `showActionToast("Gelöscht.")` wurde in beiden bestehenden Erfolgswegen für Löschen ergänzt: `handlePeriodDeleted` (Formular-Löschen einer ganzen Periode) sowie in beiden Zweigen von `confirmDeleteEdge` (Einzeltag-Löschen und Randtag-Löschen).
  - Alle bestehenden Requests, Payloads, Validierungen, Fehlertexte (`dayActionError`, Formularfehler), `router.refresh()`-Aufrufe, Zustandsaktualisierungen und Modal-Schließwege wurden nicht verändert – der neue Aufruf steht jeweils zusätzlich, ausschließlich im bereits bestehenden Erfolgszweig nach der vorhandenen Fehlerprüfung.
  - Keine neue Route, API, Datenbankwirkung, Migration, Abhängigkeit, Push- oder System-Benachrichtigung. Start-Hilfe, Heute-Karte, Zyklus-Kreis, Kalender, Historie, Vorhersagen und Partneransicht wurden nicht berührt.
  - **Technische Anmerkung zur Textschreibweise:** Der Soll-Text im Auftrag ist durchgängig ASCII-transliteriert geschrieben (z. B. „Geloescht.“, „Aenderungswege“), während die App selbst durchgängig korrekte deutsche Umlaute verwendet (auch in bestehenden, unveränderten Fehlertexten wie „Der Periodentag konnte nicht gelöscht werden.“). Umgesetzt wurde daher die bedeutungsgleiche, mit dem bestehenden Sprachstil der App konsistente Schreibweise „Gelöscht.“ statt der wörtlichen ASCII-Form „Geloescht.“ aus dem Auftragstext.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-action-success-toast.ts`: gezielte Quelltext-Prüfungen bestätigen, dass `ActionToast` `role="status"`/`aria-live="polite"`, automatisches Schließen und einen manuellen Schließen-Button besitzt; dass `showActionToast` den Start-Hinweis ausblendet und dass im Rendering nie beide Hinweise gleichzeitig erscheinen können; dass alle sechs bestehenden Erfolgswege (`handlePeriodSaved`, `handleCycleLengthSaved`, `beginPeriodAtSelectedDay`, `endPeriodAtSelectedDay`, `handlePeriodDeleted`, beide Zweige von `confirmDeleteEdge`) die passende Meldung auslösen; und dass bei den drei direkten Tagesaktionen der Fehlerpfad (`setDayActionError`) im Quelltext vor dem Erfolgshinweis steht (kein Erfolgshinweis bei Fehler). Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-day-detail.ts`, `scripts/verify-period-day-actions.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-home-screen-layout.ts`, `scripts/verify-home-actions-consistent.ts`.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert.
  - Mobile (375×800) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit echten Testkonten: Tagesbeginn setzen an einem freien Kalendertag löste in beiden Breiten sichtbar „Gespeichert.“ aus; der Hinweis ließ sich manuell über den Schließen-Button schließen und schloss sich in einem weiteren Durchlauf automatisch nach kurzer Zeit von selbst; anschließendes Löschen des gerade gesetzten (laufenden) Periodentags über das Tagesfenster → „Periodentag löschen?“ → „Endgültig löschen“ löste sichtbar „Gelöscht.“ aus (mobil vollständig bestätigt inkl. automatischem Schließen; in der breiten Ansicht wurde stattdessen – weil im selben Testkonto bereits eine laufende Periode aus dem vorherigen Schritt bestand – beim erneuten Versuch, denselben Zeitraum erneut als Beginn zu speichern, korrekt die bestehende Fehlermeldung „Dieser Zeitraum überschneidet sich mit einer bereits gespeicherten Periode.“ ohne jede Erfolgsmeldung angezeigt, was den Soll-Punkt „keine Erfolgsmeldung bei Fehler“ zusätzlich bestätigt). Kein horizontaler Überlauf in beiden Breiten. Screenshots geprüft. Playwright und alle Testkonten danach vollständig entfernt.
- **Abweichungen:**
  - Sprachliche Schreibweise „Gelöscht.“ statt der ASCII-transliterierten Auftragsschreibweise „Geloescht.“ – bedeutungsgleich, konsistent mit dem bestehenden Sprachstil der App (siehe technische Anmerkung oben).
  - Keine fachliche Abweichung vom Soll-Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: Auf `/neu` einen vergangenen neutralen Tag als Periodenbeginn speichern und danach einen Randtag löschen. Nach beiden Aktionen soll der passende kurze Hinweis erscheinen.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** 7e64881.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschaerfung:
- Product-Map aktualisiert: nein.
