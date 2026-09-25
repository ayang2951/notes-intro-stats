'use strict';

const path = require('path');
const vscode = require('vscode');
const {
  buildEquationReferenceIndex,
  equationReferenceRecords
} = require('../media/equation-reference-index');
const { resolveSourceMatch } = require('../media/source-navigation');

const CONFIG_SECTION = 'courseNotesPreview';
const VIEW_TYPE = 'courseNotesPreview.preview';
const DEFAULT_UPDATE_DELAY = 120;
const MAX_SELECTED_TEXT_LENGTH = 256;
const MAX_CODE_COPY_LENGTH = 5_000_000;

function activate(context) {
  const manager = new PreviewManager(context);

  context.subscriptions.push(
    manager,
    vscode.commands.registerCommand(
      'courseNotesPreview.openPreview',
      () => manager.openPreviewForActiveEditor()
    ),
    vscode.commands.registerCommand(
      'courseNotesPreview.refreshPreview',
      () => manager.refreshPreview()
    )
  );
}

function deactivate() {}

class PreviewManager {
  constructor(context) {
    this.context = context;
    this.controllers = new Map();
    const markdownWatcher = vscode.workspace.createFileSystemWatcher('**/*.md');
    this.disposables = [
      markdownWatcher,
      markdownWatcher.onDidChange((uri) => this.onWorkspaceMarkdownChanged(uri)),
      markdownWatcher.onDidCreate((uri) => this.onWorkspaceMarkdownChanged(uri)),
      markdownWatcher.onDidDelete((uri) => this.onWorkspaceMarkdownChanged(uri)),
      vscode.workspace.onDidChangeTextDocument((event) => this.onDocumentChanged(event)),
      vscode.window.onDidChangeTextEditorSelection((event) => this.onEditorSelectionChanged(event)),
      vscode.window.onDidChangeVisibleTextEditors((editors) => this.onVisibleEditorsChanged(editors)),
      vscode.workspace.onDidChangeConfiguration((event) => this.onConfigurationChanged(event))
    ];
  }

  async openPreviewForActiveEditor() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
      await vscode.window.showInformationMessage(
        'Open a Markdown file first, then run “Course Notes: Open Preview to the Side”.'
      );
      return;
    }

    const key = editor.document.uri.toString();
    const existing = this.controllers.get(key);
    if (existing) {
      existing.updateSourceViewColumn(editor.viewColumn);
      existing.reveal();
      existing.scheduleRender(0);
      return;
    }

    const controller = new PreviewController(this, this.context, editor);
    this.controllers.set(key, controller);
    controller.scheduleRender(0);
  }

  async refreshPreview() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'markdown') {
      const controller = this.controllers.get(activeEditor.document.uri.toString());
      if (controller) {
        controller.scheduleRender(0);
        return;
      }

      await this.openPreviewForActiveEditor();
      return;
    }

    const activeController = Array.from(this.controllers.values()).find(
      (controller) => controller.panel.active
    );
    if (activeController) {
      activeController.scheduleRender(0);
      return;
    }

    if (this.controllers.size) {
      for (const controller of this.controllers.values()) {
        controller.scheduleRender(0);
      }
      return;
    }

    await this.openPreviewForActiveEditor();
  }

  onDocumentChanged(event) {
    if (!event.contentChanges.length) return;

    for (const controller of this.controllers.values()) {
      if (sameUri(controller.sourceUri, event.document.uri) ||
          controller.usesConfiguredNote(event.document.uri) ||
          controller.usesWorkspaceStylesheet(event.document.uri)) {
        controller.scheduleRender(controller.updateDelay());
      }
    }
  }

  onWorkspaceMarkdownChanged(uri) {
    for (const controller of this.controllers.values()) {
      if (sameUri(controller.sourceUri, uri) || controller.usesConfiguredNote(uri)) {
        controller.scheduleRender(controller.updateDelay());
      }
    }
  }

  onEditorSelectionChanged(event) {
    const controller = this.controllers.get(event.textEditor.document.uri.toString());
    if (controller) controller.onEditorSelectionChanged(event);
  }

  onVisibleEditorsChanged(editors) {
    for (const editor of editors) {
      const controller = this.controllers.get(editor.document.uri.toString());
      if (controller) controller.updateSourceViewColumn(editor.viewColumn);
    }
  }

  onConfigurationChanged(event) {
    for (const controller of this.controllers.values()) {
      if (event.affectsConfiguration(CONFIG_SECTION, controller.sourceUri)) {
        controller.scheduleRender(0);
      }
    }
  }

  forget(controller) {
    const key = controller.sourceUri.toString();
    if (this.controllers.get(key) === controller) this.controllers.delete(key);
  }

  dispose() {
    for (const disposable of this.disposables.splice(0)) disposable.dispose();
    for (const controller of Array.from(this.controllers.values())) controller.dispose();
    this.controllers.clear();
  }
}

