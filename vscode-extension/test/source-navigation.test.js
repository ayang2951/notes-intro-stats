'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  inclusiveSourceEndLine,
  resolveSourceMatch
} = require('../media/source-navigation');

test('selects the requested repeated word on one line', () => {
  const match = resolveSourceMatch(
    ['alpha beta alpha'],
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.deepEqual(match, {
    lineNumber: 0,
    character: 11,
    length: 5,
    exactCase: true
  });
});

test('selects a repeated word later in a multiline block', () => {
  const match = resolveSourceMatch(
    ['alpha beta', 'gamma alpha'],
    'alpha',
    0,
    { endLine: 1, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 1);
  assert.equal(match.character, 6);
});

test('does not treat a substring as a whole-word occurrence', () => {
  const match = resolveSourceMatch(
    ['cat scatter cat'],
    'cat',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, 12);
});

test('counts mixed-case occurrences in source order', () => {
  const match = resolveSourceMatch(
    ['ALPHA alpha Alpha'],
    'Alpha',
    0,
    { endLine: 0, occurrence: 2 }
  );

  assert.equal(match.character, 12);
  assert.equal(match.exactCase, true);
});

test('ignores matching words inside HTML tags', () => {
  const match = resolveSourceMatch(
    ['<div class="alpha">alpha alpha</div>'],
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, 25);
});

test('ignores math occurrences that are not selectable preview text', () => {
  const line = 'alpha $alpha$ alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, line.lastIndexOf('alpha'));
});

test('ignores Markdown link destinations during occurrence counting', () => {
  const line = '[alpha](https://alpha.example) alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, line.lastIndexOf('alpha'));
});

test('maps a repeated linked label within its paragraph rather than another proof', () => {
  const lines = [
    '[Lemma](#lemma-1) and Lemma in this paragraph.',
    '',
    'Lemma in a different proof.'
  ];
  const match = resolveSourceMatch(
    lines,
    'Lemma',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 0);
  assert.equal(match.character, lines[0].lastIndexOf('Lemma'));
});

test('ignores an HTML hyperlink target while mapping repeated label text', () => {
  const line = '<a href="#lemma-Lemma">Lemma</a> Lemma';
  const match = resolveSourceMatch(
    [line],
    'Lemma',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, line.lastIndexOf('Lemma'));
});

test('ignores image labels and destinations that are not rendered as text', () => {
  const line = '![alpha](alpha.png) alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 0 }
  );

  assert.equal(match.character, line.lastIndexOf('alpha'));
});

test('ignores shortcut-reference image labels', () => {
  const lines = ['![alpha] alpha', '', '[alpha]: image.png'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 0, occurrence: 0 }
  );

  assert.equal(match.character, lines[0].lastIndexOf('alpha'));
});

test('does not register reference definitions inside fenced code', () => {
  const lines = ['~~~', '[alpha]: image.png', '~~~', '![alpha] alpha'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    3,
    { endLine: 3, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 3);
  assert.equal(match.character, lines[3].lastIndexOf('alpha'));
});

test('ignores multiline reference-definition destinations and titles', () => {
  const lines = ['[img]:', '  alpha.png "alpha"', '', '![img] alpha'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 3, occurrence: 0 }
  );

  assert.equal(match.lineNumber, 3);
  assert.equal(match.character, lines[3].lastIndexOf('alpha'));
});

test('keeps undefined reference markup visible', () => {
  const line = '![alpha][missing] alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, line.lastIndexOf('alpha'));
});

test('ignores multiline Markdown link destinations', () => {
  const lines = ['[alpha](', 'https://alpha.example', ') alpha'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 2, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 2);
  assert.equal(match.character, lines[2].lastIndexOf('alpha'));
});

test('does not hide unmatched bracket text as a link destination', () => {
  const line = 'x](alpha) alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 0 }
  );

  assert.equal(match.character, line.indexOf('alpha'));
});

test('does not pair Markdown brackets across blank lines', () => {
  const lines = ['[', '', 'x](alpha) alpha'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 2, occurrence: 0 }
  );

  assert.equal(match.lineNumber, 2);
  assert.equal(match.character, lines[2].indexOf('alpha'));
});

