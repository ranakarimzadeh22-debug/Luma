---
id: WP-004
title: "Sichere Partnerverbindung mit persönlichem Code"
package_revision: 5
status: review
created: 2026-09-10
updated: 2026-09-11
owner_approved: yes
executor: claude
product_area: "Alte und neue Luma – Partnerverbindung"
brief_version: 1
technical_brief: complete
migration_approval: approved_2026-09-10
---

# Aufgabe: Sichere Partnerverbindung mit persönlichem Code

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Eine Person kann im eigenen Bereich einen kurzen Verbindungscode erzeugen. Der Partner meldet sich mit einem eigenen Konto an und gibt diesen Code ein. Danach sind genau diese beiden Konten verbunden.
- **Warum machen wir das?** Der Partner soll nur die später ausdrücklich freigegebenen Informationen sehen, niemals den privaten Bereich der anderen Person.
- **Woher kam die Idee?** Aus `APP-IDEA-014` und den Entscheidungen DEC-106 bis DEC-114.
- **Wo ist es in der App?** Nach der Auswahl `Alte App` oder `Neue App` folgt die Rollenwahl `Für mich selbst` oder `Für meinen Partner / meine Partnerin`. Den Code gibt es später im privaten Profil oder in den Einstellungen.
- **Was gehört ausdrücklich nicht dazu?** Noch kein Partnerkalender, keine Anzeige von Periodendaten, keine Push-Nachricht, keine medizinische Vorhersage und keine Vermischung von alter und neuer Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie kann für ihren eigenen Bereich einen Code erzeugen. Der Partner löst ihn nach der eigenen Anmeldung ein und sieht nur die neutrale Meldung `Verbindung aktiv`.

## Entstehungsweg

`Private Zyklusdaten sollen nicht offen geteilt werden → klar begrenzte Verbindung zwischen zwei eigenen Konten → einmaliger, kurzer und sicher gespeicherter Code → WP-004`

- Ausgangsidee oder Problem: Ein früherer Link-Weg war nur eine Grundidee; eine sichere und eindeutige Partnerverbindung fehlte.
- bestätigte Wirkung: Genau ein Partnerkonto erhält nur nach ausdrücklicher Verbindung Zugriff auf einen späteren begrenzten Partnerbereich. Die Person mit den Zyklusdaten kann die Verbindung bewusst beenden.
- gewählte Lösung: Ein weltweit eindeutiger Code gilt zehn Minuten und kann genau einmal eingelöst werden. Eine aktive Verbindung gehört genau einem Paar.
- wichtige Entscheidung(en): DEC-106 bis DEC-114.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

## Soll – von Codex

- Nach `Alte App` und nach `Neue App` erscheint dieselbe einfache Rollenwahl: `Für mich selbst` oder `Für meinen Partner / meine Partnerin`.
- Die Rollenwahl ist geschlechtsneutral. Sie entscheidet nur über den folgenden Weg, nicht über persönliche Eigenschaften.
- Der Selbst-Weg führt wie bisher zum jeweiligen privaten Login und Bereich.
- Der Partner-Weg verlangt ein eigenes Konto. Erst danach kann ein Verbindungscode eingegeben werden.
- Eine Person im Selbst-Weg kann im jeweiligen eigenen Profil oder Einstellungsbereich einen Verbindungscode erzeugen und bewusst erneuern.
- Ein Code ist weltweit eindeutig, nur zehn Minuten gültig und nach der ersten erfolgreichen Einlösung dauerhaft ungültig.
- Eine erfolgreiche Einlösung verbindet genau das eigene Partnerkonto mit genau einem privaten Bereich derselben App-Variante.
- Pro privatem Bereich gibt es höchstens eine aktive Partnerverbindung. Eine neue Verbindung ist erst nach einem bewussten Beenden der bestehenden Verbindung möglich.
- Nach einer aktiven Verbindung zeigt der Partner-Weg nur eine neutrale, eingeschränkte Ansicht `Verbindung aktiv`. Sie enthält noch keine Zyklus- oder Kalenderdaten.
- Nach dem Beenden einer Verbindung ist der bisherige Partner sofort nicht mehr berechtigt und sieht keinen Partnerbereich mehr.

### Nicht enthalten

- Partnerkalender und jede Anzeige echter Periodenstarts oder -enden.
- Push-Benachrichtigungen, Geräteberechtigung oder E-Mail-Erinnerungen.
- Vorhersagen, PMS, Eisprung, Zykluslänge, Historie, Profilangaben oder Bearbeitungsrechte für Partner.
- Verbindung zwischen alter und neuer App, Kopieren von Daten oder gemeinsamer Datenbankzugriff.

### Abnahmekriterien

1. Die Rollenwahl ist nach beiden App-Varianten sichtbar und verständlich.
2. Ein Partner kann ohne eigenes Konto und ohne gültigen Code keinen Partnerbereich öffnen.
3. Ein Code funktioniert genau einmal innerhalb von zehn Minuten; abgelaufene, verbrauchte, falsche oder eigene Codes verbinden nichts.
4. Ein Paar bleibt strikt von allen anderen Paaren getrennt.
5. Eine bestehende Verbindung muss bewusst beendet werden, bevor ein neuer Partner verbunden werden kann.
6. Nach dem Beenden verliert das alte Partnerkonto beim nächsten Zugriff sofort den Zugriff.
7. Die Partneransicht zeigt in diesem Paket keine Gesundheits- oder Zyklusdaten.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt die benötigten Sicherheitsgrenzen und Startpunkte. Er schreibt keine unnötige interne Umsetzungsschrittfolge vor.

### Bestätigte Ausgangslage im Code

- `src/app/page.tsx` zeigt derzeit die Auswahl `Alte App` (`/login`) und `Neue App` (`/neu`).
- Der neue Weg besitzt eigene E-Mail/Passwort-Authentifizierung unter `src/app/api/neu/auth/` und serverseitige Sitzungen in `src/lib/new-auth.ts`.
- `database/luma-core/migrations/202608261700_new_auth.sql` sowie spätere Migrationen definieren die getrennten neuen Tabellen, insbesondere `new_users` und `new_sessions`.
- `src/components/AppProviders.tsx` trennt `/neu` bereits von den alten Auth-Providern. Alte Luma nutzt ihren bestehenden, getrennten Auth- und Datenweg.
- Für die neue App existiert noch kein eigener Profil-/Einstellungsweg und keine Partnerverbindungslogik. Claude muss für die alte Luma den passenden bestehenden Auth- und Datenstartpunkt vor einer Änderung lesend bestimmen.

### Technisches Ziel

- Ergänze nach der App-Auswahl in beiden Varianten eine klare Rollenroute oder gleichwertige Navigation. Sie darf nicht die bestehende Anmeldung umgehen.
- Baue den sicheren Verbindungskern für alte und neue Luma **getrennt**: Ein Code und eine Verbindung gelten nur für dieselbe App-Variante und deren eigene Datenbasis.
- Codes werden kryptografisch zufällig erzeugt, nur gehasht gespeichert und niemals im Klartext geloggt oder später aus der Datenbank abgelesen.
- Das Erzeugen, Einlösen, Erneuern und Beenden erfolgt ausschließlich serverseitig, sitzungsgebunden, mit Herkunftsprüfung sowie Rate-Limit gegen wiederholtes Raten.
- Das Einlösen muss atomar sein: Ablauf, Einmaligkeit, Eigentümer, App-Variante und bereits vorhandene aktive Verbindungen sind gemeinsam zu prüfen. Zwei parallele Einlösungen dürfen nie denselben Code oder Bereich doppelt verbinden.
- Ein Partner darf den eigenen Code nicht einlösen. Eine aktive Verbindung darf nur die dafür bestimmte eingeschränkte Partnerroute öffnen.
- Die anfängliche Partnerroute ist ein geschützter Platzhalter ohne Gesundheitsdaten. Sie muss bei fehlender, widerrufener oder fremder Verbindung schließen oder zu einem neutralen, nicht verräterischen Hinweis führen.
- Der Code wird im klar bezeichneten eigenen Profil-/Einstellungsbereich gezeigt. Falls ein solcher Weg fehlt, darf Claude eine minimale geschützte Einstellung nur für Code erzeugen; keine allgemeine Profilfunktion erweitern.

### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, getrennt für die Datenbasis der neuen und der alten Luma. Der Owner hat diese Migration am 10. September 2026 ausdrücklich freigegeben.
- **Neue Luma (`luma_core`):** Ergänze getrennte, kontogebundene Daten für kurzlebige Code-Ausgaben und aktive Partnerverbindungen. Die Verbindung braucht mindestens Eigentümerkonto, Partnerkonto, App-Variante, aktiven/beendeten Zustand sowie sichere Zeitstempel. Datenbank-Constraints und eindeutige Indizes müssen eine doppelte aktive Zuordnung verhindern.
- **Alte Luma:** Erst den vorhandenen Auth- und Migrationsweg lesend feststellen. Dann ein gleichwertiges, aber von `luma_core` getrenntes Modell ergänzen. Niemals neue Luma-Konten oder Daten in die alte Datenbasis schreiben oder umgekehrt.
- **API-Wirkung:** geschützte Endpunkte für Code erzeugen/erneuern, einlösen, Verbindungsstatus lesen und Verbindung beenden. Keine Perioden-, Zyklus- oder Profil-API darf in diesem Paket für Partner geöffnet werden.

### Invarianten – müssen unverändert bleiben

- Bestehende Nutzerkonten, Sitzungen, Passwörter, Perioden und Zyklusdaten werden nicht umgeschrieben oder kopiert.
- Alte und neue Luma bleiben auth-, routen- und datengetrennt.
- Ohne aktive Verbindung gibt es keinen Partnerzugriff. Eine Verbindung gibt nie Zugang zum privaten Owner-Bereich.
- Ein Partner kann keine Daten bearbeiten und sieht in WP-004 keine Gesundheitsdaten.
- Keine Klartextcodes in Datenbank, Logs, Entwicklungsledger, Tests, Screenshots oder Fehlermeldungen.
- Kein Push und keine Benachrichtigung in diesem Paket.

### Pflichtprüfungen

