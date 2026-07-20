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

// ── Frequency control (gates AUTOMATIC opening only — manual trigger clicks
// always work) ──────────────────────────────────────────────────────────────

const FREQUENCY_STORAGE_PREFIX = 'adaire-modal-shown-';

const getFrequencyKey = (block) => FREQUENCY_STORAGE_PREFIX + (block.id || 'default');

// Cookie helpers — used by the "once every N days" frequency option so the gate
// can persist for an arbitrary, author-configured number of days.
const getCookie = (name) => {
    const target = name + '=';
    const parts = document.cookie ? document.cookie.split(';') : [];
    for (let i = 0; i < parts.length; i += 1) {
        const c = parts[i].trim();
        if (c.indexOf(target) === 0) return c.substring(target.length);
    }
    return '';
};

const setCookie = (name, value, days) => {
    let expires = '';
    if (days > 0) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax';
};

const shouldAutoOpen = (block) => {
    const frequency = block.dataset.showFrequency || 'always';
    if (frequency === 'always') return true;
    const key = getFrequencyKey(block);
    if (frequency === 'once-per-n-days') {
        return !getCookie(key);
    }
    try {
        if (frequency === 'once-per-session') {
            return !sessionStorage.getItem(key);
        }
        if (frequency === 'once-per-day') {
            const last = localStorage.getItem(key);
            if (!last) return true;
            return (Date.now() - parseInt(last, 10)) > 24 * 60 * 60 * 1000;
        }
        if (frequency === 'once-ever') {
            return !localStorage.getItem(key);
        }
    } catch (e) {
        return true; // storage unavailable (private mode, etc.) — fail open
    }
    return true;
};

const markShown = (block) => {
    const frequency = block.dataset.showFrequency || 'always';
    if (frequency === 'always') return;
    const key = getFrequencyKey(block);
    if (frequency === 'once-per-n-days') {
        const days = parseInt(block.dataset.frequencyDays || '7', 10) || 7;
        setCookie(key, String(Date.now()), days);
        return;
    }
    try {
        if (frequency === 'once-per-session') {
            sessionStorage.setItem(key, '1');
        } else {
            localStorage.setItem(key, String(Date.now()));
        }
    } catch (e) {
        // Storage unavailable — nothing to do, frequency gating just won't persist.
    }
};

// ── Countdown timer — runs independently of modal open/closed state, and
// persists across page loads within the same browser session. ────────────────

const formatCountdown = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const setupCountdown = (block) => {
    if (block.dataset.countdownEnabled !== 'true') return;
    const display = block.querySelector('[data-countdown-display]');
    if (!display) return;

    const minutes = parseFloat(block.dataset.countdownMinutes || '15');
    const storageKey = 'adaire-modal-countdown-' + (block.id || 'default');

    let expiry;
    try {
        const stored = sessionStorage.getItem(storageKey);
        expiry = stored ? parseInt(stored, 10) : Date.now() + minutes * 60 * 1000;
        if (!stored) sessionStorage.setItem(storageKey, String(expiry));
    } catch (e) {
        expiry = Date.now() + minutes * 60 * 1000;
    }

    let intervalId;
    const tick = () => {
        const remaining = Math.max(0, Math.round((expiry - Date.now()) / 1000));
        display.textContent = formatCountdown(remaining);
        if (remaining <= 0 && intervalId) clearInterval(intervalId);
    };

    tick();
    intervalId = setInterval(tick, 1000);
};

// Stop any playing media inside the modal when it closes — pause native
// audio/video and reload iframes (YouTube/Vimeo/etc.) so they stop playing.
const stopMedia = (container) => {
    container.querySelectorAll('video, audio').forEach((media) => {
        try { media.pause(); } catch (e) { /* ignore */ }
    });
    container.querySelectorAll('iframe').forEach((iframe) => {
        // Resetting src to itself forces embedded players to stop.
        const src = iframe.getAttribute('src');
        if (src) iframe.setAttribute('src', src);
    });
};

let openModals = 0;

