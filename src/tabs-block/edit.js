import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    Button,
    ButtonGroup,
    TextControl,
    SelectControl,
    ColorPicker,
    __experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { plus, trash, arrowUp, arrowDown } from '@wordpress/icons';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute, THREE_TIERS } from '../components/DeviceSwitcher';
import './editor.scss';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import BoundColorPalette from '../components/BoundColorPalette';

const TAB_STYLE_OPTIONS = [
    { label: __('Underline', 'adaire-blocks'), value: 'underline' },
    { label: __('Pills', 'adaire-blocks'), value: 'pills' },
];

const TAB_STYLE_HELP = {
    underline: __('Classic tabs with an animated underline beneath the active title.', 'adaire-blocks'),
    pills: __('Rounded button-style tabs, like a content switcher.', 'adaire-blocks'),
};

const PILL_STYLES = [
    { label: __('Default — outlined until active', 'adaire-blocks'), value: 'default' },
    { label: __('Rounded — fully round ends', 'adaire-blocks'), value: 'rounded' },
    { label: __('Outlined — border only, no fill', 'adaire-blocks'), value: 'outlined' },
    { label: __('Filled — solid background', 'adaire-blocks'), value: 'filled' },
];

const HORIZONTAL_ALIGN_OPTIONS = [
    { label: __('Left', 'adaire-blocks'), value: 'flex-start' },
    { label: __('Center', 'adaire-blocks'), value: 'center' },
    { label: __('Right', 'adaire-blocks'), value: 'flex-end' },
    { label: __('Space Between', 'adaire-blocks'), value: 'space-between' },
];

const VERTICAL_ALIGN_OPTIONS = [
    { label: __('Top', 'adaire-blocks'), value: 'flex-start' },
    { label: __('Center', 'adaire-blocks'), value: 'center' },
    { label: __('Bottom', 'adaire-blocks'), value: 'flex-end' },
    { label: __('Space Between', 'adaire-blocks'), value: 'space-between' },
];

const EASE_OPTIONS = [
    { label: __('Smooth (default)', 'adaire-blocks'), value: 'power2.out' },
    { label: __('Smoother', 'adaire-blocks'), value: 'power3.out' },
    { label: __('Snappy', 'adaire-blocks'), value: 'power4.out' },
    { label: __('Elastic bounce', 'adaire-blocks'), value: 'elastic.out(1, 0.5)' },
    { label: __('Slight overshoot', 'adaire-blocks'), value: 'back.out(1.2)' },
];

const TEXT_TRANSFORM_OPTIONS = [
    { label: __('None', 'adaire-blocks'), value: 'none' },
    { label: __('UPPERCASE', 'adaire-blocks'), value: 'uppercase' },
    { label: __('lowercase', 'adaire-blocks'), value: 'lowercase' },
    { label: __('Capitalize', 'adaire-blocks'), value: 'capitalize' },
];

