import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, BaseControl, ToggleControl, SelectControl } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useEffect, useMemo, useState, createElement } from '@wordpress/element';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
import AdaireColorControl from '../components/AdaireColorControl';

// ── Icon helpers ───────────────────────────────────────────────────────────────

const smallLaptopIcon = createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    createElement('path', { d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z', stroke: 'currentColor', strokeWidth: '1.5', fill: 'none' }),
    createElement('path', { d: 'M2 19H22', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' })
);
const bigDesktopIcon = createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    createElement('rect', { x: '3', y: '4', width: '18', height: '12', rx: '1', stroke: 'currentColor', strokeWidth: '1.5', fill: 'none' }),
    createElement('path', { d: 'M8 20H16', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' }),
    createElement('rect', { x: '10', y: '20', width: '4', height: '2', rx: '0.5', fill: 'currentColor' })
);

const MODAL_TIERS = [
    { key: 'mobile',      label: 'Mobile',       icon: mobile },
    { key: 'tablet',      label: 'Tablet',        icon: tablet },
    { key: 'smallLaptop', label: 'Small Laptop',  icon: smallLaptopIcon },
    { key: 'desktop',     label: 'Desktop',       icon: desktop },
    { key: 'bigDesktop',  label: 'Big Desktop',   icon: bigDesktopIcon },
];

const TEMPLATE      = [['create-block/modal-trigger-block'], ['create-block/modal-content-block']];
const ALLOWED_BLOCKS = ['create-block/modal-trigger-block', 'create-block/modal-content-block'];

// ── VisualPicker ─────────────────────────────────────────────────────────────
// Renders a row/grid of icon+label buttons; selected item gets a highlighted ring.
function VisualPicker({ options, value, onChange, columns = 0 }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: columns > 0 ? `repeat(${columns}, 1fr)` : `repeat(auto-fill, minmax(56px, 1fr))`,
            gap: '6px',
            marginTop: '8px',
        }}>
            {options.map((opt) => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        title={opt.label}
                        onClick={() => onChange(opt.value)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            padding: '8px 4px 6px',
                            background: active ? '#eef2ff' : '#f8fafc',
                            color: active ? '#4338ca' : '#64748b',
                            border: `2px solid ${active ? '#6366f1' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: active ? 700 : 500,
                            lineHeight: 1.2,
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

// ── Position icons ─────────────────────────────────────────────────────────────

const PosIcon = ({ children }) => (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="34" height="26" rx="3" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
        {children}
    </svg>
);

const POSITION_OPTIONS = [
    {
        value: 'center', label: 'Center',
        icon: <PosIcon><rect x="11" y="8" width="14" height="12" rx="2" fill="currentColor" opacity="0.9"/></PosIcon>,
    },
    {
        value: 'top', label: 'Top',
        icon: <PosIcon><rect x="11" y="3" width="14" height="10" rx="2" fill="currentColor" opacity="0.9"/></PosIcon>,
    },
    {
        value: 'bottom-sheet', label: 'Sheet',
        icon: <PosIcon><rect x="2" y="16" width="32" height="10" rx="2 2 0 0" fill="currentColor" opacity="0.9"/></PosIcon>,
    },
    {
        value: 'drawer-right', label: 'Right',
        icon: <PosIcon><rect x="22" y="2" width="12" height="24" rx="2 0 0 2" fill="currentColor" opacity="0.9"/></PosIcon>,
    },
    {
        value: 'drawer-left', label: 'Left',
        icon: <PosIcon><rect x="2" y="2" width="12" height="24" rx="0 2 2 0" fill="currentColor" opacity="0.9"/></PosIcon>,
    },
];

// ── Animation icons ────────────────────────────────────────────────────────────

const AnimIcon = ({ children }) => (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {children}
    </svg>
);

const ANIMATION_OPTIONS = [
    {
        value: 'fade', label: 'Fade',
        icon: <AnimIcon>
            <rect x="6" y="5" width="16" height="14" rx="2" fill="currentColor" opacity="0.25"/>
            <rect x="6" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
        </AnimIcon>,
    },
    {
        value: 'slide-up', label: 'Slide ↑',
        icon: <AnimIcon>
            <rect x="6" y="7" width="16" height="12" rx="2" fill="currentColor" opacity="0.9"/>
            <path d="M14 5 L14 1 M14 1 L11 4 M14 1 L17 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </AnimIcon>,
    },
    {
        value: 'slide-down', label: 'Slide ↓',
        icon: <AnimIcon>
            <rect x="6" y="5" width="16" height="12" rx="2" fill="currentColor" opacity="0.9"/>
            <path d="M14 19 L14 23 M14 23 L11 20 M14 23 L17 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </AnimIcon>,
    },
    {
        value: 'zoom-in', label: 'Zoom in',
        icon: <AnimIcon>
            <rect x="8" y="6" width="12" height="12" rx="2" fill="currentColor" opacity="0.4"/>
            <rect x="5" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
            <path d="M5 4 L9 8 M23 4 L19 8 M5 20 L9 16 M23 20 L19 16" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        </AnimIcon>,
    },
    {
        value: 'zoom-out', label: 'Zoom out',
        icon: <AnimIcon>
            <rect x="5" y="4" width="18" height="16" rx="2" fill="currentColor" opacity="0.4"/>
            <rect x="8" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
            <path d="M5 4 L9 8 M23 4 L19 8 M5 20 L9 16 M23 20 L19 16" stroke="currentColor" strokeWidth="1" opacity="0.6" transform="scale(-1,-1) translate(-28,-24)"/>
        </AnimIcon>,
    },
    {
        value: 'bounce', label: 'Bounce',
        icon: <AnimIcon>
            <rect x="7" y="5" width="14" height="12" rx="2" fill="currentColor" opacity="0.9"/>
            <path d="M10 20 Q14 16 18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </AnimIcon>,
    },
    {
        value: 'none', label: 'None',
        icon: <AnimIcon>
            <rect x="6" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 2"/>
            <path d="M9 12 H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        </AnimIcon>,
    },
];

// ── Close button shape icons ───────────────────────────────────────────────────

const CLOSE_SHAPE_OPTIONS = [
    {
        value: 'circle', label: 'Circle',
        icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M10 10 L18 18 M18 10 L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
        value: 'rounded', label: 'Rounded',
        icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="4" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.8"/><path d="M10 10 L18 18 M18 10 L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
        value: 'square', label: 'Square',
        icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M10 10 L18 18 M18 10 L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
];

// ── Close button position icons ────────────────────────────────────────────────

const ClosePosIcon = ({ x, y, outside }) => (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
        <circle cx={x} cy={y} r="4" fill="currentColor" opacity={outside ? 1 : 0.9}/>
        <path d={`M${x-2} ${y-2} L${x+2} ${y+2} M${x+2} ${y-2} L${x-2} ${y+2}`} stroke={outside ? '#fff' : '#fff'} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
);

const CLOSE_POSITION_OPTIONS = [
    { value: 'top-right',    label: 'In — TR',   icon: <ClosePosIcon x={27} y={7}  outside={false}/> },
    { value: 'top-left',     label: 'In — TL',   icon: <ClosePosIcon x={9}  y={7}  outside={false}/> },
    { value: 'outside-right',label: 'Out — TR',  icon: <ClosePosIcon x={31} y={3}  outside={true}/> },
    { value: 'outside-left', label: 'Out — TL',  icon: <ClosePosIcon x={5}  y={3}  outside={true}/> },
];

// ── Dimension helpers ─────────────────────────────────────────────────────────

const unitOptionsWidth  = ['px', 'vw', 'rem'];
const unitOptionsHeight = ['px', 'vh', '%'];

const formatSize = (size, fallbackValue, fallbackUnit) => {
    if (!size) return `${fallbackValue}${fallbackUnit}`;
    const { value, unit } = size;
    return `${typeof value === 'number' ? value : fallbackValue}${unit || fallbackUnit}`;
};

const normalizeDimension = (dimension, defaults) => {
    if (typeof dimension === 'object' && dimension !== null) {
        return {
            mobile:      { value: dimension?.mobile?.value      ?? defaults.mobile.value,      unit: dimension?.mobile?.unit      ?? defaults.mobile.unit },
            tablet:      { value: dimension?.tablet?.value      ?? defaults.tablet.value,      unit: dimension?.tablet?.unit      ?? defaults.tablet.unit },
            smallLaptop: { value: dimension?.smallLaptop?.value ?? defaults.smallLaptop?.value ?? defaults.desktop.value, unit: dimension?.smallLaptop?.unit ?? defaults.smallLaptop?.unit ?? defaults.desktop.unit },
            desktop:     { value: dimension?.desktop?.value     ?? defaults.desktop.value,     unit: dimension?.desktop?.unit     ?? defaults.desktop.unit },
            bigDesktop:  { value: dimension?.bigDesktop?.value  ?? defaults.bigDesktop?.value  ?? defaults.desktop.value, unit: dimension?.bigDesktop?.unit  ?? defaults.bigDesktop?.unit  ?? defaults.desktop.unit },
        };
    }
    return defaults;
};

// ── Main edit component ────────────────────────────────────────────────────────

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        modalWidth, modalHeight,
        backgroundColor, overlayColor,
        borderColor, borderWidth, borderRadius, padding,
        closeButtonColor, closeButtonBackground, closeButtonSize,
        animationType, animationDuration, animationEasing,
        modalPosition,
        closeButtonPosition, closeButtonShape, showCloseButton,
        boxShadowEnabled,
        backdropBlurEnabled, backdropBlurAmount,
        autoOpen, autoOpenDelay,
        overlayClickClose,
    } = attributes;

    const [deviceType, setDeviceType] = useState('desktop');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        if (!blockId) setAttributes({ blockId: clientId });
    }, [blockId, clientId, setAttributes]);

    const defaults = useMemo(() => ({
        width: {
            mobile:      { value: 90,  unit: 'vw' },
            tablet:      { value: 90,  unit: 'vw' },
            smallLaptop: { value: 600, unit: 'px' },
            desktop:     { value: 600, unit: 'px' },
            bigDesktop:  { value: 600, unit: 'px' },
        },
        height: {
            mobile:      { value: 360, unit: 'px' },
            tablet:      { value: 400, unit: 'px' },
            smallLaptop: { value: 400, unit: 'px' },
            desktop:     { value: 400, unit: 'px' },
            bigDesktop:  { value: 400, unit: 'px' },
        },
    }), []);

    const normalizedWidth  = normalizeDimension(modalWidth,  defaults.width);
    const normalizedHeight = normalizeDimension(modalHeight, defaults.height);

    const handleDimensionChange = (dimension, device, key, value) => {
        const current = dimension === 'width' ? normalizedWidth : normalizedHeight;
        setAttributes({
            [dimension === 'width' ? 'modalWidth' : 'modalHeight']: {
                ...current,
                [device]: { ...current[device], [key]: value },
            },
        });
    };

    const currentWidthUnit  = normalizedWidth?.[deviceType]?.unit  ?? (deviceType === 'mobile' || deviceType === 'tablet' ? 'vw' : 'px');
    const currentHeightUnit = normalizedHeight?.[deviceType]?.unit ?? 'px';

    const blockProps = useBlockProps({
        className: `adaire-modal-block${isPreviewOpen ? ' is-preview-open' : ''}`,
        style: {
            '--modal-width-mobile':        formatSize(normalizedWidth.mobile,      90,  'vw'),
            '--modal-width-tablet':        formatSize(normalizedWidth.tablet,      90,  'vw'),
            '--modal-width-small-laptop':  formatSize(normalizedWidth.smallLaptop, 600, 'px'),
            '--modal-width-desktop':       formatSize(normalizedWidth.desktop,     600, 'px'),
            '--modal-width-big-desktop':   formatSize(normalizedWidth.bigDesktop,  600, 'px'),
            '--modal-height-mobile':       formatSize(normalizedHeight.mobile,      360, 'px'),
            '--modal-height-tablet':       formatSize(normalizedHeight.tablet,      400, 'px'),
            '--modal-height-small-laptop': formatSize(normalizedHeight.smallLaptop, 400, 'px'),
            '--modal-height-desktop':      formatSize(normalizedHeight.desktop,     400, 'px'),
            '--modal-height-big-desktop':  formatSize(normalizedHeight.bigDesktop,  400, 'px'),
            '--modal-background':          backgroundColor          || '#ffffff',
            '--modal-overlay-color':       overlayColor             || 'rgba(0, 0, 0, 0.6)',
            '--modal-border-color':        borderColor              || '#e0e0e0',
            '--modal-border-width':       `${borderWidth            ?? 1}px`,
            '--modal-border-radius':      `${borderRadius           ?? 16}px`,
            '--modal-padding':            `${padding                ?? 24}px`,
            '--modal-close-color':         closeButtonColor         || '#111111',
            '--modal-close-bg':            closeButtonBackground    || 'rgba(255,255,255,0.9)',
            '--modal-close-size':         `${closeButtonSize        ?? 36}px`,
            '--modal-animation-duration': `${animationDuration      ?? 300}ms`,
            '--modal-animation-easing':    animationEasing          || 'ease-out',
            '--modal-backdrop-blur':       backdropBlurEnabled       ? `${backdropBlurAmount ?? 8}px` : '0px',
            '--modal-box-shadow':          boxShadowEnabled !== false ? '0 32px 80px rgba(15, 23, 42, 0.35)' : 'none',
        },
        'data-modal-block':     true,
        'data-preview-open':    isPreviewOpen,
        'data-modal-anim':      animationType       || 'fade',
        'data-modal-position':  modalPosition       || 'center',
        'data-close-pos':       closeButtonPosition || 'top-right',
        'data-close-shape':     closeButtonShape    || 'circle',
        'data-auto-open':       autoOpen            || 'none',
        'data-auto-open-delay': autoOpenDelay       ?? 3,
        'data-overlay-close':   overlayClickClose   !== false ? 'true' : 'false',
        'data-show-close':      showCloseButton     !== false ? 'true' : 'false',
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-modal-block__inner-blocks' },
        { allowedBlocks: ALLOWED_BLOCKS, template: TEMPLATE, templateLock: 'insert', orientation: 'vertical' }
    );

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>

                {/* ─── CONTENT TAB ─── */}
                <PanelBody section="content" title={__('Auto-Open', 'modal-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Open trigger', 'modal-block')}
                        value={autoOpen || 'none'}
                        options={[
                            { label: __('Manual — button click only', 'modal-block'), value: 'none' },
                            { label: __('Page load — opens after a delay', 'modal-block'), value: 'delay' },
                            { label: __('Exit intent — cursor leaves viewport', 'modal-block'), value: 'exit-intent' },
                        ]}
                        onChange={(value) => setAttributes({ autoOpen: value })}
                    />
                    {autoOpen === 'delay' && (
                        <RangeControl
                            label={__('Delay (seconds)', 'modal-block')}
                            value={autoOpenDelay ?? 3}
                            onChange={(value) => setAttributes({ autoOpenDelay: value })}
                            min={0} max={30} step={0.5}
                        />
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Behavior', 'modal-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Close on overlay click', 'modal-block')}
                        checked={overlayClickClose !== false}
                        onChange={(value) => setAttributes({ overlayClickClose: value })}
                    />
                    <ToggleControl
                        label={__('Show close button', 'modal-block')}
                        checked={showCloseButton !== false}
                        onChange={(value) => setAttributes({ showCloseButton: value })}
                    />
                </PanelBody>

                <PanelBody section="content" title={__('Preview', 'modal-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Preview modal overlay', 'modal-block')}
                        checked={isPreviewOpen}
                        onChange={(value) => setIsPreviewOpen(value)}
                        help={__('See how the modal looks while editing.', 'modal-block')}
                    />
                </PanelBody>

                {/* ─── LAYOUT TAB ─── */}
                <PanelBody section="layout" title={__('Position', 'modal-block')} initialOpen={true}>
                    <BaseControl label={__('Where does the modal appear?', 'modal-block')}>
                        <VisualPicker
                            options={POSITION_OPTIONS}
                            value={modalPosition || 'center'}
                            onChange={(value) => setAttributes({ modalPosition: value })}
                            columns={5}
                        />
                    </BaseControl>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
                        {__('Bottom sheet and drawers always slide in from their edge.', 'modal-block')}
                    </p>
                </PanelBody>

                <PanelBody section="layout" title={__('Dimensions', 'modal-block')} initialOpen={false}>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={MODAL_TIERS}
                    />

                    <BaseControl label={__('Width', 'modal-block')} style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="number"
                                className="adaire-modal-block__dimension-input"
                                value={normalizedWidth?.[deviceType]?.value ?? ''}
                                onChange={(e) => handleDimensionChange('width', deviceType, 'value', Number(e.target.value))}
                                min={0}
                                style={{ flex: 1 }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {unitOptionsWidth.map((unit) => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => handleDimensionChange('width', deviceType, 'unit', unit)}
                                        style={{
                                            padding: '4px 7px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            border: `1.5px solid ${currentWidthUnit === unit ? '#6366f1' : '#e2e8f0'}`,
                                            borderRadius: '5px',
                                            background: currentWidthUnit === unit ? '#eef2ff' : '#f8fafc',
                                            color: currentWidthUnit === unit ? '#4338ca' : '#64748b',
                                            cursor: 'pointer',
                                        }}
                                    >{unit}</button>
                                ))}
                            </div>
                        </div>
                    </BaseControl>

                    <BaseControl label={__('Height', 'modal-block')} style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="number"
                                className="adaire-modal-block__dimension-input"
                                value={normalizedHeight?.[deviceType]?.value ?? ''}
                                onChange={(e) => handleDimensionChange('height', deviceType, 'value', Number(e.target.value))}
                                min={0}
                                style={{ flex: 1 }}
                            />
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {unitOptionsHeight.map((unit) => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => handleDimensionChange('height', deviceType, 'unit', unit)}
                                        style={{
                                            padding: '4px 7px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            border: `1.5px solid ${currentHeightUnit === unit ? '#6366f1' : '#e2e8f0'}`,
                                            borderRadius: '5px',
                                            background: currentHeightUnit === unit ? '#eef2ff' : '#f8fafc',
                                            color: currentHeightUnit === unit ? '#4338ca' : '#64748b',
                                            cursor: 'pointer',
                                        }}
                                    >{unit}</button>
                                ))}
                            </div>
                        </div>
                    </BaseControl>
                </PanelBody>

                <PanelBody section="layout" title={__('Close Button', 'modal-block')} initialOpen={false}>
                    <BaseControl label={__('Position', 'modal-block')}>
                        <VisualPicker
                            options={CLOSE_POSITION_OPTIONS}
                            value={closeButtonPosition || 'top-right'}
                            onChange={(value) => setAttributes({ closeButtonPosition: value })}
                            columns={4}
                        />
                    </BaseControl>
                    <BaseControl label={__('Shape', 'modal-block')} style={{ marginTop: '16px' }}>
                        <VisualPicker
                            options={CLOSE_SHAPE_OPTIONS}
                            value={closeButtonShape || 'circle'}
                            onChange={(value) => setAttributes({ closeButtonShape: value })}
                            columns={3}
                        />
                    </BaseControl>
                </PanelBody>

                {/* ─── STYLE TAB — HIGH PRIORITY ─── */}
                <PanelBody section="style" priority="high" title={__('Colors', 'modal-block')} initialOpen={true}>
                    <AdaireColorControl
                        label={__('Modal background', 'modal-block')}
                        value={backgroundColor || '#ffffff'}
                        onChange={(value) => setAttributes({ backgroundColor: value })}
                    />
                    <div style={{ marginTop: '16px' }}>
                        <AdaireColorControl
                            label={__('Overlay', 'modal-block')}
                            value={overlayColor || 'rgba(0,0,0,0.6)'}
                            onChange={(value) => setAttributes({ overlayColor: value })}
                            enableAlpha
                        />
                    </div>
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Border', 'modal-block')} initialOpen={false}>
                    <AdaireColorControl
                        label={__('Border color', 'modal-block')}
                        value={borderColor || '#e0e0e0'}
                        onChange={(value) => setAttributes({ borderColor: value })}
                    />
                    <RangeControl
                        label={__('Width (px)', 'modal-block')}
                        value={borderWidth ?? 1}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0} max={12} step={1}
                        style={{ marginTop: '12px' }}
                    />
                    <RangeControl
                        label={__('Radius (px)', 'modal-block')}
                        value={borderRadius ?? 16}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0} max={64} step={1}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Close Button Style', 'modal-block')} initialOpen={false}>
                    <AdaireColorControl
                        label={__('Icon color', 'modal-block')}
                        value={closeButtonColor || '#111111'}
                        onChange={(value) => setAttributes({ closeButtonColor: value })}
                    />
                    <div style={{ marginTop: '16px' }}>
                        <AdaireColorControl
                            label={__('Button background', 'modal-block')}
                            value={closeButtonBackground || 'rgba(255,255,255,0.9)'}
                            onChange={(value) => setAttributes({ closeButtonBackground: value })}
                            enableAlpha
                        />
                    </div>
                    <RangeControl
                        label={__('Size (px)', 'modal-block')}
                        value={closeButtonSize ?? 36}
                        onChange={(value) => setAttributes({ closeButtonSize: value })}
                        min={24} max={64} step={2}
                        style={{ marginTop: '12px' }}
                    />
                </PanelBody>

                {/* ─── STYLE TAB — MEDIUM PRIORITY ─── */}
                <PanelBody section="style" priority="medium" title={__('Animation', 'modal-block')} initialOpen={false}>
                    <BaseControl label={__('Entry animation', 'modal-block')}>
                        <VisualPicker
                            options={ANIMATION_OPTIONS}
                            value={animationType || 'fade'}
                            onChange={(value) => setAttributes({ animationType: value })}
                        />
                    </BaseControl>
                    <RangeControl
                        label={__('Duration (ms)', 'modal-block')}
                        value={animationDuration ?? 300}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={100} max={1000} step={50}
                        style={{ marginTop: '16px' }}
                    />
                    <SelectControl
                        label={__('Easing', 'modal-block')}
                        value={animationEasing || 'ease-out'}
                        options={[
                            { label: __('Ease out — smooth decelerate', 'modal-block'), value: 'ease-out' },
                            { label: __('Ease in-out — symmetric curve', 'modal-block'), value: 'ease-in-out' },
                            { label: __('Spring — overshoot bounce',     'modal-block'), value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
                            { label: __('Linear — constant speed',       'modal-block'), value: 'linear' },
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Shadow & Blur', 'modal-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Depth shadow', 'modal-block')}
                        checked={boxShadowEnabled !== false}
                        onChange={(value) => setAttributes({ boxShadowEnabled: value })}
                        help={__('Adds a large soft drop-shadow behind the modal for depth.', 'modal-block')}
                    />
                    <ToggleControl
                        label={__('Backdrop blur', 'modal-block')}
                        checked={!!backdropBlurEnabled}
                        onChange={(value) => setAttributes({ backdropBlurEnabled: value })}
                        help={__('Frosted-glass effect — blurs page content behind the overlay.', 'modal-block')}
                        style={{ marginTop: '8px' }}
                    />
                    {backdropBlurEnabled && (
                        <RangeControl
                            label={__('Blur amount (px)', 'modal-block')}
                            value={backdropBlurAmount ?? 8}
                            onChange={(value) => setAttributes({ backdropBlurAmount: value })}
                            min={2} max={32} step={1}
                        />
                    )}
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Padding', 'modal-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Content padding (px)', 'modal-block')}
                        value={padding ?? 24}
                        onChange={(value) => setAttributes({ padding: value })}
                        min={0} max={80} step={2}
                        help={__('Space between the modal edge and inner content.', 'modal-block')}
                    />
                </PanelBody>

            </InspectorTabs>

            <div {...blockProps}>
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