- Code-Lebenszyklus: erzeugen, innerhalb von zehn Minuten genau einmal einlösen; danach erneuter Versuch ablehnen.
- Abgelaufenen, falschen, fremden und eigenen Code ablehnen, ohne Details über fremde Konten preiszugeben.
- Parallele Einlöseversuche testen: höchstens eine Verbindung entsteht.
- Eindeutigkeit und Kontotrennung für mindestens zwei verschiedene Paare prüfen.
- Bestehende aktive Verbindung blockiert eine zweite Verbindung, bis die Owner-Person sie bewusst beendet.
- Nach dem Beenden blockiert die Partnerroute sofort; ein neuer Code kann erst danach eine neue Verbindung herstellen.
- Rollenwahl, Registrierung/Anmeldung, Partner-Placeholder und Widerruf auf Mobile prüfen; kein horizontaler Überlauf.
- Bestehende alte und neue Auth-Regressionen, TypeScript, gezielte Sicherheitsprüfung, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe, wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt. Dokumentiere den Befund, statt Daten zwischen den Wegen zu vermischen.
- Stoppe vor Kalenderfreigabe, Periodendaten, Push, Prognosen, Berechtigungs-Ausweitung oder einer zweiten aktiven Partnerverbindung.
- Stoppe, wenn klare Abmeldung, Widerruf oder atomare Einlösung nicht sicher nachweisbar sind.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-004` sowie `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und pushen. Ein Deploy bleibt eine getrennte Freigabe.

## Ist – von Claude

- umgesetzt:
  - **Datenmodell, getrennt pro App-Variante:**
    - `luma_core`: neue Migration `202609101200_partner_connections.sql` – `new_partner_connection_codes` (gehashter Code, `expires_at`, `consumed_at`) und `new_partner_connections` (`owner_user_id`, `partner_user_id`, `status`, partieller eindeutiger Index `WHERE status = 'active'` auf `owner_user_id`, CHECK gegen Selbstverbindung).
    - `app_luma` (Prisma): drei neue Migrationen – `partner_connections` (gleichwertiges Modell inkl. partiellem eindeutigen Index und CHECKs, per Hand in der generierten SQL-Datei ergänzt, da Prisma partielle Indizes/CHECKs nicht deklarativ erzeugt), `partner_rate_limits` (eigenes Rate-Limit-Modell für die alte App, da dort zuvor keines existierte) und `partner_timestamptz` (Korrektur, siehe Abweichungen). Keine Migration verändert bestehende Spalten von `users`, `profiles`, `user_cycles` oder anderen bestehenden Tabellen – ausschließlich neue Tabellen mit lesenden Fremdschlüsseln auf `users(id)`.
  - **Kernlogik:** `src/lib/new-partner.ts` (neue Luma, raw `pg`) und `src/lib/partner-connections.ts` (alte Luma, Prisma) mit identischer Semantik: `createOrRenewPartnerCode`, `redeemPartnerCode` (atomar: `SELECT ... FOR UPDATE` auf den Code, zwei `pg_advisory_xact_lock`-Sperren auf Owner- und Partner-Konto-ID innerhalb derselben Transaktion, danach Prüfung auf Ablauf/Einmaligkeit/Eigenzuordnung/bereits aktive Verbindung auf beiden Seiten, erst dann `consumed_at` setzen und Verbindung anlegen), `getPartnerConnectionStatusForOwner`/`ForPartner`, `endPartnerConnection`. Codes werden mit `crypto.randomBytes` erzeugt (8 Zeichen, Alphabet ohne verwechselbare Zeichen 0/O/1/I/L), nur als SHA-256-Hash gespeichert, nie im Klartext geloggt oder aus der Datenbank zurückgelesen.
  - **Rate-Limiting und Herkunftsprüfung:** neue Luma nutzt das bestehende `new_auth_rate_limits`/`requestHasAllowedOrigin`-Muster. Alte Luma erhält ein gleichwertiges, getrenntes `src/lib/partner-rate-limit.ts` (eigene Tabelle `partner_rate_limits`) und `src/lib/request-origin.ts` (identische Origin-Prüfung, da die alte App zuvor keine hatte). Beide Seiten: 5 Versuche pro 15 Minuten für Code-Erzeugen und Einlösen.
  - **API-Routen, getrennt pro App-Variante:** `POST/GET .../partner/code`, `.../partner/redeem`, `.../partner/status`, `.../partner/end` unter `/api/neu/partner/*` (neue Luma) und `/api/partner-connections/*` (alte Luma), jeweils sitzungsgebunden über die bestehenden, unveränderten Auth-Wege (`getNewAuthSession` bzw. NextAuth `auth()`). Zusätzlich `POST /api/partner-account/register` (alte Luma) für ein bewusst minimales Partnerkonto (nur E-Mail/Passwort, kein Zyklus-Onboarding, kein `Profile`-Datensatz) – Partner erhalten nie das Datenmodell des Owner-Bereichs.
  - **Rollenwahl und Navigation, getrennt pro App-Variante:** `src/app/rolle/page.tsx` und `src/app/neu/rolle/page.tsx` nach der App-Auswahl (`src/app/page.tsx` verlinkt jetzt auf `/rolle` bzw. `/neu/rolle` statt direkt auf `/login`/`/neu`). „Für mich selbst“ führt unverändert zum bestehenden privaten Login/Registrierung. „Für meinen Partner / meine Partnerin“ führt zu eigenen Partner-Registrierungs-/Login-Seiten (`/partner-registrieren`, `/partner-anmelden`, `/neu/partner-registrieren`, `/neu/partner-anmelden`) und danach zum geschützten Partner-Platzhalter (`/partner-bereich`, `/neu/partner`), der ohne aktive Verbindung die Code-Eingabe zeigt und mit aktiver Verbindung ausschließlich die neutrale Meldung „Verbindung aktiv“ – keine Gesundheits- oder Zyklusdaten. `NewLoginForm`/`NewRegisterForm` erhielten eine optionale `redirectTo`-Prop (Default `/neu`, unverändertes Verhalten für alle bestehenden Aufrufer), damit derselbe Formular-Code für den Partner-Weg zu `/neu/partner` statt `/neu` führt.
  - **Code-Anzeige im eigenen Bereich:** neue Luma erhielt eine minimale, geschützte Einstellungsseite `/neu/einstellungen` (existierte zuvor nicht) mit `NewPartnerCodeCard` (Code erzeugen/erneuern, Verbindung beenden), verlinkt von `/neu`. Die alte Luma nutzt den bestehenden `profile`-Bereich: `PartnerConnectionCard` ersetzt dort das alte Widget.
  - **Ersetzung des alten, unsicheren Partner-Systems (nach Owner-Klärung):** die frühere Route `/partner/[code]` (zeigte Zyklusphase, nächste Periode, Zyklustag und Stimmung offen über einen unauthentifizierten, base64-kodierten URL-Parameter, ganz ohne eigenes Partnerkonto oder Ablauf) sowie `/partner` und `src/components/PartnerCard.tsx` wurden vollständig entfernt. `src/lib/actions/partner.ts` (Server-Action für den alten Klartext-`partnerCode`) wurde gelöscht. `Dashboard.tsx` und `profile/page.tsx` nutzen jetzt `PartnerConnectionCard` statt `PartnerCard`. Das alte, ungenutzte `Profile.partnerCode`-Datenbankfeld (weiterhin bei Registrierung/Onboarding befüllt) wurde bewusst nicht entfernt oder migriert, um den bestehenden Registrierungs-/Onboarding-Code nicht über den Auftragsumfang hinaus anzufassen; es ist nach dieser Änderung nirgends mehr exponiert oder lesbar.
- nicht umgesetzt: Partnerkalender, Periodenanzeige für Partner, Push-Benachrichtigungen, Vorhersagen – wie im Soll ausdrücklich nicht enthalten. Keine Verbindung oder Datenvermischung zwischen alter und neuer Luma.
- Tests:
  - Neue `scripts/verify-partner-new.mts` (20 Prüfungen, raw `pg` gegen `luma_core`) und `scripts/verify-partner-old.mts` (20 Prüfungen, Prisma gegen `app_luma`): Code-Lebenszyklus (erzeugen, einmal einlösen, danach ablehnen), abgelaufener/falscher/eigener Code wird abgelehnt, Kontotrennung für zwei unabhängige Paare, bestehende aktive Verbindung blockiert eine zweite bis zum bewussten Beenden, ein Partnerkonto kann nicht zwei Owner gleichzeitig verbunden sein, **echte parallele Einlöseversuche mit zwei unabhängigen Datenbankverbindungen** (nicht nur `Promise.all` auf einer Verbindung) zeigen, dass von zwei gleichzeitigen Versuchen genau einer gelingt, und dass der gespeicherte Code-Hash nie dem Klartext entspricht. Alle 40 Prüfungen bestanden.
  - `node scripts/verify-luma-core.mjs`: Datenbanktrennung weiterhin bestätigt; der Zähler für neue Auth-Tabellen wurde von 6 auf 8 aktualisiert (zwei neue Partner-Tabellen), Zeilenzahlen um die neuen Tabellen erweitert.
  - Zusätzliche end-to-end-Prüfung per `curl` gegen einen lokalen Produktions-Build (`npm run build && next start`) für die neue Luma: Owner registriert sich, erzeugt Code, ein zweites, unabhängiges Konto meldet sich als Partner an, eigener Code wird abgelehnt (400), korrekter Code wird eingelöst (200), Status stimmt auf beiden Seiten überein, `/neu/partner` zeigt „Verbindung aktiv“, `/neu/einstellungen` zeigt die aktive Verbindung, Beenden funktioniert und der Partner verliert sofort beim nächsten Statusabruf den Zugriff. Alte Route `/partner/ANYCODE` liefert 404. `/neu` ohne Session leitet mit 307 zu `/neu/rolle` um.
  - Sicherheitsgrenzen per `curl` geprüft: alle vier Routen beider App-Varianten liefern ohne Session 401; `code`/`end` liefern bei falscher `Origin` 403; nach 5 Einlöseversuchen liefert die Route 429 (Rate-Limit greift).
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, danach vollständig wieder entfernt): `/rolle`, `/partner-registrieren`, `/partner-anmelden`, `/partner-bereich`, `/neu/rolle`, `/neu/partner-registrieren`, `/neu/partner-anmelden`, `/neu/partner` – kein horizontaler Überlauf, keine Konsolen-/Seitenfehler.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 47 Routen erzeugt (14 neue: Rollenwahl, Partner-Registrierung/-Anmeldung/-Bereich, Einstellungen und die zugehörigen API-Routen beider App-Varianten).
  - Nach jedem Testlauf wurden alle erzeugten Testkonten aus beiden Datenbanken gelöscht; bestehende Datenbestände in `app_luma`/`luma_core` blieben unverändert (Zeilenzahlen bestehender Tabellen vor/nach der Arbeit identisch).
