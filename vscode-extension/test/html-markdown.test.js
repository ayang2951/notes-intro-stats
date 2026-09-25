'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const marked = require(process.env.COURSE_NOTES_MARKED_PATH || 'marked');
const project = process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname, '../..');
const helper = require(process.env.COURSE_NOTES_HTML_HELPER_PATH || path.join(project, 'vscode-extension/media/html-markdown.js'));
const appSource = fs.readFileSync(`${project}/app.js`, 'utf8');

// Use the site's real math protection and extensions, not a substitute parser.
function siteRenderer() {
  const parser = new marked.Marked();
  const window = {
    location: { pathname: '/' },
    CourseNotesHtmlMarkdown: helper,
    CourseNotesEquationNumbering: require(`${project}/equation-numbering.js`),
    CourseNotesCodeBlocks: { renderCodeBlock: token => `<pre><code>${token.text}</code></pre>` },
    marked: {
      Renderer: marked.Renderer, Lexer: marked.Lexer,
      use: (...args) => parser.use(...args),
      parse: (...args) => parser.parse(...args)
    }
  };
  const context = vm.createContext({ window });
  const source = appSource.slice(0, appSource.indexOf('function sectionMarkup('));
  vm.runInContext(source + '\nconfigureMarkdown();', context);
  return markdown => {
    context.input = markdown;
    return vm.runInContext('renderMarkdown(input)', context);
  };
}

test('nested HTML lists in examples and solutions render emphasis and preserve list attributes', () => {
  const render = siteRenderer();
  for (const wrapper of ['<div class="callout example">', '<details class="collapsible"><summary>Solution</summary><div class="collapsible__content">']) {
    const html = render(`${wrapper}\n<ol type="a" start="2"><li>Use *only* **one** ***event***.\n<ol type="i"><li>Nested _italics_.</li></ol>\n</li></ol>\n</div>`);
    assert.match(html, /<ol type="a" start="2">/);
    assert.match(html, /Use <em>only<\/em> <strong>one<\/strong> <em><strong>event<\/strong><\/em>/);
    assert.match(html, /Nested <em>italics<\/em>/);
  }
});

test('literal HTML regions and comments remain unchanged, including nested quoted attributes', () => {
  const render = siteRenderer();
  const elements = ['code', 'pre', 'kbd', 'samp', 'script', 'style', 'textarea'];
  for (const tag of elements) {
    const literal = `<${tag} data-note="x > y">*literal* _literal_ **literal**</${tag}>`;
    assert.equal(render(`<ol><li>${literal} *outside*</li></ol>`), `<ol><li>${literal} <em>outside</em></li></ol>`);
    if (['pre', 'script', 'style', 'textarea'].includes(tag)) assert.equal(render(literal), literal);
  }
  assert.equal(render('<ol><li><!-- <code> *comment* -->*outside*</li></ol>'), '<ol><li><!-- <code> *comment* --><em>outside</em></li></ol>');
});

test('HTML styles, attributes, entities and blank table cells are preserved', () => {
  const render = siteRenderer();
  const source = '<ol type="a"><li><table style="border-collapse: collapse;"><tr><td style="border: 1px solid black; padding: 6px;" data-label="*attribute*">___</td><td>*Late* &amp; $L^c$</td></tr></table></li></ol>';
  const html = render(source);
  assert.match(html, /data-label="\*attribute\*">___<\/td>/);
  assert.match(html, /style="border: 1px solid black; padding: 6px;"/);
  assert.match(html, /<em>Late<\/em> &amp; \\\(L\^c\\\)/);
  assert.doesNotMatch(html, /<hr/);
});

test('math syntax survives inline Markdown conversion', () => {
  const render = siteRenderer();
  const html = render(String.raw`<ol><li>*Compute* $A_i \cap B^c$ and $\mathbb P(O \,|\, T)$.</li></ol>`);
  assert.match(html, /<em>Compute<\/em>/);
  assert.ok(html.includes(String.raw`\(A_i \cap B^c\)`));
  assert.ok(html.includes(String.raw`\(\mathbb P(O \,|\, T)\)`));
  assert.doesNotMatch(html, /COURSECNOTES/);
});

test('escaped emphasis and code spans are parsed only once', () => {
  const render = siteRenderer();
  assert.equal(render(String.raw`<ol><li>\*literal\* and \_literal\_ and ` + '`*code*`' + ' <em>HTML</em> *yes*</li></ol>'), '<ol><li>*literal* and _literal_ and <code>*code*</code> <em>HTML</em> <em>yes</em></li></ol>');
});

