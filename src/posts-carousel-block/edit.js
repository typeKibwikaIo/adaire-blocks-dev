import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    PanelColorSettings,
    __experimentalUseCustomUnits as useCustomUnits,
    __experimentalUnitControl as UnitControl
} from '@wordpress/block-editor';
import {
    PanelBody,
    PanelRow,
    SelectControl,
    ToggleControl,
    RangeControl,
    TextControl,
    Button,
    ButtonGroup,
    Placeholder,
    Spinner,
    Notice,
    __experimentalSpacingSizesControl as SpacingSizesControl,
    __experimentalBoxControl as BoxControl
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { getBlockType } from '@wordpress/blocks';
import InspectorTabs from '../components/InspectorTabs';
import DeviceSwitcher from '../components/DeviceSwitcher';
import QuickZone from '../components/QuickZone';

const THREE_TIERS = [
    { key: 'desktop', label: __('Desktop', 'adaire-blocks'), icon: desktop },
    { key: 'tablet', label: __('Tablet', 'adaire-blocks'), icon: tablet },
    { key: 'mobile', label: __('Mobile', 'adaire-blocks'), icon: mobile },
];

// Sample image used only for the editor's "no posts yet" demo cards below —
// never used in the saved/frontend output, which always pulls the real
// featured image (or the styled placeholder) from the WordPress REST API.
const DEMO_IMAGE_URL = 'https://static.wixstatic.com/media/4b9d2b_2c368161aa454e99912d895d1d2baa70~mv2.png/v1/fill/w_704,h_488,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/4b9d2b_2c368161aa454e99912d895d1d2baa70~mv2.png';

const Edit = ({ attributes, setAttributes, clientId }) => {
    const [deviceType, setDeviceType] = useState('desktop');
    const [activeZone, setActiveZone] = useState(null);

    // Resets the given responsive attributes back to their block.json defaults —
    // existing values only, nothing new is added.
    const resetToDefaults = (keys) => {
        const blockType = getBlockType('create-block/posts-carousel-block');
        const defaults = blockType?.attributes || {};
        const resetValues = {};
        keys.forEach((key) => {
            if (defaults[key] && 'default' in defaults[key]) {
                resetValues[key] = defaults[key].default;
            }
        });
        setAttributes(resetValues);
    };

    const {
        blockId,
        postsPerPage,
        enablePagination,
        paginationStyle,
        selectedCategories,
        selectedPosts,
        postType,
        excludeCurrentPost,
        showCategories,
        showDate,
        showAuthor,
        showReadTime,
        showExcerpt,
        excerptLength,
        layoutType,
        columns,
        enableFiltering,
        filterPosition,
        filterStyle,
        cardBorderRadius,
        cardPadding,
        cardGap,
        imageHeight,
        imageFit,
        titleColor,
        titleFontSize,
        titleFontWeight,
        excerptColor,
        excerptFontSize,
        excerptFontWeight,
        metaColor,
        metaFontSize,
        metaFontWeight,
        categoryColor,
        categoryBackgroundColor,
        categoryBorderRadius,
        filterBorderRadius,
        paginationBorderRadius,
        enableAnimations,
        animationType,
        transitionAnimation,
        animationDuration,
        animationDelay,
        animationEase,
        enableHoverEffects,
        hoverScale,
        hoverShadow,
        overlayOpacity,
        overlayGradient,
        textAlign,
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
        slidesPerView,
        dragCursorText,
        dragCursorFontSize,
        dragCursorFontWeight,
        dragCursorColor,
        dragCursorSize,
        dragCursorTextTransform,
        dragCursorBgColor
    } = attributes;

    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responsiveColumns, setResponsiveColumns] = useState(columns);

    // Generate block ID on mount
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: `posts-carousel-${clientId}` });
        }
    }, [clientId, blockId, setAttributes]);

    // Handle responsive columns based on window width and WordPress preview mode
    useEffect(() => {
        const updateResponsiveColumns = () => {
            // Check if we're in WordPress editor responsive preview mode
            const editorCanvas = document.querySelector('.edit-post-visual-editor__content-area');
            const previewDevice = document.querySelector('.is-tablet-preview, .is-mobile-preview');
            
            let effectiveWidth = window.innerWidth;
            
            // Detect WordPress responsive preview mode
            if (document.body.classList.contains('is-mobile-preview')) {
                effectiveWidth = 360; // Mobile preview
            } else if (document.body.classList.contains('is-tablet-preview')) {
                effectiveWidth = 780; // Tablet preview
            } else if (editorCanvas) {
                // Use the actual canvas width if available
                effectiveWidth = editorCanvas.offsetWidth;
            }
            
            if (layoutType === 'normal') {
                if (effectiveWidth <= 768) {
                    setResponsiveColumns(1); // Mobile: 1 column
                } else if (effectiveWidth <= 1024) {
                    setResponsiveColumns(2); // Tablet: 2 columns
                } else {
                    setResponsiveColumns(columns); // Desktop: User-defined
                }
            } else {
                setResponsiveColumns(1); // List is always 1 column
            }
        };

        // Initial update
        updateResponsiveColumns();

        // Add resize listener
        window.addEventListener('resize', updateResponsiveColumns);

        // Watch for WordPress preview mode changes
        const observer = new MutationObserver(updateResponsiveColumns);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also observe the editor canvas size changes
        const editorCanvas = document.querySelector('.edit-post-visual-editor__content-area');
        if (editorCanvas) {
            const resizeObserver = new ResizeObserver(updateResponsiveColumns);
            resizeObserver.observe(editorCanvas);
            
            return () => {
                window.removeEventListener('resize', updateResponsiveColumns);
                observer.disconnect();
                resizeObserver.disconnect();
            };
        }

        // Cleanup
        return () => {
            window.removeEventListener('resize', updateResponsiveColumns);
            observer.disconnect();
        };
    }, [columns, layoutType]);

    // Fetch categories and posts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try REST API first, but have fallback
                try {
                    // Test if REST API is available
                    const testResponse = await apiFetch({
                        path: '/wp/v2/',
                        method: 'GET'
                    });
                    // Fetch categories
                    try {
                        const categoriesResponse = await apiFetch({
                            path: '/wp/v2/categories?per_page=100',
                            method: 'GET'
                        });
                        setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
                    } catch (catError) {
                        console.warn('[Posts Grid Editor] Failed to fetch categories:', catError);
                        setCategories([]);
                    }

                    // Fetch posts
                    try {
                        // Convert post type to REST API endpoint (e.g., 'post' -> 'posts')
                        const apiEndpoint = postType === 'post' ? 'posts' : postType;
                        let postsPath = `/wp/v2/${apiEndpoint}?per_page=100&_embed=1`;
                        
                        if (selectedCategories.length > 0) {
                            postsPath += `&categories=${selectedCategories.join(',')}`;
                        }
                        const postsResponse = await apiFetch({
                            path: postsPath,
                            method: 'GET'
                        });
                        setPosts(Array.isArray(postsResponse) ? postsResponse : []);
                    } catch (postsError) {
                        console.error('[Posts Grid Editor] Failed to fetch posts:', postsError);
                        console.error('[Posts Grid Editor] Error details:', postsError.message, postsError.code);
                        setPosts([]);
                        setError(`REST API Error: ${postsError.message}. The block will work but may not show real data in the editor.`);
                    }
                } catch (apiError) {
                    console.error('[Posts Grid Editor] REST API not available:', apiError);
                    console.error('[Posts Grid Editor] Error type:', apiError.constructor.name);
                    console.error('[Posts Grid Editor] Error message:', apiError.message);
                    console.error('[Posts Grid Editor] Error code:', apiError.code);
                    setError('REST API is not available. This block will work on the frontend but may not show data in the editor. Please check your WordPress REST API settings.');
                    setCategories([]);
                    setPosts([]);
                }
            } catch (err) {
                setError('Failed to initialize block.');
                console.error('Posts Grid Block Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postType, selectedCategories]);

    const blockProps = useBlockProps({
        className: `adaire-posts-carousel`,
        style: {
            '--adaire-posts-carousel-columns': columns,
            '--adaire-posts-carousel-slides-per-view-desktop': `${slidesPerView?.desktop ?? 4}`,
            '--adaire-posts-carousel-slides-per-view-tablet': `${slidesPerView?.tablet ?? 3}`,
            '--adaire-posts-carousel-slides-per-view-mobile': `${slidesPerView?.mobile ?? 2}`,
            '--adaire-posts-carousel-gap': `${cardGap}px`,
            '--adaire-posts-carousel-border-radius': `${cardBorderRadius}px`,
            '--adaire-posts-carousel-padding': `${cardPadding}px`,
            '--adaire-posts-carousel-image-height': `${imageHeight}px`,
            '--adaire-posts-carousel-title-color': titleColor,
            '--adaire-posts-carousel-title-font-size': `${titleFontSize}px`,
            '--adaire-posts-carousel-title-font-weight': titleFontWeight,
            '--adaire-posts-carousel-excerpt-color': excerptColor,
            '--adaire-posts-carousel-excerpt-font-size': `${excerptFontSize}px`,
            '--adaire-posts-carousel-excerpt-font-weight': excerptFontWeight,
            '--adaire-posts-carousel-meta-color': metaColor,
            '--adaire-posts-carousel-meta-font-size': `${metaFontSize}px`,
            '--adaire-posts-carousel-meta-font-weight': metaFontWeight,
            '--adaire-posts-carousel-category-color': categoryColor,
            '--adaire-posts-carousel-category-background': categoryBackgroundColor,
            '--adaire-posts-carousel-category-border-radius': `${categoryBorderRadius}px`,
            '--adaire-posts-carousel-filter-border-radius': `${filterBorderRadius}px`,
            '--adaire-posts-carousel-pagination-border-radius': `${paginationBorderRadius}px`,
            '--adaire-posts-carousel-hover-scale': hoverScale,
            '--adaire-posts-carousel-overlay-opacity': overlayOpacity,
            '--adaire-posts-carousel-overlay-gradient': overlayGradient,
            '--container-max-width': `${containerMaxWidth?.desktop?.value ?? containerMaxWidth?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? containerMaxWidth?.unit ?? 'px'}`,
            '--container-max-width-tablet': `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
            '--container-max-width-mobile': `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
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
            '--adaire-posts-carousel-drag-cursor-size': `${dragCursorSize}px`,
            '--adaire-posts-carousel-drag-cursor-font-size': `${dragCursorFontSize}px`,
            '--adaire-posts-carousel-drag-cursor-font-weight': dragCursorFontWeight,
            '--adaire-posts-carousel-drag-cursor-color': dragCursorColor,
            '--adaire-posts-carousel-drag-cursor-bg': dragCursorBgColor,
            '--adaire-posts-carousel-drag-cursor-text-transform': dragCursorTextTransform,
            textAlign: textAlign
        }
    });

    const toggleCategory = (categoryId) => {
        const newCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        setAttributes({ selectedCategories: newCategories });
    };

    const togglePost = (postId) => {
        const newPosts = selectedPosts.includes(postId)
            ? selectedPosts.filter(id => id !== postId)
            : [...selectedPosts, postId];
        setAttributes({ selectedPosts: newPosts });
    };

    const animationTypes = [
        { label: 'Fade Up', value: 'fadeUp' },
        { label: 'Fade In', value: 'fadeIn' },
        { label: 'Scale Up', value: 'scaleUp' },
        { label: 'Slide Up', value: 'slideUp' },
        { label: 'Rotate In', value: 'rotateIn' },
        { label: 'Bounce In', value: 'bounceIn' }
    ];

    const easeTypes = [
        { label: 'Power2 Out', value: 'power2.out' },
        { label: 'Power3 Out', value: 'power3.out' },
        { label: 'Back Out', value: 'back.out' },
        { label: 'Elastic Out', value: 'elastic.out' },
        { label: 'Bounce Out', value: 'bounce.out' },
        { label: 'Circ Out', value: 'circ.out' }
    ];

    if (loading) {
        return (
            <div {...blockProps}>
                <Placeholder>
                    <Spinner />
                    <p>{__('Loading Posts Carousel...', 'adaire-blocks')}</p>
                </Placeholder>
            </div>
        );
    }

    // Show error as a notice but still render the block
    const showErrorNotice = error && posts.length === 0;
return (
        <>
            <InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
                {/* Content Settings */}
                <PanelBody section="content" title={__('Content Settings', 'adaire-blocks')} initialOpen={true}>
                    <TextControl
                        label={__('Posts Per Page', 'adaire-blocks')}
                        type="number"
                        value={postsPerPage}
                        onChange={(value) => setAttributes({ postsPerPage: parseInt(value) || 6 })}
                        min={1}
                        max={100}
                        help={__('Number of posts to display per page', 'adaire-blocks')}
                    />

                    <PanelRow>
                        <ToggleControl
                            label={__('Enable Pagination', 'adaire-blocks')}
                            checked={enablePagination}
                            onChange={(value) => setAttributes({ enablePagination: value })}
                            help={__('Show pagination when there are more posts than posts per page', 'adaire-blocks')}
                        />
                    </PanelRow>

                    {enablePagination && (
                        <PanelRow>
                            <SelectControl
                                label={__('Pagination Style', 'adaire-blocks')}
                                value={paginationStyle}
                                options={[
                                    { label: __('Page Numbers', 'adaire-blocks'), value: 'numbers' },
                                    { label: __('Load More Button', 'adaire-blocks'), value: 'loadmore' },
                                    { label: __('Previous/Next', 'adaire-blocks'), value: 'prevnext' }
                                ]}
                                onChange={(value) => setAttributes({ paginationStyle: value })}
                            />
                        </PanelRow>
                    )}
                    
                    <PanelRow>
                        <ToggleControl
                            label={__('Exclude Current Post', 'adaire-blocks')}
                            checked={excludeCurrentPost}
                            onChange={(value) => setAttributes({ excludeCurrentPost: value })}
                        />
                    </PanelRow>

                    <PanelRow>
                        <ToggleControl
                            label={__('Show Categories', 'adaire-blocks')}
                            checked={showCategories}
                            onChange={(value) => setAttributes({ showCategories: value })}
                        />
                    </PanelRow>

                    <PanelRow>
                        <ToggleControl
                            label={__('Show Date', 'adaire-blocks')}
                            checked={showDate}
                            onChange={(value) => setAttributes({ showDate: value })}
                        />
                    </PanelRow>

                    <PanelRow>
                        <ToggleControl
                            label={__('Show Author', 'adaire-blocks')}
                            checked={showAuthor}
                            onChange={(value) => setAttributes({ showAuthor: value })}
                        />
                    </PanelRow>

                    <PanelRow>
                        <ToggleControl
                            label={__('Show Read Time', 'adaire-blocks')}
                            checked={showReadTime}
                            onChange={(value) => setAttributes({ showReadTime: value })}
                        />
                    </PanelRow>

                    <PanelRow>
                        <ToggleControl
                            label={__('Show Excerpt', 'adaire-blocks')}
                            checked={showExcerpt}
                            onChange={(value) => setAttributes({ showExcerpt: value })}
                        />
                    </PanelRow>

                    {showExcerpt && (
                        <PanelRow>
                            <RangeControl
                                label={__('Excerpt Length', 'adaire-blocks')}
                                value={excerptLength}
                                onChange={(value) => setAttributes({ excerptLength: value })}
                                min={10}
                                max={50}
                            />
                        </PanelRow>
                    )}
                </PanelBody>

                {/* Category Selection */}
                <PanelBody section="content" title={__('Category Selection', 'adaire-blocks')} initialOpen={false}>
                    <p>{__('Select categories to filter posts:', 'adaire-blocks')}</p>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                        {categories.map(category => (
                            <label key={category.id} style={{ display: 'block', marginBottom: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                    style={{ marginRight: '8px' }}
                                />
                                {category.name} ({category.count})
                            </label>
                        ))}
                    </div>
                    <Button
                        isSmall
                        onClick={() => setAttributes({ selectedCategories: [] })}
                        style={{ marginTop: '10px' }}
                    >
                        {__('Clear All', 'adaire-blocks')}
                    </Button>
                </PanelBody>

                {/* Layout Settings */}
                <PanelBody section="layout" title={__('Layout Settings', 'adaire-blocks')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Layout Type', 'adaire-blocks')}</p>
                    <ButtonGroup style={{ marginBottom: '16px' }}>
                        {[
                            { label: __('Grid', 'adaire-blocks'), value: 'normal' },
                            { label: __('List', 'adaire-blocks'), value: 'list' }
                        ].map(opt => (
                            <Button
                                key={opt.value}
                                isPrimary={layoutType === opt.value}
                                isSecondary={layoutType !== opt.value}
                                onClick={() => setAttributes({ layoutType: opt.value })}
                            >{opt.label}</Button>
                        ))}
                    </ButtonGroup>

                    {layoutType !== 'list' && (
                        <RangeControl
                            label={__('Columns', 'adaire-blocks')}
                            value={columns}
                            onChange={(value) => setAttributes({ columns: value })}
                            min={1}
                            max={6}
                            step={1}
                            withInputField={true}
                            allowReset={true}
                            help={__('Number of columns for grid layout', 'adaire-blocks')}
                        />
                    )}

                    <PanelBody title={__('Slides Per View', 'adaire-blocks')} initialOpen={false}>
                        <DeviceSwitcher
                            deviceType={deviceType}
                            setDeviceType={setDeviceType}
                            tiers={THREE_TIERS}
                        />
                        <RangeControl
                            label={__('Slides Per View', 'adaire-blocks')}
                            value={slidesPerView?.[deviceType] ?? (deviceType === 'desktop' ? 4 : deviceType === 'tablet' ? 3 : 2)}
                            onChange={(value) => {
                                setAttributes({
                                    slidesPerView: {
                                        ...slidesPerView,
                                        [deviceType]: value
                                    }
                                });
                            }}
                            min={1}
                            max={6}
                            step={1}
                            withInputField={true}
                            allowReset={true}
                            help={__('Number of slides visible at once', 'adaire-blocks')}
                        />
                    </PanelBody>

                    <SelectControl
                            label={__('Text Alignment', 'adaire-blocks')}
                            value={textAlign}
                            options={[
                                { label: 'Left', value: 'left' },
                                { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' }
                            ]}
                            onChange={(value) => setAttributes({ textAlign: value })}
                        />
                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Card & Image Style', 'adaire-blocks')} initialOpen={false}>
                    <RangeControl
                        label={__('Card Gap', 'adaire-blocks')}
                        value={cardGap}
                        onChange={(value) => setAttributes({ cardGap: value })}
                        min={0}
                        max={60}
                        step={1}
                        withInputField={true}
                        allowReset={true}
                    />

                    <RangeControl
                        label={__('Card Border Radius', 'adaire-blocks')}
                        value={cardBorderRadius}
                        onChange={(value) => setAttributes({ cardBorderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                        withInputField={true}
                        allowReset={true}
                    />

                    <RangeControl
                        label={__('Filter Button Border Radius', 'adaire-blocks')}
                        value={filterBorderRadius}
                        onChange={(value) => setAttributes({ filterBorderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                        withInputField={true}
                        allowReset={true}
                    />

                    <RangeControl
                        label={__('Pagination Border Radius', 'adaire-blocks')}
                        value={paginationBorderRadius}
                        onChange={(value) => setAttributes({ paginationBorderRadius: value })}
                        min={0}
                        max={50}
                        step={1}
                        withInputField={true}
                        allowReset={true}
                    />

                    <RangeControl
                        label={__('Card Padding', 'adaire-blocks')}
                            value={cardPadding}
                            onChange={(value) => setAttributes({ cardPadding: value })}
                            min={0}
                            max={60}
                            step={1}
                            withInputField={true}
                            allowReset={true}
                        />

                    <RangeControl
                        label={__('Image Height', 'adaire-blocks')}
                            value={imageHeight}
                            onChange={(value) => setAttributes({ imageHeight: value })}
                            min={100}
                            max={400}
                            step={10}
                            withInputField={true}
                            allowReset={true}
                        />

                    <SelectControl
                        label={__('Image Fit', 'adaire-blocks')}
                            value={imageFit}
                            options={[
                                { label: 'Cover', value: 'cover' },
                                { label: 'Contain', value: 'contain' },
                                { label: 'Fill', value: 'fill' }
                            ]}
                            onChange={(value) => setAttributes({ imageFit: value })}
                        />
                </PanelBody>

                {/* Filtering Settings */}
                <PanelBody section="content" title={__('Filtering Settings', 'adaire-blocks')} initialOpen={false}>
                    <PanelRow>
                        <ToggleControl
                            label={__('Enable Category Filtering', 'adaire-blocks')}
                            checked={enableFiltering}
                            onChange={(value) => setAttributes({ enableFiltering: value })}
                        />
                    </PanelRow>

                </PanelBody>

                {/* Typography Settings */}
                <PanelBody section="style" priority="high" title={__('Typography Settings', 'adaire-blocks')} initialOpen={false}>
                    <TextControl
                        label={__('Title Font Size (px)', 'adaire-blocks')}
                        type="number"
                        value={titleFontSize}
                        onChange={(value) => setAttributes({ titleFontSize: parseInt(value) || 18 })}
                        min={12}
                        max={48}
                    />

                    <SelectControl
                        label={__('Title Font Weight', 'adaire-blocks')}
                        value={titleFontWeight}
                        options={[
                            { label: 'Normal', value: '400' },
                            { label: 'Medium', value: '500' },
                            { label: 'Semi Bold', value: '600' },
                            { label: 'Bold', value: '700' }
                        ]}
                        onChange={(value) => setAttributes({ titleFontWeight: value })}
                    />

                    <TextControl
                        label={__('Excerpt Font Size (px)', 'adaire-blocks')}
                        type="number"
                        value={excerptFontSize}
                        onChange={(value) => setAttributes({ excerptFontSize: parseInt(value) || 14 })}
                        min={10}
                        max={24}
                    />

                    <SelectControl
                        label={__('Excerpt Font Weight', 'adaire-blocks')}
                        value={excerptFontWeight}
                        options={[
                            { label: 'Normal', value: '400' },
                            { label: 'Medium', value: '500' },
                            { label: 'Semi Bold', value: '600' },
                            { label: 'Bold', value: '700' }
                        ]}
                        onChange={(value) => setAttributes({ excerptFontWeight: value })}
                    />

                    <TextControl
                        label={__('Meta Font Size (px)', 'adaire-blocks')}
                        type="number"
                        value={metaFontSize}
                        onChange={(value) => setAttributes({ metaFontSize: parseInt(value) || 12 })}
                        min={8}
                        max={20}
                    />

                    <SelectControl
                        label={__('Meta Font Weight', 'adaire-blocks')}
                        value={metaFontWeight}
                        options={[
                            { label: 'Normal', value: '400' },
                            { label: 'Medium', value: '500' },
                            { label: 'Semi Bold', value: '600' },
                            { label: 'Bold', value: '700' }
                        ]}
                        onChange={(value) => setAttributes({ metaFontWeight: value })}
                    />
                </PanelBody>

                {/* Color Settings */}
                <PanelColorSettings
                    section="style"
                    priority="high"
                    title={__('Color Settings', 'adaire-blocks')}
                    colorSettings={[
                        {
                            label: __('Title Color', 'adaire-blocks'),
                            value: titleColor,
                            onChange: (value) => setAttributes({ titleColor: value })
                        },
                        {
                            label: __('Excerpt Color', 'adaire-blocks'),
                            value: excerptColor,
                            onChange: (value) => setAttributes({ excerptColor: value })
                        },
                        {
                            label: __('Meta Color', 'adaire-blocks'),
                            value: metaColor,
                            onChange: (value) => setAttributes({ metaColor: value })
                        },
                        {
                            label: __('Category Color', 'adaire-blocks'),
                            value: categoryColor,
                            onChange: (value) => setAttributes({ categoryColor: value })
                        },
                        {
                            label: __('Category Background', 'adaire-blocks'),
                            value: categoryBackgroundColor,
                            onChange: (value) => setAttributes({ categoryBackgroundColor: value })
                        },
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
                    ]}
                />

                {/* Drag Cursor Settings */}
                <PanelBody section="style" priority="medium" title={__('Drag Cursor Settings', 'adaire-blocks')} initialOpen={false}>
                    <TextControl
                        label={__('Cursor Text', 'adaire-blocks')}
                        value={dragCursorText}
                        onChange={(value) => setAttributes({ dragCursorText: value })}
                        help={__('Text displayed in the drag cursor', 'adaire-blocks')}
                    />

                    <RangeControl
                        label={__('Cursor Size', 'adaire-blocks')}
                        value={dragCursorSize}
                        onChange={(value) => setAttributes({ dragCursorSize: value })}
                        min={40}
                        max={150}
                        step={1}
                        withInputField={true}
                        allowReset={true}
                    />

                    <RangeControl
                        label={__('Font Size', 'adaire-blocks')}
                        value={dragCursorFontSize}
                        onChange={(value) => setAttributes({ dragCursorFontSize: value })}
                        min={10}
                        max={32}
                        step={1}
                        withInputField={true}
                        allowReset={true}
                    />

                    <SelectControl
                        label={__('Font Weight', 'adaire-blocks')}
                        value={dragCursorFontWeight}
                        options={[
                            { label: 'Normal', value: '400' },
                            { label: 'Medium', value: '500' },
                            { label: 'Semi Bold', value: '600' },
                            { label: 'Bold', value: '700' }
                        ]}
                        onChange={(value) => setAttributes({ dragCursorFontWeight: value })}
                    />

                    <SelectControl
                        label={__('Text Transform', 'adaire-blocks')}
                        value={dragCursorTextTransform}
                        options={[
                            { label: 'Uppercase', value: 'uppercase' },
                            { label: 'Lowercase', value: 'lowercase' },
                            { label: 'Capitalize', value: 'capitalize' },
                            { label: 'None', value: 'none' }
                        ]}
                        onChange={(value) => setAttributes({ dragCursorTextTransform: value })}
                    />
                </PanelBody>

                {/* Animation Settings */}
                <PanelBody section="style" priority="medium" title={__('Animation Settings', 'adaire-blocks')} initialOpen={false}>
                    <PanelRow>
                        <ToggleControl
                            label={__('Enable Animations', 'adaire-blocks')}
                            checked={enableAnimations}
                            onChange={(value) => setAttributes({ enableAnimations: value })}
                        />
                    </PanelRow>

                    {enableAnimations && (
                        <>
                            <PanelRow>
                                <SelectControl
                                    label={__('Transition Animation', 'adaire-blocks')}
                                    value={transitionAnimation}
                                    options={[
                                        { label: __('Fade', 'adaire-blocks'), value: 'fade' },
                                        { label: __('Fade Up', 'adaire-blocks'), value: 'fadeUp' },
                                        { label: __('Fade Down', 'adaire-blocks'), value: 'fadeDown' },
                                        { label: __('Scale', 'adaire-blocks'), value: 'scale' },
                                        { label: __('Slide Left', 'adaire-blocks'), value: 'slideLeft' },
                                        { label: __('Slide Right', 'adaire-blocks'), value: 'slideRight' },
                                        { label: __('Flip', 'adaire-blocks'), value: 'flip' },
                                        { label: __('FLIP (Smart Position)', 'adaire-blocks'), value: 'flipPosition' }
                                    ]}
                                    onChange={(value) => setAttributes({ transitionAnimation: value })}
                                    help={__('Animation when switching pages or categories', 'adaire-blocks')}
                                />
                            </PanelRow>

                            <PanelRow>
                                <RangeControl
                                    label={__('Animation Duration', 'adaire-blocks')}
                                    value={animationDuration}
                                    onChange={(value) => setAttributes({ animationDuration: value })}
                                    min={0.1}
                                    max={2}
                                    step={0.1}
                                    withInputField={true}
                                    allowReset={true}
                                />
                            </PanelRow>

                            <PanelRow>
                                <RangeControl
                                    label={__('Animation Delay', 'adaire-blocks')}
                                    value={animationDelay}
                                    onChange={(value) => setAttributes({ animationDelay: value })}
                                    min={0}
                                    max={0.5}
                                    step={0.05}
                                    withInputField={true}
                                    allowReset={true}
                                />
                            </PanelRow>

                            <PanelRow>
                                <SelectControl
                                    label={__('Animation Ease', 'adaire-blocks')}
                                    value={animationEase}
                                    options={easeTypes}
                                    onChange={(value) => setAttributes({ animationEase: value })}
                                />
                            </PanelRow>

                            <PanelRow>
                                <ToggleControl
                                    label={__('Enable Hover Effects', 'adaire-blocks')}
                                    checked={enableHoverEffects}
                                    onChange={(value) => setAttributes({ enableHoverEffects: value })}
                                />
                            </PanelRow>

                            {enableHoverEffects && (
                                <>
                                    <PanelRow>
                                        <RangeControl
                                            label={__('Hover Scale', 'adaire-blocks')}
                                            value={hoverScale}
                                            onChange={(value) => setAttributes({ hoverScale: value })}
                                            min={1}
                                            max={1.2}
                                            step={0.05}
                                            withInputField={true}
                                            allowReset={true}
                                        />
                                    </PanelRow>

                                    <PanelRow>
                                        <ToggleControl
                                            label={__('Hover Shadow', 'adaire-blocks')}
                                            checked={hoverShadow}
                                            onChange={(value) => setAttributes({ hoverShadow: value })}
                                        />
                                    </PanelRow>
                                </>
                            )}
                        </>
                    )}
                </PanelBody>

                {/* Container Settings */}
                <PanelBody section="layout" title={__('Container Settings', 'adaire-blocks')} initialOpen={false}>
                    <ButtonGroup>
                        {[
                            { label: __('Full Width', 'adaire-blocks'), value: 'full' },
                            { label: __('Constrained', 'adaire-blocks'), value: 'constrained' }
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
                            <p style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 600 }}>{__('Max Width', 'adaire-blocks')}</p>
                            <DeviceSwitcher
                                deviceType={deviceType}
                                setDeviceType={setDeviceType}
                                tiers={THREE_TIERS}
                                onReset={() => resetToDefaults(['containerMaxWidth'])}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <TextControl
                                    type="number"
                                    value={containerMaxWidth?.[deviceType]?.value ?? (deviceType === 'desktop' ? 1200 : 100)}
                                    onChange={(v) => setAttributes({ 
                                        containerMaxWidth: { 
                                            ...(containerMaxWidth || {}), 
                                            [deviceType]: { 
                                                ...(containerMaxWidth?.[deviceType] || {}), 
                                                value: Number(v) 
                                            }
                                        } 
                                    })}
                                />
                                <ButtonGroup>
                                    {['px', '%', 'rem', 'vw'].map(u => (
                                        <Button
                                            key={u}
                                            isPrimary={(containerMaxWidth?.[deviceType]?.unit ?? (deviceType === 'desktop' ? 'px' : '%')) === u}
                                            isSecondary={(containerMaxWidth?.[deviceType]?.unit ?? (deviceType === 'desktop' ? 'px' : '%')) !== u}
                                            onClick={() => setAttributes({ 
                                                containerMaxWidth: { 
                                                    ...(containerMaxWidth || {}), 
                                                    [deviceType]: { 
                                                        ...(containerMaxWidth?.[deviceType] || {}), 
                                                        unit: u 
                                                    }
                                                } 
                                            })}
                                        >{u}</Button>
                                    ))}
                                </ButtonGroup>
                            </div>
                        </>
                    )}

                </PanelBody>

                <PanelBody section="style" priority="medium" title={__('Container Spacing', 'adaire-blocks')} initialOpen={false}>
                    <p style={{ marginBottom: '8px', fontWeight: 600 }}>{__('Margins', 'adaire-blocks')}</p>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={THREE_TIERS}
                        onReset={() => resetToDefaults(['marginTop', 'marginRight', 'marginBottom', 'marginLeft'])}
                    />
                    <BoxControl
                        values={{
                            top: marginTop?.[deviceType] ?? 0,
                            right: marginRight?.[deviceType] ?? 0,
                            bottom: marginBottom?.[deviceType] ?? 0,
                            left: marginLeft?.[deviceType] ?? 0
                        }}
                        onChange={(value) => setAttributes({
                            marginTop: { ...(marginTop || {}), [deviceType]: value.top || 0 },
                            marginRight: { ...(marginRight || {}), [deviceType]: value.right || 0 },
                            marginBottom: { ...(marginBottom || {}), [deviceType]: value.bottom || 0 },
                            marginLeft: { ...(marginLeft || {}), [deviceType]: value.left || 0 }
                        })}
                        units={[
                            { value: 'px', label: 'px' },
                            { value: 'em', label: 'em' },
                            { value: 'rem', label: 'rem' },
                            { value: '%', label: '%' }
                        ]}
                    />

                    <p style={{ marginTop: '24px', marginBottom: '8px', fontWeight: 600 }}>{__('Container Padding', 'adaire-blocks')}</p>
                    <DeviceSwitcher
                        deviceType={deviceType}
                        setDeviceType={setDeviceType}
                        tiers={THREE_TIERS}
                        onReset={() => resetToDefaults(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'])}
                    />
                    <BoxControl
                        values={{
                            top: paddingTop?.[deviceType] ?? 0,
                            right: paddingRight?.[deviceType] ?? 0,
                            bottom: paddingBottom?.[deviceType] ?? 0,
                            left: paddingLeft?.[deviceType] ?? 0
                        }}
                        onChange={(value) => setAttributes({
                            paddingTop: { ...(paddingTop || {}), [deviceType]: value.top || 0 },
                            paddingRight: { ...(paddingRight || {}), [deviceType]: value.right || 0 },
                            paddingBottom: { ...(paddingBottom || {}), [deviceType]: value.bottom || 0 },
                            paddingLeft: { ...(paddingLeft || {}), [deviceType]: value.left || 0 }
                        })}
                        units={[
                            { value: 'px', label: 'px' },
                            { value: 'em', label: 'em' },
                            { value: 'rem', label: 'rem' },
                            { value: '%', label: '%' }
                        ]}
                    />
                </PanelBody>
            </InspectorTabs>

            <div {...blockProps}>
                {showErrorNotice && (
                    <Notice status="warning" isDismissible={false} style={{marginBottom: '20px'}}>
                        {error}
                    </Notice>
                )}
                
                    <div className={`adaire-posts-carousel__container ${containerMode === 'constrained' ? 'is-constrained' : ''}`}>
                    {enableFiltering && filterPosition === 'top' && (
                        <div className="adaire-posts-carousel__filters">
                            <div className="adaire-posts-carousel__filter-list">
                                <button className="adaire-posts-carousel__filter-btn is-active">
                                    {__('All', 'adaire-blocks')}
                                </button>
                                {categories.slice(0, 5).map(category => (
                                    <button key={category.id} className="adaire-posts-carousel__filter-btn">
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <QuickZone
                        id="layout"
                        label={__('Layout', 'adaire-blocks')}
                        activeZone={activeZone}
                        setActiveZone={setActiveZone}
                        content={
                            <>
                                <RangeControl
                                    label={__('Slides Per View (Desktop)', 'adaire-blocks')}
                                    value={slidesPerView?.desktop ?? 4}
                                    onChange={(value) => setAttributes({ slidesPerView: { ...slidesPerView, desktop: value } })}
                                    min={1}
                                    max={6}
                                    step={1}
                                />
                                <RangeControl
                                    label={__('Card Gap', 'adaire-blocks')}
                                    value={cardGap}
                                    onChange={(value) => setAttributes({ cardGap: value })}
                                    min={0}
                                    max={60}
                                    step={1}
                                />
                            </>
                        }
                    >
                    <div className="adaire-posts-carousel__wrapper">
                        <div className="adaire-posts-carousel__track">
                        {(posts.length > 0 && !error) ? posts.slice(0, postsPerPage).map((post, index) => (
                            <div 
                                key={post.id} 
                                className="adaire-posts-carousel__slide"
                                onClick={() => window.open(post.link, '_blank')}
                                style={{ cursor: 'pointer' }}
                                title={`View: ${post.title.rendered}`}
                            >
                                <div className="adaire-posts-carousel__item">
                                    <div className="adaire-posts-carousel__image">
                                    {post.featured_media ? (
                                        <img
                                            src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder.jpg'}
                                            alt={post.title.rendered}
                                        />
                                    ) : (
                                            <div className="adaire-posts-carousel__image-placeholder">
                                                <span>{__('No Image', 'adaire-blocks')}</span>
                                        </div>
                                    )}
                                </div>
                                
                                    <div className="adaire-posts-carousel__content">
                                        <div className="adaire-posts-carousel__categories">
                                            <span className="adaire-posts-carousel__category-tag">
                                                {showCategories && post.categories && post.categories.length > 0 ? (() => {
                                                    const firstCategoryId = post.categories[0];
                                                    const category = categories.find(cat => cat.id === firstCategoryId);
                                                    return category ? category.name : 'ARTICLE';
                                                })() : 'ARTICLE'}
                                                            </span>
                                            </div>
                                        <h3 className="adaire-posts-carousel__title">
                                            {post.title.rendered}
                                        </h3>
                                            </div>
                                </div>
                            </div>
                        )) : (
                            // Demo preview shown before any real posts are available (e.g. on a
                            // fresh install). Uses varied sample copy and the block's real
                            // excerpt/meta fields so the inserter preview and first-insert state
                            // actually showcase what the block can do, instead of a bare
                            // "No Image" / "Sample Post Title" card repeated four times.
                            [
                                {
                                    category: __('Design', 'adaire-blocks'),
                                    title: __('5 Layout Trends Shaping Modern Websites', 'adaire-blocks'),
                                    excerpt: __('From bold typography to asymmetric grids, see the trends defining how websites look and feel this year.', 'adaire-blocks'),
                                    author: 'Jamie Lee',
                                    date: 'Jun 12, 2026',
                                    readTime: 4,
                                },
                                {
                                    category: __('Development', 'adaire-blocks'),
                                    title: __('A Practical Guide to Faster Page Loads', 'adaire-blocks'),
                                    excerpt: __('Simple, high-impact techniques for shaving seconds off your load time without a full rebuild.', 'adaire-blocks'),
                                    author: 'Priya Shah',
                                    date: 'Jun 5, 2026',
                                    readTime: 6,
                                },
                                {
                                    category: __('Marketing', 'adaire-blocks'),
                                    title: __('Turning Blog Traffic Into Newsletter Signups', 'adaire-blocks'),
                                    excerpt: __('The small on-page changes that make readers actually want to hear from you again.', 'adaire-blocks'),
                                    author: 'Marcus Webb',
                                    date: 'May 28, 2026',
                                    readTime: 5,
                                },
                                {
                                    category: __('Business', 'adaire-blocks'),
                                    title: __('What We Learned Shipping 100 Client Sites', 'adaire-blocks'),
                                    excerpt: __('The patterns that kept showing up, and the mistakes worth avoiding on your next project.', 'adaire-blocks'),
                                    author: 'Alicia Kim',
                                    date: 'May 19, 2026',
                                    readTime: 7,
                                },
                            ].slice(0, Math.max(1, Math.min(postsPerPage, 4))).map((demoPost, index) => (
                                <div
                                    key={`preview-${index}`}
                                    className="adaire-posts-carousel__slide"
                                    style={{ cursor: 'pointer' }}
                                    title={__('Demo content — your real posts will appear here once published', 'adaire-blocks')}
                                >
                                    <div className="adaire-posts-carousel__item">
                                        <div className="adaire-posts-carousel__image">
                                            <img src={DEMO_IMAGE_URL} alt={demoPost.title} />
                                    </div>
                                        <div className="adaire-posts-carousel__content">
                                            <div className="adaire-posts-carousel__categories">
                                                <span className="adaire-posts-carousel__category-tag">
                                                    {showCategories && categories.length > 0 ? categories[0].name : demoPost.category}
                                                </span>
                                            </div>
                                            <h3 className="adaire-posts-carousel__title">
                                                {demoPost.title}
                                        </h3>
                                            {showExcerpt && (
                                                <p className="adaire-posts-carousel__excerpt">
                                                    {demoPost.excerpt}
                                                </p>
                                            )}
                                            {(showDate || showAuthor || showReadTime) && (
                                                <div className="adaire-posts-carousel__meta">
                                                    {showDate && <span className="adaire-posts-carousel__date">{demoPost.date}</span>}
                                                    {showAuthor && <span className="adaire-posts-carousel__author">{demoPost.author}</span>}
                                                    {showReadTime && <span className="adaire-posts-carousel__read-time">{demoPost.readTime} min read</span>}
                                                </div>
                                            )}
                                            </div>
                                    </div>
                                </div>
                            ))
                        )}
                        </div>
                    </div>
                    </QuickZone>

                    {enableFiltering && filterPosition === 'bottom' && (
                        <div className="adaire-posts-carousel__filters">
                            <div className="adaire-posts-carousel__filter-list">
                                <button className="adaire-posts-carousel__filter-btn is-active">
                                    {__('All', 'adaire-blocks')}
                                </button>
                                {categories.slice(0, 5).map(category => (
                                    <button key={category.id} className="adaire-posts-carousel__filter-btn">
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {enablePagination && posts.length > postsPerPage && (
                        <div className="adaire-posts-carousel__pagination">
                            {paginationStyle === 'numbers' && (
                                <div className="adaire-posts-carousel__pagination-wrapper">
                                    <button className="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-prev is-disabled" disabled>
                                        <span>â† Previous</span>
                                    </button>
                                    <div className="adaire-posts-carousel__pagination-numbers">
                                        <button className="adaire-posts-carousel__pagination-number is-active">1</button>
                                        <button className="adaire-posts-carousel__pagination-number">2</button>
                                        <button className="adaire-posts-carousel__pagination-number">3</button>
                                    </div>
                                    <button className="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-next">
                                        <span>Next â†’</span>
                                    </button>
                                </div>
                            )}
                            {paginationStyle === 'loadmore' && (
                                <div className="adaire-posts-carousel__pagination-wrapper adaire-posts-carousel__pagination-wrapper--loadmore">
                                    <button className="adaire-posts-carousel__pagination-loadmore">
                                        {__('Load More', 'adaire-blocks')}
                                    </button>
                                </div>
                            )}
                            {paginationStyle === 'prevnext' && (
                                <div className="adaire-posts-carousel__pagination-wrapper adaire-posts-carousel__pagination-wrapper--prevnext">
                                    <button className="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-prev is-disabled" disabled>
                                        <span>â† Previous</span>
                                    </button>
                                    <span className="adaire-posts-carousel__pagination-info">
                                        {__('Page 1 of 3', 'adaire-blocks')}
                                    </span>
                                    <button className="adaire-posts-carousel__pagination-btn adaire-posts-carousel__pagination-next">
                                        <span>Next â†’</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Drag cursor preview in editor */}
                <div className="adaire-posts-carousel__drag-cursor adaire-posts-carousel__drag-cursor--preview">
                    {dragCursorText}
                </div>
            </div>
        </>
    );
};

export default Edit;



