---
id: WP-017
title: "Mobile Partneransicht ruhig verdichten"
status: review
created: 2026-10-17
updated: 2026-10-17
owner_approved: yes
executor: claude
product_area: "Neue Luma – Partneransicht /neu/partner auf Mobilgeraeten"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Mobile Partneransicht ruhig verdichten

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Auf dem Handy wird die Partneransicht kompakter. Der Zyklus-Kreis, Schriftgroessen und Kalender nehmen weniger Platz ein, damit die freigegebenen Informationen schneller zusammen sichtbar sind.
- **Warum machen wir das?** Die Ownerin moechte, dass ihr Partner auf seinem Handy moeglichst wenig scrollen muss, um Zyklus, Kalender und Hinweise zu ueberblicken.
- **Woher kam die Idee?** Owner-Entscheidung vom 2026-10-17, Akte APP-IDEA-023.
- **Wo ist es in der App?** Ausschliesslich auf `/neu/partner` unterhalb des bestehenden `sm`-Breakpoints.
- **Was gehoert ausdruecklich nicht dazu?** Keine neuen Daten, keine Freigabeschalter, keine Eingaben oder Aenderungen fuer Partner, keine neue Berechnung und keine Aenderung der eigenen Home-Ansicht `/neu`.
- **Was kann der Partner danach pruefen?** Auf dem Handy bleiben Ring, Kalender und Hinweise lesbar sowie rein lesend, wirken aber sichtbar kompakter. Auf groesseren Bildschirmen bleibt die heutige Darstellung erhalten.

## Entstehungsweg

`Partneransicht auf dem Handy zu gross → Gesamtueberblick erfordert zu viel Scrollen → nur mobile Darstellung von Ring, Schrift, Abstaenden und Kalender behutsam verdichten → WP-017`

- Ausgangsproblem: Die mobile Partneransicht soll die bereits freigegebenen Informationen ruhiger und dichter zeigen.
- bestaetigte Wirkung: Partnerinnen und Partner sehen Zyklus-Kreis, Kalender und Hinweise ohne unnoetige Leerraeume als gemeinsame Uebersicht.
- gewaehlte Loesung: Mobile reine Darstellung anpassen; Logik, Freigaben und Bearbeitungsgrenzen unveraendert lassen.
- wichtige Entscheidung: Bedienelemente wie Monatspfeile duerfen nicht zu klein werden. Die Partneransicht bleibt vollstaendig rein lesend.
- Quellen/Akten: APP-IDEA-023, WP-004, WP-007, WP-012, WP-013, WP-014, WP-016.

## Soll – von Codex

- Problem: Auf kleinen Bildschirmen wirkt die Partneransicht groesser als fuer einen schnellen Ueberblick notwendig.
- gewuenschte Wirkung: Unterhalb `sm` sind Zyklus-Kreis, Kalender und lesende Hinweise der aktiven Partneransicht sichtbar kompakter und klar strukturiert.
- sichtbare Aenderung nur auf Mobilgeraeten:
  1. Der Zyklus-Kreis ist kleiner; Ringbaender und Labels werden behutsam mitverkleinert. Phasen, PMS-Abschnitt, roter Heute-Punkt und alle Labels bleiben klar getrennt und lesbar.
  2. Die Partner-Kalenderueberschrift, Wochentage, Tageszahlen, die Heute-Datumzeile und rein lesende Hinweise werden mobil kleiner sowie Abstaende enger. Bestehende Texte bleiben vollstaendig sichtbar.
  3. Tagesfelder und Monatspfeile behalten ausreichend grosse sichtbare und antippbare Flaechen von etwa mindestens 40 CSS-Pixeln. Monatswechsel und Tagesinformationen bleiben nutzbar.
  4. Ab der bestehenden `sm`-Darstellung bleibt die bisherige Partnerdarstellung unveraendert.
