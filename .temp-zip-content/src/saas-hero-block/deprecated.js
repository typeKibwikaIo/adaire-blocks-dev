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

export default [ v1 ];
