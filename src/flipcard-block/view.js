/**
 * Flip Card Block - Frontend View Script
 * Handles touch and click interactions for flip cards
 */

document.addEventListener('DOMContentLoaded', () => {
    initFlipCards();
});

/**
 * Initialize all flip card blocks on the page
 */
function initFlipCards() {
    const flipCards = document.querySelectorAll('.adaire-flipcard');
    
    flipCards.forEach(flipCard => {
        new FlipCardHandler(flipCard);
    });
}

/**
 * Flip Card Handler Class
 * Manages flip interactions for a single flip card
 */
class FlipCardHandler {
    constructor(card) {
        this.card = card;
        this.container = card.querySelector('.adaire-flipcard__container');
        this.isFlipped = false;
        this.isTouchDevice = this.detectTouchDevice();
        
        // Add touch device class for CSS targeting
        if (this.isTouchDevice) {
            this.card.classList.add('adaire-flipcard--touch-device');
        }
        
        this.bindEvents();
    }
    
    /**
     * Detect if the device supports touch
     */
    detectTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.isTouchDevice) {
            // Use click events for touch devices (click works on both touch and mouse)
            this.card.addEventListener('click', this.handleClick.bind(this));
        }
        // Note: Hover is handled by CSS for non-touch devices
    }
    
    /**
     * Handle click events on touch devices
     */
    handleClick(event) {
        // Don't flip if clicking on a link or button inside the card
        if (event.target.closest('a, button, [role="button"]')) {
            return;
        }
        
        // Prevent event bubbling
        event.stopPropagation();
        
        this.toggleFlip();
    }
    
    /**
     * Toggle the flip state
     */
    toggleFlip() {
        this.isFlipped = !this.isFlipped;
        
        if (this.isFlipped) {
            this.card.classList.add('adaire-flipcard--flipped');
        } else {
            this.card.classList.remove('adaire-flipcard--flipped');
        }
    }
}




