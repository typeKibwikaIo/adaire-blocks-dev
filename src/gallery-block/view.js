/**
 * Gallery Block — frontend lightbox.
 *
 * Vanilla JS, no dependencies. Each `.gallery-block` instance with
 * data-lightbox="true" gets click-to-enlarge behaviour with prev/next
 * navigation scoped to that instance's own images.
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const galleries = document.querySelectorAll( '.gallery-block[data-lightbox="true"]' );

	galleries.forEach( ( gallery ) => {
		const images = Array.from( gallery.querySelectorAll( '.gallery-block__item img' ) );
		if ( images.length === 0 ) {
			return;
		}

		let overlay = null;
		let currentIndex = 0;

		const buildOverlay = () => {
			const el = document.createElement( 'div' );
			el.className = 'gallery-block__lightbox';
			el.innerHTML = `
				<button class="gallery-block__lightbox-close" aria-label="Close">&times;</button>
				<button class="gallery-block__lightbox-prev" aria-label="Previous image">&#8249;</button>
				<img class="gallery-block__lightbox-image" alt="" />
				<div class="gallery-block__lightbox-caption"></div>
				<button class="gallery-block__lightbox-next" aria-label="Next image">&#8250;</button>
			`;
			document.body.appendChild( el );
			return el;
		};

		const show = ( index ) => {
			currentIndex = ( index + images.length ) % images.length;
			const img = images[ currentIndex ];

			if ( ! overlay ) {
				overlay = buildOverlay();

				overlay.querySelector( '.gallery-block__lightbox-close' ).addEventListener( 'click', hide );
				overlay.addEventListener( 'click', ( e ) => {
					if ( e.target === overlay ) {
						hide();
					}
				} );
				overlay.querySelector( '.gallery-block__lightbox-prev' ).addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					show( currentIndex - 1 );
				} );
				overlay.querySelector( '.gallery-block__lightbox-next' ).addEventListener( 'click', ( e ) => {
					e.stopPropagation();
					show( currentIndex + 1 );
				} );
			}

			const lightboxImg = overlay.querySelector( '.gallery-block__lightbox-image' );
			lightboxImg.src = img.dataset.full || img.src;
			lightboxImg.alt = img.alt || '';

			const caption = overlay.querySelector( '.gallery-block__lightbox-caption' );
			caption.textContent = img.dataset.caption || '';
			caption.style.display = img.dataset.caption ? 'block' : 'none';

			overlay.classList.toggle( 'has-multiple', images.length > 1 );
			overlay.classList.add( 'is-open' );
			document.body.classList.add( 'gallery-block-lightbox-open' );
		};

		function hide() {
			if ( overlay ) {
				overlay.classList.remove( 'is-open' );
			}
			document.body.classList.remove( 'gallery-block-lightbox-open' );
		}

		images.forEach( ( img, index ) => {
			img.style.cursor = 'zoom-in';
			img.addEventListener( 'click', () => show( index ) );
		} );

		document.addEventListener( 'keydown', ( e ) => {
			if ( ! overlay || ! overlay.classList.contains( 'is-open' ) ) {
				return;
			}
			if ( e.key === 'Escape' ) hide();
			if ( e.key === 'ArrowLeft' ) show( currentIndex - 1 );
			if ( e.key === 'ArrowRight' ) show( currentIndex + 1 );
		} );
	} );
} );
