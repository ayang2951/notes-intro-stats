'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const marked = require(process.env.COURSE_NOTES_MARKED_PATH || 'marked');
const { parseHTML } = require(process.env.COURSE_NOTES_DOM_PATH || 'linkedom');

const project = process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname, '../..');
const helper = require(path.join(project, 'html-markdown.js'));
const mediaHelper = require(path.join(project, 'vscode-extension/media/html-markdown.js'));
const appSource = fs.readFileSync(path.join(project, 'app.js'), 'utf8');
const previewSource = fs.readFileSync(path.join(project, 'vscode-extension/media/preview.js'), 'utf8');
const styles = fs.readFileSync(path.join(project, 'styles.css'), 'utf8');

function mathMatches(value) {
  return Array.from(value.matchAll(/\$\$[\s\S]*?\$\$/g));
}

function replaceMath(textNode) {
  return helper.replaceTextNodeWithBlocks(textNode, mathMatches(textNode.textContent), match => {
    const wrapper = textNode.ownerDocument.createElement('div');
    wrapper.className = 'display-math';
    wrapper.textContent = match[0];
    return wrapper;
  });
}

function siteRendererAndWrapper() {
  const parser = new marked.Marked();
  const window = {
    location: { pathname: '/' },
    CourseNotesHtmlMarkdown: helper,
    CourseNotesEquationNumbering: require(path.join(project, 'equation-numbering.js')),
    CourseNotesCodeBlocks: { renderCodeBlock: token => `<pre><code>${token.text}</code></pre>` },
    marked: {
      Renderer: marked.Renderer,
      Lexer: marked.Lexer,
      use: (...args) => parser.use(...args),
      parse: (...args) => parser.parse(...args)
    }
  };
  const context = vm.createContext({ window });
  vm.runInContext(
    appSource.slice(0, appSource.indexOf('function sectionMarkup(')) + '\nconfigureMarkdown();',
    context
  );
  vm.runInContext(
    appSource.slice(
      appSource.indexOf('function wrapUnprocessedDisplayMath('),
      appSource.indexOf('function buildToc(')
    ),
    context
  );

  return markdown => {
    context.markdown = markdown;
    const html = vm.runInContext('renderMarkdown(markdown)', context);
    const { document, window: domWindow } = parseHTML(`<html><body><main id="content">${html}</main></body></html>`);
    const root = document.getElementById('content');
    helper.normalizeParagraphs(root);
    context.document = document;
    context.NodeFilter = domWindow.NodeFilter || {
      SHOW_TEXT: 4,
      FILTER_ACCEPT: 1,
      FILTER_REJECT: 2,
      FILTER_SKIP: 3
    };
    context.root = root;
    vm.runInContext('wrapUnprocessedDisplayMath(root)', context);
    return root;
  };
}

test('a standalone residual equation replaces its paragraph and keeps source metadata', () => {
  const { document } = parseHTML('<html><body><li><p data-source-line="4" data-source-end-line="6" data-source-key="paragraph-key">  $$\nx=y\n$$  </p></li></body></html>');
  const paragraph = document.querySelector('p');
  const [equation] = replaceMath(paragraph.firstChild);

  assert.equal(document.querySelector('p'), null);
  assert.equal(equation.parentElement.tagName, 'LI');
  assert.equal(equation.dataset.sourceLine, '4');
  assert.equal(equation.dataset.sourceEndLine, '6');
  assert.equal(equation.dataset.sourceKey, 'paragraph-key');
});

test('mixed paragraph content is split around display math without duplicate IDs', () => {
  const { document } = parseHTML('<html><body><div><p id="source" data-source-line="8" data-source-end-line="10" data-source-key="mixed-key">Before. $$x=y$$ After.</p></div></body></html>');
  const paragraph = document.querySelector('p');
  const [equation] = replaceMath(paragraph.firstChild);
  const children = Array.from(document.querySelector('div').children);

  assert.deepEqual(children.map(element => element.tagName), ['P', 'DIV', 'P']);
  assert.equal(children[0].textContent.trim(), 'Before.');
  assert.equal(children[0].id, 'source');
  assert.equal(equation.dataset.sourceLine, '8');
  assert.equal(equation.dataset.sourceEndLine, '10');
  assert.equal(equation.dataset.sourceKey, 'mixed-key-block-1');
  assert.equal(children[2].textContent.trim(), 'After.');
  assert.equal(children[2].hasAttribute('id'), false);
  assert.equal(children[2].dataset.sourceKey, 'mixed-key-after-1');
});

