import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const fontSize = a.responsiveFontSize || {};
  const blockProps = useBlockProps.save({ className: 'adaire-promo-banner', style: {
    '--ad-accent': a.accentColor,
    '--ad-bg': a.backgroundType === 'gradient' ? a.backgroundGradient : a.backgroundColor,
    '--ad-color': a.textColor,
    '--ad-bg-image': a.backgroundType === 'image' && a.backgroundImage ? `url(${a.backgroundImage})` : 'none',
    '--ad-button-color': a.buttonColor || a.accentColor,
    '--ad-button-width': a.buttonWidth || 'auto',
    '--ad-button-height': a.buttonHeight || 'auto',
    '--ad-button-hover-color': a.buttonHoverColor || '#ffffff',
    '--ad-button-hover-bg': a.buttonHoverBackgroundColor || '#111827',
    '--ad-button-hover-border': a.buttonHoverBorderColor || '#111827',
    '--ad-radius-desktop': (radius.desktop ?? a.buttonRadius ?? 18) + 'px',
    '--ad-radius-tablet': (radius.tablet ?? radius.desktop ?? a.buttonRadius ?? 18) + 'px',
    '--ad-radius-mobile': (radius.mobile ?? radius.tablet ?? radius.desktop ?? a.buttonRadius ?? 18) + 'px',
    '--ad-padding-desktop': (padding.desktop ?? a.padding ?? 28) + 'px',
    '--ad-padding-tablet': (padding.tablet ?? padding.desktop ?? a.padding ?? 28) + 'px',
    '--ad-padding-mobile': (padding.mobile ?? padding.tablet ?? padding.desktop ?? a.padding ?? 28) + 'px',
    '--ad-font-size-desktop': (fontSize.desktop ?? a.fontSize ?? 16) + 'px',
    '--ad-font-size-tablet': (fontSize.tablet ?? fontSize.desktop ?? a.fontSize ?? 16) + 'px',
    '--ad-font-size-mobile': (fontSize.mobile ?? fontSize.tablet ?? fontSize.desktop ?? a.fontSize ?? 16) + 'px'
  } });
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-expiry={a.expiryDate} data-position={a.position} data-sticky={a.sticky} data-animation={a.animationType}><div><RichText.Content tagName="strong" className="adaire-promo-banner__eyebrow" value={a.eyebrow} /><RichText.Content tagName="span" className="adaire-promo-banner__heading" value={a.heading} /><RichText.Content tagName="span" className="adaire-promo-banner__text" value={a.text} /></div>{a.countdown && <span className="adaire-promo-banner__countdown" data-countdown></span>}<a className="adaire-promo-banner__button" href={a.buttonUrl || '#'}><RichText.Content tagName="span" value={a.buttonText} /></a>{a.dismissible && <button className="adaire-promo-banner__close" type="button" aria-label="Dismiss">×</button>}</section>);
}
