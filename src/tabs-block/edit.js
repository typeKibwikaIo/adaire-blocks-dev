import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls, useInnerBlocksProps } from '@wordpress/block-editor';
import { 
    PanelBody, 
    RangeControl, 
    ColorPalette, 
    Button, 
    ButtonGroup, 
    TextControl,
    SelectControl,
    ColorPicker
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';

const ALIGN_OPTIONS = [
    { label: __('Left', 'tabs-block'), value: 'flex-start' },
    { label: __('Center', 'tabs-block'), value: 'center' },
    { label: __('Right', 'tabs-block'), value: 'flex-end' },
    { label: __('Space Between', 'tabs-block'), value: 'space-between' },
];

const EASE_OPTIONS = [
    { label: 'power2.out', value: 'power2.out' },
    { label: 'power3.out', value: 'power3.out' },
    { label: 'power4.out', value: 'power4.out' },
    { label: 'elastic.out', value: 'elastic.out(1, 0.5)' },
    { label: 'back.out', value: 'back.out(1.2)' },
];

const FREE_TIER_ITEM_LIMIT = 3;

export default function Edit({ attributes, setAttributes, clientId }) {
    const [deviceType, setDeviceType] = useState('desktop');
    
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

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    // Helper function to ensure we have a valid color with opacity
    const getBackgroundColor = (color) => {
        if (!color) return 'rgba(59, 130, 246, 0.05)';
        return color;
    };

    const blockProps = useBlockProps({
        className: 'adaire-tabs',
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

    // Template for tab panel blocks
    const ALLOWED_BLOCKS = ['create-block/tab-panel-block'];
    const TEMPLATE = tabs.map((tab, index) => [
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
            <InspectorControls>
                <PanelBody title={__('Container Settings', 'tabs-block')} initialOpen={true}>
                    <ButtonGroup>
                        {[
                            { label: __('Full width', 'tabs-block'), value: 'full' },
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
                        <>
                            <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                                {__('Max Width', 'tabs-block')}
                            </p>
                            <ButtonGroup style={{ marginBottom: '12px' }}>
                                <Button
                                    icon={desktop}
                                    isPrimary={deviceType === 'desktop'}
                                    onClick={() => setDeviceType('desktop')}
                                    label={__('Desktop', 'tabs-block')}
                                />
                                <Button
                                    icon={tablet}
                                    isPrimary={deviceType === 'tablet'}
                                    onClick={() => setDeviceType('tablet')}
                                    label={__('Tablet', 'tabs-block')}
                                />
                                <Button
                                    icon={mobile}
                                    isPrimary={deviceType === 'mobile'}
                                    onClick={() => setDeviceType('mobile')}
                                    label={__('Mobile', 'tabs-block')}
                                />
                            </ButtonGroup>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <TextControl
                                    type="number"
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
                        </>
                    )}
                </PanelBody>

                <PanelBody title={__('Tabs', 'tabs-block')} initialOpen={true}>
                    <SelectControl
                        label={__('Initial Active Tab', 'tabs-block')}
                        value={activeTab}
                        options={tabs.map((tab, index) => ({
                            label: `${index + 1}. ${tab.title}`,
                            value: index
                        }))}
                        onChange={(value) => setAttributes({ activeTab: parseInt(value) })}
                        help={__('Choose which tab should be active when the page loads', 'tabs-block')}
                    />
                    <Button 
                        isPrimary 
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
                        {tabs.map((tab, index) => (
                            <div key={tab.id} style={{ 
                                marginBottom: '12px', 
                                padding: '12px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: activeTab === index ? '#f0f9ff' : '#fff'
                            }}>
                                <TextControl
                                    label={__('Tab Title', 'tabs-block')}
                                    value={tab.title}
                                    onChange={(v) => updateTab(index, { title: v })}
                                />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <Button
                                        isSmall
                                        onClick={() => setAttributes({ activeTab: index })}
                                        variant={activeTab === index ? 'primary' : 'secondary'}
                                    >
                                        {activeTab === index ? __('Active', 'tabs-block') : __('Set Active', 'tabs-block')}
                                    </Button>
                                    <Button
                                        isSmall
                                        onClick={() => moveTab(index, -1)}
                                        disabled={index === 0}
                                    >â†‘</Button>
                                    <Button
                                        isSmall
                                        onClick={() => moveTab(index, 1)}
                                        disabled={index === tabs.length - 1}
                                    >â†“</Button>
                                    <Button
                                        isSmall
                                        isDestructive
                                        onClick={() => removeTab(index)}
                                        disabled={tabs.length <= 1}
                                    >
                                        {__('Remove', 'tabs-block')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </PanelBody>

                <PanelBody title={__('Tab Styling', 'tabs-block')} initialOpen={false}>
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
                    <ButtonGroup>
                        {tabLayout === 'horizontal' ? (
                            [
                                { label: __('Above Content', 'tabs-block'), value: 'top' },
                                { label: __('Below Content', 'tabs-block'), value: 'bottom' },
                            ].map(opt => (
                                <Button
                                    key={opt.value}
                                    isPrimary={tabPosition === opt.value}
                                    isSecondary={tabPosition !== opt.value}
                                    onClick={() => setAttributes({ tabPosition: opt.value })}
                                >{opt.label}</Button>
                            ))
                        ) : (
                            [
                                { label: __('Left of Content', 'tabs-block'), value: 'left' },
                                { label: __('Right of Content', 'tabs-block'), value: 'right' },
                            ].map(opt => (
                                <Button
                                    key={opt.value}
                                    isPrimary={tabPosition === opt.value}
                                    isSecondary={tabPosition !== opt.value}
                                    onClick={() => setAttributes({ tabPosition: opt.value })}
                                >{opt.label}</Button>
                            ))
                        )}
                    </ButtonGroup>
                    {tabLayout === 'horizontal' && (
                        <SelectControl
                            label={__('Tab Alignment (Horizontal)', 'tabs-block')}
                            value={tabsAlign}
                            options={ALIGN_OPTIONS}
                            onChange={(v) => setAttributes({ tabsAlign: v })}
                            help={__('Alignment of tabs in horizontal layout', 'tabs-block')}
                        />
                    )}
                    {tabLayout === 'vertical' && (
                        <>
                            <SelectControl
                                label={__('Tab Alignment (Vertical)', 'tabs-block')}
                                value={tabsAlign}
                                options={[
                                    { label: __('Top', 'tabs-block'), value: 'flex-start' },
                                    { label: __('Center', 'tabs-block'), value: 'center' },
                                    { label: __('Bottom', 'tabs-block'), value: 'flex-end' },
                                    { label: __('Space Between', 'tabs-block'), value: 'space-between' },
                                ]}
                                onChange={(v) => setAttributes({ tabsAlign: v })}
                                help={__('Vertical alignment of tab buttons', 'tabs-block')}
                            />
                            <p>{__('Active Tab Background Color', 'tabs-block')}</p>
                            <ColorPicker
                                color={verticalActiveBgColor}
                                onChange={(color) => setAttributes({ verticalActiveBgColor: color })}
                                enableAlpha
                            />
                        </>
                    )}
                    <RangeControl
                        label={__('Title Font Size', 'tabs-block')}
                        value={tabTitleFontSize}
                        onChange={(v) => setAttributes({ tabTitleFontSize: v })}
                        min={12}
                        max={48}
                    />
                    <RangeControl
                        label={__('Tab Gap', 'tabs-block')}
                        value={tabGap}
                        onChange={(v) => setAttributes({ tabGap: v })}
                        min={8}
                        max={80}
                    />
                    <p>{__('Normal Weight', 'tabs-block')}</p>
                    <ButtonGroup>
                        {['300', '400', '500', '600', '700', '800'].map((weight) => (
                            <Button
                                key={weight}
                                isPrimary={tabTitleFontWeight === weight}
                                isSecondary={tabTitleFontWeight !== weight}
                                onClick={() => setAttributes({ tabTitleFontWeight: weight })}
                            >{weight}</Button>
                        ))}
                    </ButtonGroup>
                    <p>{__('Active Weight', 'tabs-block')}</p>
                    <ButtonGroup>
                        {['300', '400', '500', '600', '700', '800'].map((weight) => (
                            <Button
                                key={weight}
                                isPrimary={tabTitleActiveFontWeight === weight}
                                isSecondary={tabTitleActiveFontWeight !== weight}
                                onClick={() => setAttributes({ tabTitleActiveFontWeight: weight })}
                            >{weight}</Button>
                        ))}
                    </ButtonGroup>
                </PanelBody>

                <PanelBody title={__('Underline', 'tabs-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Underline Height', 'tabs-block')}
                        value={underlineHeight}
                        onChange={(v) => setAttributes({ underlineHeight: v })}
                        min={1}
                        max={10}
                    />
                    <p>{__('Underline Color', 'tabs-block')}</p>
                    <ColorPalette 
                        value={tabUnderlineColor} 
                        onChange={(v) => setAttributes({ tabUnderlineColor: v })} 
                    />
                </PanelBody>

                <PanelBody title={__('Colors', 'tabs-block')} initialOpen={false}>
                    <p>{__('Tab Title (Inactive)', 'tabs-block')}</p>
                    <ColorPalette 
                        value={tabTitleColor} 
                        onChange={(v) => setAttributes({ tabTitleColor: v })} 
                    />
                    <p>{__('Tab Title (Active)', 'tabs-block')}</p>
                    <ColorPalette 
                        value={tabTitleActiveColor} 
                        onChange={(v) => setAttributes({ tabTitleActiveColor: v })} 
                    />
                </PanelBody>

                <PanelBody title={__('Content Spacing', 'tabs-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Padding Top', 'tabs-block')}
                        value={contentPaddingTop}
                        onChange={(v) => setAttributes({ contentPaddingTop: v })}
                        min={0}
                        max={120}
                    />
                    <RangeControl
                        label={__('Padding Right', 'tabs-block')}
                        value={contentPaddingRight}
                        onChange={(v) => setAttributes({ contentPaddingRight: v })}
                        min={0}
                        max={120}
                    />
                    <RangeControl
                        label={__('Padding Bottom', 'tabs-block')}
                        value={contentPaddingBottom}
                        onChange={(v) => setAttributes({ contentPaddingBottom: v })}
                        min={0}
                        max={120}
                    />
                    <RangeControl
                        label={__('Padding Left', 'tabs-block')}
                        value={contentPaddingLeft}
                        onChange={(v) => setAttributes({ contentPaddingLeft: v })}
                        min={0}
                        max={120}
                    />
                </PanelBody>

                <PanelBody title={__('Margins', 'tabs-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Margin Top', 'tabs-block')}
                        value={marginTop}
                        onChange={(v) => setAttributes({ marginTop: v })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Margin Right', 'tabs-block')}
                        value={marginRight}
                        onChange={(v) => setAttributes({ marginRight: v })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Margin Bottom', 'tabs-block')}
                        value={marginBottom}
                        onChange={(v) => setAttributes({ marginBottom: v })}
                        min={0}
                        max={200}
                    />
                    <RangeControl
                        label={__('Margin Left', 'tabs-block')}
                        value={marginLeft}
                        onChange={(v) => setAttributes({ marginLeft: v })}
                        min={0}
                        max={200}
                    />
                </PanelBody>

                <PanelBody title={__('Animation', 'tabs-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Duration (seconds)', 'tabs-block')}
                        value={animationDuration}
                        onChange={(v) => setAttributes({ animationDuration: v })}
                        min={0.1}
                        max={2}
                        step={0.1}
                    />
                    <SelectControl
                        label={__('Easing', 'tabs-block')}
                        value={animationEase}
                        options={EASE_OPTIONS}
                        onChange={(v) => setAttributes({ animationEase: v })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} data-block-id={blockId} data-active-tab={activeTab} data-tab-layout={tabLayout} data-tab-position={tabPosition}>
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
                                    onClick={() => setAttributes({ activeTab: index })}
                                    role="tab"
                                    aria-selected={activeTab === index}
                                >
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                        <div className="adaire-tabs__underline" />
                    </div>

                    <div className="adaire-tabs__content-wrapper">
                        <div {...innerBlocksProps} />
                    </div>
                </div>
            </div>
        </>
    );
}



