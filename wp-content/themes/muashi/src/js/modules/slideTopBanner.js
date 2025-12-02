import Splide from '@splidejs/splide';

document.addEventListener('DOMContentLoaded', () => {
    // トップバナースライダーの要素を取得
    const topBannerElement = document.querySelector('.js-top-banner-splide');
    
    // トップバナースライダーが存在する場合のみ初期化
    if (topBannerElement) {
        const topBannerSlider = new Splide(topBannerElement, {
            // スライダーの基本設定
            type: 'loop',      // フェードアニメーション
            speed: 1000,        // スライド切り替え速度（ミリ秒）
            focus: 'center',
            
            // 自動再生設定
            autoplay: true,    // 自動再生を有効
            interval: 5000,    // 5秒ごとにスライド切り替え
            pauseOnHover: true,  // ホバー時に一時停止
            pauseOnFocus: true,  // フォーカス時に一時停止
            
            // ナビゲーション設定
            keyboard: true,    // キーボードナビゲーション
            arrows: false,      // 矢印ナビゲーション
            pagination: true,  // ページネーション

            // サイズ
            fixedWidth: 'calc(251 / 375 * 100vw)',
            gap: 'calc(18 / 375 * 100vw)',
            
            // レスポンシブ設定
            mediaQuery: 'min',
            breakpoints: {
                768: {
                    fixedWidth: 'min(594px, calc(594 / 1440 * 100vw))',
                    gap: 'min(42px, calc(42 / 1440 * 100vw))',
                }
            },
        });

        // スライダーの初期化
        topBannerSlider.mount();

        // エラーハンドリング
        topBannerSlider.on('error', (error) => {
            console.error('Splideスライダーエラー:', error);
        });
    }
});
