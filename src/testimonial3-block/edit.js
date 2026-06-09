import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls,
    PanelColorSettings,
    MediaUpload,
    MediaUploadCheck,
    RichText
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    ButtonGroup,
    RangeControl,
    TextControl,
    ToggleControl,
    SelectControl,
    BaseControl,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import { useState, useEffect, createElement } from '@wordpress/element';
import { plus, trash, arrowUp, arrowDown, desktop, tablet, mobile } from '@wordpress/icons';
import { sprintf } from '@wordpress/i18n';

const DEFAULT_COLORS = [
    { name: __('Purple', 'testimonial3-block'), slug: 'purple', color: '#6B46C1' },
    { name: __('White', 'testimonial3-block'), slug: 'white', color: '#ffffff' },
    { name: __('Black', 'testimonial3-block'), slug: 'black', color: '#1f2937' },
];

// Custom icons for small laptop and big desktop
const smallLaptopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
},
    createElement('path', {
        d: 'M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none'
    }),
    createElement('path', {
        d: 'M2 19H22',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round'
    })
);

const bigDesktopIcon = createElement('svg', {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
},
    createElement('rect', {
        x: '3',
        y: '4',
        width: '18',
        height: '12',
        rx: '1',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        fill: 'none'
    }),
    createElement('path', {
        d: 'M8 20H16',
        stroke: 'currentColor',
        strokeWidth: '1.5',
        strokeLinecap: 'round'
    }),
    createElement('rect', {
        x: '10',
        y: '20',
        width: '4',
        height: '2',
        rx: '0.5',
        fill: 'currentColor'
    })
);

