import { createElement } from "react";
import { renderToString } from "react-dom/server";
import CyclePersonalRing from "../src/components/CyclePersonalRing";
import { computePersonalCycleView } from "../src/lib/personal-cycle-view";
import type { NewPeriodEntryOpen } from "../src/lib/new-period-validation";

let failures = 0;
function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const today = "2026-10-19";
const periods: NewPeriodEntryOpen[] = [
  { id: "a", startDate: "2026-08-05", endDate: "2026-08-09", expectedEndDate: null },
  { id: "b", startDate: "2026-09-02", endDate: "2026-09-06", expectedEndDate: null },
  { id: "c", startDate: "2026-09-30", endDate: "2026-10-04", expectedEndDate: null },
];
const view = computePersonalCycleView(periods, { cycleLengthDays: 28 }, today);


console.log("\n== WP-022 Korrektur V7: eindeutige SVG-IDs je Ringinstanz ==");
{
  // Mobile + wide instance rendered side by side in one document, as on /neu
  // and /neu/partner; ids must not collide between them.
  const html = renderToString(
    createElement(
      "div",
      null,
      createElement("div", { className: "sm:hidden" }, createElement(CyclePersonalRing, { personalCycleView: view, today, compact: true })),
      createElement("div", { className: "hidden sm:block" }, createElement(CyclePersonalRing, { personalCycleView: view, today })),
    ),
  );
  const svgs = html.split("<svg").slice(1).map((chunk) => chunk.split("</svg>")[0]);
  assert(svgs.length === 2, "zwei Ringinstanzen (mobil und breit) im selben Dokument");

  const idsPerSvg = svgs.map((svg) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const allIds = idsPerSvg.flat();
  assert(allIds.length > 0 && new Set(allIds).size === allIds.length, `keine kollidierenden IDs im Dokument (${allIds.length} IDs, alle eindeutig)`);
  assert(idsPerSvg.every((ids) => ids.length === 6), "jede Instanz definiert Titel, Beschreibung, Filter und drei Gradienten");

  svgs.forEach((svg, index) => {
    const own = new Set(idsPerSvg[index]);
    const urlRefs = [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
    assert(urlRefs.length >= 4 && urlRefs.every((ref) => own.has(ref)), `Instanz ${index + 1}: Filter und Phasenpfade zeigen nur auf eigene Definitionen`);
    const labelled = svg.match(/aria-labelledby="([^"]+)"/)?.[1].split(" ") ?? [];
    assert(labelled.length === 2 && labelled.every((ref) => own.has(ref)), `Instanz ${index + 1}: aria-labelledby zeigt auf eigenen Titel und eigene Beschreibung`);
    assert(urlRefs.every((ref) => /^[A-Za-z0-9_-]+$/.test(ref)), `Instanz ${index + 1}: IDs enthalten nur url()-sichere Zeichen`);
  });

  const mobileRefs = new Set([...svgs[0].matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]));
  const wideRefs = [...svgs[1].matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
  assert(wideRefs.every((ref) => !mobileRefs.has(ref)), "die breite Instanz verweist auf keine Definition der mobilen Instanz");
}

console.log("\n== WP-022 Korrektur V7: stabile Koordinaten-Serialisierung ==");
{
  const html = renderToString(createElement(CyclePersonalRing, { personalCycleView: view, today }));
  const coords = [...html.matchAll(/\s(?:cx|cy|x|y)="(-?\d+(?:\.\d+)?)"/g)].map((m) => m[1]);
  assert(coords.length > 0 && coords.every((value) => (value.split(".")[1] ?? "").length <= 3), "alle gerenderten Koordinaten haben höchstens drei Nachkommastellen");
  assert(/<circle cx="[\d.]+" cy="[\d.]+" r="6"/.test(html), "der rote Heute-Marker wird gerendert");
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
