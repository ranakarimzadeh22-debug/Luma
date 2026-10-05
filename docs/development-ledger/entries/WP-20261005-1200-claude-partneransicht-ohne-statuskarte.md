---
id: WP-20261005-1200-claude-partneransicht-ohne-statuskarte
date: 2026-10-05
time: 12:00
agent: Anthropic Claude
status: completed
screens: Partner | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 10
commits: pending
---

# Partneransicht zeigt direkt den freigegebenen Inhalt statt einer Statuskarte

## Was wurde gemacht?

Ein verbundener Partner sieht auf `/neu/partner` jetzt sofort nur noch die freigegebenen Inhalte: den Zyklus-Kreis bei Kreisfreigabe und den Kalender bei Kalenderfreigabe, bzw. die bestehende neutrale Meldung ohne Kalenderfreigabe. Die große Anzeige „Verbindung aktiv“ sowie die Buttons „Verbindung beenden“ und „Abmelden“ sind aus der verbundenen Partneransicht verschwunden. Der nicht verbundene Code-Eingabeweg bleibt unverändert, inklusive seines eigenen Abmelden-Buttons.

## Warum?

Owner-Auftrag WP-004 Version 10: Der Partner sollte nach einer aktiven Verbindung direkt die erlaubten Inhalte sehen, ohne eine große, nicht benötigte Statuskarte und ohne Schaltflächen, die in der Partneransicht nicht gebraucht werden.

## Prüfung und Stand

Die Seite wurde in zwei getrennte Rückgabepfade aufgeteilt (verbunden/nicht verbunden), damit die Änderung eindeutig auf den verbundenen Zustand begrenzt bleibt. Keine Freigabe- oder Datenableitung wurde verändert. Ein neues gezieltes Quelltext-Prüfskript bestätigt das Fehlen der entfernten Elemente im verbundenen Pfad und ihr unverändertes Vorhandensein im nicht verbundenen Pfad. Bestehende Partner-Regressionsskripte, `npx tsc --noEmit` und `npm run build` sind grün, keine neue Route. Mobile und breite Sichtprüfung mit temporär installiertem Playwright bestätigt alle vier Kombinationen aus Kreis- und Kalenderfreigabe sowie den nicht verbundenen Zustand ohne horizontalen Überlauf.

Dabei aufgefallen, aber außerhalb des Auftragsumfangs nicht repariert: Der entfernte „Verbindung beenden“-Button auf der Partnerseite hätte beim Partner ohnehin nie funktioniert, da die zugrunde liegende Funktion ausschließlich nach der Eigentümerin filtert. Die Eigentümerin kann die Verbindung weiterhin unverändert in ihrem eigenen Einstellungsbereich beenden.

## Offene Punkte

- Owner-Prüfschritt steht aus: verbundene Partneransicht ohne Statustext und ohne die beiden entfernten Buttons prüfen, nicht verbundenen Code-Eingabeweg unverändert prüfen, mobil auf fehlenden horizontalen Überlauf prüfen.
- Die bereits bekannten, vorbestehenden Testdefekte aus früheren Versionen bestehen unverändert fort.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die vereinfachte Partneransicht im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/partner/page.tsx`, `scripts/verify-partner-view-no-status-card.ts` (neu).
- Tests: `npx tsx scripts/verify-partner-view-no-status-card.ts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-partner-notification-preference.mts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit zwei verbundenen Testkonten, mobil und breit, alle vier Freigabe-Kombinationen.
- Commit oder Referenz: pending
