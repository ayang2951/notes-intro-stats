'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { parseHTML } = require(process.env.COURSE_NOTES_DOM_PATH || 'linkedom');

const projectRoot = process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname, '../..');
const {
  reuseInitializedComponents
} = require(path.join(projectRoot, 'vscode-extension/media/interactive-components.js'));

function contentWith(markup) {
  const { document } = parseHTML(`<article id="content">${markup}</article>`);
  return document.getElementById('content');
}

function slicer(id, attributes = '') {
  return `<div class="bivariate-normal-slicer" data-instance-id="${id}" ${attributes}></div>`;
}

test('unchanged initialized visualizations retain their exact DOM and canvas', () => {
  const current = contentWith(slicer(
    'gaussian',
    'data-correlation="0.5" data-source-line="10" data-source-key="old" data-initialized="true" data-slice-mode="y"'
  ));
  const existing = current.querySelector('.bivariate-normal-slicer');
  const canvas = existing.ownerDocument.createElement('canvas');
  existing.append(canvas);
  const next = contentWith(`<p>New paragraph</p>${slicer(
    'gaussian',
    'data-correlation="0.5" data-source-line="42" data-source-end-line="50" data-source-key="new"'
  )}`);

  assert.equal(reuseInitializedComponents(current, next), 1);
  const reused = next.querySelector('.bivariate-normal-slicer');
  assert.strictEqual(reused, existing);
  assert.strictEqual(reused.querySelector('canvas'), canvas);
  assert.equal(reused.getAttribute('data-source-line'), '42');
  assert.equal(reused.getAttribute('data-source-end-line'), '50');
  assert.equal(reused.getAttribute('data-source-key'), 'new');
  assert.equal(reused.getAttribute('data-slice-mode'), 'y');
});

test('a visualization setting change creates a fresh component', () => {
  const current = contentWith(slicer(
    'gaussian',
    'data-correlation="0" data-initialized="true"'
  ));
  const existing = current.querySelector('.bivariate-normal-slicer');
  const next = contentWith(slicer('gaussian', 'data-correlation="0.5"'));

  assert.equal(reuseInitializedComponents(current, next), 0);
  assert.notStrictEqual(next.querySelector('.bivariate-normal-slicer'), existing);
});

test('visualizations are matched by unique instance ID when their order changes', () => {
  const current = contentWith([
    slicer('first', 'data-title="First" data-initialized="true"'),
    slicer('second', 'data-title="Second" data-initialized="true"'),
    slicer('third', 'data-title="Third" data-initialized="true"')
  ].join(''));
  const existing = new Map(Array.from(current.querySelectorAll('.bivariate-normal-slicer'))
    .map((element) => [element.dataset.instanceId, element]));
  const next = contentWith([
    slicer('third', 'data-title="Third"'),
    slicer('first', 'data-title="First"'),
    slicer('second', 'data-title="Second"')
  ].join(''));

  assert.equal(reuseInitializedComponents(current, next), 3);
  const reordered = Array.from(next.querySelectorAll('.bivariate-normal-slicer'));
  assert.deepEqual(reordered.map((element) => element.dataset.instanceId), [
    'third',
    'first',
    'second'
  ]);
  reordered.forEach((element) => {
    assert.strictEqual(element, existing.get(element.dataset.instanceId));
  });
});

test('removed, new, missing-ID, and duplicate-ID components are not reused incorrectly', () => {
  const current = contentWith([
    slicer('removed', 'data-initialized="true"'),
    slicer('duplicate', 'data-initialized="true"'),
    slicer('duplicate', 'data-initialized="true"'),
    '<div class="bivariate-normal-slicer" data-initialized="true"></div>'
  ].join(''));
  const next = contentWith([
    slicer('new'),
    slicer('duplicate'),
    '<div class="bivariate-normal-slicer"></div>'
  ].join(''));

  assert.equal(reuseInitializedComponents(current, next), 0);
  assert.equal(next.querySelector('[data-instance-id="new"]').hasAttribute('data-initialized'), false);
  assert.equal(next.querySelector('[data-instance-id="duplicate"]').hasAttribute('data-initialized'), false);
});

test('reuse can be disabled when the document URI or workspace CSS changes', () => {
  const current = contentWith(slicer('gaussian', 'data-initialized="true"'));
  const existing = current.querySelector('.bivariate-normal-slicer');
  const next = contentWith(slicer('gaussian'));

  assert.equal(reuseInitializedComponents(current, next, { enabled: false }), 0);
  assert.notStrictEqual(next.querySelector('.bivariate-normal-slicer'), existing);
});

test('the Week 5 visualizations have stable, unique instance IDs', () => {
  const weekFive = fs.readFileSync(path.join(projectRoot, 'notes/week5.md'), 'utf8');
  const ids = Array.from(
    weekFive.matchAll(/data-instance-id="([^"]+)"/g),
    (match) => match[1]
  );

  assert.equal(ids.length, 3);
  assert.equal(new Set(ids).size, ids.length);
});