test('does not accept blank lines inside inline-link destinations', () => {
  const lines = ['[alpha](', '', 'alpha) alpha'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 2, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 2);
  assert.equal(match.character, lines[2].indexOf('alpha'));
});

test('treats a top-level indented code block as visible literal text', () => {
  const line = '    [alpha](alpha) alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.character, line.indexOf('alpha', line.indexOf('alpha') + 1));
});

test('ignores script and style contents that are absent from selectable text', () => {
  const lines = ['<script>alpha</script> alpha', '<style>', '.alpha {}', '</style> alpha'];
  const first = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 0, occurrence: 0 }
  );
  const second = resolveSourceMatch(
    lines,
    'alpha',
    1,
    { endLine: 3, occurrence: 0 }
  );

  assert.equal(first.character, lines[0].lastIndexOf('alpha'));
  assert.equal(second.lineNumber, 3);
  assert.equal(second.character, lines[3].lastIndexOf('alpha'));
});

test('requires a complete script or style closing tag name', () => {
  const line = '<script>alpha</scripture> alpha</script> alpha';
  const match = resolveSourceMatch(
    [line],
    'alpha',
    0,
    { endLine: 0, occurrence: 0 }
  );

  assert.equal(match.character, line.lastIndexOf('alpha'));
});

test('keeps indented script contents hidden after a blank line', () => {
  const lines = ['<script>', '', '    alpha', '</script>', 'alpha'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 4, occurrence: 0 }
  );

  assert.equal(match.lineNumber, 4);
});

test('tracks HTML tags across lines', () => {
  const lines = ['<div', ' class="alpha">alpha alpha</div>'];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 1, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 1);
  assert.equal(match.character, lines[1].lastIndexOf('alpha'));
});

test('limits occurrence counting to the mapped block', () => {
  const match = resolveSourceMatch(
    ['alpha', 'beta alpha alpha'],
    'alpha',
    1,
    { endLine: 1, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 1);
  assert.equal(match.character, 11);
});

test('falls back to the nearest match when the occurrence is unavailable', () => {
  const match = resolveSourceMatch(
    ['alpha beta alpha'],
    'alpha',
    0,
    { endLine: 0, occurrence: 99 }
  );

  assert.equal(match.character, 0);
});

test('does not leave the mapped block when a rendered label number has no source match', () => {
  const lines = [
    '<div class="callout lemma"><span class="label">Lemma: Local result</span>',
    'Proof text.',
    '</div>',
    '',
    'See Lemma 1.1 for the global reference.'
  ];
  const match = resolveSourceMatch(
    lines,
    '1.1',
    0,
    { endLine: 2, occurrence: 0 }
  );

  assert.deepEqual(match, {
    lineNumber: 0,
    character: 0,
    length: 0,
    exactCase: true
  });
});

test('keeps an unavailable repeated-word occurrence inside its mapped block', () => {
  const lines = [
    'alpha in the selected paragraph',
    '',
    'alpha in a different proof'
  ];
  const match = resolveSourceMatch(
    lines,
    'alpha',
    0,
    { endLine: 0, occurrence: 1 }
  );

  assert.equal(match.lineNumber, 0);
  assert.equal(match.character, 0);
  assert.equal(match.length, 5);
});

test('keeps a selection with no DOM occurrence metadata inside its mapped block', () => {
  const lines = [
    '<span class="label">Lemma: Local result</span>',
    '',
    'Lemma in a different paragraph'
  ];
  const match = resolveSourceMatch(
    lines,
    'Lemma',
    0,
    { endLine: 0 }
  );

  assert.equal(match.lineNumber, 0);
  assert.equal(match.character, lines[0].indexOf('Lemma'));
});

test('falls back to the first nonspace character without a selected word', () => {
  const match = resolveSourceMatch(['   alpha'], '', 0);

  assert.equal(match.character, 3);
  assert.equal(match.length, 0);
});

test('excludes trailing block separators from the inclusive source range', () => {
  assert.equal(inclusiveSourceEndLine(0, '# Heading\n\n'), 0);
  assert.equal(inclusiveSourceEndLine(0, '# Heading\n \t\n'), 0);
  assert.equal(inclusiveSourceEndLine(3, 'first\nsecond\n\n'), 4);
});