- Abweichungen:
  - **Owner-Rückfrage zum bestehenden, unsicheren Partner-System:** Vor der Umsetzung wurde ein Zielkonflikt festgestellt (siehe Stoppbedingung im Auftrag: „wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt“) und dem Owner zur Klärung vorgelegt, statt eigenmächtig zu entscheiden. Entscheidung: das alte System wird vollständig ersetzt, nicht parallel weitergeführt. So umgesetzt.
  - **Gefundener und behobener Fehler – Zeitzonen-Diskrepanz bei `@prisma/adapter-pg`:** Die lokale Postgres-Session-Zeitzone ist `Europe/Berlin`. Bei Verwendung von SQL `NOW()` innerhalb einer Prisma-`$transaction`/`$queryRaw`-Kombination über `@prisma/adapter-pg` wich der zurückgegebene Zeitwert um exakt den Sommerzeit-Offset (2 Stunden) vom tatsächlichen UTC-Zeitpunkt ab, wodurch jeder frisch erzeugte, gültige Code fälschlich als bereits abgelaufen galt (`expires_at > NOW()` schlug immer fehl). Reproduziert und isoliert: derselbe Vergleich über den rohen `pg`-Treiber (ohne Prisma-Adapter, für die neue Luma verwendet) war korrekt; nur die Prisma-Adapter-Kombination zeigte den Fehler. Behoben, indem `redeemPartnerConnectionCode` (alte Luma) den Vergleichszeitpunkt als clientseitig erzeugtes `new Date()` statt als SQL `NOW()` an die Query übergibt – das umgeht die Diskrepanz robust, unabhängig von der Postgres-Session-Zeitzone. Die neue Luma (`src/lib/new-partner.ts`) verwendet weiterhin `NOW()`, da dort der rohe `pg`-Treiber nachweislich korrekt arbeitet (durch `verify-partner-new.mts` bestätigt). Zusätzlich wurden die entsprechenden Prisma-Spalten nachträglich von `TIMESTAMP(3)` (ohne Zeitzone, Prisma-Default) auf `TIMESTAMPTZ` umgestellt (Migration `partner_timestamptz`), da der ursprüngliche Typ das Risiko weiterer stiller Zeitzonenfehler erhöht hätte, auch wenn er allein die beobachtete Diskrepanz nicht verursachte.
  - Keine weitere fachliche Abweichung vom Soll.
- offene Punkte:
  - Owner-Prüfschritt für WP-004 steht aus (Rollenwahl nach beiden App-Varianten, Partner-Registrierung/-Anmeldung, Code erzeugen im jeweiligen Profil-/Einstellungsbereich, Code durch ein zweites, unabhängiges Konto einlösen, „Verbindung aktiv“ sehen, Verbindung bewusst beenden, danach sofortigen Zugriffsverlust prüfen; mobile Sichtprüfung).
  - Der bereits aus WP-003 bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ohne gesonderte Owner-Freigabe – wie beauftragt nicht ausgelöst.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 5 – Auswahl für spätere Benachrichtigungen

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach dem Verbinden sieht der Partner nur eine einfache Frage: `Möchtest du Benachrichtigungen erhalten?`
- **Die zwei Antworten:** `Ja, Benachrichtigungen aktivieren` oder `Nein, später`.
- **Was passiert jetzt wirklich?** Luma speichert nur die Auswahl dauerhaft beim Partnerkonto. Es wird noch keine Gerätefreigabe abgefragt und keine Nachricht versendet.
- **Warum machen wir das?** Die erste Einstellung soll leicht verständlich sein. Die genaue technische Push-Funktion wird erst später separat entschieden und getestet.
- **Was bleibt gleich?** Partnerkalender, Verbindungscode und die privaten Grenzen bleiben unverändert.

### Entstehungsweg

`Partner soll später Hinweise erhalten → vor dem technischen Versand zuerst bewusst entscheiden können → einfache Ja/Nein-Auswahl dauerhaft speichern → WP-004 Version 5`

- Ausgangsidee: Nach Codeeinlösung soll der Partner selbst entscheiden können, ob er später Benachrichtigungen erhalten möchte.
- bestätigte Wirkung: Die Auswahl ist einfach, wird nach dem erneuten Öffnen noch erkannt und löst noch keine echte Nachricht aus.
- gewählte Lösung: Eine kontogebundene Einstellung mit zwei Werten: aktivieren oder später.
- wichtige Entscheidung(en): DEC-115 bis DEC-118.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

### Soll – von Codex

- Nur im bereits verbundenen neuen Partnerbereich erscheint die Frage `Möchtest du Benachrichtigungen erhalten?`.
- Es gibt genau zwei sichtbare Antworten: `Ja, Benachrichtigungen aktivieren` und `Nein, später`.
- Beide Antworten speichern eine eindeutige persönliche Auswahl dauerhaft beim angemeldeten Partnerkonto.
- Nach dem Speichern zeigt Luma nur den einfachen Hinweis `Deine Auswahl wurde gespeichert.` Die Frage erscheint nach einem Neuladen oder erneuten Anmelden nicht wieder.
- Die Auswahl `Ja, Benachrichtigungen aktivieren` bedeutet in dieser Version ausschließlich: Interesse für später gespeichert. Sie fordert **keine** Systemberechtigung an und schickt **keine** Nachricht.

#### Nicht enthalten

- Kein echter Push-Versand, keine Testbenachrichtigung und keine Benachrichtigung bei Periodenstart oder -ende.
- Keine Anfrage an `Notification.requestPermission`, keine `PushManager.subscribe`-Anmeldung, keine VAPID-Schlüssel und keine Dokploy-Änderung.
- Keine neue Anzeige oder Bearbeitung von Gesundheits-, Zyklus- oder Periodendaten.
- Keine Änderung an der alten Luma.

### Abnahmekriterien

1. Ein neuer oder bereits verbundener Partner ohne gespeicherte Auswahl sieht die Frage nach dem Verbindungscode im Partnerbereich.
2. Ein Tipp auf `Ja, Benachrichtigungen aktivieren` oder `Nein, später` speichert genau diese Auswahl und bestätigt sie verständlich.
3. Nach Neuladen und erneutem Anmelden bleibt die Auswahl gespeichert; die Frage wird nicht wiederholt.
4. Die Auswahl löst weder eine Browser-/Geräteberechtigung noch eine Test- oder Periodenbenachrichtigung aus.
5. Ohne aktive eigene Partnerverbindung kann keine Auswahl gelesen oder gespeichert werden.
6. Partnerkalender, Codeeinlösung, Verbindung beenden und Abmeldung funktionieren unverändert.

