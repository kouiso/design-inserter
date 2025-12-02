document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.single__download-button');
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const href = button.getAttribute('href');
      if (!href) {
        return;
      }
      event.preventDefault();
      window.location.href = href;
    }, { capture: true });
  });
});
