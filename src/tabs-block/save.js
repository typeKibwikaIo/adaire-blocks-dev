import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getDeviceValue } from '../components/DeviceSwitcher';

export default function save({ attributes }) {
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
        tabTitleLineHeight,
        tabTitleLetterSpacing,
        tabTitleTextTransform,
        fontFamily,
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
        tabStyle,
        pillStyle,
        pillBackgroundColor,
        pillActiveBackgroundColor,
        pillTextColor,
        pillActiveTextColor,
        pillBorderColor,
        pillActiveBorderColor,
        pillBorderRadius,
        pillPadding,
        contentBackgroundColor,
        contentBorderRadius,
        contentWidth,
        wrapperBackgroundColor,
        wrapperPadding,
    } = attributes;

    const isPills = tabStyle === 'pills';

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
        'data-tab-style': tabStyle,
        style: {
            '--tab-title-color': tabTitleColor,
            '--tab-title-active-color': tabTitleActiveColor,
            '--tab-underline-color': tabUnderlineColor,
            '--tab-title-size': `${tabTitleFontSize}px`,
            '--tab-title-weight': tabTitleFontWeight,
            '--tab-title-active-weight': tabTitleActiveFontWeight,
            '--tab-title-line-height': `${getDeviceValue(tabTitleLineHeight, 'desktop', 'normal')}`,
            '--tab-title-line-height-tablet': `${getDeviceValue(tabTitleLineHeight, 'tablet', 'normal')}`,
            '--tab-title-line-height-mobile': `${getDeviceValue(tabTitleLineHeight, 'mobile', 'normal')}`,
            '--tab-title-letter-spacing': `${getDeviceValue(tabTitleLetterSpacing, 'desktop', '-0.01em')}`,
            '--tab-title-letter-spacing-tablet': `${getDeviceValue(tabTitleLetterSpacing, 'tablet', '-0.01em')}`,
            '--tab-title-letter-spacing-mobile': `${getDeviceValue(tabTitleLetterSpacing, 'mobile', '-0.01em')}`,
            '--tab-title-text-transform': `${getDeviceValue(tabTitleTextTransform, 'desktop', 'none')}`,
            '--tab-title-text-transform-tablet': `${getDeviceValue(tabTitleTextTransform, 'tablet', 'none')}`,
            '--tab-title-text-transform-mobile': `${getDeviceValue(tabTitleTextTransform, 'mobile', 'none')}`,
            '--tabs-font-family': fontFamily || 'inherit',
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
            '--pill-bg': pillBackgroundColor,
            '--pill-active-bg': pillActiveBackgroundColor,
            '--pill-text': pillTextColor,
            '--pill-active-text': pillActiveTextColor,
            '--pill-border': pillBorderColor,
            '--pill-active-border': pillActiveBorderColor,
            '--pill-border-radius': `${pillBorderRadius ?? 24}px`,
            '--pill-padding-top': `${pillPadding?.top ?? 12}px`,
            '--pill-padding-right': `${pillPadding?.right ?? 24}px`,
            '--pill-padding-bottom': `${pillPadding?.bottom ?? 12}px`,
            '--pill-padding-left': `${pillPadding?.left ?? 24}px`,
            '--tabs-content-bg': contentBackgroundColor || 'transparent',
            '--tabs-content-border-radius': `${contentBorderRadius ?? 0}px`,
            '--tabs-content-width': `${contentWidth?.desktop?.value ?? 100}${contentWidth?.desktop?.unit ?? '%'}`,
            '--tabs-content-width-tablet': `${contentWidth?.tablet?.value ?? 100}${contentWidth?.tablet?.unit ?? '%'}`,
            '--tabs-content-width-mobile': `${contentWidth?.mobile?.value ?? 100}${contentWidth?.mobile?.unit ?? '%'}`,
            '--wrapper-bg': wrapperBackgroundColor || 'transparent',
            '--wrapper-padding-top': `${wrapperPadding?.desktop?.top ?? 0}px`,
            '--wrapper-padding-right': `${wrapperPadding?.desktop?.right ?? 0}px`,
            '--wrapper-padding-bottom': `${wrapperPadding?.desktop?.bottom ?? 0}px`,
            '--wrapper-padding-left': `${wrapperPadding?.desktop?.left ?? 0}px`,
            '--wrapper-padding-top-tablet': `${wrapperPadding?.tablet?.top ?? wrapperPadding?.desktop?.top ?? 0}px`,
            '--wrapper-padding-right-tablet': `${wrapperPadding?.tablet?.right ?? wrapperPadding?.desktop?.right ?? 0}px`,
            '--wrapper-padding-bottom-tablet': `${wrapperPadding?.tablet?.bottom ?? wrapperPadding?.desktop?.bottom ?? 0}px`,
            '--wrapper-padding-left-tablet': `${wrapperPadding?.tablet?.left ?? wrapperPadding?.desktop?.left ?? 0}px`,
            '--wrapper-padding-top-mobile': `${wrapperPadding?.mobile?.top ?? wrapperPadding?.tablet?.top ?? wrapperPadding?.desktop?.top ?? 0}px`,
            '--wrapper-padding-right-mobile': `${wrapperPadding?.mobile?.right ?? wrapperPadding?.tablet?.right ?? wrapperPadding?.desktop?.right ?? 0}px`,
            '--wrapper-padding-bottom-mobile': `${wrapperPadding?.mobile?.bottom ?? wrapperPadding?.tablet?.bottom ?? wrapperPadding?.desktop?.bottom ?? 0}px`,
            '--wrapper-padding-left-mobile': `${wrapperPadding?.mobile?.left ?? wrapperPadding?.tablet?.left ?? wrapperPadding?.desktop?.left ?? 0}px`,
        },
    });

    return (
        <div {...blockProps} data-tab-layout={tabLayout} data-tab-position={tabPosition} data-tab-style={tabStyle}>
            <div
                className={`adaire-tabs__container ${containerMode === 'constrained' ? 'is-constrained' : ''} ${tabLayout === 'vertical' ? 'is-vertical' : ''} ${tabPosition === 'bottom' ? 'is-bottom' : ''} ${tabPosition === 'right' ? 'is-right' : ''} ${isPills ? 'is-pills' : ''}`}
                style={{
                    marginTop: `${marginTop}px`,
                    marginRight: `${marginRight}px`,
                    marginBottom: `${marginBottom}px`,
                    marginLeft: `${marginLeft}px`,
                }}
            >
                <div className={`adaire-tabs__header ${isPills ? 'is-pills' : ''}`}>
                    <div className={`adaire-tabs__list ${isPills ? `adaire-tabs__list--pills adaire-tabs__list--pill-${pillStyle}` : ''}`} role="tablist">
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
                    {!isPills && <div className="adaire-tabs__underline" />}
                </div>

                <div className="adaire-tabs__content-wrapper">
                    <div className="adaire-tabs__panels">
                        <InnerBlocks.Content />
                    </div>
                </div>
            </div>
        </div>
    );
}
