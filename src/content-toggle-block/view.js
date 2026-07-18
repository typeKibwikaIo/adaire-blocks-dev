// Maps the small set of GSAP ease names this block ever actually used to a
// roughly-equivalent CSS cubic-bezier, since there's no Inspector control for
// animationEase — every real instance carries the block.json default.
function cssEaseFor( gsapEase ) {
	switch ( gsapEase ) {
		case 'power2.in':
			return 'cubic-bezier(0.55, 0.085, 0.68, 0.53)';
		case 'power2.out':
		default:
			return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
	}
}

document.addEventListener( 'DOMContentLoaded', function () {
	const contentToggleBlocks = document.querySelectorAll( '.adaire-content-toggle' );

	contentToggleBlocks.forEach( ( toggleBlock ) => {
		const pills = toggleBlock.querySelectorAll( '.adaire-content-toggle__pill' );
		const panels = toggleBlock.querySelectorAll( '.adaire-content-toggle-panel' );

		// Get animation settings from data attributes
		const duration = parseFloat( toggleBlock.getAttribute( 'data-animation-duration' ) ) || 0.5;
		const ease = cssEaseFor( toggleBlock.getAttribute( 'data-animation-ease' ) || 'power2.out' );
		const initialActiveToggle = parseInt( toggleBlock.getAttribute( 'data-active-toggle' ) ) || 0;

		let currentActiveIndex = initialActiveToggle;

		// Calculate and set minimum height based on tallest panel
		const contentWrapper = toggleBlock.querySelector( '.adaire-content-toggle__content' );
		let maxHeight = 0;

		// Temporarily show all panels to measure their heights
		panels.forEach( ( panel ) => {
			panel.style.display = 'block';
			panel.style.position = 'relative';
			panel.style.opacity = '0';
			panel.style.visibility = 'hidden';
			const height = panel.scrollHeight;
			if ( height > maxHeight ) {
				maxHeight = height;
			}
		} );

		// Set minimum height on the wrapper
		if ( contentWrapper && maxHeight > 0 ) {
			contentWrapper.style.minHeight = `${ maxHeight }px`;
		}

		function hidePanel( panel ) {
			panel.style.display = 'none';
			panel.style.opacity = '0';
			panel.style.position = 'absolute';
			panel.style.visibility = 'hidden';
			panel.style.pointerEvents = 'none';
			panel.style.transform = '';
			panel.style.transition = '';
		}

		function showPanelImmediate( panel ) {
			panel.style.display = 'block';
			panel.style.opacity = '1';
			panel.style.position = 'relative';
			panel.style.visibility = 'visible';
			panel.style.pointerEvents = 'auto';
			panel.style.transform = '';
			panel.style.transition = '';
		}

		// Now hide all panels except the active one
		panels.forEach( ( panel, index ) => {
			if ( index !== initialActiveToggle ) {
				hidePanel( panel );
				panel.classList.remove( 'is-active' );
			} else {
				showPanelImmediate( panel );
				panel.classList.add( 'is-active' );
			}
		} );

		// Switch to a specific toggle
		function switchToToggle( index, immediate = false ) {
			if ( index === currentActiveIndex && ! immediate ) return;
			if ( index < 0 || index >= panels.length ) return;

			const oldPanel = panels[ currentActiveIndex ];
			const newPanel = panels[ index ];

			// Update pill buttons
			pills.forEach( ( pill, i ) => {
				if ( i === index ) {
					pill.classList.add( 'is-active' );
					pill.setAttribute( 'aria-selected', 'true' );
				} else {
					pill.classList.remove( 'is-active' );
					pill.setAttribute( 'aria-selected', 'false' );
				}
			} );

			if ( immediate ) {
				panels.forEach( ( panel, i ) => {
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

			// Hide all other panels immediately (not the outgoing/incoming pair)
			panels.forEach( ( panel, i ) => {
				if ( i !== index && panel !== oldPanel ) {
					panel.classList.remove( 'is-active' );
					hidePanel( panel );
				}
			} );

			// Fade out old panel smoothly
			if ( oldPanel && oldPanel !== newPanel ) {
				const outDuration = duration * 0.5;
				oldPanel.style.transition = `opacity ${ outDuration }s ease-in, transform ${ outDuration }s ease-in`;
				oldPanel.style.transform = 'translateY(-20px)';
				oldPanel.style.opacity = '0';

				window.setTimeout( () => {
					oldPanel.classList.remove( 'is-active' );
					hidePanel( oldPanel );
				}, outDuration * 1000 );
			}

			// Prepare new panel's starting state
			newPanel.style.transition = '';
			newPanel.style.display = 'block';
			newPanel.style.position = 'relative';
			newPanel.style.visibility = 'visible';
			newPanel.style.pointerEvents = 'auto';
			newPanel.style.opacity = '0';
			newPanel.style.transform = 'translateY(20px)';
			newPanel.classList.add( 'is-active' );

			// Stagger children in, same as the panel-level fade-in
			const children = Array.from( newPanel.children );
			children.forEach( ( child ) => {
				child.style.transition = '';
				child.style.opacity = '0';
				child.style.transform = 'translateY(30px)';
			} );

			// Force a reflow so the browser registers the "from" state before
			// the "to" state is applied on the next frame — otherwise the two
			// style writes collapse into one and nothing visibly transitions.
			void newPanel.offsetHeight;

			window.requestAnimationFrame( () => {
				const inDuration = duration * 0.6;
				const inDelay = duration * 0.3;
				newPanel.style.transition = `opacity ${ inDuration }s ${ ease }, transform ${ inDuration }s ${ ease }`;
				newPanel.style.transitionDelay = `${ inDelay }s`;
				newPanel.style.opacity = '1';
				newPanel.style.transform = 'translateY(0)';

				const childDuration = duration * 0.7;
				const stagger = 0.08;
				children.forEach( ( child, i ) => {
					child.style.transition = `opacity ${ childDuration }s ${ ease }, transform ${ childDuration }s ${ ease }`;
					child.style.transitionDelay = `${ inDelay + i * stagger }s`;
					child.style.opacity = '1';
					child.style.transform = 'translateY(0)';
				} );
			} );

			currentActiveIndex = index;
		}

		// Initialize on page load
		switchToToggle( initialActiveToggle, true );

		// Add click handlers
		pills.forEach( ( pill, index ) => {
			pill.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				switchToToggle( index );
			} );
		} );

		// Keyboard navigation
		toggleBlock.addEventListener( 'keydown', ( e ) => {
			if ( e.target.classList.contains( 'adaire-content-toggle__pill' ) ) {
				const currentIndex = parseInt( e.target.getAttribute( 'data-toggle-index' ) );
				let newIndex = currentIndex;

				switch ( e.key ) {
					case 'ArrowLeft':
						newIndex = currentIndex > 0 ? currentIndex - 1 : pills.length - 1;
						e.preventDefault();
						break;
					case 'ArrowRight':
						newIndex = currentIndex < pills.length - 1 ? currentIndex + 1 : 0;
						e.preventDefault();
						break;
					case 'Home':
						newIndex = 0;
						e.preventDefault();
						break;
					case 'End':
						newIndex = pills.length - 1;
						e.preventDefault();
						break;
				}

				if ( newIndex !== currentIndex ) {
					pills[ newIndex ].focus();
					switchToToggle( newIndex );
				}
			}
		} );
	} );
} );
