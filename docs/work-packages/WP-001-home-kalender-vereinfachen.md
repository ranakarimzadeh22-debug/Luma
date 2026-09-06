---
id: WP-001
title: "Home-Kalender vereinfachen und einen Eingabeweg schaffen"
package_revision: 2
status: review
created: 2026-09-06
updated: 2026-09-06
owner_approved: yes
executor: claude
product_area: "Neuer Home-Screen /neu und vorhandener Zyklus-Startweg"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Home-Kalender vereinfachen und einen Eingabeweg schaffen

## Versionshinweis

**Version 2 – 6. September 2026:** Owner-Ansicht und technischer Auftrag ergänzt. Das Paket ist bewusst pausiert, bis die eine offene Entscheidung zum Startformular bestätigt ist.

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der Home-Screen soll den Zyklus zeigen, nicht mehrere verschiedene Wege zur Periodeneingabe anbieten.
- **Warum machen wir das?** Der aktuelle Screen ist verwirrend: Der Kalender, `Periode eintragen oder planen`, `Vergangene Perioden nachtragen` und `Gespeicherte Perioden` sehen wie mehrere Wege für dieselbe Aufgabe aus.
- **Woher kam die Idee?** Beobachtung des Owners am mobilen Home-Screen und die bestätigte Akte `APP-PROBLEM-008`.
- **Wo ist es in der App?** Nach Registrierung oder Anmeldung auf dem neuen Home-Screen `/neu`; der vorhandene Zyklus-Startweg bleibt davor erhalten.
- **Was gehört ausdrücklich nicht dazu?** Kein neuer Bereich `Periodenverlauf`, keine Löschung vorhandener Daten, keine neue Vorhersage, keine KI-Logik und keine Änderung der alten Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie sieht Kreis und Kalender ruhig als Orientierung. Für echte Änderungen findet sie nur `Meine Periode aktualisieren`.

## Entstehungsweg

`Verwirrende Mehrfach-Eingabe auf dem Home-Screen → Nutzerin soll sofort verstehen, was sie dort tun kann → Orientierung und Erfassung trennen → WP-001`

- Ausgangsidee oder Problem: Mehrere Perioden-Eingabewege auf dem Home-Screen verwirren die Nutzerin.
- bestätigte Wirkung: Die letzte beziehungsweise aktuelle Periode ist verständlich sichtbar; Änderungen erfolgen über einen einzigen geführten Weg.
- gewählte Lösung: Kalender nur zur Orientierung verwenden und einen einzelnen Einstieg `Meine Periode aktualisieren` anbieten.
- wichtige Entscheidung(en): `DEC-084`; bestätigter Umfang in `APP-PROBLEM-008`.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-PROBLEM-008.md`.

## Soll – von Codex

- **Problem:** Der Home-Screen vermischt Orientierung, Eingabe und Verwaltung von Perioden.
- **gewünschte Wirkung:** Eine neue Nutzerin versteht ohne Erklärung: Kalender anschauen; für eine echte Änderung genau einen klaren Weg nutzen.
- **sichtbare Änderung:**
  - Zykluskreis und Kalender bleiben auf `/neu` sichtbar.
  - Ein Tipp auf einen Kalendertag darf keine Periodenaktion, Auswahl oder Speicherung starten.
  - Die Home-Bereiche `Periode eintragen oder planen`, `Vergangene Perioden nachtragen` und `Gespeicherte Perioden` erscheinen dort nicht mehr.
  - Auf `/neu` erscheint genau ein klar erkennbarer Einstieg `Meine Periode aktualisieren`.
  - Dieser Einstieg öffnet den vorhandenen oder einen gleichwertig geführten Weg: Beginn wählen → Ende wählen → prüfen → ausdrücklich speichern.
  - Der Startweg nach Registrierung bleibt der einzige anfängliche Weg zur Angabe der letzten Periode.
- **nicht enthalten:** Separater Periodenverlauf, vollständige Historienverwaltung auf einem neuen Screen, Datenlöschung, Datenmigration, neue Vorhersagen, PMS-/Eisprungberechnung, KI und Änderungen an alter Luma.
- **Abnahmekriterien:**
  1. Auf dem Home-Screen gibt es genau einen sichtbaren Weg zur Änderung tatsächlicher Periodendaten.
  2. Kalendertage lösen keine Speicherung und keine Periodenaktionen aus.
  3. Vorhandene gespeicherte Periodendaten bleiben erhalten.
  4. Der geführte Aktualisierungsweg verlangt Beginn und Ende, zeigt eine Prüfung und speichert erst nach ausdrücklicher Bestätigung.
  5. Mobile Ansicht bleibt ohne horizontalen Überlauf gut bedienbar.
- **ein Prüfschritt für den Owner:** Auf `/neu` einen Kalendertag antippen und danach `Meine Periode aktualisieren` öffnen. Erwartet: Der Kalendertipp ändert nichts; nur der klare Einstieg startet den geführten Weg.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/app/neu/page.tsx` lädt Periodeneinträge und Pläne, steuert den Onboarding-Redirect und rendert `NewCycleExample`.
- `src/components/NewCycleExample.tsx` enthält Kalender, Tagesaktionen, `Periode eintragen oder planen`, `Vergangene Perioden nachtragen`, `Gespeicherte Perioden` und geplante Perioden.
- `src/components/NewPeriodHistoryOnboarding.tsx` enthält den geführten Startweg für vergangene Perioden.
- `src/app/neu/perioden-nachtragen/page.tsx` ist der vorhandene getrennte Nachtragungsweg.
- Vorhandene Speicherung und Kontentrennung liegen unter `src/app/api/neu/periods/` und `src/lib/new-periods.ts`.

