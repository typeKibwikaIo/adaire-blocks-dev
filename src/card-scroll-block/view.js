/**
 * Progressive stacking cards scroll effect.
 *
 * Originally implemented with GSAP + ScrollTrigger. GSAP ships under a
 * proprietary "Standard License" (not GPL-compatible), so it cannot be
 * bundled in this WordPress.org-distributed plugin. This version reimplements
 * the same visual behaviour using native scroll/resize listeners,
 * getBoundingClientRect-based math, and CSS transitions instead.
 *
 * How pinning works here:
 * For each card we cache its "natural" (unpinned) document-relative top/left/
 * width/bottom, measured once at init and re-measured on resize (mirroring
 * what ScrollTrigger.refresh() used to do). On every scroll event we compare
 * the current window.scrollY against precomputed thresholds derived from
 * those cached rects to decide whether a card should be pinned
 * (position: fixed) or left in normal flow - the same math GSAP's
 * ScrollTrigger used internally to convert "top X%" trigger positions into
 * fixed scroll offsets.
 */

const EASE_OUT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // power2.out
const EASE_IN = 'cubic-bezier(0.55, 0.085, 0.68, 0.53)'; // power2.in

// Smoothly transition an element's box-shadow (replacement for gsap.to({ boxShadow, duration, ease })).
function animateBoxShadow(el, targetValue) {
    el.style.transition = `box-shadow 0.4s ${EASE_OUT}`;
    // Force reflow so the newly-set transition is picked up before the value changes.
    void el.offsetHeight;
    el.style.boxShadow = targetValue;
}

// Function to cover a card (stop animation and add overlay)
// This is called when a card above has pinned, meaning this card is now completely covered
function coverCard(card, pinnedState) {
    // Only cover if card is not currently pinned (it's been covered by a card above)
    if (pinnedState.get(card)) {
        // Don't cover if this card is currently pinned
        return;
    }

    // Ensure inner content is static (no animation)
    const cardInner = card.querySelector('.adaire-card-scroll__card-inner');
    if (cardInner) {
        // Reset transform to ensure no movement
        cardInner.style.transform = '';
    }

    // Get card background color - try multiple methods to get accurate color
    let bgColor = card.dataset.backgroundColor;
    if (!bgColor) {
        const computedStyle = window.getComputedStyle(card);
        bgColor = computedStyle.backgroundColor;
        // If background is transparent, try to get it from the card-inner or use white
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            const cardInnerStyle = window.getComputedStyle(cardInner || card);
            bgColor = cardInnerStyle.backgroundColor;
            if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
                bgColor = '#ffffff'; // Fallback to white
            }
        }
    }

    // Add overlay if it doesn't exist
    let overlay = card.querySelector('.adaire-card-scroll__card-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'adaire-card-scroll__card-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = bgColor;
        overlay.style.zIndex = '9999'; // Very high z-index to ensure it's on top
        overlay.style.pointerEvents = 'none';
        overlay.style.borderRadius = window.getComputedStyle(card).borderRadius || '0';

        // Ensure card has relative positioning for overlay
        const currentPosition = window.getComputedStyle(card).position;
        if (currentPosition === 'static' || currentPosition === '') {
            card.style.position = 'relative';
        }
        card.appendChild(overlay);
    } else {
        // Update overlay color if it already exists
        overlay.style.backgroundColor = bgColor;
    }
}