const Edit = ({ attributes, setAttributes, clientId }) => {
    const [deviceType, setDeviceType] = useState('desktop');
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    
    const {
        blockId,
        testimonials,
        slidesPerView,
        backgroundColor,
        cardBackgroundColor,
        cardBorderRadius,
        cardGap,
        cardPadding,
        quoteIconSize,
        quoteIconColor,
        quoteColor,
        quoteFontSize,
        quoteFontWeight,
        nameColor,
        nameFontSize,
        nameFontWeight,
        titleColor,
        titleFontSize,
        titleFontWeight,
        profileImageSize,
        showPagination,
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
        loop,
        cardHeight,
        mobilePeekPercent,
        listPaddingLeft,
        dragCursorText,
        dragCursorSize,
        dragCursorFontSize,
        dragCursorFontWeight,
        dragCursorColor,
        dragCursorBgColor,
        dragCursorTextTransform
    } = attributes;

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `testimonial3-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    const addTestimonial = () => {
        const newTestimonial = {
            id: `testimonial-${Date.now()}`,
            quote: __('Add testimonial quote here...', 'testimonial3-block'),
            name: __('Name', 'testimonial3-block'),
            title: __('Title', 'testimonial3-block'),
            profileImage: { id: 0, url: '', alt: '' }
        };
        setAttributes({ testimonials: [...testimonials, newTestimonial] });
        setActiveTestimonial(testimonials.length);
    };

    const removeTestimonial = (index) => {
        if (testimonials.length > 1) {
            const newTestimonials = testimonials.filter((_, i) => i !== index);
            setAttributes({ testimonials: newTestimonials });
            if (activeTestimonial >= newTestimonials.length) {
                setActiveTestimonial(newTestimonials.length - 1);
            }
        }
    };

    const moveTestimonial = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= testimonials.length) return;
        const newTestimonials = [...testimonials];
        [newTestimonials[index], newTestimonials[newIndex]] = [
            newTestimonials[newIndex],
            newTestimonials[index]
        ];
        setAttributes({ testimonials: newTestimonials });
        if (activeTestimonial === index) {
            setActiveTestimonial(newIndex);
        } else if (activeTestimonial === newIndex) {
            setActiveTestimonial(index);
        }
    };

    const updateTestimonial = (index, key, value) => {
        const newTestimonials = [...testimonials];
        newTestimonials[index] = { ...newTestimonials[index], [key]: value };
        setAttributes({ testimonials: newTestimonials });
    };

    const updateContainerDimension = (device, property, value) => {
        const next = {
            ...containerMaxWidth,
            [device]: {
                ...containerMaxWidth?.[device],
                [property]: value,
            },
        };
        setAttributes({ containerMaxWidth: next });
    };

    const normalizeDimension = (dimension, defaults) => {
        if (typeof dimension === 'number') {
            return { value: dimension, unit: 'px' };
        }
        if (typeof dimension === 'object' && dimension !== null) {
            return {
                value: dimension?.value ?? defaults.value,
                unit: dimension?.unit ?? defaults.unit,
            };
        }
        return defaults;
    };

    const cardHeightDefaults = { value: 460, unit: 'px' };
    const normalizedCardHeight = normalizeDimension(cardHeight, cardHeightDefaults);

    const getResponsiveValue = (obj, fallback) => {
        if (!obj || typeof obj !== 'object') return fallback;
        return obj[deviceType] !== undefined
            ? obj[deviceType]
            : obj.desktop !== undefined
            ? obj.desktop
            : obj.mobile !== undefined
            ? obj.mobile
            : fallback;
    };

    const setResponsiveValue = (key, value) => {
        setAttributes({
            [key]: {
                ...(attributes[key] || {}),
                [deviceType]: value,
            },
        });
    };

    const blockProps = useBlockProps({
        className: 'adaire-testimonial3',
        style: {
            '--testimonial3-bg-color': backgroundColor,
            '--testimonial3-card-bg': cardBackgroundColor,
            '--testimonial3-card-radius': `${cardBorderRadius}px`,
            '--testimonial3-card-gap': `${cardGap}px`,
            '--testimonial3-card-padding-desktop': `${cardPadding?.desktop ?? cardPadding ?? 40}px`,
            '--testimonial3-card-padding-tablet': `${cardPadding?.tablet ?? cardPadding?.desktop ?? cardPadding ?? 30}px`,
            '--testimonial3-card-padding-mobile': `${cardPadding?.mobile ?? cardPadding?.tablet ?? cardPadding?.desktop ?? cardPadding ?? 20}px`,
            '--testimonial3-quote-icon-size': `${quoteIconSize}px`,
            '--testimonial3-quote-icon-color': quoteIconColor,
            '--testimonial3-quote-color': quoteColor,
            '--testimonial3-quote-font-size-desktop': `${quoteFontSize?.desktop ?? quoteFontSize ?? 16}px`,
            '--testimonial3-quote-font-size-tablet': `${quoteFontSize?.tablet ?? quoteFontSize?.desktop ?? quoteFontSize ?? 15}px`,
            '--testimonial3-quote-font-size-mobile': `${quoteFontSize?.mobile ?? quoteFontSize?.tablet ?? quoteFontSize?.desktop ?? quoteFontSize ?? 14}px`,
            '--testimonial3-quote-font-weight': quoteFontWeight,
            '--testimonial3-name-color': nameColor,
            '--testimonial3-name-font-size-desktop': `${nameFontSize?.desktop ?? nameFontSize ?? 18}px`,
            '--testimonial3-name-font-size-tablet': `${nameFontSize?.tablet ?? nameFontSize?.desktop ?? nameFontSize ?? 17}px`,
            '--testimonial3-name-font-size-mobile': `${nameFontSize?.mobile ?? nameFontSize?.tablet ?? nameFontSize?.desktop ?? nameFontSize ?? 16}px`,
            '--testimonial3-name-font-weight': nameFontWeight,
            '--testimonial3-title-color': titleColor,
            '--testimonial3-title-font-size-desktop': `${titleFontSize?.desktop ?? titleFontSize ?? 14}px`,
            '--testimonial3-title-font-size-tablet': `${titleFontSize?.tablet ?? titleFontSize?.desktop ?? titleFontSize ?? 13}px`,
            '--testimonial3-title-font-size-mobile': `${titleFontSize?.mobile ?? titleFontSize?.tablet ?? titleFontSize?.desktop ?? titleFontSize ?? 12}px`,
            '--testimonial3-title-font-weight': titleFontWeight,
            '--testimonial3-profile-size': `${profileImageSize}px`,
            '--testimonial3-slides-per-view-desktop': slidesPerView?.desktop ?? 3,
            '--testimonial3-slides-per-view-tablet': slidesPerView?.tablet ?? 2,
            '--testimonial3-slides-per-view-mobile': slidesPerView?.mobile ?? 1,
            '--container-max-width': containerMaxWidth?.desktop?.value ? `${containerMaxWidth.desktop.value}${containerMaxWidth.desktop.unit}` : '1200px',
            '--container-max-width-tablet': containerMaxWidth?.tablet?.value ? `${containerMaxWidth.tablet.value}${containerMaxWidth.tablet.unit}` : '100%',
            '--container-max-width-mobile': containerMaxWidth?.mobile?.value ? `${containerMaxWidth.mobile.value}${containerMaxWidth.mobile.unit}` : '100%',
            marginTop: `${marginTop?.desktop ?? marginTop ?? 0}px`,
            marginRight: `${marginRight?.desktop ?? marginRight ?? 0}px`,
            marginBottom: `${marginBottom?.desktop ?? marginBottom ?? 0}px`,
            marginLeft: `${marginLeft?.desktop ?? marginLeft ?? 0}px`,
            '--margin-top-tablet': `${marginTop?.tablet ?? marginTop?.desktop ?? marginTop ?? 0}px`,
            '--margin-right-tablet': `${marginRight?.tablet ?? marginRight?.desktop ?? marginRight ?? 0}px`,
            '--margin-bottom-tablet': `${marginBottom?.tablet ?? marginBottom?.desktop ?? marginBottom ?? 0}px`,
            '--margin-left-tablet': `${marginLeft?.tablet ?? marginLeft?.desktop ?? marginLeft ?? 0}px`,
            '--margin-top-mobile': `${marginTop?.mobile ?? marginTop?.desktop ?? marginTop ?? 0}px`,
            '--margin-right-mobile': `${marginRight?.mobile ?? marginRight?.desktop ?? marginRight ?? 0}px`,
            '--margin-bottom-mobile': `${marginBottom?.mobile ?? marginBottom?.desktop ?? marginBottom ?? 0}px`,
            '--margin-left-mobile': `${marginLeft?.mobile ?? marginLeft?.desktop ?? marginLeft ?? 0}px`,
            '--padding-top': `${paddingTop?.desktop ?? paddingTop ?? 0}px`,
            '--padding-right': `${paddingRight?.desktop ?? paddingRight ?? 0}px`,
            '--padding-bottom': `${paddingBottom?.desktop ?? paddingBottom ?? 0}px`,
            '--padding-left': `${paddingLeft?.desktop ?? paddingLeft ?? 0}px`,
            '--padding-top-tablet': `${paddingTop?.tablet ?? paddingTop?.desktop ?? paddingTop ?? 0}px`,
            '--padding-right-tablet': `${paddingRight?.tablet ?? paddingRight?.desktop ?? paddingRight ?? 0}px`,
            '--padding-bottom-tablet': `${paddingBottom?.tablet ?? paddingBottom?.desktop ?? paddingBottom ?? 0}px`,
            '--padding-left-tablet': `${paddingLeft?.tablet ?? paddingLeft?.desktop ?? paddingLeft ?? 0}px`,
            '--padding-top-mobile': `${paddingTop?.mobile ?? paddingTop?.desktop ?? paddingTop ?? 0}px`,
            '--padding-right-mobile': `${paddingRight?.mobile ?? paddingRight?.desktop ?? paddingRight ?? 0}px`,
            '--padding-bottom-mobile': `${paddingBottom?.mobile ?? paddingBottom?.desktop ?? paddingBottom ?? 0}px`,
            '--padding-left-mobile': `${paddingLeft?.mobile ?? paddingLeft?.desktop ?? paddingLeft ?? 0}px`,
        },
        'data-block-id': blockId,
        'data-testimonials': JSON.stringify(testimonials),
        'data-slides-per-view': JSON.stringify(slidesPerView),
        'data-show-pagination': showPagination,
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Testimonials', 'testimonial3-block')} initialOpen={true}>
                    {testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} style={{ marginBottom: '20px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <strong>{sprintf(__('Testimonial %d', 'testimonial3-block'), index + 1)}</strong>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <Button
                                        icon={arrowUp}
                                        onClick={() => moveTestimonial(index, -1)}
                                        isSmall
                                        disabled={index === 0}
                                        label={__('Move Up', 'testimonial3-block')}
                                    />
                                    <Button
                                        icon={arrowDown}
                                        onClick={() => moveTestimonial(index, 1)}
                                        isSmall
                                        disabled={index === testimonials.length - 1}
                                        label={__('Move Down', 'testimonial3-block')}
                                    />
                                    {testimonials.length > 1 && (
                                        <Button
                                            icon={trash}
                                            onClick={() => removeTestimonial(index)}
                                            isSmall
                                            isDestructive
                                            label={__('Remove', 'testimonial3-block')}
                                        />
                                    )}
                                </div>
                            </div>
                            <RichText
                                tagName="p"
                                value={testimonial.quote}
                                onChange={(value) => updateTestimonial(index, 'quote', value)}
                                placeholder={__('Testimonial quote...', 'testimonial3-block')}
                                style={{ marginBottom: '12px' }}
                            />
                            <TextControl
                                label={__('Name', 'testimonial3-block')}
                                value={testimonial.name}
                                onChange={(value) => updateTestimonial(index, 'name', value)}
                            />
                            <TextControl
                                label={__('Title', 'testimonial3-block')}
                                value={testimonial.title}
                                onChange={(value) => updateTestimonial(index, 'title', value)}
                            />
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={(media) => updateTestimonial(index, 'profileImage', {
                                        id: media.id,
                                        url: media.url,
                                        alt: media.alt || testimonial.name
                                    })}
                                    allowedTypes={['image']}
                                    value={testimonial.profileImage?.id}
                                    render={({ open }) => (
                                        <Button onClick={open} variant="secondary" style={{ width: '100%', marginTop: '8px' }}>
                                            {testimonial.profileImage?.url ? __('Change Image', 'testimonial3-block') : __('Select Profile Image', 'testimonial3-block')}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                            {testimonial.profileImage?.url && (
                                <Button
                                    onClick={() => updateTestimonial(index, 'profileImage', { id: 0, url: '', alt: '' })}
                                    variant="link"
                                    isDestructive
                                    style={{ width: '100%', marginTop: '4px' }}
                                >
                                    {__('Remove Image', 'testimonial3-block')}
                                </Button>
                            )}
                    </div>
                    ))}
                    <Button
                        icon={plus}
                        onClick={addTestimonial}
                        variant="secondary"
                        style={{ width: '100%', marginTop: '12px' }}
                    >
                        {__('Add Testimonial', 'testimonial3-block')}
                    </Button>
                </PanelBody>

                <PanelBody title={__('Layout', 'testimonial3-block')} initialOpen={false}>
                    <RangeControl
                        label={sprintf(
                            __('Card Height (%s)', 'testimonial3-block'),
                            normalizedCardHeight.unit || 'px'
                        )}
                        value={normalizedCardHeight.value}
                        onChange={(value) =>
                            setAttributes({
                                cardHeight: {
                                    ...(normalizedCardHeight || {}),
                                    value,
                                },
                            })
                        }
                        min={0}
                        max={1000}
                        step={5}
                    />
                    <BaseControl label={__('Card Height Unit', 'testimonial3-block')}>
                        <ButtonGroup>
                            {['px', 'vh', 'vw', 'rem', '%', 'auto'].map((u) => (
                                <Button
                                    key={u}
                                    isSmall
                                    isPrimary={(normalizedCardHeight.unit || 'px') === u}
                                    onClick={() =>
                                        setAttributes({
                                            cardHeight: {
                                                ...(normalizedCardHeight || {}),
                                                unit: u,
                                            },
                                        })
                                    }
                                >
                                    {u}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </BaseControl>
                    <RangeControl
                        label={__('Gap Between Cards', 'testimonial3-block')}
                        value={cardGap}
                        onChange={(value) => setAttributes({ cardGap: value })}
                        min={4}
                        max={48}
                        step={2}
                    />

                    <BaseControl label={__('Cards per view', 'testimonial3-block')}>
                        <div style={{ marginBottom: 8 }}>
                            <strong>{__('Big Desktop (â‰¥ 1921px)', 'testimonial3-block')}</strong>
                            <RangeControl
                                value={slidesPerView?.bigDesktop ?? slidesPerView?.desktop ?? 5}
                                onChange={(value) =>
                                    setAttributes({
                                        slidesPerView: {
                                            ...slidesPerView,
                                            bigDesktop: value,
                                        },
                                    })
                                }
                                min={1}
                                max={12}
                            />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <strong>{__('Desktop (1301â€“1920px)', 'testimonial3-block')}</strong>
                            <RangeControl
                                value={slidesPerView?.desktop ?? 3}
                                onChange={(value) =>
                                    setAttributes({
                                        slidesPerView: {
                                            ...slidesPerView,
                                            desktop: value,
                                        },
                                    })
                                }
                                min={1}
                                max={12}
                            />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <strong>{__('Small Laptop (1025â€“1300px)', 'testimonial3-block')}</strong>
                            <RangeControl
                                value={slidesPerView?.smallLaptop ?? slidesPerView?.desktop ?? 3}
                                onChange={(value) =>
                                    setAttributes({
                                        slidesPerView: {
                                            ...slidesPerView,
                                            smallLaptop: value,
                                        },
                                    })
                                }
                                min={1}
                                max={12}
                            />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <strong>{__('Tablet (601â€“1024px)', 'testimonial3-block')}</strong>
                            <RangeControl
                                value={slidesPerView?.tablet ?? 2}
                                onChange={(value) =>
                                    setAttributes({
                                        slidesPerView: {
                                            ...slidesPerView,
                                            tablet: value,
                                        },
                                    })
                                }
                                min={1}
                                max={12}
                            />
                        </div>
                        <div>
                            <strong>{__('Mobile (â‰¤ 600px)', 'testimonial3-block')}</strong>
                            <RangeControl
                                value={slidesPerView?.mobile ?? 1}
                                onChange={(value) =>
                                    setAttributes({
                                        slidesPerView: {
                                            ...slidesPerView,
                                            mobile: value,
                                        },
                                    })
                                }
                                min={1}
                                max={12}
                            />
                        </div>
                    </BaseControl>

                    <ToggleControl
                        label={__('Enable Loop', 'testimonial3-block')}
                        checked={!!loop}
                        onChange={(value) => setAttributes({ loop: value })}
                        help={__('Enable infinite loop scrolling', 'testimonial3-block')}
                    />

                    <RangeControl
                        label={__('Mobile next card visibility (%)', 'testimonial3-block')}
                        value={mobilePeekPercent ?? 20}
                        onChange={(value) => setAttributes({ mobilePeekPercent: value })}
                        min={0}
                        max={50}
                        step={5}
                        help={__('How much of the next card should be visible on mobile.', 'testimonial3-block')}
                    />
                </PanelBody>

                <PanelBody title={__('Container', 'testimonial3-block')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Mode', 'testimonial3-block')}</p>
                    <ButtonGroup style={{ marginBottom: '16px' }}>
                        {[
                            { label: __('Full Width', 'testimonial3-block'), value: 'full' },
                            { label: __('Constrained', 'testimonial3-block'), value: 'constrained' },
                        ].map((opt) => (
                            <Button
                                key={opt.value}
                                isPrimary={containerMode === opt.value}
                                isSecondary={containerMode !== opt.value}
                                onClick={() => setAttributes({ containerMode: opt.value })}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </ButtonGroup>

                    {containerMode === 'constrained' && (
                        <>
                            <p style={{ marginTop: 8, marginBottom: 8, fontWeight: 600 }}>
                                {__('Max Width', 'testimonial3-block')}
                            </p>
                            <ButtonGroup style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                                <Button
                                    icon={mobile}
                                    isPrimary={deviceType === 'mobile'}
                                    onClick={() => setDeviceType('mobile')}
                                />
                                <Button
                                    icon={tablet}
                                    isPrimary={deviceType === 'tablet'}
                                    onClick={() => setDeviceType('tablet')}
                                />
                                <Button
                                    icon={smallLaptopIcon}
                                    isPrimary={deviceType === 'smallLaptop'}
                                    onClick={() => setDeviceType('smallLaptop')}
                                />
                                <Button
                                    icon={desktop}
                                    isPrimary={deviceType === 'desktop'}
                                    onClick={() => setDeviceType('desktop')}
                                />
                                <Button
                                    icon={bigDesktopIcon}
                                    isPrimary={deviceType === 'bigDesktop'}
                                    onClick={() => setDeviceType('bigDesktop')}
                                />
                            </ButtonGroup>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    {(() => {
                                        const currentValObj = containerMaxWidth?.[deviceType] || {};
                                        const unit = currentValObj.unit ?? (deviceType === 'mobile' || deviceType === 'tablet' ? '%' : 'px');
                                        const rawValue = currentValObj.value ?? (deviceType === 'mobile' || deviceType === 'tablet' ? 100 : 1200);
                                        const min = unit === 'px' ? 200 : 10;
                                        const max = unit === 'px' ? 10000 : 100;

                                        return (
                                            <RangeControl
                                                value={rawValue}
                                                onChange={(newValue) =>
                                                    setAttributes({
                                                        containerMaxWidth: {
                                                            ...(containerMaxWidth || {}),
                                                            [deviceType]: {
                                                                ...(containerMaxWidth?.[deviceType] || {}),
                                                                value: newValue,
                                                            },
                                                        },
                                                    })
                                                }
                                                min={min}
                                                max={max}
                                                step={unit === 'px' ? 10 : 1}
                                                withInputField={true}
                                            />
                                        );
                                    })()}
                                </div>
                                <ButtonGroup>
                                    {['px', '%', 'rem', 'vw'].map((u) => (
                                        <Button
                                            key={u}
                                            isSmall
                                            isPrimary={
                                                (containerMaxWidth?.[deviceType]?.unit ??
                                                    (deviceType === 'mobile' || deviceType === 'tablet' ? '%' : 'px')) === u
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

                    <RangeControl
                        label={__('Margin Top', 'testimonial3-block')}
                        value={marginTop?.[deviceType] ?? marginTop?.desktop ?? marginTop ?? 0}
                        onChange={(value) => setAttributes({
                            marginTop: {
                                ...marginTop,
                                [deviceType]: value
                            }
                        })}
                        min={0}
                        max={120}
                    />
                    <RangeControl
                        label={__('Margin Bottom', 'testimonial3-block')}
                        value={marginBottom?.[deviceType] ?? marginBottom?.desktop ?? marginBottom ?? 0}
                        onChange={(value) => setAttributes({
                            marginBottom: {
                                ...marginBottom,
                                [deviceType]: value
                            }
                        })}
                        min={0}
                        max={120}
                    />
                </PanelBody>

                <PanelBody title={__('Drag Cursor', 'testimonial3-block')} initialOpen={false}>
                    <TextControl
                        label={__('Cursor Text', 'testimonial3-block')}
                        value={dragCursorText}
                        onChange={(value) => setAttributes({ dragCursorText: value })}
                    />
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>
                        {__('Breakpoint', 'testimonial3-block')}
                    </p>
                    <ButtonGroup style={{ marginBottom: '12px', flexWrap: 'wrap' }}>
                        <Button
                            icon={mobile}
                            isPrimary={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                        />
                        <Button
                            icon={tablet}
                            isPrimary={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                        />
                        <Button
                            icon={smallLaptopIcon}
                            isPrimary={deviceType === 'smallLaptop'}
                            onClick={() => setDeviceType('smallLaptop')}
                        />
                        <Button
                            icon={desktop}
                            isPrimary={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                        />
                        <Button
                            icon={bigDesktopIcon}
                            isPrimary={deviceType === 'bigDesktop'}
                            onClick={() => setDeviceType('bigDesktop')}
                        />
                    </ButtonGroup>
                    <RangeControl
                        label={sprintf(__('Cursor Size (%s)', 'testimonial3-block'), deviceType)}
                        value={getResponsiveValue(dragCursorSize, 80)}
                        onChange={(value) => setResponsiveValue('dragCursorSize', value)}
                        min={40}
                        max={150}
                    />
                    <RangeControl
                        label={sprintf(__('Font Size (%s)', 'testimonial3-block'), deviceType)}
                        value={getResponsiveValue(dragCursorFontSize, 16)}
                        onChange={(value) => setResponsiveValue('dragCursorFontSize', value)}
                        min={10}
                        max={32}
                    />
                    <BaseControl label={sprintf(__('Font Weight (%s)', 'testimonial3-block'), deviceType)}>
                        <ButtonGroup>
                            {['400', '500', '600', '700'].map((w) => (
                                <Button
                                    key={w}
                                    isPrimary={getResponsiveValue(dragCursorFontWeight, '500') === w}
                                    onClick={() => setResponsiveValue('dragCursorFontWeight', w)}
                                >
                                    {w}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </BaseControl>
                    <SelectControl
                        label={sprintf(__('Text Transform (%s)', 'testimonial3-block'), deviceType)}
                        value={getResponsiveValue(dragCursorTextTransform, 'uppercase')}
                        options={[
                            { label: __('Uppercase', 'testimonial3-block'), value: 'uppercase' },
                            { label: __('Lowercase', 'testimonial3-block'), value: 'lowercase' },
                            { label: __('Capitalize', 'testimonial3-block'), value: 'capitalize' },
                            { label: __('None', 'testimonial3-block'), value: 'none' },
                        ]}
                        onChange={(value) => setResponsiveValue('dragCursorTextTransform', value)}
                    />
                </PanelBody>

                <PanelColorSettings
                    title={__('Drag Cursor Colors', 'testimonial3-block')}
                    colorSettings={[
                        {
                            label: __('Cursor Background', 'testimonial3-block'),
                            value: getResponsiveValue(dragCursorBgColor, '#7c3aed'),
                            onChange: (value) => setResponsiveValue('dragCursorBgColor', value),
                        },
                        {
                            label: __('Cursor Text', 'testimonial3-block'),
                            value: getResponsiveValue(dragCursorColor, '#ffffff'),
                            onChange: (value) => setResponsiveValue('dragCursorColor', value),
                        },
                    ]}
                />

                <PanelColorSettings
                    title={__('Colors', 'testimonial3-block')}
                    initialOpen={false}
                    colorSettings={[
                        {
                            value: backgroundColor,
                            onChange: (value) => setAttributes({ backgroundColor: value }),
                            label: __('Background Color', 'testimonial3-block'),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: cardBackgroundColor,
                            onChange: (value) => setAttributes({ cardBackgroundColor: value }),
                            label: __('Card Background', 'testimonial3-block'),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: quoteIconColor,
                            onChange: (value) => setAttributes({ quoteIconColor: value }),
                            label: __('Quote Icon Color', 'testimonial3-block'),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: quoteColor,
                            onChange: (value) => setAttributes({ quoteColor: value }),
                            label: __('Quote Text Color', 'testimonial3-block'),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: nameColor,
                            onChange: (value) => setAttributes({ nameColor: value }),
                            label: __('Name Color', 'testimonial3-block'),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value }),
                            label: __('Title Color', 'testimonial3-block'),
                            colors: DEFAULT_COLORS,
                        },
                    ]}
                />

                <PanelBody title={__('Typography', 'testimonial3-block')} initialOpen={false}>
                    <p><strong>{__('Quote Icon Size', 'testimonial3-block')}</strong></p>
                                <RangeControl
                        label={__('Icon Size', 'testimonial3-block')}
                        value={quoteIconSize}
                        onChange={(value) => setAttributes({ quoteIconSize: value })}
                        min={20}
                        max={100}
                    />
                    <p style={{ marginTop: '16px' }}><strong>{__('Profile Image Size', 'testimonial3-block')}</strong></p>
                                <RangeControl
                        label={__('Image Size', 'testimonial3-block')}
                        value={profileImageSize}
                        onChange={(value) => setAttributes({ profileImageSize: value })}
                        min={30}
                        max={120}
                    />
                </PanelBody>

                <PanelBody title={__('Spacing', 'testimonial3-block')} initialOpen={false}>
                    <ButtonGroup style={{ marginBottom: '12px' }}>
                        <Button
                            icon={desktop}
                            isPressed={deviceType === 'desktop'}
                            onClick={() => setDeviceType('desktop')}
                            label={__('Desktop', 'testimonial3-block')}
                        />
                        <Button
                            icon={tablet}
                            isPressed={deviceType === 'tablet'}
                            onClick={() => setDeviceType('tablet')}
                            label={__('Tablet', 'testimonial3-block')}
                        />
                        <Button
                            icon={mobile}
                            isPressed={deviceType === 'mobile'}
                            onClick={() => setDeviceType('mobile')}
                            label={__('Mobile', 'testimonial3-block')}
                        />
                    </ButtonGroup>
                    <BoxControl
                        label={__('Margin', 'testimonial3-block')}
                        values={{
                            top: marginTop?.[deviceType] ?? marginTop?.desktop ?? marginTop ?? 0,
                            right: marginRight?.[deviceType] ?? marginRight?.desktop ?? marginRight ?? 0,
                            bottom: marginBottom?.[deviceType] ?? marginBottom?.desktop ?? marginBottom ?? 0,
                            left: marginLeft?.[deviceType] ?? marginLeft?.desktop ?? marginLeft ?? 0,
                        }}
                        onChange={(value) => {
                            setAttributes({
                                marginTop: { ...marginTop, [deviceType]: value.top },
                                marginRight: { ...marginRight, [deviceType]: value.right },
                                marginBottom: { ...marginBottom, [deviceType]: value.bottom },
                                marginLeft: { ...marginLeft, [deviceType]: value.left },
                            });
                        }}
                    />
                </PanelBody>

                <PanelBody title={__('Pagination', 'testimonial3-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Pagination Dots', 'testimonial3-block')}
                        checked={showPagination}
                        onChange={(value) => setAttributes({ showPagination: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className={`adaire-testimonial3__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                    <div className="adaire-testimonial3__wrapper">
                        <div className="adaire-testimonial3__track">
                            {testimonials.map((testimonial, index) => (
                                <div key={testimonial.id} className="adaire-testimonial3__slide">
                                    <div className="adaire-testimonial3__card">
                                        <div className="adaire-testimonial3__quote-icon">
                                            <svg width={quoteIconSize} height={quoteIconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" fill={quoteIconColor}/>
                                            </svg>
                                        </div>
                                        <div className="adaire-testimonial3__quote">
                                            {testimonial.quote}
                                        </div>
                                        <div className="adaire-testimonial3__author">
                                            {testimonial.profileImage?.url && (
                                                <img
                                                    src={testimonial.profileImage.url}
                                                    alt={testimonial.profileImage.alt || testimonial.name}
                                                    className="adaire-testimonial3__profile-image"
                                                />
                                            )}
                                            <div className="adaire-testimonial3__author-info">
                                                <div className="adaire-testimonial3__name">{testimonial.name}</div>
                                                <div className="adaire-testimonial3__title">{testimonial.title}</div>
                                </div>
                                            </div>
                                            </div>
                                </div>
                            ))}
                            </div>
                                        </div>
                    {showPagination && (
                        <div className="adaire-testimonial3__pagination">
                            {testimonials.map((_, index) => (
                                <span key={index} className="adaire-testimonial3__pagination-dot"></span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Edit;



