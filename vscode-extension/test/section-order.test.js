'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { NodeFilter, parseHTML } = require(process.env.COURSE_NOTES_DOM_PATH || 'linkedom');

const project = process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname, '../..');
const appSource = fs.readFileSync(path.join(project, 'app.js'), 'utf8');

function harness(body = '', storedBookmarks = []) {
  const { window, document } = parseHTML(`<!doctype html><html><body>${body}</body></html>`);
  window.COURSE_NOTES_STORAGE_PREFIX = 'section-order-test:';
  window.CourseNotesEquationNumbering = require(path.join(project, 'equation-numbering.js'));
  window.CourseNotesCodeBlocks = {};

  const values = new Map([
    ['section-order-test:bookmarks', JSON.stringify(storedBookmarks)]
  ]);
  const localStorage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };

  const context = vm.createContext({
    window,
    document,
    Node: { DOCUMENT_POSITION_FOLLOWING: 4 },
    NodeFilter,
    console,
    localStorage
  });
  vm.runInContext(`${appSource}\n;globalThis.sectionOrderTest = {
    ORDERED_NOTES,
    validateNoteSections,
    sectionMarkup,
    buildToc,
    autoNumberCallouts,
    autoNumberEquations,
    bookmarkHeadingsInSectionOrder,
    renderBookmarks
  };`, context);

  return { document, api: context.sectionOrderTest };
}

test('page order and explicit section numbers are independent', () => {
  const { api } = harness();
  const notes = JSON.parse(JSON.stringify(api.ORDERED_NOTES));

  assert.deepEqual(notes.map(note => note.file), ['week3.md', 'week2.md', 'week1.md']);
  assert.deepEqual(notes.map(note => note.sectionNumber), [3, 2, 1]);
  assert.doesNotThrow(() => api.validateNoteSections(notes));
  assert.throws(
    () => api.validateNoteSections([{ file: 'a.md', sectionNumber: 1 }, { file: 'b.md', sectionNumber: 1 }]),
    /assigned more than once/
  );

  const weekThree = api.sectionMarkup(notes[0], 0, '<p>Three.</p>');
  assert.match(weekThree, /id="sec-3"/);
  assert.match(weekThree, /data-sec="3"/);
  assert.match(weekThree, /data-auto-id-section="1"/);

  const weekOne = api.sectionMarkup(notes[2], 2, '<p>One.</p>');
  assert.match(weekOne, /id="sec-1"/);
  assert.match(weekOne, /data-sec="1"/);
  assert.match(weekOne, /data-auto-id-section="3"/);
});

test('page and table of contents stay descending while bookmarks sort by section number', () => {
  const body = `
    <nav id="toc"></nav>
    <main id="content">
      <section id="sec-3" class="note-section" data-sec="3" data-auto-id-section="1" data-file="week3.md">
        <h1>Week 3</h1><h2>Three topic</h2>
        <div class="callout theorem"><div class="label">Theorem: Three</div></div>
        <a id="eq:three"></a><div class="display-math">x=y</div>
        <p id="bookmark-three" class="bookmarkable" data-plain="Three bookmark">Three bookmark</p>
      </section>
      <section id="sec-2" class="note-section" data-sec="2" data-auto-id-section="2" data-file="week2.md">
        <h1>Week 2</h1><h2>Two topic</h2>
        <p id="bookmark-two" class="bookmarkable" data-plain="Two bookmark">Two bookmark</p>
      </section>
      <section id="sec-1" class="note-section" data-sec="1" data-auto-id-section="3" data-file="week1.md">
        <h1>Week 1</h1><h2>One topic</h2><h3>One detail</h3>
        <div class="callout theorem"><div class="label">Theorem: One</div></div>
        <a id="eq:one"></a><div class="display-math">a=b</div>
        <p id="bookmark-one" class="bookmarkable" data-plain="One bookmark">One bookmark</p>
      </section>
    </main>
    <ul id="bookmarkList"></ul>`;
  const { document, api } = harness(body, [
    'bookmark-three',
    'bookmark-one',
    'bookmark-two'
  ]);

  api.buildToc();
  api.autoNumberCallouts();
  api.autoNumberEquations();
  api.renderBookmarks();

  assert.deepEqual(
    Array.from(document.querySelectorAll('#content > .note-section')).map(section => section.dataset.sec),
    ['3', '2', '1']
  );
  assert.deepEqual(
    Array.from(document.querySelectorAll('#toc a')).map(link => [link.textContent, link.getAttribute('href')]),
    [['Week 3', '#sec-3'], ['Week 2', '#sec-2'], ['Week 1', '#sec-1']]
  );

  const weekThree = document.getElementById('sec-3');
  const weekOne = document.getElementById('sec-1');
  assert.equal(weekThree.querySelector('.callout-num').textContent, '3.1');
  assert.equal(weekThree.querySelector('.callout').id, 'theorem-1-1');
  assert.equal(weekOne.querySelector('.callout-num').textContent, '1.1');
  assert.equal(weekOne.querySelector('.callout').id, 'theorem-3-1');
  assert.equal(weekThree.querySelector('.equation-number').textContent, '(3.1)');
  assert.equal(weekOne.querySelector('.equation-number').textContent, '(1.1)');

  assert.deepEqual(
    Array.from(document.querySelectorAll('#bookmarkList > .heading-item > strong')).map(title => title.textContent),
    ['1. Week 1', '1.1 One topic', '1.1.1 One detail', '2. Week 2', '2.1 Two topic', '3. Week 3', '3.1 Three topic']
  );
  assert.deepEqual(
    Array.from(document.querySelectorAll('#bookmarkList .bookmark-item a')).map(link => link.textContent),
    ['One bookmark', 'Two bookmark', 'Three bookmark']
  );
});

test('bookmark section sorting is numeric rather than textual', () => {
  const body = `<main id="content">
    <section class="note-section" data-sec="10"><h1>Ten</h1></section>
    <section class="note-section" data-sec="2"><h1>Two</h1></section>
    <section class="note-section" data-sec="1"><h1>One</h1></section>
  </main>`;
  const { document, api } = harness(body);
  assert.deepEqual(
    Array.from(api.bookmarkHeadingsInSectionOrder(document.getElementById('content'))).map(heading => heading.textContent),
    ['One', 'Two', 'Ten']
  );
});

test('workspace preview files are listed in section-number order', () => {
  const settingsPath = path.join(project, '.vscode/settings.json');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const noteFiles = settings['courseNotesPreview.noteFiles'];

  assert.deepEqual(noteFiles, ['notes/week1.md', 'notes/week2.md', 'notes/week3.md']);
  noteFiles.forEach(noteFile => assert.equal(fs.existsSync(path.join(project, noteFile)), true));
});
