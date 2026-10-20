---
id: WP-023
title: "Owner-Home im warmen Entwurf A gestalten"
status: review
created: 2026-10-19
updated: 2026-10-20
owner_approved: yes
executor: codex-app-coder
product_area: "Neue Luma – Owner-Home /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Owner-Home im warmen Entwurf A gestalten

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Deine eigene Startseite wird warm, ruhig und übersichtlich: Zyklus-Kreis links, kurze heutige Information rechts und der vertraute Kalender darunter.
- **Warum machen wir das?** Die Ownerin hat Entwurf A als den klarsten und schönsten Vorschlag ausgewählt; die vorhandenen Inhalte sollen leichter wie eine zusammengehörige Startseite wirken.
- **Woher kam die Idee?** APP-IDEA-030, bestätigter Entwurf A aus der Designauswahl.
- **Wo ist es in der App?** Nur auf der eingeloggten Owner-Startseite `/neu`, mobil und breit.
- **Was gehört ausdrücklich nicht dazu?** Keine Änderung an `/neu/partner`, Einstellungen, Anmeldung, Onboarding, Daten, Vorhersagen, PMS-/Periodenlogik, Kalenderbändern oder unterer Owner-Navigation.
- **Was kann die Ownerin danach ausprobieren?** Sie öffnet `/neu`: Der Kreis steht im oberen ruhigen Bereich links, die aktuelle Information daneben, der Kalender folgt darunter; alle bisherigen Klicks funktionieren weiterhin.

## Entstehungsweg

`Home-Screen wirkt noch nicht attraktiv genug → warme einfache Designvarianten verglichen → Ownerin wählt Entwurf A → Kreis links, kurze Information rechts, Kalender darunter → WP-023`

- Ausgangsproblem: Die Ownerin empfindet die vorhandene Home-Gestaltung als noch nicht warm und klar genug.
- bestätigte Wirkung: Die wichtigsten vorhandenen Informationen wirken als ruhige visuelle Einheit und bleiben ohne Suche erreichbar.
- gewählte Lösung: Nur die Owner-Home-Struktur erhält einen warmen, rosig-cremigen Rahmen und einen responsiven Übersichtsbereich mit Ring links und bestehender Heute-Information rechts; der Kalender bleibt der große Bereich darunter.
- wichtige Entscheidung: Partneransicht bleibt ausdrücklich unverändert. Dieses Paket ist ein Redesign, keine Produktfunktion und keine neue Profil- oder Begrüßungsfunktion.
- Quellen/Akten: APP-IDEA-030, WP-016, WP-021, WP-022.

## Soll – von Codex

- **Problem:** Die vorhandenen Bereiche auf `/neu` sind funktional vollständig, wirken aber noch nicht wie der von der Ownerin ausgewählte warme, leicht erfassbare Entwurf A.
- **gewünschte Wirkung:** Auf Handy und großem Bildschirm sieht die Ownerin oben eine klare Zyklusübersicht mit Kreis links und einer kurzen verständlichen Heute-Information rechts; der Kalender bleibt direkt darunter zentral und gut bedienbar.
- **sichtbare Änderung:** Warmer, dezenter Rosé-/Creme-Hintergrund und ruhige, sparsame Kartenflächen nur auf der Owner-Home; ein gemeinsamer oberer Übersichtsbereich statt nacheinander gestapelter Heute-Karte und Ring. Der bestehende Kalender mit seinen Pastellbändern bleibt optisch erhalten.
- **nicht enthalten:** Keine neue Begrüßung, kein Profil-Icon, keine neue Navigation, keine neue Einstellung, keine Text-/Datenlogik, keine Änderung an Partner-, Auth-, Onboarding- oder Einstellungsseiten.
- **Abnahmekriterien:**
  1. Auf `/neu` steht der Zyklus-Kreis im oberen Übersichtsbereich sichtbar links; die bestehenden Texte der Heute-Karte, einschließlich Resttage und Unsicherheitshinweis, stehen rechts daneben oder bei sehr schmalem Platz in derselben klaren Übersichtsgruppe.
  2. Der Kalender einschließlich Monatswechsel, Info-Popover, Tagesfenster und Pastellbändern liegt unverändert funktional darunter.
  3. Die Ansicht wirkt warm und ruhig, nicht überladen: dezente rosig-cremige Fläche, zurückhaltende Rundungen/Schatten, keine zusätzlichen sichtbaren Inhalte.
  4. Mobil bleibt alles ohne horizontalen Überlauf bedienbar; alle bestehenden Touch-Flächen und die feste Owner-Navigation bleiben erreichbar.
  5. `/neu/partner` und alle Owner-Gates vor der fertigen Home bleiben bytegleich in Inhalt und Verhalten.
