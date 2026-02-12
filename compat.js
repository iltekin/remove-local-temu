/**
 * Cross-browser compatibility layer for Chrome & Firefox (Manifest V3)
 *
 * Firefox MV3 (109+) supports the chrome.* callback-based API,
 * but if it's unavailable for any reason we fall back to browser.* with
 * a thin Promise-to-callback adapter so the rest of the code can keep
 * using the familiar callback style unchanged.
 */

/* global chrome, browser */

const browserAPI = (() => {
  // Chrome and modern Firefox MV3 both expose the chrome namespace
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return chrome;
  }

  // Fallback: Firefox browser.* API (Promise-based)
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id) {
    return browser;
  }

  // Should never reach here inside an extension context
  console.warn('[compat] Neither chrome nor browser API detected.');
  return chrome || browser;
})();