class PreviewController {
  constructor(manager, context, sourceEditor) {
    this.manager = manager;
    this.context = context;
    this.sourceUri = sourceEditor.document.uri;
    this.sourceViewColumn = sourceEditor.viewColumn || vscode.ViewColumn.One;
    this.workspaceFolder = vscode.workspace.getWorkspaceFolder(this.sourceUri);
    this.ready = false;
    this.disposed = false;
    this.renderTimer = undefined;
    this.renderGeneration = 0;
    this.suppressedSelection = undefined;
    this.disposables = [];

    const mediaRoot = vscode.Uri.joinPath(context.extensionUri, 'media');
    const localResourceRoots = [mediaRoot];
    if (this.workspaceFolder) localResourceRoots.push(this.workspaceFolder.uri);

    this.panel = vscode.window.createWebviewPanel(
      VIEW_TYPE,
      previewTitle(sourceEditor.document),
      {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true
      },
      {
        enableFindWidget: true,
        enableScripts: true,
        localResourceRoots
      }
    );

    this.panel.webview.html = createWebviewHtml(
      this.panel.webview,
      context.extensionUri,
      this.workspaceFolder
    );

    this.disposables.push(
      this.panel.webview.onDidReceiveMessage((message) => {
        this.onWebviewMessage(message).catch((error) => this.reportError(error));
      }),
      this.panel.onDidChangeViewState((event) => {
        if (event.webviewPanel.visible) this.scheduleRender(0);
      }),
      this.panel.onDidDispose(() => this.onPanelDisposed())
    );
  }

  reveal() {
    if (!this.disposed) this.panel.reveal(vscode.ViewColumn.Beside, true);
  }

  updateSourceViewColumn(viewColumn) {
    if (viewColumn && viewColumn > 0) this.sourceViewColumn = viewColumn;
  }

  updateDelay() {
    const configured = this.configuration().get('updateDelay', DEFAULT_UPDATE_DELAY);
    if (!Number.isFinite(configured)) return DEFAULT_UPDATE_DELAY;
    return Math.min(1000, Math.max(25, Math.round(configured)));
  }

  scheduleRender(delayMilliseconds) {
    if (this.disposed) return;

    this.renderGeneration += 1;
    const generation = this.renderGeneration;
    if (this.renderTimer) clearTimeout(this.renderTimer);

    this.renderTimer = setTimeout(() => {
      this.renderTimer = undefined;
      this.render(generation).catch((error) => this.reportError(error));
    }, Math.max(0, delayMilliseconds));
  }

  async render(generation) {
    if (this.disposed || !this.ready || generation !== this.renderGeneration) return;

    const document = await this.sourceDocument();
    const configuration = this.configuration();
    const [cssText, referenceIndex] = await Promise.all([
      this.readWorkspaceCss(configuration),
      this.buildProjectEquationIndex(configuration, document)
    ]);
    if (this.disposed || generation !== this.renderGeneration) return;

    const payload = {
      type: 'render',
      uri: this.sourceUri.toString(),
      version: document.version,
      renderRevision: generation,
      markdown: document.getText(),
      cssText,
      sectionNumber: this.sectionNumber(document, configuration),
      autoNumberCallouts: configuration.get('autoNumberCallouts', true),
      openCollapsedProofs: configuration.get('openCollapsedProofs', false),
      projectReferences: equationReferenceRecords(referenceIndex)
    };

    this.panel.title = previewTitle(document);
    await this.panel.webview.postMessage(payload);
  }

