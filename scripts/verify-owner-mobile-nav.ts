import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const navPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "NewOwnerMobileNav.tsx");
const navSource = readFileSync(navPath, "utf8");

const homePagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "neu", "page.tsx");
const homeSource = readFileSync(homePagePath, "utf8");

const settingsPagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "neu", "einstellungen", "page.tsx");
const settingsSource = readFileSync(settingsPagePath, "utf8");

const partnerPagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app", "neu", "partner", "page.tsx");
const partnerSource = readFileSync(partnerPagePath, "utf8");

console.log("\n== WP-021: NewOwnerMobileNav enthält genau zwei Links mit den vereinbarten Zielen und Namen ==");
{
  assert(navSource.includes('href: "/neu"') && navSource.includes('label: "Home"'), "ein Tab verlinkt auf /neu mit dem Namen 'Home'");
  assert(navSource.includes('href: "/neu/einstellungen"') && navSource.includes('label: "Einstellungen"'), "ein Tab verlinkt auf /neu/einstellungen mit dem Namen 'Einstellungen'");
  const tabsMatch = navSource.match(/const tabs = \[([\s\S]*?)\] as const;/);
  const tabCount = tabsMatch ? (tabsMatch[1].match(/\{ href:/g) ?? []).length : 0;
  assert(tabCount === 2, `genau zwei Tabs sind definiert (gefunden: ${tabCount})`);
}

console.log("\n== WP-021: der aktive Tab ist über aria-current=\"page\" programmatisch erkennbar ==");
{
  assert(navSource.includes('aria-current={isActive ? "page" : undefined}'), "aria-current wird dynamisch anhand des aktuellen Pfads gesetzt");
  assert(navSource.includes("usePathname()"), "der aktuelle Pfad wird über usePathname() ermittelt (kein neues globales State-Management)");
  assert(navSource.includes('"use client"'), "NewOwnerMobileNav ist eine Client-Komponente (usePathname benötigt Client-Kontext)");
}

console.log("\n== WP-021: die Leiste ist mobile-only (unterhalb sm) und berücksichtigt die sichere untere Kante ==");
{
  assert(navSource.includes("sm:hidden"), "die Leiste wird ab sm ausgeblendet");
  assert(navSource.includes("fixed inset-x-0 bottom-0"), "die Leiste ist unten fixiert");
  assert(navSource.includes("env(safe-area-inset-bottom)"), "die Leiste berücksichtigt die sichere untere Bildschirmkante");
  assert(navSource.includes("min-h-12"), "jeder Tab hat eine ausreichend große Tippfläche (min-h-12 = 48px)");
}

console.log("\n== WP-021: keine neue Abhängigkeit, keine neue Route, keine Datenlogik ==");
{
  assert(navSource.includes('from "next/link"') && navSource.includes('from "next/navigation"'), "nur next/link und next/navigation werden verwendet, keine neue Bibliothek");
  assert(!navSource.includes("fetch("), "NewOwnerMobileNav löst keinen Netzwerkaufruf aus");
  assert(!navSource.includes("useState") && !navSource.includes("useEffect"), "keine zusätzliche State- oder Effect-Logik über die reine Pfaderkennung hinaus");
}

console.log("\n== WP-021: die Navigation ist in den normalen, authentifizierten Rückgabepfad von /neu eingebunden, nicht in die Gates ==");
{
  assert(homeSource.includes('import NewOwnerMobileNav from "@/components/NewOwnerMobileNav";'), "/neu importiert NewOwnerMobileNav");
  assert(homeSource.includes("<NewOwnerMobileNav />"), "/neu rendert NewOwnerMobileNav");

  const firstNameGateStart = homeSource.indexOf("if (!session.firstName)");
  const firstNameGateEnd = homeSource.indexOf("\n  }", firstNameGateStart);
  const firstNameGateBody = firstNameGateStart !== -1 && firstNameGateEnd !== -1 ? homeSource.slice(firstNameGateStart, firstNameGateEnd) : "";
  assert(!firstNameGateBody.includes("NewOwnerMobileNav"), "das Erstnamen-Gate rendert keine NewOwnerMobileNav");

  const onboardingGateStart = homeSource.indexOf("periodHistoryOnboardingSkipped");
  const onboardingGateEnd = homeSource.indexOf("\n  }", onboardingGateStart);
  const onboardingGateBody = onboardingGateStart !== -1 && onboardingGateEnd !== -1 ? homeSource.slice(onboardingGateStart, onboardingGateEnd) : "";
  assert(!onboardingGateBody.includes("NewOwnerMobileNav"), "das Perioden-Onboarding-Gate rendert keine NewOwnerMobileNav");

  const navIndex = homeSource.indexOf("<NewOwnerMobileNav />");
  const cycleExampleIndex = homeSource.indexOf("<NewCycleExample");
  assert(navIndex !== -1 && cycleExampleIndex !== -1 && navIndex > cycleExampleIndex, "NewOwnerMobileNav steht im normalen Rückgabepfad nach NewCycleExample, also im fertigen, authentifizierten Pfad");
}

console.log("\n== WP-021: die Navigation ist auf /neu/einstellungen eingebunden ==");
{
  assert(settingsSource.includes('import NewOwnerMobileNav from "@/components/NewOwnerMobileNav";'), "/neu/einstellungen importiert NewOwnerMobileNav");
  assert(settingsSource.includes("<NewOwnerMobileNav />"), "/neu/einstellungen rendert NewOwnerMobileNav");
}

console.log("\n== WP-021: der Partner-Nutzerweg (/neu/partner) bleibt vollständig ohne die neue Navigation ==");
{
  assert(!partnerSource.includes("NewOwnerMobileNav"), "/neu/partner referenziert NewOwnerMobileNav nicht");
  assert(partnerSource.includes("getPartnerConnectionStatusForPartner"), "der bestehende Partner-Gate bleibt unverändert eingebunden");
}

console.log("\n== WP-021: bestehende mobile Links, die durch die Leiste doppelt wären, sind mobil verborgen, bleiben aber breit erhalten ==");
{
  assert(
    homeSource.includes('<div className="hidden justify-end sm:flex">'),
    "der 'Einstellungen'-Link in der Home-Kopfzeile ist unterhalb sm verborgen (hidden), ab sm weiterhin sichtbar (sm:flex)",
  );
  assert(homeSource.includes('href="/neu/einstellungen"'), "der 'Einstellungen'-Link selbst bleibt im Quelltext unverändert vorhanden (nur mobil per CSS verborgen, nicht entfernt)");
}

console.log("\n== WP-021: die Owner-Seiten erhalten ausreichend unteren Inhaltsabstand, damit die Leiste nichts verdeckt ==");
{
  assert(homeSource.includes("pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))]"), "/neu hat mobil einen erweiterten unteren Innenabstand für die feste Leiste");
  assert(homeSource.includes("sm:pb-[max(2rem,env(safe-area-inset-bottom))]"), "/neu behält ab sm den bisherigen unteren Innenabstand");
  assert(settingsSource.includes("pb-24") && settingsSource.includes("sm:pb-10"), "/neu/einstellungen hat mobil einen erweiterten unteren Innenabstand (pb-24), ab sm den bisherigen (sm:pb-10)");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
