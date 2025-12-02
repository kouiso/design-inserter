const applyPlaceholder = (img, placeholder) => {
  if (!placeholder) {
    return;
  }

  if (img.dataset.placeholderApplied === 'true') {
    return;
  }

  img.dataset.originalSrc = img.getAttribute('src') || '';
  img.dataset.placeholderApplied = 'true';
  img.src = placeholder;
};

export const initializeHistoryImages = () => {
  const historySection = document.querySelector('.history[data-placeholder]');
  if (!historySection) {
    return;
  }

  const placeholder = historySection.dataset.placeholder;
  if (!placeholder) {
    return;
  }

  const images = historySection.querySelectorAll('img');
  images.forEach((img) => {
    applyPlaceholder(img, placeholder);
  });
};
