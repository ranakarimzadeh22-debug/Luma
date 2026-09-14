---
id: WP-003
title: "Gespeicherte Perioden sicher bearbeiten und löschen"
package_revision: 9
status: completed
created: 2026-09-07
updated: 2026-09-14
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

### Korrektur – Serverfehler auf `/neu` nach Version 4 (9. September 2026)

- Fehler: Nach dem Deployment von Commit `d8de4b806e6f4415541c2827e3f573f713a93a0c` zeigte `/neu` für angemeldete Konten mit gespeicherten Perioden einen Serverfehler (500).
- Ursache: Beim Herauslösen von `dayAriaLabel` aus dem bedingten JSX der Kalenderzelle wurde `formatPeriodDate(date as string)` versehentlich unbedingt für **jede** Zelle im Monatsraster aufgerufen – auch für die leeren Füllzellen am Monatsanfang/-ende, bei denen `date === null` ist. `formatPeriodDate(null)` erzeugt über `new Date("nullT00:00:00")` ein ungültiges Datum; `Intl.DateTimeFormat.format()` wirft darauf `RangeError: Invalid time value`, was das Server-Rendering von `/neu` zum Absturz brachte, sobald mindestens ein gespeicherter Periodeneintrag geladen wird (nur dann läuft der betroffene Codepfad). Reproduziert durch lokalen Produktions-Build (`npm run build && next start`) mit einem Testkonto mit vier Perioden (inkl. einer laufenden) und einem `RangeError`-Stacktrace exakt an dieser Stelle.
- Behoben in `src/components/NewCycleExample.tsx`: `dayAriaLabel` wird jetzt nur noch berechnet, wenn `date` vorhanden ist (leere Zellen erhalten ein leeres Label), analog zum bereits vorhandenen Muster bei `storedPeriod`/`runningPeriod`/`dayInfo`.
- Kein Zusammenhang mit der Datenbankmigration aus Version 3: Diese wurde bereits beim vorherigen Deployment (Commit `901245d`) erfolgreich auf die Produktionsdatenbank angewendet, was durch die Deployment-Historie und einen gezielten Test (Spalte lokal temporär entfernt und wiederhergestellt, um den erwarteten Fehlertyp abzugrenzen) ausgeschlossen wurde.
- Geprüft: lokaler Produktions-Build und -Server (`next start`, separater Port) mit eingeloggtem Testkonto und vier Perioden zeigt `/neu` nach dem Fix mit `STATUS 200` und korrektem Inhalt (inkl. „Läuft“-Kennzeichnung für die laufende Periode); vorher reproduzierbar `STATUS 500` mit demselben `RangeError`. `scripts/verify-day-detail.ts`, `scripts/verify-personal-cycle-view.ts`, `scripts/verify-my-periods.mts` erneut ausgeführt, alle weiterhin bestanden. `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich. Lokales Testkonto nach der Prüfung wieder gelöscht.
- offene Punkte:
  - Owner-Prüfschritt für Version 4 steht aus (dritten bestätigten Periodentag antippen, Wochentag/Datum/„3. Periodentag“ prüfen, Hintergrund währenddessen unbedienbar, Schließen und Escape prüfen, mobile Sichtprüfung ohne horizontalen Überlauf).
  - Owner sollte nach dem Deployment dieser Korrektur bestätigen, dass `/neu` online wieder ohne Fehler lädt.
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 5 – Vergangene Periode direkt im Kalender erfassen (9. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Du gehst im sichtbaren Kalender zum vergangenen Monat. Dort tippst du zuerst auf den tatsächlichen Starttag und danach auf den tatsächlichen Endtag.
- **Beispiel:** Du tippst auf den 30. Juli, wählst `Start der Periode`, tippst später auf den letzten Tag und wählst `Ende der Periode`.
- **Danach:** Luma zeigt den ausgewählten Zeitraum direkt im selben Kalender. Du prüfst ihn einmal und speicherst ihn bewusst.
- **Wichtig:** Du öffnest keinen zweiten Kalender. `Meine Perioden` bleibt nur für späteres Ändern oder Löschen bestehen.

### Entstehungsweg

`Nachtragen vergangener Perioden über einen getrennten Weg ist zu umständlich → Nutzerin sieht den richtigen Monat bereits im Home-Kalender → Start und Ende dort auswählen, prüfen und speichern → WP-003 Version 5`

- bestätigtes Problem: Der getrennte Eingabeweg verlangt zusätzliche Schritte und einen weiteren Kalender, obwohl der passende Monat bereits sichtbar ist.
- gewünschte Wirkung: Eine vergangene Periode kann schnell und verständlich im sichtbaren Kalender erfasst werden.
- gewählte Lösung: Zwei geführte Tagesaktionen im selben Kalender; erst Start, dann Ende, danach genau eine Prüfung und Speicherung.
- ersetzt für vergangene Neueinträge: Die frühere Regel „Kalender nur zur Orientierung“ gilt nicht mehr für diese klar geführte Erfassung.
- bleibt getrennt: Laufende Perioden, erwartete Enden und die Verwaltung bestehender Einträge folgen weiterhin ihren bestehenden Wegen.

### Soll – von Codex

- Jeder vergangene, neutrale Kalendertag kann ein Tagesfenster mit `Start der Periode` öffnen.
- Nach der Auswahl eines Starts bleibt dieser sichtbar als noch nicht gespeicherte Auswahl. Der Kalender erklärt klar, dass jetzt der letzte Tag gewählt wird.
- Nach Auswahl eines späteren vergangenen Tages bietet das Tagesfenster `Ende der Periode`. Ein Ende vor dem gewählten Start ist nicht zulässig.
- Nach Start und Ende zeigt Luma im selben Ablauf eine kurze Zusammenfassung mit `Prüfen und speichern` sowie `Abbrechen`.
- Erst `Speichern` erstellt den bestehenden kontogebundenen Periodeneintrag. Danach markieren die betreffenden Tage den bestätigten Zeitraum direkt im Kalender.
- `Abbrechen` verwirft nur die noch nicht gespeicherte Auswahl und verändert keine Daten.
- Bereits bestätigte Periodentage behalten das lesende Tagesfenster aus Version 4. `Meine Perioden` bleibt für Ändern und Löschen vorhandener Einträge erreichbar.
- Zukünftige, erwartete, geplante und neutrale heutige Tage werden durch diese Version nicht zu einer neuen historischen Eingabe. Die neue Kalendererfassung gilt ausschließlich für vergangene Daten.

### Abnahmekriterien

1. In einem vergangenen Monat kann die Nutzerin einen vergangenen Starttag wählen, ohne einen zweiten Kalender zu öffnen.
2. Nach dem Start kann sie nur einen gleichen oder späteren vergangenen Tag als Ende übernehmen.
3. Vor dem Speichern ist der Zeitraum im sichtbaren Kalender erkennbar; nach `Abbrechen` verschwindet er wieder.
4. Nach `Speichern` bleibt der bestätigte Zeitraum nach Neuladen und erneuter Anmeldung sichtbar.
5. Ein ungültiges Ende, Zukunftsdatum, Überschneidung oder fremdes Konto kann keine Daten verändern.
6. Ein bereits bestätigter Periodentag zeigt weiterhin seine Information aus Version 4.

## Technischer Auftrag für Claude – Version 5

### Bestätigte Code-Ausgangslage

- `src/components/NewCycleExample.tsx` enthält den sichtbaren Monatskalender, Monatsnavigation, `DayDetailModal` aus Version 4 und die vorhandenen modalen Eingabe-/Verwaltungswege.
- `POST /api/neu/periods` sowie `validateNewRunningPeriodInput` und `createNewPeriodEntry` speichern kontogebundene Perioden mit serverseitiger Reihenfolge-, Zukunfts- und Überschneidungsprüfung.
- Die aktuelle Kalenderdarstellung kann bestätigte, laufende, erwartete und neutrale Tage unterscheiden.

### Technisches Ziel

- Ergänze im bestehenden Kalender eine klar begrenzte Client-Auswahl für **vergangene neue historische Perioden**: Zustand `kein Start → Start gewählt → Ende gewählt → prüfen/speichern`.
- Ein neutraler vergangener Tag öffnet ein kleines, zugängliches Tagesfenster mit der passenden Aktion. Solange noch kein Start ausgewählt ist, ist das `Start der Periode`; danach ist es für einen zulässigen Tag `Ende der Periode`.
- Nutze für Start und Ende weiterhin den bestehenden `POST /api/neu/periods`-Weg. Keine zweite Kalenderkomponente, keine neue Datenbanktabelle und keine neue API-Route.
- Verwende die vorhandene serverseitige Validierung als verbindliche Sicherheit. Die Oberfläche darf lediglich sinnvoll führen, aber keine serverseitigen Prüfungen ersetzen.
- Zeige die unfertige Auswahl sichtbar und barrierefrei im selben Kalender. Erst nach explizitem `Speichern` darf der Eintrag dauerhaft entstehen; `Abbrechen` setzt ausschließlich den lokalen Auswahlzustand zurück.
- Lass Version 4 für bereits bestätigte `confirmed`/`running`-Tage bestehen. Es darf keine unklare Konkurrenz zwischen Tagesinformation und Neueingabe geben.
- Die neue Auswahl gilt nur für Datum `< heute`. Laufende Eingaben von heute und erwartete Enden bleiben bei der Logik aus Version 3.

### Pflichtprüfungen

- Vergangener Start + späteres vergangenes Ende: Zusammenfassung, Speichern, Neuladen und erneute Anmeldung bestätigen den einen neuen Zeitraum.
- Starttag = Endtag ist nur zulässig, wenn die vorhandene Servervalidierung dies akzeptiert; andernfalls verständliche Fehlermeldung ohne Speicherung.
- Ende vor Start, heutige/zukünftige Daten und Überschneidung werden serverseitig abgelehnt.
- Abbrechen nach Start und nach Ende verändert die Datenbank nicht und entfernt nur die lokale Auswahl.
- Bereits bestätigter Periodentag öffnet weiterhin Version-4-Information; erwartete/geplante Tage erhalten keine historische Neueingabe.
- Kontotrennung, bestehendes Ändern/Löschen, TypeScript, gezielter Test, Produktions-Build und Ledger-Validierung bestehen.
- Mobile Sichtprüfung: Monatswechsel, Auswahl, Prüfung, Abbrechen und Speichern funktionieren ohne horizontalen Überlauf.

### Stoppbedingungen

- Stoppe vor einer Datenbankmigration, neuen API-Route, automatischer Speicherung oder einer Änderung der Vorhersage- und Zykluskreislogik.
- Stoppe, wenn ein neutraler Kalendertag nicht sicher von einem erwarteten/geplanten oder bestätigten Tag unterscheidbar ist. Keine Statusregel raten.
- Stoppe vor einer Veränderung der alten Luma oder von Daten eines anderen Kontos.

### Abschluss durch Claude

- Ergänze `Ist Version 5`, nenne Abweichungen sichtbar und setze das Paket auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus und committe/pushe nur auftragsbezogene Dateien.

### Version 5 – Vergangene Periode direkt im Kalender erfassen (9. September 2026)

- umgesetzt:
  - `src/components/NewCycleExample.tsx`: Ein neutraler Kalendertag vor heute (kein `confirmed`, `running`, `expected` oder `planned`) ist jetzt klickbar und öffnet ein neues, rein geführtes Tagesfenster `HistoricalDayActionModal` mit Datum und genau einem Aktions-Button: `Start der Periode`, solange noch keine Auswahl läuft, danach `Ende der Periode` für einen zulässigen späteren Tag. Erst der Button-Klick setzt die jeweilige Auswahl (`historicalDayAction` → `confirmHistoricalDayAction`); der reine Tipp auf den Tag verändert noch nichts.
  - Nach der Start-Wahl bleibt die Auswahl sichtbar als schwebender, nicht blockierender Hinweis („Beginn: … Tippe jetzt auf den letzten Tag der Periode.“, mit ×-Abbrechen) sowie farblich im Kalender markiert (`isSelectionStart`/`isInSelectionRange`, gleiche Farbe wie ein bestätigter Periodentag). Der übrige Home-Screen bleibt währenddessen bedienbar, damit der zweite Tag angetippt werden kann.
  - Nach der Ende-Wahl öffnet `HistoricalReviewModal` mit der Zusammenfassung (`Beginn bis Ende`) und den Buttons `Abbrechen`/`Prüfen und speichern`; der Home-Screen-Hintergrund wird währenddessen über `inert` deaktiviert (analog zu `DayDetailModal` aus Version 4). Erst `Prüfen und speichern` sendet `POST /api/neu/periods` (bestehende, bereits gesicherte Route, keine neue Route, keine Schemaänderung) mit `{ startDate, endDate }`.
  - `Abbrechen` ist an jeder Stelle (Aktionsdialog, schwebender Hinweis, Review) rein lokal: es setzt nur `historicalSelection`/`historicalDayAction` zurück und löst keinen Netzwerkaufruf aus.
  - Ein erneuter Tipp auf einen früheren Tag als den bisherigen Start (bevor ein Ende gewählt wurde) öffnet erneut den Aktionsdialog mit `Start der Periode` und ersetzt den bisherigen Start; damit ist immer nur ein in sich stimmiger Zeitraum in Arbeit.
  - Bereits bestätigte oder laufende Periodentage (`confirmed`/`running`) bleiben unverändert beim lesenden `DayDetailModal` aus Version 4 (`isDayDetailAvailable`-Zweig unverändert); erwartete, geplante und zukünftige Tage bleiben nicht klickbar für die neue Erfassung.
  - Die neue Auswahl ist ausschließlich für `date < todayKey` verfügbar (`isPastNeutralDay`); ein heutiger oder zukünftiger Tag löst sie nicht aus. Laufende Perioden von heute und erwartete Enden folgen unverändert der Logik aus Version 3.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Kein zweiter Kalender, keine neue API-Route, keine Datenbankänderung, keine Änderung der Vorhersage-/Zykluskreislogik.
- Tests:
  - Neues `scripts/verify-historical-entry.ts`: 10 Prüfungen – bestehende Servervalidierung akzeptiert vergangenen Start mit vergangenem Ende und Start=Ende, lehnt Ende-vor-Start sowie heutige/zukünftige Daten ab; Quelltext-Prüfungen bestätigen den bestehenden `POST /api/neu/periods`-Weg (keine neue Route), die `Start der Periode`/`Ende der Periode`-Beschriftung, die Beschränkung auf vergangene neutrale Tage, dass Abbrechen ausschließlich lokal wirkt (kein `fetch`), dass der Hintergrund während der Review-Ansicht über `inert` blockiert wird, und dass Version 4 unverändert bestehen bleibt. Alle 10 Prüfungen bestanden.
  - `scripts/verify-day-detail.ts` an die erweiterte `inert`-Bedingung angepasst (jetzt auch `historicalDayAction` und die Review-Phase berücksichtigend) und erneut ausgeführt: alle 13 Prüfungen bestanden.
  - `scripts/verify-personal-cycle-view.ts` und `scripts/verify-my-periods.mts` erneut ausgeführt (Regressionsprüfung für Version 3): weiterhin alle Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 34 Routen erzeugt.
  - Zusätzliche end-to-end-Prüfung mit temporär installiertem Playwright (Chromium, 375×812, danach vollständig wieder entfernt) gegen einen lokalen Produktions-Build (`npm run build && next start`) mit einem Testkonto: (1) Tipp auf einen neutralen vergangenen Tag öffnet den Dialog mit „Start der Periode“; Klick darauf zeigt den schwebenden Hinweis; Tipp auf einen späteren Tag öffnet den Dialog mit „Ende der Periode“; Klick darauf öffnet das Review-Modal; während des Reviews ist der Monatswechsel-Button nicht bedienbar (inert bestätigt); „Prüfen und speichern“ speichert erfolgreich (per direkter Datenbankprüfung bestätigt: neuer Eintrag mit dem gewählten Zeitraum vorhanden, keine Konsolen-/Seitenfehler). (2) Abbrechen im Aktionsdialog nach der Starttag-Wahl und Abbrechen im Review-Modal wurden separat geprüft; die Datenbank zeigte in beiden Fällen exakt den vorherigen Datenstand ohne neuen Eintrag. Diese vertiefte Prüfung wurde bewusst durchgeführt, weil Version 4 zuvor einen Serverfehler enthielt, der nur durch echtes Rendering sichtbar wurde; für die neue, mehrstufige Kalender-Interaktion war eine reine Quelltext-/Unit-Prüfung nicht ausreichend. Playwright und das Testkonto wurden danach vollständig entfernt.
- Abweichungen:
  - Der Auftrag beschreibt „Ein neutraler vergangener Tag öffnet ein kleines, zugängliches Tagesfenster mit der passenden Aktion“ – dazu wurde eine Owner-Rückfrage gestellt, ob der Tipp direkt die Auswahl setzen darf oder zwingend über ein Tagesfenster mit explizitem Aktions-Button laufen soll. Entscheidung: wörtlich wie im Soll-Text, über ein Tagesfenster mit Button. So umgesetzt.
  - Der bereits in Version 3/4 dokumentierte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für diese Version nicht im Umfang.
- offene Punkte:
  - Owner-Prüfschritt für Version 5 steht aus (in einem vergangenen Monat einen Start wählen, Aktionsdialog bestätigen, einen späteren Tag als Ende wählen, Aktionsdialog bestätigen, Zusammenfassung prüfen, speichern, nach Neuladen und erneuter Anmeldung den Zeitraum bestätigt sehen; zusätzlich Abbrechen an beiden Stellen prüfen; mobile Sichtprüfung).
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 6 – Periodenhistorie über die Monatsanzeige (9. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Du tippst auf die Monatsanzeige, zum Beispiel `September 2026`.
- **Dann siehst du:** Eine klare Übersicht aller vergangenen tatsächlichen Perioden – ohne einen weiteren Kalender zu suchen.
- **Jede Zeile zeigt:** Den Monat, den tatsächlichen Zeitraum und die tatsächliche Länge dieses Zyklus.
- **Beispiel:** `Juli 2026: 30.07.–05.08. · Zyklus: 28 Tage`.
- **Neuester Eintrag:** Dort steht `Zyklus: Noch nicht bekannt`, bis die nächste tatsächliche Periode begonnen hat.

### Entstehungsweg

`Einzelne Termine sind im Kalender verteilt → Nutzerin möchte ihre vergangenen Monate und tatsächlichen Zykluslängen auf einen Blick verstehen → antippbare Monatsanzeige öffnet eine lesende Historie → WP-003 Version 6`

- bestätigtes Problem: Die bisherigen Einträge sind über Monate verteilt und die Zykluslänge je Zeitraum ist nicht direkt sichtbar.
- gewünschte Wirkung: Die Nutzerin versteht ihre eigene Periodenhistorie und Unterschiede zwischen echten Zykluslängen schnell und ohne neue Eingabe.
- gewählte Lösung: Eine lesende, übersichtliche Modal-Historie über der bestehenden Home-Ansicht.
- Berechnungsregel: Die tatsächliche Zykluslänge reicht vom ersten Tag einer tatsächlichen Periode bis zum ersten Tag der folgenden tatsächlichen Periode.
- Grenzen: Keine Schätzung, keine neue Datenart, keine Bearbeitung oder Löschung aus dieser Übersicht.

### Soll – von Codex

- Die sichtbare Monatsanzeige des Home-Kalenders wird als klar zugänglicher Auslöser für die Periodenhistorie nutzbar.
- Ein Tipp öffnet ein Modal über dem vollständig abgedunkelten Home-Screen; nur die Historie ist aktiv.
- Die Historie enthält pro tatsächlichem Periodeneintrag eine Zeile: Monatsname und Jahr des Starts, tatsächlicher Zeitraum und rückblickend berechnete Zykluslänge.
- Der Zeitraum verwendet nur echte Daten. Ein noch laufender Eintrag wird verständlich als `läuft noch` gezeigt und erhält keine erfundene Endangabe.
- Die Zykluslänge wird ausschließlich aus zwei aufeinanderfolgenden tatsächlichen `startDate`-Werten berechnet. Ein erwartetes Ende, eine automatische Schätzung, ein Plan oder ein Profilwert zählt nie mit.
- Für den zeitlich neuesten tatsächlichen Start steht `Zyklus: Noch nicht bekannt`.
- Bei keiner gespeicherten Periode erklärt das Modal kurz und freundlich, dass noch keine Historie vorhanden ist.
- Die Historie ist rein lesend. Änderungen und Löschen bleiben weiterhin im bewussten Bereich `Meine Perioden`.

### Abnahmekriterien

1. Ein Tipp auf `September 2026` öffnet die Historie und dunkelt Zyklus-Kreis sowie Kalender im Hintergrund ab.
2. Eine abgeschlossene Zeile zeigt Monat, tatsächlichen Start-Ende-Zeitraum und den Abstand bis zum Start der folgenden tatsächlichen Periode.
3. Unterschiedliche tatsächliche Abstände, zum Beispiel 23, 24 und 25 Tage, erscheinen getrennt und werden nicht gemittelt.
4. Der neueste tatsächliche Eintrag zeigt `Noch nicht bekannt` statt einer Schätzung.
5. Ein erwartetes Ende oder eine geschätzte künftige Periode verändert keine Zeile und keine Zykluslänge.
6. Schließen stellt die normale Bedienung des Home-Screens wieder her.

## Technischer Auftrag für Claude – Version 6

### Bestätigte Code-Ausgangslage

- `src/components/NewCycleExample.tsx` erzeugt die Monatsanzeige und enthält bereits zugängliche Modal-Muster mit vollständigem Overlay, Escape und Hintergrund-Deaktivierung.
- `initialPeriods`/`periods` enthalten kontogebundene tatsächliche Einträge aus `new_period_entries`, einschließlich `startDate` sowie optionalem echtem `endDate` und optionalem `expectedEndDate`.
- `src/lib/new-cycle-prediction.ts` und `src/lib/personal-cycle-view.ts` enthalten Vorhersage-/Medianlogik; diese Übersicht darf sie nicht für rückblickende Werte verwenden.

### Technisches Ziel

- Ergänze eine rein lesende `PeriodHistoryModal` oder eine gleichwertige klar gekapselte Komponente und einen clientseitigen Öffnungszustand in `NewCycleExample.tsx`.
- Verwende die Monatsanzeige als semantischen Button mit zugänglichem Namen, ohne die Monatsnavigation über die Pfeile zu verändern.
- Leite für die Historie chronologisch aus tatsächlichen Einträgen ab: Für jeden Start außer dem neuesten berechne die Differenz bis zum direkt folgenden tatsächlichen Start in Kalendertagen. Der neueste Start erhält keinen berechneten Wert.
- Formatiere Monat, Zeitraum und Datum deutsch sowie sicher ohne Zeitzonenverschiebung. Verwende für eine abgeschlossene Periode den echten `endDate`; `expectedEndDate` ist nie ein tatsächliches Ende.
- Verwende das vorhandene Overlay-/Focus-/Escape-Muster aus Version 4. Der Hintergrund wird während der Ansicht nicht bedienbar.
- Keine API, Datenbankmigration, Speicherung, Änderung der Kalenderauswahl oder Änderung der Vorhersagelogik einführen.

### Pflichtprüfungen

- Gezielte Testfälle für aufeinanderfolgende Starts über Monats- und Jahresgrenze, zum Beispiel 30.07. bis 27.08. = 28 Kalendertage.
- Neuester Start zeigt `Noch nicht bekannt`; erwartete Enddaten und automatische Schätzungen beeinflussen die Historie nicht.
- Abgeschlossener Zeitraum zeigt echtes Ende; laufender Zeitraum zeigt keine erfundene Endangabe.
- Monatsanzeige per Tastatur und Touch öffnen, Escape sowie sichtbaren Schließen-Button prüfen.
- Mobile Sichtprüfung: vollständiges Overlay, Zeilen lesbar, kein horizontaler Überlauf.
- TypeScript, gezielter Test, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe vor jeder Datenbank- oder API-Änderung, Speicherung, Bearbeitungsfunktion oder Nutzung einer Schätzung als historische Tatsache.
- Stoppe, wenn mehrere echte Einträge denselben Starttag besitzen oder die Reihenfolge nicht eindeutig ist. Diesen Datenkonflikt nicht durch eine willkürliche Zykluslänge verdecken.

### Abschluss durch Claude

- Ergänze `Ist Version 6`, nenne Abweichungen sichtbar und setze das Paket auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus und committe/pushe nur auftragsbezogene Dateien.

### Version 6 – Periodenhistorie über die Monatsanzeige (9. September 2026)

- umgesetzt:
  - Neues, reines Modul `src/lib/period-history.ts` mit `computePeriodHistory(periods)`: leitet chronologisch aus tatsächlichen Einträgen eine Historie ab. Für jeden Start außer dem zeitlich neuesten wird die Differenz in Kalendertagen bis zum direkt folgenden tatsächlichen Start berechnet (reine Datums-String-Arithmetik über `Date.UTC`, keine Zeitzonenverschiebung); der neueste Start erhält `cycleLengthDays: null`. `endDate` wird unverändert durchgereicht (bleibt `null` bei einem laufenden Eintrag, auch wenn `expectedEndDate` gesetzt ist) – ein erwartetes Ende zählt nie als echtes Ende oder Berechnungsgrundlage.
  - `src/components/NewCycleExample.tsx`: Die bestehende Monatsanzeige (`{monthName}`) ist jetzt ein zugänglicher `<button>` mit sprechendem `aria-label`, der `PeriodHistoryModal` öffnet. Die Monatsnavigation über die `‹`/`›`-Pfeile bleibt unverändert unabhängig davon bestehen.
  - Neue Komponente `PeriodHistoryModal`: rein lesendes, vollständiges Overlay (`role="dialog"`, `aria-modal="true"`, Escape-Handler, sichtbarer „Schließen“-Button) über dem gesamten Home-Screen, analog zum bestehenden Muster aus `DayDetailModal`. Zeigt pro Zeile Monat/Jahr des Starts, den tatsächlichen Zeitraum (`Beginn bis Ende` bzw. `Beginn, läuft noch` für einen offenen Eintrag) und `Zyklus: {n} Tage` bzw. `Zyklus: Noch nicht bekannt` für den neuesten Eintrag, neueste Zeile zuerst. Bei keiner gespeicherten Periode erscheint ein kurzer, freundlicher Hinweistext statt einer leeren Liste.
  - Der Home-Screen-Hintergrund wird bei offener Historie über das bereits bestehende `inert`-Attribut auf der Root-`div` deaktiviert (dieselbe Bedingung wie für `DayDetailModal`/`HistoricalDayActionModal`/Review aus Version 4/5, um `isPeriodHistoryOpen` erweitert).
  - Keine neue API-Route, keine Datenbankänderung, keine Speicherung – reine clientseitige Ableitung aus den bereits geladenen `periods`. Die bestehende Kalenderauswahl (Version 5) und Verwaltung (`Meine Perioden`) bleiben unverändert.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen.
- Tests:
  - Neues `scripts/verify-period-history.ts`: 12 Prüfungen – Zykluslänge über Monats- und Jahresgrenze (30.07.–27.08. sowie 05.12.–02.01. ergeben je 28 Kalendertage), unterschiedliche Abstände (23/24/25 Tage) bleiben getrennt sichtbar statt gemittelt, der neueste Start bleibt ohne Zykluslänge, ein laufender Eintrag ohne echtes Ende zeigt kein erfundenes Ende, eine leere Historie liefert eine leere Liste ohne Fehler; dazu Quelltext-Prüfungen, dass die Monatsanzeige ein zugänglicher Button ist, die Pfeil-Navigation unverändert bleibt, `PeriodHistoryModal` keinen `fetch`-Aufruf enthält (rein lesend), eine zugängliche Dialog-Kennzeichnung trägt und der Hintergrund über `inert` blockiert wird. Alle 12 Prüfungen bestanden.
  - `scripts/verify-day-detail.ts` und `scripts/verify-historical-entry.ts`: die `inert`-Quelltext-Prüfungen wurden formatierungsrobuster gemacht (Regex statt exaktem Mehrzeilen-String), da die `inert`-Bedingung durch diese Version erneut erweitert wurde; inhaltlich unverändert, weiterhin alle Prüfungen bestanden (13 bzw. 10).
  - `scripts/verify-personal-cycle-view.ts` und `scripts/verify-my-periods.mts` erneut ausgeführt (Regressionsprüfung für Version 3): weiterhin alle Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 34 Routen erzeugt.
  - Zusätzliche Prüfung gegen einen lokalen Produktions-Build (`npm run build && next start`) mit einem Testkonto mit drei Perioden (inkl. einer laufenden mit erwartetem Ende): `/neu` liefert nach Login `STATUS 200` ohne Server-Fehler; der neue Button „Periodenhistorie öffnen“ ist im gerenderten HTML vorhanden. Diese Prüfung wurde bewusst durchgeführt, weil eine frühere Version (4) durch einen unbedingten Feldzugriff in derselben Kalenderzellen-Umgebung einen Serverfehler ausgelöst hatte; für diese Version genügte ein gezielter HTML-Abruf (kein State-Machine-Flow wie in Version 5), da die neue Funktion rein lesend ist. Testkonto danach gelöscht.
- Abweichungen: keine fachliche Abweichung. Der bereits in Version 3/4/5 dokumentierte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für diese Version nicht im Umfang.
- offene Punkte:
  - Owner-Prüfschritt für Version 6 steht aus (auf die Monatsanzeige tippen, Historie mit Zeitraum und Zykluslänge je Zeile prüfen, neuesten Eintrag mit „Noch nicht bekannt“ bestätigen, Schließen und Escape prüfen, mobile Sichtprüfung ohne horizontalen Überlauf).
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 7 – Aus der Historie zum passenden Monat springen (9. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Du öffnest die Periodenhistorie über den Monatsnamen und tippst dort auf einen Monat.
- **Beispiel:** Ein Tipp auf `Dezember 2025` schließt die Historie und zeigt direkt `Dezember 2025` im sichtbaren Kalender.
- **Vorteil:** Du musst nicht viele Monate einzeln zurückblättern.
- **Wichtig:** Der Sprung verändert keine Periodendaten.

### Soll – von Codex

- Jede echte Monatszeile in der Periodenhistorie ist ein klar zugänglicher Button.
- Ein Tipp oder Tastatur-Aktivierung setzt den bestehenden angezeigten Kalender auf Jahr und Monat des tatsächlichen Periodenstarts.
- Danach schließt die Historie. Der Kalender, seine Tagesmarkierungen und seine bisherigen Navigationspfeile funktionieren normal weiter.
- Bei einer über Monatsgrenzen laufenden Periode ist der Monat des tatsächlichen Starttags das Ziel.
- Die Historie bleibt rein lesend; keine Speicherung, keine API- oder Datenbankänderung.

### Abnahmekriterien

1. `Dezember 2025` in der Historie öffnet nach dem Tipp genau Dezember 2025 im Home-Kalender.
2. Die Historie ist danach geschlossen und der Kalender wieder normal bedienbar.
3. Der Zielmonat zeigt die schon gespeicherten Markierungen wie vorher.
4. Touch und Tastatur können den Monat aktivieren.
5. Keine Periodendaten, Vorhersagen oder Zykluslängen ändern sich durch die Navigation.

## Technischer Auftrag für Claude – Version 7

### Bestätigte Code-Ausgangslage

- `src/components/NewCycleExample.tsx` hält den Zustand des angezeigten Monats und enthält die Periodenhistorie aus Version 6.
- Jede Historienzeile ist aus einem tatsächlichen Periodeneintrag mit `startDate` abgeleitet.

### Technisches Ziel

- Reiche der Periodenhistorie einen klaren Callback zum vorhandenen Monatszustand durch oder nutze eine gleichwertige lokal begrenzte Lösung.
- Formatiere die Zielnavigation datumssicher aus dem `startDate` ohne Zeitzonenverschiebung.
- Verwende pro Zeile ein semantisches Button-Element mit verständlichem zugänglichem Namen, zum Beispiel `Kalender für Dezember 2025 öffnen`.
- Nach erfolgreicher Auswahl setzt die Ansicht den Monat und schließt das Modal. Keine neue Route, keine neue Datenbanktabelle, keine API-Anfrage und keine Speicherung.

### Pflichtprüfungen

- Gezielte Prüfung für einen Sprung über eine Jahresgrenze, etwa Januar 2025 aus einem aktuellen Monat.
- Prüfung, dass der Zeitraum bei einer Monatsgrenze den Startmonat nutzt.
- Touch-/Tastatur-Aktivierung schließt die Historie und setzt genau den ausgewählten Monat.
- Bestehende Monatsnavigation, Periodenhistorie, TypeScript, gezielter Test, Produktions-Build und Ledger-Validierung bestehen.

### Stoppbedingungen

- Stoppe vor einer Datenbank-, API- oder Vorhersageänderung.
- Stoppe, wenn ein Historieneintrag keinen sicheren tatsächlichen Start besitzt; keine Monatsnavigation aus geschätzten Daten ableiten.

### Abschluss durch Claude

- Ergänze `Ist Version 7`, nenne Abweichungen sichtbar und setze das Paket auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus und committe/pushe nur auftragsbezogene Dateien.

### Version 7 – Aus der Historie zum passenden Monat springen (9. September 2026)

- umgesetzt:
  - `src/components/NewCycleExample.tsx`: Jede Zeile in `PeriodHistoryModal` ist jetzt ein `<button>` (statt eines reinen `<div>`) mit zugänglichem Namen `Kalender für {Monat Jahr} öffnen`. Ein Klick oder eine Tastatur-Aktivierung ruft die neue Prop `onSelectMonth(row.startDate)` auf.
  - Neue reine Funktion `yearMonthFromDate(date)`: zerlegt einen `"YYYY-MM-DD"`-String datumssicher (reine String-Arithmetik, kein `Date`-Objekt, keine Zeitzonenverschiebung) in `{ year, month }` (0-basierter Monat, passend zum bestehenden `displayedMonth`-Zustand).
  - Neuer Handler `jumpToHistoryMonth(startDate)`: setzt `displayedMonth` auf `yearMonthFromDate(startDate)` und schließt danach die Historie (`setIsPeriodHistoryOpen(false)`). Bei einer über eine Monatsgrenze laufenden Periode ist der Monat des tatsächlichen Starttags das Ziel, da ausschließlich `startDate` verwendet wird.
  - Die bestehende Pfeil-Monatsnavigation (`changeMonth`, `‹`/`›`) bleibt unverändert unabhängig von diesem neuen Weg bestehen; nach dem Sprung funktionieren Tagesmarkierungen und Navigation im Zielmonat normal weiter, da derselbe `displayedMonth`-Zustand verwendet wird, den auch die Pfeile setzen.
  - Keine neue API-Route, keine Datenbankänderung, keine Speicherung, keine Vorhersageänderung – reine clientseitige Zustandsnavigation.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen.
- Tests:
  - Neues `scripts/verify-history-month-jump.ts`: 8 Prüfungen – `yearMonthFromDate` löst Jahres- und Monatsgrenzen korrekt auf (Januar/Dezember/Juli), eine über die Monatsgrenze laufende Periode (30.07.–03.08.) zeigt auf den Startmonat Juli statt August; Quelltext-Prüfungen bestätigen, dass `jumpToHistoryMonth` sowohl `setDisplayedMonth` als auch `setIsPeriodHistoryOpen(false)` aufruft, keinen `fetch`-Aufruf enthält, dass jede Historienzeile ein Button mit dem geforderten zugänglichen Namen ist, und dass die bestehende Pfeil-Navigation unverändert bleibt. Alle 8 Prüfungen bestanden.
  - `scripts/verify-period-history.ts`: eine Quelltext-Prüfung (`historyIsReadOnly`) wurde robuster gemacht, da sich die Funktionssignatur von `PeriodHistoryModal` durch die neue `onSelectMonth`-Prop geändert hatte und der bisherige exakte Match nicht mehr traf; inhaltlich unverändert, alle 12 Prüfungen weiterhin bestanden.
  - `scripts/verify-day-detail.ts`, `scripts/verify-historical-entry.ts`, `scripts/verify-personal-cycle-view.ts`, `scripts/verify-my-periods.mts` erneut ausgeführt (Regressionsprüfung für Version 3–6): weiterhin alle Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 34 Routen erzeugt.
  - Mobile Sichtprüfung und ein lokaler Produktions-Server-Testlauf wurden für diese Version nicht erneut durchgeführt: Die Änderung fügt keinen neuen serverseitigen Berechnungspfad und keine neuen unbedingten Feldzugriffe in der Kalenderzellen-Schleife hinzu (anders als die frühere Regression aus Version 4), sondern verdrahtet ausschließlich zwei bereits vorhandene, einzeln geprüfte Zustände (`displayedMonth`, `isPeriodHistoryOpen`) neu; die Modal- und Button-Layouts entsprechen den bereits mobil geprüften Mustern aus Version 1–6.
- Abweichungen: keine fachliche Abweichung. Der bereits in Version 3–6 dokumentierte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für diese Version nicht im Umfang.
- offene Punkte:
  - Owner-Prüfschritt für Version 7 steht aus (Periodenhistorie öffnen, auf einen vergangenen Monat tippen, prüfen dass genau dieser Monat im Kalender erscheint und die Historie geschlossen ist, Tastatur-Aktivierung prüfen, mobile Sichtprüfung).
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Soll und Ist stimmen für Version 1 und Version 2 überein. Der eine Home-Einstieg führt zur getrennten Liste; einzelne Einträge lassen sich prüfen, ändern und bewusst einzeln löschen. Der Kalender bleibt reine Orientierung.
- Nachweise: Commit `2454e6721b0412f97220365e949a92cb8f25bee3` ist auf `origin/main` bestätigt. Die gezielte Codex-Prüfung `verify-my-periods.mts` besteht mit allen Fällen; Claude dokumentiert zusätzlich erfolgreichen Build, Datenbanktrennung und mobile Sichtprüfung.
- Abweichung: keine fachliche Abweichung. Der dokumentierte UI-Timing-Hinweis nach `router.refresh()` zeigte keine Dateninkonsistenz; die direkte Datenbankprüfung bestätigte den richtigen Endzustand.
- Owner-Abnahme offen: `Meine Periode aktualisieren` öffnen, einen Zeitraum ändern und speichern; danach einen anderen Eintrag löschen, zuerst `Abbrechen` und dann bewusst `Endgültig löschen` prüfen.
- Product-Map aktualisiert: ja

## Version 8 – Tatsächliche Tage korrigieren eine Schätzung (13. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Du tippst im Kalender auf einen Tag und kannst den tatsächlichen Beginn oder das tatsächliche Ende deiner Periode eintragen. Eine Luma-Schätzung darf dich dabei nie blockieren.
- **Beispiel:** Luma zeigt ein erwartetes Ende für heute. War deine Periode schon gestern zu Ende, tippst du auf gestern und wählst `Periode beendet`. Danach ist gestern das tatsächliche Ende.
- **Löschen:** `Periodentag löschen` ist nur für den ersten oder letzten tatsächlich gespeicherten Periodentag möglich. So wird ein Zeitraum sicher kürzer, ohne ihn in zwei unklare Teile zu zerlegen.
- **Was ändert sich danach?** Luma berechnet spätere Schätzungen wieder aus deinen tatsächlichen Daten. Erwartete Tage bleiben als Schätzung mit `Kann abweichen` sichtbar.

### Entstehungsweg

`Vorhergesagtes Ende kann von der Realität abweichen → die Schätzung darf echte Angaben nicht sperren → Tagesfenster korrigiert tatsächlichen Beginn, tatsächliches Ende oder einen Randtag → WP-003 Version 8`

- bestätigtes Problem: Eine erwartete Periode kann früher oder später enden. Die Nutzerin muss ihren tatsächlichen Verlauf direkt im sichtbaren Kalender korrigieren können.
- gewünschte Wirkung: Echte Periodendaten lassen sich einfach und sicher vor einer Schätzung speichern; nachfolgende Vorhersagen passen sich daran an.
- gewählte Lösung: Das vorhandene Tagesfenster bietet für passende Tage klare Aktionen für tatsächlichen Beginn, tatsächliches Ende und die sichere Rand-Löschung.
- wichtige Entscheidung: `DEC-125 – Tatsächliche Periodendaten korrigieren Schätzungen am Rand`.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-012.md`, `C:\coden\CODEX\App-Luma-Assistent\control\DECISIONS.md#dec-125`.

