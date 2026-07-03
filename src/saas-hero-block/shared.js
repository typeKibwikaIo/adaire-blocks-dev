/**
 * Shared logic between edit.js (editor preview) and save.js (static frontend
 * output). Keeping this in one place means the two can never drift apart —
 * any CSS var or data-normalization fix made here applies identically to
 * both the editor canvas and the published page.
 */

// ─── Small numeric helpers ──────────────────────────────────────────────
// A few attributes (ctaBorderRadius, mediaBorderRadius) use -1 as "inherit
// the block's global radius" so that's distinguishable from "explicitly 0".
export function resolveSentinel( value, fallback ) {
	return value === undefined || value === null || value < 0 ? fallback : value;
}

export function alignToFlex( align ) {
	if ( align === 'left' ) return 'flex-start';
	if ( align === 'right' ) return 'flex-end';
	return 'center';
}

export function getBgTypeClass( a ) {
	return `bg-type-${ a.backgroundType || 'solid' }`;
}

// ─── Hero Effects & Decorations: industry presets ─────────────────────────
// Presets are a convenience layer only — they just batch-set the same
// discrete attributes the individual toggles use, so render code never has
// to special-case "which preset is active." Picking a preset, then tweaking
// a toggle afterwards, always works as expected.
export const EFFECT_KEYS = [
	'effectDotPattern',
	'effectGradientOverlay',
	'effectAbstractShapes',
	'effectGlow',
	'effectBlur',
	'effectFloatingElements',
	'effectAnimatedAccents',
];

export const EFFECT_PRESETS = {
	sports: {
		effectDotPattern: true,
		effectAnimatedAccents: true,
		effectGlow: true,
		effectGlowColor: '#f97316',
	},
	gym: {
		effectAbstractShapes: true,
		effectGlow: true,
		effectGlowColor: '#ef4444',
		effectAnimatedAccents: true,
	},
	ecommerce: {
		effectFloatingElements: true,
		effectGradientOverlay: true,
		effectGradientOverlayColor1: '#ec4899',
		effectGradientOverlayColor2: '#8b5cf6',
		effectGradientOverlayOpacity: 25,
	},
	business: {
		effectDotPattern: true,
		effectGradientOverlay: true,
		effectGradientOverlayColor1: '#1e3a8a',
		effectGradientOverlayColor2: '#0ea5e9',
		effectGradientOverlayOpacity: 12,
	},
	medical: {
		effectBlur: true,
		effectGradientOverlay: true,
		effectGradientOverlayColor1: '#0ea5e9',
		effectGradientOverlayColor2: '#22d3ee',
		effectGradientOverlayOpacity: 18,
	},
	gaming: {
		effectGlow: true,
		effectGlowColor: '#a855f7',
		effectAnimatedAccents: true,
		effectAbstractShapes: true,
	},
};

export function buildPresetPatch( key ) {
	if ( key === 'custom' ) {
		return { effectsPreset: key };
	}
	const reset = EFFECT_KEYS.reduce( ( acc, k ) => ( { ...acc, [ k ]: false } ), {} );
	if ( key === 'none' || ! EFFECT_PRESETS[ key ] ) {
		return { effectsPreset: 'none', ...reset };
	}
	return { effectsPreset: key, ...reset, ...EFFECT_PRESETS[ key ] };
}

// ─── CSS custom properties ─────────────────────────────────────────────
// Single source of truth for every --ad-* var the stylesheet consumes.
export function getStyleVars( a ) {
	const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

	return {
		'--ad-accent': a.accentColor || '#6366f1',
		'--ad-color': a.textColor || '#111827',

		// Background — one var per layer, gated by the bg-type-* class in CSS
		// rather than a single conditional var (that's the bug this rewrite fixes:
		// the old code crammed everything into one --ad-bg var with no CSS
		// consumer for the image case at all).
		'--ad-bg-color': a.backgroundColor || '#ffffff',
		'--ad-bg-gradient': a.backgroundGradient || defaultGradient,
		'--ad-bg-image': a.backgroundImage ? `url(${ a.backgroundImage })` : 'none',
		'--ad-bg-image-size': a.backgroundImageSize || 'cover',
		'--ad-bg-image-position': a.backgroundImagePosition || 'center',
		'--ad-bg-image-repeat': a.backgroundImageRepeat || 'no-repeat',

		'--ad-button-primary-color': a.buttonPrimaryColor || '#ffffff',
		'--ad-button-primary-bg': a.buttonPrimaryBg || a.accentColor || '#6366f1',
		'--ad-button-secondary-color': a.buttonSecondaryColor || '#111827',
		'--ad-button-secondary-bg': a.buttonSecondaryBg || '#ffffff',
		'--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
		'--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
		'--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',

		'--ad-radius': `${ a.borderRadius ?? 12 }px`,
		'--ad-padding': `${ a.padding ?? 80 }px`,
		'--ad-font-size': `${ a.fontSize ?? 16 }px`,

		'--ad-pill-bg': a.pillBg || '#dbeafe',
		'--ad-pill-color': a.pillColor || '#1e40af',
		'--ad-gradient-start': a.gradientStart || '#6366f1',
		'--ad-gradient-end': a.gradientEnd || '#8b5cf6',

		// CTA
		'--ad-cta-gap': `${ a.ctaGap ?? 16 }px`,
		'--ad-cta-padding-v': `${ a.ctaPaddingV ?? 14 }px`,
		'--ad-cta-padding-h': `${ a.ctaPaddingH ?? 32 }px`,
		'--ad-cta-radius': `${ resolveSentinel( a.ctaBorderRadius, a.borderRadius ?? 12 ) }px`,
		'--ad-cta-align': alignToFlex( a.ctaAlignment ),

		// Media asset
		'--ad-media-radius': `${ resolveSentinel( a.mediaBorderRadius, a.borderRadius ?? 12 ) }px`,
		'--ad-media-spacing': `${ a.mediaSpacing ?? 48 }px`,
		'--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

		// Hero Effects & Decorations
		'--ad-effect-gradient-overlay': `linear-gradient(135deg, ${ a.effectGradientOverlayColor1 || '#6366f1' }, ${ a.effectGradientOverlayColor2 || '#8b5cf6' })`,
		'--ad-effect-gradient-overlay-opacity': `${ ( a.effectGradientOverlayOpacity ?? 30 ) / 100 }`,
		'--ad-effect-glow-color': a.effectGlowColor || '#6366f1',
	};
}
