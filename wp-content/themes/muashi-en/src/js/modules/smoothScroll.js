document.addEventListener('DOMContentLoaded', () => {
  // ヘッダーの高さを取得してCSS変数に設定
  const setScrollOffset = () => {
    const header = document.querySelector('header');
    if (header) {
      const headerHeight = header.offsetHeight;
      const additionalOffset = 100; // 追加のオフセット（見やすさのため）
      const totalOffset = headerHeight + additionalOffset;
      document.documentElement.style.setProperty('--header-scroll-offset', `${totalOffset}px`);
    }
  };

  // 初期設定
  setScrollOffset();

  // リサイズ時に再計算（ヘッダーの高さが変わる可能性があるため）
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setScrollOffset();
    }, 250);
  });

  // 同一ページ内のスムーススクロール
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      // #のみの場合はトップへスクロール
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      
      // その他のアンカーリンクは、ブラウザのデフォルト動作に任せる
      // CSSのscroll-margin-topが自動的に適用される
    });
  });
});