### Soll – von Codex

- Ein Tipp auf einen Kalendertag öffnet weiterhin ein kleines Tagesfenster über dem abgedunkelten Home-Screen.
- Für heutige und vergangene Tage bietet das Fenster die klaren Aktionen `Periode begonnen`, `Periode beendet` und – nur an einem bestätigten ersten oder letzten Periodentag – `Periodentag löschen`.
- `Periode begonnen` speichert den gewählten heutigen oder vergangenen Tag als tatsächlichen Beginn. Ein erwarteter Kalendertag darf diesen Weg nicht blockieren.
- `Periode beendet` ergänzt oder korrigiert das tatsächliche Ende der passenden laufenden Periode. Ein erwartetes Ende wird danach nicht weiter als aktiv gezeigt.
- `Periodentag löschen` kürzt nur den gewählten bestätigten Randtag. Bei einem einzelnen tatsächlichen Tag muss Luma ausdrücklich erklären, dass damit der gesamte einzelne Eintrag gelöscht wird, und eine zweite Bestätigung verlangen.
- Ein Tag in der Mitte eines bestätigten Zeitraums kann nicht einzeln gelöscht werden. Das Tagesfenster erklärt kurz: `Du kannst nur den ersten oder letzten Periodentag löschen.`
- Für zukünftige Tage bleibt die bestehende getrennte Planungslogik erhalten: Sie dürfen niemals unbemerkt als tatsächliche Periode gespeichert werden. Diese Version erweitert keine Zukunftsplanung.
- Nach jeder erfolgreichen tatsächlichen Korrektur aktualisieren Kalender, Zyklus-Kreis und spätere Schätzungen über die vorhandene echte Datenbasis. Eine Schätzung bleibt sichtbar als `Voraussichtlich` und `Kann abweichen`.

