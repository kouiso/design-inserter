// ハンバーガーボタン

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButtons = document.querySelectorAll('.js-header-hamburger');
  const headerNav = document.querySelector('.js-header-nav');
  const headerNavLink = document.querySelectorAll('.header__nav-link');

  hamburgerButtons.forEach(button => {
    button.addEventListener('click', () => {
      hamburgerButtons.forEach(button => {
        button.classList.toggle('is-active');
      });
      headerNav.classList.toggle('is-active');
    });
  });

  headerNavLink.forEach(link => {
    link.addEventListener('click', () => {
      hamburgerButtons.forEach(button => {
        button.classList.remove('is-active');
      });
      headerNav.classList.remove('is-active');
    });
  });
  
});
