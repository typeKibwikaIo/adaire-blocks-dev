/**
 * Progressive stacking cards scroll effect.
 *
 * Originally implemented with GSAP + ScrollTrigger. GSAP ships under a
 * proprietary "Standard License" (not GPL-compatible), so it cannot be
 * bundled in this WordPress.org-distributed plugin. This version reimplements
 * the same visual behaviour using native CSS `position: sticky` plus a small
 * amount of scroll-driven JS for the cover overlays, preview-text labels, and
 * shadow fade.
 *
 * How the stacking works here:
 * Every card except the last gets `position: sticky; top: <offset>px`, with
 * each successive card's offset 30px lower than the one before it - the
 * browser handles sticking/releasing natively as the user scrolls, exactly
 * like GSAP's ScrollTrigger pinning did, but without manually toggling
 * `position: fixed` ourselves. That distinction matters: an element that
 * goes `position: fixed` is removed from normal document flow, which shifts
 * its siblings to fill the gap and silently invalidates any cached "natural
 * position" math for every card after it - the source of several very
 * confusing bugs in an earlier version of this file (cards stuck pinned
 * forever, raw card content bleeding through cover overlays). `position:
 * sticky` never removes the element from flow, so none of that can happen.
 *
 * The remaining JS just watches, on scroll, whether each card has been
 * "covered" - i.e. whether the next card in the stack has reached its own
 * sticky offset - and toggles the solid-color cover overlay and preview-text
 * label accordingly. That check is re-derived fresh from live
 * getBoundingClientRect() values on every scroll tick rather than cached, so
 * it can't drift out of sync the way pinnedState-transition tracking could.
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
function coverCard(card) {
    // Note: cards stay position:fixed (pinnedState stays true) for their entire
    // scroll range, which spans every subsequent card's pin/unpin cycle - that's
    // what makes the stack visually build up. So a card being "pinned" here does
    // NOT mean it isn't currently covered by the card above it; the two are
    // independent. An earlier version skipped covering while a card was still
    // pinned, which - since that's true almost the entire time a card is
    // covered - meant the overlay never actually got applied, leaving the
    // covered card's raw content (buttons, headings) visible through the peek strip.

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

        if (!cards.length) return;

        // Calculate the visible peek height (how much of previous card should be visible)
        const peekHeight = 30; // pixels of previous card to show (matches user's setting)

        // Recalculated on init/resize
        let viewportHeight = window.innerHeight;
        let startPinPosition = viewportHeight * 0.15; // 15% from top
        let pinOffsetPerCard = peekHeight; // Each card sticks lower by this amount

        // Tracks whether each (non-last) card is currently "covered" by the next
        // card in the stack, purely so we can fire coverCard/uncoverCard and the
        // preview-text show/hide only on enter/exit transitions rather than every
        // scroll tick.
        const coveredState = new Map();
        let shadowActive = false;

        const ctx = () => ({ viewportHeight, peekHeight, startPinPosition, pinOffsetPerCard, cards });

        const pinTopPositionForIndex = (index) => startPinPosition + (index * pinOffsetPerCard);

        // Give every card except the last a sticky offset. The browser then owns
        // the entire stick/release lifecycle natively - see the file header for
        // why that matters.
        const applyStickyPositions = () => {
            cards.forEach((card, index) => {
                const isLastCard = index === cards.length - 1;
                if (isLastCard) {
                    card.style.position = '';
                    card.style.top = '';
                    return;
                }
                card.style.position = 'sticky';
                card.style.top = `${pinTopPositionForIndex(index)}px`;
            });
        };

        // Ensure card has an ID for tracking and seed covered state.
        cards.forEach((card, index) => {
            if (!card.id) {
                card.id = `card-scroll-item-${index}`;
            }
            if (index < cards.length - 1) {
                coveredState.set(card, false);
            }
        });

        // Store original box-shadow for non-last cards (used by the shadow fade effect below)
        cards.forEach((c, idx) => {
            if (idx < cards.length - 1) {
                const computedStyle = window.getComputedStyle(c);
                c.dataset.originalShadow = computedStyle.boxShadow || 'none';
            }
        });

        // Evaluate current live layout and apply/remove cover overlays + shadow
        // fades accordingly. Re-derives everything fresh from
        // getBoundingClientRect() every time it's called rather than relying on
        // cached "natural position" math, so it can't drift out of sync with
        // what's actually on screen.
        const updateCoverStates = () => {
            for (let index = 0; index < cards.length - 1; index++) {
                const card = cards[index];
                const nextCard = cards[index + 1];
                const nextStickyTop = pinTopPositionForIndex(index + 1);

                // A card is covered once the next card in the stack has reached
                // (or scrolled past) its own sticky offset - i.e. it's now stuck
                // above this one. Checking this directly against nextCard's own
                // live position (rather than tracking pin/unpin transitions on
                // the card doing the covering) means a third card taking over
                // from a second never leaves an earlier card's overlay stripped
                // prematurely - each card's covered state only depends on its
                // immediate neighbour, checked fresh every time.
                const isCovered = nextCard.getBoundingClientRect().top <= nextStickyTop + 0.5;
                const wasCovered = coveredState.get(card);

                if (isCovered && !wasCovered) {
                    coverCard(card);
                    coveredState.set(card, true);

                    const previewText = nextCard.dataset.previewText || '';
                    const textColor = nextCard.dataset.textColor || '#000000';
                    if (previewText) {
                        showPreviewText(card, previewText, textColor, nextCard, ctx());
                    }
                } else if (!isCovered && wasCovered) {
                    uncoverCard(card);
                    coveredState.set(card, false);
                    hidePreviewText(card);
                }
            }

            // Smoothly fade shadows on non-last cards out/in while the (non-sticky)
            // last card is positioned above them, until it scrolls fully past.
            const lastCard = cards[cards.length - 1];
            const lastCardRect = lastCard.getBoundingClientRect();
            const lastCardStickyEquivalentTop = pinTopPositionForIndex(cards.length - 1);
            const shouldHideShadows = lastCardRect.top <= lastCardStickyEquivalentTop + 0.5 && lastCardRect.bottom > 0;

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

        // Full refresh: recompute metrics, re-apply sticky offsets, and
        // re-evaluate cover state against the current scroll position.
        const applyInitialState = () => {
            recalcMetrics();
            applyStickyPositions();
            updateCoverStates();
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
            updateCoverStates();

            // Also check after a small delay to catch any delayed updates
            clearTimeout(scrollCheckTimeout);
            scrollCheckTimeout = setTimeout(() => {
                updateCoverStates();
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