### Abnahmekriterien

1. Bei einer laufenden Periode mit erwartetem Ende heute kann die Nutzerin gestern als tatsächliches Ende speichern. Der heutige erwartete Tag ist danach nicht mehr als laufend bestätigt sichtbar.
2. Ein tatsächlicher Beginn heute lässt sich auch dann speichern, wenn Luma an diesem Tag eine andere oder keine Schätzung zeigt.
3. Der erste oder letzte bestätigte Periodentag lässt sich nur nach klarer Bestätigung löschen; die Periode wird am richtigen Rand gekürzt.
4. Ein mittlerer bestätigter Tag wird nicht einzeln gelöscht und zeigt die kurze Erklärung.
5. Erwartete Tage bleiben Schätzungen und werden nie als tatsächliche Daten übernommen.
6. Ein anderes Konto kann keine Periodentage dieses Kontos sehen, ändern oder löschen.

### Technischer Auftrag für Claude – Version 8

#### Bestätigte Code-Ausgangslage

- `src/components/NewCycleExample.tsx` enthält `DayDetailModal`, `HistoricalDayActionModal`, die Kalenderzellen und die Zustände `periods`, `historicalSelection` sowie `historicalDayAction`.
- Die bestehende Tagesaktion legt derzeit eine Auswahl für Beginn/Ende an; `saveHistoricalSelection` sendet `POST /api/neu/periods`.
- `src/app/api/neu/periods/[id]/route.ts` schützt vorhandene `PUT`- und `DELETE`-Änderungen durch Sitzung, Herkunftsprüfung, kontobezogene ID und Servervalidierung.
- `src/lib/new-periods.ts` und `src/lib/new-period-validation.ts` speichern tatsächlichen Beginn, optionales tatsächliches Ende und optionales erwartetes Ende. Die Prediction- und Kreislogik liest diese bestehende Datenbasis bereits.

