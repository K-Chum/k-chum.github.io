/**
 * sim-resize.js — Simulation iframe auto-height reporter
 *
 * Include this script in every simulation HTML file.
 * It measures the document's scroll height and sends it to the parent
 * window via postMessage. The parent (template.js) listens and sets
 * the iframe element's height to match, eliminating fixed heights and
 * internal scrollbars.
 *
 * Works reliably under file://, http://, and https:// protocols.
 */
(function () {
  'use strict';

  var DEBOUNCE_MS = 40; // coalesce rapid bursts into a single resize
  var timer = null;

  function reportHeight() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var h = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0
      );
      window.parent.postMessage({ type: 'sim-resize', height: h }, '*');
    }, DEBOUNCE_MS);
  }

  // 1. Report once the page is fully painted
  if (document.readyState === 'complete') {
    reportHeight();
  } else {
    window.addEventListener('load', reportHeight);
  }

  // 2. ResizeObserver — fires when any element changes size (canvas redraws, KaTeX, etc.)
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(reportHeight);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);
  }

  // 3. MutationObserver — catches DOM additions (solution steps, dynamic content)
  var mo = new MutationObserver(reportHeight);
  function attachMO() {
    if (document.body) {
      mo.observe(document.body, { childList: true, subtree: true, characterData: false });
    }
  }
  if (document.body) {
    attachMO();
  } else {
    document.addEventListener('DOMContentLoaded', attachMO);
  }

  // 4. Re-report on window resize (handles font-load reflows, zoom)
  window.addEventListener('resize', reportHeight);
})();
