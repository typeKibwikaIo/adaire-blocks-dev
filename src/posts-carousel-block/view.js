/**
 * Lightweight CSS-transition/animation engine that replaces GSAP.
 *
 * GSAP's "Standard 'no charge' license" is not GPL-compatible and cannot be
 * bundled in a WordPress.org (GPL) plugin. This module reimplements the small
 * subset of the previous animation library's set/to/fromTo/scroll-trigger
 * behaviour that this block relies on, using native CSS transitions,
 * keyframe animations, and IntersectionObserver.
 */

// Inject the one-off @keyframes needed for the "bounceIn" entrance effect,
// which requires an overshoot that a single CSS transition cannot express.
(function injectAdaireAnimationKeyframes() {
    if (document.getElementById('adaire-blocks-css-anim-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'adaire-blocks-css-anim-keyframes';
    style.textContent = `
@keyframes adaireBlocksBounceIn {
    0% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1.08); }
    70% { transform: scale(0.94); }
    100% { opacity: 1; transform: scale(1); }
}
`;
    document.head.appendChild(style);
})();

// Approximate CSS cubic-bezier equivalents for the GSAP ease names used by
// this block's Inspector controls. elastic/bounce cannot be reproduced
// exactly with a single cubic-bezier curve, so they use an overshoot
// approximation instead.
const ADAIRE_EASE_MAP = {
    'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'power2.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'power2.in': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    'power3.out': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    'back.out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'elastic.out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'bounce.out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    'circ.out': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    'linear': 'linear',
};

// Resolves an ease name (including parameterized ones such as
// "back.out(1.7)") to a CSS timing function. Parameterized eases fall back
// to their base curve - a reasonable approximation for the small cosmetic
// bounce/back effects this block uses internally (not user-configurable).
function adaireEaseToCSS(ease) {
    if (!ease) return ADAIRE_EASE_MAP['power2.out'];
    if (ADAIRE_EASE_MAP[ease]) return ADAIRE_EASE_MAP[ease];
    const baseName = ease.split('(')[0];
    return ADAIRE_EASE_MAP[baseName] || ADAIRE_EASE_MAP['power2.out'];
}

// Config keys that describe the tween itself rather than a CSS property.
const ADAIRE_ANIM_OPTION_KEYS = ['duration', 'stagger', 'ease', 'delay', 'onComplete', 'onStart', 'clearProps', 'overwrite'];

function adaireSplitAnimConfig(config) {
    const options = {};
    const props = {};
    Object.keys(config || {}).forEach((key) => {
        if (ADAIRE_ANIM_OPTION_KEYS.indexOf(key) !== -1) {
            options[key] = config[key];
        } else {
            props[key] = config[key];
        }
    });
    return { props, options };
}

function adaireToArray(elements) {
    if (!elements) return [];
    if (elements instanceof window.Element) return [elements];
    return Array.prototype.slice.call(elements);
}

const ADAIRE_TRANSFORM_KEYS = ['x', 'y', 'xPercent', 'yPercent', 'scale', 'rotation', 'rotationY'];

function adaireHasTransformProp(props) {
    return ADAIRE_TRANSFORM_KEYS.some((key) => props[key] !== undefined);
}

// Per-element transform state, so that separate calls setting different
// transform properties (e.g. one call sets xPercent/yPercent to center an
// element on the cursor, a later call updates only x/y to follow the mouse)
// compose into a single `transform`, the way GSAP's internal engine does.
const adaireTransformState = new WeakMap();

function adaireMergeTransformState(el, props) {
    let state = adaireTransformState.get(el);
    if (!state) {
        state = {};
        adaireTransformState.set(el, state);
    }
    ADAIRE_TRANSFORM_KEYS.forEach((key) => {
        if (props[key] !== undefined) state[key] = props[key];
    });
    return state;
}

function adaireBuildTransform(state) {
    const parts = [];
    if (state.xPercent !== undefined || state.yPercent !== undefined) {
        parts.push(`translate(${state.xPercent || 0}%, ${state.yPercent || 0}%)`);
    }
    if (state.x !== undefined || state.y !== undefined) {
        parts.push(`translate(${state.x || 0}px, ${state.y || 0}px)`);
    }
    if (state.rotation !== undefined) parts.push(`rotate(${state.rotation}deg)`);
    if (state.rotationY !== undefined) parts.push(`rotateY(${state.rotationY}deg)`);
    if (state.scale !== undefined) parts.push(`scale(${state.scale})`);
    return parts.join(' ');
}

function adaireApplyProps(el, props) {
    if (props.opacity !== undefined) el.style.opacity = props.opacity;
    if (adaireHasTransformProp(props)) {
        const state = adaireMergeTransformState(el, props);
        el.style.transform = adaireBuildTransform(state);
    }
    if (props.boxShadow !== undefined) el.style.boxShadow = props.boxShadow;
    if (props.color !== undefined) el.style.color = props.color;
    if (props.pointerEvents !== undefined) el.style.pointerEvents = props.pointerEvents;
}

// Sets element styles directly, with an option to clear previously-applied inline styles.
function cssSet(elements, config) {
    const els = adaireToArray(elements);
    const { props, options } = adaireSplitAnimConfig(config);
    els.forEach((el) => {
        if (options.clearProps) {
            el.style.transition = '';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.boxShadow = '';
            el.style.color = '';
            el.style.animation = '';
            adaireTransformState.delete(el);
            return;
        }
        el.style.transition = 'none';
        adaireApplyProps(el, props);
    });
}

// Animates elements to the given target CSS properties (opacity, transform, box-shadow, color)
// via a CSS transition, supporting duration/stagger/ease/delay/onComplete.
function cssTo(elements, config) {
    const els = adaireToArray(elements);
    const { props, options } = adaireSplitAnimConfig(config);

    if (els.length === 0) {
        if (options.onComplete) options.onComplete();
        return els;
    }

    const duration = options.duration !== undefined ? options.duration : 0.3;
    const ease = options.ease || 'power2.out';
    const stagger = options.stagger || 0;
    const baseDelay = options.delay || 0;
    const timingFn = adaireEaseToCSS(ease);

    let maxTime = 0;
    els.forEach((el, index) => {
        const itemDelay = baseDelay + index * stagger;
        maxTime = Math.max(maxTime, itemDelay + duration);
        const transitionProps = ['opacity', 'transform', 'box-shadow', 'color'];
        el.style.transition = transitionProps
            .map((p) => `${p} ${duration}s ${timingFn} ${itemDelay}s`)
            .join(', ');
        // Force reflow so the transition is registered before the next style write.
        void el.offsetHeight;
    });

    window.requestAnimationFrame(() => {
        els.forEach((el) => adaireApplyProps(el, props));
    });

    if (options.onComplete) {
        setTimeout(options.onComplete, maxTime * 1000 + 30);
    }

    return els;
}

// Sets a starting style instantly, then animates to the target style on the next frame.
function cssFromTo(elements, fromConfig, toConfig) {
    const els = adaireToArray(elements);
    const { options: toOptions } = adaireSplitAnimConfig(toConfig);

    if (els.length === 0) {
        if (toOptions.onComplete) toOptions.onComplete();
        return els;
    }

    const { props: fromProps } = adaireSplitAnimConfig(fromConfig);
    els.forEach((el) => {
        el.style.transition = 'none';
        adaireApplyProps(el, fromProps);
        void el.offsetHeight;
    });

    window.requestAnimationFrame(() => {
        cssTo(els, toConfig);
    });

    return els;
}

// Plays the keyframe-based bounce-in effect used by animationType: 'bounceIn'.
function cssBounceIn(el, duration, delay, onComplete) {
    el.style.transition = 'none';
    el.style.opacity = 0;
    el.style.transform = 'scale(0.3)';
    void el.offsetHeight;
    el.style.animation = `adaireBlocksBounceIn ${duration}s ${delay}s both`;
    const cleanup = () => {
        el.style.animation = '';
        if (onComplete) onComplete();
    };
    setTimeout(cleanup, (duration + delay) * 1000 + 30);
}

// Fires `callback` once, the first time `el` scrolls into view - the same
// "animate in on first scroll into view" pattern the old scroll-trigger
// setup provided. `startPercent` mirrors that library's `start: 'top X%'`
// option (0-100).
function adaireObserveEntrance(el, startPercent, callback, observerBag) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
        callback();
        return;
    }
    const bottomMargin = -(100 - startPercent);
    const observer = new window.IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback();
                    observer.disconnect();
                }
            });
        },
        { root: null, rootMargin: `0px 0px ${bottomMargin}% 0px`, threshold: 0 }
    );
    observer.observe(el);
    if (observerBag) observerBag.push(observer);
}

