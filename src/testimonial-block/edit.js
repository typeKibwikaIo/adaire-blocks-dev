import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	PanelBody,
	ColorPicker,
	TextControl,
	ToggleControl,
	Button,
	BaseControl,
	ButtonGroup,
	SelectControl,
	RangeControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useCallback, useState } from "@wordpress/element";
import { desktop, tablet, mobile } from '@wordpress/icons';
import { Splide } from '@splidejs/splide';
import UpgradeNotice from '../components/UpgradeNotice';
import { useBlockLimits } from '../components/useBlockLimits';
import QuickZone from '../components/QuickZone';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
import InspectorTabs from '../components/InspectorTabs';

const FREE_TIER_ITEM_LIMIT = 3;

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
	} = attributes;

	const splideRef = useRef(null);
	const splideInstanceRef = useRef(null);
	const updateTimeoutRef = useRef(null);

	const blockProps = useBlockProps({
		className: "ad-carousel-text-block",
		style: {
			color: textColor || "#000000",
			fontSize: `${fontSize || 16}px`,
			"--text-color": textColor || "#000000",
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
			"--carousel-padding-top-watch": `${responsivePaddingTop?.smartwatch ?? 24}px`,
			"--carousel-padding-bottom": `${responsivePaddingBottom?.desktop ?? 60}px`,
			"--carousel-padding-bottom-tablet": `${responsivePaddingBottom?.tablet ?? 48}px`,
			"--carousel-padding-bottom-mobile": `${responsivePaddingBottom?.mobile ?? 36}px`,
			"--carousel-padding-bottom-watch": `${responsivePaddingBottom?.smartwatch ?? 24}px`,
			...(blockBackgroundColor && { background: blockBackgroundColor })
		},
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
				const loopValue = loop;
				const navigationValue = navigation;
				const paginationValue = pagination;
				const scrollbarValue = scrollbar;
				
				// Count actual slides
				const totalSlides = testimonials.length;
				
				// Splide loop works better with fewer restrictions
				const shouldLoop = loopValue && totalSlides > 1;

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
							// Determine current screen size and appropriate slides per view for editor
							const getCurrentSlidesPerView = () => {
								if (window.innerWidth >= 1024) {
									return slidesPerViewDesktop || 3;
								} else if (window.innerWidth >= 768) {
									return slidesPerViewTablet || 2;
								} else {
									return slidesPerViewMobile || 1;
								}
							};

							// Determine current gap based on screen size
							const getCurrentGap = () => {
								if (window.innerWidth >= 1024) {
									return cardGap?.desktop?.value ?? 30;
								} else if (window.innerWidth >= 768) {
									return cardGap?.tablet?.value ?? 20;
								} else {
									return cardGap?.mobile?.value ?? 15;
								}
							};

							const splideInstance = new Splide(splideRef.current, {
								type: shouldLoop ? 'loop' : 'slide',
								perPage: getCurrentSlidesPerView(),
								perMove: 1,
								gap: getCurrentGap(),
								padding: '0',
								arrows: false, // Disable arrows in editor
								pagination: false, // Disable pagination in editor
								drag: false, // Disable drag in editor
								focus: 'center',
								trimSpace: false,
								updateOnMove: true,
								resetProgress: false,
								speed: 600,
								easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
								breakpoints: {
									1023: {
										perPage: slidesPerViewTablet || 2,
										gap: cardGap?.tablet?.value ?? 20,
									},
									767: {
										perPage: slidesPerViewMobile || 1,
										gap: cardGap?.mobile?.value ?? 15,
									}
								}
							});
							
							// Mount the Splide instance
							splideInstance.mount();
							splideInstanceRef.current = splideInstance;
							
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
			if (splideInstanceRef.current) {
				splideInstanceRef.current.destroy();
				splideInstanceRef.current = null;
			}
		};
	}, [testimonials, slidesPerView, spaceBetween, loop, navigation, pagination, scrollbar, arrowColor, dotColor, slidesPerViewMobile, slidesPerViewTablet, slidesPerViewDesktop]);

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
				<PanelBody title="Container Settings" initialOpen={true}>
					<ButtonGroup>
						{[
							{ label: __('Full width', 'testimonial-block'), value: 'full' },
							{ label: __('Constrained', 'testimonial-block'), value: 'constrained' },
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
								{__('Max Width', 'testimonial-block')}
							</p>
							<ButtonGroup style={{ marginBottom: '12px' }}>
								<Button
									icon={desktop}
									isPrimary={deviceType === 'desktop'}
									onClick={() => setDeviceType('desktop')}
									label={__('Desktop', 'testimonial-block')}
								/>
								<Button
									icon={tablet}
									isPrimary={deviceType === 'tablet'}
									onClick={() => setDeviceType('tablet')}
									label={__('Tablet', 'testimonial-block')}
								/>
								<Button
									icon={mobile}
									isPrimary={deviceType === 'mobile'}
									onClick={() => setDeviceType('mobile')}
									label={__('Mobile', 'testimonial-block')}
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

				<PanelBody title="Carousel Settings" initialOpen={true}>
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
						{__('Responsive Slides Per View', 'testimonial-block')}
					</p>

					<TextControl
						label={__('Mobile (< 768px)', 'testimonial-block')}
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
						help={__('Number of slides visible on mobile devices', 'testimonial-block')}
					/>

					<TextControl
						label={__('Tablet (768px - 1024px)', 'testimonial-block')}
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
						help={__('Number of slides visible on tablet devices', 'testimonial-block')}
					/>

					<TextControl
						label={__('Desktop (> 1024px)', 'testimonial-block')}
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
						help={__('Number of slides visible on desktop devices', 'testimonial-block')}
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
					{/* <ColorPicker
						color={textColor}
						onChangeComplete={(color) =>
							setAttributes({ textColor: color.hex })
						}
						disableAlpha
					/> */}

					<BaseControl label="Arrow Color">
						<ColorPicker
							color={arrowColor}
							label="Arrow Color"
							onChangeComplete={(color) => {
								setAttributes({ arrowColor: color.hex });
							}}
						/>
					</BaseControl>
					<BaseControl label="Dot Color">
						<ColorPicker
							color={dotColor}
							label="Dot Color"
							onChangeComplete={(color) => {
								setAttributes({ dotColor: color.hex });
							}}
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

				<PanelBody title="Card Width Settings" initialOpen={false}>
					<p style={{ marginBottom: '16px', color: '#666' }}>
						{__('Control the width of individual testimonial cards at different screen sizes', 'testimonial-block')}
					</p>
					
					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Desktop Card Width', 'testimonial-block')}
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
						{__('Tablet Card Width', 'testimonial-block')}
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
						{__('Mobile Card Width', 'testimonial-block')}
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
						{__('ðŸ’¡ Tip: Use 100% for full-width cards on mobile, or adjust to create partial views', 'testimonial-block')}
					</p>
				</PanelBody>

				<PanelBody title="Card Gap Settings" initialOpen={false}>
					<p style={{ marginBottom: '16px', color: '#666' }}>
						{__('Control the spacing between testimonial cards at different screen sizes', 'testimonial-block')}
					</p>
					
					<p style={{ fontWeight: 600, marginBottom: '8px' }}>
						{__('Desktop Card Gap', 'testimonial-block')}
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
						{__('Tablet Card Gap', 'testimonial-block')}
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
						{__('Mobile Card Gap', 'testimonial-block')}
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
						{__('ðŸ’¡ Tip: Smaller gaps on mobile create a more compact layout', 'testimonial-block')}
					</p>
				</PanelBody>

				<PanelBody title="Testimonials" initialOpen={true}>
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
				</PanelBody>

				<PanelBody title="Logo Settings" initialOpen={false}>
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

				<PanelBody title="Color Settings" initialOpen={false}>
					<BaseControl label="Text Color" help="Color for quote text, author name, and title">
						<ColorPicker
							color={textColor}
							onChangeComplete={(color) =>
								setAttributes({ textColor: color.hex })
							}
							disableAlpha
						/>
					</BaseControl>

					<BaseControl label="Card Background Color" help="Background color for testimonial cards">
						<ColorPicker
							color={cardBackgroundColor}
							onChangeComplete={(color) =>
								setAttributes({ cardBackgroundColor: color.hex })
							}
							disableAlpha
						/>
					</BaseControl>

					<BaseControl label="Block Background Color" help="Background color for the entire testimonial block section">
						<ColorPicker
							color={blockBackgroundColor || "#ffffff"}
							onChangeComplete={(color) =>
								setAttributes({ blockBackgroundColor: color.hex })
							}
							enableAlpha
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title="Text Settings" initialOpen={false}>
					<TextControl
						label="Font Size (px)"
						value={fontSize}
						type="number"
						onChange={(value) => {
							const num = Number(value);
							if (!isNaN(num) && value !== "") {
								setAttributes({ fontSize: num });
							}
						}}
						min={1}
					/>
				</PanelBody>

				<PanelBody title="Block Settings" initialOpen={false}>
					<TextControl
						label="Block ID"
						value={blockId}
						onChange={(value) => setAttributes({ blockId: value })}
						help="Add a custom ID to this block for CSS targeting or anchor links."
					/>
				</PanelBody>

				<PanelBody title={__('Spacing', 'testimonial-block')} initialOpen={false}>
					<DeviceSwitcher deviceType={deviceType} setDeviceType={setDeviceType} label={__('Device')} />
					<RangeControl
						label={__('Padding top (px)', 'testimonial-block')}
						value={getDeviceValue(responsivePaddingTop, deviceType, deviceType === 'desktop' ? 60 : deviceType === 'tablet' ? 48 : deviceType === 'mobile' ? 36 : 24)}
						onChange={(v) => setAttributes({ responsivePaddingTop: updateDeviceAttribute(responsivePaddingTop, deviceType, v) })}
						min={0}
						max={200}
					/>
					<RangeControl
						label={__('Padding bottom (px)', 'testimonial-block')}
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



