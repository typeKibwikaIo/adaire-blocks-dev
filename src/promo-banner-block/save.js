import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({ className: 'adaire-promo-banner', style: {
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
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-expiry={a.expiryDate} data-position={a.position} data-sticky={a.sticky} data-animation={a.animationType}><div><RichText.Content tagName="strong" className="adaire-promo-banner__eyebrow" value={a.eyebrow} /><RichText.Content tagName="span" className="adaire-promo-banner__heading" value={a.heading} /><RichText.Content tagName="span" className="adaire-promo-banner__text" value={a.text} /></div>{a.countdown && <span className="adaire-promo-banner__countdown" data-countdown></span>}<a className="adaire-promo-banner__button" href={a.buttonUrl || '#'}><RichText.Content tagName="span" value={a.buttonText} /></a>{a.dismissible && <button className="adaire-promo-banner__close" type="button" aria-label="Dismiss">×</button>}</section>);
}