- **ein Prüfschritt für den Owner:** `/neu` auf dem Handy und breit öffnen, Kreis/Heute-Information/Kalender ansehen, einen Monat wechseln und einen Kalendertag öffnen; danach `/neu/partner` zum Vergleich öffnen.

## Technischer Auftrag für Claude

> **Ausführer-Hinweis:** Die Ownerin hat für dieses konkrete Redesign ausdrücklich den bestehenden Codex-App-Coder statt Claude gewählt. Die Überschrift bleibt wegen der Repository-Validierung unverändert; der technische Umfang ist für den Codex-App-Coder verbindlich.

### Bestätigte Ausgangslage im Code

- `src/app/neu/page.tsx` ist die authentifizierte Owner-Route. Dort werden Daten geladen, `NewCycleExample` gerendert und `NewOwnerMobileNav` ausschließlich für die fertige Owner-Home eingebunden. Die Vorname- und Perioden-Onboarding-Gates werden davor separat zurückgegeben.
- `src/components/NewCycleExample.tsx` enthält bereits `TodayCard`, die Owner-Zyklussektion mit `CyclePersonalRing` sowie die Kalendersektion. Alle Daten- und Interaktionszustände, Modale und Kalenderlogik liegen dort.
- `src/components/CyclePersonalRing.tsx` ist auch für die Partneransicht gemeinsam. Seine bestehende `compact`-Prop wird von Owner und Partner verwendet; eine globale Veränderung dieser Prop würde die Partneransicht berühren.
- `src/components/NewOwnerMobileNav.tsx` ist die feste, nur mobile Owner-Navigation. Die aktuelle mobile Seitenunterkante in `page.tsx` berücksichtigt ihre sichere Höhe.
- WP-022 bestimmt die bestehende Kalenderoptik (helle Pastellbänder, Heute-Kreis) und darf nicht überschrieben werden.

### Technisches Ziel

- Gestalte nur die bereits fertige Owner-Home (`NewAppPage` nach allen Gates und `NewCycleExample`) responsiv nach Entwurf A. Nutze bestehende Inhalte und Zustände statt neue Daten oder Textlogik zu schaffen.
- Lege `TodayCard` und die bestehende Owner-Ringsektion in einer gemeinsamen oberen Übersichtsgruppe an: Ring links, bestehende Heute-Information rechts. Der Kalender bleibt nach dieser Gruppe im normalen Dokumentfluss.
- Für sehr schmale mobile Breiten darf der Ring innerhalb der Owneransicht visuell kleiner werden. Falls dafür eine neue optionale Darstellungsprop an `CyclePersonalRing` nötig ist, muss sie standardmäßig aus sein und ausschließlich im Owner-Aufruf verwendet werden; `NewPartnerCycleRing.tsx` und dessen sichtbare Darstellung bleiben unverändert.
- Verfeinere nur Owner-spezifische Layout-/Farbklassen zu einem warmen, hellen Rosé-/Creme-Rahmen. Bestehende Texte, Buttons, Links, Dialoge, Kalenderdaten und alle Handler bleiben bestehen.
- Verwende bestehende responsive Tailwind-Klassen und Komponenten. Keine neue Abhängigkeit, kein globales CSS und keine Bilddatei sind erforderlich.

### Invarianten – müssen unverändert bleiben