- nicht enthalten: Keine Aenderung an Textinhalten, Daten, Freigaben, aktiver Verbindungspruefung, Berechnungen, Vorhersagen, PMS-Logik, Ringgeometrie, Tagesaktionen, API, Datenbank, Migrationen, Routen, Authentifizierung oder eigener Home-Ansicht.
- Abnahmekriterien:
  1. Bei 375 x 812 ist `/neu/partner` kompakter als vorher und hat keinen horizontalen Ueberlauf.
  2. Ring, Kalender, „Vorhersage unsicher“-Hinweis und einklappbare Erklaerungen bleiben vorhanden, vollstaendig lesbar und funktionsfaehig.
  3. Monatsnavigation und Tagesfelder bleiben mit ausreichend grossen Flaechen bedienbar; die Partneransicht hat weiterhin keine Eingabemoeglichkeit.
  4. Bei manuellem PMS stimmen Partner-Kreis und Partner-Kalender weiterhin ueberein; echte Periodentage behalten Vorrang.
  5. Die eigene Home-Ansicht `/neu` und die breite Partneransicht bleiben visuell unveraendert.
- ein Pruefschritt fuer den Owner: Als aktiver Partner `/neu/partner` auf dem Handy oeffnen, Ring und Kalender ansehen, einen Monat wechseln und einen Tag antippen; danach dieselbe Ansicht breit pruefen.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt Leitplanken, aber keine unnoetige Schritt-fuer-Schritt-Loesung.

### Bestaetigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` stellt die aktive Partneransicht bereit und wahrt deren bestehendes, rein lesendes Zugriffsmodell.
- `src/components/NewPartnerCycleRing.tsx` verwendet die gemeinsame SVG-Komponente `CyclePersonalRing.tsx`; diese besitzt seit WP-016 bereits die optionale reine Darstellungsprop `compact?: boolean` mit Default `false`.
- `src/components/NewPartnerCalendar.tsx` stellt Kalender, `CalendarTodayLine`, Monatsnavigation, Tagesraster, Unsicherheitshinweis und einklappbare Erklaerungen dar. `CalendarTodayLine.tsx` besitzt bereits die optionale Darstellungsprop `compact?: boolean` mit Default `false`.
- Ringsegmente, Winkel und Marker stammen weiterhin aus `cycle-ring-geometry.ts`; der manuelle PMS-Abschnitt wird zentral durch `manual-pms.ts` abgeleitet.

### Technisches Ziel

- Passe ausschliesslich responsive CSS-/Darstellungsklassen der Partneransicht an. Nutze den bestehenden Mobile-first-/`sm:`-Ansatz.
- Falls es fuer den Ring erforderlich ist, darf die vorhandene optionale reine Darstellungsprop `compact` in der Partneransicht unterhalb `sm` verwendet werden. Die breite Partnerdarstellung muss den bisherigen Aufruf ohne `compact` behalten. Kein JavaScript-Media-Query-Hook.
- Wenn eine mobile/breite Umschaltung fuer den Ring notwendig ist, verwende das bereits in WP-016 etablierte CSS-Wrapper-Muster; stelle sicher, dass jeweils nur eine Darstellung sichtbar ist.
- Reduziere mobil Schrift, vertikale Abstaende, Kalenderueberschrift, Wochentage, sichtbare Haupt-Tageszahlen und Ringgroesse behutsam. Vorhandene kleine Badges, PMS-/Periodenmarker und der rote Heute-Punkt duerfen weder versteckt noch in ihrer Bedeutung veraendert werden.
- `CalendarTodayLine` darf nur mit seiner vorhandenen optionalen Darstellungsprop verwendet werden. Keine neue Daten- oder Verhaltensprop.
- Die Partneransicht bleibt ohne Checkboxen, Speichern-, Loeschen- oder sonstige Eingabeelemente. Die bestehenden Tagesinformationen bleiben rein lesend.

### Invarianten – muessen unveraendert bleiben

