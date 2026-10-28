'use strict';

const CALLOUT_TYPES = [
  'definition',
  'proposition',
  'lemma',
  'theorem',
  'algorithm',
  'remark',
  'corollary',
  'example',
  'assumption',
  'axiom',
  'claim',
  'conjecture',
  'fact',
  'exercise',
  'observation',
  'notation',
  'problem'
];

const PROTECTED_HTML_CONTAINERS = new Set([
  'pre',
  'code',
  'script',
  'style',
  'textarea',
  'title',
  'xmp',
  'iframe',
  'noembed',
  'noframes'
]);

const MARKDOWN_HTML_BLOCK_ELEMENTS = new Set([
  'address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body',
  'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir',
  'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
  'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem',
  'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'search',
  'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'title', 'tr', 'track', 'ul'
]);

/**
 * Find numbered callout targets in one Markdown source file. Every recognized
 * callout advances its own type's counter, even when it has no source label.
 * Only source-written ids are returned; generated preview ids are deliberately
 * omitted because there is nowhere useful to reveal them in the editor.
 */
function scanMarkdownCallouts(document = {}) {
  const text = normalizeNewlines(document.text);
  const commentsMasked = maskHtmlComments(text);
  const masked = maskNonRenderedMarkdown(text, commentsMasked);
  const sectionNumber = positiveInteger(document.sectionNumber, 1);
  const uri = typeof document.uri === 'string' ? document.uri : '';
  const version = Number.isInteger(document.version) ? document.version : 0;
  const sourcePath = typeof document.path === 'string' ? document.path : '';
  const lineStarts = buildLineStarts(text);
  const counters = Object.fromEntries(CALLOUT_TYPES.map((type) => [type, 0]));
  const records = [];

  let cursor = 0;
  while (cursor < masked.length) {
    const start = masked.indexOf('<', cursor);
    if (start < 0) break;

    const tag = readHtmlTag(masked, start);
    if (!tag) {
      cursor = start + 1;
      continue;
    }
    cursor = tag.end;

    if (tag.closing || tag.name !== 'div') continue;
    const attributes = parseAttributes(text, tag);
    const classAttribute = firstAttribute(attributes, 'class');
    if (!classAttribute) continue;

    const classes = classAttribute.value.split(/\s+/).filter(Boolean);
    if (!classes.includes('callout')) continue;
    const type = CALLOUT_TYPES.find((candidate) => classes.includes(candidate));
    if (!type) continue;

    counters[type] += 1;
    const number = `${sectionNumber}.${counters[type]}`;
    const label = capitalize(type);
    const targetLine = positionAt(lineStarts, start).line;
    const markers = precedingCalloutMarkers({
      masked,
      commentsMasked,
      lineStarts,
      calloutStart: start
    });
    const directId = sourceIdAttribute(attributes);
    const targets = directId ? [directId, ...markers] : markers;

    targets.forEach((target) => {
      records.push(referenceRecord({
        id: target.id,
        label,
        number,
        uri,
        version,
        sourcePath,
        location: positionAt(lineStarts, target.start),
        targetLine
      }));
    });
  }

  return records;
}

function referenceRecord({ id, label, number, uri, version, sourcePath, location, targetLine }) {
  return {
    id,
    label,
    number,
    uri,
    version,
    path: sourcePath,
    line: location.line,
    character: location.character,
    endLine: location.line,
    endCharacter: location.character + id.length,
    targetLine
  };
}

function precedingCalloutMarkers(context) {
  const {
    masked,
    commentsMasked,
    lineStarts,
    calloutStart
  } = context;
  const prefix = commentsMasked.slice(0, calloutStart);
  const starts = [];
  const opening = /<\s*a\b/gi;
  let match = opening.exec(prefix);
  while (match) {
    starts.push(match.index);
    match = opening.exec(prefix);
  }

  let markers = [];
  for (let index = starts.length - 1; index >= 0; index -= 1) {
    const start = starts[index];
    if (!masked.slice(start, start + 2).trim()) continue;

    const position = positionAt(lineStarts, start);
    const lineStart = lineStarts[position.line];
    if (!isMarkdownContainerPrefix(commentsMasked.slice(lineStart, start))) continue;

    const found = emptyAnchorMarkers(
      maskMarkdownContainerPrefixes(commentsMasked.slice(start, calloutStart)),
      start
    );
    if (found.length) markers = found;
  }

  return markers;
}

function emptyAnchorMarkers(value, absoluteStart) {
  const markers = [];
  let cursor = 0;

  while (cursor < value.length) {
    cursor = skipWhitespace(value, cursor);
    if (cursor >= value.length) break;

    const opening = readHtmlTag(value, cursor);
    if (!opening || opening.closing || opening.name !== 'a' || opening.selfClosing) return [];
    const idAttribute = sourceIdAttribute(parseAttributes(value, opening));
    if (!idAttribute || !isCalloutId(idAttribute.id)) return [];

    cursor = skipWhitespace(value, opening.end);
    const closing = readHtmlTag(value, cursor);
    if (!closing || !closing.closing || closing.name !== 'a') return [];

    markers.push({
      id: idAttribute.id,
      start: absoluteStart + idAttribute.start
    });
    cursor = closing.end;
  }

  return markers;
}

