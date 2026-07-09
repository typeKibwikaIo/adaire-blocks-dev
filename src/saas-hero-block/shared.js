/**
 * Shared logic between edit.js (editor preview) and save.js (static frontend
 * output). Keeping this in one place means the two can never drift apart —
 * any CSS var or data-normalization fix made here applies identically to
 * both the editor canvas and the published page.
 */

// ─── Trusted-By: normalize to a structured list ───────────────────────────
// New content uses `trustItems` (array of { name, logoUrl, url }). Older
// content (saved before this rewrite) only has the flat `trustLogos`
// newline-separated string — still honored here so nothing already
// published silently loses its trust bar.
export function getTrustItems(a) {
	if (Array.isArray(a.trustItems) && a.trustItems.length > 0) {
		return a.trustItems;
	}
	// Guard against legacy/corrupted saved content where trustLogos isn't a
	// string (e.g. a stray number/object from an old or buggy save) — without
	// this, `.split` would throw and the whole block (and on some WP core
	// versions, the whole editor) would crash instead of just skipping the
	// trust bar.
	if (typeof a.trustLogos === 'string' && a.trustLogos) {
		return a.trustLogos
			.split('\n')
			.map((line) => ({ name: line.trim(), logoUrl: '', url: '' }))
			.filter((item) => item.name);
	}
	return [];
}

// ─── Small numeric helpers ──────────────────────────────────────────────
// A few attributes (ctaBorderRadius, mediaBorderRadius) use -1 as "inherit
// the block's global radius" so that's distinguishable from "explicitly 0".
export function resolveSentinel(value, fallback) {
	return value === undefined || value === null || value < 0 ? fallback : value;
}

export function alignToFlex(align) {
	if (align === 'left') return 'flex-start';
	if (align === 'right') return 'flex-end';
	return 'center';
}

export function getBgTypeClass(a) {
	return `bg-type-${a.backgroundType || 'solid'}`;
}

// ─── Hero Effects & Decorations: industry presets ─────────────────────────
// Presets are a convenience layer only — they just batch-set the same
// discrete attributes the individual toggles use, so render code never has
// to special-case "which preset is active." Picking a preset, then tweaking
// a toggle afterwards, always works as expected.
const EFFECT_KEYS = [
	'effectDotPattern',
	'effectGradientOverlay',
	'effectAbstractShapes',
	'effectGlow',
	'effectBlur',
	'effectFloatingElements',
	'effectAnimatedAccents',
];

const EFFECT_PRESETS = {
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

export function buildPresetPatch(key) {
	if (key === 'custom') {
		return { effectsPreset: key };
	}
	const reset = EFFECT_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {});
	if (key === 'none' || !EFFECT_PRESETS[key]) {
		return { effectsPreset: 'none', ...reset };
	}
	return { effectsPreset: key, ...reset, ...EFFECT_PRESETS[key] };
}

