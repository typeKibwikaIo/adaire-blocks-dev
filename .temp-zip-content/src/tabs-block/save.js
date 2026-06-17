import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

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
                        {tabs.map((tab, index) => (
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
}



