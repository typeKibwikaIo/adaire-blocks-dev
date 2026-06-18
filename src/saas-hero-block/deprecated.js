import { RichText, useBlockProps } from '@wordpress/block-editor';

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

export default [ v2, v1 ];
