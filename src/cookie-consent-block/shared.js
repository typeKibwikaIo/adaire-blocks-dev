/**
 * Shared helpers between Edit and Save so canvas and front end never drift.
 */

export const LAYOUT_OPTIONS = [
	{ label: 'Bottom Banner (full width)', value: 'bar-bottom' },
	{ label: 'Top Banner (full width)', value: 'bar-top' },
	{ label: 'Floating Box — Bottom Right', value: 'floating-bottom-right' },
	{ label: 'Floating Box — Bottom Left', value: 'floating-bottom-left' },
	{ label: 'Floating Box — Top Right', value: 'floating-top-right' },
	{ label: 'Floating Box — Top Left', value: 'floating-top-left' },
	{ label: 'Center Modal', value: 'center-modal' },
	{ label: 'Slide-in — Bottom', value: 'slide-in-bottom' },
	{ label: 'Slide-in — Right', value: 'slide-in-right' },
];

// Convert a { desktop:{value,unit}, tablet:{...}, mobile:{...} } attribute
// into three CSS custom properties (base + tablet/mobile overrides), falling
// back gracefully so an untouched attribute still renders sane defaults.
function responsiveVars( obj, name, fallbackUnit = 'px' ) {
	const d = obj?.desktop ?? {};
	const t = obj?.tablet ?? d;
	const m = obj?.mobile ?? t;
	return {
		[ `--ccb-${ name }` ]: `${ d.value ?? 0 }${ d.unit || fallbackUnit }`,
		[ `--ccb-${ name }-tablet` ]: `${ t.value ?? d.value ?? 0 }${ t.unit || d.unit || fallbackUnit }`,
		[ `--ccb-${ name }-mobile` ]: `${ m.value ?? t.value ?? d.value ?? 0 }${ m.unit || t.unit || d.unit || fallbackUnit }`,
	};
}

export function getStyleVars( a ) {
	return {
		'--ccb-bg': a.backgroundColor || '#ffffff',
		'--ccb-text': a.textColor || '#5f6368',
		'--ccb-heading': a.headingColor || '#202124',
		'--ccb-accent': a.accentColor || '#1a73e8',
		'--ccb-btn-text': a.primaryButtonTextColor || '#ffffff',
		'--ccb-btn2-bg': a.secondaryButtonBg || 'transparent',
		'--ccb-btn2-text': a.secondaryButtonTextColor || '#1a73e8',
		'--ccb-border-color': a.borderColor || '#e5e7eb',
		'--ccb-border-width': `${ a.showBorder ? ( a.borderWidth ?? 1 ) : 0 }px`,
		'--ccb-radius': `${ a.borderRadius ?? 10 }px`,
		'--ccb-gap': `${ a.gap ?? 14 }px`,
		'--ccb-max-width': `${ a.maxWidth ?? 440 }px`,
		'--ccb-font-family': a.fontFamily || 'inherit',
		'--ccb-font-weight': a.fontWeight || '400',
		'--ccb-line-height': a.lineHeight || '1.6',
		'--ccb-anim-duration': `${ a.animationDuration ?? 400 }ms`,
		'--ccb-overlay': a.overlayColor || 'rgba(15,23,42,0.55)',
		'--ccb-z-index': a.zIndex ?? 999999,
		...responsiveVars( a.headingFontSize, 'heading-fs' ),
		...responsiveVars( a.bodyFontSize, 'body-fs' ),
		...responsiveVars( a.padding, 'padding' ),
	};
}
