import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin( ScrollTrigger );

ScrollTrigger.config( {
	limitCallbacks: true,
	autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
	fastScrollEnd: true,
} );

const initHorizontalScrollCarousel = () => {
	// Kill any existing triggers for these sections to prevent duplicates
	ScrollTrigger.getAll().forEach( ( st ) => {
		if (
			st.trigger &&
			( st.trigger.classList.contains( 'adaire-hsc' ) ||
				st.trigger.closest?.( '.adaire-hsc' ) )
		) {
			st.kill( true );
		}
	} );

	const sections = document.querySelectorAll( '.adaire-hsc' );

	sections.forEach( ( section ) => {
		const track = section.querySelector( '.adaire-hsc__track' );
		if ( ! track ) return;

		const scrubSpeed = parseFloat( section.dataset.scrub ) || 1;

		// Direct measurement: at x=0 (guaranteed by onRefreshInit), ask the DOM
		// exactly how far the last card's right edge overshoots the section's
		// right edge, then add the track's own padding-right so the animation
		// ends with visible breathing room after the last card.
		//
		// getBoundingClientRect() returns the full geometric box even for
		// elements clipped by overflow:hidden, so this works at x=0 regardless
		// of how wide the page wrapper is or what the pin state is.
		const getScrollDistance = () => {
			const cards = [ ...track.querySelectorAll( '.adaire-hsc__card' ) ];
			if ( ! cards.length ) return 0;
			const lastCard = cards[ cards.length - 1 ];
			const lastCardRight  = lastCard.getBoundingClientRect().right;
			const sectionRight   = section.getBoundingClientRect().right;
			const trackPR = parseFloat( window.getComputedStyle( track ).paddingRight ) || 0;
			// Scroll until the last card clears the section edge, then keep
			// going by one trackPR worth so padding is visible after the card.
			return Math.max( 0, lastCardRight - sectionRight + trackPR );
		};

		// Main horizontal scroll tween â€” scrubbed to scroll position.
		// start: 'center center' pins the section once its vertical centre
		// reaches the viewport centre (50 % Y), so the cards are centred on
		// screen before the horizontal animation begins.
		// onRefreshInit fires BEFORE ScrollTrigger re-measures distances, so
		// the track is always at x:0 when scrollWidth is read â€” critical for
		// images that load after the first measurement.
		gsap.to( track, {
			x: () => -getScrollDistance(),
			ease: 'none',
			scrollTrigger: {
				trigger: section,
				pin: true,
				pinSpacing: true,
				scrub: scrubSpeed,
				start: 'center center',
				end: () => '+=' + getScrollDistance(),
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onRefreshInit: () => {
					// Reset before measurement so scrollWidth is always accurate.
					gsap.set( track, { x: 0 } );
				},
			},
		} );

		// Images can change card dimensions after the first measurement.
		// Re-measure once every image in this section has finished loading.
		const images = [ ...section.querySelectorAll( 'img' ) ];
		if ( images.length ) {
			let pending = images.filter( ( img ) => ! img.complete ).length;
			if ( pending === 0 ) {
				ScrollTrigger.refresh();
			} else {
				const onLoaded = () => {
					pending--;
					if ( pending === 0 ) ScrollTrigger.refresh();
				};
				images.forEach( ( img ) => {
					if ( ! img.complete ) img.addEventListener( 'load', onLoaded, { once: true } );
				} );
			}
		}

		// Subtle card entrance animations â€” each card fades + slides in from the right
		const cards = track.querySelectorAll( '.adaire-hsc__card' );
		cards.forEach( ( card, index ) => {
			// Stagger reveal on first viewport entry
			gsap.fromTo(
				card,
				{ opacity: 0, y: 20 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					delay: index * 0.08,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: section,
						start: 'top 80%',
						toggleActions: 'play none none reverse',
					},
				}
			);
		} );
	} );
};

// Safe one-time initialiser
let initialized = false;

const safeInit = () => {
	if ( initialized ) return;
	initialized = true;

	requestAnimationFrame( () => {
		initHorizontalScrollCarousel();
		requestAnimationFrame( () => {
			ScrollTrigger.refresh();
		} );
	} );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', safeInit );
} else {
	safeInit();
}

// Re-init on window resize (debounced)
let resizeTimer;
window.addEventListener( 'resize', () => {
	clearTimeout( resizeTimer );
	resizeTimer = setTimeout( () => {
		ScrollTrigger.refresh();
	}, 250 );
} );



