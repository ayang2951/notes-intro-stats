'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  buildEquationReferenceIndex,
  equationReferenceRecords,
  scanMarkdownEquations
} = require('../media/equation-reference-index');

function note(uri, text, sectionNumber, version = 1) {
  return { uri, text, version, sectionNumber, path: uri.replace('file:///notes/', 'notes/') };
}

function recordsFor(index, id) {
  assert.ok(index instanceof Map, 'buildEquationReferenceIndex should return a Map');
  return index.get(id) || [];
}

function sourceSlice(document, record) {
  const lines = document.text.replace(/\r\n?/g, '\n').split('\n');
  if (record.line === record.endLine) {
    return lines[record.line].slice(record.character, record.endCharacter);
  }
  return [
    lines[record.line].slice(record.character),
    ...lines.slice(record.line + 1, record.endLine),
    lines[record.endLine].slice(0, record.endCharacter)
  ].join('\n');
}

function assertRecord(record, expected, document) {
  assert.equal(record.id, expected.id);
  assert.equal(record.label, 'Equation');
  assert.equal(record.number, expected.number);
  assert.equal(record.uri, document.uri);
  assert.equal(record.version, document.version);
  assert.equal(record.line, expected.line);
  assert.equal(record.equationLine, expected.equationLine);
  assert.equal(record.endLine, record.line);
  assert.equal(sourceSlice(document, record), expected.id);
}

test('indexes labeled equations across files using configured section numbers', () => {
  const first = note('file:///notes/one.md', String.raw`$$
u=0
$$

$$
a=b \label{eq:first}
$$

$$
c=d
$$

<a id="eq:external"></a>
$$
e=f
$$`, 1, 4);
  const second = note('file:///notes/two.md', String.raw`See [Equation](#eq:first).

$$
g=h \label{eq:second}
$$`, 2, 9);

  const index = buildEquationReferenceIndex([first, second]);
  assert.deepEqual([...index.keys()].sort(), ['eq:external', 'eq:first', 'eq:second']);
  assertRecord(recordsFor(index, 'eq:first')[0], {
    id: 'eq:first', number: '1.1', line: 5, equationLine: 5
  }, first);
  assertRecord(recordsFor(index, 'eq:external')[0], {
    id: 'eq:external', number: '1.2', line: 12, equationLine: 14
  }, first);
  assertRecord(recordsFor(index, 'eq:second')[0], {
    id: 'eq:second', number: '2.1', line: 3, equationLine: 3
  }, second);
});

test('indexes only labeled align rows and records their exact source rows', () => {
  const document = note('file:///notes/align.md', String.raw`\begin{align}
a &= b \label{eq:alpha} \\
u &= v \\
c &= d \label{equation;gamma}
\end{align}`, 3, 2);

  const records = scanMarkdownEquations(document);
  assert.equal(records.length, 2);
  assertRecord(records.find((record) => record.id === 'eq:alpha'), {
    id: 'eq:alpha', number: '3.1', line: 1, equationLine: 1
  }, document);
  assertRecord(records.find((record) => record.id === 'equation;gamma'), {
    id: 'equation;gamma', number: '3.2', line: 3, equationLine: 3
  }, document);
});

test('preserves manual tags and omits suppressed align labels without gaps', () => {
  const document = note('file:///notes/tags.md', String.raw`\begin{align}
a &= b \tag{A}\label{eq:manual} \\
c &= d \notag\label{eq:suppressed-a} \\
e &= f \nonumber\label{eq:suppressed-b} \\
g &= h \label{eq:auto}
\end{align}`, 5);

  const records = scanMarkdownEquations(document);
  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['eq:manual', 'A'],
    ['eq:auto', '5.2']
  ]);
  assert.equal(records.some((record) => record.id.includes('suppressed')), false);
});

