---
id: WP-010
title: "Home-Aktionen ruhig vereinheitlichen"
status: review
created: 2026-10-11
updated: 2026-10-11
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Home-Aktionen ruhig vereinheitlichen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Auf deiner eigenen Startseite sollen die bereits vorhandenen Texte und Buttons klarer zusammenpassen.
- **Warum machen wir das?** Du möchtest die vorhandene App zuerst ruhig, sauber und einheitlich machen, bevor neue Funktionen dazukommen.
- **Woher kam die Idee?** Owner-Entscheidung vom 2026-10-11, Akte APP-IDEA-017.
- **Wo ist es in der App?** Nur auf deiner eigenen Home-Seite `/neu`.
- **Was gehört ausdrücklich nicht dazu?** Keine neue Funktion, kein neuer Button, keine neue Karte oder Box, keine Datenänderung und keine Partneransicht.
- **Was kannst du danach ausprobieren?** Du prüfst, dass die Hauptaktion klar hervorsticht und die kleineren Hilfsaktionen einheitlich wirken; alle bisherigen Klicks funktionieren weiter.

## Entstehungsweg

`Wunsch nach Aufraeumen der bestehenden App → ruhiger, einheitlicher Home-Screen → bestehende Aktionstexte und Buttons gezielt vereinheitlichen → WP-010`

- Ausgangsidee oder Problem: Die vorhandene App soll vor weiteren Funktionen sauber, passend und nicht ueberladen wirken.
- bestaetigte Wirkung: Bestehende Bedienungen auf dem Home-Screen sollen einfacher erkennbar und optisch zusammenpassend sein.
- gewaehlte Loesung: Ausschliesslich die vorhandenen Home-Aktionen und ihre sichtbaren Texte pruefen und behutsam vereinheitlichen.
- wichtige Entscheidung(en): Keine neuen Card-Rahmen, Boxen, Funktionen oder Inhalte; der rahmenlose Stand aus WP-009 bleibt erhalten.
- Quellen/Akten: APP-IDEA-017, APP-IDEA-016, WP-009.

## Soll – von Codex

- Problem: Die vorhandenen Home-Aktionen sollen als einfache, ruhige und zusammenpassende Bedienung erscheinen.
- gewuenschte Wirkung: Die Nutzerin unterscheidet die eine Hauptaktion von den kleineren Hilfsaktionen sofort, ohne dass die Seite neue visuelle Bereiche erhaelt.
- sichtbare Aenderung: Die vorhandenen Aktionstexte und Button-Darstellungen auf `/neu` sind in Sprache, Hierarchie und Abstaenden konsistent, soweit sie dieselbe Rolle haben.
- nicht enthalten: Keine neue Aktion, kein Entfernen vorhandener Wege, keine neue Karte oder Box, keine neue Ueberschrift, keine Aenderung an Kalenderdaten, Zyklusberechnung, Tagesfenster, Historie, Partneransicht, Einstellungen, Anmeldung, API oder Datenbank.
- Abnahmekriterien:
  1. `Meine Periode aktualisieren` bleibt die klar erkennbare Hauptaktion und behaelt ihre Funktion.
  2. Bestehende Hilfsaktionen wie `Zykluslaenge ergaenzen` und die Kalendererklaerungen bleiben klar lesbar, einfach benannt und visuell passend zueinander, ohne neue Bedienung zu schaffen.
  3. Monatsnavigation, Kalendertage, Tagesfenster, Historie, Zyklus-Kreis und Heute-Karte verhalten sich unveraendert.
  4. Die Seite bleibt rahmenlos ausserhalb der bereits vorhandenen Heute-Karte; es entstehen keine zusaetzlichen Card-Rahmen, Hintergrundflaechen oder Schattenbereiche.
  5. Mobile und breite Ansicht bleiben ohne horizontalen Ueberlauf und alle vorhandenen Aktionen bleiben erreichbar.
- ein Pruefschritt fuer den Owner: `/neu` oeffnen, Hauptaktion, Erklaerungen und – falls sichtbar – `Zykluslaenge ergaenzen` ansehen und anschliessend Monatsnavigation, Tagesfenster und `Meine Periode aktualisieren` kurz testen.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnoetige Schritt-fuer-Schritt-Loesung.

### Bestaetigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` ist die bestehende Owner-Home-Ansicht fuer Heute-Karte, Zyklus-Kreis, Kalender und die zugehoerigen bestehenden Aktionen.
- Die sichtbare Hauptaktion `Meine Periode aktualisieren` liegt im Kalenderbereich und oeffnet den vorhandenen Bearbeitungsweg; diese Funktion darf sich nicht aendern.
- Die Hilfsaktionen `Zykluslaenge ergaenzen` (nur im vorhandenen Ohne-Vorhersage-Zustand mit Periodeneintraegen) und `Erklaerungen zum Kalender anzeigen`/`Erklaerungen ausblenden` besitzen bereits eigene bestehende Zustands- und Klicklogik.
- WP-009 hat neue Kartenrahmen um Zyklus-Kreis und Kalender bewusst wieder entfernt. Der aktuelle rahmenlose Aufbau der beiden Sections ist bindender Ausgangspunkt.

### Technisches Ziel

- Vereinheitliche in `NewCycleExample.tsx` ausschliesslich sichtbare Aktionstexte, Button-Hierarchie und dazugehoerige Layout-/Darstellungsklassen, wenn dies fuer eine klare und ruhige Konsistenz erforderlich ist.
- Hauptaktion und Hilfsaktionen muessen weiterhin sichtbar unterschiedliche Rollen haben; gleichartige Hilfsaktionen sollen nicht uneinheitlich wirken.
- Verwende die bestehenden Zustandsvariablen, Handler und Komponenten weiter. Claude darf eine kleine lokale Wiederverwendung fuer gleiche Darstellung waehlen, sofern sie keine neue Nutzerfaehigkeit oder Datenwirkung schafft.

### Invarianten – muessen unveraendert bleiben

- Die bestehende Logik von `openMyPeriods`, `setIsAddCycleLengthModalOpen`, `setIsCalendarLegendOpen`, Monatsnavigation, Tagesaktionen, Historie, Vorhersagen, Zyklus-Kreis und Heute-Karte bleibt unveraendert.
- `Meine Periode aktualisieren`, `Zykluslaenge ergaenzen` und der Erklaerungs-Toggle behalten ihre bestehenden Ausloeser, Bedingungen und Bedeutungen.
- Keine neue sichtbare Information, kein neuer interaktiver Weg und keine Aenderung von Aria-Verhalten oder Tastaturbedienung, ausser einer unmittelbar noetigen textlichen Anpassung bei unveraenderter Bedeutung.
- Keine zusaetzlichen Cards, Rahmen, Hintergrundflaechen, Rundungen oder Schatten um Zyklus-Kreis oder Kalender. Die vorhandene Heute-Karte bleibt unveraendert.
- Partneransicht, Einstellungen, Anmeldung, alte Luma sowie alle Daten- und Gesundheitslogiken bleiben unveraendert.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Pruefe gezielt, dass die drei bestehenden Aktionen ihre bisherigen Klicks, Sichtbarkeitsbedingungen und Texte mit gleicher Bedeutung behalten.
- Pruefe Monatsnavigation, Tagesfenster, Periodenhistorie und Kalendererklaerungs-Toggle als Regressionen.
- Fuehre TypeScript aus und pruefe mobil sowie in breiter Ansicht die Hierarchie, Erreichbarkeit und fehlenden horizontalen Ueberlauf.
- Lege keine Testdaten oder temporaeren Werkzeuge ausserhalb der vorgesehenen Testbereiche dauerhaft ab.

### Stoppbedingungen

