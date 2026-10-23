---
id: WP-029
title: "Kalenderlegende mit passenden Bandproben"
status: review
created: 2026-10-23
updated: 2026-10-23
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Owner- und Partnerkalender"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Kalenderlegende mit passenden Bandproben

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Im kleinen `ⓘ`-Fenster sehen die Farbmuster genauso aus wie die Bänder im Kalender.
- **Warum machen wir das?** Die bisherigen runden Punkte wirken wie eigene Farben und helfen nicht sicher beim Verstehen der Kalenderbänder.
- **Wo ist es in der App?** Nur im Info-Popover neben dem Monatsnamen auf `/neu` und `/neu/partner`.
- **Sichtbare Änderung:** Jede Erklärung zeigt links ein kurzes, abgerundetes Mini-Band statt eines runden Punkts.
- **Was bleibt unverändert?** Texte, Gruppen, Farben, Kalenderbänder, Daten, Vorhersagen, PMS-Logik, Partnerrechte und Öffnen/Schließen des Popovers.
- **Was prüfst du danach?** Beim Öffnen von `ⓘ` ist jede Probe unmittelbar derselben Kalenderphase zuzuordnen: gefüllt oder nur umrandet.

## Entstehungsweg

`Owner-Screenshot → runde Legendenpunkte wirken nicht wie Kalenderbänder → Bandform und Farbsemantik müssen übereinstimmen → kurze Bandproben im bestehenden Popover → WP-029`

- Ausgangsproblem: Die Legende erklärt zwar die Farben, ihre runden Punkte sehen aber nicht aus wie die breiten Pillen-Bänder im Kalender.
- bestätigte Wirkung: Der Zusammenhang zwischen Erklärung und Kalender ist direkt erkennbar.
- gewählte Lösung: Die bestehenden Farbklassen bleiben Quelle der Wahrheit; nur die Form der Muster wird als kleine abgerundete horizontale Bandprobe dargestellt.
- wichtige Entscheidung: Gefüllte Einträge bleiben gefüllt, geschätzte Einträge bleiben hohl mit derselben Umrandung. Keine neuen Legendenzeilen.
- Korrekturentscheidung (Owner, 2026-10-23): Der violette Eisprung ist im Kalender sichtbar und muss deshalb ebenfalls im `ⓘ`-Fenster verständlich erklärt werden.
- Quellen/Akten: Owner-Screenshot 2026-10-23, APP-IDEA-033, WP-025, WP-026.

## Soll – von Codex

- In Owner- und Partner-Popover ersetzt ein kurzes horizontales, abgerundetes Muster jeden bisherigen runden Farbpunkt.
- Die Probe für „Periode (tatsächlich)“/„Periode bestätigt“ nutzt exakt die bestehende gefüllte Periodenfarbe.
- Die Probe für „PMS von dir eingetragen“/„PMS eingetragen“ nutzt exakt die bestehende kräftige PMS-Füllfarbe.
- Die Probe für „Nächste Periode“ nutzt exakt den bestehenden rosa Umriss; „PMS-Phase“ nutzt exakt den bestehenden zartrosa Umriss.
- Eine zusätzliche Zeile „Eisprung“ erklärt den vorhandenen violetten Umriss. Sie zeigt dieselbe violette, hohle Bandprobe wie der Eisprung im Kalender und den kurzen Hinweis „Kann abweichen“.
- Größe und Ausrichtung bleiben ruhig und gut lesbar auf Mobil und Desktop. Das Popover wächst nicht über den Viewport und verdeckt keine Bedienung dauerhaft.
- Außer der neuen Eisprung-Zeile ändern sich keine bestehenden Texte, Gruppen, Sichtbarkeitsbedingungen oder das Verhalten bei Klick, Escape und Außenklick.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage

- `src/lib/calendar-phase-colors.ts` ist die gemeinsame Farbquelle. `filledSwatchClassName()` liefert die bestehende Füllfarbe; `outlineSwatchClassName()` liefert dieselbe `border-2`-Umrandung wie die geschätzten Bänder.
- `src/components/NewCycleExample.tsx` nutzt `calendarLegendGroups` und rendert die Owner-Popover-Muster derzeit als `size-3 rounded-full`.
- `src/components/NewPartnerCalendar.tsx` besitzt das parallele `PartnerCalendarLegendPopover` und rendert dieselben Farbquellen ebenfalls als `size-3 rounded-full`.
- Die Eisprungdarstellung im Kalender verwendet bereits die vorhandene violette Umrissfarbe aus `calendar-phase-colors.ts`; sie darf nicht neu definiert oder berechnet werden.
- Kalenderbänder, Farben und Zustand werden bereits über die genannten bestehenden Quellen/Komponenten abgeleitet und dürfen nicht neu berechnet werden.

### Technisches Ziel

