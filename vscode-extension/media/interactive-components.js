(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CourseNotesInteractiveComponents = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEFAULT_SELECTOR = ".bivariate-normal-slicer[data-instance-id]";
  const SOURCE_ATTRIBUTES = [
    "data-source-line",
    "data-source-end-line",
    "data-source-key"
  ];
  const TRANSIENT_ATTRIBUTES = new Set([
    "data-initialized",
    "data-slice-mode",
    ...SOURCE_ATTRIBUTES
  ]);

  function declarativeSignature(element) {
    const attributes = Array.from(element.attributes || [])
      .filter((attribute) => !TRANSIENT_ATTRIBUTES.has(attribute.name))
      .map((attribute) => [attribute.name, attribute.value])
      .sort(([firstName], [secondName]) => firstName.localeCompare(secondName));
    return JSON.stringify([element.localName || element.tagName, attributes]);
  }

  function uniquelyKeyedComponents(rootElement, selector) {
    const components = new Map();
    rootElement.querySelectorAll(selector).forEach((element) => {
      const key = element.getAttribute("data-instance-id")?.trim();
      if (!key) return;
      if (components.has(key)) {
        components.set(key, undefined);
        return;
      }
      components.set(key, element);
    });
    return components;
  }

  function copySourceAttributes(target, source) {
    SOURCE_ATTRIBUTES.forEach((name) => {
      if (source.hasAttribute(name)) {
        target.setAttribute(name, source.getAttribute(name));
      } else {
        target.removeAttribute(name);
      }
    });
  }

  function reuseInitializedComponents(currentRoot, nextRoot, options = {}) {
    if (options.enabled === false) return 0;
    const selector = options.selector || DEFAULT_SELECTOR;
    const currentComponents = uniquelyKeyedComponents(currentRoot, selector);
    const nextComponents = uniquelyKeyedComponents(nextRoot, selector);
    let reused = 0;

    nextComponents.forEach((nextElement, key) => {
      const currentElement = currentComponents.get(key);
      if (!currentElement || !nextElement) return;
      if (currentElement.getAttribute("data-initialized") !== "true") return;
      if (declarativeSignature(currentElement) !== declarativeSignature(nextElement)) return;

      copySourceAttributes(currentElement, nextElement);
      nextElement.replaceWith(currentElement);
      reused += 1;
    });

    return reused;
  }

  return {
    declarativeSignature,
    reuseInitializedComponents
  };
});
