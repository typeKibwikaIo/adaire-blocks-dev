import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    ButtonGroup,
    TextControl,
    TextareaControl,
    ColorPicker,
    SelectControl,
    ToggleControl,
    RangeControl,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
    const [deviceType, setDeviceType] = useState('desktop');

    const {
        blockId,
        containerMode,
        containerMaxWidth,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        locations,
        activeIndex,
        navTextColor,
        navActiveBgColor,
        navActiveTextColor,
        navFontWeight,
        singleMapMode,
        flyDuration,
    } = attributes;

    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    // Enforce limits for free version
    useEffect(() => {
        const blockConfig = window.adaireBlocksConfig?.blocks?.['map-block'] || {};
        const blockLimits = blockConfig.limits || {};
        const isFree = !window.adaireBlocksConfig?.isPremium;

        if (isFree && blockLimits.singleMapMode === true && !singleMapMode) {
            setAttributes({ singleMapMode: true });
        }
    }, []);

    const blockProps = useBlockProps({
        className: 'ad-map',
        style: {
            // Container max width CSS variables
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? 'px'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,

            // Desktop margins (inline styles for editor)
            marginTop: `${marginTop?.desktop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? 0}px`,

            // Responsive margin CSS variables
            '--margin-top-tablet': `${marginTop?.tablet ?? 0}px`,
            '--margin-right-tablet': `${marginRight?.tablet ?? 0}px`,
            '--margin-bottom-tablet': `${marginBottom?.tablet ?? 0}px`,
            '--margin-left-tablet': `${marginLeft?.tablet ?? 0}px`,

            '--margin-top-mobile': `${marginTop?.mobile ?? 0}px`,
            '--margin-right-mobile': `${marginRight?.mobile ?? 0}px`,
            '--margin-bottom-mobile': `${marginBottom?.mobile ?? 0}px`,
            '--margin-left-mobile': `${marginLeft?.mobile ?? 0}px`,

            // Desktop padding (inline styles for editor)
            paddingTop: `${paddingTop?.desktop ?? 0}px`,
            paddingRight: `${paddingRight?.desktop ?? 0}px`,
            paddingBottom: `${paddingBottom?.desktop ?? 0}px`,
            paddingLeft: `${paddingLeft?.desktop ?? 0}px`,

            // Responsive padding CSS variables
            '--padding-top-tablet': `${paddingTop?.tablet ?? 0}px`,
            '--padding-right-tablet': `${paddingRight?.tablet ?? 0}px`,
            '--padding-bottom-tablet': `${paddingBottom?.tablet ?? 0}px`,
            '--padding-left-tablet': `${paddingLeft?.tablet ?? 0}px`,

            '--padding-top-mobile': `${paddingTop?.mobile ?? 0}px`,
            '--padding-right-mobile': `${paddingRight?.mobile ?? 0}px`,
            '--padding-bottom-mobile': `${paddingBottom?.mobile ?? 0}px`,
            '--padding-left-mobile': `${paddingLeft?.mobile ?? 0}px`,

            // Appearance variables
            '--ad-map-nav-text': navTextColor || '#333333',
            '--ad-map-nav-active-bg': navActiveBgColor || '#d52d3a',
            '--ad-map-nav-active-text': navActiveTextColor || '#ffffff',
            '--ad-map-nav-weight': String(navFontWeight || '600'),
        },
    });

    return (
        <>
            <InspectorControls>
                {/* Container Settings Panel */}
                <PanelBody title={__('Container Settings', 'ad-map')} initialOpen={true}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Container Mode', 'ad-map')}
                    </p>
                    <ButtonGroup>
                        {[
                            { label: __('Full Width', 'ad-map'), value: 'full' },
                            { label: __('Constrained', 'ad-map'), value: 'constrained' },
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
                                {__('Max Width', 'ad-map')}
                            </p>
                            <ButtonGroup style={{ marginBottom: '12px' }}>
                                <Button
                                    icon={desktop}
                                    isPrimary={deviceType === 'desktop'}
                                    onClick={() => setDeviceType('desktop')}
                                    label={__('Desktop', 'ad-map')}
                                />
                                <Button
                                    icon={tablet}
                                    isPrimary={deviceType === 'tablet'}
                                    onClick={() => setDeviceType('tablet')}
                                    label={__('Tablet', 'ad-map')}
                                />
                                <Button
                                    icon={mobile}
                                    isPrimary={deviceType === 'mobile'}
                                    onClick={() => setDeviceType('mobile')}
                                    label={__('Mobile', 'ad-map')}
                                />
                            </ButtonGroup>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <TextControl
                                    type="number"
                                    value={
                                        containerMaxWidth?.[deviceType]?.value ??
                                        (deviceType === 'desktop' ? 1200 : 100)
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
                                                    (deviceType === 'desktop' ? 'px' : '%')) === u
                                            }
                                            isSecondary={
                                                (containerMaxWidth?.[deviceType]?.unit ??
                                                    (deviceType === 'desktop' ? 'px' : '%')) !== u
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
                {/* Behavior */}
                <PanelBody title={__('Behavior', 'ad-map')} initialOpen={false}>
                    {(() => {
                        // Check if block has limits
                        const blockConfig = window.adaireBlocksConfig?.blocks?.['map-block'] || {};
                        const blockLimits = blockConfig.limits || {};
                        const isFree = !window.adaireBlocksConfig?.isPremium;
                        const forceSingleMapMode = isFree && blockLimits.singleMapMode === true;

                        return (
                            <>
                                <ToggleControl
                                    label={__('Single map fly mode', 'ad-map')}
                                    checked={forceSingleMapMode ? true : !!singleMapMode}
                                    onChange={(v) => {
                                        if (!forceSingleMapMode) {
                                            setAttributes({ singleMapMode: !!v });
                                        }
                                    }}
                                    disabled={forceSingleMapMode}
                                    help={
                                        forceSingleMapMode
                                            ? blockConfig.upgradeMessage || __('Upgrade to Pro for interactive flying map animations', 'ad-map')
                                            : __("When enabled, only one map is rendered and it slides to the selected location", 'ad-map')
                                    }
                                />
                                {!forceSingleMapMode && (
                                    <div style={{ marginTop: 12 }}>
                                        <RangeControl
                                            label={__('Fly speed (seconds)', 'ad-map')}
                                            value={typeof flyDuration === 'number' ? flyDuration : 0.9}
                                            onChange={(v) => setAttributes({ flyDuration: Number(v) })}
                                            min={0.2}
                                            max={3}
                                            step={0.1}
                                            help={__('Controls how long the map fly animation takes', 'ad-map')}
                                        />
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </PanelBody>

                {/* Margins Panel */}
                <PanelBody title={__('Margins', 'ad-map')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Device', 'ad-map')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'ad-map')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'ad-map')}
                        />
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'ad-map')}
                        />
                    </ButtonGroup>
                    <BoxControl
                        label={__('Margin', 'ad-map')}
                        values={{
                            top: `${marginTop?.[deviceType] ?? 0}px`,
                            right: `${marginRight?.[deviceType] ?? 0}px`,
                            bottom: `${marginBottom?.[deviceType] ?? 0}px`,
                            left: `${marginLeft?.[deviceType] ?? 0}px`,
                        }}
                        onChange={(value) => {
                            setAttributes({
                                marginTop: { ...(marginTop || {}), [deviceType]: parseInt(value.top) || 0 },
                                marginRight: { ...(marginRight || {}), [deviceType]: parseInt(value.right) || 0 },
                                marginBottom: { ...(marginBottom || {}), [deviceType]: parseInt(value.bottom) || 0 },
                                marginLeft: { ...(marginLeft || {}), [deviceType]: parseInt(value.left) || 0 },
                            });
                        }}
                    />
                </PanelBody>

                {/* Padding Panel */}
                <PanelBody title={__('Padding', 'ad-map')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Device', 'ad-map')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'ad-map')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'ad-map')}
                        />
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'ad-map')}
                        />
                    </ButtonGroup>
                    <BoxControl
                        label={__('Padding', 'ad-map')}
                        values={{
                            top: `${paddingTop?.[deviceType] ?? 0}px`,
                            right: `${paddingRight?.[deviceType] ?? 0}px`,
                            bottom: `${paddingBottom?.[deviceType] ?? 0}px`,
                            left: `${paddingLeft?.[deviceType] ?? 0}px`,
                        }}
                        onChange={(value) => {
                            setAttributes({
                                paddingTop: { ...(paddingTop || {}), [deviceType]: parseInt(value.top) || 0 },
                                paddingRight: { ...(paddingRight || {}), [deviceType]: parseInt(value.right) || 0 },
                                paddingBottom: { ...(paddingBottom || {}), [deviceType]: parseInt(value.bottom) || 0 },
                                paddingLeft: { ...(paddingLeft || {}), [deviceType]: parseInt(value.left) || 0 },
                            });
                        }}
                    />
                </PanelBody>

                {/* Appearance */}
                <PanelBody title={__('Appearance', 'ad-map')} initialOpen={false}>
                    <div>
                        <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>List Text</p>
                            <ColorPicker
                                color={navTextColor}
                                onChangeComplete={(c) => setAttributes({ navTextColor: c.hex })}
                                disableAlpha
                            />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>{__('Active Country Background', 'ad-map')}</p>
                            <ColorPicker
                                color={navActiveBgColor}
                                onChangeComplete={(c) => setAttributes({ navActiveBgColor: c.hex })}
                                disableAlpha
                            />
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>Active Text</p>
                            <ColorPicker
                                color={navActiveTextColor}
                                onChangeComplete={(c) => setAttributes({ navActiveTextColor: c.hex })}
                                disableAlpha
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <SelectControl
                            label={__('Country Font Weight', 'ad-map')}
                            value={String(navFontWeight || '600')}
                            options={[
                                { label: '300 (Light)', value: '300' },
                                { label: '400 (Normal)', value: '400' },
                                { label: '500 (Medium)', value: '500' },
                                { label: '600 (Semi-bold)', value: '600' },
                                { label: '700 (Bold)', value: '700' },
                            ]}
                            onChange={(v) => setAttributes({ navFontWeight: v })}
                        />
                    </div>
                </PanelBody>
                {/* Locations Panel */}
                <PanelBody title={__('Locations', 'ad-map')} initialOpen={true}>
                    {(locations || []).map((loc, i) => (
                        <div key={loc.id || i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                                <strong>{__('Location', 'ad-map')} {i + 1}</strong>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {i > 0 && (
                                        <Button isSmall onClick={() => {
                                            const next = [...locations];
                                            const [m] = next.splice(i, 1);
                                            next.splice(i - 1, 0, m);
                                            setAttributes({ locations: next, activeIndex: i - 1 });
                                        }}>â†‘</Button>
                                    )}
                                    {i < locations.length - 1 && (
                                        <Button isSmall onClick={() => {
                                            const next = [...locations];
                                            const [m] = next.splice(i, 1);
                                            next.splice(i + 1, 0, m);
                                            setAttributes({ locations: next, activeIndex: i + 1 });
                                        }}>â†“</Button>
                                    )}
                                    <Button isSmall isDestructive onClick={() => {
                                        const next = locations.filter((_, idx) => idx !== i);
                                        const nextActive = Math.max(0, (activeIndex || 0) - (i <= (activeIndex || 0) ? 1 : 0));
                                        setAttributes({ locations: next, activeIndex: nextActive });
                                    }}>{__('Remove', 'ad-map')}</Button>
                                </div>
                            </div>

                            <TextControl
                                label={__('Country', 'ad-map')}
                                value={loc.country || ''}
                                onChange={(v) => {
                                    const next = [...locations];
                                    next[i] = { ...next[i], country: v };
                                    setAttributes({ locations: next });
                                }}
                            />
                            {/* Address Lines - separate inputs */}
                            <div style={{ marginTop: 8 }}>
                                <p style={{ fontWeight: 600, margin: '0 0 6px' }}>{__('Address Lines', 'ad-map')}</p>
                                {(loc.addressLines && loc.addressLines.length ? loc.addressLines : ['']).map((line, lineIdx) => (
                                    <div key={lineIdx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                        <TextControl
                                            placeholder={__('Address line', 'ad-map')}
                                            value={line}
                                            onChange={(v) => {
                                                const next = [...locations];
                                                const lines = [...(next[i].addressLines || [])];
                                                lines[lineIdx] = v;
                                                next[i] = { ...next[i], addressLines: lines.map(s => (s || '').trim()).filter(Boolean) };
                                                setAttributes({ locations: next });
                                            }}
                                        />
                                        <Button
                                            isSmall
                                            isDestructive
                                            onClick={() => {
                                                const next = [...locations];
                                                const lines = [...(next[i].addressLines || [])];
                                                lines.splice(lineIdx, 1);
                                                next[i] = { ...next[i], addressLines: lines };
                                                setAttributes({ locations: next });
                                            }}
                                        >
                                            {__('Remove', 'ad-map')}
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    isSecondary
                                    onClick={() => {
                                        const next = [...locations];
                                        const lines = [...(next[i].addressLines || [])];
                                        lines.push('');
                                        next[i] = { ...next[i], addressLines: lines };
                                        setAttributes({ locations: next });
                                    }}
                                >
                                    {__('Add Address Line', 'ad-map')}
                                </Button>
                            </div>
                            <TextControl
                                label={__('Phone', 'ad-map')}
                                value={loc.phone || ''}
                                onChange={(v) => {
                                    const next = [...locations];
                                    next[i] = { ...next[i], phone: v };
                                    setAttributes({ locations: next });
                                }}
                            />
                            <TextControl
                                label={__('Email', 'ad-map')}
                                value={loc.email || ''}
                                onChange={(v) => {
                                    const next = [...locations];
                                    next[i] = { ...next[i], email: v };
                                    setAttributes({ locations: next });
                                }}
                            />
                            <TextControl
                                label={__('Map Embed URL (Google Maps iframe src)', 'ad-map')}
                                value={loc.mapEmbedUrl || ''}
                                onChange={(v) => {
                                    const next = [...locations];
                                    next[i] = { ...next[i], mapEmbedUrl: v };
                                    setAttributes({ locations: next });
                                }}
                            />
                            {/* Optional coordinates for fly mode with hemisphere */}
                            <div >
                                <SelectControl
                                    label={__('Lat', 'ad-map')}
                                    hideLabelFromVision
                                    value={(typeof loc.lat === 'number' ? (loc.lat < 0 ? 'S' : 'N') : 'N')}
                                    options={[{ label: 'N', value: 'N' }, { label: 'S', value: 'S' }]}
                                    onChange={(hemi) => {
                                        const next = [...locations];
                                        const absDeg = Math.abs(typeof loc.lat === 'number' ? loc.lat : 0);
                                        const signed = hemi === 'S' ? -absDeg : absDeg;
                                        next[i] = { ...next[i], lat: signed };
                                        setAttributes({ locations: next });
                                    }}
                                />
                                <TextControl
                                    type="number"
                                    label={__('Latitude (Â°)', 'ad-map')}
                                    value={
                                        typeof loc.lat === 'number' ? String(Math.min(90, Math.max(0, Math.abs(loc.lat)))) : ''
                                    }
                                    placeholder="0 â€“ 90"
                                    onChange={(v) => {
                                        const num = parseFloat(v);
                                        const next = [...locations];
                                        if (isNaN(num)) {
                                            next[i] = { ...next[i], lat: undefined };
                                        } else {
                                            const clamped = Math.min(90, Math.max(0, num));
                                            const hemi = (typeof loc.lat === 'number' ? (loc.lat < 0 ? 'S' : 'N') : 'N');
                                            const signed = hemi === 'S' ? -Math.abs(clamped) : Math.abs(clamped);
                                            next[i] = { ...next[i], lat: signed };
                                        }
                                        setAttributes({ locations: next });
                                    }}
                                />
                                <SelectControl
                                    label={__('Lng', 'ad-map')}
                                    hideLabelFromVision
                                    value={(typeof loc.lng === 'number' ? (loc.lng < 0 ? 'W' : 'E') : 'E')}
                                    options={[{ label: 'E', value: 'E' }, { label: 'W', value: 'W' }]}
                                    onChange={(hemi) => {
                                        const next = [...locations];
                                        const absDeg = Math.abs(typeof loc.lng === 'number' ? loc.lng : 0);
                                        const signed = hemi === 'W' ? -absDeg : absDeg;
                                        next[i] = { ...next[i], lng: signed };
                                        setAttributes({ locations: next });
                                    }}
                                />
                                <TextControl
                                    type="number"
                                    label={__('Longitude (Â°)', 'ad-map')}
                                    value={
                                        typeof loc.lng === 'number' ? String(Math.min(180, Math.max(0, Math.abs(loc.lng)))) : ''
                                    }
                                    placeholder="0 â€“ 180"
                                    onChange={(v) => {
                                        const num = parseFloat(v);
                                        const next = [...locations];
                                        if (isNaN(num)) {
                                            next[i] = { ...next[i], lng: undefined };
                                        } else {
                                            const clamped = Math.min(180, Math.max(0, num));
                                            const hemi = (typeof loc.lng === 'number' ? (loc.lng < 0 ? 'W' : 'E') : 'E');
                                            const signed = hemi === 'W' ? -Math.abs(clamped) : Math.abs(clamped);
                                            next[i] = { ...next[i], lng: signed };
                                        }
                                        setAttributes({ locations: next });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <Button isPrimary onClick={() => {
                        const next = [...(locations || [])];
                        next.push({ id: Date.now(), country: __('New Country', 'ad-map'), addressLines: [__('Address line', 'ad-map')], phone: '', email: '', mapEmbedUrl: '' });
                        setAttributes({ locations: next, activeIndex: next.length - 1 });
                    }}>{__('Add Location', 'ad-map')}</Button>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} data-block-id={blockId}>
                <div className={`ad-map__container ${containerMode === 'constrained' ? 'is-constrained' : ''} ${singleMapMode ? 'is-single-map' : ''}`}>
                    <div className="ad-map__box">
                        <div className="ad-map__locations">
                            <div className="ad-map__locations__list">
                                {locations.map((loc, i) => (
                                    <div
                                        key={loc.id}
                                        className={`ad-map__locations__item ${i === (activeIndex ?? 0) ? 'is-active' : ''}`}
                                        onClick={() => setAttributes({ activeIndex: i })}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {loc.country}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ad-map__address">
                            {locations.map((loc, i) => (
                                <div key={loc.id} className={`ad-map__address__panel ${i === (activeIndex ?? 0) ? 'is-active' : ''}`}>
                                    <div className="ad-map__address__item">
                                        <h4 className="ad-map__address__title">Address</h4>
                                        {(loc.addressLines || []).map((line, idx) => (
                                            <p key={idx}>{line}</p>
                                        ))}
                                    </div>
                                    {loc.phone && (
                                        <div className="ad-map__address__item">
                                            <h4 className="ad-map__address__title">Phone</h4>
                                            <p>{loc.phone}</p>
                                        </div>
                                    )}
                                    {loc.email && (
                                        <div className="ad-map__address__item">
                                            <h4 className="ad-map__address__title">Email</h4>
                                            <p>{loc.email}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="ad-map__map">
                            {singleMapMode ? (
                                <div className="ad-map__map__panel is-active">
                                    {locations?.[activeIndex ?? 0]?.mapEmbedUrl ? (
                                        <iframe
                                            key={String(activeIndex ?? 0)}
                                            src={locations?.[activeIndex ?? 0]?.mapEmbedUrl}
                                            style={{ border: 0, width: '100%', height: '100%' }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={`map-${locations?.[activeIndex ?? 0]?.country || 'map'}`}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>No Map URL</div>
                                    )}
                                </div>
                            ) : (
                                locations.map((loc, i) => (
                                    <div key={loc.id} className={`ad-map__map__panel ${i === (activeIndex ?? 0) ? 'is-active' : ''}`}>
                                        {loc.mapEmbedUrl ? (
                                            <iframe
                                                src={loc.mapEmbedUrl}
                                                style={{ border: 0, width: '100%', height: '100%' }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title={`map-${loc.country}`}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>No Map URL</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}



