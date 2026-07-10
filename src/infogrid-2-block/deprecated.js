/**
 * Advanced Feature Grid (infogrid-2-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010's Font Family
 *     control added a `--infogrid-2-font-family` custom property to every
 *     instance unconditionally. Purely additive attribute with a safe
 *     default ('' -> 'inherit' at render time, matching the block's previous
 *     unstyled behavior), so `migrate` is a no-op identity function and this
 *     entry doesn't need its own `attributes` key (Gutenberg falls back to
 *     the current block.json attributes when parsing a deprecated entry
 *     that omits one).
 */
import { useBlockProps, RichText } from '@wordpress/block-editor';

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
        const {
            blockId,
            items,
            backgroundImageUrl,
            overlayType,
            overlayColor,
            overlayOpacity,
            overlayGradient,
            showHeading,
            headingText,
            backgroundSize,
            backgroundPosition,
            backgroundRepeat,
            solidBgColor,
            containerMode = 'constrained',
            responsiveMaxWidth = {
                mobile: { value: 100, unit: "%" },
                tablet: { value: 100, unit: "%" },
                smallLaptop: { value: 1200, unit: "px" },
                desktop: { value: 1200, unit: "px" },
                bigDesktop: { value: 1200, unit: "px" }
            }
        } = attributes;

        const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
            if (typeof dimension === 'string') return dimension;
            const value = dimension?.value ?? fallbackValue;
            const unit = dimension?.unit ?? fallbackUnit;
            return `${value}${unit}`;
        };

        const generateVariables = () => {
            const vars = {
                '--infogrid-2-bg-color': solidBgColor || 'transparent',
                '--infogrid-2-bg-image': backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                '--infogrid-2-overlay-bg-solid': overlayColor || 'transparent',
                '--infogrid-2-overlay-opacity': overlayOpacity !== undefined ? overlayOpacity : 0.5,
                '--infogrid-2-overlay-bg-gradient': overlayGradient || 'none',
                '--infogrid-2-bg-size': backgroundSize || 'cover',
                '--infogrid-2-bg-position': backgroundPosition || 'center',
                '--infogrid-2-bg-repeat': backgroundRepeat || 'no-repeat',
                // Container max-width
                '--infogrid-2-container-max-width': formatDimensionValue(responsiveMaxWidth?.desktop, 1200, 'px'),
                '--infogrid-2-container-max-width-tablet': formatDimensionValue(responsiveMaxWidth?.tablet, 100, '%'),
                '--infogrid-2-container-max-width-mobile': formatDimensionValue(responsiveMaxWidth?.mobile, 100, '%'),
                '--infogrid-2-container-max-width-small-laptop': formatDimensionValue(responsiveMaxWidth?.smallLaptop, 1200, 'px'),
                '--infogrid-2-container-max-width-big-desktop': formatDimensionValue(responsiveMaxWidth?.bigDesktop, 1200, 'px'),
            };

            const devices = {
                mobile: 'mobile',
                tablet: 'tablet',
                smallLaptop: 'small-laptop',
                desktop: 'desktop',
                bigDesktop: 'big-desktop'
            };

            const getFlexAlignment = (align) => {
                if (align === 'left') return 'flex-start';
                if (align === 'right') return 'flex-end';
                return 'center';
            };

            const getMarginAlignment = (align) => {
                if (align === 'left') return { ml: '0', mr: 'auto' };
                if (align === 'right') return { ml: 'auto', mr: '0' };
                return { ml: 'auto', mr: 'auto' };
            };

            Object.keys(attributes).forEach(key => {
                if (key.startsWith('responsive') && typeof attributes[key] === 'object' && attributes[key] !== null) {
                    let baseKey = key.replace('responsive', 'infogrid-2').replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
                    // Avoid WordPress core selector `:where([style*=border-width])` which will apply default borders.
                    // Sanitize all border-related substrings to prevent WordPress from detecting them in inline styles.
                    baseKey = baseKey
                        .replace('border-width', 'bw')
                        .replace('borderWidth', 'bw')
                        .replace('border-style', 'bs')
                        .replace('borderStyle', 'bs')
                        .replace('border-color', 'bc')
                        .replace('borderColor', 'bc');

                    Object.entries(devices).forEach(([deviceAttr, deviceClass]) => {
                        const val = attributes[key][deviceAttr];
                        if (val !== undefined && val !== null) {
                            if (typeof val === 'object') {
                                // Handle BoxControl objects (padding, margin)
                                Object.entries(val).forEach(([side, sideVal]) => {
                                    if (sideVal !== undefined && sideVal !== null) {
                                        vars[`--${baseKey}-${side}-${deviceClass}`] = sideVal;
                                    }
                                });
                            } else {
                                vars[`--${baseKey}-${deviceClass}`] = val;

                                // Add alignment helpers
                                if (key === 'responsiveHeadingAlignment') {
                                    vars[`--infogrid-2-heading-alignment-flex-${deviceClass}`] = getFlexAlignment(val);
                                }
                                if (key === 'responsiveContentAlignment') {
                                    const margins = getMarginAlignment(val);
                                    vars[`--infogrid-2-content-ml-${deviceClass}`] = margins.ml;
                                    vars[`--infogrid-2-content-mr-${deviceClass}`] = margins.mr;
                                    vars[`--infogrid-2-content-alignment-flex-${deviceClass}`] = getFlexAlignment(val);
                                }
                            }
                        }
                    });
                }
            });

            return vars;
        };

        const blockProps = useBlockProps.save({
            className: `adaire-infogrid-2-container ${containerMode === 'constrained' ? 'is-constrained' : ''}`,
            id: blockId || undefined,
            style: generateVariables()
        });

        return (
            <div {...blockProps}>
                {overlayType !== 'none' && (
                    <div
                        className={`adaire-infogrid-2-overlay is-type-${overlayType}`}
                    />
                )}
                <div className="adaire-infogrid-2-wrapper">
                    {showHeading && (
                        <RichText.Content
                            tagName="h2"
                            className="adaire-infogrid-2-heading"
                            value={headingText}
                        />
                    )}
                    <div className="adaire-infogrid-2-content">
                        {(items || []).map((item) => (
                            <div key={item.id} className="adaire-infogrid-2-item">
                                {item.imageUrl ? (
                                    <div className="adaire-infogrid-2-item-icon">
                                        <img src={item.imageUrl} alt={item.title || ''} />
                                    </div>
                                ) : item.icon && (
                                    <div className="adaire-infogrid-2-item-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                )}
                                {item.showTitle !== false && (
                                    <RichText.Content
                                        tagName="h3"
                                        className="adaire-infogrid-2-item-title"
                                        value={item.title}
                                    />
                                )}
                                <RichText.Content
                                    tagName="p"
                                    className="adaire-infogrid-2-item-text"
                                    value={item.text}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    },
};

export default [deprecatedV1];
