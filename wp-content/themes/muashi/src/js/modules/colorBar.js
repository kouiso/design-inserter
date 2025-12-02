import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initializeColorBar() {
    // Initial scroll trigger animation for title backgrounds with clip-path
    const inviewTitleBgs = document.querySelectorAll('.top-section__title-bg[data-inview]');
    inviewTitleBgs.forEach(titleBg => {
        const delay = parseFloat(titleBg.dataset.delay) || 0;
        const svgElement = titleBg.querySelector('svg');
        
        if (svgElement) {
            // Set initial clip-path
            gsap.set(svgElement, {
                clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
            });
            
            // Animate clip-path on scroll
            gsap.to(svgElement, {
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                duration: 1,
                delay: delay,
                ease: 'power4.inOut',
                scrollTrigger: {
                    trigger: titleBg,
                    start: 'top 85%',
                    once: true,
                    onEnter: () => {
                        titleBg.classList.add('is-inview');
                    }
                }
            });
        }
    });

    const colorSchemes = [
        { name: 'red',    mainBg: 'var(--color-red)',    textColor: 'white', pageNavigationTextColor: 'var(--color-black)', titleBg: 'var(--color-orange)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-blue)', footerIconBg: 'var(--color-blue)' },
        { name: 'orange', mainBg: 'var(--color-orange)', textColor: 'black', pageNavigationTextColor: 'var(--color-white)', titleBg: 'var(--color-red)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-yellow)', footerIconBg: 'var(--color-yellow)' },
        { name: 'yellow', mainBg: 'var(--color-yellow)', textColor: 'white', pageNavigationTextColor: 'var(--color-white)', titleBg: 'var(--color-red)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-sky)', footerIconBg: 'var(--color-blue)' },
        { name: 'green',  mainBg: 'var(--color-green)',  textColor: 'black', pageNavigationTextColor: 'var(--color-white)', titleBg: 'var(--color-blue)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-red)', footerIconBg: 'var(--color-red)' },
        { name: 'sky',    mainBg: 'var(--color-sky)',    textColor: 'black', pageNavigationTextColor: 'var(--color-black)',titleBg: 'var(--color-orange)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-pink)', footerIconBg: 'var(--color-pink)' },
        { name: 'blue',   mainBg: 'var(--color-blue)',   textColor: 'white', pageNavigationTextColor: 'var(--color-white)',titleBg: 'var(--color-yellow)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-purple)', footerIconBg: 'var(--color-pink)' },
        { name: 'purple', mainBg: 'var(--color-purple)', textColor: 'black', pageNavigationTextColor: 'var(--color-black)',titleBg: 'var(--color-green)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-orange)', footerIconBg: 'var(--color-orange)' },
        { name: 'pink',   mainBg: 'var(--color-pink)',   textColor: 'white', pageNavigationTextColor: 'var(--color-white)',titleBg: 'var(--color-blue)', titleTextColor: 'var(--color-white)', iconBg: 'var(--color-green)', footerIconBg: 'var(--color-green)' }
    ];

    const colorButtons = document.querySelectorAll('.color-bar__button');
    const sections = document.querySelectorAll('[data-bg-color="changeable"]');
    const colorBarList = document.querySelector('.color-bar');
    const pageElement = document.querySelector('.page'); // Check for subpage
    const pageTitle = document.querySelector('.js-page-title');
    const pageTitleMediaQuery = (typeof window !== 'undefined' && window.matchMedia)
        ? window.matchMedia('(max-width: 1024px)')
        : null;

    let colorResolverElement = null;
    const resolveColorValue = (value) => {
        if (!value || typeof document === 'undefined') return value;
        const trimmedValue = value.trim();
        if (!trimmedValue.startsWith('var(')) return trimmedValue;
        if (!colorResolverElement) {
            colorResolverElement = document.createElement('div');
            colorResolverElement.style.display = 'none';
            document.body.appendChild(colorResolverElement);
        }
        colorResolverElement.style.color = '';
        colorResolverElement.style.color = trimmedValue;
        const computed = getComputedStyle(colorResolverElement).color;
        return computed || trimmedValue;
    };

    if (pageTitle && !pageTitle.dataset.initialInlineColor) {
        pageTitle.dataset.initialInlineColor = pageTitle.style.color || '';
    }

    const updatePageTitleColorForViewport = (media) => {
        if (!pageTitle) return;
        if (!media) return;
        const matches = media.matches;

        gsap.killTweensOf(pageTitle, 'color');

        if (matches) {
            if (pageTitle.dataset.mobileColor) {
                pageTitle.style.color = pageTitle.dataset.mobileColor;
            }
        } else {
            pageTitle.style.color = pageTitle.dataset.initialInlineColor || '';
        }
    };

    if (pageTitle && pageTitleMediaQuery && !pageTitle.dataset.mediaListenerAttached) {
        const handleMediaChange = (event) => updatePageTitleColorForViewport(event);
        if (pageTitleMediaQuery.addEventListener) {
            pageTitleMediaQuery.addEventListener('change', handleMediaChange);
        } else if (pageTitleMediaQuery.addListener) {
            pageTitleMediaQuery.addListener(handleMediaChange);
        }
        pageTitle.dataset.mediaListenerAttached = 'true';
        updatePageTitleColorForViewport(pageTitleMediaQuery);
    }
    
    // Continue if either sections exist or we're on a subpage
    if (sections.length === 0 && !pageElement) return;

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
    let isColorBarAnimating = false; // Add flag for color bar animation
    let autoChangeTimer = null;
    const AUTO_CHANGE_INTERVAL = 8000;

    const availableColorSchemes = colorSchemes;

    function animateSection(section, scheme, timeline, startTime = 0) {
        const animationDuration = 1.2;
        
        section.dataset.textColor = scheme.textColor;

        // Animate title reveal (SVG)
        const titleWrappers = section.querySelectorAll('.top-section__title-wrapper');
        if (titleWrappers.length > 0) {
            titleWrappers.forEach(wrapper => {
                // Title text SVG paths
                const titleTextPaths = wrapper.querySelectorAll('.top-section__title-text svg path');
                // Title background SVG rect - get all rect elements, not just the first
                const titleBgRects = wrapper.querySelectorAll('.top-section__title-bg svg rect');
                
                if (titleTextPaths.length > 0) {
                    const currentTextColor = getComputedStyle(titleTextPaths[0]).fill || 'white';
                    timeline.fromTo(titleTextPaths, {
                        fill: currentTextColor
                    }, {
                        fill: scheme.titleTextColor,
                        duration: animationDuration,
                        ease: 'power4.inOut',
                        delay: 0.4
                    }, startTime);
                }
                
                if (titleBgRects.length > 0) {
                    titleBgRects.forEach(rect => {
                        const currentBgColor = getComputedStyle(rect).fill || '#FFC194';
                        const parentSvg = rect.closest('svg');
                        const titleBg = wrapper.querySelector('.top-section__title-bg');
                        
                        // Check if this element has already been revealed with clip-path
                        const isInview = titleBg && titleBg.classList.contains('is-inview');
                        
                        if (parentSvg) {
                            if (isInview || !titleBg.hasAttribute('data-inview')) {
                                // If already visible or no inview animation, use color transition
                                const newRect = rect.cloneNode(true);
                                newRect.style.fill = scheme.titleBg;
                                parentSvg.appendChild(newRect);
                                
                                // Use clip-path for color transition to maintain consistency
                                timeline.fromTo(newRect, {
                                    clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
                                }, {
                                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                                    duration: 0.6,
                                    ease: 'power4.inOut',
                                    delay: 0.4,
                                    onComplete: () => {
                                        rect.style.fill = scheme.titleBg;
                                        if (newRect.parentNode) {
                                            newRect.parentNode.removeChild(newRect);
                                        }
                                    }
                                }, startTime);
                            } else {
                                // If not yet visible, just update the color for when it appears
                                rect.style.fill = scheme.titleBg;
                            }
                        }
                    });
                }
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
        
        // --- Animate footer icon for top-news section ---
        if (section.classList.contains('top-news')) {
            const footerIconPaths = document.querySelectorAll('.footer__icon svg path');
            if (footerIconPaths.length > 0) {
                const currentFooterIconColor = getComputedStyle(footerIconPaths[0]).fill;
                timeline.fromTo(footerIconPaths, {
                    fill: currentFooterIconColor
                }, {
                    fill: scheme.footerIconBg,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }
        }
    }

    function animatePageColors(scheme, timeline, startTime = 0) {
        const animationDuration = 1.2;
        
        // Get a different scheme for the header that doesn't conflict with navigation__inner
        const schemeIndex = availableColorSchemes.findIndex(s => s.name === scheme.name);
        let headerScheme;
        
        // Find a header scheme where mainBg and iconBg don't match navigation's titleBg
        for (let i = 1; i < availableColorSchemes.length; i++) {
            const candidateScheme = availableColorSchemes[(schemeIndex + i) % availableColorSchemes.length];
            if (candidateScheme.mainBg !== scheme.titleBg && candidateScheme.iconBg !== scheme.titleBg) {
                headerScheme = candidateScheme;
                break;
            }
        }
        
        // Fallback to next scheme if no suitable scheme found
        if (!headerScheme) {
            headerScheme = availableColorSchemes[(schemeIndex + 1) % availableColorSchemes.length];
        }
        
        // Animate page__bg-main
        const pageBgMain = document.querySelector('.page__bg-main');
        if (pageBgMain) {
            const currentMainColor = getComputedStyle(pageBgMain).backgroundColor;
            timeline.fromTo(pageBgMain, {
                backgroundColor: currentMainColor
            }, {
                backgroundColor: scheme.mainBg,
                duration: animationDuration,
                ease: 'power4.inOut'
            }, startTime);
        }
        
        // Animate page__bg-sub
        const pageBgSub = document.querySelector('.page__bg-sub');
        if (pageBgSub) {
            const currentSubColor = getComputedStyle(pageBgSub).backgroundColor;
            timeline.fromTo(pageBgSub, {
                backgroundColor: currentSubColor
            }, {
                backgroundColor: scheme.titleBg,
                duration: animationDuration,
                ease: 'power4.inOut'
            }, startTime);
        }
        
        // Animate navigation__inner to titleBg color and text color with gradient
        const navigationInner = document.querySelector('.navigation__inner');
        if (navigationInner) {
            const currentNavColor = getComputedStyle(navigationInner).backgroundColor;
            const currentTextColor = getComputedStyle(navigationInner).color;
            
            // Apply gradient background like other elements
            navigationInner.style.background = `linear-gradient(to right, ${scheme.titleBg} 0%, ${scheme.titleBg} 25%, ${currentNavColor} 75%, ${currentNavColor} 100%)`;
            navigationInner.style.backgroundSize = '400vw 100%';
            navigationInner.style.backgroundPosition = '100% 0';
            const resolvedNavigationTextColor = resolveColorValue(scheme.pageNavigationTextColor);
            
            timeline.to(navigationInner, {
                backgroundPosition: '0% 0',
                color: resolvedNavigationTextColor,
                duration: animationDuration,
                ease: 'none',
                onComplete: () => {
                    navigationInner.style.background = scheme.titleBg;
                    navigationInner.style.backgroundSize = '';
                    navigationInner.style.backgroundPosition = '';
                }
            }, startTime);
        }
        
        if (pageTitle) {
            const resolvedPageTitleColor = resolveColorValue(scheme.pageNavigationTextColor);
            pageTitle.dataset.mobileColor = resolvedPageTitleColor;

            if (pageTitleMediaQuery && pageTitleMediaQuery.matches) {
                timeline.to(pageTitle, {
                    color: resolvedPageTitleColor,
                    duration: animationDuration,
                    ease: 'none'
                }, startTime);
            } else {
                const initialColor = pageTitle.dataset.initialInlineColor || '';
                gsap.killTweensOf(pageTitle, 'color');
                pageTitle.style.color = initialColor;
                timeline.add(() => {
                    pageTitle.style.color = initialColor;
                }, startTime);
            }
        }
        
        // Animate page__kv-icon
        const pageKvIconPaths = document.querySelectorAll('.page__kv-icon svg path');
        if (pageKvIconPaths.length > 0) {
            const currentIconColor = getComputedStyle(pageKvIconPaths[0]).fill;
            timeline.fromTo(pageKvIconPaths, {
                fill: currentIconColor
            }, {
                fill: scheme.iconBg,
                duration: animationDuration,
                ease: 'power4.inOut'
            }, startTime);
        }
        
        // Animate footer__icon for subpages
        const footerIconPaths = document.querySelectorAll('.footer__icon svg path');
        if (footerIconPaths.length > 0) {
            const currentFooterIconColor = getComputedStyle(footerIconPaths[0]).fill;
            timeline.fromTo(footerIconPaths, {
                fill: currentFooterIconColor
            }, {
                fill: scheme.footerIconBg,
                duration: animationDuration,
                ease: 'power4.inOut'
            }, startTime);
        }
        
        // Update all headers with different color scheme (like TOP page does with KV section)
        const mainHeader = document.querySelector('.js-header');
        const stickyNav = document.querySelector('.js-header-nav');
        const scrollNav = document.querySelector('.js-header-scroll-nav');
        
        // Collect ALL header__bg.js-color-bg elements
        const allHeaderBgs = document.querySelectorAll('.header__bg.js-color-bg');
        const headerBgs = Array.from(allHeaderBgs);
        
        // Set logo colors for headers
        if (mainHeader) {
            mainHeader.dataset.logoColor = headerScheme.textColor;
        }
        if (stickyNav) {
            stickyNav.dataset.logoColor = headerScheme.textColor;
        }
        if (scrollNav) {
            scrollNav.dataset.logoColor = headerScheme.textColor;
        }
        
        // Use gradient animation like TOP page
        headerBgs.forEach(bgElement => {
            if (bgElement) {
                const currentBgColor = getComputedStyle(bgElement).backgroundColor;
                
                bgElement.style.background = `linear-gradient(to right, ${headerScheme.mainBg} 0%, ${headerScheme.mainBg} 25%, ${currentBgColor} 75%, ${currentBgColor} 100%)`;
                bgElement.style.backgroundSize = '400% 100%';
                bgElement.style.backgroundPosition = '100% 0';
                
                timeline.to(bgElement, {
                    backgroundPosition: '0% 0',
                    duration: animationDuration,
                    ease: 'none',
                    onComplete: () => {
                        bgElement.style.background = headerScheme.mainBg;
                        bgElement.style.backgroundSize = '';
                        bgElement.style.backgroundPosition = '';
                    }
                }, startTime);
            }
        });
        
        // Update header icon colors
        if (mainHeader) {
            const iconHeaderPaths = mainHeader.querySelectorAll('.header__nav-icon svg path');
            const logoHamburgerPaths = mainHeader.querySelectorAll('.hamburger__icon svg path');
            
            if (iconHeaderPaths.length > 0) {
                const currentHeaderIconColor = getComputedStyle(iconHeaderPaths[0]).fill;
                timeline.fromTo(iconHeaderPaths, {
                    fill: currentHeaderIconColor
                }, {
                    fill: headerScheme.iconBg,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }
            
            if (logoHamburgerPaths.length > 0) {
                const currentHamburgerIconColor = getComputedStyle(logoHamburgerPaths[0]).fill;
                timeline.fromTo(logoHamburgerPaths, {
                    fill: currentHamburgerIconColor
                }, {
                    fill: headerScheme.iconBg,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }
            
            const hamburgerLines = mainHeader.querySelectorAll('.js-header-hamburger .header__hamburger-line');
            if (hamburgerLines.length > 0) {
                timeline.to(hamburgerLines, {
                    backgroundColor: headerScheme.textColor,
                    duration: animationDuration,
                    ease: 'power4.inOut'
                }, startTime);
            }
        }
    }

    function shuffleColorBar() {
        const items = Array.from(colorBarList.children);
        isColorBarAnimating = true; // Start color bar animation
        
        // Track completion of all animations
        let animationsCompleted = 0;
        const totalAnimations = items.length * 5; // 5 rounds × number of items
        
        const checkAnimationComplete = () => {
            animationsCompleted++;
            if (animationsCompleted >= totalAnimations) {
                isColorBarAnimating = false; // End color bar animation
            }
        };
        
        // Pre-calculate all 5 rounds to ensure no duplicates
        // Each round will have all 8 colors distributed across 8 buttons
        const rounds = [];
        
        for (let round = 0; round < 5; round++) {
            // Shuffle colors for this round
            const shuffled = [...availableColorSchemes].sort(() => Math.random() - 0.5);
            
            // Ensure each button gets a different color than its previous round
            if (round > 0) {
                const prevRound = rounds[round - 1];
                const needsReshuffle = [];
                
                // Check if any button would get the same color as previous round
                for (let i = 0; i < items.length && i < shuffled.length; i++) {
                    if (shuffled[i].name === prevRound[i].name) {
                        needsReshuffle.push(i);
                    }
                }
                
                // Swap positions to ensure colors change
                needsReshuffle.forEach(idx => {
                    // Find a different position to swap with
                    const swapIdx = (idx + 1) % shuffled.length;
                    [shuffled[idx], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[idx]];
                });
            }
            
            rounds.push(shuffled);
        }
        
        // Calculate delays to fit within ~1.5s total
        const baseDelays = [0, 0.3, 0.6, 0.9, 1.2]; // Start times for each round
        
        // Apply animations to each button
        items.forEach((item, buttonIndex) => {
            const button = item.querySelector('.color-bar__button');
            if (!button) return;
            
            const randomOffset = Math.random() * 0.1; // Add some randomness per button
            
            // Schedule all 5 color changes for this button
            for (let roundIndex = 0; roundIndex < 5; roundIndex++) {
                const delay = baseDelays[roundIndex] + randomOffset;
                const scheme = rounds[roundIndex][buttonIndex % availableColorSchemes.length];
                
                setTimeout(() => {
                    const currentColor = getComputedStyle(button).backgroundColor;
                    gsap.fromTo(button, {
                        backgroundColor: currentColor
                    }, {
                        backgroundColor: scheme.mainBg,
                        duration: 0.3,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            button.dataset.colorName = scheme.name;
                            checkAnimationComplete();
                        }
                    });
                }, delay * 1000);
            }
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
            
            // Handle page backgrounds for subpages
            const pageElement = document.querySelector('.page');
            if (pageElement) {
                const selectedScheme = specificScheme || shuffledSchemes[0];
                animatePageColors(selectedScheme, masterTimeline, 0);
            }

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

    // Only set up ScrollTrigger for sections if they exist
    if (sections.length > 0) {
        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                toggleClass: { targets: section, className: "is-active-section" },
            });
        });
    }
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Prevent clicks during color bar animation
            if (isColorBarAnimating) return;
            
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
