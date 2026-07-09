/**
 * Block transform: legacy Content Switcher (content-toggle-block) →
 * Tabbed Content (tabs-block) in pill mode.
 *
 * The Content Switcher block was merged into Tabbed Content. Existing
 * switcher blocks keep rendering (they stay registered, hidden from the
 * inserter); this transform gives editors a one-click upgrade path that
 * carries over labels, colors, spacing, and panel content.
 */
import { createBlock } from '@wordpress/blocks';

const toDeviceObject = (value) => ({
    desktop: value,
    tablet: value,
    mobile: value,
    smartwatch: value,
});

const transforms = {
    from: [
        {
            type: 'block',
            blocks: ['create-block/content-toggle-block'],
            transform: (attributes, innerBlocks) => {
                const {
                    toggles = [],
                    activeToggle = 0,
                    pillStyle,
                    pillBackgroundColor,
                    pillActiveBackgroundColor,
                    pillTextColor,
                    pillActiveTextColor,
                    pillBorderColor,
                    pillActiveBorderColor,
                    pillBorderRadius,
                    pillPadding,
                    pillGap,
                    pillFontSize,
                    pillFontWeight,
                    pillActiveFontWeight,
                    pillLineHeight,
                    pillLetterSpacing,
                    pillTextTransform,
                    pillAlign,
                    fontFamily,
                    containerMode,
                    containerMaxWidth,
                    contentBackgroundColor,
                    contentPadding,
                    contentBorderRadius,
                    contentWidth,
                    togglePosition,
                    wrapperBackgroundColor,
                    wrapperPadding,
                    animationDuration,
                    animationEase,
                } = attributes;

                const tabs = toggles.map((toggle, index) => ({
                    title: toggle.label,
                    id: toggle.id || `tab-${index + 1}`,
                }));

                const tabAttributes = {
                    tabs,
                    activeTab: activeToggle,
                    tabStyle: 'pills',
                    tabLayout: 'horizontal',
                    tabPosition: togglePosition === 'bottom' ? 'bottom' : 'top',
                    tabsAlign: pillAlign || 'flex-start',
                    pillStyle: pillStyle || 'default',
                    pillBackgroundColor,
                    pillActiveBackgroundColor,
                    pillTextColor,
                    pillActiveTextColor,
                    pillBorderColor,
                    pillActiveBorderColor,
                    pillBorderRadius,
                    pillPadding,
                    fontFamily,
                    containerMode,
                    containerMaxWidth,
                    contentBackgroundColor,
                    contentBorderRadius,
                    contentWidth,
                    wrapperBackgroundColor,
                    wrapperPadding,
                    animationDuration,
                    animationEase,
                };

                if (typeof pillGap === 'number') {
                    tabAttributes.tabGap = toDeviceObject(pillGap);
                }
                if (typeof pillFontSize === 'number') {
                    tabAttributes.tabTitleFontSize = toDeviceObject(pillFontSize);
                }
                if (pillFontWeight) {
                    tabAttributes.tabTitleFontWeight = pillFontWeight;
                }
                if (pillActiveFontWeight) {
                    tabAttributes.tabTitleActiveFontWeight = pillActiveFontWeight;
                }
                if (pillLineHeight) {
                    tabAttributes.tabTitleLineHeight = toDeviceObject(pillLineHeight);
                }
                if (pillLetterSpacing) {
                    tabAttributes.tabTitleLetterSpacing = toDeviceObject(pillLetterSpacing);
                }
                if (pillTextTransform) {
                    tabAttributes.tabTitleTextTransform = toDeviceObject(pillTextTransform);
                }
                if (contentPadding) {
                    tabAttributes.contentPaddingTop = toDeviceObject(contentPadding.top ?? 40);
                    tabAttributes.contentPaddingRight = toDeviceObject(contentPadding.right ?? 40);
                    tabAttributes.contentPaddingBottom = toDeviceObject(contentPadding.bottom ?? 40);
                    tabAttributes.contentPaddingLeft = toDeviceObject(contentPadding.left ?? 40);
                }

                const panelBlocks = innerBlocks.map((panel, index) =>
                    createBlock(
                        'create-block/tab-panel-block',
                        {
                            tabTitle: tabs[index]?.title ?? '',
                            tabId: tabs[index]?.id ?? `tab-${index + 1}`,
                            tabIndex: index,
                            isActive: index === activeToggle,
                        },
                        panel.innerBlocks
                    )
                );

                return createBlock('create-block/tabs-block', tabAttributes, panelBlocks);
            },
        },
    ],
};

export default transforms;
