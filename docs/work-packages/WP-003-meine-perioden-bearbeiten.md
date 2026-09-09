---
id: WP-003
title: "Gespeicherte Perioden sicher bearbeiten und löschen"
package_revision: 4
status: review
created: 2026-09-07
updated: 2026-09-09
owner_approved: yes
executor: claude
product_area: "Neue Luma – Periodenverwaltung"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Gespeicherte Perioden sicher bearbeiten und löschen

## Versionshinweis

**Version 2 – 7. September 2026:** Der Owner bestätigt zusätzlich das einzelne Löschen eines falschen oder nicht mehr benötigten Periodeneintrags. Vor der endgültigen Löschung ist eine klare Bestätigung Pflicht.

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Bereits gespeicherte Perioden können später einfach korrigiert oder bewusst gelöscht werden.
- **Warum machen wir das?** Ein Beginn oder Ende kann versehentlich falsch eingetragen worden sein.
- **Woher kam die Idee?** Aus der bestätigten Beobachtung `APP-PROBLEM-008` und dem Owner-Gespräch am 7. September 2026.
- **Wo ist es in der App?** Über `Meine Periode aktualisieren` vom Home-Screen in einem ruhigen Bereich `Meine Perioden`.
- **Was gehört ausdrücklich nicht dazu?** Kein Kalender-Umbau, keine automatische Vorhersage, keine Sammellöschung und keine Änderung der alten Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie öffnet eine gespeicherte Periode, ändert Beginn oder Ende, prüft die Angaben und speichert bewusst.

## Entstehungsweg

`Falsch eingegebener oder unnötiger Eintrag → Daten müssen später sicher korrigiert oder gelöscht werden → getrennte ruhige Verwaltungsansicht → WP-003`

- Ausgangsidee oder Problem: Bereits gespeicherte Periodendaten sind auf dem Home-Screen nicht klar und bewusst bearbeitbar.
- bestätigte Wirkung: Die Nutzerin korrigiert oder entfernt bewusst genau einen Fehler, ohne andere Perioden zu verändern.
- gewählte Lösung: Ein eigener Bereich zeigt gespeicherte Zeiträume. Jede Zeile hat klare Einstiege `Ändern` und `Löschen`; Löschen braucht eine Bestätigung.
- wichtige Entscheidung(en): `APP-PROBLEM-008`; der Home-Kalender bleibt Orientierung, nicht Verwaltung.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-PROBLEM-008.md`.

## Soll – von Codex

- **Problem:** Start- und Endtag einer bereits gespeicherten Periode können falsch sein, aber der Korrekturweg ist nicht klar erreichbar.
- **gewünschte Wirkung:** Die Nutzerin findet ihre gespeicherten Zeiträume in einem getrennten Bereich, kann genau einen Zeitraum ändern und speichert erst nach einer Prüfung.
- **sichtbare Änderung:**
  - Der Home-Screen behält genau den Einstieg `Meine Periode aktualisieren`.
  - Dieser Einstieg öffnet den Bereich `Meine Perioden`.
  - Jede gespeicherte Periode zeigt Beginn und Ende verständlich an sowie den Button `Ändern`.
  - `Ändern` öffnet nur diesen Zeitraum mit beiden Datumsfeldern.
  - Nach der Änderung zeigt Luma eine einfache Zusammenfassung; erst `Speichern` übernimmt sie dauerhaft.
  - `Löschen` zeigt zuerst Beginn und Ende des betroffenen Zeitraums sowie `Abbrechen` und `Endgültig löschen`.
  - Erst `Endgültig löschen` entfernt genau diesen Zeitraum dauerhaft. Danach aktualisiert sich die Liste und der Kreis darf die gelöschte Periode nicht mehr verwenden.
  - Ungültige Reihenfolge, Zukunft und Überschneidung zeigen eine einfache Fehlermeldung und speichern nichts.
- **nicht enthalten:** Neue Perioden hinzufügen, Sammellöschen, Historienfilter, Kalender-Tagesaktionen, neue Vorhersage-/KI-Logik, Datenmigration und alte Luma.
- **Abnahmekriterien:**
  1. Mindestens zwei gespeicherte Perioden sind getrennt sichtbar.
  2. Nur der gewählte Zeitraum ändert sich nach dem Speichern.
  3. Neu laden und erneut anmelden zeigt den korrigierten Zeitraum dauerhaft.
  4. Ein anderes Konto kann den Zeitraum nicht sehen oder ändern.
  5. Der Home-Kalender bleibt reine Orientierung.
  6. Eine Löschung geschieht erst nach sichtbarer Bestätigung; `Abbrechen` lässt alle Daten unverändert.
- **ein Prüfschritt für den Owner:** `Meine Periode aktualisieren` öffnen, eine gespeicherte Periode ändern, prüfen, speichern und die Seite neu laden.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnötige Schritt-für-Schritt-Lösung.

### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` enthält den einzigen Home-Einstieg `Meine Periode aktualisieren` und das bisherige Eingabe-Modal.
- `src/app/neu/page.tsx` lädt die kontogebundenen Periodeneinträge für `/neu`.
- `src/app/api/neu/periods/route.ts` bietet bereits `GET` für die eigenen Einträge.
- `src/app/api/neu/periods/[id]/route.ts` bietet bereits die gesicherte `PUT`-Änderung und `DELETE`-Löschung eines Eintrags; Validierung, Kontotrennung und Überschneidungsprüfung bestehen in `src/lib/new-periods.ts` und `src/lib/new-period-validation.ts`.

### Technisches Ziel