#### Technisches Ziel

- Erweitere den bestehenden interaktiven Tagesweg statt eines zweiten Kalenders oder einer separaten Verwaltungsseite.
- Gib dem Tagesfenster eine zugängliche Aktionsauswahl. Die Aktion muss aus dem gewählten Datum, dem vorhandenen echten Eintrag und seinem Status sicher ableiten, welcher Eintrag geändert wird; niemals einen fremden oder mehrdeutigen Eintrag raten.
- Nutze die vorhandenen geschützten `POST`, `PUT` und `DELETE`-Wege sowie ihre Serverprüfungen. Eine neue Datenbanktabelle oder Migration ist nicht nötig.
- Bei einem tatsächlichen Ende muss ein vorhandenes `expectedEndDate` im selben Update geleert werden. Aktualisiere den lokalen Zustand erst nach erfolgreicher Serverantwort und rufe danach `router.refresh()` auf, damit Kreis und Vorhersage neu berechnet werden.
- Für die Rand-Löschung: Bei erstem Tag `startDate` auf den Folgetag verschieben, bei letztem Tag `endDate` auf den Vortag verkürzen. Ist kein tatsächlicher Tag übrig, verwende erst nach zweiter Bestätigung den bestehenden `DELETE`-Weg. Ein mittlerer Tag bleibt unverändert.
- Wende keine tatsächliche Zukunftseingabe an. Bestehende getrennte geplante/erwartete Daten und ihre Kennzeichnung bleiben unverändert.

