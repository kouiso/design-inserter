/**
 * 検索オーバーレイのトグル機能
 * 
 * 虫眼鏡アイコンをクリックすると検索オーバーレイを表示/非表示
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchToggles = document.querySelectorAll('.js-search-toggle');
    const searchOverlay = document.querySelector('.js-search-overlay');
    const searchClose = document.querySelector('.js-search-close');
    const searchInput = document.querySelector('.search-form__input');

    if (!searchOverlay) {
        console.warn('検索オーバーレイが見つかりません');
        return;
    }

    /**
     * オーバーレイを開く
     */
    const openOverlay = () => {
        searchOverlay.classList.add('is-active');
        document.body.style.overflow = 'hidden';
        
        // 入力フィールドにフォーカス
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        }
    };

    /**
     * オーバーレイを閉じる
     */
    const closeOverlay = () => {
        searchOverlay.classList.remove('is-active');
        document.body.style.overflow = '';
    };

    // 虫眼鏡アイコンのクリックイベント
    searchToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            openOverlay();
        });
    });

    // 閉じるボタンのクリックイベント
    if (searchClose) {
        searchClose.addEventListener('click', (e) => {
            e.preventDefault();
            closeOverlay();
        });
    }

    // オーバーレイ背景のクリックで閉じる
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeOverlay();
        }
    });

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('is-active')) {
            closeOverlay();
        }
    });
});
