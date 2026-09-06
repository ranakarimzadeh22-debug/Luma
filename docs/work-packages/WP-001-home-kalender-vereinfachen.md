---
id: WP-001
title: "Home-Kalender vereinfachen und einen Eingabeweg schaffen"
status: approved
created: 2026-09-06
updated: 2026-09-06
owner_approved: yes
executor: claude
product_area: "Neuer Home-Screen /neu und vorhandener Zyklus-Startweg"
---

# Aufgabe: Home-Kalender vereinfachen und einen Eingabeweg schaffen

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
