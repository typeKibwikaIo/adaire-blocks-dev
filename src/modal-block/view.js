const focusableSelectors = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
];

const trapFocus = (event, firstElement, lastElement) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey) {
        if (document.activeElement === firstElement) { event.preventDefault(); lastElement.focus(); }
    } else {
        if (document.activeElement === lastElement) { event.preventDefault(); firstElement.focus(); }
    }
};

let openModals = 0;

const setupModal = (block) => {
    if (block.dataset.modalReady === 'true') return;

    const trigger        = block.querySelector('[data-modal-role="trigger"]');
    const contentWrapper = block.querySelector('[data-modal-role="content"]');

    if (!trigger || !contentWrapper) return;

    // Read configuration from data attributes
    const overlayClickClose = block.dataset.overlayClose !== 'false';
    const showCloseBtn      = block.dataset.showClose    !== 'false';
    const autoOpen          = block.dataset.autoOpen     || 'none';
    const autoOpenDelay     = parseFloat(block.dataset.autoOpenDelay || '0') * 1000;

    const overlay = document.createElement('div');
    overlay.className = 'adaire-modal-block__overlay';
    overlay.setAttribute('data-modal-overlay', '');

    const modal = document.createElement('div');
    modal.className = 'adaire-modal-block__modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    const contentContainer = document.createElement('div');
    contentContainer.className = 'adaire-modal-block__content';
    contentContainer.appendChild(contentWrapper);

    if (showCloseBtn) {
        const closeButton = document.createElement('button');
        closeButton.className = 'adaire-modal-block__close';
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Close modal');
        closeButton.innerHTML = '&times;';
        modal.appendChild(closeButton);

        closeButton.addEventListener('click', () => closeModal());
    }

    modal.appendChild(contentContainer);
    block.appendChild(overlay);
    block.appendChild(modal);

    let previouslyFocused = null;

    const getCloseButton = () => modal.querySelector('.adaire-modal-block__close');

    const getFocusableElements = () => {
        const elements = Array.from(contentContainer.querySelectorAll(focusableSelectors.join(',')));
        const closeBtn = getCloseButton();
        if (closeBtn && !elements.includes(closeBtn)) elements.unshift(closeBtn);
        return elements;
    };

    const openModal = (event) => {
        event?.preventDefault();
        if (block.classList.contains('is-open')) return;

        previouslyFocused = document.activeElement;
        block.classList.add('is-open');
        block.dataset.modalOpen = 'true';
        modal.setAttribute('aria-hidden', 'false');

        if (openModals === 0) document.body.classList.add('adaire-modal-open');
        openModals += 1;

        const focusable = getFocusableElements();
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        const focusTarget = first || getCloseButton();
        if (focusTarget) focusTarget.focus({ preventScroll: true });

        const handleKeydown = (evt) => {
            if (evt.key === 'Escape') { evt.preventDefault(); closeModal(); return; }
            if (focusable.length > 0) trapFocus(evt, first, last);
        };

        modal.addEventListener('keydown', handleKeydown);
        modal.dataset.keydownAttached = 'true';
        modal.__handleKeydown = handleKeydown;
    };

    const closeModal = () => {
        if (!block.classList.contains('is-open')) return;

        block.classList.remove('is-open');
        block.dataset.modalOpen = 'false';
        modal.setAttribute('aria-hidden', 'true');
        openModals = Math.max(0, openModals - 1);
        if (openModals === 0) document.body.classList.remove('adaire-modal-open');

        if (modal.dataset.keydownAttached === 'true' && modal.__handleKeydown) {
            modal.removeEventListener('keydown', modal.__handleKeydown);
            delete modal.__handleKeydown;
            delete modal.dataset.keydownAttached;
        }

        if (previouslyFocused?.focus) previouslyFocused.focus({ preventScroll: true });
    };

    // Trigger click
    trigger.addEventListener('click', openModal);
    trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') openModal(event);
    });

    // Overlay click (conditional)
    if (overlayClickClose) {
        overlay.addEventListener('click', closeModal);
    }

    // Custom events (external control)
    block.addEventListener('modal:open', openModal);
    block.addEventListener('modal:close', closeModal);

    // ── Auto-open triggers ────────────────────────────────────────────────────

    if (autoOpen === 'delay') {
        setTimeout(() => openModal(), autoOpenDelay);
    }

    if (autoOpen === 'exit-intent') {
        let triggered = false;
        const onMouseLeave = (e) => {
            if (triggered || e.clientY > 20) return;
            triggered = true;
            document.removeEventListener('mouseleave', onMouseLeave);
            openModal();
        };
        document.addEventListener('mouseleave', onMouseLeave);
    }

    block.dataset.modalReady = 'true';
};

// ── Floating trigger blocks ────────────────────────────────────────────────────
// (handled by modal-trigger-block's own view.js / style.scss, but we still
//  need the parent block's close handler to work — it already does via events)

const initModalBlocks = () => {
    document.querySelectorAll('[data-modal-block]').forEach(setupModal);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalBlocks);
} else {
    initModalBlocks();
}