- Stoppe und dokumentiere eine offene Frage, wenn eine sichtbare Textaenderung die Bedeutung einer bestehenden Gesundheitsinformation oder Aktion veraendern wuerde.
- Stoppe vor jeder Aenderung an Daten, API, Authentifizierung, Partneransicht, Kalender-/Zykluslogik oder vor dem Hinzufuegen einer neuen sichtbaren Bedienung.
- Stoppe, wenn eine konsistente Darstellung nur durch neue Card-Rahmen oder eine strukturelle Umgestaltung der bestehenden drei Home-Bereiche erreichbar waere.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger fuer diese sichtbare Aenderung ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-010` ausfuehren.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - In `src/components/NewCycleExample.tsx` wurde geprüft, wie die drei bestehenden Home-Aktionen (`Meine Periode aktualisieren`, `Zykluslänge ergänzen`, `Erklärungen zum Kalender anzeigen`/`ausblenden`) dargestellt sind. Die Hauptaktion war bereits klar als gefüllter, primärer Button von den beiden Hilfsaktionen unterschieden – hier war keine Änderung nötig.
  - Die einzige gefundene Uneinheitlichkeit: Die beiden Hilfsaktionen `Zykluslänge ergänzen` und `Erklärungen zum Kalender anzeigen` haben dieselbe Rolle (sekundäre, umrandete Pill-Buttons mit identischem Rahmen, Hintergrund, Innenabstand und Schatten), nutzten aber unterschiedliche Schriftgrößen (`text-sm` bei `Zykluslänge ergänzen`, `text-xs` beim Erklärungs-Toggle). Diese einzelne Klasse wurde beim Erklärungs-Toggle von `text-xs` auf `text-sm` vereinheitlicht, sodass beide Hilfsaktionen jetzt exakt dieselbe `className` tragen.
  - Keine weitere Text-, Struktur- oder Layoutänderung war erforderlich: Die Button-Texte, Sichtbarkeitsbedingungen, Klick-Handler (`openMyPeriods`, `setIsAddCycleLengthModalOpen`, `setIsCalendarLegendOpen`), `aria-expanded`/`aria-controls` sowie alle Abstände zwischen den Bereichen blieben unverändert.
  - Keine neuen Card-Rahmen, Hintergrundflächen, Rundungen oder Schatten um Zyklus-Kreis oder Kalender ergänzt; der rahmenlose Stand aus WP-009 (`className="space-y-3"` bzw. `"space-y-5"` auf den beiden sections) ist unverändert erhalten.
  - Keine Änderung an Monatsnavigation, Tagesaktionen, Periodenhistorie, Vorhersagen, Zyklus-Kreis, Heute-Karte, Partneransicht, Einstellungen, Anmeldung, alter Luma, Datenbank oder API.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-home-actions-consistent.ts`: gezielte Quelltext-Prüfungen bestätigen, dass die Hauptaktion weiterhin `openMyPeriods` aufruft, ihren Text und ihre primäre Füllfarbe behält; dass `Zykluslänge ergänzen` an ihrer bestehenden Sichtbarkeitsbedingung (`personalCycleView.status === "no_data" && periods.length > 0`) und ihrem Klick-Handler unverändert hängt; dass der Erklärungs-Toggle sein bestehendes `aria-expanded`/`aria-controls`-Verhalten und beide Textzustände behält; dass beide Hilfsaktionen jetzt exakt dieselbe Darstellungsklasse teilen; und dass die Zyklus-/Kalender-sections weiterhin rahmenlos sind. Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-period-history.ts`, `scripts/verify-home-screen-layout.ts`, `scripts/verify-start-help-no-data.ts`.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert.
  - Mobile (375×800) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit einem echten Testkonto und zwei echten Periodeneinträgen: Hauptaktion zeigt weiterhin einen gefüllten, farbigen Hintergrund; die Kalendererklärungen sind beim Laden geschlossen (`aria-expanded="false"`) und öffnen/schließen sich weiterhin per Klick; `Zykluslänge ergänzen` und der Erklärungs-Toggle sind jetzt computed-style-identisch (gleiche Schriftgröße 14px, Form, Farbe); Monatsnavigation, Periodenhistorie (öffnen/Escape) und die Hauptaktion (öffnet weiterhin den Bearbeitungsweg „Meine Perioden“) funktionieren unverändert; kein horizontaler Überlauf auf beiden Breiten. Screenshots geprüft. Playwright und Testkonten danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung. Der Soll verlangte eine Vereinheitlichung „soweit erforderlich“ – nach Durchsicht war ausschließlich die eine Schriftgrößen-Abweichung zwischen den beiden gleichartigen Hilfsaktionen zu beheben; alles andere (Texte, Hierarchie, Abstände, Struktur) war bereits konsistent.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: `/neu` öffnen, Hauptaktion, Erklärungen und – falls sichtbar – `Zykluslänge ergänzen` ansehen, anschließend Monatsnavigation, Tagesfenster und `Meine Periode aktualisieren` kurz testen.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** wird nach dem Commit ergänzt.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschaerfung:
- Product-Map aktualisiert: nein.
