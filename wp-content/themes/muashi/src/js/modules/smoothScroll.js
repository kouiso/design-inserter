document.addEventListener('DOMContentLoaded', () => {
  // ヘッダーの高さを取得する関数
  const getHeaderHeight = () => {
    const header = document.querySelector('header');
    return header ? header.offsetHeight : 0;
  };

  // 指定された要素へスクロールする関数
  const scrollToElement = (targetElement) => {
    if (!targetElement) return;
    
    const headerHeight = getHeaderHeight();
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = targetPosition - headerHeight;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  // ページロード時にURLハッシュをチェック
  if (location.hash) {
    // 少し遅延させて実行（ページの完全な読み込みを待つため）
    setTimeout(() => {
      const targetElement = document.querySelector(location.hash);
      if (targetElement) {
        // スムーススクロールせずに即座に正しい位置へジャンプ
        const headerHeight = getHeaderHeight();
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'auto' // スムーススクロールせず即座に移動
        });
      }
    }, 100);
  }

  // 同一ページ内のスムーススクロール
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      
      // #のみの場合はトップへスクロール
      if (targetId === '#') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      
      const targetElement = document.querySelector(targetId);
      scrollToElement(targetElement);
    });
  });
});