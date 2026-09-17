'use strict';

const {
  alignBlockAtStart,
  isEquationId,
  manualEquationTag,
  numberAlignedMath
} = require('./equation-numbering');

/**
 * Build an equation-reference index keyed by label. Documents must already be
 * in section order. Missing configured files should be omitted by the caller
 * without renumbering the remaining section numbers.
 */
function buildEquationReferenceIndex(documents) {
  const index = new Map();
  if (!Array.isArray(documents)) return index;

  for (const document of documents) {
    for (const record of scanMarkdownEquations(document)) {
      if (!index.has(record.id)) index.set(record.id, []);
      index.get(record.id).push(record);
    }
  }
  return index;
}

function equationReferenceRecords(index) {
  if (!(index instanceof Map)) return [];
  return Array.from(index.values()).flat();
}

/**
 * Find numbered equation targets in one Markdown source file. This mirrors the
 * preview's rule: only labeled displays advance the equation counter, while an
 * align environment advances once for each labeled, non-suppressed row.
 */
function scanMarkdownEquations(document = {}) {
  const text = normalizeNewlines(document.text);
  const masked = maskNonRenderedMarkdown(text);
  const sectionNumber = positiveInteger(document.sectionNumber, 1);
  const uri = typeof document.uri === 'string' ? document.uri : '';
  const version = Number.isInteger(document.version) ? document.version : 0;
  const sourcePath = typeof document.path === 'string' ? document.path : '';
  const lineStarts = buildLineStarts(text);
  const records = [];
  let counter = 0;

  for (const block of findMathBlocks(text, masked)) {
    const maskedBlockText = masked.slice(block.start, block.end);
    const aligned = numberAlignedMath(maskedBlockText, {
      sectionNumber,
      startCounter: counter,
      labelPrefix: `course-notes-index-${sectionNumber}`
    });

    if (aligned) {
      counter = aligned.counter;
      if (aligned.rows.length) {
        const labels = findEquationLabels(maskedBlockText, block.start, lineStarts);
        const blockLine = positionAt(lineStarts, block.start).line;

        for (const row of aligned.rows) {
          for (const id of row.ids) {
            const location = labels.find((candidate) => (
              candidate.id === id &&
              candidate.line >= blockLine + row.sourceStartLineOffset &&
              candidate.line <= blockLine + row.sourceEndLineOffset
            ));
            records.push(referenceRecord({
              id,
              number: row.number,
              uri,
              version,
              sourcePath,
              location: location || positionAt(lineStarts, block.start),
              equationLine: blockLine + row.sourceStartLineOffset
            }));
          }
        }
        continue;
      }
    }

    const markers = precedingEquationMarkers(text, block.start, lineStarts);
    const labels = findEquationLabels(maskedBlockText, block.start, lineStarts);
    const ids = unique([
      ...markers.map((marker) => marker.id),
      ...labels.map((label) => label.id)
    ]);
    if (!ids.length) continue;

    counter += 1;
    const automaticNumber = `${sectionNumber}.${counter}`;
    const manualTag = manualEquationTag(maskedBlockText)?.value || '';
    const number = manualTag || automaticNumber;
    const equationLine = positionAt(
      lineStarts,
      block.start + firstMathContentOffset(maskedBlockText)
    ).line;

    for (const id of ids) {
      const markerMatches = markers.filter((marker) => marker.id === id);
      const location = markerMatches[0] ||
        labels.find((label) => label.id === id) ||
        positionAt(lineStarts, block.start);
      records.push(referenceRecord({
        id,
        number,
        uri,
        version,
        sourcePath,
        location,
        equationLine
      }));
      markerMatches.slice(1).forEach((duplicate) => {
        records.push(referenceRecord({
          id,
          number,
          uri,
          version,
          sourcePath,
          location: duplicate,
          equationLine
        }));
      });
    }
  }

  return records;
}

function referenceRecord({ id, number, uri, version, sourcePath, location, equationLine }) {
  return {
    id,
    label: 'Equation',
    number,
    uri,
    version,
    path: sourcePath,
    line: location.line,
    character: location.character,
    endLine: location.line,
    endCharacter: location.character + id.length,
    equationLine
  };
}

function firstMathContentOffset(value) {
  const source = String(value || '');
  let start = 0;
  if (source.startsWith('$$') || source.startsWith('\\[')) {
    start = 2;
  } else {
    const opening = /^ {0,3}\\begin\s*\{align\*?\}/.exec(source);
    if (opening) start = opening[0].length;
  }
  const content = source.slice(start).search(/\S/);
  return content < 0 ? start : start + content;
}