const setupModal = (block) => {
    if (block.dataset.modalReady === 'true') return;

    const trigger        = block.querySelector('[data-modal-role="trigger"]');
    const contentWrapper = block.querySelector('[data-modal-role="content"]');
    const countdownEl    = block.querySelector('[data-countdown-display]');

    if (!trigger || !contentWrapper) return;

    // Read configuration from data attributes
    const overlayClickClose = block.dataset.overlayClose !== 'false';
    const showCloseBtn      = block.dataset.showClose    !== 'false';
    const autoOpen          = block.dataset.autoOpen     || 'none';
    const autoOpenDelay     = parseFloat(block.dataset.autoOpenDelay || '0') * 1000;
    const autoCloseEnabled  = block.dataset.autoClose    === 'true';
    const autoCloseDelay    = parseFloat(block.dataset.autoCloseDelay || '5') * 1000;

    const overlay = document.createElement('div');
    overlay.className = 'adaire-popup-modal-block__overlay';
    overlay.setAttribute('data-modal-overlay', '');

    const modal = document.createElement('div');
    modal.className = 'adaire-popup-modal-block__modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    const contentContainer = document.createElement('div');
    contentContainer.className = 'adaire-popup-modal-block__content';
    // The countdown timer (if enabled) is a sibling of the content wrapper in
    // the saved markup, not a descendant — move it in ahead of the content so
    // it renders inside the modal instead of being stranded outside it.
    if (countdownEl) contentContainer.appendChild(countdownEl);
    contentContainer.appendChild(contentWrapper);

    if (showCloseBtn) {
        const closeButton = document.createElement('button');
        closeButton.className = 'adaire-popup-modal-block__close';
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Close modal');
        closeButton.innerHTML = '&times;';
        modal.appendChild(closeButton);

        closeButton.addEventListener('click', () => closeModal());
    }

    modal.appendChild(contentContainer);
    block.appendChild(overlay);
    block.appendChild(modal);

    // Any element inside the modal body marked with this class (e.g. a "No
    // thanks" or "Close" button in a preset template) closes the modal.
    contentContainer.querySelectorAll('.adaire-modal-close-trigger').forEach((el) => {
        el.addEventListener('click', (event) => {
            event.preventDefault();
            closeModal();
        });
    });

    let previouslyFocused = null;
    let autoCloseTimer = null;

    const getCloseButton = () => modal.querySelector('.adaire-popup-modal-block__close');

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

        // Auto-close after a delay (cleared on any earlier close).
        if (autoCloseEnabled) {
            autoCloseTimer = setTimeout(() => closeModal(), autoCloseDelay);
        }
    };

    const closeModal = () => {
        if (!block.classList.contains('is-open')) return;

        if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }

        block.classList.remove('is-open');
        block.dataset.modalOpen = 'false';
        modal.setAttribute('aria-hidden', 'true');
        stopMedia(contentContainer);
        openModals = Math.max(0, openModals - 1);
        if (openModals === 0) document.body.classList.remove('adaire-modal-open');

        if (modal.dataset.keydownAttached === 'true' && modal.__handleKeydown) {
            modal.removeEventListener('keydown', modal.__handleKeydown);
            delete modal.__handleKeydown;
            delete modal.dataset.keydownAttached;
        }

        if (previouslyFocused?.focus) previouslyFocused.focus({ preventScroll: true });
    };

    // Trigger click — a real <button>, so Enter/Space already dispatch 'click' natively.
    trigger.addEventListener('click', openModal);

    // Overlay click (conditional)
    if (overlayClickClose) {
        overlay.addEventListener('click', closeModal);
    }

    // Custom events (external control) — always wired, regardless of frequency.
    block.addEventListener('modal:open', openModal);
    block.addEventListener('modal:close', closeModal);

    // ── Auto-open triggers ────────────────────────────────────────────────────
    // Frequency gating only applies to automatic opening; manual trigger
    // clicks and the modal:open custom event always work.

    const autoOpenAndMark = (event) => {
        markShown(block);
        openModal(event);
    };

    if (autoOpen === 'delay' && shouldAutoOpen(block)) {
        setTimeout(() => autoOpenAndMark(), autoOpenDelay);
    }

    if (autoOpen === 'exit-intent' && shouldAutoOpen(block)) {
        let triggered = false;
        const onMouseLeave = (e) => {
            if (triggered || e.clientY > 20) return;
            triggered = true;
            document.removeEventListener('mouseleave', onMouseLeave);
            autoOpenAndMark();
        };
        document.addEventListener('mouseleave', onMouseLeave);
    }

    if (autoOpen === 'scroll-depth' && shouldAutoOpen(block)) {
        const threshold = parseFloat(block.dataset.scrollPercent || '50');
        const onScroll = () => {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolledPercent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 100;
            if (scrolledPercent >= threshold) {
                window.removeEventListener('scroll', onScroll);
                autoOpenAndMark();
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (autoOpen === 'element-visible' && shouldAutoOpen(block)) {
        const selector = block.dataset.elementSelector;
        const target = selector ? document.querySelector(selector) : null;
        if (target && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        observer.disconnect();
                        autoOpenAndMark();
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(target);
        }
    }

    if (autoOpen === 'inactivity' && shouldAutoOpen(block)) {
        const idleThreshold = parseFloat(block.dataset.inactivitySeconds || '30') * 1000;
        let lastActivity = Date.now();
        let triggered = false;
        const resetActivity = () => { lastActivity = Date.now(); };
        ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach((evt) =>
            document.addEventListener(evt, resetActivity, { passive: true })
        );
        const checkInterval = setInterval(() => {
            if (triggered) return;
            if (Date.now() - lastActivity >= idleThreshold) {
                triggered = true;
                clearInterval(checkInterval);
                autoOpenAndMark();
            }
        }, 1000);
    }

    if (autoOpen === 'custom-event') {
        const eventName = block.dataset.eventName || 'adaire-modal-open';
        document.addEventListener(eventName, () => {
            if (!shouldAutoOpen(block)) return;
            autoOpenAndMark();
        });
    }

    // External element click — clicking any element matching the selector opens
    // the modal. Delegated on document so it also catches elements added after
    // load. Like the trigger button, this is a manual action: never gated.
    if (autoOpen === 'element-click') {
        const selector = (block.dataset.clickSelector || '').trim();
        if (selector) {
            document.addEventListener('click', (event) => {
                const match = event.target.closest?.(selector);
                if (!match) return;
                event.preventDefault();
                openModal(event);
            });
        }
    }

    setupCountdown(block);

    block.dataset.modalReady = 'true';
};

const initModalBlocks = () => {
    document.querySelectorAll('[data-modal-block]').forEach(setupModal);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalBlocks);
} else {
    initModalBlocks();
}