### Technischer Auftrag für Claude – Version 5

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` rendert im verbundenen Zustand den Partnerkalender und derzeit `NewPartnerPushActivation`.
- `src/components/NewPartnerPushActivation.tsx` fragt derzeit Geräteberechtigung an, speichert eine Push-Subscription und kann eine Testnachricht auslösen. Dieses Verhalten ist für Version 5 ausdrücklich nicht mehr erwünscht.
- `src/lib/new-partner-push.ts`, die Routen `/api/neu/partner/push-subscription` und `/api/neu/partner/push-test` sowie die Einhängepunkte in `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` gehören zur bisherigen echten Push-Logik.
- `luma_core` enthält aus Version 4 bereits Push-Tabellen. Diese bereits migrierten Tabellen dürfen nicht zurückgesetzt oder für die neue Ja/Nein-Auswahl missbraucht werden.
- Die neue Luma verwendet kontogebundene Sitzungen, Herkunftsprüfung und `luma_core`.

#### Technisches Ziel

- Ersetze die bisherige sichtbare Push-Aktivierung im verbundenen neuen Partnerbereich durch eine kleine Client-Komponente oder gleichwertige UI für die bestätigte Ja/Nein-Auswahl.
- Speichere die Auswahl mit einer eigenen minimalen kontogebundenen Einstellung in `luma_core`; nutze dafür weder Browser-Subscriptions noch Push-Endpunkte.
- Ein Partner ohne gespeicherte Auswahl sieht die Frage. Ein Partner mit gespeicherter Auswahl sieht nach dem Laden nur den neutralen gespeicherten Status.
- Deaktiviere den gesamten tatsächlichen Versandweg aus Version 4: Keine Periodenroute darf ein Partner-Push-Ereignis auslösen; die UI darf keine Push-Subscription oder Testnachricht anfordern. Entferne oder sperre nicht mehr benötigte Push-Routen und -Komponenten sicher. Bereits migrierte Push-Tabellen dürfen als ungenutzte Altstruktur bestehen bleiben.
- Keine VAPID-Variablen erzeugen, ändern oder voraussetzen. Keine Produktions-, Dokploy- oder Deployment-Aktion ausführen.

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, ausschließlich `luma_core`, für eine kleine Tabelle oder gleichwertig sichere Speicherung der Partner-Auswahl. Die Ownerin hat die getrennte Datenbankmigration für WP-004 bereits genehmigt.
- Die Einstellung referenziert nur das Partnerkonto, hat eine eindeutige Begrenzung pro Partnerkonto und eine explizit validierte Auswahl. Sie speichert keine Perioden-, Zyklus-, Profil- oder Geräteinformationen.
- Eine geschützte neue-Luma-Route darf die Auswahl nur für die eingeloggte Person mit aktiver eigener Partnerverbindung lesen/speichern. Sie prüft Sitzung und Herkunft und gibt keine fremden Daten aus.
- Die Daten aus der alten Luma und alle bestehenden Push-Tabellen bleiben unberührt.

#### Invarianten – müssen unverändert bleiben

- Die neue Ja/Nein-Auswahl löst niemals eine echte Benachrichtigung oder Geräteberechtigung aus.
- Kein Push-Endpoint, VAPID-Schlüssel, Geräteendpunkt oder Zeitraum wird von der Partnerseite gelesen, erzeugt oder angezeigt.
- Partner sieht weiterhin nur die bisher bestätigte eingeschränkte Kalenderansicht; private Bereiche bleiben geschlossen.
- Verbindungscode, Kontotrennung, Widerruf und Abmeldung bleiben sicher und unverändert.
- Keine Datenübernahme in die alte Luma und keine Dokploy-Aktion.

#### Pflichtprüfungen

- Verbundener Partner ohne Auswahl sieht beide bestätigten Buttons; Auswahl `Ja` und `Nein` speichern jeweils den korrekten Wert.
- Auswahl bleibt über Neuladen, neue Sitzung und erneute Anmeldung erhalten; eine andere Partnerperson kann sie nicht lesen oder überschreiben.
- Ohne aktive Verbindung sowie bei fremder Herkunft wird die Route abgelehnt.
- Prüfe nachweislich, dass kein Klick `Notification.requestPermission`, `PushManager.subscribe`, die alte Subscription-Route oder eine Testnachricht auslöst.
- Prüfe nachweislich, dass die POST-/PUT-Periodenrouten keinen Partner-Push mehr anstoßen.
- Bestehende Partnerkalender-, Verbindungscode-, Perioden- und Auth-Regressionen, TypeScript, Produktions-Build sowie `node scripts/work-package-state.mjs validate` ausführen.
- Entwicklungsledger ergänzen. Testdaten nach den Prüfungen entfernen.

#### Stoppbedingungen

- Stoppe, wenn die dauerhafte Speicherung nicht eindeutig kontogebunden, herkunfts- und sitzungsgeschützt nachweisbar ist.
- Stoppe vor Browser-/Geräteberechtigungen, VAPID-Konfiguration, Testnachrichten, echtem Versand, Dokploy oder einer Änderung der alten Luma.
- Stoppe, wenn das Abschalten der alten Push-Auslösung Partnerkalender oder Periodenspeicherung beeinträchtigt; dokumentiere den Befund statt andere Produktlogik zu verändern.

#### Abschluss durch Claude

- Ergänze `Ist Version 5`, Tests, Abweichungen und offene Punkte sichtbar.
- Lasse den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Keinen manuellen Deploy und keine Produktionskonfiguration ausführen.

### Ist Version 5 – von Claude

- **Umgesetzt:** Der verbundene neue Partnerbereich zeigt jetzt anstelle der echten Push-Aktivierung nur noch die einfache Frage `Möchtest du Benachrichtigungen erhalten?` mit den zwei Buttons `Ja, Benachrichtigungen aktivieren` und `Nein, später` (`src/components/NewPartnerNotificationPreference.tsx`). Beide Antworten speichern die Auswahl über `POST /api/neu/partner/notification-preference` (`src/app/api/neu/partner/notification-preference/route.ts`) kontogebunden in der neuen Tabelle `new_partner_notification_preferences` (`database/luma-core/migrations/202609111800_partner_notification_preference.sql`, angewendet). Nach dem Speichern zeigt die Seite ausschließlich `Deine Auswahl wurde gespeichert.`; ein erneuter Seitenaufruf liest die Auswahl serverseitig (`src/lib/new-partner-notification-preference.ts`) und zeigt die Frage nicht erneut.
- Die Route prüft Herkunft (`requestHasAllowedOrigin`) und Sitzung (`getNewAuthSession`) und lehnt ohne aktive eigene Partnerverbindung mit 403 ab. Die Tabelle hat `partner_user_id` als Primärschlüssel mit Fremdschlüssel auf `new_users` – pro Partnerkonto ist nur eine Zeile möglich, ein fremdes Konto kann sie weder lesen noch überschreiben.
- Der gesamte echte Versandweg aus Version 4 wurde deaktiviert und entfernt: `src/components/NewPartnerPushActivation.tsx`, `src/lib/new-partner-push.ts`, `src/app/api/neu/partner/push-subscription/route.ts`, `src/app/api/neu/partner/push-test/route.ts` sowie das dadurch unbenutzt gewordene `src/lib/berlin-date.ts` wurden gelöscht. Die Auslöse-Blöcke in `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` (Aufruf von `dispatchPartnerPeriodEvent`) wurden entfernt; beide Routen lösen keinen Partner-Push mehr aus.
- Die bereits migrierten Push-Tabellen `new_partner_push_subscriptions` und `new_partner_period_events` (aus Version 4) wurden **nicht** gelöscht oder verändert und bleiben als ungenutzte Altstruktur bestehen, wie im Auftrag ausdrücklich erlaubt. `public/manifest.json`, `public/sw.js` und die Abhängigkeit `web-push` bleiben ebenfalls unverändert bestehen (harmlos, ungenutzt).
- Keine VAPID-Variable wurde erzeugt, geändert oder vorausgesetzt. Kein Dokploy- oder Produktions-Schritt wurde ausgeführt.

**Tests:**
- Neue `scripts/verify-partner-notification-preference.mts` (12 Prüfungen): Speichern ohne aktive Verbindung wird abgelehnt; verbundener Partner ohne Auswahl liefert `null`; `Ja` und `Nein` speichern jeweils den korrekten Wert; erneutes Speichern überschreibt (Update, kein Duplikat); Auswahl bleibt über einen erneuten Lesevorgang erhalten; ein anderes, unabhängiges Partnerkonto hat eine eigene, unbeeinflusste Auswahl; die Tabelle enthält ausschließlich Kontobindung, Auswahl und Zeitstempel – keine Zyklus-/Perioden-/Geräte-/Profildaten. Alle 12 Prüfungen bestanden.
- Neue `scripts/verify-no-real-push.mts` (16 Prüfungen, Quelltext-Nachweis): bestätigt, dass die entfernten Push-Dateien nicht mehr existieren, dass weder die neue Komponente noch die neue Route `Notification.requestPermission`, `PushManager`, `serviceWorker` oder die alten Push-Routen referenzieren, dass beide Periodenrouten `dispatchPartnerPeriodEvent` und das Push-Dispatch-Modul nicht mehr importieren, dass kein VAPID-/web-push-Bezug im neuen Code steckt, und dass die Migration der alten Push-Tabellen nicht entfernt wurde. Alle 16 Prüfungen bestanden.
- End-to-end über echten lokalen Dev-Server (`npm run dev`, Port 3006) mit echten HTTP-Requests und Sitzungscookies: Registrierung, Codeerzeugung, Codeeinlösung, Frage erscheint vor der Auswahl, `Ja` speichert korrekt, Seite zeigt danach nur noch `Deine Auswahl wurde gespeichert.` ohne erneute Frage, Route lehnt fehlende Sitzung (401), falsche Herkunft (403) und ein verbundenes, aber falsches Konto (Owner ohne Partnerrolle, 403) korrekt ab. Testkonten danach aus `luma_core` gelöscht.
- Regressionen erneut grün: `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-my-periods.mts`.
- `scripts/verify-luma-core.mjs` aktualisiert (Tabellenanzahl 10 → 11 wegen `new_partner_notification_preferences`) und erneut grün.
- `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich; die Routenliste bestätigt, dass `push-subscription` und `push-test` nicht mehr existieren und nur noch `notification-preference` vorhanden ist.

**Abweichungen:**
- Die `.env.example`-Dokumentation der VAPID-Variablen aus Version 4 (nur Platzhalter, keine echten Werte) wurde nicht entfernt, da sie reine Dokumentation ohne Funktionswirkung ist und der Auftrag nur das Entfernen des tatsächlichen Versandwegs verlangt.
- `result.previousEntry` im Rückgabetyp von `updateNewPeriodEntry` (`src/lib/new-periods.ts`, aus Version 4) wird von den Periodenrouten nicht mehr gelesen, aber nicht entfernt, da es keine Sicherheits- oder Funktionswirkung hat und der Auftrag keine Bereinigung dieses Felds verlangt.

**Offene Punkte:**
- Owner-Prüfschritt steht aus (Sichtprüfung im Browser: Frage erscheint, Auswahl speichert sichtbar, keine Geräteberechtigung wird angefragt).
- Kein Deploy ausgelöst – wie beauftragt.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: WP-004 ist freigegeben. Die notwendige getrennte Datenbankmigration für alte und neue Luma wurde vom Owner ausdrücklich erlaubt.
- Nachschärfung: keine offene Produktfrage für den Verbindungskern. Partnerkalender und Push sind ausdrücklich spätere, getrennte Arbeitspakete.
- Product-Map aktualisiert: ja.

## Version 3 – Partnerkalender der neuen Luma

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach der Verbindung sieht der Partner in der **Neuen App** einen einfachen Monatskalender.
- **Was sieht der Partner?** Tatsächlich bestätigte Periodentage und, bei einer noch laufenden Periode, klar markierte erwartete Tage bis zum erwarteten Ende.
- **Beispiel:** Beginnt die Periode am 7. September und heute ist der 10. September, sind der 7. bis 10. September als `Bestätigt` sichtbar. Ist der 13. September als erwartetes Ende gespeichert, sind der 11. bis 13. September zusätzlich als `Erwartet – kann abweichen` sichtbar.
- **Was sieht der Partner nicht?** Keine PMS- oder Eisprungphase, keine Zykluslänge, keine Vorhersagen für eine neue Periode, keine Historienliste, keine Profilangaben und keine Bearbeitungsfunktionen.
- **Wer behält die Kontrolle?** Nur die Eigentümerin trägt Perioden ein, ändert oder löscht sie und kann die Verbindung beenden.

### Entstehungsweg

`Verbindung ist aktiv, aber der Partner sieht noch keinen Nutzen → sichere und sehr begrenzte Orientierung nötig → nur lesender Kalender mit klarer Trennung zwischen Tatsache und Erwartung → WP-004 Version 3`

- bestätigtes Problem: Die sichere Partnerverbindung funktioniert, zeigt im Moment aber nur `Verbindung aktiv`.
- gewünschte Wirkung: Der Partner erkennt auf einen Blick, welche Tage einer laufenden oder vergangenen Periode tatsächlich bestätigt und welche Tage nur erwartet sind.
- gewählte Lösung: Ein geschützter, nur lesender Monatskalender ausschließlich im neuen Partnerbereich.
- bestätigte Grenzen: Keine weiteren Zyklus- oder Gesundheitsinformationen; keine Eingabe; die alte Luma bleibt in dieser Version unverändert.
- Quellen/Akten: `APP-IDEA-014`, Owner-Beschreibung vom 10. September 2026.

### Soll – von Codex

