import ScrollHint from 'scroll-hint';

const injectManualHint = (element) => {
  element.classList.add('scroll-hint');

  const wrapper = document.createElement('div');
  wrapper.className = 'scroll-hint-icon-wrap is-active';
  wrapper.dataset.target = 'scrollable-icon';

  const icon = document.createElement('span');
  icon.className = 'scroll-hint-icon scroll-hint-icon-white';

  const text = document.createElement('div');
  text.className = 'scroll-hint-text';
  text.textContent = '横にスクロールできます';

  icon.appendChild(text);
  wrapper.appendChild(icon);
  element.appendChild(wrapper);

  element.addEventListener(
    'scroll',
    () => {
      wrapper.classList.remove('is-active');
    },
    { once: true }
  );

  window.setTimeout(() => {
    wrapper.classList.remove('is-active');
  }, 5000);
};

export const initializeScrollHint = () => {
  const baseElements = document.querySelectorAll('.history__table-wrapper');
  baseElements.forEach((element) => {
    element.classList.add('js-scrollable');
  });

  const scrollableElements = document.querySelectorAll('.js-scrollable');

  if (!scrollableElements.length) {
    console.debug('[scroll-hint] no scrollable elements found');
    return;
  }

  let hintInstance;
  try {
    hintInstance = new ScrollHint('.js-scrollable', {
      scrollHintIconAppendClass: 'scroll-hint-icon-white',
      scrollHintIconClass: 'scroll-hint-icon',
      i18n: {
        scrollable: '横にスクロールできます'
      }
    });
  } catch (error) {
    console.error('[scroll-hint] initialization error', error);
  }

  window.requestAnimationFrame(() => {
    scrollableElements.forEach((element) => {
      if (!element.querySelector('.scroll-hint-icon-wrap')) {
        injectManualHint(element);
      }
    });
  });

  if (hintInstance && typeof hintInstance.updateItems === 'function') {
    hintInstance.updateItems();
  }
};
