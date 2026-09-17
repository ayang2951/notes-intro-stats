'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..', '..');
const appSource = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const extensionSource = fs.readFileSync(
  path.join(projectRoot, 'vscode-extension', 'src', 'extension.js'),
  'utf8'
);
const previewSource = fs.readFileSync(
  path.join(projectRoot, 'vscode-extension', 'media', 'preview.js'),
  'utf8'
);

test('ordinary TeX equation labels are numbered on the site and in the preview', () => {
  assert.match(appSource, /const texIds = extractEquationLabels\(wrapper\.textContent\)/);
  assert.match(appSource, /removeManagedEquationLabels\(wrapper\.textContent\)/);
  assert.match(previewSource, /const texIds = extractEquationLabels\(equation\.textContent\)/);
  assert.match(previewSource, /removeManagedEquationLabels\(equation\.textContent\)/);
});

test('render messages carry the project index and a separate render revision', () => {
  assert.match(extensionSource, /renderRevision: generation/);
  assert.match(extensionSource, /projectReferences: equationReferenceRecords\(referenceIndex\)/);
  assert.match(previewSource, /mergeProjectEquationReferences\(referenceTargets, current\.projectReferences\)/);
  assert.match(previewSource, /message\.renderRevision <= newestRevision/);
});

test('cross-file links send only their ID and are resolved again by the extension', () => {
  assert.match(previewSource, /type: "revealReference",\s+id,\s+renderRevision:/);
  assert.doesNotMatch(previewSource, /type: "revealReference",\s+(?:uri|line|character):/);
  assert.match(extensionSource, /index = await this\.buildProjectEquationIndex/);
  assert.match(extensionSource, /document\.getText\(range\) !== message\.id/);
});

test('changes in any configured note refresh every related preview', () => {
  assert.match(extensionSource, /controller\.usesConfiguredNote\(event\.document\.uri\)/);
  assert.match(extensionSource, /createFileSystemWatcher\('\*\*\/\*\.md'\)/);
});
