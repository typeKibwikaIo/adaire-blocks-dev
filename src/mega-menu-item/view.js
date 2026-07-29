/**
 * Frontend behaviour for adaire/mega-menu-item.
 *
 * Vanilla JS, no jQuery. Each instance keeps its own state via closures —
 * no shared globals — so multiple mega menus on one page (e.g. a header and
 * a footer nav) never collide. Instances register themselves in a small
 * shared list only so that opening one can close any others, per the
 * "keep only one menu open" behaviour setting.
 */
import { initTabbed, initShowcase } from './panel-interactions';

( function () {
	'use strict';

	const openInstances = [];

	function closeAllExcept( keep ) {
		openInstances.forEach( ( instance ) => {
			if ( instance !== keep && instance.keepOnlyOneOpen ) {
				instance.close();
			}
		} );
	}

	function prefersReducedMotion() {
		return (
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	}

	/**
	 * Locks/unlocks page scroll for the mobile drawer mode. Reference-counted
	 * so multiple drawers (unlikely, but possible with nested instances)
	 * don't unlock the page while another is still open.
	 */
	let scrollLockCount = 0;
	let savedBodyOverflow = '';
	function lockScroll() {
		if ( scrollLockCount === 0 ) {
			savedBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
		scrollLockCount++;
	}
	function unlockScroll() {
		scrollLockCount = Math.max( 0, scrollLockCount - 1 );
		if ( scrollLockCount === 0 ) {
			document.body.style.overflow = savedBodyOverflow;
		}
	}

	/**
	 * Focus trap: keeps Tab/Shift+Tab cycling within `container` while
	 * active. Returns a cleanup function.
	 *
	 * @param {Element} container Element to trap focus within.
	 * @return {Function} Cleanup function that removes the trap.
	 */
	function trapFocus( container ) {
		const selector =
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

		function handleKeydown( event ) {
			if ( event.key !== 'Tab' ) {
				return;
			}
			const focusable = Array.prototype.slice
				.call( container.querySelectorAll( selector ) )
				.filter( ( el ) => el.offsetParent !== null );
			if ( focusable.length === 0 ) {
				return;
			}
			const first = focusable[ 0 ];
			const last = focusable[ focusable.length - 1 ];
			const active = container.ownerDocument.activeElement;

			if ( event.shiftKey && active === first ) {
				event.preventDefault();
				last.focus();
			} else if ( ! event.shiftKey && active === last ) {
				event.preventDefault();
				first.focus();
			}
		}

		container.addEventListener( 'keydown', handleKeydown );
		return () => container.removeEventListener( 'keydown', handleKeydown );
	}

	/**
	 * Wraps the panel into a full-screen drawer once the viewport is below
	 * the configured breakpoint and mobileMode is "drawer" — adds a close
	 * button, traps focus, and locks body scroll while open. The drawer is
	 * a CSS repositioning of the same panel element (per the spec: "one
	 * component repositioned by CSS, not two implementations"), not a
	 * separate DOM copy.
	 *
	 * @param {Element} li      The mega-menu-item <li> element.
	 * @param {Element} panel   The panel element that becomes the drawer.
	 * @param {Object}  options Drawer options (lockBodyScroll, onCloseRequest).
	 * @return {{onOpen: Function, onClose: Function}} Lifecycle hooks called by open()/close().
	 */
	function setupDrawer( li, panel, options ) {
		let closeButton = panel.querySelector(
			'.adaire-mega-menu-item__drawer-close'
		);
		if ( ! closeButton ) {
			closeButton = document.createElement( 'button' );
			closeButton.type = 'button';
			closeButton.className = 'adaire-mega-menu-item__drawer-close';
			closeButton.setAttribute(
				'aria-label',
				window.adaireMegaMenuI18n?.closeMenu || 'Close menu'
			);
			closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';
			panel.insertBefore( closeButton, panel.firstChild );
			closeButton.addEventListener( 'click', options.onCloseRequest );
		}

		let releaseFocusTrap = null;

		return {
			onOpen: () => {
				if (
					! li.classList.contains(
						'adaire-mega-menu-item--drawer-active'
					)
				) {
					return;
				}
				if ( options.lockBodyScroll ) {
					lockScroll();
				}
				releaseFocusTrap = trapFocus( panel );
				closeButton.focus();
			},
			onClose: () => {
				if ( releaseFocusTrap ) {
					releaseFocusTrap();
					releaseFocusTrap = null;
				}
				if ( options.lockBodyScroll ) {
					unlockScroll();
				}
			},
		};
	}

	function initItem( li ) {
		const trigger = li.querySelector(
			':scope > .adaire-mega-menu-item__trigger'
		);
		const panel = li.querySelector(
			':scope > .adaire-mega-menu-item__panel'
		);

		if ( ! trigger || ! panel ) {
			return;
		}

		const triggerMode = panel.dataset.trigger || 'hover';
		const breakpoint = parseInt( panel.dataset.breakpoint, 10 ) || 1024;
		const openDelay = parseInt( panel.dataset.openDelay, 10 ) || 0;
		const closeDelay = parseInt( panel.dataset.closeDelay, 10 ) || 0;
		const mobileMode = panel.dataset.mobileMode || 'accordion';
		const closeOnOutsideClick = panel.dataset.closeOnOutsideClick !== '0';
		const closeOnEscape = panel.dataset.closeOnEscape !== '0';
		const closeOnLinkSelect = panel.dataset.closeOnLinkSelect !== '0';
		const keepOnlyOneOpen = panel.dataset.keepOnlyOneOpen !== '0';
		const lockBodyScrollSetting = panel.dataset.lockBodyScroll !== '0';

		let openTimer = null;
		let closeTimer = null;
		let isOpen = false;
		let isMobile = false;

		const instance = {
			open: () => open(),
			close: () => close(),
			element: li,
			keepOnlyOneOpen,
		};

		function clearTimers() {
			if ( openTimer ) {
				clearTimeout( openTimer );
				openTimer = null;
			}
			if ( closeTimer ) {
				clearTimeout( closeTimer );
				closeTimer = null;
			}
		}

		function currentMobileMode() {
			return isMobile ? mobileMode : null;
		}

		function open() {
			clearTimers();
			if ( isOpen ) {
				return;
			}
			isOpen = true;
			li.classList.add( 'adaire-mega-menu-item--open' );
			panel.hidden = false;
			trigger.setAttribute( 'aria-expanded', 'true' );

			if ( isMobile && mobileMode === 'drawer' ) {
				li.classList.add( 'adaire-mega-menu-item--drawer-active' );
				drawer?.onOpen();
			}

			if ( openInstances.indexOf( instance ) === -1 ) {
				openInstances.push( instance );
			}
			closeAllExcept( instance );
		}

		function close() {
			clearTimers();
			if ( ! isOpen ) {
				return;
			}
			isOpen = false;
			li.classList.remove( 'adaire-mega-menu-item--open' );
			trigger.setAttribute( 'aria-expanded', 'false' );

			if (
				li.classList.contains( 'adaire-mega-menu-item--drawer-active' )
			) {
				drawer?.onClose();
				li.classList.remove( 'adaire-mega-menu-item--drawer-active' );
			}

			const animation = panel.dataset.animation;
			const hidePanel = () => {
				panel.hidden = true;
			};

			if (
				animation &&
				animation !== 'none' &&
				! prefersReducedMotion()
			) {
				const duration =
					parseInt(
						panel.style.getPropertyValue(
							'--adaire-mega-menu-animation-duration'
						),
						10
					) || 200;
				setTimeout( hidePanel, duration );
			} else {
				hidePanel();
			}

			showcaseControls?.reset();

			const index = openInstances.indexOf( instance );
			if ( index !== -1 ) {
				openInstances.splice( index, 1 );
			}
		}

		function scheduleOpen() {
			clearTimers();
			openTimer = setTimeout( open, openDelay );
		}

		function scheduleClose() {
			clearTimers();
			closeTimer = setTimeout( close, closeDelay );
		}

		function checkMobile() {
			const wasMobile = isMobile;
			isMobile = window.innerWidth < breakpoint;
			li.classList.toggle(
				'adaire-mega-menu-item--mobile-mode',
				isMobile
			);
			li.classList.toggle(
				'adaire-mega-menu-item--mobile-accordion',
				isMobile && mobileMode === 'accordion'
			);
			li.classList.toggle(
				'adaire-mega-menu-item--mobile-drilldown',
				isMobile && mobileMode === 'drilldown'
			);
			li.classList.toggle(
				'adaire-mega-menu-item--mobile-drawer',
				isMobile && mobileMode === 'drawer'
			);

			if ( wasMobile !== isMobile && trigger.dataset.mobileLabel ) {
				const labelEl = trigger.querySelector(
					'.adaire-mega-menu-item__label'
				);
				if ( labelEl && ! labelEl.dataset.desktopLabel ) {
					labelEl.dataset.desktopLabel = labelEl.textContent;
				}
				if ( labelEl ) {
					labelEl.textContent = isMobile
						? trigger.dataset.mobileLabel
						: labelEl.dataset.desktopLabel;
				}
			}
		}

		// Click / accordion mode (mobile always behaves as click, per the
		// "no hover-only functionality" accessibility requirement).
		trigger.addEventListener( 'click', ( event ) => {
			if ( isMobile || triggerMode === 'click' ) {
				event.preventDefault();
				if ( isOpen ) {
					close();
				} else {
					open();
				}
			}
		} );

		// Hover mode (desktop only).
		if ( triggerMode === 'hover' || triggerMode === 'hover-focus' ) {
			li.addEventListener( 'mouseenter', () => {
				if ( ! isMobile ) {
					scheduleOpen();
				}
			} );
			li.addEventListener( 'mouseleave', () => {
				if ( ! isMobile ) {
					scheduleClose();
				}
			} );
		}

		// Keyboard focus (hover-focus mode, and always for basic keyboard use).
		trigger.addEventListener( 'focus', () => {
			if ( ! isMobile && triggerMode === 'hover-focus' ) {
				open();
			}
		} );

		li.addEventListener( 'focusout', () => {
			window.requestAnimationFrame( () => {
				if ( ! li.contains( li.ownerDocument.activeElement ) ) {
					close();
				}
			} );
		} );

		if ( closeOnEscape ) {
			li.addEventListener( 'keydown', ( event ) => {
				if ( event.key === 'Escape' && isOpen ) {
					close();
					trigger.focus();
				}
			} );
		}

		if ( closeOnOutsideClick ) {
			document.addEventListener( 'click', ( event ) => {
				if ( isOpen && ! li.contains( event.target ) ) {
					close();
				}
			} );
		}

		if ( closeOnLinkSelect ) {
			panel.addEventListener( 'click', ( event ) => {
				const link = event.target.closest( 'a[href]' );
				// Drill/breadcrumb/accordion controls are buttons, not
				// links, so this only fires for an actual navigation.
				if ( link && ! link.closest( '.adaire-mmp-showcase__drill' ) ) {
					close();
				}
			} );
		}

		window.addEventListener( 'resize', checkMobile );
		checkMobile();

		// Layout-specific behaviour.
		const layout = panel.dataset.layout;
		let showcaseControls = null;
		if ( 'tabbed' === layout ) {
			initTabbed( panel, openDelay );
		} else if ( 'showcase' === layout ) {
			showcaseControls = initShowcase(
				panel,
				() => currentMobileMode() === 'accordion'
			);
		}

		const drawer =
			mobileMode === 'drawer'
				? setupDrawer( li, panel, {
						lockBodyScroll: lockBodyScrollSetting,
						onCloseRequest: close,
				  } )
				: null;
	}

	function init() {
		const items = document.querySelectorAll(
			'.adaire-mega-menu-item--has-panel'
		);
		items.forEach( initItem );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