function findMathBlocks(text, masked) {
  const blocks = [];
  const opening = /\$\$(?!\$)|\\\[|\\begin\s*\{align\*?\}/g;
  let match = opening.exec(masked);

  while (match) {
    if (isEscaped(masked, match.index)) {
      match = opening.exec(masked);
      continue;
    }

    const block = mathBlockAt(text, masked, match.index, match[0]);
    if (!block) {
      opening.lastIndex = match.index + Math.max(1, match[0].length);
      match = opening.exec(masked);
      continue;
    }

    blocks.push(block);
    opening.lastIndex = block.end;
    match = opening.exec(masked);
  }

  return blocks;
}

function mathBlockAt(text, masked, start, opener) {
  const rest = masked.slice(start);
  if (opener.startsWith('\\begin')) {
    const aligned = alignBlockAtStart(rest);
    if (!aligned || !aligned.raw.trim()) return undefined;
    return { start, end: start + aligned.raw.length };
  }

  if (opener === '\\[') {
    const close = findUnescaped(masked, '\\]', start + 2);
    if (close < 0 || !masked.slice(start + 2, close).trim()) return undefined;
    return { start, end: close + 2 };
  }

  const multiline = /^\$\$[ \t]*\n([\s\S]*?)\n\$\$[ \t]*(?:\n|$)/.exec(rest);
  if (multiline && multiline[1].trim()) {
    return { start, end: start + multiline[0].length };
  }

  const singleLine = /^\$\$(?!\$)([^\n]*?)\$\$[ \t]*(?:\n|$)/.exec(rest);
  if (singleLine && singleLine[1].trim()) {
    return { start, end: start + singleLine[0].length };
  }

  const close = findUnescaped(masked, '$$', start + 2);
  if (close < 0 || !masked.slice(start + 2, close).trim()) return undefined;
  return { start, end: close + 2 };
}

function precedingEquationMarkers(text, blockStart, lineStarts) {
  const blockPosition = positionAt(lineStarts, blockStart);
  const lines = text.split('\n');
  const markers = [];
  let line = blockPosition.line;

  if (text.slice(lineStarts[line], blockStart).trim()) return [];
  line -= 1;

  while (line >= 0) {
    const value = lines[line] || '';
    if (!value.trim()) {
      line -= 1;
      continue;
    }

    const anchors = emptyAnchorMarkers(value, line);
    if (!anchors.length) break;
    markers.unshift(...anchors);
    line -= 1;
  }

  return markers;
}

function emptyAnchorMarkers(value, line) {
  const anchors = [];
  const ranges = [];
  const pattern = /<a\b[^>]*>\s*<\/a>/gi;
  let match = pattern.exec(value);

  while (match) {
    ranges.push({ start: match.index, end: pattern.lastIndex });
    const idAttribute = /\bid\s*=\s*(["'])([^"']+)\1/i.exec(match[0]);
    if (!idAttribute || !isEquationId(idAttribute[2].trim())) return [];

    const id = idAttribute[2].trim();
    const rawValue = idAttribute[2];
    const leadingWhitespace = rawValue.indexOf(id);
    const character = match.index + idAttribute.index +
      idAttribute[0].indexOf(rawValue) + Math.max(0, leadingWhitespace);
    anchors.push({ id, line, character });
    match = pattern.exec(value);
  }

  if (!anchors.length) return [];
  let remainder = value;
  for (let index = ranges.length - 1; index >= 0; index -= 1) {
    remainder = remainder.slice(0, ranges[index].start) + remainder.slice(ranges[index].end);
  }
  return remainder.trim() ? [] : anchors;
}

function findEquationLabels(value, absoluteStart, documentLineStarts) {
  const visible = maskTexComments(value);
  const labels = [];
  const pattern = /\\label\s*\{([^{}\r\n]+)\}/g;
  let match = pattern.exec(visible);

  while (match) {
    const id = match[1].trim();
    if (!isEscaped(visible, match.index) && isEquationId(id)) {
      const rawId = match[1];
      const relativeIdStart = match.index + match[0].indexOf(rawId) + rawId.indexOf(id);
      const location = positionAt(documentLineStarts, absoluteStart + relativeIdStart);
      labels.push({
        id,
        line: location.line,
        character: location.character,
        absoluteOffset: absoluteStart + relativeIdStart
      });
    }
    match = pattern.exec(visible);
  }

  return labels;
}

function maskNonRenderedMarkdown(value) {
  const source = normalizeNewlines(value);
  const characters = source.split('');
  let offset = 0;
  let fence;

  while (offset < source.length) {
    const newline = source.indexOf('\n', offset);
    const end = newline < 0 ? source.length : newline;
    const line = source.slice(offset, end);
    const opening = /^ {0,3}(`{3,}|~{3,})/.exec(line);

    if (fence) {
      maskRange(characters, offset, end);
      const closing = new RegExp(`^ {0,3}${escapeRegExp(fence.character)}{${fence.length},}[ \\t]*$`);
      if (closing.test(line)) fence = undefined;
    } else if (opening) {
      fence = { character: opening[1][0], length: opening[1].length };
      maskRange(characters, offset, end);
    }

    offset = newline < 0 ? source.length : newline + 1;
  }

  let masked = characters.join('');
  masked = maskPattern(masked, /<!--[\s\S]*?(?:-->|$)/g);
  masked = maskPattern(masked, /<(pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/gi);
  masked = maskPattern(
    masked,
    /<(script|style|textarea|title|xmp|iframe|noembed|noframes)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi
  );
  masked = maskPattern(masked, /<![^>]*>|<\/?[A-Za-z][^>]*>/g);
  masked = maskInlineCode(masked);
  return maskIndentedCodeOutsideMath(source, masked);
}

function maskIndentedCodeOutsideMath(source, masked) {
  const mathRanges = findMathBlocks(source, masked).filter((range) => (
    !linePrefixIsIndentedCode(source, range.start)
  ));
  const characters = masked.split('');
  let offset = 0;

  while (offset < source.length) {
    const newline = source.indexOf('\n', offset);
    const end = newline < 0 ? source.length : newline;
    const line = source.slice(offset, end);
    const insideMath = mathRanges.some((range) => offset >= range.start && offset < range.end);
    if (/^(?: {4}|\t)/.test(line) && !insideMath) {
      maskRange(characters, offset, end);
    }
    offset = newline < 0 ? source.length : newline + 1;
  }

  return characters.join('');
}

function linePrefixIsIndentedCode(source, offset) {
  const lineStart = source.lastIndexOf('\n', Math.max(0, offset - 1)) + 1;
  return /^(?: {4}|\t)/.test(source.slice(lineStart, offset));
}

function maskInlineCode(value) {
  const characters = value.split('');
  const pattern = /(`+)([^\n]*?)\1/g;
  let match = pattern.exec(value);
  while (match) {
    maskRange(characters, match.index, pattern.lastIndex);
    match = pattern.exec(value);
  }
  return characters.join('');
}

function maskTexComments(value) {
  const source = String(value || '');
  const characters = source.split('');
  for (let index = 0; index < characters.length; index += 1) {
    if (characters[index] !== '%' || isEscaped(source, index)) continue;
    let cursor = index;
    while (cursor < characters.length && characters[cursor] !== '\n') {
      characters[cursor] = ' ';
      cursor += 1;
    }
    index = cursor;
  }
  return characters.join('');
}

function maskPattern(value, pattern) {
  const characters = value.split('');
  let match = pattern.exec(value);
  while (match) {
    maskRange(characters, match.index, pattern.lastIndex);
    match = pattern.exec(value);
  }
  return characters.join('');
}

function maskRange(characters, start, end) {
  for (let index = start; index < end; index += 1) {
    if (characters[index] !== '\n') characters[index] = ' ';
  }
}

function buildLineStarts(value) {
  const starts = [0];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '\n') starts.push(index + 1);
  }
  return starts;
}

function positionAt(lineStarts, offset) {
  const target = Math.max(0, Number(offset) || 0);
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (lineStarts[middle] <= target) low = middle + 1;
    else high = middle - 1;
  }
  const line = Math.max(0, high);
  return { line, character: target - lineStarts[line] };
}

function findUnescaped(value, wanted, start) {
  let index = value.indexOf(wanted, start);
  while (index >= 0) {
    if (!isEscaped(value, index)) return index;
    index = value.indexOf(wanted, index + wanted.length);
  }
  return -1;
}

function isEscaped(value, index) {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function unique(values) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function normalizeNewlines(value) {
  return String(value || '').replace(/\r\n?/g, '\n');
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  buildEquationReferenceIndex,
  equationReferenceRecords,
  scanMarkdownEquations
};
