"use strict";

const ORDERED_NOTES = [
  { file: "week1.md", title: "Week 1: Working with Data" }
];

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

const REFERENCE_LABELS = new Map([
  ...CALLOUT_TYPES.map((type) => [
    type,
    type.charAt(0).toUpperCase() + type.slice(1)
  ]),
  ["eq", "Equation"]
]);

const GENERIC_REFERENCE_TEXT = new Set([
  ...REFERENCE_LABELS.values(),
  "Eq",
  "Eq.",
  "Lem.",
  "Prop.",
  "Thm.",
  "Cor.",
  "Reference",
  "Ref",
  "Result"
].map((label) => label.toLocaleLowerCase()));

let referenceRegistry = new Map();
const equationNumbering = window.CourseNotesEquationNumbering;
const codeBlocks = window.CourseNotesCodeBlocks;

const storagePrefix = window.COURSE_NOTES_STORAGE_PREFIX ||
  `course-notes:${window.location.pathname.replace(/\/index\.html$/, "/")}:`;
let bookmarkMemory = null;

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeMathHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const MATH_CHARACTER_PLACEHOLDER = /COURSECNOTESPROTECTEDTEXCHAR(\d+)X/g;

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

    return {
      type: "escapedDollar",
      raw: match[0]
    };
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

    return {
      type: "displayMath",
      raw: match[0],
      text: match[1].trim()
    };
  },
  renderer(token) {
    if (equationNumbering?.parseOuterAlignEnvironment(token.text)) {
      return `<div class="display-math aligned-equations">${escapeMathHtml(token.raw.trim())}</div>\n`;
    }
    return `<div class="display-math">\\[\n${escapeMathHtml(token.text)}\n\\]</div>\n`;
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
    return {
      type: "alignMath",
      raw: block.raw,
      text: block.tex
    };
  },
  renderer(token) {
    return `<div class="display-math aligned-equations">${escapeMathHtml(token.text)}</div>\n`;
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

    return {
      type: "inlineMath",
      raw: match[0],
      text: match[1]
    };
  },
  renderer(token) {
    return `\\(${escapeMathHtml(token.text)}\\)`;
  }
};

function configureMarkdown() {
  if (!window.CourseNotesHtmlMarkdown?.createHtmlRenderer || !window.marked?.use || !window.marked?.parse || !codeBlocks?.renderCodeBlock) {
    throw new Error("The Markdown renderer did not load.");
  }

  const renderer = new window.marked.Renderer();
  renderer.html = window.CourseNotesHtmlMarkdown.createHtmlRenderer(window.marked);
  renderer.paragraph = window.CourseNotesHtmlMarkdown.createParagraphRenderer(window.marked);
  renderer.code = (token) => codeBlocks.renderCodeBlock(token);

  window.marked.use({
    gfm: true,
    breaks: false,
    renderer,
    extensions: [
      escapedDollarExtension,
      alignMathExtension,
      displayMathExtension,
      inlineMathExtension
    ]
  });
}

function renderMarkdown(markdown) {
  return restoreMathSyntax(window.marked.parse(protectMathSyntax(markdown)));
}

function sectionMarkup(note, index, body) {
  const sectionNumber = index + 1;
  return [
    `<section id="sec-${sectionNumber}" class="note-section" data-sec="${sectionNumber}" data-file="${escapeHtml(note.file)}">`,
    `<h1>${escapeHtml(note.title)}</h1>`,
    body,
    "</section>"
  ].join("");
}

async function loadNote(note, index) {
  try {
    const notePath = note.file.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`notes/${notePath}`);
    if (!response.ok) {
      return sectionMarkup(
        note,
        index,
        `<blockquote class="load-error">⚠️ Could not load ${escapeHtml(note.file)}.</blockquote>`
      );
    }

    return sectionMarkup(note, index, renderMarkdown(await response.text()));
  } catch (error) {
    return sectionMarkup(
      note,
      index,
      `<blockquote class="load-error">⚠️ Could not load ${escapeHtml(note.file)}.</blockquote>`
    );
  }
}

