/**
 * Frontend-only runtime for the Video Player block.
 *
 * YouTube/Vimeo iframes are always encoded as 16:9 internally. Whenever this
 * block's own container isn't exactly that shape (any custom Height/Width
 * combination in the Inspector, or simply "Full Width" mode at whatever
 * column width the active theme happens to give it), the platform's own
 * player letterboxes/pillarboxes the actual video with black bars to
 * preserve that ratio instead of stretching it — that's the unwanted black
 * bar users see around the video; it isn't a border, margin, or any other
 * Inspector setting from this plugin.
 *
 * This applies the standard CSS "background-size: cover" technique to each
 * iframe: measure the visible content box, size the iframe so it's
 * deliberately oversized on whichever axis is short, then rely on
 * `.ad-video-player__content`'s own `overflow: hidden` (see style.scss) to
 * crop the excess. The video then always fully fills the block with no
 * visible black bars, regardless of the container's own aspect ratio.
 */
( function () {
	// YouTube and Vimeo both always embed a 16:9 player internally,
	// regardless of the source video's own aspect ratio.
	const EMBED_RATIO = 16 / 9;

	function fitIframeCover( content ) {
		const iframe = content.querySelector( 'iframe' );
		if ( ! iframe ) {
			return;
		}

		const fit = () => {
			const width = content.clientWidth;
			const height = content.clientHeight;

			if ( ! width || ! height ) {
				return;
			}

			if ( width / height > EMBED_RATIO ) {
				// Container is wider than 16:9 — match width, let height
				// overflow (and get cropped by overflow: hidden).
				iframe.style.width = width + 'px';
				iframe.style.height = ( width / EMBED_RATIO ) + 'px';
			} else {
				// Container is taller/narrower than 16:9 — match height,
				// let width overflow.
				iframe.style.height = height + 'px';
				iframe.style.width = ( height * EMBED_RATIO ) + 'px';
			}
		};

		fit();

		if ( 'ResizeObserver' in window ) {
			new ResizeObserver( fit ).observe( content );
		} else {
			window.addEventListener( 'resize', fit );
		}
	}

	function init() {
		document
			.querySelectorAll( '.ad-video-player__content' )
			.forEach( fitIframeCover );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
