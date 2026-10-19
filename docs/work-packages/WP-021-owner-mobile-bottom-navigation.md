---
id: WP-021
title: "Mobile untere Navigation für das Owner-Konto"
status: review
created: 2026-10-19
updated: 2026-10-19
owner_approved: yes
executor: claude
product_area: "Neue Luma – Owner Home und Einstellungen auf Mobilgeräten"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Mobile untere Navigation für das Owner-Konto

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Auf deinem Handy gibt es unten eine kleine feste Leiste mit genau zwei Bereichen: `Home` und `Einstellungen`.
- **Warum machen wir das?** Du erreichst die zwei wichtigen Seiten deines eigenen Kontos mit einem Tipp, ohne die Home-Ansicht mit weiteren Inhalten zu füllen.
- **Woher kam die Idee?** Bestätigte Owner-Entscheidung vom 2026-10-19 zu `APP-IDEA-024`.
- **Wo ist es in der App?** Nur auf den mobilen Owner-Seiten `/neu` und `/neu/einstellungen`.
- **Was gehört ausdrücklich nicht dazu?** Keine Navigation, Änderung oder neue Einstellung für das Partnerkonto und `/neu/partner`; die Partnerverbindung bleibt in den bestehenden Owner-Einstellungen.
- **Was kann die Nutzerin danach ausprobieren?** Auf dem Handy zwischen Home und Einstellungen tippen; der gewählte Bereich ist klar markiert und kein Inhalt wird von der Leiste verdeckt.

## Entstehungsweg

`Mobile App soll einfacher erreichbar sein → Untere Navigation geplant → Partnerroute ist ein getrenntes Konto und darf nicht irrtümlich verlinkt werden → Owner-only Navigation mit Home und Einstellungen → WP-021`

- Ausgangsidee oder Problem: Wichtige Owner-Bereiche sollen auf dem Handy schneller erreichbar sein, ohne zusätzliche Texte auf der Home-Ansicht.
- bestätigte Wirkung: Die Ownerin wechselt mit einem Tipp zwischen ihrer Home-Ansicht und ihren Einstellungen.
- gewählte Lösung: Eine mobile, feste untere Leiste mit zwei klaren Tabs `Home` und `Einstellungen`, nur im Owner-Nutzerweg.
- wichtige Entscheidung(en): Die App bleibt ohne Partner vollständig nutzbar. Das Partnerkonto und dessen reine Leseansicht erhalten in diesem Paket keine untere Navigation.
- Quellen/Akten: `APP-IDEA-024`, Owner-Entscheidung vom 2026-10-19.

## Soll – von Codex

- **Problem:** Die mobile Owner-Ansicht hat keinen festen, schnellen Wechsel zwischen Home und Einstellungen.
- **gewünschte Wirkung:** Beide Owner-Seiten sind mobil direkt, klar und ohne Suchaufwand erreichbar.
- **sichtbare Änderung:** Auf `/neu` und `/neu/einstellungen` erscheint unterhalb der `sm`-Breite eine kleine feste Leiste mit `Home` und `Einstellungen`. Der aktive Bereich ist eindeutig erkennbar.
- **nicht enthalten:** Keine neue Route, keine Daten-, Konto-, Authentifizierungs-, Partnerverbindungs- oder Benachrichtigungslogik; keine Navigation auf `/neu/partner`, `/neu/partner-anmelden`, `/neu/partner-registrieren`, den Anmelde-/Registrierungsseiten, dem Onboarding oder der breiten Ansicht.
- **Abnahmekriterien:**
  1. Auf dem Handy führt `Home` zu `/neu` und `Einstellungen` zu `/neu/einstellungen`.
  2. Auf beiden Seiten ist genau der aktuelle Tab sichtbar aktiv; die zwei Tabs haben verständliche zugängliche Namen und ausreichend große Tippflächen.
  3. Die Leiste bleibt nur mobil sichtbar; ab `sm` bleibt die bestehende breite Ansicht unverändert.
  4. Der feste Balken berücksichtigt die sichere untere Bildschirmkante und verdeckt weder Kalenderaktionen noch Einstellungen oder Dialoge. Die Owner-Seiten erhalten ausreichend unteren Inhaltsabstand.
  5. Bestehende mobile Links, die durch die Leiste doppelt wären, dürfen auf Mobilgeräten verborgen werden, müssen in der breiten Ansicht aber unverändert erhalten bleiben.
  6. Der Partner-Nutzerweg einschließlich `/neu/partner` bleibt vollständig bytegleich: keine neue Leiste, keine neue Navigation, keine veränderte Berechtigung oder Eingabemöglichkeit.
