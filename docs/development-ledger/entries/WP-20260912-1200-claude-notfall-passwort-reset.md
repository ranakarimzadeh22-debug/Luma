---
id: WP-20260912-1200-claude-notfall-passwort-reset
date: 2026-09-12
time: 12:00
agent: Anthropic Claude
status: completed
screens: App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-005 Version 2
commits: pending
---

# Nicht öffentliches Notfall-Skript für Passwort-Reset (neue Luma)

## Was wurde gemacht?

Es gibt jetzt ein nicht öffentliches Skript, mit dem im geschützten Server-Terminal das Passwort eines bestehenden neuen Luma-Kontos neu gesetzt werden kann, falls jemand ihr Passwort vergisst. Man gibt im Terminal die eigene E-Mail-Adresse ein, bestätigt sie noch einmal, und tippt dann zweimal ein neues Passwort ein – das Passwort wird dabei nie auf dem Bildschirm angezeigt. Danach gilt sofort das neue Passwort, und alle bisherigen Anmeldungen auf anderen Geräten werden automatisch beendet. Das Skript ist keine Webseite und für normale Nutzerinnen nicht erreichbar.

## Warum?

Owner-Auftrag WP-005 Version 2: Der eigentliche öffentliche Passwort-Reset per E-Mail (Version 1) bleibt pausiert, bis ein sicherer E-Mail-Absender gewählt ist. Für die aktuelle Notlage wird stattdessen ein rein technischer, nicht öffentlicher Notweg bereitgestellt.

## Prüfung und Stand

Neue `scripts/verify-reset-new-luma-password.mts` (18 Prüfungen) gegen die lokale Testdatenbank: unbekannte E-Mail, abweichende Bestätigung und zu kurzes Passwort ändern nachweislich nichts; ein gültiger Reset ändert den Passwort-Hash korrekt (gleicher bcrypt-Kostenfaktor wie die bestehende Registrierung) und löscht nachweislich alle Sitzungen des Kontos; ein zweiter Reset danach funktioniert unabhängig erneut. Zusätzlich end-to-end gegen die echte, unveränderte Anmeldefunktion geprüft: altes Passwort funktioniert nach dem Reset nicht mehr, neues Passwort funktioniert. Neue `scripts/verify-reset-script-safety.mts` (12 Prüfungen) weist quelltextlich nach, dass kein Passwort als Kommandozeilen-Argument oder Umgebungsvariable ankommt, keine Geheimnisse geloggt werden, die maskierte Eingabe ohne echtes Terminal sicher abbricht, und dass keine Datei der App das Skript verlinkt. Bestehende Auth-/Partner-/Perioden-Regressionen erneut grün, `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich ohne neue öffentliche Route. Alle Testkonten nach der Prüfung gelöscht.

## Offene Punkte

- Die echte maskierte Tastatureingabe konnte in der automatisierten Werkzeugumgebung dieser Sitzung nicht selbst vorgeführt werden, da dort kein echtes Terminal (TTY) zur Verfügung steht; das Skript erkennt diesen Fall und bricht dann kontrolliert ab, statt das Passwort sichtbar einzulesen. Die Ownerin sollte den Ablauf einmal im eigenen echten Terminal mit einem harmlosen Testkonto durchspielen.
- Der öffentliche E-Mail-Reset (Version 1) bleibt weiterhin pausiert.
- Kein Produktions-Reset und kein Deploy ausgeführt – wie beauftragt.

## Nächster Schritt

Owner testet das Skript einmal im eigenen Server-Terminal mit einem harmlosen Testkonto, um die sichtbare Maskierung der Passwort-Eingabe selbst zu bestätigen.

## Technische Nachweise

- Betroffene Dateien: `scripts/reset-new-luma-password.mjs` (neu), `scripts/verify-reset-new-luma-password.mts` (neu), `scripts/verify-reset-script-safety.mts` (neu), `docs/work-packages/WP-005-passwort-zuruecksetzen.md`.
- Tests: `npx tsx scripts/verify-reset-new-luma-password.mts`, `npx tsx scripts/verify-reset-script-safety.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-my-periods.mts`, `node scripts/verify-luma-core.mjs`, `npx tsc --noEmit`, `npm run build`, temporäre end-to-end-Prüfung gegen die echte Login-Funktion (Skript nach dem Lauf entfernt).
- Commit oder Referenz: pending