#### Invarianten – müssen unverändert bleiben

- Tatsächliche Nutzereingaben haben Vorrang vor einer Schätzung; Vorhersagen bleiben nie als Tatsache gespeichert.
- Sitzungs-, Herkunfts-, Kontotrennungs-, Datums- und Überschneidungsprüfungen bleiben serverseitig wirksam.
- Keine Schätzung, keine Partnerdaten, kein Bild, keine Anmeldung und keine alte Luma werden geändert.
- Nur der erste oder letzte bestätigte Tag darf einzeln gelöscht werden. Kein Splitten eines Zeitraums, keine Sammellöschung.
- Die bestehende Zukunftsplanung wird nicht erweitert und darf nicht still in tatsächliche Periodendaten überführt werden.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: nur gezielte `INSERT`, `UPDATE` oder `DELETE` auf den eigenen bestehenden Eintrag; keine Schemaänderung.
- betroffene API-Routen: vorhandenes `POST /api/neu/periods`, `PUT /api/neu/periods/[id]`, `DELETE /api/neu/periods/[id]`.
- Migration nötig: nein.

#### Pflichtprüfungen

- Laufende Periode: tatsächlicher Beginn, erwartetes Ende heute, tatsächliches Ende gestern speichern; `expectedEndDate` ist danach leer und der echte Zeitraum korrekt.
- Tatsächlichen Beginn heute auf einem neutralen oder erwarteten Tag speichern; die Schätzung blockiert ihn nicht.
- Ersten und letzten bestätigten Tag jeweils kürzen; mittleren Tag ablehnen; Einzeltag nur nach zweiter Bestätigung vollständig löschen.
- Fremde, ungültige oder mehrdeutige Eintrags-ID wird nicht geändert oder gelöscht.
- Erwartete Zukunftstage werden nicht als tatsächliche Daten gespeichert.
- Nach einer Korrektur Seite neu laden: Kalender, Zyklus-Kreis und nächste Schätzung nutzen den neuen echten Stand.
- TypeScript, gezielte Tests, mobile Browserprüfung, Produktions-Build und Entwicklungsledger-Validierung ausführen.

