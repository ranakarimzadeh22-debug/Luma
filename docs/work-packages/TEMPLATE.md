---
id: WP-001
title: "Kurzer Aufgabenname"
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner_approved: no
executor: unassigned
product_area: "Screen oder Bereich"
brief_version: 1
technical_brief: draft
---

# Aufgabe: Kurzer Aufgabenname

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Was soll für die Nutzerin entstehen?
- **Warum machen wir das?** Nur bestätigte Gründe nennen; sonst `Unklar – nicht dokumentiert`.
- **Woher kam die Idee?** Gespräch, Problem, Entscheidung oder verknüpfte Akte nennen.
- **Wo ist es in der App?** Screen oder Nutzerweg.
- **Was gehört ausdrücklich nicht dazu?** Klare Grenze dieses Pakets.
- **Was kann die Nutzerin danach ausprobieren?** Ein einfacher Prüfschritt.

## Entstehungsweg

`Ausgangsidee oder Problem → bestätigte Wirkung → gewählte Lösung → dieses Arbeitspaket`

- Ausgangsidee oder Problem:
- bestätigte Wirkung:
- gewählte Lösung:
- wichtige Entscheidung(en):
- Quellen/Akten:

## Soll – von Codex

- Problem:
- gewünschte Wirkung:
- sichtbare Änderung:
- nicht enthalten:
- Abnahmekriterien:
- ein Prüfschritt für den Owner:

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnötige Schritt-für-Schritt-Lösung.

### Bestätigte Ausgangslage im Code

- geprüfte Dateien, Komponenten oder Routen:
- aktuelles Verhalten:
- vorhandene Logik, die wiederverwendet werden soll:

### Technisches Ziel

- erwartetes Verhalten nach der Änderung:
- wahrscheinliche Startpunkte im Code:
- technische Vorgehensfreiheit für Claude:

### Invarianten – müssen unverändert bleiben

- bestehende Daten und Nutzerkonten:
- Authentifizierung und Kontentrennung:
- nicht betroffene Screens oder Funktionen:
- fachliche Sicherheitsgrenzen:

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: `keine` oder konkret beschreiben
- betroffene API-Routen: `keine` oder konkret beschreiben
- Migration nötig: `nein` oder begründen

### Pflichtprüfungen

- gezielte Verhaltensprüfung:
- bestehende Regressionstests:
- mobile beziehungsweise sichtbare Prüfung:
- weitere risikogerechte Prüfung:

### Stoppbedingungen

- Stoppe und dokumentiere eine offene Frage, wenn eine notwendige Produktentscheidung fehlt.
- Stoppe vor einer nicht freigegebenen Datenmigration, Sicherheitsänderung oder Umfangserweiterung.
- Wenn ein genannter Code-Startpunkt nicht mehr stimmt, darf Claude den passenden Ort suchen; die fachliche Wirkung und die Invarianten bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger für eine größere Änderung ergänzen.
- `node scripts/work-package-state.mjs mark-updated <WP-ID>` ausführen.
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
