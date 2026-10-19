import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

/**
 * WP-022 Korrektur V4: extracts a top-level function's body by counting
 * braces instead of searching for a literal "\n}\n"/"\n  }\n" — the previous
 * regex-based approach broke once NewCycleExample.tsx's calendar section
 * grew a nested IIFE wrapper (unrelated to any of the functions checked
 * here), since the exact indentation pattern no longer matched the real
 * function's closing brace and instead matched some other, unrelated
 * brace earlier or later in the file. Mirrors the identical fix already
 * applied to scripts/verify-today-card.ts for the same root cause.
 */
function extractFunctionBody(source: string, functionStartNeedle: string): string {
  const fnStart = source.indexOf(functionStartNeedle);
  if (fnStart === -1) return "";
  const parenStart = source.indexOf("(", fnStart);
  if (parenStart === -1) return "";
  let parenDepth = 0;
  let bodyStart = -1;
  for (let i = parenStart; i < source.length; i += 1) {
    if (source[i] === "(") parenDepth += 1;
    else if (source[i] === ")") {
      parenDepth -= 1;
      if (parenDepth === 0) {
        const brace = source.indexOf("{", i);
        if (brace === -1) return "";
        bodyStart = brace;
        break;
      }
    }
  }
  if (bodyStart === -1) return "";
  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(fnStart, i + 1);
    }
  }
  return "";
}

const componentPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "NewCycleExample.tsx",
);
// WP-022 Korrektur V4: this file contains a pre-existing mix of LF and CRLF
// line endings around the toast-rendering ternary (unrelated to this
// correction); normalize so the exact multi-line string assertions below
// compare content, not an incidental line-ending difference.
const source = readFileSync(componentPath, "utf8").replace(/\r\n/g, "\n");

console.log("\n== WP-012: ActionToast-Komponente existiert als eigenständiges, zugängliches Hinweis-Muster ==");
{
  assert(source.includes("function ActionToast({ message, onDismiss }: { message: string; onDismiss: () => void })"), "ActionToast nimmt eine beliebige Nachricht entgegen");
  const toastBlock = extractFunctionBody(source, "function ActionToast(");
  assert(toastBlock.includes('role="status"') && toastBlock.includes('aria-live="polite"'), "ActionToast trägt role=status und aria-live=polite");
  assert(toastBlock.includes("setTimeout(onDismiss, ACTION_TOAST_DURATION_MS)"), "ActionToast schließt sich automatisch nach einer festen Dauer");
  assert(toastBlock.includes('aria-label="Hinweis schließen"') && toastBlock.includes("onClick={onDismiss}"), "ActionToast hat einen manuellen Schließen-Button");
}

console.log("\n== WP-012: showActionToast blendet den Start-Hinweis aus (höchstens ein Hinweis gleichzeitig) ==");
{
  assert(
    source.includes("function showActionToast(message: string) {\n    setIsNoDataToastVisible(false);\n    setActionToastMessage(message);\n  }"),
    "showActionToast setzt isNoDataToastVisible auf false, bevor die Erfolgsmeldung gesetzt wird",
  );
  assert(
    source.includes("{actionToastMessage ? (\n        <ActionToast message={actionToastMessage} onDismiss={() => setActionToastMessage(null)} />\n      ) : (\n        isNoDataToastVisible && <NoDataToast onDismiss={() => setIsNoDataToastVisible(false)} />\n      )}"),
    "beim Rendern wird entweder ActionToast oder NoDataToast gezeigt, nie beide gleichzeitig",
  );
}

console.log("\n== WP-012: alle sechs bestehenden Erfolgswege lösen die passende Erfolgsmeldung aus ==");
{
  const savedPaths = [
    { fn: "handlePeriodSaved", label: "Formular-Speichern (neu/bearbeiten)" },
    { fn: "handleCycleLengthSaved", label: "Zykluslänge speichern" },
    { fn: "beginPeriodAtSelectedDay", label: "Tagesbeginn setzen" },
    { fn: "endPeriodAtSelectedDay", label: "Tagesende setzen" },
  ];
  for (const { fn, label } of savedPaths) {
    const fnBody = extractFunctionBody(source, `function ${fn}(`) || extractFunctionBody(source, `async function ${fn}(`);
    assert(fnBody.includes('showActionToast("Gespeichert.")'), `${label} (${fn}) löst 'Gespeichert.' aus`);
  }

  const deletedPaths = [{ fn: "handlePeriodDeleted", label: "Formular-Löschen einer Periode" }];
  for (const { fn, label } of deletedPaths) {
    const fnBody = extractFunctionBody(source, `function ${fn}(`) || extractFunctionBody(source, `async function ${fn}(`);
    assert(fnBody.includes('showActionToast("Gelöscht.")'), `${label} (${fn}) löst 'Gelöscht.' aus`);
  }

  const confirmDeleteEdgeBody = extractFunctionBody(source, "async function confirmDeleteEdge(");
  const toastCallCount = (confirmDeleteEdgeBody.match(/showActionToast\("Gelöscht\."\)/g) ?? []).length;
  assert(toastCallCount === 2, "confirmDeleteEdge löst 'Gelöscht.' in beiden Zweigen aus (Einzeltag und Randtag)");
}

console.log("\n== WP-012: die Erfolgsmeldung steht ausschließlich nach erfolgreicher Antwort, nie vor einem Fehler-Return ==");
{
  const dayActionFns = ["beginPeriodAtSelectedDay", "endPeriodAtSelectedDay", "confirmDeleteEdge"];
  for (const fn of dayActionFns) {
    const fnBody = extractFunctionBody(source, `function ${fn}(`) || extractFunctionBody(source, `async function ${fn}(`);
    const errorReturnIndex = fnBody.indexOf("setDayActionError(");
    const toastIndex = fnBody.indexOf("showActionToast(");
    assert(
      errorReturnIndex !== -1 && toastIndex !== -1 && errorReturnIndex < toastIndex,
      `${fn}: der Fehlerpfad (setDayActionError) steht vor dem Erfolgshinweis im Quelltext (kein Erfolgshinweis bei Fehler)`,
    );
  }
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
