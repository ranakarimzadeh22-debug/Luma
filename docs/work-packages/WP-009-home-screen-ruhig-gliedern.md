---
id: WP-009
title: "Home-Screen ruhig gliedern"
package_revision: 1
status: review
created: 2026-10-08
updated: 2026-10-08
owner_approved: yes
executor: claude
product_area: "Neue Luma - Home-Screen /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Home-Screen ruhig gliedern

## Owner-Ansicht – einfach erklärt

- Kurz gesagt: Die bestehende eigene Startseite wird nur optisch aufgeraeumt.
- Die Reihenfolge bleibt: Heute-Karte, Zyklus-Kreis, Kalender.
- Diese drei Bereiche erhalten eine ruhigere, einheitliche visuelle Gliederung und passende Abstaende.
- Es kommt kein neuer Text, kein neuer Button und keine neue Funktion hinzu.
- Partneransicht und alle Inhalte des Kalenders bleiben unveraendert.

## Entstehungsweg

Nach dem Abschluss der ruhigen Einstellungen und der ruhig gegliederten Periodenhistorie moechte die Ownerin die vorhandene eigene Startseite ebenfalls schrittweise aufraeumen, bevor eine neue Faehigkeit hinzukommt.

- bestaetigtes Problem: Die drei bestehenden Hauptbereiche sollen visuell als einfacher Ablauf wirken, ohne die Seite voller zu machen.
- gewuenschte Wirkung: Die Nutzerin sieht zuerst ihren heutigen Stand, dann den Zyklus und anschliessend den Kalender.
- gewaehlte Loesung: Nur die vorhandenen Bereiche auf `/neu` durch Abstaende, Ausrichtung und aeussere Abschnittsstruktur ruhig vereinheitlichen.
- Grenzen: Bestehende Texte, Daten, Berechnungen und Bedienwege bleiben unveraendert.
- Quelle: APP-IDEA-016, Owner-Freigabe vom 2026-10-08.

## Soll – von Codex

- Auf `/neu` bleiben die vorhandene Heute-Karte, die bestehende Zyklus-Uebersicht und der bestehende Kalender in genau dieser Reihenfolge sichtbar.
- Die drei Bereiche erhalten eine klar erkennbare, gleichmaessige visuelle Trennung durch bestehende CSS-/Tailwind-Mittel; die Seite soll ruhig und nicht zusaetzlich dekoriert wirken.
- Es entstehen keine neuen Abschnittstitel, Hinweise, Karten, Icons, Buttons oder zusaetzlichen Inhalte.
- Der Zyklus-Kreis, die Heute-Karte, Kalendernavigation, Monatsanzeige, Tagesfenster, Historie, Legende und alle vorhandenen Eingabemoeglichkeiten bleiben funktional und inhaltlich unveraendert.
- Die Partneransicht `/neu/partner` bleibt unveraendert.

## Nicht enthalten

- Keine Aenderung an Zyklus- oder Periodenberechnung, Datenbank, API, Route, Daten oder Sitzungen.
- Keine Aenderung an Texten, Kalenderfarben, Vorhersagen, Historie oder deren Navigation.
- Keine neue Karte, kein neues Bild, keine neue Einstellung und keine neue Interaktion.
- Keine Aenderung an alter Luma oder Partneransicht.

## Abnahmekriterien

1. Die bestehende Reihenfolge Heute-Karte, Zyklus-Kreis und Kalender ist auf mobiler und breiter Ansicht klar erkennbar.
2. Die Abstaende und die aeussere Ausrichtung der drei Bereiche wirken einheitlich, ohne neue sichtbare Inhalte.
3. Kein vorhandener Button, Dialog, Kalender- oder Historienweg verliert sein bisheriges Verhalten.
4. Auf 375 px und 1280 px Breite gibt es keinen horizontalen Ueberlauf.

## Technischer Auftrag für Claude

### Bestaetigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` ist die bestehende Client-Komponente fuer den eigenen Home-Screen `/neu`.
- Der aeussere Inhaltscontainer verwendet aktuell `space-y-9 sm:space-y-10`.
- Innerhalb dieses Containers stehen bereits in dieser Reihenfolge `TodayCard`, die Zyklus-`section` mit `CyclePersonalRing` sowie die Kalender-`section` mit `CalendarTodayLine` und Monatsnavigation.
- Diese Komponenten und ihre Datenlogik bestehen bereits. Der Auftrag betrifft nur ihre aeussere visuelle Anordnung.

### Technisches Ziel und Invarianten

- Aendere ausschliesslich die Layout-/Abstands- und gegebenenfalls vorhandene aeussere Wrapper-Struktur der drei Hauptbereiche in `NewCycleExample.tsx`.
- Behalte dieselbe Render-Reihenfolge und dieselben Komponenten, Props, Texte, Event-Handler und Zustandsbedingungen bei.
- Keine zusaetzlichen DOM-Inhalte erzeugen, die fuer Nutzerinnen sichtbar sind; keine neue Komponente erstellen, wenn eine kleine Anpassung an der vorhandenen Struktur ausreicht.
- Keine Aenderung an den Modal-Komponenten oder an der Kalender- und Vorhersagelogik.

### Daten und API

