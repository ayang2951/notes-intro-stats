'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const extensionRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(extensionRoot, '..');
const codeBlocks = require(path.join(extensionRoot, 'media', 'code-blocks.js'));

const appSource = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const styles = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');
const previewSource = fs.readFileSync(path.join(extensionRoot, 'media', 'preview.js'), 'utf8');
const extensionSource = fs.readFileSync(path.join(extensionRoot, 'src', 'extension.js'), 'utf8');

test('language names use one safe, deterministic token', () => {
  assert.equal(codeBlocks.normalizeLanguage(' Python linenums'), 'python');
  assert.equal(codeBlocks.normalizeLanguage('C++'), 'c++');
  assert.equal(codeBlocks.normalizeLanguage('python" onmouseover="bad'), '');
  assert.equal(codeBlocks.normalizeLanguage('"><img'), '');
  assert.equal(codeBlocks.languageLabel('py'), 'Python');
  assert.equal(codeBlocks.languageLabel('objective-c'), 'Objective-C');
  assert.equal(codeBlocks.languageLabel(''), 'Code');
});

test('code text keeps indentation and a conventional final newline', () => {
  assert.equal(codeBlocks.normalizeCodeText('  first\r\n\tsecond'), '  first\n\tsecond\n');
  assert.equal(codeBlocks.normalizeCodeText('line\n'), 'line\n');
  assert.equal(codeBlocks.normalizeCodeText('line\n\n'), 'line\n\n');
});

test('rendered code is escaped without adding controls to the copied text', () => {
  const html = codeBlocks.renderCodeBlock({
    lang: 'js',
    text: 'if (a < b && c > 0) {\n  console.log("ok");\n}'
  });

  assert.match(html, /class="language-js"/);
  assert.match(html, />JavaScript<\/span>/);
  assert.match(html, /data-copy-code/);
  assert.match(html, /if \(a &lt; b &amp;&amp; c &gt; 0\)/);
  assert.doesNotMatch(html, /if \(a < b && c > 0\)/);
  assert.match(html, /<pre><code[^>]*>[^]*<\/code><\/pre>/);
  assert.doesNotMatch(html.match(/<code[^>]*>([^]*)<\/code>/)[1], /Copy|JavaScript/);
});

test('escaped Marked tokens are not escaped twice', () => {
  const html = codeBlocks.renderCodeBlock({
    lang: '',
    text: '&lt;safe&gt;',
    escaped: true
  });

  assert.match(html, />Code<\/span>/);
  assert.match(html, /<code>&lt;safe&gt;\n<\/code>/);
  assert.doesNotMatch(html, /language-/);
  assert.doesNotMatch(html, /&amp;lt;/);
});

test('preview source metadata belongs to the pre element and is escaped', () => {
  const html = codeBlocks.renderCodeBlock(
    { lang: 'python', text: 'print(1)' },
    { sourceLine: 0, sourceEndLine: 2, sourceKey: 'code-"&<' }
  );

  assert.match(
    html,
    /<pre data-source-line="0" data-source-end-line="2" data-source-key="code-&quot;&amp;&lt;"><code/
  );
  assert.ok(html.indexOf('data-source-line') > html.indexOf('<pre'));
  assert.doesNotMatch(html.slice(0, html.indexOf('<pre')), /data-source-line/);
});

test('site and extension use the same renderer file', () => {
  const siteHelper = fs.readFileSync(path.join(projectRoot, 'code-blocks.js'));
  const previewHelper = fs.readFileSync(path.join(extensionRoot, 'media', 'code-blocks.js'));
  assert.deepEqual(siteHelper, previewHelper);

  assert.match(appSource, /renderer\.code\s*=\s*\(token\)\s*=>\s*codeBlocks\.renderCodeBlock\(token\)/);
  assert.match(previewSource, /renderer\.code\s*=\s*function \(token\)[^]*codeBlocks\.renderCodeBlock/);
  assert.doesNotMatch(
    previewSource.match(/const BLOCK_RENDERERS = \[([^]*?)\];/)[1],
    /"code"/
  );
});

test('the deployed page and preview load code support before their main scripts', () => {
  assert.ok(indexSource.indexOf('src="code-blocks.js"') < indexSource.indexOf('src="app.js"'));
  assert.ok(extensionSource.indexOf('codeBlocksScriptUri') < extensionSource.indexOf('${previewScriptUri}'));
  assert.match(extensionSource, /message\.type === 'copyCode'/);
  assert.match(extensionSource, /vscode\.env\.clipboard\.writeText\(message\.text\)/);
  assert.match(previewSource, /type: "copyCode"/);
  assert.match(previewSource, /message\.type === "copyCodeResult"/);
});

test('shared styles provide a labeled block and visible copy states', () => {
  assert.match(styles, /\.code-block\s*\{/);
  assert.match(styles, /\.code-block__header\s*\{/);
  assert.match(styles, /\.code-copy-button\s*\{/);
  assert.match(styles, /\.code-copy-button\[data-copy-state="copied"\]/);
  assert.match(styles, /#content \.code-block pre code\s*\{/);
});