- Ersetze in beiden bestehenden Popovern ausschließlich die runde Mustergeometrie durch eine kurze abgerundete horizontale Bandprobe, beispielsweise in einer festen, ruhigen Breite und der vorhandenen Bandhöhe.
- Verwende die bestehenden Farbhelfer und `calendarPhaseColors` weiter. Wenn eine kleine gemeinsame CSS-/Komponentenhilfe sinnvoll ist, darf sie nur die Form kapseln; sie darf keine neue Phasenlogik, Datenquelle oder Berechnung einführen.
- Stelle sicher, dass Füllung und Umriss der Popover-Probe der zugehörigen Kalenderphase exakt entsprechen.
- Ergänze im Owner- und Partner-Popover im Bereich „Geschätzt“ die Zeile „Eisprung“ mit der bestehenden violetten Umrissprobe und dem vorhandenen Hinweis „Kann abweichen“. Die Zeile ist an dieselbe vorhandene Bedingung wie der sichtbar berechnete Eisprung gebunden.

### Invarianten

- Keine Änderungen an Kalenderfarben, `calendar-phase-colors.ts`-Werten, Datenbank, API, Vorhersage, PMS-Ableitung, Bandposition oder Zyklus-Kreis.
- Keine zusätzlichen Popover-Zeilen außer der freigegebenen Eisprung-Zeile, keine Änderung bestehender Texte und keine Änderung bestehender sichtbarkeitsabhängiger Zeilen.
- Owner- und Partneransicht bleiben inhaltlich gleich; Partner bleibt rein lesend.
- Zugängliche Semantik und das bestehende Popover-Verhalten (Trigger, Escape, Außenklick) bleiben unverändert.

### Pflichtprüfungen

- Gezielte Prüfung für beide Komponenten: keine `rounded-full size-3`-Punktmuster mehr; alle vorhandenen Zeilen einschließlich Eisprung nutzen die bestehende korrekte Füllung oder Umrandung und eine horizontale Bandform. Eisprung erscheint nur, wenn er im jeweiligen Kalender sichtbar sein kann.
- Bestehende Popover-Prüfungen für Owner und Partner; TypeScript-Prüfung und Build.
- Sichtprüfung bei schmaler und breiter Ansicht: Popover vollständig sichtbar, keine Überlappung oder horizontaler Überlauf, Öffnen/Schließen unverändert.

### Stoppbedingungen

- Stoppe vor jeder Änderung an Farbwerten, Kalenderbändern, Daten, Vorhersagen oder Popover-Inhalt.
- Stoppe, wenn die Eisprung-Probe nicht mit den bestehenden Farbklassen und der bestehenden Sichtbarkeitsbedingung umgesetzt werden kann, ohne eine zweite Farbquelle oder neue Datenableitung einzuführen.

## Ist – von Claude

- umgesetzt:
  - `src/lib/calendar-phase-colors.ts`: nur eine Form-Konstante `legendBandSampleClassName` (`h-3.5 w-9 shrink-0 rounded-full`, abgerundete horizontale Mini-Pille) ergänzt. Alle Farbwerte, `filledSwatchClassName` und `outlineSwatchClassName` sind unverändert; es entsteht keine zweite Farbquelle.
  - `src/components/NewCycleExample.tsx` (Owner-Popover) und `src/components/NewPartnerCalendar.tsx` (Partner-Popover): Die runden Muster (`size-3 rounded-full`) wurden in allen vier bzw. drei Probenstellen durch die Bandprobe ersetzt; Füllung bzw. Umriss kommen weiter aus den bestehenden Farbhelfern (`calendarPhaseColors.confirmed/pmsManual` gefüllt, `periodEstimate`/`pmsEstimate` umrandet mit derselben `border-2`).
  - Nicht verändert: Texte, Gruppen, Zeilen, Sichtbarkeitsbedingungen, Kalenderbänder, Farbwerte, Daten, Vorhersage, PMS-Ableitung, Zyklus-Kreis, Partnerrechte, Trigger/Escape/Außenklick, `aria`-Semantik (Proben bleiben `aria-hidden`, die Texte tragen die Bedeutung).
