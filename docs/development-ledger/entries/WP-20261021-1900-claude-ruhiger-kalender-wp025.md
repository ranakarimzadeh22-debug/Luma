---
id: WP-20261021-1900-claude-ruhiger-kalender-wp025
date: 2026-10-21
time: 19:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Ruhiger Kalender mit Erklärung im Info-Popover (WP-025)

## Was wurde gemacht?

Im Kalender der Nutzerin und im Kalender des Partners stehen in den Tagen nur noch die Zahl, das Farbband und der rote Heute-Punkt. Die kleinen Buchstaben (zum Beispiel „P“, „Gsch.“, „M·Du“, „E“) und der kleine lila Punkt sind weg, ebenso der Hinweis „Vorhersage unsicher“ unter dem Kalender. Alles wird jetzt im ⓘ-Fenster erklärt, getrennt nach „Eingetragen“ und „Geschätzt“. Jede Schätzung trägt dort „Kann abweichen“. Für Screenreader bleiben alle Angaben in der Tagesbeschreibung erhalten.

## Warum?

Der Owner wollte den Kalender ruhiger haben, weil Buchstaben, Punkte und Farbbänder gleichzeitig überladen wirkten. Das steht im freigegebenen Arbeitspaket WP-025.

## Prüfung und Stand

Neues Skript `verify-calendar-quiet-wp025` besteht. Überholte Prüfungen zu Legende und Unsicherheitszeile wurden angepasst. TypeScript und Build bestehen. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px für Nutzerin und Partner: nur Zahlen in den Tagen, Popover öffnet und schließt, kein Überlauf. Mehrere andere Prüfskripte waren schon vorher fehlerhaft (Umbauten WP-023/024) und sind unverändert. Nicht deployed.

## Offene Punkte

- Vorbestehende Prüfskript-Fehler sollten separat an den neuen Home-Aufbau angepasst werden.

## Nächster Schritt

Owner prüft den Kalender und das ⓘ nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-calendar-quiet-wp025.ts` und vier angepasste Prüfskripte
- Tests: siehe oben
- Commit oder Referenz: pending
