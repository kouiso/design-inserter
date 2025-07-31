import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    const inviewTitles = document.querySelectorAll('.top-section__title-text[data-inview]');
    inviewTitles.forEach(title => {
        const delay = parseFloat(title.dataset.delay) || 0;
        gsap.to(title, {
            '--title-bg-width': '100%',
            duration: 0.6,
            delay: delay,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                once: true
            }
        });
    });

    const colorSchemes = [
        { name: 'red',    mainBg: 'var(--color-red)',    textColor: 'white', titleBg: 'var(--color-orange)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-blue)' },
        { name: 'orange', mainBg: 'var(--color-orange)', textColor: 'black', titleBg: 'var(--color-red)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-yellow)' },
        { name: 'yellow', mainBg: 'var(--color-yellow)', textColor: 'white', titleBg: 'var(--color-red)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-sky)' },
        { name: 'green',  mainBg: 'var(--color-green)',  textColor: 'black', titleBg: 'var(--color-blue)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-red)' },
        { name: 'sky',    mainBg: 'var(--color-sky)',    textColor: 'black', titleBg: 'var(--color-orange)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-pink)' },
        { name: 'blue',   mainBg: 'var(--color-blue)',   textColor: 'white', titleBg: 'var(--color-yellow)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-purple)' },
        { name: 'purple', mainBg: 'var(--color-purple)', textColor: 'black', titleBg: 'var(--color-green)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-orange)' },
        { name: 'pink',   mainBg: 'var(--color-pink)',   textColor: 'white', titleBg: 'var(--color-blue)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-green)' }
    ];

    const colorButtons = document.querySelectorAll('.color-bar__button');
    const sections = document.querySelectorAll('[data-bg-color="changeable"]');
    const colorBarList = document.querySelector('.color-bar');
    
    if (sections.length === 0) return;

    let isAnimating = false;
    let autoChangeTimer = null;
    const AUTO_CHANGE_INTERVAL = 8000;

    const availableColorSchemes = colorSchemes;

    function animateSection(section, scheme, timeline, startTime = 0) {
        const animationDuration = 0.6;
        
        section.dataset.textColor = scheme.textColor;

        const titleTexts = section.querySelectorAll('.top-section__title-text');
        if (titleTexts.length > 0) {
            titleTexts.forEach(titleText => {
                const currentColor = getComputedStyle(titleText).getPropertyValue('--title-bg-color').trim();
        
                timeline
                    .set(titleText, {
                        backgroundColor: currentColor,
                        '--title-bg-width': '0%',
                        '--title-bg-color': scheme.titleBg,
                        '--title-text-color': scheme.titleTextColor,
                    }, startTime)
                    .to(titleText, {
                        '--title-bg-width': '100%',
                        duration: animationDuration,
                        ease: 'power2.inOut',
                        delay: 0.4,
                        onComplete: () => {
                            gsap.set(titleText, { backgroundColor: 'transparent' });
                        }
                    }, startTime);
            });
        }

        const bgElements = [section.querySelector('.js-color-bg')];
        let paths = Array.from(section.querySelectorAll('.js-color-fill'));
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;

        if (section.classList.contains('top-about')) {
            if (!isDesktop) {
                paths = paths.filter(el => !el.closest('.top-about__wave'));
            }
        }

        if (section.classList.contains('top-sustainability')) {
            if (!isDesktop) {
                const aboutWavePaths = document.querySelectorAll('.top-about__wave .js-color-fill');
                aboutWavePaths.forEach(p => {
                    const pathAnimator = p.cloneNode(true);
                    pathAnimator.style.fill = scheme.mainBg;
                    pathAnimator.style.clipPath = 'inset(0 100% 0 0)';
                    p.parentNode.appendChild(pathAnimator);

                    timeline.to(pathAnimator, {
                        clipPath: 'inset(0 0% 0 0)',
                        duration: animationDuration,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            p.style.fill = scheme.mainBg;
                            p.parentNode.removeChild(pathAnimator);
                        }
                    }, startTime);
                });
            }
        }

        if (section.classList.contains('top-kv')) {
            const mainHeader = document.querySelector('.js-header');
            const stickyNav = document.querySelector('.js-header-nav');
            const scrollNav = document.querySelector('.js-header-scroll-nav');
            const mainHeaderBg = mainHeader ? mainHeader.querySelector('.js-color-bg') : null;
            const stickyNavBg = stickyNav ? stickyNav.querySelector('.js-color-bg') : null;
            const scrollNavBg = scrollNav ? scrollNav.querySelector('.js-color-bg') : null;

            if (mainHeaderBg) bgElements.push(mainHeaderBg);
            if (stickyNavBg) bgElements.push(stickyNavBg);
            if (scrollNavBg) bgElements.push(scrollNavBg);
            
            if (mainHeader) mainHeader.dataset.logoColor = scheme.textColor;
            if (stickyNav) stickyNav.dataset.logoColor = scheme.textColor;
            if (scrollNav) scrollNav.dataset.logoColor = scheme.textColor;

            const iconKvPaths = section.querySelectorAll('.top-kv__icon svg path');
            const iconHeaderPaths = mainHeader.querySelectorAll('.header__nav-icon svg path');
            const logoHamburgerPaths = mainHeader.querySelectorAll('.hamburger__icon svg path');
            if (iconKvPaths.length > 0) {
                timeline.to(iconKvPaths, {
                    fill: scheme.iconBg,
                    duration: animationDuration,
                    ease: 'power2.inOut'
                }, startTime);
            }
            if (iconHeaderPaths.length > 0) {
                timeline.to(iconHeaderPaths, {
                    fill: scheme.iconBg,
                    duration: animationDuration,
                    ease: 'power2.inOut'
                }, startTime);
            }
            if (logoHamburgerPaths.length > 0) {
                timeline.to(logoHamburgerPaths, {
                    fill: scheme.iconBg,
                    duration: animationDuration,
                    ease: 'power2.inOut'
                }, startTime);
            }

            const hamburgerPaths = mainHeader.querySelectorAll('.js-header-hamburger .header__hamburger-line');
            if (hamburgerPaths.length > 0) {
                timeline.to(hamburgerPaths, {
                    backgroundColor: scheme.textColor,
                    duration: animationDuration,
                    ease: 'power2.inOut'
                }, startTime);
            }
        }
        
        bgElements.forEach(bgElement => {
            if (!bgElement) return;

            const animator = document.createElement('div');
            animator.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: ${scheme.mainBg}; z-index: 2; clip-path: inset(0 100% 0 0);`;
            bgElement.style.position = 'absolute';
            bgElement.appendChild(animator);

            timeline.to(animator, {
                clipPath: 'inset(0 0% 0 0)',
                duration: animationDuration,
                ease: 'power2.inOut',
                onComplete: () => {
                    bgElement.style.backgroundColor = scheme.mainBg;
                    bgElement.removeChild(animator);
                }
            }, startTime);
        });

        paths.forEach(path => {
            const pathAnimator = path.cloneNode(true);
            pathAnimator.style.fill = scheme.mainBg;
            pathAnimator.style.clipPath = 'inset(0 100% 0 0)';
            path.parentNode.appendChild(pathAnimator);

            timeline.to(pathAnimator, {
                clipPath: 'inset(0 0% 0 0)',
                duration: animationDuration,
                ease: 'power2.inOut',
                onComplete: () => {
                    path.style.fill = scheme.mainBg;
                    path.parentNode.removeChild(pathAnimator);
                }
            }, startTime);
        });
    }

    function shuffleColorBar() {
        const shuffleTimeline = gsap.timeline();
        const items = Array.from(colorBarList.children);
        const shuffleDuration = 0.15;

        shuffleTimeline.to(items, {
            opacity: 0,
            duration: shuffleDuration,
            ease: 'power1.inOut',
            stagger: 0.01,
        })
        .call(() => {
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
            items.forEach(item => colorBarList.appendChild(item));
        })
        .to(items, {
            opacity: 1,
            duration: shuffleDuration,
            ease: 'power1.inOut',
            stagger: 0.01
        });
    }

    function triggerColorChange(specificScheme = null) {
        if (isAnimating) return;
        isAnimating = true;

        const masterTimeline = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
                resetTimer();
            }
        });

        if (specificScheme) {
            const allSections = Array.from(sections);
            const activeSection = document.querySelector('.is-active-section');
            const activeIndex = allSections.findIndex(s => s === activeSection);

            if (activeIndex === -1 || activeSection.dataset.currentColor === specificScheme.mainBg) {
                isAnimating = false;
                resetTimer();
                return;
            }

            const otherSchemes = availableColorSchemes.filter(s => s.mainBg !== specificScheme.mainBg);
            for (let i = otherSchemes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [otherSchemes[i], otherSchemes[j]] = [otherSchemes[j], otherSchemes[i]];
            }
            
            const colorAssignments = new Map();
            const otherSections = allSections.filter(s => s !== activeSection);
            otherSections.forEach((section, index) => {
                let scheme = otherSchemes[index % otherSchemes.length];
                if (scheme.mainBg === section.dataset.currentColor && otherSchemes.length > 1) {
                    const nextIndex = (index + 1) % otherSchemes.length;
                    scheme = otherSchemes[nextIndex];
                }
                colorAssignments.set(section, scheme);
            });

            allSections.forEach((section, index) => {
                const distance = Math.abs(index - activeIndex);
                const startTime = distance * 0.5;
                const scheme = (section === activeSection) ? specificScheme : colorAssignments.get(section);
                if (scheme) {
                    section.dataset.currentColor = scheme.mainBg;
                    animateSection(section, scheme, masterTimeline, startTime);
                }
            });

        } else {
            let shuffledSchemes = [...availableColorSchemes];
            for (let i = shuffledSchemes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledSchemes[i], shuffledSchemes[j]] = [shuffledSchemes[j], shuffledSchemes[i]];
            }

            sections.forEach((section, index) => {
                const currentColor = section.dataset.currentColor;
                let scheme = shuffledSchemes[index % shuffledSchemes.length];
                if (scheme.mainBg === currentColor && shuffledSchemes.length > 1) {
                    const nextIndex = (index + 1) % shuffledSchemes.length;
                    scheme = shuffledSchemes[nextIndex];
                }
                section.dataset.currentColor = scheme.mainBg;
                animateSection(section, scheme, masterTimeline, 0);
            });
        }
        
        shuffleColorBar();
    }

    function runRandomChange() {
        triggerColorChange();
    }

    function resetTimer() {
        clearTimeout(autoChangeTimer);
        autoChangeTimer = setTimeout(runRandomChange, AUTO_CHANGE_INTERVAL);
    }

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            toggleClass: { targets: section, className: "is-active-section" },
        });
    });
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            clearTimeout(autoChangeTimer);
            const colorName = button.dataset.colorName;
            const selectedScheme = availableColorSchemes.find(s => s.name === colorName);
            if (selectedScheme) {
                triggerColorChange(selectedScheme);
            }
        });
    });

    resetTimer();
});