// ─── CSS custom properties ─────────────────────────────────────────────
// Single source of truth for every --ad-* var the stylesheet consumes.
export function getStyleVars(a) {
	const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

	const styleVars = {
		'--ad-accent': a.accentColor || '#6366f1',
		'--ad-color': a.textColor || '#111827',

		// Background — one var per layer, gated by the bg-type-* class in CSS
		// rather than a single conditional var (that's the bug this rewrite fixes:
		// the old code crammed everything into one --ad-bg var with no CSS
		// consumer for the image case at all).
		'--ad-bg-color': a.backgroundColor || '#ffffff',
		'--ad-bg-gradient': a.backgroundGradient || defaultGradient,
		'--ad-bg-image': a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
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

		'--ad-radius': `${a.borderRadius ?? 12}px`,
		'--ad-padding': `${a.padding ?? 80}px`,
		'--ad-font-size': `${a.fontSize ?? 16}px`,

		'--ad-pill-bg': a.pillBg || '#dbeafe',
		'--ad-pill-color': a.pillColor || '#1e40af',
		'--ad-gradient-start': a.gradientStart || '#6366f1',
		'--ad-gradient-end': a.gradientEnd || '#8b5cf6',

		// CTA
		'--ad-cta-gap': `${a.ctaGap ?? 16}px`,
		'--ad-cta-padding-v': `${a.ctaPaddingV ?? 14}px`,
		'--ad-cta-padding-h': `${a.ctaPaddingH ?? 32}px`,
		'--ad-cta-radius': `${resolveSentinel(a.ctaBorderRadius, a.borderRadius ?? 12)}px`,
		'--ad-cta-align': alignToFlex(a.ctaAlignment),

		// Media asset
		'--ad-media-radius': `${resolveSentinel(a.mediaBorderRadius, a.borderRadius ?? 12)}px`,
		'--ad-media-spacing': `${a.mediaSpacing ?? 48}px`,
		'--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

		// Hero Effects & Decorations
		'--ad-effect-gradient-overlay': `linear-gradient(135deg, ${a.effectGradientOverlayColor1 || '#6366f1'}, ${a.effectGradientOverlayColor2 || '#8b5cf6'})`,
		'--ad-effect-gradient-overlay-opacity': `${(a.effectGradientOverlayOpacity ?? 30) / 100}`,
		'--ad-effect-glow-color': a.effectGlowColor || '#6366f1',

		// Ratings badges
		'--ad-rating-align': alignToFlex(a.ratingBadgesAlignment),
	};

	// ── Typography (ADAB-010) ──────────────────────────────────────────
	// Only add typography CSS vars if the block has typography attributes
	// This prevents block validation errors for old content that doesn't have
	// these attributes yet. Check for any typography attribute to determine
	// if this block was created/updated after typography controls were added.
	const hasTypographyAttrs = a.eyebrowFontSize || a.fontFamily || a.headingFontSize ||
		a.bodyTextFontWeight || a.pillFontSize || a.buttonFontSize;

	if (hasTypographyAttrs) {
		styleVars['--ad-font-family'] = a.fontFamily !== undefined && a.fontFamily !== '' ? a.fontFamily : 'inherit';
		styleVars['--ad-eyebrow-font-size'] = a.eyebrowFontSize || '14px';
		styleVars['--ad-eyebrow-font-weight'] = a.eyebrowFontWeight || '600';
		styleVars['--ad-eyebrow-line-height'] = a.eyebrowLineHeight || 'normal';
		styleVars['--ad-eyebrow-letter-spacing'] = a.eyebrowLetterSpacing || '1px';
		styleVars['--ad-eyebrow-text-transform'] = a.eyebrowTextTransform || 'uppercase';

		styleVars['--ad-heading-font-size'] = a.headingFontSize || 'clamp(36px, 5vw, 64px)';
		styleVars['--ad-heading-font-weight'] = a.headingFontWeight || '800';
		styleVars['--ad-heading-line-height'] = a.headingLineHeight || '1.2';
		styleVars['--ad-heading-letter-spacing'] = a.headingLetterSpacing || 'normal';
		styleVars['--ad-heading-text-transform'] = a.headingTextTransform || 'none';

		styleVars['--ad-body-text-font-weight'] = a.bodyTextFontWeight || '400';
		styleVars['--ad-body-text-line-height'] = a.bodyTextLineHeight || '1.6';
		styleVars['--ad-body-text-letter-spacing'] = a.bodyTextLetterSpacing || 'normal';
		styleVars['--ad-body-text-text-transform'] = a.bodyTextTextTransform || 'none';

		styleVars['--ad-pill-font-size'] = a.pillFontSize || '14px';
		styleVars['--ad-pill-font-weight'] = a.pillFontWeight || '600';
		styleVars['--ad-pill-line-height'] = a.pillLineHeight || 'normal';
		styleVars['--ad-pill-letter-spacing'] = a.pillLetterSpacing || 'normal';
		styleVars['--ad-pill-text-transform'] = a.pillTextTransform || 'none';

		styleVars['--ad-button-font-size'] = a.buttonFontSize || '16px';
		styleVars['--ad-button-font-weight'] = a.buttonFontWeight || '600';
		styleVars['--ad-button-line-height'] = a.buttonLineHeight || 'normal';
		styleVars['--ad-button-letter-spacing'] = a.buttonLetterSpacing || 'normal';
		styleVars['--ad-button-text-transform'] = a.buttonTextTransform || 'none';

		styleVars['--ad-micro-copy-font-size'] = a.microCopyFontSize || '14px';
		styleVars['--ad-micro-copy-font-weight'] = a.microCopyFontWeight || '400';
		styleVars['--ad-micro-copy-line-height'] = a.microCopyLineHeight || 'normal';
		styleVars['--ad-micro-copy-letter-spacing'] = a.microCopyLetterSpacing || 'normal';
		styleVars['--ad-micro-copy-text-transform'] = a.microCopyTextTransform || 'none';

	}

	return styleVars;
}

