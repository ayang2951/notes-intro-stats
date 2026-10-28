'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  CALLOUT_TYPES,
  scanMarkdownCallouts
} = require('../media/callout-reference-index');

function note(uri, text, sectionNumber, version = 1) {
  return { uri, text, version, sectionNumber, path: uri.replace('file:///notes/', 'notes/') };
}

function sourceSlice(document, record) {
  const lines = document.text.replace(/\r\n?/g, '\n').split('\n');
  return lines[record.line].slice(record.character, record.endCharacter);
}

function assertRecord(record, expected, document) {
  assert.equal(record.id, expected.id);
  assert.equal(record.label, expected.label);
  assert.equal(record.number, expected.number);
  assert.equal(record.uri, document.uri);
  assert.equal(record.version, document.version);
  assert.equal(record.path, document.path);
  assert.equal(record.targetLine, expected.targetLine);
  assert.equal(record.endLine, record.line);
  assert.equal(sourceSlice(document, record), expected.id);
}

test('recognizes every callout type and numbers each type independently', () => {
  const markdown = CALLOUT_TYPES.map((type) => (
    `<div id="${type}:named" class="callout ${type}">\n${type}\n</div>`
  )).join('\n');
  const document = note('file:///notes/all-types.md', markdown, 4, 7);
  const records = scanMarkdownCallouts(document);

  assert.equal(records.length, CALLOUT_TYPES.length);
  records.forEach((record, index) => {
    const type = CALLOUT_TYPES[index];
    assertRecord(record, {
      id: `${type}:named`,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      number: '4.1',
      targetLine: index * 3
    }, document);
  });
});

test('unlabeled callouts still advance their type counter', () => {
  const document = note('file:///notes/counters.md', `<div class="callout proposition"></div>

<a id="proposition:second"></a>
<div class="callout proposition"></div>

<div id="theorem:first" class="callout theorem"></div>`, 3);
  const records = scanMarkdownCallouts(document);

  assert.equal(records.length, 2);
  assertRecord(records[0], {
    id: 'proposition:second', label: 'Proposition', number: '3.2', targetLine: 3
  }, document);
  assertRecord(records[1], {
    id: 'theorem:first', label: 'Theorem', number: '3.1', targetLine: 5
  }, document);
});

test('associates multiple marker aliases across blank lines and comments', () => {
  const document = note('file:///notes/aliases.md', `<a id="lemma:first-name"></a>

<!-- A comment between source labels is not rendered. -->
<a id='proposition;second-name'></a>

<div
  class="callout theorem"
  id="custom-result">
</div>`, 6, 11);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => record.id), [
    'custom-result',
    'lemma:first-name',
    'proposition;second-name'
  ]);
  records.forEach((record) => {
    assertRecord(record, {
      id: record.id, label: 'Theorem', number: '6.1', targetLine: 5
    }, document);
  });
});

test('does not attach a marker across intervening rendered text', () => {
  const document = note('file:///notes/intervening.md', `<a id="remark:detached"></a>
This sentence separates the marker from the box.
<div id="direct-result" class="callout remark"></div>`, 2);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => record.id), ['direct-result']);
  assert.equal(records[0].number, '2.1');
});

test('retains repeated source markers as separate ambiguity candidates', () => {
  const document = note('file:///notes/repeated.md', `<a id="theorem:repeat"></a>
<a id="theorem:repeat"></a>
<div class="callout theorem"></div>`, 9);
  const records = scanMarkdownCallouts(document);

  assert.equal(records.length, 2);
  assert.deepEqual(records.map((record) => record.number), ['9.1', '9.1']);
  assert.deepEqual(records.map((record) => record.line), [0, 1]);
});

test('ignores callout-like text that Markdown does not render as a callout', () => {
  const protectedTags = [
    'pre', 'code', 'script', 'style', 'textarea', 'title', 'xmp',
    'iframe', 'noembed', 'noframes'
  ].map((tag) => (
    `<${tag}><div id="${tag}-ignored" class="callout theorem"></div></${tag}>`
  )).join('\n');
  const document = note('file:///notes/ignored.md', `~~~html
<div id="fenced-ignored" class="callout theorem"></div>
~~~

\`<div id="inline-ignored" class="callout theorem"></div>\`

    <div id="indented-ignored" class="callout theorem"></div>

<!-- <div id="comment-ignored" class="callout theorem"></div> -->

${protectedTags}

<div data-example='<div id="attribute-ignored" class="callout theorem">'></div>

<section><div id="visible-result" class="callout theorem"></div></section>`, 8);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['visible-result', '8.1']
  ]);
});