function sourceIdAttribute(attributes) {
  const attribute = firstAttribute(attributes, 'id');
  if (!attribute) return undefined;
  const id = attribute.value.trim();
  if (!id || /\s/.test(id)) return undefined;
  const leadingWhitespace = attribute.value.indexOf(id);
  return {
    id,
    start: attribute.valueStart + Math.max(0, leadingWhitespace)
  };
}

function isCalloutId(id) {
  const match = /^([^:;\s]+)[:;](\S+)$/.exec(String(id || '').trim());
  return Boolean(match) && CALLOUT_TYPES.includes(match[1].toLocaleLowerCase());
}

function maskNonRenderedMarkdown(source, commentsMasked) {
  let masked = maskFencedCode(commentsMasked);
  masked = maskProtectedHtmlContainers(masked);
  masked = maskInlineCode(masked);
  return maskIndentedCode(masked);
}

function maskFencedCode(value) {
  const characters = value.split('');
  let offset = 0;
  let fence;
  let markdownHtmlBlock = false;

  while (offset < value.length) {
    const newline = value.indexOf('\n', offset);
    const end = newline < 0 ? value.length : newline;
    const line = value.slice(offset, end);
    const context = markdownLineContext(line);
    const opening = /^ {0,3}(`{3,}|~{3,})/.exec(context.content);

    if (markdownHtmlBlock) {
      if (!context.content.trim()) markdownHtmlBlock = false;
      offset = newline < 0 ? value.length : newline + 1;
      continue;
    }

    if (fence && context.quoteDepth < fence.quoteDepth) fence = undefined;
    if (fence?.listIndent && context.leadingIndent < fence.listIndent &&
        startsHtmlTag(context.content)) {
      fence = undefined;
      markdownHtmlBlock = true;
    }

    if (fence) {
      maskRange(characters, offset, end);
      const closing = new RegExp(`^ {0,3}${escapeRegExp(fence.character)}{${fence.length},}[ \\t]*$`);
      if (closing.test(context.content)) fence = undefined;
    } else if (opening) {
      const character = opening[1][0];
      const info = context.content.slice(opening[0].length);
      const invalidBacktickInfo = character === '`' && info.includes('`');

      if (!invalidBacktickInfo) {
        fence = {
          character,
          length: opening[1].length,
          quoteDepth: context.quoteDepth,
          listIndent: context.listIndent
        };
        maskRange(characters, offset, end);
      }
    }

    offset = newline < 0 ? value.length : newline + 1;
  }

  return characters.join('');
}

function maskHtmlComments(value) {
  const characters = value.split('');
  let cursor = 0;

  while (cursor < value.length) {
    const start = value.indexOf('<!--', cursor);
    if (start < 0) break;
    const closing = value.indexOf('-->', start + 4);
    const end = closing < 0 ? value.length : closing + 3;
    maskRange(characters, start, end);
    cursor = end;
  }

  return characters.join('');
}

function maskProtectedHtmlContainers(value) {
  const characters = value.split('');
  let cursor = 0;

  while (cursor < value.length) {
    const start = value.indexOf('<', cursor);
    if (start < 0) break;
    const tag = readHtmlTag(value, start);
    if (!tag) {
      cursor = start + 1;
      continue;
    }

    if (!tag.closing && PROTECTED_HTML_CONTAINERS.has(tag.name)) {
      const end = protectedContainerEnd(value, tag);
      maskRange(characters, start, end);
      cursor = end;
      continue;
    }
    cursor = tag.end;
  }

  return characters.join('');
}

function protectedContainerEnd(value, opening) {
  if (opening.selfClosing) return opening.end;
  const closingPattern = new RegExp(`<\\s*\\/\\s*${escapeRegExp(opening.name)}\\b`, 'gi');
  closingPattern.lastIndex = opening.end;
  let match = closingPattern.exec(value);

  while (match) {
    const closing = readHtmlTag(value, match.index);
    if (closing?.closing && closing.name === opening.name) return closing.end;
    closingPattern.lastIndex = match.index + 1;
    match = closingPattern.exec(value);
  }
  return value.length;
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

function maskIndentedCode(value) {
  const characters = value.split('');
  let markdownHtmlBlock = false;
  let offset = 0;

  while (offset < value.length) {
    const newline = value.indexOf('\n', offset);
    const end = newline < 0 ? value.length : newline;
    const line = value.slice(offset, end);
    const context = markdownLineContext(line);
    if (!context.content.trim()) markdownHtmlBlock = false;
    if (startsMarkdownHtmlBlock(context.content)) markdownHtmlBlock = true;

    if (/^(?: {4}|\t)/.test(context.content) && !markdownHtmlBlock) {
      maskRange(characters, offset, end);
    }
    offset = newline < 0 ? value.length : newline + 1;
  }

  return characters.join('');
}

function readHtmlTag(value, start) {
  if (value[start] !== '<' || isEscaped(value, start)) return undefined;
  const prefix = /^<\s*(\/?)\s*([A-Za-z][A-Za-z0-9:-]*)/.exec(value.slice(start));
  if (!prefix) return undefined;

  let quote;
  let cursor = start + prefix[0].length;
  while (cursor < value.length) {
    const character = value[cursor];
    if (quote) {
      if (character === quote) quote = undefined;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      const beforeClose = value.slice(start + prefix[0].length, cursor);
      return {
        start,
        end: cursor + 1,
        name: prefix[2].toLocaleLowerCase(),
        closing: Boolean(prefix[1]),
        selfClosing: /\/\s*$/.test(beforeClose),
        attributesStart: start + prefix[0].length,
        attributesEnd: cursor
      };
    }
    cursor += 1;
  }
  return undefined;
}

function markdownLineContext(line) {
  let cursor = 0;
  let quoteDepth = 0;

  while (cursor < line.length) {
    let probe = cursor;
    let spaces = 0;
    while (spaces < 4 && line[probe] === ' ') {
      probe += 1;
      spaces += 1;
    }
    if (spaces > 3 || line[probe] !== '>') break;

    quoteDepth += 1;
    cursor = probe + 1;
    if (line[cursor] === ' ' || line[cursor] === '\t') cursor += 1;
  }

  const remainder = line.slice(cursor);
  const leadingIndent = /^[ \t]*/.exec(remainder)?.[0].length || 0;
  const list = /^ {0,3}(?:[*+-]|\d{1,9}[.)])[ \t]/.exec(remainder);
  if (list) cursor += list[0].length;

  return {
    content: line.slice(cursor),
    quoteDepth,
    listIndent: list ? list[0].length : 0,
    leadingIndent
  };
}

function isMarkdownContainerPrefix(value) {
  return !markdownLineContext(String(value || '')).content.trim();
}

function maskMarkdownContainerPrefixes(value) {
  return String(value || '').split('\n').map((line, index) => {
    if (index === 0) return line;
    const context = markdownLineContext(line);
    const prefixLength = line.length - context.content.length;
    return ' '.repeat(prefixLength) + context.content;
  }).join('\n');
}

function startsHtmlTag(value) {
  const match = /^ {0,3}<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)\b/.exec(value);
  return Boolean(match);
}

function startsMarkdownHtmlBlock(value) {
  const match = /^ {0,3}<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)\b/.exec(value);
  return Boolean(match) && MARKDOWN_HTML_BLOCK_ELEMENTS.has(match[1].toLocaleLowerCase());
}

function isEscaped(value, offset) {
  let backslashes = 0;
  for (let index = offset - 1; index >= 0 && value[index] === '\\'; index -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

function parseAttributes(value, tag) {
  const attributes = [];
  let cursor = tag.attributesStart;

  while (cursor < tag.attributesEnd) {
    cursor = skipWhitespace(value, cursor);
    if (cursor >= tag.attributesEnd || value[cursor] === '/') break;

    const nameStart = cursor;
    while (cursor < tag.attributesEnd && !/[\s=/>]/.test(value[cursor])) cursor += 1;
    if (cursor === nameStart) {
      cursor += 1;
      continue;
    }
    const name = value.slice(nameStart, cursor).toLocaleLowerCase();
    cursor = skipWhitespace(value, cursor);
    if (value[cursor] !== '=') {
      attributes.push({ name, value: '', valueStart: cursor });
      continue;
    }

    cursor = skipWhitespace(value, cursor + 1);
    const quote = value[cursor] === '"' || value[cursor] === "'" ? value[cursor] : undefined;
    if (quote) {
      const valueStart = cursor + 1;
      cursor = valueStart;
      while (cursor < tag.attributesEnd && value[cursor] !== quote) cursor += 1;
      attributes.push({ name, value: value.slice(valueStart, cursor), valueStart });
      if (cursor < tag.attributesEnd) cursor += 1;
      continue;
    }

    const valueStart = cursor;
    while (cursor < tag.attributesEnd && !/[\s>]/.test(value[cursor])) cursor += 1;
    attributes.push({ name, value: value.slice(valueStart, cursor), valueStart });
  }

  return attributes;
}

function firstAttribute(attributes, name) {
  return attributes.find((attribute) => attribute.name === name);
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

function skipWhitespace(value, start) {
  let cursor = start;
  while (cursor < value.length && /\s/.test(value[cursor])) cursor += 1;
  return cursor;
}

function normalizeNewlines(value) {
  return String(value || '').replace(/\r\n?/g, '\n');
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  CALLOUT_TYPES,
  scanMarkdownCallouts
};
