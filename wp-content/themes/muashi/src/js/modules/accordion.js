// ハンバーガーボタン

document.addEventListener('DOMContentLoaded', () => {
  const accordionButtons = document.querySelectorAll('.js-accordion-button');

  accordionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const accordionList = button.nextElementSibling;
      if (!accordionList) return;
      button.classList.toggle('is-active');
      accordionList.classList.toggle('is-active');
    });
  });

  const navigationAccordions = Array.from(document.querySelectorAll('.js-navigation-accordion'));
  const navigationAccordionPairs = [];

  const closeOtherNavigationAccordions = (currentTrigger) => {
    navigationAccordionPairs.forEach(({ trigger: otherTrigger, setState }) => {
      if (otherTrigger !== currentTrigger) {
        setState(false);
      }
    });
  };

  navigationAccordions.forEach(trigger => {
    const targetList = trigger.nextElementSibling;
    if (!targetList || !targetList.classList.contains('navigation__sub-accordion-list')) {
      return;
    }

    if (!trigger.hasAttribute('tabindex')) {
      trigger.setAttribute('tabindex', '0');
    }
    trigger.setAttribute('role', 'button');

    const setState = (isOpen) => {
      targetList.classList.toggle('is-active', isOpen);
      trigger.classList.toggle('is-active', isOpen);
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      targetList.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    };

    navigationAccordionPairs.push({ trigger, setState });

    const initialState = targetList.classList.contains('is-active');
    setState(initialState);

    const toggleState = () => {
      const willOpen = !targetList.classList.contains('is-active');
      if (willOpen) {
        closeOtherNavigationAccordions(trigger);
      }
      setState(willOpen);
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      toggleState();
    });

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleState();
      }
    });
  });

  // URLハッシュに基づいてアコーディオンを開く
  const openAccordionByHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    navigationAccordionPairs.forEach(({ trigger, setState }) => {
      const taxonomy = trigger.getAttribute('data-taxonomy');
      if (taxonomy === hash) {
        closeOtherNavigationAccordions(trigger);
        setState(true);
        // アコーディオンの位置までスクロール
        setTimeout(() => {
          trigger.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  };

  // ページ読み込み時にハッシュを確認
  openAccordionByHash();

  // ハッシュ変更時も対応
  window.addEventListener('hashchange', openAccordionByHash);
});
