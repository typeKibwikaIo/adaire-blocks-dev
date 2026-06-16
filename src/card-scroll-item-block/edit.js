import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    PanelColorSettings,
    RichText,
    MediaUpload,
    MediaUploadCheck,
    useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    RangeControl,
    SelectControl,
    Button,
    ButtonGroup,
    __experimentalUnitControl as UnitControl,
    BaseControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { desktop, tablet, mobile } from '@wordpress/icons';
import QuickZone from '../components/QuickZone';

const BREAKPOINTS = [
    { name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks-dev2') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks-dev2') },
    { name: 'smallLaptop', icon: desktop, label: __('Small Laptop', 'adaire-blocks-dev2') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks-dev2') },
    { name: 'bigDesktop', icon: desktop, label: __('Big Desktop', 'adaire-blocks-dev2') },
];

export default function Edit({ attributes, setAttributes }) {
    const {
        title,
        description,
        mediaType,
        mediaId,
        mediaUrl,
        backgroundColor,
        headerTextColor,
        textColor,
        shadowColor,
        shadowBlur,
        buttonAlignment,
        videoLoop,
        videoType,
        externalVideoUrl,
        responsiveTitleMarginBottom,
        responsiveDescriptionMarginBottom,
        previewText,
        imageBackgroundSize,
        imageBackgroundPosition,
    } = attributes;

    const [deviceType, setDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);

    const updateResponsive = (attr, breakpoint, value) => {
        setAttributes({
            [attr]: {
                ...attributes[attr],
                [breakpoint]: value,
            },
        });
    };

    const innerBlocksProps = useInnerBlocksProps(
        { className: `adaire-card-scroll__card-buttons is-aligned-${buttonAlignment?.[deviceType] || 'left'}` },
        {
            allowedBlocks: ['create-block/button-block'],
            template: [['create-block/button-block', { text: 'Learn More' }]],
            orientation: 'horizontal',
        }
    );

    const blockProps = useBlockProps({
        className: 'adaire-card-scroll__card',
        style: {
            backgroundColor: backgroundColor,
            boxShadow: `0 4px ${shadowBlur}px -1px ${shadowColor}`,
            '--card-min-height': 'var(--current-card-min-height)',
            '--title-margin-bottom': responsiveTitleMarginBottom?.[deviceType] || 'var(--title-margin-bottom-mobile)',
            '--desc-margin-bottom': responsiveDescriptionMarginBottom?.[deviceType] || 'var(--desc-margin-bottom-mobile)',
        }
    });

    return (
        <>
            <InspectorControls>
                <div className="adaire-device-toggle" style={{ padding: '16px 16px 0', borderBottom: '1px solid #e0e0e0', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <ButtonGroup>
                        {BREAKPOINTS.map((bp) => (
                            <Button
                                key={bp.name}
                                isPrimary={deviceType === bp.name}
                                onClick={() => setDeviceType(bp.name)}
                                icon={bp.icon}
                                label={bp.label}
                                showTooltip
                            />
                        ))}
                    </ButtonGroup>
                </div>

                <PanelBody title={__('Card Content', 'adaire-blocks-dev2')} initialOpen={true}>
                    <SelectControl
                        label="Media Type"
                        value={mediaType}
                        options={[
                            { label: 'Image', value: 'image' },
                            { label: 'Video', value: 'video' }
                        ]}
                        onChange={(val) => setAttributes({ mediaType: val })}
                    />

                    {mediaType === 'video' && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                            <SelectControl
                                label="Video Type"
                                value={videoType}
                                options={[
                                    { label: 'Local File', value: 'local' },
                                    { label: 'YouTube / Vimeo', value: 'external' }
                                ]}
                                onChange={(val) => setAttributes({ videoType: val })}
                            />
                            {videoType === 'external' ? (
                                <TextControl
                                    label="External Video URL"
                                    value={externalVideoUrl}
                                    onChange={(val) => setAttributes({ externalVideoUrl: val })}
                                    help="Supports YouTube and Vimeo URLs."
                                />
                            ) : (
                                <MediaUploadCheck>
                                    <MediaUpload
                                        onSelect={(media) => setAttributes({ mediaId: media.id, mediaUrl: media.url })}
                                        allowedTypes={['video']}
                                        value={mediaId}
                                        render={({ open }) => (
                                            <Button variant="secondary" onClick={open} style={{ width: '100%', marginBottom: '16px' }}>
                                                {mediaUrl ? 'Replace Video File' : 'Select Video File'}
                                            </Button>
                                        )}
                                    />
                                </MediaUploadCheck>
                            )}
                            <SelectControl
                                label="Video Loop"
                                value={videoLoop}
                                options={[
                                    { label: 'Yes', value: true },
                                    { label: 'No', value: false }
                                ]}
                                onChange={(val) => setAttributes({ videoLoop: val === 'true' || val === true })}
                            />
                        </div>
                    )}

                    {mediaType === 'image' && (
                        <>
                            <BaseControl label="Image">
                                <MediaUploadCheck>
                                    <MediaUpload
                                        onSelect={(media) => setAttributes({ mediaId: media.id, mediaUrl: media.url })}
                                        allowedTypes={['image']}
                                        value={mediaId}
                                        render={({ open }) => (
                                            <Button variant="secondary" onClick={open} style={{ width: '100%' }}>
                                                {mediaUrl ? 'Replace Image' : 'Select Image'}
                                            </Button>
                                        )}
                                    />
                                </MediaUploadCheck>
                            </BaseControl>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                                <SelectControl
                                    label="Background Size"
                                    value={imageBackgroundSize || 'cover'}
                                    options={[
                                        { label: 'Cover', value: 'cover' },
                                        { label: 'Contain', value: 'contain' },
                                        { label: 'Auto', value: 'auto' },
                                        { label: '100%', value: '100%' },
                                        { label: '100% 100%', value: '100% 100%' },
                                    ]}
                                    onChange={(val) => setAttributes({ imageBackgroundSize: val })}
                                />
                                <SelectControl
                                    label="Background Position"
                                    value={imageBackgroundPosition || 'center'}
                                    options={[
                                        { label: 'Center', value: 'center' },
                                        { label: 'Top', value: 'top' },
                                        { label: 'Bottom', value: 'bottom' },
                                        { label: 'Left', value: 'left' },
                                        { label: 'Right', value: 'right' },
                                        { label: 'Top Left', value: 'top left' },
                                        { label: 'Top Right', value: 'top right' },
                                        { label: 'Bottom Left', value: 'bottom left' },
                                        { label: 'Bottom Right', value: 'bottom right' },
                                    ]}
                                    onChange={(val) => setAttributes({ imageBackgroundPosition: val })}
                                />
                            </div>
                        </>
                    )}
                </PanelBody>

                <PanelBody title={__('Layout & Spacing', 'adaire-blocks-dev2')} initialOpen={false}>
                    <UnitControl
                        label={`Title Bottom Margin (${deviceType})`}
                        value={responsiveTitleMarginBottom?.[deviceType] || ''}
                        onChange={(val) => updateResponsive('responsiveTitleMarginBottom', deviceType, val)}
                        help={!responsiveTitleMarginBottom?.[deviceType] ? "Inheriting from global parent setting." : ""}
                    />
                    <UnitControl
                        label={`Description Bottom Margin (${deviceType})`}
                        value={responsiveDescriptionMarginBottom?.[deviceType] || ''}
                        onChange={(val) => updateResponsive('responsiveDescriptionMarginBottom', deviceType, val)}
                        help={!responsiveDescriptionMarginBottom?.[deviceType] ? "Inheriting from global parent setting." : ""}
                    />
                    <SelectControl
                        label={`Button Alignment (${deviceType})`}
                        value={buttonAlignment?.[deviceType] || 'left'}
                        options={[
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ]}
                        onChange={(val) => updateResponsive('buttonAlignment', deviceType, val)}
                    />
                </PanelBody>

                <PanelBody title={__('Preview Text', 'adaire-blocks-dev2')} initialOpen={false}>
                    <TextControl
                        label={__('Preview Text', 'adaire-blocks-dev2')}
                        value={previewText || ''}
                        onChange={(val) => setAttributes({ previewText: val })}
                        help={__('Text that appears in the visible space when the next card pins on top. This text is clickable and will scroll to show this card fully.', 'adaire-blocks-dev2')}
                    />
                </PanelBody>

                <PanelColorSettings
                    title={__('Colors', 'adaire-blocks-dev2')}
                    initialOpen={false}
                    colorSettings={[
                        { value: backgroundColor, onChange: (val) => setAttributes({ backgroundColor: val }), label: __('Background', 'adaire-blocks-dev2') },
                        { value: headerTextColor, onChange: (val) => setAttributes({ headerTextColor: val }), label: __('Title', 'adaire-blocks-dev2') },
                        { value: textColor, onChange: (val) => setAttributes({ textColor: val }), label: __('Description', 'adaire-blocks-dev2') },
                        { value: shadowColor, onChange: (val) => setAttributes({ shadowColor: val }), label: __('Shadow', 'adaire-blocks-dev2') },
                    ]}
                />
                <PanelBody title={__('Shadow', 'adaire-blocks-dev2')} initialOpen={false}>
                    <RangeControl label="Shadow Blur" value={shadowBlur} onChange={(val) => setAttributes({ shadowBlur: val })} min={0} max={50} />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className="adaire-card-scroll__card-inner">
                    <div className='adaire-card-scroll__card-row'>
                        <div className="adaire-card-scroll__card-text">
                            <RichText
                                tagName="h2"
                                className="adaire-card-scroll__card-title"
                                value={title}
                                onChange={(val) => setAttributes({ title: val })}
                                placeholder={__('Card Title...', 'adaire-blocks-dev2')}
                                style={{ color: headerTextColor, marginBottom: responsiveTitleMarginBottom?.[deviceType] }}
                            />
                            <RichText
                                tagName="p"
                                className="adaire-card-scroll__card-description"
                                value={description}
                                onChange={(val) => setAttributes({ description: val })}
                                placeholder={__('Card description...', 'adaire-blocks-dev2')}
                                style={{ color: textColor, marginBottom: responsiveDescriptionMarginBottom?.[deviceType] }}
                            />
                            <div {...innerBlocksProps} />
                        </div>
                        <QuickZone
                            id="card-media"
                            label="Media"
                            activeZone={activeZone}
                            setActiveZone={setActiveZone}
                            content={
                                <>
                                    <SelectControl
                                        label="Media Type"
                                        value={mediaType}
                                        options={[
                                            { label: 'Image', value: 'image' },
                                            { label: 'Video', value: 'video' }
                                        ]}
                                        onChange={(val) => setAttributes({ mediaType: val })}
                                    />
                                    {mediaType === 'video' ? (
                                        <>
                                            <SelectControl
                                                label="Video Type"
                                                value={videoType}
                                                options={[
                                                    { label: 'Local File', value: 'local' },
                                                    { label: 'YouTube / Vimeo', value: 'external' }
                                                ]}
                                                onChange={(val) => setAttributes({ videoType: val })}
                                            />
                                            {videoType === 'external' ? (
                                                <TextControl
                                                    label="External Video URL"
                                                    value={externalVideoUrl}
                                                    onChange={(val) => setAttributes({ externalVideoUrl: val })}
                                                    help="Supports YouTube and Vimeo URLs."
                                                />
                                            ) : (
                                                <MediaUploadCheck>
                                                    <MediaUpload
                                                        onSelect={(media) => setAttributes({ mediaId: media.id, mediaUrl: media.url })}
                                                        allowedTypes={['video']}
                                                        value={mediaId}
                                                        render={({ open }) => (
                                                            <Button variant="secondary" onClick={open} style={{ width: '100%' }}>
                                                                {mediaUrl ? 'Replace Video File' : 'Select Video File'}
                                                            </Button>
                                                        )}
                                                    />
                                                </MediaUploadCheck>
                                            )}
                                        </>
                                    ) : (
                                        <MediaUploadCheck>
                                            <MediaUpload
                                                onSelect={(media) => setAttributes({ mediaId: media.id, mediaUrl: media.url })}
                                                allowedTypes={['image']}
                                                value={mediaId}
                                                render={({ open }) => (
                                                    <Button variant="secondary" onClick={open} style={{ width: '100%' }}>
                                                        {mediaUrl ? 'Replace Image' : 'Select Image'}
                                                    </Button>
                                                )}
                                            />
                                        </MediaUploadCheck>
                                    )}
                                </>
                            }
                        >
                        <div className="adaire-card-scroll__card-media">
                            {videoType === 'external' && externalVideoUrl ? (
                                <div className="video-embed-preview" style={{ background: '#000', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <p>Video Embed: {externalVideoUrl}</p>
                                </div>
                            ) : (
                                mediaUrl ? (
                                    mediaType === 'image' ? (
                                        <img 
                                            src={mediaUrl} 
                                            alt={title}
                                            style={{
                                                objectFit: imageBackgroundSize || 'cover',
                                                objectPosition: imageBackgroundPosition || 'center'
                                            }}
                                        />
                                    ) : (
                                        <video src={mediaUrl} muted loop={videoLoop} autoPlay playsInline />
                                    )
                                ) : (
                                    <div className="adaire-card-scroll__card-media-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                                        <span>{__('No Media', 'adaire-blocks-dev2')}</span>
                                    </div>
                                )
                            )}
                        </div>
                        </QuickZone>
                    </div>
                </div>
            </div>
        </>
    );
}