#### Stoppbedingungen

- Stoppe vor jeder Migration, einer neuen Datenart, einer Änderung der Partneransicht oder einer Erweiterung der Zukunftsplanung.
- Stoppe und dokumentiere den Befund, wenn ein Tagesdatum nicht eindeutig zu genau einem eigenen tatsächlichen Eintrag zugeordnet werden kann; keine automatische Auswahl treffen.
- Stoppe, wenn ein erwarteter Tag technisch als tatsächlich bestätigt gespeichert würde.

#### Abschluss durch Claude

- Ergänze `Ist Version 8`, nenne Abweichungen sichtbar und belasse den Paketstatus auf `review`.
- Ergänze das Entwicklungsledger und führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe nur die auftragsbezogenen Dateien. Kein manuelles Deployment.

### Ist Version 8 – von Claude

- **Umgesetzt:** Das bestehende Tagesfenster (`DayDetailModal` in `src/components/NewCycleExample.tsx`) öffnet sich jetzt für **jeden nicht-zukünftigen Kalendertag** (statt bisher nur für bereits bestätigte/laufende Tage) und bietet je nach abgeleitetem Zustand klare Aktionen: `Periode begonnen`, `Periode beendet` und – nur am ersten oder letzten bestätigten Tag eines Eintrags – `Periodentag löschen`. Ein mittlerer bestätigter Tag zeigt stattdessen den Hinweis „Du kannst nur den ersten oder letzten Periodentag löschen.“
- Neue reine, testbare Ableitungsfunktion `getPeriodDayActions` (`src/lib/period-day-actions.ts`) bestimmt für ein Datum ausschließlich aus den bereits geladenen eigenen Einträgen, welche Aktionen sicher angeboten werden dürfen – niemals durch Raten. Ein Tag zählt nur dann als löschbarer Rand, wenn genau ein Eintrag ihn als Start oder Ende trifft (`edgeMatches.length === 1`); mehrdeutige Treffer (strukturell durch die bestehende Überschneidungsprüfung ausgeschlossen) führen bewusst zu keiner Löschoption statt einer geratenen Auswahl.
- `Periode begonnen` sendet `POST /api/neu/periods` mit dem gewählten Tag als `startDate` und `endDate: null` (laufender Eintrag) – funktioniert unabhängig davon, ob an diesem Tag zuvor eine Schätzung, ein erwarteter oder ein neutraler Zustand angezeigt wurde; die Schätzung blockiert den echten Beginn nicht.
- `Periode beendet` sendet `PUT /api/neu/periods/[id]` für den betroffenen laufenden Eintrag mit dem gewählten Tag als `endDate` und **setzt `expectedEndDate` im selben Update auf `null`** – ein vorheriges erwartetes Ende wird danach nicht weiter als aktiv angezeigt, exakt wie im Auftrag gefordert.
- `Periodentag löschen` an einem Rand verschiebt bei `edge: "start"` den Start um einen Tag nach vorn bzw. verkürzt bei `edge: "end"` das Ende um einen Tag (reine Datums-String-Arithmetik über `shiftDateByOneDay`, `Date.UTC`, keine Zeitzonenverschiebung) und speichert per `PUT`. Ist der betroffene Eintrag ein Einzeltag (`isSingleDay`), erklärt eine zweite, eigene Bestätigungsebene (`DeleteEdgeConfirmModal`) ausdrücklich, dass damit der gesamte Eintrag gelöscht wird, und nutzt erst nach dieser zweiten Bestätigung `DELETE /api/neu/periods/[id]`.
- Der bisherige, zweistufige „Start dann Ende“-Auswahlweg für vergangene neutrale Tage (`historicalSelection`/`historicalDayAction`, `HistoricalDayActionModal`, `HistoricalReviewModal` aus Version 5) wurde entfernt und durch den einheitlichen Tagesfenster-Weg ersetzt (Owner-Entscheidung, siehe Abweichungen) – derselbe Anwendungsfall (einen kompletten vergangenen Zeitraum erfassen) bleibt weiterhin möglich: zuerst am Starttag `Periode begonnen`, danach am echten Endtag `Periode beendet`.
- Keine neue Datenbanktabelle, keine neue Migration, keine neue API-Route: ausschließlich die bereits vorhandenen, gesicherten `POST /api/neu/periods`, `PUT /api/neu/periods/[id]` und `DELETE /api/neu/periods/[id]` werden genutzt, mit ihren bestehenden Sitzungs-, Herkunfts-, Kontotrennungs- und Überschneidungsprüfungen unverändert wirksam.

