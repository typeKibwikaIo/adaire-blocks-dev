import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

// Register GSAP plugins
gsap.registerPlugin(Flip);

document.addEventListener('DOMContentLoaded', () => {
    initCaseStudiesBlocks();
});

function initCaseStudiesBlocks() {
    const blocks = document.querySelectorAll('.ad-case-studies-block');

    blocks.forEach(block => {
        const isCarouselMode = block.dataset.enableCarousel === 'true';
        if (isCarouselMode) {
            new CaseStudiesCarousel(block);
        } else {
            new CaseStudiesBlock(block);
        }
    });
}

/* =====================================================================
 * Case study popup
 * ---------------------------------------------------------------------
 * Cards are real <a href> links to each case study's own page (good for
 * SEO, crawling, and users without JS). On a normal left-click, we
 * intercept that navigation and open a popup instead: the left column
 * shows the block-wide description/image (same for every card, set once
 * in the block's inspector), the right column shows the specific study's
 * own Project Summary, Client/Country/Industry/Language/Technology, and
 * full write-up. Ctrl/Cmd/Shift/middle-click still navigate normally.
 * ===================================================================== */
let activeCaseStudyPopup = null;

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function popupInfoRow(label, value) {
    if (!value) return '';
    return `<div class="ad-case-studies__popup-info-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function handleCaseStudyPopupKeydown(e) {
    if (e.key === 'Escape') {
        closeCaseStudyPopup();
    }
}

function closeCaseStudyPopup() {
    if (!activeCaseStudyPopup) return;
    document.removeEventListener('keydown', handleCaseStudyPopupKeydown);
    const overlay = activeCaseStudyPopup;
    activeCaseStudyPopup = null;
    document.body.classList.remove('ad-case-studies__popup-open');
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 250);
}

function openCaseStudyPopup(study, popupDescription, popupImageUrl, popupImageAlt) {
    if (!study) return;
    closeCaseStudyPopup();

    const infoRows = [
        popupInfoRow('Client', study.client),
        popupInfoRow('Country', study.country),
        popupInfoRow('Industry', study.industry),
        popupInfoRow('Language', study.language),
        popupInfoRow('Technology', study.technology)
    ].join('');

    const overlay = document.createElement('div');
    overlay.className = 'ad-case-studies__popup';
    overlay.innerHTML = `
        <div class="ad-case-studies__popup-backdrop"></div>
        <div class="ad-case-studies__popup-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(study.title)}">
            <button type="button" class="ad-case-studies__popup-close" aria-label="Close">&times;</button>
            <div class="ad-case-studies__popup-left">
                ${popupImageUrl ? `<img class="ad-case-studies__popup-left-image" src="${escapeHtml(popupImageUrl)}" alt="${escapeHtml(popupImageAlt || '')}" />` : ''}
                ${popupDescription ? `<p class="ad-case-studies__popup-left-description">${escapeHtml(popupDescription)}</p>` : ''}
            </div>
            <div class="ad-case-studies__popup-right">
                <span class="ad-case-studies__popup-eyebrow">Case Study</span>
                <h2 class="ad-case-studies__popup-title">${escapeHtml(study.title)}</h2>
                ${study.summary ? `<div class="ad-case-studies__popup-summary"><h3>${escapeHtml('Project Summary')}</h3><p>${escapeHtml(study.summary)}</p></div>` : ''}
                ${infoRows ? `<dl class="ad-case-studies__popup-info-grid">${infoRows}</dl>` : ''}
                <div class="ad-case-studies__popup-content">${study.content || ''}</div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('ad-case-studies__popup-open');
    activeCaseStudyPopup = overlay;

    overlay.querySelector('.ad-case-studies__popup-close').addEventListener('click', closeCaseStudyPopup);
    overlay.querySelector('.ad-case-studies__popup-backdrop').addEventListener('click', closeCaseStudyPopup);
    document.addEventListener('keydown', handleCaseStudyPopupKeydown);

    requestAnimationFrame(() => overlay.classList.add('is-open'));
}

/**
 * Shared by both the grid and carousel classes: opens the popup for a
 * plain left-click, but lets Ctrl/Cmd/Shift/middle-click through to the
 * browser's normal "open the real page" behavior.
 */
function shouldOpenPopupInstead(e) {
    return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
}

