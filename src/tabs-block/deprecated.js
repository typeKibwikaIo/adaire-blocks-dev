/**
 * Tabbed Content (tabs-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added full
 *     typography controls (line-height, letter-spacing, text-transform) for
 *     the tab title labels, plus a block-level Font Family control —
 *     unconditionally, for every instance, regardless of whether the user
 *     ever opens the new controls. Posts saved before that change don't have
 *     those custom properties in their stored markup, so re-running the
 *     *current* save() against them would produce a style attribute with
 *     extra declarations that don't match what's stored, and Gutenberg would
 *     flag them as invalid content. No attribute schema changed shape (the
 *     new attributes are purely additive with safe defaults that reproduce
 *     the original hardcoded SCSS values — including the pre-existing
 *     hardcoded `letter-spacing: -0.01em`), so `migrate` is a no-op identity
 *     function and this entry doesn't need its own `attributes` key
 *     (Gutenberg falls back to the current block.json attributes when
 *     parsing a deprecated entry that omits one).
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
        const {
            blockId,
            tabs,
            activeTab,
            tabTitleColor,
            tabTitleActiveColor,
            tabUnderlineColor,
            tabTitleFontSize,
            tabTitleFontWeight,
            tabTitleActiveFontWeight,
            tabGap,
            underlineHeight,
            contentPaddingTop,
            contentPaddingRight,
            contentPaddingBottom,
            contentPaddingLeft,
            tabsAlign,
            animationDuration,
            animationEase,
            containerMode,
            containerMaxWidth,
            marginTop,
            marginRight,
            marginBottom,
            marginLeft,
            tabLayout,
            tabPosition,
            verticalActiveBgColor,
        } = attributes;

        // Helper function to ensure we have a valid color with opacity
        const getBackgroundColor = (color) => {
            if (!color) return 'rgba(59, 130, 246, 0.05)';
            return color;
        };

        const blockProps = useBlockProps.save({
            className: 'adaire-tabs',
            'data-block-id': blockId,
            'data-animation-duration': animationDuration,
            'data-animation-ease': animationEase,
            'data-active-tab': activeTab,
            'data-tab-layout': tabLayout,
            style: {
                '--tab-title-color': tabTitleColor,
                '--tab-title-active-color': tabTitleActiveColor,
                '--tab-underline-color': tabUnderlineColor,
                '--tab-title-size': `${tabTitleFontSize}px`,
                '--tab-title-weight': tabTitleFontWeight,
                '--tab-title-active-weight': tabTitleActiveFontWeight,
                '--tab-gap': `${tabGap}px`,
                '--underline-height': `${underlineHeight}px`,
                '--content-padding-top': `${contentPaddingTop}px`,
                '--content-padding-right': `${contentPaddingRight}px`,
                '--content-padding-bottom': `${contentPaddingBottom}px`,
                '--content-padding-left': `${contentPaddingLeft}px`,
                '--tabs-align': tabsAlign,
                '--container-max-width': `${containerMaxWidth?.desktop?.value ?? containerMaxWidth?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? containerMaxWidth?.unit ?? 'px'}`,
                '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
                '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
                '--tab-layout': tabLayout,
                '--tab-position': tabPosition,
                '--vertical-active-bg-color': getBackgroundColor(verticalActiveBgColor),
            },
        });

        return (
            <div {...blockProps} data-tab-layout={tabLayout} data-tab-position={tabPosition}>
                <div
                    className={`adaire-tabs__container ${containerMode === 'constrained' ? 'is-constrained' : ''} ${tabLayout === 'vertical' ? 'is-vertical' : ''} ${tabPosition === 'bottom' ? 'is-bottom' : ''} ${tabPosition === 'right' ? 'is-right' : ''}`}
                    style={{
                        marginTop: `${marginTop}px`,
                        marginRight: `${marginRight}px`,
                        marginBottom: `${marginBottom}px`,
                        marginLeft: `${marginLeft}px`,
                    }}
                >
                    <div className="adaire-tabs__header">
                        <div className="adaire-tabs__list" role="tablist">
                            {(tabs || []).map((tab, index) => (
                                <button
                                    key={tab.id}
                                    className={`adaire-tabs__tab ${activeTab === index ? 'is-active' : ''}`}
                                    data-tab-index={index}
                                    role="tab"
                                    aria-selected={activeTab === index}
                                    aria-controls={`${blockId}-panel-${index}`}
                                    id={`${blockId}-tab-${index}`}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                        <div className="adaire-tabs__underline" />
                    </div>

                    <div className="adaire-tabs__content-wrapper">
                        <div className="adaire-tabs__panels">
                            <InnerBlocks.Content />
                        </div>
                    </div>
                </div>
            </div>
        );
    },
};

export default [deprecatedV1];
