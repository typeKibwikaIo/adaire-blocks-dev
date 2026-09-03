/**
 * Shared scroll-entrance animation runtime.
 *
 * A block opts in by rendering (in save.js) a root element carrying the
 * `adaire-scroll-animate` class plus `data-animation-*` attributes, and by
 * calling `initScrollAnimation()` from its own `view.js` on the front end.
 * If the block's root contains a direct child with the
 * `adaire-scroll-animate__content` class, that child is animated instead of
 * the root itself (useful when the root needs to stay unanimated, e.g. as a
 * fixed-size hit area) — otherwise the root element is animated directly.
 *
 * Adapted from animation-scroll-block/view.js (same IntersectionObserver +
 * inline-style approach) so every block gets identical animation behavior
 * without each one re-implementing it. animation-scroll-block itself is
 * intentionally left as-is/untouched by this extraction.
 *
 * @param {string} rootSelector CSS selector for animated root elements.
 *                               Defaults to '.adaire-scroll-animate'.
 */
export function initScrollAnimation( rootSelector = '.adaire-scroll-animate' ) {
	const roots = document.querySelectorAll( rootSelector );
	if ( ! roots.length ) {
		return;
	}

	roots.forEach( ( root ) => {
		if ( root.getAttribute( 'data-animation-enabled' ) !== 'true' ) {
			return;
		}

		const animationType = root.getAttribute( 'data-animation-type' ) || 'fade-in';
		const duration = parseInt( root.getAttribute( 'data-animation-duration' ), 10 ) || 1000;
		const delay = parseInt( root.getAttribute( 'data-animation-delay' ), 10 ) || 0;
		const easing = root.getAttribute( 'data-animation-easing' ) || 'ease-out';
		const distance = parseInt( root.getAttribute( 'data-animation-distance' ), 10 ) || 50;
		const flipAxis = root.getAttribute( 'data-flip-axis' ) || 'horizontal';
		const flipDirection = root.getAttribute( 'data-flip-direction' ) || 'clockwise';
		const reverseScroll = root.getAttribute( 'data-animation-reverse-scroll' ) === 'true';
		const threshold = parseFloat( root.getAttribute( 'data-animation-threshold' ) ) || 0.2;
		const once = root.getAttribute( 'data-animation-once' ) === 'true';

		const target = root.querySelector( ':scope > .adaire-scroll-animate__content' ) || root;

		applyStyles( target, getInitialStyles( animationType, distance, flipAxis, flipDirection ) );

		let isAnimatedIn = false;
		let lastRatio = 0;
		let animationTimeout = null;

		const observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if ( once && isAnimatedIn && entry.isIntersecting ) {
					return;
				}

				const currentRatio = entry.intersectionRatio;
				const wasAboveThreshold = lastRatio >= threshold;
				const isNowAboveThreshold = currentRatio >= threshold;

				if ( isNowAboveThreshold && ! wasAboveThreshold && ! isAnimatedIn ) {
					if ( animationTimeout ) {
						clearTimeout( animationTimeout );
					}
					animationTimeout = setTimeout( () => {
						if ( entry.isIntersecting && currentRatio >= threshold ) {
							applyAnimation( target, animationType, 'in', duration, easing, distance, flipAxis, flipDirection );
							root.classList.add( 'is-animated-in' );
							isAnimatedIn = true;
						}
						animationTimeout = null;
					}, delay );
				} else if ( ! isNowAboveThreshold && wasAboveThreshold && isAnimatedIn && reverseScroll ) {
					if ( animationTimeout ) {
						clearTimeout( animationTimeout );
						animationTimeout = null;
					}
					applyAnimation( target, animationType, 'out', duration, easing, distance, flipAxis, flipDirection );
					root.classList.remove( 'is-animated-in' );
					isAnimatedIn = false;
				}

				lastRatio = currentRatio;
			} );
		}, {
			root: null,
			rootMargin: '0px',
			threshold: [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0 ],
		} );

		observer.observe( root );
	} );
}

function getInitialStyles( animationType, distance, flipAxis, flipDirection ) {
	switch ( animationType ) {
		case 'fade-in':
		case 'fade-out':
			return { opacity: '0' };
		case 'fade-left':
		case 'fly-left':
			return { opacity: '0', transform: `translateX(-${ distance }px)` };
		case 'fade-right':
		case 'fly-right':
			return { opacity: '0', transform: `translateX(${ distance }px)` };
		case 'fly-up':
			return { opacity: '0', transform: `translateY(${ distance }px)` };
		case 'fly-down':
			return { opacity: '0', transform: `translateY(-${ distance }px)` };
		case 'grow':
			return { opacity: '0', transform: 'scale(0.8)' };
		case 'shrink':
			return { opacity: '0', transform: 'scale(1.2)' };
		case 'bounce':
			return { opacity: '0', transform: 'scale(0.3)' };
		case 'flip': {
			const axis = flipAxis === 'horizontal' ? 'Y' : 'X';
			const dir = flipDirection === 'clockwise' ? '90' : '-90';
			return { opacity: '0', transform: `perspective(100px) rotate${ axis }(${ dir }deg)` };
		}
		case 'rotate':
			return { opacity: '0', transform: 'rotate(180deg)' };
		case 'blur-in':
			return { opacity: '0', filter: 'blur(10px)' };
		case 'blur-out':
			return { opacity: '0', filter: 'blur(0px)' };
		default:
			return { opacity: '0' };
	}
}

function applyAnimation( element, animationType, direction, duration, easing, distance, flipAxis, flipDirection ) {
	const isIn = direction === 'in';

	switch ( animationType ) {
		case 'fade-in':
		case 'fade-out':
			element.style.transition = `opacity ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			break;
		case 'fade-left':
		case 'fly-left':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'translateX(0)' : `translateX(-${ distance }px)`;
			break;
		case 'fade-right':
		case 'fly-right':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'translateX(0)' : `translateX(${ distance }px)`;
			break;
		case 'fly-up':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'translateY(0)' : `translateY(${ distance }px)`;
			break;
		case 'fly-down':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'translateY(0)' : `translateY(-${ distance }px)`;
			break;
		case 'grow':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'scale(1)' : 'scale(0.8)';
			break;
		case 'shrink':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'scale(1)' : 'scale(1.2)';
			break;
		case 'bounce':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'scale(1)' : 'scale(0.3)';
			break;
		case 'flip': {
			const axis = flipAxis === 'horizontal' ? 'Y' : 'X';
			const dir = flipDirection === 'clockwise' ? '90' : '-90';
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? `perspective(100px) rotate${ axis }(0deg)` : `perspective(200px) rotate${ axis }(${ dir }deg)`;
			break;
		}
		case 'rotate':
			element.style.transition = `opacity ${ duration }ms ${ easing }, transform ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.transform = isIn ? 'rotate(0deg)' : 'rotate(180deg)';
			break;
		case 'blur-in':
			element.style.transition = `opacity ${ duration }ms ${ easing }, filter ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.filter = isIn ? 'blur(0px)' : 'blur(10px)';
			break;
		case 'blur-out':
			element.style.transition = `opacity ${ duration }ms ${ easing }, filter ${ duration }ms ${ easing }`;
			element.style.opacity = isIn ? '1' : '0';
			element.style.filter = 'blur(0px)';
			break;
	}
}

function applyStyles( element, styles ) {
	Object.keys( styles ).forEach( ( key ) => {
		element.style[ key ] = styles[ key ];
	} );
}
