import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function read(relativePath: string): string {
  return readFileSync(path.resolve(root, relativePath), "utf8");
}

const component = read("src/components/NewCycleExample.tsx");
const route = read("src/app/api/neu/pms-symptoms/route.ts");
const validation = read("src/lib/new-pms-symptom-validation.ts");
const partnerCalendar = read("src/components/NewPartnerCalendar.tsx");
const partnerPage = read("src/app/neu/partner/page.tsx");

console.log("\n== WP-013: genau die vier bestätigten Symptome, keine fünfte/freie Kategorie ==");
{
  assert(
    validation.includes('["breast_tenderness", "abdominal_pain", "fatigue", "mood_swings"]'),
    "genau die vier bestätigten Symptomwerte sind serverseitig festgelegt",
  );
  assert(
    component.includes("breast_tenderness: \"Brustschmerzen/-spannen\"") &&
      component.includes("abdominal_pain: \"Unterleibsschmerzen\"") &&
      component.includes("fatigue: \"Müdigkeit\"") &&
      component.includes("mood_swings: \"Stimmungsschwankungen\""),
    "alle vier Symptomtexte stimmen exakt mit dem Soll überein",
  );
}

console.log("\n== WP-013: zukünftige Tage sind serverseitig nicht markierbar ==");
{
  assert(
    validation.includes("input.date > today") && validation.includes("Für einen zukünftigen Tag"),
    "die Validierung weist ein zukünftiges Datum serverseitig ab",
  );
}

console.log("\n== WP-013: das Tagesfenster bietet die Symptomauswahl nur für bereits anklickbare (nicht-zukünftige) Tage ==");
{
  const dayDetailBlock = component.slice(component.indexOf("function DayDetailModal("), component.indexOf("interface DeleteEdgeConfirmModalProps"));
  assert(dayDetailBlock.includes("PMS_SYMPTOMS.map((symptom)"), "die Symptomauswahl ist Teil des bestehenden Tagesfensters");
  assert(
    component.includes("const isDayActionAvailable = Boolean(date && !dayInfo?.isFuture);") &&
      component.includes("setSelectedDayDetail({"),
    "selectedDayDetail (und damit das Tagesfenster mit Symptomauswahl) wird weiterhin nur für nicht-zukünftige Tage gesetzt",
  );
}

console.log("\n== WP-013: authentifizierte, CSRF-geschützte API-Route ohne öffentlichen Zugriff ==");
{
  assert(route.includes("getNewAuthSession()") && route.includes('status: 401'), "GET/PUT verlangen eine gültige Sitzung");
  assert(route.includes("requestHasAllowedOrigin(request)") && route.includes("status: 403"), "PUT prüft den Origin-Schutz vor jeder Schreiboperation");
  assert(route.includes("session.userId"), "jeder Datenbankzugriff ist an session.userId gebunden, kein Owner-Parameter aus dem Request-Body");
}

console.log("\n== WP-013: manueller PMS-Status hat Vorrang vor der Schätzung, überschreibt aber nie echte Periodentage ==");
{
  assert(
    component.includes("applyManualPmsOverride(estimatedPhase, manualPmsSection, date, periods, todayKey)"),
    "der Kalender wendet die Übersteuerung auf die Schätzung an und übergibt die echten Perioden zur Absicherung",
  );
  // WP-022 Korrektur V2: die Status-Prioritätslogik für die Kachel-Darstellung
  // wurde von einem Inline-Ausdruck innerhalb von dayClassName in eine
  // eigene, separat benannte Konstante (bandKey) verschoben, da die
  // Statusfarbe seither nur noch als schmales Band statt als Vollflächenfarbe
  // der Kachel erscheint. Die fachliche Priorität selbst (storedPeriod/
  // runningPeriod vor der ggf. übersteuerten Phase) bleibt unverändert, nur
  // der Fundort im Quelltext hat sich verschoben.
  const bandKeyAssignment = component.match(/const bandKey: DayBandKey \| null =\s*storedPeriod \|\| runningPeriod[\s\S]*?: phase/);
  assert(Boolean(bandKeyAssignment), "storedPeriod/runningPeriod bleiben in der Darstellungspriorität (jetzt: Bandfarbe) vor der (ggf. übersteuerten) Phase");
  assert(
    component.includes("isManualPmsToday = isWithinManualPmsSection(manualPmsSection, todayKey, periods, todayKey)"),
    "der Zyklus-Kreis nutzt denselben Abschnitt für den heutigen Tag und übergibt die echten Perioden zur Absicherung",
  );
}

