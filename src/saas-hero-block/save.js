import { RichText, useBlockProps } from '@wordpress/block-editor';
import {
  getStyleVars,
  getBgTypeClass,
} from './shared';

// Mirrors edit.js's render tree exactly (same shared.js helpers + presentation
// components), just swapping RichText for RichText.Content and dropping the
// QuickZone/inspector wrappers — so the editor canvas and the published page
// can never visually drift apart.
export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({
    className: [
      'adaire-saas-hero',
      `layout-${a.layoutStyle || 'centered'}`,
      getBgTypeClass(a),
      a.effectFloatingElements ? 'has-floating-elements' : '',
    ].filter(Boolean).join(' '),
    style: getStyleVars(a),
  });

  return (
    <section {...blockProps}>
      {a.effectDotPattern && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--dots" aria-hidden="true" />}
      {a.effectGradientOverlay && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--gradient-overlay" aria-hidden="true" />}
      {a.effectBlur && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--blur" aria-hidden="true" />}
      {a.effectGlow && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--glow" aria-hidden="true" />}
      {a.effectAbstractShapes && (
        <div className="adaire-saas-hero__fx adaire-saas-hero__fx--shapes" aria-hidden="true">
          <span className="shape shape-1" /><span className="shape shape-2" /><span className="shape shape-3" />
        </div>
      )}
      {a.effectFloatingElements && (
        <div className="adaire-saas-hero__fx adaire-saas-hero__fx--floating" aria-hidden="true">
          <span className="float float-1" /><span className="float float-2" /><span className="float float-3" />
        </div>
      )}
      {a.effectAnimatedAccents && <div className="adaire-saas-hero__fx adaire-saas-hero__fx--accent" aria-hidden="true" />}

      <div className="adaire-saas-hero__container">
        {a.showPill && a.pillText && (
          <div className="adaire-saas-hero__pill">
            <RichText.Content tagName="span" value={a.pillText} />
          </div>
        )}

        <div className="adaire-saas-hero__content">
          <div className="adaire-saas-hero__text">
            {a.eyebrow && (
              <RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={a.eyebrow} />
            )}

            <RichText.Content
              tagName="h1"
              className={`adaire-saas-hero__heading ${a.useGradientHeadline ? 'has-gradient' : ''}`}
              value={a.heading}
            />

            <RichText.Content tagName="p" className="adaire-saas-hero__text" value={a.text} />

            <div className="adaire-saas-hero__cta">
              {a.ctaType === 'dual-buttons' && (
                <>
                  <a href={a.primaryButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                    {a.primaryButtonText}
                  </a>
                  <a href={a.secondaryButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--secondary">
                    {a.secondaryButtonText}
                  </a>
                </>
              )}

              {a.ctaType === 'email-form' && (
                <form className="adaire-saas-hero__email-form" onSubmit="return false">
                  <input type="email" placeholder={a.emailPlaceholder || 'Enter your email'} required />
                  <button type="submit">{a.submitButtonText || 'Get Started'}</button>
                </form>
              )}

              {a.ctaType === 'single-button' && (
                <>
                  <a href={a.singleButtonUrl || '#'} className="adaire-saas-hero__button adaire-saas-hero__button--primary">
                    {a.singleButtonText}
                  </a>
                  {a.microCopy && <p className="adaire-saas-hero__micro-copy">{a.microCopy}</p>}
                </>
              )}
            </div>
          </div>

          {a.showHeroImage && a.heroImageUrl && (
            <div className={`adaire-saas-hero__media adaire-saas-hero__media--${a.imagePosition || 'below'}`}>
              <img src={a.heroImageUrl} alt="Hero" loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
