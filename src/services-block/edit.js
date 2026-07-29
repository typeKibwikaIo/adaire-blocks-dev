import { __ } from '@wordpress/i18n';
import { useBlockProps, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	RangeControl,
	ButtonGroup,
	SelectControl
} from '@wordpress/components';
import DeviceSwitcher, { THREE_TIERS, getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';
import InspectorTabs from '../components/InspectorTabs';
import { CONTENT_PRESETS } from './content-presets';

export default function Edit({ attributes, setAttributes }) {
	const [deviceType, setDeviceType] = useState('desktop');
	const { slides = [], storyDuration = 8000, previewText, linkText, blockId, containerHeight, titleFontSize, textFontSize, slideTitleFontSize, slideDescriptionFontSize, slideTagFontSize, layoutMode = 'legacy', agencyTitle, agencyDescription, ctaButtonText, contentPreset } = attributes;

	const applyContentPreset = (preset) => {
		setAttributes({
			contentPreset: preset.id,
			slides: preset.slides.map((s) => ({ ...s })),
			...(preset.defaultAttrs || {}),
		});
	};

	// Ensure slides are properly initialized
	useEffect(() => {
		if (!slides || slides.length === 0) {
			const defaultSlides = [
				{
					slideTitle: "Build",
					slideDescription: "We design and develop custom websites and applications that are tailored to your specific needs and goals.",
					slideImg: "",
					slideImgId: 0,
					slideUrl: "#"
				},
				{
					slideTitle: "Maintain",
					slideDescription: "We provide ongoing maintenance and support to ensure your digital assets are always up to date.",
					slideImg: "",
					slideImgId: 0,
					slideUrl: "#"
				},
				{
					slideTitle: "Support",
					slideDescription: "Our dedicated support team is always available to help you with any issues or questions you may have.",
					slideImg: "",
					slideImgId: 0,
					slideUrl: "#"
				},
				{
					slideTitle: "Host",
					slideDescription: "We offer reliable and secure hosting solutions to ensure your website is always online and performing optimally.",
					slideImg: "",
					slideImgId: 0,
					slideUrl: "#"
				}
			];
			setAttributes({ slides: defaultSlides });
		} else {
			// Force a save to ensure slides are persisted by making a small change
			// Add a timestamp to force a change and trigger save
			const slidesWithTimestamp = slides.map(slide => ({
				...slide,
				_lastModified: Date.now()
			}));
			setAttributes({ slides: slidesWithTimestamp });
		}
	}, []); // Empty dependency array - only run once on mount

	// Convert slides to services format for editing
	const services = slides ? slides.map(slide => {
		const service = {
			profileImg: slide.slideImg || "",
			profileName: slide.slideTitle !== undefined ? slide.slideTitle : "Build",
			title: slide.slideDescription !== undefined ? slide.slideDescription : "We design and develop custom websites and applications that are tailored to your specific needs and goals.",
			linkLabel: "Read More",
			linkSrc: slide.slideUrl !== undefined ? slide.slideUrl : "#",
			storyImg: slide.slideImg || "",
			storyImgId: slide.slideImgId || 0
		};
		return service;
	}) : [
		{
			profileImg: "",
			profileName: "Build",
			title: "We design and develop custom websites and applications that are tailored to your specific needs and goals.",
			linkLabel: "Read More",
			linkSrc: "#",
			storyImg: "",
			storyImgId: 0
		},
		{
			profileImg: "",
			profileName: "Maintain",
			title: "We provide ongoing maintenance and support to ensure your digital assets are always up to date.",
			linkLabel: "Discover",
			linkSrc: "#",
			storyImg: "",
			storyImgId: 0
		},
		{
			profileImg: "",
			profileName: "Support",
			title: "Our dedicated support team is always available to help you with any issues or questions you may have.",
			linkLabel: "Check It Out",
			linkSrc: "#",
			storyImg: "",
			storyImgId: 0
		},
		{
			profileImg: "",
			profileName: "Host",
			title: "We offer reliable and secure hosting solutions to ensure your website is always online and performing optimally.",
			linkLabel: "Learn More",
			linkSrc: "#",
			storyImg: "",
			storyImgId: 0
		}
	];

	// Function to split title into lines with max 4 words per line
	const splitTitleIntoLines = (title) => {
		const words = title.split(' ');
		const lines = [];
		let currentLine = [];

		words.forEach((word, index) => {
			currentLine.push(word);
			
			// Create a new line if we have 4 words or if this is the last word
			if (currentLine.length === 4 || index === words.length - 1) {
				lines.push(currentLine.join(' '));
				currentLine = [];
			}
		});

		return lines;
	};

	const updateService = (index, field, value) => {
		// Get current slides or use default
		const currentSlides = slides || [];
		const newSlides = [...currentSlides];
		
		// Ensure the slide exists
		if (!newSlides[index]) {
			newSlides[index] = {
				id: index + 1,
				slideTitle: "Build",
				slideDescription: "We design and develop custom websites and applications that are tailored to your specific needs and goals.",
				slideUrl: "#",
				slideTags: [],
				slideImg: "",
				slideImgId: 0
			};
		}
		
		// Update the specific field
		if (field === 'profileName') {
			newSlides[index].slideTitle = value;
		} else if (field === 'title') {
			newSlides[index].slideDescription = value;
		} else if (field === 'linkSrc') {
			newSlides[index].slideUrl = value;
		} else if (field === 'storyImg') {
			newSlides[index].slideImg = value;
		} else if (field === 'storyImgId') {
			newSlides[index].slideImgId = value;
		}
		setAttributes({ slides: newSlides });
	};

	const addService = () => {
		const newService = {
			profileImg: "",
			profileName: "New Service",
			title: "Add your service description here. This will be automatically split into lines with maximum 4 words per line to prevent overflow.",
			linkLabel: "Learn More",
			linkSrc: "#",
			storyImg: "",
			storyImgId: 0
		};
		
		const newSlides = [...slides, {
			id: slides.length + 1,
			slideTitle: newService.profileName,
			slideDescription: newService.title,
			slideUrl: newService.linkSrc,
			slideTags: [],
			slideImg: newService.storyImg,
			slideImgId: newService.storyImgId || 0
		}];
		
		setAttributes({ slides: newSlides });
	};

	const removeService = (index) => {
		if (services.length > 1) {
			const newSlides = slides.filter((_, i) => i !== index);
			setAttributes({ slides: newSlides });
		}
	};

	const moveServiceUp = (index) => {
		if (index > 0) {
			const newSlides = [...slides];
			const temp = newSlides[index];
			newSlides[index] = newSlides[index - 1];
			newSlides[index - 1] = temp;
			setAttributes({ slides: newSlides });
		}
	};

	const moveServiceDown = (index) => {
		if (index < slides.length - 1) {
			const newSlides = [...slides];
			const temp = newSlides[index];
			newSlides[index] = newSlides[index + 1];
			newSlides[index + 1] = temp;
			setAttributes({ slides: newSlides });
		}
	};

	const blockProps = useBlockProps({
		className: 'animation-component ad-services-block-body',
		style: {
			'--title-font-size': `${getDeviceValue(titleFontSize, 'desktop', 40)}px`,
			'--title-font-size-tablet': `${getDeviceValue(titleFontSize, 'tablet', 36)}px`,
			'--title-font-size-mobile': `${getDeviceValue(titleFontSize, 'mobile', 32)}px`,
			'--text-font-size': `${getDeviceValue(textFontSize, 'desktop', 18)}px`,
			'--text-font-size-tablet': `${getDeviceValue(textFontSize, 'tablet', 16)}px`,
			'--text-font-size-mobile': `${getDeviceValue(textFontSize, 'mobile', 14)}px`,
			'--slide-title-font-size': `${getDeviceValue(slideTitleFontSize, 'desktop', 112)}px`,
			'--slide-title-font-size-tablet': `${getDeviceValue(slideTitleFontSize, 'tablet', 96)}px`,
			'--slide-title-font-size-mobile': `${getDeviceValue(slideTitleFontSize, 'mobile', 80)}px`,
			'--slide-description-font-size': `${getDeviceValue(slideDescriptionFontSize, 'desktop', 20)}px`,
			'--slide-description-font-size-tablet': `${getDeviceValue(slideDescriptionFontSize, 'tablet', 18)}px`,
			'--slide-description-font-size-mobile': `${getDeviceValue(slideDescriptionFontSize, 'mobile', 16)}px`,
			'--slide-tag-font-size': `${getDeviceValue(slideTagFontSize, 'desktop', 20)}px`,
			'--slide-tag-font-size-tablet': `${getDeviceValue(slideTagFontSize, 'tablet', 18)}px`,
			'--slide-tag-font-size-mobile': `${getDeviceValue(slideTagFontSize, 'mobile', 16)}px`,
			'--container-height': `${getDeviceValue(containerHeight, 'desktop', 70)}vh`,
			'--container-height-tablet': `${getDeviceValue(containerHeight, 'tablet', 60)}vh`,
			'--container-height-mobile': `${getDeviceValue(containerHeight, 'mobile', 55)}vh`,
		}
	});

	return (
		<div {...blockProps} style={{height: "95vh"}}>
			<InspectorTabs attributes={attributes} setAttributes={setAttributes}>
				{/* ---------------- CONTENT ---------------- */}
				<PanelBody section="content" title={__('Content Preset', 'adaire-blocks')} initialOpen={true}>
					<p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.4 }}>
						{__('Pick a starting content set. This replaces the current slides — you can edit, add or remove them afterward.', 'adaire-blocks')}
					</p>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						{CONTENT_PRESETS.map((preset) => (
							<Button
								key={preset.id}
								isPrimary={contentPreset === preset.id}
								onClick={() => applyContentPreset(preset)}
								style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: 'auto', padding: '8px 10px', textAlign: 'left' }}
							>
								<span style={{ fontWeight: 600 }}>{preset.label}</span>
								<span style={{ fontSize: '11px', opacity: 0.75, fontWeight: 400 }}>{preset.bestFor}</span>
							</Button>
						))}
					</div>
				</PanelBody>

				<PanelBody section="content" title={__('Content', 'adaire-blocks')} initialOpen={true}>
					<TextControl
						label={__('Preview Text', 'adaire-blocks')}
						value={previewText}
						onChange={(value) => setAttributes({ previewText: value })}
						help={__('The text that appears before item names (e.g., "We:")', 'adaire-blocks')}
					/>
					<TextControl
						label={__('Link Text', 'adaire-blocks')}
						value={linkText}
						onChange={(value) => setAttributes({ linkText: value })}
						help={__('The text that appears in the link button', 'adaire-blocks')}
					/>
					{layoutMode !== 'legacy' && (
						<>
							<TextControl
								label={__('Heading', 'adaire-blocks')}
								value={agencyTitle}
								onChange={(value) => setAttributes({ agencyTitle: value })}
							/>
							<TextareaControl
								label={__('Intro Text', 'adaire-blocks')}
								value={agencyDescription}
								onChange={(value) => setAttributes({ agencyDescription: value })}
							/>
							<TextControl
								label={__('CTA Button Text', 'adaire-blocks')}
								value={ctaButtonText}
								onChange={(value) => setAttributes({ ctaButtonText: value })}
								help={__('Leave empty to hide the call-to-action button.', 'adaire-blocks')}
							/>
						</>
					)}
				</PanelBody>

				{services.map((service, index) => (
					<PanelBody
						section="content"
						key={index}
						title={__('Item', 'adaire-blocks') + ' ' + (index + 1)}
						initialOpen={index === 0}
					>
						<TextControl
							label={__('Name', 'adaire-blocks')}
							value={service.profileName}
							onChange={(value) => updateService(index, 'profileName', value)}
						/>

						<TextareaControl
							label={__('Title/Description', 'adaire-blocks')}
							value={service.title}
							onChange={(value) => updateService(index, 'title', value)}
							help={__('This will be automatically split into lines with max 4 words per line', 'adaire-blocks')}
						/>

						<TextControl
							label={__('Link Label', 'adaire-blocks')}
							value={service.linkLabel}
							onChange={(value) => updateService(index, 'linkLabel', value)}
						/>

						<TextControl
							label={__('Link URL', 'adaire-blocks')}
							value={service.linkSrc}
							onChange={(value) => updateService(index, 'linkSrc', value)}
						/>

						<div className="media-upload-section">
							<p>{__('Image', 'adaire-blocks')}</p>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => {
										if (media && media.id) {
											updateService(index, 'storyImgId', media.id);
											if (media.url) {
												updateService(index, 'storyImg', media.url);
											} else if (window.wp && window.wp.media) {
												const attachment = window.wp.media.attachment(media.id);
												attachment
													.fetch()
													.then(() => {
														const url = attachment.get('url');
														if (url) {
															updateService(index, 'storyImg', url);
														}
													})
													.catch((error) => {
														console.error('Error fetching image URL:', error);
													});
											}
										}
									}}
									onError={(error) => {
										console.error('Media upload error:', error);
									}}
									allowedTypes={['image']}
									value={service.storyImgId}
									render={({ open }) => (
										<div className="media-upload-controls">
											{service.storyImg ? (
												<div className="media-preview">
													<img src={service.storyImg} alt="" style={{ maxWidth: '100px', height: 'auto' }} />
													<Button isDestructive onClick={() => {
														updateService(index, 'storyImg', '');
														updateService(index, 'storyImgId', 0);
													}}>
														{__('Remove', 'adaire-blocks')}
													</Button>
												</div>
											) : (
												<Button isPrimary onClick={open}>
													{__('Select Image', 'adaire-blocks')}
												</Button>
											)}
										</div>
									)}
								/>
							</MediaUploadCheck>
						</div>

						<div className="service-controls">
							{services.length > 1 && (
								<>
									<div className="reorder-controls">
										<ButtonGroup>
											<Button
												onClick={() => moveServiceUp(index)}
												disabled={index === 0}
												label={__('Move Up', 'adaire-blocks')}
											>
												↑ {__('Up', 'adaire-blocks')}
											</Button>
											<Button
												onClick={() => moveServiceDown(index)}
												disabled={index === services.length - 1}
												label={__('Move Down', 'adaire-blocks')}
											>
												↓ {__('Down', 'adaire-blocks')}
											</Button>
										</ButtonGroup>
									</div>
									<Button isDestructive onClick={() => removeService(index)}>
										{__('Remove Item', 'adaire-blocks')}
									</Button>
								</>
							)}
						</div>
					</PanelBody>
				))}

				<PanelBody section="content" title={__('Add New Item', 'adaire-blocks')}>
					<Button isPrimary onClick={addService}>
						{__('Add Item', 'adaire-blocks')}
					</Button>
				</PanelBody>

				<PanelBody section="content" title={__('Block Settings', 'adaire-blocks')} initialOpen={false}>
					<TextControl
						label={__('Block ID', 'adaire-blocks')}
						value={blockId}
						onChange={(value) => setAttributes({ blockId: value })}
						help={__('Add a custom ID to this block for CSS targeting or anchor links.', 'adaire-blocks')}
					/>
				</PanelBody>

				{/* ---------------- LAYOUT ---------------- */}
				<PanelBody section="layout" title={__('Layout', 'adaire-blocks')} initialOpen={true}>
					<SelectControl
						label={__('Layout Mode', 'adaire-blocks')}
						value={layoutMode}
						onChange={(value) => setAttributes({ layoutMode: value })}
						options={[
							{ label: __('Legacy (scroll showcase)', 'adaire-blocks'), value: 'legacy' },
							{ label: __('Horizontal carousel', 'adaire-blocks'), value: 'horizontal' },
							{ label: __('Vertical carousel', 'adaire-blocks'), value: 'vertical' },
							{ label: __('Full-screen showcase', 'adaire-blocks'), value: 'fullscreen' },
							{ label: __('Split image / content', 'adaire-blocks'), value: 'split' }
						]}
						help={__('Legacy keeps the original animated scroll design. The others share the same slide content.', 'adaire-blocks')}
					/>
					<RangeControl
						label={__('Story Duration (ms)', 'adaire-blocks')}
						value={storyDuration}
						onChange={(value) => setAttributes({ storyDuration: value })}
						min={3000}
						max={15000}
						step={500}
						help={__('Auto-advance interval for the carousel layouts.', 'adaire-blocks')}
					/>
				</PanelBody>

				<PanelBody section="layout" title={__('Responsive Settings', 'adaire-blocks')} initialOpen={false}>
					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label={__('Device Preview', 'adaire-blocks')}
						tiers={THREE_TIERS}
					/>
					<RangeControl
						label={__('Container Height (vh)', 'adaire-blocks')}
						value={getDeviceValue(containerHeight, deviceType, deviceType === 'desktop' ? 70 : deviceType === 'tablet' ? 60 : 55)}
						onChange={(value) => setAttributes({ containerHeight: updateDeviceAttribute(containerHeight, deviceType, value) })}
						min={30}
						max={100}
						step={5}
					/>
				</PanelBody>
			</InspectorTabs>

			{layoutMode === 'legacy' && (
			<div className="ad-services-blocks-story-editor">
				<div className="story-container">
					<div className="cursor">
						<p>Next</p>
					</div>

					<div className="ad-services-block-story-img">
						<div className="img">
							{services[0]?.storyImg ? (
								<img src={services[0].storyImg} alt="" />
							) : (
								<div className="placeholder-img">Story Image</div>
							)}
						</div>
					</div>

					<div className="ad-services-block-services-overview">
						<h1>{previewText || "We:"} </h1>
						{services.map((service, index) => (
							<p key={index} className={`overview__item ${index === 0 ? "active" : ""}`}>
								{service.profileName}
							</p>
						))}
					</div>

					<div className="ad-services-block-story-content">
						<div className="ad-services-block-row">
							<div className="ad-services-block-indices">
								{services.map((_, index) => (
									<div key={index} className="index">
										<div className="index-highlight"></div>
									</div>
								))}
							</div>
						</div>

						<div className="ad-services-block-row">
							<div className="title">
								{splitTitleIntoLines(services[0]?.title || '').map((line, lineIndex) => (
									<div key={lineIndex} className="title-row">
										<h1>{line}</h1>
									</div>
								))}
							</div>

							<div className="link">
								<a href={services[0]?.linkSrc || '#'} target="_blank" rel="noopener noreferrer">
									{linkText || 'Read More'}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			)}

			{layoutMode !== 'legacy' && (
				<div className={`ad-acc ad-acc--static ad-acc--${layoutMode}`}>
					{(agencyTitle || agencyDescription) && (
						<div className="ad-acc__header">
							{agencyTitle && <h2 className="ad-acc__heading">{agencyTitle}</h2>}
							{agencyDescription && <p className="ad-acc__intro">{agencyDescription}</p>}
						</div>
					)}

					<div className="ad-acc__viewport">
						<div className="ad-acc__track">
							{(slides || []).map((slide, index) => (
								<article
									key={slide.id ?? index}
									className={`ad-acc__slide ${index === 0 ? 'is-active' : ''}`}
									data-index={index}
								>
									<div className="ad-acc__media">
										{slide.slideImg ? (
											<img src={slide.slideImg} alt={slide.slideTitle || ''} />
										) : (
											<div className="ad-acc__media-placeholder" aria-hidden="true"></div>
										)}
									</div>
									<div className="ad-acc__content">
										<span className="ad-acc__num">{String(index + 1).padStart(2, '0')}</span>
										<h3 className="ad-acc__title">{slide.slideTitle}</h3>
										<p className="ad-acc__desc">{slide.slideDescription}</p>
										{Array.isArray(slide.slideTags) && slide.slideTags.length > 0 && (
											<ul className="ad-acc__tags">
												{slide.slideTags.map((tag, t) => (
													<li key={t} className="ad-acc__tag">{tag}</li>
												))}
											</ul>
										)}
										<span className="ad-acc__link">{linkText || 'Read More'}</span>
									</div>
								</article>
							))}
						</div>
					</div>

					{(slides || []).length > 1 && (
						<div className="ad-acc__nav">
							<button type="button" className="ad-acc__arrow ad-acc__arrow--prev" aria-label="Previous">
								<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							<div className="ad-acc__dots">
								{(slides || []).map((slide, index) => (
									<button
										key={slide.id ?? index}
										type="button"
										className={`ad-acc__dot ${index === 0 ? 'is-active' : ''}`}
										aria-label={`Go to slide ${index + 1}`}
									>
										<span className="ad-acc__dot-fill"></span>
									</button>
								))}
							</div>
							<button type="button" className="ad-acc__arrow ad-acc__arrow--next" aria-label="Next">
								<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
						</div>
					)}

					{ctaButtonText && (
						<div className="ad-acc__cta">
							<span className="ad-acc__cta-link">{ctaButtonText}</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}



