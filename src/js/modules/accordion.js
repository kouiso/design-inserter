// ハンバーガーボタン

document.addEventListener('DOMContentLoaded', () => {
  const accordionButtons = document.querySelectorAll('.js-accordion-button');

  accordionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const accordionList = button.nextElementSibling;
      button.classList.toggle('is-active');
      accordionList.classList.toggle('is-active');
    });
  });
  
});
