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
import './modules/gsap.js';
import './modules/accordion.js';

// Import all colorBar modules statically
import { initializeColorBar } from './modules/colorBar.js';
import { initializeColorBar01 } from './modules/colorBar01.js';
import { initializeColorBar02 } from './modules/colorBar02.js';
import { initializeColorBar03 } from './modules/colorBar03.js';
import { initializeColorBar04 } from './modules/colorBar04.js';
import { initializeColorBar05 } from './modules/colorBar05.js';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.startsWith('/01-2/')) {
        initializeColorBar01();
    } else if (path.startsWith('/02-2/')) {
        initializeColorBar02();
    } else if (path.startsWith('/03-2/')) {
        initializeColorBar03();
    } else if (path.startsWith('/04-2/')) {
        initializeColorBar04();
    } else if (path.startsWith('/05-2/')) {
        initializeColorBar05();
    } else {
        initializeColorBar();
    }
});

