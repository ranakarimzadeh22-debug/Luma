---
id: WP-003
title: "Gespeicherte Perioden sicher bearbeiten"
package_revision: 1
status: approved
created: 2026-09-07
updated: 2026-09-07
owner_approved: yes
executor: claude
product_area: "Neue Luma – Periodenverwaltung"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Gespeicherte Perioden sicher bearbeiten

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Bereits gespeicherte Perioden können später einfach korrigiert werden.
- **Warum machen wir das?** Ein Beginn oder Ende kann versehentlich falsch eingetragen worden sein.
- **Woher kam die Idee?** Aus der bestätigten Beobachtung `APP-PROBLEM-008` und dem Owner-Gespräch am 7. September 2026.
- **Wo ist es in der App?** Über `Meine Periode aktualisieren` vom Home-Screen in einem ruhigen Bereich `Meine Perioden`.
- **Was gehört ausdrücklich nicht dazu?** Kein Kalender-Umbau, keine automatische Vorhersage, keine Datenlöschung und keine Änderung der alten Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie öffnet eine gespeicherte Periode, ändert Beginn oder Ende, prüft die Angaben und speichert bewusst.

## Entstehungsweg

`Falsch eingegebener Beginn oder Ende → Daten müssen später sicher korrigiert werden → getrennte ruhige Bearbeitungsansicht → WP-003`

- Ausgangsidee oder Problem: Bereits gespeicherte Periodendaten sind auf dem Home-Screen nicht klar und bewusst bearbeitbar.
- bestätigte Wirkung: Die Nutzerin korrigiert einen Fehler, ohne den Kalender oder andere Perioden zu verändern.
- gewählte Lösung: Ein eigener Bereich zeigt gespeicherte Zeiträume. Jede Zeile hat einen klaren Einstieg `Ändern`.
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
  - Ungültige Reihenfolge, Zukunft und Überschneidung zeigen eine einfache Fehlermeldung und speichern nichts.
- **nicht enthalten:** Löschen, neue Perioden hinzufügen, Historienfilter, Kalender-Tagesaktionen, Vorhersage-/KI-Logik, Datenmigration und alte Luma.
- **Abnahmekriterien:**
  1. Mindestens zwei gespeicherte Perioden sind getrennt sichtbar.
  2. Nur der gewählte Zeitraum ändert sich nach dem Speichern.
  3. Neu laden und erneut anmelden zeigt den korrigierten Zeitraum dauerhaft.
  4. Ein anderes Konto kann den Zeitraum nicht sehen oder ändern.
  5. Der Home-Kalender bleibt reine Orientierung.
- **ein Prüfschritt für den Owner:** `Meine Periode aktualisieren` öffnen, eine gespeicherte Periode ändern, prüfen, speichern und die Seite neu laden.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnötige Schritt-für-Schritt-Lösung.

### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` enthält den einzigen Home-Einstieg `Meine Periode aktualisieren` und das bisherige Eingabe-Modal.
- `src/app/neu/page.tsx` lädt die kontogebundenen Periodeneinträge für `/neu`.
- `src/app/api/neu/periods/route.ts` bietet bereits `GET` für die eigenen Einträge.
- `src/app/api/neu/periods/[id]/route.ts` bietet bereits die gesicherte `PUT`-Änderung eines Eintrags; Validierung, Kontotrennung und Überschneidungsprüfung bestehen in `src/lib/new-periods.ts` und `src/lib/new-period-validation.ts`.

### Technisches Ziel

- Richte einen geschützten Bereich `Meine Perioden` ein oder nutze einen gleichwertig klar getrennten vorhandenen Weg. Er zeigt nur die Perioden des angemeldeten Kontos.
- Verknüpfe `Meine Periode aktualisieren` vom Home-Screen mit diesem Bereich; die Kalenderzellen bleiben nicht interaktiv für Verwaltung.
- Nutze die vorhandene `GET`- und `PUT`-Schnittstelle. Der Bearbeitungsdialog oder die Bearbeitungsansicht enthält nur Beginn, Ende, Prüfen, Speichern und Abbrechen.
- Vor der endgültigen `PUT`-Anfrage muss die Nutzerin die geänderten Daten sichtbar prüfen können.
- Claude darf Komponenten passend teilen, aber keine neue Tabelle, neue Datenart oder neue API-Route einführen, wenn die vorhandenen Routen ausreichen.

### Invarianten – müssen unverändert bleiben

- Einträge bleiben ausschließlich mit der bestehenden Sitzung und dem eigenen Konto verbunden.
- Die vorhandenen Serverprüfungen für Datum, Reihenfolge, Zukunft, ID und Überschneidung bleiben wirksam.
- Nicht ausgewählte Periodeneinträge, Profile, Nutzerkonten, Kalenderlogik und Zykluskreis werden nicht still verändert.
- Keine Löschfunktion in diesem Paket.
- Alte Luma und `app_luma` bleiben unverändert.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine Schemaänderung; vorhandene Einträge werden nur nach ausdrücklichem Speichern eines einzelnen geänderten Zeitraums aktualisiert.
- betroffene API-Routen: vorhandenes `GET /api/neu/periods` und `PUT /api/neu/periods/[id]`.
- Migration nötig: nein.

### Pflichtprüfungen

- Zwei Einträge für ein Konto laden; einen bearbeiten; bestätigen, dass nur dieser Eintrag geändert wird.
- Ungültige Reihenfolge, Zukunft und Überschneidung werden abgelehnt und lassen den gespeicherten Eintrag unverändert.
- Kontotrennung sowie nicht vorhandene oder fremde ID bleiben serverseitig geschützt.
- Neu laden und erneute Anmeldung zeigen die erfolgreiche Änderung.
- Mobile Sichtprüfung: Liste, Ändern, Prüfen, Speichern und Abbrechen sind ohne horizontalen Überlauf bedienbar.
- TypeScript, gezielter Test, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe vor einer Migration, einer Löschfunktion, neuer Vorhersagelogik oder einer Änderung von Daten eines nicht gewählten Zeitraums.
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
- nicht umgesetzt:
- Tests:
- Abweichungen:
- offene Punkte:
- Commit:

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend
- Nachschärfung:
- Product-Map aktualisiert: nein
