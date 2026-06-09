import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { useEffect, useState } from '@wordpress/element';
import {
	PanelBody,
	TextControl,
	TextareaControl,
	Button,
	RangeControl,
	ButtonGroup
} from '@wordpress/components';
import DeviceSwitcher, { getDeviceValue, updateDeviceAttribute } from '../components/DeviceSwitcher';

export default function Edit({ attributes, setAttributes }) {
	const [deviceType, setDeviceType] = useState('desktop');
	const { slides = [], storyDuration = 8000, previewText, linkText, blockId, containerHeight, titleFontSize, textFontSize, slideTitleFontSize, slideDescriptionFontSize, slideTagFontSize } = attributes;

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
			'--title-font-size-watch': `${getDeviceValue(titleFontSize, 'smartwatch', 28)}px`,
			'--text-font-size': `${getDeviceValue(textFontSize, 'desktop', 18)}px`,
			'--text-font-size-tablet': `${getDeviceValue(textFontSize, 'tablet', 16)}px`,
			'--text-font-size-mobile': `${getDeviceValue(textFontSize, 'mobile', 14)}px`,
			'--text-font-size-watch': `${getDeviceValue(textFontSize, 'smartwatch', 12)}px`,
			'--slide-title-font-size': `${getDeviceValue(slideTitleFontSize, 'desktop', 112)}px`,
			'--slide-title-font-size-tablet': `${getDeviceValue(slideTitleFontSize, 'tablet', 96)}px`,
			'--slide-title-font-size-mobile': `${getDeviceValue(slideTitleFontSize, 'mobile', 80)}px`,
			'--slide-title-font-size-watch': `${getDeviceValue(slideTitleFontSize, 'smartwatch', 64)}px`,
			'--slide-description-font-size': `${getDeviceValue(slideDescriptionFontSize, 'desktop', 20)}px`,
			'--slide-description-font-size-tablet': `${getDeviceValue(slideDescriptionFontSize, 'tablet', 18)}px`,
			'--slide-description-font-size-mobile': `${getDeviceValue(slideDescriptionFontSize, 'mobile', 16)}px`,
			'--slide-description-font-size-watch': `${getDeviceValue(slideDescriptionFontSize, 'smartwatch', 14)}px`,
			'--slide-tag-font-size': `${getDeviceValue(slideTagFontSize, 'desktop', 20)}px`,
			'--slide-tag-font-size-tablet': `${getDeviceValue(slideTagFontSize, 'tablet', 18)}px`,
			'--slide-tag-font-size-mobile': `${getDeviceValue(slideTagFontSize, 'mobile', 16)}px`,
			'--slide-tag-font-size-watch': `${getDeviceValue(slideTagFontSize, 'smartwatch', 14)}px`,
			'--container-height': `${getDeviceValue(containerHeight, 'desktop', 70)}vh`,
			'--container-height-tablet': `${getDeviceValue(containerHeight, 'tablet', 60)}vh`,
			'--container-height-mobile': `${getDeviceValue(containerHeight, 'mobile', 55)}vh`,
			'--container-height-watch': `${getDeviceValue(containerHeight, 'smartwatch', 50)}vh`,
		}
	});

	return (
		<div {...blockProps} style={{height: "95vh"}}>
			<InspectorControls>
				<PanelBody title={__('General Settings', 'gsap-hero-block')}>
					<TextControl
						label={__('Preview Text', 'gsap-hero-block')}
						value={previewText}
						onChange={(value) => setAttributes({ previewText: value })}
						help={__('The text that appears before service names (e.g., "We:")', 'gsap-hero-block')}
					/>
					<TextControl
						label={__('Link Text', 'gsap-hero-block')}
						value={linkText}
						onChange={(value) => setAttributes({ linkText: value })}
						help={__('The text that appears in the link button', 'gsap-hero-block')}
					/>
					<RangeControl
						label={__('Story Duration (ms)', 'gsap-hero-block')}
						value={storyDuration}
						onChange={(value) => setAttributes({ storyDuration: value })}
						min={3000}
						max={15000}
						step={500}
					/>
				</PanelBody>

				<PanelBody title={__('Responsive Settings', 'gsap-hero-block')} initialOpen={false}>
					<DeviceSwitcher
						deviceType={deviceType}
						setDeviceType={setDeviceType}
						label="Device Preview"
					/>
					<RangeControl
						label={__('Container Height (vh)', 'gsap-hero-block')}
						value={getDeviceValue(containerHeight, deviceType, deviceType === 'desktop' ? 70 : deviceType === 'tablet' ? 60 : deviceType === 'mobile' ? 55 : 50)}
						onChange={(value) => setAttributes({ containerHeight: updateDeviceAttribute(containerHeight, deviceType, value) })}
						min={30}
						max={100}
						step={5}
					/>
				</PanelBody>

				<PanelBody title="Block Settings" initialOpen={false}>
					<TextControl
						label={__('Block ID', 'gsap-hero-block')}
						value={blockId}
						onChange={(value) => setAttributes({ blockId: value })}
						help={__('Add a custom ID to this block for CSS targeting or anchor links.', 'gsap-hero-block')}
					/>
				</PanelBody>

				{services.map((service, index) => (
					<PanelBody 
						key={index}
						title={__('Service', 'gsap-hero-block') + ' ' + (index + 1)}
						initialOpen={index === 0}
					>
						<TextControl
							label={__('Service Name', 'gsap-hero-block')}
							value={service.profileName}
							onChange={(value) => updateService(index, 'profileName', value)}
						/>

						<TextareaControl
							label={__('Title/Description', 'gsap-hero-block')}
							value={service.title}
							onChange={(value) => updateService(index, 'title', value)}
							help={__('This will be automatically split into lines with max 4 words per line', 'gsap-hero-block')}
						/>

						<TextControl
							label={__('Link Label', 'gsap-hero-block')}
							value={service.linkLabel}
							onChange={(value) => updateService(index, 'linkLabel', value)}
						/>

						<TextControl
							label={__('Link URL', 'gsap-hero-block')}
							value={service.linkSrc}
							onChange={(value) => updateService(index, 'linkSrc', value)}
						/>

						<div className="media-upload-section">
							<p>{__('Story Image', 'gsap-hero-block')}</p>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) => {
										// Store both ID and URL for reliability
										if (media && media.id) {
											updateService(index, 'storyImgId', media.id);
											
											// If we have a URL, use it immediately
											if (media.url) {
												updateService(index, 'storyImg', media.url);
											} else {
												// Try to fetch the URL if not provided
												if (window.wp && window.wp.media) {
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
														{__('Remove', 'gsap-hero-block')}
													</Button>
												</div>
											) : (
												<Button isPrimary onClick={open}>
													{__('Select Image', 'gsap-hero-block')}
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
												label={__('Move Up', 'gsap-hero-block')}
											>
												â†‘ {__('Up', 'gsap-hero-block')}
											</Button>
											<Button
												onClick={() => moveServiceDown(index)}
												disabled={index === services.length - 1}
												label={__('Move Down', 'gsap-hero-block')}
											>
												â†“ {__('Down', 'gsap-hero-block')}
											</Button>
										</ButtonGroup>
									</div>
									<Button isDestructive onClick={() => removeService(index)}>
										{__('Remove Service', 'gsap-hero-block')}
									</Button>
								</>
							)}
						</div>
					</PanelBody>
				))}

				<PanelBody title={__('Add New Service', 'gsap-hero-block')}>
					<Button isPrimary onClick={addService}>
						{__('Add Service', 'gsap-hero-block')}
					</Button>
				</PanelBody>
			</InspectorControls>

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
		</div>
	);
}



