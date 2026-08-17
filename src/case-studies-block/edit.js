import { __, sprintf } from '@wordpress/i18n';
import {
    useBlockProps,
    PanelColorSettings,
    MediaUpload,
    MediaUploadCheck
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    BaseControl,
    Button,
    ButtonGroup,
    RangeControl,
    SelectControl,
    ToggleControl
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import InspectorTabs from '../components/InspectorTabs';
import QuickZone from '../components/QuickZone';
import BoundColorPalette from '../components/BoundColorPalette';

import './editor.scss';

const CONTAINER_MODES = [
    { label: __('Full Width', 'adaire-blocks'), value: 'full' },
    { label: __('Constrained', 'adaire-blocks'), value: 'constrained' }
];

const DEVICE_TYPES = [
    { key: 'bigDesktop', label: __('Big Desktop', 'adaire-blocks') },
    { key: 'desktop', label: __('Desktop', 'adaire-blocks') },
    { key: 'smallLaptop', label: __('Small Laptop', 'adaire-blocks') },
    { key: 'tablet', label: __('Tablet', 'adaire-blocks') },
    { key: 'mobile', label: __('Mobile', 'adaire-blocks') }
];

const UNIT_OPTIONS = ['px', '%', 'rem', 'vw'];

// Unique per-study placeholder (no Hero Image set) — same deterministic
// color + initials logic as the PHP renderer (adaire_case_studies_placeholder_color
// / _initials) and view.js's popup, so the editor canvas preview matches
// what visitors will actually see on the frontend.
let editorCrc32Table = null;
function editorCrc32(str) {
    if (!editorCrc32Table) {
        editorCrc32Table = new Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            editorCrc32Table[n] = c;
        }
    }
    let crc = 0 ^ -1;
    const bytes = unescape(encodeURIComponent(str || ''));
    for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ editorCrc32Table[(crc ^ bytes.charCodeAt(i)) & 0xff];
    }
    return (crc ^ -1) >>> 0;
}

function editorPlaceholderColor(seed) {
    const hue = editorCrc32(String(seed == null ? '' : seed)) % 360;
    return `hsl(${hue}, 45%, 28%)`;
}

function editorPlaceholderInitials(title) {
    const words = String(title || '').trim().split(/\s+/).filter(Boolean);
    let initials = '';
    for (const word of words.slice(0, 2)) {
        initials += word.charAt(0).toUpperCase();
    }
    return initials || '•';
}

const formatDimensionValue = (dimension, fallbackValue, fallbackUnit) => {
    const value = dimension?.value ?? fallbackValue;
    const unit = dimension?.unit ?? fallbackUnit;
    return `${value}${unit}`;
};

// The block editor only ever runs inside /wp-admin/, so deriving the admin
// root from the current URL is reliable without needing a dedicated
// adminUrl() global.
const getCaseStudiesAdminUrl = () => {
    const [base] = window.location.href.split('/wp-admin/');
    return `${base}/wp-admin/edit.php?post_type=adaire_case_study`;
};

const stripTags = (html) => (html || '').replace(/<[^>]*>/g, '').trim();

