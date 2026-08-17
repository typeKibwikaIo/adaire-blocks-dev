import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        blockId,
        iconSvg,
        iconName,
        chosenIcon,
        responsiveIconSize,
        iconColor,
        iconView,
        iconShape,
        iconFrameColor,
        backgroundColor,
        backgroundHoverColor,
        textColor,
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
        title,
        description,
        showButton,
        buttonText,
        buttonBgColor,
        buttonTextColor,
    } = attributes;

    const pt = paddingTop?.desktop ?? 40;
    const pr = paddingRight?.desktop ?? 40;
    const pb = paddingBottom?.desktop ?? 40;
    const pl = paddingLeft?.desktop ?? 40;

    const iconSizeDesktop = responsiveIconSize?.desktop ?? 64;
    const iconSizeTablet  = responsiveIconSize?.tablet  ?? iconSizeDesktop;
    const iconSizeMobile  = responsiveIconSize?.mobile  ?? iconSizeTablet;

    const blockProps = useBlockProps.save({
        className: `adaire-icon-box adaire-icon-box--align-${alignment}`,
        id: blockId || undefined,
        style: {
            '--icon-card-bg'      : backgroundColor || '#503AA8',
            '--icon-card-bg-hover': backgroundHoverColor || '#3d2c8d',
            '--icon-card-radius'  : `${borderRadius ?? 16}px`,
            '--icon-card-pt'      : `${paddingTop?.desktop  ?? 40}px`,
            '--icon-card-pr'      : `${paddingRight?.desktop ?? 40}px`,
            '--icon-card-pb'      : `${paddingBottom?.desktop ?? 40}px`,
            '--icon-card-pl'      : `${paddingLeft?.desktop  ?? 40}px`,
            '--icon-card-pt-t'    : `${paddingTop?.tablet  ?? pt}px`,
            '--icon-card-pr-t'    : `${paddingRight?.tablet ?? pr}px`,
            '--icon-card-pb-t'    : `${paddingBottom?.tablet ?? pb}px`,
            '--icon-card-pl-t'    : `${paddingLeft?.tablet  ?? pl}px`,
            '--icon-card-pt-m'    : `${paddingTop?.mobile  ?? paddingTop?.tablet  ?? pt}px`,
            '--icon-card-pr-m'    : `${paddingRight?.mobile ?? paddingRight?.tablet ?? pr}px`,
            '--icon-card-pb-m'    : `${paddingBottom?.mobile ?? paddingBottom?.tablet ?? pb}px`,
            '--icon-card-pl-m'    : `${paddingLeft?.mobile  ?? paddingLeft?.tablet  ?? pl}px`,
            '--icon-color'        : iconColor || '#ffffff',
            '--icon-size'         : `${iconSizeDesktop}px`,
            '--icon-size-t'       : `${iconSizeTablet}px`,
            '--icon-size-m'       : `${iconSizeMobile}px`,
            '--icon-frame-color'  : iconFrameColor || '#503AA8',
            '--icon-border-width' : `${borderWidth ?? 0}px`,
            '--icon-border-color' : borderColor || 'transparent',
            color                 : textColor || '#ffffff',
            marginTop             : `${marginTop?.desktop ?? 0}px`,
            marginRight           : `${marginRight?.desktop ?? 0}px`,
            marginBottom          : `${marginBottom?.desktop ?? 0}px`,
            marginLeft            : `${marginLeft?.desktop ?? 0}px`,
        },
    });

    const hasIcon = (chosenIcon && chosenIcon.trim()) || (iconSvg && iconSvg.trim());

    return (
        <div {...blockProps}>
            {hasIcon && (
                <div className="adaire-icon-box__icon-area">
                    <div className={`adaire-icon-box__icon-frame is-view-${iconView || 'default'} is-shape-${iconShape || 'circle'}`}>
                        {chosenIcon && chosenIcon.trim() ? (
                            <i
                                className={`adaire-icon-box__icon ${chosenIcon}`}
                                aria-label={iconName || 'Icon'}
                            ></i>
                        ) : (
                            <span
                                className="adaire-icon-box__icon"
                                dangerouslySetInnerHTML={{ __html: iconSvg }}
                                aria-label={iconName || 'Icon'}
                            />
                        )}
                    </div>
                </div>
            )}

            {title && (
                <RichText.Content
                    tagName="h3"
                    className="adaire-icon-box__title"
                    value={title}
                />
            )}

            {description && (
                <RichText.Content
                    tagName="p"
                    className="adaire-icon-box__description"
                    value={description}
                />
            )}

            {showButton !== false && buttonText && (
                <a
                    className="adaire-icon-box__btn"
                    href={linkUrl || '#'}
                    target={linkTarget === '_blank' ? '_blank' : undefined}
                    rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    style={{
                        backgroundColor: buttonBgColor || '#ffffff',
                        color: buttonTextColor || '#503AA8',
                    }}
                >
                    {buttonText}
                </a>
            )}
        </div>
    );
}