class CaseStudiesBlock {
    constructor(container) {
        this.container = container;
        this.grid = container.querySelector('.ad-case-studies__grid');
        this.cards = Array.from(container.querySelectorAll('.ad-case-studies__card'));
        this.loadMoreBtn = container.querySelector('.ad-case-studies__load-more-btn');
        this.loadingSpinner = container.querySelector('.ad-case-studies__loading-spinner');
        this.industryFilter = container.querySelector('[data-filter-type="industry"]');
        this.capabilityFilter = container.querySelector('[data-filter-type="capability"]');

        // Get configuration from data attributes
        this.caseStudies = JSON.parse(container.dataset.caseStudies || '[]');
        this.initialCount = parseInt(container.dataset.initialCount) || 8;
        this.loadMoreCount = parseInt(container.dataset.loadMoreCount) || 4;
        this.animationDuration = parseFloat(container.dataset.animationDuration) || 0.5;
        this.animationEase = container.dataset.animationEase || 'power2.inOut';
        this.popupDescription = container.dataset.popupDescription || '';
        this.popupImageUrl = container.dataset.popupImage || '';
        this.popupImageAlt = container.dataset.popupImageAlt || '';

        // State
        this.visibleCount = this.initialCount;
        this.currentIndustry = '';
        this.currentCapability = '';
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.setupInitialState();
        this.bindEvents();
        this.bindCardClicks();
        this.updateLoadMoreVisibility();
        this.initHoverAnimations();

        // Assign unique flip IDs to each card for FLIP tracking
        this.cards.forEach((card, index) => {
            card.dataset.flipId = `card-${index}`;
        });
    }

