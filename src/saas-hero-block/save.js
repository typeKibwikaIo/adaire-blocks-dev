import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({ className: 'adaire-saas-hero', style: {
    '--ad-accent': a.accentColor,
    '--ad-bg': a.backgroundType === 'gradient' ? (a.backgroundGradient || a.gradient) : a.backgroundColor,
    '--ad-color': a.textColor,
    '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
    '--ad-button-color': a.buttonColor || a.accentColor,
    '--ad-button-width': a.buttonWidth || 'auto',
    '--ad-button-height': a.buttonHeight || 'auto',
    '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
    '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
    '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
    '--ad-radius': (a.borderRadius || a.cardRadius || a.buttonRadius || 18) + 'px',
    '--ad-padding': (a.padding || a.formPadding || 28) + 'px',
    '--ad-font-size': (a.fontSize || 16) + 'px'
  } });
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-align={a.alignment}><div><RichText.Content tagName="p" className="adaire-saas-hero__eyebrow" value={a.announcementText || a.eyebrow} /><RichText.Content tagName="h2" className="adaire-saas-hero__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-saas-hero__text" value={a.text} /><div className="adaire-saas-hero__actions"><a className="adaire-saas-hero__button" href={a.buttonUrl || '#'}><RichText.Content tagName="span" value={a.buttonText} /></a>{a.secondaryButtonText && <a className="adaire-saas-hero__button is-secondary" href={a.secondaryButtonUrl || '#'}>{a.secondaryButtonText}</a>}</div><p className="adaire-saas-hero__proof">{a.socialProof}</p></div>{a.heroImageUrl && <img className="adaire-saas-hero__image" src={a.heroImageUrl} alt="" loading="lazy" />}{a.showScrollArrow && <span className="adaire-saas-hero__arrow">↓</span>}</section>);
}
