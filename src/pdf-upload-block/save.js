import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const fontSize = a.responsiveFontSize || {};
  const blockProps = useBlockProps.save({ className: 'adaire-pdf-upload', style: {
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
    '--ad-radius-desktop': (radius.desktop ?? a.borderRadius ?? 18) + 'px',
    '--ad-radius-tablet': (radius.tablet ?? radius.desktop ?? a.borderRadius ?? 18) + 'px',
    '--ad-radius-mobile': (radius.mobile ?? radius.tablet ?? radius.desktop ?? a.borderRadius ?? 18) + 'px',
    '--ad-padding-desktop': (padding.desktop ?? 28) + 'px',
    '--ad-padding-tablet': (padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-padding-mobile': (padding.mobile ?? padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-font-size-desktop': (fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-tablet': (fontSize.tablet ?? fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-mobile': (fontSize.mobile ?? fontSize.tablet ?? fontSize.desktop ?? 16) + 'px'
  } });
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-fallback={a.fallbackMessage}><div className="adaire-pdf-upload__copy"><RichText.Content tagName="p" className="adaire-pdf-upload__eyebrow" value={a.eyebrow} /><RichText.Content tagName="h2" className="adaire-pdf-upload__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-pdf-upload__text" value={a.text} /><p className="adaire-pdf-upload__meta">{[a.fileName, a.fileSize, a.pageCount ? a.pageCount + ' pages' : ''].filter(Boolean).join(' · ')}</p></div>{a.pdfUrl && <iframe className="adaire-pdf-upload__viewer" src={a.pdfUrl} title={a.fileName || 'PDF viewer'} loading="lazy" style={{ minHeight: (a.viewerHeight || 640) + 'px' }} />}{a.showDownload && <a className="adaire-pdf-upload__button" href={a.pdfUrl || '#'} download>{a.showIcon ? '↓ ' : ''}<RichText.Content tagName="span" value={a.buttonText} /></a>}</section>);
}
