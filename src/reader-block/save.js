import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const radius = a.responsiveBorderRadius || {};
  const padding = a.responsivePadding || {};
  const fontSize = a.responsiveFontSize || {};
  const blockProps = useBlockProps.save({ className: 'adaire-reader', style: {
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
    '--ad-radius-desktop': (radius.desktop ?? a.cardRadius ?? 18) + 'px',
    '--ad-radius-tablet': (radius.tablet ?? radius.desktop ?? a.cardRadius ?? 18) + 'px',
    '--ad-radius-mobile': (radius.mobile ?? radius.tablet ?? radius.desktop ?? a.cardRadius ?? 18) + 'px',
    '--ad-padding-desktop': (padding.desktop ?? 28) + 'px',
    '--ad-padding-tablet': (padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-padding-mobile': (padding.mobile ?? padding.tablet ?? padding.desktop ?? 28) + 'px',
    '--ad-font-size-desktop': (fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-tablet': (fontSize.tablet ?? fontSize.desktop ?? 16) + 'px',
    '--ad-font-size-mobile': (fontSize.mobile ?? fontSize.tablet ?? fontSize.desktop ?? 16) + 'px'
  } });
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-columns={a.columns}>{(a.cards || []).map((card, i) => <article className="adaire-reader__card" key={i}>{card.imageUrl && <img src={card.imageUrl} alt="" loading="lazy" />}<div><span className="adaire-reader__badge">{card.category}</span><h3>{card.title}</h3><p>{card.excerpt}</p><small>{[card.author, card.date, card.readingTime].filter(Boolean).join(' · ')}</small><a className="adaire-reader__button" href={card.url || '#'}>{a.buttonText}</a></div></article>)}</section>);
}
