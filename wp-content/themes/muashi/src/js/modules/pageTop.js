/**
 * ページトップに戻るボタンの表示制御
 *
 * 機能:
 * - スクロール量300px以上で.is-visibleクラスを付与してボタン表示
 * - throttle処理でパフォーマンス最適化
 * - smoothScroll.jsのページトップスクロール機能を活用
 */

document.addEventListener('DOMContentLoaded', () => {
  const pageTopButton = document.querySelector('.js-page-top');

  // ボタンが存在しない場合は処理を中断
  if (!pageTopButton) {
    return;
  }

  // スクロール閾値（この値以上スクロールしたらボタン表示）
  const SCROLL_THRESHOLD = 300;

  // throttle用のタイマーID
  let scrollTimer = null;

  /**
   * スクロール量に応じてボタンの表示/非表示を切り替え
   */
  const togglePageTopButton = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > SCROLL_THRESHOLD) {
      pageTopButton.classList.add('is-visible');
    } else {
      pageTopButton.classList.remove('is-visible');
    }
  };

  /**
   * throttle処理されたスクロールハンドラ
   * 既存コードのresizeイベント処理（smoothScroll.js 18-23行目）と同様のパターン
   */
  const handleScroll = () => {
    // 既存のタイマーをクリア
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer);
    }

    // 150ms待機してからボタン表示/非表示を実行
    scrollTimer = setTimeout(() => {
      togglePageTopButton();
      scrollTimer = null;
    }, 150);
  };

  // 初期状態の設定（ページ読み込み時）
  togglePageTopButton();

  // スクロールイベントの監視
  window.addEventListener('scroll', handleScroll, { passive: true });

  // 補足: クリックイベントは不要
  // smoothScroll.js（32-38行目）が既に href="#" のページトップスクロールを処理済み
});
