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
function getStyleVarsV3( a ) {
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
 * missing every typography var). Now uses the local `getStyleVarsV3()`
 * above instead, which reproduces exactly what was actually saved at the
 * time. `migrate` stays a no-op identity function and this entry still
 * doesn't need its own `attributes` key — only the *rendered* `style`
 * string changed, not the attribute schema — Gutenberg falls back to the
 * current block.json attributes when a deprecated entry omits one.
 */
const v3 = {
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
      style: getStyleVarsV3( a ),
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

export default [ v3, v2, v1 ];
