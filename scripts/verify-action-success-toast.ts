import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const componentPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "NewCycleExample.tsx",
);
const source = readFileSync(componentPath, "utf8");

console.log("\n== WP-012: ActionToast-Komponente existiert als eigenständiges, zugängliches Hinweis-Muster ==");
{
  assert(source.includes("function ActionToast({ message, onDismiss }: { message: string; onDismiss: () => void })"), "ActionToast nimmt eine beliebige Nachricht entgegen");
  const toastBlockMatch = source.match(/function ActionToast[\s\S]*?\n}\n/);
  const toastBlock = toastBlockMatch?.[0] ?? "";
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
    const fnMatch = source.match(new RegExp(`function ${fn}\\([^)]*\\)[\\s\\S]*?\\n  \\}\\n`));
    const fnBody = fnMatch?.[0] ?? "";
    assert(fnBody.includes('showActionToast("Gespeichert.")'), `${label} (${fn}) löst 'Gespeichert.' aus`);
  }

  const deletedPaths = [{ fn: "handlePeriodDeleted", label: "Formular-Löschen einer Periode" }];
  for (const { fn, label } of deletedPaths) {
    const fnMatch = source.match(new RegExp(`function ${fn}\\([^)]*\\)[\\s\\S]*?\\n  \\}\\n`));
    const fnBody = fnMatch?.[0] ?? "";
    assert(fnBody.includes('showActionToast("Gelöscht.")'), `${label} (${fn}) löst 'Gelöscht.' aus`);
  }

  const confirmDeleteEdgeMatch = source.match(/async function confirmDeleteEdge\(\)[\s\S]*?\n  \}\n/);
  const confirmDeleteEdgeBody = confirmDeleteEdgeMatch?.[0] ?? "";
  const toastCallCount = (confirmDeleteEdgeBody.match(/showActionToast\("Gelöscht\."\)/g) ?? []).length;
  assert(toastCallCount === 2, "confirmDeleteEdge löst 'Gelöscht.' in beiden Zweigen aus (Einzeltag und Randtag)");
}

console.log("\n== WP-012: die Erfolgsmeldung steht ausschließlich nach erfolgreicher Antwort, nie vor einem Fehler-Return ==");
{
  const dayActionFns = ["beginPeriodAtSelectedDay", "endPeriodAtSelectedDay", "confirmDeleteEdge"];
  for (const fn of dayActionFns) {
    const fnMatch = source.match(new RegExp(`(?:async )?function ${fn}\\([^)]*\\)[\\s\\S]*?\\n  \\}\\n`));
    const fnBody = fnMatch?.[0] ?? "";
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