- Keine Datenbankmigration, keine API-Aenderung, keine neue Route, keine neue Client-zu-Server-Anfrage und keine neue Abhaengigkeit.

### Pflichtpruefungen

- Fuehre eine gezielte Quelltext- oder Komponentpruefung aus, die die Reihenfolge Today-Karte vor Zyklus-Kreis vor Kalender sowie unveraenderte Hauptkomponenten bestaetigt.
- Pruefe gegen einen echten lokalen Dev-Server auf 375 px und 1280 px: keine neue sichtbare Information, keine Ueberdeckung und kein horizontaler Ueberlauf.
- Pruefe mindestens Monatsnavigation, Oeffnen/Schliessen der Historie und ein vorhandenes Tagesfenster als Regression.
- Fuehre `npx tsc --noEmit` und `npm run build` aus.

### Stoppbedingungen

- Stoppe und frage nach, falls eine ruhige Gliederung nur durch neue sichtbare Texte, Karten, Funktionen, Daten oder Aenderungen ausserhalb des eigenen Home-Screens erreichbar waere.
- Kein manuelles Deployment ausloesen.

## Owner-Pruefort nach Umsetzung

`/neu` oeffnen und nur auf die sichtbare Reihenfolge und die Abstaende achten: Heute-Karte oben, Zyklus-Kreis in der Mitte, Kalender darunter. Anschliessend Monatsnavigation, Historie und ein Tagesfenster kurz pruefen.

## Ist – von Claude

### Umgesetzt

- In `src/components/NewCycleExample.tsx` wurden ausschliesslich Layout-Klassen der beiden bestehenden `<section>`-Elemente fuer Zyklus-Kreis und Kalender ergaenzt. Beide erhalten dieselbe bereits vorhandene, ruhige Kartenrahmung wie die Heute-Karte (`rounded-2xl border border-[#efd5dc] bg-white/90 px-5 py-4 shadow-sm`), sodass alle drei Hauptbereiche jetzt einheitlich als klar abgegrenzte, ruhige Abschnitte wirken.
- Die interne Struktur beider sections (`space-y-3` bzw. `space-y-5`), alle Texte, Buttons, Event-Handler und Zustandsbedingungen blieben unveraendert.
- Die Render-Reihenfolge `TodayCard` vor `CyclePersonalRing`-Section vor Kalender-Section ist unveraendert; alle Props (`personalCycleView`, `today`, `todayKey`) wurden unveraendert weitergereicht.
- Keine neue Komponente, kein neuer DOM-Knoten mit sichtbarem Inhalt, keine Aenderung an Modal-Komponenten, Kalender- oder Vorhersagelogik.
- `src/lib/*`, API-Routen, Datenbank und `/neu/partner` wurden nicht beruehrt.

### Nicht umgesetzt

- Keine Abweichung vom Soll. Interne Abstaende innerhalb der Zyklus- und Kalender-section wurden bewusst nicht angeglichen (siehe Owner-Rueckfrage vor der Umsetzung: nur die aeussere Struktur sollte angepasst werden).

### Tests

- `npx tsc --noEmit` — fehlerfrei.
- `npx tsx scripts/verify-home-screen-layout.ts` (neu angelegt) — gezielte Pruefung der Render-Reihenfolge Heute-Karte vor Zyklus-Kreis vor Kalender, unveraenderter Hauptkomponenten/Props/Handler sowie der rein aeusseren, aufeinander abgestimmten Layout-Klassen ohne neue sichtbare Inhalte. Alle Pruefungen bestanden.
- `npm run build` — erfolgreich, Routenliste unveraendert (keine neue/entfernte Route).
- Live-Pruefung gegen echten lokalen Dev-Server (`npm run dev`) mit temporaer installiertem Playwright (`npm install --no-save playwright`, danach `npm uninstall playwright`): Testkonto mit zwei Perioden angelegt. Auf 375 px und 1280 px Breite wurde bestaetigt: Reihenfolge Heute-Karte/Zyklus-Kreis/Kalender im DOM erhalten, kein horizontaler Ueberlauf, Monatsnavigation (naechster/vorheriger Monat) funktioniert, Periodenhistorie oeffnet und schliesst sich weiterhin ueber die Monatsanzeige, einen Zeilenklick bzw. Escape, und ein Tagesfenster oeffnet sich weiterhin per Klick auf einen Kalendertag mit bestaetigter Periode. Screenshots auf beiden Breiten zeigen die drei Bereiche als gleichmaessig gerahmte, ruhige Abschnitte in unveraenderter Reihenfolge. Testkonten, Perioden und Sitzungen wurden anschliessend vollstaendig aus der lokalen `luma_core`-Datenbank geloescht; alle temporaeren Skripte/Screenshots und Playwright wurden entfernt.

### Abweichungen

- Keine Abweichung vom Soll.

### Offene Punkte

- Owner-Pruefschritt steht aus: `/neu` oeffnen und auf Reihenfolge, Abstaende, Monatsnavigation, Historie und ein Tagesfenster achten (siehe "Owner-Pruefort nach Umsetzung" oben).

### Commit

- Platzhalter, wird nach dem Commit ergaenzt.

## Soll-Ist-Prüfung – von Codex

- Ausstehend: Codex prueft nach der Claude-Rueckmeldung Soll gegen Ist.