  async onWebviewMessage(message) {
    if (!message || typeof message !== 'object' || this.disposed) return;

    if (message.type === 'ready') {
      this.ready = true;
      this.scheduleRender(0);
      return;
    }

    if (message.type === 'revealSource') {
      await this.revealSource(message);
      return;
    }

    if (message.type === 'revealReference') {
      await this.revealReference(message);
      return;
    }

    if (message.type === 'copyCode') {
      await this.copyCode(message);
    }
  }

  onEditorSelectionChanged(event) {
    if (this.disposed || !this.ready || event.selections.length !== 1) return;

    const selection = event.selections[0];
    if (this.consumeSuppressedSelection(event.textEditor.document, selection)) return;
    if (event.kind !== vscode.TextEditorSelectionChangeKind.Mouse || selection.isEmpty) return;
    if (selection.start.line !== selection.end.line) return;

    const selectedText = event.textEditor.document.getText(selection);
    if (!isSafeSelectedText(selectedText) || selectedText !== selectedText.trim()) return;
    if (/\s/u.test(selectedText)) return;

    this.panel.webview.postMessage({
      type: 'revealPreview',
      uri: this.sourceUri.toString(),
      version: event.textEditor.document.version,
      line: selection.start.line,
      character: selection.start.character,
      word: selectedText
    });
  }

  async revealSource(message) {
    if (message.uri !== this.sourceUri.toString()) return;
    if (!Number.isInteger(message.version) || message.version < 0) return;
    if (!Number.isInteger(message.line) || message.line < 0 || message.line > 10_000_000) return;
    if (typeof message.word !== 'string') return;
    if (message.word && !isSafeSelectedText(message.word)) return;

    const document = await this.sourceDocument();
    if (message.version !== document.version) {
      this.scheduleRender(0);
      return;
    }

    const approximateLine = Math.min(message.line, Math.max(0, document.lineCount - 1));
    const endLine = Number.isInteger(message.endLine) && message.endLine >= approximateLine
      ? Math.min(message.endLine, Math.max(0, document.lineCount - 1))
      : approximateLine;
    const occurrence = Number.isInteger(message.occurrence) && message.occurrence >= 0
      ? message.occurrence
      : undefined;
    const range = findClosestSourceRange(
      document,
      message.word.trim(),
      approximateLine,
      endLine,
      occurrence
    );
    const editor = await this.showSourceDocument(document);

    this.suppressedSelection = {
      uri: document.uri.toString(),
      version: document.version,
      start: document.offsetAt(range.start),
      end: document.offsetAt(range.end),
      expiresAt: Date.now() + 1000
    };

    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }

  async revealReference(message) {
    if (!isSafeReferenceId(message.id)) return;
    if (!Number.isInteger(message.renderRevision) || message.renderRevision < 0) return;
    const requestedRevision = message.renderRevision;
    if (requestedRevision !== this.renderGeneration) {
      this.scheduleRender(0);
      return;
    }

    let sourceDocument = await this.sourceDocument();
    if (requestedRevision !== this.renderGeneration) return;
    let index = await this.buildProjectEquationIndex(this.configuration(), sourceDocument);
    if (requestedRevision !== this.renderGeneration) return;
    let targets = index.get(message.id) || [];
    if (targets.length !== 1) {
      this.scheduleRender(0);
      return;
    }

    let target = targets[0];
    const targetUri = vscode.Uri.parse(target.uri);
    const document = await this.documentForUri(targetUri);
    if (requestedRevision !== this.renderGeneration) return;

    // Opening a previously closed target gives us a current text buffer. Build
    // the index once more so a just-saved edit cannot leave a shifted range.
    sourceDocument = await this.sourceDocument();
    if (requestedRevision !== this.renderGeneration) return;
    index = await this.buildProjectEquationIndex(this.configuration(), sourceDocument);
    if (requestedRevision !== this.renderGeneration) return;
    targets = index.get(message.id) || [];
    if (targets.length !== 1 || targets[0].uri !== document.uri.toString()) {
      this.scheduleRender(0);
      return;
    }

    target = targets[0];
    const range = rangeFromReferenceRecord(document, target);
    if (document.getText(range) !== message.id) {
      this.scheduleRender(0);
      return;
    }
    const editor = await this.showSourceDocument(document, targetUri);
    if (requestedRevision !== this.renderGeneration) return;

    this.suppressedSelection = {
      uri: document.uri.toString(),
      version: document.version,
      start: document.offsetAt(range.start),
      end: document.offsetAt(range.end),
      expiresAt: Date.now() + 1000
    };

    editor.selection = new vscode.Selection(range.start, range.end);
    const equationLine = clampLine(document, target.equationLine);
    const equationPosition = new vscode.Position(
      equationLine,
      document.lineAt(equationLine).firstNonWhitespaceCharacterIndex
    );
    editor.revealRange(
      new vscode.Range(equationPosition, equationPosition),
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );
  }

