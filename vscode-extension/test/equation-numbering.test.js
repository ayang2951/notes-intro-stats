'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
  alignBlockAtStart,
  equationLabels,
  isEquationId,
  manualEquationTag,
  numberAlignedMath,
  removeManagedEquationLabels,
  splitAlignRows
} = require('../media/equation-numbering');

test('extracts and removes ordinary display labels without changing comments or escaped text', () => {
  const source = String.raw`x=y \label{eq:ordinary}\label{equation;alias}
% \label{eq:comment}
\\label{eq:escaped}`;

  assert.deepEqual(equationLabels(source), ['eq:ordinary', 'equation;alias']);
  const cleaned = removeManagedEquationLabels(source);
  assert.doesNotMatch(cleaned, /eq:ordinary|equation;alias/);
  assert.match(cleaned, /% \\label\{eq:comment\}/);
  assert.match(cleaned, /\\\\label\{eq:escaped\}/);
});

test('numbers only labeled align rows and closes the numbering gap', () => {
  const source = String.raw`\begin{align}
a &= b + c \label{eq:first} \\
d &= e + f \label{eq:second} \\
g &= h \\
p &= q + r \label{eq:fourth}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 3,
    labelPrefix: 'row-test'
  });

  assert.equal(result.counter, 3);
  assert.deepEqual(result.rows.map((row) => row.number), ['3.1', '3.2', '3.3']);
  assert.deepEqual(result.rows.map((row) => row.renderedRowIndex), [0, 1, 3]);
  assert.match(result.tex, /a &= b \+ c\s+\\tag\{3\.1\}\\label\{row-test-1\}/);
  assert.match(result.tex, /d &= e \+ f\s+\\tag\{3\.2\}\\label\{row-test-2\}/);
  assert.match(result.tex, /g &= h \\\\/);
  assert.match(result.tex, /p &= q \+ r\s+\\tag\{3\.3\}\\label\{row-test-4\}/);
  assert.doesNotMatch(result.tex, /\\label\{eq:/);
});

test('notag and nonumber explicitly suppress labeled rows', () => {
  const source = String.raw`\begin{align}
a &= b \label{eq:one} \\
c &= d \notag \label{eq:skip-a} \\
e &= f \nonumber \label{eq:skip-b} \\
g &= h \label{eq:last}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 2,
    startCounter: 4,
    labelPrefix: 'suppressed'
  });

  assert.equal(result.counter, 6);
  assert.deepEqual(result.rows.map((row) => row.ids), [['eq:one'], ['eq:last']]);
  assert.deepEqual(result.rows.map((row) => row.number), ['2.5', '2.6']);
  assert.doesNotMatch(result.tex, /eq:skip/);
  assert.match(result.tex, /\\notag/);
  assert.match(result.tex, /\\nonumber/);
});

test('supports colon, semicolon, legacy IDs, and aliases on one row', () => {
  const source = String.raw`\begin{align}
a &= b \label{eq:colon}\label{equation;semicolon}\label{eq-legacy}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 7,
    labelPrefix: 'aliases'
  });

  assert.deepEqual(result.rows[0].ids, ['eq:colon', 'equation;semicolon', 'eq-legacy']);
  assert.equal(result.counter, 1);
  assert.equal(result.rows[0].number, '7.1');
  assert.ok(isEquationId('eq:colon'));
  assert.ok(isEquationId('equation;semicolon'));
  assert.ok(isEquationId('eq-legacy'));
  assert.equal(isEquationId('lemma:not-an-equation'), false);
});

test('does not split rows inside braces, nested environments, or comments', () => {
  const body = String.raw`
x &= \text{first \\ second} + \begin{matrix}a & b \\ c & d\end{matrix} \label{eq:nested} \\*[1ex]
y &= z % ignored \\ \label{eq:comment}
\\
w &= v \label{eq:last}
`;
  const rows = splitAlignRows(body);
  assert.equal(rows.length, 3);

  const result = numberAlignedMath(`\\begin{align}${body}\\end{align}`, {
    sectionNumber: 1,
    labelPrefix: 'nested'
  });
  assert.deepEqual(result.rows.map((row) => row.ids), [['eq:nested'], ['eq:last']]);
  assert.match(result.tex, /\\\\\*\[1ex\]/);
});

test('preserves a manual row tag as the reference number', () => {
  const source = String.raw`\begin{align}
a &= b \tag{A}\label{eq:manual} \\
c &= d \label{eq:auto}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 5,
    labelPrefix: 'manual'
  });

  assert.deepEqual(result.rows.map((row) => row.number), ['A', '5.2']);
  assert.equal((result.tex.match(/\\tag\{A\}/g) || []).length, 1);
  assert.match(result.tex, /\\tag\{5\.2\}/);
});

