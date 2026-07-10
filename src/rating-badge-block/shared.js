/**
 * Shared logic between edit.js (editor preview) and save.js (static frontend
 * output). Keeping this in one place means the two can never drift apart —
 * any CSS var or data-normalization fix made here applies identically to
 * both the editor canvas and the published page.
 */

export function alignToFlex( align ) {
	if ( align === 'left' ) return 'flex-start';
	if ( align === 'right' ) return 'flex-end';
	return 'center';
}

export function getStyleVars( a ) {
	return {
		'--ad-accent': a.accentColor || '#6366f1',
		'--ad-color': a.textColor || '#111827',
		'--ad-align': alignToFlex( a.alignment ),
	};
}

// ─── Icon resolution ───────────────────────────────────────────────────
// Badges moved from emoji glyphs to real Bootstrap Icons classes (e.g.
// "bi bi-star-fill"), and can alternatively use an uploaded image instead
// of an icon. Content saved before this block existed (i.e. migrated from
// saas-hero-block's old rating badges section) still carries the old
// `iconType` keyword shape — this map translates it to an equivalent
// Bootstrap icon instead of rendering blank.
const LEGACY_RATING_ICON_MAP = {
	star: 'bi bi-star-fill',
	badge: 'bi bi-trophy-fill',
	appstore: 'bi bi-apple',
	googleplay: 'bi bi-google-play',
};

export function resolveRatingIcon( badge ) {
	if ( badge.icon && badge.icon.indexOf( 'bi-' ) !== -1 ) {
		return badge.icon;
	}
	if ( badge.iconType && LEGACY_RATING_ICON_MAP[ badge.iconType ] ) {
		return LEGACY_RATING_ICON_MAP[ badge.iconType ];
	}
	return 'bi bi-star-fill';
}

// ─── Presentation piece shared verbatim between edit.js and save.js ──────
export function RatingBadgeView( { badge } ) {
	return (
		<div className="adaire-rating-badge-block__badge">
			<span className="adaire-rating-badge-block__icon" aria-hidden="true">
				{ badge.imageUrl
					? <img src={ badge.imageUrl } alt="" className="adaire-rating-badge-block__icon-img" loading="lazy" />
					: <i className={ resolveRatingIcon( badge ) } /> }
			</span>
			<span className="adaire-rating-badge-block__copy">
				<strong>{ badge.text }</strong>
				<small>{ badge.subtext }</small>
			</span>
		</div>
	);
}
