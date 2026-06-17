import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes: a } ) {
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
        {/* Top Pill */}
        { a.showPill && a.pillText && (
          <div className="adaire-saas-hero__pill">
            <RichText.Content tagName="span" value={ a.pillText } />
          </div>
        )}

        {/* Main Content */}
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

            {/* CTA Module */}
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

          {/* Hero Image */}
          { a.showHeroImage && a.heroImageUrl && (
            <div className={`adaire-saas-hero__media adaire-saas-hero__media--${ a.imagePosition || 'below' }`}>
              <img src={ a.heroImageUrl } alt="Hero" loading="lazy" />
            </div>
          )}
        </div>

        {/* Trust Bar */}
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
}