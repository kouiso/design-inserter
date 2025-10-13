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

  const navigationAccordions = document.querySelectorAll('.js-navigation-accordion');

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

    const initialState = targetList.classList.contains('is-active');
    setState(initialState);

    const toggleState = () => {
      const willOpen = !targetList.classList.contains('is-active');
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
});
