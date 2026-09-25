(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CourseNotesHtmlMarkdown = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem meta nav noframes ol optgroup option p param search section summary table tbody td tfoot th thead title tr track ul').split(' '));
  const LITERAL_TAGS = new Set(['pre', 'code', 'kbd', 'samp', 'script', 'style', 'textarea']);

  function createHtmlRenderer(marked) {
    return function (token) {
      if (!token.block || token.pre) return token.text;

      const source = token.text;
      const literals = [];
      let prefix = 'COURSECNOTESHTMLLITERAL';
      while (source.includes(prefix)) prefix += 'X';
      let html = '';
      let inline = '';
      let position = 0;
      const flush = () => {
        if (inline) html += this.parser.parseInline(marked.Lexer.lexInline(inline, this.options));
        inline = '';
      };
      // Scan complete tags, comments and code spans so a tag-looking string in
      // an attribute, comment or code span cannot create an emphasis boundary.
      const scanner = /<!--[\s\S]*?(?:-->|$)|(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)|<\/?([A-Za-z][A-Za-z0-9:-]*)(?=[\s/>])(?:[^>"']|"[^"]*"|'[^']*')*>/g;
      let match;
      while ((match = scanner.exec(source))) {
        inline += source.slice(position, match.index);
        const tag = match[3]?.toLowerCase();
        const openingLiteral = tag && LITERAL_TAGS.has(tag) && !/^<\//.test(match[0]) && !/\/\s*>$/.test(match[0]);
        if (openingLiteral) {
          const closing = new RegExp(`</${tag}\\s*>`, 'ig');
          closing.lastIndex = scanner.lastIndex;
          const end = closing.exec(source);
          const literalEnd = end ? closing.lastIndex : source.length;
          const literal = source.slice(match.index, literalEnd);
          inline += `${prefix}${literals.push(literal) - 1}X`;
          scanner.lastIndex = literalEnd;
        } else if (tag && BLOCK_TAGS.has(tag)) {
          // Each table cell/list item is a separate inline context. In
          // particular, ___ placeholders must not pair across cell borders.
          flush();
          html += match[0];
        } else {
          inline += match[0];
        }
        position = scanner.lastIndex;
      }
      inline += source.slice(position);
      flush();
      return html.replace(new RegExp(`${prefix}(\\d+)X`, 'g'), (_match, index) => literals[Number(index)]);
    };
  }


  // Raw closing/opening container tags can share a Marked paragraph token.
  // Keep them outside paragraph wrappers so the browser need not repair
  // misnested <p> tags and insert empty paragraphs.
  function createParagraphRenderer(marked) {
    return function (token) {
      const source = this.parser.parseInline(token.tokens);
      const scanner = /<!--[\s\S]*?(?:-->|$)|<\/?([A-Za-z][A-Za-z0-9:-]*)(?=[\s/>])(?:[^>"']|"[^"]*"|'[^']*')*>/g;
      let html = '';
      let inline = '';
      let position = 0;
      const containers = [];
      const flush = () => {
        html += inline.trim() && !containers.some(item => item.noParagraph) ? `<p>${inline}</p>\n` : inline;
        inline = '';
      };
      let match;
      while ((match = scanner.exec(source))) {
        inline += source.slice(position, match.index);
        const tag = match[1]?.toLowerCase();
        if (tag && LITERAL_TAGS.has(tag) && !/^<\//.test(match[0]) && !/\/\s*>$/.test(match[0])) {
          const closing = new RegExp(`</${tag}\\s*>`, 'ig');
          closing.lastIndex = scanner.lastIndex;
          const end = closing.exec(source);
          const literalEnd = end ? closing.lastIndex : source.length;
          const literal = source.slice(match.index, literalEnd);
          if (['pre', 'script', 'style', 'textarea'].includes(tag)) {
            flush();
            html += literal;
          } else inline += literal;
          scanner.lastIndex = literalEnd;
        } else if (tag && BLOCK_TAGS.has(tag)) {
          flush();
          html += match[0];
          if (/^<\//.test(match[0])) {
            const index = containers.map(item => item.tag).lastIndexOf(tag);
            if (index >= 0) containers.splice(index);
          } else if (!/\/\s*>$/.test(match[0]) && !['hr', 'col', 'meta', 'link', 'base'].includes(tag)) {
            const classMatch = /\bclass\s*=\s*(["'])(.*?)\1/i.exec(match[0]);
            const isLabel = classMatch && classMatch[2].split(/\s+/).includes('label');
            containers.push({ tag, noParagraph: /^(?:p|h[1-6]|td|th|summary)$/.test(tag) || isLabel });
          }
        } else inline += match[0];
        position = scanner.lastIndex;
      }
      inline += source.slice(position);
      flush();
      return html;
    };
  }

  // A raw HTML list often has bare first-paragraph text followed by <p>
  // elements. Give those text runs the same paragraph element and spacing.
  // Lists containing only a single bare paragraph retain their compact form.
  function normalizeParagraphs(root) {
    root.querySelectorAll('li, .callout, .collapsible__content').forEach(container => {
      if (!Array.from(container.children).some(child => child.tagName === 'P')) return;
      let run = [];
      const flush = () => {
        if (run.some(node => node.textContent.trim())) {
          const paragraph = container.ownerDocument.createElement('p');
          container.insertBefore(paragraph, run[0]);
          run.forEach(node => paragraph.appendChild(node));
        }
        run = [];
      };
      Array.from(container.childNodes).forEach(node => {
        const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : '';
        if (node.nodeType === 8 || (tag && (BLOCK_TAGS.has(tag) || ['pre', 'script', 'style', 'textarea'].includes(tag)))) {
          flush();
        } else run.push(node);
      });
      flush();
    });
    return root;
  }

  return { createHtmlRenderer, createParagraphRenderer, normalizeParagraphs };

});
