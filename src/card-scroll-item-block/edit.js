import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    PanelColorSettings,
    RichText,
    MediaUpload,
    MediaUploadCheck,
    useInnerBlocksProps,
    useSettings,
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
import InspectorTabs from '../components/InspectorTabs';

const BREAKPOINTS = [
    { name: 'mobile', icon: mobile, label: __('Mobile', 'adaire-blocks') },
    { name: 'tablet', icon: tablet, label: __('Tablet', 'adaire-blocks') },
    { name: 'smallLaptop', icon: desktop, label: __('Small Laptop', 'adaire-blocks') },
    { name: 'desktop', icon: desktop, label: __('Desktop', 'adaire-blocks') },
    { name: 'bigDesktop', icon: desktop, label: __('Big Desktop', 'adaire-blocks') },
];

const TEXT_TRANSFORM_OPTIONS = [
    { label: __('None', 'adaire-blocks'), value: 'none' },
    { label: __('Uppercase', 'adaire-blocks'), value: 'uppercase' },
    { label: __('Lowercase', 'adaire-blocks'), value: 'lowercase' },
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

const FONT_WEIGHT_OPTIONS = [
    { label: __('Default (inherit)', 'adaire-blocks'), value: '' },
    { label: '300', value: '300' },
    { label: '400', value: '400' },
    { label: '500', value: '500' },
    { label: '600', value: '600' },
    { label: '700', value: '700' },
    { label: '800', value: '800' },
];

export default function Edit({ attributes, setAttributes }) {
    const [ themeColors ] = useSettings( 'color.palette.theme' );
    const bindColor = ( hex ) => {
        if ( ! hex ) return '';
        const match = ( themeColors || [] ).find( c => c.color === hex );
        return match ? `var(--wp--preset--color--${ match.slug })` : hex;
    };
    const resolveColor = ( v ) => {
        if ( ! v || ! v.startsWith( 'var(--wp--preset--color--' ) ) return v ?? '';
        const slug = v.slice( 'var(--wp--preset--color--'.length, -1 );
        return ( themeColors || [] ).find( c => c.slug === slug )?.color ?? v;
    };
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
        responsiveCardWidth,
        previewText,
        imageBackgroundSize,
        imageBackgroundPosition,
        titleFontSize,
        titleFontWeight,
        titleLineHeight,
        titleLetterSpacing,
        titleTextTransform,
        descriptionFontSize,
        descriptionFontWeight,
        descriptionLineHeight,
        descriptionLetterSpacing,
        descriptionTextTransform,
        fontFamily,
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

    // Emits one CSS var per breakpoint that actually has an override set,
    // e.g. { mobile: '2rem' } -> { '--title-margin-bottom-mobile': '2rem' }.
    // Mirrors save.js exactly, so the same breakpoint's real media query
    // picks up the same value in the editor as on the front end — setting a
    // single unsuffixed var tied to whichever device tab happens to be
    // selected (the old approach) only ever applied at the mobile breakpoint
    // and ignored the editor canvas's actual rendered width otherwise.
    const responsiveStyleVars = (attr, cssVarName) => {
        const obj = attributes[attr];
        if (!obj) return {};
        return Object.keys(obj).reduce((acc, br) => {
            if (obj[br]) acc[`${cssVarName}-${br}`] = obj[br];
            return acc;
        }, {});
    };

    // Reads the numeric portion out of a "NN%" string for the width drag
    // slider. Non-percent values (px/em/etc, set via the unit field below)
    // or an unset/inherited value fall back to 100 so the handle still sits
    // somewhere sensible — dragging it always writes a fresh percent value.
    const parsePercent = (val, fallback = 100) => {
        if (typeof val !== 'string') return fallback;
        const match = val.match(/^(-?\d+(?:\.\d+)?)%$/);
        return match ? parseFloat(match[1]) : fallback;
    };

    const blockProps = useBlockProps({
        className: 'adaire-card-scroll__card',
        style: {
            backgroundColor: backgroundColor,
            boxShadow: `0 4px ${shadowBlur}px -1px ${shadowColor}`,
            '--card-min-height': 'var(--current-card-min-height)',
            ...responsiveStyleVars('responsiveTitleMarginBottom', '--title-margin-bottom'),
            ...responsiveStyleVars('responsiveDescriptionMarginBottom', '--desc-margin-bottom'),
            ...responsiveStyleVars('responsiveCardWidth', '--card-width'),
            // Per-card typography overrides. Title/description font-size,
            // font-weight, and line-height reuse the parent card-scroll-block's
            // own `--current-title-*` / `--current-desc-*` variable names — when
            // set here, the CSS custom property cascade lets this single card
            // override the slider-wide value without touching the parent block.
            // Letter-spacing/text-transform/font-family have no parent-level
            // equivalent, so they're new variables consumed by this block's own
            // style.scss.
            ...(titleFontSize ? { '--current-title-size': titleFontSize } : {}),
            ...(titleFontWeight ? { '--current-title-weight': titleFontWeight } : {}),
            ...(titleLineHeight ? { '--current-title-lh': titleLineHeight } : {}),
            '--card-title-letter-spacing': titleLetterSpacing || 'normal',
            '--card-title-text-transform': titleTextTransform || 'none',
            ...(descriptionFontSize ? { '--current-desc-size': descriptionFontSize } : {}),
            ...(descriptionFontWeight ? { '--current-desc-weight': descriptionFontWeight } : {}),
            ...(descriptionLineHeight ? { '--current-desc-lh': descriptionLineHeight } : {}),
            '--card-desc-letter-spacing': descriptionLetterSpacing || 'normal',
            '--card-desc-text-transform': descriptionTextTransform || 'none',
            '--card-font-family': fontFamily || 'inherit',
        }
    });

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>
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

                <PanelBody title={__('Card Content', 'adaire-blocks')} initialOpen={true}>
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

                <PanelBody title={__('Layout', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Card Width — drag to resize', 'adaire-blocks')}
                        value={parsePercent(responsiveCardWidth?.[deviceType])}
                        min={10}
                        max={100}
                        step={1}
                        onChange={(val) => updateResponsive('responsiveCardWidth', deviceType, `${val}%`)}
                        help={!responsiveCardWidth?.[deviceType] ? __('Inheriting from global Card Slider setting.', 'adaire-blocks') : __("Overrides the Card Slider's width just for this card.", 'adaire-blocks')}
                    />
                    <UnitControl
                        label={`Card Width (${deviceType})`}
                        value={responsiveCardWidth?.[deviceType] || ''}
                        onChange={(val) => updateResponsive('responsiveCardWidth', deviceType, val)}
                        help={__('Type an exact value in any unit (%, px, em…) instead of dragging.', 'adaire-blocks')}
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

                <PanelBody title={__('Spacing', 'adaire-blocks')} initialOpen={false}>
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
                </PanelBody>

                <PanelBody title={__('Typography', 'adaire-blocks')} initialOpen={false}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>{__('Title', 'adaire-blocks')}</p>
                    <UnitControl
                        label={__('Font Size', 'adaire-blocks')}
                        value={titleFontSize}
                        onChange={(value) => setAttributes({ titleFontSize: value })}
                        help={__("Leave blank to use the Card Slider's title size.", 'adaire-blocks')}
                    />
                    <SelectControl
                        label={__('Font Weight', 'adaire-blocks')}
                        value={titleFontWeight || ''}
                        options={FONT_WEIGHT_OPTIONS}
                        onChange={(value) => setAttributes({ titleFontWeight: value })}
                        help={__("Leave blank to use the Card Slider's title weight.", 'adaire-blocks')}
                    />
                    <UnitControl
                        label={__('Line Height', 'adaire-blocks')}
                        value={titleLineHeight}
                        onChange={(value) => setAttributes({ titleLineHeight: value })}
                        help={__("Leave blank to use the Card Slider's title line height.", 'adaire-blocks')}
                    />
                    <UnitControl
                        label={__('Letter Spacing', 'adaire-blocks')}
                        value={titleLetterSpacing}
                        onChange={(value) => setAttributes({ titleLetterSpacing: value })}
                    />
                    <SelectControl
                        label={__('Text Transform', 'adaire-blocks')}
                        value={titleTextTransform}
                        options={TEXT_TRANSFORM_OPTIONS}
                        onChange={(value) => setAttributes({ titleTextTransform: value })}
                    />

                    <p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '4px' }}>{__('Description', 'adaire-blocks')}</p>
                    <UnitControl
                        label={__('Font Size', 'adaire-blocks')}
                        value={descriptionFontSize}
                        onChange={(value) => setAttributes({ descriptionFontSize: value })}
                        help={__("Leave blank to use the Card Slider's description size.", 'adaire-blocks')}
                    />
                    <SelectControl
                        label={__('Font Weight', 'adaire-blocks')}
                        value={descriptionFontWeight || ''}
                        options={FONT_WEIGHT_OPTIONS}
                        onChange={(value) => setAttributes({ descriptionFontWeight: value })}
                        help={__("Leave blank to use the Card Slider's description weight.", 'adaire-blocks')}
                    />
                    <UnitControl
                        label={__('Line Height', 'adaire-blocks')}
                        value={descriptionLineHeight}
                        onChange={(value) => setAttributes({ descriptionLineHeight: value })}
                        help={__("Leave blank to use the Card Slider's description line height.", 'adaire-blocks')}
                    />
                    <UnitControl
                        label={__('Letter Spacing', 'adaire-blocks')}
                        value={descriptionLetterSpacing}
                        onChange={(value) => setAttributes({ descriptionLetterSpacing: value })}
                    />
                    <SelectControl
                        label={__('Text Transform', 'adaire-blocks')}
                        value={descriptionTextTransform}
                        options={TEXT_TRANSFORM_OPTIONS}
                        onChange={(value) => setAttributes({ descriptionTextTransform: value })}
                    />

                    <p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '4px' }}>{__('Block', 'adaire-blocks')}</p>
                    <SelectControl
                        label={__('Font Family', 'adaire-blocks')}
                        value={fontFamily || ''}
                        options={FONT_FAMILY_OPTIONS}
                        onChange={(value) => setAttributes({ fontFamily: value })}
                        help={__('Applies to this card only (title and description).', 'adaire-blocks')}
                    />
                </PanelBody>

                <PanelBody title={__('Preview Text', 'adaire-blocks')} initialOpen={false}>
                    <TextControl
                        label={__('Preview Text', 'adaire-blocks')}
                        value={previewText || ''}
                        onChange={(val) => setAttributes({ previewText: val })}
                        help={__('Text that appears in the visible space when the next card pins on top. This text is clickable and will scroll to show this card fully.', 'adaire-blocks')}
                    />
                </PanelBody>

                <PanelColorSettings
                    title={__('Colors', 'adaire-blocks')}
                    initialOpen={false}
                    colorSettings={[
                        { value: resolveColor( backgroundColor ), onChange: (val) => setAttributes({ backgroundColor: bindColor( val ) }), label: __('Background', 'adaire-blocks') },
                        { value: resolveColor( headerTextColor ), onChange: (val) => setAttributes({ headerTextColor: bindColor( val ) }), label: __('Title', 'adaire-blocks') },
                        { value: resolveColor( textColor ), onChange: (val) => setAttributes({ textColor: bindColor( val ) }), label: __('Description', 'adaire-blocks') },
                        { value: resolveColor( shadowColor ), onChange: (val) => setAttributes({ shadowColor: bindColor( val ) }), label: __('Shadow', 'adaire-blocks') },
                    ]}
                />
                <PanelBody title={__('Shadow', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl label="Shadow Blur" value={shadowBlur} onChange={(val) => setAttributes({ shadowBlur: val })} min={0} max={50} />
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <div className="adaire-card-scroll__card-inner">
                    <div className='adaire-card-scroll__card-row'>
                        <div className="adaire-card-scroll__card-text">
                            <RichText
                                tagName="h2"
                                className="adaire-card-scroll__card-title"
                                value={title}
                                onChange={(val) => setAttributes({ title: val })}
                                placeholder={__('Card Title...', 'adaire-blocks')}
                                style={{ color: headerTextColor }}
                            />
                            <RichText
                                tagName="p"
                                className="adaire-card-scroll__card-description"
                                value={description}
                                onChange={(val) => setAttributes({ description: val })}
                                placeholder={__('Card description...', 'adaire-blocks')}
                                style={{ color: textColor }}
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
                                        <span>{__('No Media', 'adaire-blocks')}</span>
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