test('reads nested manual tags without mistaking comments for braces', () => {
  assert.deepEqual(manualEquationTag(String.raw`x=y \tag{A_{1}}`), {
    present: true,
    value: 'A_{1}'
  });
  assert.deepEqual(manualEquationTag(String.raw`x=y \tag{\mathrm{A}}`), {
    present: true,
    value: '\\mathrm{A}'
  });
  assert.equal(manualEquationTag(String.raw`x=y % \tag{false}`), undefined);
});

test('keeps align-star rows unnumbered unless they have an explicit tag', () => {
  const source = String.raw`\begin{align*}
a &= b \label{eq:no-number} \\
c &= d \tag{A}\label{eq:manual}
\end{align*}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 4,
    startCounter: 2,
    labelPrefix: 'starred'
  });

  assert.equal(result.counter, 3);
  assert.deepEqual(result.rows.map((row) => row.ids), [['eq:manual']]);
  assert.deepEqual(result.rows.map((row) => row.number), ['A']);
  assert.doesNotMatch(result.tex, /eq:no-number/);
  assert.equal((result.tex.match(/\\tag\{A\}/g) || []).length, 1);
});

test('unwraps an align environment surrounded by display delimiters', () => {
  const source = String.raw`$$
\begin{align}
a &= b \label{eq:wrapped}
\end{align}
$$`;
  const result = numberAlignedMath(source, {
    sectionNumber: 6,
    labelPrefix: 'wrapped'
  });

  assert.ok(result.tex.startsWith('\\begin{align}'));
  assert.ok(result.tex.endsWith('\\end{align}'));
  assert.equal(result.rows[0].sourceStartLineOffset, 2);
});

test('removes labels at the correct offsets after non-BMP symbols', () => {
  const source = String.raw`\begin{align}
𝔼[X] &= 1 \label{eq:unicode}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 1,
    labelPrefix: 'unicode'
  });

  assert.match(result.tex, /𝔼\[X\] &= 1/);
  assert.doesNotMatch(result.tex, /eq:unicode/);
  assert.match(result.tex, /\\label\{unicode-1\}/);
});

test('inserts generated tags outside a trailing TeX comment', () => {
  const source = String.raw`\begin{align}
a &= b \label{eq:commented} % explanation
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 8,
    labelPrefix: 'commented'
  });

  assert.match(result.tex, /% explanation\n\\tag\{8\.1\}\\label\{commented-1\}/);
});

test('ignores commented align openings and finds a later real opening', () => {
  const onlyCommented = String.raw`$$
% \begin{align} a&=b\label{eq:fake} \end{align}
$$`;
  assert.equal(numberAlignedMath(onlyCommented, { sectionNumber: 1 }), undefined);

  const followedByReal = String.raw`$$
% \begin{align}
\begin{align}
a &= b \label{eq:real}
\end{align}
$$`;
  const result = numberAlignedMath(followedByReal, {
    sectionNumber: 2,
    labelPrefix: 'real-after-comment'
  });
  assert.deepEqual(result.rows.map((row) => row.ids), [['eq:real']]);
  assert.equal(result.rows[0].number, '2.1');
});

test('places generated row commands outside braces and nested environments', () => {
  const source = String.raw`\begin{align}
a &= \boxed{b\label{eq:boxed}} \\
c &= \begin{matrix}d\label{eq:matrix} & e\end{matrix}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 6,
    labelPrefix: 'safe-position'
  });

  assert.match(result.tex, /\\boxed\{b\}\s+\\tag\{6\.1\}\\label\{safe-position-1\}/);
  assert.match(result.tex, /\\end\{matrix\}\s+\\tag\{6\.2\}\\label\{safe-position-2\}/);
  assert.doesNotMatch(result.tex, /\\boxed\{[^}]*\\tag/);
});

test('recognizes a bare align block without consuming following prose', () => {
  const source = String.raw`\begin{align}
a &= b
\end{align}

Following paragraph.`;
  const block = alignBlockAtStart(source);

  assert.equal(block.environment, 'align');
  assert.ok(block.raw.endsWith('\n'));
  assert.equal(source.slice(block.raw.length), '\nFollowing paragraph.');
});