test('ignores escaped HTML and code nested in Markdown containers', () => {
  const document = note('file:///notes/nested-code.md', String.raw`\<div id="escaped-ignored" class="callout theorem"></div>

>     <div id="quoted-indent-ignored" class="callout theorem"></div>

> ~~~html
> <div id="quoted-fence-ignored" class="callout theorem"></div>
> ~~~

- ~~~html
  <div id="list-fence-ignored" class="callout theorem"></div>
  ~~~

<div id="theorem:real" class="callout theorem"></div>`, 1);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:real', '1.1']
  ]);
});

test('keeps real HTML callouts that are indented inside raw HTML', () => {
  const document = note('file:///notes/raw-html.md', `<section>
    <div id="theorem:inside-section" class="callout theorem"></div>
</section>

<div id="theorem:after-section" class="callout theorem"></div>`, 2);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:inside-section', '2.1'],
    ['theorem:after-section', '2.2']
  ]);
});

test('resets raw HTML context at a blank line before indented code', () => {
  const document = note('file:///notes/raw-html-reset.md', `<section>

    <div id="theorem:indented-code" class="callout theorem"></div>
</section>

Text <em>unfinished

    <div id="theorem:also-indented-code" class="callout theorem"></div>

<div id="theorem:visible" class="callout theorem"></div>`, 3);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:visible', '3.1']
  ]);
});

test('ends a list fence before a left-margin HTML block', () => {
  const document = note('file:///notes/list-fence.md', `- ~~~html
  code
<div id="theorem:list-exit" class="callout theorem"></div>
~~~
<div id="theorem:after-orphaned-close" class="callout theorem"></div>`, 4);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:list-exit', '4.1'],
    ['theorem:after-orphaned-close', '4.2']
  ]);
});

test('ends a list fence before a labeled callout without consuming a later fence', () => {
  const document = note('file:///notes/list-anchor-and-later-fence.md', `- ~~~html
  code
<a id="theorem:after-list"></a>
<div class="callout theorem"></div>
~~~

~~~html
<div id="theorem:inside-new-fence" class="callout theorem"></div>
~~~
<div id="theorem:after-new-fence" class="callout theorem"></div>`, 6);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:after-list', '6.1'],
    ['theorem:after-new-fence', '6.2']
  ]);
});

test('does not accept a backtick fence with a backtick in its info string', () => {
  const document = note('file:///notes/invalid-fence.md', '```lang`bad\n' +
    '<div id="theorem:after-invalid-fence" class="callout theorem"></div>', 5);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:after-invalid-fence', '5.1']
  ]);
});

test('associates same-line and multiline empty anchor markers', () => {
  const document = note('file:///notes/anchor-layouts.md', `<a id="lemma:same-line"></a><div class="callout lemma"></div>

<a
  id="lemma:multiple-lines">
</a>
<div class="callout lemma"></div>`, 7);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number, record.targetLine]), [
    ['lemma:same-line', '7.1', 0],
    ['lemma:multiple-lines', '7.2', 5]
  ]);
  records.forEach((record) => assert.equal(sourceSlice(document, record), record.id));
});

test('associates empty anchor markers inside Markdown containers', () => {
  const document = note('file:///notes/container-anchors.md', `> <a id="theorem:quoted"></a>
> <div class="callout theorem"></div>

- <a id="theorem:list-item"></a>
  <div class="callout theorem"></div>`, 8);
  const records = scanMarkdownCallouts(document);

  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['theorem:quoted', '8.1'],
    ['theorem:list-item', '8.2']
  ]);
  records.forEach((record) => assert.equal(sourceSlice(document, record), record.id));
});

test('supports unquoted attributes and preserves the exact id range', () => {
  const document = note('file:///notes/unquoted.md',
    '<div class=\'callout observation\' id=observation:plain></div>', 5);
  const record = scanMarkdownCallouts(document)[0];

  assertRecord(record, {
    id: 'observation:plain', label: 'Observation', number: '5.1', targetLine: 0
  }, document);
});

