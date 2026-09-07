---
id: WP-003
title: "Gespeicherte Perioden sicher bearbeiten und löschen"
package_revision: 2
status: approved
created: 2026-09-07
updated: 2026-09-07
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

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend
- Nachschärfung:
- Product-Map aktualisiert: nein
