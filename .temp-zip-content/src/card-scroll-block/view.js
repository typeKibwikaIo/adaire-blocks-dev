import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Global ScrollTrigger Configuration
ScrollTrigger.config({ 
    limitCallbacks: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load", // Let GSAP handle refreshes
    fastScrollEnd: true // Smooth out fast scrolling
});

const initCardScroll = () => {
    // Kill ALL previous triggers to prevent overlap
    ScrollTrigger.getAll().forEach(st => {
        if (st.trigger && (st.trigger.classList.contains('adaire-card-scroll') ||
            st.trigger.closest('.adaire-card-scroll'))) {
            st.kill(true); // Pass true to kill immediately without cleanup animation
        }
    });

    const blocks = document.querySelectorAll('.adaire-card-scroll');

    blocks.forEach((block) => {
        const cards = block.querySelectorAll('.adaire-card-scroll__card');
        const intro = block.querySelector('.adaire-card-scroll__intro');

        if (!cards.length) return;

        const lastCard = cards[cards.length - 1];

        // Calculate the visible peek height (how much of previous card should be visible)
        const peekHeight = 30; // pixels of previous card to show (matches user's setting)
        const viewportHeight = window.innerHeight;
        const startPinPosition = viewportHeight * 0.15; // 15% from top
        const pinOffsetPerCard = peekHeight; // Each card pins lower by this amount

        // Intro Pinning
        if (intro) {
            // Prepare intro for smooth pinning
            gsap.set(intro, {
                willChange: "transform",
                force3D: true,
                transform: "translateZ(0)"
            });

            ScrollTrigger.create({
                trigger: cards[0],
                start: "top 15%",
                endTrigger: lastCard,
                end: "top 15%",
                pin: intro,
                pinSpacing: false,
                anticipatePin: 0,
                pinReparent: false,
                pinType: "fixed",
                id: `intro-${block.dataset.id || Math.random()}`
            });
        }

        // Card Pinning & Animation with Progressive Positioning
        cards.forEach((card, index) => {
            const isLastCard = index === cards.length - 1;
            const cardInner = card.querySelector('.adaire-card-scroll__card-inner');
            const previousCard = index > 0 ? cards[index - 1] : null;
            const previewText = card.dataset.previewText || '';
            const textColor = card.dataset.textColor || '#000000';
            
            // Ensure card has an ID for tracking
            if (!card.id) {
                card.id = `card-scroll-item-${index}`;
            }

            if (!isLastCard) {
                // Prepare card for smooth pinning - force GPU acceleration
                gsap.set(card, {
                    willChange: "transform",
                    force3D: true,
                    transform: "translateZ(0)" // Force GPU layer
                });

                // Calculate progressive pin position
                // Each card pins lower than the previous one
                const pinTopPosition = startPinPosition + (index * pinOffsetPerCard);
                const pinTopPercent = (pinTopPosition / viewportHeight) * 100;
                const startPosition = `top ${pinTopPercent}%`;
                
                // Calculate end position - pin until the last card reaches the same position
                // Use a pixel offset to ensure proper pinning duration
                const endPosition = `top ${pinTopPercent}%`;

                // Pin the card at progressive position
                ScrollTrigger.create({
                    trigger: card,
                    start: startPosition,
                    endTrigger: lastCard,
                    end: endPosition,
                    pin: true,
                    pinSpacing: false,
                    anticipatePin: 0,
                    pinReparent: false,
                    pinType: "fixed",
                    id: `card-pin-${index}`,
                    invalidateOnRefresh: true,
                    onEnter: () => {
                        // When this card pins, cover the previous card and show preview text
                        if (previousCard) {
                            coverCard(previousCard);
                            if (previewText) {
                                showPreviewText(previousCard, previewText, textColor, card);
                            }
                        }
                    },
                    onLeave: () => {
                        // Uncover previous card when this card unpins
                        if (previousCard) {
                            uncoverCard(previousCard);
                            hidePreviewText(previousCard);
                        }
                    },
                    onEnterBack: () => {
                        // Cover previous card when scrolling back
                        if (previousCard) {
                            coverCard(previousCard);
                            if (previewText) {
                                showPreviewText(previousCard, previewText, textColor, card);
                            }
                        }
                    },
                    onLeaveBack: () => {
                        // Uncover previous card when scrolling back past
                        if (previousCard) {
                            uncoverCard(previousCard);
                            hidePreviewText(previousCard);
                        }
                    }
                });

                // Card content animation is disabled - content remains static
                // Ensure inner content is reset to default position
                if (cardInner) {
                    gsap.set(cardInner, {
                        y: 0,
                        clearProps: "transform"
                    });
                }
            }
            
            // For the last card, add logic to smoothly hide shadows on other cards when it's above them
            if (isLastCard) {
                // Create a ScrollTrigger to detect when last card is visible and above other cards
                // This happens when the last card reaches the same position where other cards would pin
                const lastCardStartPosition = startPinPosition + ((cards.length - 1) * pinOffsetPerCard);
                const lastCardStartPercent = (lastCardStartPosition / viewportHeight) * 100;
                
                // Prepare all non-last cards for smooth shadow animation
                cards.forEach((c, idx) => {
                    if (idx < cards.length - 1) {
                        // Get computed shadow values for smooth transition
                        const computedStyle = window.getComputedStyle(c);
                        const originalBoxShadow = computedStyle.boxShadow;
                        c.dataset.originalShadow = originalBoxShadow || 'none';
                    }
                });
                
                ScrollTrigger.create({
                    trigger: lastCard,
                    start: `top ${lastCardStartPercent}%`, // When last card reaches pin position
                    end: "bottom top", // Until it's fully scrolled past
                    id: `last-card-shadow-control`,
                    onEnter: () => {
                        // Smoothly fade out shadows on all other cards when last card is above them
                        cards.forEach((c, idx) => {
                            if (idx < cards.length - 1) {
                                const originalShadow = c.dataset.originalShadow || 'none';
                                gsap.to(c, {
                                    boxShadow: 'none',
                                    duration: 0.4,
                                    ease: 'power2.out'
                                });
                            }
                        });
                    },
                    onLeave: () => {
                        // Smoothly fade in shadows again when last card is scrolled past
                        cards.forEach((c, idx) => {
                            if (idx < cards.length - 1) {
                                const originalShadow = c.dataset.originalShadow || 'none';
                                gsap.to(c, {
                                    boxShadow: originalShadow,
                                    duration: 0.4,
                                    ease: 'power2.out'
                                });
                            }
                        });
                    },
                    onEnterBack: () => {
                        // Smoothly fade out shadows when scrolling back
                        cards.forEach((c, idx) => {
                            if (idx < cards.length - 1) {
                                gsap.to(c, {
                                    boxShadow: 'none',
                                    duration: 0.4,
                                    ease: 'power2.out'
                                });
                            }
                        });
                    },
                    onLeaveBack: () => {
                        // Smoothly fade in shadows when scrolling back past
                        cards.forEach((c, idx) => {
                            if (idx < cards.length - 1) {
                                const originalShadow = c.dataset.originalShadow || 'none';
                                gsap.to(c, {
                                    boxShadow: originalShadow,
                                    duration: 0.4,
                                    ease: 'power2.out'
                                });
                            }
                        });
                    }
                });
            }
        });

        // After all ScrollTriggers are created, check initial state and apply overlays
        // This ensures overlays are applied even if we're already past the trigger point
        const checkInitialState = () => {
            cards.forEach((card, index) => {
                if (index === 0) return; // First card has no previous card
                
                const previousCard = cards[index - 1];
                const pinTrigger = ScrollTrigger.getById(`card-pin-${index}`);
                
                if (!pinTrigger) return;
                
                // Check the trigger's progress - if it's between 0 and 1, the trigger is active
                // progress > 0 means we've entered, progress < 1 means we haven't left
                const progress = pinTrigger.progress;
                const isInRange = progress > 0 && progress < 1;
                
                // Also check if the trigger reports as active
                const isActive = pinTrigger.isActive;
                
                // If we're in the pinning range OR the trigger is active, cover the previous card
                if (isInRange || isActive) {
                    coverCard(previousCard);
                    
                    // Also show preview text if available
                    const previewText = card.dataset.previewText || '';
                    const textColor = card.dataset.textColor || '#000000';
                    if (previewText) {
                        showPreviewText(previousCard, previewText, textColor, card);
                    }
                } else if (progress >= 1) {
                    // If we're past the end, uncover the previous card
                    uncoverCard(previousCard);
                    hidePreviewText(previousCard);
                }
            });
            
            // Check if last card is above other cards and smoothly hide shadows accordingly
            const lastCardShadowTrigger = ScrollTrigger.getById('last-card-shadow-control');
            if (lastCardShadowTrigger) {
                const lastCardProgress = lastCardShadowTrigger.progress;
                const lastCardIsActive = lastCardShadowTrigger.isActive;
                
                if ((lastCardProgress > 0 && lastCardProgress < 1) || lastCardIsActive) {
                    // Last card is above, smoothly hide shadows on other cards
                    cards.forEach((c, idx) => {
                        if (idx < cards.length - 1) {
                            // Store original shadow if not already stored
                            if (!c.dataset.originalShadow) {
                                const computedStyle = window.getComputedStyle(c);
                                c.dataset.originalShadow = computedStyle.boxShadow || 'none';
                            }
                            gsap.to(c, {
                                boxShadow: 'none',
                                duration: 0.4,
                                ease: 'power2.out'
                            });
                        }
                    });
                } else {
                    // Last card is not above, smoothly show shadows
                    cards.forEach((c, idx) => {
                        if (idx < cards.length - 1) {
                            const originalShadow = c.dataset.originalShadow || 'none';
                            if (originalShadow !== 'none') {
                                gsap.to(c, {
                                    boxShadow: originalShadow,
                                    duration: 0.4,
                                    ease: 'power2.out'
                                });
                            }
                        }
                    });
                }
            }
        };
        
        // Check initial state after ScrollTriggers are ready
        // Use multiple checks to ensure we catch the state correctly
        const applyInitialState = () => {
            ScrollTrigger.refresh();
            // Small delay to let ScrollTrigger calculate positions
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    checkInitialState();
                });
            });
        };
        
        // Check immediately and after delays to ensure ScrollTrigger has calculated positions
        applyInitialState();
        setTimeout(applyInitialState, 100);
        setTimeout(applyInitialState, 300);
        setTimeout(applyInitialState, 500); // Extra check
        
        // Check on every scroll event to ensure state is always correct
        let scrollCheckTimeout;
        const handleScroll = () => {
            // Check immediately on scroll
            checkInitialState();
            
            // Also check after a small delay to catch any delayed updates
            clearTimeout(scrollCheckTimeout);
            scrollCheckTimeout = setTimeout(() => {
                checkInitialState();
            }, 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Also check on ScrollTrigger update events
        ScrollTrigger.addEventListener('refresh', () => {
            requestAnimationFrame(() => {
                checkInitialState();
            });
        });
        
        // Check on ScrollTrigger update events
        ScrollTrigger.addEventListener('update', () => {
            checkInitialState();
        });

        // Function to cover a card (stop animation and add overlay)
        // This is called when a card above has pinned, meaning this card is now completely covered
        function coverCard(card) {
            // Only cover if card is not currently pinned (it's been covered by a card above)
            const cardIndex = Array.from(cards).indexOf(card);
            const pinTrigger = ScrollTrigger.getById(`card-pin-${cardIndex}`);
            if (pinTrigger && pinTrigger.isActive) {
                // Don't cover if this card is currently pinned
                return;
            }

            // Ensure inner content is static (no animation)
            const cardInner = card.querySelector('.adaire-card-scroll__card-inner');
            if (cardInner) {
                // Reset transform to ensure no movement
                gsap.set(cardInner, { y: 0, clearProps: "transform" });
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
        function showPreviewText(previousCard, text, color, targetCard) {
            // Remove any existing preview text for this target card
            const existingPreviews = document.querySelectorAll('.adaire-card-scroll__preview-text');
            existingPreviews.forEach(prev => {
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

            // Get card background color for overlay consistency
            const bgColor = previousCard.dataset.backgroundColor || 
                          window.getComputedStyle(previousCard).backgroundColor || 
                          '#ffffff';

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
                const targetPinPosition = startPinPosition + (Array.from(cards).indexOf(targetCard) * pinOffsetPerCard);
                const currentScrollY = window.scrollY;
                const targetScrollY = currentScrollY + targetRect.top - targetPinPosition;
                window.scrollTo({
                    top: Math.max(0, targetScrollY),
                    behavior: 'smooth'
                });
            });

            // Add hover effect
            previewElement.addEventListener('mouseenter', () => {
                gsap.to(previewElement, {
                    opacity: 1,
                    scale: 1.02,
                    duration: 0.2
                });
            });

            previewElement.addEventListener('mouseleave', () => {
                gsap.to(previewElement, {
                    opacity: 0.85,
                    scale: 1,
                    duration: 0.2
                });
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

            // Animate in
            gsap.fromTo(previewElement, {
                opacity: 0,
                y: 20
            }, {
                opacity: 0.85,
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        }

        // Function to hide preview text
        function hidePreviewText(card) {
            // Find preview text associated with this card
            const allPreviews = document.querySelectorAll('.adaire-card-scroll__preview-text');
            allPreviews.forEach(previewElement => {
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
                    
                    gsap.to(previewElement, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => {
                            previewElement.remove();
                        }
                    });
                }
            });
        }
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
        
        // Single refresh after everything is set up
        requestAnimationFrame(() => {
            ScrollTrigger.refresh();
        });
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

// Handle resize/orientation changes
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250); // Debounce resize events
});


