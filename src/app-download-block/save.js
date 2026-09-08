import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const fontSize = a.responsiveFontSize || {};
  const blockProps = useBlockProps.save({ className: 'adaire-app-download', style: {
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
    '--ad-radius-desktop': (radius.desktop ?? 18) + 'px',
    '--ad-radius-tablet': (radius.tablet ?? radius.desktop ?? 18) + 'px',
    '--ad-radius-mobile': (radius.mobile ?? radius.tablet ?? radius.desktop ?? 18) + 'px',
    '--ad-padding-desktop': (padding.desktop ?? 28) + 'px',
    '--ad-padding-tablet': (padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-padding-mobile': (padding.mobile ?? padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-font-size-desktop': (fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-tablet': (fontSize.tablet ?? fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-mobile': (fontSize.mobile ?? fontSize.tablet ?? fontSize.desktop ?? 16) + 'px'
  } });
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}><div><RichText.Content tagName="p" className="adaire-app-download__eyebrow" value={a.eyebrow} /><RichText.Content tagName="h2" className="adaire-app-download__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-app-download__text" value={a.text} /><p className="adaire-app-download__proof">★ {a.rating} · {a.downloadCount} downloads</p><div className="adaire-app-download__actions">{a.platform !== 'android' && <a className="adaire-app-download__button" href={a.appStoreUrl}>App Store</a>}{a.platform !== 'ios' && <a className="adaire-app-download__button" href={a.googlePlayUrl}>Google Play</a>}</div></div>{a.screenshotUrl && <img className="adaire-app-download__image" src={a.screenshotUrl} alt="" loading="lazy" />}{a.qrUrl && <img className="adaire-app-download__qr" src={a.qrUrl} alt="QR code" loading="lazy" />}</section>);
}
