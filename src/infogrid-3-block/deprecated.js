/**
 * Feature Grid Pro (infogrid-3-block) deprecations - most recent first.
 *
 * v1  Frozen copy of the save() that shipped before the Padding/Margin fix.
 *     That version wrote each BoxControl side into its CSS custom property
 *     exactly as `__experimentalBoxControl` handed it back - and BoxControl
 *     can hand back a bare number ("60") instead of "60px". A unitless
 *     non-zero length is invalid CSS, so the browser dropped the whole
 *     `padding-*` declaration and the control read as "does nothing". The
 *     current save() runs every box through `normalizeBoxUnits()` and skips
 *     empty sides, so a grid saved with an unnormalized value would no
 *     longer re-serialize to its stored markup and Gutenberg would flag it
 *     as invalid. This entry reproduces that old output so those posts keep
 *     validating. The new `responsiveMargin` attribute defaults to `{}` and
 *     therefore emits no custom properties until the user sets one, so
 *     untouched blocks are byte-identical either way; no attribute shape
 *     changed, so `migrate` is a no-op and this entry omits `attributes`
 *     (Gutenberg falls back to the current block.json).
 */
import { useBlockProps, RichText } from '@wordpress/block-editor';

function saveV1({ attributes }) {
    const {
        blockId,
        containerMode,
        mainHeading,
        mainDescription,
        cell1Title,
        cell1Content,
        cell2Title,
        cell2Content,
        cell3Title,
        cell3Content,
        sub1Title,
        sub1Content,
        sub2Title,
        sub2Content,
        sub3Title,
        sub3Content,
        showBackgroundImage,
        backgroundImageUrl,
        overlayType,
        overlayColor,
        overlayOpacity,
        overlayGradient,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
        responsiveMaxWidth
    } = attributes;

    const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
        if (typeof dimension === 'string') return dimension;
        const value = dimension?.value ?? fallbackValue;
        const unit = dimension?.unit ?? fallbackUnit;
        return `${value}${unit}`;
    };

    const generateVariables = () => {
        const vars = {
            '--infogrid-3-bg-image': showBackgroundImage && backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
            '--infogrid-3-overlay-bg-solid': overlayColor || 'rgba(31, 0, 87, 0.6)',
            '--infogrid-3-overlay-opacity': overlayOpacity !== undefined ? overlayOpacity : 0.6,
            '--infogrid-3-overlay-bg-gradient': overlayGradient || 'none',
            '--infogrid-3-bg-size': backgroundSize || 'cover',
            '--infogrid-3-bg-position': backgroundPosition || 'center',
            '--infogrid-3-bg-repeat': backgroundRepeat || 'no-repeat',
            '--infogrid-3-container-max-width': formatDimensionValue(responsiveMaxWidth?.desktop, 1200, 'px'),
            '--infogrid-3-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
            '--infogrid-3-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
            '--infogrid-3-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
            '--infogrid-3-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1200, 'px'),
        };

        const devices = {
            mobile: 'mobile',
            tablet: 'tablet',
            smallLaptop: 'small-laptop',
            desktop: 'desktop',
            bigDesktop: 'big-desktop'
        };

        Object.keys(attributes).forEach(key => {
            if (key.startsWith('responsive') && key !== 'responsiveMaxWidth' && typeof attributes[key] === 'object' && attributes[key] !== null) {
                const baseKey = key.replace('responsive', 'infogrid-3').replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

                Object.entries(devices).forEach(([deviceAttr, deviceClass]) => {
                    const val = attributes[key][deviceAttr];
                    if (val !== undefined && val !== null) {
                        if (typeof val === 'object' && !Array.isArray(val)) {
                            // Handle BoxControl objects (padding, etc.)
                            Object.entries(val).forEach(([side, sideVal]) => {
                                if (sideVal !== undefined && sideVal !== null) {
                                    vars[`--${baseKey}-${side}-${deviceClass}`] = sideVal;
                                }
                            });
                        } else {
                            vars[`--${baseKey}-${deviceClass}`] = val;
                        }
                    }
                });
            }
        });

        return vars;
    };

    const blockProps = useBlockProps.save({
        className: `adaire-infogrid-3-container ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
        id: blockId || undefined,
        style: generateVariables()
    });

    return (
        <div {...blockProps}>
            {overlayType !== 'none' && (
                <div className={`adaire-infogrid-3-overlay is-type-${overlayType}`} />
            )}
            <div className="adaire-infogrid-3-wrapper">
                <div className="adaire-infogrid-3__header">
                    <RichText.Content
                        tagName="h2"
                        className="adaire-infogrid-3__main-heading"
                        value={mainHeading}
                    />
                    <RichText.Content
                        tagName="p"
                        className="adaire-infogrid-3__main-description"
                        value={mainDescription}
                    />
                </div>

                <div className="adaire-infogrid-3__grid">
                    <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-1">
                        <RichText.Content
                            tagName="div"
                            className="adaire-infogrid-3__cell-label"
                            value={cell1Title}
                        />
                        <RichText.Content
                            tagName="div"
                            className="adaire-infogrid-3__cell-text"
                            value={cell1Content}
                        />
                    </div>
                    <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-2">
                        <RichText.Content
                            tagName="div"
                            className="adaire-infogrid-3__cell-label"
                            value={cell2Title}
                        />
                        <RichText.Content
                            tagName="div"
                            className="adaire-infogrid-3__cell-text"
                            value={cell2Content}
                        />
                    </div>
                    <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-3">
                        <RichText.Content
                            tagName="div"
                            className="adaire-infogrid-3__cell-label"
                            value={cell3Title}
                        />
                        <RichText.Content
                            tagName="div"
                            className="adaire-infogrid-3__cell-text"
                            value={cell3Content}
                        />
                    </div>
                    <div className="adaire-infogrid-3__cell adaire-infogrid-3__cell-4">
                        <div className="adaire-infogrid-3__sub-columns">
                            <div className="adaire-infogrid-3__sub-column adaire-infogrid-3__sub-column-1">
                                <RichText.Content
                                    tagName="div"
                                    className="adaire-infogrid-3__sub-label"
                                    value={sub1Title}
                                />
                                <RichText.Content
                                    tagName="div"
                                    className="adaire-infogrid-3__sub-text"
                                    value={sub1Content}
                                />
                            </div>
                            <div className="adaire-infogrid-3__sub-column adaire-infogrid-3__sub-column-2">
                                <RichText.Content
                                    tagName="div"
                                    className="adaire-infogrid-3__sub-label"
                                    value={sub2Title}
                                />
                                <RichText.Content
                                    tagName="div"
                                    className="adaire-infogrid-3__sub-text"
                                    value={sub2Content}
                                />
                            </div>
                            <div className="adaire-infogrid-3__sub-column adaire-infogrid-3__sub-column-3">
                                <RichText.Content
                                    tagName="div"
                                    className="adaire-infogrid-3__sub-label"
                                    value={sub3Title}
                                />
                                <RichText.Content
                                    tagName="div"
                                    className="adaire-infogrid-3__sub-text"
                                    value={sub3Content}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },
    save: saveV1,
};

export default [deprecatedV1];
