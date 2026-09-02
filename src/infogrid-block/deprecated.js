/**
 * Feature Grid (infogrid-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before the "Flexible Grid"
 *     layout option (ADAB-008) added a `--infogrid-items-per-row` custom
 *     property to the block's inline style — unconditionally, for every
 *     instance, regardless of which layoutStyle is selected. Posts saved
 *     before that change don't have that property in their stored markup,
 *     so re-running the *current* save() against them would produce a
 *     style attribute with an extra declaration that doesn't match what's
 *     stored, and Gutenberg would flag them as invalid content. No
 *     attribute schema changed shape (itemsPerRow is purely additive with
 *     a safe default), so `migrate` is a no-op identity function and this
 *     entry doesn't need its own `attributes` key (Gutenberg falls back to
 *     the current block.json attributes when parsing a deprecated entry
 *     that omits one).
 */
import { useBlockProps } from '@wordpress/block-editor';

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
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
            responsivePadding
        } = attributes;

        // `items` has an array default, but a block whose stored JSON carries an
        // explicit `"items": null` bypasses defaults entirely (null is a value,
        // not an absence) — and an unguarded .map() there throws inside save(),
        // which takes down the whole editor, not just this block. Falling back to
        // an empty list renders nothing instead. For well-formed content this is
        // a no-op, so saved markup is unchanged and no deprecation is needed.
        const safeItems = Array.isArray( items ) ? items : [];

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
                '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
                '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
                '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
                '--container-max-width-small-laptop': `${containerMaxWidth?.smallLaptop?.value ?? 1200}${containerMaxWidth?.smallLaptop?.unit ?? 'px'}`,
                '--container-max-width-big-desktop': `${containerMaxWidth?.bigDesktop?.value ?? 1200}${containerMaxWidth?.bigDesktop?.unit ?? 'px'}`,
                // Responsive padding
                '--infogrid-padding-top-mobile': responsivePadding?.mobile?.top || '40px',
                '--infogrid-padding-right-mobile': responsivePadding?.mobile?.right || '20px',
                '--infogrid-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '40px',
                '--infogrid-padding-left-mobile': responsivePadding?.mobile?.left || '20px',
                '--infogrid-padding-top-tablet': responsivePadding?.tablet?.top || '60px',
                '--infogrid-padding-right-tablet': responsivePadding?.tablet?.right || '40px',
                '--infogrid-padding-bottom-tablet': responsivePadding?.tablet?.bottom || '60px',
                '--infogrid-padding-left-tablet': responsivePadding?.tablet?.left || '40px',
                '--infogrid-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || '80px',
                '--infogrid-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || '60px',
                '--infogrid-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || '80px',
                '--infogrid-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || '60px',
                '--infogrid-padding-top-desktop': responsivePadding?.desktop?.top || '100px',
                '--infogrid-padding-right-desktop': responsivePadding?.desktop?.right || '80px',
                '--infogrid-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '100px',
                '--infogrid-padding-left-desktop': responsivePadding?.desktop?.left || '80px',
                '--infogrid-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || '100px',
                '--infogrid-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || '80px',
                '--infogrid-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || '100px',
                '--infogrid-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || '80px'
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
                                        {item.useIcon && item.iconClass ? (
                                            <span
                                                className="adaire-infogrid__item-title adaire-infogrid__item-title--icon"
                                                aria-label={item.title}
                                            >
                                                <i className={item.iconClass}></i>
                                            </span>
                                        ) : (
                                            <span className="adaire-infogrid__item-title">{item.title}</span>
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
    },
};

/**
 * v2  Frozen copy of the save() that shipped before this block became
 *     "Feature Grid (Pro)" and picked up the Padding/Margin fix. That version
 *     wrote each BoxControl side into its CSS custom property exactly as
 *     `__experimentalBoxControl` handed it back, and BoxControl can hand back
 *     a bare number ("60") instead of "60px". A unitless non-zero length is
 *     invalid CSS, so the browser dropped the whole `padding-*` declaration
 *     and the control read as doing nothing. The current save() runs every
 *     box through `normalizeBoxUnits()`, so a grid saved with an unnormalised
 *     value would no longer re-serialise to its stored markup. This entry
 *     reproduces the old output so those posts keep validating. The new
 *     `responsiveMargin` attribute defaults to `{}` and emits no custom
 *     properties until it is set, so untouched blocks are byte-identical
 *     either way.
 */

function saveV2( { attributes } ) {
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
        responsivePadding
    } = attributes;

    // `items` has an array default, but a block whose stored JSON carries an
    // explicit `"items": null` bypasses defaults entirely (null is a value,
    // not an absence) — and an unguarded .map() there throws inside save(),
    // which takes down the whole editor, not just this block. Falling back to
    // an empty list renders nothing instead. For well-formed content this is
    // a no-op, so saved markup is unchanged and no deprecation is needed.
    const safeItems = Array.isArray( items ) ? items : [];

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
            '--infogrid-padding-top-mobile': responsivePadding?.mobile?.top || '40px',
            '--infogrid-padding-right-mobile': responsivePadding?.mobile?.right || '20px',
            '--infogrid-padding-bottom-mobile': responsivePadding?.mobile?.bottom || '40px',
            '--infogrid-padding-left-mobile': responsivePadding?.mobile?.left || '20px',
            '--infogrid-padding-top-tablet': responsivePadding?.tablet?.top || '60px',
            '--infogrid-padding-right-tablet': responsivePadding?.tablet?.right || '40px',
            '--infogrid-padding-bottom-tablet': responsivePadding?.tablet?.bottom || '60px',
            '--infogrid-padding-left-tablet': responsivePadding?.tablet?.left || '40px',
            '--infogrid-padding-top-small-laptop': responsivePadding?.smallLaptop?.top || '80px',
            '--infogrid-padding-right-small-laptop': responsivePadding?.smallLaptop?.right || '60px',
            '--infogrid-padding-bottom-small-laptop': responsivePadding?.smallLaptop?.bottom || '80px',
            '--infogrid-padding-left-small-laptop': responsivePadding?.smallLaptop?.left || '60px',
            '--infogrid-padding-top-desktop': responsivePadding?.desktop?.top || '100px',
            '--infogrid-padding-right-desktop': responsivePadding?.desktop?.right || '80px',
            '--infogrid-padding-bottom-desktop': responsivePadding?.desktop?.bottom || '100px',
            '--infogrid-padding-left-desktop': responsivePadding?.desktop?.left || '80px',
            '--infogrid-padding-top-big-desktop': responsivePadding?.bigDesktop?.top || '100px',
            '--infogrid-padding-right-big-desktop': responsivePadding?.bigDesktop?.right || '80px',
            '--infogrid-padding-bottom-big-desktop': responsivePadding?.bigDesktop?.bottom || '100px',
            '--infogrid-padding-left-big-desktop': responsivePadding?.bigDesktop?.left || '80px'
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

const deprecatedV2 = {
    migrate( attributes ) {
        return attributes;
    },
    save: saveV2,
};

export default [ deprecatedV2, deprecatedV1 ];
