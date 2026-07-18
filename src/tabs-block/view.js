// Maps the GSAP ease names exposed in this block's Inspector controls (see
// EASE_OPTIONS in edit.js) to the closest CSS cubic-bezier equivalent. True
// multi-bounce elastic easing has no exact CSS transition-timing-function
// equivalent, so it's approximated with a single-overshoot "back" curve.
function cssEaseFor( gsapEase ) {
	switch ( gsapEase ) {
		case 'power2.in':
			return 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
		case 'power2.inOut':
			return 'cubic-bezier(0.455, 0.03, 0.515, 0.955)';
		case 'power3.out':
			return 'cubic-bezier(0.215, 0.61, 0.355, 1)';
		case 'power4.out':
			return 'cubic-bezier(0.165, 0.84, 0.44, 1)';
		case 'elastic.out(1, 0.5)':
		case 'back.out(1.2)':
			return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
		case 'power2.out':
		default:
			return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
	}
}

document.addEventListener( 'DOMContentLoaded', function () {
	const tabBlocks = document.querySelectorAll( '.adaire-tabs' );

	tabBlocks.forEach( ( tabBlock ) => {
		const tabs = tabBlock.querySelectorAll( '.adaire-tabs__tab' );
		const underline = tabBlock.querySelector( '.adaire-tabs__underline' );
		const contentPanels = tabBlock.querySelectorAll( '.adaire-tab-panel' );

		// Get animation settings from data attributes
		const duration = parseFloat( tabBlock.getAttribute( 'data-animation-duration' ) ) || 0.6;
		const ease = cssEaseFor( tabBlock.getAttribute( 'data-animation-ease' ) || 'power2.out' );
		const initialActiveTab = parseInt( tabBlock.getAttribute( 'data-active-tab' ) ) || 0;

		let currentActiveIndex = initialActiveTab;

		const panelsWrapper = tabBlock.querySelector( '.adaire-tabs__panels' );
		let wrapperCleanupTimeout = null;

		// Panel visibility is class-driven with !important rules, so a
		// hidden panel can only be measured by overriding those rules with
		// inline !important declarations for the duration of the read.
		const measurePanelHeight = ( panel ) => {
			if ( ! panel ) return 0;
			const overrides = [
				[ 'display', 'block' ],
				[ 'position', 'absolute' ],
				[ 'height', 'auto' ],
				[ 'overflow', 'visible' ],
				[ 'visibility', 'hidden' ],
			];
			overrides.forEach( ( [ prop, value ] ) => panel.style.setProperty( prop, value, 'important' ) );
			const height = panel.offsetHeight;
			overrides.forEach( ( [ prop ] ) => panel.style.removeProperty( prop ) );
			return height;
		};

		function hidePanel( panel ) {
			panel.style.transition = '';
			panel.style.display = 'none';
			panel.style.opacity = '0';
			panel.style.position = 'absolute';
			panel.style.visibility = 'hidden';
			panel.style.pointerEvents = 'none';
			panel.style.transform = '';
		}

		function showPanelImmediate( panel ) {
			panel.style.transition = '';
			panel.style.display = 'block';
			panel.style.opacity = '1';
			panel.style.position = 'relative';
			panel.style.visibility = 'visible';
			panel.style.pointerEvents = 'auto';
			panel.style.transform = '';
		}

		// Now hide all panels except the active one
		contentPanels.forEach( ( panel, index ) => {
			if ( index !== initialActiveTab ) {
				hidePanel( panel );
				panel.classList.remove( 'is-active' );
			} else {
				showPanelImmediate( panel );
				panel.classList.add( 'is-active' );
			}
		} );

		// Initialize underline position
		function updateUnderline( tabElement, immediate = false ) {
			if ( ! tabElement || ! underline ) return;

			// Check if we're in vertical layout
			const tabLayout = tabBlock.getAttribute( 'data-tab-layout' );
			if ( tabLayout === 'vertical' ) {
				// In vertical layout, we don't use the moving underline
				return;
			}

			// Pill style has no moving underline (element isn't rendered)
			if ( tabBlock.getAttribute( 'data-tab-style' ) === 'pills' ) {
				return;
			}

			const tabRect = tabElement.getBoundingClientRect();
			const listRect = tabElement.parentElement.getBoundingClientRect();
			const offsetLeft = tabRect.left - listRect.left;
			const width = tabRect.width;

			// Calculate vertical offset for wrapped tabs
			const offsetTop = tabRect.top - listRect.top;

			if ( immediate ) {
				underline.style.transition = '';
				underline.style.transform = `translate(${ offsetLeft }px, ${ offsetTop }px)`;
				underline.style.width = `${ width }px`;
			} else {
				underline.style.transition = `transform ${ duration }s ${ ease }, width ${ duration }s ${ ease }`;
				underline.style.transform = `translate(${ offsetLeft }px, ${ offsetTop }px)`;
				underline.style.width = `${ width }px`;
			}
		}

		// Switch to a specific tab
		function switchToTab( index, immediate = false ) {
			if ( index === currentActiveIndex && ! immediate ) return;
			if ( index < 0 || index >= contentPanels.length ) return;

			const oldPanel = contentPanels[ currentActiveIndex ];
			const newPanel = contentPanels[ index ];
			const newTab = tabs[ index ];

			// Animate the wrapper between the outgoing and incoming panel
			// heights so content below the block is pushed smoothly instead
			// of jumping when panels differ in height.
			if ( panelsWrapper && ! immediate && newPanel !== oldPanel ) {
				if ( wrapperCleanupTimeout ) {
					window.clearTimeout( wrapperCleanupTimeout );
					wrapperCleanupTimeout = null;
				}

				const startHeight = panelsWrapper.offsetHeight;
				const targetHeight = measurePanelHeight( newPanel );

				if ( targetHeight > 0 && targetHeight !== startHeight ) {
					panelsWrapper.style.transition = '';
					panelsWrapper.style.height = `${ startHeight }px`;
					panelsWrapper.style.overflow = 'hidden';

					void panelsWrapper.offsetHeight; // force reflow

					const morphDuration = duration * 1.1;
					window.requestAnimationFrame( () => {
						panelsWrapper.style.transition = `height ${ morphDuration }s cubic-bezier(0.455, 0.03, 0.515, 0.955)`;
						panelsWrapper.style.height = `${ targetHeight }px`;
					} );

					wrapperCleanupTimeout = window.setTimeout( () => {
						panelsWrapper.style.transition = '';
						panelsWrapper.style.height = '';
						panelsWrapper.style.overflow = '';
						wrapperCleanupTimeout = null;
					}, morphDuration * 1000 );
				} else {
					panelsWrapper.style.transition = '';
					panelsWrapper.style.height = '';
					panelsWrapper.style.overflow = '';
				}
			}

			// Update tab buttons
			tabs.forEach( ( tab, i ) => {
				if ( i === index ) {
					tab.classList.add( 'is-active' );
					tab.setAttribute( 'aria-selected', 'true' );
				} else {
					tab.classList.remove( 'is-active' );
					tab.setAttribute( 'aria-selected', 'false' );
				}
			} );

			// Animate underline
			updateUnderline( newTab, immediate );

			if ( immediate ) {
				contentPanels.forEach( ( panel, i ) => {
					if ( i !== index ) {
						hidePanel( panel );
						panel.classList.remove( 'is-active' );
					}
				} );
				showPanelImmediate( newPanel );
				newPanel.classList.add( 'is-active' );
				currentActiveIndex = index;
				return;
			}

			// Fade out old panel smoothly
			if ( oldPanel && oldPanel !== newPanel ) {
				const outDuration = duration * 0.5;
				oldPanel.style.transition = `opacity ${ outDuration }s cubic-bezier(0.55, 0.085, 0.68, 0.53), transform ${ outDuration }s cubic-bezier(0.55, 0.085, 0.68, 0.53)`;
				oldPanel.style.transform = 'translateY(-20px)';
				oldPanel.style.opacity = '0';

				window.setTimeout( () => {
					oldPanel.classList.remove( 'is-active' );
					hidePanel( oldPanel );
				}, outDuration * 1000 );
			}

			// Hide all other panels immediately
			contentPanels.forEach( ( panel, i ) => {
				if ( i !== index && panel !== oldPanel ) {
					panel.classList.remove( 'is-active' );
					hidePanel( panel );
				}
			} );

			// Fade in new content with a staggered-children entrance
			newPanel.style.transition = '';
			newPanel.style.display = 'block';
			newPanel.style.opacity = '0';
			newPanel.style.transform = 'translateY(20px)';
			newPanel.style.position = 'relative';
			newPanel.style.visibility = 'visible';
			newPanel.style.pointerEvents = 'auto';
			newPanel.classList.add( 'is-active' );

			const panelContent = newPanel.querySelector( '.adaire-tab-panel__content' );
			const children = panelContent ? Array.from( panelContent.children ) : [];
			children.forEach( ( child ) => {
				child.style.transition = '';
				child.style.opacity = '0';
				child.style.transform = 'translateY(30px)';
			} );

			void newPanel.offsetHeight; // force reflow

			window.requestAnimationFrame( () => {
				const inDuration = duration * 0.6;
				newPanel.style.transition = `opacity ${ inDuration }s ${ ease }, transform ${ inDuration }s ${ ease }`;
				newPanel.style.opacity = '1';
				newPanel.style.transform = 'translateY(0)';

				const childDuration = duration * 0.7;
				const stagger = 0.08;
				const childDelay = duration * 0.3;
				children.forEach( ( child, i ) => {
					child.style.transition = `opacity ${ childDuration }s ${ ease }, transform ${ childDuration }s ${ ease }`;
					child.style.transitionDelay = `${ childDelay + i * stagger }s`;
					child.style.opacity = '1';
					child.style.transform = 'translateY(0)';
				} );
			} );

			currentActiveIndex = index;
		}

		// Initialize on page load
		switchToTab( initialActiveTab, true );

		// Add click handlers
		tabs.forEach( ( tab, index ) => {
			tab.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				switchToTab( index );
			} );
		} );

		// Handle window resize - update underline position
		let resizeTimer;
		window.addEventListener( 'resize', () => {
			clearTimeout( resizeTimer );
			resizeTimer = setTimeout( () => {
				updateUnderline( tabs[ currentActiveIndex ], true );
			}, 100 );
		} );

		// Keyboard navigation
		tabBlock.addEventListener( 'keydown', ( e ) => {
			if ( e.target.classList.contains( 'adaire-tabs__tab' ) ) {
				const currentIndex = parseInt( e.target.getAttribute( 'data-tab-index' ) );
				let newIndex = currentIndex;

				switch ( e.key ) {
					case 'ArrowLeft':
						newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
						e.preventDefault();
						break;
					case 'ArrowRight':
						newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
						e.preventDefault();
						break;
					case 'Home':
						newIndex = 0;
						e.preventDefault();
						break;
					case 'End':
						newIndex = tabs.length - 1;
						e.preventDefault();
						break;
				}

				if ( newIndex !== currentIndex ) {
					tabs[ newIndex ].focus();
					switchToTab( newIndex );
				}
			}
		} );
	} );
} );
