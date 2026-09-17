(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CourseNotesCodeBlocks = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LANGUAGE_LABELS = new Map([
    ["bash", "Bash"],
    ["c", "C"],
    ["c#", "C#"],
    ["c++", "C++"],
    ["console", "Console"],
    ["cpp", "C++"],
    ["css", "CSS"],
    ["html", "HTML"],
    ["java", "Java"],
    ["javascript", "JavaScript"],
    ["js", "JavaScript"],
    ["json", "JSON"],
    ["julia", "Julia"],
    ["latex", "LaTeX"],
    ["matlab", "MATLAB"],
    ["md", "Markdown"],
    ["objective-c", "Objective-C"],
    ["plaintext", "Text"],
    ["py", "Python"],
    ["python", "Python"],
    ["r", "R"],
    ["ruby", "Ruby"],
    ["sh", "Shell"],
    ["shell", "Shell"],
    ["sql", "SQL"],
    ["text", "Text"],
    ["tex", "LaTeX"],
    ["ts", "TypeScript"],
    ["typescript", "TypeScript"],
    ["xml", "XML"],
    ["yaml", "YAML"],
    ["yml", "YAML"],
    ["zsh", "Z shell"]
  ]);

  function normalizeLanguage(value) {
    const first = /^\s*(\S+)/.exec(String(value || ""))?.[1] || "";
    return /^[A-Za-z0-9_+#.-]{1,40}$/.test(first) ? first.toLowerCase() : "";
  }

  function languageLabel(language) {
    const normalized = normalizeLanguage(language);
    if (!normalized) return "Code";
    return LANGUAGE_LABELS.get(normalized) ||
      normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
  }

  function normalizeCodeText(value) {
    return `${String(value || "").replace(/\r\n?/g, "\n").replace(/\n$/, "")}\n`;
  }

  function renderCodeBlock(token = {}, source = {}) {
    const language = normalizeLanguage(token.lang);
    const label = languageLabel(language);
    const description = language ? `${label} code` : "code";
    const code = normalizeCodeText(token.text);
    const renderedCode = token.escaped === true ? code : escapeHtml(code);
    const languageClass = language ? ` class="language-${escapeAttribute(language)}"` : "";
    const sourceMarkup = sourceAttributes(source);

    return [
      '<div class="code-block">',
      '<div class="code-block__header">',
      `<span class="code-block__language">${escapeHtml(label)}</span>`,
      `<button type="button" class="code-copy-button" data-copy-code aria-live="polite" aria-label="Copy ${escapeAttribute(description)}">Copy</button>`,
      "</div>",
      `<pre${sourceMarkup}><code${languageClass}>${renderedCode}</code></pre>`,
      "</div>\n"
    ].join("");
  }

  function sourceAttributes(source) {
    if (!Number.isInteger(source.sourceLine) || source.sourceLine < 0) return "";
    const endLine = Number.isInteger(source.sourceEndLine) && source.sourceEndLine >= source.sourceLine
      ? source.sourceEndLine
      : source.sourceLine;
    const key = typeof source.sourceKey === "string" ? source.sourceKey : "";
    return ` data-source-line="${source.sourceLine}" data-source-end-line="${endLine}" data-source-key="${escapeAttribute(key)}"`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  return {
    languageLabel,
    normalizeCodeText,
    normalizeLanguage,
    renderCodeBlock
  };
});
