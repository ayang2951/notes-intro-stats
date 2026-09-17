(function () {
  "use strict";

  const vscode = acquireVsCodeApi();
  const CALLOUT_TYPES = [
    "definition",
    "proposition",
    "lemma",
    "theorem",
    "algorithm",
    "remark",
    "corollary",
    "example",
    "assumption",
    "axiom",
    "claim",
    "conjecture",
    "fact",
    "exercise",
    "observation",
    "notation",
    "problem"
  ];
  const GENERIC_REFERENCE_LABELS = new Set([
    ...CALLOUT_TYPES,
    "equation",
    "eq",
    "eq.",
    "lem.",
    "prop.",
    "thm.",
    "cor.",
    "reference",
    "ref",
    "result"
  ]);
  const BLOCK_RENDERERS = [
    "blockquote",
    "heading",
    "hr",
    "html",
    "list",
    "paragraph",
    "table"
  ];
  const sourceNavigation = window.CourseNotesSourceNavigation;
  const equationNumbering = window.CourseNotesEquationNumbering;
  const codeBlocks = window.CourseNotesCodeBlocks;

  let current = {
    uri: "",
    version: -1,
    renderRevision: -1,
    markdown: "",
    cssText: "",
    sectionNumber: 1,
    autoNumberCallouts: true,
    openCollapsedProofs: false,
    projectReferences: []
  };
  let pendingRender;
  let rendering = false;
  let markdownConfigured = false;
  let scrollSaveTimer;
  let highlightTimer;
  let anchorHighlightTimer;
  let referenceTargets = new Map();
  let copyRequestCounter = 0;
  const pendingCodeCopies = new Map();

  const MATH_CHARACTER_PLACEHOLDER = /COURSECNOTESPROTECTEDTEXCHAR(\d+)X/g;

  const content = document.getElementById("content");
  const status = document.getElementById("preview-status");
  const workspaceStyle = document.getElementById("workspace-style");

  const escapedDollarExtension = {
    name: "escapedDollar",
    level: "inline",
    start(source) {
      const index = source.indexOf("\\$");
      return index < 0 ? undefined : index;
    },
    tokenizer(source) {
      const match = /^\\\$/.exec(source);
      if (!match) return undefined;
      return { type: "escapedDollar", raw: match[0] };
    },
    renderer() {
      return '<span class="tex2jax_ignore">$</span>';
    }
  };

  const displayMathExtension = {
    name: "displayMath",
    level: "block",
    start(source) {
      const match = /(^|\n)\$\$(?!\$)/.exec(source);
      if (!match) return undefined;
      return match.index + (match[1] ? 1 : 0);
    },
    tokenizer(source) {
      const match =
        /^\$\$[ \t]*\n([\s\S]*?)\n\$\$[ \t]*(?:\n|$)/.exec(source) ||
        /^\$\$(?!\$)([^\n]*?)\$\$[ \t]*(?:\n|$)/.exec(source);
      if (!match || !match[1].trim()) return undefined;
      return { type: "displayMath", raw: match[0], text: match[1].trim() };
    },
    renderer(token) {
      const attributes = sourceAttributes(token);
      if (equationNumbering?.parseOuterAlignEnvironment(token.text)) {
        return `<div class="math-source-block display-math equation-display aligned-equations"${attributes}>${escapeMathHtml(token.raw.trim())}</div>\n`;
      }
      return `<div class="math-source-block display-math equation-display"${attributes}>\\[\n${escapeMathHtml(token.text)}\n\\]</div>\n`;
    }
  };

  const alignMathExtension = {
    name: "alignMath",
    level: "block",
    start(source) {
      const match = /(^|\n) {0,3}\\begin\s*\{align\*?\}/.exec(source);
      if (!match) return undefined;
      return match.index + (match[1] ? 1 : 0);
    },
    tokenizer(source) {
      const block = equationNumbering?.alignBlockAtStart(source);
      if (!block) return undefined;
      return { type: "alignMath", raw: block.raw, text: block.tex };
    },
    renderer(token) {
      const attributes = sourceAttributes(token);
      return `<div class="math-source-block display-math equation-display aligned-equations"${attributes}>${escapeMathHtml(token.text)}</div>\n`;
    }
  };

  const inlineMathExtension = {
    name: "inlineMath",
    level: "inline",
    start(source) {
      const index = source.search(/\$(?!\$)/);
      return index < 0 ? undefined : index;
    },
    tokenizer(source) {
      const match = /^\$(?!\$|\s)((?:\\.|[^\\$\n])+?)\$(?!\$)/.exec(source);
      if (!match || /\s$/.test(match[1])) return undefined;
      return { type: "inlineMath", raw: match[0], text: match[1] };
    },
    renderer(token) {
      return `\\(${escapeMathHtml(token.text)}\\)`;
    }
  };

  function configureMarkdown() {
    if (markdownConfigured) return;
    if (!window.marked?.use || !window.marked?.lexer || !window.marked?.parser ||
        !codeBlocks?.renderCodeBlock) {
      throw new Error("The Markdown renderer did not load. Check your internet connection and reload the preview.");
    }

    window.marked.use({
      gfm: true,
      breaks: false,
      extensions: [
        escapedDollarExtension,
        alignMathExtension,
        displayMathExtension,
        inlineMathExtension
      ]
    });
    markdownConfigured = true;
  }

  function renderMarkdown(markdown) {
    configureMarkdown();
    const source = protectMathSyntax(String(markdown || "").replace(/\r\n?/g, "\n"));
    const renderer = createSourceRenderer();
    const options = {
      ...window.marked.defaults,
      gfm: true,
      breaks: false,
      renderer
    };
    const tokens = window.marked.lexer(source, options);
    assignSourcePositions(tokens);
    return restoreMathSyntax(window.marked.parser(tokens, options));
  }

  function protectMathSyntax(value) {
    return String(value).replace(
      /\$\$[\s\S]*?\$\$|\$(?!\$)(?:\\.|[^\\$\n])+?\$(?!\$)/g,
      (math) => math.replace(
        /[\u0021-\u0023\u0025-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]/g,
        (character) => `COURSECNOTESPROTECTEDTEXCHAR${character.codePointAt(0)}X`
      )
    );
  }

  function restoreMathSyntax(value) {
    return String(value).replace(MATH_CHARACTER_PLACEHOLDER, (_match, codePoint) => {
      const character = String.fromCodePoint(Number(codePoint));
      if (character === "&") return "&amp;";
      if (character === "<") return "&lt;";
      if (character === ">") return "&gt;";
      if (character === '"') return "&quot;";
      if (character === "'") return "&#39;";
      return character;
    });
  }

  function createSourceRenderer() {
    const renderer = new window.marked.Renderer();

    renderer.code = function (token) {
      return codeBlocks.renderCodeBlock(token, {
        sourceLine: token.sourceLine,
        sourceEndLine: token.sourceEndLine,
        sourceKey: token.sourceKey
      });
    };

    BLOCK_RENDERERS.forEach((method) => {
      const original = renderer[method];
      renderer[method] = function (token) {
        const html = original.call(this, token);
        return annotateFirstTag(html, token);
      };
    });

    return renderer;
  }

  function assignSourcePositions(tokens) {
    let line = 0;

    tokens.forEach((token) => {
      const raw = typeof token.raw === "string" ? token.raw : "";
      const lineCount = countNewlines(raw);
      token.sourceLine = line;
      token.sourceEndLine = sourceNavigation.inclusiveSourceEndLine(line, raw);
      token.sourceKey = `${token.type}-${hashText(normalizeKeyText(raw))}`;
      line += lineCount;
    });
  }

  function annotateFirstTag(html, token) {
    if (!html || !Number.isInteger(token.sourceLine)) return html;
    if (/^\s*<\//.test(html)) return html;
    const attributes = sourceAttributes(token);
    return html.replace(/^(\s*<[A-Za-z][^\s/>]*)/, `$1${attributes}`);
  }

  function sourceAttributes(token) {
    if (!Number.isInteger(token.sourceLine)) return "";
    return ` data-source-line="${token.sourceLine}" data-source-end-line="${token.sourceEndLine}" data-source-key="${escapeAttribute(token.sourceKey)}"`;
  }

  function countNewlines(value) {
    return (value.match(/\n/g) || []).length;
  }

  function normalizeKeyText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function hashText(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeMathHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function queueRender(message) {
    if (!isRenderMessage(message)) return;
    const newestRevision = Math.max(
      current.renderRevision,
      pendingRender?.renderRevision ?? -1
    );
    if (message.uri === current.uri && message.renderRevision <= newestRevision) return;
    pendingRender = message;
    if (!rendering) void drainRenderQueue();
  }

  async function drainRenderQueue() {
    rendering = true;
    while (pendingRender) {
      const message = pendingRender;
      pendingRender = undefined;
      await render(message);
    }
    rendering = false;
  }

  async function render(message) {
    const previousAnchor = current.version >= 0
      ? captureViewportAnchor()
      : savedAnchorFor(message.uri);
    const detailStates = captureDetailStates();

    current = {
      uri: message.uri,
      version: message.version,
      renderRevision: message.renderRevision,
      markdown: message.markdown,
      cssText: message.cssText || "",
      sectionNumber: positiveInteger(message.sectionNumber, 1),
      autoNumberCallouts: message.autoNumberCallouts !== false,
      openCollapsedProofs: message.openCollapsedProofs === true,
      projectReferences: message.projectReferences
    };

    content.setAttribute("aria-busy", "true");
    showStatus("Updating preview…", false);
    workspaceStyle.textContent = current.cssText;

    try {
      clearMathTypesetting();
      clearPendingCodeCopies();
      const html = renderMarkdown(current.markdown);
      content.innerHTML = `<section class="note-section" data-sec="${current.sectionNumber}">${html}</section>`;

      materializeSummaryReferenceLinks();
      wrapResidualDisplayMath();

      const referenceClaims = current.autoNumberCallouts ? autoNumberCallouts() : [];
      referenceClaims.push(...autoNumberEquations());

      restoreDetailStates(detailStates);
      await typesetMath();
      connectAlignedEquationRows();
      referenceTargets = buildReferenceRegistry(referenceClaims);
      mergeProjectEquationReferences(referenceTargets, current.projectReferences);
      resolveCrossReferences(referenceTargets);
      hideStatus();
      restoreViewportAnchor(previousAnchor);
      persistState();
    } catch (error) {
      console.error(error);
      content.replaceChildren();
      showStatus(`Preview failed: ${error.message || error}`, true);
    }
  }

  function clearMathTypesetting() {
    if (window.MathJax && typeof window.MathJax.typesetClear === "function") {
      try {
        window.MathJax.typesetClear([content]);
      } catch (_error) {
        // The old preview may not have completed its first MathJax pass.
      }
    }
    if (window.MathJax && typeof window.MathJax.texReset === "function") {
      try {
        window.MathJax.texReset();
      } catch (_error) {
        // MathJax may not have finished starting during the first render.
      }
    }
  }

  async function typesetMath() {
    if (!window.MathJax) return;
    if (window.MathJax.startup?.promise) await window.MathJax.startup.promise;
    if (typeof window.MathJax.typesetPromise === "function") {
      await window.MathJax.typesetPromise([content]);
    }
  }

  function autoNumberCallouts() {
    const counters = Object.fromEntries(CALLOUT_TYPES.map((type) => [type, 0]));
    const claims = [];

    content.querySelectorAll(".callout").forEach((callout) => {
      const type = CALLOUT_TYPES.find((candidate) => callout.classList.contains(candidate));
      if (!type) return;

      counters[type] += 1;
      const number = `${current.sectionNumber}.${counters[type]}`;
      const markers = precedingCalloutMarkers(callout);
      if (!callout.id) callout.id = uniqueElementId(`${type}-${current.sectionNumber}-${counters[type]}`);

      const typeLabel = capitalize(type);
      setReferenceMetadata(callout, typeLabel, number);
      claims.push(referenceClaim(callout.id, callout, callout, typeLabel, number));
      markers.forEach((marker) => {
        setReferenceMetadata(marker, typeLabel, number);
        claims.push(referenceClaim(marker.id, marker, callout, typeLabel, number));
      });

      const label = callout.querySelector(":scope > .label");
      if (!label) return;

      const title = label.cloneNode(true);
      stripCalloutType(title, type);

      const typeSpan = document.createElement("span");
      typeSpan.className = "callout-type";
      typeSpan.textContent = typeLabel;

      const numberSpan = document.createElement("span");
      numberSpan.className = "callout-num";
      numberSpan.textContent = number;

      label.replaceChildren(typeSpan, " ", numberSpan);
      if (title.textContent.trim() || title.querySelector("*")) {
        const titleSpan = document.createElement("span");
        titleSpan.className = "callout-title";
        titleSpan.append(": ");
        while (title.firstChild) titleSpan.appendChild(title.firstChild);
        label.appendChild(titleSpan);
      }
    });

    return claims;
  }

  function materializeSummaryReferenceLinks() {
    const textNodes = [];
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent?.closest("summary")) return NodeFilter.FILTER_REJECT;
        if (parent.closest("a, code, pre, script, style, textarea, mjx-container")) {
          return NodeFilter.FILTER_REJECT;
        }
        return /\[[^\]\n]+\]\(\s*#[^)\s]+\s*\)/.test(node.textContent)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    let textNode = walker.nextNode();
    while (textNode) {
      textNodes.push(textNode);
      textNode = walker.nextNode();
    }

    textNodes.forEach((node) => replaceRawReferenceLinks(node));
  }

  function replaceRawReferenceLinks(textNode) {
    const value = textNode.textContent;
    const pattern = /\[([^\]\n]+)\]\(\s*#([^)\s]+)\s*\)/g;
    const matches = Array.from(value.matchAll(pattern));
    if (!matches.length) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    matches.forEach((match) => {
      const start = match.index;
      if (isEscapedCharacter(value, start)) return;

      fragment.append(value.slice(cursor, start));
      const link = document.createElement("a");
      link.setAttribute("href", `#${match[2]}`);
      link.textContent = match[1];
      fragment.appendChild(link);
      cursor = start + match[0].length;
    });

    if (cursor === 0) return;
    fragment.append(value.slice(cursor));
    textNode.replaceWith(fragment);
  }

  function wrapResidualDisplayMath() {
    const textNodes = [];
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(".equation-display, code, pre, script, style, textarea, .tex2jax_ignore")) {
          return NodeFilter.FILTER_REJECT;
        }
        return /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\s*\{(align\*?)\}[\s\S]*?\\end\s*\{\1\}/.test(node.textContent)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    let textNode = walker.nextNode();
    while (textNode) {
      textNodes.push(textNode);
      textNode = walker.nextNode();
    }

    textNodes.forEach((node) => wrapDisplayMathInTextNode(node));
  }

  function wrapDisplayMathInTextNode(textNode) {
    const value = textNode.textContent;
    const pattern = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\s*\{(align\*?)\}[\s\S]*?\\end\s*\{\1\}/g;
    const matches = Array.from(value.matchAll(pattern)).filter((match) => (
      !isEscapedCharacter(value, match.index) && (
        equationNumbering?.parseOuterAlignEnvironment(match[0]) || displayMathBody(match[0]).trim()
      )
    ));
    if (!matches.length) return;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    matches.forEach((match) => {
      fragment.append(value.slice(cursor, match.index));
      const wrapper = document.createElement("span");
      const aligned = equationNumbering?.parseOuterAlignEnvironment(match[0]);
      wrapper.className = `math-source-block display-math equation-display equation-display--embedded${aligned ? " aligned-equations" : ""}`;
      wrapper.textContent = match[0];
      fragment.appendChild(wrapper);
      cursor = match.index + match[0].length;
    });

    fragment.append(value.slice(cursor));
    textNode.replaceWith(fragment);
  }

  function autoNumberEquations() {
    const claims = [];
    let counter = 0;
    let alignIndex = 0;

    content.querySelectorAll(".equation-display").forEach((equation) => {
      const aligned = equationNumbering?.numberAlignedMath(equation.textContent, {
        sectionNumber: current.sectionNumber,
        startCounter: counter,
        labelPrefix: `course-notes-preview-row-${current.sectionNumber}-${++alignIndex}`
      });
      if (aligned) {
        counter = aligned.counter;
        equation.classList.add("aligned-equations");
        equation.textContent = aligned.tex;

        if (aligned.rows.length) {
          const baseSourceLine = equation.hasAttribute("data-source-line")
            ? numberFromDataset(equation.dataset.sourceLine)
            : undefined;
          equation.courseNotesAlignedRows = aligned.rows.map((row) => {
            const binding = {
              ...row,
              sourceLine: baseSourceLine === undefined
                ? undefined
                : baseSourceLine + row.sourceStartLineOffset,
              sourceEndLine: baseSourceLine === undefined
                ? undefined
                : baseSourceLine + row.sourceEndLineOffset,
              sourceKey: `align-row-${hashText(row.ids.join("|"))}`,
              aliases: [],
              claims: []
            };

            row.ids.forEach((id) => {
              const alias = document.createElement("span");
              alias.id = id;
              alias.className = "reference-marker equation-row-marker equation-reference-anchor tex2jax_ignore";
              alias.setAttribute("aria-hidden", "true");
              setReferenceMetadata(alias, "Equation", row.number);
              equation.before(alias);

              const claim = referenceClaim(id, alias, equation, "Equation", row.number);
              binding.aliases.push(alias);
              binding.claims.push(claim);
              claims.push(claim);
            });
            return binding;
          });
          return;
        }
      }

      const markers = precedingEquationMarkers(equation);
      const markerIds = markers.map((marker) => marker.id);
      const ownIds = isEquationId(equation.id) ? [equation.id] : [];
      const ancestor = equation.parentElement?.closest("[id]");
      const ancestorIds = ancestor && isEquationId(ancestor.id) ? [ancestor.id] : [];
      const texIds = extractEquationLabels(equation.textContent);
      const ids = [...new Set([...markerIds, ...ownIds, ...ancestorIds, ...texIds])];
      if (!ids.length) return;

      counter += 1;
      const automaticNumber = `${current.sectionNumber}.${counter}`;
      const manualTag = explicitEquationTag(equation.textContent);
      const referenceNumber = manualTag || automaticNumber;
      setReferenceMetadata(equation, "Equation", referenceNumber);
      equation.classList.add("equation-numbered", "numbered-equation");
      const hasRenderedTag = applyEquationTag(equation, automaticNumber, Boolean(manualTag));
      if (!hasRenderedTag) appendEquationNumber(equation, automaticNumber);

      const markerGroups = groupById(markers);
      ids.forEach((id) => {
        const markerMatches = markerGroups.get(id) || [];
        const target = ensureEquationAliasTarget(id, equation, markerMatches);
        if (target.element) setReferenceMetadata(target.element, "Equation", referenceNumber);
        claims.push(referenceClaim(
          id,
          target.element,
          equation,
          "Equation",
          referenceNumber,
          target.conflict
        ));
      });
    });

    return claims;
  }

  function connectAlignedEquationRows() {
    content.querySelectorAll(".aligned-equations").forEach((equation) => {
      const bindings = equation.courseNotesAlignedRows || [];
      if (!bindings.length) return;

      const table = Array.from(equation.querySelectorAll('g[data-mml-node="mtable"]'))
        .find((candidate) => !candidate.parentElement?.closest('g[data-mml-node="mtable"]'));
      const rows = table
        ? Array.from(table.querySelectorAll('g[data-mml-node="mtr"], g[data-mml-node="mlabeledtr"]'))
          .filter((row) => row.closest('g[data-mml-node="mtable"]') === table)
        : [];

      bindings.forEach((binding) => {
        const generatedLabel = document.getElementById(`mjx-eqn:${binding.syntheticLabel}`);
        const renderedRow = nearestRenderedEquationRow(rows, generatedLabel) ||
          rows[binding.renderedRowIndex] || generatedLabel || equation;
        setReferenceMetadata(renderedRow, "Equation", binding.number);

        if (Number.isInteger(binding.sourceLine)) {
          [renderedRow, generatedLabel].filter(Boolean).forEach((sourceTarget) => {
            sourceTarget.dataset.sourceLine = String(binding.sourceLine);
            sourceTarget.dataset.sourceEndLine = String(binding.sourceEndLine);
            sourceTarget.dataset.sourceKey = binding.sourceKey;
          });
        }

        binding.aliases.forEach((alias) => {
          alias.courseNotesReferenceTarget = renderedRow;
        });
        binding.claims.forEach((claim) => {
          claim.scrollElement = renderedRow;
        });
      });
    });
  }

  function nearestRenderedEquationRow(rows, label) {
    if (!label || !rows.length) return undefined;
    const labelBox = label.getBoundingClientRect();
    if (!labelBox.height) return undefined;
    const labelMiddle = labelBox.top + labelBox.height / 2;

    return rows
      .filter((row) => row.getBoundingClientRect().height > 0)
      .sort((left, right) => {
        const leftBox = left.getBoundingClientRect();
        const rightBox = right.getBoundingClientRect();
        const leftDistance = Math.abs(leftBox.top + leftBox.height / 2 - labelMiddle);
        const rightDistance = Math.abs(rightBox.top + rightBox.height / 2 - labelMiddle);
        return leftDistance - rightDistance;
      })[0];
  }

  function precedingEquationMarkers(equation) {
    return precedingReferenceMarkers(
      equation,
      isEquationId,
      "equation-label-carrier",
      "equation-reference-anchor"
    );
  }

  function precedingCalloutMarkers(callout) {
    return precedingReferenceMarkers(
      callout,
      isCalloutId,
      "callout-label-carrier",
      "callout-reference-anchor"
    );
  }

  function precedingReferenceMarkers(element, acceptsId, carrierClass, markerClass) {
    const markers = [];
    let candidate = previousMeaningfulSibling(element);

    while (candidate instanceof Element) {
      const found = referenceMarkersInCarrier(candidate, acceptsId);
      if (!found.length) break;
      candidate.classList.add("reference-marker", carrierClass);
      found.forEach((marker) => marker.classList.add(markerClass));
      markers.unshift(...found);
      candidate = previousMeaningfulSibling(candidate);
    }

    return markers;
  }

  function previousMeaningfulSibling(element) {
    let sibling = element.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.COMMENT_NODE ||
          (sibling.nodeType === Node.TEXT_NODE && !sibling.textContent.trim())) {
        sibling = sibling.previousSibling;
        continue;
      }
      return sibling.nodeType === Node.ELEMENT_NODE ? sibling : undefined;
    }
    return undefined;
  }

  function referenceMarkersInCarrier(carrier, acceptsId) {
    if (acceptsId(carrier.id) && isEmptyMarker(carrier)) return [carrier];
    if (carrier.tagName !== "P") return [];

    const markers = Array.from(carrier.querySelectorAll("[id]"))
      .filter((element) => acceptsId(element.id) && isEmptyMarker(element));
    if (!markers.length) return [];

    const clone = carrier.cloneNode(true);
    clone.querySelectorAll("[id]").forEach((element) => {
      if (acceptsId(element.id) && isEmptyMarker(element)) element.remove();
    });
    return clone.textContent.trim() || clone.querySelector("*") ? [] : markers;
  }

  function isEmptyMarker(element) {
    return !element.textContent.trim() &&
      !element.querySelector("img, audio, video, iframe, object, embed, input, button, canvas, svg");
  }

  function extractEquationLabels(value) {
    return equationNumbering?.equationLabels(value) || [];
  }

  function isEquationId(id) {
    return equationNumbering?.isEquationId(id) === true;
  }

  function isCalloutId(id) {
    const match = /^([^:;\s]+)[:;](\S+)$/.exec(String(id || "").trim());
    return Boolean(match) && CALLOUT_TYPES.includes(match[1].toLocaleLowerCase());
  }

  function ensureEquationAliasTarget(id, equation, markers) {
    if (markers.length === 1) return { element: markers[0], conflict: false };
    if (markers.length > 1) return { element: markers[0], conflict: true };
    if (equation.id === id) return { element: equation, conflict: false };

    const existing = elementsWithId(id);
    if (existing.length) {
      const associated = existing.find((element) => element === equation || element.contains(equation));
      return { element: associated || existing[0], conflict: !associated || existing.length > 1 };
    }

    if (!equation.id) {
      equation.id = id;
      return { element: equation, conflict: false };
    }

    const alias = document.createElement("span");
    alias.id = id;
    alias.className = "equation-reference-anchor";
    alias.setAttribute("aria-hidden", "true");
    equation.before(alias);
    return { element: alias, conflict: false };
  }

  function explicitEquationTag(value) {
    return equationNumbering?.manualEquationTag(value)?.value || "";
  }

  function applyEquationTag(equation, number, preserveExistingTag = false) {
    const source = removeManagedEquationLabels(equation.textContent)
      .replace(/\\(?:notag|nonumber)\b/g, "");
    const existingTag = texCommandArgumentRange(source, /\\tag\*?\s*\{/);
    if (existingTag) {
      equation.textContent = preserveExistingTag
        ? source
        : `${source.slice(0, existingTag.start)}\\tag{${number}}${source.slice(existingTag.end)}`;
      return true;
    }

    const start = source.search(/\S/);
    if (start < 0) return false;
    const delimiterLength = source.startsWith("$$", start) || source.startsWith("\\[", start) ? 2 : 0;
    if (!delimiterLength) {
      equation.textContent = source;
      return false;
    }

    const insertion = start + delimiterLength;
    equation.textContent = `${source.slice(0, insertion)}\\tag{${number}}\n${source.slice(insertion)}`;
    return true;
  }

  function appendEquationNumber(equation, number) {
    const tag = document.createElement("span");
    tag.className = "equation-number tex2jax_ignore";
    tag.setAttribute("aria-label", `Equation ${number}`);
    tag.textContent = `(${number})`;
    equation.appendChild(tag);
  }

  function removeManagedEquationLabels(value) {
    return equationNumbering?.removeManagedEquationLabels(value) ?? String(value || "");
  }

  function texCommandArgumentRange(value, commandPattern) {
    const match = commandPattern.exec(value);
    if (!match) return undefined;

    let depth = 1;
    for (let index = match.index + match[0].length; index < value.length; index += 1) {
      if (isEscapedCharacter(value, index)) continue;
      if (value[index] === "{") depth += 1;
      if (value[index] !== "}") continue;
      depth -= 1;
      if (depth === 0) return { start: match.index, end: index + 1 };
    }
    return undefined;
  }

  function displayMathBody(value) {
    if (value.startsWith("$$") && value.endsWith("$$")) return value.slice(2, -2);
    if (value.startsWith("\\[") && value.endsWith("\\]")) return value.slice(2, -2);
    return "";
  }

  function referenceClaim(id, element, scrollElement, label, number, conflict = false) {
    return { id, element, scrollElement, label, number, conflict };
  }

  function setReferenceMetadata(element, label, number) {
    if (!element) return;
    element.dataset.xrefTarget = "true";
    element.dataset.xrefLabel = label;
    element.dataset.xrefNumber = number;
  }

  function buildReferenceRegistry(claims) {
    const groups = groupById(claims.filter((claim) => claim.id));
    const registry = new Map();

    groups.forEach((group, id) => {
      const uniqueClaims = group.filter((claim, index) => group.findIndex((candidate) => (
        candidate.element === claim.element && candidate.scrollElement === claim.scrollElement &&
        candidate.label === claim.label && candidate.number === claim.number
      )) === index);
      const scrollTargets = new Set(uniqueClaims.map((claim) => claim.scrollElement));
      const idElements = elementsWithId(id);
      const ambiguous = uniqueClaims.some((claim) => claim.conflict) ||
        uniqueClaims.length !== 1 || scrollTargets.size !== 1 || idElements.length !== 1;

      if (ambiguous) {
        idElements.forEach((element) => element.classList.add("xref-duplicate-target"));
        registry.set(id, { status: "ambiguous", id });
        console.warn(`Course Notes Preview: duplicate or ambiguous reference target "${id}".`);
        return;
      }

      registry.set(id, { status: "ok", ...uniqueClaims[0] });
    });

    return registry;
  }

  function mergeProjectEquationReferences(registry, records) {
    const groups = groupById(records.filter(isProjectReferenceRecord));

    groups.forEach((group, id) => {
      const local = registry.get(id);
      if (group.length !== 1) {
        markAmbiguousReference(registry, id);
        return;
      }

      const record = group[0];
      if (record.uri === current.uri) {
        if (!local) registry.set(id, { status: "source", ...record });
        return;
      }

      if (local) {
        markAmbiguousReference(registry, id);
        return;
      }

      registry.set(id, { status: "external", ...record });
    });
  }

  function markAmbiguousReference(registry, id) {
    elementsWithId(id).forEach((element) => element.classList.add("xref-duplicate-target"));
    registry.set(id, { status: "ambiguous", id });
    console.warn(`Course Notes Preview: duplicate or ambiguous reference target "${id}".`);
  }

  function isProjectReferenceRecord(record) {
    return record &&
      typeof record.id === "string" && record.id.length > 0 && record.id.length <= 512 &&
      typeof record.label === "string" &&
      typeof record.number === "string" &&
      typeof record.uri === "string";
  }

  function resolveCrossReferences(registry) {
    content.querySelectorAll("a[href]").forEach((link) => {
      const id = fragmentId(link.getAttribute("href"));
      if (!id) return;

      const target = registry.get(id);
      const generic = isGenericReferenceLabel(link.textContent);
      if (["ok", "external", "source"].includes(target?.status)) {
        link.classList.add("xref", "cross-reference");
        link.dataset.xrefId = id;
        link.title = `${target.label} ${target.number}`;
        if (generic) {
          link.textContent = `${target.label} ${target.number}`;
          link.setAttribute("aria-label", `${target.label} ${target.number}`);
        }
        return;
      }

      const idElements = elementsWithId(id);
      const ambiguous = target?.status === "ambiguous" || idElements.length > 1;
      if (!generic && (!hasNamespace(id) || idElements.length === 1)) return;

      link.classList.add(
        "cross-reference",
        ambiguous ? "xref-ambiguous" : "xref-missing",
        ambiguous ? "cross-reference-ambiguous" : "cross-reference-missing"
      );
      link.setAttribute("aria-invalid", "true");
      link.title = ambiguous
        ? `Reference target "${id}" is duplicated.`
        : idElements.length === 1
          ? `Reference target "${id}" is not automatically numbered.`
          : `Reference target "${id}" was not found.`;
    });
  }

  function isGenericReferenceLabel(value) {
    const label = String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
    return GENERIC_REFERENCE_LABELS.has(label);
  }

  function fragmentId(href) {
    if (typeof href !== "string" || !href.startsWith("#") || href.length === 1) return "";
    try {
      return decodeURIComponent(href.slice(1));
    } catch (_error) {
      return "";
    }
  }

  function hasNamespace(id) {
    return /^[^:;\s]+[:;]\S+$/.test(String(id || ""));
  }

  function groupById(items) {
    const groups = new Map();
    items.forEach((item) => {
      const id = typeof item === "string" ? item : item.id;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(item);
    });
    return groups;
  }

  function elementsWithId(id) {
    return Array.from(content.querySelectorAll("[id]")).filter((element) => element.id === id);
  }

  function uniqueElementId(base) {
    let id = base;
    let suffix = 2;
    while (elementsWithId(id).length) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    return id;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function isEscapedCharacter(value, index) {
    let slashCount = 0;
    for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor -= 1) {
      slashCount += 1;
    }
    return slashCount % 2 === 1;
  }

  function stripCalloutType(label, type) {
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    const pattern = new RegExp(`^\\s*${type}\\s*:?\\s*`, "i");
    let node = walker.nextNode();

    while (node) {
      if (node.textContent.trim()) {
        node.textContent = node.textContent.replace(pattern, "");
        break;
      }
      node = walker.nextNode();
    }

    while (label.firstChild?.nodeType === Node.TEXT_NODE && !label.firstChild.textContent.trim()) {
      label.firstChild.remove();
    }
  }

  function captureDetailStates() {
    const states = new Map();
    content.querySelectorAll("details[data-source-key]").forEach((detail) => {
      const key = detail.dataset.sourceKey;
      if (!states.has(key)) states.set(key, []);
      states.get(key).push(detail.open);
    });
    return states;
  }

  function restoreDetailStates(states) {
    const used = new Map();
    content.querySelectorAll("details").forEach((detail) => {
      const key = detail.dataset.sourceKey;
      const index = used.get(key) || 0;
      const saved = key ? states.get(key)?.[index] : undefined;
      used.set(key, index + 1);
      detail.open = typeof saved === "boolean" ? saved : current.openCollapsedProofs;
    });
  }

  function captureViewportAnchor() {
    const nodes = mappedElements();
    if (!nodes.length) return fallbackScrollAnchor();

    const targetY = Math.min(48, Math.max(1, window.innerHeight - 1));
    let anchor = document.elementFromPoint(Math.max(1, window.innerWidth / 2), targetY)?.closest?.("[data-source-line]");

    if (!anchor || !content.contains(anchor)) {
      anchor = nodes.find((node) => node.getBoundingClientRect().bottom >= targetY) || nodes[nodes.length - 1];
    }

    const rectangle = anchor.getBoundingClientRect();
    return {
      key: anchor.dataset.sourceKey || "",
      line: numberFromDataset(anchor.dataset.sourceLine),
      offset: rectangle.top,
      ratio: scrollRatio()
    };
  }

  function fallbackScrollAnchor() {
    return { key: "", line: 0, offset: 0, ratio: scrollRatio() };
  }

  function restoreViewportAnchor(anchor) {
    if (!anchor) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let target = findByStableKey(anchor.key, anchor.line);
        if (!target) target = nearestMappedElement(anchor.line);

        if (target) {
          window.scrollBy(0, target.getBoundingClientRect().top - anchor.offset);
        } else {
          const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          window.scrollTo(0, maximum * clamp(anchor.ratio, 0, 1));
        }
      });
    });
  }

  function findByStableKey(key, oldLine) {
    if (!key) return undefined;
    const matches = mappedElements().filter((node) => node.dataset.sourceKey === key);
    if (!matches.length) return undefined;
    return matches.sort((left, right) => (
      Math.abs(numberFromDataset(left.dataset.sourceLine) - oldLine) -
      Math.abs(numberFromDataset(right.dataset.sourceLine) - oldLine)
    ))[0];
  }

  function savedAnchorFor(uri) {
    const state = vscode.getState();
    if (!state || state.uri !== uri) return undefined;
    if (state.anchor && typeof state.anchor === "object") return state.anchor;
    if (Number.isFinite(state.scrollY)) {
      return { key: "", line: 0, offset: 0, ratio: Number(state.scrollRatio) || 0 };
    }
    return undefined;
  }

  function persistState() {
    const anchor = captureViewportAnchor();
    vscode.setState({
      uri: current.uri,
      version: current.version,
      scrollY: window.scrollY,
      scrollRatio: scrollRatio(),
      anchor
    });
  }

  function scrollRatio() {
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return maximum ? window.scrollY / maximum : 0;
  }

  function handlePreviewDoubleClick(event) {
    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (element?.closest?.("button[data-copy-code]")) return;
    if (element?.closest?.('a[href^="#"]')) return;
    const mapped = element?.closest?.("[data-source-line]");
    if (!mapped || !content.contains(mapped)) return;

    const selection = window.getSelection();
    let word = selection ? selection.toString().trim() : "";
    if (word.length > 160 || /[\r\n]/.test(word)) word = "";

    const occurrence = selectedTextOccurrence(mapped, selection, word);
    const message = {
      type: "revealSource",
      uri: current.uri,
      version: current.version,
      line: numberFromDataset(mapped.dataset.sourceLine),
      endLine: numberFromDataset(
        mapped.dataset.sourceEndLine,
        numberFromDataset(mapped.dataset.sourceLine)
      ),
      word
    };
    if (occurrence >= 0) message.occurrence = occurrence;

    vscode.postMessage(message);
  }

  function handleCodeCopyClick(event) {
    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    const button = element?.closest?.("button[data-copy-code]");
    if (!button || !content.contains(button)) return;

    event.preventDefault();
    event.stopPropagation();
    const code = button.closest(".code-block")?.querySelector("pre > code");
    if (!code) return;

    const requestId = `code-copy-${Date.now()}-${++copyRequestCounter}`;
    setCodeCopyButtonState(button, "copying");
    const timeout = setTimeout(() => {
      const pending = pendingCodeCopies.get(requestId);
      if (!pending) return;
      pendingCodeCopies.delete(requestId);
      if (pending.button.isConnected) setCodeCopyButtonState(pending.button, "failed");
    }, 5000);

    pendingCodeCopies.set(requestId, { button, timeout });
    vscode.postMessage({
      type: "copyCode",
      requestId,
      text: code.textContent
    });
  }

  function handleCodeCopyResult(message) {
    if (!message || typeof message.requestId !== "string" || typeof message.ok !== "boolean") return;
    const pending = pendingCodeCopies.get(message.requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    pendingCodeCopies.delete(message.requestId);
    if (!pending.button.isConnected) return;
    setCodeCopyButtonState(pending.button, message.ok ? "copied" : "failed");
    pending.button.focus({ preventScroll: true });
  }

  function clearPendingCodeCopies() {
    pendingCodeCopies.forEach(({ timeout }) => clearTimeout(timeout));
    pendingCodeCopies.clear();
  }

  function setCodeCopyButtonState(button, state) {
    if (!button) return;
    if (button.courseNotesCopyResetTimer) {
      clearTimeout(button.courseNotesCopyResetTimer);
      button.courseNotesCopyResetTimer = undefined;
    }

    if (!button.dataset.defaultCopyLabel) {
      button.dataset.defaultCopyLabel = button.getAttribute("aria-label") || "Copy code";
    }
    const target = button.dataset.defaultCopyLabel.replace(/^Copy\s+/i, "");
    const states = {
      idle: { text: "Copy", label: button.dataset.defaultCopyLabel },
      copying: { text: "Copying…", label: `Copying ${target}` },
      copied: { text: "Copied", label: `${target} copied` },
      failed: { text: "Copy failed", label: `Could not copy ${target}` }
    };
    const next = states[state] || states.idle;

    button.dataset.copyState = state in states ? state : "idle";
    button.textContent = next.text;
    button.setAttribute("aria-label", next.label);
    button.disabled = state === "copying";

    if (state === "copied" || state === "failed") {
      button.courseNotesCopyResetTimer = setTimeout(() => {
        button.courseNotesCopyResetTimer = undefined;
        if (button.isConnected) setCodeCopyButtonState(button, "idle");
      }, 1600);
    }
  }

  function revealPreview(message) {
    if (!isRevealMessage(message)) return;
    if (message.uri !== current.uri || message.version !== current.version) return;

    const line = Math.max(0, Math.floor(message.line));
    const word = typeof message.word === "string" ? message.word.trim() : "";
    const target = bestMappedElement(line, word);
    if (!target) return;

    const character = Number.isFinite(message.character)
      ? Math.max(0, Math.floor(message.character))
      : undefined;
    const occurrence = character === undefined
      ? 0
      : sourceOccurrenceForPosition(target, word, line, character);

    target.closest("details:not([open])")?.setAttribute("open", "");
    let parent = target.parentElement?.closest("details:not([open])");
    while (parent) {
      parent.open = true;
      parent = parent.parentElement?.closest("details:not([open])");
    }

    target.scrollIntoView({ block: "center", behavior: "auto" });
    highlightMappedElement(target);
    selectTextWithin(target, word, occurrence);
  }

  function bestMappedElement(line, word) {
    const nodes = mappedElements();
    if (!nodes.length) return undefined;

    const containing = nodes.filter((node) => {
      const start = numberFromDataset(node.dataset.sourceLine);
      const end = numberFromDataset(node.dataset.sourceEndLine, start);
      return start <= line && end >= line;
    });
    const pool = containing.length ? containing : nodes;
    const wordMatches = word
      ? pool.filter((node) => visibleText(node).toLocaleLowerCase().includes(word.toLocaleLowerCase()))
      : [];
    const candidates = wordMatches.length ? wordMatches : pool;

    return candidates.sort((left, right) => {
      const leftStart = numberFromDataset(left.dataset.sourceLine);
      const rightStart = numberFromDataset(right.dataset.sourceLine);
      const leftEnd = numberFromDataset(left.dataset.sourceEndLine, leftStart);
      const rightEnd = numberFromDataset(right.dataset.sourceEndLine, rightStart);
      const leftDistance = line < leftStart ? leftStart - line : line > leftEnd ? line - leftEnd : 0;
      const rightDistance = line < rightStart ? rightStart - line : line > rightEnd ? line - rightEnd : 0;
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return (leftEnd - leftStart) - (rightEnd - rightStart);
    })[0];
  }

  function nearestMappedElement(line) {
    return bestMappedElement(Number.isFinite(line) ? line : 0, "");
  }

  function mappedElements() {
    return Array.from(content.querySelectorAll("[data-source-line]"));
  }

  function visibleText(element) {
    return element.innerText || element.textContent || "";
  }

  function highlightMappedElement(element) {
    document.querySelectorAll(".source-sync-target").forEach((node) => node.classList.remove("source-sync-target"));
    if (highlightTimer) clearTimeout(highlightTimer);
    element.classList.add("source-sync-target");
    highlightTimer = setTimeout(() => element.classList.remove("source-sync-target"), 1400);
  }

  function handlePreviewAnchorClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = element?.closest?.("a[href]");
    if (!link || !content.contains(link)) return;

    const id = fragmentId(link.getAttribute("href"));
    if (!id) return;

    event.preventDefault();
    if (link.closest("summary")) event.stopPropagation();

    const reference = referenceTargets.get(id);
    if (reference?.status === "ambiguous") return;
    if (reference?.status === "external" || reference?.status === "source") {
      vscode.postMessage({
        type: "revealReference",
        id,
        renderRevision: current.renderRevision
      });
      return;
    }

    const ordinaryTargets = elementsWithId(id);
    const target = reference?.status === "ok"
      ? reference.element
      : ordinaryTargets.length === 1 ? ordinaryTargets[0] : undefined;
    const scrollTarget = reference?.status === "ok" ? reference.scrollElement : target;
    if (!target || !scrollTarget || !content.contains(scrollTarget)) return;

    openAncestorDetails(scrollTarget);
    updatePreviewHash(id);

    requestAnimationFrame(() => {
      highlightAnchorTarget(scrollTarget);
      scrollTarget.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  function openAncestorDetails(element) {
    const ancestors = [];
    let detail = element.closest("details");
    while (detail) {
      ancestors.unshift(detail);
      detail = detail.parentElement?.closest("details");
    }
    ancestors.forEach((ancestor) => {
      ancestor.open = true;
    });
  }

  function updatePreviewHash(id) {
    try {
      const hash = `#${encodeURIComponent(id).replace(/%3A/gi, ":").replace(/%3B/gi, ";")}`;
      window.history.pushState(null, "", hash);
    } catch (_error) {
      // Scrolling still works when a webview host does not allow history updates.
    }
  }

  function highlightAnchorTarget(element) {
    content.querySelectorAll(".preview-anchor-target").forEach((node) => {
      node.classList.remove("preview-anchor-target");
    });
    if (anchorHighlightTimer) clearTimeout(anchorHighlightTimer);
    element.classList.add("preview-anchor-target");
    anchorHighlightTimer = setTimeout(() => element.classList.remove("preview-anchor-target"), 1400);
  }

  function selectedTextOccurrence(element, selection, word) {
    if (!word || !selection || selection.rangeCount !== 1) return -1;
    const range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) return -1;

    return textMatchesWithin(element, word).findIndex((match) => {
      if (match.node !== range.startContainer) return false;
      const startsInside = range.startOffset >= match.start && range.startOffset < match.end;
      const containsMatch = range.endContainer === match.node &&
        range.startOffset <= match.start && range.endOffset >= match.end;
      return startsInside || containsMatch;
    });
  }

  function sourceOccurrenceForPosition(element, word, line, character) {
    if (!word) return 0;
    const startLine = numberFromDataset(element.dataset.sourceLine);
    const endLine = numberFromDataset(element.dataset.sourceEndLine, startLine);
    const matches = sourceTextMatches(current.markdown, word, startLine, endLine);
    const occurrence = matches.findIndex((match) => (
      match.line === line && match.character === character
    ));
    return occurrence >= 0 ? occurrence : undefined;
  }

  function sourceTextMatches(markdown, word, startLine, endLine) {
    if (!word) return [];
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const firstLine = clamp(startLine, 0, Math.max(0, lines.length - 1));
    const lastLine = clamp(endLine, firstLine, Math.max(firstLine, lines.length - 1));
    return sourceNavigation.collectSourceMatches(
      lines,
      word,
      firstLine,
      lastLine,
      { visibleOnly: true }
    ).map((match) => ({
      line: match.lineNumber,
      character: match.character
    }));
  }

  function textMatchesWithin(element, word) {
    if (!word) return [];
    const matches = [];
    const wanted = word.toLocaleLowerCase();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("mjx-container, script, style")) return NodeFilter.FILTER_REJECT;
        return node.textContent.toLocaleLowerCase().includes(wanted)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });

    let textNode = walker.nextNode();
    while (textNode) {
      textMatchOffsets(textNode.textContent, word).forEach((start) => {
        matches.push({ node: textNode, start, end: start + word.length });
      });
      textNode = walker.nextNode();
    }
    return matches;
  }

  function textMatchOffsets(value, word) {
    if (!word) return [];
    const offsets = [];
    const lowerValue = value.toLocaleLowerCase();
    const lowerWord = word.toLocaleLowerCase();
    const startsWithWordCharacter = isWordCharacter(word[0]);
    const endsWithWordCharacter = isWordCharacter(word[word.length - 1]);
    let start = lowerValue.indexOf(lowerWord);

    while (start >= 0) {
      const end = start + word.length;
      const before = start > 0 ? value[start - 1] : "";
      const after = end < value.length ? value[end] : "";
      const validStart = !startsWithWordCharacter || !isWordCharacter(before);
      const validEnd = !endsWithWordCharacter || !isWordCharacter(after);
      if (validStart && validEnd) offsets.push(start);
      start = lowerValue.indexOf(lowerWord, start + Math.max(1, word.length));
    }
    return offsets;
  }

  function isWordCharacter(character) {
    return Boolean(character) && /[\p{L}\p{N}_]/u.test(character);
  }

  function selectTextWithin(element, word, occurrence) {
    if (!word || /\s/.test(word)) return;
    const matches = textMatchesWithin(element, word);
    if (!Number.isInteger(occurrence) || occurrence < 0 || occurrence >= matches.length) return;
    const match = matches[occurrence];
    if (!match) return;

    const range = document.createRange();
    range.setStart(match.node, match.start);
    range.setEnd(match.node, match.end);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function showStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
    status.hidden = false;
  }

  function hideStatus() {
    content.setAttribute("aria-busy", "false");
    status.hidden = true;
    status.classList.remove("is-error");
  }

  function isRenderMessage(message) {
    return message &&
      message.type === "render" &&
      typeof message.uri === "string" &&
      Number.isInteger(message.version) &&
      Number.isInteger(message.renderRevision) &&
      message.renderRevision >= 0 &&
      typeof message.markdown === "string" &&
      Array.isArray(message.projectReferences);
  }

  function isRevealMessage(message) {
    return message &&
      message.type === "revealPreview" &&
      typeof message.uri === "string" &&
      Number.isInteger(message.version) &&
      Number.isFinite(message.line);
  }

  function numberFromDataset(value, fallback = 0) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? number : fallback;
  }

  function positiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Number(value) || 0));
  }

  window.addEventListener("message", (event) => {
    const message = event.data || {};
    if (message.type === "render") queueRender(message);
    if (message.type === "revealPreview") revealPreview(message);
    if (message.type === "copyCodeResult") handleCodeCopyResult(message);
  });

  window.addEventListener("scroll", () => {
    if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
    scrollSaveTimer = setTimeout(persistState, 100);
  }, { passive: true });

  content.addEventListener("dblclick", handlePreviewDoubleClick);
  content.addEventListener("click", handleCodeCopyClick);
  content.addEventListener("click", handlePreviewAnchorClick);
  vscode.postMessage({ type: "ready" });
})();
