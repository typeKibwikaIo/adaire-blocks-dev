import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
  const blockProps = useBlockProps.save({ className: 'adaire-live-streamer', style: {
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
  return (<section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'} data-auto-refresh={a.autoRefresh}><div className="adaire-live-streamer__header"><span className="adaire-live-streamer__badge">{a.isLive ? 'LIVE' : 'OFFLINE'}</span><RichText.Content tagName="h2" className="adaire-live-streamer__heading" value={a.heading} /><RichText.Content tagName="p" className="adaire-live-streamer__text" value={a.text} /></div><div className="adaire-live-streamer__layout"><div className="adaire-live-streamer__player" style={{ aspectRatio: a.aspectRatio }}>{a.streamUrl ? <iframe src={a.streamUrl} title={a.heading || 'Live stream'} allow="autoplay; fullscreen; picture-in-picture" loading="lazy" allowFullScreen /> : <p>{a.offlineMessage}</p>}</div>{a.showChat && a.chatEmbedUrl && <iframe className="adaire-live-streamer__chat" src={a.chatEmbedUrl} title="Live chat" loading="lazy" />}</div><p>{a.viewerCount}</p>{a.vodUrl && <a className="adaire-live-streamer__button" href={a.vodUrl}>Replay / VOD</a>}</section>);
}
