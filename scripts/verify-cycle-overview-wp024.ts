import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deriveCycleOverviewPresentation } from "../src/lib/cycle-overview-presentation";
import type { PersonalCycleView } from "../src/lib/personal-cycle-view";

let failures = 0;
function assert(condition: boolean, label: string) { console.log(`${condition ? "OK  " : "FAIL"} ${label}`); if (!condition) failures += 1; }
const base: PersonalCycleView = { status: "personal", cycleLengthDays: 28, todayPhase: null, isEstimate: true, periodLengthDays: 5, anchorPeriodStart: "2026-10-01", todayCycleDay: 10, isRunning: false, isUncertain: false };
const prediction = { cycleLengthDays: 28, periodLengthDays: 5, source: "history" as const, nextPeriodStart: "2026-10-29", nextPeriodEnd: "2026-11-02", ovulationDate: "2026-10-15", fertileWindowStart: "2026-10-10", fertileWindowEnd: "2026-10-16", pmsStart: "2026-10-24", pmsEnd: "2026-10-28", isUncertain: false, futureCycles: [] };

const running = deriveCycleOverviewPresentation({ ...base, isRunning: true, todayCycleDay: 2, todayPhase: "period" }, prediction, "2026-10-20", "2026-10-24");
assert(running.centerText === "2. Periodentag", "laufende tatsächliche Periode zeigt genau den Periodentag");
assert(running.expectedEndDate === "2026-10-24", "gespeichertes voraussichtliches Ende wird übernommen");
const normal = deriveCycleOverviewPresentation(base, prediction, "2026-10-20", null);
assert(normal.centerText === "9 Tage bis zur nächsten Periode", "bestehender Countdown liefert die einzige Ringaussage außerhalb der Periode");
assert(normal.reliableCycleLengthDays === 28, "nur persönlicher Status liefert die individuelle Zykluslänge");
const empty = deriveCycleOverviewPresentation({ ...base, status: "no_data", cycleLengthDays: null, todayCycleDay: null }, prediction, "2026-10-20", null);
assert(empty.centerText === null && empty.nextPeriodDate === null, "no_data zeigt keine erfundene Prognose");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const partnerView = readFileSync(path.join(root, "src/lib/new-partner-cycle-view.ts"), "utf8");
const route = readFileSync(path.join(root, "src/app/api/neu/partner/cycle-ring-sharing/route.ts"), "utf8");
const panel = readFileSync(path.join(root, "src/components/CycleOverviewPanel.tsx"), "utf8");
assert(partnerView.includes("partner_user_id = $1 AND status = 'active' LIMIT 1") && !/AND\s+cycle_ring_shared/.test(partnerView.replace(/\/\*[\s\S]*?\*\//g, "")), "WP-027: Partnerdaten werden vor dem Laden allein durch die aktive Verbindung geschützt (kein cycle_ring_shared-Gate mehr)");
assert(route.includes("requestHasAllowedOrigin") && route.includes('typeof shared !== "boolean"'), "Setter prüft Ursprung und Boolean");
assert(panel.includes("ca.") && panel.includes("Kann abweichen"), "alle Prognosedaten sind sichtbar unsicher gekennzeichnet");
assert(panel.includes("sm:grid-cols-[17rem_minmax(0,1fr)]"), "breit nutzt der Ring eine feste kompakte Spalte statt der halben Breite");
assert(panel.includes("grid-cols-[minmax(9.5rem,0.95fr)_minmax(0,1.05fr)]"), "auch mobil bleiben kompakter Ring links und flexible Textspalte rechts horizontal angeordnet");
assert((panel.match(/<CyclePersonalRing/g) ?? []).length === 1 && panel.includes("centerText={presentation.centerText} compact"), "mobil und breit verwenden denselben kompakten Ring");
assert(panel.includes("data-cycle-status-texts") && !panel.includes('data-cycle-status-texts className="space-y-2 rounded'), "rechte Spalte ist ein schlichter Textbereich ohne zusätzliche Kartenfläche");
assert(panel.includes("<span className=\"font-semibold\">Zyklus:</span>"), "Textspalte zeigt die vorhandene Zykluslänge kompakt als 'Zyklus: N Tage'");
assert(readFileSync(path.join(root, "src/lib/cycle-overview-presentation.ts"), "utf8").includes("Du bist gerade in der PMS-Phase."), "konkreter bestehender Phasenstatus wird als klare Aussage gezeigt");
const ringSource = readFileSync(path.join(root, "src/components/CyclePersonalRing.tsx"), "utf8");
assert(ringSource.includes('<tspan x="160">') && ringSource.includes("nächsten Periode</tspan>"), "lange Countdown-Aussage bricht innerhalb des kompakten Rings lesbar um");
assert(ringSource.includes("Math.floor(80 / label.length)") && ringSource.includes("labelRotation"), "Phasenbeschriftungen werden nach Wortlänge verkleinert und entlang ihres Ringsegments ausgerichtet");
console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
