import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck, ColorPalette,
} from "@wordpress/block-editor";
import {
	PanelBody,
	TextControl,
	ToggleControl,
	Button,
	BaseControl,
	ButtonGroup,
	SelectControl,
	RangeControl,
	__experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useCallback, useState } from "@wordpress/element";
import { Splide } from '@splidejs/splide';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import QuickZone from '../components/QuickZone';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute, THREE_TIERS } from '../components/DeviceSwitcher';
import InspectorTabs from '../components/InspectorTabs';
import BoundColorPalette from '../components/BoundColorPalette';

const FREE_TIER_ITEM_LIMIT = 3;

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
	{ label: '300', value: '300' },
	{ label: '400', value: '400' },
	{ label: '500', value: '500' },
	{ label: '600', value: '600' },
	{ label: '700', value: '700' },
	{ label: '800', value: '800' },
];

export default function Edit({ attributes, setAttributes }) {
	const [deviceType, setDeviceType] = useState('desktop');
	const [activeZone, setActiveZone] = useState(null);
	
	// Check block limits
	const { isLimitReached, showUpgradeNotice, upgradeMessage } = useBlockLimits(
		'testimonial-block', 
		attributes.testimonials || [], 
		'testimonial'
	);
	
	const {
		textColor,
		quoteColor,
		authorNameColor,
		authorTitleColor,
		scrollEffect,
		scrollEffectDuration,
		scrollEffectStagger,
		scrollEffectOnce,
		arrowColor,
		dotColor,
		fontSize,
		slidesPerView,
		spaceBetween,
		gap,
		logoSize,
		loop,
		navigation,
		pagination,
		scrollbar,
		blockId,
		testimonials,
		maxWidth,
		cardBackgroundColor,
		blockBackgroundColor,
		logoAlignment,
		containerMode,
		containerMaxWidth,
		cardWidth,
		slidesPerViewMobile,
		slidesPerViewTablet,
		slidesPerViewDesktop,
		cardGap,
		responsivePaddingTop,
		responsivePaddingBottom,
		headingFontSize,
		contentFontSize,
		quoteFontWeight,
		quoteLineHeight,
		quoteLetterSpacing,
		quoteTextTransform,
		authorNameFontWeight,
		authorNameLineHeight,
		authorNameLetterSpacing,
		authorNameTextTransform,
		authorTitleFontSize,
		authorTitleFontWeight,
		authorTitleLineHeight,
		authorTitleLetterSpacing,
		authorTitleTextTransform,
		companyNameFontSize,
		companyNameFontWeight,
		companyNameLineHeight,
		companyNameLetterSpacing,
		companyNameTextTransform,
		fontFamily,
	} = attributes;

	// Enforce Pro gate for scroll effect — belt-and-braces alongside the
	// disabled SelectControl below, matching the pattern used for
	// call-to-action-block's free-tier layout restriction.
	useEffect(() => {
		const blockConfig = window.adaireBlocksConfig?.blocks?.['testimonial-block'] || {};
		const isPremium = !!window.adaireBlocksConfig?.isPremium;
		const scrollEffectAllowed = isPremium || blockConfig.limits?.scrollEffect === true;

		if (!scrollEffectAllowed && scrollEffect && scrollEffect !== 'none') {
			setAttributes({ scrollEffect: 'none' });
		}
	}, [scrollEffect]);

	const splideRef = useRef(null);
	const splideInstanceRef = useRef(null);
	const updateTimeoutRef = useRef(null);
	// Cleanup for the editor-canvas resize listener set up below — see the
	// comment by `editorWindow` for why this can't just be `window.resize`.
	const editorResizeCleanupRef = useRef(null);

	const blockProps = useBlockProps({
		className: "ad-carousel-text-block",
		style: {
			color: textColor || "#000000",
			fontSize: `${fontSize || 16}px`,
			"--text-color": textColor || "#000000",
			// Independent color overrides for quote / author name / author title —
			// each falls back to the shared textColor (old single-control
			// behavior) so content saved before this split keeps its look.
			"--quote-color": quoteColor || textColor || "#333333",
			"--author-name-color": authorNameColor || textColor || "#333333",
			"--author-title-color": authorTitleColor || textColor || "#666666",
			"--font-size": `${fontSize || 16}px`,
			"--card-gap": `${gap || 30}px`,
			"--logo-size": `${logoSize || 60}px`,
			"--arrow-color": arrowColor,
			"--dot-color": dotColor,
			"--max-width": `${maxWidth || 1200}px`,
			"--card-bg-color": cardBackgroundColor || "#ffffff",
			"--logo-alignment": logoAlignment || "center",
			"--container-max-width": `${containerMaxWidth?.desktop?.value ?? containerMaxWidth?.value ?? 1200}${containerMaxWidth?.desktop?.unit ?? containerMaxWidth?.unit ?? 'px'}`,
			"--container-max-width-tablet": `${containerMaxWidth?.tablet?.value ?? 100}${containerMaxWidth?.tablet?.unit ?? '%'}`,
			"--container-max-width-mobile": `${containerMaxWidth?.mobile?.value ?? 100}${containerMaxWidth?.mobile?.unit ?? '%'}`,
			"--card-width-desktop": `${cardWidth?.desktop?.value ?? 100}${cardWidth?.desktop?.unit ?? '%'}`,
			"--card-width-tablet": `${cardWidth?.tablet?.value ?? 100}${cardWidth?.tablet?.unit ?? '%'}`,
			"--card-width-mobile": `${cardWidth?.mobile?.value ?? 100}${cardWidth?.mobile?.unit ?? '%'}`,
			"--card-gap-desktop": `${cardGap?.desktop?.value ?? 30}${cardGap?.desktop?.unit ?? 'px'}`,
			"--card-gap-tablet": `${cardGap?.tablet?.value ?? 20}${cardGap?.tablet?.unit ?? 'px'}`,
			"--card-gap-mobile": `${cardGap?.mobile?.value ?? 15}${cardGap?.mobile?.unit ?? 'px'}`,
			"--carousel-padding-top": `${responsivePaddingTop?.desktop ?? 60}px`,
			"--carousel-padding-top-tablet": `${responsivePaddingTop?.tablet ?? 48}px`,
			"--carousel-padding-top-mobile": `${responsivePaddingTop?.mobile ?? 36}px`,
			"--carousel-padding-bottom": `${responsivePaddingBottom?.desktop ?? 60}px`,
			"--carousel-padding-bottom-tablet": `${responsivePaddingBottom?.tablet ?? 48}px`,
			"--carousel-padding-bottom-mobile": `${responsivePaddingBottom?.mobile ?? 36}px`,
			// Independent heading (author name) / content (quote) typography
			// layers — see style.scss's &__name / &__quote, which consume
			// these directly (most-specific selector wins) instead of relying
			// on inheriting --font-size from the block root, which the old
			// hardcoded per-element font-size declarations always overrode
			// anyway.
			"--heading-font-size": `${headingFontSize?.desktop ?? 18}px`,
			"--heading-font-size-tablet": `${headingFontSize?.tablet ?? 18}px`,
			"--heading-font-size-mobile": `${headingFontSize?.mobile ?? 18}px`,
			"--content-font-size": `${contentFontSize?.desktop ?? 16}px`,
			"--content-font-size-tablet": `${contentFontSize?.tablet ?? 16}px`,
			"--content-font-size-mobile": `${contentFontSize?.mobile ?? 16}px`,
			// Quote (content) typography — font-weight/line-height are
			// responsive (4 breakpoints) to match contentFontSize's own
			// shape; letter-spacing/text-transform stay flat per convention.
			"--quote-font-weight": `${quoteFontWeight?.desktop ?? '400'}`,
			"--quote-font-weight-tablet": `${quoteFontWeight?.tablet ?? '400'}`,
			"--quote-font-weight-mobile": `${quoteFontWeight?.mobile ?? '400'}`,
			"--quote-line-height": `${quoteLineHeight?.desktop ?? '1.6'}`,
			"--quote-line-height-tablet": `${quoteLineHeight?.tablet ?? '1.6'}`,
			"--quote-line-height-mobile": `${quoteLineHeight?.mobile ?? '1.6'}`,
			"--quote-letter-spacing": quoteLetterSpacing || 'normal',
			"--quote-text-transform": quoteTextTransform || 'none',
			// Author name (heading) typography — font-weight/line-height are
			// responsive (4 breakpoints) to match headingFontSize's own shape.
			"--author-name-font-weight": `${authorNameFontWeight?.desktop ?? '700'}`,
			"--author-name-font-weight-tablet": `${authorNameFontWeight?.tablet ?? '700'}`,
			"--author-name-font-weight-mobile": `${authorNameFontWeight?.mobile ?? '700'}`,
			"--author-name-line-height": `${authorNameLineHeight?.desktop ?? '1.5'}`,
			"--author-name-line-height-tablet": `${authorNameLineHeight?.tablet ?? '1.5'}`,
			"--author-name-line-height-mobile": `${authorNameLineHeight?.mobile ?? '1.5'}`,
			"--author-name-letter-spacing": authorNameLetterSpacing || 'normal',
			"--author-name-text-transform": authorNameTextTransform || 'none',
			// Author title — no prior attribute/shape existed for this role,
			// so it stays flat (matching the block's other singular controls).
			"--author-title-font-size": authorTitleFontSize || '14px',
			"--author-title-font-weight": authorTitleFontWeight || '400',
			"--author-title-line-height": authorTitleLineHeight || '1.5',
			"--author-title-letter-spacing": authorTitleLetterSpacing || 'normal',
			"--author-title-text-transform": authorTitleTextTransform || 'none',
			// Company name (logo placeholder fallback) — flat, fallback-only role.
			"--company-name-font-size": companyNameFontSize || '18px',
			"--company-name-font-weight": companyNameFontWeight || '700',
			"--company-name-line-height": companyNameLineHeight || '1.5',
			"--company-name-letter-spacing": companyNameLetterSpacing || '1px',
			"--company-name-text-transform": companyNameTextTransform || 'none',
			"--testimonial-font-family": fontFamily || 'inherit',
			"--scroll-effect-duration": `${scrollEffectDuration ?? 700}ms`,
			...(blockBackgroundColor && { background: blockBackgroundColor })
		},
		// Scroll-trigger CSS keys off data-scroll-effect (see style.scss), but
		// there's no IntersectionObserver in the editor canvas to ever add
		// .is-in-view — omit the attribute here so cards stay visible while
		// editing; the saved/frontend markup (save.js) still carries it.
		'data-slides-per-view': slidesPerView || 3,
		'data-slides-per-view-mobile': slidesPerViewMobile || 1,
		'data-slides-per-view-tablet': slidesPerViewTablet || 2,
		'data-slides-per-view-desktop': slidesPerViewDesktop || 3,
		'data-space-between': spaceBetween || 50,
		'data-loop': loop ? 'true' : 'false',
		'data-navigation': navigation ? 'true' : 'false',
		'data-pagination': pagination ? 'true' : 'false',
		'data-scrollbar': scrollbar ? 'true' : 'false',
		'data-container-mode': containerMode || 'full',
		"data-slides": slidesPerView || 3,
		"data-arrowcolor": arrowColor || "#ff0000",
		id: blockId || undefined
	});

	// Initialize Splide in editor
	useEffect(() => {
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
		
		updateTimeoutRef.current = setTimeout(() => {
			if (splideRef.current && testimonials.length > 0) {
				// Get configuration from attributes
				const slidesPerViewValue = parseInt(slidesPerView) || 3;
				const spaceBetweenValue = parseInt(spaceBetween) || 50;
				const navigationValue = navigation;
				const paginationValue = pagination;
				const scrollbarValue = scrollbar;

				// Note: `loop` is intentionally NOT applied here — see the
				// comment on `type: 'slide'` below. The frontend (view.js)
				// still honors it independently via data-loop.

				// Check if we need to reinitialize or just update
				const needsReinit = !splideInstanceRef.current;

				if (needsReinit) {
					// Destroy existing instance if it exists
					if (splideInstanceRef.current) {
						splideInstanceRef.current.destroy();
						splideInstanceRef.current = null;
					}

					// Use requestAnimationFrame for smoother updates
					requestAnimationFrame(() => {
						try {
							if (!splideRef.current) {
								return;
							}

							// The block editor canvas is rendered inside its own
							// <iframe> (WP 5.9+), but this script itself executes in
							// the top-level wp-admin page's JS context — so the bare
							// global `window` here is the ADMIN page's window, not
							// the iframe's. `window.innerWidth`/`matchMedia` always
							// reflected the admin window's width, completely
							// unrelated to how wide the canvas/device-preview
							// actually is, so the editor's slide count never matched
							// what the card width CSS (which IS scoped correctly,
							// since plain CSS media queries run against whatever
							// document they're attached to) was doing — 3 desktop
							// slides got squeezed into a tablet/mobile-width canvas,
							// shrinking each card to a sliver.
							//
							// `ownerDocument.defaultView` resolves to the iframe's
							// own window for any node living inside it (same pattern
							// Splide's own source uses internally for instanceof
							// checks), so reading width from there instead fixes
							// both the initial perPage and, via the resize listener
							// below, keeps it correct if the canvas is resized (or
							// the device-preview toggle is changed) after mount.
							const editorWindow = splideRef.current.ownerDocument?.defaultView || window;

							// Determine current screen size and appropriate slides per view for editor
							const getCurrentSlidesPerView = () => {
								if (editorWindow.innerWidth >= 1024) {
									return slidesPerViewDesktop || 3;
								} else if (editorWindow.innerWidth >= 768) {
									return slidesPerViewTablet || 2;
								} else {
									return slidesPerViewMobile || 1;
								}
							};

							// Determine current gap based on screen size
							const getCurrentGap = () => {
								if (editorWindow.innerWidth >= 1024) {
									return cardGap?.desktop?.value ?? 30;
								} else if (editorWindow.innerWidth >= 768) {
									return cardGap?.tablet?.value ?? 20;
								} else {
									return cardGap?.mobile?.value ?? 15;
								}
							};

							const splideInstance = new Splide(splideRef.current, {
								// Always 'slide' here, never 'loop' — Splide's loop mode
								// works by physically cloning slide DOM nodes (for the
								// seamless wrap-around) and inserting those clones
								// alongside the real ones. Clones are raw cloneNode()
								// copies, so they carry none of React's event handlers.
								// Combined with focus: 'center', a clone frequently ends
								// up as the slide shown first/centered on mount — so its
								// QuickZone ("Company Logo" / "Quote & Author") buttons
								// look dead while every other (genuinely React-rendered)
								// slide works fine. The live frontend's own Splide
								// instance (view.js) reads `loop` independently from
								// data-loop and is unaffected by this — looping there is
								// safe since there's no React tree to break.
								type: 'slide',
								perPage: getCurrentSlidesPerView(),
								perMove: 1,
								gap: getCurrentGap(),
								padding: '0',
								// Mirror the frontend's interactivity in the editor canvas
								// itself, so the carousel can actually be previewed (and
								// the remaining slides reached/edited) here instead of only
								// on the published page. Arrows/pagination are plain click
								// handlers so they're safe here.
								//
								// Drag is deliberately left OFF in the editor though: the
								// block canvas lives inside WordPress's editor <iframe>, and
								// Splide's drag handling listens for mouseup on the
								// document — if a drag starts inside that iframe and the
								// mouse is released outside it (e.g. over the Inspector
								// sidebar, which lives in the parent document), that mouseup
								// never reaches Splide's listener. The drag never gets told
								// it ended, so it stays "active" and keeps hijacking
								// clicks/movement even once the cursor's well outside the
								// block. The live frontend has no such iframe boundary, so
								// drag stays enabled there.
								arrows: navigationValue,
								pagination: paginationValue,
								drag: false,
								focus: 'center',
								// `true` (the default) trims the empty space that
								// `focus: 'center'` would otherwise reserve before the
								// first slide / after the last one so they can sit
								// "centered" with nothing beside them. With `type: 'slide'`
								// (no loop clones to fill that space — see above) leaving
								// this `false` showed up as a literal blank gap to the left
								// of the first card.
								trimSpace: true,
								updateOnMove: true,
								resetProgress: false,
								speed: 600,
								easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
								// No `breakpoints` option here — Splide's internal
								// breakpoint engine also calls a bare `matchMedia`,
								// which resolves against the same wrong (admin-page)
								// window as the `window.innerWidth` checks above, so
								// it could never have self-corrected. perPage/gap are
								// instead kept in sync manually via the resize
								// listener below, scoped to the iframe's own window.
							});

							// Mount the Splide instance
							splideInstance.mount();
							splideInstanceRef.current = splideInstance;

							// Keep perPage/gap correct if the canvas is resized after
							// mount — e.g. the Desktop/Tablet/Mobile preview toggle,
							// opening/closing the Inspector sidebar, or an actual
							// window resize. Listening on `editorWindow` (the
							// iframe's own window) rather than the admin page's
							// `window` is what makes this fire for those cases.
							let resizeTimeout;
							const handleEditorResize = () => {
								clearTimeout(resizeTimeout);
								resizeTimeout = setTimeout(() => {
									if (splideInstanceRef.current) {
										splideInstanceRef.current.options.perPage = getCurrentSlidesPerView();
										splideInstanceRef.current.options.gap = getCurrentGap();
										splideInstanceRef.current.refresh();
									}
								}, 250);
							};
							editorWindow.addEventListener('resize', handleEditorResize);
							editorResizeCleanupRef.current = () => {
								clearTimeout(resizeTimeout);
								editorWindow.removeEventListener('resize', handleEditorResize);
							};

						} catch (error) {
							console.error('Error creating Splide in editor:', error);
						}
					});
				}
			}
		}, 150); // 150ms debounce

		// Cleanup function
		return () => {
			if (updateTimeoutRef.current) {
				clearTimeout(updateTimeoutRef.current);
			}
			if (editorResizeCleanupRef.current) {
				editorResizeCleanupRef.current();
				editorResizeCleanupRef.current = null;
			}
			if (splideInstanceRef.current) {
				splideInstanceRef.current.destroy();
				splideInstanceRef.current = null;
			}
		};
	// `testimonials.length` (not `testimonials` itself) is intentional — Splide
	// only needs to reinitialize when a slide is added/removed. The slide DOM
	// nodes are ordinary React children of `splideRef` (type: 'slide', not
	// 'loop', so Splide never clones them away from React's control — see the
	// comment on `type: 'slide'` below), so editing a testimonial's text just
	// re-renders content inside the already-mounted carousel. Depending on the
	// full `testimonials` array here meant every keystroke in any card field
	// replaced the array reference, destroying and rebuilding the whole Splide
	// instance mid-edit — visible as the carousel losing its multi-card layout
	// and collapsing to a stacked single column for a moment before Splide
	// remounted, i.e. the block appearing to "switch between list and grid".
	}, [testimonials.length, slidesPerView, spaceBetween, loop, navigation, pagination, scrollbar, arrowColor, dotColor, slidesPerViewMobile, slidesPerViewTablet, slidesPerViewDesktop]);

	// Testimonial management functions
	const updateTestimonial = (index, field, value) => {
		const updatedTestimonials = [...testimonials];
		updatedTestimonials[index] = {
			...updatedTestimonials[index],
			[field]: value,
		};
		setAttributes({ testimonials: updatedTestimonials });
	};

	const addTestimonial = () => {
		if (isLimitReached) {
			return; // Don't add if limit reached
		}
		const newTestimonial = {
			companyName: "New Company",
			companyLogo: "",
			quote: "Enter your testimonial quote here...",
			authorName: "Author Name",
			authorTitle: "Author Title",
		};
		setAttributes({ testimonials: [...testimonials, newTestimonial] });
	};

	const removeTestimonial = (index) => {
		const updatedTestimonials = testimonials.filter((_, i) => i !== index);
		setAttributes({ testimonials: updatedTestimonials });
	};

	return (
		<>
			<InspectorTabs attributes={ attributes } setAttributes={ setAttributes }>
				<PanelBody section="layout" title="Container Settings" initialOpen={true}>
					<ButtonGroup>
						{[
							{ label: __('Full width', 'adaire-blocks'), value: 'full' },
							{ label: __('Constrained', 'adaire-blocks'), value: 'constrained' },
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
							<DeviceSwitcher
								deviceType={deviceType}
								setDeviceType={setDeviceType}
								label={__('Max Width', 'adaire-blocks')}
								tiers={THREE_TIERS}
							/>
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
									{['px', '%', 'rem', 'vw'].map((u) => (
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
										>
											{u}
										</Button>
									))}
								</ButtonGroup>
							</div>
						</>
					)}
				</PanelBody>

				<PanelBody section="layout" title="Carousel Settings" initialOpen={true}>
					<TextControl
						label="Slides Per View"
						value={slidesPerView}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ slidesPerView: num });
							}
						}}
						min={1}
						max={5}
					/>

					<hr style={{ margin: '20px 0' }} />
					<p style={{ fontWeight: 600, marginBottom: '12px' }}>
						{__('Responsive Slides Per View', 'adaire-blocks')}
					</p>

					<TextControl
						label={__('Mobile (< 768px)', 'adaire-blocks')}
						value={slidesPerViewMobile}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ slidesPerViewMobile: num });
							}
						}}
						min={1}
						max={5}
						help={__('Number of slides visible on mobile devices', 'adaire-blocks')}
					/>

					<TextControl
						label={__('Tablet (768px - 1024px)', 'adaire-blocks')}
						value={slidesPerViewTablet}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ slidesPerViewTablet: num });
							}
						}}
						min={1}
						max={5}
						help={__('Number of slides visible on tablet devices', 'adaire-blocks')}
					/>

					<TextControl
						label={__('Desktop (> 1024px)', 'adaire-blocks')}
						value={slidesPerViewDesktop}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ slidesPerViewDesktop: num });
							}
						}}
						min={1}
						max={5}
						help={__('Number of slides visible on desktop devices', 'adaire-blocks')}
					/>

					<TextControl
						label="Space Between Slides (px)"
						value={spaceBetween}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ spaceBetween: num });
							}
						}}
						min={0}
						max={200}
					/>

					<TextControl
						label="Card Gap (px)"
						value={gap}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ gap: num });
							}
						}}
						min={0}
						max={100}
					/>

					<ToggleControl
						label="Enable Loop"
						checked={loop}
						onChange={(value) => setAttributes({ loop: value })}
						help={
							loop
								? "Carousel will loop continuously"
								: "Carousel will stop at the end"
						}
					/>

					<ToggleControl
						label="Show Navigation Arrows"
						checked={navigation}
						onChange={(value) => setAttributes({ navigation: value })}
						help={
							navigation
								? "Navigation arrows will be visible"
								: "Navigation arrows will be hidden"
						}
					/>
					{/* <BoundColorPalette
						value={textColor}
						onChange={(v) => setAttributes({ textColor: v || "" })}
					/> */}

					<BaseControl label="Arrow Color">
						<BoundColorPalette
							value={arrowColor}
							label="Arrow Color"
							onChange={(v) => setAttributes({ arrowColor: v || '' })}
						/>
					</BaseControl>
					<BaseControl label="Dot Color">
						<BoundColorPalette
							value={dotColor}
							label="Dot Color"
							onChange={(v) => setAttributes({ dotColor: v || '' })}
						/>
					</BaseControl>

					<ToggleControl
						label="Show Pagination Dots"
						checked={pagination}
						onChange={(value) => setAttributes({ pagination: value })}
						help={
							pagination
								? "Pagination dots will be visible"
								: "Pagination dots will be hidden"
						}
					/>

					<ToggleControl
						label="Show Scrollbar"
						checked={scrollbar}
						onChange={(value) => setAttributes({ scrollbar: value })}
						help={
							scrollbar
								? "Scrollbar will be visible"
								: "Scrollbar will be hidden"
						}
					/>

					<TextControl
						label="Max Width (px)"
						value={maxWidth}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ maxWidth: num });
							}
						}}
						min={300}
						max={2000}
						help="Maximum width of the carousel container"
					/>
				</PanelBody>

				<PanelBody section="layout" title="Card Width Settings" initialOpen={false}>
					<p style={{ marginBottom: '16px', color: '#666' }}>
						{__('Control the width of individual testimonial cards at different screen sizes', 'adaire-blocks')}
					</p>
					
					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Desktop Card Width', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
						<TextControl
							type="number"
							value={cardWidth?.desktop?.value ?? 100}
							onChange={(v) =>
								setAttributes({
									cardWidth: {
										...(cardWidth || {}),
										desktop: {
											...(cardWidth?.desktop || {}),
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
									isPrimary={(cardWidth?.desktop?.unit ?? '%') === u}
									isSecondary={(cardWidth?.desktop?.unit ?? '%') !== u}
									onClick={() =>
										setAttributes({
											cardWidth: {
												...(cardWidth || {}),
												desktop: {
													...(cardWidth?.desktop || {}),
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

					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Tablet Card Width', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
						<TextControl
							type="number"
							value={cardWidth?.tablet?.value ?? 100}
							onChange={(v) =>
								setAttributes({
									cardWidth: {
										...(cardWidth || {}),
										tablet: {
											...(cardWidth?.tablet || {}),
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
									isPrimary={(cardWidth?.tablet?.unit ?? '%') === u}
									isSecondary={(cardWidth?.tablet?.unit ?? '%') !== u}
									onClick={() =>
										setAttributes({
											cardWidth: {
												...(cardWidth || {}),
												tablet: {
													...(cardWidth?.tablet || {}),
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

					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Mobile Card Width', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', gap: '8px' }}>
						<TextControl
							type="number"
							value={cardWidth?.mobile?.value ?? 100}
							onChange={(v) =>
								setAttributes({
									cardWidth: {
										...(cardWidth || {}),
										mobile: {
											...(cardWidth?.mobile || {}),
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
									isPrimary={(cardWidth?.mobile?.unit ?? '%') === u}
									isSecondary={(cardWidth?.mobile?.unit ?? '%') !== u}
									onClick={() =>
										setAttributes({
											cardWidth: {
												...(cardWidth || {}),
												mobile: {
													...(cardWidth?.mobile || {}),
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

					<p style={{ marginTop: '16px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
						{__('ðŸ’¡ Tip: Use 100% for full-width cards on mobile, or adjust to create partial views', 'adaire-blocks')}
					</p>
				</PanelBody>

				<PanelBody section="layout" title="Card Gap Settings" initialOpen={false}>
					<p style={{ marginBottom: '16px', color: '#666' }}>
						{__('Control the spacing between testimonial cards at different screen sizes', 'adaire-blocks')}
					</p>
					
					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Desktop Card Gap', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
						<TextControl
							type="number"
							value={cardGap?.desktop?.value ?? 30}
							onChange={(v) =>
								setAttributes({
									cardGap: {
										...(cardGap || {}),
										desktop: {
											...(cardGap?.desktop || {}),
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
									isPrimary={(cardGap?.desktop?.unit ?? 'px') === u}
									isSecondary={(cardGap?.desktop?.unit ?? 'px') !== u}
									onClick={() =>
										setAttributes({
											cardGap: {
												...(cardGap || {}),
												desktop: {
													...(cardGap?.desktop || {}),
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

					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Tablet Card Gap', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
						<TextControl
							type="number"
							value={cardGap?.tablet?.value ?? 20}
							onChange={(v) =>
								setAttributes({
									cardGap: {
										...(cardGap || {}),
										tablet: {
											...(cardGap?.tablet || {}),
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
									isPrimary={(cardGap?.tablet?.unit ?? 'px') === u}
									isSecondary={(cardGap?.tablet?.unit ?? 'px') !== u}
									onClick={() =>
										setAttributes({
											cardGap: {
												...(cardGap || {}),
												tablet: {
													...(cardGap?.tablet || {}),
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

					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Mobile Card Gap', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', gap: '8px' }}>
						<TextControl
							type="number"
							value={cardGap?.mobile?.value ?? 15}
							onChange={(v) =>
								setAttributes({
									cardGap: {
										...(cardGap || {}),
										mobile: {
											...(cardGap?.mobile || {}),
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
									isPrimary={(cardGap?.mobile?.unit ?? 'px') === u}
									isSecondary={(cardGap?.mobile?.unit ?? 'px') !== u}
									onClick={() =>
										setAttributes({
											cardGap: {
												...(cardGap || {}),
												mobile: {
													...(cardGap?.mobile || {}),
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

					<p style={{ marginTop: '16px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
						{__('ðŸ’¡ Tip: Smaller gaps on mobile create a more compact layout', 'adaire-blocks')}
					</p>
				</PanelBody>

				<PanelBody section="content" title="Testimonials" initialOpen={true}>
					{(testimonials || []).map((testimonial, index) => (
						<div
							key={index}
							style={{
								marginBottom: "20px",
								padding: "15px",
								border: "1px solid #ddd",
								borderRadius: "5px",
							}}
						>
							<h4 style={{ margin: "0 0 10px 0" }}>Testimonial {index + 1}</h4>

							<TextControl
								label="Company Name"
								value={testimonial.companyName}
								onChange={(value) =>
									updateTestimonial(index, "companyName", value)
								}
							/>

							<div style={{ marginBottom: "10px" }}>
								<label
									style={{
										display: "block",
										marginBottom: "5px",
										fontWeight: "bold",
									}}
								>
									Company Logo
								</label>
								<MediaUploadCheck>
									<MediaUpload
										onSelect={(media) =>
											updateTestimonial(index, "companyLogo", media.url)
										}
										allowedTypes={["image"]}
										value={testimonial.companyLogo}
										render={({ open }) => (
											<div>
												{testimonial.companyLogo ? (
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: "10px",
														}}
													>
														<img
															src={testimonial.companyLogo}
															alt="Company Logo"
															style={{
																width: "60px",
																height: "40px",
																objectFit: "contain",
																border: "1px solid #ddd",
																borderRadius: "4px",
															}}
														/>
														<Button onClick={open} isSecondary isSmall>
															Change Logo
														</Button>
														<Button
															onClick={() =>
																updateTestimonial(index, "companyLogo", "")
															}
															isDestructive
															isSmall
														>
															Remove
														</Button>
													</div>
												) : (
													<Button onClick={open} isPrimary isSmall>
														Upload Logo
													</Button>
												)}
											</div>
										)}
									/>
								</MediaUploadCheck>
							</div>

							<TextControl
								label="Quote"
								value={testimonial.quote}
								onChange={(value) => updateTestimonial(index, "quote", value)}
								multiline
								rows={3}
							/>

							<TextControl
								label="Author Name"
								value={testimonial.authorName}
								onChange={(value) =>
									updateTestimonial(index, "authorName", value)
								}
							/>

							<TextControl
								label="Author Title"
								value={testimonial.authorTitle}
								onChange={(value) =>
									updateTestimonial(index, "authorTitle", value)
								}
							/>

							<Button
								isDestructive
								isSmall
								onClick={() => removeTestimonial(index)}
								style={{ marginTop: "10px" }}
							>
								Remove Testimonial
							</Button>
						</div>
					))}

					<Button
						isPrimary
						onClick={addTestimonial}
						style={{ marginTop: "10px" }}
						disabled={ isLimitReached }
					>
						Add New Testimonial
					</Button>
					{ showUpgradeNotice && (
						<UpgradeNotice
							variant="inline"
							itemType="testimonial"
							message={upgradeMessage}
						/>
					) }

					<TextControl
						label="Block ID"
						value={blockId}
						onChange={(value) => setAttributes({ blockId: value })}
						help="Add a custom ID to this block for CSS targeting or anchor links."
					/>
				</PanelBody>

				<PanelBody section="layout" title="Logo Settings" initialOpen={false}>
					<SelectControl
						label="Logo Alignment"
						value={logoAlignment}
						options={[
							{ label: 'Left', value: 'flex-start' },
							{ label: 'Center', value: 'center' },
							{ label: 'Right', value: 'flex-end' },
						]}
						onChange={(value) => setAttributes({ logoAlignment: value })}
					/>
					
					<TextControl
						label="Logo Size (px)"
						value={logoSize}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ logoSize: num });
							}
						}}
						min={20}
						max={1000}
					/>
				</PanelBody>

				<PanelBody section="style" priority="high" title="Color Settings" initialOpen={false}>
					<BaseControl label="Quote (Description) Color" help="Color for the review/quote text only">
						<BoundColorPalette
							value={quoteColor || textColor}
							onChange={(v) => setAttributes({ quoteColor: v || "" })}
						/>
					</BaseControl>

					<BaseControl label="Author Name Color" help="Color for the author's name only">
						<BoundColorPalette
							value={authorNameColor || textColor}
							onChange={(v) => setAttributes({ authorNameColor: v || "" })}
						/>
					</BaseControl>

					<BaseControl label="Author Title Color" help="Color for the author's title/position only">
						<BoundColorPalette
							value={authorTitleColor || textColor}
							onChange={(v) => setAttributes({ authorTitleColor: v || "" })}
						/>
					</BaseControl>

					<BaseControl label="Card Background Color" help="Background color for testimonial cards">
						<BoundColorPalette
							value={cardBackgroundColor}
							onChange={(v) => setAttributes({ cardBackgroundColor: v || "" })}
						/>
					</BaseControl>

					<BaseControl label="Block Background Color" help="Background color for the entire testimonial block section">
						<BoundColorPalette
							value={blockBackgroundColor || "#ffffff"}
							onChange={(v) => setAttributes({ blockBackgroundColor: v || "" })}
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody section="style" priority="high" title={__('Typography', 'adaire-blocks')} initialOpen={false}>
					<p style={{ marginBottom: '16px', color: '#666' }}>
						{__('Heading and content text now have independent font-size controls, per device.', 'adaire-blocks')}
					</p>

					<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Device')} tiers={THREE_TIERS} />

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '0' }}>
						{__('Heading Font Size', 'adaire-blocks')}
					</p>
					<p style={{ marginTop: '2px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
						{__('Author name', 'adaire-blocks')}
					</p>
					<RangeControl
						value={getDeviceValue(headingFontSize, deviceType, 18)}
						onChange={(v) => setAttributes({ headingFontSize: updateDeviceAttribute(headingFontSize, deviceType, v) })}
						min={10}
						max={48}
					/>

					<p style={{ fontWeight: 600, marginTop: '16px', marginBottom: '0' }}>
						{__('Content Font Size', 'adaire-blocks')}
					</p>
					<p style={{ marginTop: '2px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
						{__('Quote text', 'adaire-blocks')}
					</p>
					<RangeControl
						value={getDeviceValue(contentFontSize, deviceType, 16)}
						onChange={(v) => setAttributes({ contentFontSize: updateDeviceAttribute(contentFontSize, deviceType, v) })}
						min={10}
						max={36}
					/>

					<hr style={{ margin: '20px 0' }} />
					<p style={{ fontWeight: 600, marginBottom: '12px' }}>{__('Quote', 'adaire-blocks')}</p>
					<SelectControl
						label={__('Font Weight', 'adaire-blocks')}
						value={getDeviceValue(quoteFontWeight, deviceType, '400')}
						options={FONT_WEIGHT_OPTIONS}
						onChange={(v) => setAttributes({ quoteFontWeight: updateDeviceAttribute(quoteFontWeight, deviceType, v) })}
					/>
					<UnitControl
						label={__('Line Height', 'adaire-blocks')}
						value={getDeviceValue(quoteLineHeight, deviceType, '1.6')}
						onChange={(v) => setAttributes({ quoteLineHeight: updateDeviceAttribute(quoteLineHeight, deviceType, v) })}
					/>
					<UnitControl
						label={__('Letter Spacing', 'adaire-blocks')}
						value={quoteLetterSpacing}
						onChange={(v) => setAttributes({ quoteLetterSpacing: v })}
					/>
					<SelectControl
						label={__('Text Transform', 'adaire-blocks')}
						value={quoteTextTransform}
						options={TEXT_TRANSFORM_OPTIONS}
						onChange={(v) => setAttributes({ quoteTextTransform: v })}
					/>

					<hr style={{ margin: '20px 0' }} />
					<p style={{ fontWeight: 600, marginBottom: '12px' }}>{__('Author Name', 'adaire-blocks')}</p>
					<SelectControl
						label={__('Font Weight', 'adaire-blocks')}
						value={getDeviceValue(authorNameFontWeight, deviceType, '700')}
						options={FONT_WEIGHT_OPTIONS}
						onChange={(v) => setAttributes({ authorNameFontWeight: updateDeviceAttribute(authorNameFontWeight, deviceType, v) })}
					/>
					<UnitControl
						label={__('Line Height', 'adaire-blocks')}
						value={getDeviceValue(authorNameLineHeight, deviceType, '1.5')}
						onChange={(v) => setAttributes({ authorNameLineHeight: updateDeviceAttribute(authorNameLineHeight, deviceType, v) })}
					/>
					<UnitControl
						label={__('Letter Spacing', 'adaire-blocks')}
						value={authorNameLetterSpacing}
						onChange={(v) => setAttributes({ authorNameLetterSpacing: v })}
					/>
					<SelectControl
						label={__('Text Transform', 'adaire-blocks')}
						value={authorNameTextTransform}
						options={TEXT_TRANSFORM_OPTIONS}
						onChange={(v) => setAttributes({ authorNameTextTransform: v })}
					/>

					<hr style={{ margin: '20px 0' }} />
					<p style={{ fontWeight: 600, marginBottom: '12px' }}>{__('Author Title', 'adaire-blocks')}</p>
					<UnitControl
						label={__('Font Size', 'adaire-blocks')}
						value={authorTitleFontSize}
						onChange={(v) => setAttributes({ authorTitleFontSize: v })}
					/>
					<SelectControl
						label={__('Font Weight', 'adaire-blocks')}
						value={authorTitleFontWeight}
						options={FONT_WEIGHT_OPTIONS}
						onChange={(v) => setAttributes({ authorTitleFontWeight: v })}
					/>
					<UnitControl
						label={__('Line Height', 'adaire-blocks')}
						value={authorTitleLineHeight}
						onChange={(v) => setAttributes({ authorTitleLineHeight: v })}
					/>
					<UnitControl
						label={__('Letter Spacing', 'adaire-blocks')}
						value={authorTitleLetterSpacing}
						onChange={(v) => setAttributes({ authorTitleLetterSpacing: v })}
					/>
					<SelectControl
						label={__('Text Transform', 'adaire-blocks')}
						value={authorTitleTextTransform}
						options={TEXT_TRANSFORM_OPTIONS}
						onChange={(v) => setAttributes({ authorTitleTextTransform: v })}
					/>

					<hr style={{ margin: '20px 0' }} />
					<p style={{ fontWeight: 600, marginBottom: '12px' }}>{__('Company Name', 'adaire-blocks')}</p>
					<p style={{ marginTop: '-8px', marginBottom: '8px', fontSize: '12px', color: '#666' }}>
						{__('Used as a text fallback when no company logo is uploaded.', 'adaire-blocks')}
					</p>
					<UnitControl
						label={__('Font Size', 'adaire-blocks')}
						value={companyNameFontSize}
						onChange={(v) => setAttributes({ companyNameFontSize: v })}
					/>
					<SelectControl
						label={__('Font Weight', 'adaire-blocks')}
						value={companyNameFontWeight}
						options={FONT_WEIGHT_OPTIONS}
						onChange={(v) => setAttributes({ companyNameFontWeight: v })}
					/>
					<UnitControl
						label={__('Line Height', 'adaire-blocks')}
						value={companyNameLineHeight}
						onChange={(v) => setAttributes({ companyNameLineHeight: v })}
					/>
					<UnitControl
						label={__('Letter Spacing', 'adaire-blocks')}
						value={companyNameLetterSpacing}
						onChange={(v) => setAttributes({ companyNameLetterSpacing: v })}
					/>
					<SelectControl
						label={__('Text Transform', 'adaire-blocks')}
						value={companyNameTextTransform}
						options={TEXT_TRANSFORM_OPTIONS}
						onChange={(v) => setAttributes({ companyNameTextTransform: v })}
					/>

					<hr style={{ margin: '20px 0' }} />
					<p style={{ fontWeight: 600, marginBottom: '12px' }}>{__('Block', 'adaire-blocks')}</p>
					<SelectControl
						label={__('Font Family', 'adaire-blocks')}
						value={fontFamily || ''}
						options={FONT_FAMILY_OPTIONS}
						onChange={(v) => setAttributes({ fontFamily: v })}
						help={__('Applies to all text in this block.', 'adaire-blocks')}
					/>
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Scroll Effect', 'adaire-blocks')} initialOpen={false}>
					{(() => {
						const blockConfig = window.adaireBlocksConfig?.blocks?.['testimonial-block'] || {};
						const blockLimits = blockConfig.limits || {};
						const isPremium = !!window.adaireBlocksConfig?.isPremium;
						const scrollEffectAllowed = isPremium || blockLimits.scrollEffect === true;
						const upgradeMessage = blockConfig.scrollEffectUpgradeMessage || __('Upgrade to Pro to reveal review cards with a scroll-triggered styling effect.', 'adaire-blocks');

						return (
							<>
								<SelectControl
									label={__('Effect', 'adaire-blocks') + (scrollEffectAllowed ? '' : ' (Pro)')}
									value={scrollEffect || 'none'}
									options={[
										{ label: __('None', 'adaire-blocks'), value: 'none' },
										{ label: __('Fade Up', 'adaire-blocks'), value: 'fade-up' },
										{ label: __('Scale In', 'adaire-blocks'), value: 'scale-in' },
										{ label: __('Blur In', 'adaire-blocks'), value: 'blur-in' },
										{ label: __('Tilt In', 'adaire-blocks'), value: 'tilt-in' },
									]}
									disabled={!scrollEffectAllowed}
									onChange={(v) => setAttributes({ scrollEffect: v })}
									help={!scrollEffectAllowed ? upgradeMessage : __('Cards animate into view as visitors scroll to them.', 'adaire-blocks')}
								/>

								{scrollEffectAllowed && scrollEffect && scrollEffect !== 'none' && (
									<>
										<RangeControl
											label={__('Duration (ms)', 'adaire-blocks')}
											value={scrollEffectDuration ?? 700}
											onChange={(v) => setAttributes({ scrollEffectDuration: v })}
											min={100}
											max={2000}
											step={50}
										/>
										<RangeControl
											label={__('Stagger between cards (ms)', 'adaire-blocks')}
											value={scrollEffectStagger ?? 120}
											onChange={(v) => setAttributes({ scrollEffectStagger: v })}
											min={0}
											max={500}
											step={10}
										/>
										<ToggleControl
											label={__('Play once', 'adaire-blocks')}
											help={__('When off, cards replay the effect every time they re-enter the viewport.', 'adaire-blocks')}
											checked={scrollEffectOnce !== false}
											onChange={(v) => setAttributes({ scrollEffectOnce: v })}
										/>
									</>
								)}

								{!scrollEffectAllowed && (
									<UpgradeNotice
										variant="inline"
										itemType="scroll effect"
										message={upgradeMessage}
									/>
								)}
							</>
						);
					})()}
				</PanelBody>

				<PanelBody section="style" priority="medium" title={__('Spacing', 'adaire-blocks')} initialOpen={false}>
					<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Device')} tiers={THREE_TIERS} />
					<RangeControl
						label={__('Padding top (px)', 'adaire-blocks')}
						value={getDeviceValue(responsivePaddingTop, deviceType, deviceType === 'desktop' ? 60 : deviceType === 'tablet' ? 48 : deviceType === 'mobile' ? 36 : 24)}
						onChange={(v) => setAttributes({ responsivePaddingTop: updateDeviceAttribute(responsivePaddingTop, deviceType, v) })}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__('Padding bottom (px)', 'adaire-blocks')}
						value={getDeviceValue(responsivePaddingBottom, deviceType, deviceType === 'desktop' ? 60 : deviceType === 'tablet' ? 48 : deviceType === 'mobile' ? 36 : 24)}
						onChange={(v) => setAttributes({ responsivePaddingBottom: updateDeviceAttribute(responsivePaddingBottom, deviceType, v) })}
						min={0}
						max={200}
					/>
				</PanelBody>
			</InspectorTabs>

			<div {...blockProps}>
				<div className="ad-carousel-text-block__testimonial-carousel">
					<div 
						className="splide" 
						ref={splideRef}
					>
						<div className="splide__track">
							<div className="splide__list">
								{(testimonials || []).map((testimonial, index) => (
									<div key={index} className="splide__slide">
													<div 
														className="ad-carousel-text-block__testimonial-card"
														style={{
															"--logo-size": `${logoSize || 60}px`,
														}}
													>
														<QuickZone
															id={`testimonial-logo-${index}`}
															label="Company Logo"
															activeZone={activeZone}
															setActiveZone={setActiveZone}
															content={
																<>
																	<TextControl
																		label="Company Name"
																		value={testimonial.companyName}
																		onChange={(value) => updateTestimonial(index, 'companyName', value)}
																	/>
																	<MediaUploadCheck>
																		<MediaUpload
																			onSelect={(media) => updateTestimonial(index, 'companyLogo', media.url)}
																			allowedTypes={['image']}
																			render={({ open }) => (
																				<Button onClick={open} variant="secondary" style={{ width: '100%' }}>
																					{testimonial.companyLogo ? 'Replace Logo' : 'Upload Logo'}
																				</Button>
																			)}
																		/>
																	</MediaUploadCheck>
																</>
															}
														>
														<div className="ad-carousel-text-block__company-logo">
												{testimonial.companyLogo ? (
													<>
													<img
														src={testimonial.companyLogo}
														alt={testimonial.companyName}
														style={{
															height: `${logoSize || 60}px`,
															objectFit: "contain",
															width: "auto"
														}}
														loading="lazy"
														onError={(e) => {
															e.target.style.display = 'none';
															e.target.nextSibling.style.display = 'block';
														}}
													/>
														<div 
															className="ad-carousel-text-block__logo-placeholder"
															style={{ display: 'none' }}
														>
															{testimonial.companyName}
														</div>
													</>
												) : (
																<div className="ad-carousel-text-block__logo-placeholder">
														{testimonial.companyName}
													</div>
												)}
												</div>
												</QuickZone>
														<QuickZone
															id={`testimonial-text-${index}`}
															label="Quote & Author"
															activeZone={activeZone}
															setActiveZone={setActiveZone}
															content={
																<>
																	<TextControl
																		label="Quote"
																		value={testimonial.quote}
																		onChange={(value) => updateTestimonial(index, 'quote', value)}
																	/>
																	<TextControl
																		label="Author Name"
																		value={testimonial.authorName}
																		onChange={(value) => updateTestimonial(index, 'authorName', value)}
																	/>
																	<TextControl
																		label="Author Title"
																		value={testimonial.authorTitle}
																		onChange={(value) => updateTestimonial(index, 'authorTitle', value)}
																	/>
																</>
															}
														>
														<div className="ad-carousel-text-block__quote">"{testimonial.quote}"</div>
														<div className="ad-carousel-text-block__author">
															<div className="ad-carousel-text-block__name">{testimonial.authorName}</div>
															<div className="ad-carousel-text-block__title">{testimonial.authorTitle}</div>
												</div>
												</QuickZone>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}



