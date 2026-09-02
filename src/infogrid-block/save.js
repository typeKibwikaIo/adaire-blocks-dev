import { useBlockProps } from '@wordpress/block-editor';
import { normalizeBoxUnits } from '../components/spacing-utils';

export default function save({ attributes }) {
    const {
        blockId,
        items,
        backgroundColor,
        titleColor,
        taglineColor,
        descriptionColor,
        hoverBackgroundColor,
        hoverTitleColor,
        hoverTaglineColor,
        hoverDescriptionColor,
        iconColor,
        hoverIconColor,
        iconSize,
        borderColor,
        containerBackgroundColor,
        titleFontSize,
        taglineFontSize,
        descriptionFontSize,
        itemPadding,
        gap,
        containerMode,
        containerMaxWidth,
        layoutStyle,
        itemsPerRow,
        responsivePadding,
        responsiveMargin
    } = attributes;

    // `items` has an array default, but a block whose stored JSON carries an
    // explicit `"items": null` bypasses defaults entirely (null is a value,
    // not an absence) — and an unguarded .map() there throws inside save(),
    // which takes down the whole editor, not just this block. Falling back to
    // an empty list renders nothing instead. For well-formed content this is
    // a no-op, so saved markup is unchanged and no deprecation is needed.
    const safeItems = Array.isArray( items ) ? items : [];


    // BoxControl can hand back a bare number ("60"); a unitless non-zero
    // length is invalid CSS, so the browser drops the whole declaration --
    // which is why these controls read as doing nothing. normalizeBoxUnits()
    // supplies the unit, and reading through it here also self-heals any
    // block already saved with an unnormalised value.
    const padBox = ( device ) => normalizeBoxUnits( responsivePadding?.[ device ] || {} );
    const marBox = ( device ) => normalizeBoxUnits( responsiveMargin?.[ device ] || {} );

    const pad = {
        mobile: padBox( 'mobile' ),
        tablet: padBox( 'tablet' ),
        smallLaptop: padBox( 'smallLaptop' ),
        desktop: padBox( 'desktop' ),
        bigDesktop: padBox( 'bigDesktop' ),
    };

    // Margin emits no custom property until the user sets one, so a block that
    // never touched it keeps byte-identical saved markup.
    const mar = {
        mobile: marBox( 'mobile' ),
        tablet: marBox( 'tablet' ),
        smallLaptop: marBox( 'smallLaptop' ),
        desktop: marBox( 'desktop' ),
        bigDesktop: marBox( 'bigDesktop' ),
    };

    const blockProps = useBlockProps.save({
        className: `adaire-infogrid adaire-infogrid--layout-${layoutStyle || 'default'}`,
        'data-block-id': blockId,
        style: {
            '--infogrid-bg': backgroundColor,
            '--infogrid-title-color': titleColor,
            '--infogrid-tagline-color': taglineColor,
            '--infogrid-description-color': descriptionColor,
            '--infogrid-hover-bg': hoverBackgroundColor,
            '--infogrid-hover-title-color': hoverTitleColor,
            '--infogrid-hover-tagline-color': hoverTaglineColor,
            '--infogrid-hover-description-color': hoverDescriptionColor,
            '--infogrid-icon-color': iconColor,
            '--infogrid-hover-icon-color': hoverIconColor,
            '--infogrid-icon-size': `${iconSize}px`,
            '--infogrid-border-color': borderColor,
            '--infogrid-container-bg': containerBackgroundColor,
            '--infogrid-title-font-size': `${titleFontSize}px`,
            '--infogrid-tagline-font-size': `${taglineFontSize}px`,
            '--infogrid-description-font-size': `${descriptionFontSize}px`,
            '--infogrid-item-padding': `${itemPadding}px`,
            '--infogrid-gap': `${gap}px`,
            '--infogrid-items-per-row': itemsPerRow || 3,
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-small-laptop': `${containerMaxWidth?.smallLaptop?.value ?? 1200}${containerMaxWidth?.smallLaptop?.unit ?? 'px'}`,
            '--container-max-width-big-desktop': `${containerMaxWidth?.bigDesktop?.value ?? 1200}${containerMaxWidth?.bigDesktop?.unit ?? 'px'}`,
            // Responsive padding
            '--infogrid-padding-top-mobile': pad.mobile.top || '40px',
            '--infogrid-padding-right-mobile': pad.mobile.right || '20px',
            '--infogrid-padding-bottom-mobile': pad.mobile.bottom || '40px',
            '--infogrid-padding-left-mobile': pad.mobile.left || '20px',
            '--infogrid-padding-top-tablet': pad.tablet.top || '60px',
            '--infogrid-padding-right-tablet': pad.tablet.right || '40px',
            '--infogrid-padding-bottom-tablet': pad.tablet.bottom || '60px',
            '--infogrid-padding-left-tablet': pad.tablet.left || '40px',
            '--infogrid-padding-top-small-laptop': pad.smallLaptop.top || '80px',
            '--infogrid-padding-right-small-laptop': pad.smallLaptop.right || '60px',
            '--infogrid-padding-bottom-small-laptop': pad.smallLaptop.bottom || '80px',
            '--infogrid-padding-left-small-laptop': pad.smallLaptop.left || '60px',
            '--infogrid-padding-top-desktop': pad.desktop.top || '100px',
            '--infogrid-padding-right-desktop': pad.desktop.right || '80px',
            '--infogrid-padding-bottom-desktop': pad.desktop.bottom || '100px',
            '--infogrid-padding-left-desktop': pad.desktop.left || '80px',
            '--infogrid-padding-top-big-desktop': pad.bigDesktop.top || '100px',
            '--infogrid-padding-right-big-desktop': pad.bigDesktop.right || '80px',
            '--infogrid-padding-bottom-big-desktop': pad.bigDesktop.bottom || '100px',
            '--infogrid-padding-left-big-desktop': pad.bigDesktop.left || '80px',
            '--infogrid-margin-top-mobile': mar.mobile.top || undefined,
            '--infogrid-margin-right-mobile': mar.mobile.right || undefined,
            '--infogrid-margin-bottom-mobile': mar.mobile.bottom || undefined,
            '--infogrid-margin-left-mobile': mar.mobile.left || undefined,
            '--infogrid-margin-top-tablet': mar.tablet.top || undefined,
            '--infogrid-margin-right-tablet': mar.tablet.right || undefined,
            '--infogrid-margin-bottom-tablet': mar.tablet.bottom || undefined,
            '--infogrid-margin-left-tablet': mar.tablet.left || undefined,
            '--infogrid-margin-top-small-laptop': mar.smallLaptop.top || undefined,
            '--infogrid-margin-right-small-laptop': mar.smallLaptop.right || undefined,
            '--infogrid-margin-bottom-small-laptop': mar.smallLaptop.bottom || undefined,
            '--infogrid-margin-left-small-laptop': mar.smallLaptop.left || undefined,
            '--infogrid-margin-top-desktop': mar.desktop.top || undefined,
            '--infogrid-margin-right-desktop': mar.desktop.right || undefined,
            '--infogrid-margin-bottom-desktop': mar.desktop.bottom || undefined,
            '--infogrid-margin-left-desktop': mar.desktop.left || undefined,
            '--infogrid-margin-top-big-desktop': mar.bigDesktop.top || undefined,
            '--infogrid-margin-right-big-desktop': mar.bigDesktop.right || undefined,
            '--infogrid-margin-bottom-big-desktop': mar.bigDesktop.bottom || undefined,
            '--infogrid-margin-left-big-desktop': mar.bigDesktop.left || undefined,
        }
    });

    return (
        <div {...blockProps}>
            <div className={`adaire-infogrid__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                <div className="adaire-infogrid__grid">
                    {safeItems.map((item, index) => (
                        <div 
                            key={item.id}
                            className={`adaire-infogrid__item adaire-infogrid__item--${index + 1}`}
                            data-item-id={item.id}
                        >
                            <div className="adaire-infogrid__item-content">
                                <div className="adaire-infogrid__item-header">
                                    {item.showTitle !== false && (
                                        item.useIcon && item.iconClass ? (
                                            <span
                                                className="adaire-infogrid__item-title adaire-infogrid__item-title--icon"
                                                aria-label={item.title}
                                            >
                                                <i className={item.iconClass}></i>
                                            </span>
                                        ) : (
                                            <span className="adaire-infogrid__item-title">{item.title}</span>
                                        )
                                    )}
                                    <button className="adaire-infogrid__item-toggle" aria-label="Toggle details">
                                        <span className="adaire-infogrid__item-icon">+</span>
                                    </button>
                                </div>
                                <h3 className="adaire-infogrid__item-tagline">{item.tagline}</h3>
                                <div className="adaire-infogrid__item-description-wrapper">
                                    <p className="adaire-infogrid__item-description">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}




