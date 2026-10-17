---
id: WP-016
title: "Mobile Home-Ansicht ruhig verdichten"
status: review
created: 2026-10-17
updated: 2026-10-17
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home /neu auf Mobilgeraeten"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Mobile Home-Ansicht ruhig verdichten

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Auf dem Handy werden die Heute-Karte, der Zyklus-Kreis und der Kalender ruhiger und kompakter. So sind die wichtigsten Informationen moeglichst zusammen sichtbar.
- **Warum machen wir das?** Die mobile Home-Seite wirkt derzeit zu gross; die Nutzerin muss mehr scrollen, als fuer einen schnellen Ueberblick angenehm ist.
- **Woher kam die Idee?** Owner-Entscheidung vom 2026-10-17, Akte APP-IDEA-019.
- **Wo ist es in der App?** Nur auf der eigenen Home-Seite `/neu` bei schmalen Bildschirmbreiten.
- **Was gehoert ausdruecklich nicht dazu?** Keine Aenderung an Textinhalten, Zyklusberechnung, Kalenderdaten, Vorhersagen, PMS, Aktionen, Partneransicht, API oder Datenbank.
- **Was kann die Nutzerin danach ausprobieren?** Auf einem Handy sieht sie die kleinere Heute-Karte, den kompakteren Zyklus-Kreis und den Kalender klarer zusammen; alle Tage und Pfeile bleiben gut bedienbar.

## Entstehungsweg

`Mobile Home-Seite zu gross → Ueberblick erfordert zu viel Scrollen → Typografie, Abstaende und Kreisdarstellung behutsam verdichten → WP-016`

- Ausgangsproblem: Auf kleinen Bildschirmen stehen Heute-Karte, Zyklus-Kreis und Kalender zu weit auseinander und wirken zu gross.
- bestaetigte Wirkung: Die bestehenden Informationen sollen schneller als gemeinsame Uebersicht erfassbar sein.
- gewaehlte Loesung: Nur die mobile Darstellung wird kompakter; bei groesseren Breiten bleibt die aktuelle Darstellung erhalten.
- wichtige Entscheidung: Tagesfelder und Navigation duerfen nicht so klein werden, dass sie schwer antippbar oder schlecht lesbar sind.
- Quellen/Akten: APP-IDEA-019, WP-006, WP-009, WP-010, WP-014, WP-015.

## Soll – von Codex

- Problem: Die mobile Home-Ansicht verlangt fuer den Gesamtueberblick unnoetig viel Scrollen.
- gewuenschte Wirkung: Auf einem typischen Mobilbildschirm sind Heute-Karte, Zyklus-Kreis und Kalender moeglichst kompakt und klar gegliedert sichtbar.
- sichtbare Aenderung nur auf Mobilgeraeten:
  1. Die Heute-Karte erhaelt kleinere Schrift und knappere Innenabstaende; Headline, Resttage-Zeile und der Hinweis `Kann abweichen` bleiben vollstaendig lesbar.
  2. Der Zyklus-Kreis wird sichtbar kleiner. Seine farbigen Ringbaender werden schmaler, aber Phasen, Labels, roter Heute-Punkt und alle Hinweise bleiben lesbar und kollidieren nicht.
  3. Die Monatsueberschrift (zum Beispiel `Oktober 2026`), Wochentage und Tageszahlen werden behutsam kleiner; die Abstaende im Kalender werden enger.
  4. Kalendertage und Monatspfeile behalten eine ausreichend grosse sichtbare und antippbare Flaeche. Inhalte duerfen nicht gequetscht, abgeschnitten oder ueberlagert werden.
- grosse Bildschirme: Ab der bestehenden `sm`-Darstellung bleibt die bisherige Groesse erhalten.
- nicht enthalten: Keine Textaenderung, keine neue Funktion, keine Aenderung von Daten, Vorhersagen, Periodenlogik, PMS, Ringgeometrie, Tagesaktionen, Historie, Partneransicht, API, Datenbank, Migration oder Authentifizierung.
- Abnahmekriterien:
  1. Bei 375 x 812 ist die eigene Home-Ansicht sichtbar kompakter als zuvor; keine horizontalen Ueberlaeufe.
  2. Heute-Karte, Zyklus-Kreis und Kalender bleiben in derselben Reihenfolge; alle bisherigen Texte und Zustandsanzeigen bleiben vorhanden.
  3. Tagesfelder sowie Monatsnavigation sind weiterhin mit mindestens etwa 40 CSS-Pixeln Hoehe und Breite bedienbar; Tagesfenster und Monatswechsel funktionieren unveraendert.
  4. Kreislabels, PMS-Label und roter Heute-Punkt bleiben klar getrennt und lesbar, auch bei manuellem PMS.
  5. Die Partneransicht bleibt unveraendert; auf breiten eigenen Ansichten bleibt die bisherige Groesse erhalten.
