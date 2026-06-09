import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        buttonIcon,
        iconColor,
        iconSize,
        buttonBackgroundColor,
        buttonHoverBackgroundColor,
        buttonPadding,
        borderRadius,
        borderWidth,
        borderColor,
        alignment,
        enabledPlatforms,
        platformIcons,
        platformLabels,
        tooltipPosition,
    } = attributes;

    const blockProps = useBlockProps.save({
        className: `adaire-social-share adaire-social-share--align-${alignment} adaire-social-share--tooltip-${tooltipPosition}`,
        id: blockId || undefined,
        style: {
            '--share-icon-size': `${iconSize}px`,
            '--share-icon-color': iconColor,
            '--share-button-bg': buttonBackgroundColor,
            '--share-button-bg-hover': buttonHoverBackgroundColor,
            '--share-button-padding-top': buttonPadding?.top || '12px',
            '--share-button-padding-right': buttonPadding?.right || '12px',
            '--share-button-padding-bottom': buttonPadding?.bottom || '12px',
            '--share-button-padding-left': buttonPadding?.left || '12px',
            '--share-border-radius': `${borderRadius}px`,
            '--share-border-width': `${borderWidth}px`,
            '--share-border-color': borderColor,
        },
    });

    const PLATFORMS = [
        { key: 'facebook', defaultIcon: 'bi bi-facebook', defaultLabel: 'Facebook' },
        { key: 'x', defaultIcon: 'bi bi-twitter-x', defaultLabel: 'X (Twitter)' },
        { key: 'linkedin', defaultIcon: 'bi bi-linkedin', defaultLabel: 'LinkedIn' },
        { key: 'whatsapp', defaultIcon: 'bi bi-whatsapp', defaultLabel: 'WhatsApp' },
        { key: 'telegram', defaultIcon: 'bi bi-telegram', defaultLabel: 'Telegram' },
        { key: 'reddit', defaultIcon: 'bi bi-reddit', defaultLabel: 'Reddit' },
        { key: 'pinterest', defaultIcon: 'bi bi-pinterest', defaultLabel: 'Pinterest' },
        { key: 'email', defaultIcon: 'bi bi-envelope', defaultLabel: 'Email' },
    ];

    return (
        <div {...blockProps}>
            <button
                className="adaire-social-share__button"
                type="button"
                aria-label="Share"
                aria-expanded="false"
            >
                <i className={buttonIcon || 'bi bi-share'}></i>
            </button>
            <div className="adaire-social-share__tooltip">
                <div className="adaire-social-share__platforms">
                    {PLATFORMS.map((platform) => {
                        if (!enabledPlatforms[platform.key]) return null;
                        return (
                            <a
                                key={platform.key}
                                href="#"
                                className="adaire-social-share__platform"
                                data-platform={platform.key}
                                aria-label={platformLabels[platform.key] || platform.defaultLabel}
                            >
                                <i className={platformIcons[platform.key] || platform.defaultIcon}></i>
                                <span>{platformLabels[platform.key] || platform.defaultLabel}</span>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}




