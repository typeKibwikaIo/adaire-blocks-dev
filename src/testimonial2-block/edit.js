import { __, sprintf } from '@wordpress/i18n';
import {
    useBlockProps,
    RichText,
    InspectorControls,
    PanelColorSettings,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor';
import {
    PanelBody,
    ButtonGroup,
    Button,
    RangeControl,
    TextControl,
    BaseControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { plus, trash, arrowUp, arrowDown, desktop, tablet, mobile } from '@wordpress/icons';
import { useBlockLimits } from '../components/useBlockLimits';
import UpgradeNotice from '../components/UpgradeNotice';
import './editor.scss';

const DEFAULT_COLORS = [
    { name: __('Adaire Red', 'adaire-blocks'), slug: 'adaire-red', color: '#ff4545' },
    { name: __('White', 'adaire-blocks'), slug: 'white', color: '#ffffff' },
    { name: __('Black', 'adaire-blocks'), slug: 'black', color: '#000000' },
    { name: __('Gray', 'adaire-blocks'), slug: 'gray', color: '#666666' },
];

const CONTAINER_MODES = [
    { label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
    { label: __('Full Width', 'adaire-blocks'), value: 'full' },
];

const DEVICE_TYPES = [
    { key: 'desktop', label: __('Desktop', 'adaire-blocks') },
    { key: 'tablet', label: __('Tablet', 'adaire-blocks') },
    { key: 'mobile', label: __('Mobile', 'adaire-blocks') },
];

const UNIT_OPTIONS = ['px', '%', 'rem', 'vw'];

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

const Testimonial2Edit = ({ attributes, setAttributes, clientId }) => {
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        testimonials,
        quoteImage,
        backgroundColor,
        cardBackgroundColor,
        navButtonBackground,
        navButtonHoverBackground,
        navButtonSize,
        navArrowSize,
        quoteImageWidth,
        quoteImageOpacity,
        logoWidth,
        personImageSize,
        personImageBorderRadius,
        descriptionFontSize,
        descriptionFontWeight,
        descriptionColor,
        nameFontSize,
        nameFontWeight,
        nameColor,
        titleFontSize,
        titleFontWeight,
        titleColor,
        carouselSpeed,
        spaceBetween,
    } = attributes;

    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [deviceType, setDeviceType] = useState('desktop');

    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: clientId });
        }
    }, [blockId, clientId, setAttributes]);

    // Check block limits
    const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
        'testimonial2-block',
        testimonials || [],
        'testimonial'
    );

    const addTestimonial = () => {
        if (isLimitReached) return;

        const newTestimonial = {
            id: `testimonial-${Date.now()}`,
            description: __('Add testimonial description here...', 'adaire-blocks'),
            name: __('Name', 'adaire-blocks'),
            title: __('Title', 'adaire-blocks'),
            personImage: { id: 0, url: '', alt: '' },
            logoImage: { id: 0, url: '', alt: '' },
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
            newTestimonials[index],
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

    const updateResponsiveSize = (attrName, device, property, value) => {
        const current = attributes[attrName] || {};
        const next = {
            ...current,
            [device]: {
                ...current[device],
                [property]: value,
            },
        };
        setAttributes({ [attrName]: next });
    };

    const blockProps = useBlockProps({
        id: blockId || undefined,
        className: 'ad-testimonial-block',
        style: {
            '--testimonial-bg-color': backgroundColor,
            '--card-bg-color': cardBackgroundColor,
            '--nav-btn-bg': navButtonBackground,
            '--nav-btn-hover-bg': navButtonHoverBackground,
            '--nav-btn-size': `${navButtonSize}px`,
            '--nav-arrow-size': `${navArrowSize}px`,
            '--quote-img-width': `${quoteImageWidth}px`,
            '--quote-img-opacity': quoteImageOpacity,
            '--logo-width': `${logoWidth}px`,
            '--person-img-size': formatDimensionValue(personImageSize?.desktop, 300, 'px'),
            '--person-img-size-tablet': formatDimensionValue(personImageSize?.tablet, 200, 'px'),
            '--person-img-size-mobile': formatDimensionValue(personImageSize?.mobile, 150, 'px'),
            '--person-img-radius': `${personImageBorderRadius}%`,
            '--description-font-size': formatDimensionValue(descriptionFontSize?.desktop, 18, 'px'),
            '--description-font-size-tablet': formatDimensionValue(descriptionFontSize?.tablet, 16, 'px'),
            '--description-font-size-mobile': formatDimensionValue(descriptionFontSize?.mobile, 14, 'px'),
            '--description-font-weight': descriptionFontWeight,
            '--description-color': descriptionColor,
            '--name-font-size': formatDimensionValue(nameFontSize?.desktop, 22, 'px'),
            '--name-font-size-tablet': formatDimensionValue(nameFontSize?.tablet, 20, 'px'),
            '--name-font-size-mobile': formatDimensionValue(nameFontSize?.mobile, 18, 'px'),
            '--name-font-weight': nameFontWeight,
            '--name-color': nameColor,
            '--title-font-size': formatDimensionValue(titleFontSize?.desktop, 16, 'px'),
            '--title-font-size-tablet': formatDimensionValue(titleFontSize?.tablet, 14, 'px'),
            '--title-font-size-mobile': formatDimensionValue(titleFontSize?.mobile, 12, 'px'),
            '--title-font-weight': titleFontWeight,
            '--title-color': titleColor,
            '--container-max-width': containerMode === 'constrained' ? formatDimensionValue(containerMaxWidth?.desktop, 1200, 'px') : '100%',
            '--container-max-width-tablet': containerMode === 'constrained' ? formatDimensionValue(containerMaxWidth?.tablet, 100, '%') : '100%',
            '--container-max-width-mobile': containerMode === 'constrained' ? formatDimensionValue(containerMaxWidth?.mobile, 100, '%') : '100%',
        },
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Container Settings', 'adaire-blocks')} initialOpen={true}>
                    <BaseControl label={__('Container Mode', 'adaire-blocks')}>
                        <ButtonGroup>
                            {CONTAINER_MODES.map((mode) => (
                                <Button
                                    key={mode.value}
                                    isPrimary={containerMode === mode.value}
                                    onClick={() => setAttributes({ containerMode: mode.value })}
                                >
                                    {mode.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </BaseControl>

                    {containerMode === 'constrained' && (
                        <>
                            <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>
                                {__('Card Width', 'adaire-blocks')}
                            </p>
                            <ButtonGroup style={{ marginBottom: '12px' }}>
                                <Button
                                    icon={desktop}
                                    isPrimary={deviceType === 'desktop'}
                                    onClick={() => setDeviceType('desktop')}
                                    label={__('Desktop', 'adaire-blocks')}
                                />
                                <Button
                                    icon={tablet}
                                    isPrimary={deviceType === 'tablet'}
                                    onClick={() => setDeviceType('tablet')}
                                    label={__('Tablet', 'adaire-blocks')}
                                />
                                <Button
                                    icon={mobile}
                                    isPrimary={deviceType === 'mobile'}
                                    onClick={() => setDeviceType('mobile')}
                                    label={__('Mobile', 'adaire-blocks')}
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
                                    {UNIT_OPTIONS.map((u) => (
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
                                        >{u}</Button>
                                    ))}
                                </ButtonGroup>
                            </div>
                        </>
                    )}
                </PanelBody>

                <PanelBody title={__('Testimonials', 'adaire-blocks')} initialOpen={false}>
                    {testimonials.map((testimonial, index) => (
                        <div key={testimonial.id || index} style={{ marginBottom: '16px', padding: '12px', border: index === activeTestimonial ? '2px solid #007cba' : '1px solid #ddd', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong>{sprintf(__('Testimonial %d', 'adaire-blocks'), index + 1)}</strong>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <Button
                                        icon={arrowUp}
                                        onClick={() => moveTestimonial(index, -1)}
                                        disabled={index === 0}
                                        label={__('Move up', 'adaire-blocks')}
                                        isSmall
                                    />
                                    <Button
                                        icon={arrowDown}
                                        onClick={() => moveTestimonial(index, 1)}
                                        disabled={index === testimonials.length - 1}
                                        label={__('Move down', 'adaire-blocks')}
                                        isSmall
                                    />
                                    <Button
                                        icon={trash}
                                        onClick={() => removeTestimonial(index)}
                                        disabled={testimonials.length === 1}
                                        label={__('Remove', 'adaire-blocks')}
                                        isDestructive
                                        isSmall
                                    />
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setActiveTestimonial(index)}
                                style={{ width: '100%', marginBottom: '8px' }}
                            >
                                {index === activeTestimonial ? __('Currently Editing', 'adaire-blocks') : __('Edit This Testimonial', 'adaire-blocks')}
                            </Button>

                            <div style={{ marginTop: '12px' }}>
                                <BaseControl label={__('Person Image', 'adaire-blocks')}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            onSelect={(media) => updateTestimonial(index, 'personImage', { id: media.id, url: media.url, alt: media.alt || '' })}
                                            allowedTypes={['image']}
                                            value={testimonial.personImage?.id}
                                            render={({ open }) => (
                                                <div>
                                                    <Button variant="primary" onClick={open} style={{ marginBottom: '8px' }}>
                                                        {testimonial.personImage?.url ? __('Change Image', 'adaire-blocks') : __('Select Image', 'adaire-blocks')}
                                                    </Button>
                                                    {testimonial.personImage?.url && (
                                                        <>
                                                            <img src={testimonial.personImage.url} alt="" style={{ display: 'block', maxWidth: '100px', marginBottom: '8px', borderRadius: '50%' }} />
                                                            <Button
                                                                variant="secondary"
                                                                isDestructive
                                                                onClick={() => updateTestimonial(index, 'personImage', { id: 0, url: '', alt: '' })}
                                                            >
                                                                {__('Remove Image', 'adaire-blocks')}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>

                                <BaseControl label={__('Company Logo', 'adaire-blocks')} style={{ marginTop: '12px' }}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            onSelect={(media) => updateTestimonial(index, 'logoImage', { id: media.id, url: media.url, alt: media.alt || '' })}
                                            allowedTypes={['image']}
                                            value={testimonial.logoImage?.id}
                                            render={({ open }) => (
                                                <div>
                                                    <Button variant="primary" onClick={open} style={{ marginBottom: '8px' }}>
                                                        {testimonial.logoImage?.url ? __('Change Logo', 'adaire-blocks') : __('Select Logo', 'adaire-blocks')}
                                                    </Button>
                                                    {testimonial.logoImage?.url && (
                                                        <>
                                                            <img src={testimonial.logoImage.url} alt="" style={{ display: 'block', maxWidth: '100px', marginBottom: '8px' }} />
                                                            <Button
                                                                variant="secondary"
                                                                isDestructive
                                                                onClick={() => updateTestimonial(index, 'logoImage', { id: 0, url: '', alt: '' })}
                                                            >
                                                                {__('Remove Logo', 'adaire-blocks')}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </MediaUploadCheck>
                                </BaseControl>
                            </div>
                        </div>
                    ))}
                    {showUpgradeNotice ? (
                        <UpgradeNotice message={upgradeMessage} />
                    ) : (
                        <Button
                            variant="primary"
                            onClick={addTestimonial}
                            icon={plus}
                            style={{ width: '100%' }}
                            disabled={isLimitReached}
                        >
                            {__('Add Testimonial', 'adaire-blocks')}
                        </Button>
                    )}
                </PanelBody>

                <PanelBody title={__('Quote Image', 'adaire-blocks')} initialOpen={false}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={(media) => setAttributes({ quoteImage: { id: media.id, url: media.url, alt: media.alt || 'Quote' } })}
                            allowedTypes={['image']}
                            value={quoteImage?.id}
                            render={({ open }) => (
                                <div>
                                    <Button variant="primary" onClick={open} style={{ marginBottom: '8px' }}>
                                        {quoteImage?.url ? __('Change Quote Image', 'adaire-blocks') : __('Select Quote Image', 'adaire-blocks')}
                                    </Button>
                                    {quoteImage?.url && (
                                        <>
                                            <img src={quoteImage.url} alt="" style={{ display: 'block', maxWidth: '100px', marginBottom: '8px' }} />
                                            <Button
                                                variant="secondary"
                                                isDestructive
                                                onClick={() => setAttributes({ quoteImage: { id: 0, url: '', alt: 'Quote' } })}
                                            >
                                                {__('Remove Quote Image', 'adaire-blocks')}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                    <RangeControl
                        label={__('Quote Image Width', 'adaire-blocks')}
                        value={quoteImageWidth}
                        onChange={(value) => setAttributes({ quoteImageWidth: value })}
                        min={20}
                        max={200}
                    />
                    <RangeControl
                        label={__('Quote Image Opacity', 'adaire-blocks')}
                        value={quoteImageOpacity}
                        onChange={(value) => setAttributes({ quoteImageOpacity: value })}
                        min={0}
                        max={1}
                        step={0.1}
                    />
                </PanelBody>

                <PanelColorSettings
                    title={__('Colors', 'adaire-blocks')}
                    initialOpen={false}
                    colorSettings={[
                        {
                            label: __('Background Color', 'adaire-blocks'),
                            value: backgroundColor,
                            onChange: (value) => setAttributes({ backgroundColor: value }),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            label: __('Card Background', 'adaire-blocks'),
                            value: cardBackgroundColor,
                            onChange: (value) => setAttributes({ cardBackgroundColor: value }),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            label: __('Nav Button Background', 'adaire-blocks'),
                            value: navButtonBackground,
                            onChange: (value) => setAttributes({ navButtonBackground: value }),
                        },
                        {
                            label: __('Nav Button Hover Background', 'adaire-blocks'),
                            value: navButtonHoverBackground,
                            onChange: (value) => setAttributes({ navButtonHoverBackground: value }),
                        },
                        {
                            label: __('Description Color', 'adaire-blocks'),
                            value: descriptionColor,
                            onChange: (value) => setAttributes({ descriptionColor: value }),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            label: __('Name Color', 'adaire-blocks'),
                            value: nameColor,
                            onChange: (value) => setAttributes({ nameColor: value }),
                            colors: DEFAULT_COLORS,
                        },
                        {
                            label: __('Title Color', 'adaire-blocks'),
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value }),
                            colors: DEFAULT_COLORS,
                        },
                    ]}
                />

                <PanelBody title={__('Navigation', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Nav Button Size', 'adaire-blocks')}
                        value={navButtonSize}
                        onChange={(value) => setAttributes({ navButtonSize: value })}
                        min={30}
                        max={80}
                    />
                    <RangeControl
                        label={__('Nav Arrow Size', 'adaire-blocks')}
                        value={navArrowSize}
                        onChange={(value) => setAttributes({ navArrowSize: value })}
                        min={10}
                        max={40}
                    />
                </PanelBody>

                <PanelBody title={__('Person Image Size', 'adaire-blocks')} initialOpen={false}>
                    {DEVICE_TYPES.map((device) => (
                        <div key={device.key} style={{ marginBottom: '16px' }}>
                            <strong>{device.label}</strong>
                            <div style={{ marginTop: '8px' }}>
                                <RangeControl
                                    label={__('Size', 'adaire-blocks')}
                                    value={personImageSize?.[device.key]?.value ?? (device.key === 'desktop' ? 300 : device.key === 'tablet' ? 200 : 150)}
                                    onChange={(value) => updateResponsiveSize('personImageSize', device.key, 'value', value)}
                                    min={50}
                                    max={500}
                                />
                                <ButtonGroup>
                                    {['px', 'rem', 'vw'].map((unit) => (
                                        <Button
                                            key={unit}
                                            isSmall
                                            isPrimary={personImageSize?.[device.key]?.unit === unit}
                                            onClick={() => updateResponsiveSize('personImageSize', device.key, 'unit', unit)}
                                        >
                                            {unit}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </div>
                        </div>
                    ))}
                    <RangeControl
                        label={__('Border Radius (%)', 'adaire-blocks')}
                        value={personImageBorderRadius}
                        onChange={(value) => setAttributes({ personImageBorderRadius: value })}
                        min={0}
                        max={50}
                    />
                </PanelBody>

                <PanelBody title={__('Typography', 'adaire-blocks')} initialOpen={false}>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>{__('Description', 'adaire-blocks')}</strong>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginTop: '12px' }}>
                                <em>{device.label}</em>
                                <div style={{ marginTop: '4px' }}>
                                    <RangeControl
                                        label={__('Font Size', 'adaire-blocks')}
                                        value={descriptionFontSize?.[device.key]?.value ?? (device.key === 'desktop' ? 18 : device.key === 'tablet' ? 16 : 14)}
                                        onChange={(value) => updateResponsiveSize('descriptionFontSize', device.key, 'value', value)}
                                        min={10}
                                        max={48}
                                    />
                                    <ButtonGroup>
                                        {['px', 'rem', 'em'].map((unit) => (
                                            <Button
                                                key={unit}
                                                isSmall
                                                isPrimary={descriptionFontSize?.[device.key]?.unit === unit}
                                                onClick={() => updateResponsiveSize('descriptionFontSize', device.key, 'unit', unit)}
                                            >
                                                {unit}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                        <TextControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={descriptionFontWeight}
                            onChange={(value) => setAttributes({ descriptionFontWeight: value })}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>{__('Name', 'adaire-blocks')}</strong>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginTop: '12px' }}>
                                <em>{device.label}</em>
                                <div style={{ marginTop: '4px' }}>
                                    <RangeControl
                                        label={__('Font Size', 'adaire-blocks')}
                                        value={nameFontSize?.[device.key]?.value ?? (device.key === 'desktop' ? 22 : device.key === 'tablet' ? 20 : 18)}
                                        onChange={(value) => updateResponsiveSize('nameFontSize', device.key, 'value', value)}
                                        min={10}
                                        max={48}
                                    />
                                    <ButtonGroup>
                                        {['px', 'rem', 'em'].map((unit) => (
                                            <Button
                                                key={unit}
                                                isSmall
                                                isPrimary={nameFontSize?.[device.key]?.unit === unit}
                                                onClick={() => updateResponsiveSize('nameFontSize', device.key, 'unit', unit)}
                                            >
                                                {unit}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                        <TextControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={nameFontWeight}
                            onChange={(value) => setAttributes({ nameFontWeight: value })}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>{__('Title', 'adaire-blocks')}</strong>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginTop: '12px' }}>
                                <em>{device.label}</em>
                                <div style={{ marginTop: '4px' }}>
                                    <RangeControl
                                        label={__('Font Size', 'adaire-blocks')}
                                        value={titleFontSize?.[device.key]?.value ?? (device.key === 'desktop' ? 16 : device.key === 'tablet' ? 14 : 12)}
                                        onChange={(value) => updateResponsiveSize('titleFontSize', device.key, 'value', value)}
                                        min={10}
                                        max={32}
                                    />
                                    <ButtonGroup>
                                        {['px', 'rem', 'em'].map((unit) => (
                                            <Button
                                                key={unit}
                                                isSmall
                                                isPrimary={titleFontSize?.[device.key]?.unit === unit}
                                                onClick={() => updateResponsiveSize('titleFontSize', device.key, 'unit', unit)}
                                            >
                                                {unit}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </div>
                            </div>
                        ))}
                        <TextControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={titleFontWeight}
                            onChange={(value) => setAttributes({ titleFontWeight: value })}
                        />
                    </div>

                    <RangeControl
                        label={__('Logo Width', 'adaire-blocks')}
                        value={logoWidth}
                        onChange={(value) => setAttributes({ logoWidth: value })}
                        min={50}
                        max={300}
                    />
                </PanelBody>

                <PanelBody title={__('Carousel Settings', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Speed (ms)', 'adaire-blocks')}
                        value={carouselSpeed}
                        onChange={(value) => setAttributes({ carouselSpeed: value })}
                        min={300}
                        max={2000}
                        step={100}
                    />
                    <RangeControl
                        label={__('Space Between Slides', 'adaire-blocks')}
                        value={spaceBetween}
                        onChange={(value) => setAttributes({ spaceBetween: value })}
                        min={0}
                        max={100}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className={`ad-testimonial-block__wrapper ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                    <div className="ad-testimonial-block__editor-preview">
                        {testimonials[activeTestimonial] && (
                            <div className="ad-testimonial-block__card">
                                <div className="ad-testimonial-block__first">
                                    <div
                                        className="ad-testimonial-block__first__picture"
                                        style={{
                                            backgroundImage: testimonials[activeTestimonial].personImage?.url
                                                ? `url(${testimonials[activeTestimonial].personImage.url})`
                                                : 'none',
                                            backgroundColor: testimonials[activeTestimonial].personImage?.url ? 'transparent' : '#f0f0f0',
                                        }}
                                    >
                                        {!testimonials[activeTestimonial].personImage?.url && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                                                {__('No Image', 'adaire-blocks')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="ad-testimonial-block__second">
                                    <div className="ad-testimonial-block__second__top">
                                        <div className="ad-testimonial-block__second__top__quote">
                                            {quoteImage?.url ? (
                                                <img
                                                    src={quoteImage.url}
                                                    alt={quoteImage.alt}
                                                    className="ad-testimonial-block__second__top__quote__img"
                                                />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>
                                                    {__('Quote', 'adaire-blocks')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ad-testimonial-block__second__top__logo">
                                            {testimonials[activeTestimonial].logoImage?.url ? (
                                                <img src={testimonials[activeTestimonial].logoImage.url} alt="" />
                                            ) : (
                                                <div style={{ width: '150px', height: '50px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>
                                                    {__('No Logo', 'adaire-blocks')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ad-testimonial-block__second__bottom">
                                        <RichText
                                            tagName="p"
                                            className="ad-testimonial-block__second__bottom__description"
                                            value={testimonials[activeTestimonial].description}
                                            onChange={(value) => updateTestimonial(activeTestimonial, 'description', value)}
                                            placeholder={__('Add testimonial description...', 'adaire-blocks')}
                                            allowedFormats={['core/bold', 'core/italic']}
                                        />
                                        <RichText
                                            tagName="h4"
                                            className="ad-testimonial-block__second__bottom__name"
                                            value={testimonials[activeTestimonial].name}
                                            onChange={(value) => updateTestimonial(activeTestimonial, 'name', value)}
                                            placeholder={__('Name', 'adaire-blocks')}
                                            allowedFormats={[]}
                                        />
                                        <RichText
                                            tagName="p"
                                            className="ad-testimonial-block__second__bottom__title"
                                            value={testimonials[activeTestimonial].title}
                                            onChange={(value) => updateTestimonial(activeTestimonial, 'title', value)}
                                            placeholder={__('Title', 'adaire-blocks')}
                                            allowedFormats={[]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="ad-testimonial-block__nav-indicator">
                            {sprintf(__('Editing Testimonial %d of %d', 'adaire-blocks'), activeTestimonial + 1, testimonials.length)}
                        </div>
                        <div className="ad-testimonial-block__nav-controls">
                            <Button
                                variant="secondary"
                                onClick={() => setActiveTestimonial(Math.max(0, activeTestimonial - 1))}
                                disabled={activeTestimonial === 0}
                            >
                                â† {__('Previous', 'adaire-blocks')}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setActiveTestimonial(Math.min(testimonials.length - 1, activeTestimonial + 1))}
                                disabled={activeTestimonial === testimonials.length - 1}
                            >
                                {__('Next', 'adaire-blocks')} â†’
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Testimonial2Edit;