- Datenabfragen, `predictCycle`, `computePersonalCycleView`, manuelles PMS, Periodenaktionen, Kalenderstatusprioritäten, Ringgeometrie, Datumswerte und Resttage-Berechnung bleiben unverändert.
- Reihenfolge und Funktion der bestehenden Bereiche bleiben fachlich gleich: Heute-Information, Zyklusübersicht, Kalender und vorhandene Hilfsaktionen. Nur die visuelle Gruppierung und Abstände dürfen sich ändern.
- Monatsnavigation, Legenden-Popover, Tagesfenster, Periodenübersicht, Fehler-/Erfolgshinweise, Fokus-/Escape-Verhalten und die mobile Owner-Navigation bleiben vollständig funktionsfähig.
- Keine Änderung an `/neu/partner`, `NewPartnerCycleRing.tsx`, `NewPartnerCalendar.tsx`, Partnerrechten, Login, Registrierung, Vorname-Gate, Perioden-Onboarding, Einstellungen, Routen, API, Datenbank, Migrationen oder globalem CSS.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Neues gezieltes Struktur-/Layoutskript für den Owner-Home-Entwurf: gemeinsame obere Übersichtsgruppe, Owner-exklusive Klassen/Prop, Kalender darunter, vorhandene Inhalte/Handler und Partnerausschluss.
- Bestehende Regressionen für Home-Layout, mobile Home-Kompaktheit, Today-Card, Ring, Kalenderbänder, Popover, Tagesfenster, Periodenübersicht und Owner-Mobilnavigation.
- `npx tsc --noEmit` und `npm run build`.
- Sichtprüfung mit einem echten lokalen Owner-Testkonto bei 360/390 px und 1280 px: kein horizontaler Überlauf, erreichbare Navigation, Monatswechsel, Popover, Tagesfenster und ein Periodenübersichtseinstieg. `/neu/partner` im selben Umfang als unveränderter Gegencheck.

### Stoppbedingungen

- Stoppe vor einer Änderung an fachlicher Reihenfolge, Datenlogik, Texten, Vorhersage/PMS/Periodenlogik, Kalenderband-Stil, Ringgeometrie, Partneransicht, Navigation, Routen, API, Datenbank, Migration, Abhängigkeit oder globalem CSS.
- Stoppe und frage nach, falls die gewünschte obere mobile Gruppe nicht ohne unlesbare Texte oder zu kleine Touch-Flächen umgesetzt werden kann. Schlage dann höchstens zwei rein visuelle Layoutvarianten vor.

### Abschluss durch Codex-App-Coder

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger für diese größere sichtbare Änderung ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-023` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment.

## Ist – von Claude

- umgesetzt: Die fertige Owner-Home `/neu` besitzt jetzt einen warmen Rosé-/Creme-Hintergrund und eine gemeinsame, responsive obere Übersichtsgruppe. Der vorhandene Zyklus-Kreis steht darin sichtbar links, die unveränderte TodayCard rechts; der bestehende Kalender folgt in einer ruhigen hellen Fläche darunter. Die mobile Owner-Navigation und alle bestehenden Inhalte und Handler bleiben eingebunden.
- nicht umgesetzt: Keine Änderung an Daten, Textlogik, Vorhersage, PMS/Periodenlogik, Kalenderband-Stil, Ringgeometrie, Partneransicht, Gates, Navigation, Routen, API, Datenbank, Migrationen, Abhängigkeiten oder globalem CSS.
- Tests: Neues Struktur-/Layoutskript `scripts/verify-owner-home-warm-redesign.ts` bestanden. Bestehende Regressionen für Home-Layout, mobile Kompaktheit, TodayCard, Ring/SVG, manuellen PMS-Marker, Kalenderbänder, Legenden-Popover, Tagesfenster, Periodenübersicht und Owner-Mobilnavigation bestanden. `npx tsc --noEmit` und `npm run build` bestanden. Lokale Browserprüfung mit temporärem Owner-Testkonto bei 360, 390 und 1280 Pixeln: kein horizontaler Überlauf, obere Gruppierung korrekt, Navigation erreichbar; Monatswechsel, Popover und Tagesfenster funktional. Partnerdateien per Git-Diff bytegleich bestätigt.
- Abweichungen: Die Browsersteuerung der Codex-App war wegen eines lokalen Sandbox-Startfehlers nicht nutzbar; die gleichwertige Sicht- und Interaktionsprüfung wurde deshalb mit lokalem Headless Chrome über dessen Debug-Schnittstelle durchgeführt. Ein gezielter ESLint-Lauf lieferte nach über 60 Sekunden keine Ausgabe und wurde kontrolliert beendet; TypeScript und Produktions-Build waren erfolgreich.
- offene Punkte: Owner-Sichtprüfung gemäß dem oben beschriebenen Prüfschritt steht aus. Kein manuelles Deployment durchgeführt.
- Commit: Abschlusscommit dieses Arbeitspakets (Hash nach Commit/Push in der Rückmeldung).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschärfung: ausstehend.
- Product-Map aktualisiert: nein.
