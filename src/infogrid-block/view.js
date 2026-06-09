import { gsap } from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
    initInfoGridBlocks();
});

function initInfoGridBlocks() {
    const blocks = document.querySelectorAll('.adaire-infogrid');
    
    blocks.forEach(block => {
        new InfoGrid(block);
    });
}

class InfoGrid {
    constructor(container) {
        this.container = container;
        this.items = Array.from(container.querySelectorAll('.adaire-infogrid__item'));
        this.expandedItem = null;
        this.hoverTimeout = null;
        this.isDesktop = window.innerWidth > 1024;
        
        this.init();
    }
    
    init() {
        this.setupItems();
        this.bindEvents();
        this.handleResize();
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            this.isDesktop = window.innerWidth > 1024;
            // Collapse all items if switching to mobile
            if (!this.isDesktop && this.expandedItem) {
                this.collapseItem(this.expandedItem);
            }
        });
    }
    
    setupItems() {
        // Hide descriptions initially
        this.items.forEach(item => {
            const descWrapper = item.querySelector('.adaire-infogrid__item-description-wrapper');
            if (descWrapper) {
                gsap.set(descWrapper, {
                    height: 0,
                    opacity: 0,
                    overflow: 'hidden'
                });
            }
        });
    }
    
    bindEvents() {
        const grid = this.container.querySelector('.adaire-infogrid__grid');
        
        // Add mouseleave to the entire grid to catch when mouse leaves the grid area
        if (grid) {
            grid.addEventListener('mouseleave', (e) => {
                if (this.isDesktop && this.expandedItem) {
                    // Check if we're actually leaving the grid (not just moving to another item)
                    const relatedTarget = e.relatedTarget;
                    if (!relatedTarget || !grid.contains(relatedTarget)) {
                        // Definitely leaving the grid - collapse immediately
                        this.collapseItem(this.expandedItem);
                    }
                }
            });
            
            // Also add mouseout as a backup
            grid.addEventListener('mouseout', (e) => {
                if (this.isDesktop && this.expandedItem) {
                    const relatedTarget = e.relatedTarget;
                    if (!relatedTarget || !grid.contains(relatedTarget)) {
                        this.collapseItem(this.expandedItem);
                    }
                }
            });
        }
        
        this.items.forEach(item => {
            const toggle = item.querySelector('.adaire-infogrid__item-toggle');
            
            // Click to toggle on mobile/tablet or when clicking the button
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleItem(item);
                });
            }
            
            // Hover for desktop
            item.addEventListener('mouseenter', () => {
                if (this.isDesktop) {
                    // Clear any pending collapse for this item
                    if (this.hoverTimeout) {
                        clearTimeout(this.hoverTimeout);
                        this.hoverTimeout = null;
                    }
                    
                    // Collapse any other expanded item first
                    if (this.expandedItem && this.expandedItem !== item) {
                        this.collapseItem(this.expandedItem);
                    }
                    
                    this.expandItem(item);
                }
            });
            
            item.addEventListener('mouseleave', (e) => {
                if (this.isDesktop) {
                    // Check if we're moving to another item in the grid
                    const relatedTarget = e.relatedTarget;
                    const grid = this.container.querySelector('.adaire-infogrid__grid');
                    
                    // If moving to another item within the grid, don't collapse yet
                    if (relatedTarget && grid && grid.contains(relatedTarget)) {
                        const targetItem = relatedTarget.closest('.adaire-infogrid__item');
                        if (targetItem && targetItem !== item) {
                            // Moving to another item - collapse this one immediately
                            this.collapseItem(item);
                            return;
                        }
                    }
                    
                    // Not moving to another item - collapse immediately
                    this.collapseItem(item);
                }
            });
            
            // Click for mobile/tablet
            item.addEventListener('click', (e) => {
                if (!this.isDesktop && !e.target.closest('.adaire-infogrid__item-toggle')) {
                    this.toggleItem(item);
                }
            });
        });
    }
    
    toggleItem(item) {
        if (item.classList.contains('is-expanded')) {
            this.collapseItem(item);
        } else {
            // Collapse any other expanded item first
            if (this.expandedItem && this.expandedItem !== item) {
                this.collapseItem(this.expandedItem);
            }
            this.expandItem(item);
        }
    }
    
    expandItem(item) {
        if (!item || item.classList.contains('is-expanded')) return;
        
        // Clear any pending collapse timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        const descWrapper = item.querySelector('.adaire-infogrid__item-description-wrapper');
        const description = item.querySelector('.adaire-infogrid__item-description');
        const icon = item.querySelector('.adaire-infogrid__item-icon');
        
        // Kill any ongoing animations on this item
        if (icon) {
            gsap.killTweensOf(icon);
        }
        if (descWrapper) {
            gsap.killTweensOf(descWrapper);
        }
        
        item.classList.add('is-expanded');
        this.expandedItem = item;
        
        // Animate icon
        if (icon) {
            gsap.to(icon, {
                rotation: 45,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: true
            });
        }
        
        // Animate description
        if (descWrapper && description) {
            // Get natural height
            gsap.set(descWrapper, { height: 'auto', opacity: 1 });
            const naturalHeight = descWrapper.offsetHeight;
            gsap.set(descWrapper, { height: 0, opacity: 0 });
            
            gsap.to(descWrapper, {
                height: naturalHeight,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: true
            });
        }
    }
    
    collapseItem(item) {
        // Clear any pending collapse timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        // If item is not expanded, nothing to do
        if (!item || !item.classList.contains('is-expanded')) return;
        
        const descWrapper = item.querySelector('.adaire-infogrid__item-description-wrapper');
        const icon = item.querySelector('.adaire-infogrid__item-icon');
        
        // Remove expanded class immediately
        item.classList.remove('is-expanded');
        if (this.expandedItem === item) {
            this.expandedItem = null;
        }
        
        // Kill any ongoing GSAP animations on this item
        if (icon) {
            gsap.killTweensOf(icon);
        }
        if (descWrapper) {
            gsap.killTweensOf(descWrapper);
        }
        
        // Animate icon
        if (icon) {
            gsap.to(icon, {
                rotation: 0,
                duration: 0.25,
                ease: 'power2.out',
                overwrite: true
            });
        }
        
        // Animate description
        if (descWrapper) {
            gsap.to(descWrapper, {
                height: 0,
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                overwrite: true
            });
        }
    }
}

// Expose for external use
window.InfoGrid = InfoGrid;