// Maps a `/wp/v2/adaire-case-studies?_embed` REST post object (see
// includes/class-adaire-case-studies-cpt.php) into the same "study" shape
// render.php builds server-side, so the editor preview grid below can reuse
// the exact same card markup regardless of where the data came from.
const mapPostToStudy = (post) => {
    const embedded = post._embedded || {};
    const media = embedded['wp:featuredmedia']?.[0];
    const author = embedded['author']?.[0];
    const terms = (embedded['wp:term'] || []).flat();
    const industryTerms = terms.filter((t) => t.taxonomy === 'adaire_case_industry');
    const capabilityTerms = terms.filter((t) => t.taxonomy === 'adaire_case_capability');
    const meta = post.meta || {};

    return {
        id: post.id,
        title: stripTags(post.title?.rendered),
        description: stripTags(post.excerpt?.rendered),
        backgroundImage: media?.source_url || '',
        permalink: post.link || '',
        linkUrl: meta._adaire_case_link_url || '',
        openInNewTab: !!meta._adaire_case_open_in_new_tab,
        industries: industryTerms.map((t) => t.name),
        capabilities: capabilityTerms.map((t) => t.name),
        client: meta._adaire_case_client || '',
        country: meta._adaire_case_country || '',
        language: meta._adaire_case_language || '',
        technology: meta._adaire_case_technology || '',
        summary: meta._adaire_case_summary || '',
        likes: parseInt(meta._adaire_case_likes, 10) || 0,
        authorId: post.author || 0,
        authorName: author?.name || '',
        authorAvatar: author?.avatar_urls?.['48'] || author?.avatar_urls?.['24'] || '',
        authorProfileUrl: author?.link || '',
        galleryItems: []
    };
};

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        containerMode,
        containerMaxWidth,
        columns,
        columnsBigDesktop,
        columnsSmallLaptop,
        columnsMobile,
        columnsTablet,
        gap,
        initialCount,
        loadMoreCount,
        showFilters,
        showLoadMore,
        loadMoreText,
        cardHeight,
        cardBorderRadius,
        cardBackgroundColor,
        cardShadow,
        cardHoverShadow,
        overlayColor,
        overlayHoverColor,
        titleColor,
        titleFontSize,
        titleFontWeight,
        titleLineHeight,
        titleLetterSpacing,
        descriptionColor,
        descriptionFontSize,
        descriptionFontWeight,
        descriptionLineHeight,
        descriptionLetterSpacing,
        descriptionMaxLines,
        filterLabelColor,
        filterLabelFontSize,
        filterBorderColor,
        filterBackgroundColor,
        filterBorderRadius,
        loadMoreButtonColor,
        loadMoreButtonBgColor,
        loadMoreButtonHoverColor,
        loadMoreFontSize,
        loadMoreFontWeight,
        animationDuration,
        animationEase,
        hoverScale,
        hoverTransitionDuration,
        contentPadding,
        industryFilterLabel,
        capabilityFilterLabel,
        enableCarousel,
        carouselCardWidth,
        dragCursorText,
        dragCursorFontSize,
        dragCursorFontWeight,
        dragCursorColor,
        dragCursorSize,
        dragCursorTextTransform,
        dragCursorBgColor,
        nextLabel,
        popupImageId,
        popupImageUrl,
        popupImageAlt,
        showHeader,
        headerEyebrow,
        headerHeading,
        headerDescription,
        showSearch,
        searchPlaceholder,
        showCategoryPills,
        showSort,
        showSubmitButton,
        submitButtonText,
        submitButtonUrl
    } = attributes;

    const [activeZone, setActiveZone] = useState(null);
    const [managedCount, setManagedCount] = useState(null);
    const [previewStudies, setPreviewStudies] = useState([]);

    // Case studies now live exclusively in Case Studies Management (the
    // adaire_case_study CPT registered in
    // includes/class-adaire-case-studies-cpt.php) — there is no manual
    // per-block list anymore. This fetches published case studies straight
    // from the REST API so the editor canvas shows a real (if momentarily
    // stale) preview; the frontend always gets fresh data server-side from
    // render.php on every page load.
    useEffect(() => {
        let cancelled = false;
        apiFetch({ path: '/wp/v2/adaire-case-studies?_embed&per_page=100&orderby=date&order=desc', parse: false })
            .then((response) => {
                const total = response.headers.get('X-WP-Total');
                if (!cancelled) {
                    setManagedCount(total !== null ? parseInt(total, 10) : null);
                }
                return response.json();
            })
            .then((posts) => {
                if (!cancelled && Array.isArray(posts)) {
                    setPreviewStudies(posts.map(mapPostToStudy));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setManagedCount(null);
                    setPreviewStudies([]);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Generate block ID on mount
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `case-studies-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    // Unique industries / capabilities across the fetched preview, for the
    // (disabled, display-only) filter dropdowns in the canvas preview.
    const industries = [...new Set(
        previewStudies.flatMap((study) => study.industries || []).filter((industry) => industry && industry.trim() !== '')
    )].sort();

    const capabilities = [...new Set(
        previewStudies.flatMap((study) => study.capabilities || []).filter((cap) => cap && cap.trim() !== '')
    )].sort();

    // Update container max width dimension
    const updateContainerDimension = (device, property, value) => {
        const next = {
            ...containerMaxWidth,
            [device]: {
                ...containerMaxWidth?.[device],
                [property]: value
            }
        };
        setAttributes({ containerMaxWidth: next });
    };

    // Update responsive dimension (for card height, font sizes, etc.)
    const updateResponsiveDimension = (attrName, device, property, value) => {
        const current = attributes[attrName] || {};
        const next = {
            ...current,
            [device]: {
                ...current[device],
                [property]: value
            }
        };
        setAttributes({ [attrName]: next });
    };

    const blockProps = useBlockProps({
        className: `ad-case-studies-block${enableCarousel ? ' is-carousel-mode' : ''}`,
        style: {
            '--cs-columns': columns,
            '--cs-columns-big-desktop': columnsBigDesktop ?? columns,
            '--cs-columns-small-laptop': columnsSmallLaptop ?? columns,
            '--cs-columns-tablet': columnsTablet,
            '--cs-columns-mobile': columnsMobile,
            '--cs-gap': `${gap}px`,
            '--cs-card-height-big-desktop': formatDimensionValue(cardHeight?.bigDesktop, 340, 'px'),
            '--cs-card-height': formatDimensionValue(cardHeight?.desktop, 320, 'px'),
            '--cs-card-height-small-laptop': formatDimensionValue(cardHeight?.smallLaptop, 300, 'px'),
            '--cs-card-height-tablet': formatDimensionValue(cardHeight?.tablet, 280, 'px'),
            '--cs-card-height-mobile': formatDimensionValue(cardHeight?.mobile, 240, 'px'),
            '--cs-card-border-radius': `${cardBorderRadius}px`,
            '--cs-card-bg-color': cardBackgroundColor,
            '--cs-card-shadow': cardShadow,
            '--cs-card-hover-shadow': cardHoverShadow,
            '--cs-overlay-color': overlayColor,
            '--cs-overlay-hover-color': overlayHoverColor,
            '--cs-title-color': titleColor,
            '--cs-title-font-size-big-desktop': formatDimensionValue(titleFontSize?.bigDesktop, 22, 'px'),
            '--cs-title-font-size': formatDimensionValue(titleFontSize?.desktop, 20, 'px'),
            '--cs-title-font-size-small-laptop': formatDimensionValue(titleFontSize?.smallLaptop, 19, 'px'),
            '--cs-title-font-size-tablet': formatDimensionValue(titleFontSize?.tablet, 18, 'px'),
            '--cs-title-font-size-mobile': formatDimensionValue(titleFontSize?.mobile, 16, 'px'),
            '--cs-title-font-weight': titleFontWeight,
            '--cs-title-line-height': titleLineHeight,
            '--cs-title-letter-spacing': `${titleLetterSpacing}px`,
            '--cs-description-color': descriptionColor,
            '--cs-description-font-size-big-desktop': formatDimensionValue(descriptionFontSize?.bigDesktop, 14, 'px'),
            '--cs-description-font-size': formatDimensionValue(descriptionFontSize?.desktop, 14, 'px'),
            '--cs-description-font-size-small-laptop': formatDimensionValue(descriptionFontSize?.smallLaptop, 13, 'px'),
            '--cs-description-font-size-tablet': formatDimensionValue(descriptionFontSize?.tablet, 13, 'px'),
            '--cs-description-font-size-mobile': formatDimensionValue(descriptionFontSize?.mobile, 12, 'px'),
            '--cs-description-font-weight': descriptionFontWeight,
            '--cs-description-line-height': descriptionLineHeight,
            '--cs-description-letter-spacing': `${descriptionLetterSpacing}px`,
            '--cs-description-max-lines': descriptionMaxLines,
            '--cs-filter-label-color': filterLabelColor,
            '--cs-filter-label-font-size': `${filterLabelFontSize}px`,
            '--cs-filter-border-color': filterBorderColor,
            '--cs-filter-bg-color': filterBackgroundColor,
            '--cs-filter-border-radius': `${filterBorderRadius}px`,
            '--cs-load-more-color': loadMoreButtonColor,
            '--cs-load-more-bg-color': loadMoreButtonBgColor,
            '--cs-load-more-hover-color': loadMoreButtonHoverColor,
            '--cs-load-more-font-size': `${loadMoreFontSize}px`,
            '--cs-load-more-font-weight': loadMoreFontWeight,
            '--cs-hover-scale': hoverScale,
            '--cs-hover-transition': `${hoverTransitionDuration}s`,
            '--cs-content-padding': `${contentPadding}px`,
            '--container-max-width-big-desktop': formatDimensionValue(containerMaxWidth?.bigDesktop, 1400, 'px'),
            '--container-max-width': formatDimensionValue(containerMaxWidth?.desktop, 1200, 'px'),
            '--container-max-width-small-laptop': formatDimensionValue(containerMaxWidth?.smallLaptop, 1200, 'px'),
            '--container-max-width-tablet': formatDimensionValue(containerMaxWidth?.tablet, 100, '%'),
            '--container-max-width-mobile': formatDimensionValue(containerMaxWidth?.mobile, 100, '%'),
            '--cs-carousel-card-width-big-desktop': formatDimensionValue(carouselCardWidth?.bigDesktop, 440, 'px'),
            '--cs-carousel-card-width': formatDimensionValue(carouselCardWidth?.desktop, 400, 'px'),
            '--cs-carousel-card-width-small-laptop': formatDimensionValue(carouselCardWidth?.smallLaptop, 360, 'px'),
            '--cs-carousel-card-width-tablet': formatDimensionValue(carouselCardWidth?.tablet, 320, 'px'),
            '--cs-carousel-card-width-mobile': formatDimensionValue(carouselCardWidth?.mobile, 280, 'px'),
            '--cs-drag-cursor-size': `${dragCursorSize}px`,
            '--cs-drag-cursor-bg': dragCursorBgColor,
            '--cs-drag-cursor-color': dragCursorColor,
            '--cs-drag-cursor-font-size': `${dragCursorFontSize}px`,
            '--cs-drag-cursor-font-weight': dragCursorFontWeight,
            '--cs-drag-cursor-text-transform': dragCursorTextTransform
        }
    });

    const containerClasses = [
        'ad-case-studies__container',
        containerMode === 'constrained' ? 'is-constrained' : ''
    ].filter(Boolean).join(' ');

    // Case study CRUD, image, capability, and gallery-item handlers used to
    // live here for the manual per-block repeater. That repeater is gone —
    // all case studies are now managed exclusively from Case Studies
    // Management (see the Content tab panel below and
    // includes/class-adaire-case-studies-cpt.php).

    const easeOptions = [
        { label: 'Power2 InOut', value: 'power2.inOut' },
        { label: 'Power2 Out', value: 'power2.out' },
        { label: 'Power3 InOut', value: 'power3.inOut' },
        { label: 'Back Out', value: 'back.out(1.7)' },
        { label: 'Elastic Out', value: 'elastic.out(1, 0.3)' },
        { label: 'Circ InOut', value: 'circ.inOut' }
    ];

    const fontWeightOptions = [
        { label: 'Light (300)', value: '300' },
        { label: 'Normal (400)', value: '400' },
        { label: 'Medium (500)', value: '500' },
        { label: 'Semi-Bold (600)', value: '600' },
        { label: 'Bold (700)', value: '700' }
    ];

    return (
        <>
            <InspectorTabs attributes={attributes} setAttributes={setAttributes}>
                {/* Layout Settings */}
                <PanelBody section="layout" title={__('Layout Settings', 'adaire-blocks')} initialOpen={true}>
                    <p style={{ marginBottom: '8px' }}>{__('Container Width', 'adaire-blocks')}</p>
                    <ButtonGroup style={{ marginBottom: '16px' }}>
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

                    {containerMode === 'constrained' && (
                        <div className="ad-case-studies__dimension-controls" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                            {DEVICE_TYPES.map((device) => (
                                <div
                                    key={device.key}
                                    style={{ marginBottom: '16px' }}
                                >
                                    <strong style={{ display: 'block', marginBottom: '8px' }}>{device.label}</strong>
                                    <div>
                                        {(() => {
                                            const defaultUnit = (device.key === 'tablet' || device.key === 'mobile') ? '%' : 'px';
                                            const unit = containerMaxWidth?.[device.key]?.unit ?? defaultUnit;
                                            const defaultPx = device.key === 'bigDesktop'
                                                ? 1400
                                                : device.key === 'desktop'
                                                    ? 1200
                                                    : device.key === 'smallLaptop'
                                                        ? 1200
                                                        : 600;
                                            const value = containerMaxWidth?.[device.key]?.value ?? (unit === 'px' ? defaultPx : 100);
                                            const min = unit === 'px' ? 200 : 10;
                                            const max = unit === 'px' ? 2400 : 100;

                                            return (
                                                <RangeControl
                                                    label={__('Max Width', 'adaire-blocks')}
                                                    value={value}
                                                    onChange={(rangeValue) => updateContainerDimension(device.key, 'value', rangeValue)}
                                                    min={min}
                                                    max={max}
                                                    step={unit === 'px' ? 10 : 1}
                                                />
                                            );
                                        })()}
                                        <ButtonGroup>
                                            {UNIT_OPTIONS.map((unit) => (
                                                <Button
                                                    key={unit}
                                                    isSmall
                                                    isPrimary={containerMaxWidth?.[device.key]?.unit === unit}
                                                    onClick={() => updateContainerDimension(device.key, 'unit', unit)}
                                                >
                                                    {unit}
                                                </Button>
                                            ))}
                                        </ButtonGroup>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <RangeControl
                        label={__('Desktop Columns', 'adaire-blocks')}
                        value={columns}
                        onChange={(value) => setAttributes({ columns: value })}
                        min={1}
                        max={6}
                    />
                    <RangeControl
                        label={__('Big Desktop Columns', 'adaire-blocks')}
                        value={columnsBigDesktop}
                        onChange={(value) => setAttributes({ columnsBigDesktop: value })}
                        min={1}
                        max={8}
                    />
                    <RangeControl
                        label={__('Small Laptop Columns', 'adaire-blocks')}
                        value={columnsSmallLaptop}
                        onChange={(value) => setAttributes({ columnsSmallLaptop: value })}
                        min={1}
                        max={6}
                    />
                    <RangeControl
                        label={__('Tablet Columns', 'adaire-blocks')}
                        value={columnsTablet}
                        onChange={(value) => setAttributes({ columnsTablet: value })}
                        min={1}
                        max={4}
                    />
                    <RangeControl
                        label={__('Mobile Columns', 'adaire-blocks')}
                        value={columnsMobile}
                        onChange={(value) => setAttributes({ columnsMobile: value })}
                        min={1}
                        max={2}
                    />
                    <RangeControl
                        label={__('Gap (px)', 'adaire-blocks')}
                        value={gap}
                        onChange={(value) => setAttributes({ gap: value })}
                        min={0}
                        max={60}
                    />
                </PanelBody>

                {/* Carousel Settings */}
                <PanelBody section="layout" title={__('Carousel Settings', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Enable Draggable Carousel', 'adaire-blocks')}
                        checked={enableCarousel}
                        onChange={(value) => setAttributes({ enableCarousel: value })}
                        help={enableCarousel ? __('Cards will be displayed in a horizontal draggable carousel.', 'adaire-blocks') : __('Cards will be displayed in a grid layout.', 'adaire-blocks')}
                    />

                    {enableCarousel && (
                        <>
                            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <strong style={{ display: 'block', marginBottom: '12px' }}>{__('Card Width', 'adaire-blocks')}</strong>
                                {DEVICE_TYPES.map((device) => (
                                    <div key={device.key} style={{ marginBottom: '16px' }}>
                                        <span style={{ fontSize: '12px', color: '#666' }}>{device.label}</span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                            {(() => {
                                                const unit = carouselCardWidth?.[device.key]?.unit ?? 'px';
                                                const value = carouselCardWidth?.[device.key]?.value ?? (
                                                    device.key === 'bigDesktop'
                                                        ? 440
                                                        : device.key === 'desktop'
                                                            ? 400
                                                            : device.key === 'smallLaptop'
                                                                ? 360
                                                                : device.key === 'tablet'
                                                                    ? 320
                                                                    : 280
                                                );
                                                
                                                return (
                                                    <RangeControl
                                                        value={value}
                                                        onChange={(rangeValue) => updateResponsiveDimension('carouselCardWidth', device.key, 'value', rangeValue)}
                                                        min={150}
                                                        max={800}
                                                        step={10}
                                                        withInputField={true}
                                                        __nextHasNoMarginBottom
                                                    />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: '20px' }}>
                                <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>{__('Drag Cursor Indicator', 'adaire-blocks')}</strong>
                                
                                <TextControl
                                    label={__('Text', 'adaire-blocks')}
                                    value={dragCursorText}
                                    onChange={(value) => setAttributes({ dragCursorText: value })}
                                />

                                <RangeControl
                                    label={__('Circle Size (px)', 'adaire-blocks')}
                                    value={dragCursorSize}
                                    onChange={(value) => setAttributes({ dragCursorSize: value })}
                                    min={40}
                                    max={150}
                                />

                                <RangeControl
                                    label={__('Font Size (px)', 'adaire-blocks')}
                                    value={dragCursorFontSize}
                                    onChange={(value) => setAttributes({ dragCursorFontSize: value })}
                                    min={10}
                                    max={24}
                                />

                                <SelectControl
                                    label={__('Font Weight', 'adaire-blocks')}
                                    value={dragCursorFontWeight}
                                    options={fontWeightOptions}
                                    onChange={(value) => setAttributes({ dragCursorFontWeight: value })}
                                />

                                <SelectControl
                                    label={__('Text Case', 'adaire-blocks')}
                                    value={dragCursorTextTransform}
                                    options={[
                                        { label: __('None (Sentence case)', 'adaire-blocks'), value: 'none' },
                                        { label: __('Uppercase', 'adaire-blocks'), value: 'uppercase' },
                                        { label: __('Lowercase', 'adaire-blocks'), value: 'lowercase' },
                                        { label: __('Capitalize', 'adaire-blocks'), value: 'capitalize' }
                                    ]}
                                    onChange={(value) => setAttributes({ dragCursorTextTransform: value })}
                                />
                            </div>
                        </>
                    )}
                </PanelBody>

                {/* Card Settings */}
                <PanelBody section="style" priority="high" title={__('Card Settings', 'adaire-blocks')} initialOpen={false}>
                    <div style={{ marginBottom: '20px' }}>
                        <strong style={{ display: 'block', marginBottom: '12px' }}>{__('Card Height', 'adaire-blocks')}</strong>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>{device.label}</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                    {(() => {
                                        const unit = cardHeight?.[device.key]?.unit ?? 'px';
                                        const value = cardHeight?.[device.key]?.value ?? (
                                            device.key === 'bigDesktop'
                                                ? 340
                                                : device.key === 'desktop'
                                                    ? 320
                                                    : device.key === 'smallLaptop'
                                                        ? 300
                                                        : device.key === 'tablet'
                                                            ? 280
                                                            : 240
                                        );
                                        
                                        return (
                                            <>
                                                <RangeControl
                                                    value={value}
                                                    onChange={(rangeValue) => updateResponsiveDimension('cardHeight', device.key, 'value', rangeValue)}
                                                    min={100}
                                                    max={600}
                                                    step={10}
                                                    withInputField={true}
                                                    __nextHasNoMarginBottom
                                                />
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <RangeControl
                        label={__('Border Radius (px)', 'adaire-blocks')}
                        value={cardBorderRadius}
                        onChange={(value) => setAttributes({ cardBorderRadius: value })}
                        min={0}
                        max={48}
                    />

                    <RangeControl
                        label={__('Content Padding (px)', 'adaire-blocks')}
                        value={contentPadding}
                        onChange={(value) => setAttributes({ contentPadding: value })}
                        min={8}
                        max={60}
                    />

                    <SelectControl
                        label={__('Card Shadow', 'adaire-blocks')}
                        value={cardShadow}
                        options={[
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                            { label: __('Small', 'adaire-blocks'), value: '0 2px 8px rgba(0, 0, 0, 0.1)' },
                            { label: __('Medium', 'adaire-blocks'), value: '0 4px 16px rgba(0, 0, 0, 0.12)' },
                            { label: __('Large', 'adaire-blocks'), value: '0 8px 32px rgba(0, 0, 0, 0.15)' },
                            { label: __('Extra Large', 'adaire-blocks'), value: '0 16px 48px rgba(0, 0, 0, 0.2)' }
                        ]}
                        onChange={(value) => setAttributes({ cardShadow: value })}
                    />

                    <SelectControl
                        label={__('Card Hover Shadow', 'adaire-blocks')}
                        value={cardHoverShadow}
                        options={[
                            { label: __('None', 'adaire-blocks'), value: 'none' },
                            { label: __('Small', 'adaire-blocks'), value: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                            { label: __('Medium', 'adaire-blocks'), value: '0 10px 40px rgba(0, 0, 0, 0.15)' },
                            { label: __('Large', 'adaire-blocks'), value: '0 16px 48px rgba(0, 0, 0, 0.2)' },
                            { label: __('Extra Large', 'adaire-blocks'), value: '0 24px 64px rgba(0, 0, 0, 0.25)' }
                        ]}
                        onChange={(value) => setAttributes({ cardHoverShadow: value })}
                    />
                </PanelBody>

                {/* Header / Search / Toolbar Settings (Webflow "Made in Webflow"-style showcase header) */}
                <PanelBody section="layout" title={__('Header, Search & Toolbar', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Header', 'adaire-blocks')}
                        checked={showHeader}
                        onChange={(value) => setAttributes({ showHeader: value })}
                    />
                    {showHeader && (
                        <>
                            <TextControl
                                label={__('Eyebrow', 'adaire-blocks')}
                                value={headerEyebrow}
                                onChange={(value) => setAttributes({ headerEyebrow: value })}
                            />
                            <TextControl
                                label={__('Heading', 'adaire-blocks')}
                                value={headerHeading}
                                onChange={(value) => setAttributes({ headerHeading: value })}
                            />
                            <TextControl
                                label={__('Description', 'adaire-blocks')}
                                value={headerDescription}
                                onChange={(value) => setAttributes({ headerDescription: value })}
                            />
                        </>
                    )}

                    <div style={{ borderTop: '1px solid #ddd', marginTop: '16px', paddingTop: '16px' }}>
                        <ToggleControl
                            label={__('Show Search', 'adaire-blocks')}
                            checked={showSearch}
                            onChange={(value) => setAttributes({ showSearch: value })}
                        />
                        {showSearch && (
                            <TextControl
                                label={__('Search Placeholder', 'adaire-blocks')}
                                value={searchPlaceholder}
                                onChange={(value) => setAttributes({ searchPlaceholder: value })}
                            />
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid #ddd', marginTop: '16px', paddingTop: '16px' }}>
                        <ToggleControl
                            label={__('Show Category Pills', 'adaire-blocks')}
                            checked={showCategoryPills}
                            onChange={(value) => setAttributes({ showCategoryPills: value })}
                            help={__('Live filter pills built from each case study’s Industry taxonomy.', 'adaire-blocks')}
                        />
                        <ToggleControl
                            label={__('Show Sort Dropdown', 'adaire-blocks')}
                            checked={showSort}
                            onChange={(value) => setAttributes({ showSort: value })}
                            help={__('Newest / Most Liked sort control.', 'adaire-blocks')}
                        />
                    </div>

                    <div style={{ borderTop: '1px solid #ddd', marginTop: '16px', paddingTop: '16px' }}>
                        <ToggleControl
                            label={__('Show Submit Button', 'adaire-blocks')}
                            checked={showSubmitButton}
                            onChange={(value) => setAttributes({ showSubmitButton: value })}
                        />
                        {showSubmitButton && (
                            <>
                                <TextControl
                                    label={__('Button Text', 'adaire-blocks')}
                                    value={submitButtonText}
                                    onChange={(value) => setAttributes({ submitButtonText: value })}
                                />
                                <TextControl
                                    label={__('Button URL', 'adaire-blocks')}
                                    value={submitButtonUrl}
                                    onChange={(value) => setAttributes({ submitButtonUrl: value })}
                                />
                            </>
                        )}
                    </div>
                </PanelBody>

                {/* Filter Settings */}
                <PanelBody section="layout" title={__('Legacy Dropdown Filters', 'adaire-blocks')} initialOpen={false}>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: 0 }}>
                        {__('Superseded by the Category Pills row above. Only kept for sites that already relied on it.', 'adaire-blocks')}
                    </p>
                    <ToggleControl
                        label={__('Show Filters', 'adaire-blocks')}
                        checked={showFilters}
                        onChange={(value) => setAttributes({ showFilters: value })}
                    />
                    {showFilters && (
                        <>
                            <TextControl
                                label={__('Industry Filter Label', 'adaire-blocks')}
                                value={industryFilterLabel}
                                onChange={(value) => setAttributes({ industryFilterLabel: value })}
                            />
                            <TextControl
                                label={__('Capability Filter Label', 'adaire-blocks')}
                                value={capabilityFilterLabel}
                                onChange={(value) => setAttributes({ capabilityFilterLabel: value })}
                            />
                            <RangeControl
                                label={__('Filter Label Font Size', 'adaire-blocks')}
                                value={filterLabelFontSize}
                                onChange={(value) => setAttributes({ filterLabelFontSize: value })}
                                min={10}
                                max={24}
                            />
                            <RangeControl
                                label={__('Filter Border Radius', 'adaire-blocks')}
                                value={filterBorderRadius}
                                onChange={(value) => setAttributes({ filterBorderRadius: value })}
                                min={0}
                                max={16}
                            />
                        </>
                    )}
                </PanelBody>

                {/* Load More Settings */}
                <PanelBody section="layout" title={__('Load More Settings', 'adaire-blocks')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Load More Button', 'adaire-blocks')}
                        checked={showLoadMore}
                        onChange={(value) => setAttributes({ showLoadMore: value })}
                    />
                    {showLoadMore && (
                        <>
                            <TextControl
                                label={__('Button Text', 'adaire-blocks')}
                                value={loadMoreText}
                                onChange={(value) => setAttributes({ loadMoreText: value })}
                            />
                            <RangeControl
                                label={__('Initial Items to Show', 'adaire-blocks')}
                                value={initialCount}
                                onChange={(value) => setAttributes({ initialCount: value })}
                                min={1}
                                max={24}
                            />
                            <RangeControl
                                label={__('Items to Load Per Click', 'adaire-blocks')}
                                value={loadMoreCount}
                                onChange={(value) => setAttributes({ loadMoreCount: value })}
                                min={1}
                                max={12}
                            />
                            <RangeControl
                                label={__('Button Font Size', 'adaire-blocks')}
                                value={loadMoreFontSize}
                                onChange={(value) => setAttributes({ loadMoreFontSize: value })}
                                min={12}
                                max={24}
                            />
                            <SelectControl
                                label={__('Button Font Weight', 'adaire-blocks')}
                                value={loadMoreFontWeight}
                                options={fontWeightOptions}
                                onChange={(value) => setAttributes({ loadMoreFontWeight: value })}
                            />
                        </>
                    )}
                </PanelBody>

                {/* Card Typography */}
                <PanelBody section="style" priority="high" title={__('Card Typography', 'adaire-blocks')} initialOpen={false}>
                    {/* Title Typography */}
                    <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
                        <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>{__('Title', 'adaire-blocks')}</strong>
                        
                        <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>{__('Font Size', 'adaire-blocks')}</p>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#888' }}>{device.label}</span>
                                {(() => {
                                    const value = titleFontSize?.[device.key]?.value ?? (
                                        device.key === 'bigDesktop'
                                            ? 22
                                            : device.key === 'desktop'
                                                ? 20
                                                : device.key === 'smallLaptop'
                                                    ? 19
                                                    : device.key === 'tablet'
                                                        ? 18
                                                        : 16
                                    );
                                    return (
                                        <RangeControl
                                            value={value}
                                            onChange={(rangeValue) => updateResponsiveDimension('titleFontSize', device.key, 'value', rangeValue)}
                                            min={12}
                                            max={48}
                                            __nextHasNoMarginBottom
                                        />
                                    );
                                })()}
                            </div>
                        ))}

                        <SelectControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={titleFontWeight}
                            options={fontWeightOptions}
                            onChange={(value) => setAttributes({ titleFontWeight: value })}
                        />

                        <RangeControl
                            label={__('Line Height', 'adaire-blocks')}
                            value={titleLineHeight}
                            onChange={(value) => setAttributes({ titleLineHeight: value })}
                            min={1}
                            max={2.5}
                            step={0.1}
                        />

                        <RangeControl
                            label={__('Letter Spacing (px)', 'adaire-blocks')}
                            value={titleLetterSpacing}
                            onChange={(value) => setAttributes({ titleLetterSpacing: value })}
                            min={-2}
                            max={10}
                            step={0.5}
                        />
                    </div>

                    {/* Description Typography */}
                    <div>
                        <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>{__('Description', 'adaire-blocks')}</strong>
                        
                        <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>{__('Font Size', 'adaire-blocks')}</p>
                        {DEVICE_TYPES.map((device) => (
                            <div key={device.key} style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '11px', color: '#888' }}>{device.label}</span>
                                {(() => {
                                    const value = descriptionFontSize?.[device.key]?.value ?? (
                                        device.key === 'bigDesktop'
                                            ? 14
                                            : device.key === 'desktop'
                                                ? 14
                                                : device.key === 'smallLaptop'
                                                    ? 13
                                                    : device.key === 'tablet'
                                                        ? 13
                                                        : 12
                                    );
                                    return (
                                        <RangeControl
                                            value={value}
                                            onChange={(rangeValue) => updateResponsiveDimension('descriptionFontSize', device.key, 'value', rangeValue)}
                                            min={10}
                                            max={24}
                                            __nextHasNoMarginBottom
                                        />
                                    );
                                })()}
                            </div>
                        ))}

                        <SelectControl
                            label={__('Font Weight', 'adaire-blocks')}
                            value={descriptionFontWeight}
                            options={fontWeightOptions}
                            onChange={(value) => setAttributes({ descriptionFontWeight: value })}
                        />

                        <RangeControl
                            label={__('Line Height', 'adaire-blocks')}
                            value={descriptionLineHeight}
                            onChange={(value) => setAttributes({ descriptionLineHeight: value })}
                            min={1}
                            max={2.5}
                            step={0.1}
                        />

                        <RangeControl
                            label={__('Letter Spacing (px)', 'adaire-blocks')}
                            value={descriptionLetterSpacing}
                            onChange={(value) => setAttributes({ descriptionLetterSpacing: value })}
                            min={-1}
                            max={5}
                            step={0.25}
                        />

                        <RangeControl
                            label={__('Max Lines', 'adaire-blocks')}
                            value={descriptionMaxLines}
                            onChange={(value) => setAttributes({ descriptionMaxLines: value })}
                            min={1}
                            max={10}
                            help={__('Number of lines before text is truncated', 'adaire-blocks')}
                        />
                    </div>
                </PanelBody>

                {/* Color Settings */}
                <PanelColorSettings
                    section="style"
                    priority="high"
                    title={__('Color Settings', 'adaire-blocks')}
                    initialOpen={false}
                    colorSettings={[
                        {
                            label: __('Card Background (fallback)', 'adaire-blocks'),
                            value: cardBackgroundColor,
                            onChange: (value) => setAttributes({ cardBackgroundColor: value })
                        },
                        {
                            label: __('Card Overlay Color', 'adaire-blocks'),
                            value: overlayColor,
                            onChange: (value) => setAttributes({ overlayColor: value })
                        },
                        {
                            label: __('Card Overlay Hover Color', 'adaire-blocks'),
                            value: overlayHoverColor,
                            onChange: (value) => setAttributes({ overlayHoverColor: value })
                        },
                        {
                            label: __('Title Color', 'adaire-blocks'),
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value })
                        },
                        {
                            label: __('Description Color', 'adaire-blocks'),
                            value: descriptionColor,
                            onChange: (value) => setAttributes({ descriptionColor: value })
                        },
                        {
                            label: __('Filter Label Color', 'adaire-blocks'),
                            value: filterLabelColor,
                            onChange: (value) => setAttributes({ filterLabelColor: value })
                        },
                        {
                            label: __('Filter Border Color', 'adaire-blocks'),
                            value: filterBorderColor,
                            onChange: (value) => setAttributes({ filterBorderColor: value })
                        },
                        {
                            label: __('Filter Background Color', 'adaire-blocks'),
                            value: filterBackgroundColor,
                            onChange: (value) => setAttributes({ filterBackgroundColor: value })
                        },
                        {
                            label: __('Load More Button Color', 'adaire-blocks'),
                            value: loadMoreButtonColor,
                            onChange: (value) => setAttributes({ loadMoreButtonColor: value })
                        },
                        {
                            label: __('Load More Hover Color', 'adaire-blocks'),
                            value: loadMoreButtonHoverColor,
                            onChange: (value) => setAttributes({ loadMoreButtonHoverColor: value })
                        },
                        ...(enableCarousel ? [
                            {
                                label: __('Drag Cursor Background', 'adaire-blocks'),
                                value: dragCursorBgColor,
                                onChange: (value) => setAttributes({ dragCursorBgColor: value })
                            },
                            {
                                label: __('Drag Cursor Text Color', 'adaire-blocks'),
                                value: dragCursorColor,
                                onChange: (value) => setAttributes({ dragCursorColor: value })
                            }
                        ] : [])
                    ]}
                />

                {/* Animation Settings */}
                <PanelBody section="style" priority="medium" title={__('Animation Settings', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('FLIP Animation Duration (s)', 'adaire-blocks')}
                        value={animationDuration}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={0.2}
                        max={2}
                        step={0.1}
                    />
                    <SelectControl
                        label={__('Animation Ease', 'adaire-blocks')}
                        value={animationEase}
                        options={easeOptions}
                        onChange={(value) => setAttributes({ animationEase: value })}
                    />
                    <RangeControl
                        label={__('Hover Scale', 'adaire-blocks')}
                        value={hoverScale}
                        onChange={(value) => setAttributes({ hoverScale: value })}
                        min={1}
                        max={1.2}
                        step={0.01}
                    />
                    <RangeControl
                        label={__('Hover Transition Duration (s)', 'adaire-blocks')}
                        value={hoverTransitionDuration}
                        onChange={(value) => setAttributes({ hoverTransitionDuration: value })}
                        min={0.1}
                        max={1}
                        step={0.05}
                    />
                </PanelBody>

                {/* Case Studies Management */}
                <PanelBody section="content" title={__('Case Studies', 'adaire-blocks')} initialOpen={false}>
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', backgroundColor: '#f7f7f7' }}>
                        <p style={{ marginTop: 0 }}>
                            {managedCount !== null
                                ? sprintf(
                                    managedCount === 1
                                        ? __('%d published case study found.', 'adaire-blocks')
                                        : __('%d published case studies found.', 'adaire-blocks'),
                                    managedCount
                                  )
                                : __('Loading published case study count…', 'adaire-blocks')}
                        </p>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                            {__('Case studies are managed from Case Studies Management in the WordPress dashboard, not from this block. Each case study post supports a title, description, card image, industry, capabilities, client, country, language, technology, and website link.', 'adaire-blocks')}
                        </p>
                        <Button variant="primary" href={getCaseStudiesAdminUrl()} target="_blank" rel="noopener noreferrer">
                            {__('Manage Case Studies', 'adaire-blocks')}
                        </Button>
                    </div>

                </PanelBody>

                {/* Popup fallback preview — used only when a case study has
                    no Website URL set, so there's nothing to embed live. */}
                <PanelBody section="content" title={__('Popup Fallback', 'adaire-blocks')} initialOpen={false}>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: 0 }}>
                        {__('Clicking a card opens a popup showing that case study’s Hero Image. If a study has no Hero Image of its own, this fallback image is shown instead.', 'adaire-blocks')}
                    </p>
                    <BaseControl label={__('Fallback Preview Image', 'adaire-blocks')} style={{ marginTop: '8px' }}>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => setAttributes({
                                    popupImageId: media.id,
                                    popupImageUrl: media.url,
                                    popupImageAlt: media.alt || ''
                                })}
                                allowedTypes={['image']}
                                value={popupImageId}
                                render={({ open }) => (
                                    <Button
                                        onClick={open}
                                        variant="secondary"
                                        style={{ width: '100%', height: popupImageUrl ? '120px' : 'auto', padding: popupImageUrl ? 0 : undefined, overflow: 'hidden' }}
                                    >
                                        {popupImageUrl ? (
                                            <img
                                                src={popupImageUrl}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            __('Select Fallback Image', 'adaire-blocks')
                                        )}
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                        {popupImageUrl && (
                            <Button
                                onClick={() => setAttributes({ popupImageId: 0, popupImageUrl: '', popupImageAlt: '' })}
                                variant="link"
                                isDestructive
                                style={{ marginTop: '4px' }}
                            >
                                {__('Remove Image', 'adaire-blocks')}
                            </Button>
                        )}
                    </BaseControl>
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                <QuickZone
                    id="colors"
                    label={__('Colors', 'adaire-blocks')}
                    activeZone={activeZone}
                    setActiveZone={setActiveZone}
                    content={
                        <>
                            <p>{__('Card Background', 'adaire-blocks')}</p>
                            <BoundColorPalette value={cardBackgroundColor} onChange={(value) => setAttributes({ cardBackgroundColor: value })} />
                            <p>{__('Card Overlay', 'adaire-blocks')}</p>
                            <BoundColorPalette value={overlayColor} onChange={(value) => setAttributes({ overlayColor: value })} />
                            <p>{__('Title', 'adaire-blocks')}</p>
                            <BoundColorPalette value={titleColor} onChange={(value) => setAttributes({ titleColor: value })} />
                            <p>{__('Description', 'adaire-blocks')}</p>
                            <BoundColorPalette value={descriptionColor} onChange={(value) => setAttributes({ descriptionColor: value })} />
                        </>
                    }
                >
                <div className={containerClasses}>
                    {/* Header (Webflow "Made in Webflow"-style showcase heading) */}
                    {showHeader && (
                        <div className="ad-case-studies__header">
                            {headerEyebrow && <span className="ad-case-studies__header-eyebrow">{headerEyebrow}</span>}
                            {headerHeading && <h2 className="ad-case-studies__header-heading">{headerHeading}</h2>}
                            {headerDescription && <p className="ad-case-studies__header-description">{headerDescription}</p>}
                        </div>
                    )}

                    {/* Search */}
                    {showSearch && (
                        <div className="ad-case-studies__search">
                            <svg className="ad-case-studies__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <input type="search" className="ad-case-studies__search-input" placeholder={searchPlaceholder} disabled />
                        </div>
                    )}

                    {/* Toolbar: category pills + sort + submit button */}
                    {(showCategoryPills || showSort || showSubmitButton) && (
                        <div className="ad-case-studies__toolbar">
                            {showCategoryPills && (
                                <div className="ad-case-studies__pills">
                                    <button type="button" className="ad-case-studies__pill is-active">{__('All', 'adaire-blocks')}</button>
                                    {industries.map((ind) => (
                                        <button type="button" key={ind} className="ad-case-studies__pill">{ind}</button>
                                    ))}
                                </div>
                            )}
                            <div className="ad-case-studies__toolbar-right">
                                {showSort && (
                                    <div className="ad-case-studies__sort">
                                        <select className="ad-case-studies__sort-select" disabled>
                                            <option>{__('Newest', 'adaire-blocks')}</option>
                                            <option>{__('Most Liked', 'adaire-blocks')}</option>
                                        </select>
                                    </div>
                                )}
                                {showSubmitButton && (
                                    <span className="ad-case-studies__submit-btn">{submitButtonText}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Legacy dropdown Filter Section */}
                    {showFilters && (
                        <div className="ad-case-studies__filters">
                            <div className="ad-case-studies__filter-group">
                                <select className="ad-case-studies__filter-select" disabled>
                                    <option value="">{industryFilterLabel}</option>
                                    <option value="">{__('All Industries', 'adaire-blocks')}</option>
                                    {industries.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                                <svg className="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="ad-case-studies__filter-group">
                                <select className="ad-case-studies__filter-select" disabled>
                                    <option value="">{capabilityFilterLabel}</option>
                                    <option value="">{__('All Capabilities', 'adaire-blocks')}</option>
                                    {capabilities.map(cap => (
                                        <option key={cap} value={cap}>{cap}</option>
                                    ))}
                                </select>
                                <svg className="ad-case-studies__filter-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Case Studies Grid / Carousel */}
                    <div className={`ad-case-studies__grid${enableCarousel ? ' ad-case-studies__carousel' : ''}`}>
                        {(enableCarousel ? previewStudies : previewStudies.slice(0, initialCount)).map((study, index) => {
                            const tagLabels = [];
                            (study.industries || []).forEach((ind) => {
                                if (tagLabels.length < 2) tagLabels.push(ind);
                            });
                            (study.capabilities || []).forEach((cap) => {
                                if (tagLabels.length < 2) tagLabels.push(cap);
                            });
                            return (
                                <div key={study.id} className="ad-case-studies__card">
                                    <div className="ad-case-studies__card-media">
                                        {study.backgroundImage ? (
                                            <img className="ad-case-studies__card-thumb" src={study.backgroundImage} alt={study.title} />
                                        ) : (
                                            <div
                                                className="ad-case-studies__card-thumb ad-case-studies__card-thumb--placeholder"
                                                style={{ background: editorPlaceholderColor(study.id != null ? study.id : study.title) }}
                                            >
                                                <span className="ad-case-studies__card-thumb-initials">{editorPlaceholderInitials(study.title)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ad-case-studies__card-footer">
                                        {study.authorAvatar ? (
                                            <img className="ad-case-studies__card-avatar" src={study.authorAvatar} alt="" />
                                        ) : (
                                            <span className="ad-case-studies__card-avatar" />
                                        )}
                                        <div className="ad-case-studies__card-meta">
                                            <span className="ad-case-studies__card-title">{study.title}</span>
                                            <span className="ad-case-studies__card-author">{study.authorName}</span>
                                        </div>
                                        <span className="ad-case-studies__card-likes">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                                                <path d="M12 21s-6.7-4.35-9.33-8.2C.6 9.77 1.6 6.2 4.8 5.02c2-.74 4-.1 5.2 1.53A4.65 4.65 0 0115.2 5c3.2 1.18 4.2 4.75 2.13 7.8C18.7 16.65 12 21 12 21z" />
                                            </svg>
                                            {study.likes || 0}
                                        </span>
                                    </div>
                                    {tagLabels.length > 0 && (
                                        <div className="ad-case-studies__card-tags">
                                            {tagLabels.map((label) => (
                                                <span key={label} className="ad-case-studies__card-tag">{label}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button (hidden in carousel mode) */}
                    {!enableCarousel && showLoadMore && previewStudies.length > initialCount && (
                        <div className="ad-case-studies__load-more-wrapper">
                            <button className="ad-case-studies__load-more-btn" disabled>
                                {loadMoreText}
                            </button>
                        </div>
                    )}

                    {/* Helper text */}
                    {previewStudies.length === 0 && (
                        <div className="ad-case-studies__empty">
                            <p>{__('No published case studies yet.', 'adaire-blocks')}</p>
                            <Button variant="primary" href={getCaseStudiesAdminUrl()} target="_blank" rel="noopener noreferrer">
                                {__('Add a Case Study', 'adaire-blocks')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Drag Cursor Preview (Editor only) */}
                {enableCarousel && (
                    <div className="ad-case-studies__drag-cursor-preview">
                        <span>{dragCursorText}</span>
                    </div>
                )}
                </QuickZone>
            </div>
        </>
    );
}



