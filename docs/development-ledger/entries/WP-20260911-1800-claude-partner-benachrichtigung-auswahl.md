---
id: WP-20260911-1800-claude-partner-benachrichtigung-auswahl
date: 2026-09-11
time: 18:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-004 Version 5
commits: pending
---

# Einfache Ja/Nein-Auswahl statt echter Push-Aktivierung im Partnerbereich

## Was wurde gemacht?

Die im vorigen Paket gebaute echte Push-Aktivierung wurde bewusst wieder zurückgenommen. Der verbundene Partner sieht jetzt nur noch die einfache Frage `Möchtest du Benachrichtigungen erhalten?` mit den Antworten `Ja, Benachrichtigungen aktivieren` oder `Nein, später`. Beide Antworten speichern nur eine dauerhafte Auswahl beim Partnerkonto – es wird keine Geräteberechtigung angefragt und keine Nachricht verschickt. Nach der Auswahl zeigt Luma nur noch `Deine Auswahl wurde gespeichert.`; die Frage kommt nach Neuladen oder erneutem Anmelden nicht wieder. Der komplette echte Versandweg aus der vorigen Version (Geräteberechtigung, Push-Anmeldung, Testnachricht, automatischer Versand bei Periodenstart/-ende) wurde entfernt.

## Warum?

Owner-Auftrag WP-004 Version 5: Die erste Einstellung soll leicht verständlich sein; die echte technische Push-Funktion wird erst später separat entschieden und getestet.

## Prüfung und Stand

Neue `scripts/verify-partner-notification-preference.mts` (12 Prüfungen) bestanden: Speichern ohne aktive Verbindung wird abgelehnt, verbundener Partner ohne Auswahl liefert leer, beide Antworten speichern den richtigen Wert, erneutes Speichern überschreibt statt zu verdoppeln, die Auswahl bleibt über einen erneuten Lesevorgang erhalten, ein anderes Partnerkonto hat eine eigene unabhängige Auswahl, die Tabelle enthält ausschließlich Kontobindung, Auswahl und Zeitstempel. Neue `scripts/verify-no-real-push.mts` (16 Prüfungen) weist quelltextlich nach, dass weder die neue Komponente noch die neue Route `Notification.requestPermission`, `PushManager`, `serviceWorker` oder die alten Push-Routen referenzieren und dass beide Periodenrouten keinen Partner-Push mehr auslösen. End-to-end über einen echten lokalen Dev-Server mit echten HTTP-Anfragen und Sitzungscookies geprüft: Registrierung, Verbindungscode, Frage vor der Auswahl, Speichern, danach nur noch die Bestätigung ohne erneute Frage; fehlende Sitzung, falsche Herkunft und ein falsches (nicht partnerverbundenes) Konto werden korrekt abgelehnt. Bestehende Partner- und Periodenprüfungen erneut grün. `scripts/verify-luma-core.mjs` auf die neue Tabellenanzahl angepasst und erneut grün. `npx tsc --noEmit` fehlerfrei, `npm run build` erfolgreich; die Routenliste im Build bestätigt, dass die alten Push-Routen nicht mehr existieren.

## Offene Punkte

- Owner-Prüfschritt steht aus, insbesondere die Sichtprüfung im Browser.
- Die bereits migrierten Push-Tabellen und die `web-push`-Abhängigkeit aus der vorigen Version bleiben wie beauftragt als ungenutzte Altstruktur bestehen.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner prüft im Browser, dass die Frage nach dem Verbindungscode erscheint, die Auswahl sichtbar gespeichert wird und keine Geräteberechtigung angefragt wird.

## Technische Nachweise

- Betroffene Dateien (Auswahl): `database/luma-core/migrations/202609111800_partner_notification_preference.sql`, `src/lib/new-partner-notification-preference.ts`, `src/app/api/neu/partner/notification-preference/route.ts`, `src/components/NewPartnerNotificationPreference.tsx`, `src/app/neu/partner/page.tsx`, `src/app/api/neu/periods/route.ts`, `src/app/api/neu/periods/[id]/route.ts`, `scripts/verify-luma-core.mjs`. Gelöscht: `src/components/NewPartnerPushActivation.tsx`, `src/lib/new-partner-push.ts`, `src/lib/berlin-date.ts`, `src/app/api/neu/partner/push-subscription/route.ts`, `src/app/api/neu/partner/push-test/route.ts`, `scripts/verify-partner-push.mts`, `scripts/verify-partner-push-triggers.ts`.
- Tests: `npx tsx scripts/verify-partner-notification-preference.mts`, `npx tsx scripts/verify-no-real-push.mts`, `npx tsx scripts/verify-partner-new.mts`, `npx tsx scripts/verify-partner-old.mts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-my-periods.mts`, `node scripts/verify-luma-core.mjs`, `npx tsc --noEmit`, `npm run build`, end-to-end mit echtem lokalem Dev-Server und echten HTTP-Anfragen (Testkonten danach gelöscht).
- Commit oder Referenz: pending
