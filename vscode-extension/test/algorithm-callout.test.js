'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..', '..');
const appSource = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const previewSource = fs.readFileSync(path.join(projectRoot, 'vscode-extension', 'media', 'preview.js'), 'utf8');
const styles = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');

test('algorithm is a numbered callout in both site and preview', () => {
  assert.match(appSource, /const CALLOUT_TYPES = \[[\s\S]*?"algorithm"[\s\S]*?\];/);
  assert.match(previewSource, /const CALLOUT_TYPES = \[[\s\S]*?"algorithm"[\s\S]*?\];/);
});

test('algorithm has its own light and dark blue-navy palette', () => {
  assert.equal((styles.match(/--alg-color:/g) || []).length, 2);
  assert.equal((styles.match(/--alg-bkgd:/g) || []).length, 2);
  assert.match(styles, /\.callout\.algorithm\s*\{[\s\S]*?var\(--alg-color\)[\s\S]*?var\(--alg-bkgd\)/);
});