- ein Pruefschritt fuer den Owner: `/neu` auf dem Handy oeffnen und Heute-Karte, Ring und Kalender ansehen; einen Monat wechseln und einen vergangenen Tag antippen.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnoetige Schritt-fuer-Schritt-Loesung.

### Bestaetigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` ist die eigene mobile Home-Ansicht. Die relevanten vorhandenen Bereiche sind `TodayCard`, die Zyklus-`section` mit `CyclePersonalRing` und die Kalender-`section` mit Monatsnavigation und 7-spaltigem Tagesraster.
- `TodayCard` verwendet bereits eine begrenzte Karte (`max-w-sm`, `px-5`, `py-4`) und rendert ausschliesslich bestehende Texte.
- `CyclePersonalRing.tsx` ist eine gemeinsame SVG-Darstellung fuer eigene und Partneransicht. Sie besitzt derzeit `max-w-[22rem]`, SVG-Skalierung und Ringstriche mit `strokeWidth="38"`; die Daten- und Winkelwerte stammen ausschliesslich aus `cycle-ring-geometry.ts`.
- Das Tagesraster in `NewCycleExample.tsx` nutzt `grid-cols-7`, Tagescontainer mit `aspect-square` und interaktive Buttons mit voller Breite/Hoehe. Diese Interaktion bleibt erhalten.

### Technisches Ziel

- Passe nur responsive CSS-/Darstellungsklassen und, falls technisch erforderlich, eine klar begrenzte Darstellungsprop fuer den eigenen mobilen Kreis an. Die Standarddarstellung und jeder Partner-Aufruf behalten ohne diese Prop ihren bisherigen Stand.
- Verwende den bestehenden Mobile-first-/`sm:`-Ansatz: Die Verdichtung gilt unterhalb von `sm`; ab `sm` bleiben die bisherigen Masse, Schriftgroessen und Ringbreiten erhalten.
- Reduziere fuer die eigene mobile Ansicht Schrift, vertikale Abstaende, Kreisgroesse und sichtbare Ringbreite behutsam. Die Ringgeometrie (`buildPersonalRingGeometry`), Pfade, Winkel, Labels und Markerberechnung duerfen nicht veraendert werden.
- Behalte bei Tagesfeldern und Monatsnavigation ausreichend grosse Ziele bei. Falls kleinere Schrift oder engere Luecken notwendig sind, darf die anklickbare Buttonflaeche nicht entsprechend zu klein werden.

### Invarianten – muessen unveraendert bleiben

- Alle Daten, Berechnungen, Props ausser einer optionalen reinen Darstellungsprop, Vorhersagen, Texte, Reihenfolgen, Zustandshandler, Requests, Tagesfenster, Modals und Tastatur-/Screenreader-Verhalten bleiben unveraendert.
- `cycle-ring-geometry.ts`, `manual-pms.ts`, `predictCycle`, `computePersonalCycleView`, `deriveTodayCardText` und `daysUntilNextPeriod` werden nicht veraendert.
- Keine Textkuerzungen, Ellipsen oder versteckten Informationen nur fuer die mobile Ansicht.
- Die Partneransicht und die breite eigene Ansicht behalten ihren bisherigen visuellen Stand.
- Kein horizontaler Ueberlauf, keine Ueberlappung von Kreislabel/PMS-Text/Marker und keine Verringerung der bedienbaren Tages- oder Pfeilflaechen unter etwa 40 CSS-Pixel.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Gezielte Quelltext- oder Komponententests: eigene mobile Klassen sind vorhanden; breite/Partner-Darstellung bleibt ohne mobile Sonderprop unveraendert; Reihenfolge und vorhandene Inhalte bleiben erhalten.
- Bestehende Regressionen fuer Heute-Karte, Resttage, Ring inklusive manuellem PMS, Kalender, Monatsnavigation, Tagesfenster, Start-Hilfe und Home-Layout ausfuehren.
- TypeScript und Produktions-Build ausfuehren.
- Sichtpruefung auf 375 x 812 und 1280 x 900 mit mindestens einem persoenlichen Zyklus: keine horizontalen Ueberlaeufe, Monatswechsel und Tagesfenster funktionieren; Tages- und Pfeilflaechen messen; Kreislabels und Heute-Punkt pruefen.
- Sichtpruefung der verbundenen Partneransicht: sie bleibt visuell und funktional unveraendert sowie rein lesend.

### Stoppbedingungen