- Keine Aenderung an `cycle-ring-geometry.ts`, `manual-pms.ts`, `predictCycle`, `computePersonalCycleView`, `deriveManualPmsSection`, Datenzugriff, aktiver Partnerverbindungspruefung, Berechnung, Textinhalten, Handlern, Tagesfenstern, ARIA-Verhalten, API, Datenbank, Migrationen, Routen oder Authentifizierung.
- Die eigene Home-Ansicht `/neu` und deren WP-016-Mobileinstellungen bleiben unveraendert.
- Keine Textkuerzungen, Ellipsen oder Verstecken von Informationen auf Mobilgeraeten.
- Kalender-Tagesfelder behalten ihr `aspect-square`-Layout sowie eine erreichbare ungefaehre Mindestflaeche von 40 CSS-Pixeln. Monatspfeile sind ebenfalls mindestens etwa 40 CSS-Pixel gross.
- Keine horizontale Ueberlappung, keine Kollision von Ringlabel/PMS-Text/Marker und keine Veraenderung der Inhalte oder Bedeutung von Badges.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- Betroffene API-Routen: keine.
- Migration noetig: nein.

### Pflichtpruefungen

- Gezielte Quelltext- oder Komponententests: mobile Partnerklassen und die reine Darstellungsabgrenzung sind vorhanden; breite Partneransicht und eigene Home-Ansicht bleiben ohne neue Nebenwirkung; weiterhin keine Partner-Eingabemoeglichkeit.
- Bestehende Partner-, Kalender-, Ring- inklusive manuellem PMS-, Tagesfenster-, Monatsnavigation- und einklappbare-Erklaerungen-Regressionen ausfuehren.
- TypeScript und Produktions-Build ausfuehren.
- Sichtpruefung auf 375 x 812 und 1280 x 900 mit einer aktiven Partnerverbindung: kein horizontaler Ueberlauf; Ringlabels/Marker, Kalender, Unsicherheitshinweis und Erklaerungen lesbar; Monatswechsel und Tagesfenster funktionieren; Tages- und Pfeilflaechen messen; keine Eingabeelemente in der Partneransicht.
- Sichtpruefung mit manuellem PMS und einem echten Periodentag: Partner-Kreis und Kalender stimmen weiterhin ueberein, echte Periode hat Vorrang.

### Stoppbedingungen

- Stoppe vor jeder Aenderung an Daten, Freigaben, aktiver Partnerverbindungspruefung, Berechnung, PMS-Logik, Ringgeometrie, Texten, API, Datenbank, Migrationen, Routen oder Authentifizierung.
- Stoppe, wenn die Verdichtung nur durch Tages- oder Pfeilflaechen unter etwa 40 CSS-Pixel oder durch Abschneiden wichtiger Texte erreichbar waere.
- Stoppe, wenn die gemeinsame Ringkomponente die eigene Ansicht oder die breite Partneransicht unbeabsichtigt veraendern wuerde.

### Abschluss durch Claude