- `/neu/partner` ersetzt bei aktiver neuer Partnerverbindung den Platzhalter durch einen Monatskalender.
- Der Kalender enthält nur Daten der Eigentümerin, die genau mit diesem aktiven Partnerkonto verbunden ist.
- Tatsächlich bestätigte Periodentage werden aus echten `startDate`/`endDate`-Werten abgeleitet. Bei einer laufenden Periode gelten die Tage vom tatsächlichen Start bis einschließlich heute als `Bestätigt`.
- Erwartete Tage sind nur bei einer laufenden Periode mit `expectedEndDate` sichtbar: ab morgen bis einschließlich erwartetes Ende. Sie tragen sichtbar `Erwartet` und `Kann abweichen`.
- Erwartete Tage werden nie als bestätigt dargestellt und beeinflussen keine Berechnung, Historie oder Datenbank.
- Der Partner kann Monat wechseln und Tagesinformationen nur lesen. Ein Tagesfenster darf nur Datum und Status `Bestätigt`, `Erwartet – kann abweichen` oder `Keine freigegebene Information` zeigen.
- Ohne aktive Verbindung, nach Widerruf oder bei einem fremden Konto werden keinerlei Periodendaten geliefert oder angezeigt.

### Nicht enthalten

- Partnerkalender in der alten Luma.
- Push-Nachrichten, E-Mails, Geräteberechtigungen, PMS, Eisprung, Zykluslänge, Vorhersage einer neuen Periode, Stimmungen, Profilangaben oder Periodenhistorie.
- Jede Eingabe, Änderung oder Löschung durch den Partner.
- Datenbankmigration oder Änderung von Periodendaten.

### Abnahmekriterien

1. Ein aktiv verbundener Partner der neuen Luma sieht einen einfachen Monatskalender.
2. Eine laufende Periode ab 7. September zeigt am 10. September den 7. bis 10. September als bestätigt.
3. Ein erwartetes Ende am 13. September zeigt nur den 11. bis 13. September als erwartet und abweichbar.
4. Eine abgeschlossene Periode zeigt nur echte, bestätigte Tage und keine erwarteten Tage.
5. Der Partner kann keine Periodendaten speichern, ändern oder löschen.
6. Ein anderer Partner, ein nicht verbundenes Konto und ein Partner nach Widerruf erhalten keine Daten – auch nicht direkt über eine API-Anfrage.
7. Mobile Ansicht bleibt ohne horizontalen Überlauf verständlich und bedienbar.

