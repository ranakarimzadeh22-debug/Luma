---
id: WP-031
title: "Einstellungen: Bereich Mein Zyklus"
status: review
created: 2026-11-12
updated: 2026-11-12
brief_version: 1
technical_brief: complete
owner_approved: yes
executor: Claude
product_area: "/neu/einstellungen"
---

# WP-031 – Einstellungen: Mein Zyklus

## Freigabe

Der Owner hat die Umsetzung am 12.11.2026 freigegeben. Claude ist der Ausfuehrer.

## Problem

Die Einstellungen enthalten bisher keinen klaren, ruhigen Einstieg zu den bereits vorhandenen Zyklusangaben. Die Nutzerin muss wissen, wo sie ihre Zyklusgrunddaten pruefen oder aendern kann.

## Gewuenschte Wirkung

In den Einstellungen ist der persoenliche Bereich **Mein Zyklus** auf einen Blick auffindbar. Die Nutzerin erkennt dort die Bedeutung der Angaben fuer Schaetzungen und gelangt mit einem eindeutigen Button zum bestehenden Zyklusprofil.

## Soll

Auf `/neu/einstellungen` einen neuen, ruhigen Bereich **Mein Zyklus** vor dem Bereich **Partnerverbindung** einfuegen:

- Titel: `Mein Zyklus`
- kurzer Text: `Diese Angaben helfen bei der Schätzung.`
- die bereits gespeicherte uebliche Zykluslaenge anzeigen, sofern sie im bestehenden Profil vorhanden ist; keine Werte erfinden
- falls noch keine Zykluslaenge vorhanden ist, einen neutralen Einrichtungszustand zeigen
- klarer Link/Button: `Zyklusprofil bearbeiten`
- der Link/Button oeffnet die bereits vorhandene Seite `/neu/zyklusprofil`

Die Karte soll optisch zum bestehenden Einstellungsbereich passen: hell, ruhig, gut lesbar und auf Mobilgeraeten ohne horizontalen Ueberlauf.

## Grenzen

- Keine neue Berechnung, Vorhersage oder Gesundheitslogik.
- Keine neue Tabelle, Migration, API-Route oder Speicherung.
- Keine Eingabe von Periode, PMS oder Symptomen direkt in den Einstellungen.
- Das bestehende Zyklusprofil bleibt die einzige Bearbeitungsstelle.
- Partneransicht, Partnerfreigaben, Kalender, Zyklus-Kreis, Navigation und Konto-Bereich bleiben unveraendert.
- Zyklusdaten werden nicht zusaetzlich mit dem Partner geteilt.

## Technische Leitplanken

- Vorhandene Profil-Daten und den bestehenden Zyklusprofil-Weg wiederverwenden; keine parallele Datenquelle schaffen.
- Die bestehende Zugriffs- und Eigentumspruefung der Einstellungsseite beibehalten.
- Wenn die Seite die existierende Zykluslaenge nicht ohne neue Datenabfrage erhaelt, darf nur der neutrale Einrichtungszustand mit dem Bearbeitungslink erscheinen; keine neue Datenabfrage nur fuer diese Karte einfuehren.
- Bestehende Bereiche und Texte in `/neu/einstellungen` nicht umordnen, ausser dass **Mein Zyklus** davor eingefuegt wird.

## Abnahme

1. Owner oeffnet `/neu/einstellungen` auf Mobil und Desktop: **Mein Zyklus** ist vor **Partnerverbindung** sichtbar und gut lesbar.
2. Die Karte zeigt entweder die vorhandene uebliche Zykluslaenge oder klar, dass das Profil noch eingerichtet werden kann.
3. `Zyklusprofil bearbeiten` fuehrt zu `/neu/zyklusprofil`.
4. Bestehende Profilwerte bleiben unveraendert; das Bearbeiten erfolgt weiterhin ausschliesslich auf der Profilseite.
5. Kein horizontaler Ueberlauf, keine Partner-Eingabe und keine sichtbare Aenderung am Kalender oder Zyklus-Kreis.
6. Gezielte Tests sowie Typecheck und Build bestehen.

## Claude-Abschlussmeldung

Nenne geaenderte Dateien, Commit, ausgefuehrte Pruefungen, sichtbare Owner-Pruefung und ausdruecklich jede Abweichung von diesem Paket. Nicht deployen.

## Owner-Ansicht – einfach erklärt