**Tests:**
- Neue `tests/period-day-actions.test.ts` (11 Prüfungen, Node-eigener Testrunner) für `getPeriodDayActions`: zukünftiger Tag erlaubt keine Aktion; neutraler vergangener Tag erlaubt nur `Periode begonnen`; ein mittlerer Tag einer abgeschlossenen Periode erlaubt weder Beginn noch Löschen; erster/letzter Tag einer mehrtägigen Periode sind je für sich löschbare, aber keine Einzeltag-Ränder; eine abgeschlossene Periode mit genau einem Tag ist als Einzeltag löschbar; eine laufende Periode erlaubt am Starttag bis heute `Periode beendet`; eine heute erst begonnene laufende Periode ist am Starttag ein löschbarer Einzeltag, eine vor mehreren Tagen begonnene nicht; ein nur erwarteter (noch nicht bestätigter) Tag erlaubt keine der drei Aktionen; zwei unabhängige Einträge beeinflussen sich nicht. Alle 11 Prüfungen bestanden.
- Neue `scripts/verify-period-day-actions.mts` (17 Prüfungen) gegen die lokale Testdatenbank auf Ebene der tatsächlichen Schreibpfade: laufende Periode mit echtem Ende gestern leert `expectedEndDate` im selben Update; ein heutiger Beginn auf einem neutralen Tag wird ohne Blockade akzeptiert; Start- und End-Randkürzung funktionieren unabhängig voneinander und lassen den jeweils anderen Rand unverändert; die Löschung eines Einzeltag-Eintrags entfernt ihn vollständig; ein fremdes Konto kann weder einen Rand kürzen noch löschen (`not_found`, kein Datenleck); eine nicht vorhandene ID wird bei Änderung und Löschung abgelehnt; kein zukünftiger tatsächlicher Start existiert nach dem Testlauf. Alle 17 Prüfungen bestanden.
- `scripts/verify-day-detail.ts` aktualisiert: Die bisherige Quelltext-Prüfung „der klickbare Tag wird ausschließlich aus storedPeriod/runningPeriod abgeleitet“ beschrieb eine mit Version 8 bewusst geänderte Einschränkung (jetzt ist jeder nicht-zukünftige Tag klickbar) und wurde durch zwei präzisere Prüfungen ersetzt: der Periodentag-**Zähler** bleibt weiterhin ausschließlich aus `storedPeriod`/`runningPeriod` abgeleitet, und die **Klickbarkeit** ist neu korrekt auf `!dayInfo?.isFuture` begrenzt. Alle Prüfungen (inklusive der unveränderten Monats-/Jahresgrenzen- und Status-Prüfungen aus Version 4) weiterhin bestanden.
- End-to-end über echten lokalen Dev-Server mit echten HTTP-Anfragen: das exakte WP-Beispiel nachgestellt (laufende Periode mit erwartetem Ende heute, dann tatsächliches Ende gestern gespeichert – `expectedEndDate` danach `null`); Start- und End-Randkürzung sowie Einzeltag-Löschung über die echte API bestätigt.
- Mobile Sichtprüfung (Playwright temporär installiert, iPhone-Viewport 375×812, danach vollständig entfernt): Screenshots bestätigen das Tagesfenster auf einem neutralen Tag mit „Periode begonnen“ und der ehrlichen Meldung „Keine bestätigte Periode an diesem Tag.“; auf einem Start-Rand mit „Periodentag löschen“; auf einem mittleren Tag mit dem Erklärungstext statt einer Löschoption; kein horizontaler Überlauf, Hintergrund korrekt abgedunkelt und über `inert` blockiert.
- Bestehende Regressionen erneut grün: `scripts/verify-my-periods.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-estimated-period.mts`, `tests/new-cycle-prediction.test.ts`. `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich, Routenliste unverändert (keine neue Route).
- `scripts/verify-personal-cycle-view.ts` zeigt 7 Fehlschläge bei den Farbverlauf-Quelltextprüfungen – dieser Defekt ist **nicht** durch WP-003 Version 8 verursacht: Er entstand bereits durch die Extraktion der SVG-Farbverläufe aus `NewCycleExample.tsx` in `src/components/CyclePersonalRing.tsx` im vorher abgeschlossenen Paket WP-004 Version 6 (Commit `99ad662`, vor Beginn dieser Sitzung). Das Skript sucht die Gradient-Definitionen weiterhin nur in `NewCycleExample.tsx`. Alle funktionalen Prüfungen desselben Skripts (Median, Ringgeometrie, Markerposition, Phasenberechnung) bestehen weiterhin fehlerfrei; betroffen ist ausschließlich die veraltete Quelltext-Fundstelle der Sichtprüfung. Wird hier nur dokumentiert, nicht behoben, da außerhalb des WP-003-Auftragsumfangs (analog zum bereits bekannten, ebenfalls nicht behobenen Defekt in `tests/calendar-day-info.test.ts`).

**Abweichungen:**
- Der bisherige zweistufige „Start dann Ende“-Weg für vergangene neutrale Tage (Version 5) wurde durch den neuen, einheitlichen Tagesfenster-Weg **ersetzt**, nicht parallel dazu beibehalten. Dies wurde dem Owner vor der Umsetzung zur Klärung vorgelegt, da der Auftrag von „Erweitere den bestehenden interaktiven Tagesweg statt eines zweiten Kalenders“ sprach, ohne das Verhältnis der beiden bestehenden Wege explizit zu regeln. Entscheidung: Ersetzen, mit direktem Bestätigungsbutton statt einer zusätzlichen Zwischenanzeige (wie beim bisherigen `HistoricalDayActionModal`-Muster). Ein vollständiger vergangener Zeitraum bleibt weiterhin in zwei Schritten erfassbar (`Periode begonnen` am Start, später `Periode beendet` am echten Ende), nur nicht mehr in einem einzigen zusammenhängenden Auswahlfluss.
- Der bereits vor dieser Version bestehende, unabhängige Defekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort.
- Der oben beschriebene, ebenfalls vorbestehende (WP-004 v6) Quelltext-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` besteht unverändert fort.

**Offene Punkte:**
- Owner-Prüfschritt steht aus: `Meine Periode aktualisieren`/Kalender öffnen, auf einen neutralen Tag tippen und `Periode begonnen` prüfen, auf einen laufenden Tag tippen und `Periode beendet` prüfen, auf einen Rand-Tag tippen und `Periodentag löschen` mit Bestätigung prüfen, auf einen mittleren Tag tippen und den Erklärungstext prüfen.
- Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
- Der vorbestehende Quelltext-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` (Gradient-Suche zeigt noch auf `NewCycleExample.tsx` statt `CyclePersonalRing.tsx`) sollte ebenfalls in einem eigenen Paket korrigiert werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Version 9 – Tatsächliche Periodendauer sichtbar machen (13. September 2026)

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach einem echten Beginn und Ende zeigt Luma klar, wie lange genau diese Periode gedauert hat.
- **Beispiel:** Beginn am 7. September und Ende am 9. September zeigt `Dauer: 3 Tage`.
- **Wo erscheint es?** Im kleinen Tagesfenster und in der Periodenhistorie.
- **Wichtig:** Solange eine Periode noch läuft, zeigt Luma keine erfundene endgültige Dauer.

### Entstehungsweg

`Perioden können unterschiedlich lang dauern → tatsächlicher Beginn und Ende sind bereits speicherbar → Dauer aus beiden echten Daten berechnen und verständlich zeigen → WP-003 Version 9`

- bestätigtes Problem: Die Nutzerin kann die tatsächliche Länge einer einzelnen Periode noch nicht klar sehen, obwohl Beginn und Ende gespeichert sind.
- gewünschte Wirkung: Sie erkennt bei jeder abgeschlossenen Periode die reale Dauer und kann sie durch eine spätere Korrektur des Endes ändern.
- gewählte Lösung: Luma leitet die Dauer inklusive Start- und Endtag aus den vorhandenen bestätigten Daten ab und zeigt sie nur bei einem echten Ende.
- wichtige Entscheidung: `DEC-126 – Tatsächliche Periodendauer dynamisch ableiten`.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-012.md`, `C:\coden\CODEX\App-Luma-Assistent\control\DECISIONS.md#dec-126`.

### Soll – von Codex

- Das Tagesfenster einer abgeschlossenen, bestätigten Periode zeigt den aktuellen Tag im Zeitraum und die gesamte tatsächliche Dauer, zum Beispiel `3. Periodentag von 3 Tagen`.
- Die Periodenhistorie zeigt zusätzlich zur bestehenden Zykluslänge pro abgeschlossener Periode `Dauer: [n] Tage`.
- Die Periodendauer zählt Start- und Endtag mit. Beispiel: 7.–9. September sind drei Tage.
- Eine laufende Periode ohne echtes Ende zeigt keine endgültige Dauer. `Läuft noch` bleibt klar erkennbar.
- Nach einer Änderung des echten Endes oder einer Rand-Löschung passt die sichtbare Dauer sofort zum neuen tatsächlichen Zeitraum.
- `Zyklus: [n] Tage` bleibt die Länge zwischen zwei Periodenanfängen und wird nicht mit der Periodendauer verwechselt.

### Abnahmekriterien

1. Ein Zeitraum 7.–9. September zeigt im Tagesfenster am 9. September `3. Periodentag von 3 Tagen`.
2. Die Historie derselben Periode zeigt `Dauer: 3 Tage` zusätzlich zu ihrer vorhandenen Zykluslänge.
3. Nach einer Änderung auf 7.–11. September zeigt Luma fünf Tage.
4. Eine laufende Periode ohne echtes Ende zeigt keine erfundene Gesamtdauer.
5. Start- und Endtag werden inklusive gezählt, auch über Monats- oder Jahresgrenzen.

### Technischer Auftrag für Claude – Version 9

#### Bestätigte Code-Ausgangslage

- `src/components/NewCycleExample.tsx` rendert `DayDetailModal` mit `periodDay` und `PeriodHistoryModal` mit `computePeriodHistory(periods)`.
- `src/lib/period-history.ts` liefert pro Historienzeile `startDate`, `endDate` und `cycleLengthDays`; diese Zykluslänge beschreibt den Abstand bis zum nächsten tatsächlichen Beginn, nicht die Blutungsdauer.
- `periodDayNumber` aus `src/lib/calendar-day-info.ts` bestimmt bereits den laufenden Tag ab dem tatsächlichen Start.

#### Technisches Ziel

