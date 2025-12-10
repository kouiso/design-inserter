document.addEventListener('DOMContentLoaded', () => {
  initImageViewer();
});

function initImageViewer() {
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
  if (wrapper.hasAttribute('data-image-viewer-initialized')) {
    return;
  }

  wrapper.setAttribute('data-image-viewer-initialized', 'true');

  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('aria-label', '画像を拡大表示');

  const openViewer = () => {
    createOverlay(img);
  };

  wrapper.addEventListener('click', (e) => {
    e.preventDefault();
    openViewer();
  });

  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openViewer();
    }
  });
}

function initZoomAndPan(img, container, zoomLevelDisplay) {
  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const ZOOM_SPEED = 0.1;
  const PINCH_ZOOM_SENSITIVITY = 0.01;
  const DOUBLE_TAP_DELAY = 300;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastDistance = 0;
  let lastTap = 0;

  const getClientCoordinates = (e) => {
    if (e.type.includes('touch')) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const updateTransform = () => {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    img.style.cursor = scale > MIN_SCALE ? 'grab' : 'default';
    
    if (zoomLevelDisplay) {
      zoomLevelDisplay.textContent = `${Math.round(scale * 100)}%`;
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    
    const rect = img.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);
    
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
  };

  const handleDragStart = (e) => {
    if (scale <= MIN_SCALE) return;
    
    isDragging = true;
    img.style.cursor = 'grabbing';
    
    const coords = getClientCoordinates(e);
    startX = coords.x - translateX;
    startY = coords.y - translateY;
    
    e.preventDefault();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const coords = getClientCoordinates(e);
    translateX = coords.x - startX;
    translateY = coords.y - startY;
    
    updateTransform();
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    img.style.cursor = scale > MIN_SCALE ? 'grab' : 'default';
  };

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
        const newScale = Math.min(Math.max(scale + delta * PINCH_ZOOM_SENSITIVITY, MIN_SCALE), MAX_SCALE);
        
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

  const handleDoubleTap = (e) => {
    const now = Date.now();
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      scale = MIN_SCALE;
      translateX = 0;
      translateY = 0;
      updateTransform();
    }
    
    lastTap = now;
  };

  const zoomIn = () => {
    const newScale = Math.min(scale + ZOOM_SPEED, MAX_SCALE);
    if (newScale !== scale) {
      scale = newScale;
      updateTransform();
    }
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - ZOOM_SPEED, MIN_SCALE);
    if (newScale !== scale) {
      scale = newScale;
      if (scale === MIN_SCALE) {
        translateX = 0;
        translateY = 0;
      }
      updateTransform();
    }
  };

  const resetZoom = () => {
    scale = MIN_SCALE;
    translateX = 0;
    translateY = 0;
    updateTransform();
  };

  container.addEventListener('wheel', handleWheel, { passive: false });
  container.addEventListener('mousedown', handleDragStart);
  container.addEventListener('mousemove', handleDragMove);
  container.addEventListener('mouseup', handleDragEnd);
  container.addEventListener('mouseleave', handleDragEnd);
  
  container.addEventListener('touchstart', handleTouchStart, { passive: false });
  container.addEventListener('touchmove', handleTouchMove, { passive: false });
  container.addEventListener('touchend', handleTouchEnd);
  
  img.addEventListener('dblclick', handleDoubleTap);

  updateTransform();

  return {
    zoomIn,
    zoomOut,
    resetZoom
  };
}

function createOverlay(img) {
  const existingOverlay = document.querySelector('.image-viewer-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'image-viewer-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '画像ビューワー');

  const container = document.createElement('div');
  container.className = 'image-viewer-container';

  const viewerImg = document.createElement('img');
  viewerImg.className = 'image-viewer-image';
  viewerImg.src = img.src;
  viewerImg.alt = img.alt || '';

  if (img.srcset) {
    viewerImg.srcset = img.srcset;
    viewerImg.sizes = '100vw';
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'image-viewer-close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';

  const zoomControls = document.createElement('div');
  zoomControls.className = 'image-viewer-zoom-controls';

  const zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'image-viewer-zoom-btn';
  zoomInBtn.setAttribute('type', 'button');
  zoomInBtn.setAttribute('aria-label', 'ズームイン');
  zoomInBtn.innerHTML = '<span aria-hidden="true">+</span>';

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'image-viewer-zoom-btn';
  zoomOutBtn.setAttribute('type', 'button');
  zoomOutBtn.setAttribute('aria-label', 'ズームアウト');
  zoomOutBtn.innerHTML = '<span aria-hidden="true">−</span>';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'image-viewer-zoom-btn';
  resetBtn.setAttribute('type', 'button');
  resetBtn.setAttribute('aria-label', 'ズームリセット');
  resetBtn.innerHTML = '<span aria-hidden="true">1:1</span>';

  zoomControls.appendChild(zoomInBtn);
  zoomControls.appendChild(zoomOutBtn);
  zoomControls.appendChild(resetBtn);

  const zoomLevel = document.createElement('div');
  zoomLevel.className = 'image-viewer-zoom-level';
  zoomLevel.textContent = '100%';

  const hints = document.createElement('div');
  hints.className = 'image-viewer-hints';
  hints.innerHTML = `
    <span class="hint-desktop">マウスホイールでズーム / ドラッグで移動 / ダブルクリックでリセット</span>
    <span class="hint-mobile">ピンチでズーム / ドラッグで移動 / ダブルタップでリセット</span>
  `;

  container.appendChild(viewerImg);
  overlay.appendChild(container);
  overlay.appendChild(closeBtn);
  overlay.appendChild(zoomControls);
  overlay.appendChild(zoomLevel);
  overlay.appendChild(hints);
  document.body.appendChild(overlay);

  const zoomPanControls = initZoomAndPan(viewerImg, container, zoomLevel);

  zoomInBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomPanControls.zoomIn();
  });

  zoomOutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomPanControls.zoomOut();
  });

  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomPanControls.resetZoom();
  });

  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    overlay.classList.add('is-active');
  });

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  const closeOverlay = () => {
    document.removeEventListener('keydown', handleKeydown);

    overlay.classList.remove('is-active');

    const cleanup = () => {
      if (overlay.parentNode) {
        overlay.remove();
      }
      document.body.style.overflow = originalOverflow;
    };

    overlay.addEventListener('transitionend', cleanup, { once: true });

    setTimeout(() => {
      cleanup();
    }, 500);
  };

  closeBtn.addEventListener('click', closeOverlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === container) {
      closeOverlay();
    }
  });

  closeBtn.focus();
}

export { initImageViewer };
