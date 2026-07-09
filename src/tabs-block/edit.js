import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { gsap } from 'gsap';
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
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
import './editor.scss';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import QuickZone from '../components/QuickZone';
import InspectorTabs from '../components/InspectorTabs';
import BoundColorPalette from '../components/BoundColorPalette';

const TAB_STYLE_OPTIONS = [
    { label: __('Underline', 'tabs-block'), value: 'underline' },
    { label: __('Pills', 'tabs-block'), value: 'pills' },
];

const TAB_STYLE_HELP = {
    underline: __('Classic tabs with an animated underline beneath the active title.', 'tabs-block'),
    pills: __('Rounded button-style tabs, like a content switcher.', 'tabs-block'),
};

const PILL_STYLES = [
    { label: __('Default — outlined until active', 'tabs-block'), value: 'default' },
    { label: __('Rounded — fully round ends', 'tabs-block'), value: 'rounded' },
    { label: __('Outlined — border only, no fill', 'tabs-block'), value: 'outlined' },
    { label: __('Filled — solid background', 'tabs-block'), value: 'filled' },
];

const HORIZONTAL_ALIGN_OPTIONS = [
    { label: __('Left', 'tabs-block'), value: 'flex-start' },
    { label: __('Center', 'tabs-block'), value: 'center' },
    { label: __('Right', 'tabs-block'), value: 'flex-end' },
    { label: __('Space Between', 'tabs-block'), value: 'space-between' },
];

const VERTICAL_ALIGN_OPTIONS = [
    { label: __('Top', 'tabs-block'), value: 'flex-start' },
    { label: __('Center', 'tabs-block'), value: 'center' },
    { label: __('Bottom', 'tabs-block'), value: 'flex-end' },
    { label: __('Space Between', 'tabs-block'), value: 'space-between' },
];

const EASE_OPTIONS = [
    { label: __('Smooth (default)', 'tabs-block'), value: 'power2.out' },
    { label: __('Smoother', 'tabs-block'), value: 'power3.out' },
    { label: __('Snappy', 'tabs-block'), value: 'power4.out' },
    { label: __('Elastic bounce', 'tabs-block'), value: 'elastic.out(1, 0.5)' },
    { label: __('Slight overshoot', 'tabs-block'), value: 'back.out(1.2)' },
];

const TEXT_TRANSFORM_OPTIONS = [
    { label: __('None', 'tabs-block'), value: 'none' },
    { label: __('UPPERCASE', 'tabs-block'), value: 'uppercase' },
    { label: __('lowercase', 'tabs-block'), value: 'lowercase' },
    { label: __('Capitalize', 'tabs-block'), value: 'capitalize' },
];

