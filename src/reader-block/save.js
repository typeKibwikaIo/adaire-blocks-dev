import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({ className: 'adaire-reader', style: {
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
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-columns={a.columns}>{(a.cards || []).map((card, i) => <article className="adaire-reader__card" key={i}>{card.imageUrl && <img src={card.imageUrl} alt="" loading="lazy" />}<div><span className="adaire-reader__badge">{card.category}</span><h3>{card.title}</h3><p>{card.excerpt}</p><small>{[card.author, card.date, card.readingTime].filter(Boolean).join(' · ')}</small><a className="adaire-reader__button" href={card.url || '#'}>{a.buttonText}</a></div></article>)}</section>);
}
