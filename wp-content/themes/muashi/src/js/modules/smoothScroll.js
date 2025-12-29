document.addEventListener('DOMContentLoaded', () => {
  // CSSのscroll-margin-topを利用するため、
  // JavaScriptではデフォルトの挙動を妨げないようにする
  
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