test('retains colon and semicolon aliases as records for one numbered row', () => {
  const document = note('file:///notes/aliases.md', String.raw`\begin{align}
a &= b \label{eq:colon}\label{equation;semicolon}
\end{align}`, 7);

  const records = scanMarkdownEquations(document);
  assert.deepEqual(records.map((record) => record.id), ['eq:colon', 'equation;semicolon']);
  assert.deepEqual(records.map((record) => record.number), ['7.1', '7.1']);
  assert.deepEqual(records.map((record) => record.line), [1, 1]);
  records.forEach((record) => assert.equal(sourceSlice(document, record), record.id));
});

test('retains duplicate label records across files for ambiguity reporting', () => {
  const first = note('file:///notes/first.md', String.raw`$$
a=b \label{eq:duplicate}
$$`, 1, 3);
  const second = note('file:///notes/second.md', String.raw`$$
c=d \label{eq:duplicate}
$$`, 2, 8);

  const duplicates = recordsFor(buildEquationReferenceIndex([first, second]), 'eq:duplicate');
  assert.equal(duplicates.length, 2);
  assert.deepEqual(duplicates.map((record) => record.uri), [first.uri, second.uri]);
  assert.deepEqual(duplicates.map((record) => record.number), ['1.1', '2.1']);
  assert.deepEqual(duplicates.map((record) => record.version), [3, 8]);
});

test('retains repeated standalone anchors as an ambiguous target', () => {
  const document = note('file:///notes/repeated-anchor.md', String.raw`<a id="eq:repeat"></a>
<a id="eq:repeat"></a>
$$
x=y
$$`, 2);

  const index = buildEquationReferenceIndex([document]);
  assert.equal(recordsFor(index, 'eq:repeat').length, 2);
  assert.equal(equationReferenceRecords(index).length, 2);
});

test('keeps a missing configured-file gap in later section numbers', () => {
  const third = note('file:///notes/third.md', String.raw`\[
x=y \label{equation:third}
\]`, 3);
  const record = recordsFor(buildEquationReferenceIndex([third]), 'equation:third')[0];

  assert.equal(record.number, '3.1');
  assert.equal(record.equationLine, 1);
});

test('ignores labels and anchors inside fenced code and comments', () => {
  const document = note('file:///notes/ignored.md', String.raw`~~~tex
$$
x=y \label{eq:fenced-display}
$$
\begin{align}
a &= b \label{eq:fenced-align}
\end{align}
<a id="eq:fenced-anchor"></a>
~~~

<!--
<a id="eq:html-comment-anchor"></a>
$$ z=w \label{eq:html-comment-label} $$
-->

$$
p=q % \label{eq:tex-comment}
$$

$$
r=s \label{eq:real}
$$`, 4);

  const records = scanMarkdownEquations(document);
  assert.deepEqual(records.map((record) => record.id), ['eq:real']);
  assert.equal(records[0].number, '4.1');
});

test('keeps indented TeX lines inside a real display equation', () => {
  const document = note('file:///notes/indented-math.md', String.raw`$$
    \begin{align}
    a &= b \label{eq:indented}
    \end{align}
$$`, 6);

  const records = scanMarkdownEquations(document);
  assert.equal(records.length, 1);
  assertRecord(records[0], {
    id: 'eq:indented', number: '6.1', line: 2, equationLine: 2
  }, document);
});

test('ignores math-like text in raw HTML containers and tag attributes', () => {
  const document = note('file:///notes/raw-html.md', String.raw`<script>
const example = "$$ a=b \label{eq:script} $$";
</script>
<style>.>/* $$ c=d \label{eq:style} $$ */</style>
<textarea>$$ e=f \label{eq:textarea} $$</textarea>
<div data-example="$$ g=h \label{eq:attribute} $$"></div>

$$
p=q \label{eq:visible}
$$`, 9);

  const records = scanMarkdownEquations(document);
  assert.deepEqual(records.map((record) => [record.id, record.number]), [
    ['eq:visible', '9.1']
  ]);
});

test('ignores top-level indented Markdown code containing equation syntax', () => {
  const document = note('file:///notes/indented-code.md', String.raw`    $$
    x=y \label{eq:code}
    $$

$$
x=y \label{eq:real-after-code}
$$`, 2);

  assert.deepEqual(scanMarkdownEquations(document).map((record) => record.id), [
    'eq:real-after-code'
  ]);
});
