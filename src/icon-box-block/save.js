import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        iconSvg,
        iconName,
        chosenIcon,
        iconSize,
        iconColor,
        iconHoverColor,
        backgroundColor,
        backgroundHoverColor,
        padding,
        borderRadius,
        borderWidth,
        borderColor,
        alignment,
        linkUrl,
        linkTarget,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
    } = attributes;

    // Don't render if neither icon type is set
    if ((!chosenIcon || chosenIcon.trim() === '') && (!iconSvg || iconSvg.trim() === '')) {
        return null;
    }

    const blockProps = useBlockProps.save({
        className: `adaire-icon-box adaire-icon-box--align-${alignment}`,
        id: blockId || undefined,
        style: {
            outline: 'none',
            border: 'none',
            borderStyle: 'none',
            boxShadow: 'none',
            '--icon-size': `${iconSize}px`,
            '--icon-color': iconColor,
            '--icon-hover-color': iconHoverColor,
            '--icon-bg': backgroundColor,
            '--icon-bg-hover': backgroundHoverColor,
            '--icon-padding-top': `${paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
            '--icon-padding-right': `${paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
            '--icon-padding-bottom': `${paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
            '--icon-padding-left': `${paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
            '--icon-padding-top-tablet': `${paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
            '--icon-padding-right-tablet': `${paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
            '--icon-padding-bottom-tablet': `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
            '--icon-padding-left-tablet': `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
            '--icon-padding-top-mobile': `${paddingTop?.mobile ?? paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
            '--icon-padding-right-mobile': `${paddingRight?.mobile ?? paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
            '--icon-padding-bottom-mobile': `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
            '--icon-padding-left-mobile': `${paddingLeft?.mobile ?? paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
            '--icon-border-radius': `${borderRadius}px`,
            '--icon-border-width': `${borderWidth}px`,
            '--icon-border-color': borderColor,
            marginTop: `${marginTop?.desktop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? 0}px`,
        },
    });

    const IconWrapper = linkUrl ? 'a' : 'div';
    const linkProps = linkUrl ? {
        href: linkUrl,
        target: linkTarget === '_blank' ? '_blank' : undefined,
        rel: linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
    } : {};

    return (
        <div {...blockProps}>
            <IconWrapper
                    className="adaire-icon-box__wrapper"
                    {...linkProps}
                    style={{
                        '--icon-size': `${iconSize}px`,
                        '--icon-color': iconColor,
                        '--icon-hover-color': iconHoverColor,
                        '--icon-bg': backgroundColor,
                        '--icon-bg-hover': backgroundHoverColor,
                        '--icon-padding-top': `${paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
                        '--icon-padding-right': `${paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
                        '--icon-padding-bottom': `${paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
                        '--icon-padding-left': `${paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
                        '--icon-padding-top-tablet': `${paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
                        '--icon-padding-right-tablet': `${paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
                        '--icon-padding-bottom-tablet': `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
                        '--icon-padding-left-tablet': `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
                        '--icon-padding-top-mobile': `${paddingTop?.mobile ?? paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? padding?.top ?? 20}px`,
                        '--icon-padding-right-mobile': `${paddingRight?.mobile ?? paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? padding?.right ?? 20}px`,
                        '--icon-padding-bottom-mobile': `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? padding?.bottom ?? 20}px`,
                        '--icon-padding-left-mobile': `${paddingLeft?.mobile ?? paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? padding?.left ?? 20}px`,
                        '--icon-border-radius': `${borderRadius}px`,
                        '--icon-border-width': `${borderWidth}px`,
                        '--icon-border-color': borderColor,
                    }}
                >
                    {chosenIcon && chosenIcon.trim() ? (
                        <i
                            className={`adaire-icon-box__icon ${chosenIcon}`}
                            style={{
                                fontSize: `${iconSize}px`,
                                color: iconColor,
                                '--icon-hover-color': iconHoverColor,
                            }}
                            aria-label={iconName || 'Icon'}
                        ></i>
                    ) : iconSvg && iconSvg.trim() ? (
                        <span
                            className="adaire-icon-box__icon"
                            style={{
                                width: `${iconSize}px`,
                                height: `${iconSize}px`,
                                fontSize: `${iconSize}px`,
                                color: iconColor,
                                '--icon-hover-color': iconHoverColor,
                            }}
                            dangerouslySetInnerHTML={{ __html: iconSvg }}
                            aria-label={iconName || 'Icon'}
                        />
                    ) : null}
            </IconWrapper>
        </div>
    );
}



