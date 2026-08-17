import { __ } from '@wordpress/i18n';
import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes: a }) {
    const hasPdf = !!a.pdfUrl;

    const blockProps = useBlockProps.save({
        className: `adaire-pdf-reader${a.shadow ? ' has-shadow' : ''}`,
        style: {
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
            '--ad-frame-border': a.frameBorderColor || '#e5e7eb',
            '--ad-radius': (a.borderRadius || 18) + 'px',
        },
    });

    return (
        <section {...blockProps} data-hover={a.buttonHoverEffect || 'lift'}>
            <RichText.Content tagName="p" className="adaire-pdf-reader__eyebrow" value={a.eyebrow} />
            <RichText.Content tagName="h2" className="adaire-pdf-reader__heading" value={a.heading} />
            <RichText.Content tagName="p" className="adaire-pdf-reader__text" value={a.text} />

            {hasPdf ? (
                <>
                    <iframe
                        className="adaire-pdf-reader__viewer"
                        src={a.pdfUrl}
                        title={a.fileName || 'PDF document'}
                        loading="lazy"
                        style={{ minHeight: (a.viewerHeight || 640) + 'px' }}
                    />
                    {(a.fileName || a.fileSize || a.pageCount) && (
                        <p className="adaire-pdf-reader__meta">
                            {[a.fileName, a.fileSize, a.pageCount ? a.pageCount + ' pages' : ''].filter(Boolean).join(' · ')}
                        </p>
                    )}
                    {a.passwordHint && (
                        <p className="adaire-pdf-reader__meta">{__('Password:', 'adaire-blocks')} {a.passwordHint}</p>
                    )}
                    <div className="adaire-pdf-reader__actions">
                        {a.showDownload && (
                            <a className="adaire-pdf-reader__button" href={a.pdfUrl} download>
                                {a.showIcon ? '↓ ' : ''}
                                <RichText.Content tagName="span" value={a.buttonText} />
                            </a>
                        )}
                        {a.showOpen && (
                            <a className="adaire-pdf-reader__button is-secondary" href={a.buttonUrl && a.buttonUrl !== '#' ? a.buttonUrl : a.pdfUrl} target="_blank" rel="noreferrer">
                                {a.showIcon ? '↗ ' : ''}{__('Open', 'adaire-blocks')}
                            </a>
                        )}
                    </div>
                </>
            ) : (
                <p className="adaire-pdf-reader__fallback">{a.fallbackMessage}</p>
            )}
        </section>
    );
}
