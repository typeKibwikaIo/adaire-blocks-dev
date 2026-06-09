import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { 
    PanelBody, 
    Button, 
    ButtonGroup, 
    TextControl,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss'; // IMPORTANT: Editor styles for proper spacing preview

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
    } = attributes;

    // Set unique block ID
    if (!blockId) {
        setAttributes({ blockId: clientId });
    }

    const blockProps = useBlockProps({
        className: 'your-block',
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
        },
    });

    return (
        <>
            <InspectorControls>
                {/* Container Settings Panel */}
                <PanelBody title={__('Container Settings', 'your-block-name')} initialOpen={true}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Container Mode', 'your-block-name')}
                    </p>
                    <ButtonGroup>
                        {[
                            { label: __('Full Width', 'your-block-name'), value: 'full' },
                            { label: __('Constrained', 'your-block-name'), value: 'constrained' },
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
                                {__('Max Width', 'your-block-name')}
                            </p>
                            <ButtonGroup style={{ marginBottom: '12px' }}>
                                <Button
                                    icon={desktop}
                                    isPrimary={deviceType === 'desktop'}
                                    onClick={() => setDeviceType('desktop')}
                                    label={__('Desktop', 'your-block-name')}
                                />
                                <Button
                                    icon={tablet}
                                    isPrimary={deviceType === 'tablet'}
                                    onClick={() => setDeviceType('tablet')}
                                    label={__('Tablet', 'your-block-name')}
                                />
                                <Button
                                    icon={mobile}
                                    isPrimary={deviceType === 'mobile'}
                                    onClick={() => setDeviceType('mobile')}
                                    label={__('Mobile', 'your-block-name')}
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

                {/* Margins Panel */}
                <PanelBody title={__('Margins', 'your-block-name')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Device', 'your-block-name')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'your-block-name')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'your-block-name')}
                        />
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'your-block-name')}
                        />
                    </ButtonGroup>
                    <BoxControl
                        label={__('Margin', 'your-block-name')}
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
                <PanelBody title={__('Padding', 'your-block-name')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Device', 'your-block-name')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'your-block-name')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'your-block-name')}
                        />
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'your-block-name')}
                        />
                    </ButtonGroup>
                    <BoxControl
                        label={__('Padding', 'your-block-name')}
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
            </InspectorControls>

            <div {...blockProps} data-block-id={blockId}>
                <div className={`your-block__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                    {/* Your block content goes here */}
                    <div className="your-block__content">
                        <p>{__('Your Block Content', 'your-block-name')}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

