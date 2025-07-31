// If crypto.randomUUID is not available, provide a polyfill
if (window.crypto && !window.crypto.randomUUID) {
  window.crypto.randomUUID = function() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };
}

// Import modules
import './modules/hamburger.js';
import './modules/slideTopBanner.js';
import './modules/smoothScroll.js';
import './modules/colorBar.js';
import './modules/gsap.js';
import './modules/accordion.js';

