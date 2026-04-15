import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAPにScrollTriggerプラグインを登録
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Inview Animation ---
    // (Omitted for brevity, no changes here)
    const inviewAreas = gsap.utils.toArray('[data-inview-area]');
    inviewAreas.forEach(area => {
        const targets = area.querySelectorAll('[data-inview]');
        const startPosition = area.dataset.inviewArea || '80%';
        ScrollTrigger.matchMedia({
            "(min-width: 768px)": function() {
                ScrollTrigger.create({
                    trigger: area,
                    start: `top ${startPosition}`,
                    onEnter: () => {
                        targets.forEach(target => {
                            const delay = target.dataset.delayMd || target.dataset.delay || 0;
                            gsap.delayedCall(delay, () => target.classList.add('is-inview'));
                        });
                    },
                    once: true
                });
            },
            "(max-width: 767px)": function() {
                ScrollTrigger.create({
                    trigger: area,
                    start: `top ${startPosition}`,
                    onEnter: () => {
                        targets.forEach(target => {
                            const delay = target.dataset.delay || 0;
                            gsap.delayedCall(delay, () => target.classList.add('is-inview'));
                        });
                    },
                    once: true
                });
            }
        });
    });

    // --- Header Animation ---
    const mainHeader = document.querySelector('.js-header');
    const stickyNav = document.querySelector('.js-header-scroll-nav');
    const subLogo = document.querySelector('.header__sub-logo'); // EST.1958
    const topKvNav = document.querySelector('.top-kv__nav'); // KV下メニュー（ホームのみ）
    const isHomePage = mainHeader && mainHeader.classList.contains('is-home');

    // TOPページ以外ではスクロール制御をスキップ（ヘッダーは常に表示）
    if (!isHomePage) {
        return;
    }

    if (mainHeader && stickyNav) {
        ScrollTrigger.matchMedia({
            "(min-width: 768px)": function() {
                let activationPoint = 0;

                const updateActivationPoint = () => {
                    // EST.1958の下端を閾値にする
                    if (subLogo) {
                        activationPoint = subLogo.offsetTop + subLogo.offsetHeight;
                    } else {
                        activationPoint = mainHeader.offsetHeight;
                    }
                };

                // Run initial calculation
                updateActivationPoint();

                ScrollTrigger.create({
                    start: 0,
                    end: "max",
                    onUpdate: (self) => {
                        const currentScrollY = self.scroll();

                        // EST.1958が見えなくなったかどうかで判定（スクロール方向は関係なし）
                        if (currentScrollY > activationPoint) {
                            // スティッキーナビ表示（出したまま固定）
                            stickyNav.classList.add('is-visible');
                            // KV下メニュー非表示
                            if (topKvNav) topKvNav.classList.add('is-hidden');
                        } else {
                            // 一番上に戻ったら非表示
                            stickyNav.classList.remove('is-visible');
                            // KV下メニュー表示
                            if (topKvNav) topKvNav.classList.remove('is-hidden');
                        }
                    },
                    // Recalculate the height on resize/refresh
                    onRefresh: updateActivationPoint
                });

                // Return a cleanup function
                return () => {
                    stickyNav.classList.remove('is-visible');
                    if (topKvNav) topKvNav.classList.remove('is-hidden');
                };
            }
        });

        // Ensure the height is correct after all page assets are loaded
        window.addEventListener('load', () => ScrollTrigger.refresh());
    }
});
