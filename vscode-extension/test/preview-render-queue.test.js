'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const project = process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname, '../..');
const previewSource = fs.readFileSync(path.join(project, 'vscode-extension/media/preview.js'), 'utf8');

function queueHarness(renderForTest) {
  const queueStart = previewSource.indexOf('  function queueRender(');
  const renderStart = previewSource.indexOf('  async function render(', queueStart);
  const validationStart = previewSource.indexOf('  function isRenderMessage(');
  const revealValidationStart = previewSource.indexOf('  function isRevealMessage(', validationStart);

  assert.notEqual(queueStart, -1);
  assert.notEqual(renderStart, -1);
  assert.notEqual(validationStart, -1);
  assert.notEqual(revealValidationStart, -1);

  const queueFunctions = previewSource
    .slice(queueStart, renderStart)
    .replace('await render(message);', 'await renderForTest(message);');
  const validationFunction = previewSource.slice(validationStart, revealValidationStart);
  const errors = [];
  const statuses = [];
  const context = vm.createContext({
    renderForTest,
    console: { error: error => errors.push(error) },
    showStatus: (message, isError) => statuses.push({ message, isError })
  });

  vm.runInContext(`
    let current = { uri: '', renderRevision: -1 };
    let pendingRender;
    let rendering = false;
    ${queueFunctions}
    ${validationFunction}
    globalThis.queueRenderForTest = queueRender;
    globalThis.queueStateForTest = () => ({
      rendering,
      pendingRevision: pendingRender?.renderRevision
    });
  `, context);

  return {
    enqueue: context.queueRenderForTest,
    state: context.queueStateForTest,
    errors,
    statuses
  };
}

function mathRetryHarness() {
  const retryStart = previewSource.indexOf('  function requestMathErrorRetry(');
  const nextFunctionStart = previewSource.indexOf('  function autoNumberCallouts(', retryStart);
  assert.notEqual(retryStart, -1);
  assert.notEqual(nextFunctionStart, -1);

  const posted = [];
  const statuses = [];
  const context = vm.createContext({
    vscode: { postMessage: message => posted.push(message) },
    showStatus: (message, isError) => statuses.push({ message, isError })
  });
  vm.runInContext(`
    let lastMathErrorRetryKey = '';
    function hashText(value) { return String(value); }
    ${previewSource.slice(retryStart, nextFunctionStart)}
    globalThis.requestMathErrorRetryForTest = requestMathErrorRetry;
  `, context);

  return {
    request: context.requestMathErrorRetryForTest,
    posted,
    statuses
  };
}

function evaluatePreviewFunction(name, nextName, additions = {}) {
  const start = previewSource.indexOf(`  function ${name}(`);
  const end = previewSource.indexOf(`  function ${nextName}(`, start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const context = vm.createContext(additions);
  vm.runInContext(`${previewSource.slice(start, end)}\nglobalThis.functionForTest = ${name};`, context);
  return context.functionForTest;
}

function renderMessage(renderRevision, markdown) {
  return {
    type: 'render',
    uri: 'file:///notes/week5.md',
    version: renderRevision,
    renderRevision,
    markdown,
    projectReferences: []
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function waitForQueue(harness) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const state = harness.state();
    if (!state.rendering && state.pendingRevision === undefined) return;
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.fail('The preview render queue did not become idle.');
}

test('a failed intermediate render cannot block the corrected formula', async () => {
  const firstRender = deferred();
  const rendered = [];
  const harness = queueHarness(async message => {
    rendered.push(message);
    if (message.renderRevision === 1) await firstRender.promise;
  });
  const malformed = String.raw`$$\nF_{X,Y}(x,y)=\sum_\n$$`;
  const corrected = String.raw`$$
F_{X,Y}(x, y)
= \sum_{s \leq x} \sum_{t \leq y} p_{X,Y}(s, t).
$$`;

  harness.enqueue(renderMessage(1, malformed));
  harness.enqueue(renderMessage(2, corrected));
  firstRender.reject(new Error('simulated transient preview failure'));
  await waitForQueue(harness);

  assert.deepEqual(rendered.map(message => message.renderRevision), [1, 2]);
  assert.equal(rendered.at(-1).markdown, corrected);
  assert.equal(harness.errors.length, 1);
  assert.equal(harness.statuses.length, 1);
  assert.equal(harness.statuses[0].isError, true);
});

test('only the newest pending revision renders after the active render', async () => {
  const firstRender = deferred();
  const renderedRevisions = [];
  let activeRenders = 0;
  let maximumActiveRenders = 0;
  const harness = queueHarness(async message => {
    renderedRevisions.push(message.renderRevision);
    activeRenders += 1;
    maximumActiveRenders = Math.max(maximumActiveRenders, activeRenders);
    try {
      if (message.renderRevision === 1) await firstRender.promise;
    } finally {
      activeRenders -= 1;
    }
  });

  harness.enqueue(renderMessage(1, 'first'));
  harness.enqueue(renderMessage(2, 'second'));
  harness.enqueue(renderMessage(3, 'third'));
  firstRender.resolve();
  await waitForQueue(harness);

  assert.deepEqual(renderedRevisions, [1, 3]);
  assert.equal(maximumActiveRenders, 1);
  assert.equal(harness.errors.length, 0);
});

test('the same malformed source requests only one automatic retry', () => {
  const harness = mathRetryHarness();
  const message = renderMessage(7, String.raw`$$\sum_$$`);

  harness.request(message);
  harness.request(message);

  assert.equal(harness.posted.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(harness.posted[0])), {
    type: 'retryRender',
    uri: message.uri,
    version: message.version,
    renderRevision: message.renderRevision
  });
  assert.deepEqual(harness.statuses.map(status => status.isError), [false, true]);
});

test('MathJax SVG error elements are detected after typesetting', () => {
  const containsMathError = evaluatePreviewFunction('containsMathError', 'requestMathErrorRetry');
  const selectors = [];
  const root = {
    querySelector(selector) {
      selectors.push(selector);
      return { getAttribute: () => 'Missing open brace for subscript' };
    }
  };

  assert.equal(containsMathError(root), true);
  assert.deepEqual(selectors, ['[data-mjx-error]']);
});

test('a terminal preview error clears the busy state', () => {
  const attributes = new Map();
  const content = { setAttribute: (name, value) => attributes.set(name, value) };
  const classes = new Map();
  const status = {
    textContent: '',
    hidden: true,
    classList: { toggle: (name, value) => classes.set(name, value) }
  };
  const showStatus = evaluatePreviewFunction('showStatus', 'hideStatus', { content, status });

  showStatus('Updating preview…', false);
  assert.equal(attributes.get('aria-busy'), 'true');
  showStatus('Preview failed', true);
  assert.equal(attributes.get('aria-busy'), 'false');
  assert.equal(status.hidden, false);
  assert.equal(classes.get('is-error'), true);
});