async function loadAll() {
  const content = byId("content");
  const parts = await Promise.all(ORDERED_NOTES.map(loadNote));
  content.innerHTML = parts.join("\n");
  window.CourseNotesHtmlMarkdown.normalizeParagraphs(content);

  materializeReferenceLinks(content);
  wrapUnprocessedDisplayMath(content);
  buildToc();
  autoNumberCallouts();
  autoNumberEquations();
  addBookmarkButtons();
  referenceRegistry = buildReferenceRegistry();

  if (window.MathJax?.typesetPromise) {
    try {
      await window.MathJax.typesetPromise([content]);
    } catch (error) {
      console.error("MathJax could not typeset the notes.", error);
    }
  }

  connectAlignedEquationRows();
  resolveCrossReferences();
  refreshBookmarkLabels();
  renderBookmarks();

  scrollToCurrentReference();
}

function referenceKind(id) {
  const value = String(id || "").toLocaleLowerCase();
  const namespaced = /^([a-z][a-z0-9-]*)(?::|;)([a-z0-9][a-z0-9._-]*)$/.exec(value);
  if (namespaced) return namespaced[1];

  return Array.from(REFERENCE_LABELS.keys()).find((kind) => value.startsWith(`${kind}-`)) || "";
}

function decodedFragment(link) {
  const href = link?.getAttribute("href") || "";
  if (!href.startsWith("#") || href.length < 2) return "";

  try {
    return decodeURIComponent(href.slice(1));
  } catch (error) {
    return href.slice(1);
  }
}

function materializeReferenceLinks(root) {
  const labels = Array.from(new Set([
    ...REFERENCE_LABELS.values(),
    "Eq",
    "Eq.",
    "Lem.",
    "Prop.",
    "Thm.",
    "Cor.",
    "Reference",
    "Ref",
    "Result"
  ])).sort((left, right) => right.length - left.length);
  const escapedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(
    `\\[(${escapedLabels.join("|")})\\]\\(#((?:[a-z][a-z0-9-]*(?::|;)[a-z0-9][a-z0-9._-]*|eq-[a-z0-9][a-z0-9._-]*))\\)`,
    "gi"
  );
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("a, code, pre, script, style, textarea, .tex2jax_ignore, .display-math")) {
        return NodeFilter.FILTER_REJECT;
      }
      pattern.lastIndex = 0;
      return pattern.test(node.textContent)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    }
  });

  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  nodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const source = textNode.textContent;
    let cursor = 0;
    pattern.lastIndex = 0;
    let match = pattern.exec(source);

    while (match) {
      fragment.append(source.slice(cursor, match.index));
      const link = document.createElement("a");
      link.href = `#${match[2]}`;
      link.textContent = match[1];
      fragment.appendChild(link);
      cursor = pattern.lastIndex;
      match = pattern.exec(source);
    }

    fragment.append(source.slice(cursor));
    textNode.replaceWith(fragment);
  });
}

function wrapUnprocessedDisplayMath(root) {
  const nodes = [];
  const pattern = /\$\$[ \t]*\n?([\s\S]*?)\n?[ \t]*\$\$|\\begin\s*\{(align\*?)\}[\s\S]*?\\end\s*\{\2\}/g;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("code, pre, script, style, textarea, .tex2jax_ignore, .display-math")) {
        return NodeFilter.FILTER_REJECT;
      }
      pattern.lastIndex = 0;
      return pattern.test(node.textContent)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    }
  });

  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }

  nodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    const source = textNode.textContent;
    let cursor = 0;
    pattern.lastIndex = 0;
    let match = pattern.exec(source);

    while (match) {
      fragment.append(source.slice(cursor, match.index));
      const wrapper = document.createElement("div");
      const rawMath = match[0];
      const aligned = equationNumbering?.parseOuterAlignEnvironment(rawMath);
      wrapper.className = `display-math${aligned ? " aligned-equations" : ""}`;
      wrapper.textContent = aligned
        ? rawMath.trim()
        : `\\[\n${match[1].trim()}\n\\]`;
      fragment.appendChild(wrapper);
      cursor = pattern.lastIndex;
      match = pattern.exec(source);
    }

    fragment.append(source.slice(cursor));
    textNode.replaceWith(fragment);
  });
}

function buildToc() {
  const toc = byId("toc");
  const content = byId("content");
  const list = document.createElement("div");
  list.className = "toc-list";

  content.querySelectorAll(".note-section").forEach((section) => {
    const heading = section.querySelector(":scope > h1");
    if (!heading) return;
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = heading.textContent;
    list.appendChild(link);
  });

  toc.replaceChildren(list);
}