const FONT_FAMILY_OPTIONS = [
    { label: __('Default (inherit theme)', 'tabs-block'), value: '' },
    { label: __('Arial', 'tabs-block'), value: 'Arial, Helvetica, sans-serif' },
    { label: __('Helvetica', 'tabs-block'), value: 'Helvetica, Arial, sans-serif' },
    { label: __('Georgia', 'tabs-block'), value: 'Georgia, serif' },
    { label: __('Times New Roman', 'tabs-block'), value: "'Times New Roman', Times, serif" },
    { label: __('Verdana', 'tabs-block'), value: 'Verdana, Geneva, sans-serif' },
    { label: __('Trebuchet MS', 'tabs-block'), value: "'Trebuchet MS', sans-serif" },
    { label: __('Courier New', 'tabs-block'), value: "'Courier New', Courier, monospace" },
    { label: __('System UI', 'tabs-block'), value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

const DEFAULT_ANIMATION_DURATION = 0.6;
const DEFAULT_ANIMATION_EASE = 'power2.out';

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
    // freemium distribution can unlock it without a rebuild)
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
        gsap.fromTo(
            panel,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: (animationDuration || DEFAULT_ANIMATION_DURATION) * 0.6,
                ease: animationEase || DEFAULT_ANIMATION_EASE,
                // Hand styling back to React/CSS once the preview finishes
                clearProps: 'opacity,transform',
            }
        );
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
            '--tab-title-size-watch': `${tabTitleFontSize?.smartwatch ?? 12}px`,
            '--tab-title-weight': tabTitleFontWeight,
            '--tab-title-active-weight': tabTitleActiveFontWeight,
            '--tab-title-line-height': `${getDeviceValue(tabTitleLineHeight, 'desktop', 'normal')}`,
            '--tab-title-line-height-tablet': `${getDeviceValue(tabTitleLineHeight, 'tablet', 'normal')}`,
            '--tab-title-line-height-mobile': `${getDeviceValue(tabTitleLineHeight, 'mobile', 'normal')}`,
            '--tab-title-line-height-watch': `${getDeviceValue(tabTitleLineHeight, 'smartwatch', 'normal')}`,
            '--tab-title-letter-spacing': `${getDeviceValue(tabTitleLetterSpacing, 'desktop', '-0.01em')}`,
            '--tab-title-letter-spacing-tablet': `${getDeviceValue(tabTitleLetterSpacing, 'tablet', '-0.01em')}`,
            '--tab-title-letter-spacing-mobile': `${getDeviceValue(tabTitleLetterSpacing, 'mobile', '-0.01em')}`,
            '--tab-title-letter-spacing-watch': `${getDeviceValue(tabTitleLetterSpacing, 'smartwatch', '-0.01em')}`,
            '--tab-title-text-transform': `${getDeviceValue(tabTitleTextTransform, 'desktop', 'none')}`,
            '--tab-title-text-transform-tablet': `${getDeviceValue(tabTitleTextTransform, 'tablet', 'none')}`,
            '--tab-title-text-transform-mobile': `${getDeviceValue(tabTitleTextTransform, 'mobile', 'none')}`,
            '--tab-title-text-transform-watch': `${getDeviceValue(tabTitleTextTransform, 'smartwatch', 'none')}`,
            '--tabs-font-family': fontFamily || 'inherit',
            '--tab-gap': `${tabGap?.desktop ?? tabGap ?? 32}px`,
            '--tab-gap-tablet': `${tabGap?.tablet ?? 24}px`,
            '--tab-gap-mobile': `${tabGap?.mobile ?? 16}px`,
            '--tab-gap-watch': `${tabGap?.smartwatch ?? 12}px`,
            '--underline-height': `${underlineHeight?.desktop ?? underlineHeight ?? 3}px`,
            '--underline-height-tablet': `${underlineHeight?.tablet ?? 2}px`,
            '--underline-height-mobile': `${underlineHeight?.mobile ?? 2}px`,
            '--underline-height-watch': `${underlineHeight?.smartwatch ?? 1}px`,
            '--content-padding-top': `${contentPaddingTop?.desktop ?? contentPaddingTop ?? 40}px`,
            '--content-padding-top-tablet': `${contentPaddingTop?.tablet ?? 32}px`,
            '--content-padding-top-mobile': `${contentPaddingTop?.mobile ?? 24}px`,
            '--content-padding-top-watch': `${contentPaddingTop?.smartwatch ?? 16}px`,
            '--content-padding-right': `${contentPaddingRight?.desktop ?? contentPaddingRight ?? 0}px`,
            '--content-padding-bottom': `${contentPaddingBottom?.desktop ?? contentPaddingBottom ?? 40}px`,
            '--content-padding-bottom-tablet': `${contentPaddingBottom?.tablet ?? 32}px`,
            '--content-padding-bottom-mobile': `${contentPaddingBottom?.mobile ?? 24}px`,
            '--content-padding-bottom-watch': `${contentPaddingBottom?.smartwatch ?? 16}px`,
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
                title: __('New Tab', 'tabs-block'),
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
                <PanelBody title={__('Tabs', 'tabs-block')} initialOpen={true}>
                    <p style={helpTextStyle}>
                        {__('The highlighted tab is shown in the editor preview — click "Show" to edit another tab\'s content.', 'tabs-block')}
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
                                    {sprintf(__('Tab %d', 'tabs-block'), index + 1)}
                                </strong>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    <Button
                                        isSmall
                                        variant={activeTab === index ? 'primary' : 'secondary'}
                                        onClick={() => setAttributes({ activeTab: index })}
                                        aria-pressed={activeTab === index}
                                    >
                                        {activeTab === index ? __('Showing', 'tabs-block') : __('Show', 'tabs-block')}
                                    </Button>
                                    <Button
                                        icon={arrowUp}
                                        isSmall
                                        onClick={() => moveTab(index, -1)}
                                        disabled={index === 0}
                                        label={__('Move tab up', 'tabs-block')}
                                    />
                                    <Button
                                        icon={arrowDown}
                                        isSmall
                                        onClick={() => moveTab(index, 1)}
                                        disabled={index === tabs.length - 1}
                                        label={__('Move tab down', 'tabs-block')}
                                    />
                                    <Button
                                        icon={trash}
                                        isSmall
                                        isDestructive
                                        onClick={() => removeTab(index)}
                                        disabled={tabs.length <= 1}
                                        label={__('Remove tab', 'tabs-block')}
                                    />
                                </div>
                            </div>
                            <TextControl
                                label={__('Title', 'tabs-block')}
                                hideLabelFromVision
                                placeholder={__('Tab title…', 'tabs-block')}
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
                        {__('Add Tab', 'tabs-block')}
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
                            label={__('First Tab Shown', 'tabs-block')}
                            value={activeTab}
                            options={(tabs || []).map((tab, index) => ({
                                label: `${index + 1}. ${tab.title}`,
                                value: index
                            }))}
                            onChange={(value) => setAttributes({ activeTab: parseInt(value) })}
                            help={__('The tab visitors see first when the page loads.', 'tabs-block')}
                        />
                    </div>
                </PanelBody>

                {/* ————— LAYOUT TAB: Layout ————— */}
                <PanelBody title={__('Layout', 'tabs-block')} initialOpen={false}>
                    <p style={sectionLabel}>{__('Tab Design', 'tabs-block')}</p>
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

                    <p style={sectionLabel}>{__('Orientation', 'tabs-block')}</p>
                    <ButtonGroup>
                        {[
                            { label: __('Horizontal', 'tabs-block'), value: 'horizontal' },
                            { label: __('Vertical', 'tabs-block'), value: 'vertical' },
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
                            ? __('Tab titles sit beside the content.', 'tabs-block')
                            : __('Tab titles sit in a row above or below the content.', 'tabs-block')}
                    </p>

                    <p style={sectionLabel}>{__('Tab Bar Position', 'tabs-block')}</p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        {(isVertical
                            ? [
                                { label: __('Left of Content', 'tabs-block'), value: 'left' },
                                { label: __('Right of Content', 'tabs-block'), value: 'right' },
                            ]
                            : [
                                { label: __('Above Content', 'tabs-block'), value: 'top' },
                                { label: __('Below Content', 'tabs-block'), value: 'bottom' },
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
                        label={__('Tab Alignment', 'tabs-block')}
                        value={tabsAlign}
                        options={isVertical ? VERTICAL_ALIGN_OPTIONS : HORIZONTAL_ALIGN_OPTIONS}
                        onChange={(v) => setAttributes({ tabsAlign: v })}
                        help={isVertical
                            ? __('How tab buttons are distributed in the side column.', 'tabs-block')
                            : __('How tab titles are aligned along the tab bar.', 'tabs-block')}
                    />

                    <RangeControl
                        label={__('Space Between Tabs (px)', 'tabs-block')}
                        value={numValue(tabGap, 32)}
                        onChange={(v) => setAttributes({ tabGap: v })}
                        min={8}
                        max={80}
                    />

                    <p style={sectionLabel}>{__('Block Width', 'tabs-block')}</p>
                    <ButtonGroup>
                        {[
                            { label: __('Full Width', 'tabs-block'), value: 'full' },
                            { label: __('Constrained', 'tabs-block'), value: 'constrained' },
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
                            <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Max Width Device', 'tabs-block')} />
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <TextControl
                                    type="number"
                                    label={__('Max Width', 'tabs-block')}
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

                {/* ————— LAYOUT TAB: Animation (freemium-gated) ————— */}
                <PanelBody title={__('Animation', 'tabs-block')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('Controls how panels fade and slide when switching tabs.', 'tabs-block')}
                    </p>
                    {animationLocked && (
                        <UpgradeNotice
                            variant="full"
                            message={__('Upgrade to customize the animation and transition between tabs.', 'tabs-block')}
                        />
                    )}
                    <RangeControl
                        label={__('Duration (seconds)', 'tabs-block')}
                        value={animationDuration}
                        onChange={(v) => setAttributes({ animationDuration: v })}
                        min={0.1}
                        max={2}
                        step={0.1}
                        disabled={animationLocked}
                    />
                    <SelectControl
                        label={__('Transition Feel', 'tabs-block')}
                        value={animationEase}
                        options={EASE_OPTIONS}
                        onChange={(v) => setAttributes({ animationEase: v })}
                        disabled={animationLocked}
                    />
                </PanelBody>

                {/* ————— STYLE TAB: colors (auto-sorted by InspectorTabs) ————— */}
                {!isPills && (
                    <PanelBody title={__('Tab Colors', 'tabs-block')} initialOpen={false}>
                        <p style={sectionLabel}>{__('Title', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={tabTitleColor}
                            onChange={(v) => setAttributes({ tabTitleColor: v })}
                        />
                        <p style={sectionLabel}>{__('Title (Active Tab)', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={tabTitleActiveColor}
                            onChange={(v) => setAttributes({ tabTitleActiveColor: v })}
                        />
                        {isVertical && (
                            <>
                                <p style={sectionLabel}>{__('Active Tab Background', 'tabs-block')}</p>
                                <p style={helpTextStyle}>{__('Shown behind the selected tab button in vertical layout.', 'tabs-block')}</p>
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
                    <PanelBody title={__('Pill Colors', 'tabs-block')} initialOpen={false}>
                        <p style={helpTextStyle}>
                            {__('"Active" colors apply to the selected pill and on hover.', 'tabs-block')}
                        </p>
                        <p style={sectionLabel}>{__('Background', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={pillBackgroundColor}
                            onChange={(v) => setAttributes({ pillBackgroundColor: v })}
                        />
                        <p style={sectionLabel}>{__('Background (Active)', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={pillActiveBackgroundColor}
                            onChange={(v) => setAttributes({ pillActiveBackgroundColor: v })}
                        />
                        <p style={sectionLabel}>{__('Text', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={pillTextColor}
                            onChange={(v) => setAttributes({ pillTextColor: v })}
                        />
                        <p style={sectionLabel}>{__('Text (Active)', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={pillActiveTextColor}
                            onChange={(v) => setAttributes({ pillActiveTextColor: v })}
                        />
                        <p style={sectionLabel}>{__('Border', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={pillBorderColor}
                            onChange={(v) => setAttributes({ pillBorderColor: v })}
                        />
                        <p style={sectionLabel}>{__('Border (Active)', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={pillActiveBorderColor}
                            onChange={(v) => setAttributes({ pillActiveBorderColor: v })}
                        />
                    </PanelBody>
                )}

                {/* ————— STYLE TAB: typography ————— */}
                <PanelBody title={__('Typography', 'tabs-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Font Family', 'tabs-block')}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(v) => setAttributes({ fontFamily: v })}
                        help={__('Applies to the tab title labels.', 'tabs-block')}
                    />
                    <RangeControl
                        label={__('Title Size (px)', 'tabs-block')}
                        value={numValue(tabTitleFontSize, 18)}
                        onChange={(v) => setAttributes({ tabTitleFontSize: v })}
                        min={12}
                        max={48}
                    />
                    <p style={sectionLabel}>{__('Weight', 'tabs-block')}</p>
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
                    <p style={sectionLabel}>{__('Weight (Active Tab)', 'tabs-block')}</p>
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

                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Fine-tuning Device', 'tabs-block')} />
                    <UnitControl
                        label={__('Line Height', 'tabs-block')}
                        value={getDeviceValue(tabTitleLineHeight, deviceType, 'normal')}
                        onChange={(v) => setAttributes({ tabTitleLineHeight: updateDeviceAttribute(tabTitleLineHeight, deviceType, v) })}
                    />
                    <UnitControl
                        label={__('Letter Spacing', 'tabs-block')}
                        value={getDeviceValue(tabTitleLetterSpacing, deviceType, '-0.01em')}
                        onChange={(v) => setAttributes({ tabTitleLetterSpacing: updateDeviceAttribute(tabTitleLetterSpacing, deviceType, v) })}
                    />
                    <SelectControl
                        label={__('Text Case', 'tabs-block')}
                        value={getDeviceValue(tabTitleTextTransform, deviceType, 'none')}
                        options={TEXT_TRANSFORM_OPTIONS}
                        onChange={(v) => setAttributes({ tabTitleTextTransform: updateDeviceAttribute(tabTitleTextTransform, deviceType, v) })}
                    />
                </PanelBody>

                {/* ————— STYLE TAB: shape (mode-specific) ————— */}
                {!isPills && (
                    <PanelBody title={__('Underline Style', 'tabs-block')} initialOpen={false}>
                        <p style={helpTextStyle}>
                            {__('The animated line under the active tab (horizontal layout).', 'tabs-block')}
                        </p>
                        <RangeControl
                            label={__('Thickness (px)', 'tabs-block')}
                            value={numValue(underlineHeight, 3)}
                            onChange={(v) => setAttributes({ underlineHeight: v })}
                            min={1}
                            max={10}
                        />
                        <p style={sectionLabel}>{__('Color', 'tabs-block')}</p>
                        <BoundColorPalette
                            value={tabUnderlineColor}
                            onChange={(v) => setAttributes({ tabUnderlineColor: v })}
                        />
                    </PanelBody>
                )}

                {isPills && (
                    <PanelBody title={__('Pill Shape & Padding', 'tabs-block')} initialOpen={false}>
                        <SelectControl
                            label={__('Pill Style', 'tabs-block')}
                            value={pillStyle}
                            options={PILL_STYLES}
                            onChange={(v) => setAttributes({ pillStyle: v })}
                        />
                        <RangeControl
                            label={__('Corner Roundness (px)', 'tabs-block')}
                            value={pillBorderRadius}
                            onChange={(v) => setAttributes({ pillBorderRadius: v })}
                            min={0}
                            max={50}
                        />
                        <p style={sectionLabel}>{__('Padding Inside Each Pill', 'tabs-block')}</p>
                        <div style={twoColGrid}>
                            <RangeControl
                                label={__('Top', 'tabs-block')}
                                value={pillPadding?.top ?? 12}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, top: v } })}
                                min={0}
                                max={32}
                            />
                            <RangeControl
                                label={__('Right', 'tabs-block')}
                                value={pillPadding?.right ?? 24}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, right: v } })}
                                min={0}
                                max={48}
                            />
                            <RangeControl
                                label={__('Bottom', 'tabs-block')}
                                value={pillPadding?.bottom ?? 12}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, bottom: v } })}
                                min={0}
                                max={32}
                            />
                            <RangeControl
                                label={__('Left', 'tabs-block')}
                                value={pillPadding?.left ?? 24}
                                onChange={(v) => setAttributes({ pillPadding: { ...pillPadding, left: v } })}
                                min={0}
                                max={48}
                            />
                        </div>
                    </PanelBody>
                )}

                {/* ————— STYLE TAB: content area ————— */}
                <PanelBody title={__('Content Area Styling', 'tabs-block')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('The panel that holds each tab\'s content.', 'tabs-block')}
                    </p>
                    <p style={sectionLabel}>{__('Background', 'tabs-block')}</p>
                    <BoundColorPalette
                        value={contentBackgroundColor}
                        onChange={(v) => setAttributes({ contentBackgroundColor: v })}
                    />
                    <RangeControl
                        label={__('Corner Roundness (px)', 'tabs-block')}
                        value={contentBorderRadius}
                        onChange={(v) => setAttributes({ contentBorderRadius: v })}
                        min={0}
                        max={32}
                    />
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Width Device', 'tabs-block')} />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <TextControl
                            type="number"
                            label={__('Content Width', 'tabs-block')}
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
                    <p style={{ ...sectionLabel, marginTop: '16px' }}>{__('Padding Around Content', 'tabs-block')}</p>
                    <div style={twoColGrid}>
                        <RangeControl
                            label={__('Top', 'tabs-block')}
                            value={numValue(contentPaddingTop, 40)}
                            onChange={(v) => setAttributes({ contentPaddingTop: v })}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Right', 'tabs-block')}
                            value={numValue(contentPaddingRight, 0)}
                            onChange={(v) => setAttributes({ contentPaddingRight: v })}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Bottom', 'tabs-block')}
                            value={numValue(contentPaddingBottom, 40)}
                            onChange={(v) => setAttributes({ contentPaddingBottom: v })}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Left', 'tabs-block')}
                            value={numValue(contentPaddingLeft, 0)}
                            onChange={(v) => setAttributes({ contentPaddingLeft: v })}
                            min={0}
                            max={120}
                        />
                    </div>
                </PanelBody>

                {/* ————— STYLE TAB: wrapper ————— */}
                <PanelBody title={__('Wrapper Spacing', 'tabs-block')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('The outer box around the tab bar and content together.', 'tabs-block')}
                    </p>
                    <p style={sectionLabel}>{__('Background', 'tabs-block')}</p>
                    <BoundColorPalette
                        value={wrapperBackgroundColor}
                        onChange={(v) => setAttributes({ wrapperBackgroundColor: v })}
                    />
                    <DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Padding Device', 'tabs-block')} />
                    <div style={twoColGrid}>
                        <RangeControl
                            label={__('Top', 'tabs-block')}
                            value={wrapperPadding?.[deviceType]?.top ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'top', v)}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Right', 'tabs-block')}
                            value={wrapperPadding?.[deviceType]?.right ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'right', v)}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Bottom', 'tabs-block')}
                            value={wrapperPadding?.[deviceType]?.bottom ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'bottom', v)}
                            min={0}
                            max={120}
                        />
                        <RangeControl
                            label={__('Left', 'tabs-block')}
                            value={wrapperPadding?.[deviceType]?.left ?? 0}
                            onChange={(v) => updateWrapperPadding(deviceType, 'left', v)}
                            min={0}
                            max={120}
                        />
                    </div>
                </PanelBody>

                {/* ————— STYLE TAB: margins ————— */}
                <PanelBody title={__('Margins', 'tabs-block')} initialOpen={false}>
                    <p style={helpTextStyle}>
                        {__('Space between this block and the blocks around it.', 'tabs-block')}
                    </p>
                    <div style={twoColGrid}>
                        <RangeControl
                            label={__('Top', 'tabs-block')}
                            value={numValue(marginTop, 0)}
                            onChange={(v) => setAttributes({ marginTop: v })}
                            min={0}
                            max={200}
                        />
                        <RangeControl
                            label={__('Right', 'tabs-block')}
                            value={numValue(marginRight, 0)}
                            onChange={(v) => setAttributes({ marginRight: v })}
                            min={0}
                            max={200}
                        />
                        <RangeControl
                            label={__('Bottom', 'tabs-block')}
                            value={numValue(marginBottom, 0)}
                            onChange={(v) => setAttributes({ marginBottom: v })}
                            min={0}
                            max={200}
                        />
                        <RangeControl
                            label={__('Left', 'tabs-block')}
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
                                            label={__('Tab Title', 'tabs-block')}
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
