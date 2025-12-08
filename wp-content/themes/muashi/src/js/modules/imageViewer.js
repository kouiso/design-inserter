// ==========================================================================
// Image Viewer Component (画像ビューワー)
// ==========================================================================
// WordPressブロックスタイル「画像ビューワー」として使用
// ブロックエディタで画像を選択 → スタイル → 「画像ビューワー」を選択

document.addEventListener('DOMContentLoaded', () => {
  initImageViewer();
});

function initImageViewer() {
  // is-style-image-viewer クラスを持つ画像ラッパーを検出
  const viewerTriggers = document.querySelectorAll('.is-style-image-viewer');

  viewerTriggers.forEach(wrapper => {
    const img = wrapper.querySelector('img');

    if (!img) {
      return;
    }

    setupImageViewer(wrapper, img);
  });
}

function setupImageViewer(wrapper, img) {
  // 既に初期化済みの場合はスキップ
  if (wrapper.hasAttribute('data-image-viewer-initialized')) {
    return;
  }

  wrapper.setAttribute('data-image-viewer-initialized', 'true');

  // クリック可能であることを示す属性を追加（スタイルはCSSで定義済み）
  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('aria-label', '画像を拡大表示');

  const openViewer = () => {
    createOverlay(img);
  };

  // クリックで開く
  wrapper.addEventListener('click', (e) => {
    e.preventDefault();
    openViewer();
  });

  // キーボードでも開けるようにする
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openViewer();
    }
  });
}

function createOverlay(img) {
  // 既存のオーバーレイがあれば削除
  const existingOverlay = document.querySelector('.image-viewer-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // オーバーレイを作成
  const overlay = document.createElement('div');
  overlay.className = 'image-viewer-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '画像ビューワー');

  // コンテナを作成
  const container = document.createElement('div');
  container.className = 'image-viewer-container';

  // 拡大画像を作成
  const viewerImg = document.createElement('img');
  viewerImg.className = 'image-viewer-image';
  viewerImg.src = img.src;
  viewerImg.alt = img.alt || '';

  // srcset がある場合、より高解像度の画像を取得
  if (img.srcset) {
    viewerImg.srcset = img.srcset;
    viewerImg.sizes = '100vw';
  }

  // 閉じるボタンを作成
  const closeBtn = document.createElement('button');
  closeBtn.className = 'image-viewer-close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';

  // 要素を追加
  container.appendChild(viewerImg);
  overlay.appendChild(container);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  // スクロールを無効化（インラインスタイルの元の値を保存）
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  // アニメーション用に少し遅延してクラスを追加
  requestAnimationFrame(() => {
    overlay.classList.add('is-active');
  });

  // ESCキーハンドラー
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // 閉じる処理（クリーンアップ含む）
  const closeOverlay = () => {
    // キーボードイベントリスナーを削除
    document.removeEventListener('keydown', handleKeydown);

    overlay.classList.remove('is-active');

    // トランジション終了を待つが、フォールバックも設定
    const cleanup = () => {
      if (overlay.parentNode) {
        overlay.remove();
      }
      document.body.style.overflow = originalOverflow;
    };

    overlay.addEventListener('transitionend', cleanup, { once: true });

    // フォールバック: 500ms後にまだ存在する場合は強制削除
    setTimeout(() => {
      cleanup();
    }, 500);
  };

  // 閉じるボタンのクリック
  closeBtn.addEventListener('click', closeOverlay);

  // オーバーレイのクリック（画像以外の部分）
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === container) {
      closeOverlay();
    }
  });

  // 閉じるボタンにフォーカス
  closeBtn.focus();
}

// 動的に追加されたコンテンツ用に再初期化関数をエクスポート
export { initImageViewer };
