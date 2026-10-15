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
  assert(component.includes("applyManualPmsOverride(estimatedPhase, manualPmsSection, date)"), "der Kalender wendet die Übersteuerung auf die Schätzung an, nicht umgekehrt");
  const phaseAssignment = component.match(/const dayClassName = `relative grid[\s\S]*?\$\{\s*storedPeriod \|\| runningPeriod[\s\S]*?: phase/);
  assert(Boolean(phaseAssignment), "storedPeriod/runningPeriod bleiben in der Darstellungspriorität vor der (ggf. übersteuerten) Phase");
  assert(component.includes("isManualPmsToday = isWithinManualPmsSection(manualPmsSection, todayKey)"), "der Zyklus-Kreis nutzt denselben Abschnitt für den heutigen Tag");
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