- `Ist` vollstaendig ergaenzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger fuer diese sichtbare Aenderung ergaenzen.
- `node scripts/work-package-state.mjs mark-updated WP-017` und `node scripts/work-package-state.mjs validate` ausfuehren.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - `src/app/neu/partner/page.tsx`: äußerer `main`-Innenabstand `px-6` → `px-3 sm:px-6`; Karten-Hülle `gap-6 p-8` → `gap-4 p-4 sm:gap-6 sm:p-8`. Das engere `main`-Padding war technisch notwendig (siehe Abweichungen), um trotz Karten-Innenabstand genug Platz für mindestens 40px breite Tagesfelder im 7-spaltigen Kalender zu behalten.
  - `src/components/NewPartnerCycleRing.tsx`: `section`-Abstand `space-y-3` → `space-y-2 sm:space-y-3`; Überschrift „Zyklus-Kreis“ `text-lg` → `text-base sm:text-lg`. Der Ring wird jetzt über zwei CSS-Wrapper gerendert — `<div className="sm:hidden">` mit `<CyclePersonalRing ... compact />` (nur unterhalb `sm` sichtbar) und `<div className="hidden sm:block">` mit dem unveränderten Aufruf ohne `compact` (ab `sm` sichtbar) — exakt das in WP-016 etablierte Muster, kein JS-Media-Query. `compact` ist dieselbe, bereits seit WP-016 bestehende reine Darstellungsprop auf `CyclePersonalRing.tsx`; diese Datei selbst wurde nicht verändert. Die drei Hinweiszeilen (`no_data`, manueller PMS-Hinweis, voraussichtliches Ende) wurden `text-sm` → `text-xs sm:text-sm`.
  - `src/components/NewPartnerCalendar.tsx`: `CalendarTodayLine` erhält `compact` (dieselbe, bereits seit WP-016 bestehende Prop, keine neue Prop eingeführt). Äußerer Abstand `space-y-5` → `space-y-3 sm:space-y-5`. Monatsüberschrift `text-xl` → `text-lg sm:text-xl`. Wochentag-Labels `pb-1 text-xs` → `pb-0.5 text-[11px] sm:pb-1 sm:text-xs`. Haupt-Tageszahl `text-sm` → `text-xs sm:text-sm`. Tagesraster-Gap `gap-1.5` → `gap-1 sm:gap-1.5`. Monatspfeile erhielten zusätzlich zur bestehenden `text-2xl`-Schrift eine feste `h-10 w-10 flex items-center justify-center`-Klickfläche (40×40 CSS-Pixel), Grid-Spaltenbreite `2rem` → `2.5rem` (identisches Muster wie bei WP-016 für die Eigenansicht). Der Erklärungen-Umschalter erhielt zusätzlich `flex min-h-10 items-center justify-center`, um trotz unveränderter `text-xs`-Schrift mindestens 40px Höhe zu garantieren. `DayDetailModal` (Overlay beim Antippen eines Tages) wurde nicht angefasst — analog zur WP-016-Entscheidung, das Tagesfenster der Eigenansicht ebenfalls unverändert zu lassen, da es kein Teil der dauerhaft sichtbaren, zu verdichtenden Oberfläche ist.
  - Keine Änderung an `cycle-ring-geometry.ts`, `manual-pms.ts`, `predictCycle`, `computePersonalCycleView`, `deriveManualPmsSection`, `CyclePersonalRing.tsx`, `CalendarTodayLine.tsx`, Datenzugriff, aktiver Partnerverbindungsprüfung, API, Datenbank, Migrationen, Routen, Authentifizierung oder der eigenen Home-Ansicht `/neu` (`NewCycleExample.tsx` wurde nicht geöffnet/verändert).
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-mobile-partner-compact.ts` (neu, 28 Prüfungen, alle bestanden): Seitenhülle verdichtet; Ring über zwei CSS-Wrapper ohne JS-Breakpoint, `compact` nur mobil gesetzt, breiter Partner-Ring-Aufruf unverändert ohne `compact`; `manualPmsOverride` bleibt unverändert aus `manual-pms.ts` abgeleitet; `CalendarTodayLine` nur über die bereits vorhandene Prop verwendet; Monatsüberschrift/Wochentage/Haupt-Tageszahl/Kalenderabstand mobil kleiner, ab `sm` unverändert; Monatspfeile mit garantierter 40×40px-Fläche, Tagesraster-Gap verdichtet; Erklärungen-Button mit `min-h-10`; Unsicherheits-/PMS-/Perioden-Hinweise vollständig vorhanden, keine Textabschneidung; keine Eingabeelemente oder Netzwerkaufrufe in beiden Partnerkomponenten; die eigene Home-Ansicht bleibt unberührt (keine Partnerkomponenten-Referenz, Tageszahl-Klasse exakt beim WP-016-Korrektur-V2-Stand).
  - `scripts/verify-mobile-home-compact.ts` (WP-016): zwei Assertions, die zur Zeit von WP-016 noch korrekt „Partneransicht übergibt niemals `compact`“ prüften, wurden an die durch WP-017 bewusst überholte Realität angepasst (Verweis auf `verify-mobile-partner-compact.ts`, das die jetzt korrekte Erwartung prüft) — keine stille Abschwächung, sondern eine durch den neuen, nachträglichen Auftrag notwendige Korrektur einer zuvor gültigen, jetzt überholten Annahme. Alle 42 Prüfungen dieses Skripts bestehen weiterhin.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-partner-calendar-legend-collapsible.ts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-partner-new.mts`, `scripts/verify-partner-notification-preference.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-pms-symptoms.mts`, `scripts/verify-partner-view-no-status-card.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-manual-pms-ring-marker.ts`.
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84, der eine Fehlschlag ist der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, nicht durch WP-017 verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build`: erfolgreich, Routenliste unverändert.
  - Live-Prüfung mit temporär installiertem Playwright gegen den lokalen Dev-Server mit echten Testkonten (vier echte Perioden im 28-Tage-Rhythmus, manueller PMS-Abschnitt 14.–18.10.2026, aktive Partnerverbindung): Mobil (375×812): kein horizontaler Überlauf; Ring-Container 272×272px (identisch zur WP-016-Eigenansicht); Marker-Label-Abstand 26,1px (identisch zu WP-014/WP-016); Monatspfeile exakt 40×40px; Tagesfelder nach der Korrektur 42×42px (vor der Korrektur 36×36px, siehe Abweichungen); Monatswechsel (→ November 2026) funktioniert; Tagesfenster für den 18.10. öffnet mit „PMS von ihr eingetragen: Müdigkeit“ — Ring und Kalender stimmen für denselben manuellen PMS-Tag überein; 0 Eingabeelemente im DOM (weiterhin rein lesend). Breit (1280×900): kein horizontaler Überlauf; Ring-Container unverändert 318px (Partner-Card-Breite, identisch zum vorherigen Stand), große Schrift/Abstände unverändert. Eigene Home-Ansicht `/neu` mobil: unverändert, kein horizontaler Überlauf, visuell identisch zum WP-016-Korrektur-V2-Stand. Screenshots geprüft und danach gelöscht; Playwright wieder deinstalliert; temporäre Test-/Cleanup-Skripte entfernt.
- **Abweichungen:** Beim ersten Durchlauf maßen die Tagesfelder mobil nur 36×36px (unter der geforderten ~40px-Mindestfläche), weil die Partneransicht — anders als die eigene Home-Ansicht — eine zusätzliche Karten-Hülle (`main px-6` + `section p-8`) um den Kalender legt, die bei reiner Innenabstandsverdichtung nicht genug Platz für 7 Spalten plus Gaps übrig ließ. Behoben durch ein zusätzlich verdichtetes äußeres `main`-Padding (`px-3` statt `px-6` unterhalb `sm`) und ein engeres Tagesraster-Gap (`gap-1` statt `gap-1.5` unterhalb `sm`) — danach 42×42px, deutlich über der Mindestfläche. Diese beiden zusätzlichen Anpassungen sind im Soll nicht wörtlich benannt, aber zur Erfüllung des ausdrücklich geforderten Abnahmekriteriums „mindestens etwa 40 CSS-Pixel“ technisch notwendig.
- **offene Punkte:** Owner-Prüfschritt steht aus: Als aktiver Partner `/neu/partner` auf dem Handy öffnen, Ring und Kalender ansehen, einen Monat wechseln und einen Tag antippen; danach dieselbe Ansicht breit prüfen.
- **Commit:** c0f11c4.

## Soll-Ist-Prüfung – von Codex

_Noch nicht geprüft. Diese Prüfung erfolgt erst nach der Claude-Umsetzung._