  async copyCode(message) {
    if (!isSafeCodeCopyRequest(message)) return;

    let ok = true;
    try {
      await vscode.env.clipboard.writeText(message.text);
    } catch (_error) {
      ok = false;
    }

    if (!this.disposed) {
      await this.panel.webview.postMessage({
        type: 'copyCodeResult',
        requestId: message.requestId,
        ok
      });
    }
  }

  consumeSuppressedSelection(document, selection) {
    const suppressed = this.suppressedSelection;
    if (!suppressed) return false;
    if (Date.now() > suppressed.expiresAt) {
      this.suppressedSelection = undefined;
      return false;
    }

    const matches =
      document.uri.toString() === suppressed.uri &&
      document.version === suppressed.version &&
      document.offsetAt(selection.start) === suppressed.start &&
      document.offsetAt(selection.end) === suppressed.end;

    if (matches) this.suppressedSelection = undefined;
    return matches;
  }

  async showSourceDocument(document, targetUri = this.sourceUri) {
    const visible = vscode.window.visibleTextEditors.find(
      (editor) => sameUri(editor.document.uri, targetUri)
    );
    const viewColumn = visible?.viewColumn || this.sourceViewColumn || vscode.ViewColumn.One;
    const editor = await vscode.window.showTextDocument(document, {
      viewColumn,
      preserveFocus: false,
      preview: false
    });
    this.updateSourceViewColumn(editor.viewColumn);
    return editor;
  }

  async sourceDocument() {
    return this.documentForUri(this.sourceUri);
  }

  async documentForUri(uri) {
    const openDocument = vscode.workspace.textDocuments.find(
      (document) => sameUri(document.uri, uri)
    );
    return openDocument || vscode.workspace.openTextDocument(uri);
  }

  configuration() {
    return vscode.workspace.getConfiguration(CONFIG_SECTION, this.sourceUri);
  }

  sectionNumber(document, configuration) {
    const noteFiles = configuration.get('noteFiles', []);
    if (!this.workspaceFolder || !Array.isArray(noteFiles)) return 1;

    const relativeDocumentPath = normalizeRelativePath(
      path.relative(this.workspaceFolder.uri.fsPath, document.uri.fsPath)
    );
    const index = noteFiles.findIndex(
      (noteFile) => normalizeRelativePath(noteFile) === relativeDocumentPath
    );
    return index >= 0 ? index + 1 : 1;
  }

  configuredNoteEntries(configuration = this.configuration()) {
    const noteFiles = configuration.get('noteFiles', []);
    if (!this.workspaceFolder || !Array.isArray(noteFiles)) return [];

    const entries = [];
    const seen = new Set();
    noteFiles.forEach((configuredPath, index) => {
      const uri = resolveWorkspaceRelative(this.workspaceFolder, configuredPath);
      if (!uri || seen.has(uri.toString())) return;
      seen.add(uri.toString());
      entries.push({
        uri,
        sectionNumber: index + 1,
        path: normalizeRelativePath(configuredPath)
      });
    });
    return entries;
  }

  usesConfiguredNote(uri) {
    return this.configuredNoteEntries().some((entry) => sameUri(entry.uri, uri));
  }