- nicht umgesetzt: nichts offen.
- Tests:
  - Neues Skript `scripts/verify-calendar-legend-band-samples-wp029.ts` (bestanden): Probenform ist eine abgerundete, deutlich breitere als hohe Pille; keine `size-*`/runden Punktmuster mehr in beiden Popovern; jede Zeile nutzt die richtige bestehende Füllung bzw. den richtigen Umriss; Kalenderbänder und Proben nutzen dieselben Farbquellen; Farbwerte, vier Owner-Zeilen, Partner-Gruppen/Bedingungen, Escape/Außenklick und Partner-Read-only unverändert.
  - Bestehende Popover-Prüfungen bestehen (`verify-calendar-legend-collapsible`, `verify-calendar-quiet-wp025`, `verify-calendar-tile-band`); die TodayCard-Prüfung in `verify-partner-calendar-legend-collapsible.ts` ist weiter vorbestehend. `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; Owner und Partner bei 360, 390 und 1280 px): Popover beim Start geschlossen, öffnet über ⓘ, liegt vollständig im Viewport, kein horizontaler Überlauf, schließt mit Escape; alle vier Proben je Ansicht sind 36×14 px große Pillen, und ihre im Browser berechnete Füllung bzw. Umrandung stimmt mit dem jeweiligen Kalenderband überein. Testkonten entfernt, Playwright entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine.
- offene Punkte: keine. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`feat(wp-029)`).

## Ist Korrektur Eisprung-Erklärung – von Claude

- Auftrag (Owner, direkt im Chat; im Paket war noch kein Korrekturabschnitt von Codex vorhanden): Im ⓘ-Popover fehlt die Erklärung für den violetten Eisprung im Kalender. Unter „Geschätzt“ soll in Owner- und Partner-Popover eine Zeile „Eisprung“ mit derselben violetten, nur umrandeten Mini-Bandprobe und „Kann abweichen“ ergänzt werden, nur wenn der Eisprung im jeweiligen Kalender sichtbar sein kann. Keine Änderung an Kalenderfarben, Berechnung, Daten, PMS, Zyklus-Kreis oder Partnerrechten.
- umgesetzt:
  - `NewCycleExample.tsx` (Owner-Popover): neue Zeile „Eisprung“ unter „Geschätzt“ (nach „PMS-Phase“) mit `outlineSwatchClassName(calendarPhaseColors.ovulation.outline)` (dieselbe Umrissfarbe wie das Eisprungband) und „Kann abweichen“. Neue Prop `hasOvulation`: sichtbar, wenn eine Vorhersage existiert (sie enthält immer einen Eisprungtag), ein vergangener Zyklus einen möglichen Eisprung hat (`historicalOvulationDates`, WP-028) oder der Beispielmonat angezeigt wird (`isExampleMonth`, enthält Eisprungtage).
  - `NewPartnerCalendar.tsx` (Partner-Popover): dieselbe Zeile in der Gruppe „Geschätzt“, sichtbar bei `hasAnyPrediction || hasHistoricalOvulation` (neue Prop aus `historicalPhases.ovulationDates`); „Nächste Periode“ und „PMS-Phase“ bleiben an `hasAnyPrediction` gebunden, die Gruppe erscheint, sobald mindestens eine Zeile sichtbar ist.
  - Unverändert: alle Farbwerte, Kalenderbänder, Berechnung, Daten, PMS, Zyklus-Kreis, Partnerrechte (rein lesend), Bandproben-Form, Öffnen/Escape/Außenklick.
- Tests:
  - `verify-calendar-legend-band-samples-wp029.ts` ergänzt (Eisprung-Probe = Umrissfarbe des Eisprungbands in Owner und Partner; fünf Owner-Zeilen). Die Prüfungen aus WP-025 Version 2, die die Eisprung-Zeile ausdrücklich ausschlossen, wurden an die neue Owner-Entscheidung angepasst (`verify-calendar-quiet-wp025`, `verify-calendar-legend-collapsible`, `verify-partner-calendar-legend-collapsible`) und prüfen jetzt Zeile, Probe und Sichtbarkeitsbedingung; die übrigen entfernten Begriffe („Gespeicherte Planung“, „Voraussichtliches Ende“, „Mögliches fruchtbares Zeitfenster“, „PMS vor Periode“) bleiben ausgeschlossen. Alle bestehen bis auf die vorbestehende TodayCard-Prüfung im Partner-Legendenskript. `verify-historical-phases-wp028`, `verify-calendar-tile-band`, `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; Owner und Partner bei 360, 390 und 1280 px): fünf Zeilen mit Eisprung-Zeile samt 36×14-px-Pille und „Kann abweichen“; die im Browser berechnete Füllung/Umrandung jeder Probe, auch der Eisprung-Probe, stimmt mit dem jeweiligen Kalenderband überein; Popover vollständig im Viewport, kein Überlauf, Escape schließt. Testkonten und Playwright entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: Der Fall „keine Vorhersage und kein Beispielmonat“ (Owner-Popover ohne Eisprung-Zeile) wurde nur über den Quelltext-Test abgesichert, nicht im Browser nachgestellt.
- offene Punkte: keine. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`fix(wp-029)` Eisprung-Zeile).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: erfüllt.
- Geprüft: Commit `9eef9f1`; gezielte Prüfung `npx tsx scripts/verify-calendar-legend-band-samples-wp029.ts` bestanden.
- Festgestellt: Beide Popover verwenden eine 36×14px große horizontale Bandprobe mit denselben vorhandenen Füll- beziehungsweise Umrissklassen wie die Kalenderbänder. Texte, sichtbare Zeilen, Farben, Popover-Verhalten und Partnerrechte bleiben unverändert.
- Owner-Prüfung: ausstehend.
