// ==========================================================================
// Expandable Content Component (蛇腹/もっと見る)
// ==========================================================================
// WordPressブロックスタイル「蛇腹（もっと見る）」として使用
// ブロックエディタでテーブルを選択 → スタイル → 「蛇腹（もっと見る）」を選択

document.addEventListener('DOMContentLoaded', () => {
  initExpandable();
});

function initExpandable() {
  // expandable-wrapper を検出
  const wrappers = document.querySelectorAll('.expandable-wrapper');

  wrappers.forEach(wrapper => {
    const target = wrapper.querySelector('.is-style-expandable');
    const button = wrapper.querySelector('.expandable-toggle');

    if (!target || !button) {
      return;
    }

    setupExpandableToggle(button, target);
  });
}

function setupExpandableToggle(button, target) {
  // 既に初期化済みの場合はスキップ
  if (button.hasAttribute('data-expandable-initialized')) {
    return;
  }

  button.setAttribute('data-expandable-initialized', 'true');
  button.setAttribute('aria-expanded', 'false');

  // コンテンツの実際の高さをチェック
  const contentHeight = target.scrollHeight;
  const computedStyle = window.getComputedStyle(target);
  const maxHeight = parseInt(computedStyle.maxHeight, 10);

  // コンテンツが max-height より小さい場合はボタンを非表示
  if (!isNaN(maxHeight) && contentHeight <= maxHeight) {
    button.style.display = 'none';
    target.classList.add('is-expanded');
    return;
  }

  button.addEventListener('click', () => {
    const isExpanded = target.classList.contains('is-expanded');

    if (isExpanded) {
      // 閉じる
      target.classList.remove('is-expanded');
      button.setAttribute('aria-expanded', 'false');

      // スムーズにスクロールして戻る
      const targetRect = target.getBoundingClientRect();
      if (targetRect.top < 0) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // 開く
      target.classList.add('is-expanded');
      button.setAttribute('aria-expanded', 'true');
    }
  });
}

// 動的に追加されたコンテンツ用に再初期化関数をエクスポート
export { initExpandable };