test('existing paragraph Markdown and fenced code are not reparsed', () => {
  const render = siteRenderer();
  const html = render('A *paragraph* and `*literal*`.\n\n```text\n*code*\n```');
  assert.match(html, /A <em>paragraph<\/em> and <code>\*literal\*<\/code>/);
  assert.match(html, /<pre><code(?: [^>]*)?>\*code\*\n?<\/code><\/pre>/);
});

test('real preview renderer preserves source navigation metadata while parsing list Markdown', () => {
  const parser = new marked.Marked();
  const previewSource = fs.readFileSync(`${project}/vscode-extension/media/preview.js`, 'utf8');
  const window = {
    CourseNotesEquationNumbering: require(`${project}/equation-numbering.js`),
    CourseNotesSourceNavigation: require(`${project}/vscode-extension/media/source-navigation.js`),
    CourseNotesCodeBlocks: { renderCodeBlock: token => `<pre><code>${token.text}</code></pre>` },
    CourseNotesHtmlMarkdown: helper,
    marked: {
      Renderer: marked.Renderer, Lexer: marked.Lexer,
      use: (...args) => parser.use(...args),
      lexer: (...args) => parser.lexer(...args),
      parser: (...args) => parser.parser(...args),
      get defaults() { return parser.defaults; }
    }
  };
  const context = vm.createContext({ window, acquireVsCodeApi: () => ({}), document: { getElementById: () => ({}) } });
  const source = previewSource.slice(0, previewSource.indexOf('  function queueRender('));
  vm.runInContext(source + '\nwindow.renderForTest = renderMarkdown;\n})();', context);
  const html = window.renderForTest('Intro.\n\n<ol type="a"><li>*only*</li></ol>');
  assert.match(html, /<ol data-source-line="2" data-source-end-line="2" data-source-key="html-[^"]+" type="a">/);
  assert.match(html, /<li><em>only<\/em><\/li>/);
  assert.equal((html.match(/data-source-line="2"/g) || []).length, 1);
});

test('table blanks and list emphasis do not pair across block boundaries', () => {
  const render = siteRenderer();
  const source = '<ol><li>Fill in:\n<table><tr><td>___</td><td>___</td><td>___</td></tr></table>\n</li></ol>';
  assert.equal(render(source), source);
  assert.equal(render('<ol><li>*one</li><li>two*</li></ol>'), '<ol><li>*one</li><li>two*</li></ol>');
  assert.equal(render('<ol><li>*one <span title="a > b">two</span>*</li></ol>'), '<ol><li><em>one <span title="a > b">two</span></em></li></ol>');
  assert.equal(render('<ol><li>`<td>*literal*</td>` *yes*</li></ol>'), '<ol><li><code>&lt;td&gt;*literal*&lt;/td&gt;</code> <em>yes</em></li></ol>');
});

test('exercise and solution fixtures retain all table cells and parse list emphasis', () => {
  const render = siteRenderer();
  const source = '<div class="callout example">\n<div class="label">Example</div>\n\n<ol type="a">\n<li>How many people *only* used the bus or *only* used the subway?\n\n<table style="border-collapse: collapse;">\n<tr><th></th><th>Late $L$</th><th>On time $L^c$</th><th>Total</th></tr>\n<tr><td>Flagged $F$</td><td>___</td><td>___</td><td>___</td></tr>\n<tr><td>Not flagged $F^c$</td><td>___</td><td>___</td><td>___</td></tr>\n<tr><td>Total</td><td>___</td><td>___</td><td>400</td></tr>\n</table>\n\n</li>\n<li>What is the probability that *exactly one* occurs?</li>\n</ol>\n</div>\n\n<details class="collapsible">\n<summary>Solution</summary>\n<div class="collapsible__content">\n\n<ol type="a">\n<li>People who did *not* take the subway.</li>\n</ol>\n</div>\n</details>';
  const html = render(source);
  assert.match(html, /How many people <em>only<\/em> used the bus or <em>only<\/em> used the subway/);
  assert.match(html, /did <em>not<\/em> take the subway/);
  assert.match(html, /exactly one<\/em>/);
  assert.equal((html.match(/<td>___<\/td>/g) || []).length, 8);
  assert.equal((html.match(/<td>/g) || []).length, 12);
  assert.equal((html.match(/<th>/g) || []).length, 4);
  assert.doesNotMatch(html, /COURSECNOTES/);
});