// ─── Presentation pieces shared verbatim between edit.js and save.js ──────
// None of these need RichText — they're either plain repeater output or
// (for FAQ) a native <details>/<summary> disclosure that needs no JS at all
// on the frontend.

export function TrustLogo({ item }) {
	const inner = item.logoUrl
		? <img src={item.logoUrl} alt={item.name || ''} className="adaire-saas-hero__trust-logo-img" loading="lazy" />
		: <span className="adaire-saas-hero__trust-logo-text">{item.name}</span>;
	return item.url
		? <a href={item.url} className="adaire-saas-hero__trust-logo">{inner}</a>
		: <span className="adaire-saas-hero__trust-logo">{inner}</span>;
}

// ─── Rating Badges & Security Panel: icon resolution ──────────────────────
// Both sections moved from emoji glyphs to real Bootstrap Icons classes
// (e.g. "bi bi-star-fill"), and both items can alternatively use an uploaded
// image instead of an icon. Content saved before this change still carries
// the old shape — a legacy `iconType` keyword for ratings, a raw emoji
// character for security features — so these maps translate old values to
// an equivalent Bootstrap icon instead of rendering blank or an emoji.
const LEGACY_RATING_ICON_MAP = {
	star: 'bi bi-star-fill',
	badge: 'bi bi-trophy-fill',
	appstore: 'bi bi-apple',
	googleplay: 'bi bi-google-play',
};

const LEGACY_SECURITY_ICON_MAP = {
	'🔒': 'bi bi-lock-fill',
	'🏦': 'bi bi-bank',
	'🛡️': 'bi bi-shield-fill-check',
	'🛡': 'bi bi-shield-fill-check',
	'💳': 'bi bi-credit-card-fill',
	'🔑': 'bi bi-key-fill',
	'📞': 'bi bi-telephone-fill',
};

export function resolveRatingIcon(badge) {
	if (badge.icon && badge.icon.indexOf('bi-') !== -1) {
		return badge.icon;
	}
	if (badge.iconType && LEGACY_RATING_ICON_MAP[badge.iconType]) {
		return LEGACY_RATING_ICON_MAP[badge.iconType];
	}
	return 'bi bi-star-fill';
}

export function resolveFeatureIcon(feature) {
	if (feature.icon && feature.icon.indexOf('bi-') !== -1) {
		return feature.icon;
	}
	if (feature.icon && LEGACY_SECURITY_ICON_MAP[feature.icon]) {
		return LEGACY_SECURITY_ICON_MAP[feature.icon];
	}
	return 'bi bi-shield-check';
}

export function RatingBadgeView({ badge }) {
	return (
		<div className="adaire-saas-hero__rating-badge">
			<span className="adaire-saas-hero__rating-icon" aria-hidden="true">
				{badge.imageUrl
					? <img src={badge.imageUrl} alt="" className="adaire-saas-hero__rating-icon-img" loading="lazy" />
					: <i className={resolveRatingIcon(badge)} />}
			</span>
			<span className="adaire-saas-hero__rating-copy">
				<strong>{badge.text}</strong>
				<small>{badge.subtext}</small>
			</span>
		</div>
	);
}

export function SecurityFeatureView({ feature }) {
	return (
		<div className="adaire-saas-hero__security-card">
			<span className="adaire-saas-hero__security-icon" aria-hidden="true">
				{feature.imageUrl
					? <img src={feature.imageUrl} alt="" className="adaire-saas-hero__security-icon-img" loading="lazy" />
					: <i className={resolveFeatureIcon(feature)} />}
			</span>
			<h4>{feature.title}</h4>
			<p>{feature.text}</p>
		</div>
	);
}

export function FaqItemView({ item, defaultOpen }) {
	return (
		<details className="adaire-saas-hero__faq-item" open={defaultOpen || undefined}>
			<summary className="adaire-saas-hero__faq-question">{item.question}</summary>
			<div className="adaire-saas-hero__faq-answer">{item.answer}</div>
		</details>
	);
}
