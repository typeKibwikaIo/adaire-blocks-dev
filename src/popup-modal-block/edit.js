import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';
import { PanelBody, RangeControl, BaseControl, ToggleControl, SelectControl, TextControl, Button } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useEffect, useMemo, useState, createElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
import AdaireColorControl from '../components/AdaireColorControl';
import { MODAL_LAYOUTS, getModalLayout } from './modal-layouts';

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

// ── Trigger type / floating position icons ─────────────────────────────────────

const TRIGGER_TYPE_OPTIONS = [
    {
        value: 'button', label: 'Inline',
        icon: (
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                <rect x="1" y="1" width="38" height="26" rx="4" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25"/>
                <rect x="8" y="8" width="24" height="12" rx="6" fill="currentColor" opacity="0.9"/>
                <path d="M14 14 H26" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        value: 'floating', label: 'Floating',
        icon: (
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                <rect x="1" y="1" width="38" height="26" rx="4" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25"/>
                <circle cx="31" cy="20" r="6" fill="currentColor" opacity="0.9"/>
                <path d="M28 20 H34 M31 17 V23" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        value: 'link', label: 'Text Link',
        icon: (
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
                <rect x="1" y="1" width="38" height="26" rx="4" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25"/>
                <path d="M10 17 H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
                <path d="M10 20 H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
        ),
    },
];

const FREQUENCY_OPTIONS = [
    { label: __('Every page load', 'adaire-blocks'), value: 'always' },
    { label: __('Once per browser session', 'adaire-blocks'), value: 'once-per-session' },
    { label: __('Once per day', 'adaire-blocks'), value: 'once-per-day' },
    { label: __('Once every N days (cookie)', 'adaire-blocks'), value: 'once-per-n-days' },
    { label: __('Once ever (this browser)', 'adaire-blocks'), value: 'once-ever' },
];

const FloatIcon = ({ corner }) => {
    const positions = {
        'bottom-right': { cx: 31, cy: 21 },
        'bottom-left':  { cx: 9,  cy: 21 },
        'top-right':    { cx: 31, cy: 7 },
        'top-left':     { cx: 9,  cy: 7 },
    };
    const { cx, cy } = positions[corner] || positions['bottom-right'];
    return (
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
            <rect x="1" y="1" width="38" height="26" rx="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3"/>
            <circle cx={cx} cy={cy} r="5" fill="currentColor" opacity="0.9"/>
            <path d={`M${cx-2} ${cy} H${cx+2} M${cx} ${cy-2} V${cy+2}`} stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
    );
};

const FLOATING_POSITION_OPTIONS = [
    { value: 'bottom-right', label: 'Bot. right', icon: <FloatIcon corner="bottom-right"/> },
    { value: 'bottom-left',  label: 'Bot. left',  icon: <FloatIcon corner="bottom-left"/> },
    { value: 'top-right',    label: 'Top right',  icon: <FloatIcon corner="top-right"/> },
    { value: 'top-left',     label: 'Top left',   icon: <FloatIcon corner="top-left"/> },
];

// ── Modal layout preview thumbnails ────────────────────────────────────────────
// Small schematic previews of each MODAL_LAYOUTS preset, keyed by layout id.
// currentColor is inherited so they tint with the button's selected state.

const LayoutThumb = ({ children }) => (
    <svg width="46" height="34" viewBox="0 0 46 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect x="1" y="1" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
        {children}
    </svg>
);

const bar = (x, y, w, h, o = 0.4, rx = 1.5) => (
    <rect x={x} y={y} width={w} height={h} rx={rx} fill="currentColor" opacity={o}/>
);
const btn = (x, y, w, o = 0.9) => (
    <rect x={x} y={y} width={w} height="5" rx="2.5" fill="currentColor" opacity={o}/>
);

const LAYOUT_ICONS = {
    basic: (
        <LayoutThumb>
            {bar(8, 7, 18, 3.5, 0.9)}
            {bar(8, 14, 30, 2, 0.4)}
            {bar(8, 18, 26, 2, 0.4)}
            {btn(8, 24, 15)}
        </LayoutThumb>
    ),
    'image-content-split': (
        <LayoutThumb>
            <rect x="6" y="7" width="14" height="20" rx="2" fill="currentColor" opacity="0.3"/>
            <path d="M9 22 l3 -4 2 2 3 -4 v6 z" fill="currentColor" opacity="0.6"/>
            {bar(24, 8, 15, 3.5, 0.9)}
            {bar(24, 15, 15, 2, 0.4)}
            {bar(24, 19, 11, 2, 0.4)}
            {btn(24, 24, 12)}
        </LayoutThumb>
    ),
    'newsletter-signup': (
        <LayoutThumb>
            {bar(13, 6, 20, 3.5, 0.9)}
            {bar(9, 12, 28, 2, 0.4)}
            <rect x="8" y="17" width="30" height="6" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
            {btn(15, 26, 16)}
        </LayoutThumb>
    ),
    'promotional-offer': (
        <LayoutThumb>
            {bar(16, 5, 14, 2, 0.5, 1)}
            <text x="23" y="19" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" opacity="0.9">%</text>
            {btn(14, 24, 18)}
        </LayoutThumb>
    ),
    'video-modal': (
        <LayoutThumb>
            <rect x="7" y="6" width="32" height="15" rx="2" fill="currentColor" opacity="0.28"/>
            <path d="M20 10 v7 l6 -3.5 z" fill="currentColor" opacity="0.9"/>
            {bar(7, 25, 18, 2.5, 0.9)}
            {bar(7, 30, 26, 1.6, 0.4)}
        </LayoutThumb>
    ),
    announcement: (
        <LayoutThumb>
            {bar(13, 6, 20, 3.5, 0.9)}
            {bar(9, 13, 28, 2, 0.4)}
            {bar(12, 17, 22, 2, 0.4)}
            {btn(7, 24, 14)}
            <rect x="25" y="24" width="14" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.55"/>
        </LayoutThumb>
    ),
    'exit-intent-lead-capture': (
        <LayoutThumb>
            <path d="M36 5 l4 -4 m0 0 h-3 m3 0 v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            {bar(11, 6, 22, 3.5, 0.9)}
            {bar(9, 13, 28, 2, 0.4)}
            <rect x="8" y="17" width="30" height="6" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
            {btn(14, 26, 18)}
        </LayoutThumb>
    ),
};

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

// Static editor-time preview only — view.js runs the real live countdown.
const formatCountdown = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
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
        autoOpenClickSelector,
        autoCloseEnabled, autoCloseDelay,
        overlayClickClose,
        contentPadding,
        triggerText, triggerType, floatingPosition, floatingOffsetX, floatingOffsetY,
        triggerTextColor, triggerBackgroundColor, triggerBorderRadius,
        triggerPaddingX, triggerPaddingY, triggerFontSize, triggerFontWeight,
        modalLayout,
        autoOpenScrollPercent, autoOpenInactivitySeconds, autoOpenEventName, autoOpenElementSelector,
        showFrequency, frequencyDays,
        countdownEnabled, countdownMinutes,
        glassmorphismEnabled,
        overlayGradientEnabled, overlayGradientColor2,
    } = attributes;

    const [deviceType, setDeviceType] = useState('desktop');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { replaceInnerBlocks } = useDispatch('core/block-editor');

    useEffect(() => {
        if (!blockId) setAttributes({ blockId: clientId });
    }, [blockId, clientId, setAttributes]);

    const applyModalLayout = (layout) => {
        setAttributes({ modalLayout: layout.id, ...(layout.defaultAttrs || {}) });
        replaceInnerBlocks(clientId, createBlocksFromInnerBlocksTemplate(layout.template), false);
    };

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

    const pad = {
        top:    contentPadding?.top    ?? 24,
        right:  contentPadding?.right  ?? 24,
        bottom: contentPadding?.bottom ?? 24,
        left:   contentPadding?.left   ?? 24,
    };
    const setPad = (side, value) => setAttributes({ contentPadding: { ...pad, [side]: value } });

    const isFloating = triggerType === 'floating';

    const blockProps = useBlockProps({
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
            '--content-padding-top':      `${pad.top}px`,
            '--content-padding-right':    `${pad.right}px`,
            '--content-padding-bottom':   `${pad.bottom}px`,
            '--content-padding-left':     `${pad.left}px`,
            '--trigger-color':             triggerTextColor         || '#ffffff',
            '--trigger-bg':                triggerBackgroundColor   || '#111827',
            '--trigger-radius':           `${triggerBorderRadius    ?? 8}px`,
            '--trigger-padding-x':        `${triggerPaddingX        ?? 20}px`,
            '--trigger-padding-y':        `${triggerPaddingY        ?? 12}px`,
            '--trigger-font-size':        `${triggerFontSize        ?? 16}px`,
            '--trigger-font-weight':       triggerFontWeight        || '600',
            '--modal-overlay-gradient-2':  overlayGradientColor2    || '#7c3aed',
        },
        className: [
            'adaire-popup-modal-block',
            isPreviewOpen ? 'is-preview-open' : '',
            glassmorphismEnabled ? 'has-glassmorphism' : '',
            overlayGradientEnabled ? 'has-overlay-gradient' : '',
        ].filter(Boolean).join(' '),
        'data-modal-block':     true,
        'data-preview-open':    isPreviewOpen,
        'data-modal-anim':      animationType       || 'fade',
        'data-modal-position':  modalPosition       || 'center',
        'data-close-pos':       closeButtonPosition || 'top-right',
        'data-close-shape':     closeButtonShape    || 'circle',
        'data-auto-open':       autoOpen            || 'none',
        'data-auto-open-delay': autoOpenDelay       ?? 3,
        'data-scroll-percent':  autoOpenScrollPercent ?? 50,
        'data-inactivity-seconds': autoOpenInactivitySeconds ?? 30,
        'data-event-name':      autoOpenEventName   || 'adaire-modal-open',
        'data-element-selector': autoOpenElementSelector || '',
        'data-click-selector':  autoOpenClickSelector || '',
        'data-auto-close':      autoCloseEnabled ? 'true' : 'false',
        'data-auto-close-delay': autoCloseDelay     ?? 5,
        'data-show-frequency':  showFrequency       || 'always',
        'data-frequency-days':  frequencyDays       ?? 7,
        'data-overlay-close':   overlayClickClose   !== false ? 'true' : 'false',
        'data-show-close':      showCloseButton     !== false ? 'true' : 'false',
        'data-countdown-enabled': countdownEnabled ? 'true' : 'false',
        'data-countdown-minutes': countdownMinutes ?? 15,
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'adaire-popup-modal-block__body' },
        { template: getModalLayout(modalLayout).template, templateLock: false }
    );

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>

                {/* ─── CONTENT TAB ─── */}
                <PanelBody section="content" title={__('Modal Layout', 'adaire-blocks')} initialOpen={true}>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.4 }}>
                        {__('Pick a starting layout for the modal body. You can still add, remove, or edit blocks afterward.', 'adaire-blocks')}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {MODAL_LAYOUTS.map((layout) => (
                            <Button
                                key={layout.id}
                                isPrimary={modalLayout === layout.id}
                                onClick={() => applyModalLayout(layout)}
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', height: 'auto', padding: '8px 10px', textAlign: 'left' }}
                            >
                                <span style={{ display: 'flex', color: modalLayout === layout.id ? '#ffffff' : '#64748b' }}>
                                    {LAYOUT_ICONS[layout.id]}
                                </span>
                                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 600 }}>{layout.label}</span>
                                    <span style={{ fontSize: '11px', opacity: 0.75, fontWeight: 400 }}>{layout.bestFor}</span>
                                </span>
                            </Button>
                        ))}
                    </div>
                </PanelBody>

                <PanelBody section="content" title={__('Trigger', 'adaire-blocks')} initialOpen={false}>
                    <BaseControl label={__('How does this trigger appear?', 'adaire-blocks')}>
                        <VisualPicker
                            options={TRIGGER_TYPE_OPTIONS}
                            value={triggerType || 'button'}
                            onChange={(value) => setAttributes({ triggerType: value })}
                            columns={3}
                        />
                    </BaseControl>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
                        {isFloating
                            ? __('Fixed to a corner of the screen — great for chat or support widgets.', 'adaire-blocks')
                            : __('Appears inline in the page layout where this block is placed.', 'adaire-blocks')
                        }
                    </p>
                    {isFloating && (
                        <>
                            <BaseControl label={__('Anchor corner', 'adaire-blocks')} style={{ marginTop: '16px' }}>
                                <VisualPicker
                                    options={FLOATING_POSITION_OPTIONS}
                                    value={floatingPosition || 'bottom-right'}
                                    onChange={(value) => setAttributes({ floatingPosition: value })}
                                    columns={2}
                                />
                            </BaseControl>
                            <RangeControl
                                label={__('Horizontal offset (px)', 'adaire-blocks')}
                                value={floatingOffsetX ?? 24}
                                onChange={(value) => setAttributes({ floatingOffsetX: value })}
                                min={8} max={80} step={4}
                                style={{ marginTop: '12px' }}
                            />
                            <RangeControl
                                label={__('Vertical offset (px)', 'adaire-blocks')}
                                value={floatingOffsetY ?? 24}
                                onChange={(value) => setAttributes({ floatingOffsetY: value })}
                                min={8} max={80} step={4}
                            />
                        </>
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Content Padding', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Top (px)', 'adaire-blocks')}
                        value={pad.top}
                        onChange={(v) => setPad('top', v)}
                        min={0} max={80} step={2}
                    />
                    <RangeControl
                        label={__('Right (px)', 'adaire-blocks')}
                        value={pad.right}
                        onChange={(v) => setPad('right', v)}
                        min={0} max={80} step={2}
                    />
                    <RangeControl
                        label={__('Bottom (px)', 'adaire-blocks')}
                        value={pad.bottom}
                        onChange={(v) => setPad('bottom', v)}
                        min={0} max={80} step={2}
                    />
                    <RangeControl
                        label={__('Left (px)', 'adaire-blocks')}
                        value={pad.left}
                        onChange={(v) => setPad('left', v)}
                        min={0} max={80} step={2}
                    />
                </PanelBody>

                <PanelBody section="content" title={__('Auto-Open', 'adaire-blocks')} initialOpen={false}>
                    <SelectControl
                        label={__('Open trigger', 'adaire-blocks')}
                        value={autoOpen || 'none'}
                        options={[
                            { label: __('Manual — button click only', 'adaire-blocks'), value: 'none' },
                            { label: __('Page load — opens after a delay', 'adaire-blocks'), value: 'delay' },
                            { label: __('Exit intent — cursor leaves viewport', 'adaire-blocks'), value: 'exit-intent' },
                            { label: __('Scroll depth — opens after scrolling X%', 'adaire-blocks'), value: 'scroll-depth' },
                            { label: __('Element visible — opens when an element scrolls into view', 'adaire-blocks'), value: 'element-visible' },
                            { label: __('Element click — opens when a matching element is clicked', 'adaire-blocks'), value: 'element-click' },
                            { label: __('Inactivity — opens after the visitor stops interacting', 'adaire-blocks'), value: 'inactivity' },
                            { label: __('Custom JS event — opens when your own script fires an event', 'adaire-blocks'), value: 'custom-event' },
                        ]}
                        onChange={(value) => setAttributes({ autoOpen: value })}
                    />
                    {autoOpen === 'delay' && (
                        <RangeControl
                            label={__('Delay (seconds)', 'adaire-blocks')}
                            value={autoOpenDelay ?? 3}
                            onChange={(value) => setAttributes({ autoOpenDelay: value })}
                            min={0} max={30} step={0.5}
                        />
                    )}
                    {autoOpen === 'scroll-depth' && (
                        <RangeControl
                            label={__('Scroll depth (%)', 'adaire-blocks')}
                            value={autoOpenScrollPercent ?? 50}
                            onChange={(value) => setAttributes({ autoOpenScrollPercent: value })}
                            min={1} max={100} step={1}
                        />
                    )}
                    {autoOpen === 'element-visible' && (
                        <TextControl
                            label={__('CSS selector of the element to watch', 'adaire-blocks')}
                            help={__('e.g. #pricing-table or .my-section. Opens once that element scrolls into the viewport.', 'adaire-blocks')}
                            value={autoOpenElementSelector || ''}
                            onChange={(value) => setAttributes({ autoOpenElementSelector: value })}
                        />
                    )}
                    {autoOpen === 'element-click' && (
                        <TextControl
                            label={__('CSS selector of the element(s) to click', 'adaire-blocks')}
                            help={__('e.g. #open-popup or .js-open-modal. Clicking any matching element opens the modal — works for elements added after page load too.', 'adaire-blocks')}
                            value={autoOpenClickSelector || ''}
                            onChange={(value) => setAttributes({ autoOpenClickSelector: value })}
                        />
                    )}
                    {autoOpen === 'inactivity' && (
                        <RangeControl
                            label={__('Idle time before opening (seconds)', 'adaire-blocks')}
                            value={autoOpenInactivitySeconds ?? 30}
                            onChange={(value) => setAttributes({ autoOpenInactivitySeconds: value })}
                            min={5} max={300} step={5}
                        />
                    )}
                    {autoOpen === 'custom-event' && (
                        <TextControl
                            label={__('Event name', 'adaire-blocks')}
                            help={__('Dispatch this event name from your own JS, e.g. document.dispatchEvent(new Event(\"adaire-modal-open\")).', 'adaire-blocks')}
                            value={autoOpenEventName || 'adaire-modal-open'}
                            onChange={(value) => setAttributes({ autoOpenEventName: value })}
                        />
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Behavior', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Close on overlay click', 'adaire-blocks')}
                        checked={overlayClickClose !== false}
                        onChange={(value) => setAttributes({ overlayClickClose: value })}
                    />
                    <ToggleControl
                        label={__('Show close button', 'adaire-blocks')}
                        checked={showCloseButton !== false}
                        onChange={(value) => setAttributes({ showCloseButton: value })}
                    />
                    <ToggleControl
                        label={__('Auto-close after a delay', 'adaire-blocks')}
                        checked={!!autoCloseEnabled}
                        onChange={(value) => setAttributes({ autoCloseEnabled: value })}
                        help={__('Automatically closes the modal a set number of seconds after it opens.', 'adaire-blocks')}
                    />
                    {autoCloseEnabled && (
                        <RangeControl
                            label={__('Auto-close after (seconds)', 'adaire-blocks')}
                            value={autoCloseDelay ?? 5}
                            onChange={(value) => setAttributes({ autoCloseDelay: value })}
                            min={1} max={60} step={1}
                        />
                    )}
                    <SelectControl
                        label={__('How often to auto-open', 'adaire-blocks')}
                        help={__('Limits automatic opening (delay, exit-intent, scroll, etc.) per visitor. Manual button clicks always work.', 'adaire-blocks')}
                        value={showFrequency || 'always'}
                        options={FREQUENCY_OPTIONS}
                        onChange={(value) => setAttributes({ showFrequency: value })}
                    />
                    {showFrequency === 'once-per-n-days' && (
                        <RangeControl
                            label={__('Show again after (days)', 'adaire-blocks')}
                            value={frequencyDays ?? 7}
                            onChange={(value) => setAttributes({ frequencyDays: value })}
                            min={1} max={365} step={1}
                            help={__('Uses a cookie to remember when the modal was last shown to this visitor.', 'adaire-blocks')}
                        />
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Countdown Timer', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show countdown timer', 'adaire-blocks')}
                        checked={!!countdownEnabled}
                        onChange={(value) => setAttributes({ countdownEnabled: value })}
                        help={__('Adds an urgency countdown above the modal content, e.g. for limited-time offers.', 'adaire-blocks')}
                    />
                    {countdownEnabled && (
                        <RangeControl
                            label={__('Countdown length (minutes)', 'adaire-blocks')}
                            value={countdownMinutes ?? 15}
                            onChange={(value) => setAttributes({ countdownMinutes: value })}
                            min={1} max={1440} step={1}
                            help={__('Starts counting down from page load and persists across the visit.', 'adaire-blocks')}
                        />
                    )}
                </PanelBody>

                <PanelBody section="content" title={__('Preview', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Preview modal overlay', 'adaire-blocks')}
                        checked={isPreviewOpen}
                        onChange={(value) => setIsPreviewOpen(value)}
                        help={__('See how the modal looks while editing.', 'adaire-blocks')}
                    />
                </PanelBody>

                {/* ─── LAYOUT TAB ─── */}
                <PanelBody section="layout" title={__('Position', 'adaire-blocks')} initialOpen={true}>
                    <BaseControl label={__('Where does the modal appear?', 'adaire-blocks')}>
                        <VisualPicker
                            options={POSITION_OPTIONS}
                            value={modalPosition || 'center'}
                            onChange={(value) => setAttributes({ modalPosition: value })}
                            columns={5}
                        />
                    </BaseControl>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
                        {__('Bottom sheet and drawers always slide in from their edge.', 'adaire-blocks')}
                    </p>
                </PanelBody>

                <PanelBody section="layout" title={__('Dimensions', 'adaire-blocks')} initialOpen={false}>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={MODAL_TIERS}
                    />

                    <BaseControl label={__('Width', 'adaire-blocks')} style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="number"
                                className="adaire-popup-modal-block__dimension-input"
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

                    <BaseControl label={__('Height', 'adaire-blocks')} style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="number"
                                className="adaire-popup-modal-block__dimension-input"
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

                <PanelBody section="layout" title={__('Close Button', 'adaire-blocks')} initialOpen={false}>
                    <BaseControl label={__('Position', 'adaire-blocks')}>
                        <VisualPicker
                            options={CLOSE_POSITION_OPTIONS}
                            value={closeButtonPosition || 'top-right'}
                            onChange={(value) => setAttributes({ closeButtonPosition: value })}
                            columns={4}
                        />
                    </BaseControl>
                    <BaseControl label={__('Shape', 'adaire-blocks')} style={{ marginTop: '16px' }}>
                        <VisualPicker
                            options={CLOSE_SHAPE_OPTIONS}
                            value={closeButtonShape || 'circle'}
                            onChange={(value) => setAttributes({ closeButtonShape: value })}
                            columns={3}
                        />
                    </BaseControl>
                </PanelBody>

                {/* ─── STYLE TAB — HIGH PRIORITY ─── */}
                <PanelBody section="style" priority="high" title={__('Trigger Style', 'adaire-blocks')} initialOpen={true}>
                    <AdaireColorControl
                        label={__('Text color', 'adaire-blocks')}
                        value={triggerTextColor || '#ffffff'}
                        onChange={(value) => setAttributes({ triggerTextColor: value })}
                    />
                    <div style={{ marginTop: '16px' }}>
                        <AdaireColorControl
                            label={__('Background color', 'adaire-blocks')}
                            value={triggerBackgroundColor || '#111827'}
                            onChange={(value) => setAttributes({ triggerBackgroundColor: value })}
                        />
                    </div>
                    <RangeControl
                        label={__('Border radius (px)', 'adaire-blocks')}
                        value={triggerBorderRadius ?? 8}
                        onChange={(value) => setAttributes({ triggerBorderRadius: value })}
                        min={0} max={40} step={1}
                        style={{ marginTop: '12px' }}
                    />
                    <RangeControl
                        label={__('Horizontal padding (px)', 'adaire-blocks')}
                        value={triggerPaddingX ?? 20}
                        onChange={(value) => setAttributes({ triggerPaddingX: value })}
                        min={0} max={60} step={2}
                    />
                    <RangeControl
                        label={__('Vertical padding (px)', 'adaire-blocks')}
                        value={triggerPaddingY ?? 12}
                        onChange={(value) => setAttributes({ triggerPaddingY: value })}
                        min={0} max={40} step={2}
                    />
                    <RangeControl
                        label={__('Font size (px)', 'adaire-blocks')}
                        value={triggerFontSize ?? 16}
                        onChange={(value) => setAttributes({ triggerFontSize: value })}
                        min={10} max={32} step={1}
                    />
                    <SelectControl
                        label={__('Font weight', 'adaire-blocks')}
                        value={triggerFontWeight || '600'}
                        options={['400', '500', '600', '700', '800'].map((w) => ({ label: w, value: w }))}
                        onChange={(value) => setAttributes({ triggerFontWeight: value })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Colors', 'adaire-blocks')} initialOpen={false}>
                    <AdaireColorControl
                        label={__('Modal background', 'adaire-blocks')}
                        value={backgroundColor || '#ffffff'}
                        onChange={(value) => setAttributes({ backgroundColor: value })}
                    />
                    <div style={{ marginTop: '16px' }}>
                        <AdaireColorControl
                            label={__('Overlay', 'adaire-blocks')}
                            value={overlayColor || 'rgba(0,0,0,0.6)'}
                            onChange={(value) => setAttributes({ overlayColor: value })}
                            enableAlpha
                        />
                    </div>
                    <ToggleControl
                        label={__('Gradient overlay', 'adaire-blocks')}
                        checked={!!overlayGradientEnabled}
                        onChange={(value) => setAttributes({ overlayGradientEnabled: value })}
                        help={__('Blends the overlay color into a second color diagonally instead of a flat tint.', 'adaire-blocks')}
                        style={{ marginTop: '16px' }}
                    />
                    {overlayGradientEnabled && (
                        <AdaireColorControl
                            label={__('Gradient second color', 'adaire-blocks')}
                            value={overlayGradientColor2 || '#7c3aed'}
                            onChange={(value) => setAttributes({ overlayGradientColor2: value })}
                            enableAlpha
                        />
                    )}
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Border', 'adaire-blocks')} initialOpen={false}>
                    <AdaireColorControl
                        label={__('Border color', 'adaire-blocks')}
                        value={borderColor || '#e0e0e0'}
                        onChange={(value) => setAttributes({ borderColor: value })}
                    />
                    <RangeControl
                        label={__('Width (px)', 'adaire-blocks')}
                        value={borderWidth ?? 1}
                        onChange={(value) => setAttributes({ borderWidth: value })}
                        min={0} max={12} step={1}
                        style={{ marginTop: '12px' }}
                    />
                    <RangeControl
                        label={__('Radius (px)', 'adaire-blocks')}
                        value={borderRadius ?? 16}
                        onChange={(value) => setAttributes({ borderRadius: value })}
                        min={0} max={64} step={1}
                    />
                </PanelBody>

                <PanelBody section="style" priority="high" title={__('Close Button Style', 'adaire-blocks')} initialOpen={false}>
                    <AdaireColorControl
                        label={__('Icon color', 'adaire-blocks')}
                        value={closeButtonColor || '#111111'}
                        onChange={(value) => setAttributes({ closeButtonColor: value })}
                    />
                    <div style={{ marginTop: '16px' }}>
                        <AdaireColorControl
                            label={__('Button background', 'adaire-blocks')}
                            value={closeButtonBackground || 'rgba(255,255,255,0.9)'}
                            onChange={(value) => setAttributes({ closeButtonBackground: value })}
                            enableAlpha
                        />
                    </div>
                    <RangeControl
                        label={__('Size (px)', 'adaire-blocks')}
                        value={closeButtonSize ?? 36}
                        onChange={(value) => setAttributes({ closeButtonSize: value })}
                        min={24} max={64} step={2}
                        style={{ marginTop: '12px' }}
                    />
                </PanelBody>

                {/* ─── STYLE TAB — MEDIUM PRIORITY ─── */}
                <PanelBody section="style" priority="medium" title={__('Animation', 'adaire-blocks')} initialOpen={false}>
                    <BaseControl label={__('Entry animation', 'adaire-blocks')}>
                        <VisualPicker
                            options={ANIMATION_OPTIONS}
                            value={animationType || 'fade'}
                            onChange={(value) => setAttributes({ animationType: value })}
                        />
                    </BaseControl>
                    <RangeControl
                        label={__('Duration (ms)', 'adaire-blocks')}
                        value={animationDuration ?? 300}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={100} max={1000} step={50}
                        style={{ marginTop: '16px' }}
                    />
                    <SelectControl
                        label={__('Easing', 'adaire-blocks')}
                        value={animationEasing || 'ease-out'}
                        options={[
                            { label: __('Ease out — smooth decelerate', 'adaire-blocks'), value: 'ease-out' },
                            { label: __('Ease in-out — symmetric curve', 'adaire-blocks'), value: 'ease-in-out' },
                            { label: __('Spring — overshoot bounce',     'adaire-blocks'), value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
                            { label: __('Linear — constant speed',       'adaire-blocks'), value: 'linear' },
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Shadow & Blur', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Depth shadow', 'adaire-blocks')}
                        checked={boxShadowEnabled !== false}
                        onChange={(value) => setAttributes({ boxShadowEnabled: value })}
                        help={__('Adds a large soft drop-shadow behind the modal for depth.', 'adaire-blocks')}
                    />
                    <ToggleControl
                        label={__('Backdrop blur', 'adaire-blocks')}
                        checked={!!backdropBlurEnabled}
                        onChange={(value) => setAttributes({ backdropBlurEnabled: value })}
                        help={__('Frosted-glass effect — blurs page content behind the overlay.', 'adaire-blocks')}
                        style={{ marginTop: '8px' }}
                    />
                    {backdropBlurEnabled && (
                        <RangeControl
                            label={__('Blur amount (px)', 'adaire-blocks')}
                            value={backdropBlurAmount ?? 8}
                            onChange={(value) => setAttributes({ backdropBlurAmount: value })}
                            min={2} max={32} step={1}
                        />
                    )}
                    <ToggleControl
                        label={__('Glassmorphism', 'adaire-blocks')}
                        checked={!!glassmorphismEnabled}
                        onChange={(value) => setAttributes({ glassmorphismEnabled: value })}
                        help={__('Makes the modal itself translucent with a frosted-glass blur, instead of a solid background.', 'adaire-blocks')}
                        style={{ marginTop: '8px' }}
                    />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Padding', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Content padding (px)', 'adaire-blocks')}
                        value={padding ?? 24}
                        onChange={(value) => setAttributes({ padding: value })}
                        min={0} max={80} step={2}
                        help={__('Space between the modal edge and inner content.', 'adaire-blocks')}
                    />
                </PanelBody>

            </InspectorTabs>

            <div {...blockProps}>
                <button
                    type="button"
                    className="adaire-popup-modal-block__trigger"
                    data-modal-role="trigger"
                    data-trigger-type={triggerType || 'button'}
                    data-floating-position={isFloating ? (floatingPosition || 'bottom-right') : undefined}
                    aria-haspopup="dialog"
                    onClick={(event) => event.preventDefault()}
                    style={isFloating ? {
                        '--floating-offset-x': `${floatingOffsetX ?? 24}px`,
                        '--floating-offset-y': `${floatingOffsetY ?? 24}px`,
                    } : undefined}
                >
                    <RichText
                        tagName="span"
                        value={triggerText}
                        onChange={(value) => setAttributes({ triggerText: value })}
                        placeholder={__('Open Modal', 'adaire-blocks')}
                        allowedFormats={[]}
                    />
                </button>
                {countdownEnabled && (
                    <div className="adaire-popup-modal-block__countdown">
                        {formatCountdown((countdownMinutes ?? 15) * 60)}
                    </div>
                )}
                <div {...innerBlocksProps} />
            </div>
        </>
    );
}
