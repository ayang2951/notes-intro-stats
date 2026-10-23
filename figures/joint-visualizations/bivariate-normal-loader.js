const SELECTOR = ".bivariate-normal-slicer";
let loadingPromise;

function loadModel() {
  if (!loadingPromise) {
    loadingPromise = import("./bivariate-normal-slicer.js").catch((error) => {
      loadingPromise = undefined;
      console.error("The bivariate Gaussian model could not be loaded.", error);
      document.querySelectorAll(SELECTOR).forEach((element) => {
        element.innerHTML = '<p class="bns-fallback">The interactive model could not be loaded.</p>';
      });
    });
  }
  return loadingPromise;
}

function start() {
  if (document.querySelector(SELECTOR)) {
    loadModel();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.querySelector(SELECTOR)) return;
    observer.disconnect();
    loadModel();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
