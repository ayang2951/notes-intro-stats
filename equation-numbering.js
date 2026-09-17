(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CourseNotesEquationNumbering = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const ALIGN_BEGIN = /^ {0,3}\\begin\s*\{(align\*?)\}/;

  function isEquationId(value) {
    const id = String(value || "").trim();
    const namespaced = /^([^:;\s]+)[:;](\S+)$/.exec(id);
    if (namespaced) {
      return ["eq", "equation"].includes(namespaced[1].toLocaleLowerCase());
    }
    return /^eq-[a-z0-9][a-z0-9._-]*$/i.test(id);
  }

  function equationLabels(value) {
    const source = String(value || "");
    const visible = maskComments(source);
    const ids = [];
    const pattern = /\\label\s*\{([^{}\r\n]+)\}/g;
    let match = pattern.exec(visible);
    while (match) {
      const id = match[1].trim();
      if (!isEscaped(visible, match.index) && isEquationId(id) && !ids.includes(id)) {
        ids.push(id);
      }
      match = pattern.exec(visible);
    }
    return ids;
  }

  function removeManagedEquationLabels(value) {
    const source = String(value || "");
    const visible = maskComments(source);
    return source.replace(/\\label\s*\{([^{}\r\n]+)\}/g, (match, id, offset) => {
      if (visible[offset] !== "\\" || isEscaped(source, offset) || !isEquationId(id.trim())) return match;
      return "";
    });
  }

  function manualEquationTag(value) {
    const source = String(value || "");
    const tag = firstCommandArgument(source, maskComments(source), /\\tag\*?\s*\{/g);
    return tag ? { present: true, value: tag.content.trim() } : undefined;
  }

  function alignBlockAtStart(value) {
    const source = String(value || "").replace(/\r\n?/g, "\n");
    const opening = ALIGN_BEGIN.exec(source);
    if (!opening) return undefined;

    const leadingSpaces = /^ */.exec(opening[0])?.[0].length || 0;
    const beginCommand = readEnvironmentCommand(source, leadingSpaces);
    if (!beginCommand || !["align", "align*"].includes(beginCommand.environment)) return undefined;
    const ending = matchingEnvironmentEnd(source, beginCommand);
    if (!ending) return undefined;

    let rawEnd = ending.end;
    while (source[rawEnd] === " " || source[rawEnd] === "\t") rawEnd += 1;
    if (source[rawEnd] === "\n") rawEnd += 1;

    return {
      raw: source.slice(0, rawEnd),
      tex: source.slice(leadingSpaces, ending.end),
      environment: beginCommand.environment
    };
  }

  function numberAlignedMath(value, options = {}) {
    const parsed = parseOuterAlignEnvironment(value);
    if (!parsed) return undefined;

    const sectionNumber = positiveInteger(options.sectionNumber, 1);
    let counter = nonnegativeInteger(options.startCounter, 0);
    const labelPrefix = safeSyntheticLabel(options.labelPrefix || `course-notes-${sectionNumber}`);
    const sourceRows = splitAlignRows(parsed.body);
    const numberedRows = [];
    let renderedRowIndex = 0;

    const rewrittenRows = sourceRows.map((row, rowIndex) => {
      const analysis = analyzeRow(row.text);
      const hasContent = rowHasRenderableContent(row.text, analysis);
      const thisRenderedRowIndex = hasContent ? renderedRowIndex++ : -1;
      const suppressed = analysis.suppressed || (parsed.starred && !analysis.hasManualTag);
      const shouldNumber = analysis.ids.length > 0 && !suppressed;
      const emptyTagRanges = analysis.tagRange && !analysis.hasManualTag
        ? [analysis.tagRange]
        : [];
      const removedRanges = [...analysis.managedLabelRanges, ...emptyTagRanges];
      let rewritten = removeRanges(row.text, removedRanges);

      if (!shouldNumber) return rewritten + row.separator;

      counter += 1;
      const automaticNumber = `${sectionNumber}.${counter}`;
      const number = analysis.hasManualTag ? analysis.manualTag : automaticNumber;
      const syntheticLabel = `${labelPrefix}-${rowIndex + 1}`;
      const generatedCommands = `${analysis.hasManualTag ? "" : `\\tag{${automaticNumber}}`}\\label{${syntheticLabel}}`;
      rewritten = insertWithSpacing(rewritten, rewritten.length, generatedCommands);

      numberedRows.push({
        ids: analysis.ids,
        number,
        automaticNumber,
        syntheticLabel,
        renderedRowIndex: thisRenderedRowIndex,
        sourceStartLineOffset: lineOffsetAt(parsed.original, parsed.originalBodyStart + row.start + firstContentOffset(row.text)),
        sourceEndLineOffset: lineOffsetAt(parsed.original, parsed.originalBodyStart + row.start + lastContentOffset(row.text))
      });

      return rewritten + row.separator;
    });

    return {
      tex: parsed.prefix + rewrittenRows.join("") + parsed.suffix,
      rows: numberedRows,
      counter,
      environment: parsed.environment
    };
  }

  function parseOuterAlignEnvironment(value) {
    const original = String(value || "").replace(/\r\n?/g, "\n");
    let start = firstNonWhitespace(original);
    let end = lastNonWhitespaceEnd(original);
    if (start < 0) return undefined;

    const delimiter = original.slice(start, start + 2);
    const closingDelimiter = original.slice(end - 2, end);
    if ((delimiter === "\\[" && closingDelimiter === "\\]") ||
        (delimiter === "$$" && closingDelimiter === "$$")) {
      start += 2;
      end -= 2;
    }

    const opening = findOuterAlignBegin(original, start, end);
    if (!opening) return undefined;
    const ending = matchingEnvironmentEnd(original, opening);
    if (!ending || ending.end > end || !onlyWhitespaceOrComments(original.slice(ending.end, end))) {
      return undefined;
    }

    return {
      original,
      originalBodyStart: opening.end,
      environment: opening.environment,
      starred: opening.environment.endsWith("*"),
      body: original.slice(opening.end, ending.start),
      prefix: original.slice(opening.start, opening.end),
      suffix: original.slice(ending.start, ending.end)
    };
  }

  function findOuterAlignBegin(value, start, end) {
    const pattern = /\\begin\s*\{align\*?\}/g;
    pattern.lastIndex = start;
    let match = pattern.exec(value);
    while (match && match.index < end) {
      if (!isEscaped(value, match.index) && !isInComment(value, match.index) &&
          onlyWhitespaceOrComments(value.slice(start, match.index))) {
        return readEnvironmentCommand(value, match.index);
      }
      match = pattern.exec(value);
    }
    return undefined;
  }

  function matchingEnvironmentEnd(value, opening) {
    const stack = [opening.environment];
    let index = opening.end;

    while (index < value.length) {
      if (value[index] === "%" && !isEscaped(value, index)) {
        const newline = value.indexOf("\n", index + 1);
        index = newline < 0 ? value.length : newline + 1;
        continue;
      }

      if (value[index] !== "\\" || isEscaped(value, index)) {
        index += 1;
        continue;
      }

      const command = readEnvironmentCommand(value, index);
      if (!command) {
        index += 1;
        continue;
      }

      if (command.command === "begin") {
        stack.push(command.environment);
      } else if (stack[stack.length - 1] === command.environment) {
        stack.pop();
        if (!stack.length) return { start: index, end: command.end };
      }
      index = command.end;
    }
    return undefined;
  }

  function splitAlignRows(body) {
    const rows = [];
    const environments = [];
    let braceDepth = 0;
    let rowStart = 0;
    let index = 0;

    while (index < body.length) {
      const character = body[index];
      if (character === "%" && !isEscaped(body, index)) {
        const newline = body.indexOf("\n", index + 1);
        index = newline < 0 ? body.length : newline + 1;
        continue;
      }

      if (character === "\\") {
        const environmentCommand = readEnvironmentCommand(body, index);
        if (environmentCommand) {
          if (environmentCommand.command === "begin") {
            environments.push(environmentCommand.environment);
          } else if (environments[environments.length - 1] === environmentCommand.environment) {
            environments.pop();
          }
          index = environmentCommand.end;
          continue;
        }

        if (body[index + 1] === "\\" && braceDepth === 0 && environments.length === 0) {
          const separatorEnd = rowSeparatorEnd(body, index);
          rows.push({
            text: body.slice(rowStart, index),
            separator: body.slice(index, separatorEnd),
            start: rowStart
          });
          rowStart = separatorEnd;
          index = separatorEnd;
          continue;
        }
      }

      if (character === "{" && !isEscaped(body, index)) braceDepth += 1;
      if (character === "}" && !isEscaped(body, index) && braceDepth > 0) braceDepth -= 1;
      index += 1;
    }

    rows.push({ text: body.slice(rowStart), separator: "", start: rowStart });
    return rows;
  }

  function analyzeRow(value) {
    const visible = maskComments(value);
    const labels = [];
    const managedLabelRanges = [];
    const labelPattern = /\\label\s*\{([^{}\r\n]+)\}/g;
    let label = labelPattern.exec(visible);
    while (label) {
      const id = label[1].trim();
      if (!isEscaped(visible, label.index) && isEquationId(id)) {
        if (!labels.includes(id)) labels.push(id);
        managedLabelRanges.push({ start: label.index, end: labelPattern.lastIndex });
      }
      label = labelPattern.exec(visible);
    }

    const tag = firstCommandArgument(value, visible, /\\tag\*?\s*\{/g);
    const suppressorRanges = unescapedCommandRanges(visible, /\\(?:notag|nonumber)\b/g);
    const manualTag = tag ? tag.content.trim() : "";
    return {
      ids: labels,
      managedLabelRanges,
      suppressorRanges,
      suppressed: suppressorRanges.length > 0,
      manualTag,
      hasManualTag: Boolean(tag && manualTag),
      tagRange: tag
    };
  }

  function rowHasRenderableContent(value, analysis) {
    const commandRanges = [
      ...analysis.managedLabelRanges,
      ...analysis.suppressorRanges,
      ...(analysis.tagRange ? [analysis.tagRange] : [])
    ];
    const visible = maskComments(removeRanges(value, commandRanges)).replace(/&/g, "").trim();
    return Boolean(visible);
  }

  function firstCommandArgument(source, visible, pattern) {
    pattern.lastIndex = 0;
    let match = pattern.exec(visible);
    while (match && isEscaped(visible, match.index)) match = pattern.exec(visible);
    if (!match) return undefined;

    let depth = 1;
    const contentStart = match.index + match[0].length;
    for (let index = contentStart; index < source.length; index += 1) {
      if (isEscaped(visible, index)) continue;
      if (visible[index] === "{") depth += 1;
      if (visible[index] !== "}") continue;
      depth -= 1;
      if (depth === 0) {
        return {
          start: match.index,
          end: index + 1,
          content: visible.slice(contentStart, index)
        };
      }
    }
    return undefined;
  }

  function readEnvironmentCommand(value, index) {
    if (isEscaped(value, index)) return undefined;
    const match = /^\\(begin|end)\s*\{([^{}]+)\}/.exec(value.slice(index));
    if (!match) return undefined;
    return {
      start: index,
      command: match[1],
      environment: match[2],
      end: index + match[0].length
    };
  }

  function rowSeparatorEnd(value, start) {
    let index = start + 2;
    if (value[index] === "*") index += 1;
    while (value[index] === " " || value[index] === "\t") index += 1;
    if (value[index] !== "[") return index;

    let depth = 1;
    index += 1;
    while (index < value.length && depth > 0) {
      if (value[index] === "%" && !isEscaped(value, index)) {
        const newline = value.indexOf("\n", index + 1);
        index = newline < 0 ? value.length : newline + 1;
        continue;
      }
      if (!isEscaped(value, index)) {
        if (value[index] === "[") depth += 1;
        if (value[index] === "]") depth -= 1;
      }
      index += 1;
    }
    return index;
  }

  function unescapedCommandRanges(value, pattern) {
    const ranges = [];
    pattern.lastIndex = 0;
    let match = pattern.exec(value);
    while (match) {
      if (!isEscaped(value, match.index)) {
        ranges.push({ start: match.index, end: pattern.lastIndex });
      }
      match = pattern.exec(value);
    }
    return ranges;
  }

  function onlyWhitespaceOrComments(value) {
    return !maskComments(value).trim();
  }

  function isInComment(value, index) {
    const lineStart = String(value || "").lastIndexOf("\n", index - 1) + 1;
    for (let cursor = lineStart; cursor < index; cursor += 1) {
      if (value[cursor] === "%" && !isEscaped(value, cursor)) return true;
    }
    return false;
  }

  function maskComments(value) {
    const characters = String(value || "").split("");
    for (let index = 0; index < characters.length; index += 1) {
      if (characters[index] !== "%" || isEscaped(value, index)) continue;
      while (index < characters.length && characters[index] !== "\n") {
        characters[index] = " ";
        index += 1;
      }
    }
    return characters.join("");
  }

  function removeRanges(value, ranges) {
    let result = String(value || "");
    [...ranges]
      .sort((left, right) => right.start - left.start)
      .forEach((range) => {
        result = result.slice(0, range.start) + result.slice(range.end);
      });
    return result;
  }

  function insertWithSpacing(value, index, insertion) {
    const position = Math.max(0, Math.min(String(value || "").length, index));
    const before = value.slice(0, position);
    const after = value.slice(position);
    const leadingSpace = before && !/\s$/.test(before) ? " " : "";
    const trailingSpace = after && !/^\s/.test(after) ? " " : "";
    return before + leadingSpace + insertion + trailingSpace + after;
  }

  function firstContentOffset(value) {
    const visible = maskComments(value);
    const index = visible.search(/\S/);
    return index < 0 ? 0 : index;
  }

  function lastContentOffset(value) {
    const visible = maskComments(value);
    const index = lastNonWhitespaceEnd(visible);
    return index < 0 ? 0 : Math.max(0, index - 1);
  }

  function lineOffsetAt(value, index) {
    return (String(value || "").slice(0, Math.max(0, index)).match(/\n/g) || []).length;
  }

  function firstNonWhitespace(value) {
    const index = String(value || "").search(/\S/);
    return index;
  }

  function lastNonWhitespaceEnd(value) {
    const match = /\S(?=\s*$)/.exec(String(value || ""));
    return match ? match.index + 1 : -1;
  }

  function isEscaped(value, index) {
    let slashCount = 0;
    for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
      slashCount += 1;
    }
    return slashCount % 2 === 1;
  }

  function safeSyntheticLabel(value) {
    const label = String(value || "course-notes-row").replace(/[^A-Za-z0-9._-]+/g, "-");
    return label || "course-notes-row";
  }

  function positiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  function nonnegativeInteger(value, fallback) {
    return Number.isInteger(value) && value >= 0 ? value : fallback;
  }

  return {
    alignBlockAtStart,
    equationLabels,
    isEquationId,
    manualEquationTag,
    numberAlignedMath,
    parseOuterAlignEnvironment,
    removeManagedEquationLabels,
    splitAlignRows
  };
});