test('ignores commented closing environments and requires a real close', () => {
  const complete = String.raw`\begin{align}
a &= b \label{eq:a}
% fake \end{align}
\end{align}

After.`;
  const block = alignBlockAtStart(complete);
  assert.match(block.tex, /% fake \\end\{align\}/);
  assert.ok(block.tex.endsWith('\\end{align}'));

  const incomplete = String.raw`\begin{align}
a &= b \label{eq:a}
% only \end{align}`;
  assert.equal(alignBlockAtStart(incomplete), undefined);
  assert.equal(numberAlignedMath(incomplete, { sectionNumber: 1 }), undefined);
});

test('ignores escaped label, tag, and suppression command text', () => {
  const source = String.raw`\begin{align}
a &= \text{literal \\label{eq:false} \\tag{A} \\notag} \label{eq:real}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 9,
    labelPrefix: 'escaped'
  });

  assert.deepEqual(result.rows[0].ids, ['eq:real']);
  assert.equal(result.rows[0].number, '9.1');
  assert.match(result.tex, /\\\\label\{eq:false\}/);
  assert.match(result.tex, /\\tag\{9\.1\}/);
});

test('does not let an escaped begin command swallow later rows', () => {
  const source = String.raw`\begin{align}
a &= \text{literal \\begin{fake}} \label{eq:a} \\
b &= c \label{eq:b}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 1,
    labelPrefix: 'escaped-begin'
  });

  assert.deepEqual(result.rows.map((row) => row.ids), [['eq:a'], ['eq:b']]);
  assert.deepEqual(result.rows.map((row) => row.number), ['1.1', '1.2']);
});

test('ignores closing brackets in comments inside row spacing', () => {
  const source = String.raw`\begin{align}
a &= b \label{eq:a} \\[1ex % ] \label{eq:false}
] 
c &= d \label{eq:c}
\end{align}`;
  const result = numberAlignedMath(source, {
    sectionNumber: 2,
    labelPrefix: 'spacing-comment'
  });

  assert.deepEqual(result.rows.map((row) => row.ids), [['eq:a'], ['eq:c']]);
  assert.deepEqual(result.rows.map((row) => row.number), ['2.1', '2.2']);
});

test('ignores braces in tag comments and replaces empty manual tags', () => {
  const commentedTag = String.raw`\begin{align}
a &= b \tag{A % {
} \label{eq:a}
\end{align}`;
  const commentedResult = numberAlignedMath(commentedTag, {
    sectionNumber: 3,
    labelPrefix: 'tag-comment'
  });
  assert.equal(commentedResult.rows[0].number, 'A');
  assert.equal((commentedResult.tex.match(/\\tag/g) || []).length, 1);

  for (const emptyTag of ['\\tag{}', '\\tag{ }']) {
    const result = numberAlignedMath(
      `\\begin{align}\na &= b ${emptyTag}\\label{eq:empty}\n\\end{align}`,
      { sectionNumber: 4, labelPrefix: 'empty-tag' }
    );
    assert.equal(result.rows[0].number, '4.1');
    assert.equal((result.tex.match(/\\tag/g) || []).length, 1);
    assert.match(result.tex, /\\tag\{4\.1\}/);
  }
});

test('allows comment-only boundaries inside display delimiters', () => {
  for (const [opening, closing] of [['$$', '$$'], ['\\[', '\\]']]) {
    const source = `${opening}\n% before\n\\begin{align}\na &= b \\label{eq:a}\n\\end{align}\n% after\n${closing}`;
    const result = numberAlignedMath(source, {
      sectionNumber: 5,
      labelPrefix: 'boundaries'
    });
    assert.equal(result.rows[0].sourceStartLineOffset, 3);
    assert.equal(result.rows[0].number, '5.1');
    assert.ok(result.tex.startsWith('\\begin{align}'));
    assert.ok(result.tex.endsWith('\\end{align}'));
  }
});

test('keeps the site and preview equation helpers byte-identical', () => {
  const previewHelper = fs.readFileSync(path.join(__dirname, '../media/equation-numbering.js'));
  const siteHelper = fs.readFileSync(path.join(__dirname, '../../equation-numbering.js'));
  assert.deepEqual(previewHelper, siteHelper);
});