  async projectDocuments(configuration, sourceDocument) {
    const entries = this.configuredNoteEntries(configuration);
    if (!entries.length) {
      return [{
        uri: sourceDocument.uri.toString(),
        text: sourceDocument.getText(),
        version: sourceDocument.version,
        sectionNumber: 1,
        path: normalizeRelativePath(path.basename(sourceDocument.fileName || sourceDocument.uri.path))
      }];
    }

    const documents = await Promise.all(entries.map(async (entry) => {
      try {
        const openDocument = vscode.workspace.textDocuments.find(
          (document) => sameUri(document.uri, entry.uri)
        );
        const text = openDocument ? openDocument.getText() : await readText(entry.uri);
        return {
          uri: entry.uri.toString(),
          text,
          version: openDocument ? openDocument.version : 0,
          sectionNumber: entry.sectionNumber,
          path: entry.path
        };
      } catch (_error) {
        // Keep the configured section gap when a note file is temporarily absent.
        return undefined;
      }
    }));

    return documents.filter(Boolean);
  }

  async buildProjectEquationIndex(configuration, sourceDocument) {
    const documents = await this.projectDocuments(configuration, sourceDocument);
    return buildEquationReferenceIndex(documents);
  }

  configuredStylesheetUris() {
    if (!this.workspaceFolder) return [];

    const cssFiles = this.configuration().get('workspaceCssFiles', ['styles.css']);
    if (!Array.isArray(cssFiles)) return [];

    return cssFiles
      .map((cssFile) => resolveWorkspaceRelative(this.workspaceFolder, cssFile))
      .filter(Boolean);
  }

  usesWorkspaceStylesheet(uri) {
    return this.configuredStylesheetUris().some((stylesheetUri) => sameUri(stylesheetUri, uri));
  }

  async readWorkspaceCss(configuration = this.configuration()) {
    const cssFiles = configuration.get('workspaceCssFiles', ['styles.css']);
    if (!this.workspaceFolder || !Array.isArray(cssFiles)) return '';

    const chunks = [];
    for (const configuredPath of cssFiles) {
      const uri = resolveWorkspaceRelative(this.workspaceFolder, configuredPath);
      if (!uri) continue;

      try {
        const openDocument = vscode.workspace.textDocuments.find(
          (document) => sameUri(document.uri, uri)
        );
        const css = openDocument ? openDocument.getText() : await readText(uri);
        const label = normalizeRelativePath(configuredPath).replaceAll('*/', '* /');
        chunks.push(`/* ${label} */\n${css}`);
      } catch (_error) {
        // Workspace styles are optional; an absent file should not stop Markdown rendering.
      }
    }

    return chunks.join('\n\n');
  }

  reportError(error) {
    if (this.disposed) return;
    const detail = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`Course Notes Preview could not update: ${detail}`);
  }

  onPanelDisposed() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = undefined;
    for (const disposable of this.disposables.splice(0)) disposable.dispose();
    this.manager.forget(this);
  }

  dispose() {
    if (this.disposed) return;
    this.panel.dispose();
    if (!this.disposed) this.onPanelDisposed();
  }
}

function createWebviewHtml(webview, extensionUri, workspaceFolder) {
  const nonce = createNonce();
  const previewCssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'preview.css')
  );
  const htmlMarkdownScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'html-markdown.js')
  );
  const previewScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'preview.js')
  );
  const sourceNavigationScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'source-navigation.js')
  );
  const equationNumberingScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'equation-numbering.js')
  );
  const codeBlocksScriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'code-blocks.js')
  );
  const baseTag = workspaceFolder
    ? `<base href="${escapeHtmlAttribute(withTrailingSlash(webview.asWebviewUri(workspaceFolder.uri).toString()))}">`
    : '';

  const contentSecurityPolicy = [
    "default-src 'none'",
    `base-uri ${webview.cspSource}`,
    `img-src ${webview.cspSource} https: data:`,
    `media-src ${webview.cspSource} https: data:`,
    `font-src ${webview.cspSource} https://fonts.gstatic.com data:`,
    `style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com`,
    `script-src ${webview.cspSource} 'nonce-${nonce}' https://cdn.jsdelivr.net`,
    "form-action 'none'",
    "frame-src 'none'"
  ].join('; ');

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta http-equiv="Content-Security-Policy" content="${escapeHtmlAttribute(contentSecurityPolicy)}">
  ${baseTag}
  <title>Course Notes Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..700;1,400..700&amp;display=swap" rel="stylesheet">
  <link href="${previewCssUri}" rel="stylesheet">
  <style id="workspace-style" nonce="${nonce}"></style>
  <script nonce="${nonce}">
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        processEscapes: true,
        processEnvironments: true,
        tags: 'none'
      },
      options: { ignoreHtmlClass: 'tex2jax_ignore' },
      svg: { fontCache: 'global' },
      startup: { typeset: false }
    };
  </script>
  <script nonce="${nonce}" defer src="https://cdn.jsdelivr.net/npm/marked@18.0.11/lib/marked.umd.min.js"></script>
  <script nonce="${nonce}" defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js"></script>
  <script nonce="${nonce}" defer src="${sourceNavigationScriptUri}"></script>
  <script nonce="${nonce}" defer src="${equationNumberingScriptUri}"></script>
  <script nonce="${nonce}" defer src="${codeBlocksScriptUri}"></script>
  <script nonce="${nonce}" defer src="${htmlMarkdownScriptUri}"></script>
  <script nonce="${nonce}" defer src="${previewScriptUri}"></script>