document.addEventListener('DOMContentLoaded', function() {
    const postsCarouselBlocks = document.querySelectorAll('.adaire-posts-carousel');
    if (postsCarouselBlocks.length === 0) {
        console.warn('[Posts Carousel Block] No posts carousel blocks found on page - script will not initialize');
        return;
    }
    
    // Debug: Check if CSS is loaded
    const styleSheets = Array.from(document.styleSheets);
    const postsCarouselCSS = styleSheets.find(sheet => {
        try {
            return sheet.href && sheet.href.includes('posts-carousel-block');
        } catch (e) {
            return false;
        }
    });
    postsCarouselBlocks.forEach(postsCarousel => {
        const blockId = postsCarousel.getAttribute('data-block-id');
        const postsPerPage = parseInt(postsCarousel.getAttribute('data-posts-per-page')) || 6;
        const enablePagination = postsCarousel.getAttribute('data-enable-pagination') === 'true';
        const paginationStyle = postsCarousel.getAttribute('data-pagination-style') || 'numbers';
        const selectedCategories = JSON.parse(postsCarousel.getAttribute('data-selected-categories') || '[]');
        const selectedPosts = JSON.parse(postsCarousel.getAttribute('data-selected-posts') || '[]');
        const postType = postsCarousel.getAttribute('data-post-type') || 'post';
        const excludeCurrentPost = postsCarousel.getAttribute('data-exclude-current-post') === 'true';
        const showCategories = postsCarousel.getAttribute('data-show-categories') === 'true';
        const showDate = postsCarousel.getAttribute('data-show-date') === 'true';
        const showAuthor = postsCarousel.getAttribute('data-show-author') === 'true';
        const showReadTime = postsCarousel.getAttribute('data-show-read-time') === 'true';
        const showExcerpt = postsCarousel.getAttribute('data-show-excerpt') === 'true';
        const excerptLength = parseInt(postsCarousel.getAttribute('data-excerpt-length')) || 20;
        const layoutType = postsCarousel.getAttribute('data-layout-type') || 'normal';
        const enableFiltering = postsCarousel.getAttribute('data-enable-filtering') === 'true';
        const filterPosition = postsCarousel.getAttribute('data-filter-position') || 'top';
        const filterStyle = postsCarousel.getAttribute('data-filter-style') || 'pills';
        const enableAnimations = postsCarousel.getAttribute('data-enable-animations') === 'true';
        const animationType = postsCarousel.getAttribute('data-animation-type') || 'fadeUp';
        const transitionAnimation = postsCarousel.getAttribute('data-transition-animation') || 'fade';
        const animationDuration = parseFloat(postsCarousel.getAttribute('data-animation-duration')) || 0.6;
        const animationDelay = parseFloat(postsCarousel.getAttribute('data-animation-delay')) || 0.1;
        const animationEase = postsCarousel.getAttribute('data-animation-ease') || 'power2.out';
        const enableHoverEffects = postsCarousel.getAttribute('data-enable-hover-effects') === 'true';
        const hoverScale = parseFloat(postsCarousel.getAttribute('data-hover-scale')) || 1.05;
        const hoverShadow = postsCarousel.getAttribute('data-hover-shadow') === 'true';
        
        let currentFilter = 'all';
        let allPosts = [];
        let filteredPosts = [];
        let currentPage = 1;
        let totalPages = 1;
        let categoriesData = {}; // Store category details for display
        const activeObservers = []; // IntersectionObservers created by this block instance

        // Carousel-specific variables
        let carouselWrapper = null;
        let carouselTrack = null;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        
        // Drag cursor variables
        const dragCursor = postsCarousel.querySelector('.adaire-posts-carousel__drag-cursor');
        const dragCursorText = postsCarousel.getAttribute('data-drag-cursor-text') || 'Drag';
        let isHovering = false;
        let isOverContent = false;
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let cursorAnimationId = null;

        // Initialize the posts carousel
        initPostsCarousel();
        
        // Initialize drag cursor
        setupDragCursor();
        
        function setupDragCursor() {
            if (!dragCursor || !carouselWrapper) {
                // Try to get carouselWrapper if not yet available
                const wrapper = postsCarousel.querySelector('.adaire-posts-carousel__wrapper');
                if (!wrapper || !dragCursor) return;
                carouselWrapper = wrapper;
            }
            
            // Initial state - hidden and scaled down
            cssSet(dragCursor, {
                opacity: 0,
                scale: 0,
                xPercent: -50,
                yPercent: -50,
                pointerEvents: 'none'
            });
            
            // Mouse event handlers
            const handleMouseMove = (e) => {
                // Get position relative to the main block container
                const rect = postsCarousel.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                
                // Check if over text content
                const wasOverContent = isOverContent;
                isOverContent = isOverTextContent(e.target);
                
                // Handle cursor visibility based on content hover
                if (dragCursor && !isDragging) {
                    if (isOverContent && !wasOverContent) {
                        // Just entered content area - hide cursor
                        cssTo(dragCursor, {
                            opacity: 0,
                            scale: 0,
                            duration: 0.15,
                            ease: 'power2.in'
                        });
                    } else if (!isOverContent && wasOverContent && isHovering) {
                        // Just left content area - show cursor
                        cssTo(dragCursor, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.25,
                            ease: 'back.out(1.5)'
                        });
                    }
                }
            };
            
            const handleMouseEnter = (e) => {
                isHovering = true;
                const rect = postsCarousel.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
                
                // Check if entering over content
                isOverContent = isOverTextContent(e.target);
                
                // Set initial cursor position immediately
                cursorX = mouseX;
                cursorY = mouseY;
                
                if (dragCursor) {
                    cssSet(dragCursor, {
                        x: mouseX,
                        y: mouseY
                    });

                    // Only show cursor if not over content area
                    if (!isOverContent) {
                        cssTo(dragCursor, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.35,
                            ease: 'back.out(2)'
                        });
                    }
                }
            };

            const handleMouseLeave = () => {
                isHovering = false;
                isOverContent = false;

                if (dragCursor) {
                    cssTo(dragCursor, {
                        opacity: 0,
                        scale: 0,
                        duration: 0.2,
                        ease: 'power2.in'
                    });
                }
            };
            
            // Add event listeners to the wrapper element
            carouselWrapper.addEventListener('mousemove', handleMouseMove);
            carouselWrapper.addEventListener('mouseenter', handleMouseEnter);
            carouselWrapper.addEventListener('mouseleave', handleMouseLeave);
            
            // Start cursor animation loop
            animateCursor();
        }
        
        function isOverTextContent(target) {
            if (!target) return false;
            
            const contentSelectors = [
                '.adaire-posts-carousel__content',
                '.adaire-posts-carousel__title',
                '.adaire-posts-carousel__excerpt',
                '.adaire-posts-carousel__categories',
                '.adaire-posts-carousel__meta',
                'h3', 'p', 'span', 'a'
            ];
            
            for (const selector of contentSelectors) {
                if (target.matches && target.matches(selector)) return true;
                if (target.closest && target.closest(selector)) return true;
            }
            
            return false;
        }
        
        function animateCursor() {
            if (!dragCursor) return;
            
            // Smooth cursor following with lerp
            const lerp = 0.12;
            
            cursorX += (mouseX - cursorX) * lerp;
            cursorY += (mouseY - cursorY) * lerp;
            
            if (isHovering || isDragging) {
                cssSet(dragCursor, {
                    x: cursorX,
                    y: cursorY
                });
            }
            
            cursorAnimationId = requestAnimationFrame(animateCursor);
        }

        async function initPostsCarousel() {
            try {
                // Fetch posts from WordPress REST API
                const posts = await fetchPosts();
                allPosts = posts;
                filteredPosts = posts;

                // Setup filtering if enabled
                if (enableFiltering) {
                    setupFiltering();
                }

                // Render posts (initial render, no page transition)
                renderPosts(true); // Pass true for initial render
                
                // Setup carousel drag functionality after posts are rendered
                // (renderPosts will call setupCarouselDrag internally)

                // Setup hover effects if enabled
                if (enableHoverEffects) {
                    setupHoverEffects();
                }

            } catch (error) {
                console.error('Error initializing posts carousel:', error);
                showError();
            }
        }
        
        function setupCarouselDrag() {
            // Get fresh references to elements
            const wrapper = postsCarousel.querySelector('.adaire-posts-carousel__wrapper');
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            
            if (!wrapper || !track) {
                // Elements not ready yet, skip silently
                return;
            }
            
            // If we already have references and they're the same elements, skip re-initialization
            if (carouselWrapper === wrapper && carouselTrack === track && carouselWrapper.dataset.dragInitialized === 'true') {
                return;
            }
            
            // Update the module-level variables
            carouselWrapper = wrapper;
            carouselTrack = track;
            
            // Mark as initialized
            carouselWrapper.dataset.dragInitialized = 'true';
            
            // Cache wrapper position to avoid layout recalculation
            let wrapperLeft = 0;
            let rafId = null;
            let momentumRafId = null;
            let lastX = 0;
            let lastTime = 0;
            let velocity = 0;
            let isMomentumScrolling = false;
            
            // Momentum scrolling function
            const applyMomentum = () => {
                const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
                const currentScroll = carouselTrack.scrollLeft;
                
                // Check boundaries
                if (currentScroll <= 0 && velocity < 0) {
                    isMomentumScrolling = false;
                    velocity = 0;
                    carouselTrack.style.scrollBehavior = 'smooth';
                    carouselTrack.style.scrollSnapType = 'x mandatory';
                    return;
                }
                
                if (currentScroll >= maxScroll && velocity > 0) {
                    isMomentumScrolling = false;
                    velocity = 0;
                    carouselTrack.style.scrollBehavior = 'smooth';
                    carouselTrack.style.scrollSnapType = 'x mandatory';
                    return;
                }
                
                if (Math.abs(velocity) < 0.5) {
                    isMomentumScrolling = false;
                    velocity = 0;
                    carouselTrack.style.scrollBehavior = 'smooth';
                    carouselTrack.style.scrollSnapType = 'x mandatory';
                    return;
                }
                
                carouselTrack.scrollLeft += velocity;
                velocity *= 0.92; // Friction factor (slightly faster decay for more natural feel)
                
                momentumRafId = requestAnimationFrame(applyMomentum);
            };
            
            // Mouse events
            const handleMouseDown = (e) => {
                isDragging = true;
                isMomentumScrolling = false;
                velocity = 0;
                lastX = e.clientX;
                lastTime = Date.now();
                
                // Stop any momentum scrolling
                if (momentumRafId) {
                    cancelAnimationFrame(momentumRafId);
                    momentumRafId = null;
                }
                
                // Cache wrapper position once at start
                const rect = carouselWrapper.getBoundingClientRect();
                wrapperLeft = rect.left;
                startX = e.clientX - wrapperLeft;
                scrollLeft = carouselTrack.scrollLeft;
                carouselWrapper.style.cursor = 'grabbing';
                carouselWrapper.style.userSelect = 'none';
                // Disable smooth scrolling and scroll-snap during drag for better performance
                carouselTrack.style.scrollBehavior = 'auto';
                carouselTrack.style.scrollSnapType = 'none';
                
                // Shrink cursor when dragging starts
                if (dragCursor) {
                    cssTo(dragCursor, {
                        scale: 0.6,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                }
                
                e.preventDefault();
            };
            
            const handleMouseMove = (e) => {
                if (!isDragging) return;
                
                const currentX = e.clientX;
                const currentTime = Date.now();
                const deltaX = currentX - lastX;
                const deltaTime = currentTime - lastTime;
                
                // Calculate velocity for momentum (negative because dragging left should scroll left)
                // Velocity should be opposite of mouse movement direction
                if (deltaTime > 0) {
                    // When dragging left (negative deltaX), we want positive scroll (scroll left)
                    // When dragging right (positive deltaX), we want negative scroll (scroll right)
                    velocity = -(deltaX * 2) / deltaTime * 16; // Normalize to 60fps, inverted for correct direction
                }
                
                lastX = currentX;
                lastTime = currentTime;
                
                // Cancel any pending animation frame
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                
                // Use requestAnimationFrame for smooth updates with easing
                rafId = requestAnimationFrame(() => {
                    const x = e.clientX - wrapperLeft;
                    const walk = (x - startX) * 2; // Scroll speed multiplier
                    // Smooth interpolation for less rigid movement
                    const currentScroll = carouselTrack.scrollLeft;
                    const targetScroll = scrollLeft - walk;
                    const diff = targetScroll - currentScroll;
                    // Apply easing for smoother movement (0.6 = more responsive, still smooth)
                    carouselTrack.scrollLeft = currentScroll + diff * 0.6; // Easing factor
                });
                
                e.preventDefault();
            };
            
            const handleMouseUp = () => {
                isDragging = false;
                carouselWrapper.style.cursor = 'grab';
                carouselWrapper.style.userSelect = '';
                
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                
                // Return cursor to normal size
                if (isHovering && dragCursor) {
                    cssTo(dragCursor, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'back.out(2)'
                    });
                }
                
                // Apply momentum scrolling if there's enough velocity
                if (Math.abs(velocity) > 1) {
                    isMomentumScrolling = true;
                    carouselTrack.style.scrollBehavior = 'auto';
                    carouselTrack.style.scrollSnapType = 'none';
                    applyMomentum();
                } else {
                    // Re-enable smooth scrolling and scroll-snap after drag
                    carouselTrack.style.scrollBehavior = 'smooth';
                    carouselTrack.style.scrollSnapType = 'x mandatory';
                }
            };
            
            const handleMouseLeave = () => {
                if (isDragging) {
                    // Treat mouse leave as mouse up for momentum
                    handleMouseUp();
                }
                carouselWrapper.style.cursor = 'grab';
            };
            
            carouselWrapper.addEventListener('mousedown', handleMouseDown);
            carouselWrapper.addEventListener('mouseleave', handleMouseLeave);
            carouselWrapper.addEventListener('mouseup', handleMouseUp);
            // Use document for mousemove to catch mouse movements outside wrapper
            document.addEventListener('mousemove', handleMouseMove);
            
            // Touch events for mobile
            let touchStartX = 0;
            let touchScrollLeft = 0;
            let touchWrapperLeft = 0;
            let touchLastX = 0;
            let touchLastTime = 0;
            let touchVelocity = 0;
            
            const handleTouchStart = (e) => {
                isDragging = true;
                touchVelocity = 0;
                touchLastX = e.touches[0].clientX;
                touchLastTime = Date.now();
                
                // Stop any momentum scrolling
                if (momentumRafId) {
                    cancelAnimationFrame(momentumRafId);
                    momentumRafId = null;
                }
                
                const rect = carouselWrapper.getBoundingClientRect();
                touchWrapperLeft = rect.left;
                touchStartX = e.touches[0].clientX - touchWrapperLeft;
                touchScrollLeft = carouselTrack.scrollLeft;
                carouselTrack.style.scrollBehavior = 'auto';
                carouselTrack.style.scrollSnapType = 'none';
            };
            
            const handleTouchMove = (e) => {
                if (!touchStartX) return;
                
                const currentX = e.touches[0].clientX;
                const currentTime = Date.now();
                const deltaX = currentX - touchLastX;
                const deltaTime = currentTime - touchLastTime;
                
                // Calculate velocity for momentum (negative because dragging left should scroll left)
                // Velocity should be opposite of touch movement direction
                if (deltaTime > 0) {
                    // When dragging left (negative deltaX), we want positive scroll (scroll left)
                    // When dragging right (positive deltaX), we want negative scroll (scroll right)
                    touchVelocity = -(deltaX * 2) / deltaTime * 16; // Normalize to 60fps, inverted for correct direction
                }
                
                touchLastX = currentX;
                touchLastTime = currentTime;
                
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                
                rafId = requestAnimationFrame(() => {
                    const x = e.touches[0].clientX - touchWrapperLeft;
                    const walk = (x - touchStartX) * 2;
                    // Smooth interpolation for less rigid movement
                    const currentScroll = carouselTrack.scrollLeft;
                    const targetScroll = touchScrollLeft - walk;
                    const diff = targetScroll - currentScroll;
                    // Apply easing for smoother movement (0.6 = more responsive, still smooth)
                    carouselTrack.scrollLeft = currentScroll + diff * 0.6; // Easing factor
                });
                
                e.preventDefault();
            };
            
            const handleTouchEnd = () => {
                isDragging = false;
                
                // Apply momentum scrolling if there's enough velocity
                if (Math.abs(touchVelocity) > 1) {
                    velocity = touchVelocity;
                    isMomentumScrolling = true;
                    carouselTrack.style.scrollBehavior = 'auto';
                    carouselTrack.style.scrollSnapType = 'none';
                    applyMomentum();
                } else {
                    carouselTrack.style.scrollBehavior = 'smooth';
                    carouselTrack.style.scrollSnapType = 'x mandatory';
                }
                
                touchStartX = 0;
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            };
            
            carouselWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
            carouselWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
            carouselWrapper.addEventListener('touchend', handleTouchEnd);
            
            // Set initial cursor
            carouselWrapper.style.cursor = 'grab';
        }

        async function fetchPosts() {
            // Convert post type to REST API endpoint (e.g., 'post' -> 'posts')
            const apiEndpoint = postType === 'post' ? 'posts' : postType;
            
            // Try to get the REST API root URL from WordPress
            const restUrl = window.wpApiSettings?.root || '/wp-json/';
            const baseUrl = restUrl.endsWith('/') ? restUrl : restUrl + '/';
            
            // Fetch more posts than postsPerPage to enable pagination (fetch up to 100 posts)
            let apiUrl = `${baseUrl}wp/v2/${apiEndpoint}?per_page=100&_embed=1`;
            
            // Add category filter if categories are selected
            if (selectedCategories.length > 0) {
                apiUrl += `&categories=${selectedCategories.join(',')}`;
            }

            // Add specific posts filter if posts are selected
            if (selectedPosts.length > 0) {
                apiUrl += `&include=${selectedPosts.join(',')}`;
            }

            // Exclude current post if enabled
            if (excludeCurrentPost && window.adaireCurrentPostId) {
                apiUrl += `&exclude=${window.adaireCurrentPostId}`;
            }
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    // Try to get error details
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
                    } catch (e) {
                        // Couldn't parse error response
                    }
                    
                    console.error('[Posts Carousel Block] REST API Error:', errorMessage);
                    console.error('[Posts Carousel Block] This usually means:');
                    console.error('1. REST API is disabled or blocked');
                    console.error('2. Pretty permalinks are not enabled');
                    console.error('3. Security plugin is blocking REST API');
                    console.error('4. The post type does not exist');
                    
                    throw new Error(errorMessage);
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('[Posts Carousel Block] Error fetching posts:', error);
                console.error('[Posts Carousel Block] API URL attempted:', apiUrl);
                
                // Show error in the grid
                showError('Unable to load posts. Please check if WordPress REST API is enabled and accessible.');
                
                // Return empty array to prevent further errors
                return [];
            }
        }

        function setupFiltering() {
            const filterContainer = postsCarousel.querySelector('.adaire-posts-carousel__filters');
            if (!filterContainer) return;

            const filterList = filterContainer.querySelector('.adaire-posts-carousel__filter-list');
            if (!filterList) return;

            // Clear existing filters
            filterList.innerHTML = '';

            // Add "All" filter
            const allFilter = createFilterButton('all', 'All');
            filterList.appendChild(allFilter);

            // Get unique categories from posts
            const categories = [...new Set(allPosts.flatMap(post => post.categories || []))];
            
            // Fetch category details and add filter buttons
            fetchCategoryDetails(categories).then(categoryDetails => {
                // Store category details for use in card rendering
                categoryDetails.forEach(cat => {
                    categoriesData[cat.id] = cat.name;
                });
                categoryDetails.forEach(category => {
                    const filterBtn = createFilterButton(category.id, category.name);
                    filterList.appendChild(filterBtn);
                });
            });

            // Add click handlers
            filterList.addEventListener('click', handleFilterClick);
        }
        
        function createCategoriesHTML(categories) {
            if (!categories || categories.length === 0) return '';
            
            // Filter to only show selected categories (if any are selected)
            const categoriesToShow = selectedCategories.length > 0
                ? categories.filter(catId => selectedCategories.includes(catId))
                : categories;
            
            if (categoriesToShow.length === 0) return '';
            
            return categoriesToShow.slice(0, 1).map(catId => {
                const categoryName = categoriesData[catId] || `Category ${catId}`;
                return `<span class="adaire-posts-carousel__category">${categoryName}</span>`;
            }).join('');
        }

        async function fetchCategoryDetails(categoryIds) {
            if (categoryIds.length === 0) return [];
            
            try {
                const restUrl = window.wpApiSettings?.root || '/wp-json/';
                const baseUrl = restUrl.endsWith('/') ? restUrl : restUrl + '/';
                const apiUrl = `${baseUrl}wp/v2/categories?include=${categoryIds.join(',')}`;
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    console.warn('[Posts Carousel Block] Failed to fetch category details');
                    return [];
                }
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('[Posts Carousel Block] Error fetching category details:', error);
                return [];
            }
        }

        function createFilterButton(value, label) {
            const button = document.createElement('button');
            button.className = `adaire-posts-carousel__filter-btn adaire-posts-carousel__filter-btn--${filterStyle}`;
            button.textContent = label;
            button.setAttribute('data-filter', value);
            
            if (value === 'all') {
                button.classList.add('is-active');
            }
            
            return button;
        }

        function handleFilterClick(e) {
            if (!e.target.classList.contains('adaire-posts-carousel__filter-btn')) return;

            const filterValue = e.target.getAttribute('data-filter');
            if (filterValue === currentFilter) return;

            // Update active filter
            const filterButtons = postsCarousel.querySelectorAll('.adaire-posts-carousel__filter-btn');
            filterButtons.forEach(btn => btn.classList.remove('is-active'));
            e.target.classList.add('is-active');

            currentFilter = filterValue;
            filterPosts(filterValue);
        }

        function getExitAnimation(type) {
            switch(type) {
                case 'fade':
                    return { opacity: 0 };
                case 'fadeUp':
                    return { opacity: 0, y: -20 };
                case 'fadeDown':
                    return { opacity: 0, y: 20 };
                case 'scale':
                    return { opacity: 0, scale: 0.8 };
                case 'slideLeft':
                    return { opacity: 0, x: -50 };
                case 'slideRight':
                    return { opacity: 0, x: 50 };
                case 'flip':
                    return { opacity: 0, rotationY: 90 };
                case 'flipPosition':
                    return { opacity: 0, scale: 0.9 }; // Will use FLIP plugin later
                default:
                    return { opacity: 0 };
            }
        }

        function getEnterAnimation(type) {
            switch(type) {
                case 'fade':
                    return { from: { opacity: 0 }, to: { opacity: 1 } };
                case 'fadeUp':
                    return { from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 } };
                case 'fadeDown':
                    return { from: { opacity: 0, y: -30 }, to: { opacity: 1, y: 0 } };
                case 'scale':
                    return { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1 } };
                case 'slideLeft':
                    return { from: { opacity: 0, x: 50 }, to: { opacity: 1, x: 0 } };
                case 'slideRight':
                    return { from: { opacity: 0, x: -50 }, to: { opacity: 1, x: 0 } };
                case 'flip':
                    return { from: { opacity: 0, rotationY: -90 }, to: { opacity: 1, rotationY: 0 } };
                case 'flipPosition':
                    return { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1 } };
                default:
                    return { from: { opacity: 0 }, to: { opacity: 1 } };
            }
        }

        function filterPosts(filterValue) {
            currentPage = 1; // Reset to first page when filtering
            
            // Store current post IDs for FLIP animation
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            const currentPostIds = track ? Array.from(track.children).map(child => 
                parseInt(child.querySelector('[data-post-id]')?.getAttribute('data-post-id'))
            ).filter(id => !isNaN(id)) : [];
            
            if (filterValue === 'all') {
                filteredPosts = allPosts;
            } else {
                const categoryId = parseInt(filterValue);
                filteredPosts = allPosts.filter(post => 
                    post.categories && post.categories.includes(categoryId)
                );
            }
            // Use FLIP animation if selected, otherwise use regular transition
            if (transitionAnimation === 'flipPosition') {
                renderPostsWithFLIP(currentPostIds);
            } else {
                renderPosts();
            }
        }

        function renderPostsWithFLIP(currentPostIds, shouldScroll = true) {
            // Scroll to grid top first
            if (shouldScroll) {
                scrollToGrid();
            }
            
            const grid = postsCarousel.querySelector('.adaire-posts-carousel__grid');
            if (!grid) return;
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            if (!track) return;

            // Calculate which posts to show
            totalPages = Math.ceil(filteredPosts.length / postsPerPage);
            const startIndex = (currentPage - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            const postsToShow = filteredPosts.slice(startIndex, endIndex);
            const newPostIds = postsToShow.map(p => p.id);

            // Identify posts to keep, remove, and add
            const postsToKeep = currentPostIds.filter(id => newPostIds.includes(id));
            const postsToRemove = currentPostIds.filter(id => !newPostIds.includes(id));
            const postsToAdd = newPostIds.filter(id => !currentPostIds.includes(id));
            // FLIP Technique: First, Last, Invert, Play
            
            // 1. FIRST: Record positions of all current elements
            const allElements = Array.from(track.children);
            const firstPositions = new Map();
            allElements.forEach(el => {
                const postId = el.querySelector('[data-post-id]')?.getAttribute('data-post-id');
                if (postId) {
                    const rect = el.getBoundingClientRect();
                    firstPositions.set(postId, {
                        x: rect.left,
                        y: rect.top,
                        element: el
                    });
                }
            });

            // Animate out posts to remove
            const elementsToRemove = allElements.filter(child => {
                const postId = child.querySelector('[data-post-id]')?.getAttribute('data-post-id');
                return postId && postsToRemove.includes(parseInt(postId));
            });

            // Fade out removing elements
            if (elementsToRemove.length > 0) {
                cssTo(elementsToRemove, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.2,
                    stagger: 0.02,
                    ease: 'linear'
                });
            }

            // Wait for removal animation, then do DOM changes and FLIP
            setTimeout(() => {
                // Remove the elements
                elementsToRemove.forEach(el => el.remove());
                
                // 2. LAST: Make DOM changes
                // Clear track and re-render in correct order
                const remainingElements = Array.from(track.children);
                track.innerHTML = '';
                
                // Re-add posts in new order
                postsToShow.forEach(post => {
                    // Check if this post already has an element (to keep)
                    const existingElement = remainingElements.find(el => {
                        const postId = el.querySelector('[data-post-id]')?.getAttribute('data-post-id');
                        return postId && parseInt(postId) === post.id;
                    });
                    
                    if (existingElement) {
                        // Re-use existing element
                        track.appendChild(existingElement);
                    } else {
                        // Create new element
                        const postElement = createPostElement(post, postsToShow.indexOf(post));
                        track.appendChild(postElement);
                    }
                });

                // 3. INVERT & PLAY: Animate from old to new positions
                const allNewElements = Array.from(track.children);
                const elementsToAnimate = [];
                const newElements = [];

                allNewElements.forEach(el => {
                    const postId = el.querySelector('[data-post-id]')?.getAttribute('data-post-id');
                    const firstPos = firstPositions.get(postId);
                    
                    if (firstPos) {
                        // This element existed before - animate position change
                        const lastPos = el.getBoundingClientRect();
                        const deltaX = firstPos.x - lastPos.x;
                        const deltaY = firstPos.y - lastPos.y;
                        
                        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
                            // Position changed - animate it with linear easing (no spring/bounce)
                            cssFromTo(el,
                                { x: deltaX, y: deltaY },
                                { x: 0, y: 0, duration: 0.3, ease: 'linear' }
                            );
                        }
                    } else {
                        // New element - will fade in
                        newElements.push(el);
                    }
                });

                // Animate in new posts
                if (newElements.length > 0) {
                    cssFromTo(newElements,
                        { opacity: 0, scale: 0.8 },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.3,
                            stagger: 0.04,
                            ease: 'linear'
                        }
                    );
                }

                // Clean up after all animations
                setTimeout(() => {
                    initializeHoverEffects();
                    setupCarouselDrag();
                    
                    // Render pagination after everything is complete
                    if (enablePagination && totalPages > 1) {
                        renderPagination();
                    }
                }, 500);

            }, elementsToRemove.length > 0 ? 250 : 0);
        }

        function renderPosts(isInitialRender = false) {
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            if (!track) {
                console.error('Posts Carousel Block: Carousel track element not found');
                return;
            }
            // Calculate pagination
            totalPages = Math.ceil(filteredPosts.length / postsPerPage);
            const startIndex = (currentPage - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            const postsToShow = filteredPosts.slice(startIndex, endIndex);

            // Fade out old posts (only if there are existing posts AND not initial render)
            const shouldAnimate = enableAnimations && track.children.length > 0 && !isInitialRender;
            if (shouldAnimate) {
                const exitAnimation = getExitAnimation(transitionAnimation);
                cssTo(track.children, {
                    ...exitAnimation,
                    duration: animationDuration * 0.6,
                    stagger: animationDelay * 0.5,
                    ease: animationEase,
                    onComplete: () => {
                        // Clear existing posts
                        track.innerHTML = '';

                        // Render each post for current page
                        postsToShow.forEach((post, index) => {
                            const postElement = createPostElement(post, index);
                            track.appendChild(postElement);
                        });
                        // Setup carousel drag again after rendering
                        setupCarouselDrag();

                        // Fade in new posts
                        const enterAnimation = getEnterAnimation(transitionAnimation);
                        cssFromTo(track.children,
                            enterAnimation.from,
                            {
                                ...enterAnimation.to,
                                duration: animationDuration,
                                stagger: animationDelay,
                                ease: animationEase,
                                onComplete: () => {
                                    // Wait for all staggered animations to complete
                                    const totalDuration = animationDuration + (animationDelay * track.children.length);
                                    setTimeout(() => {
                                        initializeHoverEffects();
                                    }, totalDuration * 100);
                                }
                            }
                        );
                    }
                });
            } else {
                // Initial render OR animations disabled - prevent flash
                const hasExistingPosts = track.children.length > 0;
                
                // If there are existing posts and it's not initial render, fade out first to prevent flash
                if (hasExistingPosts && !isInitialRender) {
                    cssTo(track.children, {
                        opacity: 0,
                        duration: 0.15,
                        ease: 'linear',
                        onComplete: () => {
                            track.innerHTML = '';

                            postsToShow.forEach((post, index) => {
                                const postElement = createPostElement(post, index);
                                track.appendChild(postElement);
                            });
                            // Setup carousel drag again after rendering
                            setupCarouselDrag();

                            // Fade in new posts
                            cssFromTo(track.children,
                                { opacity: 0 },
                                {
                                    opacity: 1,
                                    duration: 0.2,
                                    ease: 'linear',
                                    onComplete: () => {
                                        initializeHoverEffects();
                                    }
                                }
                            );
                        }
                    });
                } else {
                    // Initial render - just render without transition
                    track.innerHTML = '';

                    postsToShow.forEach((post, index) => {
                        const postElement = createPostElement(post, index);
                        track.appendChild(postElement);
                    });
                    // Setup carousel drag after rendering
                    setupCarouselDrag();
                    
                    // Only fade in on initial render, not on page switches
                    if (enableAnimations && isInitialRender) {
                        const enterAnimation = getEnterAnimation(transitionAnimation);
                        cssFromTo(track.children,
                            enterAnimation.from,
                            {
                                ...enterAnimation.to,
                                duration: animationDuration,
                                stagger: animationDelay,
                                ease: animationEase,
                                onComplete: () => {
                                    // Clear inline animation styles after animation completes
                                    initializeHoverEffects();
                                }
                            }
                        );
                    } else {
                        // Re-initialize hover effects
                        initializeHoverEffects();
                    }
                }
            }
            
            // Render pagination
            if (enablePagination && totalPages > 1) {
                renderPagination();
            } else {
                // Clear pagination if not needed
                const paginationContainer = postsCarousel.querySelector('.adaire-posts-carousel__pagination');
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                } else {
                }
            }
        }

        function createPostElement(post, index) {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'adaire-posts-carousel__slide';
            slideDiv.setAttribute('data-post-id', post.id);
            slideDiv.setAttribute('data-post-categories', JSON.stringify(post.categories || []));
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'adaire-posts-carousel__item';
            // Remove cursor pointer and click handler - only title link is clickable

            const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            
            // Get the first category name
            let categoryName = 'ARTICLE'; // Default fallback
            if (post.categories && post.categories.length > 0) {
                const firstCategoryId = post.categories[0];
                categoryName = categoriesData[firstCategoryId] || 'ARTICLE';
            }

            // Simple layout: Image, Category, Title only
            let postHTML = `
                <div class="adaire-posts-carousel__image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${post.title.rendered}" loading="lazy" />` :
                        `<div class="adaire-posts-carousel__image-placeholder"><span>No Image</span></div>`
                    }
                </div>
                <div class="adaire-posts-carousel__content">
                    <div class="adaire-posts-carousel__categories">
                        <span class="adaire-posts-carousel__category-tag">${categoryName}</span>
                    </div>
                    <h3 class="adaire-posts-carousel__title">
                        <a href="${post.link}" rel="bookmark">${post.title.rendered}</a>
                    </h3>
                </div>
            `;

            itemDiv.innerHTML = postHTML;
            slideDiv.appendChild(itemDiv);
            return slideDiv;
        }

        function createCategoriesHTML(categories) {
            if (!categories || categories.length === 0) return '';
            
            // Filter to only show selected categories (if any are selected)
            const categoriesToShow = selectedCategories.length > 0
                ? categories.filter(catId => selectedCategories.includes(catId))
                : categories;
            
            if (categoriesToShow.length === 0) return '';
            
            return `
                <div class="adaire-posts-carousel__categories">
                    ${categoriesToShow.slice(0, 2).map(catId => {
                        const categoryName = categoriesData[catId] || `Category ${catId}`;
                        return `<span class="adaire-posts-carousel__category">${categoryName}</span>`;
                    }).join('')}
                </div>
            `;
        }

        function createMetaHTML(post, author) {
            if (!showDate && !showAuthor && !showReadTime) return '';

            let metaHTML = '<div class="adaire-posts-carousel__meta">';
            
            if (showDate) {
                const date = new Date(post.date).toLocaleDateString();
                metaHTML += `<span class="adaire-posts-carousel__date">${date}</span>`;
            }
            
            if (showAuthor && author) {
                metaHTML += `<span class="adaire-posts-carousel__author">${author.name}</span>`;
            }
            
            if (showReadTime) {
                metaHTML += `<span class="adaire-posts-carousel__read-time">${calculateReadTime(post.content.rendered)} min read</span>`;
            }
            
            metaHTML += '</div>';
            return metaHTML;
        }

        function truncateText(html, length) {
            const text = html.replace(/<[^>]*>/g, '');
            const words = text.split(' ');
            if (words.length <= length) return text;
            return words.slice(0, length).join(' ') + '...';
        }

        function calculateReadTime(content) {
            const wordsPerMinute = 200;
            const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length;
            return Math.ceil(wordCount / wordsPerMinute);
        }

        function updateGridLayout() {
            // Carousel doesn't need grid layout updates, but we keep this function for compatibility
            // The carousel uses flexbox and scrolls horizontally
        }

        function renderPagination() {
           
            
            const paginationContainer = postsCarousel.querySelector('.adaire-posts-carousel__pagination');
            if (!paginationContainer) {
                console.error('Posts Carousel Block: Pagination container not found');
                return;
            }

            let paginationHTML = '';

            if (paginationStyle === 'numbers') {
                // Page numbers pagination
                paginationHTML = '<div class="adaire-posts-carousel__pagination-wrapper">';
                
                // Previous button
                paginationHTML += `
                    <button 
                        class="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-prev ${currentPage === 1 ? 'is-disabled' : ''}" 
                        ${currentPage === 1 ? 'disabled' : ''}
                        data-action="prev"
                    >
                        <span>â† Previous</span>
                    </button>
                `;

                // Page numbers
                paginationHTML += '<div class="adaire-posts-carousel__pagination-numbers">';
                for (let i = 1; i <= totalPages; i++) {
                    if (
                        i === 1 || 
                        i === totalPages || 
                        (i >= currentPage - 1 && i <= currentPage + 1)
                    ) {
                        paginationHTML += `
                            <button 
                                class="adaire-posts-carousel__pagination-number ${i === currentPage ? 'is-active' : ''}" 
                                data-page="${i}"
                            >
                                ${i}
                            </button>
                        `;
                    } else if (i === currentPage - 2 || i === currentPage + 2) {
                        paginationHTML += '<span class="adaire-posts-carousel__pagination-dots">...</span>';
                    }
                }
                paginationHTML += '</div>';

                // Next button
                paginationHTML += `
                    <button 
                        class="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-next ${currentPage === totalPages ? 'is-disabled' : ''}" 
                        ${currentPage === totalPages ? 'disabled' : ''}
                        data-action="next"
                    >
                        <span>Next â†’</span>
                    </button>
                `;
                
                paginationHTML += '</div>';

            } else if (paginationStyle === 'loadmore') {
                // Load more button
                if (currentPage < totalPages) {
                    paginationHTML = `
                        <div class="adaire-posts-carousel__pagination-wrapper adaire-posts-carousel__pagination-wrapper--loadmore">
                            <button class="adaire-posts-carousel__pagination-loadmore" data-action="loadmore">
                                Load More
                            </button>
                        </div>
                    `;
                }

            } else if (paginationStyle === 'prevnext') {
                // Previous/Next only
                paginationHTML = '<div class="adaire-posts-carousel__pagination-wrapper adaire-posts-carousel__pagination-wrapper--prevnext">';
                
                paginationHTML += `
                    <button 
                        class="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-prev ${currentPage === 1 ? 'is-disabled' : ''}" 
                        ${currentPage === 1 ? 'disabled' : ''}
                        data-action="prev"
                    >
                        <span>â† Previous</span>
                    </button>
                    <span class="adaire-posts-carousel__pagination-info">
                        Page ${currentPage} of ${totalPages}
                    </span>
                    <button 
                        class="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-next ${currentPage === totalPages ? 'is-disabled' : ''}" 
                        ${currentPage === totalPages ? 'disabled' : ''}
                        data-action="next"
                    >
                        <span>Next â†’</span>
                    </button>
                `;
                
                paginationHTML += '</div>';
            }

            paginationContainer.innerHTML = paginationHTML;

            // Add click handlers
            const prevBtn = paginationContainer.querySelector('[data-action="prev"]');
            const nextBtn = paginationContainer.querySelector('[data-action="next"]');
            const pageNumbers = paginationContainer.querySelectorAll('.adaire-posts-carousel__pagination-number');
            const loadMoreBtn = paginationContainer.querySelector('[data-action="loadmore"]');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        scrollToGrid();
                        currentPage--;
                        renderPosts();
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        scrollToGrid();
                        currentPage++;
                        renderPosts();
                    } else {
                    }
                });
            }

            pageNumbers.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const page = parseInt(e.target.getAttribute('data-page'));
                    if (page && page !== currentPage) {
                        scrollToGrid();
                        currentPage = page;
                        renderPosts();
                    }
                });
            });

            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        // For load more, we append instead of replace
                        appendMorePosts();
                    }
                });
            }
        }

        function appendMorePosts() {
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            if (!track) return;

            const startIndex = (currentPage - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            const postsToShow = filteredPosts.slice(startIndex, endIndex);

            postsToShow.forEach((post, index) => {
                const postElement = createPostElement(post, startIndex + index);
                track.appendChild(postElement);
            });

            // Update load more button visibility
            if (currentPage >= totalPages) {
                const paginationContainer = postsCarousel.querySelector('.adaire-posts-carousel__pagination');
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                }
            }

            // Setup carousel drag for new posts
            setupCarouselDrag();
            
            // Setup animations for new posts
            if (enableAnimations) {
                setupAnimations();
            }
        }

        function scrollToGrid() {
            // Get the carousel position relative to the document
            const rect = postsCarousel.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const carouselTop = rect.top + scrollTop - 100;
            window.scrollTo({ 
                top: Math.max(0, carouselTop), 
                behavior: 'smooth' 
            });
        }

        function initializeHoverEffects() {
            // Hover effects are handled by CSS
            // Clear inline animation styles but preserve positioning
            const items = postsCarousel.querySelectorAll('.adaire-posts-carousel__item');

            items.forEach(item => {
                // Only clear animation-related inline styles, not all styles
                cssSet(item, { clearProps: true });

                const img = item.querySelector('.adaire-posts-carousel__image img');
                if (img) {
                    cssSet(img, { clearProps: true });
                }
            });

            // Re-initialize carousel drag after rendering
            setupCarouselDrag();
        }

        function setupAnimations() {
            // NOTE: the original GSAP version queried a `.adaire-posts-carousel__grid`
            // element that does not exist in this block's markup (it only ever
            // renders `.adaire-posts-carousel__track`), so this function always
            // threw and the entrance animation never ran for "Load more" posts.
            // Using the track here is the minimal fix needed to make the
            // animationType/animationEase Inspector controls actually work.
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            if (!track) return;
            const items = track.querySelectorAll('.adaire-posts-carousel__item');

            if (items.length === 0) return;

            // Set initial animation state
            cssSet(items, {
                opacity: 0,
                y: animationType === 'fadeUp' ? 50 : 0,
                scale: animationType === 'scaleUp' ? 0.8 : 1,
                rotation: animationType === 'rotateIn' ? -10 : 0
            });

            // Play the entrance animation once the track scrolls into view
            // (equivalent to the old scroll-triggered timeline with start: 'top 80%').
            adaireObserveEntrance(track, 80, () => {
                items.forEach((item, index) => {
                    const delay = index * animationDelay;

                    switch (animationType) {
                        case 'fadeUp':
                            cssTo(item, {
                                opacity: 1,
                                y: 0,
                                duration: animationDuration,
                                ease: animationEase,
                                delay: delay
                            });
                            break;
                        case 'fadeIn':
                            cssTo(item, {
                                opacity: 1,
                                duration: animationDuration,
                                ease: animationEase,
                                delay: delay
                            });
                            break;
                        case 'scaleUp':
                            cssTo(item, {
                                opacity: 1,
                                scale: 1,
                                duration: animationDuration,
                                ease: animationEase,
                                delay: delay
                            });
                            break;
                        case 'slideUp':
                            cssFromTo(item, {
                                opacity: 0,
                                y: 100
                            }, {
                                opacity: 1,
                                y: 0,
                                duration: animationDuration,
                                ease: animationEase,
                                delay: delay
                            });
                            break;
                        case 'rotateIn':
                            cssTo(item, {
                                opacity: 1,
                                rotation: 0,
                                duration: animationDuration,
                                ease: animationEase,
                                delay: delay
                            });
                            break;
                        case 'bounceIn':
                            // Bounce needs an overshoot, which a single CSS
                            // transition can't express - use @keyframes instead.
                            cssBounceIn(item, animationDuration, delay);
                            break;
                        default:
                            break;
                    }
                });
            }, activeObservers);

            // Animate filter buttons if filtering is enabled
            if (enableFiltering) {
                const filterButtons = postsCarousel.querySelectorAll('.adaire-posts-carousel__filter-btn');
                const filtersContainer = postsCarousel.querySelector('.adaire-posts-carousel__filters');
                adaireObserveEntrance(filtersContainer, 90, () => {
                    cssFromTo(filterButtons,
                        {
                            opacity: 0,
                            y: -20
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: animationDuration,
                            stagger: 0.05,
                            ease: animationEase
                        }
                    );
                }, activeObservers);
            }
        }

        function animateFilterTransition() {
            const items = postsCarousel.querySelectorAll('.adaire-posts-carousel__item');

            // Exit animation
            cssTo(items, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    // Re-render posts
                    renderPosts();

                    // Enter animation
                    const newItems = postsCarousel.querySelectorAll('.adaire-posts-carousel__item');
                    cssFromTo(newItems,
                        {
                            opacity: 0,
                            scale: 0.8
                        },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            stagger: 0.05,
                            ease: 'power2.out'
                        }
                    );
                }
            });
        }

        function setupHoverEffects() {
            // Hover effects disabled - no hover effects on carousel items
            return;
        }
        
        // Re-initialize carousel drag when window resizes
        function handleResize() {
            // (IntersectionObserver-based entrance triggers recalculate
            // automatically and don't need an explicit refresh.)

            // Re-initialize carousel drag
            setupCarouselDrag();
        }

        function showError(message) {
            const track = postsCarousel.querySelector('.adaire-posts-carousel__track');
            if (track) {
                track.innerHTML = `
                    <div class="adaire-posts-carousel__error" style="padding: 40px; text-align: center; background: #fff3cd; border: 1px solid #f0b849; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">âš ï¸ Posts Carousel Error</p>
                        <p style="margin: 0; color: #856404;">${message || 'Sorry, there was an error loading the posts. Please try again later.'}</p>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #856404;">Check browser console for details.</p>
                    </div>
                `;
            }
        }

        window.addEventListener('resize', handleResize);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            activeObservers.forEach(observer => observer.disconnect());
            if (cursorAnimationId) {
                cancelAnimationFrame(cursorAnimationId);
            }
        });
    });
});



