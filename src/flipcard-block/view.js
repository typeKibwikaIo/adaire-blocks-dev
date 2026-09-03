/**
 * Flip Card Block - Frontend View Script
 *
 * Adds tap/keyboard flipping for cards the CSS can't flip on hover.
 *
 * Hover itself is handled entirely in CSS, behind
 * `@media (hover: hover) and (pointer: fine)`. This script no longer sniffs
 * `ontouchstart` / `navigator.maxTouchPoints` to decide that — it asks the
 * browser the same question the stylesheet asks, so the two can never
 * disagree (they did on hybrid laptops, and the old class was only stamped
 * on after the script ran).
 *
 * Cards set to the "Static Card" behaviour carry `adaire-flipcard--static`
 * and are skipped entirely: they never flip, on any device or screen size.
 */

import { initScrollAnimation } from '../components/scroll-animation-runtime';

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

document.addEventListener('DOMContentLoaded', () => {
    initFlipCards();
    initScrollAnimation('.adaire-flipcard.adaire-scroll-animate');
});

/**
 * Initialize every flip card on the page.
 */
function initFlipCards() {
    document
        .querySelectorAll('.adaire-flipcard:not(.adaire-flipcard--static)')
        .forEach((card) => new FlipCardHandler(card));
}

/**
 * Manages tap/keyboard flipping for a single flip card.
 */
class FlipCardHandler {
    constructor(card) {
        this.card = card;
        this.isFlipped = false;
        this.hoverQuery = window.matchMedia(HOVER_QUERY);

        this.handleClick = this.handleClick.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.syncMode = this.syncMode.bind(this);

        this.syncMode();

        // Re-evaluate when the pointer capability changes (e.g. a detachable
        // keyboard/trackpad, or moving the window to another display).
        if (typeof this.hoverQuery.addEventListener === 'function') {
            this.hoverQuery.addEventListener('change', this.syncMode);
        }
    }

    /**
     * Bind or unbind the toggle handlers to match the current pointer type.
     */
    syncMode() {
        if (this.hoverQuery.matches) {
            this.disableToggle();
        } else {
            this.enableToggle();
        }
    }

    enableToggle() {
        if (this.toggleEnabled) {
            return;
        }
        this.toggleEnabled = true;
        this.card.classList.add('adaire-flipcard--interactive');
        this.card.setAttribute('tabindex', '0');
        this.card.setAttribute('role', 'button');
        this.card.setAttribute('aria-pressed', 'false');
        this.card.addEventListener('click', this.handleClick);
        this.card.addEventListener('keydown', this.handleKeydown);
    }

    disableToggle() {
        if (!this.toggleEnabled) {
            return;
        }
        this.toggleEnabled = false;
        this.card.classList.remove('adaire-flipcard--interactive');
        this.card.removeAttribute('tabindex');
        this.card.removeAttribute('role');
        this.card.removeAttribute('aria-pressed');
        this.card.removeEventListener('click', this.handleClick);
        this.card.removeEventListener('keydown', this.handleKeydown);
        this.setFlipped(false);
    }

    handleClick(event) {
        // Let links and buttons inside the card do their own job.
        if (event.target.closest('a, button, [role="button"]') !== this.card) {
            return;
        }

        event.stopPropagation();
        this.setFlipped(!this.isFlipped);
    }

    handleKeydown(event) {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
            return;
        }

        event.preventDefault();
        this.setFlipped(!this.isFlipped);
    }

    setFlipped(flipped) {
        this.isFlipped = flipped;
        this.card.classList.toggle('adaire-flipcard--flipped', flipped);
        this.card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    }
}
