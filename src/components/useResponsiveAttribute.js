import { useCallback, useEffect, useRef } from '@wordpress/element';

/**
 * Shared helper for blocks with per-breakpoint object attributes (e.g.
 * `{ mobile: {...}, tablet: {...}, desktop: {...} }`). Returns an
 * `updateResponsive( attrName, breakpointKey, value )` setter that merges
 * the new value into the existing per-breakpoint object without clobbering
 * other breakpoints, using a ref so it never captures a stale `attributes`
 * snapshot across renders.
 *
 * @param {Object}   attributes    Block attributes.
 * @param {Function} setAttributes Block's setAttributes.
 * @return {Function} updateResponsive( attrName, breakpointKey, value )
 */
export default function useResponsiveAttribute( attributes, setAttributes ) {
	const attributesRef = useRef( attributes );
	useEffect( () => { attributesRef.current = attributes; }, [ attributes ] );

	return useCallback( ( attr, bp, value ) => {
		setAttributes( {
			[ attr ]: {
				...( attributesRef.current[ attr ] || {} ),
				[ bp ]: value,
			},
		} );
	}, [ setAttributes ] );
}
