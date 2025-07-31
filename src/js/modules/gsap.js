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

    if (mainHeader && stickyNav) {
        let activationPoint = 0;
        let lastScrollY = 0;

        const updateActivationPoint = () => {
            activationPoint = mainHeader.offsetHeight;
        };
        
        // Run initial calculation
        updateActivationPoint();

        ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate: (self) => {
                const currentScrollY = self.scroll();

                // Determine if we are past the main header
                if (currentScrollY > activationPoint) {
                    // We are below the main header, sticky nav can be shown
                    if (self.direction === -1) { // Scrolling UP
                        stickyNav.classList.add('is-visible');
                    } else { // Scrolling DOWN
                        // Only hide if we just passed the activation point going down
                        if (lastScrollY <= activationPoint) {
                             stickyNav.classList.add('is-visible'); // Show it for a moment as we cross
                        } else {
                             stickyNav.classList.remove('is-visible');
                        }
                    }
                } else {
                    // We are in or above the main header, sticky nav must be hidden
                    stickyNav.classList.remove('is-visible');
                }
                lastScrollY = currentScrollY;
            },
            // Recalculate the height on resize/refresh
            onRefresh: updateActivationPoint
        });

        // Ensure the height is correct after all page assets are loaded
        window.addEventListener('load', () => ScrollTrigger.refresh());
    }
});