Als eingeloggte Owner-Person finde ich in den Einstellungen vor der Partnerverbindung die ruhige Karte **Mein Zyklus**. Sie erklaert kurz den Zweck der Angaben und fuehrt mich zum bestehenden Zyklusprofil. Als Partner-Person sehe ich dadurch keine neue Eingabe und keine zusaetzlichen Gesundheitsdaten.

## Entstehungsweg

Der Owner moechte die Einstellungen gezielt ausbauen. Der Kalender und die Zyklusdarstellung sind bereits vorhanden; gesucht war nur ein klarer Einstieg zu den vorhandenen Zyklusgrunddaten. Am 12.11.2026 hat der Owner den vorgeschlagenen kleinen Umfang zur Umsetzung freigegeben.

## Soll – von Codex

Die Einstellungsseite soll eine Karte **Mein Zyklus** vor **Partnerverbindung** zeigen. Sie enthaelt den Satz `Diese Angaben helfen bei der Schätzung.`, einen neutralen Hinweis, solange die Zykluslaenge auf dieser Seite nicht aus vorhandenen Daten verfuegbar ist, sowie den Link `Zyklusprofil bearbeiten` nach `/neu/zyklusprofil`. Es gelten die Grenzen und Abnahmekriterien dieses Pakets.

## Technischer Auftrag für Claude

Ergaenze nur die Owner-Einstellungsseite und ein gezieltes Pruefskript. Verwende die bestehende Profilroute und vorhandene Seitendaten. Lege keine neue Datenabfrage, Datenbankstruktur, API, Berechnung oder Partnerfreigabe an. Fuehre mindestens die gezielte Pruefung, den bestehenden Einstellungscheck, Typecheck und Build aus. Nicht deployen.

## Ist – von Claude

Claude hat die Karte in `src/app/neu/einstellungen/page.tsx` vor **Partnerverbindung** umgesetzt. Sie zeigt `Mein Zyklus`, `Diese Angaben helfen bei der Schätzung.`, den neutralen Einrichtungszustand `Hier prüfst oder ergänzt du deine Zyklusangaben.` und den Link `Zyklusprofil bearbeiten` nach `/neu/zyklusprofil`.

Neu ist `scripts/verify-settings-my-cycle-wp031.ts`. Die gezielte Pruefung, der bestehende WP-027-Einstellungscheck, `tsc --noEmit` und `npm run build` sind laut Claude erfolgreich. Eine Browser-Sichtpruefung und ein Commit stehen noch aus. Es wurde nichts deployt.

## Soll-Ist-Prüfung – von Codex

- Karte vor **Partnerverbindung**: erfuellt.
- Text und Link zum bestehenden Zyklusprofil: erfuellt.
- Keine neue Datenabfrage, Datenbank, API, Berechnung oder Partneraenderung: erfuellt laut Claude.
- Anzeige der ueblichen Zykluslaenge: bewusst nicht umgesetzt, weil die Einstellungsseite sie ohne neue Abfrage nicht besitzt und dieses Paket eine solche Abfrage ausschliesst. Stattdessen zeigt die Karte den vereinbarten neutralen Zustand.
- Sichtpruefung durch den Owner, Paketvalidierung, Commit und Push: offen.

### Ergänzung von Claude

- `/neu/einstellungen` zeigt vor **Partnerverbindung** den Bereich **Mein Zyklus**: Karte mit `Diese Angaben helfen bei der Schätzung.`, kurzem neutralem Zusatztext und dem Button `Zyklusprofil bearbeiten` (Link auf `/neu/zyklusprofil`).
- Geänderte Dateien: `src/app/neu/einstellungen/page.tsx`, `scripts/verify-settings-my-cycle-wp031.ts` (neu).
- **Abweichung / Einordnung:** Die Session der Einstellungsseite enthält keine Zykluslänge. Gemäß Leitplanke wurde keine neue Datenabfrage eingeführt; es erscheint immer der neutrale Zustand mit Bearbeitungslink, keine Zykluslänge wird angezeigt. Soll die Länge sichtbar sein, braucht es ein eigenes Folgepaket mit Freigabe für die Abfrage (`getNewCycleProfile`).
- Das Paket enthält keinen Abschnitt „Technischer Auftrag für Claude" und kein Feld `technical_brief`; umgesetzt wurde nach dem ausdrücklichen Owner-Auftrag und den „Technischen Leitplanken".
- Prüfungen: neues Prüfskript besteht, `verify-settings-partner-info-wp027.ts` besteht, `tsc --noEmit` und `npm run build` bestehen. Keine Sichtprüfung mit Browser (Minimal-Test-Vorgabe); Karte nutzt nur vorhandene Klassen ohne feste Breiten. Nicht deployed.
