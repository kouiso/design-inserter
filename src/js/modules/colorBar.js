import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initializeColorBar() {
    const inviewTitles = document.querySelectorAll('.top-section__title-text[data-inview]');
    inviewTitles.forEach(title => {
        const delay = parseFloat(title.dataset.delay) || 0;
        gsap.to(title, {
            '--title-bg-width': '100%',
            duration: 1,
            delay: delay,
            ease: 'power4.inOut',
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

    sections.forEach(section => {
        const bg = section.querySelector('.js-color-bg');
        if (bg) {
            const color = getComputedStyle(bg).backgroundColor;
            section.dataset.currentColor = color;
            
            // Apply the section's color to its wave divs on initialization
            const waveDivs = section.querySelectorAll('.wave__sp, .wave__pc');
            waveDivs.forEach(div => {
                div.style.backgroundColor = color;
            });
        }
    });

    let isAnimating = false;
    let autoChangeTimer = null;
    const AUTO_CHANGE_INTERVAL = 8000;

    const availableColorSchemes = colorSchemes;

    function animateSection(section, scheme, timeline, startTime = 0) {
        const animationDuration = 1.2;
        
        section.dataset.textColor = scheme.textColor;

        // Animate title reveal
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
                        ease: 'power4.inOut',
                        delay: 0.4,
                        onComplete: () => {
                            gsap.set(titleText, { backgroundColor: 'transparent' });
                        }
                    }, startTime);
            });
        }

        // --- Animate Backgrounds and new Wave Divs ---
        const bgElements = [section.querySelector('.js-color-bg')];
        const waveDivs = section.querySelectorAll('.wave__sp, .wave__pc');
        if (waveDivs.length > 0) {
            bgElements.push(...waveDivs);
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
        }
        
        bgElements.forEach(bgElement => {
            if (!bgElement) return;

            let currentBgColor = getComputedStyle(bgElement).backgroundColor;
            
            bgElement.style.background = `linear-gradient(to right, ${scheme.mainBg} 0%, ${scheme.mainBg} 25%, ${currentBgColor} 75%, ${currentBgColor} 100%)`;
            bgElement.style.backgroundSize = '400% 100%';
            bgElement.style.backgroundPosition = '100% 0';

            timeline.to(bgElement, {
                backgroundPosition: '0% 0',
                duration: animationDuration,
                ease: 'none',
                onComplete: () => {
                    bgElement.style.background = scheme.mainBg;
                    bgElement.style.backgroundSize = '';
                    bgElement.style.backgroundPosition = '';
                }
            }, startTime);
        });

        // --- Animate Icons and other UI ---
        if (section.classList.contains('top-kv')) {
            const mainHeader = document.querySelector('.js-header');
            const iconKvPaths = section.querySelectorAll('.top-kv__icon svg path');
            const iconHeaderPaths = mainHeader.querySelectorAll('.header__nav-icon svg path');
            const logoHamburgerPaths = mainHeader.querySelectorAll('.hamburger__icon svg path');
            
            if (iconKvPaths.length > 0) {
                const currentIconColor = getComputedStyle(iconKvPaths[0]).fill;
                timeline.fromTo(iconKvPaths, {
                    fill: currentIconColor
                }, {
                    fill: scheme.iconBg,
                    duration: animationDuration,
                    ease: 'none'
                }, startTime);
            }
            if (iconHeaderPaths.length > 0) {
                const currentHeaderIconColor = getComputedStyle(iconHeaderPaths[0]).fill;
                timeline.fromTo(iconHeaderPaths, {
                    fill: currentHeaderIconColor
                }, {
                    fill: scheme.iconBg,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }
            if (logoHamburgerPaths.length > 0) {
                const currentHamburgerIconColor = getComputedStyle(logoHamburgerPaths[0]).fill;
                timeline.fromTo(logoHamburgerPaths, {
                    fill: currentHamburgerIconColor
                }, {
                    fill: scheme.iconBg,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }

            const hamburgerPaths = mainHeader.querySelectorAll('.js-header-hamburger .header__hamburger-line');
            if (hamburgerPaths.length > 0) {
                timeline.to(hamburgerPaths, {
                    backgroundColor: scheme.textColor,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }
        }
    }

    function shuffleColorBar() {
        const shuffleTimeline = gsap.timeline();
        const items = Array.from(colorBarList.children);
        const totalDuration = 2.4; // Extended from 1.6s to 2.4s
        
        // Phase 1: Fade out all items at once (0.3s)
        shuffleTimeline.to(items, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            stagger: 0
        })
        // Shuffle the DOM order during the hidden state
        .call(() => {
            // Only shuffle DOM order, don't change colors yet
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
            items.forEach(item => colorBarList.appendChild(item));
        })
        // Phase 2: Stagger appearance randomly (0.8s total)
        .call(() => {
            const randomItems = [...items].sort(() => Math.random() - 0.5);
            gsap.to(randomItems, {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
                stagger: {
                    each: 0.8 / items.length,
                    from: 'random'
                }
            });
        }, null, '+=0.1') // Small pause after fade out
        // Phase 3: Start color changes after all items are visible
        .call(() => {
            // First round of color changes
            const shuffledSchemes1 = [...availableColorSchemes].sort(() => Math.random() - 0.5);
            items.forEach((item, index) => {
                const delay = Math.random() * 0.4; // Delay between 0s - 0.4s
                const button = item.querySelector('.color-bar__button');
                if (button) {
                    const currentColor = getComputedStyle(button).backgroundColor;
                    const newScheme = shuffledSchemes1[index % shuffledSchemes1.length];
                    
                    gsap.fromTo(button, {
                        backgroundColor: currentColor
                    }, {
                        backgroundColor: newScheme.mainBg,
                        duration: 0.8,
                        delay: delay,
                        ease: 'none',
                        onComplete: () => {
                            button.dataset.colorName = newScheme.name;
                        }
                    });
                }
            });
            
            // Second round of color changes
            const shuffledSchemes2 = [...availableColorSchemes].sort(() => Math.random() - 0.5);
            items.forEach((item, index) => {
                const delay = Math.random() * 0.4 + 1.2; // Delay between 1.2s - 1.6s
                const button = item.querySelector('.color-bar__button');
                if (button) {
                    const newScheme = shuffledSchemes2[(index + 3) % shuffledSchemes2.length];
                    
                    // Get the color after first animation (delayed to ensure first animation has started)
                    setTimeout(() => {
                        const currentColor = getComputedStyle(button).backgroundColor;
                        gsap.fromTo(button, {
                            backgroundColor: currentColor
                        }, {
                            backgroundColor: newScheme.mainBg,
                            duration: 0.8,
                            ease: 'none',
                            onComplete: () => {
                                button.dataset.colorName = newScheme.name;
                            }
                        });
                    }, delay * 1000);
                }
            });
        }, null, '+=0.8'); // Wait for Phase 2 to complete (0.8s)
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

        const allSections = Array.from(sections);
        const activeSection = document.querySelector('.is-active-section');
        const activeIndex = allSections.findIndex(s => s === activeSection);

        // If no section is active, do a simple random shuffle for all sections at once
        if (activeIndex === -1) {
            let shuffledSchemes = [...availableColorSchemes];
            for (let i = shuffledSchemes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledSchemes[i], shuffledSchemes[j]] = [shuffledSchemes[j], shuffledSchemes[i]];
            }
            sections.forEach((section, index) => {
                const currentColor = section.dataset.currentColor;
                let scheme = shuffledSchemes[index % shuffledSchemes.length];
                if (scheme.mainBg === currentColor && shuffledSchemes.length > 1) {
                    scheme = shuffledSchemes[(index + 1) % shuffledSchemes.length];
                }
                section.dataset.currentColor = scheme.mainBg;
                animateSection(section, scheme, masterTimeline, 0);
            });

            shuffleColorBar();
            return;
        }
        
        // Determine the target color for the active section
        let targetSchemeForActiveSection;
        if (specificScheme) { // A button was clicked
            if (activeSection.dataset.currentColor === specificScheme.mainBg) {
                isAnimating = false; // color is already active, do nothing
                resetTimer();
                return;
            }
            targetSchemeForActiveSection = specificScheme;
        } else { // 8-second timer triggered the change
            const currentActiveColor = activeSection.dataset.currentColor;
            let newPossibleSchemes = availableColorSchemes.filter(s => s.mainBg !== currentActiveColor);
            targetSchemeForActiveSection = newPossibleSchemes[Math.floor(Math.random() * newPossibleSchemes.length)];
        }

        // Determine colors for other sections
        const otherSchemes = availableColorSchemes.filter(s => s.mainBg !== targetSchemeForActiveSection.mainBg);
        for (let i = otherSchemes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherSchemes[i], otherSchemes[j]] = [otherSchemes[j], otherSchemes[i]];
        }
        
        const colorAssignments = new Map();
        const otherSections = allSections.filter(s => s !== activeSection);
        otherSections.forEach((section, index) => {
            let scheme = otherSchemes[index % otherSchemes.length];
            if (scheme.mainBg === section.dataset.currentColor && otherSchemes.length > 1) {
                scheme = otherSchemes[(index + 1) % otherSchemes.length];
            }
            colorAssignments.set(section, scheme);
        });

        // Animate all sections with the staggered delay
        allSections.forEach((section, index) => {
            const distance = Math.abs(index - activeIndex);
            const startTime = distance * 0.5;
            const scheme = (section === activeSection) ? targetSchemeForActiveSection : colorAssignments.get(section);
            if (scheme) {
                section.dataset.currentColor = scheme.mainBg;
                animateSection(section, scheme, masterTimeline, startTime);
            }
        });
        
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
}