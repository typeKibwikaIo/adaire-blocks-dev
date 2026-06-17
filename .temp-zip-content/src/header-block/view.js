document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.adaire-header-block').forEach((header) => {
        const toggle = header.querySelector('.adaire-header-mobile-toggle');
        const searchButton = header.querySelector('.adaire-header-search-button');
        const nav = toggle && toggle.getAttribute('aria-controls')
            ? document.getElementById(toggle.getAttribute('aria-controls'))
            : header.querySelector('.adaire-header-nav');
        let lastScrollY = window.scrollY;
        let lastFocusedElement = null;

        // render.php writes these as 'true'/'false' strings; default to "on"
        // (matching block.json's defaults) whenever the attribute is absent.
        const closeOnOutsideClick = header.dataset.closeOnOutsideClick !== 'false';
        const closeOnEscape = header.dataset.closeOnEscape !== 'false';

        const isMobileMenuOpen = () => header.classList.contains('is-mobile-menu-open');

        const getFocusableElements = (container) => {
            if (!container) {
                return [];
            }
            return Array.from(
                container.querySelectorAll(
                    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => el.offsetParent !== null);
        };

        const lockBodyScroll = () => document.body.classList.add('adaire-header-no-scroll');
        const unlockBodyScroll = () => document.body.classList.remove('adaire-header-no-scroll');

        const openMobileMenu = () => {
            if (!toggle) {
                return;
            }
            lastFocusedElement = document.activeElement;
            header.classList.add('is-mobile-menu-open');
            toggle.setAttribute('aria-expanded', 'true');
            lockBodyScroll();

            const focusable = getFocusableElements(nav);
            if (focusable.length) {
                focusable[0].focus();
            }
        };

        const closeMobileMenu = ({ restoreFocus = true } = {}) => {
            if (!toggle || !isMobileMenuOpen()) {
                return;
            }
            header.classList.remove('is-mobile-menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            unlockBodyScroll();

            if (restoreFocus) {
                if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                    lastFocusedElement.focus();
                } else {
                    toggle.focus();
                }
            }
            lastFocusedElement = null;
        };

        if (toggle) {
            toggle.addEventListener('click', () => {
                if (isMobileMenuOpen()) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });
        }

        // Focus trap + Escape handling while the mobile overlay/slide-in menu is open.
        document.addEventListener('keydown', (event) => {
            if (!isMobileMenuOpen()) {
                return;
            }

            if (event.key === 'Escape') {
                if (closeOnEscape) {
                    closeMobileMenu();
                }
                return;
            }

            if (event.key === 'Tab') {
                const focusable = getFocusableElements(nav);
                if (!focusable.length) {
                    return;
                }
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });

        // Outside-click closes the mobile menu (if enabled) and any open submenus.
        document.addEventListener('click', (event) => {
            if (header.contains(event.target)) {
                return;
            }

            if (isMobileMenuOpen() && closeOnOutsideClick) {
                closeMobileMenu({ restoreFocus: false });
            }

            header.querySelectorAll('.adaire-header-menu-item.is-submenu-open').forEach((item) => {
                item.classList.remove('is-submenu-open');
                const itemToggle = item.querySelector('.adaire-header-submenu-toggle');
                const submenu = item.querySelector('.adaire-header-submenu');
                if (itemToggle) {
                    itemToggle.setAttribute('aria-expanded', 'false');
                }
                if (submenu) {
                    submenu.classList.remove('is-open');
                }
            });
        });

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const search = searchButton.closest('.adaire-header-search');
                if (!search) {
                    return;
                }

                search.classList.toggle('is-open');
                const input = search.querySelector('input[type="search"]');
                if (input && search.classList.contains('is-open')) {
                    input.focus();
                }
            });
        }

        const behavior = header.dataset.stickyBehavior;
        if (behavior === 'scroll-up' || behavior === 'hide-down') {
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                const scrollingDown = currentScrollY > lastScrollY && currentScrollY > header.offsetHeight;

                header.classList.toggle('is-hidden-on-scroll', scrollingDown);
                header.classList.toggle('is-visible-on-scroll-up', !scrollingDown && currentScrollY > header.offsetHeight);
                lastScrollY = currentScrollY;
            }, { passive: true });
        }

        // Nested WP-menu disclosure toggles (unlimited depth via recursion in render.php).
        header.querySelectorAll('.adaire-header-submenu-toggle').forEach((submenuToggle) => {
            const collapse = () => {
                submenuToggle.setAttribute('aria-expanded', 'false');
                const parentItem = submenuToggle.closest('.adaire-header-menu-item');
                const submenuId = submenuToggle.getAttribute('aria-controls');
                const submenu = submenuId ? document.getElementById(submenuId) : null;
                if (parentItem) {
                    parentItem.classList.remove('is-submenu-open');
                }
                if (submenu) {
                    submenu.classList.remove('is-open');
                }
            };

            submenuToggle.addEventListener('click', () => {
                const expanded = submenuToggle.getAttribute('aria-expanded') === 'true';
                if (expanded) {
                    collapse();
                    return;
                }

                submenuToggle.setAttribute('aria-expanded', 'true');
                const parentItem = submenuToggle.closest('.adaire-header-menu-item');
                const submenuId = submenuToggle.getAttribute('aria-controls');
                const submenu = submenuId ? document.getElementById(submenuId) : null;
                if (parentItem) {
                    parentItem.classList.add('is-submenu-open');
                }
                if (submenu) {
                    submenu.classList.add('is-open');
                }
            });

            submenuToggle.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && submenuToggle.getAttribute('aria-expanded') === 'true') {
                    collapse();
                    submenuToggle.focus();
                }
            });
        });

        // Custom mobile breakpoints: the default (782px) is handled entirely by
        // style.scss's static media query, so non-default values are the only
        // case that needs a runtime override — scoped to this header instance
        // only, leaving every existing (default-breakpoint) page untouched.
        const breakpoint = parseInt(header.dataset.mobileBreakpoint, 10) || 782;
        if (breakpoint !== 782) {
            const uid = `adaire-hdr-${Math.random().toString(36).slice(2, 9)}`;
            header.setAttribute('data-header-uid', uid);

            const styleEl = document.createElement('style');
            styleEl.textContent = `
                @media (min-width: ${breakpoint + 1}px) {
                    [data-header-uid="${uid}"] .adaire-header-mobile-toggle { display: none !important; }
                    [data-header-uid="${uid}"] .adaire-header-nav { display: flex !important; position: static !important; transform: none !important; width: auto !important; }
                }
                @media (max-width: ${breakpoint}px) {
                    [data-header-uid="${uid}"] .adaire-header-mobile-toggle { display: block !important; }
                    [data-header-uid="${uid}"] .adaire-header-nav { display: none; }
                    [data-header-uid="${uid}"].is-mobile-menu-open .adaire-header-nav { display: flex; }
                }
            `;
            document.head.appendChild(styleEl);
        }
    });
});