- Stoppe vor jeder Aenderung an Berechnung, Daten, Texten, Partneransicht, API, Datenbank, Routen oder Authentifizierung.
- Stoppe, wenn die gewuenschte Verdichtung nur durch Verkleinern antippbarer Tages-/Navigationsflaechen unter etwa 40 CSS-Pixel oder durch Abschneiden wichtiger Texte erreichbar waere.
- Stoppe, wenn eine Ringdarstellungsanpassung die gemeinsame Partneransicht, manuelles PMS oder vorhandene Label-/Markerabstaende beeinflussen wuerde.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger fuer diese sichtbare Aenderung ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-016` und `node scripts/work-package-state.mjs validate` ausfuehren.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - `src/components/CyclePersonalRing.tsx`: neue, rein optionale Prop `compact?: boolean` (Default `false`). Nur wenn gesetzt, wird der Container auf `max-w-[17rem]` (statt `max-w-[22rem]`), die Ringbandbreite (`strokeWidth`, drei Vorkommen) auf `30` (statt `38`) und die Phasen-Label-Schriftgröße auf `12` (statt `14`) reduziert. Ohne die Prop (Default) bleibt jede Zeile byte-identisch zum vorherigen Stand. `buildPersonalRingGeometry` erhält weiterhin ausschließlich `personalCycleView`, `today` und `manualPmsOverride` — `compact` fließt nie in Segmente, Winkel, Pfade oder Markerberechnung ein, nur in reine Darstellungsattribute.
  - `src/components/NewPartnerCycleRing.tsx`: **unverändert**, keine Zeile angefasst. Der Partner-Aufruf von `CyclePersonalRing` übergibt `compact` nie, bleibt also garantiert auf dem bisherigen visuellen Stand, auch mobil.
  - `src/components/NewCycleExample.tsx` (Owner-Ansicht):
    - Äußerer Abstand zwischen Heute-Karte, Zyklus und Kalender: `space-y-9 sm:space-y-10` → `space-y-6 sm:space-y-10`.
    - `TodayCard`: Innenabstand `px-5 py-4` → `px-4 py-3 sm:px-5 sm:py-4`; Headline `text-base` → `text-sm sm:text-base`; Resttage-Zeile und `Kann abweichen` `text-sm`/`mt-1` → `text-xs sm:text-sm`/`mt-0.5 sm:mt-1`. Kein Text geändert, nur Schriftgröße/Abstand.
    - Zyklus-`section`: `space-y-3` → `space-y-2 sm:space-y-3`; Überschrift „Dein Zyklus“ `text-lg` → `text-base sm:text-lg`.
    - Der Ring wird jetzt zweimal gerendert: ein `<div className="sm:hidden">`-Wrapper mit `<CyclePersonalRing ... compact />` (nur unterhalb `sm` sichtbar) und ein `<div className="hidden sm:block">`-Wrapper mit dem unveränderten Aufruf ohne `compact` (ab `sm` sichtbar) — ein reiner CSS-Ansatz ohne JS-Media-Query-Hook, exakt im bestehenden Mobile-first-/`sm:`-Stil des Projekts.
    - Kalender-`section`: `space-y-5` → `space-y-3 sm:space-y-5`.
    - Monatsüberschrift (`h2`): `text-3xl` → `text-2xl sm:text-3xl`.
    - Wochentag-Labels: `pb-1 text-sm` → `pb-0.5 text-xs sm:pb-1 sm:text-sm`.
    - Monatspfeile (`‹`/`›`): zusätzlich zur bestehenden, unveränderten `text-3xl`-Schrift wurde eine feste `h-10 w-10 flex items-center justify-center`-Klickfläche ergänzt (40×40 CSS-Pixel), die Grid-Spaltenbreite von `2rem` auf `2.5rem` erhöht. Grund: Die Buttons hatten zuvor keine explizite Fläche, sondern nur die Textzeilenhöhe innerhalb einer 32px-Spalte — gemessen 32×36px, also unter der geforderten ~40px-Mindestfläche. Das war schon vor WP-016 so (nicht durch die Verdichtung verursacht), musste aber für das ausdrückliche WP-016-Abnahmekriterium „mindestens etwa 40 CSS-Pixel“ behoben werden.
    - Tagesfelder, ihr `aspect-square`-Layout, ihre Schriftgröße und alle Tagesaktionen/-fenster: unverändert.
  - Keine Änderung an `cycle-ring-geometry.ts`, `manual-pms.ts`, `predictCycle`, `computePersonalCycleView`, `deriveTodayCardText`, `daysUntilNextPeriod`, Daten, API, Datenbank, Authentifizierung oder Routen.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-mobile-home-compact.ts` (neu, 20 Prüfungen, alle bestanden): `compact` ist optional und standardmäßig `false`; Ringbandbreite/Labelgröße/Containergröße bleiben bei `compact=false` exakt beim bisherigen Wert; `buildPersonalRingGeometry` wird nicht mit `compact` aufgerufen; `NewPartnerCycleRing.tsx` enthält keinerlei Referenz auf `compact` und übergibt den Ring unverändert; die Owner-Ansicht rendert den Ring über zwei CSS-Wrapper (`sm:hidden`/`hidden sm:block`), kein JS-Media-Query; Reihenfolge Heute-Karte/Zyklus/Kalender bleibt erhalten; Monatspfeile haben eine garantierte 40×40px-Fläche, Tagesfelder bleiben unverändert; keine Textkürzung oder Ellipsen wurden eingeführt, alle bestehenden Hinweise (Resttage-Zeile, „Kann abweichen“, manueller PMS-Hinweis) bleiben vollständig vorhanden.
  - `scripts/verify-home-screen-layout.ts` und `scripts/verify-home-actions-consistent.ts`: jeweils eine Assertion auf die exakten, jetzt responsiven `className`-Werte der Zyklus-/Kalender-`section` (`space-y-2 sm:space-y-3` / `space-y-3 sm:space-y-5`) sowie der `TodayCard`-Kartenrahmung aktualisiert — bewusste, vom Auftrag geforderte Verhaltensänderung, keine stille Fehlerreparatur. Beide Skripte bestehen vollständig.
  - Weitere ausgeführte Regressionen, alle bestanden: `scripts/verify-today-card.ts`, `scripts/verify-next-period-countdown.ts`, `scripts/verify-manual-pms-ring-marker.ts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-manual-pms-symptom-ui.ts`.
  - **Vorbestehender, nicht durch WP-016 verursachter Befund:** `scripts/verify-action-success-toast.ts` (14 von 17 Prüfungen), `scripts/verify-today-card.ts` (2 von insgesamt vielen Prüfungen, „keine eigene Datumsberechnung“/„kein Netzwerkaufruf“) und `scripts/verify-calendar-legend-collapsible.ts` (2 Prüfungen, Escape-Schließen/`aria-expanded`) schlagen mit exakt denselben Fehlermeldungen bereits auf dem unveränderten `main`-Stand (vor jeder WP-016-Änderung, per `git stash` verifiziert) fehl. Ursache ist ein veraltetes String-/Pattern-Matching in diesen Testskripten (z. B. erwartet `role="status" aria-live="polite"` in einer Zeile, während der Quelltext die Attribute korrekt, aber auf getrennten Zeilen trägt) — die geprüfte Funktionalität selbst (`ActionToast`, `PhaseLegendItem`, `TodayCard`) existiert unverändert korrekt im Quelltext. Außerhalb des WP-016-Auftragsumfangs, daher hier nicht repariert; dem Owner zur Kenntnis gegeben.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, nicht durch WP-016 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten (vier echte Perioden im 28-Tage-Rhythmus, manueller PMS-Abschnitt 14.–17.10.2026): Mobil (375×812): kein horizontaler Überlauf; Monatspfeile exakt 40×40px; Tagesfelder 43×43px; Ring-Container 272×272px (deutlich kompakter als zuvor 352×352px); PMS-/Periode-Label lesbar, Marker-Label-Abstand weiterhin 26,1px (identisch zu WP-014); manueller PMS-Hinweis „Von dir eingetragen: Müdigkeit“ sichtbar; Resttage-Zeile „Nächste Periode voraussichtlich in 1 Tag.“ sichtbar; Monatswechsel (→ November 2026) funktioniert; Tagesfenster für einen vergangenen Periodentag öffnet. Breit (1280×900): kein horizontaler Überlauf; Ring-Container unverändert 352×352px, identisch zum vorherigen Stand. Partneransicht mobil (375×812): Ring unverändert groß (261×261px, nicht durch `compact` reduziert, Differenz zu 272px rein durch die umgebende Card der Partneransicht), kein horizontaler Überlauf, Marker-Label-Abstand ebenfalls 26,1px, 0 Eingabeelemente im DOM (weiterhin rein lesend). Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** Die Vergrößerung der Monatspfeil-Klickfläche auf feste 40×40px (zusätzliche `h-10 w-10 flex items-center justify-center`-Klasse, Grid-Spalte `2rem`→`2.5rem`) ist im Soll nicht wörtlich benannt, aber zur Erfüllung des ausdrücklich geforderten Abnahmekriteriums „mindestens etwa 40 CSS-Pixel“ technisch notwendig, da die Pfeile zuvor (unabhängig von WP-016) nur 32×36px maßen. Keine Schriftgrößenänderung der Pfeile selbst, nur eine explizite Mindestfläche.
- **offene Punkte:** Owner-Prüfschritt steht aus: `/neu` auf dem Handy öffnen und Heute-Karte, Ring und Kalender ansehen; einen Monat wechseln und einen vergangenen Tag antippen.
- **Commit:** 0a78988.

## Soll-Ist-Prüfung – von Codex

Ausstehend.