</head>
<body>
  <main id="app">
    <div id="preview-status" role="status">Loading preview…</div>
    <article id="content" aria-live="polite" aria-busy="true"></article>
  </main>
</body>
</html>`;
}

function findClosestSourceRange(document, selectedText, approximateLine, endLine, occurrence) {
  const lines = Array.from(
    { length: document.lineCount },
    (_value, lineNumber) => document.lineAt(lineNumber).text
  );
  const match = resolveSourceMatch(lines, selectedText, approximateLine, {
    endLine,
    occurrence
  });
  const start = new vscode.Position(match.lineNumber, match.character);
  const end = new vscode.Position(
    match.lineNumber,
    match.character + match.length
  );
  return new vscode.Range(start, end);
}

function isSafeSelectedText(value) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= MAX_SELECTED_TEXT_LENGTH &&
    !/[\r\n]/.test(value)
  );
}

function isSafeCodeCopyRequest(message) {
  return (
    message &&
    typeof message.requestId === 'string' &&
    /^[A-Za-z0-9._:-]{1,128}$/.test(message.requestId) &&
    typeof message.text === 'string' &&
    message.text.length <= MAX_CODE_COPY_LENGTH
  );
}

function isSafeReferenceId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 512 &&
    !/[\s\r\n]/.test(value);
}

function rangeFromReferenceRecord(document, record) {
  const startLine = clampLine(document, record.line);
  const endLine = clampLine(document, record.endLine);
  const start = new vscode.Position(
    startLine,
    clampCharacter(document, startLine, record.character)
  );
  const candidateEnd = new vscode.Position(
    endLine,
    clampCharacter(document, endLine, record.endCharacter)
  );
  const startOffset = document.offsetAt(start);
  const endOffset = Math.max(startOffset, document.offsetAt(candidateEnd));
  return new vscode.Range(document.positionAt(startOffset), document.positionAt(endOffset));
}

function clampLine(document, value) {
  const line = Number.isInteger(value) ? value : 0;
  return Math.min(Math.max(0, document.lineCount - 1), Math.max(0, line));
}

function clampCharacter(document, line, value) {
  const character = Number.isInteger(value) ? value : 0;
  return Math.min(document.lineAt(line).text.length, Math.max(0, character));
}

function resolveWorkspaceRelative(workspaceFolder, configuredPath) {
  if (typeof configuredPath !== 'string' || !configuredPath.trim()) return undefined;
  if (path.isAbsolute(configuredPath)) return undefined;

  const pieces = normalizeRelativePath(configuredPath)
    .split('/')
    .filter((piece) => piece && piece !== '.');
  if (!pieces.length || pieces.includes('..')) return undefined;

  return vscode.Uri.joinPath(workspaceFolder.uri, ...pieces);
}

async function readText(uri) {
  const bytes = await vscode.workspace.fs.readFile(uri);
  return Buffer.from(bytes).toString('utf8');
}

function previewTitle(document) {
  const fileName = document.fileName || document.uri.path || 'Untitled';
  return `Preview: ${path.basename(fileName)}`;
}

function normalizeRelativePath(value) {
  return String(value || '')
    .replaceAll('\\', '/')
    .replace(/^\.\//, '');
}

function sameUri(first, second) {
  return Boolean(first && second) && first.toString() === second.toString();
}

function withTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function createNonce() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let index = 0; index < 32; index += 1) {
    nonce += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return nonce;
}

module.exports = { activate, deactivate };