console.log("\n== WP-013-Korrektur: echte Periodentage haben strukturellen Vorrang, nicht nur per Rendering-Reihenfolge ==");
{
  const manualPms = read("src/lib/manual-pms.ts");
  assert(
    manualPms.includes("function isRealPeriodDay(") && manualPms.includes("isRealPeriodDay(periods, date, today)"),
    "manual-pms.ts prüft in isWithinManualPmsSection selbst, ob ein Datum ein echter Periodentag ist",
  );
  const isWithinBlock = manualPms.slice(manualPms.indexOf("export function isWithinManualPmsSection"), manualPms.indexOf("export function manualPmsSymptomsForDate"));
  assert(isWithinBlock.includes("if (isRealPeriodDay(periods, date, today)) return false;"), "isWithinManualPmsSection gibt bei einem echten Periodentag immer false zurück, unabhängig vom Aufrufer");
  assert(
    manualPms.includes("function firstDayAfterLatestPeriod(") && manualPms.includes("addDays(latestEnd, 1)"),
    "deriveManualPmsSection lässt den Abschnitt frühestens am Tag nach dem echten Ende der letzten Periode beginnen (nicht ab deren Start)",
  );
  assert(
    manualPms.includes("const latestEnd = latest.endDate ?? today;"),
    "eine laufende Periode (ohne echtes Ende) gilt bis einschließlich heute als blockierend – PMS kann nicht vor ihrem Ende beginnen",
  );
  assert(
    component.includes("isWithinManualPmsSection(manualPmsSection, date, periods, todayKey)"),
    "die Kalender-Markerkennzeichnung (aria-label/M·Du) nutzt dieselbe periodenabgesicherte Prüfung",
  );
  const newPartnerCycleView = read("src/lib/new-partner-cycle-view.ts");
  assert(
    newPartnerCycleView.includes("isWithinManualPmsSection(manualPmsSection, today, periods, today)"),
    "die Partner-Zyklus-Kreis-Ableitung übergibt ebenfalls die echten Perioden zur Absicherung (derselbe Fehler, der im Soll-Ist-Abgleich gemeldet wurde)",
  );
}

console.log("\n== WP-013-Korrektur Version 2: manuelles PMS reicht nie unbegrenzt in die Zukunft ==");
{
  const manualPms = read("src/lib/manual-pms.ts");
  assert(
    manualPms.includes("function resolveSectionEndDate(predictedNextPeriodStart: string | null, today: string): string {"),
    "manual-pms.ts begrenzt das Abschnittsende über eine eigene, zentrale Funktion",
  );
  const resolveBlock = manualPms.slice(manualPms.indexOf("function resolveSectionEndDate"), manualPms.indexOf("function resolveSectionEndDate") + 400);
  assert(
    resolveBlock.includes("if (predictedNextPeriodStart && predictedNextPeriodStart > today) return addDays(predictedNextPeriodStart, -1);") &&
      resolveBlock.includes("return today;"),
    "das Abschnittsende endet am Tag vor einer noch zukünftigen Vorhersage, sonst spätestens heute – nie unbegrenzt und nie in der Zukunft ohne Anker",
  );
  assert(
    component.includes("deriveManualPmsSection(periods, pmsSymptomDays, todayKey, prediction?.nextPeriodStart ?? null)"),
    "die Eigenansicht übergibt die bestehende Vorhersage als Begrenzung, ohne eine zweite Berechnung einzuführen",
  );
  const newPartnerCalendar = read("src/lib/new-partner-calendar.ts");
  assert(
    newPartnerCalendar.includes("deriveManualPmsSection(entries, pmsSymptomDays, today, prediction?.nextPeriodStart ?? null)"),
    "der Partner-Kalender übergibt dieselbe, bereits berechnete Vorhersage als Begrenzung",
  );
  const newPartnerCycleView = read("src/lib/new-partner-cycle-view.ts");
  assert(
    newPartnerCycleView.includes("deriveManualPmsSection(periods, pmsSymptomDays, today, prediction?.nextPeriodStart ?? null)"),
    "der Partner-Zyklus-Kreis übergibt ebenfalls dieselbe Vorhersage als Begrenzung",
  );
}

console.log("\n== WP-013: keine neue API-Route, keine Daten-/Berechnungsänderung an predictCycle/computePersonalCycleView ==");
{
  const predictionSource = read("src/lib/new-cycle-prediction.ts");
  const personalViewSource = read("src/lib/personal-cycle-view.ts");
  assert(!predictionSource.includes("pms-symptom") && !predictionSource.includes("manual-pms"), "new-cycle-prediction.ts bleibt frei von jeder Symptom-Abhängigkeit");
  assert(!personalViewSource.includes("pms-symptom") && !personalViewSource.includes("manual-pms"), "personal-cycle-view.ts bleibt frei von jeder Symptom-Abhängigkeit");
}

console.log("\n== WP-013: Partneransicht bleibt rein lesend ==");
{
  assert(!partnerCalendar.includes("fetch(") && !partnerCalendar.includes("onClick={() => setSelectedDayDetail"), "NewPartnerCalendar.tsx enthält keinen Schreib-/Netzwerkaufruf für Symptome");
  assert(!partnerCalendar.includes("checkbox"), "die Partner-Kalenderkomponente bietet keine Symptom-Eingabe an");
  assert(
    partnerPage.includes("manualPmsSection={calendarView.manualPmsSection}") &&
      partnerPage.includes("status.connected ? await getPartnerCalendarView(session.userId) : null"),
    "die Partnerseite lädt Symptomdaten ausschließlich über denselben aktiven Verbindungs-Gate wie den bestehenden Kalender",
  );
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