function stripCalloutType(label, type) {
  const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
  const pattern = new RegExp(`^\\s*${type}\\s*:?[ \\t]*`, "i");
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

function standaloneMarkerAnchors(element) {
  if (!element) return [];
  if (element.matches("a[id]")) {
    return element.textContent.trim() ? [] : [element];
  }
  if (!element.matches("p")) return [];

  const clone = element.cloneNode(true);
  clone.querySelectorAll("a[id]").forEach((anchor) => anchor.remove());
  if (clone.textContent.trim() || clone.querySelector("*")) return [];

  const anchors = Array.from(element.querySelectorAll(":scope > a[id]"));
  return anchors.length && anchors.every((anchor) => !anchor.textContent.trim())
    ? anchors
    : [];
}

function precedingMarkerAnchors(element) {
  const anchors = [];
  let sibling = element.previousElementSibling;

  while (sibling) {
    const found = standaloneMarkerAnchors(sibling);
    if (!found.length) break;
    anchors.unshift(...found);
    sibling.classList.add("reference-marker");
    sibling = sibling.previousElementSibling;
  }

  return anchors;
}

function annotateReferenceTarget(element, label, number, semanticTarget = element) {
  if (!element) return;
  element.dataset.xrefLabel = label;
  element.dataset.xrefNumber = number;
  element.dataset.xrefTarget = "true";
  element.courseNotesReferenceTarget = semanticTarget;
}

function autoNumberCallouts() {
  byId("content").querySelectorAll(".note-section").forEach((section) => {
    const sectionNumber = section.dataset.sec || "0";
    const counters = Object.fromEntries(CALLOUT_TYPES.map((type) => [type, 0]));

    section.querySelectorAll(".callout").forEach((callout) => {
      const type = CALLOUT_TYPES.find((candidate) => callout.classList.contains(candidate));
      if (!type) return;

      counters[type] += 1;
      const number = `${sectionNumber}.${counters[type]}`;
      if (!callout.id) callout.id = `${type}-${sectionNumber}-${counters[type]}`;

      const typeLabel = REFERENCE_LABELS.get(type);
      annotateReferenceTarget(callout, typeLabel, number);
      precedingMarkerAnchors(callout)
        .filter((anchor) => {
          const kind = referenceKind(anchor.id);
          return kind && kind !== "eq" && REFERENCE_LABELS.has(kind);
        })
        .forEach((anchor) => annotateReferenceTarget(anchor, typeLabel, number, callout));

      const label = callout.querySelector(":scope > .label");
      if (!label || label.dataset.numbered === "true") return;

      const title = label.cloneNode(true);
      title.querySelectorAll(".bookmark-btn").forEach((button) => button.remove());
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

      label.dataset.numbered = "true";
    });
  });
}

function explicitEquationTag(wrapper) {
  return equationNumbering?.manualEquationTag(wrapper.textContent)?.value || "";
}

function isEquationReferenceId(id) {
  return equationNumbering?.isEquationId(id) === true;
}

function equationMarkerAnchors(wrapper) {
  const ownMarker = isEquationReferenceId(wrapper.id) ? [wrapper] : [];
  const ancestor = wrapper.parentElement?.closest("[id]");
  const ancestorMarker = ancestor && isEquationReferenceId(ancestor.id) ? [ancestor] : [];
  const preceding = precedingMarkerAnchors(wrapper)
    .filter((anchor) => isEquationReferenceId(anchor.id));
  return [...ownMarker, ...ancestorMarker, ...preceding];
}

function extractEquationLabels(value) {
  return equationNumbering?.equationLabels(value) || [];
}

function removeManagedEquationLabels(value) {
  return equationNumbering?.removeManagedEquationLabels(value) ?? String(value || "");
}

function addEquationLabelAliases(wrapper, markers, ids, label, number) {
  ids.forEach((id) => {
    const matches = markers.filter((marker) => marker.id === id);
    if (matches.length) {
      matches.forEach((marker) => annotateReferenceTarget(marker, label, number, wrapper));
      return;
    }

    const alias = document.createElement("span");
    alias.id = id;
    alias.className = "reference-marker equation-reference-anchor tex2jax_ignore";
    alias.setAttribute("aria-hidden", "true");
    annotateReferenceTarget(alias, label, number, wrapper);
    wrapper.before(alias);
  });
}

function autoNumberEquations() {
  byId("content").querySelectorAll(".note-section").forEach((section) => {
    const sectionNumber = section.dataset.sec || "0";
    let counter = 0;
    let alignIndex = 0;

    section.querySelectorAll(".display-math").forEach((wrapper) => {
      const aligned = equationNumbering?.numberAlignedMath(wrapper.textContent, {
        sectionNumber: Number.parseInt(sectionNumber, 10),
        startCounter: counter,
        labelPrefix: `course-notes-row-${sectionNumber}-${++alignIndex}`
      });
      if (aligned) {
        counter = aligned.counter;
        wrapper.classList.add("aligned-equations");
        wrapper.textContent = aligned.tex;
        if (aligned.rows.length) {
          wrapper.courseNotesAlignedRows = aligned.rows.map((row) => {
            const aliases = row.ids.map((id) => {
              const alias = document.createElement("span");
              alias.id = id;
              alias.className = "reference-marker equation-row-marker tex2jax_ignore";
              alias.setAttribute("aria-hidden", "true");
              annotateReferenceTarget(alias, "Equation", row.number, wrapper);
              wrapper.before(alias);
              return alias;
            });
            return { ...row, aliases };
          });
          return;
        }
      }

      const markers = equationMarkerAnchors(wrapper);
      const texIds = extractEquationLabels(wrapper.textContent);
      const ids = [...new Set([...markers.map((marker) => marker.id), ...texIds])];
      if (!ids.length) return;

      counter += 1;
      const automaticNumber = `${sectionNumber}.${counter}`;
      const manualTag = explicitEquationTag(wrapper);
      const referenceNumber = manualTag || automaticNumber;
      wrapper.textContent = removeManagedEquationLabels(wrapper.textContent);
      annotateReferenceTarget(wrapper, "Equation", referenceNumber);
      addEquationLabelAliases(wrapper, markers, ids, "Equation", referenceNumber);

      wrapper.classList.add("numbered-equation");
      if (manualTag) return;

      const number = document.createElement("span");
      number.className = "equation-number tex2jax_ignore";
      number.setAttribute("aria-label", `Equation ${automaticNumber}`);
      number.textContent = `(${automaticNumber})`;
      wrapper.appendChild(number);
    });
  });
}

function connectAlignedEquationRows() {
  byId("content").querySelectorAll(".aligned-equations").forEach((wrapper) => {
    const bindings = wrapper.courseNotesAlignedRows || [];
    if (!bindings.length) return;

    const table = Array.from(wrapper.querySelectorAll('g[data-mml-node="mtable"]'))
      .find((candidate) => !candidate.parentElement?.closest('g[data-mml-node="mtable"]'));
    const rows = table
      ? Array.from(table.querySelectorAll('g[data-mml-node="mtr"], g[data-mml-node="mlabeledtr"]'))
        .filter((row) => row.closest('g[data-mml-node="mtable"]') === table)
      : [];

    bindings.forEach((binding) => {
      const generatedLabel = document.getElementById(`mjx-eqn:${binding.syntheticLabel}`);
      const renderedRow = nearestRenderedEquationRow(rows, generatedLabel) ||
        rows[binding.renderedRowIndex] || generatedLabel || wrapper;
      annotateReferenceTarget(renderedRow, "Equation", binding.number);
      binding.aliases.forEach((alias) => {
        alias.courseNotesReferenceTarget = renderedRow;
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

function buildReferenceRegistry() {
  const registry = new Map();

  document.querySelectorAll("[id]").forEach((element) => {
    if (!element.id) return;
    if (!registry.has(element.id)) registry.set(element.id, []);
    registry.get(element.id).push(element);
  });

  return registry;
}

function referenceEntry(id) {
  const matches = referenceRegistry.get(id) || [];
  if (matches.length !== 1) return undefined;

  const element = matches[0];
  const semanticTarget = element.courseNotesReferenceTarget || element;
  const label = element.dataset.xrefLabel || semanticTarget.dataset.xrefLabel;
  const number = element.dataset.xrefNumber || semanticTarget.dataset.xrefNumber;
  return { element, semanticTarget, label, number };
}

function resolveCrossReferences() {
  byId("content").querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = decodedFragment(link);
    if (!id) return;

    const matches = referenceRegistry.get(id) || [];
    const entry = referenceEntry(id);
    link.classList.add("cross-reference");
    link.classList.remove("cross-reference-missing", "cross-reference-ambiguous");
    link.removeAttribute("aria-invalid");

    if (!matches.length) {
      link.classList.add("cross-reference-missing");
      link.setAttribute("aria-invalid", "true");
      link.title = `Reference target “${id}” was not found.`;
      console.warn(`Course notes reference target not found: ${id}`);
      return;
    }

    if (matches.length > 1) {
      link.classList.add("cross-reference-ambiguous");
      link.setAttribute("aria-invalid", "true");
      link.title = `Reference target “${id}” is used more than once.`;
      console.warn(`Course notes reference target is duplicated: ${id}`);
      return;
    }

    link.removeAttribute("title");
    if (!entry?.label || !entry.number) return;
    if (!GENERIC_REFERENCE_TEXT.has(link.textContent.trim().toLocaleLowerCase())) return;
    link.textContent = `${entry.label} ${entry.number}`;
    link.setAttribute("aria-label", `${entry.label} ${entry.number}`);
  });
}

function refreshBookmarkLabels() {
  document.querySelectorAll("#content .bookmarkable").forEach((element) => {
    const container = element.classList.contains("callout")
      ? element.querySelector(":scope > .label") || element
      : element;
    const plainText = normalizeText(container);
    element.dataset.plain = plainText;
    container.dataset.plain = plainText;
  });
}

function openAncestorDetails(element) {
  let details = element.closest("details:not([open])");
  while (details) {
    details.open = true;
    details = details.parentElement?.closest("details:not([open])");
  }
}

function scrollToReference(id, behavior = "smooth") {
  const entry = referenceEntry(id);
  if (!entry) return false;

  const target = entry.semanticTarget || entry.element;
  openAncestorDetails(target);
  target.scrollIntoView({ behavior, block: "start" });
  return true;
}

function scrollToCurrentReference() {
  if (!window.location.hash) return;
  let id = "";
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch (error) {
    id = window.location.hash.slice(1);
  }
  if (id) scrollToReference(id, "auto");
}

function setupInternalLinkNavigation() {
  byId("content").addEventListener("click", (event) => {
    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = element?.closest?.('a[href^="#"]');
    if (!link || !byId("content").contains(link)) return;

    const id = decodedFragment(link);
    if (!id) return;
    event.preventDefault();
    event.stopPropagation();
    if (!scrollToReference(id)) return;

    const url = new URL(window.location.href);
    url.hash = id;
    window.history.pushState(null, "", url);
  });

  window.addEventListener("hashchange", scrollToCurrentReference);
}

function setupCodeCopyButtons() {
  const content = byId("content");
  if (!content) return;

  content.addEventListener("click", (event) => {
    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    const button = element?.closest?.("button[data-copy-code]");
    if (!button || !content.contains(button)) return;

    event.preventDefault();
    event.stopPropagation();
    const code = button.closest(".code-block")?.querySelector("pre > code");
    if (!code) return;
    void copyCodeFromButton(button, code.textContent);
  });

  content.addEventListener("dblclick", (event) => {
    const element = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (element?.closest?.("button[data-copy-code]")) event.stopPropagation();
  });
}

async function copyCodeFromButton(button, text) {
  setCodeCopyButtonState(button, "copying");
  const copied = await writeClipboardText(text);
  if (!button.isConnected) return;
  setCodeCopyButtonState(button, copied ? "copied" : "failed");
  button.focus({ preventScroll: true });
}

async function writeClipboardText(text) {
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Some browsers expose the Clipboard API but deny access. Try the fallback below.
    }
  }

  return fallbackCopyText(text);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  textarea.style.fontSize = "16px";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    return document.execCommand("copy");
  } catch (error) {
    return false;
  } finally {
    textarea.remove();
  }
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

function safeRead(key) {
  try {
    return localStorage.getItem(`${storagePrefix}${key}`);
  } catch (error) {
    return null;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(`${storagePrefix}${key}`, value);
  } catch (error) {
    // The site still works when storage is disabled.
  }
}

function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme, button, persist = false) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;

  if (persist) safeWrite("theme", nextTheme);
  if (!button) return;

  const isDark = nextTheme === "dark";
  button.textContent = isDark ? "🌙" : "☀️";
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  button.title = `Switch to ${isDark ? "light" : "dark"} mode`;
}

function setupTheme() {
  const button = byId("themeToggle");
  if (!button) return;

  applyTheme(getTheme(), button);
  button.addEventListener("click", () => {
    applyTheme(getTheme() === "dark" ? "light" : "dark", button, true);
  });
}

function normalizeText(element, selectorToExclude = ".bookmark-btn, .code-block__header") {
  const clone = element.cloneNode(true);
  clone.querySelectorAll(selectorToExclude).forEach((node) => node.remove());
  return clone.textContent.trim().replace(/\s+/g, " ");
}

function textHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function stableBookmarkId(element) {
  const section = element.closest(".note-section");
  const file = section?.dataset.file || "notes";
  const base = `bookmark-${file.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}-${textHash(normalizeText(element))}`;
  let id = base;
  let suffix = 2;

  while (document.getElementById(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function getBookmarks() {
  if (bookmarkMemory !== null) return [...bookmarkMemory];

  const raw = safeRead("bookmarks");
  if (!raw) {
    bookmarkMemory = [];
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    bookmarkMemory = Array.isArray(parsed)
      ? [...new Set(parsed.filter((id) => typeof id === "string"))]
      : [];
  } catch (error) {
    bookmarkMemory = [];
  }
  return [...bookmarkMemory];
}

function saveBookmarks(bookmarks) {
  bookmarkMemory = [...new Set(bookmarks)];
  safeWrite("bookmarks", JSON.stringify(bookmarkMemory));
}

function toggleBookmark(id) {
  const bookmarks = getBookmarks();
  const index = bookmarks.indexOf(id);
  if (index >= 0) bookmarks.splice(index, 1);
  else bookmarks.push(id);
  saveBookmarks(bookmarks);
  renderBookmarks();
}

function removeBookmark(id) {
  saveBookmarks(getBookmarks().filter((bookmark) => bookmark !== id));
  renderBookmarks();
}

function createBookmarkIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("bookmark-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M6 3.5h12v17l-6-4-6 4z");
  svg.appendChild(path);
  return svg;
}

function setBookmarkButtonState(button, isBookmarked) {
  const action = isBookmarked ? "Remove bookmark" : "Add bookmark";
  button.setAttribute("aria-pressed", String(isBookmarked));
  button.setAttribute("aria-label", action);
  button.title = action;
}

function addBookmarkButtons() {
  document.querySelectorAll("#content .bookmark-btn").forEach((button) => button.remove());

  const blocks = Array.from(document.querySelectorAll("#content .callout, #content p"))
    .filter((element) => (
      !element.classList.contains("reference-marker") &&
      (element.classList.contains("callout") || !element.closest(".callout"))
    ));

  blocks.forEach((element) => {
    element.classList.add("bookmarkable");
    if (!element.id) element.id = stableBookmarkId(element);

    const container = element.classList.contains("callout")
      ? element.querySelector(":scope > .label") || element
      : element;
    const plainText = normalizeText(container);
    element.dataset.plain = plainText;
    container.dataset.plain = plainText;

    const button = document.createElement("button");
    button.className = "bookmark-btn";
    button.type = "button";
    button.appendChild(createBookmarkIcon());
    setBookmarkButtonState(button, false);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleBookmark(element.id);
    });
    container.appendChild(button);
  });

  renderBookmarks();
}

function findNearestHeading(element) {
  const section = element.closest(".note-section");
  if (!section) return null;

  let nearest = null;
  section.querySelectorAll("h1, h2, h3").forEach((heading) => {
    if (heading === element || heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) {
      nearest = heading;
    }
  });
  return nearest;
}

function headingNumber(heading, counters) {
  if (heading.tagName === "H1") {
    counters.h1 += 1;
    counters.h2 = 0;
    counters.h3 = 0;
    return `${counters.h1}. `;
  }
  if (heading.tagName === "H2") {
    counters.h2 += 1;
    counters.h3 = 0;
    return `${counters.h1}.${counters.h2} `;
  }

  counters.h3 += 1;
  return `${counters.h1}.${counters.h2}.${counters.h3} `;
}

function renderBookmarks() {
  const panelList = byId("bookmarkList");
  if (!panelList) return;

  const stored = getBookmarks();
  const content = byId("content");
  const bookmarks = stored.filter((id) => {
    const element = byId(id);
    return element && content.contains(element) && element.classList.contains("bookmarkable");
  });
  if (bookmarks.length !== stored.length) saveBookmarks(bookmarks);

  document.querySelectorAll("#content .bookmarkable").forEach((element) => {
    const isBookmarked = bookmarks.includes(element.id);
    element.classList.toggle("bookmarked", isBookmarked);
    const button = element.querySelector(":scope > .bookmark-btn, :scope > .label > .bookmark-btn");
    if (button) setBookmarkButtonState(button, isBookmarked);
  });

  const headings = Array.from(document.querySelectorAll("#content h1, #content h2, #content h3"));
  headings.forEach((heading) => {
    if (!heading.dataset.plain) heading.dataset.plain = normalizeText(heading);
  });
  const bookmarksByHeading = new Map(headings.map((heading) => [heading, []]));
  bookmarks.forEach((id) => {
    const element = byId(id);
    const heading = findNearestHeading(element) || headings[0];
    if (!heading) return;
    if (!bookmarksByHeading.has(heading)) bookmarksByHeading.set(heading, []);
    bookmarksByHeading.get(heading).push(element);
  });

  const counters = { h1: 0, h2: 0, h3: 0 };
  const fragment = document.createDocumentFragment();

  if (!bookmarks.length) {
    const empty = document.createElement("li");
    empty.className = "bookmark-empty";
    empty.textContent = "No bookmarks yet.";
    fragment.appendChild(empty);
  }

  headings.forEach((heading) => {
    const item = document.createElement("li");
    item.className = `heading-item level-${heading.tagName.slice(1)}`;

    const title = document.createElement("strong");
    title.textContent = `${headingNumber(heading, counters)}${heading.dataset.plain || "(Untitled)"}`;
    item.appendChild(title);

    const childBookmarks = bookmarksByHeading.get(heading) || [];
    if (!childBookmarks.length) {
      fragment.appendChild(item);
      return;
    }

    const list = document.createElement("ul");
    list.className = "heading-bookmark-list";

    childBookmarks.forEach((bookmarkedElement) => {
      const bookmarkItem = document.createElement("li");
      bookmarkItem.className = "bookmark-item";

      const link = document.createElement("a");
      link.href = `#${bookmarkedElement.id}`;
      link.textContent = bookmarkedElement.dataset.plain || normalizeText(bookmarkedElement);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        bookmarkedElement.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "bookmark-remove";
      removeButton.title = "Remove bookmark";
      removeButton.setAttribute("aria-label", "Remove bookmark");
      removeButton.appendChild(createBookmarkIcon());
      removeButton.addEventListener("click", () => removeBookmark(bookmarkedElement.id));

      bookmarkItem.append(link, removeButton);
      list.appendChild(bookmarkItem);
    });

    item.appendChild(list);

    fragment.appendChild(item);
  });

  panelList.replaceChildren(fragment);
}

function setBookmarkPanelOpen(open) {
  const button = byId("toggleBookmarks");
  const panel = byId("bookmarkPanel");
  if (!button || !panel) return;

  panel.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", `${open ? "Hide" : "Show"} bookmarks`);
  button.title = `${open ? "Hide" : "Show"} bookmarks`;
}

function setupBookmarkPanel() {
  const button = byId("toggleBookmarks");
  if (!button) return;

  button.addEventListener("click", () => {
    setBookmarkPanelOpen(button.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setBookmarkPanelOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setupTheme();
  setupBookmarkPanel();
  setupInternalLinkNavigation();
  setupCodeCopyButtons();

  try {
    configureMarkdown();
    await loadAll();
  } catch (error) {
    console.error(error);
    byId("content").innerHTML = '<blockquote class="load-error">⚠️ The notes could not be rendered. Reload the page or check the browser console.</blockquote>';
  }
});
