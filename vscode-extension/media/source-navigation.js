(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CourseNotesSourceNavigation = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";

  function resolveSourceMatch(lines, selectedText, approximateLine, options = {}) {
    const sourceLines = normalizedLines(lines);
    const startLine = clampLine(approximateLine, sourceLines.length);
    const hasMappedRange = Number.isInteger(options.endLine);

    if (selectedText) {
      const occurrence = Number.isInteger(options.occurrence) && options.occurrence >= 0
        ? options.occurrence
        : undefined;
      const endLine = clampLine(
        Number.isInteger(options.endLine) ? options.endLine : startLine,
        sourceLines.length
      );

      if (hasMappedRange && endLine >= startLine) {
        const scopedMatches = collectSourceMatches(
          sourceLines,
          selectedText,
          startLine,
          endLine,
          { visibleOnly: true }
        );
        const requestedMatch = occurrence === undefined
          ? undefined
          : scopedMatches[occurrence];
        if (requestedMatch) return requestedMatch;

        // Render-time additions such as automatic theorem numbers have no
        // matching source text.  In that case, never jump to an unrelated
        // occurrence in another paragraph merely because it has the same
        // visible text.
        const scopedFallback = closestMatch(scopedMatches, startLine);
        if (scopedFallback) return scopedFallback;
        return fallbackMatch(sourceLines, startLine);
      }

      const matches = collectSourceMatches(
        sourceLines,
        selectedText,
        0,
        sourceLines.length - 1,
        { visibleOnly: occurrence !== undefined }
      );
      const bestMatch = closestMatch(matches, startLine);
      if (bestMatch) return bestMatch;
    }

    return fallbackMatch(sourceLines, startLine);
  }

  function fallbackMatch(lines, lineNumber) {
    const fallbackText = lines[lineNumber];
    const firstTextCharacter = fallbackText.search(/\S/);
    return {
      lineNumber,
      character: firstTextCharacter >= 0 ? firstTextCharacter : 0,
      length: 0,
      exactCase: true
    };
  }

  function collectSourceMatches(lines, selectedText, startLine, endLine, options = {}) {
    if (!selectedText) return [];

    const sourceLines = normalizedLines(lines);
    const firstLine = clampLine(startLine, sourceLines.length);
    const lastLine = clampLine(endLine, sourceLines.length);
    if (lastLine < firstLine) return [];

    const hidden = options.visibleOnly ? hiddenSourceCharacters(sourceLines) : undefined;
    const selectedLower = selectedText.toLocaleLowerCase();
    const startsWithWordCharacter = isWordCharacter(selectedText[0]);
    const endsWithWordCharacter = isWordCharacter(selectedText[selectedText.length - 1]);
    const matches = [];

    for (let lineNumber = firstLine; lineNumber <= lastLine; lineNumber += 1) {
      const lineText = sourceLines[lineNumber];
      const lineLower = lineText.toLocaleLowerCase();
      let character = lineLower.indexOf(selectedLower);

      while (character >= 0) {
        const afterIndex = character + selectedText.length;
        const before = character > 0 ? lineText[character - 1] : "";
        const after = afterIndex < lineText.length ? lineText[afterIndex] : "";
        const validStart = !startsWithWordCharacter || !isWordCharacter(before);
        const validEnd = !endsWithWordCharacter || !isWordCharacter(after);
        const visible = !hidden || rangeIsVisible(hidden[lineNumber], character, afterIndex);

        if (validStart && validEnd && visible) {
          matches.push({
            lineNumber,
            character,
            length: selectedText.length,
            exactCase: lineText.slice(character, afterIndex) === selectedText
          });
        }

        character = lineLower.indexOf(
          selectedLower,
          character + Math.max(1, selectedText.length)
        );
      }
    }

    return matches;
  }

  function closestMatch(matches, approximateLine) {
    let bestMatch;

    matches.forEach((match) => {
      const score =
        Math.abs(match.lineNumber - approximateLine) * 1_000_000 +
        (match.exactCase ? 0 : 100_000) +
        match.character;

      if (!bestMatch || score < bestMatch.score) {
        bestMatch = { ...match, score };
      }
    });

    if (!bestMatch) return undefined;
    const { score: _score, ...match } = bestMatch;
    return match;
  }

  function hiddenSourceCharacters(lines) {
    const hidden = lines.map((line) => new Uint8Array(line.length));
    const literal = lines.map((line) => new Uint8Array(line.length));
    const indentedCodeLines = findIndentedCodeLines(lines);
    let fence;
    let htmlMode = "";
    let htmlQuote = "";
    let pendingRawTextElement = "";
    let rawTextElement = "";
    let inlineCodeTicks = 0;
    let mathEnd = "";

    lines.forEach((line, lineNumber) => {
      const fenceMatch = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(line);
      if (fence) {
        const marker = fenceMatch?.[2] || "";
        if (marker[0] === fence.character && marker.length >= fence.length && /^\s*$/.test(fenceMatch[3])) {
          markRange(hidden[lineNumber], 0, line.length);
          fence = undefined;
        } else {
          markRange(literal[lineNumber], 0, line.length);
        }
        return;
      }
      if (!htmlMode && !rawTextElement && !inlineCodeTicks && !mathEnd && indentedCodeLines[lineNumber]) {
        markRange(literal[lineNumber], 0, line.length);
        return;
      }
      if (!htmlMode && !inlineCodeTicks && !mathEnd && fenceMatch) {
        fence = { character: fenceMatch[2][0], length: fenceMatch[2].length };
        markRange(hidden[lineNumber], 0, line.length);
        return;
      }

      let index = 0;
      while (index < line.length) {
        if (rawTextElement) {
          const closing = rawTextClosingIndex(line, rawTextElement, index);
          if (closing < 0) {
            markRange(hidden[lineNumber], index, line.length);
            index = line.length;
          } else {
            markRange(hidden[lineNumber], index, closing);
            index = closing;
            rawTextElement = "";
          }
          continue;
        }

        if (htmlMode === "comment") {
          const end = line.indexOf("-->", index);
          if (end < 0) {
            markRange(hidden[lineNumber], index, line.length);
            index = line.length;
          } else {
            markRange(hidden[lineNumber], index, end + 3);
            index = end + 3;
            htmlMode = "";
          }
          continue;
        }

        if (htmlMode === "tag") {
          hidden[lineNumber][index] = 1;
          const value = line[index];
          if (htmlQuote) {
            if (value === htmlQuote && !isEscaped(line, index)) htmlQuote = "";
          } else if (value === '"' || value === "'") {
            htmlQuote = value;
          } else if (value === ">") {
            htmlMode = "";
            if (pendingRawTextElement) {
              rawTextElement = pendingRawTextElement;
              pendingRawTextElement = "";
            }
          }
          index += 1;
          continue;
        }

        if (mathEnd) {
          if (line.startsWith(mathEnd, index) && !isEscaped(line, index)) {
            markRange(hidden[lineNumber], index, index + mathEnd.length);
            index += mathEnd.length;
            mathEnd = "";
          } else {
            hidden[lineNumber][index] = 1;
            index += 1;
          }
          continue;
        }

        const tickCount = countRun(line, index, "`");
        if (inlineCodeTicks) {
          if (tickCount === inlineCodeTicks) {
            markRange(hidden[lineNumber], index, index + tickCount);
            inlineCodeTicks = 0;
            index += tickCount;
          } else {
            markRange(literal[lineNumber], index, index + Math.max(1, tickCount));
            index += Math.max(1, tickCount);
          }
          continue;
        }
        if (tickCount) {
          markRange(hidden[lineNumber], index, index + tickCount);
          inlineCodeTicks = tickCount;
          index += tickCount;
          continue;
        }

        if (line.startsWith("<!--", index)) {
          htmlMode = "comment";
          continue;
        }
        const htmlTag = line[index] === "<" ? htmlTagAt(line.slice(index)) : undefined;
        if (htmlTag) {
          htmlMode = "tag";
          htmlQuote = "";
          pendingRawTextElement = !htmlTag.closing && /^(?:script|style)$/i.test(htmlTag.name)
            ? htmlTag.name.toLocaleLowerCase()
            : "";
          continue;
        }

        const delimiter = mathDelimiterAt(line, index);
        if (delimiter) {
          mathEnd = delimiter.end;
          markRange(hidden[lineNumber], index, index + delimiter.length);
          index += delimiter.length;
          continue;
        }

        index += 1;
      }
    });

    maskMarkdownDestinations(lines, hidden, literal);
    return hidden;
  }

  function mathDelimiterAt(line, index) {
    if (isEscaped(line, index)) return undefined;
    if (line.startsWith("$$", index)) return { end: "$$", length: 2 };
    if (line[index] === "$" && hasClosingDelimiter(line, "$", index + 1)) {
      return { end: "$", length: 1 };
    }
    if (line.startsWith("\\(", index) && hasClosingDelimiter(line, "\\)", index + 2)) {
      return { end: "\\)", length: 2 };
    }
    if (line.startsWith("\\[", index)) return { end: "\\]", length: 2 };
    return undefined;
  }

  function hasClosingDelimiter(line, delimiter, start) {
    let index = line.indexOf(delimiter, start);
    while (index >= 0) {
      if (!isEscaped(line, index)) return true;
      index = line.indexOf(delimiter, index + delimiter.length);
    }
    return false;
  }

  function maskMarkdownDestinations(lines, hidden, literal) {
    const referenceLabels = maskReferenceDefinitions(lines, hidden, literal);

    const flattened = flattenLines(lines);
    const hiddenFlat = flattenMasks(hidden, flattened.lineStarts, flattened.source.length);
    const literalFlat = flattenMasks(literal, flattened.lineStarts, flattened.source.length);
    const brackets = [];

    for (let index = 0; index < flattened.source.length; index += 1) {
      if (hiddenFlat[index] || literalFlat[index] || isEscaped(flattened.source, index)) continue;
      const value = flattened.source[index];

      if (value === "\n" && blankLineFollows(flattened.source, index)) {
        brackets.length = 0;
        continue;
      }

      if (value === "[") {
        const imageStart = index > 0 && flattened.source[index - 1] === "!" &&
          !hiddenFlat[index - 1] && !literalFlat[index - 1] &&
          !isEscaped(flattened.source, index - 1)
          ? index - 1
          : -1;
        brackets.push({ index, imageStart });
        continue;
      }

      if (value !== "]" || !brackets.length) continue;
      const opening = brackets.pop();
      const destinationStart = index + 1;
      const destination = markdownDestination(
        flattened.source,
        destinationStart,
        flattened.source.slice(opening.index + 1, index),
        referenceLabels
      );

      if (destination) {
        const maskStart = opening.imageStart >= 0 ? opening.imageStart : destinationStart;
        markRange(hiddenFlat, maskStart, destination.end + 1);
        index = destination.end;
        continue;
      }

      if (opening.imageStart >= 0) {
        const label = normalizeReferenceLabel(
          flattened.source.slice(opening.index + 1, index)
        );
        if (referenceLabels.has(label)) {
          markRange(hiddenFlat, opening.imageStart, index + 1);
        }
      }
    }

    copyFlatMask(hiddenFlat, hidden, flattened.lineStarts);
  }

  function maskReferenceDefinitions(lines, hidden, literal) {
    const labels = new Set();

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
      const definition = /^ {0,3}\[([^\]]+)\]:/.exec(lines[lineNumber]);
      if (!definition) continue;
      const bracket = lines[lineNumber].indexOf("[");
      if (hidden[lineNumber][bracket] || literal[lineNumber][bracket]) continue;

      const parsed = parseReferenceDefinition(lines, lineNumber, definition[0].length);
      if (!parsed) continue;
      labels.add(normalizeReferenceLabel(definition[1]));
      for (let current = lineNumber; current <= parsed.endLine; current += 1) {
        markRange(hidden[current], 0, lines[current].length);
      }
      lineNumber = parsed.endLine;
    }

    return labels;
  }

  function parseReferenceDefinition(lines, startLine, startCharacter) {
    let lineNumber = startLine;
    let character = skipHorizontalSpace(lines[lineNumber], startCharacter);

    if (character >= lines[lineNumber].length) {
      lineNumber += 1;
      if (lineNumber >= lines.length || !lines[lineNumber].trim()) return undefined;
      character = skipHorizontalSpace(lines[lineNumber], 0);
    }

    const destinationEnd = referenceDestinationEnd(lines[lineNumber], character);
    if (destinationEnd < 0) return undefined;
    character = skipHorizontalSpace(lines[lineNumber], destinationEnd);

    if (character < lines[lineNumber].length) {
      return referenceTitleEnd(lines[lineNumber], character) === lines[lineNumber].length
        ? { endLine: lineNumber }
        : undefined;
    }

    const titleLine = lineNumber + 1;
    if (titleLine < lines.length && lines[titleLine].trim()) {
      const titleStart = skipHorizontalSpace(lines[titleLine], 0);
      if (isReferenceTitleOpener(lines[titleLine][titleStart]) &&
          referenceTitleEnd(lines[titleLine], titleStart) === lines[titleLine].length) {
        return { endLine: titleLine };
      }
    }

    return { endLine: lineNumber };
  }

  function referenceDestinationEnd(line, start) {
    if (line[start] === "<") {
      for (let index = start + 1; index < line.length; index += 1) {
        if (line[index] === ">" && !isEscaped(line, index)) return index + 1;
        if (line[index] === "<") return -1;
      }
      return -1;
    }

    let depth = 0;
    let index = start;
    for (; index < line.length && !/[ \t]/.test(line[index]); index += 1) {
      if (isEscaped(line, index)) continue;
      if (line[index] === "(") depth += 1;
      if (line[index] === ")") {
        if (!depth) return -1;
        depth -= 1;
      }
    }
    return index > start && depth === 0 ? index : -1;
  }

  function referenceTitleEnd(line, start) {
    const opening = line[start];
    const closing = opening === "(" ? ")" : opening;
    if (!isReferenceTitleOpener(opening)) return -1;

    for (let index = start + 1; index < line.length; index += 1) {
      if (line[index] !== closing || isEscaped(line, index)) continue;
      return /^\s*$/.test(line.slice(index + 1)) ? line.length : -1;
    }
    return -1;
  }

  function isReferenceTitleOpener(value) {
    return value === '"' || value === "'" || value === "(";
  }

  function skipHorizontalSpace(line, start) {
    let index = start;
    while (line[index] === " " || line[index] === "\t") index += 1;
    return index;
  }

  function markdownDestination(source, index, primaryLabel, referenceLabels) {
    if (source[index] === "(") {
      const end = findClosingDelimiter(source, index, "(", ")", false);
      return end >= 0 ? { end } : undefined;
    }
    if (source[index] !== "[") return undefined;

    const end = findClosingDelimiter(source, index, "[", "]", true);
    if (end < 0) return undefined;
    const explicitLabel = source.slice(index + 1, end);
    const label = explicitLabel || primaryLabel;
    return referenceLabels.has(normalizeReferenceLabel(label)) ? { end } : undefined;
  }

  function findClosingDelimiter(source, start, opening, closing, allowBlankLines) {
    if (source[start] !== opening) return -1;
    let depth = 0;

    for (let index = start; index < source.length; index += 1) {
      if (isEscaped(source, index)) continue;
      if (!allowBlankLines && source[index] === "\n" && blankLineFollows(source, index)) return -1;
      if (source[index] === opening) depth += 1;
      if (source[index] === closing) depth -= 1;
      if (depth === 0) return index;
    }
    return -1;
  }

  function blankLineFollows(source, newlineIndex) {
    const nextNewline = source.indexOf("\n", newlineIndex + 1);
    const end = nextNewline >= 0 ? nextNewline : source.length;
    return /^[ \t]*$/.test(source.slice(newlineIndex + 1, end));
  }

  function rawTextClosingIndex(line, tagName, start) {
    const lower = line.toLocaleLowerCase();
    const needle = `</${tagName.toLocaleLowerCase()}`;
    let index = lower.indexOf(needle, start);
    while (index >= 0) {
      const boundary = lower[index + needle.length] || "";
      if (!boundary || /[\s/>]/.test(boundary)) return index;
      index = lower.indexOf(needle, index + needle.length);
    }
    return -1;
  }

  function findIndentedCodeLines(lines) {
    const result = new Array(lines.length).fill(false);
    let active = false;
    let mostRecentNonblank = "";

    lines.forEach((line, lineNumber) => {
      const blank = /^\s*$/.test(line);
      const indented = /^(?: {4}|\t)/.test(line);
      const previousBlank = lineNumber === 0 || /^\s*$/.test(lines[lineNumber - 1]);
      const followsListMarker = /^ {0,3}(?:[-+*]|\d+[.)])\s+/.test(mostRecentNonblank);

      if (indented && (active || lineNumber === 0 || (previousBlank && !followsListMarker))) {
        result[lineNumber] = true;
        active = true;
      } else if (!blank) {
        active = false;
      }

      if (!blank) mostRecentNonblank = line;
    });

    return result;
  }

  function htmlTagAt(remainder) {
    const match = /^<(\/)?([A-Za-z][A-Za-z0-9:-]*)(?:\s|\/?>|$)/.exec(remainder);
    if (match) return { closing: Boolean(match[1]), name: match[2] };
    if (/^<(?:!--|!doctype\b|\?)/i.test(remainder)) return { closing: false, name: "" };
    return undefined;
  }

  function flattenLines(lines) {
    const lineStarts = [];
    let source = "";
    lines.forEach((line, index) => {
      lineStarts.push(source.length);
      source += line;
      if (index < lines.length - 1) source += "\n";
    });
    return { lineStarts, source };
  }

  function flattenMasks(masks, lineStarts, length) {
    const flat = new Uint8Array(length);
    masks.forEach((mask, lineNumber) => {
      flat.set(mask, lineStarts[lineNumber]);
    });
    return flat;
  }

  function copyFlatMask(flat, masks, lineStarts) {
    masks.forEach((mask, lineNumber) => {
      const start = lineStarts[lineNumber];
      for (let index = 0; index < mask.length; index += 1) {
        mask[index] = flat[start + index];
      }
    });
  }

  function normalizeReferenceLabel(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
  }

  function rangeIsVisible(mask, start, end) {
    for (let index = start; index < end; index += 1) {
      if (mask[index]) return false;
    }
    return true;
  }

  function markRange(mask, start, end) {
    for (let index = Math.max(0, start); index < Math.min(mask.length, end); index += 1) {
      mask[index] = 1;
    }
  }

  function countRun(value, start, character) {
    if (value[start] !== character) return 0;
    let end = start + 1;
    while (value[end] === character) end += 1;
    return end - start;
  }

  function isEscaped(value, index) {
    let backslashes = 0;
    for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
      backslashes += 1;
    }
    return backslashes % 2 === 1;
  }

  function isWordCharacter(character) {
    return Boolean(character) && /[\p{L}\p{N}_]/u.test(character);
  }

  function inclusiveSourceEndLine(startLine, raw) {
    const content = String(raw || "").trimEnd();
    return startLine + (content.match(/\n/g) || []).length;
  }

  function normalizedLines(lines) {
    return Array.isArray(lines) && lines.length
      ? lines.map((line) => String(line ?? ""))
      : [""];
  }

  function clampLine(value, lineCount) {
    const number = Number.isFinite(value) ? Math.floor(value) : 0;
    return Math.min(Math.max(0, lineCount - 1), Math.max(0, number));
  }

  return {
    collectSourceMatches,
    inclusiveSourceEndLine,
    resolveSourceMatch
  };
});
