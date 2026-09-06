import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sourceRoot = process.cwd();
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-wp-shadow-'));
const packageDir = path.join(fixtureRoot, 'docs', 'work-packages');
const scriptDir = path.join(fixtureRoot, 'scripts');
fs.mkdirSync(packageDir, { recursive: true });
fs.mkdirSync(scriptDir, { recursive: true });
fs.copyFileSync(
  path.join(sourceRoot, 'scripts', 'work-package-state.mjs'),
  path.join(scriptDir, 'work-package-state.mjs'),
);

function writeState() {
  fs.writeFileSync(path.join(packageDir, 'STATE.json'), `${JSON.stringify({
    schemaVersion: 1,
    revision: 0,
    reviewedRevision: 0,
    updatedAt: '2026-09-06',
    changedPackages: [],
    openPackages: [],
    openCount: 0,
    openLimit: 3,
  }, null, 2)}\n`);
}

function writePackage(sequence, status = 'approved') {
  const id = `WP-20260906-${String(sequence).padStart(3, '0')}-schattentest-${sequence}`;
  fs.writeFileSync(path.join(packageDir, `${id}.md`), `---\nid: ${id}\ntitle: "Schattentest ${sequence}"\nstatus: ${status}\ncreated: 2026-09-06\nupdated: 2026-09-06\nowner_approved: yes\nexecutor: claude\nproduct_area: "Test"\n---\n`);
  return id;
}

function run(...args) {
  return execFileSync(process.execPath, ['scripts/work-package-state.mjs', ...args], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  }).trim();
}

try {
  writeState();
  assert.match(run('status'), /update=nein/);

  const first = writePackage(1);
  run('mark-updated', first);
  assert.match(run('status'), new RegExp(`update=ja.*geändert=${first}`));
  run('acknowledge');
  assert.match(run('status'), /update=nein/);

  writePackage(2);
  writePackage(3);
  run('mark-updated', first);
  assert.match(run('status'), /offen=3\/3/);

  writePackage(4);
  const blocked = spawnSync(process.execPath, ['scripts/work-package-state.mjs', 'validate'], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /Zu viele offene Aufgaben: 4\/3/);

  console.log('OK: 3 Schattenszenarien bestanden');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
