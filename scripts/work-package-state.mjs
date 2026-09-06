import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const packageDir = path.join(root, 'docs', 'work-packages');
const statePath = path.join(packageDir, 'STATE.json');
const openStatuses = new Set(['approved', 'in_progress', 'on_hold', 'review']);
const allowedStatuses = new Set(['draft', ...openStatuses, 'completed', 'parked']);
const allowedTechnicalBriefs = new Set(['draft', 'blocked', 'complete']);
const executableStatuses = new Set(['approved', 'in_progress', 'review', 'completed']);
const requiredHeadings = [
  '## Owner-Ansicht – einfach erklärt',
  '## Entstehungsweg',
  '## Soll – von Codex',
  '## Technischer Auftrag für Claude',
  '## Ist – von Claude',
  '## Soll-Ist-Prüfung – von Codex',
];

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function packageFiles() {
  return fs.readdirSync(packageDir)
    .filter((name) => name.endsWith('.md') && name !== 'TEMPLATE.md' && name !== 'WORKFLOW.md');
}

function metaFor(file) {
  const text = fs.readFileSync(path.join(packageDir, file), 'utf8');
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) throw new Error(`${file}: Dateikopf fehlt`);
  const meta = {};
  for (const line of block[1].split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index < 0) continue;
    meta[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^"|"$/g, '');
  }
  return meta;
}

function packages() {
  return packageFiles().map((file) => ({ file, ...metaFor(file) }));
}

function currentOpen(items) {
  return items.filter((item) => openStatuses.has(item.status)).map((item) => item.id).sort();
}

function validate(state, items) {
  const errors = [];
  if (state.schemaVersion !== 1) errors.push('STATE: schemaVersion muss 1 sein');
  if (!Number.isInteger(state.revision) || state.revision < 0) errors.push('STATE: revision ungültig');
  if (!Number.isInteger(state.reviewedRevision) || state.reviewedRevision < 0 || state.reviewedRevision > state.revision) errors.push('STATE: reviewedRevision ungültig');
  if (state.openLimit !== 3) errors.push('STATE: openLimit muss 3 sein');
  const ids = new Set();
  for (const item of items) {
    if (!/^WP-\d{3}$/.test(item.id || '')) errors.push(`${item.file}: ID ungültig`);
    if (item.id && !item.file.startsWith(`${item.id}-`)) errors.push(`${item.file}: Dateiname muss mit ${item.id}- beginnen`);
    if (ids.has(item.id)) errors.push(`${item.file}: ID doppelt`);
    ids.add(item.id);
    if (!allowedStatuses.has(item.status)) errors.push(`${item.file}: status ungültig`);
    if (!allowedTechnicalBriefs.has(item.technical_brief)) errors.push(`${item.file}: technical_brief ungültig oder fehlt`);
    if (item.status !== 'draft' && item.brief_version !== '1') errors.push(`${item.file}: brief_version muss 1 sein`);
    if (executableStatuses.has(item.status) && item.technical_brief !== 'complete') {
      errors.push(`${item.file}: ausführbarer Status braucht technical_brief=complete`);
    }
    const packageText = fs.readFileSync(path.join(packageDir, item.file), 'utf8');
    if (item.status !== 'draft') {
      for (const heading of requiredHeadings) {
        if (!packageText.includes(heading)) errors.push(`${item.file}: Pflichtabschnitt fehlt: ${heading}`);
      }
    }
    if (item.status !== 'draft' && item.status !== 'parked' && item.owner_approved !== 'yes') errors.push(`${item.file}: offene oder abgeschlossene Aufgabe braucht Owner-Freigabe`);
  }
  const open = currentOpen(items);
  const numbers = items.map((item) => Number((item.id || '').slice(3))).filter(Number.isInteger).sort((a, b) => a - b);
  if (numbers.some((number, index) => index > 0 && number === numbers[index - 1])) errors.push('Arbeitspaket-Nummer doppelt');
  if (open.length > 3) errors.push(`Zu viele offene Aufgaben: ${open.length}/3`);
  if (JSON.stringify(open) !== JSON.stringify([...(state.openPackages || [])].sort())) errors.push('STATE: openPackages nicht aktuell');
  if (state.openCount !== open.length) errors.push('STATE: openCount nicht aktuell');
  for (const id of state.changedPackages || []) if (!ids.has(id)) errors.push(`STATE: geändertes Paket fehlt: ${id}`);
  return errors;
}

function writeState(state, items) {
  const open = currentOpen(items);
  state.openPackages = open;
  state.openCount = open.length;
  state.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

const command = process.argv[2] || 'status';
const state = readState();
const items = packages();

if (command === 'mark-updated') {
  const id = process.argv[3];
  if (!items.some((item) => item.id === id)) throw new Error(`Unbekannte Aufgabe: ${id}`);
  state.revision += 1;
  state.changedPackages = [...new Set([...(state.changedPackages || []), id])];
  writeState(state, items);
} else if (command === 'acknowledge') {
  state.reviewedRevision = state.revision;
  state.changedPackages = [];
  writeState(state, items);
} else if (!['status', 'validate'].includes(command)) {
  throw new Error('Erlaubt: status, validate, mark-updated <WP-ID>, acknowledge');
}

const checkedState = readState();
const errors = validate(checkedState, items);
if (errors.length) {
  console.error(`FEHLER (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (command === 'status') {
  const update = checkedState.revision > checkedState.reviewedRevision;
  console.log(`update=${update ? 'ja' : 'nein'} revision=${checkedState.revision} offen=${checkedState.openCount}/3 geändert=${checkedState.changedPackages.join(',') || '-'}`);
} else {
  console.log(`OK: Work-Package-State gültig, offen ${checkedState.openCount}/3`);
}
