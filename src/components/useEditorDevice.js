import { useEffect, useRef } from '@wordpress/element';

/**
 * Keeps a block's own "Device View" control in step with the Adaire responsive
 * preview toolbar in the editor header.
 *
 * Without this the two controls look identical and mean different things: the
 * toolbar resizes the canvas (deciding which breakpoint actually *renders*),
 * while a block's Device View picks which breakpoint's values you are
 * *editing*. Changing one and not the other reads as "the control does
 * nothing", which is the single most common support question about these
 * blocks.
 *
 * The mapping is deliberately lossy in one direction. The toolbar offers four
 * canvas presets; blocks like Feature Grid Pro carry five breakpoints, and two
 * of them (smallLaptop 1025-1300, bigDesktop 1921+) have no preset to switch
 * to. Selecting one of those leaves the canvas alone rather than snapping it
 * to a width that would render a *different* breakpoint than the one being
 * edited — `hasCanvasPreset()` lets the block tell the user that.
 */

const STORE_KEY = 'adaireResponsiveDevice';
const EVENT = 'adaire-responsive-device-change';

/** Canvas preset -> block breakpoint. Smartwatch (280px) is inside mobile. */
const CANVAS_TO_BREAKPOINT = {
	desktop: 'desktop',
	tablet: 'tablet',
	mobile: 'mobile',
	smartwatch: 'mobile',
};

/** Block breakpoint -> canvas preset. Only these three have a real preset. */
const BREAKPOINT_TO_CANVAS = {
	mobile: 'mobile',
	tablet: 'tablet',
	desktop: 'desktop',
};

export function hasCanvasPreset( breakpoint ) {
	return Object.prototype.hasOwnProperty.call( BREAKPOINT_TO_CANVAS, breakpoint );
}

/**
 * @param {string}   deviceType    The block's current breakpoint key.
 * @param {Function} setDeviceType Setter for it.
 */
export default function useEditorDevice( deviceType, setDeviceType ) {
	// Set while applying an inbound change, so the outbound effect below
	// doesn't immediately echo it back to the toolbar.
	const applyingRef = useRef( false );

	// Toolbar -> block. Always followed: every canvas preset maps cleanly.
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return undefined;
		}

		const handleDeviceChange = ( event ) => {
			const next = CANVAS_TO_BREAKPOINT[ event?.detail?.device ];

			if ( ! next || next === deviceType ) {
				return;
			}

			applyingRef.current = true;
			setDeviceType( next );
		};

		window.addEventListener( EVENT, handleDeviceChange );
		return () => window.removeEventListener( EVENT, handleDeviceChange );
	}, [ deviceType, setDeviceType ] );

	// Block -> toolbar, for the breakpoints that have a canvas preset.
	useEffect( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		if ( applyingRef.current ) {
			applyingRef.current = false;
			return;
		}

		const canvas = BREAKPOINT_TO_CANVAS[ deviceType ];

		if ( ! canvas ) {
			return;
		}

		try {
			if ( window.localStorage.getItem( STORE_KEY ) === canvas ) {
				return;
			}
			window.localStorage.setItem( STORE_KEY, canvas );
		} catch ( error ) {
			// Storage can be blocked; the event below still drives the canvas
			// for this session, it just won't persist.
		}

		window.dispatchEvent(
			new CustomEvent( EVENT, { detail: { device: canvas } } )
		);
	}, [ deviceType ] );
}
