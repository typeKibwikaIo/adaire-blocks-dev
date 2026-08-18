/**
 * Frontend-only runtime for the Video Player block.
 *
 * YouTube/Vimeo iframes are always encoded as 16:9 internally. Whenever this
 * block's own container isn't exactly that shape (any custom Height/Width
 * combination in the Inspector, or simply "Full Width" mode at whatever
 * column width the active theme happens to give it), the platform's own
 * player letterboxes/pillarboxes the actual video with black bars to
 * preserve that ratio instead of stretching it.
 *
 * Two fit modes, chosen via the Fit Mode control (data-fit-mode on the
 * .ad-video-player__content element, defaults to "contain" when absent):
 *
 * - "contain" (the default): size the iframe so it fits ENTIRELY within the
 *   visible box on whichever axis is the tighter constraint, so the whole
 *   video frame is always visible — same idea as the platform's own player,
 *   just also handling axes 16:9 alone doesn't. Any leftover space is filled
 *   by .ad-video-player__content's background-color (see style.scss)
 *   instead of cropping anything away.
 * - "cover": the previous always-crop-to-fill behavior. Applies the
 *   standard CSS "background-size: cover" technique to the iframe: size it
 *   so it's deliberately OVERSIZED on whichever axis is short, then rely on
 *   `.ad-video-player__content`'s `overflow: hidden` (see style.scss) to
 *   crop the excess, anchored to the Frame Position (focal point) control
 *   via top/left/transform in CSS.
 *
 * Either way, iframes have no native object-fit/object-position equivalent
 * — this JS measurement + explicit width/height is what stands in for it.
 */
( function () {
	// YouTube and Vimeo both always embed a 16:9 player internally,
	// regardless of the source video's own aspect ratio.
	const EMBED_RATIO = 16 / 9;

	function fitIframe( content ) {
		const iframe = content.querySelector( 'iframe' );
		if ( ! iframe ) {
			return;
		}

		const mode = content.dataset.fitMode === 'cover' ? 'cover' : 'contain';

		const fit = () => {
			const width = content.clientWidth;
			const height = content.clientHeight;

			if ( ! width || ! height ) {
				return;
			}

			const containerIsWiderThanEmbed = width / height > EMBED_RATIO;
			// "cover": match whichever axis is the SHORT one, so the other
			// axis overflows (and gets cropped by overflow: hidden).
			// "contain": match whichever axis is the LONG one instead, so
			// the iframe shrinks to fit entirely within the box on the
			// short axis, leaving the long axis with letterboxed space.
			// That's the entire difference between the two modes here —
			// everything else (measuring, applying width/height) is
			// identical.
			const matchWidth = mode === 'cover' ? containerIsWiderThanEmbed : ! containerIsWiderThanEmbed;

			if ( matchWidth ) {
				iframe.style.width = width + 'px';
				iframe.style.height = ( width / EMBED_RATIO ) + 'px';
			} else {
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
			.forEach( fitIframe );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