const FONT_FAMILY_OPTIONS = [
    { label: __('Default (inherit theme)', 'adaire-blocks'), value: '' },
    { label: __('Arial', 'adaire-blocks'), value: 'Arial, Helvetica, sans-serif' },
    { label: __('Helvetica', 'adaire-blocks'), value: 'Helvetica, Arial, sans-serif' },
    { label: __('Georgia', 'adaire-blocks'), value: 'Georgia, serif' },
    { label: __('Times New Roman', 'adaire-blocks'), value: "'Times New Roman', Times, serif" },
    { label: __('Verdana', 'adaire-blocks'), value: 'Verdana, Geneva, sans-serif' },
    { label: __('Trebuchet MS', 'adaire-blocks'), value: "'Trebuchet MS', sans-serif" },
    { label: __('Courier New', 'adaire-blocks'), value: "'Courier New', Courier, monospace" },
    { label: __('System UI', 'adaire-blocks'), value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const DEFAULT_ANIMATION_DURATION = 0.6;
const DEFAULT_ANIMATION_EASE = 'power2.out';

// Maps the GSAP ease names in EASE_OPTIONS (above) to the closest CSS
// cubic-bezier equivalent — mirrors view.js's cssEaseFor, kept local here
// since this is the only animation call in the editor bundle.
const cssEaseFor = (gsapEase) => {
    switch (gsapEase) {
        case 'power3.out':
            return 'cubic-bezier(0.215, 0.61, 0.355, 1)';
        case 'power4.out':
            return 'cubic-bezier(0.165, 0.84, 0.44, 1)';
        case 'elastic.out(1, 0.5)':
        case 'back.out(1.2)':
            return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
        case 'power2.out':
        default:
            return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
};

// Several older attributes store per-device objects but their controls write
// plain numbers; show the effective desktop value either way.
const numValue = (value, fallback) => (
    typeof value === 'number' ? value : (value?.desktop ?? fallback)
);

const sectionLabel = { margin: '0 0 8px', fontWeight: 600 };
const helpTextStyle = { margin: '4px 0 12px', fontSize: '12px', color: '#757575' };
const twoColGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };

export default function Edit({ attributes, setAttributes, clientId }) {
    const [deviceType, setDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);

    // Check block limits
    const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
        'tabs-block',
        attributes.tabs || [],
        'tab'
    );

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

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const isPills = tabStyle === 'pills';
    const isVertical = tabLayout === 'vertical';

    // Animation customization is a paid feature (config-driven so the
    // pro distribution can unlock it without a rebuild)
    const tabsBlockConfig = window.adaireBlocksConfig?.blocks?.['tabs-block'] || {};
    const tabsBlockLimits = tabsBlockConfig.limits || {};
    const isFree = !window.adaireBlocksConfig?.isPremium;
    const animationLocked = isFree && tabsBlockLimits.customAnimations === false;

    // Enforce animation defaults for free version
    useEffect(() => {
        if (animationLocked && (animationDuration !== DEFAULT_ANIMATION_DURATION || animationEase !== DEFAULT_ANIMATION_EASE)) {
            setAttributes({
                animationDuration: DEFAULT_ANIMATION_DURATION,
                animationEase: DEFAULT_ANIMATION_EASE,
            });
        }
    }, [animationLocked, animationDuration, animationEase]);

    // Inline animation preview: when the shown tab changes, play the same
    // fade/slide the frontend uses so editors can see the transition live.
    const containerRef = useRef(null);
    const prevActiveTabRef = useRef(activeTab);

    useEffect(() => {
        if (prevActiveTabRef.current === activeTab) {
            return;
        }
        prevActiveTabRef.current = activeTab;

        const container = containerRef.current;
        if (!container) {
            return;
        }
        const panel = container.querySelector(`.adaire-tab-panel[data-tab-index="${activeTab}"]`);
        if (!panel) {
            return;
        }

        const previewDuration = (animationDuration || DEFAULT_ANIMATION_DURATION) * 0.6;
        const previewEase = cssEaseFor(animationEase || DEFAULT_ANIMATION_EASE);

        panel.style.transition = '';
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';

        void panel.offsetHeight; // force reflow

        const raf = window.requestAnimationFrame(() => {
            panel.style.transition = `opacity ${previewDuration}s ${previewEase}, transform ${previewDuration}s ${previewEase}`;
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        });

        // Hand styling back to React/CSS once the preview finishes.
        const cleanupTimeout = window.setTimeout(() => {
            panel.style.transition = '';
            panel.style.opacity = '';
            panel.style.transform = '';
        }, previewDuration * 1000);

        return () => {
            window.cancelAnimationFrame(raf);
            window.clearTimeout(cleanupTimeout);
        };
    }, [activeTab, animationDuration, animationEase]);

    // Helper function to ensure we have a valid color with opacity
    const getBackgroundColor = (color) => {
        if (!color) return 'rgba(80, 58, 168, 0.05)';
        return color;
    };

    const blockProps = useBlockProps({
        className: 'adaire-tabs',
        style: {
            '--tab-title-color': tabTitleColor,
            '--tab-title-active-color': tabTitleActiveColor,
            '--tab-underline-color': tabUnderlineColor,
            '--tab-title-size': `${tabTitleFontSize?.desktop ?? tabTitleFontSize ?? 18}px`,
            '--tab-title-size-tablet': `${tabTitleFontSize?.tablet ?? 16}px`,
            '--tab-title-size-mobile': `${tabTitleFontSize?.mobile ?? 14}px`,
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
            '--tab-gap': `${tabGap?.desktop ?? tabGap ?? 32}px`,
            '--tab-gap-tablet': `${tabGap?.tablet ?? 24}px`,
            '--tab-gap-mobile': `${tabGap?.mobile ?? 16}px`,
            '--underline-height': `${underlineHeight?.desktop ?? underlineHeight ?? 3}px`,
            '--underline-height-tablet': `${underlineHeight?.tablet ?? 2}px`,
            '--underline-height-mobile': `${underlineHeight?.mobile ?? 2}px`,
            '--content-padding-top': `${contentPaddingTop?.desktop ?? contentPaddingTop ?? 40}px`,
            '--content-padding-top-tablet': `${contentPaddingTop?.tablet ?? 32}px`,
            '--content-padding-top-mobile': `${contentPaddingTop?.mobile ?? 24}px`,
            '--content-padding-right': `${contentPaddingRight?.desktop ?? contentPaddingRight ?? 0}px`,
            '--content-padding-bottom': `${contentPaddingBottom?.desktop ?? contentPaddingBottom ?? 40}px`,
            '--content-padding-bottom-tablet': `${contentPaddingBottom?.tablet ?? 32}px`,
            '--content-padding-bottom-mobile': `${contentPaddingBottom?.mobile ?? 24}px`,
            '--content-padding-left': `${contentPaddingLeft?.desktop ?? contentPaddingLeft ?? 0}px`,
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

    const updateTab = useCallback((index, patch) => {
        const next = [...tabs];
        next[index] = { ...next[index], ...patch };
        setAttributes({ tabs: next });
    }, [tabs, setAttributes]);

    const addTab = () => {
        if (isLimitReached) {
            return; // Don't add if limit reached
        }
        const newId = `tab-${Date.now()}`;
        setAttributes({
            tabs: [...tabs, {
                title: __('New Tab', 'adaire-blocks'),
                id: newId
            }]
        });
    };

    const removeTab = (index) => {
        if (tabs.length <= 1) {
            return;
        }
        const next = tabs.filter((_, i) => i !== index);
        setAttributes({
            tabs: next,
            activeTab: activeTab >= next.length ? next.length - 1 : activeTab
        });
    };

    const moveTab = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= tabs.length) return;

        const next = [...tabs];
        [next[index], next[newIndex]] = [next[newIndex], next[index]];

        let newActiveTab = activeTab;
        if (activeTab === index) {
            newActiveTab = newIndex;
        } else if (activeTab === newIndex) {
            newActiveTab = index;
        }

        setAttributes({ tabs: next, activeTab: newActiveTab });
    };

    const updateWrapperPadding = (device, side, value) => {
        setAttributes({
            wrapperPadding: {
                ...(wrapperPadding || {}),
                [device]: {
                    ...(wrapperPadding?.[device] || {}),
                    [side]: value,
                },
            },
        });
    };

    const updateContentWidth = (device, property, value) => {
        setAttributes({
            contentWidth: {
                ...(contentWidth || {}),
                [device]: {
                    ...(contentWidth?.[device] || {}),
                    [property]: value,
                },
            },
        });
    };

    // Template for tab panel blocks
    const ALLOWED_BLOCKS = ['create-block/tab-panel-block'];
    const TEMPLATE = (tabs || []).map((tab, index) => [
        'create-block/tab-panel-block',
        {
            tabTitle: tab.title,
            tabId: tab.id,
            tabIndex: index,
            isActive: index === activeTab
        }
    ]);

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-tabs__panels' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            templateLock: 'all', // Lock to prevent adding/removing blocks manually
            renderAppender: false,
        }
    );

    return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                {/* ————— LAYOUT TAB: Tabs (content) ————— */}
                <PanelBody section="content" title={__('Tabs', 'adaire-blocks')} initialOpen={true}>
                    <p style={helpTextStyle}>
                        {__('The highlighted tab is shown in the editor preview — click "Show" to edit another tab\'s content.', 'adaire-blocks')}
                    </p>
                    {(tabs || []).map((tab, index) => (
                        <div key={tab.id} style={{
                            marginBottom: '10px',
                            padding: '10px 12px',
                            border: activeTab === index ? '1px solid #503AA8' : '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: activeTab === index ? '#f7f5fd' : '#fff'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ fontSize: '12px', color: activeTab === index ? '#503AA8' : '#555' }}>
                                    {sprintf(__('Tab %d', 'adaire-blocks'), index + 1)}
                                </strong>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    <Button
                                        isSmall
                                        variant={activeTab === index ? 'primary' : 'secondary'}
                                        onClick={() => setAttributes({ activeTab: index })}
                                        aria-pressed={activeTab === index}
                                    >
                                        {activeTab === index ? __('Showing', 'adaire-blocks') : __('Show', 'adaire-blocks')}
                                    </Button>
                                    <Button
                                        icon={arrowUp}
                                        isSmall
                                        onClick={() => moveTab(index, -1)}
                                        disabled={index === 0}
                                        label={__('Move tab up', 'adaire-blocks')}
                                    />
                                    <Button
                                        icon={arrowDown}
                                        isSmall
                                        onClick={() => moveTab(index, 1)}
                                        disabled={index === tabs.length - 1}
                                        label={__('Move tab down', 'adaire-blocks')}
                                    />
                                    <Button
                                        icon={trash}
                                        isSmall
                                        isDestructive
                                        onClick={() => removeTab(index)}
                                        disabled={tabs.length <= 1}
                                        label={__('Remove tab', 'adaire-blocks')}
                                    />
                                </div>
                            </div>
                            <TextControl
                                label={__('Title', 'adaire-blocks')}
                                hideLabelFromVision
                                placeholder={__('Tab title…', 'adaire-blocks')}
                                value={tab.title}
                                onChange={(v) => updateTab(index, { title: v })}
                            />
                        </div>
                    ))}
                    <Button
                        variant="primary"
                        icon={plus}
                        onClick={addTab}
                        disabled={ isLimitReached }
                    >
                        {__('Add Tab', 'adaire-blocks')}
                    </Button>
                    { showUpgradeNotice && (
                        <UpgradeNotice
                            variant="inline"
                            itemType="tab"
                            message={upgradeMessage}
                        />
                    ) }
                    <div style={{ marginTop: '16px' }}>
                        <SelectControl
                            label={__('First Tab Shown', 'adaire-blocks')}
                            value={activeTab}
                            options={(tabs || []).map((tab, index) => ({
                                label: `${index + 1}. ${tab.title}`,
                                value: index
                            }))}
                            onChange={(value) => setAttributes({ activeTab: parseInt(value) })}
                            help={__('The tab visitors see first when the page loads.', 'adaire-blocks')}
                        />
                    </div>
                </PanelBody>

                {/* ————— LAYOUT TAB: Layout ————— */}
                <PanelBody section="layout" title={__('Layout', 'adaire-blocks')} initialOpen={false}>
                    <p style={sectionLabel}>{__('Tab Design', 'adaire-blocks')}</p>
                    <ButtonGroup>
                        {TAB_STYLE_OPTIONS.map(opt => (
                            <Button
                                key={opt.value}
                                isPrimary={tabStyle === opt.value}
                                isSecondary={tabStyle !== opt.value}
                                onClick={() => setAttributes({ tabStyle: opt.value })}
                            >{opt.label}</Button>
                        ))}
                    </ButtonGroup>
                    <p style={helpTextStyle}>{TAB_STYLE_HELP[tabStyle] ?? TAB_STYLE_HELP.underline}</p>

                    <p style={sectionLabel}>{__('Orientation', 'adaire-blocks')}</p>
                    <ButtonGroup>
                        {[
                            { label: __('Horizontal', 'adaire-blocks'), value: 'horizontal' },
                            { label: __('Vertical', 'adaire-blocks'), value: 'vertical' },
                        ].map(opt => (
                            <Button
                                key={opt.value}
                                isPrimary={tabLayout === opt.value}
                                isSecondary={tabLayout !== opt.value}
                                onClick={() => setAttributes({ tabLayout: opt.value })}
                            >{opt.label}</Button>
                        ))}
                    </ButtonGroup>
                    <p style={helpTextStyle}>
                        {isVertical
                            ? __('Tab titles sit beside the content.', 'adaire-blocks')
                            : __('Tab titles sit in a row above or below the content.', 'adaire-blocks')}
                    </p>

                    <p style={sectionLabel}>{__('Tab Bar Position', 'adaire-blocks')}</p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        {(isVertical
                            ? [
                                { label: __('Left of Content', 'adaire-blocks'), value: 'left' },
                                { label: __('Right of Content', 'adaire-blocks'), value: 'right' },
                            ]
                            : [
                                { label: __('Above Content', 'adaire-blocks'), value: 'top' },
                                { label: __('Below Content', 'adaire-blocks'), value: 'bottom' },
                            ]
                        ).map(opt => (
                            <Button
                                key={opt.value}
                                isPrimary={tabPosition === opt.value}
                                isSecondary={tabPosition !== opt.value}
                                onClick={() => setAttributes({ tabPosition: opt.value })}
                            >{opt.label}</Button>
                        ))}
                    </ButtonGroup>

                    <SelectControl
                        label={__('Tab Alignment', 'adaire-blocks')}
                        value={tabsAlign}
                        options={isVertical ? VERTICAL_ALIGN_OPTIONS : HORIZONTAL_ALIGN_OPTIONS}
                        onChange={(v) => setAttributes({ tabsAlign: v })}
                        help={isVertical
                            ? __('How tab buttons are distributed in the side column.', 'adaire-blocks')
                            : __('How tab titles are aligned along the tab bar.', 'adaire-blocks')}
                    />

                    <RangeControl
                        label={__('Space Between Tabs (px)', 'adaire-blocks')}
                        value={numValue(tabGap, 32)}
                        onChange={(v) => setAttributes({ tabGap: v })}
                        min={8}
                        max={80}
                    />

                    <p style={sectionLabel}>{__('Block Width', 'adaire-blocks')}</p>
                    <ButtonGroup>
                        {[
                            { label: __('Full Width', 'adaire-blocks'), value: 'full' },
                            { label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
                        ].map(opt => (
                            <Button
                                key={opt.value}
                                isPrimary={containerMode === opt.value}
                                isSecondary={containerMode !== opt.value}
                                onClick={() => setAttributes({ containerMode: opt.value })}
                            >{opt.label}</Button>
                        ))}
                    </ButtonGroup>
                    {containerMode === 'constrained' && (
                        <div style={{ marginTop: '12px' }}>
                            <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Max Width Device', 'adaire-blocks')} tiers={THREE_TIERS} />
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <TextControl
                                    type="number"
                                    label={__('Max Width', 'adaire-blocks')}
                                    value={
                                        containerMaxWidth?.[deviceType]?.value ??
                                        (deviceType === 'desktop' ? (containerMaxWidth?.value ?? 1200) : 100)
                                    }
                                    onChange={(v) =>
                                        setAttributes({
                                            containerMaxWidth: {
                                                ...(containerMaxWidth || {}),
                                                [deviceType]: {
                                                    ...(containerMaxWidth?.[deviceType] || {}),
                                                    value: Number(v),
                                                },
                                            },
                                        })
                                    }
                                />
                                <ButtonGroup>
                                    {['px', '%', 'rem', 'vw'].map((u) => (
                                        <Button
                                            key={u}
                                            isSmall
                                            isPrimary={
                                                (containerMaxWidth?.[deviceType]?.unit ??
                                                    (deviceType === 'desktop' ? (containerMaxWidth?.unit ?? 'px') : '%')) === u
                                            }
                                            isSecondary={
                                                (containerMaxWidth?.[deviceType]?.unit ??
                                                    (deviceType === 'desktop' ? (containerMaxWidth?.unit ?? 'px') : '%')) !== u
                                            }
                                            onClick={() =>
                                                setAttributes({
                                                    containerMaxWidth: {
                                                        ...(containerMaxWidth || {}),
                                                        [deviceType]: {
                                                            ...(containerMaxWidth?.[deviceType] || {}),
                                                            unit: u,
                                                        },
                                                    },
                                                })
                                            }
                                        >
                                            {u}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </div>
                        </div>
                    )}
                </PanelBody>

                {/* ————— LAYOUT TAB: Animation (pro-gated) ————— */}
                <PanelBody section="layout" title={__('Animation', 'adaire-blocks')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('Controls how panels fade and slide when switching tabs.', 'adaire-blocks')}
                    </p>
                    {animationLocked && (
                        <UpgradeNotice
                            variant="full"
                            message={__('Upgrade to customize the animation and transition between tabs.', 'adaire-blocks')}
                        />
                    )}
                    <RangeControl
                        label={__('Duration (seconds)', 'adaire-blocks')}
                        value={animationDuration}
                        onChange={(v) => setAttributes({ animationDuration: v })}
                        min={0.1}
                        max={2}
                        step={0.1}
                        disabled={animationLocked}
                    />
                    <SelectControl
                        label={__('Transition Feel', 'adaire-blocks')}
                        value={animationEase}
                        options={EASE_OPTIONS}
                        onChange={(v) => setAttributes({ animationEase: v })}
                        disabled={animationLocked}
                    />
                </PanelBody>

                {/* ————— STYLE TAB: colors (auto-sorted by InspectorTabs) ————— */}
                {!isPills && (
                    <PanelBody section="style" priority="high" title={__('Tab Colors', 'adaire-blocks')} initialOpen={false}>
                        <p style={sectionLabel}>{__('Title', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={tabTitleColor}
                            onChange={(v) => setAttributes({ tabTitleColor: v })}
                        />
                        <p style={sectionLabel}>{__('Title (Active Tab)', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={tabTitleActiveColor}
                            onChange={(v) => setAttributes({ tabTitleActiveColor: v })}
                        />
                        {isVertical && (
                            <>
                                <p style={sectionLabel}>{__('Active Tab Background', 'adaire-blocks')}</p>
                                <p style={helpTextStyle}>{__('Shown behind the selected tab button in vertical layout.', 'adaire-blocks')}</p>
                                <ColorPicker
                                    color={verticalActiveBgColor}
                                    onChange={(color) => setAttributes({ verticalActiveBgColor: color })}
                                    enableAlpha
                                />
                            </>
                        )}
                    </PanelBody>
                )}

                {isPills && (
                    <PanelBody section="style" priority="high" title={__('Pill Colors', 'adaire-blocks')} initialOpen={false}>
                        <p style={helpTextStyle}>
                            {__('"Active" colors apply to the selected pill and on hover.', 'adaire-blocks')}
                        </p>
                        <p style={sectionLabel}>{__('Background', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={pillBackgroundColor}
                            onChange={(v) => setAttributes({ pillBackgroundColor: v })}
                        />
                        <p style={sectionLabel}>{__('Background (Active)', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={pillActiveBackgroundColor}
                            onChange={(v) => setAttributes({ pillActiveBackgroundColor: v })}
                        />
                        <p style={sectionLabel}>{__('Text', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={pillTextColor}
                            onChange={(v) => setAttributes({ pillTextColor: v })}
                        />
                        <p style={sectionLabel}>{__('Text (Active)', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={pillActiveTextColor}
                            onChange={(v) => setAttributes({ pillActiveTextColor: v })}
                        />
                        <p style={sectionLabel}>{__('Border', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={pillBorderColor}
                            onChange={(v) => setAttributes({ pillBorderColor: v })}
                        />
                        <p style={sectionLabel}>{__('Border (Active)', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={pillActiveBorderColor}
                            onChange={(v) => setAttributes({ pillActiveBorderColor: v })}
                        />
                    </PanelBody>
                )}

                {/* ————— STYLE TAB: typography ————— */}
                <PanelBody section="style" priority="high" title={__('Typography', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Font Family', 'adaire-blocks')}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(v) => setAttributes({ fontFamily: v })}
                        help={__('Applies to the tab title labels.', 'adaire-blocks')}
                    />
                    <RangeControl
                        label={__('Title Size (px)', 'adaire-blocks')}
                        value={numValue(tabTitleFontSize, 18)}
                        onChange={(v) => setAttributes({ tabTitleFontSize: v })}
                        min={12}
                        max={48}
                    />
                    <p style={sectionLabel}>{__('Weight', 'adaire-blocks')}</p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        {['300', '400', '500', '600', '700', '800'].map((weight) => (
                            <Button
                                key={weight}
                                isSmall
                                isPrimary={tabTitleFontWeight === weight}
                                isSecondary={tabTitleFontWeight !== weight}
                                onClick={() => setAttributes({ tabTitleFontWeight: weight })}
                            >{weight}</Button>
                        ))}
                    </ButtonGroup>
                    <p style={sectionLabel}>{__('Weight (Active Tab)', 'adaire-blocks')}</p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        {['300', '400', '500', '600', '700', '800'].map((weight) => (
                            <Button
                                key={weight}
                                isSmall
                                isPrimary={tabTitleActiveFontWeight === weight}
                                isSecondary={tabTitleActiveFontWeight !== weight}
                                onClick={() => setAttributes({ tabTitleActiveFontWeight: weight })}
                            >{weight}</Button>
                        ))}
                    </ButtonGroup>

                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Fine-tuning Device', 'adaire-blocks')} tiers={THREE_TIERS} />
                    <UnitControl
                        label={__('Line Height', 'adaire-blocks')}
                        value={getDeviceValue(tabTitleLineHeight, deviceType, 'normal')}
                        onChange={(v) => setAttributes({ tabTitleLineHeight: updateDeviceAttribute(tabTitleLineHeight, deviceType, v) })}
                    />
                    <UnitControl
                        label={__('Letter Spacing', 'adaire-blocks')}
                        value={getDeviceValue(tabTitleLetterSpacing, deviceType, '-0.01em')}
                        onChange={(v) => setAttributes({ tabTitleLetterSpacing: updateDeviceAttribute(tabTitleLetterSpacing, deviceType, v) })}
                    />
                    <SelectControl
                        label={__('Text Case', 'adaire-blocks')}
                        value={getDeviceValue(tabTitleTextTransform, deviceType, 'none')}
                        options={TEXT_TRANSFORM_OPTIONS}
                        onChange={(v) => setAttributes({ tabTitleTextTransform: updateDeviceAttribute(tabTitleTextTransform, deviceType, v) })}
                    />
                </PanelBody>

                {/* ————— STYLE TAB: shape (mode-specific) ————— */}
                {!isPills && (
                    <PanelBody section="style" priority="medium" title={__('Underline Style', 'adaire-blocks')} initialOpen={false}>
                        <p style={helpTextStyle}>
                            {__('The animated line under the active tab (horizontal layout).', 'adaire-blocks')}
                        </p>
                        <RangeControl
                            label={__('Thickness (px)', 'adaire-blocks')}
                            value={numValue(underlineHeight, 3)}
                            onChange={(v) => setAttributes({ underlineHeight: v })}
                            min={1}
                            max={10}
                        />
                        <p style={sectionLabel}>{__('Color', 'adaire-blocks')}</p>
                        <BoundColorPalette
                            value={tabUnderlineColor}
                            onChange={(v) => setAttributes({ tabUnderlineColor: v })}
                        />
                    </PanelBody>
                )}

                {isPills && (
                    <PanelBody section="style" priority="medium" title={__('Pill Shape & Padding', 'adaire-blocks')} initialOpen={false}>
                        <SelectControl
                            label={__('Pill Style', 'adaire-blocks')}
                            value={pillStyle}
                            options={PILL_STYLES}
                            onChange={(v) => setAttributes({ pillStyle: v })}
                        />
                        <RangeControl
                            label={__('Corner Roundness (px)', 'adaire-blocks')}
                            value={pillBorderRadius}
                            onChange={(v) => setAttributes({ pillBorderRadius: v })}
                            min={0}
                            max={50}
                        />
                        <p style={sectionLabel}>{__('Padding Inside Each Pill', 'adaire-blocks')}</p>
                        <div style={twoColGrid}>
                            <RangeControl
                                label={__('Top', 'adaire-blocks')}
                                value={pillPadding?.top ?? 12}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, top: v } })}
                                min={0}
                                max={32}
                            />
                            <RangeControl
                                label={__('Right', 'adaire-blocks')}
                                value={pillPadding?.right ?? 24}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, right: v } })}
                                min={0}
                                max={48}
                            />
                            <RangeControl
                                label={__('Bottom', 'adaire-blocks')}
                                value={pillPadding?.bottom ?? 12}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, bottom: v } })}
                                min={0}
                                max={32}
                            />
                            <RangeControl
                                label={__('Left', 'adaire-blocks')}
                                value={pillPadding?.left ?? 24}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, left: v } })}
                                min={0}
                                max={48}
                            />
                        </div>
                    </PanelBody>
                )}

                {/* ————— STYLE TAB: content area ————— */}
                <PanelBody section="style" priority="medium" title={__('Content Area Styling', 'adaire-blocks')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('The panel that holds each tab\'s content.', 'adaire-blocks')}
                    </p>
                    <p style={sectionLabel}>{__('Background', 'adaire-blocks')}</p>
                    <BoundColorPalette
                        value={contentBackgroundColor}
                        onChange={(v) => setAttributes({ contentBackgroundColor: v })}
                    />
                    <RangeControl
                        label={__('Corner Roundness (px)', 'adaire-blocks')}
                        value={contentBorderRadius}
                        onChange={(v) => setAttributes({ contentBorderRadius: v })}
                        min={0}
                        max={32}
                    />
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Width Device', 'adaire-blocks')} tiers={THREE_TIERS} />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <TextControl
                            type="number"
                            label={__('Content Width', 'adaire-blocks')}
                            value={contentWidth?.[deviceType]?.value ?? 100}
                            onChange={(v) => updateContentWidth(deviceType, 'value', Number(v))}
                        />
                        <ButtonGroup>
                            {['px', '%', 'rem', 'vw'].map((u) => (
                                <Button
                                    key={u}
                                    isSmall
                                    isPrimary={(contentWidth?.[deviceType]?.unit ?? '%') === u}
                                    isSecondary={(contentWidth?.[deviceType]?.unit ?? '%') !== u}
                                    onClick={() => updateContentWidth(deviceType, 'unit', u)}
                                >
                                    {u}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </div>
                    <p style={{ ...sectionLabel, marginTop: '16px' }}>{__('Padding Around Content', 'adaire-blocks')}</p>
                    <div style={twoColGrid}>
                        <RangeControl
                            label={__('Top', 'adaire-blocks')}
                            value={numValue(contentPaddingTop, 40)}
                            onChange={(v) => setAttributes({ contentPaddingTop: v })}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Right', 'adaire-blocks')}
                            value={numValue(contentPaddingRight, 0)}
                            onChange={(v) => setAttributes({ contentPaddingRight: v })}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Bottom', 'adaire-blocks')}
                            value={numValue(contentPaddingBottom, 40)}
                            onChange={(v) => setAttributes({ contentPaddingBottom: v })}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Left', 'adaire-blocks')}
                            value={numValue(contentPaddingLeft, 0)}
                            onChange={(v) => setAttributes({ contentPaddingLeft: v })}
                            min={0}
                            max={120}
                        />
                    </div>
                </PanelBody>

                {/* ————— STYLE TAB: wrapper ————— */}
                <PanelBody section="style" priority="medium" title={__('Wrapper Spacing', 'adaire-blocks')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('The outer box around the tab bar and content together.', 'adaire-blocks')}
                    </p>
                    <p style={sectionLabel}>{__('Background', 'adaire-blocks')}</p>
                    <BoundColorPalette
                        value={wrapperBackgroundColor}
                        onChange={(v) => setAttributes({ wrapperBackgroundColor: v })}
                    />
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Padding Device', 'adaire-blocks')} tiers={THREE_TIERS} />
                    <div style={twoColGrid}>
                        <RangeControl
                            label={__('Top', 'adaire-blocks')}
                            value={wrapperPadding?.[deviceType]?.top ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'top', v)}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Right', 'adaire-blocks')}
                            value={wrapperPadding?.[deviceType]?.right ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'right', v)}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Bottom', 'adaire-blocks')}
                            value={wrapperPadding?.[deviceType]?.bottom ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'bottom', v)}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Left', 'adaire-blocks')}
                            value={wrapperPadding?.[deviceType]?.left ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'left', v)}
                            min={0}
                            max={120}
                        />
                    </div>
                </PanelBody>

                {/* ————— STYLE TAB: margins ————— */}
                <PanelBody section="style" priority="medium" title={__('Margins', 'adaire-blocks')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('Space between this block and the blocks around it.', 'adaire-blocks')}
                    </p>
                    <div style={twoColGrid}>
                        <RangeControl
                            label={__('Top', 'adaire-blocks')}
                            value={numValue(marginTop, 0)}
                            onChange={(v) => setAttributes({ marginTop: v })}
                            min={0}
                            max={200}
                        />
                        <RangeControl
                            label={__('Right', 'adaire-blocks')}
                            value={numValue(marginRight, 0)}
                            onChange={(v) => setAttributes({ marginRight: v })}
                            min={0}
                            max={200}
                        />
                        <RangeControl
                            label={__('Bottom', 'adaire-blocks')}
                            value={numValue(marginBottom, 0)}
                            onChange={(v) => setAttributes({ marginBottom: v })}
                            min={0}
                            max={200}
                        />
                        <RangeControl
                            label={__('Left', 'adaire-blocks')}
                            value={numValue(marginLeft, 0)}
                            onChange={(v) => setAttributes({ marginLeft: v })}
                            min={0}
                            max={200}
                        />
                    </div>
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps} data-block-id={blockId} data-active-tab={activeTab} data-tab-layout={tabLayout} data-tab-position={tabPosition} data-tab-style={tabStyle}>
                <div
                    ref={containerRef}
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
                                <QuickZone
                                    key={tab.id}
                                    id={`tab-title-${tab.id}`}
                                    label="Tab Title"
                                    activeZone={activeZone}
                                    setActiveZone={setActiveZone}
                                    content={
                                        <TextControl
                                            label={__('Tab Title', 'adaire-blocks')}
                                            value={tab.title}
                                            onChange={(v) => updateTab(index, { title: v })}
                                        />
                                    }
                                >
                                    <button
                                        className={`adaire-tabs__tab ${activeTab === index ? 'is-active' : ''}`}
                                        onClick={() => setAttributes({ activeTab: index })}
                                        role="tab"
                                        aria-selected={activeTab === index}
                                    >
                                        {tab.title}
                                    </button>
                                </QuickZone>
                            ))}
                        </div>
                        {!isPills && <div className="adaire-tabs__underline" />}
                    </div>

                    <div className="adaire-tabs__content-wrapper">
                        <div {...innerBlocksProps} />
                    </div>
                </div>
            </div>
        </>
    );
}