### Technisches Ziel

- Auf `/neu` wird `NewCycleExample` so vereinfacht, dass Kalender und Ring Orientierung bleiben und keine Periodenaktion durch einen Tagestipp startet.
- Die konkurrierenden Eingabe- und Historienbereiche verschwinden nur aus dem Home-Screen.
- Genau ein sichtbarer Einstieg `Meine Periode aktualisieren` führt in einen bestätigten geführten Beginn-Ende-Prüfen-Speichern-Weg.
- Claude darf Komponenten aufteilen oder bestehende Komponenten wiederverwenden, solange Verhalten und Invarianten dieses Pakets eingehalten werden.

### Invarianten – müssen unverändert bleiben

- Vorhandene Periodeneinträge und Pläne dürfen nicht gelöscht oder still verändert werden.
- Speicherung bleibt sitzungs- und kontogebunden in `luma_core`.
- Authentifizierung, alte Luma, Zyklusring, Monatsnavigation und bestehende Vorhersagelogik bleiben fachlich unverändert.
- Beispielwerte dürfen nicht als bestätigte persönliche Daten erscheinen.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine Schemaänderung und keine Datenmigration vorgesehen.
- betroffene API-Routen: vorhandene Perioden-API nur wiederverwenden; keine neue Route erwartet.
- Migration nötig: nein.

### Pflichtprüfungen

- Kalendertipp auf `/neu` löst keine Periodenauswahl, Planung oder Speicherung aus.
- Nur `Meine Periode aktualisieren` öffnet den geführten Weg.
- Beginn, Ende, Prüfung und ausdrückliches Speichern funktionieren kontogebunden weiter.
- Vorhandene Periodendaten bleiben nach Neuladen und erneuter Anmeldung erhalten.
- Relevante vorhandene Auth-, Perioden- und Kalenderregressionstests anpassen und ausführen.
- Mobile Sichtprüfung ohne horizontalen Überlauf durchführen.

### Stoppbedingungen

- Blocker aufgelöst durch Owner-Entscheidung (6. September 2026): `NewPeriodHistoryOnboarding` wird auf genau eine letzte Periode reduziert.
- Stoppe vor Datenmigration, Löschung vorhandener Daten oder einer Änderung der Vorhersagelogik.
- Wenn die genannten Startpunkte nicht mehr stimmen, passende Stellen suchen und die Abweichung im Ist-Abschnitt dokumentieren.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-001` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.

## Ist – von Claude

- umgesetzt:
  - `src/components/NewCycleExample.tsx` neu geschrieben: Kalenderzellen sind reine Anzeige-`div`s ohne `onClick`, kein Tages-Auswahlzustand, kein Tages-Detail-Panel mehr.
  - Entfernt aus dem Home-Screen: Hinweisbox „Periode eintragen oder planen“, Link „Vergangene Perioden nachtragen“, aufklappbare Liste „Gespeicherte Perioden“ (inkl. Ändern/Löschen), Bereich „Geplante Perioden“ (inkl. Ändern/Löschen/Bestätigen).
  - Neuer, einziger Einstieg: Button „Meine Periode aktualisieren“ öffnet `UpdatePeriodModal` (neue Komponente in derselben Datei) mit dem geführten Weg Beginn wählen → Ende wählen → prüfen → ausdrücklich speichern; nutzt weiterhin `POST /api/neu/periods`.
  - `src/components/NewPeriodHistoryOnboarding.tsx` auf ein einzelnes Beginn/Ende-Feld reduziert (vorher: bis zu sechs Zeilen mit Hinzufügen/Entfernen); Überspringen-Weg unverändert.
  - `src/lib/calendar-day-info.ts`: `PeriodDayAction`, `applyPeriodDayAction` entfernt (durch Wegfall der Kalender-Tagesaktionen ungenutzt); `getCalendarDayInfo` unverändert für die reine Anzeige weiterverwendet.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen.
- Tests: `npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt. Keine automatisierten Auth-/Perioden-/Kalendertests im Repo gefunden, die anzupassen wären.
- Abweichungen:
  - `src/app/neu/perioden-nachtragen/page.tsx` (bisheriger separater Nachtragungsweg) wurde nicht gelöscht, nur nicht mehr verlinkt — das Soll fordert das Verschwinden aus dem Home-Screen, nennt aber keine Routenlöschung; die Route ist damit funktional verwaist.
  - Mobile Sichtprüfung im echten Browser wurde nicht durchgeführt (keine Browser-Automatisierung in dieser Umgebung verfügbar); die Layoutklassen (Grid/Flex, `max-w`) wurden unverändert aus der bisherigen, bereits mobil geprüften Struktur übernommen.
- offene Punkte: Owner-Prüfschritt (Kalendertag antippen, dann „Meine Periode aktualisieren“ öffnen) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend
- Nachschärfung:
- Product-Map aktualisiert: nein