- Ergänze eine kleine, testbare Datumsberechnung für die inklusive tatsächliche Dauer zwischen bestätigtem `startDate` und `endDate`; sie darf weder eine Schätzung noch `expectedEndDate` verwenden.
- Reiche die berechnete Dauer nur für den passenden abgeschlossenen Eintrag an `DayDetailModal` weiter. Zeige bei einer laufenden Periode keine endgültige Gesamtdauer.
- Ergänze `PeriodHistoryRow` oder eine gleichwertige reine Anzeigeableitung um die tatsächliche Dauer; `cycleLengthDays` bleibt unverändert und klar getrennt.
- Aktualisiere nur die bestehende Owner- und Historienansicht. Keine neue Route, API, Datenbankmigration, Eingabemethode oder Partneransicht.

#### Invarianten – müssen unverändert bleiben

- Nur ein echtes `endDate` liefert eine endgültige tatsächliche Dauer.
- Erwartete Enddaten und Vorhersagen werden niemals für eine tatsächliche Dauer benutzt.
- Beginn und Ende zählen inklusive; die Berechnung ist zeitzonenfest.
- Die bestehende Korrektur, Rand-Löschung, Kontotrennung und Tagesfenster-Aktionslogik bleiben unverändert funktionsfähig.
- Keine Änderung an Zykluslängenberechnung, Schätzlogik, Partnerbereich, Datenbank oder alter Luma.

#### Pflichtprüfungen

- 7.–9. September ergibt drei Tage; 7.–11. September ergibt fünf Tage.
- Monats- und Jahresgrenze korrekt prüfen, zum Beispiel 30. Dezember bis 2. Januar sind vier Tage.
- Laufender Eintrag und erwartetes Ende liefern keine endgültige tatsächliche Dauer.
- Tagesfenster und Historie zeigen Dauer und Zykluslänge klar getrennt.
- Nach einer bestehenden Rand-Löschung oder Endkorrektur aktualisiert die Dauer korrekt.
- TypeScript, gezielte Tests, mobile Sichtprüfung, Produktions-Build und Entwicklungsledger-Validierung ausführen.

#### Stoppbedingungen

- Stoppe vor einer Änderung an Tabellen, APIs, Vorhersagen, der Partneransicht oder der Bedeutung von `cycleLengthDays`.
- Stoppe, wenn eine erwartete oder geschätzte Dauer als tatsächliche Dauer angezeigt würde.

#### Abschluss durch Claude

- Ergänze `Ist Version 9`, nenne Abweichungen sichtbar und belasse den Paketstatus auf `review`.
- Ergänze das Entwicklungsledger und führe `node scripts/work-package-state.mjs mark-updated WP-003` sowie `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe nur die auftragsbezogenen Dateien. Kein manuelles Deployment.

### Ist Version 9 – von Claude

- **Umgesetzt:**
  - Neue reine Funktion `actualPeriodDurationDays(startDate, endDate)` in `src/lib/calendar-day-info.ts` (wiederverwendet `periodDayNumber` – reine Datums-String-Arithmetik über `Date.UTC`, keine Zeitzonenverschiebung). Sie zählt Start- und Endtag inklusive, z. B. 7.–9. September ergibt 3.
  - `src/lib/period-history.ts`: `PeriodHistoryRow` um `durationDays: number | null` erweitert. `computePeriodHistory` setzt `durationDays` ausschließlich, wenn ein echtes `endDate` vorhanden ist (`actualPeriodDurationDays(entry.startDate, entry.endDate)`); bei einem laufenden Eintrag (auch mit gesetztem `expectedEndDate`) bleibt `durationDays: null`. `cycleLengthDays` bleibt unverändert und bedeutet weiterhin ausschließlich den Abstand bis zum nächsten tatsächlichen Start.
  - `src/components/NewCycleExample.tsx`: Der lokale Zustand `selectedDayDetail` trägt jetzt zusätzlich `totalDays: number | null`, gesetzt beim Öffnen des Tagesfensters ausschließlich aus `storedPeriod` (dem abgeschlossenen Eintrag mit echtem `endDate`) über `actualPeriodDurationDays(storedPeriod.startDate, storedPeriod.endDate)`; ein `runningPeriod` (kein echtes Ende) liefert bewusst `null`. `DayDetailModal` zeigt bei bekannter Dauer `"{periodDay}. Periodentag von {totalDays} Tagen"`, sonst wie bisher nur `"{periodDay}. Periodentag"`.
  - `PeriodHistoryModal` zeigt pro Zeile zusätzlich zur bestehenden Zykluslänge `· Dauer: {n} Tage`, wenn `row.durationDays` vorhanden ist; bei einem laufenden Eintrag ohne echtes Ende erscheint kein Dauer-Zusatz.
  - Nach einer bestehenden Endkorrektur oder Rand-Löschung (Version 8, `PUT`/`DELETE`) wird `router.refresh()` unverändert aufgerufen, wodurch die neu berechnete Dauer automatisch zum korrigierten tatsächlichen Zeitraum passt – keine eigene Zusatzlogik nötig, da die Dauer bei jedem Rendern neu aus den aktuellen `periods` abgeleitet wird.
  - Keine neue Route, keine API-Änderung, keine Datenbankmigration, keine Änderung an `cycleLengthDays`, der Schätz-/Vorhersagelogik oder der Partneransicht.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-day-detail.ts` um zwei neue Prüfblöcke ergänzt: `actualPeriodDurationDays` (7.–9. September = 3 Tage, 7.–11. September = 5 Tage, Einzeltag = 1 Tag, 30. Dezember bis 2. Januar = 4 Tage über die Jahresgrenze) sowie Quelltext-Prüfungen, dass `totalDays` ausschließlich aus einem echten `endDate` (`storedPeriod`) und nie aus `runningPeriod` abgeleitet wird und dass das Tagesfenster den Dauer-Text korrekt anzeigt. Alle Prüfungen (neu und bestehend) bestanden.
  - `scripts/verify-period-history.ts` um `durationDays`-Prüfungen ergänzt: 7.–9. September = 3 Tage, 30.09.–04.10. = 5 Tage (Monatsgrenze), ein `expectedEndDate` ohne echtes Ende liefert `durationDays: null`; zusätzliche Quelltext-Prüfung, dass Dauer und Zykluslänge in der Historie klar getrennt formatiert erscheinen. Alle Prüfungen (neu und bestehend) bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 34 Routen erzeugt, keine neue Route.
  - `scripts/verify-period-day-actions.mts` (Regression für Version 8, DB-Integration) erneut ausgeführt: alle 17 Prüfungen weiterhin bestanden.
  - `scripts/verify-historical-entry.ts` und `scripts/verify-history-month-jump.ts` erneut ausgeführt: `verify-history-month-jump.ts` vollständig grün; `verify-historical-entry.ts` zeigt weiterhin denselben, bereits vor dieser Version bestehenden Fehlschlag bei 6 Quelltext-Prüfungen (siehe Abweichungen) – per `git stash` gegen den unveränderten Stand von Version 8 bestätigt identisch, also nicht durch Version 9 verursacht.
  - Mobile Sichtprüfung mit Playwright (Chromium, 375×812, temporär installiert und danach vollständig wieder entfernt) gegen den lokalen Next.js-Dev-Server: Testkonto registriert, zwei abgeschlossene Perioden angelegt (01.–05.08.2026, 5 Tage; 25.–27.08.2026, 3 Tage). Tagesfenster am 05.08. zeigt `"5. Periodentag von 5 Tagen"`. Periodenhistorie zeigt beide Zeilen mit `"Zyklus: … · Dauer: N Tage"` klar getrennt (u. a. `"Zyklus: Noch nicht bekannt · Dauer: 3 Tage"` für den neuesten Eintrag). Kein horizontaler Overflow (per `document.documentElement.scrollWidth`-Prüfung bestätigt). Screenshots geprüft. Playwright und Testkonto (inkl. beider angelegter Perioden) danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung.
  - Der bereits in Version 3–8 dokumentierte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für diese Version nicht im Umfang.
  - Der bereits in Version 8 dokumentierte, vorbestehende Quelltext-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` (Gradient-Suche zeigt noch auf `NewCycleExample.tsx` statt `CyclePersonalRing.tsx`, WP-004 v6) besteht unverändert fort.
  - Der in Version 8 durch das Ersetzen des zweistufigen „Start dann Ende“-Wegs (Version 5) entstandene, bereits dokumentierte Fehlschlag mehrerer Quelltext-Prüfungen in `scripts/verify-historical-entry.ts` besteht unverändert fort; per `git stash` gegen den Stand vor dieser Version bestätigt, dass Version 9 daran nichts geändert hat.
- **offene Punkte:**
  - Die drei oben genannten, vorbestehenden Testdefekte (`tests/calendar-day-info.test.ts`, `scripts/verify-personal-cycle-view.ts`, `scripts/verify-historical-entry.ts`) sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
- **Commit:** folgt unmittelbar nach diesem Eintrag.

### Owner-Abnahme

- Der Owner hat den Prüfschritt für Version 9 durchgeführt und bestätigt. Claude setzt daraufhin den Paketstatus auf `completed`.
- Ein formeller Soll-Ist-Abgleich (Abschnitt „Soll-Ist-Prüfung – von Codex“) für die Versionen 3–9 wurde von Claude nicht ergänzt; dieser bleibt wie in CLAUDE.md festgelegt bei Codex.