// Function to uncover a card (remove overlay and restore animation)
function uncoverCard(card) {
    // Remove overlay
    const overlay = card.querySelector('.adaire-card-scroll__card-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Note: Animation will be restored when the card becomes the active pinned card
}

// Function to show preview text in the visible space of previous card
function showPreviewText(previousCard, text, color, targetCard, ctx) {
    const { viewportHeight, peekHeight, startPinPosition, pinOffsetPerCard, cards } = ctx;

    // Remove any existing preview text for this target card
    const existingPreviews = document.querySelectorAll('.adaire-card-scroll__preview-text');
    existingPreviews.forEach((prev) => {
        if (prev._targetCard === targetCard) {
            // Cancel animation frame
            if (prev._rafId) {
                cancelAnimationFrame(prev._rafId);
            }
            if (prev._scrollHandler) {
                window.removeEventListener('scroll', prev._scrollHandler);
            }
            if (prev._resizeHandler) {
                window.removeEventListener('resize', prev._resizeHandler);
            }
            prev.remove();
        }
    });

    if (!text) return; // Don't show if no text

    // Create preview text element
    const previewElement = document.createElement('div');
    previewElement.className = 'adaire-card-scroll__preview-text';
    previewElement.textContent = text;
    previewElement.style.color = color;
    previewElement._targetCard = targetCard;
    previewElement._previousCard = previousCard;

    // Set initial styles - position at TOP of visible peek area
    previewElement.style.position = 'fixed';
    previewElement.style.top = `${viewportHeight - peekHeight}px`; // Top of peek area
    previewElement.style.height = `${peekHeight}px`;
    previewElement.style.display = 'flex';
    previewElement.style.alignItems = 'center';
    previewElement.style.justifyContent = 'center';
    previewElement.style.padding = '0.75rem 1rem';
    previewElement.style.zIndex = '10000'; // Very high z-index to appear above overlay
    previewElement.style.cursor = 'pointer';
    previewElement.style.pointerEvents = 'auto';
    previewElement.style.backgroundColor = 'transparent'; // Transparent, overlay provides background
    previewElement.style.fontSize = '0.875rem';
    previewElement.style.lineHeight = '1.4';
    previewElement.style.textAlign = 'center';
    previewElement.style.overflow = 'hidden';
    previewElement.style.textOverflow = 'ellipsis';
    previewElement.style.boxSizing = 'border-box';

    // Update position function to track card width and position
    // The preview text should appear at the top of the visible peek area
    const updatePosition = () => {
        const cardRect = previousCard.getBoundingClientRect();
        // Position at the top of peek area, aligned with the previous card
        previewElement.style.left = cardRect.left + 'px';
        previewElement.style.width = cardRect.width + 'px';
        previewElement.style.top = `${window.innerHeight - peekHeight}px`; // Top of peek area
    };

    // Initial position
    updatePosition();

    // Use requestAnimationFrame for smooth position updates
    let rafId;
    const smoothUpdate = () => {
        updatePosition();
        rafId = requestAnimationFrame(smoothUpdate);
    };
    rafId = requestAnimationFrame(smoothUpdate);
    previewElement._rafId = rafId;

    // Add click handler to scroll to target card
    previewElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Scroll to show the target card fully at its pin position
        const targetRect = targetCard.getBoundingClientRect();
        const targetPinPosition = startPinPosition + (cards.indexOf(targetCard) * pinOffsetPerCard);
        const currentScrollY = window.scrollY;
        const targetScrollY = currentScrollY + targetRect.top - targetPinPosition;
        window.scrollTo({
            top: Math.max(0, targetScrollY),
            behavior: 'smooth'
        });
    });

    // Add hover effect
    previewElement.addEventListener('mouseenter', () => {
        previewElement.style.transition = `opacity 0.2s ${EASE_OUT}, transform 0.2s ${EASE_OUT}`;
        previewElement.style.opacity = '1';
        previewElement.style.transform = 'scale(1.02)';
    });

    previewElement.addEventListener('mouseleave', () => {
        previewElement.style.transition = `opacity 0.2s ${EASE_OUT}, transform 0.2s ${EASE_OUT}`;
        previewElement.style.opacity = '0.85';
        previewElement.style.transform = 'scale(1)';
    });

    // Append to body (fixed positioning relative to viewport)
    document.body.appendChild(previewElement);

    // Update position on scroll and resize
    const scrollHandler = () => updatePosition();
    const resizeHandler = () => updatePosition();
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', resizeHandler, { passive: true });
    previewElement._scrollHandler = scrollHandler;
    previewElement._resizeHandler = resizeHandler;

    // Animate in (replacement for gsap.fromTo)
    previewElement.style.opacity = '0';
    previewElement.style.transform = 'translateY(20px)';
    // Force reflow so the "from" state is committed before we transition to the "to" state.
    void previewElement.offsetHeight;
    requestAnimationFrame(() => {
        previewElement.style.transition = `opacity 0.4s ${EASE_OUT}, transform 0.4s ${EASE_OUT}`;
        previewElement.style.opacity = '0.85';
        previewElement.style.transform = 'translateY(0)';
    });
}

// Function to hide preview text
function hidePreviewText(card) {
    // Find preview text associated with this card
    const allPreviews = document.querySelectorAll('.adaire-card-scroll__preview-text');
    allPreviews.forEach((previewElement) => {
        // Check if this preview's previous card matches the card being hidden
        if (previewElement._previousCard === card) {
            // Cancel animation frame
            if (previewElement._rafId) {
                cancelAnimationFrame(previewElement._rafId);
            }
            // Remove event handlers
            if (previewElement._scrollHandler) {
                window.removeEventListener('scroll', previewElement._scrollHandler);
            }
            if (previewElement._resizeHandler) {
                window.removeEventListener('resize', previewElement._resizeHandler);
            }

            // Animate out then remove (replacement for gsap.to(..., { onComplete }))
            previewElement.style.transition = `opacity 0.3s ${EASE_IN}, transform 0.3s ${EASE_IN}`;
            previewElement.style.opacity = '0';
            previewElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                previewElement.remove();
            }, 300);
        }
    });
}