- Richte einen geschützten Bereich `Meine Perioden` ein oder nutze einen gleichwertig klar getrennten vorhandenen Weg. Er zeigt nur die Perioden des angemeldeten Kontos.
- Verknüpfe `Meine Periode aktualisieren` vom Home-Screen mit diesem Bereich; die Kalenderzellen bleiben nicht interaktiv für Verwaltung.
- Nutze die vorhandene `GET`- und `PUT`-Schnittstelle. Der Bearbeitungsdialog oder die Bearbeitungsansicht enthält nur Beginn, Ende, Prüfen, Speichern und Abbrechen.
- Vor der endgültigen `PUT`-Anfrage muss die Nutzerin die geänderten Daten sichtbar prüfen können.
- Vor `DELETE` muss eine zweite, eindeutige Bestätigung stehen. Sie nennt den betroffenen Zeitraum; `Abbrechen` hat keine Datenwirkung. Nach erfolgreichem Löschen wird nur die eigene Liste und die davon abhängige Anzeige aktualisiert.
- Claude darf Komponenten passend teilen, aber keine neue Tabelle, neue Datenart oder neue API-Route einführen, wenn die vorhandenen Routen ausreichen.

### Invarianten – müssen unverändert bleiben

- Einträge bleiben ausschließlich mit der bestehenden Sitzung und dem eigenen Konto verbunden.
- Die vorhandenen Serverprüfungen für Datum, Reihenfolge, Zukunft, ID und Überschneidung bleiben wirksam.
- Nicht ausgewählte Periodeneinträge, Profile, Nutzerkonten, Kalenderlogik und Zykluskreis werden nicht still verändert.
- Nur einzelnes Löschen eines bewusst ausgewählten Eintrags nach Bestätigung; keine Sammellöschung.
- Alte Luma und `app_luma` bleiben unverändert.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine Schemaänderung; ein einzelner Eintrag wird nur nach ausdrücklichem Speichern geändert oder nach ausdrücklicher zweiter Bestätigung gelöscht.
- betroffene API-Routen: vorhandenes `GET /api/neu/periods`, `PUT /api/neu/periods/[id]` und `DELETE /api/neu/periods/[id]`.
- Migration nötig: nein.

### Pflichtprüfungen

- Zwei Einträge für ein Konto laden; einen bearbeiten; bestätigen, dass nur dieser Eintrag geändert wird.
- Ungültige Reihenfolge, Zukunft und Überschneidung werden abgelehnt und lassen den gespeicherten Eintrag unverändert.
- Kontotrennung sowie nicht vorhandene oder fremde ID bleiben serverseitig geschützt.
- Neu laden und erneute Anmeldung zeigen die erfolgreiche Änderung.
- Ein Löschen abbrechen: Eintrag bleibt sichtbar. Ein Löschen bestätigen: exakt dieser Eintrag ist nach Neuladen nicht mehr vorhanden.
- Fremde oder ungültige ID kann nicht gelöscht werden.
- Mobile Sichtprüfung: Liste, Ändern, Prüfen, Speichern und Abbrechen sind ohne horizontalen Überlauf bedienbar.
- TypeScript, gezielter Test, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe vor einer Migration, Sammellöschung, neuer Vorhersagelogik oder einer Änderung von Daten eines nicht gewählten Zeitraums.
- Stoppe, wenn der vorhandene `PUT`-Weg die sichere Kontotrennung oder Prüfzusammenfassung nicht ermöglichen würde.
- Wenn ein Startpunkt nicht mehr stimmt, darf Claude passende Stellen suchen; Wirkung und Invarianten bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-003` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.

## Ist – von Claude

- umgesetzt:
  - `src/components/NewCycleExample.tsx`: Der bestehende Einstieg `Meine Periode aktualisieren` öffnet jetzt zuerst eine neue `MyPeriodsModal`-Ansicht statt direkt eines Eingabeformulars. Sie listet alle gespeicherten Perioden des Kontos (Beginn bis Ende, verständlich formatiert) mit je einem `Ändern`-Button, dazu `Neue Periode eintragen` und `Schließen`.
  - Das bisherige `UpdatePeriodModal` wurde zu `PeriodFormModal` erweitert: nimmt optional einen `editingEntry`-Eintrag entgegen, ist damit vorbelegt, sendet beim Speichern `PUT /api/neu/periods/[id]` statt `POST /api/neu/periods` (neue Periode) und zeigt passend „Periode ändern“ bzw. „Neue Periode eintragen“ als Titel. Ein `Zurück`-Pfeil führt zur Liste zurück, wenn das Formular aus der Liste heraus geöffnet wurde; direkt aus der Liste geöffnete neue Einträge zeigen stattdessen `Abbrechen`.
  - Beide vorhandenen, bereits gesicherten API-Routen (`GET /api/neu/periods`, `PUT /api/neu/periods/[id]`) werden unverändert weiterverwendet; keine neue Route, keine Schemaänderung.
  - Die Prüfen-vor-Speichern-Zusammenfassung (Beginn bis Ende, dann erst „Speichern“) ist für beide Fälle (neu/ändern) unverändert erhalten.
  - Kalenderzellen bleiben wie durch WP-001 festgelegt reine Anzeige ohne Bearbeitungsaktion; dieses Paket hat daran nichts geändert.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Kein Löschen, keine neuen Perioden-Filter, keine Vorhersageänderung.
- Tests:
  - Neues `scripts/verify-my-periods.mts` (per `npx tsx`, `.mts` wegen Top-Level-await) prüft serverseitig gegen die echte lokale Datenbank: zwei Einträge anlegen und laden, einen ändern und bestätigen, dass nur dieser sich ändert; Überschneidung wird abgelehnt und lässt den Zieleintrag unverändert; ein fremdes Konto kann eine ID nicht ändern (`not_found`) und sieht die Einträge des anderen Kontos nicht; eine nicht vorhandene ID liefert `not_found`; ungültige Reihenfolge und Zukunft werden von `validateNewPeriodInput` abgelehnt. Die Kern-Query-Logik aus `src/lib/new-periods.ts` wurde im Skript bewusst nachgebildet (nicht importiert), weil die Originaldatei `import "server-only"` nutzt und sich daher nicht direkt per Node ausführen lässt — funktional identische Queries, siehe Kommentar im Skript. 15/15 Prüfungen bestanden.
  - `scripts/verify-luma-core.mjs` erneut ausgeführt: Datenbanktrennung weiterhin bestätigt, keine Fehler.
  - `npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt.
  - Mobile Sichtprüfung mit Playwright (Chromium, 375×812, temporär installiert und danach wieder entfernt): Testkonto registriert, eine Periode im Onboarding gespeichert, über „Meine Periode aktualisieren“ die neue Listenansicht bestätigt, zweite Periode über „Neue Periode eintragen“ ergänzt, beide Einträge getrennt sichtbar bestätigt, „Ändern“ öffnet das Formular korrekt mit den vorhandenen Werten vorbelegt, „Zurück“ führt zur Liste zurück, kein horizontaler Overflow. Test-Datenbank-Konto danach gelöscht.