    bindCardClicks() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!shouldOpenPopupInstead(e)) return;
                e.preventDefault();
                const index = parseInt(card.dataset.index, 10);
                const study = this.caseStudies[index];
                openCaseStudyPopup(study, this.popupDescription, this.popupImageUrl, this.popupImageAlt);
            });
        });
    }

    setupInitialState() {
        // Set initial visibility based on initialCount
        this.cards.forEach((card, index) => {
            if (index >= this.initialCount) {
                card.style.display = 'none';
                card.classList.add('ad-case-studies__card--hidden');
            }
        });
    }
    
    bindEvents() {
        // Filter events
        if (this.industryFilter) {
            this.industryFilter.addEventListener('change', (e) => {
                this.currentIndustry = e.target.value;
                this.visibleCount = this.initialCount; // Reset visible count on filter change
                this.filterCards();
            });
        }
        
        if (this.capabilityFilter) {
            this.capabilityFilter.addEventListener('change', (e) => {
                this.currentCapability = e.target.value;
                this.visibleCount = this.initialCount; // Reset visible count on filter change
                this.filterCards();
            });
        }
        
        // Load more event
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }
    }
    
    initHoverAnimations() {
        this.cards.forEach(card => {
            const overlay = card.querySelector('.ad-case-studies__card-overlay');
            const content = card.querySelector('.ad-case-studies__card-content');
            
            card.addEventListener('mouseenter', () => {
                if (this.isAnimating) return;
                gsap.to(card, {
                    scale: parseFloat(getComputedStyle(this.container).getPropertyValue('--cs-hover-scale')) || 1.02,
                    duration: 0.3,
                    ease: 'power2.out',
                    zIndex: 10
                });
                
                if (overlay) {
                    gsap.to(overlay, {
                        backgroundColor: getComputedStyle(this.container).getPropertyValue('--cs-overlay-hover-color'),
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
                
                if (content) {
                    gsap.to(content, {
                        y: -5,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (this.isAnimating) return;
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    zIndex: 1
                });
                
                if (overlay) {
                    gsap.to(overlay, {
                        backgroundColor: getComputedStyle(this.container).getPropertyValue('--cs-overlay-color'),
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
                
                if (content) {
                    gsap.to(content, {
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }
    
    getFilteredCards() {
        // Filter ALL cards regardless of their current visibility state
        return this.cards.filter(card => {
            const industry = card.dataset.industry || '';
            let capabilities = [];
            try {
                capabilities = JSON.parse(card.dataset.capabilities || '[]');
            } catch (e) {
                capabilities = [];
            }
            
            // Check industry filter - empty string means "All Industries"
            const industryMatch = !this.currentIndustry || this.currentIndustry === '' || industry === this.currentIndustry;
            
            // Check capability filter - empty string means "All Capabilities"
            const capabilityMatch = !this.currentCapability || this.currentCapability === '' || capabilities.includes(this.currentCapability);
            
            return industryMatch && capabilityMatch;
        });
    }
    
    filterCards() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Get ALL cards that match the current filters (including hidden ones beyond load more)
        const filteredCards = this.getFilteredCards();
        
        // Only show up to visibleCount cards
        const cardsToShow = filteredCards.slice(0, this.visibleCount);
        
        // All other cards should be hidden (both non-matching AND beyond visibleCount)
        const cardsToHide = this.cards.filter(card => !cardsToShow.includes(card));
        
        // Get currently visible cards (before change)
        const currentlyVisible = this.cards.filter(card => {
            const isHidden = card.style.display === 'none' || 
                             card.classList.contains('ad-case-studies__card--hidden') ||
                             getComputedStyle(card).display === 'none';
            return !isHidden;
        });
        
        // Categorize cards for animation
        // Leaving: currently visible but should be hidden
        const leavingCards = currentlyVisible.filter(card => !cardsToShow.includes(card));
        // Staying: currently visible and should stay visible
        const stayingCards = currentlyVisible.filter(card => cardsToShow.includes(card));
        // Entering: should be visible but currently hidden (includes cards from beyond load more limit!)
        const enteringCards = cardsToShow.filter(card => !currentlyVisible.includes(card));
        
        // Add animating class
        this.grid.classList.add('is-animating');
        
        // Capture current grid height for smooth height animation
        const startHeight = this.grid.offsetHeight;
        
        // STEP 1: Capture FLIP state of staying cards ONLY (before any DOM changes)
        const state = Flip.getState(stayingCards);
        
        // STEP 2: Fade out leaving cards
        if (leavingCards.length > 0) {
            gsap.to(leavingCards, {
                opacity: 0,
                duration: this.animationDuration * 0.3,
                ease: 'power1.out',
                onComplete: () => {
                    this.applyLayoutChange(state, startHeight, stayingCards, enteringCards, leavingCards, cardsToHide, filteredCards.length);
                }
            });
        } else {
            this.applyLayoutChange(state, startHeight, stayingCards, enteringCards, leavingCards, cardsToHide, filteredCards.length);
        }
    }
    
    applyLayoutChange(state, startHeight, stayingCards, enteringCards, leavingCards, cardsToHide, totalFiltered) {
        // STEP 3: Apply DOM changes (this causes instant layout shift)
        
        // Hide leaving cards
        leavingCards.forEach(card => {
            card.classList.add('ad-case-studies__card--hidden');
            card.style.display = 'none';
            // Only clear GSAP animation properties, NOT background-image or other styling
            gsap.set(card, { clearProps: 'opacity,transform,scale,x,y,zIndex' });
        });
        
        // Hide ALL cards that should be hidden (non-matching + beyond visibleCount)
        cardsToHide.forEach(card => {
            card.classList.add('ad-case-studies__card--hidden');
            card.style.display = 'none';
            gsap.set(card, { clearProps: 'opacity,transform,scale,x,y,zIndex' });
        });
        
        // Show entering cards (including ones from beyond original load more limit!)
        // These cards may have been hidden initially, so we need to fully unhide them
        enteringCards.forEach(card => {
            card.classList.remove('ad-case-studies__card--hidden');
            card.style.display = ''; // Clear inline display
            card.style.removeProperty('display'); // Ensure no inline style blocking
            // Only clear animation transforms, preserve background-image
            gsap.set(card, { opacity: 0, clearProps: 'transform,scale,x,y,zIndex' });
        });
        
        // Get new grid height after layout change
        const endHeight = this.grid.offsetHeight;
        
        // STEP 4: Animate grid height
        if (startHeight !== endHeight) {
            gsap.fromTo(this.grid, 
                { height: startHeight },
                { 
                    height: endHeight, 
                    duration: this.animationDuration,
                    ease: 'power1.inOut',
                    clearProps: 'height'
                }
            );
        }
        
        // STEP 5: Animate staying cards from old positions to new positions using FLIP
        if (stayingCards.length > 0) {
            // Add is-flipping class to disable CSS transitions during GSAP animation
            stayingCards.forEach(card => card.classList.add('is-flipping'));
            
            Flip.from(state, {
                targets: stayingCards,
                duration: this.animationDuration,
                ease: 'power1.inOut',
                // Don't use absolute - let CSS Grid handle layout naturally
                // This prevents position conflicts when animation completes
                onComplete: () => {
                    // FLIP has finished - cards are now in their final positions
                    this.animateEnteringCards(enteringCards, totalFiltered, stayingCards);
                }
            });
        } else {
            this.animateEnteringCards(enteringCards, totalFiltered, []);
        }
    }
    
    animateEnteringCards(enteringCards, totalFiltered, stayingCards) {
        // STEP 6: Fade in entering cards
        if (enteringCards.length > 0) {
            // Add is-flipping class to entering cards too
            enteringCards.forEach(card => card.classList.add('is-flipping'));
            
            gsap.to(enteringCards, {
                opacity: 1,
                duration: this.animationDuration * 0.4,
                ease: 'power1.out',
                stagger: 0.03,
                onComplete: () => {
                    this.finishAnimation(totalFiltered, stayingCards, enteringCards);
                }
            });
        } else {
            this.finishAnimation(totalFiltered, stayingCards, []);
        }
    }
    
    finishAnimation(totalFiltered, stayingCards = [], enteringCards = []) {
        this.isAnimating = false;
        this.grid.classList.remove('is-animating');
        
        // Clean up staying cards - just remove the is-flipping class
        // FLIP handles its own cleanup, so we just re-enable hover transitions
        stayingCards.forEach(card => {
            card.classList.remove('is-flipping');
        });
        
        // Clean up entering cards - ensure they're fully visible and ready for hover
        enteringCards.forEach(card => {
            card.classList.remove('is-flipping');
            gsap.set(card, { opacity: 1, clearProps: 'scale' });
        });
        
        // Clear grid transforms
        gsap.set(this.grid, { clearProps: 'height,minHeight' });
        
        this.updateLoadMoreVisibility(totalFiltered);
    }
    
    loadMore() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Show loading spinner
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'flex';
            gsap.fromTo(this.loadingSpinner, 
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.2 }
            );
        }
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.opacity = '0.5';
            this.loadMoreBtn.disabled = true;
        }
        
        // Simulate loading delay for smooth UX
        setTimeout(() => {
            const filteredCards = this.getFilteredCards();
            
            // Increase visible count
            const previousCount = this.visibleCount;
            this.visibleCount = Math.min(this.visibleCount + this.loadMoreCount, filteredCards.length);
            
            // Get new cards to show
            const newCards = filteredCards.slice(previousCount, this.visibleCount);
            
            // Hide loading spinner
            if (this.loadingSpinner) {
                gsap.to(this.loadingSpinner, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.2,
                    onComplete: () => {
                        this.loadingSpinner.style.display = 'none';
                    }
                });
            }
            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.opacity = '1';
                this.loadMoreBtn.disabled = false;
            }
            
            // Capture grid state before adding new cards (for height animation)
            const gridState = Flip.getState(this.grid);
            
            // Show new cards (initially hidden for animation)
            // Add is-flipping class to prevent CSS transitions during animation
            newCards.forEach(card => {
                card.classList.remove('ad-case-studies__card--hidden');
                card.classList.add('is-flipping');
                card.style.display = '';
                gsap.set(card, { opacity: 0, scale: 0.95, y: 10 });
            });
            
            // Animate grid height change
            Flip.from(gridState, {
                duration: this.animationDuration * 0.5,
                ease: 'none',
                onComplete: () => {
                    // Animate new cards in with stagger
                    gsap.to(newCards, {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: this.animationDuration * 0.6,
                        ease: 'none',
                        stagger: 0.04,
                        onComplete: () => {
                            this.isAnimating = false;
                            // Clean up transforms and remove is-flipping class
                            newCards.forEach(card => {
                                card.classList.remove('is-flipping');
                                gsap.set(card, { clearProps: 'transform,scale,y' });
                                gsap.set(card, { opacity: 1 });
                            });
                            gsap.set(this.grid, { clearProps: 'height,minHeight' });
                            this.updateLoadMoreVisibility(filteredCards.length);
                        }
                    });
                }
            });
        }, 400);
    }
    
    updateLoadMoreVisibility(totalFiltered = null) {
        if (!this.loadMoreBtn) return;
        
        const wrapper = this.container.querySelector('.ad-case-studies__load-more-wrapper');
        if (!wrapper) return;
        
        // Get filtered count if not provided
        if (totalFiltered === null) {
            totalFiltered = this.getFilteredCards().length;
        }
        
        if (this.visibleCount >= totalFiltered || totalFiltered === 0) {
            // Hide load more button with animation
            gsap.to(wrapper, {
                opacity: 0,
                y: 5,
                duration: 0.25,
                ease: 'none',
                onComplete: () => {
                    wrapper.style.display = 'none';
                }
            });
        } else {
            // Show load more button
            wrapper.style.display = '';
            gsap.to(wrapper, {
                opacity: 1,
                y: 0,
                duration: 0.25,
                ease: 'none'
            });
        }
    }
    
    // Reset filters and visibility
    reset() {
        this.currentIndustry = '';
        this.currentCapability = '';
        this.visibleCount = this.initialCount;
        
        if (this.industryFilter) this.industryFilter.value = '';
        if (this.capabilityFilter) this.capabilityFilter.value = '';
        
        this.filterCards();
    }
}

// Carousel Mode Class
class CaseStudiesCarousel {
    constructor(container) {
        this.container = container;
        this.carousel = container.querySelector('.ad-case-studies__carousel');
        this.cards = Array.from(container.querySelectorAll('.ad-case-studies__card'));
        this.dragCursor = container.querySelector('.ad-case-studies__drag-cursor');
        this.industryFilter = container.querySelector('[data-filter-type="industry"]');
        this.capabilityFilter = container.querySelector('[data-filter-type="capability"]');
        
        // Get configuration
        this.dragCursorText = container.dataset.dragCursorText || 'Drag';
        this.caseStudies = JSON.parse(container.dataset.caseStudies || '[]');
        this.popupDescription = container.dataset.popupDescription || '';
        this.popupImageUrl = container.dataset.popupImage || '';
        this.popupImageAlt = container.dataset.popupImageAlt || '';

        // State
        this.isDragging = false;
        this.isHovering = false;
        this.isOverContent = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.startX = 0;
        this.scrollLeft = 0;
        this.dragDistance = 0;
        this.currentIndustry = '';
        this.currentCapability = '';
        this.animationFrameId = null;
        
        this.init();
    }
    
    init() {
        if (!this.carousel) return;

        this.setupCarousel();
        this.setupDragCursor();
        this.initDragScroll();
        this.bindFilterEvents();
        this.bindCardClicks();
    }

    // Cards are plain <a href> links to the case study's own page (see
    // render.php). A drag gesture must not trigger navigation or the
    // popup; a genuine plain left-click opens the popup instead.
    bindCardClicks() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (this.isDragging || this.dragDistance > 3) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                if (!shouldOpenPopupInstead(e)) return;
                e.preventDefault();
                const index = parseInt(card.dataset.index, 10);
                const study = this.caseStudies[index];
                openCaseStudyPopup(study, this.popupDescription, this.popupImageUrl, this.popupImageAlt);
            });
        });
    }
    
    setupCarousel() {
        // Show all cards in carousel
        this.cards.forEach(card => {
            card.classList.remove('ad-case-studies__card--hidden');
            card.style.display = '';
        });
    }
    
    setupDragCursor() {
        if (!this.dragCursor || !this.carousel) return;
        
        // Initial state - hidden and scaled down
        gsap.set(this.dragCursor, {
            opacity: 0,
            scale: 0,
            xPercent: -50,
            yPercent: -50,
            pointerEvents: 'none'
        });
        
        // Mouse move handler for cursor tracking - listen on CAROUSEL only
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseEnter = this.handleMouseEnter.bind(this);
        this.boundMouseLeave = this.handleMouseLeave.bind(this);
        
        // Use the carousel element for event listening (not the whole container)
        this.carousel.addEventListener('mousemove', this.boundMouseMove);
        this.carousel.addEventListener('mouseenter', this.boundMouseEnter);
        this.carousel.addEventListener('mouseleave', this.boundMouseLeave);
        
        // Start the cursor animation loop
        this.animateCursor();
    }
    
    isOverTextContent(target) {
        // Check if target or any parent is text content
        if (!target) return false;
        
        // Check for actual text elements (title/description text only)
        const contentSelectors = [
            '.ad-case-studies__card-title',
            '.ad-case-studies__card-description',
            'h3',
            'p',
            'span',
            'strong',
            'em'
        ];
        
        for (const selector of contentSelectors) {
            if (target.matches && target.matches(selector)) return true;
            if (target.closest && target.closest(selector)) return true;
        }
        
        return false;
    }
    
    handleMouseMove(e) {
        // Get position relative to the main block container (for absolute positioning)
        const rect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if over text content
        const wasOverContent = this.isOverContent;
        this.isOverContent = this.isOverTextContent(e.target);
        
        // Handle cursor visibility based on content hover
        if (this.dragCursor && !this.isDragging) {
            if (this.isOverContent && !wasOverContent) {
                // Just entered content area - hide cursor
                gsap.to(this.dragCursor, {
                    opacity: 0,
                    scale: 0,
                    duration: 0.15,
                    ease: 'power2.in',
                    overwrite: true
                });
            } else if (!this.isOverContent && wasOverContent && this.isHovering) {
                // Just left content area - show cursor
                gsap.to(this.dragCursor, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.25,
                    ease: 'back.out(1.5)',
                    overwrite: true
                });
            }
        }
    }
    
    handleMouseEnter(e) {
        this.isHovering = true;
        const rect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if entering over content
        this.isOverContent = this.isOverTextContent(e.target);
        
        // Set initial cursor position immediately
        this.cursorX = this.mouseX;
        this.cursorY = this.mouseY;
        
        if (this.dragCursor) {
            // Immediately position cursor at mouse location
            gsap.set(this.dragCursor, {
                x: this.mouseX,
                y: this.mouseY
            });
            
            // Only show cursor if not over content area
            if (!this.isOverContent) {
                // Animate cursor in with pop effect
                gsap.to(this.dragCursor, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.35,
                    ease: 'back.out(2)',
                    overwrite: true
                });
            }
        }
    }
    
    handleMouseLeave() {
        this.isHovering = false;
        this.isOverContent = false;
        
        if (this.dragCursor) {
            // Animate cursor out
            gsap.to(this.dragCursor, {
                opacity: 0,
                scale: 0,
                duration: 0.2,
                ease: 'power2.in',
                overwrite: true
            });
        }
    }
    
    animateCursor() {
        if (!this.dragCursor) return;
        
        // Smooth cursor following with lerp
        const lerp = 0.12;
        
        this.cursorX += (this.mouseX - this.cursorX) * lerp;
        this.cursorY += (this.mouseY - this.cursorY) * lerp;
        
        if (this.isHovering || this.isDragging) {
            gsap.set(this.dragCursor, {
                x: this.cursorX,
                y: this.cursorY
            });
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.animateCursor());
    }
    
    initDragScroll() {
        // Track drag state
        let isPointerDown = false;
        let startX = 0;
        let scrollStart = 0;
        let velocityX = 0;
        let lastPageX = 0;
        let lastTimestamp = 0;
        let rafId = null;
        let targetScrollLeft = 0;
        
        // Smooth scroll animation using GSAP
        const animateScroll = () => {
            const current = this.carousel.scrollLeft;
            const diff = targetScrollLeft - current;
            
            // If close enough, snap to target
            if (Math.abs(diff) < 0.5) {
                this.carousel.scrollLeft = targetScrollLeft;
                rafId = null;
                return;
            }
            
            // Smooth interpolation
            this.carousel.scrollLeft = current + diff * 0.15;
            rafId = requestAnimationFrame(animateScroll);
        };
        
        const stopAnimation = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };
        
        const onPointerDown = (e) => {
            // Only handle left mouse button or touch
            if (e.button && e.button !== 0) return;
            
            // Stop any ongoing GSAP animation immediately
            gsap.killTweensOf(this.carousel);
            stopAnimation();
            
            isPointerDown = true;
            this.isDragging = false;
            this.dragDistance = 0;
            
            const pageX = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
            startX = pageX;
            scrollStart = this.carousel.scrollLeft;
            lastPageX = pageX;
            lastTimestamp = performance.now();
            velocityX = 0;
            
            this.carousel.classList.add('is-grabbing');
        };
        
        const onPointerMove = (e) => {
            if (!isPointerDown) return;
            
            const pageX = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
            const dx = pageX - startX;
            this.dragDistance = Math.abs(dx);
            
            // Prevent default to stop text selection and page scroll
            e.preventDefault();
            
            // Calculate velocity
            const now = performance.now();
            const dt = now - lastTimestamp;
            if (dt > 0) {
                const instantVelocity = (pageX - lastPageX) / dt;
                velocityX = velocityX * 0.6 + instantVelocity * 0.4;
            }
            lastPageX = pageX;
            lastTimestamp = now;
            
            // Direct scroll update - immediate response
            this.carousel.scrollLeft = scrollStart - dx;
            
            // Mark as dragging after small movement (for cursor animation & link protection)
            if (this.dragDistance > 2 && !this.isDragging) {
                this.isDragging = true;
                this.carousel.classList.add('is-dragging');
                
                // Shrink cursor when dragging starts
                if (this.dragCursor) {
                    gsap.to(this.dragCursor, {
                        scale: 0.6,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                }
            }
        };
        
        const onPointerUp = () => {
            if (!isPointerDown) return;
            
            isPointerDown = false;
            this.carousel.classList.remove('is-grabbing');
            
            const wasDragging = this.isDragging;
            const finalVelocity = velocityX;
            
            // Apply momentum if velocity is significant
            if (wasDragging && Math.abs(finalVelocity) > 0.2) {
                // Calculate target based on velocity (momentum)
                const momentumDistance = finalVelocity * 300; // Adjust multiplier for throw distance
                targetScrollLeft = this.carousel.scrollLeft - momentumDistance;
                
                // Clamp to bounds
                const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;
                targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
                
                // Use GSAP for smooth momentum animation
                gsap.to(this.carousel, {
                    scrollLeft: targetScrollLeft,
                    duration: Math.min(Math.abs(momentumDistance) / 500, 1.2),
                    ease: 'power3.out',
                    overwrite: true
                });
            }
            
            // Delay resetting isDragging to prevent link clicks
            setTimeout(() => {
                this.isDragging = false;
                this.carousel.classList.remove('is-dragging');
                
                // Return cursor to normal size
                if (this.isHovering && this.dragCursor) {
                    gsap.to(this.dragCursor, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'back.out(2)'
                    });
                }
            }, 10);
        };
        
        // Mouse events
        this.carousel.addEventListener('mousedown', onPointerDown);
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        
        // Touch events
        this.carousel.addEventListener('touchstart', onPointerDown, { passive: true });
        this.carousel.addEventListener('touchmove', onPointerMove, { passive: false });
        this.carousel.addEventListener('touchend', onPointerUp);
        this.carousel.addEventListener('touchcancel', onPointerUp);
        
        // Prevent default drag behavior on images
        this.carousel.addEventListener('dragstart', (e) => e.preventDefault());

        // Store cleanup references
        this.dragCleanup = () => {
            this.carousel.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('mouseup', onPointerUp);
            this.carousel.removeEventListener('touchstart', onPointerDown);
            this.carousel.removeEventListener('touchmove', onPointerMove);
            this.carousel.removeEventListener('touchend', onPointerUp);
            this.carousel.removeEventListener('touchcancel', onPointerUp);
            stopAnimation();
        };
    }
    
    bindFilterEvents() {
        if (this.industryFilter) {
            this.industryFilter.addEventListener('change', (e) => {
                this.currentIndustry = e.target.value;
                this.filterCards();
            });
        }
        
        if (this.capabilityFilter) {
            this.capabilityFilter.addEventListener('change', (e) => {
                this.currentCapability = e.target.value;
                this.filterCards();
            });
        }
    }
    
    getFilteredCards() {
        return this.cards.filter(card => {
            const industry = card.dataset.industry || '';
            let capabilities = [];
            try {
                capabilities = JSON.parse(card.dataset.capabilities || '[]');
            } catch (e) {
                capabilities = [];
            }
            
            const industryMatch = !this.currentIndustry || this.currentIndustry === '' || industry === this.currentIndustry;
            const capabilityMatch = !this.currentCapability || this.currentCapability === '' || capabilities.includes(this.currentCapability);
            
            return industryMatch && capabilityMatch;
        });
    }
    
    filterCards() {
        const filteredCards = this.getFilteredCards();
        
        // Animate out non-matching cards
        this.cards.forEach(card => {
            const shouldShow = filteredCards.includes(card);
            
            if (shouldShow) {
                card.style.display = '';
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
        
        // Reset scroll position
        gsap.to(this.carousel, {
            scrollLeft: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
    }
    
    // Cleanup method
    destroy() {
        if (this.dragCleanup) {
            this.dragCleanup();
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        if (this.carousel) {
            this.carousel.removeEventListener('mousemove', this.boundMouseMove);
            this.carousel.removeEventListener('mouseenter', this.boundMouseEnter);
            this.carousel.removeEventListener('mouseleave', this.boundMouseLeave);
        }
    }
}

// Expose for potential external use
window.CaseStudiesBlock = CaseStudiesBlock;
window.CaseStudiesCarousel = CaseStudiesCarousel;



