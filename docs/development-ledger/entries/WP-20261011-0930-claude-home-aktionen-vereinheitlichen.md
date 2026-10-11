---
id: WP-20261011-0930-claude-home-aktionen-vereinheitlichen
date: 2026-10-11
time: 09:30
agent: Anthropic Claude
status: completed
screens: Zyklus
why_status: confirmed
why_source: Owner-Auftrag
commits: dab2f07
---

# Home-Aktionen ruhig vereinheitlichen (WP-010)

## Was wurde gemacht?

Auf der eigenen Startseite `/neu` sind die beiden kleineren Hilfsaktionen „Zykluslänge ergänzen“ und „Erklärungen zum Kalender anzeigen“ jetzt optisch exakt gleich gestaltet (gleiche Schriftgröße, Rahmen, Hintergrund und Abstand), da sie bisher eine kleine Abweichung in der Schriftgröße hatten. Die Hauptaktion „Meine Periode aktualisieren“ war bereits klar als Hauptaktion erkennbar und wurde nicht verändert. Texte, Klicks, Sichtbarkeitsbedingungen und alle übrigen Bereiche der Startseite sind unverändert.

## Warum?

Der Owner-Auftrag WP-010 bestätigt: Die vorhandene App soll vor weiteren neuen Funktionen ruhig, sauber und einheitlich wirken. Die bestehenden Home-Aktionen sollten als einfache, zusammenpassende Bedienung erscheinen, ohne neue Bereiche oder Funktionen zu schaffen.

## Prüfung und Stand

- `npx tsc --noEmit` — fehlerfrei.
- `npx tsx scripts/verify-home-actions-consistent.ts` (neu) — gezielte Prüfung, dass alle drei Aktionen ihre bisherigen Klicks, Sichtbarkeitsbedingungen und Texte behalten, dass die Hauptaktion visuell primär bleibt, dass beide Hilfsaktionen jetzt dieselbe Darstellungsklasse teilen und dass die Zyklus-/Kalender-sections weiterhin rahmenlos sind. Alle Prüfungen bestanden.
- Bestehende Regressionen (Kalendererklärungen, Tagesfenster, Periodenhistorie, Home-Screen-Layout, Start-Hilfe) erneut ausgeführt und grün.
- `npm run build` — erfolgreich, Routenliste unverändert.
- Live-Prüfung mit temporär installiertem Playwright gegen einen echten lokalen Dev-Server auf 375 px und 1280 px Breite: Hauptaktion visuell primär, Hilfsaktionen computed-style-identisch, Erklärungen/Monatsnavigation/Historie/Hauptaktion funktionieren unverändert, kein horizontaler Überlauf. Testkonten und temporäre Werkzeuge wurden danach vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-010, Abschnitt „ein Prüfschritt für den Owner“).

## Nächster Schritt

Owner prüft `/neu` und bestätigt Hauptaktion, Hilfsaktionen und Regressionen. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-home-actions-consistent.ts` (neu), `docs/work-packages/WP-010-home-aktionen-vereinheitlichen.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npx tsx scripts/verify-home-actions-consistent.ts`, bestehende Regressionsskripte, `npm run build`, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: dab2f07.
