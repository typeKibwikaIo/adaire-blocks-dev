/**
 * Interactivity for the tabbed (Pattern A) and showcase (Pattern B) mega
 * panel layouts — shared between adaire/mega-menu-item's own view.js and
 * any other block that embeds AdaireMegaPanelRenderer output (e.g.
 * mega-menu-block's "use a Mega Panel" per-item content source). Both
 * functions operate on whatever "panel element" contains the rendered
 * `.adaire-mmp-tabbed`/`.adaire-mmp-showcase` markup and have no dependency
 * on any particular outer wrapper's class names or DOM structure.
 */

/**
 * Pattern A (tabbed): category list + card grid, with a container-level
 * hover grace period so moving the pointer diagonally from a category
 * into its own card panel doesn't trigger a switch or a close — only
 * leaving the whole `.adaire-mmp-tabbed` container (categories AND
 * panels together) starts the close/switch countdown.
 *
 * @param {Element} panelEl     Element containing the rendered `.adaire-mmp-tabbed` markup.
 * @param {number}  openDelayMs Hover grace period, in ms, before switching category.
 * @return {{cancelPendingSwitch: Function}|null} Controls, or null if not a tabbed panel.
 */
export function initTabbed( panelEl, openDelayMs ) {
	const root = panelEl.querySelector( '.adaire-mmp-tabbed' );
	if ( ! root ) {
		return null;
	}

	const categories = Array.prototype.slice.call(
		root.querySelectorAll( '.adaire-mmp-tabbed__category' )
	);
	const panels = Array.prototype.slice.call(
		root.querySelectorAll( '.adaire-mmp-tabbed__panel' )
	);

	let switchTimer = null;

	function activate( id ) {
		categories.forEach( ( cat ) => {
			const isActive = cat.dataset.itemId === id;
			cat.classList.toggle( 'is-active', isActive );
			cat.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
		} );
		panels.forEach( ( p ) => {
			p.hidden = p.dataset.itemId !== id;
		} );
	}

	categories.forEach( ( cat ) => {
		cat.addEventListener( 'mouseenter', () => {
			if ( switchTimer ) {
				clearTimeout( switchTimer );
			}
			switchTimer = setTimeout( () => {
				activate( cat.dataset.itemId );
			}, openDelayMs );
		} );

		cat.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			if ( switchTimer ) {
				clearTimeout( switchTimer );
			}
			activate( cat.dataset.itemId );
		} );

		cat.addEventListener( 'focus', () => {
			activate( cat.dataset.itemId );
		} );
	} );

	// Arrow-key navigation across the category tablist (standard
	// tablist keyboard pattern: Up/Down move focus + selection,
	// Home/End jump to the ends).
	root.querySelector( '.adaire-mmp-tabbed__categories' )?.addEventListener(
		'keydown',
		( event ) => {
			const currentIndex = categories.indexOf(
				root.ownerDocument.activeElement
			);
			if ( currentIndex === -1 ) {
				return;
			}
			let nextIndex = null;
			if ( event.key === 'ArrowDown' || event.key === 'ArrowRight' ) {
				nextIndex = ( currentIndex + 1 ) % categories.length;
			} else if ( event.key === 'ArrowUp' || event.key === 'ArrowLeft' ) {
				nextIndex =
					( currentIndex - 1 + categories.length ) %
					categories.length;
			} else if ( event.key === 'Home' ) {
				nextIndex = 0;
			} else if ( event.key === 'End' ) {
				nextIndex = categories.length - 1;
			}
			if ( nextIndex !== null ) {
				event.preventDefault();
				categories[ nextIndex ].focus();
				activate( categories[ nextIndex ].dataset.itemId );
			}
		}
	);

	return {
		cancelPendingSwitch: () => {
			if ( switchTimer ) {
				clearTimeout( switchTimer );
			}
		},
	};
}

