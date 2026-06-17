import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        positionType,
        displayType,
        layoutDirection,
        offsetFrom,
        offset,
        offsetUnit,
        horizontalOffsetFrom,
        horizontalOffset,
        horizontalOffsetUnit,
        iconEntries,
        iconSize,
        spacing,
        borderRadius,
        backgroundColor,
        backgroundBorderRadius,
        responsivePadding,
        hoverAnimation,
        animationDuration,
        animationEasing,
    } = attributes;

    // Don't render if no icon entries
    if (!iconEntries || iconEntries.length === 0) {
        return null;
    }

    const blockProps = useBlockProps.save({
        className: `adaire-social-banner adaire-social-banner--hover-${hoverAnimation || 'up'} adaire-social-banner--position-${positionType || 'fixed'} adaire-social-banner--display-${displayType || 'block'} adaire-social-banner--layout-${layoutDirection || 'column'}`,
        id: blockId || undefined,
        style: {
            '--banner-offset-from': offsetFrom,
            '--banner-offset': `${offset}${offsetUnit || 'px'}`,
            '--banner-horizontal-offset-from': horizontalOffsetFrom || 'left',
            '--banner-horizontal-offset': `${horizontalOffset || 0}${horizontalOffsetUnit || 'px'}`,
            '--icon-size': `${iconSize}px`,
            '--icon-spacing': `${spacing}px`,
            '--icon-border-radius': `${borderRadius}px`,
            '--animation-duration': `${animationDuration || 0.3}s`,
            '--animation-easing': animationEasing || 'ease',
            '--banner-background-color': (backgroundColor && backgroundColor.trim() !== '') ? backgroundColor : 'transparent',
            '--banner-background-border-radius': `${backgroundBorderRadius || 0}px`,
            '--banner-padding-top-mobile': responsivePadding?.mobile?.top || '0px',
            '--banner-padding-right-mobile': responsivePadding?.mobile?.right || '0px',
            '--banner-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '0px',
            '--banner-padding-left-mobile': responsivePadding?.mobile?.left || '0px',
            '--banner-padding-top-tablet': responsivePadding?.tablet?.top || responsivePadding?.mobile?.top || '0px',
            '--banner-padding-right-tablet': responsivePadding?.tablet?.right || responsivePadding?.mobile?.right || '0px',
            '--banner-padding-bottom-tablet': responsivePadding?.tablet?.bottom || responsivePadding?.mobile?.bottom || '0px',
            '--banner-padding-left-tablet': responsivePadding?.tablet?.left || responsivePadding?.mobile?.left || '0px',
            '--banner-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || responsivePadding?.desktop?.top || '0px',
            '--banner-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || responsivePadding?.desktop?.right || '0px',
            '--banner-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || responsivePadding?.desktop?.bottom || '0px',
            '--banner-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || responsivePadding?.desktop?.left || '0px',
            '--banner-padding-top-desktop': responsivePadding?.desktop?.top || '0px',
            '--banner-padding-right-desktop': responsivePadding?.desktop?.right || '0px',
            '--banner-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '0px',
            '--banner-padding-left-desktop': responsivePadding?.desktop?.left || '0px',
            '--banner-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || responsivePadding?.desktop?.top || '0px',
            '--banner-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || responsivePadding?.desktop?.right || '0px',
            '--banner-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || responsivePadding?.desktop?.bottom || '0px',
            '--banner-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || responsivePadding?.desktop?.left || '0px',
        },
    });

    return (
        <div {...blockProps}>
            <div className="adaire-social-banner__list">
                {iconEntries.map((entry, index) => {
                    if (!entry.icon || entry.icon.trim() === '') {
                        return null;
                    }

                    const IconWrapper = entry.linkUrl ? 'a' : 'div';
                    const linkProps = entry.linkUrl ? {
                        href: entry.linkUrl,
                        target: entry.linkTarget === '_blank' ? '_blank' : undefined,
                        rel: entry.linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
                    } : {};

                    return (
                        <IconWrapper
                            key={entry.id || index}
                            className="adaire-social-banner__item"
                            {...linkProps}
                            style={{
                                backgroundColor: entry.backgroundColor || '#000000',
                                borderRadius: `${borderRadius}px`,
                                '--icon-color': entry.iconColor || '#ffffff',
                            }}
                        >
                            <i
                                className={`adaire-social-banner__icon ${entry.icon}`}
                                style={{
                                    fontSize: `${iconSize}px`,
                                    color: entry.iconColor || '#ffffff',
                                }}
                                aria-label={entry.linkUrl ? `Social link ${index + 1}` : undefined}
                            ></i>
                        </IconWrapper>
                    );
                })}
            </div>
        </div>
    );
}



