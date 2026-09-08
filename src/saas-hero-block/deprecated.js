import { RichText, useBlockProps } from '@wordpress/block-editor';
import {
  getTrustItems,
  getBgTypeClass,
  resolveSentinel,
  alignToFlex,
  TrustLogo,
  RatingBadgeView,
  SecurityFeatureView,
  FaqItemView,
} from './shared';

// Frozen copy of shared.js's getStyleVars() as it stood immediately before
// ADAB-010 added the "Typography" var block (--ad-font-family onward — see
// the long typography section near the end of the live getStyleVars()).
// v3 below must NOT call the live getStyleVars() — that function keeps
// evolving (ADAB-010 added ~50 more vars to it), so calling it from here
// silently stopped reproducing what was actually saved for any content from
// before that change. Confirmed via a real "Block validation failed" diff
// from a live site: the stored `style` attribute for an old post ended
// right after `--ad-security-color`, with every typography var missing —
// exactly where this frozen copy stops.
function getStyleVarsTypography( a ) {
  const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  return {
    '--ad-accent': a.accentColor || '#6366f1',
    '--ad-color': a.textColor || '#111827',

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

    '--ad-cta-gap': `${ a.ctaGap ?? 16 }px`,
    '--ad-cta-padding-v': `${ a.ctaPaddingV ?? 14 }px`,
    '--ad-cta-padding-h': `${ a.ctaPaddingH ?? 32 }px`,
    '--ad-cta-radius': `${ resolveSentinel( a.ctaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-cta-align': alignToFlex( a.ctaAlignment ),

    '--ad-media-radius': `${ resolveSentinel( a.mediaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-media-spacing': `${ a.mediaSpacing ?? 48 }px`,
    '--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

    '--ad-trust-item-width': a.trustItemWidth ? `${ a.trustItemWidth }px` : 'auto',
    '--ad-trust-item-gap': `${ a.trustItemGap ?? 32 }px`,
    '--ad-trust-logo-max-height': `${ a.trustLogoMaxHeight ?? 32 }px`,
    '--ad-trust-carousel-speed': `${ a.trustCarouselSpeed ?? 30 }s`,
    '--ad-trust-visible-items': `${ a.trustCarouselVisibleItems ?? 5 }`,
    '--ad-trust-dir': a.trustCarouselDirection === 'right' ? '1' : '-1',

    '--ad-effect-gradient-overlay': `linear-gradient(135deg, ${ a.effectGradientOverlayColor1 || '#6366f1' }, ${ a.effectGradientOverlayColor2 || '#8b5cf6' })`,
    '--ad-effect-gradient-overlay-opacity': `${ ( a.effectGradientOverlayOpacity ?? 30 ) / 100 }`,
    '--ad-effect-glow-color': a.effectGlowColor || '#6366f1',

    '--ad-rating-align': alignToFlex( a.ratingBadgesAlignment ),

    '--ad-security-bg': a.securityPanelBg || '#f8fafc',
    '--ad-security-color': a.securityPanelTextColor || '#111827',
  };
}

/**
 * v3 — frozen copy of the save() output as it stood immediately before
 * ADAB-010 added full typography controls (font size, font weight,
 * line-height, letter-spacing, text-transform per text role, plus a
 * block-level Font Family control) for this block's UI and stylesheet.
 *
 * Correction (2026-06-29): this entry's `save()` used to call the live,
 * shared `getStyleVars()` on the theory that it was already byte-for-byte
 * identical to the pre-ADAB-010 shape. That theory was wrong — ADAB-010 DID
 * add ~50 new `--ad-*` typography vars to `getStyleVars()`, and because this
 * entry called the live function instead of freezing the old output, it
 * could never again match content saved before that change (confirmed via a
 * live "Block validation failed" diff showing the stored `style` string
 * missing every typography var). Now uses the local `getStyleVarsTypography()`
 * above instead, which reproduces exactly what was actually saved at the
 * time. `migrate` stays a no-op identity function and this entry still
 * doesn't need its own `attributes` key — only the *rendered* `style`
 * string changed, not the attribute schema — Gutenberg falls back to the
 * current block.json attributes when a deprecated entry omits one.
 */
const vTypography = {
  migrate( attributes ) {
    return attributes;
  },

  save( { attributes: a } ) {
    const trustItemsResolved = getTrustItems( a );

    const blockProps = useBlockProps.save( {
      className: [
        'adaire-saas-hero',
        `layout-${ a.layoutStyle || 'centered' }`,
        getBgTypeClass( a ),
        a.trustCarousel ? 'has-trust-carousel' : '',
        a.effectFloatingElements ? 'has-floating-elements' : '',
      ].filter( Boolean ).join( ' ' ),
      style: getStyleVarsTypography( a ),
    } );

    return (
      <section { ...blockProps }>
        { a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" /> }
        { a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" /> }
        { a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" /> }
        { a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" /> }
        { a.effectAbstractShapes && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
            <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
          </div>
        ) }
        { a.effectFloatingElements && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
            <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
          </div>
        ) }
        { a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" /> }

        <div className="adaire-saas-hero__container">
          { a.showPill && a.pillText && (
            <div className="adaire-saas-hero__pill">
              <RichText.Content tagName="span" value={ a.pillText } />
            </div>
          ) }

          { a.showRatingBadges && (
            <div className="adaire-saas-hero__ratings">
              { ( a.ratingBadges || [] ).map( ( badge, i ) => <RatingBadgeView key={ i } badge={ badge } /> ) }
            </div>
          ) }

          <div className="adaire-saas-hero__content">
            <div className="adaire-saas-hero__text">
              { a.eyebrow && (
                <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={ a.eyebrow } />
              ) }

              <RichText.Content
                tagName="h1"
                className={ `adaire-saas-hero__heading ${ a.useGradientHeadline ? 'has-gradient' : '' }` }
                value={ a.heading }
              />

              <RichText.Content tagName="p" className="adaire-saas-hero__text" value={ a.text } />

              <div className="adaire-saas-hero__cta">
                { a.ctaType === 'dual-buttons' && (
                  <>
                    <a href={ a.primaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.primaryButtonText }
                    </a>
                    <a href={ a.secondaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                      { a.secondaryButtonText }
                    </a>
                  </>
                ) }

                { a.ctaType === 'email-form' && (
                  <form className="adaire-saas-hero__email-form" onSubmit="return false">
                    <input type="email" placeholder={ a.emailPlaceholder || 'Enter your email' } required />
                    <button type="submit">{ a.submitButtonText || 'Get Started' }</button>
                  </form>
                ) }

                { a.ctaType === 'single-button' && (
                  <>
                    <a href={ a.singleButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.singleButtonText }
                    </a>
                    { a.microCopy && <p className="adaire-saas-hero__micro-copy">{ a.microCopy }</p> }
                  </>
                ) }
              </div>
            </div>

            { a.showHeroImage && a.heroImageUrl && (
              <div className={ `adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }` }>
                <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
              </div>
            ) }
          </div>

          { a.showTrustBar && ( trustItemsResolved || [] ).length > 0 && (
            <div className={ `adaire-saas-hero__trust-bar trust-layout-${ a.trustLayout || 'row' } ${ a.trustCarousel ? 'is-carousel' : '' } ${ a.trustCarousel && a.trustCarouselAutoplay === false ? 'is-autoplay-off' : '' } ${ a.trustCarousel && a.trustCarouselPauseOnHover === false ? '' : 'is-pause-on-hover' }` }>
              { a.trustBarTitle && <RichText.Content tagName="p" className="adaire-saas-hero__trust-title" value={ a.trustBarTitle } /> }
              <div className="adaire-saas-hero__trust-logos-wrap">
                <div className="adaire-saas-hero__trust-logos">
                  { ( trustItemsResolved || [] ).map( ( item, i ) => <TrustLogo key={ i } item={ item } /> ) }
                </div>
                { a.trustCarousel && (
                  <div className="adaire-saas-hero__trust-logos adaire-saas-hero__trust-logos--clone" aria-hidden="true">
                    { ( trustItemsResolved || [] ).map( ( item, i ) => <TrustLogo key={ `clone-${ i }` } item={ item } /> ) }
                  </div>
                ) }
              </div>
            </div>
          ) }

          { a.showSecurityPanel && (
            <div className="adaire-saas-hero__security">
              <h3 className="adaire-saas-hero__security-title">
                { a.securityPanelTitle }{ a.securityPanelPartnerName ? ` ${ a.securityPanelPartnerName }` : '' }
              </h3>
              { a.securityPanelText && <p className="adaire-saas-hero__security-text">{ a.securityPanelText }</p> }
              <div className="adaire-saas-hero__security-grid">
                { ( a.securityFeatures || [] ).map( ( feature, i ) => <SecurityFeatureView key={ i } feature={ feature } /> ) }
              </div>
            </div>
          ) }

          { a.showFaq && (
            <div className="adaire-saas-hero__faq">
              { a.faqTitle && <h3 className="adaire-saas-hero__faq-title">{ a.faqTitle }</h3> }
              <div className="adaire-saas-hero__faq-list">
                { ( a.faqItems || [] ).map( ( item, i ) => <FaqItemView key={ i } item={ item } defaultOpen={ a.faqOpenFirst !== false && i === 0 } /> ) }
              </div>
            </div>
          ) }
        </div>
      </section>
    );
  },
};

// v1 — original save output before the 2026-06 hero rewrite
const v1 = {
  attributes: {
    eyebrow: { type: 'string', default: 'Scale faster' },
    heading: { type: 'string', default: 'Launch your SaaS faster' },
    text: { type: 'string', default: '' },
    buttonText: { type: 'string', default: 'Start free trial' },
    buttonUrl: { type: 'string', default: '#' },
    accentColor: { type: 'string', default: '#d52940' },
    backgroundColor: { type: 'string', default: '#111827' },
    textColor: { type: 'string', default: '#ffffff' },
    secondaryButtonText: { type: 'string', default: 'Watch demo' },
    secondaryButtonUrl: { type: 'string', default: '#' },
    heroImageUrl: { type: 'string', default: '' },
    backgroundType: { type: 'string', default: 'gradient' },
    backgroundImage: { type: 'string', default: '' },
    gradient: { type: 'string', default: 'linear-gradient(135deg,#111827,#3b0764)' },
    backgroundGradient: { type: 'string', default: 'linear-gradient(135deg,#111827,#3b0764)' },
    alignment: { type: 'string', default: 'left' },
    socialProof: { type: 'string', default: 'Trusted by 2,000+ teams' },
    announcementText: { type: 'string', default: 'New: AI workflow builder' },
    announcementUrl: { type: 'string', default: '#' },
    showScrollArrow: { type: 'boolean', default: true },
    buttonHoverEffect: { type: 'string', default: 'lift' },
    borderRadius: { type: 'number', default: 18 },
    cardRadius: { type: 'number', default: 18 },
    buttonRadius: { type: 'number', default: 18 },
    padding: { type: 'number', default: 28 },
    formPadding: { type: 'number', default: 28 },
    fontSize: { type: 'number', default: 16 },
    buttonWidth: { type: 'string', default: 'auto' },
    buttonHeight: { type: 'string', default: 'auto' },
    buttonHoverColor: { type: 'string', default: '#ffffff' },
    buttonHoverBackgroundColor: { type: 'string', default: '#111827' },
    buttonHoverBorderColor: { type: 'string', default: '#111827' },
  },

  save( { attributes: a } ) {
    const blockProps = useBlockProps.save( {
      className: 'adaire-saas-hero',
      style: {
        '--ad-accent': a.accentColor,
        '--ad-bg': a.backgroundType === 'gradient' ? ( a.backgroundGradient || a.gradient ) : a.backgroundColor,
        '--ad-color': a.textColor,
        '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${ a.backgroundImage })` : 'none',
        '--ad-button-color': a.accentColor,
        '--ad-button-width': a.buttonWidth || 'auto',
        '--ad-button-height': a.buttonHeight || 'auto',
        '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
        '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
        '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
        '--ad-radius': ( a.borderRadius || 18 ) + 'px',
        '--ad-padding': ( a.padding || 28 ) + 'px',
        '--ad-font-size': ( a.fontSize || 16 ) + 'px',
      },
    } );

    return (
      <section { ...blockProps } data-hover={ a.buttonHoverEffect || 'lift' } data-align={ a.alignment }>
        <div>
          <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={ a.announcementText || a.eyebrow } />
          <RichText.Content tagName="h2" className="adaire-saas-hero__heading" value={ a.heading } />
          <RichText.Content tagName="p" className="adaire-saas-hero__text" value={ a.text } />
          <div className="adaire-saas-hero__actions">
            <a className="adaire-saas-hero__button" href={ a.buttonUrl || '#' }>
              <RichText.Content tagName="span" value={ a.buttonText } />
            </a>
            { a.secondaryButtonText && (
              <a className="adaire-saas-hero__button is-secondary" href={ a.secondaryButtonUrl || '#' }>
                { a.secondaryButtonText }
              </a>
            ) }
          </div>
          <p className="adaire-saas-hero__proof">{ a.socialProof }</p>
        </div>
        { a.heroImageUrl && <img className="adaire-saas-hero__image" src={ a.heroImageUrl } alt="" loading="lazy" /> }
        { a.showScrollArrow && <span className="adaire-saas-hero__arrow">↓</span> }
      </section>
    );
  },
};

// ─── v3 helpers ────────────────────────────────────────────────────────────
// Frozen, self-contained copies of the shared.js helpers as they existed
// right before Trusted-By/Ratings/Security/FAQ were removed from this block
// (Ratings moved to the new rating-badge-block; the other three were dropped
// outright). Deliberately NOT imported from the live ./shared.js — that file
// no longer has these exports, and a deprecation must never depend on
// current shared code (same reasoning v2's inline bg-style logic follows).
function getTrustItemsV3( a ) {
  if ( Array.isArray( a.trustItems ) && a.trustItems.length > 0 ) {
    return a.trustItems;
  }
  if ( a.trustLogos ) {
    return a.trustLogos
      .split( '\n' )
      .map( ( line ) => ( { name: line.trim(), logoUrl: '', url: '' } ) )
      .filter( ( item ) => item.name );
  }
  return [];
}

function resolveSentinelV3( value, fallback ) {
  return value === undefined || value === null || value < 0 ? fallback : value;
}

function alignToFlexV3( align ) {
  if ( align === 'left' ) return 'flex-start';
  if ( align === 'right' ) return 'flex-end';
  return 'center';
}

function getBgTypeClassV3( a ) {
  return `bg-type-${ a.backgroundType || 'solid' }`;
}

function getStyleVarsRatingsExtraction( a ) {
  const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  return {
    '--ad-accent': a.accentColor || '#6366f1',
    '--ad-color': a.textColor || '#111827',

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

    '--ad-cta-gap': `${ a.ctaGap ?? 16 }px`,
    '--ad-cta-padding-v': `${ a.ctaPaddingV ?? 14 }px`,
    '--ad-cta-padding-h': `${ a.ctaPaddingH ?? 32 }px`,
    '--ad-cta-radius': `${ resolveSentinelV3( a.ctaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-cta-align': alignToFlexV3( a.ctaAlignment ),

    '--ad-media-radius': `${ resolveSentinelV3( a.mediaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-media-spacing': `${ a.mediaSpacing ?? 48 }px`,
    '--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

    '--ad-trust-item-width': a.trustItemWidth ? `${ a.trustItemWidth }px` : 'auto',
    '--ad-trust-item-gap': `${ a.trustItemGap ?? 32 }px`,
    '--ad-trust-logo-max-height': `${ a.trustLogoMaxHeight ?? 32 }px`,
    '--ad-trust-carousel-speed': `${ a.trustCarouselSpeed ?? 30 }s`,
    '--ad-trust-visible-items': `${ a.trustCarouselVisibleItems ?? 5 }`,
    '--ad-trust-dir': a.trustCarouselDirection === 'right' ? '1' : '-1',

    '--ad-effect-gradient-overlay': `linear-gradient(135deg, ${ a.effectGradientOverlayColor1 || '#6366f1' }, ${ a.effectGradientOverlayColor2 || '#8b5cf6' })`,
    '--ad-effect-gradient-overlay-opacity': `${ ( a.effectGradientOverlayOpacity ?? 30 ) / 100 }`,
    '--ad-effect-glow-color': a.effectGlowColor || '#6366f1',

    '--ad-rating-align': alignToFlexV3( a.ratingBadgesAlignment ),

    '--ad-security-bg': a.securityPanelBg || '#f8fafc',
    '--ad-security-color': a.securityPanelTextColor || '#111827',
  };
}

function TrustLogoV3( { item } ) {
  const inner = item.logoUrl
    ? <img src={ item.logoUrl } alt={ item.name || '' } className="adaire-saas-hero__trust-logo-img" loading="lazy" />
    : <span className="adaire-saas-hero__trust-logo-text">{ item.name }</span>;
  return item.url
    ? <a href={ item.url } className="adaire-saas-hero__trust-logo">{ inner }</a>
    : <span className="adaire-saas-hero__trust-logo">{ inner }</span>;
}

const LEGACY_RATING_ICON_MAP_V3 = {
  star: 'bi bi-star-fill',
  badge: 'bi bi-trophy-fill',
  appstore: 'bi bi-apple',
  googleplay: 'bi bi-google-play',
};

const LEGACY_SECURITY_ICON_MAP_V3 = {
  '🔒': 'bi bi-lock-fill',
  '🏦': 'bi bi-bank',
  '🛡️': 'bi bi-shield-fill-check',
  '🛡': 'bi bi-shield-fill-check',
  '💳': 'bi bi-credit-card-fill',
  '🔑': 'bi bi-key-fill',
  '📞': 'bi bi-telephone-fill',
};

function resolveRatingIconV3( badge ) {
  if ( badge.icon && badge.icon.indexOf( 'bi-' ) !== -1 ) {
    return badge.icon;
  }
  if ( badge.iconType && LEGACY_RATING_ICON_MAP_V3[ badge.iconType ] ) {
    return LEGACY_RATING_ICON_MAP_V3[ badge.iconType ];
  }
  return 'bi bi-star-fill';
}

function resolveFeatureIconV3( feature ) {
  if ( feature.icon && feature.icon.indexOf( 'bi-' ) !== -1 ) {
    return feature.icon;
  }
  if ( feature.icon && LEGACY_SECURITY_ICON_MAP_V3[ feature.icon ] ) {
    return LEGACY_SECURITY_ICON_MAP_V3[ feature.icon ];
  }
  return 'bi bi-shield-check';
}

function RatingBadgeViewV3( { badge } ) {
  return (
    <div className="adaire-saas-hero__rating-badge">
      <span className="adaire-saas-hero__rating-icon" aria-hidden="true">
        { badge.imageUrl
          ? <img src={ badge.imageUrl } alt="" className="adaire-saas-hero__rating-icon-img" loading="lazy" />
          : <i className={ resolveRatingIconV3( badge ) } /> }
      </span>
      <span className="adaire-saas-hero__rating-copy">
        <strong>{ badge.text }</strong>
        <small>{ badge.subtext }</small>
      </span>
    </div>
  );
}

function SecurityFeatureViewV3( { feature } ) {
  return (
    <div className="adaire-saas-hero__security-card">
      <span className="adaire-saas-hero__security-icon" aria-hidden="true">
        { feature.imageUrl
          ? <img src={ feature.imageUrl } alt="" className="adaire-saas-hero__security-icon-img" loading="lazy" />
          : <i className={ resolveFeatureIconV3( feature ) } /> }
      </span>
      <h4>{ feature.title }</h4>
      <p>{ feature.text }</p>
    </div>
  );
}

function FaqItemViewV3( { item, defaultOpen } ) {
  return (
    <details className="adaire-saas-hero__faq-item" open={ defaultOpen || undefined }>
      <summary className="adaire-saas-hero__faq-question">{ item.question }</summary>
      <div className="adaire-saas-hero__faq-answer">{ item.answer }</div>
    </details>
  );
}

// v3 — shape that shipped just before Trusted-By, Security Panel, FAQ, and
// Rating Badges were removed/extracted (Ratings moved to the standalone
// rating-badge-block). Frozen here — including its own attribute defaults —
// so any saas-hero-block instance saved with those sections keeps validating
// instead of showing "invalid content."
const vRatingsExtraction = {
  attributes: {
    eyebrow: { type: 'string', default: 'Scale faster' },
    heading: { type: 'string', default: 'Launch your SaaS faster' },
    text: { type: 'string', default: 'A modern hero section for software products, startups, and landing pages.' },
    buttonText: { type: 'string', default: 'Start free trial' },
    buttonUrl: { type: 'string', default: '#' },

    accentColor: { type: 'string', default: '#6366f1' },
    backgroundColor: { type: 'string', default: '#ffffff' },
    textColor: { type: 'string', default: '#111827' },
    heroImageUrl: { type: 'string', default: '' },

    backgroundType: { type: 'string', default: 'solid' },
    backgroundImage: { type: 'string', default: '' },
    backgroundGradient: { type: 'string', default: '' },
    backgroundImageSize: { type: 'string', default: 'cover' },
    backgroundImagePosition: { type: 'string', default: 'center' },
    backgroundImageRepeat: { type: 'string', default: 'no-repeat' },

    layoutStyle: { type: 'string', default: 'centered' },

    showPill: { type: 'boolean', default: true },
    pillText: { type: 'string', default: 'New: v2.0 Release' },
    pillBg: { type: 'string', default: '#dbeafe' },
    pillColor: { type: 'string', default: '#1e40af' },

    useGradientHeadline: { type: 'boolean', default: true },
    gradientStart: { type: 'string', default: '#6366f1' },
    gradientEnd: { type: 'string', default: '#8b5cf6' },

    ctaType: { type: 'string', default: 'dual-buttons' },
    primaryButtonText: { type: 'string', default: 'Get Started' },
    primaryButtonUrl: { type: 'string', default: '#' },
    secondaryButtonText: { type: 'string', default: 'Book a Demo' },
    secondaryButtonUrl: { type: 'string', default: '#' },
    emailPlaceholder: { type: 'string', default: 'Enter your email' },
    submitButtonText: { type: 'string', default: 'Get Started' },
    singleButtonText: { type: 'string', default: 'Shop Collection' },
    singleButtonUrl: { type: 'string', default: '#' },
    microCopy: { type: 'string', default: 'Free shipping on orders over $50' },
    buttonPrimaryColor: { type: 'string', default: '#ffffff' },
    buttonPrimaryBg: { type: 'string', default: '#6366f1' },
    buttonSecondaryColor: { type: 'string', default: '#111827' },
    buttonSecondaryBg: { type: 'string', default: '#ffffff' },
    buttonHoverColor: { type: 'string', default: '#ffffff' },
    buttonHoverBackgroundColor: { type: 'string', default: '#111827' },
    buttonHoverBorderColor: { type: 'string', default: '#111827' },
    buttonHoverEffect: { type: 'string', default: 'lift' },
    ctaAlignment: { type: 'string', default: 'center' },
    ctaGap: { type: 'number', default: 16 },
    ctaPaddingV: { type: 'number', default: 14 },
    ctaPaddingH: { type: 'number', default: 32 },
    ctaBorderRadius: { type: 'number', default: -1 },

    showHeroImage: { type: 'boolean', default: true },
    imagePosition: { type: 'string', default: 'below' },
    mediaShadow: { type: 'boolean', default: true },
    mediaBorderRadius: { type: 'number', default: -1 },
    mediaSpacing: { type: 'number', default: 48 },

    showTrustBar: { type: 'boolean', default: true },
    trustBarTitle: { type: 'string', default: 'Trusted by' },
    trustLogos: { type: 'string', default: 'Acme\nVelocity\nAtlas\nNexus\nPrime' },
    trustItems: {
      type: 'array',
      default: [
        { name: 'Acme', logoUrl: '', url: '' },
        { name: 'Velocity', logoUrl: '', url: '' },
        { name: 'Atlas', logoUrl: '', url: '' },
        { name: 'Nexus', logoUrl: '', url: '' },
        { name: 'Prime', logoUrl: '', url: '' },
      ],
    },
    trustLayout: { type: 'string', default: 'row' },
    trustItemWidth: { type: 'number', default: 0 },
    trustItemGap: { type: 'number', default: 32 },
    trustLogoMaxHeight: { type: 'number', default: 32 },
    trustCarousel: { type: 'boolean', default: false },
    trustCarouselAutoplay: { type: 'boolean', default: true },
    trustCarouselSpeed: { type: 'number', default: 30 },
    trustCarouselDirection: { type: 'string', default: 'left' },
    trustCarouselPauseOnHover: { type: 'boolean', default: true },
    trustCarouselVisibleItems: { type: 'number', default: 5 },

    effectsPreset: { type: 'string', default: 'none' },
    effectDotPattern: { type: 'boolean', default: false },
    effectGradientOverlay: { type: 'boolean', default: false },
    effectGradientOverlayColor1: { type: 'string', default: '#6366f1' },
    effectGradientOverlayColor2: { type: 'string', default: '#8b5cf6' },
    effectGradientOverlayOpacity: { type: 'number', default: 30 },
    effectAbstractShapes: { type: 'boolean', default: false },
    effectGlow: { type: 'boolean', default: false },
    effectGlowColor: { type: 'string', default: '#6366f1' },
    effectBlur: { type: 'boolean', default: false },
    effectFloatingElements: { type: 'boolean', default: false },
    effectAnimatedAccents: { type: 'boolean', default: false },

    showRatingBadges: { type: 'boolean', default: false },
    ratingBadgesAlignment: { type: 'string', default: 'center' },
    ratingBadges: {
      type: 'array',
      default: [
        { icon: 'bi bi-star-fill', imageUrl: '', text: '4.8/5', subtext: '500+ App Store reviews' },
        { icon: 'bi bi-star-fill', imageUrl: '', text: '4.7/5', subtext: '1,200+ Google Play reviews' },
        { icon: 'bi bi-trophy-fill', imageUrl: '', text: 'Excellent', subtext: 'Rated on Trustpilot' },
      ],
    },

    showSecurityPanel: { type: 'boolean', default: false },
    securityPanelTitle: { type: 'string', default: 'Security through our trusted partner' },
    securityPanelPartnerName: { type: 'string', default: 'SecurePay' },
    securityPanelText: { type: 'string', default: 'Your money and data are protected by bank-grade infrastructure, managed in partnership with a fully licensed financial institution.' },
    securityPanelBg: { type: 'string', default: '#f8fafc' },
    securityPanelTextColor: { type: 'string', default: '#111827' },
    securityFeatures: {
      type: 'array',
      default: [
        { icon: 'bi bi-lock-fill', imageUrl: '', title: 'Bank-level encryption', text: 'Your data is protected with 256-bit encryption, the same standard used by major banks.' },
        { icon: 'bi bi-bank', imageUrl: '', title: 'Licensed & regulated', text: 'Backed by a fully licensed financial partner, supervised by national regulators.' },
        { icon: 'bi bi-shield-fill-check', imageUrl: '', title: 'Fraud monitoring', text: 'Round-the-clock automated monitoring flags suspicious activity in real time.' },
        { icon: 'bi bi-credit-card-fill', imageUrl: '', title: 'Deposit protection', text: 'Funds held with our banking partner are protected up to the applicable guarantee scheme.' },
        { icon: 'bi bi-key-fill', imageUrl: '', title: 'Two-factor authentication', text: 'An extra layer of security keeps your account safe even if your password is compromised.' },
        { icon: 'bi bi-telephone-fill', imageUrl: '', title: '24/7 support', text: 'A dedicated security team is available around the clock if anything looks wrong.' },
      ],
    },

    showFaq: { type: 'boolean', default: false },
    faqTitle: { type: 'string', default: 'Frequently asked questions' },
    faqOpenFirst: { type: 'boolean', default: true },
    faqItems: {
      type: 'array',
      default: [
        { question: 'How long does it take to open an account?', answer: 'Most accounts are approved within 5 minutes once you submit your details and verification documents.' },
        { question: 'Is there a monthly fee?', answer: 'We offer a free plan with core features, plus paid plans that unlock advanced tools and lower transaction fees.' },
        { question: 'Can I cancel anytime?', answer: 'Yes. There is no long-term contract — you can downgrade or close your account whenever you like.' },
        { question: 'Is my money protected?', answer: 'Funds are held with our regulated banking partner and protected under the applicable deposit guarantee scheme.' },
      ],
    },

    fontSize: { type: 'number', default: 16 },
    padding: { type: 'number', default: 80 },
    borderRadius: { type: 'number', default: 12 },
  },

  save( { attributes: a } ) {
  const trustItemsResolved = getTrustItemsV3( a );

  const blockProps = useBlockProps.save( {
    className: [
      'adaire-saas-hero',
      `layout-${ a.layoutStyle || 'centered' }`,
      getBgTypeClassV3( a ),
      a.trustCarousel ? 'has-trust-carousel' : '',
      a.effectFloatingElements ? 'has-floating-elements' : '',
    ].filter( Boolean ).join( ' ' ),
    style: getStyleVarsRatingsExtraction( a ),
  } );

  return (
    <section { ...blockProps }>
      { a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" /> }
      { a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" /> }
      { a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" /> }
      { a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" /> }
      { a.effectAbstractShapes && (
        <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
          <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
        </div>
      ) }
      { a.effectFloatingElements && (
        <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
          <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
        </div>
      ) }
      { a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" /> }

      <div className="adaire-saas-hero__container">
        { a.showPill && a.pillText && (
          <div className="adaire-saas-hero__pill">
            <RichText.Content tagName="span" value={ a.pillText } />
          </div>
        ) }

        { a.showRatingBadges && (
          <div className="adaire-saas-hero__ratings">
            { ( a.ratingBadges || [] ).map( ( badge, i ) => <RatingBadgeViewV3 key={ i } badge={ badge } /> ) }
          </div>
        ) }

        <div className="adaire-saas-hero__content">
          <div className="adaire-saas-hero__text">
            { a.eyebrow && (
              <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={ a.eyebrow } />
            ) }

            <RichText.Content
              tagName="h1"
              className={ `adaire-saas-hero__heading ${ a.useGradientHeadline ? 'has-gradient' : '' }` }
              value={ a.heading }
            />

            <RichText.Content tagName="p" className="adaire-saas-hero__text" value={ a.text } />

            <div className="adaire-saas-hero__cta">
              { a.ctaType === 'dual-buttons' && (
                <>
                  <a href={ a.primaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                    { a.primaryButtonText }
                  </a>
                  <a href={ a.secondaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                    { a.secondaryButtonText }
                  </a>
                </>
              ) }

              { a.ctaType === 'email-form' && (
                <form className="adaire-saas-hero__email-form" onSubmit="return false">
                  <input type="email" placeholder={ a.emailPlaceholder || 'Enter your email' } required />
                  <button type="submit">{ a.submitButtonText || 'Get Started' }</button>
                </form>
              ) }

              { a.ctaType === 'single-button' && (
                <>
                  <a href={ a.singleButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                    { a.singleButtonText }
                  </a>
                  { a.microCopy && <p className="adaire-saas-hero__micro-copy">{ a.microCopy }</p> }
                </>
              ) }
            </div>
          </div>

          { a.showHeroImage && a.heroImageUrl && (
            <div className={ `adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }` }>
              <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
            </div>
          ) }
        </div>

        { a.showTrustBar && trustItemsResolved.length > 0 && (
          <div className={ `adaire-saas-hero__trust-bar trust-layout-${ a.trustLayout || 'row' } ${ a.trustCarousel ? 'is-carousel' : '' } ${ a.trustCarousel && a.trustCarouselAutoplay === false ? 'is-autoplay-off' : '' } ${ a.trustCarousel && a.trustCarouselPauseOnHover === false ? '' : 'is-pause-on-hover' }` }>
            { a.trustBarTitle && <RichText.Content tagName="p" className="adaire-saas-hero__trust-title" value={ a.trustBarTitle } /> }
            <div className="adaire-saas-hero__trust-logos-wrap">
              <div className="adaire-saas-hero__trust-logos">
                { trustItemsResolved.map( ( item, i ) => <TrustLogoV3 key={ i } item={ item } /> ) }
              </div>
              { a.trustCarousel && (
                <div className="adaire-saas-hero__trust-logos adaire-saas-hero__trust-logos--clone" aria-hidden="true">
                  { trustItemsResolved.map( ( item, i ) => <TrustLogoV3 key={ `clone-${ i }` } item={ item } /> ) }
                </div>
              ) }
            </div>
          </div>
        ) }

        { a.showSecurityPanel && (
          <div className="adaire-saas-hero__security">
            <h3 className="adaire-saas-hero__security-title">
              { a.securityPanelTitle }{ a.securityPanelPartnerName ? ` ${ a.securityPanelPartnerName }` : '' }
            </h3>
            { a.securityPanelText && <p className="adaire-saas-hero__security-text">{ a.securityPanelText }</p> }
            <div className="adaire-saas-hero__security-grid">
              { ( a.securityFeatures || [] ).map( ( feature, i ) => <SecurityFeatureViewV3 key={ i } feature={ feature } /> ) }
            </div>
          </div>
        ) }

        { a.showFaq && (
          <div className="adaire-saas-hero__faq">
            { a.faqTitle && <h3 className="adaire-saas-hero__faq-title">{ a.faqTitle }</h3> }
            <div className="adaire-saas-hero__faq-list">
              { ( a.faqItems || [] ).map( ( item, i ) => <FaqItemViewV3 key={ i } item={ item } defaultOpen={ a.faqOpenFirst !== false && i === 0 } /> ) }
            </div>
          </div>
        ) }
      </div>
    </section>
  );
  },
};

// v2 — shape that shipped just before the 2026-06-18 "Improved Specification"
// rewrite (InspectorTabs, QuickZone everywhere, structured Trusted-By/ratings/
// security/FAQ sections, hero effects). Frozen here verbatim — including its
// own block.json's attribute defaults — so any saas-hero-block instance saved
// under that shape keeps validating instead of showing "invalid content."
const v2 = {
  attributes: {
    eyebrow: { type: 'string', default: 'Scale faster' },
    heading: { type: 'string', default: 'Launch your SaaS faster' },
    text: { type: 'string', default: 'A modern hero section for software products, startups, and landing pages.' },
    buttonText: { type: 'string', default: 'Start free trial' },
    buttonUrl: { type: 'string', default: '#' },
    accentColor: { type: 'string', default: '#6366f1' },
    backgroundColor: { type: 'string', default: '#ffffff' },
    textColor: { type: 'string', default: '#111827' },
    secondaryButtonText: { type: 'string', default: 'Book a Demo' },
    secondaryButtonUrl: { type: 'string', default: '#' },
    heroImageUrl: { type: 'string', default: '' },
    backgroundType: { type: 'string', default: 'solid' },
    backgroundImage: { type: 'string', default: '' },
    backgroundGradient: { type: 'string', default: '' },
    layoutStyle: { type: 'string', default: 'centered' },
    showPill: { type: 'boolean', default: true },
    pillText: { type: 'string', default: 'New: v2.0 Release' },
    pillBg: { type: 'string', default: '#dbeafe' },
    pillColor: { type: 'string', default: '#1e40af' },
    useGradientHeadline: { type: 'boolean', default: true },
    gradientStart: { type: 'string', default: '#6366f1' },
    gradientEnd: { type: 'string', default: '#8b5cf6' },
    ctaType: { type: 'string', default: 'dual-buttons' },
    primaryButtonText: { type: 'string', default: 'Get Started' },
    primaryButtonUrl: { type: 'string', default: '#' },
    emailPlaceholder: { type: 'string', default: 'Enter your email' },
    submitButtonText: { type: 'string', default: 'Get Started' },
    singleButtonText: { type: 'string', default: 'Shop Collection' },
    singleButtonUrl: { type: 'string', default: '#' },
    microCopy: { type: 'string', default: 'Free shipping on orders over $50' },
    buttonPrimaryColor: { type: 'string', default: '#ffffff' },
    buttonPrimaryBg: { type: 'string', default: '#6366f1' },
    buttonSecondaryColor: { type: 'string', default: '#111827' },
    buttonSecondaryBg: { type: 'string', default: '#ffffff' },
    buttonHoverColor: { type: 'string', default: '#ffffff' },
    buttonHoverBackgroundColor: { type: 'string', default: '#111827' },
    buttonHoverBorderColor: { type: 'string', default: '#111827' },
    buttonHoverEffect: { type: 'string', default: 'lift' },
    showHeroImage: { type: 'boolean', default: true },
    imagePosition: { type: 'string', default: 'below' },
    showTrustBar: { type: 'boolean', default: true },
    trustBarTitle: { type: 'string', default: 'Trusted by' },
    trustLogos: { type: 'string', default: 'Acme\nVelocity\nAtlas\nNexus\nPrime' },
    fontSize: { type: 'number', default: 16 },
    padding: { type: 'number', default: 80 },
    borderRadius: { type: 'number', default: 12 },
  },

  save( { attributes: a } ) {
    let bgStyle = {};
    if ( a.backgroundType === 'gradient' ) {
      bgStyle.background = a.backgroundGradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    } else if ( a.backgroundType === 'image' && a.backgroundImage ) {
      bgStyle.backgroundImage    = `url(${ a.backgroundImage })`;
      bgStyle.backgroundSize     = 'cover';
      bgStyle.backgroundPosition = 'center';
    } else {
      bgStyle.backgroundColor = a.backgroundColor || '#ffffff';
    }

    const blockProps = useBlockProps.save( {
      className: [
        'adaire-saas-hero',
        `layout-${ a.layoutStyle || 'centered' }`,
      ].join( ' ' ),
      style: {
        '--ad-accent': a.accentColor || '#6366f1',
        '--ad-bg': a.backgroundType === 'gradient' ? (a.backgroundGradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)') : (a.backgroundColor || '#ffffff'),
        '--ad-color': a.textColor || '#111827',
        '--ad-pill-bg': a.pillBg || '#dbeafe',
        '--ad-pill-color': a.pillColor || '#1e40af',
        '--ad-gradient-start': a.gradientStart || '#6366f1',
        '--ad-gradient-end': a.gradientEnd || '#8b5cf6',
        '--ad-button-primary-color': a.buttonPrimaryColor || '#ffffff',
        '--ad-button-primary-bg': a.buttonPrimaryBg || '#6366f1',
        '--ad-button-secondary-color': a.buttonSecondaryColor || '#111827',
        '--ad-button-secondary-bg': a.buttonSecondaryBg || '#ffffff',
        '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
        '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
        '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
        '--ad-radius': `${ a.borderRadius || 12 }px`,
        '--ad-padding': `${ a.padding || 80 }px`,
        '--ad-font-size': `${ a.fontSize || 16 }px`,
        ...bgStyle,
      },
    } );

    return (
      <section { ...blockProps }>
        <div className="adaire-saas-hero__container">
          { a.showPill && a.pillText && (
            <div className="adaire-saas-hero__pill">
              <RichText.Content tagName="span" value={ a.pillText } />
            </div>
          )}

          <div className="adaire-saas-hero__content">
            <div className="adaire-saas-hero__text">
              { a.eyebrow && (
                <RichText.Content
                  tagName="p"
                  className="adaire-saas-hero__eyebrow"
                  value={ a.eyebrow }
                />
              )}

              <RichText.Content
                tagName="h1"
                className={`adaire-saas-hero__heading ${ a.useGradientHeadline ? 'has-gradient' : ''}`}
                value={ a.heading }
              />

              <RichText.Content
                tagName="p"
                className="adaire-saas-hero__text"
                value={ a.text }
              />

              <div className="adaire-saas-hero__cta">
                { a.ctaType === 'dual-buttons' && (
                  <>
                    <a href={ a.primaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.primaryButtonText }
                    </a>
                    <a href={ a.secondaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                      { a.secondaryButtonText }
                    </a>
                  </>
                )}

                { a.ctaType === 'email-form' && (
                  <form className="adaire-saas-hero__email-form" onSubmit="return false">
                    <input
                      type="email"
                      placeholder={ a.emailPlaceholder || 'Enter your email' }
                      required
                    />
                    <button type="submit">
                      { a.submitButtonText || 'Get Started' }
                    </button>
                  </form>
                )}

                { a.ctaType === 'single-button' && (
                  <>
                    <a href={ a.singleButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.singleButtonText }
                    </a>
                    { a.microCopy && <p className="adaire-saas-hero__micro-copy">{ a.microCopy }</p>}
                  </>
                )}
              </div>
            </div>

            { a.showHeroImage && a.heroImageUrl && (
              <div className={`adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }`}>
                <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
              </div>
            )}
          </div>

          { a.showTrustBar && a.trustBarTitle && (
            <div className="adaire-saas-hero__trust-bar">
              <p className="adaire-saas-hero__trust-title">{ a.trustBarTitle }</p>
              <div className="adaire-saas-hero__trust-logos">
                { a.trustLogos && a.trustLogos.split('\n').map((logo, index) => (
                  <span key={ index } className="adaire-saas-hero__trust-logo">{ logo }</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  },
};


// ─── v4 helpers ────────────────────────────────────────────────────────────
// Frozen, self-contained copies of the shared.js helpers as they existed
// right before Trusted-By, Security Panel, and FAQ were removed from this
// block entirely (per user request — the free-tier SaaS Hero now only keeps
// Top Pill, CTA Content, and Media Asset as its "extra" sections, alongside
// Ratings & Badges which stays). Deliberately NOT imported from the live
// ./shared.js — trustItems/trustLogos handling, TrustLogo, SecurityFeatureView,
// and FaqItemView could be pruned from shared.js later since nothing else
// uses them, and a deprecation must never depend on current shared code
// (same reasoning v3's helpers follow).
function getTrustItemsV4( a ) {
  if ( Array.isArray( a.trustItems ) && a.trustItems.length > 0 ) {
    return a.trustItems;
  }
  if ( typeof a.trustLogos === 'string' && a.trustLogos ) {
    return a.trustLogos
      .split( '\n' )
      .map( ( line ) => ( { name: line.trim(), logoUrl: '', url: '' } ) )
      .filter( ( item ) => item.name );
  }
  return [];
}

function resolveSentinelV4( value, fallback ) {
  return value === undefined || value === null || value < 0 ? fallback : value;
}

function alignToFlexV4( align ) {
  if ( align === 'left' ) return 'flex-start';
  if ( align === 'right' ) return 'flex-end';
  return 'center';
}

function getBgTypeClassV4( a ) {
  return `bg-type-${ a.backgroundType || 'solid' }`;
}

function getStyleVarsV4( a ) {
  const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  const styleVars = {
    '--ad-accent': a.accentColor || '#6366f1',
    '--ad-color': a.textColor || '#111827',

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

    '--ad-cta-gap': `${ a.ctaGap ?? 16 }px`,
    '--ad-cta-padding-v': `${ a.ctaPaddingV ?? 14 }px`,
    '--ad-cta-padding-h': `${ a.ctaPaddingH ?? 32 }px`,
    '--ad-cta-radius': `${ resolveSentinelV4( a.ctaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-cta-align': alignToFlexV4( a.ctaAlignment ),

    '--ad-media-radius': `${ resolveSentinelV4( a.mediaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-media-spacing': `${ a.mediaSpacing ?? 48 }px`,
    '--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

    '--ad-trust-item-width': a.trustItemWidth ? `${ a.trustItemWidth }px` : 'auto',
    '--ad-trust-item-gap': `${ a.trustItemGap ?? 32 }px`,
    '--ad-trust-logo-max-height': `${ a.trustLogoMaxHeight ?? 32 }px`,
    '--ad-trust-carousel-speed': `${ a.trustCarouselSpeed ?? 30 }s`,
    '--ad-trust-visible-items': `${ a.trustCarouselVisibleItems ?? 5 }`,
    '--ad-trust-dir': a.trustCarouselDirection === 'right' ? '1' : '-1',

    '--ad-effect-gradient-overlay': `linear-gradient(135deg, ${ a.effectGradientOverlayColor1 || '#6366f1' }, ${ a.effectGradientOverlayColor2 || '#8b5cf6' })`,
    '--ad-effect-gradient-overlay-opacity': `${ ( a.effectGradientOverlayOpacity ?? 30 ) / 100 }`,
    '--ad-effect-glow-color': a.effectGlowColor || '#6366f1',

    '--ad-rating-align': alignToFlexV4( a.ratingBadgesAlignment ),

    '--ad-security-bg': a.securityPanelBg || '#f8fafc',
    '--ad-security-color': a.securityPanelTextColor || '#111827',
  };

  const hasTypographyAttrs = a.eyebrowFontSize || a.fontFamily || a.headingFontSize ||
    a.bodyTextFontWeight || a.pillFontSize || a.buttonFontSize;

  if ( hasTypographyAttrs ) {
    styleVars[ '--ad-font-family' ] = a.fontFamily !== undefined && a.fontFamily !== '' ? a.fontFamily : 'inherit';
    styleVars[ '--ad-eyebrow-font-size' ] = a.eyebrowFontSize || '14px';
    styleVars[ '--ad-eyebrow-font-weight' ] = a.eyebrowFontWeight || '600';
    styleVars[ '--ad-eyebrow-line-height' ] = a.eyebrowLineHeight || 'normal';
    styleVars[ '--ad-eyebrow-letter-spacing' ] = a.eyebrowLetterSpacing || '1px';
    styleVars[ '--ad-eyebrow-text-transform' ] = a.eyebrowTextTransform || 'uppercase';

    styleVars[ '--ad-heading-font-size' ] = a.headingFontSize || 'clamp(36px, 5vw, 64px)';
    styleVars[ '--ad-heading-font-weight' ] = a.headingFontWeight || '800';
    styleVars[ '--ad-heading-line-height' ] = a.headingLineHeight || '1.2';
    styleVars[ '--ad-heading-letter-spacing' ] = a.headingLetterSpacing || 'normal';
    styleVars[ '--ad-heading-text-transform' ] = a.headingTextTransform || 'none';

    styleVars[ '--ad-body-text-font-weight' ] = a.bodyTextFontWeight || '400';
    styleVars[ '--ad-body-text-line-height' ] = a.bodyTextLineHeight || '1.6';
    styleVars[ '--ad-body-text-letter-spacing' ] = a.bodyTextLetterSpacing || 'normal';
    styleVars[ '--ad-body-text-text-transform' ] = a.bodyTextTextTransform || 'none';

    styleVars[ '--ad-pill-font-size' ] = a.pillFontSize || '14px';
    styleVars[ '--ad-pill-font-weight' ] = a.pillFontWeight || '600';
    styleVars[ '--ad-pill-line-height' ] = a.pillLineHeight || 'normal';
    styleVars[ '--ad-pill-letter-spacing' ] = a.pillLetterSpacing || 'normal';
    styleVars[ '--ad-pill-text-transform' ] = a.pillTextTransform || 'none';

    styleVars[ '--ad-button-font-size' ] = a.buttonFontSize || '16px';
    styleVars[ '--ad-button-font-weight' ] = a.buttonFontWeight || '600';
    styleVars[ '--ad-button-line-height' ] = a.buttonLineHeight || 'normal';
    styleVars[ '--ad-button-letter-spacing' ] = a.buttonLetterSpacing || 'normal';
    styleVars[ '--ad-button-text-transform' ] = a.buttonTextTransform || 'none';

    styleVars[ '--ad-trust-title-font-size' ] = a.trustTitleFontSize || '14px';
    styleVars[ '--ad-trust-title-font-weight' ] = a.trustTitleFontWeight || '600';
    styleVars[ '--ad-trust-title-line-height' ] = a.trustTitleLineHeight || 'normal';
    styleVars[ '--ad-trust-title-letter-spacing' ] = a.trustTitleLetterSpacing || '1px';
    styleVars[ '--ad-trust-title-text-transform' ] = a.trustTitleTextTransform || 'uppercase';

    styleVars[ '--ad-trust-logo-font-size' ] = a.trustLogoFontSize || '16px';
    styleVars[ '--ad-trust-logo-font-weight' ] = a.trustLogoFontWeight || '600';
    styleVars[ '--ad-trust-logo-line-height' ] = a.trustLogoLineHeight || 'normal';
    styleVars[ '--ad-trust-logo-letter-spacing' ] = a.trustLogoLetterSpacing || 'normal';
    styleVars[ '--ad-trust-logo-text-transform' ] = a.trustLogoTextTransform || 'none';

    styleVars[ '--ad-micro-copy-font-size' ] = a.microCopyFontSize || '14px';
    styleVars[ '--ad-micro-copy-font-weight' ] = a.microCopyFontWeight || '400';
    styleVars[ '--ad-micro-copy-line-height' ] = a.microCopyLineHeight || 'normal';
    styleVars[ '--ad-micro-copy-letter-spacing' ] = a.microCopyLetterSpacing || 'normal';
    styleVars[ '--ad-micro-copy-text-transform' ] = a.microCopyTextTransform || 'none';

    styleVars[ '--ad-security-title-font-size' ] = a.securityTitleFontSize || '22px';
    styleVars[ '--ad-security-title-font-weight' ] = a.securityTitleFontWeight || '700';
    styleVars[ '--ad-security-title-line-height' ] = a.securityTitleLineHeight || 'normal';
    styleVars[ '--ad-security-title-letter-spacing' ] = a.securityTitleLetterSpacing || 'normal';
    styleVars[ '--ad-security-title-text-transform' ] = a.securityTitleTextTransform || 'none';

    styleVars[ '--ad-faq-title-font-size' ] = a.faqTitleFontSize || '22px';
    styleVars[ '--ad-faq-title-font-weight' ] = a.faqTitleFontWeight || '700';
    styleVars[ '--ad-faq-title-line-height' ] = a.faqTitleLineHeight || 'normal';
    styleVars[ '--ad-faq-title-letter-spacing' ] = a.faqTitleLetterSpacing || 'normal';
    styleVars[ '--ad-faq-title-text-transform' ] = a.faqTitleTextTransform || 'none';
  }

  return styleVars;
}

function TrustLogoV4( { item } ) {
  const inner = item.logoUrl
    ? <img src={ item.logoUrl } alt={ item.name || '' } className="adaire-saas-hero__trust-logo-img" loading="lazy" />
    : <span className="adaire-saas-hero__trust-logo-text">{ item.name }</span>;
  return item.url
    ? <a href={ item.url } className="adaire-saas-hero__trust-logo">{ inner }</a>
    : <span className="adaire-saas-hero__trust-logo">{ inner }</span>;
}

const LEGACY_RATING_ICON_MAP_V4 = {
  star: 'bi bi-star-fill',
  badge: 'bi bi-trophy-fill',
  appstore: 'bi bi-apple',
  googleplay: 'bi bi-google-play',
};

const LEGACY_SECURITY_ICON_MAP_V4 = {
  '🔒': 'bi bi-lock-fill',
  '🏦': 'bi bi-bank',
  '🛡️': 'bi bi-shield-fill-check',
  '🛡': 'bi bi-shield-fill-check',
  '💳': 'bi bi-credit-card-fill',
  '🔑': 'bi bi-key-fill',
  '📞': 'bi bi-telephone-fill',
};

function resolveRatingIconV4( badge ) {
  if ( badge.icon && badge.icon.indexOf( 'bi-' ) !== -1 ) {
    return badge.icon;
  }
  if ( badge.iconType && LEGACY_RATING_ICON_MAP_V4[ badge.iconType ] ) {
    return LEGACY_RATING_ICON_MAP_V4[ badge.iconType ];
  }
  return 'bi bi-star-fill';
}

function resolveFeatureIconV4( feature ) {
  if ( feature.icon && feature.icon.indexOf( 'bi-' ) !== -1 ) {
    return feature.icon;
  }
  if ( feature.icon && LEGACY_SECURITY_ICON_MAP_V4[ feature.icon ] ) {
    return LEGACY_SECURITY_ICON_MAP_V4[ feature.icon ];
  }
  return 'bi bi-shield-check';
}

function RatingBadgeViewV4( { badge } ) {
  return (
    <div className="adaire-saas-hero__rating-badge">
      <span className="adaire-saas-hero__rating-icon" aria-hidden="true">
        { badge.imageUrl
          ? <img src={ badge.imageUrl } alt="" className="adaire-saas-hero__rating-icon-img" loading="lazy" />
          : <i className={ resolveRatingIconV4( badge ) } /> }
      </span>
      <span className="adaire-saas-hero__rating-copy">
        <strong>{ badge.text }</strong>
        <small>{ badge.subtext }</small>
      </span>
    </div>
  );
}

function SecurityFeatureViewV4( { feature } ) {
  return (
    <div className="adaire-saas-hero__security-card">
      <span className="adaire-saas-hero__security-icon" aria-hidden="true">
        { feature.imageUrl
          ? <img src={ feature.imageUrl } alt="" className="adaire-saas-hero__security-icon-img" loading="lazy" />
          : <i className={ resolveFeatureIconV4( feature ) } /> }
      </span>
      <h4>{ feature.title }</h4>
      <p>{ feature.text }</p>
    </div>
  );
}

function FaqItemViewV4( { item, defaultOpen } ) {
  return (
    <details className="adaire-saas-hero__faq-item" open={ defaultOpen || undefined }>
      <summary className="adaire-saas-hero__faq-question">{ item.question }</summary>
      <div className="adaire-saas-hero__faq-answer">{ item.answer }</div>
    </details>
  );
}

// v4 — shape that shipped just before Trusted By, Security Panel, and FAQ
// were removed entirely from the free-tier SaaS Hero block (kept: Top Pill,
// CTA Content, Media Asset, Ratings & Badges, Hero Effects). Frozen here —
// including its own attribute defaults, since trustTitleFontSize/
// trustLogoFontSize/securityTitleFontSize/faqTitleFontSize and their
// sibling weight/line-height/letter-spacing/text-transform attributes were
// removed from block.json entirely and Gutenberg won't extract them from
// old saved markup without a schema for them here.
const v4Attributes = {
  eyebrow: { type: "string", default: "Scale faster" },
  heading: { type: "string", default: "Launch your SaaS faster" },
  text: { type: "string", default: "A modern hero section for software products, startups, and landing pages." },
  buttonText: { type: "string", default: "Start free trial" },
  buttonUrl: { type: "string", default: "#" },

  accentColor: { type: "string", default: "#6366f1" },
  backgroundColor: { type: "string", default: "#ffffff" },
  textColor: { type: "string", default: "#111827" },
  heroImageUrl: { type: "string", default: "" },

  backgroundType: { type: "string", default: "solid" },
  backgroundImage: { type: "string", default: "" },
  backgroundGradient: { type: "string", default: "" },
  backgroundImageSize: { type: "string", default: "cover" },
  backgroundImagePosition: { type: "string", default: "center" },
  backgroundImageRepeat: { type: "string", default: "no-repeat" },

  layoutStyle: { type: "string", default: "centered" },

  showPill: { type: "boolean", default: true },
  pillText: { type: "string", default: "New: v2.0 Release" },
  pillBg: { type: "string", default: "#dbeafe" },
  pillColor: { type: "string", default: "#1e40af" },

  useGradientHeadline: { type: "boolean", default: true },
  gradientStart: { type: "string", default: "#6366f1" },
  gradientEnd: { type: "string", default: "#8b5cf6" },

  ctaType: { type: "string", default: "dual-buttons" },
  primaryButtonText: { type: "string", default: "Get Started" },
  primaryButtonUrl: { type: "string", default: "#" },
  secondaryButtonText: { type: "string", default: "Book a Demo" },
  secondaryButtonUrl: { type: "string", default: "#" },
  emailPlaceholder: { type: "string", default: "Enter your email" },
  submitButtonText: { type: "string", default: "Get Started" },
  singleButtonText: { type: "string", default: "Shop Collection" },
  singleButtonUrl: { type: "string", default: "#" },
  microCopy: { type: "string", default: "Free shipping on orders over $50" },
  buttonPrimaryColor: { type: "string", default: "#ffffff" },
  buttonPrimaryBg: { type: "string", default: "#6366f1" },
  buttonSecondaryColor: { type: "string", default: "#111827" },
  buttonSecondaryBg: { type: "string", default: "#ffffff" },
  buttonHoverColor: { type: "string", default: "#ffffff" },
  buttonHoverBackgroundColor: { type: "string", default: "#111827" },
  buttonHoverBorderColor: { type: "string", default: "#111827" },
  buttonHoverEffect: { type: "string", default: "lift" },
  ctaAlignment: { type: "string", default: "center" },
  ctaGap: { type: "number", default: 16 },
  ctaPaddingV: { type: "number", default: 14 },
  ctaPaddingH: { type: "number", default: 32 },
  ctaBorderRadius: { type: "number", default: -1 },

  showHeroImage: { type: "boolean", default: true },
  imagePosition: { type: "string", default: "below" },
  mediaShadow: { type: "boolean", default: true },
  mediaBorderRadius: { type: "number", default: -1 },
  mediaSpacing: { type: "number", default: 48 },

  effectsPreset: { type: "string", default: "none" },
  effectDotPattern: { type: "boolean", default: false },
  effectGradientOverlay: { type: "boolean", default: false },
  effectGradientOverlayColor1: { type: "string", default: "#6366f1" },
  effectGradientOverlayColor2: { type: "string", default: "#8b5cf6" },
  effectGradientOverlayOpacity: { type: "number", default: 30 },
  effectAbstractShapes: { type: "boolean", default: false },
  effectGlow: { type: "boolean", default: false },
  effectGlowColor: { type: "string", default: "#6366f1" },
  effectBlur: { type: "boolean", default: false },
  effectFloatingElements: { type: "boolean", default: false },
  effectAnimatedAccents: { type: "boolean", default: false },

  fontSize: { type: "number", default: 16 },
  padding: { type: "number", default: 80 },
  borderRadius: { type: "number", default: 12 },

  fontFamily: { type: "string", default: "inherit" },

  eyebrowFontSize: { type: "string", default: "14px" },
  eyebrowFontWeight: { type: "string", default: "600" },
  eyebrowLineHeight: { type: "string", default: "normal" },
  eyebrowLetterSpacing: { type: "string", default: "1px" },
  eyebrowTextTransform: { type: "string", default: "uppercase" },

  headingFontSize: { type: "string", default: "clamp(36px, 5vw, 64px)" },
  headingFontWeight: { type: "string", default: "800" },
  headingLineHeight: { type: "string", default: "1.2" },
  headingLetterSpacing: { type: "string", default: "normal" },
  headingTextTransform: { type: "string", default: "none" },

  bodyTextLineHeight: { type: "string", default: "1.6" },
  bodyTextLetterSpacing: { type: "string", default: "normal" },
  bodyTextTextTransform: { type: "string", default: "none" },
  bodyTextFontWeight: { type: "string", default: "400" },

  pillFontSize: { type: "string", default: "14px" },
  pillFontWeight: { type: "string", default: "600" },
  pillLineHeight: { type: "string", default: "normal" },
  pillLetterSpacing: { type: "string", default: "normal" },
  pillTextTransform: { type: "string", default: "none" },

  buttonFontSize: { type: "string", default: "16px" },
  buttonFontWeight: { type: "string", default: "600" },
  buttonLineHeight: { type: "string", default: "normal" },
  buttonLetterSpacing: { type: "string", default: "normal" },
  buttonTextTransform: { type: "string", default: "none" },

  trustTitleFontSize: { type: "string", default: "14px" },
  trustTitleFontWeight: { type: "string", default: "600" },
  trustTitleLineHeight: { type: "string", default: "normal" },
  trustTitleLetterSpacing: { type: "string", default: "1px" },
  trustTitleTextTransform: { type: "string", default: "uppercase" },

  trustLogoFontSize: { type: "string", default: "16px" },
  trustLogoFontWeight: { type: "string", default: "600" },
  trustLogoLineHeight: { type: "string", default: "normal" },
  trustLogoLetterSpacing: { type: "string", default: "normal" },
  trustLogoTextTransform: { type: "string", default: "none" },

  microCopyFontSize: { type: "string", default: "14px" },
  microCopyFontWeight: { type: "string", default: "400" },
  microCopyLineHeight: { type: "string", default: "normal" },
  microCopyLetterSpacing: { type: "string", default: "normal" },
  microCopyTextTransform: { type: "string", default: "none" },

  securityTitleFontSize: { type: "string", default: "22px" },
  securityTitleFontWeight: { type: "string", default: "700" },
  securityTitleLineHeight: { type: "string", default: "normal" },
  securityTitleLetterSpacing: { type: "string", default: "normal" },
  securityTitleTextTransform: { type: "string", default: "none" },

  faqTitleFontSize: { type: "string", default: "22px" },
  faqTitleFontWeight: { type: "string", default: "700" },
  faqTitleLineHeight: { type: "string", default: "normal" },
  faqTitleLetterSpacing: { type: "string", default: "normal" },
  faqTitleTextTransform: { type: "string", default: "none" },
};

const v4 = {
  attributes: v4Attributes,

  migrate( attributes ) {
    return attributes;
  },

  save( { attributes: a } ) {
    const trustItemsResolved = getTrustItemsV4( a );

    const blockProps = useBlockProps.save( {
      className: [
        'adaire-saas-hero',
        `layout-${ a.layoutStyle || 'centered' }`,
        getBgTypeClassV4( a ),
        a.trustCarousel ? 'has-trust-carousel' : '',
        a.effectFloatingElements ? 'has-floating-elements' : '',
      ].filter( Boolean ).join( ' ' ),
      style: getStyleVarsV4( a ),
    } );

    return (
      <section { ...blockProps }>
        { a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" /> }
        { a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" /> }
        { a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" /> }
        { a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" /> }
        { a.effectAbstractShapes && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
            <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
          </div>
        ) }
        { a.effectFloatingElements && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
            <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
          </div>
        ) }
        { a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" /> }

        <div className="adaire-saas-hero__container">
          { a.showPill && a.pillText && (
            <div className="adaire-saas-hero__pill">
              <RichText.Content tagName="span" value={ a.pillText } />
            </div>
          ) }

          { a.showRatingBadges && (
            <div className="adaire-saas-hero__ratings">
              { ( a.ratingBadges || [] ).map( ( badge, i ) => <RatingBadgeViewV4 key={ i } badge={ badge } /> ) }
            </div>
          ) }

          <div className="adaire-saas-hero__content">
            <div className="adaire-saas-hero__text">
              { a.eyebrow && (
                <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={ a.eyebrow } />
              ) }

              <RichText.Content
                tagName="h1"
                className={ `adaire-saas-hero__heading ${ a.useGradientHeadline ? 'has-gradient' : '' }` }
                value={ a.heading }
              />

              <RichText.Content tagName="p" className="adaire-saas-hero__text" value={ a.text } />

              <div className="adaire-saas-hero__cta">
                { a.ctaType === 'dual-buttons' && (
                  <>
                    <a href={ a.primaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.primaryButtonText }
                    </a>
                    <a href={ a.secondaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                      { a.secondaryButtonText }
                    </a>
                  </>
                ) }

                { a.ctaType === 'email-form' && (
                  <form className="adaire-saas-hero__email-form" onSubmit="return false">
                    <input type="email" placeholder={ a.emailPlaceholder || 'Enter your email' } required />
                    <button type="submit">{ a.submitButtonText || 'Get Started' }</button>
                  </form>
                ) }

                { a.ctaType === 'single-button' && (
                  <>
                    <a href={ a.singleButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.singleButtonText }
                    </a>
                    { a.microCopy && <p className="adaire-saas-hero__micro-copy">{ a.microCopy }</p> }
                  </>
                ) }
              </div>
            </div>

            { a.showHeroImage && a.heroImageUrl && (
              <div className={ `adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }` }>
                <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
              </div>
            ) }
          </div>

          { a.showTrustBar && ( trustItemsResolved || [] ).length > 0 && (
            <div className={ `adaire-saas-hero__trust-bar trust-layout-${ a.trustLayout || 'row' } ${ a.trustCarousel ? 'is-carousel' : '' } ${ a.trustCarousel && a.trustCarouselAutoplay === false ? 'is-autoplay-off' : '' } ${ a.trustCarousel && a.trustCarouselPauseOnHover === false ? '' : 'is-pause-on-hover' }` }>
              { a.trustBarTitle && <RichText.Content tagName="p" className="adaire-saas-hero__trust-title" value={ a.trustBarTitle } /> }
              <div className="adaire-saas-hero__trust-logos-wrap">
                <div className="adaire-saas-hero__trust-logos">
                  { ( trustItemsResolved || [] ).map( ( item, i ) => <TrustLogoV4 key={ i } item={ item } /> ) }
                </div>
                { a.trustCarousel && (
                  <div className="adaire-saas-hero__trust-logos adaire-saas-hero__trust-logos--clone" aria-hidden="true">
                    { ( trustItemsResolved || [] ).map( ( item, i ) => <TrustLogoV4 key={ `clone-${ i }` } item={ item } /> ) }
                  </div>
                ) }
              </div>
            </div>
          ) }

          { a.showSecurityPanel && (
            <div className="adaire-saas-hero__security">
              <h3 className="adaire-saas-hero__security-title">
                { a.securityPanelTitle }{ a.securityPanelPartnerName ? ` ${ a.securityPanelPartnerName }` : '' }
              </h3>
              { a.securityPanelText && <p className="adaire-saas-hero__security-text">{ a.securityPanelText }</p> }
              <div className="adaire-saas-hero__security-grid">
                { ( a.securityFeatures || [] ).map( ( feature, i ) => <SecurityFeatureViewV4 key={ i } feature={ feature } /> ) }
              </div>
            </div>
          ) }

          { a.showFaq && (
            <div className="adaire-saas-hero__faq">
              { a.faqTitle && <h3 className="adaire-saas-hero__faq-title">{ a.faqTitle }</h3> }
              <div className="adaire-saas-hero__faq-list">
                { ( a.faqItems || [] ).map( ( item, i ) => <FaqItemViewV4 key={ i } item={ item } defaultOpen={ a.faqOpenFirst !== false && i === 0 } /> ) }
              </div>
            </div>
          ) }
        </div>
      </section>
    );
  },
};

// Frozen copy of shared.js's getStyleVars() as it stood immediately before the
// CTA rework added `--ad-cta-text-align`. Same rule as
// getStyleVarsTypography() above: never call the live getStyleVars() from a
// deprecation — it keeps growing vars, and the stored `style` string of older
// content stops matching the moment it does.
function getStyleVarsPreCta( a ) {
  const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  const styleVars = {
    '--ad-accent': a.accentColor || '#6366f1',
    '--ad-color': a.textColor || '#111827',

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

    '--ad-cta-gap': `${ a.ctaGap ?? 16 }px`,
    '--ad-cta-padding-v': `${ a.ctaPaddingV ?? 14 }px`,
    '--ad-cta-padding-h': `${ a.ctaPaddingH ?? 32 }px`,
    '--ad-cta-radius': `${ resolveSentinel( a.ctaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-cta-align': alignToFlex( a.ctaAlignment ),

    '--ad-media-radius': `${ resolveSentinel( a.mediaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-media-spacing': `${ a.mediaSpacing ?? 48 }px`,
    '--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

    '--ad-effect-gradient-overlay': `linear-gradient(135deg, ${ a.effectGradientOverlayColor1 || '#6366f1' }, ${ a.effectGradientOverlayColor2 || '#8b5cf6' })`,
    '--ad-effect-gradient-overlay-opacity': `${ ( a.effectGradientOverlayOpacity ?? 30 ) / 100 }`,
    '--ad-effect-glow-color': a.effectGlowColor || '#6366f1',

    '--ad-rating-align': alignToFlex( a.ratingBadgesAlignment ),
  };

  const hasTypographyAttrs = a.eyebrowFontSize || a.fontFamily || a.headingFontSize ||
    a.bodyTextFontWeight || a.pillFontSize || a.buttonFontSize;

  if ( hasTypographyAttrs ) {
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

function resolveSentinelV6( value, fallback ) {
  return value === undefined || value === null || value < 0 ? fallback : value;
}

function alignToFlexV6( align ) {
  if ( align === 'left' ) return 'flex-start';
  if ( align === 'right' ) return 'flex-end';
  return 'center';
}

function getBgTypeClassV6( a ) {
  return `bg-type-${ a.backgroundType || 'solid' }`;
}

function getStyleVarsV6( a ) {
  const defaultGradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
  const responsivePadding = a.responsivePadding || {};

  const styleVars = {
    '--ad-accent': a.accentColor || '#6366f1',
    '--ad-color': a.textColor || '#111827',

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
    '--ad-padding-desktop': `${ responsivePadding.desktop ?? a.padding ?? 80 }px`,
    '--ad-padding-tablet': `${ responsivePadding.tablet ?? responsivePadding.desktop ?? a.padding ?? 80 }px`,
    '--ad-padding-mobile': `${ responsivePadding.mobile ?? responsivePadding.tablet ?? responsivePadding.desktop ?? a.padding ?? 80 }px`,
    '--ad-margin-top': a.margin?.top || '0px',
    '--ad-margin-right': a.margin?.right || '0px',
    '--ad-margin-bottom': a.margin?.bottom || '0px',
    '--ad-margin-left': a.margin?.left || '0px',
    '--ad-font-size': `${ a.fontSize ?? 16 }px`,

    '--ad-pill-bg': a.pillBg || '#dbeafe',
    '--ad-pill-color': a.pillColor || '#1e40af',
    '--ad-gradient-start': a.gradientStart || '#6366f1',
    '--ad-gradient-end': a.gradientEnd || '#8b5cf6',

    '--ad-cta-gap': `${ a.ctaGap ?? 16 }px`,
    '--ad-cta-padding-v': `${ a.ctaPaddingV ?? 14 }px`,
    '--ad-cta-padding-h': `${ a.ctaPaddingH ?? 32 }px`,
    '--ad-cta-radius': `${ resolveSentinelV6( a.ctaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-cta-align': alignToFlexV6( a.ctaAlignment ),
    '--ad-cta-text-align': a.ctaAlignment || 'center',

    '--ad-media-radius': `${ resolveSentinelV6( a.mediaBorderRadius, a.borderRadius ?? 12 ) }px`,
    '--ad-media-spacing': `${ a.mediaSpacing ?? 48 }px`,
    '--ad-media-shadow': a.mediaShadow === false ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.15)',

    '--ad-effect-gradient-overlay': `linear-gradient(135deg, ${ a.effectGradientOverlayColor1 || '#6366f1' }, ${ a.effectGradientOverlayColor2 || '#8b5cf6' })`,
    '--ad-effect-gradient-overlay-opacity': `${ ( a.effectGradientOverlayOpacity ?? 30 ) / 100 }`,
    '--ad-effect-glow-color': a.effectGlowColor || '#6366f1',

    '--ad-rating-align': alignToFlexV6( a.ratingBadgesAlignment ),
  };

  const hasTypographyAttrs = a.eyebrowFontSize || a.fontFamily || a.headingFontSize ||
    a.bodyTextFontWeight || a.pillFontSize || a.buttonFontSize;

  if ( hasTypographyAttrs ) {
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

function resolveRatingIconV6( badge ) {
  if ( badge.icon && badge.icon.indexOf( 'bi-' ) !== -1 ) {
    return badge.icon;
  }
  if ( badge.iconType && LEGACY_RATING_ICON_MAP_V6[ badge.iconType ] ) {
    return LEGACY_RATING_ICON_MAP_V6[ badge.iconType ];
  }
  return 'bi bi-star-fill';
}

const LEGACY_RATING_ICON_MAP_V6 = {
  star: 'bi bi-star-fill',
  badge: 'bi bi-trophy-fill',
  appstore: 'bi bi-apple',
  googleplay: 'bi bi-google-play',
};

function RatingBadgeViewV6( { badge } ) {
  return (
    <div className="adaire-saas-hero__rating-badge">
      <span className="adaire-saas-hero__rating-icon" aria-hidden="true">
        { badge.imageUrl
          ? <img src={ badge.imageUrl } alt="" className="adaire-saas-hero__rating-icon-img" loading="lazy" />
          : <i className={ resolveRatingIconV6( badge ) } /> }
      </span>
      <span className="adaire-saas-hero__rating-copy">
        <strong>{ badge.text }</strong>
        <small>{ badge.subtext }</small>
      </span>
    </div>
  );
}

/**
 * v6 — frozen copy of save() as it stood immediately before the Newsletter
 * (email-form CTA) feature was removed from this block. Content saved with
 * ctaType: 'email-form' (plus emailPlaceholder / submitButtonText) must keep
 * validating against this exact shape — the live save() and block.json no
 * longer know about that CTA type at all. `migrate` is a no-op: every
 * attribute this entry needs (ctaType, emailPlaceholder, submitButtonText)
 * is still present in its own frozen `attributes` block below, so nothing
 * needs rewriting, it just stops being an available choice for new content.
 */
const vNewsletterCta = {
  migrate( attributes ) {
    return attributes;
  },

  attributes:
  {
    "eyebrow": {
      "type": "string",
      "default": "Scale faster"
    },
    "heading": {
      "type": "string",
      "default": "Launch your SaaS faster"
    },
    "text": {
      "type": "string",
      "default": "A modern hero section for software products, startups, and landing pages."
    },
    "buttonText": {
      "type": "string",
      "default": "Start free trial"
    },
    "buttonUrl": {
      "type": "string",
      "default": "#"
    },
    "accentColor": {
      "type": "string",
      "default": "#6366f1"
    },
    "backgroundColor": {
      "type": "string",
      "default": "#ffffff"
    },
    "textColor": {
      "type": "string",
      "default": "#111827"
    },
    "heroImageUrl": {
      "type": "string",
      "default": ""
    },
    "backgroundType": {
      "type": "string",
      "default": "solid",
      "enum": [
        "solid",
        "gradient",
        "image"
      ]
    },
    "backgroundImage": {
      "type": "string",
      "default": ""
    },
    "backgroundGradient": {
      "type": "string",
      "default": ""
    },
    "backgroundImageSize": {
      "type": "string",
      "default": "cover",
      "enum": [
        "cover",
        "contain",
        "auto"
      ]
    },
    "backgroundImagePosition": {
      "type": "string",
      "default": "center",
      "enum": [
        "center",
        "top",
        "bottom",
        "left",
        "right"
      ]
    },
    "backgroundImageRepeat": {
      "type": "string",
      "default": "no-repeat"
    },
    "layoutStyle": {
      "type": "string",
      "default": "centered",
      "enum": [
        "centered",
        "split-left",
        "split-right"
      ]
    },
    "showPill": {
      "type": "boolean",
      "default": true
    },
    "pillText": {
      "type": "string",
      "default": "New: v2.0 Release"
    },
    "pillBg": {
      "type": "string",
      "default": "#dbeafe"
    },
    "pillColor": {
      "type": "string",
      "default": "#1e40af"
    },
    "useGradientHeadline": {
      "type": "boolean",
      "default": true
    },
    "gradientStart": {
      "type": "string",
      "default": "#6366f1"
    },
    "gradientEnd": {
      "type": "string",
      "default": "#8b5cf6"
    },
    "showCta": {
      "type": "boolean",
      "default": true
    },
    "ctaType": {
      "type": "string",
      "default": "dual-buttons",
      "enum": [
        "dual-buttons",
        "email-form",
        "single-button"
      ]
    },
    "primaryButtonText": {
      "type": "string",
      "default": "Get Started"
    },
    "primaryButtonUrl": {
      "type": "string",
      "default": "#"
    },
    "secondaryButtonText": {
      "type": "string",
      "default": "Book a Demo"
    },
    "secondaryButtonUrl": {
      "type": "string",
      "default": "#"
    },
    "emailPlaceholder": {
      "type": "string",
      "default": "Enter your email"
    },
    "submitButtonText": {
      "type": "string",
      "default": "Get Started"
    },
    "singleButtonText": {
      "type": "string",
      "default": "Shop Collection"
    },
    "singleButtonUrl": {
      "type": "string",
      "default": "#"
    },
    "microCopy": {
      "type": "string",
      "default": "Free shipping on orders over $50"
    },
    "buttonPrimaryColor": {
      "type": "string",
      "default": "#ffffff"
    },
    "buttonPrimaryBg": {
      "type": "string",
      "default": "#6366f1"
    },
    "buttonSecondaryColor": {
      "type": "string",
      "default": "#111827"
    },
    "buttonSecondaryBg": {
      "type": "string",
      "default": "#ffffff"
    },
    "buttonHoverColor": {
      "type": "string",
      "default": "#ffffff"
    },
    "buttonHoverBackgroundColor": {
      "type": "string",
      "default": "#111827"
    },
    "buttonHoverBorderColor": {
      "type": "string",
      "default": "#111827"
    },
    "buttonHoverEffect": {
      "type": "string",
      "default": "lift"
    },
    "ctaAlignment": {
      "type": "string",
      "default": "center",
      "enum": [
        "left",
        "center",
        "right"
      ]
    },
    "ctaGap": {
      "type": "number",
      "default": 16
    },
    "ctaPaddingV": {
      "type": "number",
      "default": 14
    },
    "ctaPaddingH": {
      "type": "number",
      "default": 32
    },
    "ctaBorderRadius": {
      "type": "number",
      "default": -1
    },
    "showHeroImage": {
      "type": "boolean",
      "default": true
    },
    "imagePosition": {
      "type": "string",
      "default": "below",
      "enum": [
        "below",
        "above"
      ]
    },
    "mediaShadow": {
      "type": "boolean",
      "default": true
    },
    "mediaBorderRadius": {
      "type": "number",
      "default": -1
    },
    "mediaSpacing": {
      "type": "number",
      "default": 48
    },
    "effectsPreset": {
      "type": "string",
      "default": "none",
      "enum": [
        "none",
        "sports",
        "gym",
        "ecommerce",
        "business",
        "medical",
        "gaming",
        "custom"
      ]
    },
    "effectDotPattern": {
      "type": "boolean",
      "default": false
    },
    "effectGradientOverlay": {
      "type": "boolean",
      "default": false
    },
    "effectGradientOverlayColor1": {
      "type": "string",
      "default": "#6366f1"
    },
    "effectGradientOverlayColor2": {
      "type": "string",
      "default": "#8b5cf6"
    },
    "effectGradientOverlayOpacity": {
      "type": "number",
      "default": 30
    },
    "effectAbstractShapes": {
      "type": "boolean",
      "default": false
    },
    "effectGlow": {
      "type": "boolean",
      "default": false
    },
    "effectGlowColor": {
      "type": "string",
      "default": "#6366f1"
    },
    "effectBlur": {
      "type": "boolean",
      "default": false
    },
    "effectFloatingElements": {
      "type": "boolean",
      "default": false
    },
    "effectAnimatedAccents": {
      "type": "boolean",
      "default": false
    },
    "showRatingBadges": {
      "type": "boolean",
      "default": false
    },
    "ratingBadgesAlignment": {
      "type": "string",
      "default": "center"
    },
    "ratingBadges": {
      "type": "array",
      "default": [
        {
          "icon": "bi bi-star-fill",
          "imageUrl": "",
          "text": "5.0/5",
          "subtext": "Average rating"
        },
        {
          "icon": "bi bi-people-fill",
          "imageUrl": "",
          "text": "10,000+",
          "subtext": "Happy customers"
        }
      ]
    },
    "fontSize": {
      "type": "number",
      "default": 16
    },
    "margin": {
      "type": "object",
      "default": {
        "top": "0px",
        "right": "0px",
        "bottom": "0px",
        "left": "0px"
      }
    },
    "padding": {
      "type": "number",
      "default": 80
    },
    "responsivePadding": {
      "type": "object",
      "default": {}
    },
    "borderRadius": {
      "type": "number",
      "default": 12
    },
    "fontFamily": {
      "type": "string",
      "default": "inherit"
    },
    "eyebrowFontSize": {
      "type": "string",
      "default": "14px"
    },
    "eyebrowFontWeight": {
      "type": "string",
      "default": "600"
    },
    "eyebrowLineHeight": {
      "type": "string",
      "default": "normal"
    },
    "eyebrowLetterSpacing": {
      "type": "string",
      "default": "1px"
    },
    "eyebrowTextTransform": {
      "type": "string",
      "default": "uppercase"
    },
    "headingFontSize": {
      "type": "string",
      "default": "clamp(36px, 5vw, 64px)"
    },
    "headingFontWeight": {
      "type": "string",
      "default": "800"
    },
    "headingLineHeight": {
      "type": "string",
      "default": "1.2"
    },
    "headingLetterSpacing": {
      "type": "string",
      "default": "normal"
    },
    "headingTextTransform": {
      "type": "string",
      "default": "none"
    },
    "bodyTextLineHeight": {
      "type": "string",
      "default": "1.6"
    },
    "bodyTextLetterSpacing": {
      "type": "string",
      "default": "normal"
    },
    "bodyTextTextTransform": {
      "type": "string",
      "default": "none"
    },
    "bodyTextFontWeight": {
      "type": "string",
      "default": "400"
    },
    "pillFontSize": {
      "type": "string",
      "default": "14px"
    },
    "pillFontWeight": {
      "type": "string",
      "default": "600"
    },
    "pillLineHeight": {
      "type": "string",
      "default": "normal"
    },
    "pillLetterSpacing": {
      "type": "string",
      "default": "normal"
    },
    "pillTextTransform": {
      "type": "string",
      "default": "none"
    },
    "buttonFontSize": {
      "type": "string",
      "default": "16px"
    },
    "buttonFontWeight": {
      "type": "string",
      "default": "600"
    },
    "buttonLineHeight": {
      "type": "string",
      "default": "normal"
    },
    "buttonLetterSpacing": {
      "type": "string",
      "default": "normal"
    },
    "buttonTextTransform": {
      "type": "string",
      "default": "none"
    },
    "microCopyFontSize": {
      "type": "string",
      "default": "14px"
    },
    "microCopyFontWeight": {
      "type": "string",
      "default": "400"
    },
    "microCopyLineHeight": {
      "type": "string",
      "default": "normal"
    },
    "microCopyLetterSpacing": {
      "type": "string",
      "default": "normal"
    },
    "microCopyTextTransform": {
      "type": "string",
      "default": "none"
    }
  },

  save( { attributes: a } ) {
    const blockProps = useBlockProps.save( {
      className: [
        'adaire-saas-hero',
        `layout-${ a.layoutStyle || 'centered' }`,
        getBgTypeClassV6( a ),
        a.effectFloatingElements ? 'has-floating-elements' : '',
      ].filter( Boolean ).join( ' ' ),
      style: getStyleVarsV6( a ),
    } );

    return (
      <section { ...blockProps }>
        { a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" /> }
        { a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" /> }
        { a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" /> }
        { a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" /> }
        { a.effectAbstractShapes && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
            <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
          </div>
        ) }
        { a.effectFloatingElements && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
            <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
          </div>
        ) }
        { a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" /> }

        <div className="adaire-saas-hero__container">
          { a.showPill && a.pillText && (
            <div className="adaire-saas-hero__pill">
              <RichText.Content tagName="span" value={ a.pillText } />
            </div>
          ) }

          { a.showRatingBadges && (
            <div className="adaire-saas-hero__ratings">
              { ( a.ratingBadges || [] ).map( ( badge, i ) => <RatingBadgeViewV6 key={ i } badge={ badge } /> ) }
            </div>
          ) }

          <div className="adaire-saas-hero__content">
            <div className="adaire-saas-hero__text">
              { a.eyebrow && (
                <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={ a.eyebrow } />
              ) }

              <RichText.Content
                tagName="h1"
                className={ `adaire-saas-hero__heading ${ a.useGradientHeadline ? 'has-gradient' : '' }` }
                value={ a.heading }
              />

              <RichText.Content tagName="p" className="adaire-saas-hero__text" value={ a.text } />

              { a.showCta !== false && (
                <div className="adaire-saas-hero__cta">
                  { a.ctaType === 'dual-buttons' && (
                    <>
                      { a.primaryButtonText && (
                        <a href={ a.primaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                          { a.primaryButtonText }
                        </a>
                      ) }
                      { a.secondaryButtonText && (
                        <a href={ a.secondaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                          { a.secondaryButtonText }
                        </a>
                      ) }
                    </>
                  ) }

                  { a.ctaType === 'email-form' && (
                    <div className="adaire-saas-hero__email-form">
                      <input type="email" placeholder={ a.emailPlaceholder || 'Enter your email' } aria-label={ a.emailPlaceholder || 'Enter your email' } />
                      <button type="button">{ a.submitButtonText || 'Get Started' }</button>
                    </div>
                  ) }

                  { a.ctaType === 'single-button' && (
                    <>
                      { a.singleButtonText && (
                        <a href={ a.singleButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                          { a.singleButtonText }
                        </a>
                      ) }
                      { a.microCopy && <p className="adaire-saas-hero__micro-copy">{ a.microCopy }</p> }
                    </>
                  ) }
                </div>
              ) }
            </div>

            { a.showHeroImage && a.heroImageUrl && (
              <div className={ `adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }` }>
                <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
              </div>
            ) }
          </div>
        </div>
      </section>
    );
  },
};

/**
 * v5 — frozen copy of save() as it stood immediately before the CTA rework,
 * which:
 *   - added the `showCta` toggle (CTA row can now be hidden entirely),
 *   - replaced the email-form <form onSubmit="return false"> with a plain
 *     <div> wrapper (the string event handler was never a valid React prop
 *     and the form had no action, so it could never submit anywhere), and
 *   - added the `--ad-cta-text-align` style var.
 *
 * All three change the serialized markup/style string, so content saved
 * before them only validates against this entry. `migrate` is a no-op: every
 * new attribute has a default that reproduces the old rendering (`showCta`
 * defaults to true), so no attribute rewriting is needed.
 */
const vCtaToggle = {
  migrate( attributes ) {
    return attributes;
  },

  save( { attributes: a } ) {
    const blockProps = useBlockProps.save( {
      className: [
        'adaire-saas-hero',
        `layout-${ a.layoutStyle || 'centered' }`,
        getBgTypeClass( a ),
        a.effectFloatingElements ? 'has-floating-elements' : '',
      ].filter( Boolean ).join( ' ' ),
      style: getStyleVarsPreCta( a ),
    } );

    return (
      <section { ...blockProps }>
        { a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" /> }
        { a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" /> }
        { a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" /> }
        { a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" /> }
        { a.effectAbstractShapes && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
            <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
          </div>
        ) }
        { a.effectFloatingElements && (
          <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
            <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
          </div>
        ) }
        { a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" /> }

        <div className="adaire-saas-hero__container">
          { a.showPill && a.pillText && (
            <div className="adaire-saas-hero__pill">
              <RichText.Content tagName="span" value={ a.pillText } />
            </div>
          ) }

          { a.showRatingBadges && (
            <div className="adaire-saas-hero__ratings">
              { ( a.ratingBadges || [] ).map( ( badge, i ) => <RatingBadgeView key={ i } badge={ badge } /> ) }
            </div>
          ) }

          <div className="adaire-saas-hero__content">
            <div className="adaire-saas-hero__text">
              { a.eyebrow && (
                <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={ a.eyebrow } />
              ) }

              <RichText.Content
                tagName="h1"
                className={ `adaire-saas-hero__heading ${ a.useGradientHeadline ? 'has-gradient' : '' }` }
                value={ a.heading }
              />

              <RichText.Content tagName="p" className="adaire-saas-hero__text" value={ a.text } />

              <div className="adaire-saas-hero__cta">
                { a.ctaType === 'dual-buttons' && (
                  <>
                    <a href={ a.primaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.primaryButtonText }
                    </a>
                    <a href={ a.secondaryButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                      { a.secondaryButtonText }
                    </a>
                  </>
                ) }

                { a.ctaType === 'email-form' && (
                  <form className="adaire-saas-hero__email-form" onSubmit="return false">
                    <input type="email" placeholder={ a.emailPlaceholder || 'Enter your email' } required />
                    <button type="submit">{ a.submitButtonText || 'Get Started' }</button>
                  </form>
                ) }

                { a.ctaType === 'single-button' && (
                  <>
                    <a href={ a.singleButtonUrl || '#' } className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                      { a.singleButtonText }
                    </a>
                    { a.microCopy && <p className="adaire-saas-hero__micro-copy">{ a.microCopy }</p> }
                  </>
                ) }
              </div>
            </div>

            { a.showHeroImage && a.heroImageUrl && (
              <div className={ `adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }` }>
                <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
              </div>
            ) }
          </div>
        </div>
      </section>
    );
  },
};

export default [ vNewsletterCta, vCtaToggle, v4, vRatingsExtraction, vTypography, v2, v1 ];
