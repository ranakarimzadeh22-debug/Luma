---
id: WP-20260902-1843-codex-home-fidelity
date: 2026-09-02
time: 18:43
agent: Codex
status: completed
screens: Neue Luma Home
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-008
commits: pending
---

# Neuer Home-Screen visuell an Referenz angeglichen

## Was wurde gemacht?

Der neue Home-Screen nutzt auf Mobilgeräten jetzt die ganze Fläche mit einem warmen Hintergrund statt einer weißen Karte. Begrüßung und Profilhinweis sind stärker hervorgehoben. Der große dreigeteilte Zykluskreis besitzt einen eigenen Heute-Marker. Der Kalender ist großzügiger, nutzt dieselben Phasenfarben und unterscheidet Periode, PMS und Eisprung zusätzlich mit Buchstaben. Zwei sichtbare Hinweise erklären, dass alles nur ein Beispiel und keine Vorhersage ist.

## Warum?

Der Owner hat bestätigt, dass die bisherige Kartenansicht deutlich von der gemeinsam erstellten mobilen Referenz abwich und visuell angeglichen werden soll.

## Prüfung und Stand

Screenshots bei 360×800 und 390×846 wurden gegen die Referenz geprüft. Es gibt keine horizontale Überbreite; bei kleinen Höhen bleibt vertikales Scrollen möglich. Die Geräte-Statusleiste wurde nicht nachgebaut. ESLint, TypeScript, Integration und Produktions-Build bestanden.

## Offene Punkte

- Die Ansicht enthält entsprechend dem Auftrag weiterhin keine persönliche Berechnung, KI, echten Zykluswerte oder Navigation über die dekorativen Pfeile und das Profil.

## Nächster Schritt

Der Owner kann die neue Ansicht lokal auf einem mobilen Bildschirm mit der Referenz vergleichen.

## Technische Nachweise

- Betroffene Dateien: geschützter `/neu`-Home-Screen, responsive SVG-/Kalender-Komponente und zugehörige Integrationserwartung.
- Tests: gezieltes ESLint bestanden; TypeScript bestanden; Integration bestanden; Screenshots 360×800 und 390×846 bestanden; Build bestanden; Ledger-Validierung bestanden.
- Commit oder Referenz: pending
