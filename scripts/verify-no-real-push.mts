import { readFile, access } from "node:fs/promises";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

console.log("== Version 4 Push-Routen und -Komponenten wurden entfernt ==");
{
  assert(!(await fileExists("src/app/api/neu/partner/push-subscription/route.ts")), "push-subscription Route existiert nicht mehr");
  assert(!(await fileExists("src/app/api/neu/partner/push-test/route.ts")), "push-test Route existiert nicht mehr");
  assert(!(await fileExists("src/components/NewPartnerPushActivation.tsx")), "NewPartnerPushActivation Komponente existiert nicht mehr");
  assert(!(await fileExists("src/lib/new-partner-push.ts")), "new-partner-push Dispatch-Modul existiert nicht mehr");
  assert(!(await fileExists("src/lib/berlin-date.ts")), "berlin-date Hilfsmodul existiert nicht mehr");
}

console.log("\n== Neue Komponente fordert keine Geräteberechtigung an und sendet keine Nachricht ==");
{
  const source = await readIfExists("src/components/NewPartnerNotificationPreference.tsx");
  assert(source !== null, "Datei konnte gelesen werden");
  if (source !== null) {
    assert(!/Notification\.requestPermission/.test(source), "kein Aufruf von Notification.requestPermission");
    assert(!/PushManager/.test(source), "kein Bezug zu PushManager");
    assert(!/serviceWorker/.test(source), "kein Bezug zu serviceWorker");
    assert(!/push-subscription|push-test/.test(source), "kein Aufruf der entfernten Push-Routen");
    assert(/notification-preference/.test(source), "ruft ausschließlich die neue, rein informative Route auf");
  }
}

console.log("\n== API-Route der Auswahl fordert keine Geräteberechtigung an ==");
{
  const source = await readIfExists("src/app/api/neu/partner/notification-preference/route.ts");
  assert(source !== null, "Datei konnte gelesen werden");
  if (source !== null) {
    assert(!/Notification\.requestPermission|PushManager|web-push|VAPID|vapid/.test(source), "kein Bezug zu Push/VAPID im Routen-Code");
  }
}

console.log("\n== Perioden-Routen lösen keinen Partner-Push mehr aus ==");
for (const path of ["src/app/api/neu/periods/route.ts", "src/app/api/neu/periods/[id]/route.ts"]) {
  const source = await readIfExists(path);
  assert(source !== null, `${path} konnte gelesen werden`);
  if (source !== null) {
    assert(!/dispatchPartnerPeriodEvent/.test(source), `${path} ruft dispatchPartnerPeriodEvent nicht mehr auf`);
    assert(!/new-partner-push/.test(source), `${path} importiert das Push-Dispatch-Modul nicht mehr`);
  }
}

console.log("\n== Keine VAPID-Umgebungsvariablen wurden im Anwendungscode referenziert (außer Dokumentation) ==");
{
  const preferenceLib = await readIfExists("src/lib/new-partner-notification-preference.ts");
  assert(preferenceLib !== null && !/VAPID|vapid|web-push/.test(preferenceLib), "new-partner-notification-preference.ts enthält keinen VAPID-/web-push-Bezug");
}

console.log("\n== Bereits migrierte Push-Tabellen bleiben als ungenutzte Altstruktur bestehen (nicht gelöscht) ==");
{
  assert(
    await fileExists("database/luma-core/migrations/202609111200_partner_push.sql"),
    "die Migration für new_partner_push_subscriptions/new_partner_period_events wurde nicht entfernt",
  );
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
