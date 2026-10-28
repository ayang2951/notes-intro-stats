'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  buildProjectReferenceIndex,
  projectReferenceRecords
} = require('../media/project-reference-index');

function note(uri, text, sectionNumber, version = 1) {
  return { uri, text, version, sectionNumber, path: uri.replace('file:///notes/', 'notes/') };
}

test('combines equation and callout records across project files', () => {
  const first = note('file:///notes/one.md', String.raw`$$
a=b \label{eq:first}
$$

<a id="proposition:first"></a>
<div class="callout proposition"></div>`, 1, 3);
  const third = note('file:///notes/three.md', String.raw`<div id="remark:third" class="callout remark"></div>

$$
c=d \label{eq:third}
$$`, 3, 8);
  const index = buildProjectReferenceIndex([first, third]);

  assert.deepEqual([...index.keys()].sort(), [
    'eq:first', 'eq:third', 'proposition:first', 'remark:third'
  ]);
  assert.equal(index.get('eq:first')[0].number, '1.1');
  assert.equal(index.get('proposition:first')[0].number, '1.1');
  assert.equal(index.get('eq:third')[0].number, '3.1');
  assert.equal(index.get('remark:third')[0].number, '3.1');
  assert.equal(projectReferenceRecords(index).length, 4);
});

test('can omit callouts when automatic callout numbering is disabled', () => {
  const document = note('file:///notes/disabled.md', String.raw`$$
a=b \label{eq:kept}
$$
<div id="theorem:omitted" class="callout theorem"></div>`, 2);
  const index = buildProjectReferenceIndex([document], { includeCallouts: false });

  assert.deepEqual([...index.keys()], ['eq:kept']);
});

test('retains duplicate ids, including duplicates shared by different target kinds', () => {
  const first = note('file:///notes/first.md', String.raw`$$
a=b \label{eq:shared}
$$
<div id="eq:shared" class="callout lemma"></div>`, 1);
  const second = note('file:///notes/second.md',
    '<div id="lemma:duplicate" class="callout lemma"></div>', 2);
  const third = note('file:///notes/third.md',
    '<div id="lemma:duplicate" class="callout theorem"></div>', 3);
  const index = buildProjectReferenceIndex([first, second, third]);

  assert.equal(index.get('eq:shared').length, 2);
  assert.deepEqual(index.get('eq:shared').map((record) => record.label), [
    'Equation', 'Lemma'
  ]);
  assert.equal(index.get('lemma:duplicate').length, 2);
  assert.deepEqual(index.get('lemma:duplicate').map((record) => record.label), [
    'Lemma', 'Theorem'
  ]);
});

