import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, BaseControl, RangeControl } from '@wordpress/components';

const TEMPLATE = [[ 'core/button', { text: __('Open Modal', 'modal-block') } ]];

// ── VisualPicker ─────────────────────────────────────────────────────────────

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
                            gap: '6px',
                            padding: '10px 6px 8px',
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

// ── Trigger type icons ─────────────────────────────────────────────────────────

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
];

// ── Floating corner icons ──────────────────────────────────────────────────────

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

// ── Edit component ─────────────────────────────────────────────────────────────

export default function Edit({ attributes, setAttributes }) {
    const { triggerType, floatingPosition, floatingOffsetX, floatingOffsetY } = attributes;

    const blockProps = useBlockProps({
        className: 'adaire-modal-trigger-block',
        'data-trigger-type': triggerType || 'button',
        style: triggerType === 'floating' ? {
            '--floating-offset-x': `${floatingOffsetX ?? 24}px`,
            '--floating-offset-y': `${floatingOffsetY ?? 24}px`,
        } : {},
    });

    const innerBlocksProps = useInnerBlocksProps(blockProps, {
        template: TEMPLATE,
        templateLock: false,
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Trigger Type', 'modal-block')} initialOpen={true}>
                    <BaseControl label={__('How does this trigger appear?', 'modal-block')}>
                        <VisualPicker
                            options={TRIGGER_TYPE_OPTIONS}
                            value={triggerType || 'button'}
                            onChange={(value) => setAttributes({ triggerType: value })}
                            columns={2}
                        />
                    </BaseControl>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
                        {triggerType === 'floating'
                            ? __('Fixed to a corner of the screen — great for chat or support widgets.', 'modal-block')
                            : __('Appears inline in the page layout where this block is placed.', 'modal-block')
                        }
                    </p>
                </PanelBody>

                {triggerType === 'floating' && (
                    <PanelBody title={__('Floating Position', 'modal-block')} initialOpen={true}>
                        <BaseControl label={__('Anchor corner', 'modal-block')}>
                            <VisualPicker
                                options={FLOATING_POSITION_OPTIONS}
                                value={floatingPosition || 'bottom-right'}
                                onChange={(value) => setAttributes({ floatingPosition: value })}
                                columns={2}
                            />
                        </BaseControl>
                        <RangeControl
                            label={__('Horizontal offset (px)', 'modal-block')}
                            value={floatingOffsetX ?? 24}
                            onChange={(value) => setAttributes({ floatingOffsetX: value })}
                            min={8} max={80} step={4}
                            style={{ marginTop: '12px' }}
                        />
                        <RangeControl
                            label={__('Vertical offset (px)', 'modal-block')}
                            value={floatingOffsetY ?? 24}
                            onChange={(value) => setAttributes({ floatingOffsetY: value })}
                            min={8} max={80} step={4}
                        />
                    </PanelBody>
                )}
            </InspectorControls>

            <div {...innerBlocksProps} />
        </>
    );
}