/**
 * Pattern B (drill-down): every level already exists in the DOM
 * (rendered server-side); this only toggles which level is visible and
 * maintains the breadcrumb trail. Works identically at any breakpoint —
 * an anchored dropdown on desktop, or repositioned into a mobile
 * drawer/accordion by CSS + the mobile-mode logic of whichever block
 * embeds it.
 *
 * @param {Element}  panelEl         Element containing the rendered `.adaire-mmp-showcase` markup.
 * @param {Function} mobileAccordion Returns true when accordion mode is active for this instance right now.
 * @return {{reset: Function}|null} Controls, or null if not a showcase panel.
 */
export function initShowcase( panelEl, mobileAccordion ) {
	const root = panelEl.querySelector( '.adaire-mmp-showcase' );
	if ( ! root ) {
		return null;
	}

	const breadcrumb = root.querySelector( '.adaire-mmp-showcase__breadcrumb' );
	const trail = []; // Array of { id, label, levelEl }.

	function showLevel( levelEl ) {
		root.querySelectorAll( '.adaire-mmp-showcase__level' ).forEach(
			( lvl ) => {
				lvl.hidden = lvl !== levelEl;
			}
		);
	}

	function renderBreadcrumb() {
		if ( ! breadcrumb ) {
			return;
		}
		breadcrumb.innerHTML = '';
		if ( trail.length === 0 ) {
			return;
		}

		const topBtn = document.createElement( 'button' );
		topBtn.type = 'button';
		topBtn.textContent = window.adaireMegaMenuI18n?.top || 'Top';
		topBtn.addEventListener( 'click', () => goToDepth( -1 ) );
		breadcrumb.appendChild( topBtn );

		trail.forEach( ( entry, index ) => {
			const sep = document.createElement( 'span' );
			sep.setAttribute( 'aria-hidden', 'true' );
			sep.textContent = ' / ';
			breadcrumb.appendChild( sep );

			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.textContent = entry.label;
			if ( index === trail.length - 1 ) {
				btn.setAttribute( 'aria-current', 'true' );
			}
			btn.addEventListener( 'click', () => goToDepth( index ) );
			breadcrumb.appendChild( btn );
		} );
	}

	function goToDepth( depth ) {
		trail.length = depth + 1;
		const targetLevel =
			depth === -1
				? root.querySelector(
						'.adaire-mmp-showcase__level[data-level="0"]'
				  )
				: trail[ depth ].levelEl;
		showLevel( targetLevel );
		renderBreadcrumb();
	}

	// Drill in.
	root.querySelectorAll( '.adaire-mmp-showcase__drill' ).forEach(
		( button ) => {
			button.addEventListener( 'click', () => {
				const li = button.closest( '.adaire-mmp-showcase__item' );
				const nextLevel = li?.querySelector(
					':scope > .adaire-mmp-showcase__level'
				);
				if ( ! nextLevel ) {
					return;
				}

				if ( mobileAccordion && mobileAccordion() ) {
					// Accordion mode: expand/collapse the nested level in
					// place instead of replacing the visible level.
					const isOpen = ! nextLevel.hidden;
					nextLevel.hidden = isOpen;
					button.setAttribute(
						'aria-expanded',
						isOpen ? 'false' : 'true'
					);
					return;
				}

				const link = li.querySelector(
					':scope > .adaire-mmp-showcase__link'
				);
				trail.push( {
					label: link ? link.textContent : '',
					levelEl: nextLevel,
				} );
				showLevel( nextLevel );
				renderBreadcrumb();
			} );
		}
	);

	// Keyboard: Backspace/Left arrow at the root of a level goes back
	// one level (only outside accordion mode, where "back" means
	// something different — there's nothing to go back to).
	root.addEventListener( 'keydown', ( event ) => {
		if (
			( event.key === 'Backspace' || event.key === 'ArrowLeft' ) &&
			trail.length > 0 &&
			! ( mobileAccordion && mobileAccordion() ) &&
			event.target.tagName !== 'INPUT'
		) {
			event.preventDefault();
			goToDepth( trail.length - 2 );
		}
	} );

	return { reset: () => goToDepth( -1 ) };
}