test('multiple display equations are promoted in order without losing surrounding text', () => {
  const { document } = parseHTML('<html><body><div><p>Before. $$a=b$$ Between. $$c=d$$ After.</p></div></body></html>');
  const paragraph = document.querySelector('p');
  replaceMath(paragraph.firstChild);
  const children = Array.from(document.querySelector('div').children);

  assert.deepEqual(children.map(element => element.tagName), ['P', 'DIV', 'P', 'DIV', 'P']);
  assert.deepEqual(
    children.map(element => element.textContent.trim()),
    ['Before.', '$$a=b$$', 'Between.', '$$c=d$$', 'After.']
  );
  assert.equal(document.querySelectorAll('p .display-math').length, 0);
});

test('comments and empty reference anchors beside display math are preserved without an empty paragraph', () => {
  const { document } = parseHTML('<html><body><div><p data-source-key="markers"><!-- before --><a id="eq:kept"></a> $$x=y$$ <!-- after --></p></div></body></html>');
  const paragraph = document.querySelector('p');
  const textNode = Array.from(paragraph.childNodes).find(node => node.nodeType === 3 && node.textContent.includes('$$'));
  const [equation] = replaceMath(textNode);
  const container = document.querySelector('div');
  const children = Array.from(container.childNodes).filter(node => node.nodeType !== 3 || node.textContent.trim());

  assert.equal(document.querySelector('p'), null);
  assert.equal(document.getElementById('eq:kept').nextElementSibling, equation);
  assert.equal(children.filter(node => node.nodeType === 8).length, 2);
  assert.equal(children[0].nodeType, 8);
  assert.equal(children.at(-1).nodeType, 8);
  assert.equal(equation.dataset.sourceKey, 'markers');
});

test('the real site renderer promotes the Trees-style equation out of its list paragraph', () => {
  const render = siteRendererAndWrapper();
  const root = render(String.raw`<ol><li>Assignments of trees.

  How do we express this as a permutation? Note that

  $$
  P(10, 3) = \frac{10!}{7!}.
  $$

  Hence, the answer can be expressed in factorial form.</li></ol>`);
  const equation = root.querySelector('.display-math');
  const item = root.querySelector('li');

  assert.ok(equation);
  assert.equal(equation.parentElement, item);
  assert.equal(root.querySelector('p .display-math'), null);
  assert.deepEqual(
    Array.from(item.children).map(element => element.tagName),
    ['P', 'P', 'DIV', 'P']
  );
});

test('site and preview use the shared block promotion and keep equation bookmarks out of flow', () => {
  assert.equal(
    fs.readFileSync(path.join(project, 'html-markdown.js'), 'utf8'),
    fs.readFileSync(path.join(project, 'vscode-extension/media/html-markdown.js'), 'utf8')
  );
  assert.match(appSource, /replaceTextNodeWithBlocks\(textNode, matches/);
  assert.match(previewSource, /replaceTextNodeWithBlocks\(textNode, matches/);
  assert.match(appSource, /#content \.callout, #content p, #content \.display-math/);
  assert.match(styles, /\.display-math > \.bookmark-btn\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?left:\s*0;/);
});

test('paragraph-to-list spacing is reduced only for direct children of environments', () => {
  assert.match(
    styles,
    /#content :is\(\.callout, \.collapsible__content\) > p:has\(\+ :is\(ul, ol\)\)\s*\{\s*margin-bottom:\s*0\.5rem;/
  );
  assert.match(
    styles,
    /#content :is\(\.callout, \.collapsible__content\) > p \+ :is\(ul, ol\)\s*\{\s*margin-top:\s*0;/
  );
});

test('the exported helper copies remain equivalent', () => {
  assert.equal(typeof helper.replaceTextNodeWithBlocks, 'function');
  assert.equal(typeof mediaHelper.replaceTextNodeWithBlocks, 'function');
});