- Abweichungen: keine.
- offene Punkte: Owner-Prüfschritt (`Meine Periode aktualisieren` öffnen, eine gespeicherte Periode ändern, prüfen, speichern, Seite neu laden) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 3 – Laufende Periode sofort erfassen (8. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Wenn deine Periode heute oder gestern beginnt, kannst du den Start sofort speichern. Das echte Ende ergänzt du später.
- **Warum machen wir das?** Bei einer laufenden Periode kennt man das tatsächliche Ende noch nicht. Trotzdem soll Luma schon den echten Beginn kennen.
- **Zusatz:** Du darfst ein erwartetes Ende auswählen. Es erscheint als `Voraussichtlich` und `Kann abweichen`, bis du das echte Ende bestätigst.
- **Was passiert mit kommenden Monaten?** Luma zeigt eine nächste Periode nur als automatische Schätzung. Du planst sie nicht manuell.
- **Was bleibt geschützt?** Nur echte, von dir bestätigte Starts verbessern spätere Schätzungen. Erwartete Tage werden nie als echte Periodendaten behandelt.

### Entstehungsweg

`Laufende Periode hat einen echten Start, aber noch kein echtes Ende → Warten auf das Ende verhindert eine sinnvolle Erfassung → Start sofort speichern und erwartetes Ende klar getrennt anzeigen → WP-003 Version 3`

- bestätigtes Problem: Der bisherige Weg speichert erst, wenn Beginn und Ende zusammen vorliegen. Dadurch kann eine laufende Periode nicht direkt erfasst werden.
- gewünschte Wirkung: Die Nutzerin kann den Start einer laufenden Periode sofort festhalten und später das tatsächliche Ende ergänzen oder korrigieren.
- gewählte Lösung: Ein Eintrag unterscheidet tatsächlichen Start, optionales tatsächliches Ende und optionales erwartetes Ende.
- bestätigte Grenzen: Eine künftige neue Periode bleibt eine automatische Schätzung und wird nicht manuell als tatsächliche Periode geplant.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-PROBLEM-008.md`; DEC-098, DEC-099 und DEC-100.

### Soll – von Codex

- Ein tatsächlicher Periodenstart darf heute oder in der Vergangenheit sofort gespeichert werden, auch wenn das tatsächliche Ende fehlt.
- Ein erwartetes Ende für diese laufende Periode darf nach heute liegen. Es wird sichtbar als `Voraussichtlich` und `Kann abweichen` gezeigt, aber nicht als bestätigter Periodentag gespeichert.
- Das tatsächliche Ende kann später ergänzt oder korrigiert werden. Beim Speichern eines tatsächlichen Endes wird ein vorheriges erwartetes Ende nicht weiter als aktiv angezeigt.
- Historische abgeschlossene Perioden bleiben vollständig bearbeitbar und löschbar wie bisher.
- Die automatisch berechnete nächste Periode bleibt reine, klar gekennzeichnete Schätzung. Sie wird nicht in der Datenbank als echter Eintrag angelegt und nicht für Median, Zykluslänge oder bestätigte Periodendauer verwendet.
- Ein später bestätigter tatsächlicher Start überlagert die passende Schätzung im Kalender. Danach berechnet Luma kommende Schätzungen mit den echten Daten neu.
- Der Home-Kalender zeigt die Unterscheidung verständlich: `Bestätigt`, `Laufend` oder `Voraussichtlich`. Er bleibt keine unklare zweite Eingabemethode.

### Abnahmekriterien

1. Eine Nutzerin speichert einen Start von gestern ohne tatsächliches Ende. Nach Neuladen bleibt dieser Start sichtbar.
2. Sie ergänzt ein erwartetes Ende nach heute. Die betreffenden künftigen Tage sind klar als vorläufig erkennbar und zählen nicht als bestätigte Periode.
3. Sie ergänzt später das echte Ende. Der Eintrag ist danach abgeschlossen; die vorläufige Anzeige verschwindet.
4. Eine automatisch geschätzte kommende Periode ist erkennbar keine bestätigte Periode und kann nicht still in die Datenbasis gelangen.
5. Ein echter Start im geschätzten Zeitraum ersetzt die dortige Schätzung sichtbar und beeinflusst nur danach kommende Schätzungen.
6. Fremde Konten können laufende oder abgeschlossene Einträge weder lesen noch verändern.

## Technischer Auftrag für Claude – Version 3

### Bestätigte Code-Ausgangslage

- `database/luma-core/migrations/202609031500_period_history.sql` definiert derzeit `new_period_entries` mit zwingendem `end_date`.
- `src/lib/new-period-validation.ts` und `src/lib/new-periods.ts` behandeln Einträge derzeit als immer vollständige Zeiträume.
- `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` nutzen diese Validierung. Sitzungs-, Herkunfts-, Kontotrennungs- und Überschneidungsprüfungen bestehen bereits.
- `src/lib/new-cycle-prediction.ts`, `src/lib/personal-cycle-view.ts` und `src/components/NewCycleExample.tsx` berechnen beziehungsweise zeigen Kreis und Kalender aus den Einträgen.
- `MyPeriodsModal` und `PeriodFormModal` in `src/components/NewCycleExample.tsx` sind der bestätigte Verwaltungsweg aus Version 1 und 2.

### Datenmodell und Migration

- Eine neue, fortlaufend benannte Migration für **ausschließlich** `luma_core` ist ausdrücklich freigegeben.
- `start_date` bleibt zwingend und bezeichnet immer einen tatsächlichen, manuell bestätigten Start.
- `end_date` wird nullable und bezeichnet nur ein tatsächlich bestätigtes Ende.
- Ergänze `expected_end_date` als nullable Feld für ein erwartetes Ende einer laufenden Periode.
- Bestehende vollständige Einträge bleiben unverändert gültig: Sie behalten ihr echtes Ende; `expected_end_date` ist leer.
- Datenbank-Constraints müssen mindestens sicherstellen: Ein vorhandenes echtes oder erwartetes Ende liegt nicht vor dem Start. Keine Migration darf `app_luma`, alte Luma-Tabellen oder Daten anderer Nutzer verändern.

### Umsetzung und Invarianten

- Passe Typen, Servervalidierung und Routen an, ohne die bestehende Sitzung, Herkunftsprüfung oder Kontotrennung zu schwächen.
- Erlaube einen tatsächlichen Start nur bis einschließlich heute. Ein tatsächlicher Start in der Zukunft wird serverseitig abgelehnt.
- Erlaube ein erwartetes Ende nach heute nur zusammen mit einem tatsächlichen Start bis einschließlich heute. Es ist kein tatsächliches Ende.
- Behalte die transaktionssichere, kontobezogene Überschneidungsprüfung. Sie muss auch bei unvollständigen Einträgen sinnvoll bleiben; bestätigte und erwartete Bereiche dürfen nicht still widersprüchlich werden.
- Im Verwaltungsweg muss verständlich sein: `Start speichern`, `Erwartetes Ende ergänzen` und später `Tatsächliches Ende speichern`. Zeige vor jeder dauerhaften Änderung eine verständliche Prüfung.
- Wenn ein tatsächliches Ende gespeichert wird, darf kein altes erwartetes Ende weiter als gültig dargestellt werden.
- Verwende für Zykluslänge und Median ausschließlich tatsächlich bestätigte Starts; benutze für die tatsächliche Periodendauer nur Einträge mit tatsächlichem Ende. Ein erwartetes Ende zählt nie als historische Tatsache.
- Automatische Zukunftszyklen dürfen nur zur Laufzeit berechnet werden. Sie werden nicht als `new_period_entries` gespeichert. Kalender, Tagesinformation und zugängliche Beschriftungen müssen Schätzung und bestätigte Daten eindeutig unterscheiden.
- Bestehende Bearbeiten- und Löschfunktionen bleiben für jeden Eintrag erhalten. Löschen braucht weiterhin die zweite Bestätigung.

### Pflichtprüfungen

- Migration nur auf einer Test-/Zieldatenbank für `luma_core` anwenden und Zielidentität vor der Ausführung bestätigen.
- Start gestern ohne Ende speichern, neu laden und erneut anmelden.
- Erwartetes Ende nach heute ergänzen; serverseitig prüfen, dass es nicht als bestätigtes Ende oder historischer Datensatz verwendet wird.
- Tatsächliches Ende später speichern; erwartetes Ende wird danach nicht mehr aktiv angezeigt.
- Zukunftsstart, Ende vor Start, fremde ID und Überschneidungen werden serverseitig abgelehnt.
- Kalender zeigt mindestens einen bestätigten, einen laufenden und einen automatisch geschätzten Zustand klar verschieden. Eine Schätzung wird nie als echte Periode gespeichert.
- Prüfen, dass Median/Zykluslänge keine erwarteten Enddaten als tatsächliche Periodendauer verwendet.
- Kontotrennung, bestehendes Bearbeiten/Löschen, TypeScript, gezielte Tests, Produktions-Build und Ledger-Validierung bestehen.
- Mobile Sichtprüfung: Eingabe, Prüfung, vorläufige Kennzeichnung und spätere Ergänzung sind ohne horizontalen Überlauf verständlich bedienbar.

### Stoppbedingungen

- Stoppe, wenn die Migration nicht eindeutig auf `luma_core` zielt oder eine bestehende Tabelle in `app_luma` berühren würde.
- Stoppe vor einer Speicherung automatisch berechneter Zukunftsperioden als echte Daten.
- Stoppe vor einer Änderung der alten Luma, vor medizinischen Behauptungen oder vor einer stillen Änderung anderer Periodeneinträge.
- Wenn die bisherige Überlappungslogik für einen offenen Eintrag unklar wird, dokumentiere den Konflikt und bitte um Klärung statt Datenregeln zu erraten.

### Abschluss durch Claude

- Ergänze `Ist Version 3`, nenne Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus auf `review`, ergänze das Entwicklungsledger und führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus.
- Committe nur auftragsbezogene Dateien und pushe sie. Eine Dokploy-Bereitstellung nur dann als erfolgreich melden, wenn sie wirklich geprüft wurde.

### Version 2 – Löschen (7. September 2026)

- umgesetzt:
  - `MyPeriodsModal` in `src/components/NewCycleExample.tsx` um einen `Löschen`-Button pro Zeile erweitert. Klick öffnet eine zweite Ansicht innerhalb desselben Dialogs, die Beginn und Ende des betroffenen Zeitraums nennt und nur `Abbrechen` sowie `Endgültig löschen` anbietet; `Abbrechen` hat keine Datenwirkung.
  - `Endgültig löschen` ruft die bereits vorhandene, gesicherte Route `DELETE /api/neu/periods/[id]` auf (keine neue Route). Nach Erfolg aktualisiert sich die Liste sofort (lokaler State) und `router.refresh()` sorgt dafür, dass die serverseitig berechnete Zyklusansicht (`personalCycleView`) den gelöschten Eintrag nicht mehr berücksichtigt.
  - Aus Konsistenzgründen ruft jetzt auch das normale Ändern/Neueintragen (`handlePeriodSaved`) `router.refresh()` auf, damit der Kreis in jedem Fall den aktuellen Datenstand widerspiegelt.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Keine Sammellöschung, keine neue Tabelle, keine neue Route.
- Tests:
  - `scripts/verify-my-periods.mts` um Löschfälle erweitert: fremde ID kann nicht gelöscht werden, nicht vorhandene ID liefert `false`, bestätigtes Löschen entfernt genau den gewählten Eintrag und lässt den anderen unverändert. Gesamtskript: 21/21 Prüfungen bestanden.
  - `npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt.
  - Direkte Prüfung gegen die lokale Datenbank nach einem manuellen Testlauf bestätigt den korrekten Endzustand (ein Eintrag gelöscht, der andere unverändert vorhanden) – ein automatisiertes Browser-Skript zeigte an dieser Stelle ein reines UI-Timing-Problem beim Auslesen kurz nach `router.refresh()`, das laut direkter Datenbankprüfung keine tatsächliche Dateninkonsistenz war.
- Abweichungen: keine fachliche Abweichung.
- offene Punkte: Owner-Prüfschritt für das Löschen (Abbrechen lässt Eintrag sichtbar, Endgültig löschen entfernt ihn dauerhaft nach Neuladen) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Version 3 – Laufende Periode sofort erfassen (8. September 2026)

- umgesetzt:
  - Neue Migration `database/luma-core/migrations/202609081200_period_running.sql` (ausschließlich `luma_core`): `end_date` in `new_period_entries` ist jetzt nullable, neue nullable Spalte `expected_end_date` ergänzt. Zwei CHECK-Constraints stellen sicher, dass ein vorhandenes echtes oder erwartetes Ende nicht vor dem Start liegt. Lokal auf `luma_core` angewendet und per `SELECT current_database()`-Prüfung im bestehenden Migrationsskript abgesichert; `app_luma` und alte Luma-Tabellen bleiben unberührt.
  - `src/lib/new-period-validation.ts`: neue Typen `NewRunningPeriodInput`/`NewPeriodEntryOpen` sowie `validateNewRunningPeriodInput`. Ein tatsächlicher Start wird nur bis einschließlich heute akzeptiert; `endDate` ist optional (null = laufend); ein optionales `expectedEndDate` darf nach heute liegen, muss aber auf/nach dem Start liegen. Die bisherige `validateNewPeriodInput`/`NewPeriodInput` bleibt unverändert bestehen (wird weiterhin von `new-period-plans.ts` für das separate, unveränderte Plans-System genutzt).
  - `src/lib/new-periods.ts`: `getNewPeriodEntries`, `createNewPeriodEntry`, `updateNewPeriodEntry` arbeiten jetzt mit `NewPeriodEntryOpen` (`endDate`/`expectedEndDate` nullable). Die transaktionssichere Überschneidungsprüfung wurde erweitert: ein Eintrag ohne echtes Ende belegt für die Prüfung sein erwartetes Ende oder andernfalls unbegrenzt Zeit ab dem Start (`COALESCE(end_date, expected_end_date, '9999-12-31')`), damit ein neuer Zeitraum nicht unbemerkt in eine laufende Periode fällt.
  - `src/app/api/neu/periods/route.ts` und `.../[id]/route.ts`: nutzen jetzt `validateNewRunningPeriodInput` statt der alten, auf vollständige Zeiträume beschränkten Validierung. Keine neue Route.
  - `src/lib/new-cycle-prediction.ts` (`predictCycle`, für den Kalender) und `src/lib/personal-cycle-view.ts` (`computePersonalCycleView`, für den Ring): Periodendauer-Median (`periodLengthDays`) wird ausschließlich aus abgeschlossenen Einträgen (echtes `endDate`) berechnet; ein `expectedEndDate` zählt nie als historische Tatsache. Der Start-zu-Start-Median für die Zykluslänge nutzt weiterhin auch offene Starts als Anker. `computePersonalCycleView` liefert neu `isRunning: boolean` (heute läuft eine bestätigte, noch offene Periode); ein bestätigter Tag zählt als „period“, auch ohne echtes Ende.
  - `src/lib/calendar-day-info.ts`: `getCalendarDayInfo` unterscheidet jetzt `confirmed` (echtes Ende), `running` (offener, tatsächlicher Start bis heute) und `expected` (Tag nach heute innerhalb eines `expectedEndDate`) zusätzlich zu `planned`/`estimate`/`neutral`.
  - `src/components/NewCycleExample.tsx`: `PeriodFormModal` hat eine neue Checkbox „Das echte Ende kenne ich noch nicht“; bei Aktivierung entfällt das Pflichtfeld „Letzter Tag“ und ein optionales „Erwartetes Ende“-Feld erscheint. Prüfen-vor-Speichern zeigt bei laufenden Perioden „… läuft noch“ bzw. „… bis voraussichtlich … (kann abweichen)“. `MyPeriodsModal` zeigt laufende Einträge mit einem „Laufend“-Kennzeichen. Der Ring zeigt bei `isRunning` „Heute: Laufend“ statt einer Phase. Der Kalender zeigt bestätigte (dunkles Beerenrot, „P“), laufende (gleiche Farbe, „Läuft“) und voraussichtliche Tage (helleres Rosa, „Ca.“) sichtbar unterschiedlich; das bestehende, unveränderte `new_period_plans`-System („Plan“, Gelb) bleibt separat bestehen.
  - Automatisch berechnete Zukunftszyklen werden weiterhin nur zur Laufzeit berechnet (`predictCycle`/`futureCycles`) und nicht als `new_period_entries` gespeichert.
- nicht umgesetzt: keine Änderung am separaten `new_period_plans`-System (bewusste Owner-Entscheidung, siehe Abweichung unten). Kein Umbau der Kalender-Tagesaktionen, keine Datenmigration bestehender Einträge (sie behalten ihr echtes Ende, `expected_end_date` bleibt bei ihnen leer).
- Tests:
  - `scripts/verify-personal-cycle-view.ts`: fünf neue Prüfblöcke für Version 3 ergänzt (laufender Start ohne Ende wird als „Heute: Periode“ mit `isRunning: true` erkannt; ein `expectedEndDate` beendet `isRunning` nicht; `periodLengthDays` schließt offene Einträge vom Median aus; ein später ergänztes echtes Ende beendet `isRunning`; der Start-zu-Start-Median bleibt auch mit einem offenen Start korrekt). Gesamtskript weiterhin vollständig grün (alle bestehenden und neuen Prüfungen bestanden).
  - `scripts/verify-my-periods.mts`: um Eingabevalidierung (`validateNewRunningPeriodInput`: laufender Start gültig, Zukunftsstart abgelehnt, erwartetes Ende nach Start gültig, erwartetes Ende vor Start abgelehnt) und DB-Integrationsfälle erweitert (laufenden Start ohne Ende speichern und nach Neuladen weiterhin offen sehen; ein erwartetes Ende, das einen anderen laufenden Zeitraum überschneidet, wird abgelehnt; erwartetes Ende ergänzen und danach echtes Ende speichern, wobei das alte erwartete Ende danach nicht mehr aktiv ist). Insgesamt 34/34 Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler.
  - `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, TypeScript-Prüfung im Build ohne Fehler, alle 34 Routen erzeugt.
  - `node scripts/apply-luma-core-migrations.mjs`: Migration `202609081200_period_running` erfolgreich auf die lokale `luma_core`-Datenbank angewendet (Zielidentität durch das Skript selbst geprüft).
  - `node scripts/verify-luma-core.mjs`: Datenbanktrennung weiterhin bestätigt (`app_luma` unverändert, `luma_core` enthält die neue Migration in der Liste, keine Fehler).
  - Mobile Sichtprüfung wurde für diese Version nicht durchgeführt (siehe offene Punkte) – gemäß der vom Owner bestätigten Arbeitsweise „erst schnell bauen und selbst sichten, schwere Prüfungen erst bei Bedarf oder am Ende eines größeren Abschnitts“ wurde die Prüftiefe auf Build, TypeScript und gezielte Skript-Tests konzentriert.
- Abweichungen:
  - Der Auftrag ließ offen, wie sich das neue `expected_end_date`-Modell zum bereits bestehenden, unabhängig gebauten `new_period_plans`-System (geplante Zeiträume mit `confirmNewPeriodPlan`) verhalten soll. Diesen Zielkonflikt habe ich nicht selbst entschieden, sondern dem Owner zur Klärung vorgelegt: Entscheidung war, dass beide Systeme unverändert parallel bestehen bleiben. `new_period_plans` wurde in dieser Version nicht angefasst.
  - Ein bereits vor dieser Version bestehender, unabhängiger Defekt wurde festgestellt, aber nicht behoben (außerhalb des Auftragsumfangs): `tests/calendar-day-info.test.ts` importiert eine Funktion `applyPeriodDayAction`, die in `src/lib/calendar-day-info.ts` nicht existiert; der Testlauf schlägt daher fehl. Per `git stash` bestätigt, dass dieser Fehler bereits vor allen Änderungen dieser Version bestand.
- offene Punkte:
  - Owner-Prüfschritt für Version 3 steht aus (siehe Pflichtprüfungen im Auftrag: laufenden Start speichern, erwartetes Ende ergänzen, später echtes Ende ergänzen, mobile Sichtprüfung ohne horizontalen Überlauf).
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sollte in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 4 – Periodentag im Tagesfenster (9. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Du tippst einen bestätigten Periodentag im Kalender an. Der Home-Screen wird grau und ein kleines Fenster zeigt die genaue Tagesinformation.
- **Beispiel:** `Mittwoch, 9. September 2026 – 3. Periodentag`.
- **Was bleibt im Hintergrund?** Zyklus-Kreis, Kalender und alle anderen Elemente sind sichtbar, aber nicht bedienbar, bis das Fenster geschlossen wird.
- **Wichtig:** Ein geschätzter zukünftiger Tag ist kein bestätigter Periodentag. Er zeigt deshalb keinen erfundenen Zähler.

### Entstehungsweg

`Periodentag im Kalender ist sichtbar, aber nicht sofort verständlich → Nutzerin braucht die genaue Einordnung eines einzelnen echten Tages → lesendes Tagesfenster mit Datum und Periodentag → WP-003 Version 4`

- bestätigtes Problem: Die Nutzerin kann bei einem einzelnen Kalendertag nicht direkt erkennen, der wievielte Tag ihrer Periode er ist.
- gewünschte Wirkung: Ein Tipp auf einen echten Periodentag liefert sofort eine kurze, eindeutige Erklärung, ohne die Verwaltungslogik zu öffnen oder Daten zu verändern.
- gewählte Lösung: Ein zugängliches, lesendes Modal über dem gesamten Home-Screen.
- Grenzen: Keine neue Dateneingabe, keine neue Berechnung, keine Änderung an Vorhersagen oder Datenbank.

### Soll – von Codex

- Ein Tipp auf einen `confirmed` oder `running` Periodentag öffnet ein kleines Tagesfenster.
- Das Fenster deckt den gesamten Home-Screen mit einem grauen/abgedunkelten Hintergrund ab. Im Vordergrund ist nur das Fenster aktiv.
- Es zeigt den deutschen Wochentag, das vollständige deutsche Datum und den inklusiv gezählten Periodentag: `Mittwoch, 9. September 2026 – 3. Periodentag`.
- Der Starttag ist immer `1. Periodentag`; die Zählung beginnt erneut für jeden tatsächlichen Periodeneintrag.
- Ein geschätzter, geplanter oder neutraler Tag erhält keinen Periodentag. Seine bestehende Tagesinformation bleibt ehrlich und unterscheidbar.
- Das Fenster hat einen sichtbaren Schließen-Einstieg, schließt mit Escape und gibt den Fokus sinnvoll zurück. Es verändert keine Daten.

### Abnahmekriterien

1. Beim Tipp auf den dritten bestätigten Tag erscheint genau `3. Periodentag` zusammen mit Wochentag und vollständigem Datum.
2. Der gesamte Home-Screen, einschließlich Zyklus-Kreis und Kalender, ist im Hintergrund abgedunkelt und nicht bedienbar.
3. Nach Schließen ist der Home-Screen wieder normal bedienbar.
4. Ein laufender bestätigter Tag bis einschließlich heute zeigt ebenfalls den korrekten Zähler.
5. Ein nur erwarteter, geschätzter oder neutraler Tag zeigt keinen erfundenen Periodentag.

## Technischer Auftrag für Claude – Version 4

### Bestätigte Code-Ausgangslage

- `src/components/NewCycleExample.tsx` rendert den clientseitigen Home-Kalender und enthält bereits Modal-Muster für `Meine Perioden` und das Periodenformular.
- `src/lib/calendar-day-info.ts` unterscheidet bereits `confirmed`, `running`, `expected`, `planned`, `estimate` und `neutral`.
- Die bestätigten Einträge in `initialPeriods` enthalten `startDate`; abgeschlossene Einträge enthalten außerdem ein echtes `endDate`.

### Technisches Ziel

- Ergänze eine rein lesende Tagesdetail-Modal-Komponente oder einen gleichwertigen klar gekapselten Zustand in `NewCycleExample.tsx`.
- Ermittle den Periodentag ausschließlich aus einem tatsächlichen Eintrag: Kalendertag minus `startDate` plus eins, in lokaler datumssicherer Logik ohne Zeitzonenverschiebung.
- Öffne für `confirmed` und `running` das Modal mit vollständiger deutscher Datumsformatierung. Für andere Status nutze höchstens die bestehende ehrliche Tagesinformation; keine erfundene Phasen- oder Periodentag-Aussage.
- Verwende einen vollständigen Overlay-Backdrop über der Home-Ansicht, `role="dialog"`, `aria-modal="true"`, sichtbaren Schließen-Button und Escape-Schließen. Während das Modal offen ist, darf der Hintergrund nicht als aktive Bedienoberfläche wirken.
- Nutze keine API-Route, keine Datenbankänderung und keine Speicherung. Die bestehende Periodenverwaltung und das Löschen bleiben unverändert.

### Pflichtprüfungen

- Unit-Test oder gezielte reproduzierbare Prüfung: Starttag = 1, dritter Tag = 3, Monats- und Jahresgrenze korrekt.
- Bestätigter abgeschlossener Tag und laufender Tag bis heute öffnen das Modal korrekt.
- Erwarteter, geplanter und neutraler Tag erhalten keinen erfundenen Periodentag.
- Escape und sichtbarer Schließen-Button schließen; danach ist der Kalender wieder bedienbar.
- Mobile Sichtprüfung: Overlay bedeckt Zyklus-Kreis und Kalender, kein horizontaler Überlauf, Text vollständig lesbar.
- TypeScript, gezielter Test, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe vor jeder Datenbankänderung, API-Änderung, automatischen Speicherung oder Änderung der Vorhersagelogik.
- Stoppe, wenn der gleiche Kalendertag widersprüchlich mehreren tatsächlichen Periodeneinträgen zugeordnet wäre; diesen Zustand nicht durch eine willkürliche Zahl verdecken.

### Abschluss durch Claude

- Ergänze `Ist Version 4`, nenne Abweichungen sichtbar und setze das Paket auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus und committe/pushe nur auftragsbezogene Dateien.

### Version 4 – Periodentag im Tagesfenster (9. September 2026)

- umgesetzt:
  - `src/lib/calendar-day-info.ts`: neue reine Funktion `periodDayNumber(date, startDate)` – inklusive Zählung ab dem tatsächlichen Start (Starttag = 1), reine Datums-String-Arithmetik über `Date.UTC` ohne Zeitzonenverschiebung.
  - `src/components/NewCycleExample.tsx`: neue Komponente `DayDetailModal` – rein lesend, zeigt vollständigen deutschen Wochentag/Datum (`Intl.DateTimeFormat`) und, falls vorhanden, `{n}. Periodentag`. `role="dialog"`, `aria-modal="true"`, sichtbarer „Schließen“-Button, Escape-Handler via `useEffect`/`keydown`.
  - Jede Kalenderzelle mit `storedPeriod` oder `runningPeriod` (also `dayInfo.status` `confirmed` oder `running`) ist jetzt ein `<button>` statt eines reinen `<div>`; Klick berechnet den Periodentag aus dem zugehörigen Eintrag (`confirmedPeriodEntry = storedPeriod ?? runningPeriod`) und öffnet `DayDetailModal`. Zellen mit `expected`, `planned`, `estimate` oder `neutral` bleiben unverändert nicht klickbar und zeigen keinen erfundenen Periodentag.
  - Der Home-Screen-Hintergrund (Ring, Kalender, Buttons) wird bei offenem Tagesfenster über das native HTML-Attribut `inert` deaktiviert (nicht fokussierbar, nicht klickbar, für Screenreader ausgeblendet); `DayDetailModal` selbst liegt als Geschwisterelement außerhalb der `inert`-Root, damit es bedienbar bleibt.
  - Keine neue API-Route, keine Datenbankänderung, keine neue Speicherung – rein lesende Client-Ableitung aus bereits geladenen `periods`.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen.
- Tests:
  - Neues `scripts/verify-day-detail.ts`: 13 Prüfungen – `periodDayNumber` (Starttag = 1, dritter Tag = 3, Monatsgrenze September/Oktober, Jahresgrenze Dezember/Januar), `getCalendarDayInfo`-Status für `confirmed`/`running` (öffnen das Fenster) sowie `expected`/`planned`/`estimate`/`neutral` (kein Periodentag), sowie Quelltext-Prüfungen, dass der klickbare Tag ausschließlich aus `storedPeriod`/`runningPeriod` abgeleitet wird, `role="dialog"`/`aria-modal="true"` gesetzt sind, der Hintergrund über `inert` deaktiviert wird und Escape das Fenster schließt. Alle 13 Prüfungen bestanden.
  - `scripts/verify-personal-cycle-view.ts` und `scripts/verify-my-periods.mts` erneut ausgeführt (Regressionsprüfung für Version 3): weiterhin alle Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler.
  - `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 34 Routen erzeugt.
  - Mobile Sichtprüfung wurde für diese Version nicht mit Playwright durchgeführt (siehe offene Punkte) – gemäß der vom Owner bestätigten Arbeitsweise „erst schnell bauen und selbst sichten, schwere Prüfungen erst bei Bedarf“ wurde die Prüftiefe auf Build, TypeScript und die gezielte Skript-Prüfung konzentriert. Das Modal nutzt dieselben, bereits mobil geprüften Layout-Muster (`fixed inset-0`, `max-w-sm`, zentriert) wie `PeriodFormModal` und `MyPeriodsModal` aus Version 1/2.
- Abweichungen: keine fachliche Abweichung. Der bereits in Version 3 dokumentierte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und wurde deshalb für die Pflichtprüfung dieser Version durch ein eigenständiges `npx tsx`-Skript ersetzt, statt sich auf den kaputten Node-Testrunner zu verlassen.
- offene Punkte:
  - Owner-Prüfschritt für Version 4 steht aus (dritten bestätigten Periodentag antippen, Wochentag/Datum/„3. Periodentag“ prüfen, Hintergrund währenddessen unbedienbar, Schließen und Escape prüfen, mobile Sichtprüfung ohne horizontalen Überlauf).
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Soll und Ist stimmen für Version 1 und Version 2 überein. Der eine Home-Einstieg führt zur getrennten Liste; einzelne Einträge lassen sich prüfen, ändern und bewusst einzeln löschen. Der Kalender bleibt reine Orientierung.
- Nachweise: Commit `2454e6721b0412f97220365e949a92cb8f25bee3` ist auf `origin/main` bestätigt. Die gezielte Codex-Prüfung `verify-my-periods.mts` besteht mit allen Fällen; Claude dokumentiert zusätzlich erfolgreichen Build, Datenbanktrennung und mobile Sichtprüfung.
- Abweichung: keine fachliche Abweichung. Der dokumentierte UI-Timing-Hinweis nach `router.refresh()` zeigte keine Dateninkonsistenz; die direkte Datenbankprüfung bestätigte den richtigen Endzustand.
- Owner-Abnahme offen: `Meine Periode aktualisieren` öffnen, einen Zeitraum ändern und speichern; danach einen anderen Eintrag löschen, zuerst `Abbrechen` und dann bewusst `Endgültig löschen` prüfen.
- Product-Map aktualisiert: ja
