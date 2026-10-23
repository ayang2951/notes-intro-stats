'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { scheduleMathErrorRetry } = require('../src/render-retry');

function controller() {
  const scheduled = [];
  return {
    sourceUri: { toString: () => 'file:///notes/week5.md' },
    renderGeneration: 9,
    updateDelay: () => 120,
    scheduleRender: delay => scheduled.push(delay),
    scheduled
  };
}

function message(renderRevision = 9) {
  return {
    uri: 'file:///notes/week5.md',
    version: 4,
    renderRevision
  };
}

test('the current failed render schedules one delayed refresh', () => {
  const preview = controller();
  assert.equal(scheduleMathErrorRetry(preview, message(), 300), true);
  assert.deepEqual(preview.scheduled, [300]);
});

test('a stale failed render cannot replace a newer update', () => {
  const preview = controller();
  assert.equal(scheduleMathErrorRetry(preview, message(8), 300), false);
  assert.deepEqual(preview.scheduled, []);
});

test('malformed retry messages are ignored', () => {
  const preview = controller();
  assert.equal(scheduleMathErrorRetry(preview, { ...message(), uri: 'file:///notes/week4.md' }, 300), false);
  assert.equal(scheduleMathErrorRetry(preview, { ...message(), version: -1 }, 300), false);
  assert.equal(scheduleMathErrorRetry(preview, { ...message(), renderRevision: 1.5 }, 300), false);
  assert.deepEqual(preview.scheduled, []);
});
