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

function initZoomAndPan(img, container) {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastDistance = 0;

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const ZOOM_SPEED = 0.1;

  const updateTransform = () => {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    img.style.cursor = scale > MIN_SCALE ? 'grab' : 'default';
  };

  // マウスホイールズーム
  const handleWheel = (e) => {
    e.preventDefault();
    
    const rect = img.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);
    
    if (newScale !== scale) {
      // ズーム中心を維持するための座標調整
      const scaleChange = newScale / scale;
      translateX = offsetX - (offsetX - translateX) * scaleChange;
      translateY = offsetY - (offsetY - translateY) * scaleChange;
      scale = newScale;
      
      // スケールが1に戻ったら位置をリセット
      if (scale === MIN_SCALE) {
        translateX = 0;
        translateY = 0;
      }
      
      updateTransform();
    }
  };

  // ドラッグ開始
  const handleDragStart = (e) => {
    if (scale <= MIN_SCALE) return;
    
    isDragging = true;
    img.style.cursor = 'grabbing';
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    startX = clientX - translateX;
    startY = clientY - translateY;
    
    e.preventDefault();
  };

  // ドラッグ中
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    translateX = clientX - startX;
    translateY = clientY - startY;
    
    updateTransform();
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    img.style.cursor = scale > MIN_SCALE ? 'grab' : 'default';
  };

  // ピンチズーム
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    } else if (e.touches.length === 1) {
      handleDragStart(e);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (lastDistance > 0) {
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        const rect = img.getBoundingClientRect();
        const offsetX = centerX - rect.left;
        const offsetY = centerY - rect.top;
        
        const delta = distance - lastDistance;
        const newScale = Math.min(Math.max(scale + delta * 0.01, MIN_SCALE), MAX_SCALE);
        
        if (newScale !== scale) {
          const scaleChange = newScale / scale;
          translateX = offsetX - (offsetX - translateX) * scaleChange;
          translateY = offsetY - (offsetY - translateY) * scaleChange;
          scale = newScale;
          
          if (scale === MIN_SCALE) {
            translateX = 0;
            translateY = 0;
          }
          
          updateTransform();
        }
      }
      
      lastDistance = distance;
    } else if (e.touches.length === 1) {
      handleDragMove(e);
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      lastDistance = 0;
    }
    if (e.touches.length === 0) {
      handleDragEnd();
    }
  };

  // ダブルクリック/ダブルタップでズームリセット
  let lastTap = 0;
  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      scale = MIN_SCALE;
      translateX = 0;
      translateY = 0;
      updateTransform();
    }
    
    lastTap = now;
  };

  // イベントリスナーを追加
  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('mousedown', handleDragStart);
  container.addEventListener('mousemove', handleDragMove);
  container.addEventListener('mouseup', handleDragEnd);
  container.addEventListener('mouseleave', handleDragEnd);
  
  container.addEventListener('touchstart', handleTouchStart, { passive: false });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd);
  
  img.addEventListener('dblclick', handleDoubleTap);
  img.addEventListener('click', handleDoubleTap);

  // 初期化
  updateTransform();
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

  // ズーム・パン機能を初期化
  initZoomAndPan(viewerImg, container);

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