### Technischer Auftrag für Claude – Version 3

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner` ist der geschützte neue Partnerbereich aus WP-004 und zeigt mit aktiver Verbindung bisher nur den Platzhalter `Verbindung aktiv`.
- `src/lib/new-partner.ts` und die bestehenden `/api/neu/partner/*`-Routen prüfen die neue Sitzung sowie die aktive Verbindung.
- `src/lib/new-periods.ts` und die für `/neu` bereits geladenen `new_period_entries` enthalten nur kontogebundene echte `startDate`, optionales echtes `endDate` und optionales `expectedEndDate`.
- Die Home-Ansicht der neuen Luma besitzt bereits Monats- und Tagesdarstellung. Claude darf passende, reine Anzeige-/Datumslogik wiederverwenden, aber keine Owner-Interaktion oder Vorhersagelogik an den Partner weitergeben.

#### Technisches Ziel

- Ergänze eine serverseitig geschützte, ausschließlich lesende Datenquelle für den neuen Partnerbereich. Sie prüft vor jeder Antwort: neue Sitzung, aktiver Verbindungsstatus, zugehörige Eigentümerin und genau diese App-Variante.
- Gib ausschließlich die minimalen Kalenderdaten zurück, die für bestätigte Tage und erwartete Tage der aktuell verbundenen Eigentümerin erforderlich sind. Keine E-Mail-Adresse, keine Namen, keine IDs, keine vollständige Historie und keine Profil-/Zykluswerte.
- Leite den sichtbaren Tagesstatus ohne Speichern ab: echte abgeschlossene Tage und echte Tage einer laufenden Periode bis heute sind bestätigt; nur die noch kommenden Tage bis `expectedEndDate` sind erwartet.
- Baue eine klare, mobile lesbare Kalenderansicht. Farben oder Symbole müssen zusätzlich mit Text/Legende unterscheidbar sein.
- Tagesdialoge bleiben nur lesend. Sie dürfen keine Aktionen zum Periodenbeginn/-ende, Bearbeiten, Löschen oder Speichern enthalten.
- Die alte Partneransicht und die bestehende Verbindungskernlogik werden nicht umgebaut.

#### Invarianten – müssen unverändert bleiben

- Ohne aktive neue Partnerverbindung keine Antwort mit Periodendaten; nach Widerruf muss der Zugriff sofort scheitern.
- Partnerzugriff ist strikt lesend und nur für die verbundene Eigentümerin gültig.
- Erwartete Enddaten bleiben sichtbar vorläufig und werden nie zu echten Periodendaten oder Vorhersageeingaben.
- Bestehende Owner-Kalender-, Profil-, Verbindungs-, Authentifizierungs- und Datenbanklogik bleiben unverändert.
- Keine Datenbankmigration, keine Datenkopie zwischen alter/neuer Luma und keine Änderung an alten Partnerwegen.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine neue Tabelle und keine Änderung gespeicherter Daten.
- API-Wirkung: nur eine neue oder erweiterte **lesende** neue Partnerroute, falls die vorhandene Statusroute nicht minimal genug ist.
- Migration nötig: nein.

#### Pflichtprüfungen

- Laufende Periode: bestätigte Tage bis heute und erwartete Tage erst ab morgen korrekt getrennt.
- Abgeschlossene Periode: nur echte bestätigte Tage.
- Kein `expectedEndDate`: keine erfundenen erwarteten Tage.
- Kein Zugriff ohne Sitzung, ohne aktive Verbindung, nach Widerruf oder mit einem Partnerkonto eines anderen Paares.
- API-Antwort enthält keine Namen, E-Mail-Adressen, IDs, PMS-, Eisprung-, Profil-, Historien- oder Bearbeitungsdaten.
- Partner-UI bietet keine schreibende Aktion; Tagesinformationen sind lesend.
- Mobile Sichtprüfung, TypeScript, gezielte Sicherheits-/Integrationstests, Produktions-Build und Entwicklungsledger-Validierung.

#### Stoppbedingungen

- Stoppe vor einer Migration, einer neuen Freigabemöglichkeit, Push-Nachricht, Profilweitergabe, Vorhersage oder jeder schreibenden Partneraktion.
- Stoppe, wenn die bestehende Verbindungsprüfung nicht pro Datenabruf sicher nachweisbar ist. Keine Daten auf den Client laden und dort erst filtern.
- Stoppe, wenn erwartete und bestätigte Tage nicht sicher unterscheidbar abgeleitet werden können.

#### Abschluss durch Claude

- Ergänze `Ist Version 3`, Abweichungen und Tests sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe nur auftragsbezogene Dateien. Kein Deploy ohne weitere Owner-Freigabe.

### Ist Version 3 – von Claude

- umgesetzt:
  - Neues, rein lesendes Modul `src/lib/new-partner-calendar.ts` mit `getPartnerCalendarView(partnerUserId)`: eine einzige Query (`resolveActiveOwnerUserId`) prüft in einem Schritt, ob eine aktive Verbindung besteht und zu welcher Eigentümerin – vermeidet eine separate Statusabfrage, die zwischen zwei Aufrufen veralten könnte. Ohne aktive Verbindung liefert die Funktion `null`; Aufrufer dürfen in diesem Fall auf keine andere Datenquelle ausweichen (im UI-Code entsprechend umgesetzt).
  - Bestätigte Tage werden aus den echten `startDate`/`endDate`-Werten der Eigentümerin abgeleitet: bei einer laufenden Periode (kein echtes `endDate`) gelten die Tage vom tatsächlichen Start bis einschließlich heute als bestätigt. Erwartete Tage entstehen ausschließlich bei einer laufenden Periode mit gesetztem `expectedEndDate`: ab morgen bis einschließlich erwartetem Ende. Die Rückgabe enthält ausschließlich zwei Datumslisten (`confirmedDates`, `expectedDates`) als reine `YYYY-MM-DD`-Strings – keine IDs, keine E-Mail-Adressen, keine Namen, keine Profil-/Zykluswerte, keine Historie.
  - `src/app/neu/partner/page.tsx` (Server-Komponente, bereits bestehender geschützter Bereich aus Version 1/2) ruft bei aktiver Verbindung zusätzlich `getPartnerCalendarView` auf und übergibt nur die beiden Datumslisten an die neue Client-Komponente. Keine neue API-Route: die vorhandene, bereits sitzungsgeprüfte Server-Komponente lädt die Daten direkt, wodurch keine zusätzliche Angriffsfläche für einen Netzwerk-Endpunkt entsteht (im Sinne des Auftrags „nur eine neue... Route, falls die vorhandene Statusroute nicht minimal genug ist“ – hier war gar keine zusätzliche Route nötig).
  - Neue Client-Komponente `src/components/NewPartnerCalendar.tsx`: rein lesender Monatskalender (Wiederverwendung von `getCalendarMonthGrid`/`shiftCalendarMonth` aus dem bestehenden Owner-Kalender, aber ohne jede Owner-Interaktions- oder Vorhersagelogik). Jeder Tag ist ein Button, der ein schreibfreies Tagesfenster mit Datum und genau einem von drei Status öffnet: `Bestätigt`, `Erwartet – kann abweichen` oder `Keine freigegebene Information`. Zusätzlich zur Farbe (dunkel für bestätigt, hellgrau für erwartet) trägt jeder Tag ein Textkürzel (`B`/`E`) sowie eine textuelle Legende – Status ist nicht ausschließlich über Farbe erkennbar. Tagesfenster schließt über sichtbaren Button und Escape; der Hintergrund wird währenddessen über `inert` deaktiviert (gleiches Muster wie die bestehenden Owner-Tagesfenster).
  - Monatswechsel über `‹`/`›`-Pfeile ist möglich; alle Berechnungen bleiben rein clientseitige Ableitung aus den bereits geladenen, minimalen Datumslisten – kein weiterer Netzwerkaufruf beim Blättern.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Kein Partnerkalender in der alten Luma, keine PMS-/Eisprung-/Zykluslängen-/Vorhersage-/Historien-/Profilanzeige, keine schreibende Partneraktion, keine Datenbankmigration.
- Tests:
  - Neues `scripts/verify-partner-calendar.mts` (12 Prüfungen, direkt gegen `luma_core`): kein Zugriff ohne aktive Verbindung; laufende Periode zeigt bestätigte Tage exakt vom echten Start bis einschließlich heute und erwartete Tage exakt ab morgen bis zum erwarteten Ende (mit expliziter Prüfung, dass der heutige Tag nicht als erwartet und der morgige Tag nicht als bestätigt erscheint); eine abgeschlossene Periode zeigt nur echte bestätigte Tage und keine erwarteten; eine laufende Periode ohne `expectedEndDate` erfindet keine erwarteten Tage; nach einem Widerruf sind sofort keine Daten mehr sichtbar; ein fremdes, nicht verbundenes Owner-Konto liefert keine Daten, während die eigenen verbundenen Daten weiterhin korrekt erscheinen. Alle 12 Prüfungen bestanden.
  - `scripts/verify-partner-new.mts` und `verify-partner-old.mts` erneut ausgeführt (Regressionsprüfung für Version 1/2 des Verbindungskerns): weiterhin alle 40 Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, weiterhin 47 Routen (keine neue Route hinzugekommen).
  - Zusätzliche end-to-end-Prüfung per `curl` gegen einen lokalen Produktions-Build: Owner registriert sich, trägt eine laufende Periode mit echtem Start vor drei Tagen und erwartetem Ende in zwei Tagen ein, erzeugt einen Code; ein zweites, unabhängiges Konto meldet sich als Partner an und löst den Code ein. Die gerenderte Partnerseite enthält die Legenden „Bestätigt“ und „Erwartet“ sowie den korrekten Monatsnamen, aber nachweislich **keine** der verbotenen Begriffe „PMS“, „Eisprung“ oder eine E-Mail-Adresse (per `grep` auf das vollständige gerenderte HTML geprüft). Ein drittes, nicht verbundenes Konto sieht auf derselben Route ausschließlich die Code-Eingabe, keine Kalenderdaten. Nach `POST .../partner/end` durch die Eigentümerin zeigt ein erneuter Abruf der Partnerseite durch das (jetzt getrennte) Partnerkonto sofort wieder nur die Code-Eingabe.
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, mit echter Partner-Session-Cookie gegen den lokalen Produktions-Build, danach vollständig wieder entfernt): kein horizontaler Überlauf, Legende „Bestätigt“ sichtbar, Tagesfenster öffnet und schließt korrekt über Escape, im Tagesfenster keine schreibenden Aktionen (`Speichern`/`Löschen`/`Bearbeiten` kommen nicht vor), keine Konsolen-/Seitenfehler.
  - Alle bei den Prüfungen erzeugten Testkonten und Testperioden wurden danach aus `luma_core` gelöscht; bestehende Datenbestände blieben unverändert.
- Abweichungen: keine fachliche Abweichung. Wie oben erläutert wurde bewusst keine zusätzliche API-Route ergänzt, da die vorhandene, bereits geschützte Server-Komponente die minimalen Daten direkt und sicher laden kann; das entspricht dem Auftrag, eine neue Route nur zu ergänzen, falls die vorhandene Statusroute nicht ausreicht.
- offene Punkte:
  - Owner-Prüfschritt für Version 3 steht aus (aktiv verbundener Partner öffnet `/neu/partner` und sieht den Monatskalender; laufende Periode zeigt bestätigte und erwartete Tage korrekt getrennt; abgeschlossene Periode zeigt nur bestätigte Tage; Tagesfenster ist rein lesend; mobile Sichtprüfung).
  - Der bereits aus früheren Paketen bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ausgelöst – wie beauftragt nicht vorgenommen.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 4 – Push-Benachrichtigungen für den neuen Partnerbereich

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Direkt nach dem erfolgreichen Verbindungscode kann der Partner auf seinem eigenen Gerät freiwillig Benachrichtigungen aktivieren.
- **Welche Hinweise kommen an?** Nur `Die Periode deiner Partnerin hat heute begonnen.` und `Die Periode deiner Partnerin ist heute zu Ende.`
- **Wann kommt kein Hinweis?** Bei erwarteten Tagen, Schätzungen, nachträglichen vergangenen Daten, ohne aktive Verbindung, ohne Gerätefreigabe oder nach einem bewussten Widerruf.
- **Wichtig auf iPhone:** Luma erklärt, dass die Web-App zuerst zum Home-Bildschirm hinzugefügt werden muss. Erst danach kann der Partner die Gerätefreigabe erteilen.
- **Was bleibt privat?** Der Partner erhält keine weiteren Zyklus-, Profil- oder Gesundheitsdaten. Er kann keine Daten ändern.

### Entstehungsweg

`Aktive Partnerverbindung und lesender Kalender → Partner soll bei einem tatsächlichen Ereignis sofort aufmerksam werden → freiwillige, gerätegebundene Push-Freigabe → direkte Hinweise nur bei heutigem echten Start oder Ende → WP-004 Version 4`

- bestätigtes Problem: Ohne aktive Benachrichtigung muss der Partner den Kalender selbst öffnen und erkennt den tatsächlichen Beginn oder das Ende nicht rechtzeitig.
- gewünschte Wirkung: Der aktiv verbundene Partner erhält auf seinem freiwillig freigegebenen Gerät einen klaren Hinweis zum heutigen tatsächlichen Beginn oder Ende.
- gewählte Lösung: Standardkonforme Web-Push-Benachrichtigung nach bewusstem Aktivieren direkt nach der Codeverbindung.
- bestätigte Grenzen: Nur neue Luma, nur Start und Ende, keine Schätzungen und keine zusätzlichen Gesundheitsinformationen.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`, DEC-109, DEC-110, DEC-115 und DEC-116.

### Soll – von Codex

- Der Umfang gilt ausschließlich für die **Neue Luma** und den bestehenden Partnerweg unter `/neu/partner`.
- Direkt nach einer erfolgreichen Codeeinlösung zeigt der Partnerbereich deutlich `Benachrichtigungen aktivieren`. Die Codeverbindung und der Kalender bleiben auch nutzbar, wenn der Partner ablehnt oder später entscheidet.
- Erst der bewusste Tipp des Partners darf die Betriebssystem-Abfrage starten. Benachrichtigungen werden nie still oder standardmäßig aktiviert.
- Auf iPhone/iPad prüft Luma vor der Abfrage, ob die Seite als Home-Bildschirm-Web-App läuft. Falls nicht, erklärt Luma in einfacher Sprache das Hinzufügen zum Home-Bildschirm und zeigt keine irreführende Aktivierungsbestätigung.
- Bei unterstützten Geräten speichert Luma die Push-Anmeldung ausschließlich für das angemeldete, aktiv verbundene Partnerkonto und dieses Gerät.
- Speichert die Eigentümerin einen tatsächlichen Beginn mit dem heutigen Kalenderdatum, erhält der Partner genau den Text `Die Periode deiner Partnerin hat heute begonnen.`
- Speichert die Eigentümerin ein tatsächliches Ende mit dem heutigen Kalenderdatum, erhält der Partner genau den Text `Die Periode deiner Partnerin ist heute zu Ende.`
- `Heute` richtet sich in dieser ersten Version nach `Europe/Berlin`, dem aktuellen Projekt- und Zielmarkt-Zeitraum. Eine spätere persönliche Zeitzone ist nicht Teil dieser Version.
- Eine Benachrichtigung entsteht nur, wenn das Ereignis durch Anlegen oder Ändern eines echten Periodeneintrags **neu** als heutiger Start beziehungsweise heutiges Ende gespeichert wird. Wiederholtes Speichern desselben Zustands darf keinen zweiten Hinweis senden.
- Nachträge vergangener Tage, erwartete Enddaten, geplante oder geschätzte Werte und neutrale Kalenderaktionen senden niemals Push-Nachrichten.
- Wird die Verbindung beendet, löscht oder deaktiviert Luma die zugehörigen Push-Anmeldungen. Danach darf kein weiterer Hinweis versendet werden.

### Nicht enthalten

- Push-Benachrichtigungen für die alte Luma.
- PMS, Eisprung, Zykluslänge, Stimmung, Historie, Profilinformationen oder eine Vorhersage einer neuen Periode.
- E-Mail, SMS, Werbung, wiederkehrende Erinnerungen oder Benachrichtigungen ohne aktive Partnerverbindung.
- Eine native iOS- oder Android-App. Dieser Umfang nutzt sichere Standard-Web-Push-Funktionen.

### Abnahmekriterien

1. Nach dem Einlösen eines gültigen Verbindungscodes sieht der Partner eine verständliche freiwillige Aktivierung.
2. Ohne bewusste Freigabe wird keine Push-Anmeldung gespeichert und der Partnerkalender bleibt dennoch zugänglich.
3. Ein unterstütztes Gerät kann die Freigabe aktivieren; das Ergebnis zeigt Luma klar an. Bei nicht unterstützter Umgebung oder abgelehnter Freigabe erscheint eine einfache, hilfreiche Erklärung.
4. Ein heutiger tatsächlicher Start erzeugt einmalig genau den bestätigten Starttext; ein heutiges tatsächliches Ende erzeugt einmalig genau den bestätigten Endtext.
5. Mehrfaches Speichern, erwartete Enden, Schätzungen und nachträgliche vergangene Daten erzeugen keinen Hinweis.
6. Nur das aktiv verbundene Partnerkonto kann für sein eigenes Gerät eine Anmeldung speichern; andere Konten, fremde Paare und getrennte Partner erhalten keine Nachricht.
7. Nach einem Widerruf werden Push-Anmeldungen entfernt oder wirksam deaktiviert; nachfolgende Ereignisse senden nichts.
8. Push-Daten, VAPID-Schlüssel und Geräte-Endpunkte erscheinen nie im Browser, in Logs, Tests, Fehlerantworten oder dem Repository.

### Technischer Auftrag für Claude – Version 4

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` prüft bereits die neue Sitzung und den aktiven Partnerstatus. Erfolgreiche Codeeinlösung erfolgt über `src/components/NewPartnerRedeemForm.tsx` und `POST /api/neu/partner/redeem`.
- `src/lib/new-partner.ts` verwaltet den atomaren Verbindungskern und `endPartnerConnection` beendet eine Verbindung.
- Tatsächliche neue Perioden werden über `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` mit `src/lib/new-periods.ts` gespeichert. Ein echter Start ist `startDate`; ein echtes Ende ist `endDate`; `expectedEndDate` ist ausdrücklich nur vorläufig.
- `public/sw.js` und `src/components/SwRegister.tsx` registrieren bereits einen Service Worker mit einem `push`- und `notificationclick`-Handler. Dieser darf sicher erweitert werden, darf aber keine persönlichen Daten in Logs ausgeben.
- Die neue Datenbasis ist `luma_core`; der Owner hat die notwendige Datenbankmigration für WP-004 bereits am 10. September 2026 ausdrücklich genehmigt.

#### Technisches Ziel

- Ergänze den Web-Push-Weg nur für die neue Luma: Manifest/Home-Screen-fähige Web-App, Service-Worker-Registrierung, Partner-Aktivierungsoberfläche und serverseitigen Versand.
- Nutze den Standard `Push API`/`Notifications API` mit VAPID. Der öffentliche Schlüssel darf nur zur Geräteanmeldung ausgeliefert werden; privater VAPID-Schlüssel und Absender bleiben ausschließlich als Produktionsgeheimnisse in der Laufzeitumgebung.
- Ergänze eine sitzungs-, herkunfts- und verbindungsgeprüfte Partnerroute zum Speichern und Entfernen einer Push-Anmeldung. Die Route akzeptiert nur eine valide Browser-Subscription und gibt nie Endpunkt, Schlüssel oder fremde Daten zurück.
- Speichere Subscriptions verschlüsselt oder so minimal geschützt wie technisch möglich; mindestens Endpoint sowie `p256dh`- und `auth`-Schlüssel nur serverseitig, kontogebunden, ohne Klartext-Ausgabe und mit eindeutiger Begrenzung pro Partnerkonto/Gerät.
- Ergänze eine deduplizierte serverseitige Ereignisaufzeichnung für `period_started` und `period_ended`, damit pro aktiver Verbindung und tatsächlichem heutigen Ereignis höchstens ein Versand entsteht – auch bei Doppelklick, Wiederholung, Aktualisierung oder parallelen Anfragen.
- Prüfe beim Auslösen und unmittelbar vor dem Versand erneut die aktive Verbindung. Beende/Widerruf entfernt die Subscription oder macht sie für den Versand unbrauchbar.
- Verknüpfe den Versand nur mit den beiden bestehenden echten Speicherwegen (POST/PUT). Vergleiche für PUT den bisherigen und neuen tatsächlichen Zustand; nur ein neu hinzugekommener heutiger Start oder ein neu hinzugekommenes heutiges Ende darf ein Ereignis auslösen.
- Sende erst nach erfolgreicher Speicherung. Ein Versandfehler darf niemals den echten Periodeneintrag zurückrollen oder die Nutzerin zu einer erneuten Eingabe zwingen. Permanenter Push-Fehler wie eine ungültige/abgemeldete Subscription entfernt genau diese Subscription sicher; Fehlerantworten bleiben allgemein.
- Nach erfolgreicher Codeeinlösung führt die Oberfläche ohne Umweg zur Aktivierungsaufforderung. Ist die Berechtigung bereits erteilt, zeigt sie den aktiven Status; bei Ablehnung erklärt sie knapp, wie der Partner die Berechtigung später erneut in den Browser-/Geräteeinstellungen erlauben kann.
- Die erste Meldung kann als kurze Test-Benachrichtigung erfolgen, aber nur nach bewusster Freigabe des Partners und ohne Gesundheitsinhalt, zum Beispiel `Luma-Benachrichtigungen sind aktiviert.`

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, ausschließlich in `luma_core`. Keine Änderung an `app_luma` und keine Datenkopie.
- Lege eine kontogebundene Tabelle für Partner-Push-Anmeldungen an. Sie referenziert das Partnerkonto mit `ON DELETE CASCADE`, schützt doppelte Endpunkte per eindeutiger Begrenzung und speichert keine Zyklus- oder Profildaten.
- Lege eine zweite, minimale Tabelle oder gleichwertig robuste serverseitige Deduplizierung für versendete/auszulösende Partnerereignisse an. Sie verhindert mehrfachen Versand für dieselbe aktive Verbindung, Ereignisart und Ereignisdatum.
- Ergänze ausschließlich geschützte neue-Luma-Partnerendpunkte für Subscription/Abmeldung und eventuell einen lokalen Testversand. Kein frei abrufbarer Versandendpunkt und keine neue Partnerdaten-API.
- Ergänze die benötigten Laufzeitvariablen dokumentiert, aber ohne Werte im Repository: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` und ein zulässiger `VAPID_SUBJECT`. Produktionswerte werden später getrennt in Dokploy gesetzt; sie gehören nie in `.env`-Beispiele mit echten Werten, Commits oder Screenshots.

#### Invarianten – müssen unverändert bleiben

- Der Partner hat weiterhin ausschließlich Lesezugriff auf die bisher freigegebenen Kalenderdaten.
- Nur die aktive neue Partnerverbindung der Eigentümerin darf Hinweise an dieses Partnerkonto auslösen.
- Keine Nachricht bei `expectedEndDate`, Schätzung, Vergangenheit, fremden Konten, fehlender oder widerrufener Verbindung.
- Keine Klartext-Push-Endpunkte, Auth-Schlüssel, VAPID-Geheimnisse, Codes, Namen, E-Mail-Adressen oder Periodendaten in Logs, Fehlern, Ledger, Committexten oder Tests.
- Der direkte Nachrichtentext bleibt exakt auf Start/Ende begrenzt; keine neue medizinische Interpretation.
- Alte Luma, bestehende Auth-, Kalender-, Partnercode- und Periodenlogik bleiben außerhalb der notwendigen Einhängepunkte unverändert.

#### Pflichtprüfungen

- Unit-/Integrationstests für Subscription-Validierung, Partner-/Kontotrennung, fehlende Verbindung, Widerruf und serverseitige Entfernung ungültiger Subscriptions.
- Start/Ende: heutiger neuer tatsächlicher Wert löst je genau ein Ereignis aus; Wiederholung und parallele Anfrage erzeugen kein zweites.
- Negativfälle: erwartetes Ende, Schätzung, vergangenes Datum und neutrales Update lösen nichts aus.
- Versand wird nach Widerruf oder bei fremdem Partnerkonto zuverlässig unterdrückt.
- Teste Service Worker und Partner-Aktivierungsweg mobil. Prüfe iPhone/Home-Screen-Hinweis, Ablehnung, bereits erteilte Freigabe und nicht unterstützte Browser verständlich.
- Prüfe, dass Antworten und gerenderte Partnerseiten weder Push-Endpunkte noch Schlüssel oder verbotene Gesundheitsdaten ausgeben.
- TypeScript, zielgerichtete Sicherheits-/Datenbanktests, bestehende Partner-/Periodenregressionen, Produktions-Build und Entwicklungsledger-Validierung.

#### Stoppbedingungen

- Stoppe vor einem Deployment oder vor dem Setzen echter VAPID-Geheimnisse in Dokploy. Das ist eine getrennte Produktionsfreigabe der Ownerin.
- Stoppe, wenn eine sichere kontogebundene Speicherung, Deduplizierung oder Widerruf nicht nachweisbar ist.
- Stoppe vor einer stillen Standardfreigabe, Push für die alte Luma, einer Profil-/Zyklusdaten-Erweiterung oder dem Versand bei erwarteten/geschätzten Daten.
- Stoppe bei fehlender Browserunterstützung nicht mit einer Fake-Erfolgsmeldung; zeige stattdessen eine klare Hilfe und lasse den Partnerkalender nutzbar.

#### Abschluss durch Claude

- Ergänze `Ist Version 4`, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Ein Test von echten Push-Nachrichten in Produktion sowie ein Deploy bleiben eine getrennte Owner-Freigabe.

### Ist Version 4 – von Claude

- umgesetzt:
  - **Datenmodell, ausschließlich `luma_core`:** neue Migration `202609111200_partner_push.sql` – `new_partner_push_subscriptions` (`partner_user_id` mit `ON DELETE CASCADE`, `endpoint` UNIQUE, `p256dh`/`auth`-Schlüssel, keine Zyklus-/Profildaten) und `new_partner_period_events` (Deduplizierungsprotokoll mit `UNIQUE(owner_user_id, event_type, event_date)` – der eigentliche Schutz gegen Mehrfachversand ist dieser Datenbank-Constraint, nicht Anwendungslogik). Keine Änderung an `app_luma`.
  - **Zeitzone:** neues Modul `src/lib/berlin-date.ts` mit `todayBerlinDateOnly()` – ermittelt „heute“ explizit über `Intl.DateTimeFormat` mit der IANA-Zone `Europe/Berlin`, unabhängig von der Server-Prozess-Zeitzone (die in Produktion UTC sein kann – siehe der in WP-004 Version 1 gefundene Prisma/pg-Zeitzonenfehler). Mit einem festen Zeitpunkt getestet, an dem UTC und Europe/Berlin bereits unterschiedliche Kalendertage haben.
  - **Kernlogik `src/lib/new-partner-push.ts`:** `savePartnerPushSubscription`/`removePartnerPushSubscription` (kontogebunden, `ON CONFLICT (endpoint)` verhindert Duplikate bei erneuter Anmeldung desselben Geräts), `parsePushSubscription` (strukturelle Validierung: `https://`-Endpoint, vorhandene `p256dh`/`auth`-Schlüssel), `dispatchPartnerPeriodEvent` (deduplizierter, „best effort“ Versand – schlägt der Insert wegen des UNIQUE-Constraints fehl, ist der Aufruf ein No-op; Versandfehler werden abgefangen und dürfen den Aufrufer nie beeinflussen; eine dauerhaft ungültige Subscription (HTTP 404/410 vom Push-Dienst) wird automatisch entfernt), `sendPartnerTestNotification` für die freiwillige Test-Benachrichtigung nach Aktivierung.
  - **Widerruf:** `endPartnerConnection` (in `src/lib/new-partner.ts`) gibt jetzt die `partner_user_id` der soeben beendeten Verbindung zurück und löscht in derselben Funktion sofort alle Push-Subscriptions dieses Partnerkontos – kein zusätzlicher Aufruf nötig, kein Zeitfenster für einen weiteren Versand nach dem Widerruf.
  - **Auslösung nur bei einem echten heutigen Ereignis:** `POST /api/neu/periods` löst `period_started`/`period_ended` aus, wenn `startDate`/`endDate` des neu gespeicherten Eintrags exakt `todayBerlinDateOnly()` entspricht. `PUT /api/neu/periods/[id]` vergleicht dafür zusätzlich den Zustand vor der Änderung (`updateNewPeriodEntry` in `src/lib/new-periods.ts` liefert jetzt `previousEntry` zurück): nur wenn der heutige Wert **neu hinzugekommen** ist (vorher war `startDate`/`endDate` nicht bereits heute), wird ein Ereignis ausgelöst – wiederholtes Speichern desselben Zustands, ein erwartetes Ende oder ein nachgetragener vergangener Tag lösen nichts aus. Der Versand erfolgt `void` (fire-and-forget) erst nach erfolgreichem Speichern; ein Versandfehler kann die Antwort oder den gespeicherten Eintrag nie beeinflussen.
  - **API-Routen (ausschließlich neue Luma, sitzungs-, herkunfts- und ratenbegrenzt):** `POST/DELETE /api/neu/partner/push-subscription` (Speichern erfordert zusätzlich eine aktive Partnerverbindung; kein Endpunkt gibt je einen gespeicherten Endpunkt oder Schlüssel zurück) und `POST /api/neu/partner/push-test` (freiwillige Testbenachrichtigung, ebenfalls nur mit aktiver Verbindung). Kein frei abrufbarer Versandendpunkt.
  - **UI:** neue Komponente `src/components/NewPartnerPushActivation.tsx` in `/neu/partner`: erkennt iOS-Geräte außerhalb des Home-Bildschirm-Modus und zeigt dafür eine einfache Erklärung statt der Aktivierungsabfrage; prüft Browser-Unterstützung (`serviceWorker`, `PushManager`) und zeigt bei fehlender Unterstützung eine klare, nicht irreführende Meldung; erst ein bewusster Tipp startet `Notification.requestPermission()` und danach `PushManager.subscribe` mit dem öffentlichen VAPID-Schlüssel; bei bereits erteilter Berechtigung wird der aktive Status direkt angezeigt, bei Ablehnung ein knapper Hinweis zum erneuten Erlauben in den Geräteeinstellungen. Nach erfolgreicher Aktivierung steht ein Button für eine kurze, gesundheitsneutrale Test-Benachrichtigung (`Luma-Benachrichtigungen sind aktiviert.`) zur Verfügung. Der Partnerkalender bleibt in jedem Zustand vollständig nutzbar.
  - **Web-App-Voraussetzungen:** neues `public/manifest.json` (Name, `start_url: /neu`, `display: standalone`) im Root-Layout verlinkt, damit die Seite auf iOS zum Home-Bildschirm hinzugefügt werden kann. `public/sw.js` unverändert im Push-/Klick-Verhalten, nur das Ziel eines Notification-Klicks wurde von `/` auf `/neu/partner` präzisiert; keine persönlichen Daten werden im Service Worker geloggt.
  - **Laufzeitvariablen dokumentiert, ohne Werte im Repository:** `.env.example` um `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` als leere Platzhalter mit Erzeugungshinweis (`npx web-push generate-vapid-keys`) ergänzt. Für lokale Entwicklungs-/Testzwecke wurden eigens generierte, ausschließlich lokale Testschlüssel in die nicht versionierte `.env.local` eingetragen (durch `.gitignore`-Muster `.env*` geschützt) – niemals Produktionswerte, niemals committed.
  - **Neue Abhängigkeit:** `web-push` (Produktionsabhängigkeit) und `@types/web-push` (Dev-Abhängigkeit) ergänzt – die Standardbibliothek für VAPID-signierten Web-Push in Node.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Kein Push für die alte Luma, keine PMS-/Eisprung-/Zykluslängen-/Stimmungs-/Historien-/Profilinformationen im Nachrichtentext, keine native App, kein Setzen echter Produktions-VAPID-Geheimnisse in Dokploy, kein Deploy.
- Tests:
  - Neues `scripts/verify-partner-push.mts` (12 Prüfungen, direkt gegen `luma_core`): Subscription ist kontogebunden; ein doppelt registrierter Endpunkt überschreibt statt zu duplizieren und übernimmt die neuesten Schlüssel; dasselbe Ereignis am selben Tag löst nur einmal aus (UNIQUE-Constraint); verschiedene Ereignisarten/-daten sind unabhängig voneinander; **echte parallele Aufzeichnungsversuche mit zwei unabhängigen Datenbankverbindungen** zeigen, dass von zwei gleichzeitigen Versuchen genau einer gewinnt; nach einem Widerruf werden die Push-Subscriptions des betroffenen Partners sofort entfernt, während die Subscription eines unbeteiligten Partnerkontos unverändert bestehen bleibt (Kontotrennung). Alle 12 Prüfungen bestanden.
  - Neues `scripts/verify-partner-push-triggers.ts` (13 Prüfungen): `todayBerlinDateOnly` liefert das korrekte Format und löst die Europe/Berlin-Zeitzone auch an einem festen Zeitpunkt korrekt auf, an dem UTC und Berlin unterschiedliche Kalendertage haben; die POST-Route nutzt die Berlin-Zeit und löst Start-/Ende-Ereignisse fire-and-forget aus; die PUT-Route vergleicht nachweislich den vorherigen Zustand, bevor sie ein Ereignis auslöst; `updateNewPeriodEntry` liefert den vorherigen Zustand zurück; die Subscription-Route verlangt eine aktive Verbindung, prüft Herkunft und ist ratenbegrenzt, und keine ihrer Fehlermeldungen enthält einen Endpunkt oder Push-Schlüssel im Text. Alle 13 Prüfungen bestanden.
  - `scripts/verify-partner-calendar.mts`, `verify-partner-new.mts`, `verify-partner-old.mts`, `verify-my-periods.mts` erneut ausgeführt (Regressionsprüfung für Version 1–3 sowie den bestehenden Periodenweg): weiterhin alle Prüfungen bestanden.
  - `scripts/verify-luma-core.mjs`: die harten Tabellenzähler wurden von 8 auf 10 aktualisiert (zwei neue Partner-Push-Tabellen); Datenbanktrennung weiterhin bestätigt, alle neun Migrationen korrekt gelistet, keine verbliebenen Testdaten in den neuen Tabellen.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, 49 Routen (zwei neue: `push-subscription`, `push-test`).
  - Zusätzliche end-to-end-Prüfung gegen einen lokalen Produktions-Build mit **echten, lokal generierten Test-VAPID-Schlüsseln** (`npx web-push generate-vapid-keys`, ausschließlich in der nicht versionierten `.env.local`): Owner und Partner registrieren sich, verbinden sich per Code; eine strukturell gültige, aber nicht echte Push-Subscription wird über die neue Route gespeichert (201), eine Subscription mit fehlenden Schlüsseln oder nicht-`https://`-Endpunkt wird abgelehnt (400); eine Periode mit heutigem Start wird gespeichert, der (an einen nicht existierenden Endpunkt gerichtete) Versandversuch läuft asynchron ohne die Server-Antwort zu beeinträchtigen oder einen unbehandelten Fehler zu erzeugen, und erzeugt genau einen Eintrag im Deduplizierungsprotokoll mit dem korrekten Berlin-Datum; ein anschließendes erneutes Speichern desselben heutigen Starts (mit zusätzlich ergänztem `expectedEndDate`) erzeugt nachweislich **kein** zweites Protokoll-Ereignis; nach dem Beenden der Verbindung durch die Eigentümerin ist die zuvor gespeicherte Push-Subscription des Partners sofort aus der Datenbank entfernt.
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, mit echter Partner-Session gegen den lokalen Produktions-Build, danach vollständig wieder entfernt): In Headless-Chromium ist `Notification.permission` systembedingt fest auf `denied` gesetzt (unabhängig von der Playwright-Context-Permission-Einstellung) – die Komponente zeigt dafür korrekt den „Benachrichtigungen sind blockiert“-Hinweis mit Erklärung zum erneuten Erlauben, der Partnerkalender bleibt währenddessen vollständig nutzbar (Kalenderlegende weiterhin sichtbar), kein horizontaler Überlauf, keine Konsolen-/Seitenfehler. Der bewusste Freigabe-Klick selbst sowie eine erfolgreiche `granted`-Aktivierung konnten in dieser automatisierten Headless-Umgebung technisch nicht ausgelöst werden (Browser-Einschränkung, kein Testfehler); die zugehörige Zustandslogik wurde stattdessen durch Quelltext-Prüfung in `verify-partner-push-triggers.ts` sowie durch den erfolgreichen End-to-End-Nachweis des serverseitigen Subscription-Speicherns abgesichert.
  - Alle bei den Prüfungen erzeugten Testkonten, Testperioden, Testverbindungen und Test-Subscriptions wurden danach aus `luma_core` gelöscht (per `ON DELETE CASCADE` inklusive Subscriptions/Events); bestehende Datenbestände blieben unverändert.
- Abweichungen:
  - Der Auftrag lässt offen, ob die Push-Aktivierungsoberfläche als eigene, getrennte Route oder inline im bestehenden `/neu/partner`-Bereich erscheinen soll. Da der Auftrag ausdrücklich „nach erfolgreicher Codeeinlösung führt die Oberfläche ohne Umweg zur Aktivierungsaufforderung“ verlangt, wurde die Komponente direkt und ohne Navigationsumweg in die bestehende, bereits geschützte `/neu/partner`-Seite integriert statt eine neue Route zu ergänzen – das ist die direktere Umsetzung des Solls, keine Abweichung vom Ziel.
  - Kein `favicon.ico`-hochauflösendes App-Icon war im Projekt vorhanden; das minimale `manifest.json` referenziert daher das bestehende `favicon.ico`. Für die funktionale Home-Bildschirm-/Standalone-Erkennung dieser Version ist das ausreichend; ein gestaltetes App-Icon war nicht Teil des Auftrags und wurde nicht ergänzt.
  - Keine weitere fachliche Abweichung vom Soll.
- offene Punkte:
  - Owner-Prüfschritt für Version 4 steht aus (nach Codeeinlösung Aktivierungsaufforderung sehen, auf einem unterstützten Gerät aktivieren, Testbenachrichtigung erhalten, danach eine echte Periode mit heutigem Start/Ende speichern und den bestätigten Text empfangen, Wiederholung prüft aus, Widerruf entfernt die Anmeldung; iPhone-Home-Bildschirm-Hinweis in echter Safari-Umgebung prüfen, da dies in der automatisierten Prüfung nicht nachstellbar war).
  - **Produktions-VAPID-Schlüssel sind noch nicht in Dokploy gesetzt** – ohne sie bleibt Push in Produktion inaktiv (die Aktivierungsoberfläche zeigt dann korrekt den „nicht unterstützt“-Hinweis, da `NEXT_PUBLIC_VAPID_PUBLIC_KEY` fehlt). Das Setzen dieser Geheimnisse ist ausdrücklich eine getrennte Owner-Freigabe.
  - Der bereits aus früheren Paketen bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ausgelöst – wie beauftragt nicht vorgenommen.
- Commit: folgt unmittelbar nach diesem Eintrag.