const initCardScroll = () => {
    const blocks = document.querySelectorAll('.adaire-card-scroll');

    blocks.forEach((block) => {
        const cards = Array.from(block.querySelectorAll('.adaire-card-scroll__card'));
        const intro = block.querySelector('.adaire-card-scroll__intro');

        if (!cards.length) return;

        const lastCard = cards[cards.length - 1];

        // Calculate the visible peek height (how much of previous card should be visible)
        const peekHeight = 30; // pixels of previous card to show (matches user's setting)

        // Recalculated on init/resize
        let viewportHeight = window.innerHeight;
        let startPinPosition = viewportHeight * 0.15; // 15% from top
        let pinOffsetPerCard = peekHeight; // Each card pins lower by this amount

        // Cached natural (unpinned) layout rects, keyed by element.
        const naturalRects = new Map();

        // Pin state tracking so we can detect enter/leave transitions.
        const pinnedState = new Map();
        let introPinned = false;
        let shadowActive = false;

        const ctx = () => ({ viewportHeight, peekHeight, startPinPosition, pinOffsetPerCard, cards });

        // Ensure card has an ID for tracking, seed pin state, and prepare GPU hints.
        cards.forEach((card, index) => {
            if (!card.id) {
                card.id = `card-scroll-item-${index}`;
            }
            pinnedState.set(card, false);

            const isLastCard = index === cards.length - 1;
            if (!isLastCard) {
                // Prepare card for smooth pinning - force GPU acceleration
                card.style.willChange = 'transform';
                card.style.transform = 'translateZ(0)'; // Force GPU layer

                // Card content animation is disabled - content remains static
                // Ensure inner content is reset to default position
                const cardInner = card.querySelector('.adaire-card-scroll__card-inner');
                if (cardInner) {
                    cardInner.style.transform = '';
                }
            }
        });

        // Prepare intro for smooth pinning
        if (intro) {
            intro.style.willChange = 'transform';
            intro.style.transform = 'translateZ(0)';
        }

        // Store original box-shadow for non-last cards (used by the shadow fade effect below)
        cards.forEach((c, idx) => {
            if (idx < cards.length - 1) {
                const computedStyle = window.getComputedStyle(c);
                c.dataset.originalShadow = computedStyle.boxShadow || 'none';
            }
        });

        const pinTopPositionForIndex = (index) => startPinPosition + (index * pinOffsetPerCard);

        const clearCardPinStyles = (card) => {
            card.style.position = '';
            card.style.top = '';
            card.style.left = '';
            card.style.width = '';
        };

        const applyCardPinStyles = (card, index) => {
            const rect = naturalRects.get(card);
            if (!rect) return;
            card.style.position = 'fixed';
            card.style.top = `${pinTopPositionForIndex(index)}px`;
            card.style.left = `${rect.left}px`;
            card.style.width = `${rect.width}px`;
        };

        const clearIntroPinStyles = () => {
            intro.style.position = '';
            intro.style.top = '';
            intro.style.left = '';
            intro.style.width = '';
        };

        const applyIntroPinStyles = () => {
            const rect = naturalRects.get(intro);
            if (!rect) return;
            intro.style.position = 'fixed';
            intro.style.top = `${startPinPosition}px`;
            intro.style.left = `${rect.left}px`;
            intro.style.width = `${rect.width}px`;
        };

        // Re-measure each card's natural (unpinned) document position. Mirrors what
        // ScrollTrigger.refresh() used to do internally: temporarily release any pins,
        // let layout settle, then read fresh geometry.
        const measureNaturalPositions = () => {
            cards.forEach(clearCardPinStyles);
            if (intro) clearIntroPinStyles();

            // Force reflow so subsequent getBoundingClientRect() reads are accurate.
            void block.offsetHeight;

            const scrollY = window.scrollY;
            cards.forEach((card) => {
                const rect = card.getBoundingClientRect();
                naturalRects.set(card, {
                    top: rect.top + scrollY,
                    left: rect.left,
                    width: rect.width,
                    bottom: rect.bottom + scrollY
                });
            });
            if (intro) {
                const rect = intro.getBoundingClientRect();
                naturalRects.set(intro, {
                    top: rect.top + scrollY,
                    left: rect.left,
                    width: rect.width,
                    bottom: rect.bottom + scrollY
                });
            }
        };

        // Evaluate current scroll position against cached thresholds and apply/remove
        // pin styles + cover overlays + shadow fades accordingly. This is the primary,
        // ongoing driver of the effect (replaces ScrollTrigger's onEnter/onLeave/etc).
        const updatePinStates = () => {
            const scrollY = window.scrollY;
            const lastRect = naturalRects.get(lastCard);
            if (!lastRect) return; // Not measured yet

            cards.forEach((card, index) => {
                const isLastCard = index === cards.length - 1;
                if (isLastCard) return;

                const rect = naturalRects.get(card);
                if (!rect) return;

                const pinTopPosition = pinTopPositionForIndex(index);
                const startScrollY = rect.top - pinTopPosition;
                const endScrollY = lastRect.top - pinTopPosition;

                const shouldPin = scrollY >= startScrollY && scrollY < endScrollY;
                const wasPinned = pinnedState.get(card);

                if (shouldPin && !wasPinned) {
                    applyCardPinStyles(card, index);
                    pinnedState.set(card, true);

                    // When this card pins, cover the previous card and show preview text
                    if (index > 0) {
                        const previousCard = cards[index - 1];
                        coverCard(previousCard, pinnedState);
                        const previewText = card.dataset.previewText || '';
                        const textColor = card.dataset.textColor || '#000000';
                        if (previewText) {
                            showPreviewText(previousCard, previewText, textColor, card, ctx());
                        }
                    }
                } else if (!shouldPin && wasPinned) {
                    clearCardPinStyles(card);
                    pinnedState.set(card, false);

                    // Uncover previous card when this card unpins
                    if (index > 0) {
                        const previousCard = cards[index - 1];
                        uncoverCard(previousCard);
                        hidePreviewText(previousCard);
                    }
                }

                // Intro pins/unpins on the same range as card index 0
                // (trigger: cards[0], start/end "top 15%").
                if (index === 0 && intro) {
                    if (shouldPin && !introPinned) {
                        applyIntroPinStyles();
                        introPinned = true;
                    } else if (!shouldPin && introPinned) {
                        clearIntroPinStyles();
                        introPinned = false;
                    }
                }
            });

            // Smoothly fade shadows on non-last cards out/in while the last card is
            // positioned above them (until it fully scrolls past).
            const lastCardStartPosition = pinTopPositionForIndex(cards.length - 1);
            const shadowStartScrollY = lastRect.top - lastCardStartPosition;
            const shadowEndScrollY = lastRect.bottom; // "bottom top": last card's bottom reaches viewport top

            const shouldHideShadows = scrollY >= shadowStartScrollY && scrollY < shadowEndScrollY;
            if (shouldHideShadows !== shadowActive) {
                shadowActive = shouldHideShadows;
                cards.forEach((c, idx) => {
                    if (idx < cards.length - 1) {
                        const originalShadow = c.dataset.originalShadow || 'none';
                        animateBoxShadow(c, shouldHideShadows ? 'none' : originalShadow);
                    }
                });
            }
        };

        // Recalculate viewport-derived metrics (call on init and after resize).
        const recalcMetrics = () => {
            viewportHeight = window.innerHeight;
            startPinPosition = viewportHeight * 0.15;
            pinOffsetPerCard = peekHeight;
        };

        // Full refresh: recompute metrics, re-measure natural layout, and re-evaluate
        // pin state against the current scroll position.
        const applyInitialState = () => {
            recalcMetrics();
            measureNaturalPositions();
            updatePinStates();
        };

        // Check immediately and after delays to catch late layout settling
        // (webfonts, images, etc. that can shift card positions after first paint).
        applyInitialState();
        setTimeout(applyInitialState, 100);
        setTimeout(applyInitialState, 300);
        setTimeout(applyInitialState, 500); // Extra check

        // Check on every scroll event to ensure state is always correct
        let scrollCheckTimeout;
        const handleScroll = () => {
            // Check immediately on scroll
            updatePinStates();

            // Also check after a small delay to catch any delayed updates
            clearTimeout(scrollCheckTimeout);
            scrollCheckTimeout = setTimeout(() => {
                updatePinStates();
            }, 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Handle resize/orientation changes for this block
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                applyInitialState();
            }, 250); // Debounce resize events
        });
    });
};

// Single initialization point
let initialized = false;

const safeInit = () => {
    if (initialized) return;
    initialized = true;

    // Wait for layout to stabilize
    requestAnimationFrame(() => {
        initCardScroll();
    });
};

// Choose ONE initialization trigger based on your content
if (document.readyState === 'loading') {
    // If script runs early, wait for DOM
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    // If DOM already loaded, init immediately
    safeInit();
}
