'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { parseHTML } = require(process.env.COURSE_NOTES_DOM_PATH || 'linkedom');

const project = process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname, '../..');
const helpers = [
  ['site', require(path.join(project, 'html-markdown.js'))],
  ['preview', require(path.join(project, 'vscode-extension/media/html-markdown.js'))]
];

function fixture() {
  const { document } = parseHTML(`<!doctype html><html><body>
    <main id="content">
      <section class="note-section">
        <div class="solution-visibility" data-show-solutions="false"></div>
        <details id="solution" class="collapsible">
          <summary>  Solution  </summary>
          <div class="collapsible__content">
            Hidden solution.
            <details id="proof-inside-solution" class="collapsible">
              <summary>Proof</summary>
              <div class="collapsible__content">Hidden with its solution parent.</div>
            </details>
          </div>
        </details>
        <details id="proof" class="collapsible">
          <summary>Proof</summary>
          <div class="collapsible__content">
            Visible proof.
            <details id="nested-solution" class="collapsible">
              <summary><strong>sOlUtIoN</strong></summary>
              <div class="collapsible__content">Hidden nested solution.</div>
            </details>
            <details id="subproof" class="collapsible">
              <summary>Proof of the sub-proposition</summary>
              <div class="collapsible__content">Visible subproof.</div>
            </details>
          </div>
        </details>
        <details id="answer" class="collapsible">
          <summary>Answer</summary>
          <div class="collapsible__content">Visible answer.</div>
        </details>
        <details id="near-match" class="collapsible">
          <summary>Solution sketch</summary>
          <div class="collapsible__content">Visible unless explicitly labeled Solution.</div>
        </details>
      </section>
    </main>
  </body></html>`);
  return document;
}

const defaultVisibleSelector = '.note-section[data-solution-visibility-ready="true"] .collapsible:not([data-collapsible-kind="solution"])';
const showAllSelectors = [
  '.note-section > .solution-visibility[data-show-solutions="true"] ~ .collapsible',
  '.note-section > .solution-visibility[data-show-solutions="true"] ~ * .collapsible'
];
const visibleSelector = [defaultVisibleSelector, ...showAllSelectors].join(', ');

function effectivelyVisible(collapsible) {
  let current = collapsible;
  while (current && current.matches('.collapsible')) {
    if (!current.matches(visibleSelector)) return false;
    current = current.parentElement && current.parentElement.closest('.collapsible');
  }
  return true;
}

function visibleCollapsibleIds(document) {
  return Array.from(document.querySelectorAll('details.collapsible'))
    .filter(effectivelyVisible)
    .map(collapsible => collapsible.id);
}

for (const [name, helper] of helpers) {
  test(`${name} classifies only exact Solution summaries`, () => {
    const document = fixture();
    const content = document.getElementById('content');
    helper.classifySolutionCollapsibles(content);

    const section = document.querySelector('.note-section');
    assert.equal(section.getAttribute('data-solution-visibility-ready'), 'true');
    assert.equal(document.getElementById('solution').getAttribute('data-collapsible-kind'), 'solution');
    assert.equal(document.getElementById('nested-solution').getAttribute('data-collapsible-kind'), 'solution');

    for (const id of ['proof-inside-solution', 'proof', 'subproof', 'answer', 'near-match']) {
      assert.equal(document.getElementById(id).hasAttribute('data-collapsible-kind'), false);
    }

    assert.deepEqual(visibleCollapsibleIds(document), ['proof', 'subproof', 'answer', 'near-match']);

    document.querySelector('.solution-visibility').setAttribute('data-show-solutions', 'true');
    assert.deepEqual(visibleCollapsibleIds(document), [
      'solution',
      'proof-inside-solution',
      'proof',
      'nested-solution',
      'subproof',
      'answer',
      'near-match'
    ]);
  });

  test(`${name} removes a stale solution classification when its label changes`, () => {
    const document = fixture();
    const content = document.getElementById('content');
    helper.classifySolutionCollapsibles(content);

    const solution = document.getElementById('solution');
    solution.querySelector('summary').textContent = 'Proof';
    helper.classifySolutionCollapsibles(content);
    assert.equal(solution.hasAttribute('data-collapsible-kind'), false);
  });
}

test('site and preview invoke classification, and CSS reveals only classified non-solutions by default', () => {
  const appSource = fs.readFileSync(path.join(project, 'app.js'), 'utf8');
  const previewSource = fs.readFileSync(path.join(project, 'vscode-extension/media/preview.js'), 'utf8');
  const styles = fs.readFileSync(path.join(project, 'styles.css'), 'utf8');
  const siteHelper = fs.readFileSync(path.join(project, 'html-markdown.js'), 'utf8');
  const previewHelper = fs.readFileSync(path.join(project, 'vscode-extension/media/html-markdown.js'), 'utf8');

  assert.equal(siteHelper, previewHelper);
  assert.match(appSource, /classifySolutionCollapsibles\(content\)/);
  assert.match(previewSource, /classifySolutionCollapsibles\(content\)/);
  assert.match(styles, /\.note-section\s+\.collapsible\s*\{\s*display:\s*none\s*!important/);
  assert.match(styles, /\.note-section\[data-solution-visibility-ready="true"\][\s\S]*?\.collapsible:not\(\[data-collapsible-kind="solution"\]\)[\s\S]*?display:\s*block\s*!important/);
  assert.match(styles, /\.solution-visibility\[data-show-solutions="true"\][\s\S]*?\.collapsible[\s\S]*?display:\s*block\s*!important/);
});