- **ein Prüfschritt für den Owner:** Auf dem Handy `/neu` öffnen, zwischen `Home` und `Einstellungen` wechseln und prüfen, dass die Leiste nur dort sichtbar ist; danach `/neu/partner` öffnen und prüfen, dass dort keine Leiste erscheint.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/app/neu/page.tsx` ist die authentifizierte Owner-Home-Seite. Sie enthält aktuell oben einen einfachen Link zu `/neu/einstellungen` und besitzt keine untergeordnete `/neu/layout.tsx`.
- `src/app/neu/einstellungen/page.tsx` ist die authentifizierte Owner-Einstellungsseite. Sie enthält aktuell einen Zurück-Link nach `/neu` sowie die bestehende Partnerverbindung und Konto-Aktionen.
- `src/app/neu/partner/page.tsx` ist ein getrennter Partner-Nutzerweg und verwendet `getPartnerConnectionStatusForPartner(...)`; er darf nicht als Owner-Tab-Ziel verwendet oder in diesem Paket verändert werden.
- Beide Owner-Seiten verwenden eigenständige `main`-Container. Eine feste mobile Leiste benötigt daher eine wiederverwendbare Client-Komponente und ausreichenden unteren Innenabstand an genau diesen Owner-Seiten.

### Technisches Ziel

- Erstelle eine kleine, wiederverwendbare mobile Owner-Navigation, beispielsweise als eigenständige Client-Komponente mit `next/link` und `usePathname`, ohne neue Bibliothek.
- Sie enthält exakt zwei Links: `/neu` mit sichtbarem Namen `Home` und `/neu/einstellungen` mit sichtbarem Namen `Einstellungen`.
- Binde sie ausschließlich in die fertigen, authentifizierten normalen Rückgabepfade von `src/app/neu/page.tsx` und `src/app/neu/einstellungen/page.tsx` ein. Die Erstnamen- und Perioden-Onboarding-Gates bleiben unverändert und erhalten keine neue Leiste.
- Verwende eine mobile-only CSS-Umsetzung (unterhalb `sm`) und bewahre die breite Ansicht. Der aktuelle Pfad muss programmatisch zugänglich als aktiv erkennbar sein, etwa mit `aria-current="page"`.
- Die genaue dezente Form, Farbe und Icons sind Claude freigestellt, sofern es bei zwei ruhigen, klar beschrifteten und ohne neue Abhängigkeit umgesetzten Tabs bleibt.

### Invarianten – müssen unverändert bleiben

- Sämtliche Daten, Perioden-, PMS- und Vorhersagelogik sowie die bestehenden Dialoge bleiben unverändert.
- Die Partnerverbindung bleibt ausschließlich in den bestehenden Owner-Einstellungen. Der Partner-Nutzerweg, seine serverseitigen Gates, Datenschutzgrenzen, Lese-/Schreibrechte und Komponenten bleiben unverändert.
- Authentifizierung, Redirects, Erstnamen-Gate, Onboarding und alle nicht genannten `/neu`-Routen bleiben unverändert.
- Keine neue Route, API, Datenbankabfrage, Migration, Abhängigkeit oder globale Rollenlogik ergänzen.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- betroffene API-Routen: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Ergänze eine gezielte Quelltext- oder Komponentenprüfung: genau zwei Owner-Links, korrekte Ziele, aktiver Tab, mobile-only Darstellung und keine Einbindung der Navigation in Partner- oder Auth-/Onboarding-Routen.
- Prüfe bestehende Owner-Home-, Einstellungen-, Partner- und mobile Layout-Regressionen, soweit sie durch die neue Leiste betroffen sind.
- TypeScript und Produktions-Build müssen bestehen.
- Sichtprüfung mobil und breit: beide Owner-Tabs, sichere untere Kante, kein Überlauf, keine verdeckten Inhalte oder Dialoge; `/neu/partner` bleibt ohne Leiste. Mit einem nicht verbundenen Owner-Konto prüfen, dass Home und Einstellungen weiterhin nutzbar bleiben.

### Stoppbedingungen

- Stoppe und frage nach, bevor der Partner-Nutzerweg, Partnerrechte, Konto-Rollen, Daten oder bestehende Verbindungscodes verändert werden.
- Stoppe vor jeder neuen Route, Migration, API-Änderung, Abhängigkeit oder vor einer Leiste auf einer nicht ausdrücklich genannten Seite.
- Wenn sich die Leiste nicht in die Owner-Seiten einbinden lässt, ohne Onboarding oder Dialoge zu verdecken, dokumentiere den konkreten Konflikt und frage nach statt die Navigation global auszubreiten.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen und prüfen.
- `node scripts/work-package-state.mjs mark-updated WP-021` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – von Claude

- umgesetzt:
  - Neue Client-Komponente `src/components/NewOwnerMobileNav.tsx`: feste untere Leiste (`fixed inset-x-0 bottom-0`), ausschließlich unterhalb `sm` sichtbar (`sm:hidden`), mit genau zwei Links (`/neu` → „Home", `/neu/einstellungen` → „Einstellungen"). Aktiver Tab wird über `usePathname()` ermittelt und erhält `aria-current="page"`; nicht-aktiver Tab erhält kein `aria-current`. Tab-Höhe `min-h-12` (48px) für ausreichende Tippfläche. Berücksichtigt die sichere untere Kante über `pb-[env(safe-area-inset-bottom)]`. `z-40`, unterhalb aller bestehenden Dialoge (`z-50`), damit Dialoge die Leiste bei Bedarf überdecken statt umgekehrt.
  - `src/app/neu/page.tsx`: importiert und rendert `<NewOwnerMobileNav />` ausschließlich im finalen, authentifizierten normalen Rückgabepfad (nach `NewCycleExample`, als Geschwisterelement von `main` in einem Fragment). Das Erstnamen-Gate und das Perioden-Onboarding-Gate bleiben unverändert ohne Leiste. Unterer Innenabstand von `main` mobil auf `pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))]` erweitert, ab `sm` unverändert `pb-[max(2rem,env(safe-area-inset-bottom))]`. Der bestehende „Einstellungen"-Textlink in der Kopfzeile ist unterhalb `sm` ausgeblendet (`hidden sm:flex`), da er durch den neuen Tab redundant wäre; ab `sm` bleibt er unverändert sichtbar.
  - `src/app/neu/einstellungen/page.tsx`: importiert und rendert `<NewOwnerMobileNav />` als Geschwisterelement nach `main`. Unterer Innenabstand mobil auf `pb-24` erweitert, ab `sm` unverändert `sm:pb-10` (vorher einheitlich `py-10`, jetzt in `pt-10` plus den genannten responsiven unteren Abstand aufgeteilt).
  - `src/app/neu/partner/page.tsx` sowie alle Partner-/Auth-/Registrierungsrouten wurden nicht angefasst; die neue Komponente wird dort nicht importiert.
- nicht umgesetzt: nichts aus dem Soll offen; Umfang vollständig umgesetzt.
- Tests:
  - Neues Skript `scripts/verify-owner-mobile-nav.ts` (`npx tsx scripts/verify-owner-mobile-nav.ts`): 25 Quelltext-Prüfungen – genau zwei Tabs mit korrekten Zielen/Namen, `aria-current` dynamisch über `usePathname()`, mobile-only via `sm:hidden`, sichere untere Kante, Tippflächengröße, keine neue Abhängigkeit/Route/Datenlogik, Einbindung nur im normalen Rückgabepfad von `/neu` (nicht in den beiden Gates) und von `/neu/einstellungen`, keine Einbindung auf `/neu/partner`, mobiles Verbergen bei gleichzeitigem Erhalt des bestehenden „Einstellungen"-Links in der breiten Ansicht, ausreichender unterer Inhaltsabstand auf beiden Seiten. Alle 25 Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler.
  - `npm run build`: erfolgreich; Routenliste unverändert (keine neue Route, `/neu` und `/neu/einstellungen` weiterhin als bestehende dynamische Routen gelistet).
  - `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; die eine bekannte, vorbestehende Fehlschlag in `tests/calendar-day-info.test.ts` ist unabhängig von WP-021 (bereits in vorherigen Arbeitspaketen als vorbestehend dokumentiert, durch `git stash` auf unverändertem `main` reproduzierbar).
  - Bestehende Regressionsskripte erneut ausgeführt und bestanden: `verify-home-actions-consistent.ts`, `verify-home-screen-layout.ts`, `verify-mobile-home-compact.ts`, `verify-mobile-partner-compact.ts`, `verify-partner-fixed-view.ts`, `verify-partner-view-no-status-card.ts`, `verify-period-history-layout.ts`, `verify-settings-grouped.ts`.
  - Live-Verifikation: temporär `npm install --no-save playwright` installiert (vorher `git status --short package.json package-lock.json` leer bestätigt), laufenden Dev-Server (`npm run dev`, bereits aktiv) verwendet, ein echtes Owner-Testkonto über die reale Registrierungs-UI angelegt, Perioden-Onboarding übersprungen. Mit mobilem Viewport (390×844) geprüft: Leiste auf `/neu` sichtbar, genau zwei Links, „Home" mit `aria-current="page"` aktiv markiert, Tipphöhe 48px, kein horizontaler Überlauf, Screenshot erstellt. Nach Navigation zu `/neu/einstellungen`: Leiste weiterhin sichtbar, jetzt „Einstellungen" aktiv markiert, „Home" nicht mehr aktiv, kein Überlauf, Screenshot erstellt. Mit breitem Viewport (1280×900) auf `/neu`: Leiste nicht sichtbar, bestehender „Einstellungen"-Textlink weiterhin sichtbar. Auf `/neu/partner` (mobil): keine Leiste vorhanden (0 Treffer). Alle Live-Prüfungen bestanden. Anschließend vollständiger Rückbau: temporäres Testskript und Screenshots gelöscht, `npm uninstall playwright` ausgeführt, `git status --short package.json package-lock.json` danach wieder leer bestätigt.
- Abweichungen:
  - Der ursprüngliche `py-10`-Innenabstand auf `/neu/einstellungen` wurde in `pt-10` plus einen responsiven unteren Abstand (`pb-24` mobil, `sm:pb-10` breit) aufgeteilt, damit der vorherige visuelle Abstand oben unverändert bleibt und nur unten mobil Platz für die neue Leiste entsteht. Das ist eine direkte Folge aus Abnahmekriterium 4 („ausreichend unteren Inhaltsabstand") und keine stille Zusatzänderung.
  - Der bestehende „Einstellungen"-Link auf `/neu` wurde mobil ausgeblendet statt entfernt, exakt wie in Abnahmekriterium 5 ausdrücklich erlaubt.
- offene Punkte: keine.
- Commit:

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend
- Nachschärfung:
- Product-Map aktualisiert: nein
